# T-08: Automatic PM workflow

Owner: codex. User request: 2026-11-08. Status: reviewed, activated locally and verified; user acceptance pending.

## Requested behavior

The Project Manager selects the required workflow for a new task without asking the user to choose a tier. The same policy applies to bridge requests and direct PM chats. Select from the actual scope and required actions, not isolated keywords. An explanation of authentication is not itself an authentication change.

| Flow | Scope | Required owners and checks |
|---|---|---|
| docs | Documentation, research or analysis without product/runtime changes | One owner, then a quick review by a different agent against the request. No separate QA by default. |
| code | Ordinary product changes that do not affect a critical boundary | Developer behavior checks and independent code review. UI changes include visible behavior checks. No separate QA by default. |
| critical | Auth, credentials, secrets, security boundaries, storage, migrations, updates, deployment, destructive operations, or unresolved material risk | Separate implementation, independent review and independent QA; exact candidate and required failure/compatibility checks. |

Use the highest applicable flow for mixed work. Explain the selection briefly. Explicit user requirements and repository acceptance gates still apply; automatic selection cannot remove a requested independent QA check or grant permission to deploy, change permissions or modify live data. A simple answer or status check does not need a new engineering assignment chain.

If new evidence raises the risk, upgrade the existing workflow before affected changes. Keep task identity, completed evidence and owners where possible. Do not resend a task or create a second parent only to change its flow. Existing saved requests keep their exact message, identity and prior review requirements.

## Acceptance checks

| Requirement | Observable check |
|---|---|
| Automatic selection | New bridge request without a tier and new direct PM request both select docs/code/critical with a short reason; no user tier selection required. |
| Correct scope | Cases cover docs-only work, ordinary code, authentication/storage changes, mixed scope, ambiguous work, and a docs request that mentions sensitive terms without changing them. |
| Required gates | A code request with explicit QA retains QA; higher-priority repository checks remain. No expanded permissions or release actions from a selected flow. |
| Scope escalation | A low-risk task that discovers storage/auth impact upgrades before those changes, without duplicate dispatch or loss of evidence. |
| Compatibility | Saved pre-tier and explicit-tier requests replay without sending again; changed content or an explicit conflicting tier still fails. Existing in-flight work is not rewritten. |
| Reporting | Dispatch/status distinguish the requested selection mode from the PM's observed chosen flow; no invented selected-flow claim. |
| Failures and diagnostics | Invalid options, missing/unreadable policy, corrupt state, transport failure and uncertain dispatch fail with safe reason/stage/correlation. No raw brief, credential or exception text in normal diagnostics. |
| Direct PM activation | Supported instruction update is reversible and preserves other PM instructions, identity, model and permissions. Verify a fresh direct chat turn receives and follows it. |
| App verification | Use computer use on a disposable dist instance for changed app behavior. If only bridge/instructions change, verify that exact configuration and disclose that no app binary change was needed. |
| Efficiency | Compare actual assignment/role counts for representative small tasks with the previous full flow. Report timings only when measured under comparable conditions. |

## Delivered behavior and evidence

Activated 2026-11-08 by codex at the user's request. New bridge requests default to auto. The PM's persistent Instructions contain the same canonical policy, so new direct PM and channel turns use it. Outside the managed policy block, only the old unconditional separate-QA sentence changed. No app binary, schema, model, provider or permission change was needed.

- Installed bridge tests: 52 passed, 0 failed. Replay, concurrent dispatch, policy failures, safe errors and reported-flow provenance are covered. Legacy and explicit-tier briefs are byte-identical to the previous version.
- Independent source review: approved; 7 focused behavior checks passed.
- Independent native integration: 16 passed through real AgentService, SQLite and instruction-file service with a fake provider. Tests cover read/save, stale-save refusal, new-turn policy reload and preserved public history. Disposable processes/profile were cleaned.
- Real PM direct-chat acceptance: 10 synthetic cases passed in a completed native turn, observed through computer use. Correct docs/code/critical choices, mixed and uncertain scope, explicit QA, in-place escalation, old-task compatibility and status-only behavior were checked. No engineering assignment chain was started by this check.
- Bridge README and Codex bridge skill now describe auto mode and compatibility. Skill validator passed.

The selection is PM instruction-based judgment, not a mechanical review gate. The direct test verifies those ten choices; it does not establish every future decision. No full live delegated workload or before/after wall-time benchmark was run. Do not claim a measured speed percentage.

The installed custom OpenBot build remains custom/main 64170898, with channel limits 12/40/6. Scheduler limits are separate from PM workflow selection. Existing tasks retain their original requirements.

## Initial delivered files (policy v1)

| File | SHA-256 |
|---|---|
| PM_FLOW_POLICY.md | b5aac708c8cf470c233ce6e60aa899ec0b909edec607d4c40d01c617212883a3 |
| pm_workflow.py | 7fa0494bfef86d2d683b90fac5a2fdb9705fdff6e66b94cfc30053a91d8facc2 |
| openbot_bridge.py | 5d7bd186dbb5865e88543b9d3d1170de7141ee61e95a13c92b2cef52988e1cc7 |
| PM persistent Instructions | b5c9ea408f21482eafd7768e8fcb950266350133f8357c3170aa19fbca6001fb |

Local bridge: `~/OpenBot/Bridge`. Evidence and rollback notes: `~/OpenBot/Bridge/PM_FLOW_ACCEPTANCE.md`. Private originals are backed up under `~/OpenBot/Bridge/.backup-T-08-auto-20261108T102445Z`. This is a reviewed local bridge/instruction deployment, not an app-code PR or a new custom/main merge. Restore saved files/instructions and use a fresh native direct turn for rollback; preserve request state and later edits.

## Existing-task amendment (policy v2, 2026-11-08)

The user explicitly authorized applying the faster flow to existing tasks while keeping necessary tests and review and removing unnecessary repeated QA. The installed policy and PM Instructions now contain that dated amendment. A completed native direct PM turn confirmed dispositions for four unfinished PM tasks. Their original task JSON snapshots remain unchanged: IDs, parents, owners, counts, states and original messages are preserved.

Status and evidence-only coordination do not start new engineering/QA chains. Critical engineering work retains necessary independent review, QA and final acceptance. Reuse a completed check only if the relevant candidate, dependencies, configuration and execution environment match and it covers the current requirement. Recheck changed behavior, affected callers and unresolved failures; run broad checks for justified integration impact or required final acceptance. Consolidate findings into one handoff rather than repeated full reviews for each subtask.

The amendment applies at next continuation. It does not resume, cancel, reset or complete existing tasks, and does not waive stopped-task recovery conditions. No wall-time benchmark is claimed. Installed bridge52 checks and skill validation still pass. Private task identities and replies stay local.

Current policy SHA256: `c9277da23e1c08c18ecbfd2c6fcbd723fc328b9a18931ca0a031c57751a869ae`. Current PM Instructions SHA256: `ad32e6febe38bfac24396f0e70252a3c83262f2889fe91ec2fa039eb4ba161c1`. Python code remains unchanged from the initial delivery. Backup: `~/OpenBot/Bridge/.backup-existing-flow-20261108T110623Z`. Local activation/rollback record is appended to `~/OpenBot/Bridge/PM_FLOW_ACCEPTANCE.md`.
