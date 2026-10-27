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

Pending one native execution; full I02/L02/21of29 unchanged. Chromium is deliberately
not selected and cannot be counted as a new positive in this Google-only control.
