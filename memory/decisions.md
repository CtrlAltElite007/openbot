# Decisions

- 2026-11-08 [biswanath] Build OpenBot from source on a fork (CtrlAltElite007/openbot) instead of building a new orchestrator.
- 2026-11-08 [biswanath] The custom build replaces the installed /Applications/OpenBot.app and keeps the real data folder.
- 2026-11-08 [biswanath] Channel limits raised: 12 active assignments per channel, 40 automatic assignments per request, 6 member replies per request. The official updater stays off in the custom build.
- 2026-11-08 [biswanath] `custom/main` is the default branch and the only branch that is built. `main` mirrors upstream.
- 2026-11-08 [biswanath] One feature per `feature/*` branch, merged into `custom/main` by PR after codex review.
- 2026-11-08 [biswanath] PR #1 was merged before its bugs (#3, #4) were fixed, at his explicit instruction.
- 2026-11-08 [biswanath] No Anthropic API key, so no Claude Code GitHub Action. `@codex` on GitHub (Codex cloud, ChatGPT Plus) handles GitHub-triggered fixes.
- 2026-11-08 [biswanath] Team coordination lives on the `team/coordination` branch (PROTOCOL.md, STATUS.md, LOG.md, memory/).

- 2026-11-08 [biswanath] Finish automatic PM workflow selection for bridge requests and direct PM chats, test it and make it ready to use; update the docs. Existing task requirements remain; docs/code use lighter flows and critical work keeps full review/QA.
