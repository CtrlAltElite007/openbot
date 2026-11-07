#!/usr/bin/env bash
# Installs the openbot-team skill for Claude Code and Codex on this Mac.
# Run: bash ~/openbot-team/tools/install-team-skill.sh
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
for dir in "$HOME/.claude/skills/openbot-team" "$HOME/.codex/skills/openbot-team"; do
  mkdir -p "$dir"
  cp "$HERE/openbot-team/SKILL.md" "$dir/SKILL.md"
done
echo "Installed. Start a new session, then:"
echo "  Claude Code:  /openbot-team   (or say \"check the team board\")"
echo "  Codex:        \$openbot-team   (or say \"check the team board\")"
