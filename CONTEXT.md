# Why this team and this fork exist

Read this once per session, after `PROTOCOL.md` and `memory/`. It says what we are trying to reach,
so that you can choose the next useful task without asking.

## The goal

Biswanath wants Claude and Codex to work as one team, the way people do:

- Either tool can start a session, and the other joins through the board (`STATUS.md`, `LOG.md`).
- They discuss and finalize docs and research together, and consider each other's points before
  they finalize something. They ask him only when they cannot agree, or when the decision is his.
- One develops and the other reviews: Claude builds and Codex reviews for security bugs, or the
  other way round. Codex always tests the real app with computer use.
- Both can start many agents in parallel, and both keep the task list up to date.
- Their memory stays in sync (`memory/`).

OpenBot (the desktop app that runs persistent Claude, Codex and other agents in shared channels) is
the place where much of this work runs. Two problems stopped it:

1. **Too few agents at once.** Upstream allows 2 active assignments per channel, 8 automatic
   assignments per request, and 2 member replies per request, all hard-coded. One agent also runs
   only one channel turn at a time.
2. **Too slow.** The bridge used the same implementation, review and QA flow for every task.
   T-08 now requires automatic flow selection for bridge requests and direct PM chats: docs get
   one owner plus quick independent review; ordinary code gets developer checks plus independent
   review; critical changes keep separate QA. Explicit user/repository gates remain. Automatic selection is
   now active for new tasks; ten direct PM scenarios passed on 2026-11-08. See `designs/T-08-automatic-pm-flow.md`.

So we keep a fork of OpenBot, change it, and install our own build.

## Where we are

- Custom/main 64170898 is installed and startup-verified with existing data (2026-11-08). Limits
  are 12 active assignments/channel, 40 automatic assignments/request and 6 replies/request.
  The normal updater is disabled; the newer-database recovery bypass remains open in PR #7.
- T-08 automatic flow is reviewed and activated in the local bridge and PM Instructions. New
  bridge requests default to auto; direct chats use the same policy. Installed tests52, native
  integration16 and live direct scenarios10 passed. User acceptance remains separate; no measured
  wall-time speedup is claimed. See the design/evidence record for scope and rollback.
- The team protocol, board, log and shared memory exist on `team/coordination`.
- Open work: T-08 automatic PM workflow → T-04 updater recovery → T-05 limit-test failures →
  T-09 parallel channel work for one agent → T-11 one-command team start → T-10 limits in settings →
  T-12 upstream update runbook. `STATUS.md` is the source of truth; this list only explains why.

## What "done" means here

App changes must be merged into `custom/main`, built, installed and verified in the real app.
Use `~/openbot-team/tools/build-openbot-custom.sh` for the authorized app installation; it backs up
the app and data first. Local bridge or PM instruction changes need an exact file/configuration
record, tests, reversible activation and live verification. Keep these stages separate. Mark a
task done only after Biswanath accepts it or says it is done, as `PROTOCOL.md` requires.

## Constraints that do not change

- His real OpenBot data (`~/Library/Application Support/OpenBot`) must never be damaged or
  downgraded. Upstream rule: migrations are irreversible, and no backup is made automatically.
- The official updater must never replace the custom build.
- This repo is public. No secrets, and nothing about his employer or other private work.
- The fork keeps upstream's licence (PolyForm Noncommercial 1.0.0) and upstream's `AGENTS.md`
  rules, except where `memory/decisions.md` records a different choice.
- Speed matters. Scale checks to risk (PROTOCOL.md), and keep moving when the next step is clear.
