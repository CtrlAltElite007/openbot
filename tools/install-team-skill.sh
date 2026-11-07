#!/usr/bin/env bash
# Installs the openbot-team skill for Claude Code and Codex on this Mac.
#   bash ~/openbot-team/tools/install-team-skill.sh            # install; keep files that differ
#   bash ~/openbot-team/tools/install-team-skill.sh --replace  # also replace files that differ
#
# It checks both destinations before it writes anything:
# - a symlink anywhere on the destination path is refused (nothing is written);
# - an identical file is left as it is;
# - a different file is kept, unless you pass --replace (the old file is then saved as SKILL.md.bak).
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
SOURCE="$HERE/openbot-team/SKILL.md"
REPLACE=false
for argument in "$@"; do
  case "$argument" in
    --replace) REPLACE=true ;;
    *) echo "Unknown option: $argument" >&2; exit 2 ;;
  esac
done
[ -f "$SOURCE" ] && [ ! -L "$SOURCE" ] || { echo "Missing source: $SOURCE" >&2; exit 2; }

TARGETS=("$HOME/.claude/skills/openbot-team" "$HOME/.codex/skills/openbot-team")

# 1. Preflight: decide an action for each destination, write nothing yet.
actions=()
blocked=false
for dir in "${TARGETS[@]}"; do
  file="$dir/SKILL.md"
  for path in "$(dirname "$(dirname "$dir")")" "$(dirname "$dir")" "$dir" "$file" "$file.bak" "$file.tmp.$$"; do
    if [ -L "$path" ]; then
      echo "Refused: $path is a symlink." >&2
      blocked=true
    fi
  done
  # The nearest folder that exists must be a writable folder, or the install of this tool would fail
  # after the other tool was already written.
  probe="$dir"
  while [ ! -e "$probe" ]; do probe="$(dirname "$probe")"; done
  if [ ! -d "$probe" ] || [ ! -w "$probe" ]; then
    echo "Refused: cannot write under $probe." >&2
    blocked=true
  fi
  if [ -e "$file" ] && [ ! -f "$file" ]; then
    echo "Refused: $file exists and is not a regular file." >&2
    blocked=true
  elif [ ! -e "$file" ]; then
    actions+=("install")
  elif cmp -s "$SOURCE" "$file"; then
    actions+=("same")
  elif $REPLACE; then
    actions+=("replace")
  else
    actions+=("keep")
  fi
done
if $blocked; then
  echo "Nothing was written." >&2
  exit 1
fi

# 2. Write, only after every destination passed.
for i in "${!TARGETS[@]}"; do
  dir="${TARGETS[$i]}"
  file="$dir/SKILL.md"
  case "${actions[$i]}" in
    install)
      if ! { mkdir -p "$dir" && cp "$SOURCE" "$file.tmp.$$" && mv "$file.tmp.$$" "$file"; }; then
        rm -f "$file.tmp.$$"
        echo "FAILED to install $file. Earlier lines show what was already written." >&2
        exit 1
      fi
      echo "Installed: $file" ;;
    replace)
      if ! { cp -p "$file" "$file.bak" && cp "$SOURCE" "$file.tmp.$$" && mv "$file.tmp.$$" "$file"; }; then
        rm -f "$file.tmp.$$"
        echo "FAILED to replace $file; it was not changed. Earlier lines show what was already written." >&2
        exit 1
      fi
      echo "Replaced:  $file (old copy: $file.bak)" ;;
    same)
      echo "Up to date: $file" ;;
    keep)
      echo "Kept:      $file differs from the team copy. Run with --replace to replace it." ;;
  esac
done

echo "Start a new session, then:"
echo "  Claude Code:  /openbot-team   (or say \"check the team board\")"
echo "  Codex:        \$openbot-team   (or say \"check the team board\")"
