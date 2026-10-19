# F01 — Capability policy and packed public contracts

Date: **2026-10-19**, Indian/Mauritius. Scope: F01 only, `scope-review-1`.
Base: `7a9f718` plus this implementation overlay. Native receipts retain that
actual base/dirty state and source hashes rather than inventing a future commit.
Status: **F01 complete** for the recorded `.3` candidate: implemented and
native-verified. Not official-host integrated, released or independently user-verified.

## Delivered behavior

`packages/atom/src/capabilities.mjs` now owns the existing origin/bridge rules,
operation admission and debugger-command resource mapping. Runtime and platform
use it; the UI validates and consumes runtime availability/reasons. Discovery is
side-effect-free and cannot grant authority. Read-only HTTPS still requires both
host opt-ins and current site permission; no production editing is added.

Wire/API remains v1. `capabilities` and `state.capabilityPolicy` advertise a
versioned descriptor and explicit feature IDs. Missing/invalid old-host discovery
is unavailable rather than inferred from wire version. Source connection,
supported source bindings, recorded operands and operation permission stay
separate. A05/U02/F05 remain explicitly unimplemented; local model availability
still requires its device check, not a fallback success.

Current permission and lease facts are read without acquiring/attaching. Missing
ownership facts fail closed, even from a custom JS platform. Caller grant arrays
are copied. Forged UI policy, historical metadata or another lease with the same
owner label cannot authorize operations. Cancellation during admission stops
dispatch before native attach/cache effects. Metadata remains readable when
inspection is refused; every deep-refresh branch uses inspection admission.

The existing layout, tokens and primitives are retained. Disabled controls expose
their reason; opted-in HTTPS offers **Allow site and attach** so permission can
actually be requested. This is distinct from already-admitted inspection. Restore
requires an investigation target, including a retained stale target. Clearing a
selection keeps same-target picker/selector controls usable; changing tabs clears
the old policy. The shared UI reference set is unchanged.

## Artifact and public types

Final Atom candidate: **`0.1.0-candidate.20261019.3`**, exact UI peer
`0.2.0-candidate.20261018.2`, visual contract 2.1.0, capability schema 1.
The `.1`/`.2` intermediate bytes/results are retained separately. The final pair and
installed consumer are recorded in
`.artifacts/atom/2026-10-19T11-49-25-380Z/atom-handoff.json`.
The separate `f01-verification.json` beside it joins the actual check receipts
to the same artifact hashes; the packing handoff retains its original build record.

- Atom SHA-256: `3fea09fc6f7c709442d4e1f0ea98f99dc467104b59056c653599577440fa1803`.
- UI SHA-256: `2bfc8229a45e02f775bb563f27d9a803d51dd977145f46843c45a884e07289e5`.
- TypeScript **5.9.3** is a pinned development dependency only.

`verify:atom-types` hash-checks and installs the actual tarballs into a fresh
consumer, resolves every exported asset under its node_modules and compiles all
four code entrypoints with strict NodeNext and browser Bundler resolution,
`skipLibCheck:false`. Negative request typings must fail compilation. Existing
extensionless declaration imports were exposed by NodeNext and corrected. No
repository-relative declaration fallback or compiler enters the browser package.

## Checks and evidence boundaries

Configuration: Linux, Node 24.19.0/npm 11.17.0, Playwright 1.63.0 / Chromium
153.0.8010.12; real VS Code Extension Host with the public development helper,
not a new installed-VSIX acceptance. Browser plugin/skill is not listed; repository Playwright is
used, and that method is recorded. Browser/IDE suites sharing ports run sequentially.

| Command | Result |
| --- | --- |
| `npm run verify:atom-contract` | 48/48 unit/API harness assertions |
| `npm test` | 586/586, 0 failed/skipped |
| `npm run build` | PASS; existing IDE CJS `import.meta` warnings retained |
| `npm run pack:atom` | PASS; new `.3` artifacts, clean installed consumer and both browser hosts |
| `npm run verify:atom-types` | PASS, strict packed NodeNext and browser consumers |
| `npm run verify:capability-ui` | 5/5 rendered controlled-client cases |
| `npm run verify:embedding` | 34/34; current pair, two real MV3 hosts and IDE navigation |
| `ATOM_EXTENSION_PATH=<handoff standalone> BROWSER_TAG=f01-candidate3-20261019 npm run verify:browser` | 26/26; stable inputs, no recorded errors; original ABA→reinspect case passes |
| `ATOM_EXTENSION_PATH=<handoff standalone> ACTION_TAG=f01-candidate3-20261019 npm run verify:actions` | 32/32; stable recorded inputs, no health errors |
| `ATOM_EXTENSION_PATH=<handoff standalone> npm run verify:production-source-mapping` | 19/19; read-only minified fixture, no IDE/plugin or element/source anchor claim |

Final local receipts:

- `.artifacts/atom/2026-10-19T11-49-25-380Z/type-consumer-result.json`.
- `.artifacts/atom/capability-ui/2026-10-19T11-51-44-984Z/result.json`.
- `.artifacts/atom/verification/2026-10-19T11-52-28-787Z/results.json`.
- `.runtime/browser-runs/f01-candidate3-20261019/native-A.json`.
- `.runtime/action-runs/f01-candidate3-20261019/results.json`.
- `.artifacts/production-source-mapping-2026-10-19T11-55-13-798Z/result.json`.

The final handoff's 28 source-input hashes match this source tree. Browser and
Action receipts retain stable before/after inputs. Logs, RED attempts and reviewed
patch are retained beside the final handoff in `f01-logs/`. Native suites ran
sequentially against the same final standalone bytes; no product source changed
during them. Scope audit 01/evidence and approved 02/12 remain byte-preserved.

The UI fixture checks legacy discovery, admitted/denied controls, selection-clear
recovery and the permission-request callback. Its simulated client does not prove
Chrome's native permission dialog or application-picker suppression. Actual MV3
checks have their own receipts. Two-host example acceptance is not official
StatePort/Capture integration. Screenshots remain candidates, not human approval.

Reference comparison used the supplied `design/README_RU.md`, handoff, screen
index/current-entry metadata and `design/screens/atom/01-inputs.png` under
`packages/extension-ui`. The rendered first viewport retains the 440px white
sheet, Inter typography, dark source block, aligned value rows and fixed footer.
Existing deliberate deviations remain: actual read-only observed values replace
prototype editable toggles; Property/selector tools and Inspect again/Diagnostic
replace simulated mode/Apply/Brief controls, and Capture is not added. F01 changes
availability/reasons and permission wording, not geometry/tokens or this layout.
Keyboard, narrow-view and neighboring-style checks are automated evidence;
reference screenshots remain candidates rather than a new fidelity approval.

## Retained failures and review rulings

- Initial policy test failed because capability discovery did not exist. Added
  grant-array and descriptor-shape controls failed before their corrections.
- The old packed `.3` declarations failed the new consumer; NodeNext also exposed
  extensionless imports. The saved `.3` artifact was not replaced.
- The first sandbox install hit DNS restrictions; the authorized compiler install
  succeeded with host access. The first type-consumer attempt hit sandbox child
  process `EPERM`; the same command then ran with host access. These are execution
  blockers, not passing tests or product defects.
- Independent read-only code review found four material cases: blocked HTTPS
  permission-request path, one refresh injection bypass, missing lease facts and
  late cancelled attach. Each has a failing-before-fix regression, now green.
  The stale-action availability finding was treated as material for F01's
  consistency criterion and fixed from the same public freshness projection.
- The cancellation fixture now attaches before reading metrics. The worker VM
  fixture explicitly supplies policy functions and target facts. Their original
  cancellation/source-race assertions remain; a missing import/lease is not a
  semantic failure of those assertions.
- Current embedding initially failed an old blanket ban on all npm browser
  inputs. Exactly three existing browser entrypoints from the approved
  `@jridgewell` map stack are admitted; Node/compiler/IDE and other npm inputs
  remain forbidden, with positive and negative controls. Historical extraction
  acceptance is not rewritten and no analyzer is moved into the browser.
- A separate initial-state control exposed Restore before investigation. `.2`
  adds its refusal while retaining stale-target recovery; `.1` is unchanged.
- The `.2` real Basic run stopped after eight passing checks: after the complete
  ABA experiment/cleanup the UI retained an old busy policy and disabled Inspect
  again. That failed run remains at
  `.runtime/browser-runs/f01-candidate2-20261019/native-A.json`, with stable inputs.
  A failing-before-fix terminal-notification control now covers cleanup on failure;
  `.3` publishes availability after admitted intervention completion on either
  outcome. The original busy checks and native ABA assertions remain unchanged.

No original experiment threshold, six-family result, controlled first-read
profile, Vue PARTIAL or claim-level evidence kind changes. No SDK, other repo,
publication, live-model success or production mutation grant is implemented.

## Following item

The single next item is **F02 — explicit site/project policy outside fixture
ports**, whose F01 prerequisite is complete. F04's paired-consumer slice is
credited without starting that item: reproducibility and official intake still
have their own gates. This execution stops before F02.
