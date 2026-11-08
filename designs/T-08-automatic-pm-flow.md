# T-08: Automatic PM workflow

Owner: codex. User request: 2026-11-08. Status: implementation and verification pending.

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

## Current evidence and limits

The local bridge already has explicit docs/code/critical options. Its 46 tests passed in the prior review, and the files still match that reviewed baseline. The default remains critical. Direct PM chats do not yet have verified automatic flow selection. Status omits the tier despite the README claim. These are remaining work, not delivered behavior.

The installed custom OpenBot build is custom/main 64170898, with channel limits 12/40/6. Those scheduler limits are separate from PM workflow selection. Raising them does not change existing task instructions or prove faster completion.

## Delivery record

Record exact changed files/revisions, checks, independent review, activation, rollback path and remaining gaps here before marking this ready. Do not call prompt guidance a mechanical enforcement gate or a synthetic test proof of live model behavior.
