# Compiler-input binding acquisition implementation plan

> Execute inline under the autonomous roadmap instruction; no commit/publication.

**Goal:** assess exact compiler-input → compiled-byte correspondence for P2/P1.
**Spec:** [bounded acquisition](../specs/2026-10-18-compiler-input-binding.md).
**Architecture:** original Node metadata model; separate pinned Vite wrappers and
native harness reuse existing compiled inventory and browser acquisition. No new
resolver, page expression execution or product bridge endpoint.

- [x] RED/green model controls for exact pipeline/stage/result identity, workspace
  digest, inert footer, full compiled bytes, contexts, cache, invalidation/budgets.
- [x] Wrap actual client environment/plugin container/module result registration
  in separate native acquisition; restore hooks on cleanup and preserve errors.
- [x] Run P2/P1 plus original semantic controls off/on and native substitution,
  source-stage mismatch, missing dependency record and cache/invalidation cases.
- [x] Read-only review, focused/full tests/build, unchanged historical hashes;
  document commands, exact limited result and remaining trust/effect gate.


Recorded result: root 343 tests/build, focused 23 controls, native 9 checks PASS.
Retained failures include graph clone laundering and native warmup/HTTP coalescence.
Exact bounded claim and next effect premise are in the compiler-input checkpoint;
fullPath/source equivalence/effects remain false or Unknown. Clean-source successor
verification is recorded there after completion.
