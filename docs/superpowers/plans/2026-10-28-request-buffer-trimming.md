# V02.31 source implementation plan

> Inline superpowers:executing-plans; ONE final bounded source review.

Goal: same request retention, at most one serialization per nonempty cap and none
for empty cap. Architecture/spec: ../specs/2026-10-28-request-buffer-trimming-design.md.

- [ ] Register exact runtime/current86source+archive/current10raw/history/dist inputs;
  preserve before-source; no changes to historical campaigns/cases/readers.
- [ ] New actual-cap source controls first; observe operation-count RED while old
  semantic controls pass. No browser, server, model or fake native event claims.
- [ ] One private JSON-text boundary scanner and cap integration, preserving exact
  limits/identity/time/count/exception behavior for private JSON records.
- [ ] Focused source/runtime privacy/input/history checks; full npm test sequential,
  syntax/diff and explicit input-delta verification. No package/build/native run.
- [ ] Local source commit; ONE final source/evidence review, at most one testedI/C
  correction, no rereview. Preserve logs/own reviewed archive and route one nextitem.

Review focus: string escapes/nested punctuation/UTF16/off-by-one, exact shortest
prefix deletion and row identity, no duplicate serialization/no mutable cache,
unchanged capture/authority/lifecycle. Old84MISS/50native/32INCOMPLETE unchanged.
No unsupported target-pass/speedup/cause/full-task credit. Until09:00 Mauritius Oct28.
