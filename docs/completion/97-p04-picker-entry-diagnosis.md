# P04.4d.4 — primary picker entry diagnosis

Continues `f593e2b`, product/packed59 unchanged. The earlier diagnostic drivers
sent the physical gesture after dispatching the inspector Pick click without
waiting for its asynchronous operation to reach `picker.status: picking`. The
corrected driver waits for that actual state before touching the application.
There is **no picker implementation or UI change**.

Bounded controls in `.artifacts/p04/picker-entry-native/`:

- `2026-10-23T07-42-58-291Z`: exact59 standalone debugger Input selects enabled
  `#ok`,2 PASS including immutable package identity. Actual Overlay events recorded;
  selected button's handler count remains0. Not X11 evidence.
- `2026-10-23T07-43-52-090Z`: same59/ready state with real X11 gesture,2 PASS.
- `2026-10-23T07-45-08-989Z`: exact58 attempt FAIL0 before browser because its
  historical temporary installed consumer no longer exists. Not a picker failure.
- `2026-10-23T07-46-44-197Z`: exact58 historical hosts/tarballs, restored separate
  installed consumer, corrected X11-ready control,2 PASS. No old package rebuild.
- `2026-10-23T07-47-48-099Z`: current59 **disabled Confirm** via X11 in standalone
  and embedding,3 PASS including package identity;0 inspector console warnings/
  errors. Exact `Overlay.inspectNodeRequested`, original disabled=true selection,
  selected picker state and0 app actions asserted in both hosts.

Commands: `node tests/integration/p04-picker-entry-native.mjs <handoff>`;
`--debugger-input` selects the already-owned Atom debugger Input comparison;
`--confirm --both-hosts` selects the main disabled-target X11 control.
`node --check tests/integration/p04-picker-entry-native.mjs` and `git diff --check`
pass. Native Chrome153/trusted synthetic HTTPS/actual CA import/site Allow are
unchanged. No parallel app CDP/TLS bypass/permission preapproval/product injection.

Aggregate `.artifacts/p04/picker-diagnosis/verification59.json` binds all controls,
latest driver, unchanged510 qualified59 source inputs and both immutable pairs.
The58 consumer was installed offline with scripts disabled in a new `/tmp` folder
from its exact retained tarballs; its full44 package files/exports/contracts match
its historical receipt, as do both unchanged hosts. Original handoff/archives/
receipts remain unchanged; the derivative diagnostic handoff records its source.
Before the first59 control launched, automatic permission review timed out; its
explicitly allowed single retry succeeded. No native run is inferred from that
non-launch and no ongoing approval block remains.

This identifies a readiness race in the test entry path rather than establishing
a product fix. Earlier enabled/disabled picker failures from91/93 remain historical;
legacy Playwright's separate app-debugger conflict is not reclassified as success.
Current evidence qualifies **primary selection**, not the whole subsequent reporter
journey or all U05 paths. No visual change/new human approval is claimed.

Next bounded item: **P04.4d.5 actual primary-picked reporter journey, Continue via
keyboard and remaining H08 tab-switch/denial guards**. Only after remaining named
H07–H09 criteria have actual evidence should ONE whole-P04 review run. P04/C07
remain open,18/29 (~62% equal count) unchanged; mandatory L02 open/A05 scoped
complete/A02 open. No SDK/publication/redesign/other repository/human blocker.
