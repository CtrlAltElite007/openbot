# Team protocol: custom OpenBot fork

Every agent working on `github.com/CtrlAltElite007/openbot` follows this file. Read all of it at the
start of every session. Then read `memory/` (shared memory: preferences, decisions, project facts) and
`CONTEXT.md` (why this team exists and what to do next), and add to memory as `memory/README.md` says. If anything here conflicts with a request from Biswanath, his request wins.

## Who is on the team

| ID | Who | Where it runs | Main role |
|---|---|---|---|
| `claude-cloud` | Claude in claude.ai (cloud session) | Anthropic cloud, no access to this Mac's apps | Developer |
| `claude-cli` | Claude Code CLI | Biswanath's Mac | Developer |
| `codex` | Codex CLI / app | Biswanath's Mac, with computer use | Reviewer, tester, merger |
| `codex-cloud` | Codex cloud, started by `@codex` on GitHub (Biswanath's ChatGPT Plus) | OpenAI cloud, no access to this Mac or to `team/coordination` | Bug fixer on request |
| `biswanath` | The human | Anywhere | Decides anything in "Needs Biswanath" |

Sign every commit, log line and comment with your ID. Use the GitHub account `CtrlAltElite007`
for this repo (`gh auth switch -u CtrlAltElite007`). Never use any other GitHub account here.

## Where things live

| What | Where |
|---|---|
| Code that gets built and installed | branch `custom/main` |
| One feature or fix | branch `feature/<short-name>`, merged into `custom/main` by PR |
| Task board, who owns what, status | `STATUS.md` on branch `team/coordination` (this branch) |
| Messages between agents | `LOG.md` on branch `team/coordination`, append-only |
| Bugs found in review or testing | GitHub issues, label `bug` |

`team/coordination` never contains code and is never merged into `custom/main`. Agents push to it
directly; no PR. Keep it in its own folder so you never switch branches inside a code checkout:

```sh
# Mac (claude-cli, codex), once:
git clone -b team/coordination https://github.com/CtrlAltElite007/openbot ~/openbot-team
# Cloud (claude-cloud): a separate clone directory, same branch.
```

## Staying in sync

Local and cloud agents cannot see each other's work until it is pushed, so push early and often.

1. **Pull before you act.** Run `git -C ~/openbot-team pull --rebase` at the start of every session,
   before claiming a task, before posting in `LOG.md`, and before opening or merging a PR.
2. **Push right after every change** to `STATUS.md` or `LOG.md`, within a minute. One change per
   commit, message format `<agent-id>: <what changed>`.
3. **Heartbeat.** While you own a task, update its `Last update` in `STATUS.md` and push at least
   every 15 minutes, and at every state change.
4. **Conflicts.** If a push is rejected, `git pull --rebase`, re-apply your edit to the newest
   version, push again. Never force-push this branch. Never delete another agent's lines.
5. **Stale claims.** A task whose owner has not updated it for 60 minutes is stale. Another agent may
   take it over only after writing in `LOG.md` "taking over T-xx from <id>, stale since <time>".
6. **Times** are UTC ISO format, e.g. `2026-11-08T03:10Z`.

## Task lifecycle

`todo → claimed → in-progress → in-review → changes-requested → in-review → merged → done`
(also `blocked`, with the reason in Notes).

1. **Claim.** Pull, set Owner to your ID and Status to `claimed`, push, *then* start. If the push
   fails because someone else claimed it first, let them have it.
2. **Build.** Work on `feature/<short-name>` from the latest `custom/main`. Status `in-progress`.
3. **Open a PR** into `custom/main`. Title `T-xx: <summary>`. The body lists what changed, how you
   tested it, and risks. Put the PR link in `STATUS.md`, set Status `in-review`, Reviewer `codex`, push.
4. **Review** (see Codex's role). Results go on the PR, plus one line in `LOG.md`.
5. **Fixes** go on the same feature branch. Set Status back to `in-review` and log it.
6. **Merge** is done by the reviewer, then Status `merged`. Status becomes `done` once Biswanath
   has installed and accepted it, or says it is done.

One task per feature branch, one feature branch per PR. Do not mix unrelated changes.

## Talking to each other

- Write in `LOG.md`: `- 2026-11-08T03:10Z codex → @claude-cli: T-03 build fails on bun 1.4.4, see #12`
- Address a specific agent with `@claude-cloud`, `@claude-cli`, `@codex`, or `@claude` for
  whichever Claude is free. Address `@biswanath` only for things that need him.
- Every agent reads the `LOG.md` lines added since its last session before doing anything else,
  and answers lines addressed to it.
- **On GitHub, `@codex` starts Codex cloud** (`codex-cloud`), not the local `codex`. A PR comment of
  exactly `@codex review` asks for a review. Any other `@codex <ask>` on a PR or issue starts a
  cloud fix task. Start every other GitHub comment with the agent ID instead (`codex:`,
  `claude-cli:`) so you don't start a cloud run by accident. In `LOG.md`, `@codex` still means the
  local `codex`.
- There is no `@claude` trigger on GitHub (no Anthropic API key). Claude agents pick up open `bug`
  issues when they check in. Always add a GitHub request to `LOG.md` too.

## Roles

### Developers (`claude-cloud`, `claude-cli`)
- At the start of every session, pull and read `STATUS.md`, new `LOG.md` lines, and open issues
  labelled `bug` (`gh issue list -R CtrlAltElite007/openbot -l bug`).
- Fix open bugs on your own feature branches before starting new tasks.
- Run before opening a PR: `bun install --frozen-lockfile`, `bun run typecheck:node`,
  `bun run typecheck:contracts`, `bun run test:desktop`. Paste the results in the PR.
- `claude-cloud` cannot run the Mac app or computer use; leave UI testing to `codex`.
- Never merge your own PR. Never push to `custom/main` directly.

### Bug fixer on request (`codex-cloud`)
- Runs only when someone writes `@codex <ask>` on a GitHub issue or PR. Whoever asks must name the
  base branch `custom/main` and the branch `feature/<short-name>` in the ask, since Codex cloud
  cannot read this file. Example: `@codex fix this bug. Branch feature/fix-reply-limit from
  custom/main, open a PR into custom/main, title "T-xx: ...". Don't push to main or custom/main.`
- The agent who asked owns the task in `STATUS.md` and logs it, on Codex cloud's behalf.
- **A Claude reviews the code of every PR Codex cloud opens** (`claude-cli` or `claude-cloud`, set
  as Reviewer), so Codex never approves Codex's work. After that review passes, `codex` still does
  the build, computer-use test and merge as usual.

### Reviewer and tester (`codex`)
For each PR into `custom/main` marked `in-review`:
1. **Review the diff:** correctness, scope creep, security (secrets, auth, command injection, unsafe
   file or process handling, permission changes), and data compatibility with
   `~/Library/Application Support/OpenBot` (migrations must not break or downgrade it).
2. **Build** in `~/openbot-review` (clone once, reuse): Bun 1.4.x, Node 24 (`nvm use 24`), then
   `bun install --frozen-lockfile`, both typechecks, `bun run test:desktop`, `bun run package`,
   and confirm `dist/mac-arm64/OpenBot.app` exists.
3. **Test with computer use, always.** Launch the built app from `dist/` (never from
   `/Applications`) with a throwaway profile so Biswanath's real agents and data are untouched.
   Check that the PR's feature works in the UI, and take screenshots.
4. **Decide.**
   - All green: post a review comment with the commands, results and screenshots, squash-merge into
     `custom/main`, delete the feature branch, update `STATUS.md`, and log it. All agents share the
     `CtrlAltElite007` account, so GitHub will not let you press "Approve"; the comment plus the
     merge is the approval.
   - Problems: do not merge. Comment on the PR with each blocker. For each real bug, open an issue
     with title, steps to reproduce, expected vs actual, logs or screenshots, the PR link and label
     `bug`. Start the issue body with the PR owner's ID and a one-line ask (or `@codex <ask>` to hand the fix to Codex cloud). Set Status
     `changes-requested` and log it addressed to the PR's owner.
5. When fixes arrive, review the new head commit only.

**Scale checks to risk.** Docs or text-only changes need review and typecheck only. Code changes
need the full loop. Anything touching the updater, storage, auth, migrations or process spawning
needs the full loop plus an explicit note on data safety in the review.

## Ask Biswanath first

Add the item to "Needs Biswanath" in `STATUS.md`, log it as `@biswanath`, and wait before:
- merging a change to the database schema or migrations,
- force-pushing anything, or deleting branches other than merged feature branches,
- changing repo settings, secrets, workflows or GitHub Actions,
- pulling upstream changes from `nightly-labs/openbot` into `custom/main`,
- installing over `/Applications/OpenBot.app` or touching his real OpenBot data,
- any disagreement between agents that one round of discussion in `LOG.md` did not settle.

## End of every session

Update `STATUS.md` (owner, status, last update, notes), add one `LOG.md` line saying what you did
and what is next, and push. Nothing is "done" for the team until it is pushed.
