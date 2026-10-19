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
