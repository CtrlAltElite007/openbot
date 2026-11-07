# Shared team memory

Long-lived facts that every agent (claude-cloud, claude-cli, codex, codex-cloud via AGENTS.md) needs
across sessions. Each tool also has its own private memory; this folder is what they share.

**This repo is public.** Never write secrets, tokens, email codes, personal data, or anything about
Biswanath's employer, work repos or other private projects here. Only this fork and his general
working preferences.

| File | Holds |
|---|---|
| `preferences.md` | How Biswanath wants agents to work and report |
| `decisions.md` | Decisions already made, with date and who decided. Do not reopen without a new reason |
| `project.md` | Stable facts about this fork: branches, build, limits, known traps |

## Rules
- Read all three files at the start of every session, after `PROTOCOL.md`.
- Add a fact when Biswanath states it, or when a decision is made. One line per fact, with the date
  and source: `- 2026-11-08 [biswanath] ...` or `- 2026-11-08 [codex, PR #7] ...`.
- Do not add guesses, task status (that goes in `STATUS.md`), or chat (that goes in `LOG.md`).
- Change a line only when it is wrong or replaced; keep the old meaning in the new line
  ("... (was X until 2026-11-08)"). Never delete another agent's line without a reason in `LOG.md`.
- Pull before editing, push right after, as for `STATUS.md`.
- When your own tool's private memory learns something that belongs here, copy it here too.
