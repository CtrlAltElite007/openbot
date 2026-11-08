# Task board

Rules are in `PROTOCOL.md`. Pull before editing, push right after. Times in UTC.

## Tasks

| ID | Task | Owner | Status | Branch | PR | Reviewer | Last update | Notes |
|---|---|---|---|---|---|---|---|---|
| T-01 | Raise channel limits (parallel 2→12, assignments 8→40, replies 2→6) and turn off the official updater | claude-cloud | merged | feature/raise-channel-limits | [#1](https://github.com/CtrlAltElite007/openbot/pull/1) | codex | 2026-11-08T08:17Z | codex: installed merged custom/main64170898 at explicit user request. ASAR matches tested 12/40/6 build; codesign and current/backup DB integrity pass, schema58 unchanged; CUA existing workspace opens. App/data backup 20261108-134344. User acceptance pending; bugs #3/#4 follow-ups remain. |
| T-02 | Connect Codex cloud to GitHub so `@codex` on issues/PRs fixes bugs (ChatGPT Plus) | codex | blocked | — | [#2](https://github.com/CtrlAltElite007/openbot/pull/2) closed | — | 2026-11-07T23:05Z | codex: private repo-only modern environment published and listed ready/runnable for custom/main. Manual GitHub review works; ordinary task smoke on PR6 still returns create-environment. Legacy settings redirects; integration routing unresolved. |
| T-03 | Add fork rules to AGENTS.md for Codex cloud | claude-cli | merged | feature/agents-md-fork-rules | [#6](https://github.com/CtrlAltElite007/openbot/pull/6) | codex | 2026-11-07T22:23Z | codex: merged as 64170898 after docs review, both types, package and isolated dist startup. No code changes; not marked done. |
| T-04 | Fix #3 (updater bypass in newer-database recovery) and #4 (reply E2E still expects 2) | claude-cloud | changes-requested | feature/fix-updater-recovery-and-reply-e2e | [#7](https://github.com/CtrlAltElite007/openbot/pull/7) | codex | 2026-11-08T07:57Z | codex: de23387b build/types1495 tests/package and three real preference fixtures pass; CUA Quit preserves data. #20 closed. #21 delayed-pipe exit73 still false-passes; fix exit versus close tracking. |
| T-05 | E2E scripts for raised limits: 12 active / 13th queued, 40/41 assignments, stop/resume/cancel (rest of #4) | claude-cli | changes-requested | feature/limit-e2e-scripts | [#19](https://github.com/CtrlAltElite007/openbot/pull/19) | codex | 2026-11-08T08:17Z | codex: 2d26d292 build/types1492 tests/package/dist CUA and actual MCP/service 12+queue13,40/41,6/7,stop/resume/cancel E2E pass. Isolated mock-keychain startup, unchanged E2E. #22 cleanup/report and #23 safe fake failure remain blocking. |
| T-06 | Shared team memory: `memory/` on team/coordination (people, preferences, decisions, project facts) that Claude and Codex both read and write; CLAUDE.md/AGENTS.md pointers; import of Codex `memory_summary.md` facts | claude-cloud | changes-requested | team/coordination | — | codex | 2026-11-07T22:41Z | codex: #10 old installer does not fetch custom/main. Correct current-main/updater/workflow facts and qualify reported facts; details in LOG. |
| T-07 | `CONTEXT.md`: goals of this fork and team, current state, constraints (Biswanath's work rules: evidence-bounded, reversible, ask before deploy) | claude-cloud | changes-requested | team/coordination | — | codex | 2026-11-07T22:41Z | codex: #10 old installer does not fetch custom/main. Correct current-main/updater/workflow facts and qualify reported facts; details in LOG. |
| T-08 | Automatic PM flow for bridge requests and direct PM chats, with risk-based review depth | codex | in-review | — (local bridge and PM instructions) | — | independent source/integration passed | 2026-11-08T10:32Z | codex: review passed; activated and verified. Installed52 tests, native16 and real direct PM10 scenarios pass. Auto default, old requests preserved, status fixed, docs updated. No app-code merge needed. Ready for use; user acceptance pending. Evidence: designs/T-08-automatic-pm-flow.md. |
| T-09 | Let one agent run work from more than one channel at once (upstream #5261): relax the owner-busy rule for providers with concurrent turns | claude-cloud | blocked | feature/agent-parallel-channels | — | codex | 2026-11-07T23:15Z | claude-cloud: design in designs/T-09-agent-parallel-channels.md. Channel work runs in the agent main lane (mailbox), so the #5261 one-line change is not enough. Waiting on Q-06. |
| T-10 | Channel limits in channel settings (upstream #4857): active assignments and automatic assignments per request, with defaults 12/40 and upper bounds | claude-cloud | changes-requested | feature/channel-limit-settings | [#11](https://github.com/CtrlAltElite007/openbot/pull/11) | codex | 2026-11-08T08:08Z | codex: 19c903a1 types3/1492 tests/package/CUA save24/80+rename+navigation+restart pass. #24 own undefined patch resets values; integrated custom-limit regression missing. No merge/install. |
| T-11 | One-command team start: a `/team` command for Claude CLI and a Codex prompt or skill that pulls the board, reads LOG.md and takes the next task | claude-cloud | merged | team/coordination | — | codex | 2026-11-07T23:09Z | codex: installer552983209 passed eight disposable-HOME checks; #9 closed. Coordination changes reviewed, no real skill install or user acceptance yet. |
| T-12 | Upstream release update runbook: rebase `custom/main` onto a new OpenBot tag, rerun checks, rebuild | — | todo | — | — | codex | 2026-11-07T22:50Z | Needs Biswanath's OK for each upstream pull (PROTOCOL rule). |

## Needs Biswanath

| ID | Question | Asked by | Since |
|---|---|---|---|
| Q-06 | T-09: one agent working in several channels at once needs per-channel lanes in the mailbox (large, touches persisted delivery data). Option A: add copies of busy agents to channels now (no code). Option C: build the full change. Recommended: A now, C later if needed. See designs/T-09-agent-parallel-channels.md | claude-cloud | 2026-11-07T23:15Z |


## Agents last seen

| Agent | Last seen | Working on |
|---|---|---|
| claude-cloud | 2026-11-07T23:47Z | PR #7, PR #11, installer #15/#16 waiting on review |
| claude-cli | 2026-11-07T23:10Z | T-05 (#19), T-08 in review |
| codex | 2026-11-08T10:32Z | T08 automatic PM flow activated, verified and documented; user acceptance pending. PR7/11/19 remain changes-requested on existing findings |
