# A05.3b — native read/inject-only connection

2026-10-21; bounded follow-up to local82653c5. Same session feature and original
acceptance, no report/production/SDK/redesign scope added. This check is necessary
because41's actual native hosts granted all development actions; policy tests alone
did not demonstrate a native read/inject-only path.

## Reproduction and fix

Extend the existing native driver with an explicit `--read-inject-only` mode,
keeping its original positive branch and archived .12 driver/receipts. One actual
standalone MV3 host uses the same immutable Atom/UI pair, actual local Vue/plugin
and owned IDE. Native connection is development actions=[], attachment is explicitly
readOnly, using the existing UI checkbox. User picker and click remain native.

- First new harness stopped prematurely on intermediate Working; preserve
  .artifacts/a05/read-inject-native/2026-10-21T04-53-15-160Z/results.json as harness
  failure. Wait for actual Waiting/Error rather than any non-OK status; no weakened
  Arm/body success assertion.
- Corrected original .12 probe RED:
  .artifacts/a05/read-inject-native/2026-10-21T04-53-52-273Z/results.json.
  Connection actions=[] and readOnly=true proved; actual UI Arm failed with
  `Error: Exact main execution context unavailable`, with no application invocation.
- Cause: readOnly debugger branch discarded Runtime execution-context events.
  Fix only retains the three passive context creation/destruction/clear events in
  the existing bounded journal. It does not acquire script bodies, disable cache,
  mutate application state, enable production observation or grant mutation actions.
  Exact unique MAIN context remains required; no fallback was added.

New immutable Atom .13 is required; .12 checkpoint and failures remain historical.
The driver must keep the actual positive Arm→native click→complete body assertion.
No full lifecycle/async/report/production or whole-A05 acceptance follows. Next
bounded item remains A05.3b adversarial replacement-owner/late-IDE regressions and
remaining lifecycle/context/Basic/disabled/throw/keyboard matrix.

## Actual final checks

- Full6 `npm test`:1689 PASS,0 fail/skipped; focused6:28 PASS. .13 type consumers
  NodeNext/browser PASS; exact package admission7 PASS. Logs in
  .artifacts/a05/runtime-ui/. Source-only targeted review: no Critical/Important;
  journalEvent returns null for all three events, so no script acquisition starts.
- Immutable .13:
  .artifacts/atom/2026-10-21T04-54-42-177Z/atom-handoff.json,
  archive SHA256470ec1f94419f1d54f7564996952b3b1200dbadca6869aa2cff41ac2d3904cf6.
  Shared UI .20261018.2/contract2.1.0 unchanged; no visual change in this follow-up.
- First .13 actual native connection/Arm/body3 checks passed, then harness cleanup
  incorrectly awaited IDE source-open completion despite this probe not opening a
  source file. Preserve overall FAIL:
  .artifacts/a05/read-inject-native/2026-10-21T04-56-01-128Z/results.json.
  Use the existing IDE close(false) path for this branch; do not remove or weaken
  actual positive Arm/body/readOnly/no-mutation assertions.
- Final same positive probe:
  `node tests/integration/action-trace-native.mjs <.13-handoff> --read-inject-only`:
  **3 PASS**, .artifacts/a05/read-inject-native/2026-10-21T04-56-50-697Z/results.json,
  errors[], source/workspace/package/host inputs unchanged. Actual standalone only;
  this is not a new two-host/lifecycle/production matrix. .12's17 two-host checks
  remain separately recorded in41; .13 does not relabel them as a fresh .13 run.
- `node .artifacts/a05/runtime-ui/verify13.mjs`: exact current package/source,
  native unchanged maps, readOnly/actions[], complete dispatch/body records and
  source/type/admission logs PASS; verification13.json retains remaining gates.
- No further finite .12 rerun: this fix only passively tracks context metadata in
  readOnly; controlled-profile/compilation source is unchanged. Full source suite
  passed. .12's original finite4 result remains a separate historical checkpoint.
- `git diff --check`:PASS. No publication or other repository changes.

A05.3b remains in progress. One next step: adversarial runtime replacement-owner /
late-IDE regression and the remaining lifecycle matrix. Saved reports follow;
mandatory whole A05/L02 and original acceptance thresholds remain unchanged.
