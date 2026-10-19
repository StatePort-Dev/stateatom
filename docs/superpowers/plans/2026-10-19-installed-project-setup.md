# F03 installed project setup implementation plan

Goal: install the open helper and Vite plugin into a clean ordinary React project;
use a private versioned connection receipt; preserve Basic and historical evidence.
Spec: docs/completion/03-runtime-and-onboarding.md F03, approved scope-review-1.
Base: fa0cfb231e0f06595d9b071b4dd745be1ffe2163. Only F03; no publication/SDK/redesign.

1. RED→GREEN: private receipt validation/session identity, trusted source-root choice,
   port failure, plugin config conflicts and missing/mismatched source repair hints.
2. Reuse core bridge/analyzer and existing Vite transform. Add a locally packable
   public dev-plugin boundary with one implementation and actual runtime assets;
   generate notices. Build an installable VSIX and immutable artifact receipt.
3. Add receipt paste/pair to existing Source connection disclosure; no secret URL,
   account or automatic application config edits. Version failures keep Basic.
4. Native independent-project scenario: install plugin tarball and VSIX into clean
   app with ordinary src/ui files/port; exact Open in IDE, state/reinspect, HMR,
   disconnect/remove integration and confirm production/uninstrumented output.
5. Verify installed-helper regressions (React, short-loop, first-read separately),
   relevant/full tests/build and packed consumers. One fresh review, one fix pass.
   Record evidence and commit; name one next item only.

## Rulings / ledger
- Continue in the current branch under existing user authorization; do not restart F01/F02.
- Existing installed-VSIX identity checks are reusable; development-host tests remain
  contributor controls, not installed distribution proof.
- Supported normal project: Vite 7.3.7 + React/React DOM 18.3.1 with explicit classic
  JSX; @vitejs/plugin-react/automatic JSX conflicts are detected rather than inferred
  compatible. Other bundlers/versions retain Unknown/Unsupported.
- Receipt is private clipboard JSON, never a URL; it binds protocol/helper version,
  session, workspace ID, canonical app origin and source subtree. Manual legacy
  pairing remains for contributors; newly connected helper version is checked.
- Installation is local artifacts only. Private temp profiles and receipts are not
  published or committed. Public example uses synthetic data and no hidden hints.
- RED→GREEN: receipt schema/session/origin/path validation, setup hints, transform conflict,
  transport validation, occupied-port/session/trust controls. Real-port test needs escalation;
  sandbox EPERM preserved as environment failure, then real test passed.
- Ruling: retain `src/engine/plugin.mjs` byte-for-byte (owned first-read recipe pin).
  Public install compatibility checks live in a thin `vite-install.mjs` wrapper;
  packaged normal transform delegates to the existing implementation. No repinning,
  widened closed profile, criterion change or duplicate transformer. VM runtime tests
  receive new pure setup functions explicitly; original race assertions unchanged.
- Native intermediate `.2`/helper 0.1.2: PASS 16 checks on independently structured
  Vite app, including real installed VSIX identity, exact source range, ordinary
  state/reinspect, source mismatch/HMR, Basic disconnect and plugin uninstall.
  Receipt: .artifacts/project-setup/2026-10-19T13-00-19-781Z/result.json.
- Fresh review: one Important startup→Disconnect race. Deterministic actual-source
  VM test failed, then passed with generation cancellation and serialized competing
  starts; receipt reads also pin session identity across awaits. One Minor removal
  evidence gap is treated as F03 acceptance work: add actual IDE Disconnect and
  isolated VSIX uninstall checks. No rereview; one fix pass and final green suite.
- First native attempt stopped at offline metadata ENOTCACHED, not product failure.
  Normal prefer-offline public dependency install succeeded; no registry publication.
- Final ordinary project run: PASS 18/18, Atom `.6`, installed helper 0.1.3/plugin `.2`;
  includes actual public IDE Disconnect command, closed helper port, isolated VSIX
  uninstall, production build without instrumentation and Basic after plugin removal.
  Receipt: .artifacts/project-setup/2026-10-19T13-04-15-656Z/result.json.
- Full final unit suite: 612/612. Packed Atom strict NodeNext/Bundler consumers: 2 PASS.
  Shared UI remains unchanged; Browser plugin absent, repository Playwright used.
- Required short-loop first final run CHECK_ERRORS retained. Focused reads show runtime
  status/nodes are Observed, but the legacy harness searches one-line `name = value`
  in a two-cell UI with a line break; a native focused picker control succeeds.
  Synchronize property-change completion before picking; verify exact expression
  label and JSON value in the same visible operand row. This preserves (and makes
  structural) the original V criterion, not an evidence downgrade. No product or
  historical pinned transform changes. Rerun with a new unique tag.
- Final short-loop: COMPLETED_WITH_EXPLICIT_PARTIALS, 107 checks (including
  installed identity), original 20 PASS / 10 expected PARTIAL, 2 hypotheses PASS,
  no errors, stable source/build/fixtures. React-host installed regression: 12 PASS.
- Required installed first-read regression FAIL retained at
  .runtime/first-read-ui-runs/f03-installed-20261019/results.json. Exact installed
  helper identity passes, then initial P2 is safely refused as changed code history;
  later first-read controls were not reached. Stable inputs do not make it pass.
- Focused native diagnostic reproduction f03-journal-probe-20261019 confirms the
  final isolated identity-helper compilation after the proof snapshot/resolver
  wait. No product fix, retry, ignored event or weakened proof criterion is applied.
  F03 remains active/incomplete; next bounded step is that freshness repair with
  original DOM identity and unknown-code/storage-race controls retained, followed
  by a fresh installed first-read regression. F04 is not started.

## F03 freshness repair continuation — base 6d8650f

- Ruling: replace only `identifySelection`'s isolated script execution with native
  CDP DOM acquisition. Browser-owned backend document/node IDs cannot be copied
  through application attributes; repeat selector/document checks around acquisition.
  All journal and post-storage checks remain unchanged. No newer snapshot replaces
  the proof's original one. The original transform/profile pins stay untouched.
- Native text includes whitespace, excludes comments/shadow contents like native
  textContent, and is bounded to 32 levels, 2048 nodes, 128000 UTF-16 units. Missing
  children or budget overflow deny identity rather than returning a known empty value.
  Native HTML button disabled reflects its own attribute; other namespaces/XML,
  closed shadow paths and unavailable CDP facts deny rather than guess.
- RED: original identity executes a script, failing the new no-compilation control.
  Separate whitespace and non-HTML uppercase-name controls caught incorrect text
  joining and a namespace ambiguity; all pass after their narrow corrections.
- Focused actual Chromium control passed five checks: stable identity without
  Debugger.scriptParsed, exact whitespace, open/closed shadow boundary, no page getter
  invocation, equal-value replacement and navigation invalidation. This mechanism
  check does not replace the required installed panel/helper regression.
- Candidate `.7` is new; helper 0.1.3/plugin `.2` and shared UI bytes remain unchanged.
  Next: full tests/build/pack/types; installed first-read plus affected ordinary
  setup/React/short-loop and Basic checks on `.7`; one focused source review;
  bind final artifact/run receipts and accept F03 only if its original gates pass.
- Read broker explicitly admits only three added metadata commands: DOM.enable,
  DOM.describeNode and DOM.pushNodesByBackendIdsToFrontend. A read-only lease still
  rejects DOM writes, Runtime.evaluate and Runtime.compileScript (RED→GREEN).
- Intermediate full suite: 615 PASS / 2 reported failures (one failing channel
  subtest and its parent). Its future-session fixture computed now+60s once before
  a slow sequence, so the alleged future time became past before validation.
  Ruling: generate that future timestamp at each HTTP reply; preserve the original
  future-time rejection criterion and all production validators. Retain the failed
  log; rerun the suite sequentially before native suites sharing port 4173.
- Final full suite: 618/618 PASS; contract: 66/66 PASS. One focused fresh reviewer
  reported no Critical/Important/Minor findings in the repair diff; its limit is
  source review, not native certification. No review fixes or rereview needed.
- Final build succeeds with the existing IDE CJS import.meta warnings. The helper
  bundle remains byte-identical (`4fd43e5d...`), so retain the exact 0.1.3 VSIX and
  plugin `.2`; no replacement artifacts under those versions are issued.
- New Atom `.7` tarball SHA-256
  `843634e12106e324a596e65f6423f2ba6f0ab7a89f805633405035b9eea29738`;
  handoff `.artifacts/atom/2026-10-19T13-45-43-309Z/atom-handoff.json`.
  Shared UI `.20261018.2` stays at its original `2bfc8229...` digest.
- Installed `.7` first-read: 9 PASS, then timeout waiting for trial result. Original
  P1/P2, exact IDE ranges, export and unknown-MAIN refusal pass. The final availability
  invalidation reloads the panel, whose unconditional atom-result reset erases the
  completed result. Retain FAIL and screenshot; this does not pass the complete suite.
- Ruling: render controlled results from their existing bounded diagnostic record,
  matched by experiment ID and selected/historical target; label them Historical.
  Preserve a successful Restore notice for that exact experiment/tab epoch. New
  investigation/property, mismatched target, disconnect and tab changes cannot borrow
  it. No evidence level, trial threshold, runtime mutation or layout change.
- RED→GREEN panel control: completion survives repeated state renders; Restore also
  survives; stale target stays stale; mismatched target and old-tab reply stay clear.
  New `.8` is required; issued `.7` bytes remain untouched. Repeat only affected
  current-candidate acceptance, including the required full installed first-read gate.
- Focused review of the newly uncovered UI change found one Important Restore
  completion bypass: its final direct assignment could overwrite a revoked/mismatched
  state returned by its own load. RED controls reproduce property-change/revocation
  during that load. One fix pass makes renderInspection the sole final renderer,
  binds the notice to origin/tab epoch/selection generation/target/property and
  matching experiment where present; the focused 51-test slice passes. No rereview.
- Final `.8` build/pack and two strict consumers pass; full suite 618/618.
  Tarball SHA-256 `58da6251b0c88ccdf9cba5086b43b1daaf47aa3047d63c8e4be750c52b2dc2a8`,
  handoff `.artifacts/atom/2026-10-19T13-57-27-228Z/atom-handoff.json`.
- First `.8` native attempt stops before product checks at actual IDE Workspace
  Trust/activation readiness. Retain its FAIL at f03-final-installed-20261019;
  read-only check confirms test CDP port 49331 is free after cleanup. Retry once
  with a new isolated profile/tag; never disable or bypass the real trust gate.
- `.8` installed first-read retry: PASS_FIRST_READ_PRODUCT_UI, 17/17, errors [],
  inputsStable true, same exact 0.1.3 VSIX. Original P1/P2, refreshed proof, IDE,
  exports, interventions/rollback/Restore, writers/CSP/foreign-window refusals and
  passive reader all pass. Receipt:
  .runtime/first-read-ui-runs/f03-final-installed-retry-20261019/results.json.
  Earlier FAIL receipts remain unchanged. Run affected normal workflows next.
- `.8` installed React-host: PASS_BOUNDED_HOST_UI 12/12, stable inputs, errors [].
  Receipt: .runtime/react-host-ui-runs/f03-final-20261019/results.json.
  Existing duplicate-key fixture warnings are intentional control cases, not errors.
- `.8` installed short-loop: COMPLETED_WITH_EXPLICIT_PARTIALS, 107 checks,
  original 20 PASS / 10 expected PARTIAL, 2 hypotheses PASS, errors [], source/build/
  fixtures stable. Receipt: .runtime/short-loop-runs/f03-final-20261019/results.json.
- First `.8` ordinary-project run stops after 5 PASS at ERR_ABORTED: Vite reconnect
  navigation supersedes explicit page.reload after plugin install/server restart.
  Retain .artifacts/project-setup/2026-10-19T14-08-04-337Z/result.json as FAIL.
  Driver now waits for the replacement document/network quiescence in this no-polling
  example and retains every existing plugin/source/HMR/removal assertion. An expected
  aborted reload is recorded separately; no inspection is retried or accepted on error.
- This is the only driver change after first-read/React/short-loop PASS; product
  source, `.8` bytes, their entrypoints and imported harness dependencies are unchanged.
  Their broad test-directory inventories retain the old project-setup driver hash
  (Git blob 6d8650f:tests/integration/project-setup.mjs), rather than forcing unrelated
  native reruns. Record that explicit harness-only delta in final verification.
- Final `.8` ordinary-project retry: PASS 18/18, errors [], including all original
  install/source/state/HMR/disconnect/production/uninstall/Basic/VSIX-removal gates.
  Receipt: .artifacts/project-setup/2026-10-19T14-10-36-327Z/result.json.
  All required F03 native suites are now green within their declared scopes.
  Next single unfinished item after final receipt/commit: F04; do not start it here.
- Additional `.8` Basic UI regression: PASS 26/26, stable inputs, no errors,
  including equal-value node replacement, ABA, export and offline reader.
  Receipt: .runtime/browser-runs/f03-final-20261019/native-A.json.
- Final verification: PASS_BOUNDED_F03; four artifact files, 50 packed manifest
  entries, five unbundled plugin runtime assets and 617 current run input hashes
  match. The sole explicitly recorded delta is the non-executed project driver in
  first-read's broad inventory. Four negative receipts and .6/.7 artifact bytes are
  retained. Sidecar: .artifacts/f03-freshness/f03-verification.json; bind its 611
  source-file hashes to the final local commit. F03 complete; next F04 only.
