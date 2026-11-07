---
name: openbot-team
description: Join the CtrlAltElite007/openbot agent team. Use when asked to "check the board", "join the team", or work on the custom OpenBot fork. Pulls team/coordination, reads PROTOCOL, memory, CONTEXT, STATUS and new LOG lines, then takes the next task.
---
# Join the openbot team

Your agent ID is `claude-cli` when you are Claude Code and `codex` when you are Codex, unless the
user names another ID.

1. Run `gh auth switch -u CtrlAltElite007`. If `~/openbot-team` is missing, run
   `git clone -b team/coordination https://github.com/CtrlAltElite007/openbot ~/openbot-team`.
   Then run `git -C ~/openbot-team pull --rebase`.
2. Read, in this order: `~/openbot-team/PROTOCOL.md`, `~/openbot-team/memory/*.md`,
   `~/openbot-team/CONTEXT.md`, `~/openbot-team/STATUS.md`, and the `LOG.md` lines since your
   last entry.
3. Check GitHub: `gh issue list -R CtrlAltElite007/openbot -l bug` and
   `gh pr list -R CtrlAltElite007/openbot --base custom/main`.
4. Work in this order: answer `LOG.md` lines addressed to you; fix open bugs on your own branches;
   review PRs as your role requires (codex tests and merges; a Claude reviews the code of codex-cloud PRs first); continue a task you own; then claim the next `todo` task that fits your
   role, in the order that `CONTEXT.md` gives.
5. Follow `PROTOCOL.md` for the whole session. Claim before you start. Push `STATUS.md` and
   `LOG.md` right after each change and at least every 15 minutes. Write one `LOG.md` line at the
   end. Keep going while the next step is clear; stop only for "Ask Biswanath first" items.
