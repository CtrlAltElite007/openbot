#!/usr/bin/env bash
# Builds custom/main of github.com/CtrlAltElite007/openbot and installs it as /Applications/OpenBot.app.
# Run in your Mac's Terminal:  bash ~/openbot-team/tools/build-openbot-custom.sh
#
# Order, and what happens on a failure:
#   1. Check the source checkout (right repository, no local changes)  -> stop, nothing changed
#   2. Build and find the app                                          -> stop, nothing changed
#   3. Stage a signed copy next to the installed app and verify it      -> stop, nothing changed
#   4. Quit OpenBot and wait until it has stopped                       -> stop, nothing changed
#   5. Back up your data and the current app, and verify the backups    -> stop, nothing changed
#   6. Swap the staged app in; if that fails, put the old app back
#
# Test overrides (used by tools/test-build-openbot-custom.sh): APP_DIR, DATA_DIR, BACKUP_ROOT, SRC,
# PREBUILT_APP (skips the toolchain and build), QUIT_TIMEOUT, REPO_URL, BUILD_CMD, SKIP_TOOLCHAIN.
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/CtrlAltElite007/openbot}"
BRANCH="custom/main"
APP_DIR="${APP_DIR:-/Applications/OpenBot.app}"
DATA_DIR="${DATA_DIR:-$HOME/Library/Application Support/OpenBot}"
BACKUP_ROOT="${BACKUP_ROOT:-$HOME/OpenBot/Downloads/openbot-backups}"
SRC="${SRC:-$HOME/openbot-custom}"
QUIT_TIMEOUT="${QUIT_TIMEOUT:-60}"
STAMP="$(date +%Y%m%d-%H%M%S)"
STAGE="$(dirname "$APP_DIR")/.OpenBot-staging-$STAMP.app"
PREVIOUS="$(dirname "$APP_DIR")/.OpenBot-previous-$STAMP.app"

fail() { echo "STOPPED: $*" >&2; exit 1; }
cleanup() { [ -e "$STAGE" ] && rm -rf "$STAGE"; return 0; }
trap cleanup EXIT

openbot_running() {
  # True while a process runs from the installed bundle. Only reads the process list; never kills.
  pgrep -f "$APP_DIR/Contents/MacOS/" >/dev/null 2>&1
}

# 1 + 2. Source and build
if [ -n "${PREBUILT_APP:-}" ]; then
  BUILT="$PREBUILT_APP"
else
  if [ -z "${SKIP_TOOLCHAIN:-}" ]; then
  if ! command -v bun >/dev/null || [[ "$(bun --version)" != 1.4.* ]]; then
    curl -fsSL https://bun.com/install | bash -s "bun-v1.4.2"
    export PATH="$HOME/.bun/bin:$PATH"
  fi
  export NVM_DIR="$HOME/.nvm"
  # shellcheck disable=SC1091
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  nvm install 24 >/dev/null && nvm use 24 >/dev/null
  fi

  if [ ! -d "$SRC/.git" ]; then
    git clone "$REPO_URL" "$SRC" || fail "clone failed"
  fi
  origin="$(git -C "$SRC" remote get-url origin)"
  case "$origin" in
    "$REPO_URL" | "$REPO_URL.git" | "git@github.com:CtrlAltElite007/openbot.git") ;;
    *) fail "$SRC points at $origin, not $REPO_URL. Move it away or set SRC to another folder." ;;
  esac
  if [ -n "$(git -C "$SRC" status --porcelain)" ]; then
    fail "$SRC has local changes. Commit, stash or remove them first; this script never discards them."
  fi
  git -C "$SRC" fetch origin "$BRANCH" || fail "fetch failed"
  # A detached checkout of the fetched branch: no local branch is moved or reset.
  git -C "$SRC" checkout --detach "origin/$BRANCH" || fail "checkout failed"
  echo "Building $(git -C "$SRC" log -1 --format='%h %s')"
  (cd "$SRC" && eval "${BUILD_CMD:-bun install --frozen-lockfile && bun run package}") || fail "build failed"
  BUILT=""
  for candidate in "$SRC/dist/mac-arm64/OpenBot.app" "$SRC/dist/mac/OpenBot.app"; do
    if [ -d "$candidate" ]; then BUILT="$candidate"; break; fi
  done
fi
[ -n "$BUILT" ] && [ -f "$BUILT/Contents/Info.plist" ] || fail "no built OpenBot.app found"

# 3. Stage and verify the replacement before touching the installed app
ditto "$BUILT" "$STAGE" || fail "could not stage the new app"
codesign --force --deep --sign - "$STAGE" || fail "could not sign the staged app"
codesign --verify --deep "$STAGE" || fail "the staged app did not verify"
xattr -dr com.apple.quarantine "$STAGE" 2>/dev/null || true

# 4. Quit OpenBot and confirm that it stopped
if openbot_running; then
  osascript -e 'quit app id "app.openbot.desktop"' >/dev/null 2>&1 || true
  waited=0
  while openbot_running; do
    [ "$waited" -ge "$QUIT_TIMEOUT" ] && fail "OpenBot is still running after ${QUIT_TIMEOUT}s. Quit it (finish or stop agent work), then run this again."
    sleep 1
    waited=$((waited + 1))
  done
fi

# 5. Back up data and the current app; every step must succeed
BACKUP="$BACKUP_ROOT/$STAMP"
mkdir -p "$BACKUP" || fail "could not create $BACKUP"
if [ -d "$DATA_DIR" ]; then
  ditto "$DATA_DIR" "$BACKUP/data" || fail "data backup failed; nothing was replaced"
  [ -d "$BACKUP/data" ] || fail "data backup is missing; nothing was replaced"
  echo "Data backed up to $BACKUP/data"
fi
if [ -d "$APP_DIR" ]; then
  ditto "$APP_DIR" "$BACKUP/OpenBot.app" || fail "app backup failed; nothing was replaced"
  echo "Current app backed up to $BACKUP/OpenBot.app"
fi

# 6. Swap, with rollback
if [ -d "$APP_DIR" ]; then
  mv "$APP_DIR" "$PREVIOUS" || fail "could not move the current app aside; nothing was replaced"
fi
if ! mv "$STAGE" "$APP_DIR"; then
  [ -d "$PREVIOUS" ] && mv "$PREVIOUS" "$APP_DIR"
  fail "could not install the new app; the previous app was put back"
fi
if [ -d "$PREVIOUS" ]; then rm -rf "$PREVIOUS"; fi
echo "Installed the custom OpenBot at $APP_DIR. Backups: $BACKUP"
