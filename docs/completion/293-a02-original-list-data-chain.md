# A02 — original row and native-array data chain

28 October 2026. Continues Task3 after a9ac9a9, with independent UI checkpoint
bc5bf5c present in the shared checkout. This is a source/protocol checkpoint, not
complete ownership, public integration or native/package qualification.

The finite source admission now returns exact original source ranges for ordinary
row literals, empty list seeds and native-array call sites. The three existing
field/prop compilers optionally return their AST so the new data transformation
can compose on original coordinates without reparsing generated code. Default
compiler APIs and the default native collector remain unchanged.

The new compiler observes the already-evaluated primitive initializers, original
row spreads, completed objects, original empty arrays, original method/receiver,
native callback item/index/receiver and original callback return. It calls the
original method through captured Reflect.apply; it does not add a callback or
method invocation wrapper. Unsupported source returns its original bytes. Chained
calls sharing a start position are processed inside out using the full range.

The private recorder keeps weak identities and field-definition metadata, never
serialized field values or additional application field/array-slot reads. It
matches actual captured native method identities and callback inputs to prior
construction records. Conditional original membership requires one unique row
reference. Map results, aborted calls, missing references, unexpected callback
inputs, changed native prototype descriptors and Stop cannot supply a path.
A callback capability is consumed synchronously by the original prop-transfer
recorder and later joined to the exact current selected state/props/row chain;
it does not require retaining a discarded JSX element.

**This still does not prove current ownership.** Construction receipts depend on
complete source/no-write/code premises: for example an own array constructor or
an intervening unobserved alias write is not ruled out by callback observation.
No arbitrary object reflection was added to pretend otherwise. Results retain
`currentMembership: Unknown/Unsupported`, `fieldOwnership: Unknown/Unsupported`
and `fullPath: false`. The optional selected-data API is not enabled by the public
profile. A page-supplied object/boolean is not an ownership certificate.

## Verification

Logs: `.artifacts/a02/selected-list-integration/2026-10-28/task3-data/`.

- New compiler/recorder/collector tests were run RED before their implementation.
  The first receipt run had 16PASS/1FAIL: the inner concat disappeared when two
  calls shared a start position. Full start/end ordering fixed the same control;
  corrected compiler+receipt run17PASS.
- A further RED case reproduced a completed callback falsely surviving a failed
  result construction (custom species returning a non-array). Completion now
  requires successful result construction. A thrown later map iteration also
  cannot authorize an earlier yielded callback.
- A RED telemetry control reproduced an inherited array-slot getter on an extra
  field event. Explicit private bounds avoid that read; weak-reference loss and
  late deref replacement also retain refusal/captured-method behavior.
- Actual retained App/reducer/Main/Footer source recipes compose on the original
  admission ranges and compile successfully; this is not an actual React run.
- Selected native-shaped protocol tests cover changed and same-value writes,
  missing data, wrong props/current ancestor and Stop. These authored native
  objects are protocol tests, not installed React evidence.
- Affected command146PASS,0fail/cancel/skip (`affected.log`).
- The existing virtual dependency build first failed on the new unresolved runtime
  import, then passed after adding its owned virtual route and packaging source
  manifest entry. The old first-read builder's plugin and self pins were refreshed
  for that routing-only plugin delta; its old effect argument was not extended.
- Full `npm test`:6263PASS,0fail/cancel/skip,207216.477856ms,exit0
  (`full.log`). This is the shared current source checkout, not a packaged candidate.

No new browser run, package/version, official host intake, model call, publication
or old experiment retry. Case290/291 remains scoped to its earlier read/write-host
implementation. One final whole-integration review stays pending; no per-checkpoint
review was substituted. Active performance281 and macOS287 decisions are unchanged.

Next dependency: finish the helper-owned source/effect and complete code-interval
premises, then enable and qualify the full public/official/export path under282.
Whole21/29 and A02 remain open.
