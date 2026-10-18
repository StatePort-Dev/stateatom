# Closed first-read developer preview — 2026-10-18

The new controlled-project profile supports the complete original React **P2**
(disabled property) and structurally distinct **P1** (destructured text) path to
one exact HTTP exchange and `/rules/quota` read. The real panel presents a scoped
**Supported finite trace**, with Code-linked finite source/effect proof separated
from Observed event/identity records. This is not general field-history support.

Work remains uncommitted on main above
`bcde3d0f1572878df662db6bab79e65bc66dd6d0`; per-file manifests identify the actual
candidate. No old experiment, frozen candidate or historical A/B result is changed.
Independent source review found no Critical/Important findings in the bounded
increment. Its one documentation finding is addressed in the
[reviewed derivation](2026-10-18-first-read-proof.md).

## Reproduce

Use Node 24.19.0/npm 11.17.0 on Linux x64, matching Playwright Chromium and a
sandboxed graphical VS Code host. See the [root setup](../../README.md) and
[profile instructions](../../stateatom-field-revision/README.md). After the locked
install/build, start `npm run dev:first-read`, pair the open IDE in its panel,
attach the inert setup tab, then follow the app link. No account, Desktop, paid AI
or private resolver is required. Stop other dev servers before automated checks.
Run native checks sequentially with new tags:

```sh
npm ci --no-audit --no-fund
npm test
npm run build
FIRST_READ_TAG="query-$(date +%s)" npm run verify:first-read-query
FIRST_SESSION_TAG="session-$(date +%s)" npm run verify:first-read-session
FIRST_UI_TAG="ui-$(date +%s)" npm run verify:first-read-ui
# Installed helper: append -- --installed-vsix=/absolute/path/to/helper.vsix
```

The retained short regression is separate; prepare its optional pinned public
TodoMVC applications once:

```sh
npm run prepare:short-loop
SHORT_TAG="short-$(date +%s)" npm run verify:short-loop
# Optional independent-application regression after prepare:independent:
INDEPENDENT_TAG="apps-$(date +%s)" npm run verify:independent
```

Installation/build are bootstrap steps, not mandatory repeats for unchanged runs.
There is no inherited lint/typecheck command. The mechanisms do not rerun user
expressions, functions or getters for extraction.

## Actual interface evidence

Run `closed-profile-installed-gated-20261018` passed **17 actual UI checks**, with
stable inputs and no harness errors. Its real graphical Extension Host loaded the
exact locally packaged VSIX in an isolated installed-extensions directory, not an
extensionDevelopmentPath copy. VSIX SHA-256:
`a97a2bdc68f48a4a5532cae8655155173984f91cf7d11715d384898d74e42287`.
Loaded helper bundle SHA-256:
`ec58d4b6ee031a8a8d8a0e95599d64de3f7e5087977f5b2c6d1dee9609f098bf`.

- Original P2 (`disabled=false`) and P1 (`text=13`) reach the particular account
  exchange/JSON field via actual parse/root IDs, original scalar reads, native
  Query cache/query and React queue/update/application identities, transformations
  and selected committed property. Each Open in IDE selects its original range.
- Both results are saved, reviewed and exported through the panel. A fresh passive
  reader opens them after the original browser/IDE closes, without network access,
  action buttons or re-verification authority.
- A form change followed by Inspect again acquires a newer occurrence and refuses
  to borrow the first eligible render's proof. Unknown MAIN code invalidates old
  proof; fresh inspection refuses it. Response experiments, three repetitions,
  rollback and Restore remain usable.
- Real pre-read literal and bound-native same-value writers, and a self-restoring
  getter, retain the visible outputs while refusing full ancestry. CSP denial also
  stays Unknown even when the app displays the original values.
- A real foreign child retains WindowProxy across parent reload, writes literal
  `12` through the current React state before the original read, then closes.
  Main-script matching and unchanged `13` output cannot recover the permanently
  invalidated session. This is a native counterexample, not only a graph fixture.

The actual P1 panel and fresh-reader screenshots were visually inspected. Claims
are readable and separately scoped; this is not a general accessibility audit.
Acceptance is **agent-operated**, as the user requested, not independent human
usability or Store acceptance. Clean-candidate results are recorded separately below.

## Native mechanisms and regressions, separately

| Check / result directory tag | Result and boundary |
| --- | --- |
| `verify:first-read-query` / `closed-profile-final-20261018` | 15 PASS, stable inputs: original Query/React/read branches, callback/functional-update/DevTools/getter controls; alone `fullPath:false` |
| `verify:first-read-session` / `controlled-worker-cleanup-20261018` | 5 PASS, stable inputs: actual foreign worker, sticky history, witness close, unarmed startup timeout, held-response cleanup (152 ms); no product UI/full-path claim |
| `verify:short-loop` / `closed-profile-final-20261018` | 106 checks, 20 PASS / 10 expected PARTIAL, source/build/fixture stable, no errors; Vue partials remain negative controls |
| `verify:independent` / `closed-profile-regression-20261018` | All 3 preregistered questions on React/React Redux TodoMVC remain useful supported source/value fragments; stable inputs, exact IDE ranges and fresh reader; no store/HTTP ancestry |
| `verify:browser` / `closed-profile-final-basic-20261018` | 26 PASS, stable inputs, no errors: IDE-free property selection, response experiment/rollback, local persistence, reviewed export, passive import/hostile text/State Card rejection/delete |
| Public dependency audit | Zero returned vulnerabilities in the current lockfile, all severities; an advisory lookup, not security certification |
| Historical preservation | All 1,527 old experiment and 241 original short-loop hashes unchanged |

The independent run reuses the originally held-out case; this is a regression,
not another claim that the now-known application was unseen. It recorded favicon
404 console messages, no page errors. Native startup scheduling admits the script
only after exact policy-helper compilation and native scheduling barriers; it
**does not attest invocation**. Actual generated-fetch/exchange joins are required.
The earlier failed automation/opener/startup attempts are retained privately,
without relaxing source/context/history gates or browser sandbox/trust settings.

## Supported argument and limits

The finite alias interval ends at each particular original first-data-render
read. P1's receiver is a reconstructed candidate until the reviewed own-data/no-
write source argument is applied; it is not a separately Observed receiver. P2
has its own original member read and dependency context. Same-value matching,
nearby execution, source hashes or compiled bodies alone do not establish either.
Serialized model/join fixtures always remain conditional with `fullPath:false`.
Only product composition of acquired private capabilities and exact compatible
observations can issue the finite trace.

The computing base explicitly includes trusted local source/Node/IDE/compiler,
native browser/CDP, built extension and ordinary native realm/bootstrap behavior.
The IDE independently rebuilds the owned closed bundle and compares exact
source/tool/stage/output inputs; host Node/V8 observations remain separately
visible. Server Node 24.19.0/V8 13.6.233.17-node.51 and actual IDE Node 24.21.0/
V8 15.0.245.31-electron.0 were observed. React/DOM 18.3.1 dev, Query 5.90.3,
esbuild 0.25.12, Playwright 1.63.0 and Chromium 153.0.8010.12 are pinned/tested.

Only the original closed source, first eligible region, fresh controlled app and
known panel are admitted. Extra pages/workers, later regions, custom callbacks,
foreign DevTools, unknown source/context/history, budget loss, changed pins or CSP
refuse the claim. This is not HMR, universal readonly, native invocation
attestation, general cache provenance, Vue support or a rewrite of historical 0/6.
Snapshots are timestamped; selection/invalidation stale boundaries remain visible.
Exports contain passive historical claims, never compiler-channel credentials or
proof authority. Private profiles, raw source bodies and logs must not be shared.

## Clean candidate and distribution

The final clean candidate is `/tmp/stateatom-closed-profile-candidate-20261018`:
**318 regular source files**, no Git metadata, inherited dependencies, outputs,
old experiment or unrelated docs/design and docs/features. A fresh locked install
added 261 packages from a previously public-registry-verified npm cache; this is
not an empty-cache network-install claim. The first sandbox install was denied
esbuild spawn; the native installation passed with the normal compiler binary.

The full suite passed **491 tests**, zero failures/skips. An earlier 489/490 run
exposed a test inode-restoration error: the symlink refusal control recreated the
capability and later expected owned-inode cleanup to delete a replacement. The
product correctly preserved it. The test now restores the original by rename and
separately proves identical-byte replacement preservation; both assertions and
the original symlink refusal remain. The failed run/source are retained privately.

The clean build passed, and all **34 generated files** match the checkout byte
for byte. The actual installed helper entry/metadata/notices match this clean
candidate. Its fresh native UI run `clean-private-runtime-20261018` passed all
**17 checks**, with `inputsStable:true` and no errors. Revision is null in this
Git-free copy; the base revision and exact source manifest are recorded separately.
The positive panel and fresh passive reader screenshots were visually reviewed.

A first clean UI attempt correctly refused a harness-created group-writable
`.runtime` before launching a browser. The first-read harnesses now create absent
operational storage with mode 0700 before output directories; they do not change
existing permissions. Existing unsafe directories still require explicit operator
correction. The retry actually created mode 0700 and passed the whole UI path.
Only these four harness mkdir lines and documentation followed the full unit/build
check; product and test implementation, dependency pins and generated bytes did
not change. Native UI exercises the changed bootstrap. Scoped review accepted both
acceptance-harness fixes without weakening product gates.

Local review artifacts are in
`.runtime/closed-profile-distribution/20261018/`: exact source tarball, unpacked
browser and passive-reader ZIPs, the GUI-tested local VSIX, two actual synthetic
UI exports, three recorded screenshots, a short demonstration, selected check
metadata, source manifest and SHA256SUMS. Raw profiles, logs, source/scope dumps
and channel credentials are excluded. Required MIT/Apache and actual third-party
notices accompany the outputs. Publisher remains `local-research`; no official
Marketplace identity is claimed. Packaging and scanner results are recorded in
`evidence/verification.json`. Gitleaks 8.30.1 scanned the package including archives
(depth 3) and returned six generic-key findings, all in compiler/source SHA-256
pins. Each was checked against its actual source/native file digest; all six are
integrity constants, not credentials. The scanner exit remains 1 and the reviewed
findings are retained in `evidence/secret-scan-review.json`; there are zero
unresolved findings, no new suppression or ignore rule, and no claim that the
scanner itself returned zero. The npm advisory result is separately zero.
No release is published.

Independent human usability remains unperformed under the user's agent-operated
fallback. Publishing source updates, a release or Store submission is an external
mutation and remains separately scoped under AGENTS.md; local artifacts do not
establish any of those outcomes. Private GitHub vulnerability reporting was freshly
read-checked `enabled:true`; no report was submitted.
