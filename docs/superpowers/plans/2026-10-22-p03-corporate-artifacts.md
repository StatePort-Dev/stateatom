# P03 corporate artifacts and HTTPS access plan

> **For agentic workers:** Use `superpowers:executing-plans` inline, one bounded task and local commit at a time. User authorization is autonomous iteration on main; no branch, publication, SDK or other repository.

**Goal:** Connect explicitly supplied private artifacts through actual HTTPS/browser permissions, with useful safe errors and a dependable local ZIP fallback.

**Architecture:** Keep the existing source session, owned parser and optional-origin callback. Preserve credentials omission, redirect refusal, exact loaded-script matching and read-only authority. Exercise the real Chrome permission UI in an isolated test browser, using locally trusted test certificates rather than certificate-error bypass.

**Tech stack:** Existing Chrome153 MV3 hosts, native CDP harness for owned extension documents, Node24 HTTPS fixture and current source parsers. No new product dependency.

**Spec:** `docs/completion/06-production-and-source-maps.md#p03`, approved `02-release-scope.md` and `12-scope-decisions.md`; execution/evidence in `83-p03-https-artifact-access.md`.

## Global constraints

- No automatic intranet/provider discovery, login, cookie/token extraction or source execution.
- App and artifact origin permissions are separate; only explicit origins and declared same-origin references are fetched.
- `credentials: omit`, `redirect: error`, `referrerPolicy: no-referrer`, current size/time/privacy limits.
- Source access does not enable F05 changes. Original negative evidence and historical acceptance remain intact.
- No disabled certificate verification, browser permission preapproval or mocked permission decision can count as ordinary P03 native permission acceptance.
- Trust and UI setup are confined to a disposable test profile/display; no system/user trust-store edits or existing browser/session interference.

## Review focus

- A target/tab switch while a permission prompt is open cannot apply a result to the replacement context.
- Denial/revocation cannot leak or reuse private sources or promote production authority.
- A login page, redirect or 403 must produce bounded safe guidance without response/URL-secret echo.
- Declared references and manifest paths cannot cross the approved artifact boundary.
- Offline/cancel/oversize failure leaves a usable local import and the original evidence distinctions.

### Task 1: Qualify actual browser permission and trusted TLS test routes

Files: `scripts/native-browser.mjs` only if an explicit headed option is needed; new narrow test helper/integration fixture as justified; execution record83.

- [x] Preregister the probe and exact evidence boundaries in83.
- [x] Probe a real optional-host permission request/deny/grant through current packed UI in an isolated headed Chrome. Record actual native prompt screenshots and `permissions.contains` before/after, not WebUI preapproval.
- [x] Qualify locally trusted HTTPS in the disposable Chrome profile, using its certificate manager if supported. Record certificate fingerprint and a negative untrusted/mismatched control. Never alter shared NSS/system trust.
- [x] Record limitations honestly; unsupported environment paths stay open. Locally commit a reproducible bounded deliverable before progressing.

### Task 2: Bounded artifact error and fallback behavior

Files: `packages/atom/src/source-map-session.mjs`, `source-map-ui.mjs` and a small source-acquisition error helper only if required; focused `tests/atom` controls.

- [x] Pin actual missing behavior with RED tests: HTTP401/403, HTML SSO, policy/network/redirect ambiguity, cancellation, permission changes and target switch. Check privacy and local fallback.
- [x] Implement only confirmed gaps, with static safe messages and no raw response bodies, new account flow or weakened parser checks.
- [x] Run focused/full source checks. If runtime bytes change, issue a new immutable Atom candidate with unchanged shared-UI contract/assets unless an existing reference requires a documented deviation.
- [x] Exercise rendered error/fallback and keyboard/narrow views when copy/controls change; screenshots remain agent-reviewed candidates. Commit the bounded correction.

### Task 3: Actual P03 end-to-end acceptance and one whole review

Files: dedicated HTTPS source-access integration driver/fixture, exact current package metadata and record83/task index/status/roadmap.

- [x] Register ordinary-account synthetic HTTPS cases before running: valid exact manifest/ZIP, separate artifact origin, real native deny/grant/revoke,403, cross-origin redirect, HTML SSO, offline/VPN-equivalent network loss, cancellation, target switch during prompt and local ZIP fallback.
- [x] Execute both exact MV3 hosts, without app-target test CDP or TLS bypass. Assert unchanged app state and production permission, credential/referrer omission and no forbidden endpoint/source-body export.
- [x] Run one whole-P03 review and one bounded correction pass if needed, with current hashes/results and preserved failures. No second review loop or whole-project audit.
- [x] Accept only demonstrated criteria; otherwise keep exact pending gates. Update dependencies and report one next unfinished item, then local commit.


Final scoped acceptance: completion85 and verification47; ONE review/one correction,
2139source/113focused/native48/types2/admission9/build.46 backend27 retained on exact
workers. Initial long app prompt still requires explicit Reopen+Attach; all failures
retained. Next P04 after completed F02/U03/U06. No human gate or publication.
