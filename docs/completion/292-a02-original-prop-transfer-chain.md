# A02 — original App/Main/Item reference transfers

28 October 2026. Continues integration plan Task2 from e11b304. Source/runtime
reference integration is complete within the boundaries below; Task3 premises and
Task4 packaged native qualification remain open. No fullA02/release claim.

The new compiler observes already-produced local useReducer bindings, original
component parameters (including renamed props), original JSX prop operands and
original inline map callback row/receiver references. It preserves the original
callback/function/JSX execution; input getter is not reread. Mutable, default,
dynamic/eval, duplicate/spread, opaque output and deferred unsupported shapes
refuse. It does not identify a native array implementation from `.map` spelling.

The private collector consumes actual native JSX element→props at creation and
joins each incoming props/value to its exact original producer component frame.
Selected Item parameter/read is followed through Main's original row prop and
App's state prop to the exact current applied ancestor state/result/revision.
Producer props, function, Fiber and actual ancestor relationship must all match;
cloned props, different row, aborted/superseded frame or missing native parent do
not borrow the path. Same-node changed/same-value source controls have fresh write
revisions and both fresh producer frames. Stop invalidates lookup/registration.
No selector, index, label value or nearest component identifies the path.

**Observed reference transfers are not complete lineage.** Main's original map
callback row and receiver are recorded, but native-array membership/construction,
ordinary fields, exclusion of intervening alias writers and complete code interval
are still Unknown. Both combined APIs return fullPath=false. The getter control
can show an original read without granting ordinary-data or writer ownership.

Private mutable source/native frames now have null prototypes, private array
entries use captured defineProperty, and empty stacks never read inherited `-1`.
Five RED regressions reproduced added application prototype accessor calls before
this correction (two read-frame, three writer-frame cases). Corrected controls
avoid those extra calls without touching application objects or prototypes.

## Verification and scope

Logs under `.artifacts/a02/selected-list-integration/2026-10-28/`:
- Original prop/compiler RED2FAIL, then actual App/Main + renamed source and callback
  count/row identity controls10PASS. Getter count remains one.
- Transfer recorder RED3FAIL, then original compiled callback/native-props controls PASS.
- Selected whole reference path RED4FAIL, then current state→props→parameter/read
  controls PASS, including wrong sender props and missing native parent.
- Five private-prototype regressions RED then GREEN.
- Final affected compiler/collector/vendor/forwarding/virtual-route set146PASS.
- Full `npm test`: transfers-full.log **6212PASS,0fail/cancel/skip**,
  199485.596671ms,exit0. Shared checkout contains concurrent Atom UI edits; count is
  this execution, not a packaged immutable candidate certificate.
- After the full run, added repeated changed/same-value transfer fixture initially
  had a duplicate local `update` name (test syntax error, no product failure). Fixed
  test binding; focused latest five path checks PASS in list-transfers-repeat-fixed.log.
  No production source changed after the full suite.

No new native run was made for this transfer increment. The actual Chromium
case290/291 remains scoped to the earlier e11b304 read/write-host mechanism, with
its failed original and corrected PASS retained unchanged. It is not automatically
promoted into evidence for current transfer matching or full alias/array authority.
No public switch, bundle/version/package, official host, UI/export or model change.
Independent human and macOS are not blockers; macOS remains unverified per287.

**Next ONE dependency step:** Task3 acquire original native-array membership and
ordinary row construction, then bind the admitted source/effect graph to a complete
owned code interval. Only that conjunction can authorize a complete selected-field
claim. Thereafter final public/official/export qualification and the single planned
whole-integration review. Whole21/29 remains; mandatory L02 usefulness also open.
