# Product-owned compilation journal implementation plan

> Execute inline under the user's autonomous roadmap instruction.

**Goal:** expose product-owned compiled-code observations with exact limitations.
**Architecture:** bounded serializable CDP metadata/digest ledger, owned by extension;
independent selection snapshots through panel/export. No effect/source certificate.
**Spec:** [bounded journal](../specs/2026-10-18-product-code-journal.md).

## Tasks

- [x] Add a pure browser-compatible core model and RED/green controls: late history,
  context identities, failure/pending/source byte limits, epoch races, restart,
  strict output allowlist and credential-free URLs. Every result denies complete
  executable/writer history, source equivalence and fullPath.
- [x] Wire existing Debugger/Runtime events and lifecycle without new expression
  execution. Retain no bodies in storage; restore interrupts continuity. Unit-check
  extension-owned snapshot cannot be replaced by a page trace field.
- [x] Present independent compilation facts and explicit historical/newer status
  in the existing panel and passive export/reader. Imports remain data only.
- [x] Verify unit/build, separate actual UI positive/late/dynamic/fresh export checks,
  and affected browser-only/short-loop regressions; retain exact manifests.
- [x] Read-only review, document bounded result and remaining original P2/P1 gap.

No automatic commit, publication or account administration. The earlier React
candidate remains immutable; clean acceptance of this successor is separate.

Execution evidence is recorded in
[the bounded checkpoint](../../roadmap/2026-10-18-code-journal-progress.md).
The clean acceptance record is appended there after the immutable candidate run;
completion of this plan never marks the unchanged full-path milestone complete.
