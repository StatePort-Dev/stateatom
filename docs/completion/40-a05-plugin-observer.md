# A05.3a — existing plugin and observer integration

This bounded source/installed-plugin increment is complete. Mandatory A05 stays
in progress; Atom runtime/Actions UI integration is the next A05.3b slice.
BASE6a61c8a, dirty current source; no Atom/UI package or browser permission changed.
[Plan](../superpowers/plans/2026-10-21-a05-plugin-observer.md).

## Actual change

The existing opt-in plugin/observer now accepts disabled-by-default actionTrace.
Original function candidates are prepared BEFORE property traversal and installed
AFTER scope insertion, so generated capture thunks never become action sites.
Original file identity joins digest/offset in site IDs, preventing identical files
from merging. JS/TS/JSX and original Vue setup function spans use original source
offsets/full-SFC digests, not generated compiler coordinates. Inline template and
unsupported callbacks retain their boundaries.

Compiler site registration, availability, private Event collection and its snapshot
belong to the existing observer. No extra public global, SDK or property-producer
claim is added. Collection is lazy and explicitly armed; invalidation/stop/later
source registration release it. Matching active observers cannot switch modes.
Browser intrinsics are captured before application startup, with private indexed
catalog/snapshot operations avoiding later Array iterator/species hooks. Source
getters are refused, catalog overflow fails closed. Instrumented-page evidence
remains separate from hostile-page attestation and complete listener/async effects.

The local open plugin candidate is0.1.0-candidate.20261021.1. The packer copies the
canonical core/runtime dependencies and records them in its source manifest;
generated copies remain ignored. Exact14-file archive consumer verified. Existing
Atom `.6` archives and all older evidence remain unchanged. A new helper VSIX is
prepared by the existing command but fresh installed IDE acceptance is not inferred.

## Actual checks

- New RED4FAIL before implementation: file-ID collision, missing original-node
  integration, Vue original span and observer availability. Final focused27PASS:
  `node --test --test-isolation=none tests/action-observation.test.mjs tests/engine/action-transform.test.mjs tests/engine/action-plugin.test.mjs tests/engine/plugin.test.mjs`.
- Three representative existing default compiler outputs remain BYTE IDENTICAL
  to the pre-edit checkpoint (plain/JSX/TS), actionTrace disabled.
- `npm test`: final1680PASS,0 fail/skipped. First full run1666PASS/14FAIL exposed
  three existing data-URL test loaders that rewrote only two prior relative imports.
  Add the actual new action-observer import to those loaders; all original field/
  getter/proxy/entry/operand/exception/retention assertions remain unchanged.
- `npm run build:extensions`:PASS, existing CJS/import.meta warnings retained.
- `npm run pack:development`: exact local artifact:
  .artifacts/development/2026-10-21T04-00-48-663Z/handoff.json.
  Extracted/hash-checked under its own consumer/node_modules/@stateport/vite-plugin;
  no network install or existing app/repository mutation. consumer1.json records
  exact archive and14 payload files, copied runtime/core and root dependency lock.
- `node experiments/actions/plugin-boundary.mjs .artifacts/development/2026-10-21T04-00-48-663Z/consumer/node_modules/@stateport/vite-plugin/dist/engine/plugin.mjs`:
  13PASS, .artifacts/a05/plugin-native/2026-10-21T04-04-06-518Z/results.json,
  errors[], current inputs/consumer/workspace maps unchanged. ACTUAL consumed plugin,
  Vite7.3.7, Vue/compiler3.5.44 and existing observer, three owned Chrome153 profiles.
  Original22 semantic/control scenarios keep their predicates; additional real Vue
  method matches original SFC digest/inline range and real later compiled source
  registration invalidates an armed trace.22 actual body entries/matching leaves
  across JS/Vue, no substituted runtime. Synthetic control UI is not Atom UI.
- `npm run verify:first-read-profile`:4 original acquisition/refusal checks PASS,
  .runtime/first-profile-runs/2026-10-21T04-05-21-627Z/results.json. Only compiler/plugin
  pins, the exact new compiler-module pin and normalized builder self hash changed.
  Action Trace is explicitly excluded from that controlled profile; original
  argument/threshold/refusal predicates and finite/HTTP/full-path limits unchanged.
- `node .artifacts/a05/plugin-integration/verify.mjs`:PASS; verification1.json checks
  exact consumer/current source/actual compiled module bytes, original source catalog,
  matched body records, semantic/cleanup controls, logs and finite current inputs.
  Initial verifier incorrectly expected metadata returned by Vite's code/map-only
  transform hook. Its failed script is retained. The corrected verifier extracts
  the literal registration catalog from the already archived compiled AST (SFC
  parsed with the actual compiler), without app execution or another native run.
- `git diff --check`:PASS before commit. Logs/default checkpoint/consumer receipt
  under .artifacts/a05/plugin-integration/. Old failures and A05.1/A05.2 remain frozen.

## Remaining boundary

The installed Atom inspector still cannot arm/read/cancel/clear this mechanism.
No permissions/production support, report format, runtime source-binding execution
promotion or general async causality follows from this source/consumer evidence.
Next bounded item A05.3b: existing runtime selected-context/read-only operations,
same evidence graph and Arm/Cancel/Clear Actions controls with fresh packed UI proof.
Original A05 full matrix/review, production/performance boundaries, A02/L02 and
broader release gates stay open. No independent human is an implementation blocker.
