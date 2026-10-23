# V03.7 — native disabled reads for three HTML controls

Executor design under the user's autonomous task→checks→local-commit instruction;
not a newly user-approved product matrix. Base c699b25/main, scope-review-1.
Local date2026-10-24; retained run timestamps use UTC2026-10-23.

## Intent and boundary

Original it-tools textarea source question cannot enter inspection: native
identifySelection and observeDeep accept disabled only on HTML buttons. Exact68
actually passed four setup checks then refused that selected textarea. Keep that
FAIL and all earlier evidence. This bounded prerequisite supports native reflected
disabled on **button, input, textarea**. It does not complete C09 or full V03.

The value is the element's own native reflected disabled attribute, including an
empty string or the literal attribute value "false". It is not effective
interactability: a containing disabled fieldset, inert, CSS, ARIA or application
logic may independently block use. No inferred parent/default/library ownership.
All other element/namespace kinds and unavailable identities stay unsupported.
No writes, evaluator, getter re-execution, SDK, redesign, publication or other repo.

## Approaches and executor decision

1. Read .disabled or add more MAIN-world prototype getter calls. Small code change,
   but overridden instance/prototype/constructor access can run application code.
   Rejected: violates the observation constraint.
2. Read native DOM attributes for the three exact HTML nodeName/localName pairs,
   pass the measured Boolean into the existing trace helper, and revalidate native
   document/node/property/value afterward. Chosen: no disabled getter invocation,
   namespace/identity checks remain explicit. Costs extra native metadata reads.
3. Substitute a button in the independent case. Rejected: changes the registered
   question instead of proving its original textarea.

Use the same native DOM queue as picker metadata readers. createBrowserEngine's
optional readDOM callback coordinates observeDeep's before/after acquisitions;
its own raw identifySelection stays inert so runtime's existing queue wrapper
does not nest/deadlock. Default engine instances own a native DOM queue too.
Native CSS attribute presence uses the null namespace, avoiding CDP flattened
attribute-name ambiguity for setAttributeNS lookalikes; :disabled is not used.
See [Selectors4 attribute namespaces](https://www.w3.org/TR/selectors-4/#attribute-namespaces).
Text observation stays unchanged. Disabled before/after mismatch returns Stale
without a known value/target trace; unsupported input returns a bounded reason.
Runtime rejects unavailable disabled identity before claiming a changed picker
target, without pretending to distinguish removal from unsupported namespace.

## Proof and limits

RED source controls cover native Boolean presence, all three kinds, non-HTML/
custom/other native controls, malformed metadata, document/node/value replacement,
zero getter/constructor execution and no borrowed stale trace. Original button,
text, whitespace and lifecycle criteria remain.

New exact Atom69/UI2 requires full source checks, installed types2/package9 and
an agent-operated native synthetic catalogue. Catalogue checks readonly Basic,
actual picker on enabled/disabled controls, distinct repeated nodes, fieldset
own-property false, unsupported targets, zero poisoned getter invocations and
zero application action from selection. No app CDP sidecar; Atom owns attachment.
Synthetic evidence qualifies only those cases, not the independent source route.

Then register only new Atom identity in the unchanged original Vue question,
reuse exact plugin5/helper5 and the original498 immutable/497working+one generated
file. Do not reinstall original dependencies. Source needs disabled=false on the
exact selected marker, original SFC/digest, an actual selected scalar read and
exact IDE range. Ordinary input/baseline/export/reader remain their own gates.
If another concrete boundary fails, retain it and select one next dependency;
do not grow this into all V03/C09 tasks or swap in a nearby value/component.

Use ONE final whole-increment review and at most one tested correction pass,
no re-review. Source/native/UI/human/production/installation claims stay separate.
The exact catalogue and implementation are executor decisions; the user's
autonomous instruction opts out of repeated design/implementation approvals.

References retrieved via Context7 /mdn/content: native textarea disabled reflects
its attribute, while a disabled fieldset can make a descendant unusable even with
its .disabled false. See [textarea disabled](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTextAreaElement/disabled)
and [fieldset disabled](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFieldSetElement/disabled).
