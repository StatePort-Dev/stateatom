# Current95 package, host and changed native path

Producer `6fc9198d6590ee26dfc6f13350c65325fda2a058`, clean at packing.
Handoff `.artifacts/atom/2026-10-29T12-02-10-161Z/atom-handoff.json`.
Atom95 archive SHA256 `33850e1cf3016e0608808ec626b26e4a97528eb5329ce76096c9c897e1d43f7a`;
UI2 unchanged. Source6514, public package9, packed types2 PASS.
Exact host manifests and previous94 rollback folder: `docs/testing/current95-host-case.json`.
Only official BUILD-INFO.json/service-worker.js change from94. UI/Capture assets
and notices remain byte-identical. Offline frozen install1290, build, types and
9 sequential intake/UI checks PASS. An initial parallel test run hit ENOENT while
the UI test rebuilt shared dist; retained `/tmp/stateatom95-host-tests.log`.
Sequential result `/tmp/stateatom95-host-tests-sequential.log` is the valid check.

## Actual normal folder installation and picker regression

Command `node tests/integration/current95-picker-native.mjs .artifacts/atom/2026-10-29T12-02-10-161Z/atom-handoff.json`.
Raw `.artifacts/u04/current95-picker/2026-10-29T12-05-34-781Z/results.json`,
SHA256 `b3ce65117423ff282258faef86f56ed19c548d5927d74edc60ae350f9b74216f`.
Both fresh owned Chrome153 profiles install through rendered chrome://extensions,
Developer mode, Load unpacked and the native folder chooser. Exact executable
hash/command recorded; no preload, certificate bypass or personal profile.

Both hosts: real picker selects #counter, explicit manual lookup selects #run,
old picker is cancelled with empty choices and hidden Select parent. A real app
click still completes20requests/20480bytes. Invalid selector shows the useful
error, recovery through picker/manual lookup succeeds. 440/390 widths have no
horizontal overflow; keyboard Actions→Source updates focus and aria-selected.
No errors, console warnings or frozen-input drift. Screens are agent candidates.

Reference comparison: narrow reference `packages/extension-ui/design/screens/atom/10-narrow-inputs.png`
uses the same shared typography/colors/section rhythm. Current Basic has no known
source expression and therefore shows the neutral dependency-not-found repair;
no synthetic API/source cards are inserted. The screenshot deliberately has
Element details expanded from manual lookup. Advanced selector/limitations are
not the default first viewport. No token/layout redesign was made. Old #counter
ancestor buttons visible in94 are absent in95.

This proves normal extension folder installation plus the changed picker path,
not toolbar discovery, Desktop installation, coordinated update/rollback, the
whole U04 matrix or V03 independent applications. Historical94 latency remains
accepted by343, not rerun or relabelled as95 measurement.
