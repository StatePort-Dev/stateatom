# L02.24 — owned notice for long-pending availability metadata

Bounded source/UI work after239, source03fbc6b. Real I02.25 and later native6metadata
still retain Checking/Unknown; no real API settlement cause or useful-model route
is known. Existing228pending/epoch controls and229status ownership remain intact.
Current source84/default templates are credited; no old experiment is restarted.

Concrete source gap: the checkbox metadata call awaits provider.availability without
a UI notice deadline. Existing explicit Explain already has its own30sprovider/
120sUI request bounds. Do not change those, API arguments, initialization/download/
inference/cancellation/consent policy or provider availability-state mapping here.

Chosen internal UI presentation window:30s after one opt-in metadata request show
“Local model status unknown · template still available.” Keep the recorded template
and evidence intact; do not call it unavailable, abort/retry the Chrome API, create/
prompt/download or add state RPC. A later real result may update the same current
context. This is a recorded executor implementation choice for this bounded task,
not an inferred approved device verdict/Live setting/production permission parameter.

Use one private owned notice timer; cancel on opt-out/new opt-in/explicit Explain/
new context/disposal, and clear when the matching request settles. Older settlement
must never cancel a newer timer or replace its state. Existing epoch/availability
nonce guards remain; no global timers/second explanation engine/public contract.
Underlying pending API promise may remain browser-owned; no API-abort guarantee.

Tests first:30snotice/template/call counts, before-deadline state, late available and
unavailable settlement, opt-out/render/dispose cleanup, old→new request ownership,
explicit generation superseding metadata. Fake clock source checks do not observe
real inference/API responsiveness. Use current node:test MockTimers docs viaContext7.

Files only packages/atom/src/action-ui.mjs, its existing source UI tests and Atom
changelog. Source RED→GREEN/affected/full checks, one scoped review if useful, then
existing rendered-component fixture adapted in a new artifact directory. Compare
before/after390/1100 first viewport, Inter/typography/control alignment, keyboard
focus and overflow against current source and supplied Actions03.1/03.2/optional
05.7reference. Tokens/styles/layout unchanged; longer status may wrap. Screenshots
are agent candidates, fixture/fake document/provider is not a real-host/model proof.
Reference files remain packages/extension-ui/design/README_RU.md,
docs/HANDOFF_RU.md and design/SCREEN_INDEX.md under that reference root.

No native product/model/device/CA/trust/SDK/publish/official-host change. New source
requires a distinct immutable candidate before host qualification; accepted83host
and84archives remain byte-exact. Full L02/I02/V02 and21/29 unchanged.

## Result

Closed bounded source/UI item. RED **23PASS/7FAIL** (missing notice/owned timer),
GREEN **30PASS**, affected **75PASS/0FAIL**, final full `npm test` **5883PASS/0FAIL/
0SKIP**,160498.70161ms using required local child-process permissions. Syntax2/diff
PASS. One scoped fresh read-only review0Critical/0Important/0Minor; no correction or
rereview. Provider/API code and every generation/download timeout/consent argument
are byte-unchanged. No source UI result is a native readiness or useful-model pass.

One private notice handle is retired by existing cancel/context boundaries; matching
settlement clears only its own notice. Its expiry changes copy toUnknown and keeps
the template; late matching available still updates metadata. Old request cannot
cancel a later notice, and explicit generation retains120000ms independent bound.
No automatic retry/create/prompt/download or extra state RPC. Original20s native
cause stays Unknown; API availability errors/state mapping are not changed here.

Actual rendered source component before/after390/1100 PASS keyboardSpace/focus outline,
Inter, no horizontal overflow, identical root typography/button/checkbox rectangles.
First viewports inspected: existing optional explanation group/status spacing and
controls match prior source; only the final hint text changes. The new copy fits
at390and1100 with no layout/control movement. Existing supplied Actions03.1/03.2/
05.7reference and component composition preserved; no tokens/CSS or redesign.

Fixture uses a fake document/provider and a manually advanced notice callback;
it does not wait30real seconds or call the real Chrome model API. Real fake-clock
30sboundary/cancel/late/call-count behavior is in source tests. Surrounding Basic/
footer defaults are template placeholders, so images are focused component-layout
candidates, not full native host/human acceptance. Files source-checkpoint/rendered/
before-after PNGs/raw logs retained under the stated artifact path.

Against immutable84,269/270source and325/327build inputs remain exact. Intentional
changes are packages/atom/src/action-ui.mjs and Atom CHANGELOG only. Existing84archive/
receipt and official83host are untouched. One next bounded **L02.25** local immutable
candidate85 with unchanged UI2/admission/types, record241. No automatic host upgrade,
model/CA campaign/publication. Full L02/I02/V02 and21/29 unchanged.
