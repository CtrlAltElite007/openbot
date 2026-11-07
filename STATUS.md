# Task board

Rules are in `PROTOCOL.md`. Pull before editing, push right after. Times in UTC.

## Tasks

| ID | Task | Owner | Status | Branch | PR | Reviewer | Last update | Notes |
|---|---|---|---|---|---|---|---|---|
| T-01 | Raise channel limits (parallel 2→12, assignments 8→40, replies 2→6) and turn off the official updater | claude-cloud | merged | feature/raise-channel-limits | [#1](https://github.com/CtrlAltElite007/openbot/pull/1) | codex | 2026-11-07T22:14Z | codex: squash-merged as 00ebd061 at Biswanath's explicit instruction after review hold. Bugs #3/#4 remain open; channel UI/boundary validation incomplete. Not installed or accepted; not done. |
| T-02 | Connect Codex cloud to GitHub so `@codex` on issues/PRs fixes bugs (ChatGPT Plus) | codex | in-progress | — | [#2](https://github.com/CtrlAltElite007/openbot/pull/2) closed | — | 2026-11-07T22:23Z | codex: repository already connected and repository code review enabled. No saved cloud environments. Inspecting creation flow; no new GitHub grant made. |
| T-03 | Add fork rules to AGENTS.md for Codex cloud | claude-cli | merged | feature/agents-md-fork-rules | [#6](https://github.com/CtrlAltElite007/openbot/pull/6) | codex | 2026-11-07T22:23Z | codex: merged as 64170898 after docs review, both types, package and isolated dist startup. No code changes; not marked done. |
| T-04 | Fix #3 (updater bypass in newer-database recovery) and #4 (reply E2E still expects 2) | claude-cloud | changes-requested | feature/fix-updater-recovery-and-reply-e2e | [#7](https://github.com/CtrlAltElite007/openbot/pull/7) | codex | 2026-11-07T22:35Z | codex: reviewing 6cd233cb, build running. Bug #8: recovery dialog claims a guaranteed build-script backup. Correct all locales. #4 remains partial; seventh-call refusal is not observed. |
| T-05 | E2E scripts for raised limits: 12 active / 13th queued, 40/41 assignments, stop/resume/cancel (rest of #4) | claude-cli | claimed | feature/limit-e2e-scripts | — | codex | 2026-11-07T22:28Z | Needs a signed-in OpenBot app and 2+ signed-in provider agents, so it runs on the Mac. |

## Needs Biswanath

| ID | Question | Asked by | Since |
|---|---|---|---|

## Agents last seen

| Agent | Last seen | Working on |
|---|---|---|
| claude-cloud | 2026-11-07T22:35Z | T-04 (waiting on review) |
| claude-cli | 2026-11-07T22:28Z | T-05 |
| codex | 2026-11-07T22:28Z | Active: PR7 build/recovery fixture; T02 cloud setup |
