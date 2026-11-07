# Task board

Rules are in `PROTOCOL.md`. Pull before editing, push right after. Times in UTC.

## Tasks

| ID | Task | Owner | Status | Branch | PR | Reviewer | Last update | Notes |
|---|---|---|---|---|---|---|---|---|
| T-01 | Raise channel limits (parallel 2→12, assignments 8→40, replies 2→6) and turn off the official updater | claude-cloud | merged | feature/raise-channel-limits | [#1](https://github.com/CtrlAltElite007/openbot/pull/1) | codex | 2026-11-07T22:14Z | codex: squash-merged as 00ebd061 at Biswanath's explicit instruction after review hold. Bugs #3/#4 remain open; channel UI/boundary validation incomplete. Not installed or accepted; not done. |
| T-02 | Connect Codex cloud to GitHub so `@codex` on issues/PRs fixes bugs (ChatGPT Plus) | codex | in-progress | — | [#2](https://github.com/CtrlAltElite007/openbot/pull/2) closed | — | 2026-11-07T22:47Z | codex: user explicitly approved publication in active chat. Private repo-only environment is publishing. Manual GitHub review verified; fix-task execution unverified. |
| T-03 | Add fork rules to AGENTS.md for Codex cloud | claude-cli | merged | feature/agents-md-fork-rules | [#6](https://github.com/CtrlAltElite007/openbot/pull/6) | codex | 2026-11-07T22:23Z | codex: merged as 64170898 after docs review, both types, package and isolated dist startup. No code changes; not marked done. |
| T-04 | Fix #3 (updater bypass in newer-database recovery) and #4 (reply E2E still expects 2) | claude-cloud | changes-requested | feature/fix-updater-recovery-and-reply-e2e | [#7](https://github.com/CtrlAltElite007/openbot/pull/7) | codex | 2026-11-07T22:41Z | codex: f93f8868 wording passes review/types/i18n/updater tests/package/CUA; #8 corrected. Remaining #3 repeatable startup/data/log regression requested. #4 boundaries remain T05. |
| T-05 | E2E scripts for raised limits: 12 active / 13th queued, 40/41 assignments, stop/resume/cancel (rest of #4) | claude-cli | in-progress | feature/limit-e2e-scripts | — | codex | 2026-11-07T22:36Z | Script and fake agent written (`scripts/channel-limits-e2e.ts`, `scripts/provider-fakes/agents/channel-limits.ts`); lint and typecheck pass. Next: first run in the dev app (own dev profile). |
| T-06 | Shared team memory: `memory/` on team/coordination (people, preferences, decisions, project facts) that Claude and Codex both read and write; CLAUDE.md/AGENTS.md pointers; import of Codex `memory_summary.md` facts | claude-cloud | changes-requested | team/coordination | — | codex | 2026-11-07T22:41Z | codex: #10 old installer does not fetch custom/main. Correct current-main/updater/workflow facts and qualify reported facts; details in LOG. |
| T-07 | `CONTEXT.md`: goals of this fork and team, current state, constraints (Biswanath's work rules: evidence-bounded, reversible, ask before deploy) | claude-cloud | changes-requested | team/coordination | — | codex | 2026-11-07T22:41Z | codex: #10 old installer does not fetch custom/main. Correct current-main/updater/workflow facts and qualify reported facts; details in LOG. |
| T-08 | Speed up the OpenBot PM workflow: risk tiers in `~/OpenBot/Bridge/pm_workflow.py` brief (docs/research → 1 owner + quick review; code → dev tests + review; auth/storage/migrations → full QA) | claude-cli | todo | — (local file on the Mac) | — | codex | 2026-11-07T22:50Z | Local file outside the repo, so claude-cli. Keep its tests passing (`python3 -m unittest discover -v`). |
| T-09 | Let one agent run work from more than one channel at once (upstream #5261): relax the owner-busy rule for providers with concurrent turns | claude-cloud | blocked | feature/agent-parallel-channels | — | codex | 2026-11-07T23:15Z | claude-cloud: design in designs/T-09-agent-parallel-channels.md. Channel work runs in the agent main lane (mailbox), so the #5261 one-line change is not enough. Waiting on Q-06. |
| T-10 | Channel limits in channel settings (upstream #4857): active assignments and automatic assignments per request, with defaults 12/40 and upper bounds | claude-cloud | in-review | feature/channel-limit-settings | [#11](https://github.com/CtrlAltElite007/openbot/pull/11) | codex | 2026-11-07T22:47Z | codex: reviewing PR11 75df5ba6 with independent contract/scheduler and UI audits. Full sequential build/checks running; persistence/invalid input/remote compatibility and dist UI are gates. |
| T-11 | One-command team start: a `/team` command for Claude CLI and a Codex prompt or skill that pulls the board, reads LOG.md and takes the next task | claude-cloud | changes-requested | team/coordination | — | codex | 2026-11-07T22:41Z | codex: #9 installer overwrites existing/symlinked files; skill excludes required Claude reviews. Disposable tests only; no real install. |
| T-12 | Upstream release update runbook: rebase `custom/main` onto a new OpenBot tag, rerun checks, rebuild | — | todo | — | — | codex | 2026-11-07T22:50Z | Needs Biswanath's OK for each upstream pull (PROTOCOL rule). |

## Needs Biswanath

| ID | Question | Asked by | Since |
|---|---|---|---|
| Q-06 | T-09: one agent working in several channels at once needs per-channel lanes in the mailbox (large, touches persisted delivery data). Option A: add copies of busy agents to channels now (no code). Option C: build the full change. Recommended: A now, C later if needed. See designs/T-09-agent-parallel-channels.md | claude-cloud | 2026-11-07T23:15Z |


## Agents last seen

| Agent | Last seen | Working on |
|---|---|---|
| claude-cloud | 2026-11-07T23:45Z | T-04 and T-10 in review; T-09 waiting on Q-06 |
| claude-cli | 2026-11-07T22:36Z | T-05 |
| codex | 2026-11-07T22:41Z | Active: T02 draft setup; PR7 regression gate; T05 queue; coordination doc reviews |
