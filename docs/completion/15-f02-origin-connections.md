# F02 — exact application connections

Status: **complete within F02** on 2026-10-19. Spec: approved
`scope-review-1`, F02 in `03-runtime-and-onboarding.md`. Source base:
`b0606cf603a76561ce5fe118fea52a42deb68f8c`; checks run with the F02 worktree dirty.
This record completes only F02 on the candidate below. F01 and
production source-exploration evidence remain separate historical receipts.

## Implementation and boundaries

- One canonical origin policy replaces fixed ports in capability/platform/runtime,
  standalone sender/manifest and the helper. Ordinary HTTP `localhost`, `127.0.0.1`
  and `[::1]` ports start read-only. URL aliases, credentials, noncanonical origins,
  invalid ports, prefix matches and lookalike implicit loopback grants are denied.
- Browser connection settings save exact `{origin,mode,actions}` records. Individual
  cache/storage reset, reload, response override and replay rights require explicit
  development consent. Records are session-scoped and apply to that exact origin's
  tabs; checked localhost permissions never imply development approval.
- Custom HTTP candidates are visible for explicit approval but cannot be inspected
  without both a site record and browser permission. Both platform and runtime must
  opt into HTTPS. HTTPS remains read-only; F05 grants are not implemented.
- Application, artifact-server and helper access are separate. Source pairing binds
  one exact HTTP app origin to a user-selected confined workspace subtree. Source
  navigation is separately authorized read-only work; it does not grant mutation.
  Production source navigation still awaits a trusted workspace/build association.
- The helper keeps binding only 127.0.0.1. Canonical HTTP URLs with any explicit
  canonical nondefault valid port work; default 47731 remains. No path/query/fragment/credentials,
  hostname aliases, LAN scan, generic proxy or shell startup is accepted.
- Every owned lease use rechecks browser permission, origin, original connection
  identity and permission epoch. Async broker acquisition/approval cannot recover
  stale rights. Cross-origin navigation detaches, even between approved sites.
  Permission withdrawal cancels work and clears unsaved private sources, stale
  bindings and trial buffers; independently saved diagnostics retain their original
  retention/export policy. A permissions removal conservatively clears all active
  site/source contexts. Same-origin reload preserves an approved custom dev mode.
- Picker installation is on demand in the current document in both modes; no
  fixture-only static content script is needed. This is connection support, not
  completion of the broader U05 picker task or a redesign.

## Candidate and evidence identity

Final local Atom candidate: `0.1.0-candidate.20261019.5`, wire/API/capability schema 1.
Shared UI stays `0.2.0-candidate.20261018.2`, visual contract 2.1.0.

Handoff: `.artifacts/atom/2026-10-19T12-35-22-990Z/atom-handoff.json`.
Atom SHA-256: `b9f72231cb43d57c83af8fbe30f8fa422f81266171b020c008597916d8379f6e`.
UI SHA-256: `2bfc8229a45e02f775bb563f27d9a803d51dd977145f46843c45a884e07289e5`.
The handoff's 29 input hashes bind the tarball to tested implementation bytes.
`BUILT_NOT_VERIFIED` in the original pack receipt records that build step;
`f02-verification.json` is the separate acceptance receipt, not an overwritten pack
claim. `.4` and earlier candidates, negative controls and historical results stay.

Node 24.19.0, npm 11.17.0, Playwright 1.63.0, Chromium 153.0.8010.12, Linux.
Browser plugin unavailable; native checks use repository Playwright/MV3 harness,
with sandbox enabled. They are agent-operated, not a human usability study.

| Command | Final result | Receipt |
| --- | --- | --- |
| `npm test` | PASS 603/603 | `.artifacts/atom/f02-work/tests4.log` |
| `npm run verify:atom-contract` | PASS 65/65 | `.artifacts/atom/f02-work/contracts-final.log` |
| `npm run build` | PASS; existing IDE CJS import.meta warnings | `.artifacts/atom/f02-work/build-final.log` |
| `npm run pack:atom` | PASS, clean installed consumer | timestamped handoff above |
| `npm run verify:atom-types` | PASS 2 strict packed consumers, including new site operations and negative type controls | timestamped `type-consumer-result.json` |
| `npm run verify:origin-connections` | PASS 18/18 on packed standalone | `.artifacts/atom/origin-connections/2026-10-19T12-37-08-485Z/result.json` |
| `npm run verify:browser` | PASS 26/26 on packed standalone | `.runtime/browser-runs/f02-candidate5-20261019/native-A.json` |
| `npm run verify:react-host-ui` | PASS_BOUNDED_HOST_UI 11/11, stable inputs, real IDE | `.runtime/react-host-ui-runs/f02-candidate5-20261019/results.json` |
| `npm run verify:production-source-mapping` | PASS 19/19 on packed standalone | `.artifacts/production-source-mapping-2026-10-19T12-40-27-795Z/result.json` |
| `npm run verify:embedding` | PASS 34/34, both installed consumers, real IDE | `.artifacts/atom/verification/2026-10-19T12-41-30-503Z/results.json` |

Native commands use `ATOM_EXTENSION_PATH` pointing to the timestamped packed
standalone, with unique run tags; embedding consumes the handoff's installed
package. No native operation is certified solely by a unit test count.

## What the checks establish

The new native scenario uses real app ports 53001/53002, localhost and IPv6 at
53004, helper 53009, plus a self-signed HTTPS localhost control. Two tabs retain
different modes; source pairing is not inherited. Cross-origin navigation ends
both the old debugger context and delayed map acquisition. Chrome Settings
withdraws actual host access, a pending private map is rejected, and retries
cannot recover access. `permissions.contains/getAll` read real browser state.
The browser's native optional HTTPS permission prompt was not accepted: that run
was interrupted and retained. The final scenario verifies absent HTTPS permission
and denied attachment. It does not claim native optional-prompt acceptance or
complete production HTTPS integration; those remaining source-map/onboarding
acceptances are not silently closed by F02.

Unit controls additionally cover malformed origins/helper URLs, exact port
isolation, custom HTTP approval/reload, denied/missing permission, scope changes
while attaching/acquiring a broker lease, pending approval during revocation,
clearing private stale/trial buffers and both host opt-ins. Existing source-map
identity, delayed import, byte/ZIP safety and historical evidence criteria remain.

One fresh read-only reviewer found four Important issues (five reproductions):
custom HTTP reload mode, private stale/trial retention, two pending authorization
races, and platform-only HTTPS opt-in. All five tests failed before the single
fix pass and passed afterward; full suite is green. No Critical or deferred Minor
findings. Parent-found picker and Basic private-state controls also went RED→GREEN.
The review is source review, not independent certification of native results.

## UI reference reconciliation and remaining work

The supplied design set, its Figma entry manifest, handoff and narrow settings
reference remain authoritative. Native site controls use existing scoped native
primitives inside Browser connection; no shared tokens, generated CSS, branding
or layout primitives changed. Visual comparison uses the supplied
`extension/19-settings-narrow.png` and `atom/01-inputs.png`, plus final native and
embedding screenshots. White Inter shell, borders, spacing and fixed footer remain;
the actual scoped consent fieldset necessarily differs from simulated prototype
Settings with pending Save/Discard edits. F05 production confirmation and U02 editor
states are not copied as working capabilities. Narrow width and keyboard focus
are checked; screenshots are candidates, without human visual approval.

Rulings and costs are recorded in
`../superpowers/plans/2026-10-19-origin-policy.md`: stay on the authorized current
branch; session/exact-origin development scope; 127.0.0.1-only helper transport;
separate artifact grants despite browser port patterns; conservative context
clearing; native optional prompt limitation; custom candidate listing without
authority. A different persistence/helper policy would require a later scoped
change, not retrospective approval. Historical saved evidence is preserved.

Next single unfinished dependency: **F03 — installable open helper/dev-plugin
workflow**, after F01 and F02. No SDK, other repository, publication, new redesign,
Live/Draft, Action Trace, local model or production permission workflow is delivered
by these documents or by this connection increment.
