# P03.2 — Safe artifact errors and local fallback

Started 2026-10-22 after P03.1 commit3f63671. Approved P03 work remains the scope;
these are executor implementation choices, not additional maintainer approvals.
Full P03/C06 acceptance and17/29 whole-task count remain unchanged.

## Bounded design and preregistered checks

Keep the current explicit URL, existing local .map/ZIP picker, owned parser,
credentials omission, no-referrer and redirect refusal. No source discovery,
account/login, cookies/tokens, new retention, production grant or redesign.

The current UI surfaces only a general action error. A streamed response read may
propagate its original Error message, while an HTML login document becomes a
parser error. Add closed static acquisition error categories and useful local-file
guidance next to the existing picker; focus that picker after a current failed URL
attempt. Preserve stale/clear/disposal generation guards and all claim labels.

Register before changing product code:

- HTTP401/403: auth/access refusal, bounded numeric status and local-download/import
  guidance; other HTTP failures retain a bounded status. Never read/echo an error
  response body, status text or URL query.
- Actual HTML document prefix: document instead of artifact, possibly a sign-in
  page, not a claim of confirmed SSO. Inspect at most512 initial bytes, not source
  execution or general parsing in the interactive thread.
- Fetch/body-stream failure: network/redirect/browser-policy ambiguity stays
  explicit; never infer offline/SSO/redirect from a generic fetch rejection or echo
  its message. Redirect observed in response metadata is a separate refusal.
- Permission denied/revoked, URL policy, empty/oversize, cancellation and existing
  ten-second timeout have safe bounded results. Recheck artifact-origin permission
  before accepting completed download bytes. Preserve current limits and parser
  Unsupported/Budget semantics.
- UI guidance uses textContent and the existing file input; a local file attempt,
  clear/new selection/disposal removes obsolete guidance. Pending permission after
  a target switch cannot download or write an error into the replacement context.
  Permission callback and unknown acquisition errors cannot echo arbitrary strings.

Use real source session and parse executor with controlled browser/fetch boundaries
for RED/GREEN tests; label these models. Then full source suite, a new immutable
candidate for changed runtime bytes, current native/rendered error/fallback controls,
keyboard/narrow screenshots and affected source/permission regressions. Preserve
failed attempts. These checks do not replace P03's later trusted-HTTPS full artifact,
long-prompt/target-switch/cancel/local-fallback cases or ONE whole-item review.

## Native error/fallback cycle registered before execution

Run `tests/integration/source-access-errors-native.mjs` against immutable candidate45
in both standalone and embedding hosts. Controlled HTTP127 uses the existing required
loopback permission; it cannot satisfy trusted HTTPS or native-prompt P03 acceptance.
Use current native listener registration coordinates, no app-target test CDP or IDE.

Exercise403 without reading its body, HTML document, refused redirect, empty body,
oversize declared length, actual existing ten-second timeout and Clear during an
outstanding response. Assert safe inline guidance and file-picker focus/enabled state,
no private query/body echo, production permission false and action counts unchanged.
Actually import the offered local exact ZIP and view the selected registered-handler
source. Check440/390 viewport/keyboard controls, no credentials/referrers or forbidden
redirect-destination request, private report exclusion and exact installed host hashes.
Save this preregistration snapshot before execution; later results do not rewrite it.

## Execution

Implementation adds a closed safe acquisition-error helper, rechecks artifact
permission after downloading bytes, and offers/focuses the existing local file input
for current failures. Static messages distinguish HTTP access, document, observed
redirect, ambiguous fetch/policy, size, empty, permission, cancellation and timeout;
raw errors/response bodies are excluded. Current generation guards and parser limits
are preserved. No login or discovery is added.

`tests/atom/source-access-errors.test.mjs` adds17 source-session controls and
`native-source-ui.test.mjs` adds4 UI controls. Registered final RED:42 total,
22 pass/20 fail. GREEN:42 pass, full source2134 pass,0 fail/skip/cancel. These
controlled-fetch/UI tests are source models, not native HTTPS proof.

Immutable Atom `0.1.0-candidate.20261021.45`, shared UI
`0.2.0-candidate.20261018.2`, API/wire1 and UI contract2.1.
Handoff `.artifacts/atom/2026-10-22T07-47-35-464Z/atom-handoff.json`.
Worker and shared CSS/token bytes equal accepted44; runtime session/UI bytes changed.

Actual native HTTP cycle:
`.artifacts/p03/access-errors-native/2026-10-22T08-04-10-481Z/results.json`:
22 PASS across both exact hosts. Five server failures offer safe enabled local import;
actual release ZIP then opens the exact selected registered-handler source. Real Clear
closes a pending request; real ten-second timeout gives bounded guidance. Counts stay
zero, production grant false, no artifact credentials/referrers or refused destination
request, private markers absent from default reports. Source previews are Code-linked,
not invocation evidence. The synthetic private query remains in its user-entered URL
field; it is not echoed in feedback or reports.

Agent inspected all four390/440 failure candidates: existing13px typography/controls
and width preserved, guidance wraps, file input remains available. Keyboard focus stays
within Atom. The panel is scrolled to the picker; its label is partly clipped under the
existing sticky header. This is recorded rather than claimed as new first-viewport
fidelity or human acceptance. The existing source-parser campaign separately checks
first viewport/source details. Atom changelog records the copy/focus deviation from
unchanged shared references; no replacement visual design.

Fresh candidate45 regressions:86 actual two-host parser/lifecycle checks PASS,
13 actual browser-owned Deny/Allow/read-only/revocation environment controls PASS.
The latter remains a separate public HTTPS page test, not artifact permission
acceptance. Types2, admission9 and extension build PASS; existing esbuild CJS/
import.meta warnings retained. Worker/CSS/shared UI hashes unchanged from44.

Aggregate `.artifacts/p03/access-errors/verification45.json` binds exact source,
package/install/hosts, before/after native inputs,21 new regressions,42 focused/
2134 full checks,22 new native errors/fallback,86 parser and13 permissions, logs
and four images. Preregistration preserved as `preregistered84.md`; all RED logs
retained. No native attempt failed in this slice. Earlier P03.1 long-prompt/channel
loss and TLS qualification are preserved unchanged, not rerun or relabelled solved.

P03.2 is complete within this bounded brief. P03/C06 remain open and17/29 full
items (~59% equal count) unchanged. Next P03.3: actual trusted-HTTPS artifact-origin
and interrupted/changed-target permission workflow, then ONE whole-P03 review.
No SDK/publication/other repository/redesign/independent-human blocker.
