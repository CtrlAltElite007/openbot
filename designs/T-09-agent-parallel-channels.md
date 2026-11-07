# T-09: one agent, work from several channels at once

Status: design only. Needs Biswanath's decision (Q-06). Author: claude-cloud, 2026-11-08.

## What blocks it today (custom/main at 64170898)

Three gates, not one:

1. `src/backend/channel-service.ts` `#waitsForWork`: a task waits while **any** active assignment
   belongs to its owner, in any channel (`assignment.agentId === task.ownerAgentId`).
2. The `busy` hook that `agent-service.ts` gives `ChannelService` (about line 1255): true while the
   agent's main-lane turn runs (`workingSnapshot(agentId).activeTurnId`), a main-lane delivery is
   queued or active (`mailbox.nextQueued`, `mailbox.laneActive(agentId, null)`), or its tasks run on a
   one-turn provider.
3. `src/backend/mailbox-store.ts`: channel deliveries run in the agent's **main lane**
   (`taskId === null`, "its own chat, with its channel and messaging work"). `nextQueued` returns
   nothing while that lane is active. Each lane runs one turn at a time.

Upstream issue #5261 proposes changing only gate 1. That alone does not give parallel turns: the
second channel's delivery still waits in the main lane (gate 3), and `busy` (gate 2) still reports
the agent as busy.

## What a real change needs

- A lane per channel context: channel deliveries carry a lane key (channel thread id) instead of the
  main lane, the way `start_task` threads already have their own lanes.
- `workingSnapshot` and the turn bookkeeping per lane for channel threads, not per agent.
- `busy` split into "main lane busy" and "this channel lane busy".
- Gate 1 scoped to the same channel; keep `CHANNEL_PARALLEL_LIMIT` and `resourcesConflict`
  (`browser`, `workspace:<path>`) for cross-channel clashes.
- Only for providers with `concurrentTurns: true`; others keep today's behavior.
- `mayDrain` (a channel assignment holds the agent's own chat) must stay correct.
- Restart recovery: persisted deliveries and assignments of old versions must load and resume.

## Risk

High. It changes persisted mailbox and assignment behavior that restart recovery reads, and the
upstream rule "migrations are irreversible" applies if any stored shape changes. A bug can strand
or duplicate deliveries in Biswanath's real data. Upstream has not accepted the idea (#5261 has no
maintainer reply), so we would carry the change alone through every upstream update.

## Options

- **A. Use more agents now (no code).** With 12 active assignments per channel (T-01), add
  copies of a busy role ("Developer 2", "Reviewer 2") to the channel. Each copy is its own lane.
  Cost: separate memory and instructions per copy.
- **B. Gate 1 only (small).** Lets a second channel's task be *assigned* while the agent works
  elsewhere; it then waits in the main lane. Little gain; not recommended.
- **C. Full per-channel lanes (large).** Several days of work, a full review by codex, an E2E
  script with two channels and one agent, restart-recovery fixtures, and data-safety review.

Recommendation: A now; C only if A is not enough after real use.
