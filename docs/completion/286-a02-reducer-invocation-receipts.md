# A02 — original reducer invocation and applied-write receipt prerequisite

28 October2026, base4debe58, approved282/autonomous remaining release execution.
This advances285's original field-site capture; it does not reopen native209/276.

## Implemented bounded source mechanism

- `reducer-field-writes.mjs` adds explicit `capture:'invocation'`; existing default
  site-only mode stays unchanged. Original reducer body has a private lexical
  source-frame token and an outer try/finally. Completed original object literals
  emit siteID + exact object through that frame. Original expressions execute once;
  original return/finally/throw behavior is preserved by the source controls.
- `reducer-call-frames.mjs` composes after the existing exact pinned React19.2.5
  derivative. Two original updateReducerImpl calls receive distinct opaque tokens;
  entry, completion or abort and existing ignored/applied events carry the exact
  token. A source grammar control is explicitly not admitted native execution.
- `reducer-write-receipts.mjs` is a private weak-reference recorder. A registered
  reducer/site, exact native input/action, its single source entry/exit, completed
  result and trusted adapter-supplied applied revision must match. Ignored/aborted,
  wrong-object, duplicate, weak-loss, delayed callback and capacity paths refuse.
  It returns site/call/revision IDs, never app values. State/result/action/rows are
  weakly held; internal bounds512calls/16active/2048writes/128percall/128applied
  are recorder safeguards, not Live product-policy decisions.

These modules are **not installed in the public plugin/runtime or package**. The
trusted adapter must eventually supply the actual native revision ID and stop on
HMR/unknown-code/lifecycle invalidation. This item does not authenticate callers,
prove current result membership or exclude outside writers. All receipt DTOs retain
currentMembership, fieldOwnership and selectedPropertyOrigin Unknown/fullPathfalse.
A historical write during an applied call is not yet a causal selected-field chain.

## Actual checks

Initial isolated Node test runner failed without useful per-case output; retained
red.log. Using the project's `--test-isolation=none` mode:20tests,1existing semantic
control PASS/19RED (framing absent and modules missing), red-source.log. Initial
implementation20PASS, green-initial.log. This corrects the progress-message count21.

Five additional integration/boundary tests gave24PASS/1FAIL (integration-red.log):
missing result/reducer weak references could match supplied undefined. Explicit
object/function presence and live original-reference guards fix it.

Affected command:
`node --test --test-isolation=none tests/engine/reducer-write-receipts.test.mjs tests/engine/reducer-field-writes.test.mjs tests/engine/react19-product-vendor.test.mjs tests/engine/react19-acquisition.test.mjs`
**79PASS**,0fail/cancel/skip,1267.327742ms (affected.log).

- Real retained reducer/constants executed in Node VM, with new source framing and
  deliberately synthetic native call grammar. Create + same-title update, each
  StrictMode-style ignored/applied pair, yield distinct original objects and call
  receipts. Ignored results cannot borrow applied credit. Revision IDs in this
  harness are explicitly synthetic; this is not actual React/committed-DOM proof.
- Renamed/restructured source fixed before implementation also produces exact
  identity receipts. Equal row values are not matching inputs.
- Exact retained ReactDOM bytes pass the existing SHA gate and the new two-site
  source recipe; no native execution or installed qualification inferred.
- App-object Proxy traps0 in direct recorder controls; original getter1 in source
  execution. Nested native calls stay separate; a second source entry in one native
  call and callbacks running after lexical source exit cannot borrow that frame.

Artifacts `.artifacts/a02/reducer-write-receipts/2026-10-28/` retain all logs.
Initial full `npm test`:6092PASS,0fail/cancel/skip,165087.825896ms,exit0
(full.log). One read-only review:0Critical/2Important/0Minor. Both findings were
reproduced (review-red.log:25PASS/3FAIL) and corrected in one pass:

1. Moving body-level function declarations into a try block could change hoisting
   and make valid source syntactically invalid. Invocation mode now refuses these
   declarations unchanged; original retained reducer and default site-only mode are
   unaffected. This is an explicit unsupported source form, not altered semantics.
2. Duplicate exit or unknown events after source exit could preserve a receipt.
   They now invalidate that frame. Delayed original write callbacks still receive
   no receipt; they do not borrow a later native frame.

Affected82PASS,0fail/cancel/skip,1400.934787ms (review-green.log). Final full source
`npm test`: **6095PASS,0fail/cancel/skip**,176679.465928ms,exit0
(review-full.log). No rereview/native repeat. Bounded prerequisite complete.

## Remaining release edge

Next establish the finite original App/Main/Item/Footer writer/alias admission and
row-to-selected-read/commit links, then integrate the complete bounded route into
public and official products. No source harness result upgrades old incomplete
native cases or makes fullA02 pass. Whole21/29 remains unchanged. Mac/normal-install
capability is separately requested; independent human acceptance is not a blocker.
