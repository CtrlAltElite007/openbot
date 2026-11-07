# Task board

Rules are in `PROTOCOL.md`. Pull before editing, push right after. Times in UTC.

## Tasks

| ID | Task | Owner | Status | Branch | PR | Reviewer | Last update | Notes |
|---|---|---|---|---|---|---|---|---|
| T-01 | Raise channel limits (parallel 2→12, assignments 8→40, replies 2→6) and turn off the official updater | claude-cloud | merged | feature/raise-channel-limits | [#1](https://github.com/CtrlAltElite007/openbot/pull/1) | codex | 2026-11-07T22:14Z | codex: squash-merged as 00ebd061 at Biswanath's explicit instruction after review hold. Bugs #3/#4 remain open; channel UI/boundary validation incomplete. Not installed or accepted; not done. |
| T-02 | Connect Codex cloud to GitHub so `@codex` on issues/PRs fixes bugs (ChatGPT Plus) | codex | blocked | — | [#2](https://github.com/CtrlAltElite007/openbot/pull/2) closed | — | 2026-11-07T23:05Z | codex: private repo-only modern environment published and listed ready/runnable for custom/main. Manual GitHub review works; ordinary task smoke on PR6 still returns create-environment. Legacy settings redirects; integration routing unresolved. |
| T-03 | Add fork rules to AGENTS.md for Codex cloud | claude-cli | merged | feature/agents-md-fork-rules | [#6](https://github.com/CtrlAltElite007/openbot/pull/6) | codex | 2026-11-07T22:23Z | codex: merged as 64170898 after docs review, both types, package and isolated dist startup. No code changes; not marked done. |
| T-04 | Fix #3 (updater bypass in newer-database recovery) and #4 (reply E2E still expects 2) | claude-cloud | in-review | feature/fix-updater-recovery-and-reply-e2e | [#7](https://github.com/CtrlAltElite007/openbot/pull/7) | codex | 2026-11-07T23:09Z | claude-cloud: head c2c98049 adds scripts/custom-build-newer-data-e2e.ts (packaged app, version-99999 fixture, network denied; checks no update line and data intact). Needs a Mac run by codex. #4 seventh-call proof stays with T-05. |
| T-05 | E2E scripts for raised limits: 12 active / 13th queued, 40/41 assignments, stop/resume/cancel (rest of #4) | claude-cli | in-review | feature/limit-e2e-scripts | [#19](https://github.com/CtrlAltElite007/openbot/pull/19) | codex | 2026-11-07T23:07Z | E2E passes twice in a row on a fresh dev app (fake ACP agents, real channel tools, no sign-in or paid turns). Bun 1.4.2: typechecks and 1492 tests pass. Note for T-10: the script asserts the 12/40/6 constants, so whichever PR merges second adjusts it. |
| T-06 | Shared team memory: `memory/` on team/coordination (people, preferences, decisions, project facts) that Claude and Codex both read and write; CLAUDE.md/AGENTS.md pointers; import of Codex `memory_summary.md` facts | claude-cloud | changes-requested | team/coordination | — | codex | 2026-11-07T22:41Z | codex: #10 old installer does not fetch custom/main. Correct current-main/updater/workflow facts and qualify reported facts; details in LOG. |
| T-07 | `CONTEXT.md`: goals of this fork and team, current state, constraints (Biswanath's work rules: evidence-bounded, reversible, ask before deploy) | claude-cloud | changes-requested | team/coordination | — | codex | 2026-11-07T22:41Z | codex: #10 old installer does not fetch custom/main. Correct current-main/updater/workflow facts and qualify reported facts; details in LOG. |
| T-08 | Speed up the OpenBot PM workflow: risk tiers in `~/OpenBot/Bridge/pm_workflow.py` brief (docs/research → 1 owner + quick review; code → dev tests + review; auth/storage/migrations → full QA) | claude-cli | in-review | — (local file on the Mac) | patch: `~/OpenBot/Bridge/.backup-T-08-20261107T2307Z/T-08.patch` | codex | 2026-11-07T23:10Z | New `pm-task --tier docs|code|critical` (default critical = old brief, byte-identical; old saved requests keep their digest). 46/46 unit tests pass (41 old + 5 new). Originals, patch and before/after sha256 in the backup folder. Not in git, so no PR: review the patch. |
| T-09 | Let one agent run work from more than one channel at once (upstream #5261): relax the owner-busy rule for providers with concurrent turns | claude-cloud | blocked | feature/agent-parallel-channels | — | codex | 2026-11-07T23:15Z | claude-cloud: design in designs/T-09-agent-parallel-channels.md. Channel work runs in the agent main lane (mailbox), so the #5261 one-line change is not enough. Waiting on Q-06. |
| T-10 | Channel limits in channel settings (upstream #4857): active assignments and automatic assignments per request, with defaults 12/40 and upper bounds | claude-cloud | in-review | feature/channel-limit-settings | [#11](https://github.com/CtrlAltElite007/openbot/pull/11) | codex | 2026-11-07T23:07Z | claude-cloud: head 059f8728 fixes #12 (max 100 handoffs) and #13 (queued saves keep earlier limits). Types, check:ui pass. Behavioral E2E asked of claude-cli in T-05. |
| T-11 | One-command team start: a `/team` command for Claude CLI and a Codex prompt or skill that pulls the board, reads LOG.md and takes the next task | claude-cloud | merged | team/coordination | — | codex | 2026-11-07T23:09Z | codex: installer552983209 passed eight disposable-HOME checks; #9 closed. Coordination changes reviewed, no real skill install or user acceptance yet. |
| T-12 | Upstream release update runbook: rebase `custom/main` onto a new OpenBot tag, rerun checks, rebuild | — | todo | — | — | codex | 2026-11-07T22:50Z | Needs Biswanath's OK for each upstream pull (PROTOCOL rule). |

## Needs Biswanath

| ID | Question | Asked by | Since |
|---|---|---|---|
| Q-06 | T-09: one agent working in several channels at once needs per-channel lanes in the mailbox (large, touches persisted delivery data). Option A: add copies of busy agents to channels now (no code). Option C: build the full change. Recommended: A now, C later if needed. See designs/T-09-agent-parallel-channels.md | claude-cloud | 2026-11-07T23:15Z |


## Agents last seen

| Agent | Last seen | Working on |
|---|---|---|
| claude-cloud | 2026-11-07T23:09Z | T-04, T-10 in review; T-09 on Q-06; waiting on Biswanath about workflow speed |
| claude-cli | 2026-11-07T23:10Z | T-05 (#19), T-08 in review |
| codex | 2026-11-07T23:09Z | Reviewing PR19 exact head, PR11 fixes, installer shutdown/rollback; PR7 regression still pending |
