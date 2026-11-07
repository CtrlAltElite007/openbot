# Task board

Rules are in `PROTOCOL.md`. Pull before editing, push right after. Times in UTC.

## Tasks

| ID | Task | Owner | Status | Branch | PR | Reviewer | Last update | Notes |
|---|---|---|---|---|---|---|---|---|
| T-01 | Raise channel limits (parallel 2→12, assignments 8→40, replies 2→6) and turn off the official updater | claude-cloud | changes-requested | feature/raise-channel-limits | [#1](https://github.com/CtrlAltElite007/openbot/pull/1) | codex | 2026-11-07T22:06Z | codex: changes requested at 07e64283e; bugs #3 and #4. Bun 1.4.4 / Node 24: both typechecks, 1492 tests and package pass. Dist UI reaches sign-in; channel checks blocked by test login. Recovery bypass reproduced with feed fixture. |
| T-02 | Set up `@claude` mentions on GitHub (Claude Code GitHub Action) | claude-cli | 2026-11-07T22:09Z | T-02 (blocked on Q-04) | [#2](https://github.com/CtrlAltElite007/openbot/pull/2) | codex | 2026-11-07T22:09Z | No Anthropic API key. Waiting on Q-04: Codex cloud instead, or a Claude subscription token. PR #2 on hold, don't merge. |

## Needs Biswanath

| ID | Question | Asked by | Since |
|---|---|---|---|
| Q-03 | T-02: GitHub runs comment/issue workflows from the default branch, which is `main` (upstream mirror). Make `custom/main` the default branch, or also put `claude.yml` on `main`? Recommended: make `custom/main` the default. | claude-cli | 2026-11-07T22:04Z |
| Q-04 | T-02: no Anthropic API key. Option A: use Codex cloud (`@codex` on GitHub, ChatGPT plan, no workflow; you connect GitHub at chatgpt.com/codex) and close PR #2. Option B: keep PR #2 with `CLAUDE_CODE_OAUTH_TOKEN` from `claude setup-token` (Claude Pro/Max, no API key). | claude-cli | 2026-11-07T22:09Z |
| Q-05 | All 16 upstream workflows are active on the fork and running: CI on push (failing), scheduled status-page and canary runs, Discord release announcements (failing), and NorbiAI review on our PRs (#1 queued). Disable the ones we don't need? | claude-cli | 2026-11-07T22:04Z |

## Agents last seen

| Agent | Last seen | Working on |
|---|---|---|
| claude-cloud | 2026-11-07T21:45Z | T-01 (waiting on review) |
| claude-cli | 2026-11-07T22:09Z | T-02 (blocked on Q-04) |
| codex | 2026-11-07T22:06Z | T-01 changes requested; reviewing T-02 / PR #2 |
