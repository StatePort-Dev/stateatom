# F02: exact application connections

Spec: docs/completion/03-runtime-and-onboarding.md#f02. Base: b0606cf.
Only F02; F03 onboarding, F05 production grants and U02 editing are excluded.

1. RED: origin/helper validation, explicit development grants, isolation and revocation/races.
2. Implement one canonical origin policy; platform owns validated session site records and revalidates every lease use. Runtime/transport/standalone/UI and helper consume it. Browser permission is necessary, never sufficient for development mutations. Source pairing is exact-origin and separate.
3. Native nonfixture loopback connections, actual browser permission state, revocation and navigation. Preserve original Basic/React/source-map checks, adding explicit development consent where the existing scenario requires mutations/instrumentation.
4. Run focused and full contracts/build, pack unique candidate, Basic/React/source-map native checks and one fresh review. Record exact evidence; update index/roadmap and commit locally. Next F03 only.

Ruling: continue in current main checkout under the user's explicit whole-worktree commit/continue instruction and branch preference.
Ruling: application approval is session-scoped, exact scheme/host/port; changing origins always detaches. HTTPS is always read-only in F02. Development grants are individual cache/reload/override/replay rights; UI explains each and requires checking them before saving. Default localhost access is read-only.
Ruling: helper transport supports only canonical http://127.0.0.1:<explicit port>, no path/query/credentials. This matches the helper's existing bind address; localhost/IPv6 application support does not imply alternate helper transport.
Ruling: Chrome host patterns can cover multiple ports; Atom records remain exact-port. Application records do not grant artifact or helper browser access. Independent human review is not a release blocker; screenshots remain candidates.

## Ledger
- Started: clean b0606cf; prior F01 tests/evidence retained, no historical experiments repeated.
- RED→GREEN: first 6 origin policy tests failed on fixed ports, implicit mutation, absent records and cached lease; all passed after canonical policy/platform implementation. Expanded to 8 controls.
- Original VM runtime source tests required explicit `permittedOrigin` and exact pairing origin in their host fixture. Their pending/eviction/source-change assertions are unchanged; 16/16 passed.
- Full suite first completed run: 593/594; one minimal DOM harness lacks `selectedOptions`, fixed optional access in UI; targeted 20/20. Earlier timed-out VM run and native optional-prompt interruption retained under `.artifacts/atom/f02-work/`.
- Ruling: native optional prompt acceptance is not automatable in this harness. Verify ungranted HTTPS via real `permissions.contains` and denied attach; revoke actual required loopback host access through Chrome extensions settings UI. Do not claim native prompt acceptance.
- Native intermediate run: 17/17 PASS, Chromium 153.0.8010.12; `.artifacts/atom/origin-connections/2026-10-19T12-29-37-718Z/result.json`. Ordinary ports 53001/53002, localhost/IPv6 53004, helper 53009; Chrome settings withdrawal rejected pending source-map download and retry. Actual optional HTTPS permission absent; direct attach denied. No native optional prompt acceptance claimed.
- RED→GREEN: private Basic state without attach origin cleared on denial (9-test origin slice); candidate listing/default-host HTTPS bypass tests failed before fixes and passed after. Focused suite now 75/75.
- Ruling: list canonical HTTP candidates for explicit connection approval without admitting inspection, so additional development hostnames are reachable in settings. HTTPS remains behind the host's separate readOnlySites opt-in.
- One fresh read-only review found four Important issues, no Critical/Minor. Five reproductions all failed before one fix pass and passed after: custom HTTP reload, private stale/trial buffers, broker acquisition downgrade, pending permission removal approval, platform-only HTTPS opt-in. Focused suite 93/93.
- Final: fixed all four findings (five RED→GREEN controls). Private unsaved state is cleared on authority loss; separately saved diagnostics/historical receipts retain original policy. Leases bind the pre-await connection identity/epoch; pending connection approval checks epoch after its final awaited context read. Both host constructors must opt into HTTPS.
- Review declined no necessary behavior: native optional prompt acceptance is explicitly absent; source-map identity checks remain scoped; source review is not independent native or visual acceptance. These boundaries stand and do not block this item. No minor findings deferred.
- Dynamic picker RED→GREEN: install in current document for development as well as read-only, requiring read/inject; no fixed-port content scripts needed. Candidate `.4` retained as built intermediate without final verification. Final candidate is `.5`; shared UI peer remains unchanged.
- Final verification on `.5`: npm test 603/603; atom-contract 65/65; build PASS; pack PASS; strict installed NodeNext/Bundler consumers 2/2. Final native origin 18/18 (includes delayed source acquisition during cross-origin navigation), Basic 26/26, React-host 11/11, source maps 19/19, two-host embedding 34/34. Source manifest 29/29 matches. Full receipts: docs/completion/15-f02-origin-connections.md.
- Task F02 complete; index and active roadmap advance to F03 only. F01 and source-exploration historical entries/evidence retained. No additional implementation item started, publication/push or other-repository mutation.
