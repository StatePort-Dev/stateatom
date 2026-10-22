# P04.1 Observation Foundation Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline, one bounded task/check/local commit at a time. Main only, no subagent implementation. ONE whole-P04 review at parent acceptance.

**Goal:** A bounded privacy-preserving source ledger ready for explicit runtime admission.
**Architecture:** Inert private controller, immutable data snapshots and occurrence tokens; no browser authority or separate global store. Runtime/format/UI integration is excluded from this slice.
**Tech Stack:** Existing browser JavaScript, URL/TextEncoder/crypto; Node24 node:test. No new dependency.
**Spec:** ../specs/2026-10-22-p04-observation-foundation.md; completion06 P04 and U06 H07-H09.

## Global Constraints

- Exact context, no prehistory/causal inference, getters or user-expression evaluation.
-64 records/32 pending/65536 UTF8 bytes/120000ms; only lower configurable limits,
 bytes minimum8192,4096 control headroom. No bodies/query/path/source/form text.
- No Chrome/fetch/timers/storage/active-window restore or public API/package change.
- Existing3-tab/5MB runtime integration and strict handoff profiles remain separate.
- Human optional; no SDK/publication/other repository/redesign.18/29 remains unchanged.

## Review Focus

- Repeated URLs or reused native IDs cannot merge distinct occurrence tokens.
- Pre-start response/late completion cannot fill missing history or rewrite Stop.
- Secret-bearing error/URL/text input never survives projection or invokes getters.
- Foreign frame/document/node and imported tokens cannot become current scope.
- Budget/clock failure must leave bounded, truthful partial records and usable clear.

### Task 1: Pure ledger and source proof

Files: create core/production-observations.mjs and tests/production-observations.test.mjs;
record docs/completion/86-p04-observation-foundation.md; update task index/status/roadmap.

Interfaces: factory and methods exactly as spec. Snapshot schema
stateatom.production-observation/1, exportable/executable false; status not-recorded /
recording / stopped / deleted. Identity/selected target stay separate from window events.

- [x] Write source tests before implementation: inert no-data start, closed lifecycle,
 request occurrence/token pairs, code/status/timing, errors/checkpoints, privacy/getters,
 all budgets/lifecycle/foreign context and immutable frozen copies. Save RED; missing
 module/export is the initial missing-foundation result, not a native failure.
- [x] Implement only factory/projections and synchronous bounded ledger. Preserve
 response status separately from transport completion; pending on Stop stays unknown.
 Gate admission by explicit start/current context/time; closed stop/drop reasons.
- [x] Run focused GREEN and full npm test. Keep controls/failed attempts unchanged.
 Verify diff and current47 issued source/package/install/hosts unchanged; no repack.
- [x] Record actual scope/results, keep P04/C07 open and18/29. Locally commit foundation.
 Next bounded P04.2: authenticated runtime lifecycle/admission/native event/clock mapping,
 sharing existing cache bounds; design its concrete integration before code.


Actual source39/full2178 PASS; unchanged issued47/current native payload verified.
This task has no native/runtime H07-H09 acceptance. Next P04.2 as recorded in86.
