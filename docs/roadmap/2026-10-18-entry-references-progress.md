# Call-specific entry references and a native closure checkpoint

Bounded continuation of the [same-body closure result](2026-10-18-observer-closure-progress.md)
on dirty main above `bcde3d0f1572878df662db6bab79e65bc66dd6d0`. The question was
whether one original own-data member observation can retain its actual callee
reference and expose the captured clock without replay, getter invocation or a
debugger pause. This is an acquisition experiment, not product/UI integration.

## What is acquired

A declared post-transform probe inserts a private module-owned entry journal into
the actual observer member body. An entry retains its factory-owned frozen
api.member reference and page. The original property read still runs once. If
the original add call returns an observation, its existing node ID is associated
with that entry; a throwing getter has an entered record and no invented returned
node. No application receiver, key, callback or getter is replayed for inspection.
The imported product observer file is unchanged; the transformed probe is separate.

The native checkpoint starts with DOM.resolveNode and a declared synthetic own-data
DOM surface. Runtime.getProperties inspects own data slots with previews disabled;
accessors/proxies are rejected. Engine function locations and V8 scope references
expose the private journal and captured telemetryOps.now → clock reference. There
is no Runtime.evaluate, callFunctionOn, queryObjects, heap snapshot, instrumentation
breakpoint, application function call for extraction, or debugger pause. Only
synthetic setup controls and the application's original execution invoke functions.

The original P2 marker-selected retained dependency closure contains two member
observations: record.rules and record.rules.quota. Each is joined by its unique
returned node ID to one entry and that entry's actual function reference. The
record includes observer page, entry sequence, frame, context unique ID, native
script/location/digest and checkpoint identity/time. Both entry and callee page
must agree with the selected marker and root observer page. Original P1's retained
trace uses destructuring and contains no member node; its missing binding remains
explicit rather than borrowing P2 or a nearby event.

Two genuine factory instances have the same native member FunctionLocation but
different pages and entries. Location equality does not merge their occurrences.
The ordinary captured clock exposes no JS location; this is **not native Date.now
attestation**. A pre-bootstrap JS wrapper remains visible through the native closure
snapshot after the public clock is restored. A bound version has no direct JS
location yet still executes three declared synthetic calls/writes, changing quota
12 to 99 while the original value stays 12. Neither absence of a JS location nor
matching module content authorizes readonly.

Precise coverage is only a comparison control: it supplies executed source ranges
and counts without a function-object/event identity. It also disables optimized
execution and resets counters; no timing equivalence is claimed. These API
capabilities/limits follow the [official CDP schema](https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/js_protocol.json);
the V8 internal property names are tested only in the pinned Chromium, not a portable
browser contract.

## Boundaries and lifecycle

The entry journal is **instrumented evidence**, not an independent native entry
witness. Native reads verify referenced objects/locations at the later checkpoint;
they do not establish the complete earlier closure state, transitive effects or
readonly alias lifetime. The marker-selected dependency graph is retained mutable
page telemetry, not native causal/commit attestation. This experiment does not
promote it to source authority or prove a last DOM writer. No wrapper is stripped
or approved by the existing analyzer.

The journal retains at most 256 function-reference records and explicitly marks
overflow. Strong function references can retain closure graphs; 256 entries are
not a byte bound on those graphs. This prototype uses fresh disposable contexts
and releases its remote object group and browser/server after each mode. Product
adoption would require a separate lifetime/privacy/cleanup contract. No general
zero-effect or zero-retention-overhead claim is made.

Property acquisition has 768-request, 4 MiB response, 4,096-property, 16-scope and
2,000-map-entry budgets; the selected closure is capped at 120 nodes. Missing
dependencies, inactive/stale observer, entry loss, context destruction, changed
selection or unavailable native slots deny the link. Getter/proxy traps stay zero
in the actual native controls. A React form repaint changes the marker and rejects
the old checkpoint; navigation invalidates its native handles. Raw source bodies,
scope dumps, application receivers and remote object IDs do not enter results.

Readonly/current-field ancestry remain Unknown and fullPath:false. Original full
P2/P1 HTTP remains NOT MET; historical deep 0/6 and Vue PARTIAL limits are unchanged.
No new resolver, framework support, account change, publication or release occurs.

## Failures retained, not reclassified

Five initial unit REDs cover the absent entry mechanism. A first green attempt
shared a cached data-URL test module across cases; fresh per-test modules corrected
that harness isolation error. The node test command uses the repository's
--test-isolation=none setting; the first bare test child failed without diagnostics.

The first native attempt reused a DOM node ID after another DOM.getDocument call
invalidated it. A single document root per checkpoint fixed this. The second
compared random page UUIDs as semantic output and incorrectly required P1 to have
a member node. Only UUID normalization was added; source/target metadata and
semantic output remain compared. P1's absence was verified against the preserved
actual UI trace, not converted into a fabricated member success.

Read-only review found a real join bug: genuine observer B could store a target
under observer A's copied marker. Existing internal event/page checks accepted B.
The native entry-owner-red-20261018 run retained 12 passing preceding controls and
one incorrect Observed foreign binding. Three unit REDs plus a native foreign-marker
control now require marker, root observer, target node, event and callee pages to
agree. Independent review confirms the correction with 9/9 focused tests; the
reviewer did not edit files or run native/UI checks.

## Reproduction

```sh
node --test --test-isolation=none tests/observer-entries.test.mjs tests/observer-entry-owner.test.mjs
npm test
npm run build
INVOCATION_TAG=<unused> npm run verify:observer-entries
```

Native harnesses run sequentially, without another dev server. The previous
verify:observer-closure command and its 41 controls remain a separate regression
suite. The new native probe does not claim extension-panel UI interaction.

Nearest bounded task: assess transitive effect premises for one acquired P2 member
reference, starting with its actual captured telemetry helpers/intrinsics. Bind
the inventory to this entry/context/body checkpoint. Unknown builtin identity,
foreign metadata/proxies, missing history or transitive callbacks must deny
readonly. Lifetime/privacy cleanup remains a gate before any product integration;
do not implement a new resolver or declare the original full HTTP path complete.

## Final verification and evidence reuse

`INVOCATION_TAG=entry-references-reviewed-20261018 npm run verify:observer-entries`
passes **13 native checks**, stable source inputs, no harness/page errors and zero
Debugger.paused events. The ordinary checkpoint retains 20 entries from two
genuine factory instances and links two P2 member nodes; P1 has an explicit gap.
The bound-clock counterexample and all seven accessor/proxy/retention/lifecycle/
foreign-owner refusals are retained. Getter and proxy traps remain zero.

Final **384 unit tests** pass. The **9 focused controls** cover actual transformed
entry semantics and owner rejection, with retained REDs. Root build passes. Current
environment is Node 24.19.0, npm 11.17.0, Vite 7.1.9, React/ReactDOM 18.3.1 dev,
Playwright 1.63.0 and sandboxed Chromium 153.0.8010.12. The native probe uses no
extension, IDE or Desktop. Browser plugin unavailable; repository Playwright/CDP
is used as in the previous native probes.

This increment adds **no new panel UI claim**. All 82 compared core/browser/IDE/
product engine/fixture source files and all **34 build outputs** match the frozen
259-file product candidate. Its **26 actual panel/IDE/export/reader checks** and
ten exports are explicitly reused, not described as a fresh UI run. Likewise the
previous root short loop remains **20 PASS / 10 expected PARTIAL + 106 checks**;
it is not rerun for isolated probe files that the product does not import. Existing
resource-404/Vite warning limits remain as recorded in the preceding UI acceptance.

All **1,527 historical** and **241 original short-loop** hashes match again. The old
experiment and prior frozen candidates are unchanged. Package changes add a local
verification command, with no dependency/lockfile changes. No release, publication,
commit or push occurred. Unrelated docs/features work is preserved.

Final results and per-mode metadata are
`.runtime/invocation-probes/entry-references-reviewed-20261018/`; evidence-reuse.json
records versions, exact product/output comparison and original-history checks.
Earlier native runs and the explicit entry-owner-red-20261018 false positive remain
separate. Acquisition-only metadata is copied into a local hashed review allowlist;
no profiles, source bodies, scope dumps, credentials or arbitrary app objects enter
that allowlist. This is agent-operated evidence under the existing authorization.
