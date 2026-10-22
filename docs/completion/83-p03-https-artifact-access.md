# P03 — HTTPS artifact access and local fallback

Started 2026-10-22 on main after accepted P02 (`4b266d9`). P03 depends on completed
F02/P02. Approved scope and evidence criteria remain unchanged. **17/29 full
items complete; P03 and C06 remain partial.** This document is not feature proof.

## Current bounded item: P03.1 environment qualification

Apply the [inline plan](../superpowers/plans/2026-10-22-p03-corporate-artifacts.md).
The existing URL/local-file source workflow is preserved. First qualify a genuine
optional-host permission prompt on current exact Atom .44/UI .2 in a disposable
headed Chrome, then a trusted HTTPS fixture route. A nested X display, if needed,
keeps native clicks/screenshots away from working windows. No user/system NSS
trust edits, global browser grant, developerPrivate preapproval, TLS bypass or
permission-API stub may count toward P03 acceptance.

Register these assertions before the probe:

1. Fresh profile lacks the requested HTTPS origin; actual existing Atom Allow
   site gesture opens the browser-owned prompt.
2. Native decline returns denial with no attach/artifact fetch; a fresh explicit
   request and native grant set only the requested origin. Record screenshots,
   actual permission facts and unchanged production permission.
3. Certificate-manager setup, if available, adds a unique local test root to the
   disposable profile only; trusted hostname succeeds and untrusted/mismatched
   certificate fails without ignore-certificate/SPKI/security overrides.
4. Probe evidence is environment qualification only. Full artifact/auth/error,
   cancellation/target-switch/local-fallback and both-host P03 acceptance remain
   later work; no corporate account or silent SSO claim follows.

Primary API references consulted: [Chrome permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions)
(user-gesture request, denial boolean, removal/event; a previously granted origin
may be re-added without another prompt), and [Chrome Certificate Verifier FAQ](https://chromium.googlesource.com/chromium/src/+/main/net/data/ssl/chrome_root_store/faq.md)
(local trust and certificate manager). Exact actual browser behavior must still be
observed. Existing F05 self-signed/preapproved tests are regression evidence only.

## Execution

**P03.1 environment qualification is complete within its boundary.** The actual
product/source/UI package remains exact .44/UI .2. No new source capability or
full P03 acceptance follows.

- Finite tracked driver: **13 PASS** across both exact MV3 hosts, including real
  browser-owned Deny/Allow, read-only attach, separate ungranted artifact origin,
  actual permission removal and complete-host byte identity.
  `.artifacts/p03/environment-native/2026-10-22T07-26-59-292Z/results.json`.
  Driver/helper inputs match before/after and the retained driver copy. First
  tracked13 pass `07-25-52-494Z` remains a separate run.
- Manual agent-operated TLS qualification: unique test CA imported through the
  native certificate manager/Open in disposable profile
  `.artifacts/p03/permission-probe/2026-10-22T07-09-51-555Z`. Before trust Chrome
  refused the chain; after import it admitted localhost with normal verification;
  the same trusted root with SAN-mismatched127.0.0.2 was refused. Server records
  contain only localhost requests. The closed profile's read-only certificate
  receipt contains exactly one853-byte DER root with SHA-256
  `ab0a4d3cc46e9c3b682beb312c71499e83d188cc7ff4e63ce89edfc7f876c129`.
  No shared NSS/system trust edit, certificate exception or TLS-bypass flag.
- Aggregate `.artifacts/p03/environment/verification.json` binds exact current
  tarballs/installed pair/hosts, native13 inputs, TLS receipt and screenshot/log
  hashes. Screenshots were inspected by the executor; no independent-human claim.
- Source2113 remains the accepted4b266d9 result, not a new suite run. Current
  package source/installed/host hashes still match; changes are test infrastructure,
  a reproducible fixture/driver and records. No CSS, tokens or product UI changed.

### Preserved failures and rulings

The first manual Deny and second manual Allow probes waited long enough to lose
the private inspector channel. Denial left permission false; Allow set permission
true but no attach or production grant is credited for those runs. Exact cause
is not fully established; ordinary worker-idle/channel loss is a hypothesis.
A short finite probe and the tracked two-host runs admit/refuse correctly. A
long prompt and explicit fresh-document recovery remain controls for full P03;
no automatic restoration of production authority is added.

The first certificate chooser used the shared desktop portal. It was cancelled
before selecting/importing; the first closed profile's custom certificate count
is0. The next test browser used an unavailable D-Bus socket and GTK portal disabled
only in that child, so its native chooser stayed on the nested display. First
isolated file selection did not import; focusing its own XID and clicking observed
Open succeeded. A same-position `xdotool --sync` waited for motion; the finite
driver uses bounded native commands without that wait. A first fast permission
probe clicked during native-dialog appearance and timed out; the final driver
waits1s for this browser UI, preserving every product assertion. These are retained
negative results, not new product defect fixes or broad stability proof.

Ruling: register this as **environment qualification**, not corporate-artifact
acceptance — actual app-origin native permissions and trusted TLS routing are
proven, but artifact-origin prompt/download/fallback cases have not run. Cost if
wrong: P03 remains visibly open and its original checks still gate acceptance.

See [reproduction and environment constraints](../testing/https-source-environment.md).
The next bounded item is **P03.2 safe artifact error/local-fallback behavior**:
first pin the actual missing behavior, preserve credential omission/redirect and
artifact-boundary refusal, then check rendered guidance. Full trusted-HTTPS
artifact cases, long prompt/target switch/cancel and ONE whole-P03 review remain.
**17/29 full tasks (~59% equal count)** is unchanged; no SDK, publication, other
repository, redesign or independent-person gate.
