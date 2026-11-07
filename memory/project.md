# This fork: stable facts

- 2026-11-08 [claude-cloud] Upstream: github.com/nightly-labs/openbot (PolyForm Noncommercial 1.0.0). Fork: github.com/CtrlAltElite007/openbot. `custom/main` started at upstream tag v0.64.0 (42f41285).
- 2026-11-08 [claude-cloud] Limits live in `packages/contracts/src/ipc-chat-channels.ts` (CHANNEL_PARALLEL_LIMIT, CHANNEL_ASSIGNMENT_LIMIT) and `src/backend/channel-replies.ts` (CHANNEL_REPLY_LIMIT). The scheduler that uses them is `src/backend/channel-service.ts` (`#waitsForWork`, `#waiterReady`).
- 2026-11-08 [claude-cloud] An agent still runs one main-lane turn at a time; that rule is separate from the channel limits (upstream issue #5261).
- 2026-11-08 [claude-cloud] `src/main/custom-build.ts` holds CUSTOM_BUILD. Every updater path must check it (normal start, newer-database recovery, `loadElectronUpdater`).
- 2026-11-08 [claude-cloud] Build on the Mac only (Electron + macOS parts): Bun 1.4.x, Node 24, `bun install --frozen-lockfile`, `bun run package` → `dist/mac-arm64/OpenBot.app`. Install with `~/OpenBot/Downloads/build-openbot-custom.sh` (backs up app and data first).
- 2026-11-08 [claude-cloud] The self-built app is ad-hoc signed: after install, macOS asks again for Screen Recording and Accessibility, and the keychain asks once (Always Allow).
- 2026-11-08 [claude-cloud] OpenBot needs an account sign-in (email code) before the workspace opens. A throwaway test profile is signed out, so UI and channel tests need Biswanath to sign it in.
- 2026-11-08 [claude-cloud] Repo rules (`AGENTS.md`): user-facing text comes from i18n keys in all 15 catalogs (`bun run i18n:check`); each PR adds `changelog.d/<branch>.md`; unit tests only for protected areas, otherwise E2E scripts under `scripts/`; run only narrow checks locally.
- 2026-11-08 [codex, PR #1] Upstream workflows on the fork can fail or run on schedules; this does not block merges.
- 2026-11-08 [claude-cloud] Cloud sessions cannot use GitHub GraphQL (`gh pr create` fails); use `gh api repos/.../pulls`.
- 2026-11-08 [claude-cloud] On GitHub, any comment starting with `@codex` starts a Codex cloud run. Start other comments with your agent ID.
