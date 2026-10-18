# Local developer-preview acceptance — 2026-10-18

The React inspection loop is accepted by the authorized **agent-operated**
procedure. The whole roadmap is **not complete**. Original selected P2 and P1
complete HTTP traces remain NOT MET: the parse-to-specific-read field revision/
dataflow verifier is absent. Independent human usability and publication are
separate, uncompleted gates. No release, Store submission or account mutation was
performed for this candidate.

## Candidate and reproducibility

Work continued on dirty main above
`bcde3d0f1572878df662db6bab79e65bc66dd6d0`. The final frozen source candidate is
`/tmp/stateatom-roadmap-preview-final-20261018`: 277 regular source files, without
Git metadata, inherited dependencies, generated outputs, old experiment files,
local npm configuration or unrelated docs/design and docs/features work.
The exact per-file manifest is
`.runtime/roadmap-closeout/final-20261018/source-manifest.json`.

The locked installation added 261 packages afresh from a cache previously verified
against the public npm registry. It inherited neither node_modules nor build
outputs. This is not an empty-cache network installation claim. Node 24.19.0,
npm 11.17.0, Playwright 1.63.0, Chromium 153.0.8010.12, React/ReactDOM 18.3.1 dev
and Vite 7.3.7 were used. Browser/VS Code binaries remain host prerequisites.
Installation, 413 unit tests and build passed in that source archive.

Run native harnesses sequentially, without a separately started dev server, using
new tags from the new checkout:

```sh
npm ci
npm test
npm run build
npm run prepare:short-loop
SHORT_TAG="short-$(date +%s)" npm run verify:short-loop
HOST_UI_TAG="ui-$(date +%s)" npm run verify:code-journal-ui
```

The first two commands are bootstrap checks rather than a required repeat for
every unchanged run. The short harness is the retained mechanism regression; the
UI harness operates the real panel and IDE. The experimental operand/compiler
checks are separate, and do not add product support:

```sh
INVOCATION_TAG="operands-$(date +%s)" npm run verify:observer-operands
COMPILER_TAG="compiler-$(date +%s)" npm run verify:observer-closure
```

## Actual UI acceptance

The final run `clean-roadmap-accepted-20261018` in the frozen candidate passed
**27 actual UI checks** with stable inputs and no page/harness errors. The script
operated the real extension panel and graphical development Extension Host:

- Selected original React P2 disabled and P1 text properties; showed actual scoped
  committed host-prop/state handoffs, source expressions and available observations.
- Opened the exact corresponding source ranges in the real IDE.
- Changed the form and inspected again; obtained a new execution/value. Property
  changes, picker restart and navigation cleared or invalidated old observations;
  reinspection after navigation obtained a fresh page result.
- Displayed unsupported cloned-host correspondence and the source/private-writer,
  CSP, same-value and native-write limitations without a full provenance claim.
- Saved, reviewed and exported ten synthetic diagnostics; opened them in a fresh
  passive reader without the original IDE/server connection. Compilation metadata
  was historical and untrusted on import, with no privileged action authority.

The supported useful conclusion is scoped: P1 displayed 13 with observed shown/
allowance values 13/12, and P2's selected committed disabled computation had its
observed values and matching source range. Exact browser exchange identity is
displayed where the acquisition gate permits it; it does not establish that the
current field value originated in that exchange. Current-field ancestry remains
explicitly Unknown. A marker alone does not establish a unique property producer.

Screenshots of the app, positive panel and fresh reader were visually reviewed.
No clipping was observed in those recorded views. The short loop separately
checks the 390-pixel panel for horizontal overflow. This is not a general responsive
or accessibility audit.

There are recorded console caveats: favicon 404 and Vite WebSocket local-network/
CSP blocking in negative contexts. The intentionally duplicated JSX prop emits a
compiler warning in its negative fixture. No claim of a clean console is made.
The primary route's source-edit HMR was tested separately in a disposable mutable
copy: changing shared/logic.ts threshold 20 to 30 produced a full reload, new page
identity, disabled false to true, and a new Observed commit without page errors.
This native control is not a panel UI source-edit check or the original deep case.

An earlier clean-candidate UI attempt failed because Playwright's default
screenshot caret hiding changed the form's style and correctly invalidated the
host observation. A real isolated control reproduced two style mutations with
caret hiding and none with caret:initial. The harness screenshot now uses the
latter; the product freshness guard was retained. Failed evidence is preserved.

## Harness results, separately

| Check | Result and boundary |
| --- | --- |
| Fresh final source install/tests/build | PASS, 413 tests; 36 generated files match checkout outputs |
| Marker/short loop | 106 checks; 20 PASS, 10 expected PARTIAL; source/build/fixture stability true; no errors |
| Compiler acquisition and refusal controls | 43 PASS, stable 74 source and 19 dependency inputs; no errors |
| Original read-operand acquisition | 23 PASS, stable 73 source inputs; no errors; original bounded read and later descriptor kept separate |
| Dependency advisory lookup | 15 records before repair, zero after exact dependency updates; not a security certification |
| Primary source-edit HMR control | PASS in mutable copied source; native mechanism, not panel UI |
| Local VSIX packaging/install | PASS package, isolated CLI install/list; installed VSIX GUI workflow unverified |

The 43 compiler checks ran in the checkout; the 23 operand checks ran in the
preceding clean dependency candidate. They are explicitly reused: their exact
source inputs match the final frozen candidate; all 19 compiler dependency inputs
match, and both candidates have the same lock/dependency installation. The sole
code change between the clean dependency and final candidates is the UI harness,
outside those native input sets. The final UI and 413-test/build checks were fresh.
This avoids repeating unaffected native checks merely for a new directory name.

Vue PARTIAL outcomes remain expected negative controls, not successful Vue support.
The old 1,527 historical file hashes and 241 original short-loop hashes all match.
Old reports, failed attempts, generated evidence and frozen candidates were not
rewritten. The historical six-family 0/6 criterion is not upgraded.

## Local review artifacts and data handling

`.runtime/roadmap-preview/20261018/` contains the exact source archive, unpacked
browser ZIP, passive-reader ZIP, local VSIX, reviewed synthetic diagnostics,
three screenshots, metadata-only check copies, source manifest and SHA256SUMS.
Archive contents/checksums and required MIT/Apache notices were verified. The
VSIX retains publisher local-research and mixed (MIT AND Apache-2.0) metadata,
with generated third-party notices; historical source is not relicensed.

The VSIX was CLI-installed/listed as local-research.stateatom-dev-helper@0.1.0
only in isolated disposable directories. The UI acceptance used a development
Extension Host, so this is not installed-product GUI acceptance. No user's normal
extension profile was changed. No Marketplace or official publication identity
was established.

Raw console, profiles, remote handles, scope dumps and native code bodies are
excluded from the review package. Metadata copies redact candidate path prefixes;
raw Vite WebSocket token logs remain private. The reviewed diagnostics are actual
UI exports using synthetic data. No State Cards or captures were fabricated.

Gitleaks scanned the final local package including archives with no findings.
The first scan flagged nine SHA-256 values paired with write-access filenames as
generic API keys. They were verified against the actual source hashes. Review
copies now use explicit file/sha256 fields, retaining every hash; the original
scan/report is preserved. No ignore rule or suppressed secret was introduced.
The zero-findings result is a scanner result, not a guarantee that sharing all
other local evidence is safe. Private GitHub reporting was separately read-checked
enabled:true; no vulnerability report was submitted.

## Remaining work and exact next capability

The [consolidated attempt](2026-10-18-roadmap-closeout.md) retains the missing
mechanism and counterexample. An unrelated literal 12 written before the specific
read can leave receiver/key, native descriptor and observed scalar identical.
Current mechanisms cannot distinguish its field revision from the parsed value's
revision. A later 99 write does not erase the already acquired scalar 12; eternal
readonly and recursive attestation of every telemetry helper are not requirements.

The next implementation task is one **bounded parse-to-read revision/dataflow
verifier**, covering original P2 member and P1 destructuring, with competing
pre-read alias writers refused, then accepted through the actual product UI.
This is a new analysis capability, not a packaging fix or a value-equality fallback.
Until it exists, milestone 1 is NOT MET. Authorized agent fallback does not create
independent human evidence, and local packaging does not complete publication or
the roadmap's narrow-alpha criterion.

This acceptance record and the status/roadmap pointers were written after the
frozen source was tested. They are documentation addenda in the working checkout,
not silently inserted into the accepted 277-file archive. Their later hashes are
recorded in the final checkout check; product/harness fingerprints remain unchanged.
