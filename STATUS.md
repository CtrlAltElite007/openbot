# Task board

Rules are in `PROTOCOL.md`. Pull before editing, push right after. Times in UTC.

## Tasks

| ID | Task | Owner | Status | Branch | PR | Reviewer | Last update | Notes |
|---|---|---|---|---|---|---|---|---|
| T-01 | Raise channel limits (parallel 2→12, assignments 8→40, replies 2→6) and turn off the official updater | claude-cloud | merged | feature/raise-channel-limits | [#1](https://github.com/CtrlAltElite007/openbot/pull/1) | codex | 2026-11-07T22:14Z | codex: squash-merged as 00ebd061 at Biswanath's explicit instruction after review hold. Bugs #3/#4 remain open; channel UI/boundary validation incomplete. Not installed or accepted; not done. |
| T-02 | Connect Codex cloud to GitHub so `@codex` on issues/PRs fixes bugs (ChatGPT Plus) | codex | in-progress | — | [#2](https://github.com/CtrlAltElite007/openbot/pull/2) closed | — | 2026-11-07T22:23Z | codex: repository already connected and repository code review enabled. No saved cloud environments. Inspecting creation flow; no new GitHub grant made. |
| T-03 | Add fork rules to AGENTS.md for Codex cloud | claude-cli | merged | feature/agents-md-fork-rules | [#6](https://github.com/CtrlAltElite007/openbot/pull/6) | codex | 2026-11-07T22:23Z | codex: merged as 64170898 after docs review, both types, package and isolated dist startup. No code changes; not marked done. |
| T-04 | Fix #3 (updater bypass in newer-database recovery) and #4 (reply E2E still expects 2) | claude-cloud | in-review | feature/fix-updater-recovery-and-reply-e2e | [#7](https://github.com/CtrlAltElite007/openbot/pull/7) | codex | 2026-11-07T22:45Z | claude-cloud: #8 fixed at f93f8868 (backup wording, 15 locales; i18n:check and test pass). Needs codex review of new head. Seventh-call denial proof stays in #4 / T-05. |
| T-05 | E2E scripts for raised limits: 12 active / 13th queued, 40/41 assignments, stop/resume/cancel (rest of #4) | claude-cli | in-progress | feature/limit-e2e-scripts | — | codex | 2026-11-07T22:30Z | Plan: one E2E script on the worktree's own dev profile (not real data). Fake ACP agents call the real channel tools over OpenBot's MCP bridge, so there are no paid turns and no sign-in. Checks: 12 running / 13th queued, 40 assignments / 41st pauses, 6 replies / 7th refused, stop/resume/cancel. Writes .openbot-build/channel-limits-e2e/report.json. |
| T-06 | Shared team memory: `memory/` on team/coordination (people, preferences, decisions, project facts) that Claude and Codex both read and write; CLAUDE.md/AGENTS.md pointers; import of Codex `memory_summary.md` facts | claude-cloud | in-progress | team/coordination | — | codex | 2026-11-07T22:50Z | Claimed. Docs only. |
| T-07 | `CONTEXT.md`: goals of this fork and team, current state, constraints (Biswanath's work rules: evidence-bounded, reversible, ask before deploy) | claude-cloud | todo | team/coordination | — | codex | 2026-11-07T22:50Z | Next after T-06. |
| T-08 | Speed up the OpenBot PM workflow: risk tiers in `~/OpenBot/Bridge/pm_workflow.py` brief (docs/research → 1 owner + quick review; code → dev tests + review; auth/storage/migrations → full QA) | claude-cli | todo | — (local file on the Mac) | — | codex | 2026-11-07T22:50Z | Local file outside the repo, so claude-cli. Keep its tests passing (`python3 -m unittest discover -v`). |
| T-09 | Let one agent run work from more than one channel at once (upstream #5261): relax the owner-busy rule for providers with concurrent turns | claude-cloud | todo | feature/agent-parallel-channels | — | codex | 2026-11-07T22:50Z | Code. Needs careful review: scheduler and resource rules. |
| T-10 | Channel limits in channel settings (upstream #4857): active assignments and automatic assignments per request, with defaults 12/40 and upper bounds | — | todo | — | — | codex | 2026-11-07T22:50Z | Touches channel save format; check Team API codec and mobile. |
| T-11 | One-command team start: a `/team` command for Claude CLI and a Codex prompt or skill that pulls the board, reads LOG.md and takes the next task | claude-cloud | todo | team/coordination | — | codex | 2026-11-07T22:50Z | Files live on the team branch; Biswanath copies them to ~/.claude and ~/.codex. |
| T-12 | Upstream release update runbook: rebase `custom/main` onto a new OpenBot tag, rerun checks, rebuild | — | todo | — | — | codex | 2026-11-07T22:50Z | Needs Biswanath's OK for each upstream pull (PROTOCOL rule). |

## Needs Biswanath

| ID | Question | Asked by | Since |
|---|---|---|---|

## Agents last seen

| Agent | Last seen | Working on |
|---|---|---|
| claude-cloud | 2026-11-07T22:45Z | T-04 (waiting on review) |
| claude-cli | 2026-11-07T22:30Z | T-05 |
| codex | 2026-11-07T22:28Z | Active: PR7 build/recovery fixture; T02 cloud setup |
