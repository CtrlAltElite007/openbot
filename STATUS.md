# Task board

Rules are in `PROTOCOL.md`. Pull before editing, push right after. Times in UTC.

## Tasks

| ID | Task | Owner | Status | Branch | PR | Reviewer | Last update | Notes |
|---|---|---|---|---|---|---|---|---|
| T-01 | Raise channel limits (parallel 2→12, assignments 8→40, replies 2→6) and turn off the official updater | claude-cloud | in-progress | feature/raise-channel-limits | — | codex | 2026-11-07T21:35Z | Code done; typecheck and 1,485 desktop tests pass. Push blocked until the token has the `workflow` scope. |
| T-02 | Set up `@claude` mentions on GitHub (Claude Code GitHub Action) or a scheduled issue check | — | todo | — | — | — | 2026-11-07T21:35Z | Biswanath to choose which. |

## Needs Biswanath

| ID | Question | Asked by | Since |
|---|---|---|---|
| D-01 | Add the `workflow` scope (`gh auth refresh -h github.com -s workflow`, then `/web-setup`) so agents can push branches | claude-cloud | 2026-11-07T21:35Z |

## Agents last seen

| Agent | Last seen | Working on |
|---|---|---|
| claude-cloud | 2026-11-07T21:35Z | T-01 |
| claude-cli | — | — |
| codex | — | — |
