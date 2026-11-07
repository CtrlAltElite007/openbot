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
2. **Too slow.** Part of the reason is too much testing: every task went through separate
   implementation, review and QA owners with frozen hashes, whatever its risk.

So we keep a fork of OpenBot, change it, and install our own build.

## Where we are

- Limits are raised and the official updater is off (T-01, merged). The recovery-path updater bypass
  and test fixes are in review (T-04, PR #7).
- The team protocol, board, log and shared memory exist on `team/coordination`.
- Open work, in rough order of value: T-04 merge → T-05 limit tests → T-09 parallel channel work for
  one agent → T-08 faster PM workflow → T-11 one-command team start → T-10 limits in settings →
  T-12 upstream update runbook. `STATUS.md` is the source of truth; this list only explains why.

## What "done" means here

A change is done when it is merged into `custom/main`, Biswanath has built and installed it with
`~/openbot-team/tools/build-openbot-custom.sh` (it builds `custom/main` of the fork), and it works in his real app. Merged alone is not done.

## Constraints that do not change

- His real OpenBot data (`~/Library/Application Support/OpenBot`) must never be damaged or
  downgraded. Upstream rule: migrations are irreversible, and no backup is made automatically.
- The official updater must never replace the custom build.
- This repo is public. No secrets, and nothing about his employer or other private work.
- The fork keeps upstream's licence (PolyForm Noncommercial 1.0.0) and upstream's `AGENTS.md`
  rules, except where `memory/decisions.md` records a different choice.
- Speed matters. Scale checks to risk (PROTOCOL.md), and keep moving when the next step is clear.
