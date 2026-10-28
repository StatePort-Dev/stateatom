# U04 — selector error recovery, source correction

28 October 2026, baseb3db358. Known defect from279/280: malformed `[` reaches
`selection.unsupported` with a null injected result and shows a TypeError.
This bounded correction does not close U04 or qualify a new package/official host.

## Change

`browser-extension/adapters.js` catches the existing single root/open-shadow lookup
and returns “Could not use this CSS selector. Check it or use Pick element.”
It does not read arbitrary thrown objects, repeat a query, expose exception text
or claim that every failure is syntactically invalid. A valid missing/inaccessible
match has distinct text. `packages/atom/src/runtime.mjs` refuses absent/nonobject
selection results with a fixed `SELECTION_UNAVAILABLE` recovery message before
reading fields. Native DOM identity, source, property, stale/picker/context guards
and permissions remain unchanged. No new CSS, token, layout or primitive.

## Actual verification

- Actual RED: six adapter/runtime failures reproduce thrown lookup, old missing
  message and null/undefined selection dereferences. Corrected existing UI status
  expectation includes the actual `Error: ` prefix. Initial attempt with an
  arbitrary thrown Proxy disrupted the failing Node reporter and was interrupted;
  preserved `red.log`, not counted as completed RED. `red-supported.log` is the
  completed baseline. Proxy exception privacy is a separate GREEN control.
- **82 affected PASS**, including adapter/native-result recovery, existing picker
  and identity refresh controls, mounted successful reinspection and late-tab error
  protection. `green.log`.
- `npm test`: **6043PASS,0fail/cancel/skip**,164588.08673ms, actual exit0.
  `full-local.log`. Earlier sandbox run failed subprocess/FIFO/loopback operations
  (EPERM and empty child output); `full.log` retained. Same full command passed with
  authorized local system operations, no test or product workaround.
- Owned Chromium153.0.8010.12 source-rendered UI: **10PASS**, root/shadow malformed
  selector, missing target, keyboard recovery and status fits at1100/390, root13px.
  Real DOM queries; synthetic client capabilities/state. This is not MV3 runtime,
  public-package, official-host or whole-U04 acceptance. `source-browser.json`.
  Two setup failures retained: about:blank lacks secure-context randomUUID; then
  incomplete fake client omitted capability policy and left the button disabled.
  Corrected file:// context + existing explicit synthetic policy, no browser flags,
  product permission change or personal profile. Owned browser closed/errors[].

Artifacts: `.artifacts/u04/selector-error/2026-10-28/` contains all logs, the exact
source-browser harness and two prior versions/results, source HTML and screenshots.

Viewed actual390 screenshot against supplied `design/screens/atom/10-narrow-inputs.png`:
existing shared header/tabs/input shapes and typography retained. Actual Atom has
its already-existing full-window layout, explicit manual selector and footer error;
the reference shows a simulated embedded API workflow, so contents differ. New
message wraps inside existing footer without horizontal overflow; screenshots
remain agent-reviewed candidates, not human approval/full visual fidelity.
The existing actual selection button is labelled “Select page element”; “Pick element”
in recovery text refers to that existing picker, not a new control. No redesign.

Scope boundary: affected source tests and source-rendered UI only; exact90 packages,
consumer/official host and frozen old raw results remain historical/unchanged.
Package refresh and affected actual extension acceptance remain future work after
source stabilization. No performance/model/native old campaign was repeated.

Next: finite A02 writer/escape-path assessment from283, not an exhausted-mechanism
claim. L02 usefulness and remaining integration/installed/distribution gates open.

## Review / closeout

ONE read-only review0Critical/0Important/1Minor: recovery copy says “Pick element”
while actual control says “Select page element”; understandable, defer wording
alignment to the next affected copy change. No correction/native/full-suite repeat.
Bounded source fix complete; package/official runtime acceptance remains pending.
