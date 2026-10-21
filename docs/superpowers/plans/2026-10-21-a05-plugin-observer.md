# A05.3a — existing plugin/observer integration

Execute inline on main, local commit after meaningful checks. Original A05.3 is
split into this bounded source integration and A05.3b runtime/Actions UI, so one
unlimited task does not mix compiler, permissions and UI. A05 mandatory acceptance
and all historical/native/source criteria remain unchanged. Deadline05:00UTC.

## Architecture

- Reuse the tested source transform's original AST eligibility and body installer.
  Prepare candidates BEFORE existing property instrumentation and install AFTER its
  traversal/scope insertion; do not reparse generated code as original source or
  instrument generated observer thunks. Default actionTrace=false must preserve
  representative existing compiler output bytes. IDs must include original file
  identity as well as digest/offset, so identical files cannot share one site.
- Add actionTrace:true to the existing opt-in Vite plugin and observer, disabled by
  default. Register bounded compiler-generated source sites at module initialization
  and lazily create the private Event collector only when explicitly armed. The
  existing observer owns availability, source sites, trace lifecycle and snapshot;
  no parallel public global or SDK is introduced. Existing property nodes remain
  their own evidence; action bodies do not become property producers/effects.
- Source digests/ranges come from original JS/TS/JSX or padded original Vue setup
  AST, never generated positions. Unresolved inline template handlers, wrapper/
  SyntheticEvent and other unsupported grammar remain explicit. Keep source-only
  Actions and registration distinct from actual body records.
- Observer invalidation/stop releases collector listeners/timers/Event/DOM refs;
  later source registration invalidates an in-flight trace. A matching active
  observer cannot silently switch actionTrace options. Current product context and
  read-only admission remain required before A05.3b exposes these internal methods.
- Package the exact new runtime dependency in the open Vite plugin. Keep its source
  canonical in core; copied package files are generated from it and ignored by Git.
  Use a new local candidate version and exact archive/consumer manifest, not a
  rewritten old immutable archive. No publication or other repository.
- Existing closed first-read recipe keeps actionTrace disabled and its original
  semantic argument/refusal thresholds. Mechanically refresh changed compiler pins,
  add the exact newly imported compiler module pin, refresh normalized builder self
  hash, and run original finite acquisition/refusal controls as a justified regression.
  Do not claim new full-path/effect/HTTP acceptance.

## Checks registered before edits

Source RED/control: default output checkpoint equality; original function sites
despite generated property thunks, same-text different-file site IDs, original TS/
JSX and Vue spans, module site registration, default-off/mode mismatch, catalog
budget/unknown and invalidation/stop. Preserve with/Proxy and all A05.2 cases.

Native: extend the existing finite development driver with the ACTUAL plugin loader/
observer and compiler path, not a substitute. Original/unarmed/armed22 cases retain
their predicates and semantic controls. Add real Vite Vue setup event method with
its original SFC digest/range; inline/generated callbacks remain boundaries. This
still tests a synthetic control UI, never Atom UI/permissions/production readiness.

Build/install: existing full source checks; exact local plugin tarball with copied
runtime/core dependencies and notices; consume/exercise the exact archive from an
independent temporary consumer with available locked dependencies, no new install
script or publication. Rebuild only affected outputs. Keep old evidence immutable.

## Result and next

Commit the actual source/consumer/native result with named limits. A05 stays open.
ONE next item A05.3b is selected-context/read-only runtime operations and armed
Actions UI, then original whole-item matrix/review. No human, SDK, release or broad
project audit is introduced. Unknown production support and performance remain open.
