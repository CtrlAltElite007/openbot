#!/usr/bin/env bash
# Builds custom/main from github.com/CtrlAltElite007/openbot and replaces /Applications/OpenBot.app.
# Run in your Mac's Terminal:  bash ~/openbot-team/tools/build-openbot-custom.sh
set -euo pipefail

SRC="$HOME/openbot-custom"
BACKUP="$HOME/OpenBot/Downloads/OpenBot-official-backup.app"

# 1. Toolchain: Bun 1.4.2 and Node 24 (what OpenBot pins)
if ! command -v bun >/dev/null || [[ "$(bun --version)" != 1.4.* ]]; then
  curl -fsSL https://bun.com/install | bash -s "bun-v1.4.2"
  export PATH="$HOME/.bun/bin:$PATH"
fi
export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install 24 >/dev/null && nvm use 24 >/dev/null

# 2. Source: your fork, branch custom/main (only reviewed, merged work)
if [ ! -d "$SRC/.git" ]; then
  git clone -b custom/main https://github.com/CtrlAltElite007/openbot "$SRC"
fi
cd "$SRC"
git fetch origin custom/main
git checkout -B custom/main origin/custom/main
git log -1 --oneline

# 3. Build an unsigned macOS app bundle
bun install --frozen-lockfile
bun run package
APP=$(ls -d dist/mac-arm64/OpenBot.app dist/mac/OpenBot.app 2>/dev/null | head -1)
[ -n "$APP" ] || { echo "Build finished but OpenBot.app was not found under dist/"; exit 1; }

# 4. Replace the installed app (keeps your data in ~/Library/Application Support/OpenBot)
osascript -e 'quit app "OpenBot"' || true
sleep 3
if [ -d /Applications/OpenBot.app ] && [ ! -d "$BACKUP" ]; then
  ditto /Applications/OpenBot.app "$BACKUP"
  echo "Official app backed up to $BACKUP"
fi
DATA="$HOME/Library/Application Support/OpenBot"
DATA_BACKUP="$HOME/OpenBot/Downloads/OpenBot-data-backup-$(date +%Y%m%d-%H%M%S)"
[ -d "$DATA" ] && ditto "$DATA" "$DATA_BACKUP" && echo "Data backed up to $DATA_BACKUP"
rm -rf /Applications/OpenBot.app
ditto "$APP" /Applications/OpenBot.app
codesign --force --deep --sign - /Applications/OpenBot.app
xattr -dr com.apple.quarantine /Applications/OpenBot.app || true
echo "Installed custom OpenBot. Open it from /Applications."
