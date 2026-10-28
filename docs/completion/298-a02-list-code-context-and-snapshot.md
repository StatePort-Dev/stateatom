# A02 — owned code-context composition and public snapshot protocol

28 October2026, continues Task3 afterf59d611. Source increment only; no new browser
qualification, package or complete-field claim.

`list-field-code.mjs` composes the existing actual controlled-browser witness with
current owned list compilation/effect capabilities. It reuses only the existing
closed-code predicate, not the old React18/Query effect or occurrence proof. Raw
browser views, page flags, copied compilation/effect DTOs and synthetic witness
objects cannot issue a context. The predicate requires the exact bundle, native
frame/context, armed complete journal, no pending/lost source and no unapproved
MAIN script. Context/source/native checks run again during verification. Results
remain conditional: the journal must arrive through the trusted extension/helper
route; actual selection/occurrence proof is separate.

`list-field-runtime.mjs` adapts the same private collector to the existing public
version1 `snapshot(instance, property, element)` protocol and native acquisition
flag. Snapshot returns scoped list facts; it has no helper authority and always
keeps fullPath=false/fieldOwnershipUnknown. Only text is eligible. Stop/invalidate
revoke the collector; missing current selection and other properties remain
Unknown/Stale. No raw application row or collector API is exposed in the global
runtime. The compiler now includes this adapter; installed plugin/bridge/UI/export
wiring and actual native operation remain pending.

An explicit JSON serialization control exposed a bug in the first adapter draft:
refusing Object.prototype.toJSON was insufficient when the refusal object itself
inherited that hook. The corrected refusal is a minimal null-prototype DTO with
no nested arrays/objects. The original accessor is neither read nor called,
including when the returned refusal is serialized. No application behavior is
changed to obtain an origin proof.

## Verification

Logs under `.artifacts/a02/selected-list-integration/2026-10-28/`:
- `code-context-red.log`: missing API. `code-context-affected.log`:24PASS;
  final extra native-context recheck plus original code controls11PASS in
  `code-context-final.log`. Positive interval inputs are authored protocol data,
  **not an actual issued native context**. Forged-witness controls are negative.
- `public-runtime-red.log`: missing adapter. `public-runtime-green.log`:29PASS;
  `public-runtime-serialization-red.log` preserves the real inherited hook failure;
  corrected `public-runtime-serialization-green.log`:29PASS.
- Combined `public-code-affected.log`:**66PASS,0fail/cancel/skip,22705.558854ms**.
  Includes actual compiler/effect revocation checks and original selected-reference
  controls. No new full-suite pass is claimed; shared294 failures remain recorded.

Retained compilation `.artifacts/a02/selected-list-compilation/2026-10-28T17-10-34-955Z/`:
38inputs, JS1249724bytes,
SHA256`f6149e1f0885e7648e3c576dac4de9a4be0884cfe327fca34f1b8e5486d71131`;
manifest digest`e9adc91232b3123b72dce654d0b2c3073f5439a39ab7e47f3606611fe540a1a4`.
Compared with297, original inputs change only by the new reviewed adapter and its
generated bootstrap import/installation. The effect derivation now describes the
bounded metadata snapshot and lifecycle methods as well as the native tap.

Next: actual trusted bridge/journal routing and helper occurrence verification,
then the separately frozen native matrix and held-out account. The native code
context's positive issuance and public snapshot's real browser path are still
unexecuted. Task3, wholeA02 and whole21/29 remain unchanged. Concurrent UI changes
and their reviews are separate; no publication/SDK/other-repository work.
