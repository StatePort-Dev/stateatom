# I02.28 — original native DevTools/Capture control without app auto-attachment

Current official Atom83/UI2, host75a5ebfa. Original full native-capture.e2e.test.ts
Google criterion opens native Elements DevTools before Capture and reopens it while
recording; after that Capture must still record without reattach. Its Playwright app
session pre-attaches even before Capture, so previous FAIL2 does not isolate DevTools.

Use existing compatible33-control native driver with one explicit diagnostic mode:
STATEPORT_I02_DEVTOOLS_NATIVE=1 and GoogleChrome-only selection. Source app remains
created/read by extension APIs/native Capture, with no test app CDP session. Create
only the real devtools://.../inspector.html frontend from the owned browser endpoint,
using the same original URL and actual Elements tab readiness criterion. Record
actual native attached state before Capture; do not force or clear another owner.
Reopen real DevTools while recording, assert same Capture isolate/recording, then
close frontend and retain all original33downstream Review/Save/replay/privacy checks.

Maximum new native Google runs1 in this bounded control. No second browser/profile
variant or relaxed readiness/coexistence success criterion follows automatically.
No model/device/CA/performance campaign, SDK or publication. Existing synthetic
permission-release TLS fixture is reused by the unchanged downstream controls.
If native DevTools fails admission/retention, preserve the negative result and
separate it from the earlier competing-Playwright cause; no ownership bypass.
If only frontend setup fails, preserve that narrower unknown boundary explicitly.

## Result

Closed first/only native execution: GoogleChrome15635PASS, exit0/1testPASS,
Chromium1deliberately unselected,44.86s. Exact host result
artifacts/atom-host/i02-current83/devtools-native-2026-10-27T15-48-22-103Z/results.json.
Before actual Elements ready: native attachedfalse. During real Capture after
DevTools reopen: attachedtrue with unchanged Capture Runtime isolate/recording.
Original33downstream controls also complete; no reattach/ownership bypass. Host
3f567f79 commits the bounded proof; old full-driverFAIL remains distinct.
Next234I02.29retains its original remaining UI/memory/cancel/interaction criteria in
an owner-safe canonical driver. Full I02/L02/21of29 unchanged.
