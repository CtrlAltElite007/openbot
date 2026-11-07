#!/usr/bin/env bash
# Failure-path tests for build-openbot-custom.sh. Uses only throwaway folders under a temp dir and
# fake ditto/codesign/osascript/pgrep/xattr commands. Never touches /Applications or real data.
# Run: bash ~/openbot-team/tools/test-build-openbot-custom.sh
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$HERE/build-openbot-custom.sh"
pass=0; failed=0

setup() {
  T="$(mktemp -d)"
  mkdir -p "$T/bin" "$T/Applications/OpenBot.app/Contents" "$T/data" "$T/new/OpenBot.app/Contents" "$T/backups"
  echo old > "$T/Applications/OpenBot.app/Contents/Info.plist"
  echo new > "$T/new/OpenBot.app/Contents/Info.plist"
  echo db > "$T/data/openbot.db"
  # Fakes. FAIL_DITTO_MATCH makes ditto fail when its source path contains the text.
  cat > "$T/bin/ditto" <<'S'
#!/usr/bin/env bash
if [ -n "${FAIL_DITTO_MATCH:-}" ] && [[ "$1" == *"$FAIL_DITTO_MATCH"* ]]; then exit 1; fi
mkdir -p "$(dirname "$2")" && cp -R "$1" "$2"
S
  cat > "$T/bin/codesign" <<'S'
#!/usr/bin/env bash
[ -n "${FAIL_CODESIGN:-}" ] && exit 1; exit 0
S
  cat > "$T/bin/osascript" <<'S'
#!/usr/bin/env bash
[ -z "${IGNORE_QUIT:-}" ] && rm -f "$RUNNING_FLAG"; exit 0
S
  cat > "$T/bin/pgrep" <<'S'
#!/usr/bin/env bash
[ -e "$RUNNING_FLAG" ]
S
  printf '#!/usr/bin/env bash\nexit 0\n' > "$T/bin/xattr"
  chmod +x "$T/bin/"*
  export RUNNING_FLAG="$T/running"
}

run() {
  PATH="$T/bin:$PATH" APP_DIR="$T/Applications/OpenBot.app" DATA_DIR="$T/data" BACKUP_ROOT="$T/backups" \
    PREBUILT_APP="$T/new/OpenBot.app" QUIT_TIMEOUT=2 bash "$SCRIPT" >"$T/out" 2>&1
}

installed() { cat "$T/Applications/OpenBot.app/Contents/Info.plist" 2>/dev/null || echo missing; }
check() { # name, condition
  if eval "$2"; then pass=$((pass + 1)); echo "ok   $1"; else failed=$((failed + 1)); echo "FAIL $1"; sed 's/^/     /' "$T/out"; fi
}

setup; run; code=$?
check "success installs the new app" '[ $code -eq 0 ] && [ "$(installed)" = new ] && [ -f $T/backups/*/data/openbot.db ] && [ -f $T/backups/*/OpenBot.app/Contents/Info.plist ] && ! ls -d $T/Applications/.OpenBot-* >/dev/null 2>&1'

setup; FAIL_DITTO_MATCH="$T/data" run; code=$?
check "#14 data backup failure keeps the old app" '[ $code -ne 0 ] && [ "$(installed)" = old ] && grep -q "data backup failed" $T/out'

setup; FAIL_DITTO_MATCH="$T/Applications/OpenBot.app" run; code=$?
check "#14 app backup failure keeps the old app" '[ $code -ne 0 ] && [ "$(installed)" = old ]'

setup; touch "$RUNNING_FLAG"; IGNORE_QUIT=1 run; code=$?
check "#15 app that does not quit: nothing is backed up or replaced" '[ $code -ne 0 ] && [ "$(installed)" = old ] && [ -z "$(ls -A $T/backups)" ] && grep -q "still running" $T/out'

setup; touch "$RUNNING_FLAG"; run; code=$?
check "#15 app that quits: install continues" '[ $code -eq 0 ] && [ "$(installed)" = new ]'

setup; FAIL_CODESIGN=1 run; code=$?
check "#16 signing failure keeps the old app and removes staging" '[ $code -ne 0 ] && [ "$(installed)" = old ] && ! ls -d $T/Applications/.OpenBot-* >/dev/null 2>&1'

setup; FAIL_DITTO_MATCH="$T/new" run; code=$?
check "#16 staging failure keeps the old app" '[ $code -ne 0 ] && [ "$(installed)" = old ]'

setup; rm -rf "$T/Applications/OpenBot.app"; run; code=$?
check "first install with no current app" '[ $code -eq 0 ] && [ "$(installed)" = new ]'

# Source checks (#17) and artifact detection (#18), with a local repository as the origin.
source_setup() {
  setup
  git init -q --bare "$T/origin.git"
  git clone -q "$T/origin.git" "$T/seed" 2>/dev/null
  (cd "$T/seed" && exec >/dev/null 2>&1 && git checkout -q -b custom/main && echo v1 > f && git add f && git -c user.email=t@t -c user.name=t commit -qm v1 && git push -q origin custom/main)
  git clone -q "$T/origin.git" "$T/src" 2>/dev/null; git -C "$T/src" fetch -q origin 2>/dev/null
}
run_source() {
  PATH="$T/bin:$PATH" APP_DIR="$T/Applications/OpenBot.app" DATA_DIR="$T/data" BACKUP_ROOT="$T/backups" \
    SRC="$T/src" REPO_URL="$T/origin.git" SKIP_TOOLCHAIN=1 QUIT_TIMEOUT=2 \
    BUILD_CMD="mkdir -p dist/mac-arm64/OpenBot.app/Contents && echo built > dist/mac-arm64/OpenBot.app/Contents/Info.plist" \
    bash "$SCRIPT" >"$T/out" 2>&1
}

source_setup; run_source; code=$?
check "#18 a single dist/mac-arm64 artifact installs" '[ $code -eq 0 ] && [ "$(installed)" = built ]'

source_setup; git -C "$T/src" remote set-url origin https://example.invalid/other.git; run_source; code=$?
check "#17 another origin is refused" '[ $code -ne 0 ] && [ "$(installed)" = old ] && grep -q "points at" $T/out'

source_setup; echo local-edit >> "$T/src/f"; run_source; code=$?
check "#17 local changes are refused and kept" '[ $code -ne 0 ] && [ "$(installed)" = old ] && grep -q local-edit $T/src/f'

source_setup; (cd "$T/src" && git checkout -q -b custom/main origin/custom/main && echo mine > g && git add g && git -c user.email=t@t -c user.name=t commit -qm mine); run_source; code=$?
check "#17 a local commit is not reset" '[ $code -eq 0 ] && git -C $T/src log custom/main --format=%s | grep -q mine'

echo "$pass passed, $failed failed"
[ "$failed" -eq 0 ]
