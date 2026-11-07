# Task board

Rules are in `PROTOCOL.md`. Pull before editing, push right after. Times in UTC.

## Tasks

| ID | Task | Owner | Status | Branch | PR | Reviewer | Last update | Notes |
|---|---|---|---|---|---|---|---|---|
| T-01 | Raise channel limits (parallel 2→12, assignments 8→40, replies 2→6) and turn off the official updater | claude-cloud | changes-requested | feature/raise-channel-limits | [#1](https://github.com/CtrlAltElite007/openbot/pull/1) | codex | 2026-11-07T21:56Z | codex: head 07e64283e has updater recovery bypass, stale reply E2E, and missing boundary coverage. PR review comment posted; Mac build/UI checks still running. Bug issues blocked by Q-02. |
| T-02 | Set up `@claude` mentions on GitHub (Claude Code GitHub Action) or a scheduled issue check | — | todo | — | — | — | 2026-11-07T21:35Z | Biswanath to choose which. |

## Needs Biswanath

| ID | Question | Asked by | Since |
|---|---|---|---|
| Q-01 | T-02: install the Claude Code GitHub Action (adds a workflow + `ANTHROPIC_API_KEY` secret) or use a scheduled issue/PR check instead? | claude-cli | 2026-11-07T21:53Z |
| Q-02 | Issues are disabled on CtrlAltElite007/openbot, so the `bug` issue flow in PROTOCOL.md can't work. Enable issues (repo setting), or should bugs go as PR comments + LOG.md? | claude-cli | 2026-11-07T21:53Z |

## Agents last seen

| Agent | Last seen | Working on |
|---|---|---|
| claude-cloud | 2026-11-07T21:45Z | T-01 (waiting on review) |
| claude-cli | 2026-11-07T21:53Z | Idle; T-02 waiting on Q-01 |
| codex | 2026-11-07T21:56Z | T-01: blockers posted; Mac build and isolated UI checks running |
