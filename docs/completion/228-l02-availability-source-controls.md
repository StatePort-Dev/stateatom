# L02.21 — availability settlement versus UI generation, source only

Bounded prerequisite from I02.25/record227. Approved scope-review-1 and every L02
quality/performance criterion remain unchanged. Native budget0, model calls0,
new profile/feature-flag/CA variants0. No package rebuild/intake or product policy
change. Current accepted official input remains Atom82/UI2.

The real native failure retained a trusted checked opt-in and the previous recorded
template/status for20s. It did not distinguish unsettled provider availability from
an ignored UI-generation callback. Do not assign an actual native cause from a fake.

Use the existing tests/atom/action-explanation-ui.test.mjs source fixture to separate:
1. Availability pending after an already displayed template; late unavailable then
   updates metadata while preserving template and making no model create/prompt.
2. New tab/evidence render while availability is pending; a late reply cannot update
   the new generation and its visible state differs from the old native snapshot.
3. Opt-out while availability is pending; late available/downloadable cannot create
   a model or re-enable the old context, and default Explain still works.
4. Disposal while availability is pending; a late reply cannot update disposed UI.

These controls exercise asynchronous ownership/epoch behavior, not real inference,
API responsiveness, device usefulness, latency or a native root-cause verdict.
No production behavior change is planned by this characterization item. Product
fixes, any timeout/availability policy and a fresh native attempt require their own
concrete bounded prerequisite; they are not presumed approved or already passed.

## Result

Closed source-only: canonical command
node --test --test-isolation=none tests/atom/action-explanation-ui.test.mjs tests/action-explanations.test.mjs
passes20checks, including4new controls;0failure/skipped. Evidence:
.artifacts/l02/availability-source/2026-10-27/source-controls.json and focused-isolation-none.log.
Current327product/source build inputs still match immutable Atom82 receipt; no
production code, provider contract or policy changed. The earlier default-isolation
command emitted only2file-level results; it is retained and not counted as20cases.

Pending availability reproduces the old native visible template/status shape without
creating a model or adding state RPC. Finite new-render generation loss produces a
cleared template/Optional status; late metadata after opt-out/dispose cannot update
that context or create a model. These source distinctions do not observe the exact
native API promise or exclude every possible lost-callback cause. Native cause stays
Unknown; no new native/model attempt or full L02/I02 acceptance.

One next bounded L02.22: expose truthful existing Checking availability status while
opt-in metadata is pending and restore the existing template/optional status on
opt-out. Preserve model opt-in, epoch guards, template, no new timeout/policy/API
parameters, and original pending/cancellation controls. Source TDD first; any source
UI fix needs separate packaging/native qualification before becoming official proof.
