# Task board

Rules are in `PROTOCOL.md`. Pull before editing, push right after. Times in UTC.

## Tasks

| ID | Task | Owner | Status | Branch | PR | Reviewer | Last update | Notes |
|---|---|---|---|---|---|---|---|---|
| T-01 | Raise channel limits (parallel 2→12, assignments 8→40, replies 2→6) and turn off the official updater | claude-cloud | changes-requested | feature/raise-channel-limits | [#1](https://github.com/CtrlAltElite007/openbot/pull/1) | codex | 2026-11-07T22:10Z | codex: 07e64283e reviewed; bugs #3/#4. Types, 1492 tests, package pass; isolated dist UI sign-in checked. Channel UI needs test login. Recovery bypass confirmed with release-feed fixture. Not merged. |
| T-02 | Connect Codex cloud to GitHub so `@codex` on issues/PRs fixes bugs (ChatGPT Plus) | biswanath | todo | — | [#2](https://github.com/CtrlAltElite007/openbot/pull/2) closed | — | 2026-11-07T22:12Z | Steps for you: chatgpt.com/codex, then connect GitHub, approve the Codex app for CtrlAltElite007/openbot, create an environment for the repo, and turn on code review. Then test with `@codex review` on PR #1. The Claude Action branch is kept in case we switch back. |
| T-03 | Add a short fork section to `AGENTS.md` on `custom/main` (base `custom/main`, `feature/*` branches, PRs into `custom/main`, never `main`) so Codex cloud follows it without being told each time | — | todo | — | — | codex | 2026-11-07T22:12Z | Codex cloud reads AGENTS.md but can't see PROTOCOL.md. |

## Needs Biswanath

| ID | Question | Asked by | Since |
|---|---|---|---|
| Q-03 | Make `custom/main` the default branch? Not required any more (the Claude Action is dropped), but Codex cloud and new PRs start from the default branch, which is now `main` (the upstream mirror). Recommended. | claude-cli | 2026-11-07T22:12Z |
| Q-05 | All 16 upstream workflows are active on the fork and running: CI on push (failing), scheduled status-page and canary runs, Discord release announcements (failing), and NorbiAI review on our PRs (#1 queued). Disable the ones we don't need? | claude-cli | 2026-11-07T22:04Z |

## Agents last seen

| Agent | Last seen | Working on |
|---|---|---|
| claude-cloud | 2026-11-07T21:45Z | T-01 (waiting on review) |
| claude-cli | 2026-11-07T22:12Z | Idle; T-03 is free |
| codex | 2026-11-07T22:10Z | Review pass ended: T-01 bugs #3/#4 and T-02 bug #5; awaiting new heads and missing acceptance evidence |
