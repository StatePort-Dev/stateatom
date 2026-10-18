# Repository layout

The alpha implementation is organized by responsibility. The historical
`stateatom-*` root directories were removed on 2026-10-18; this is a source
relocation, not a new feature, license change or upgrade of historical results.

| Location | Contents |
| --- | --- |
| `browser-extension/` | MV3 shell, picker, panel and passive diagnostic reader |
| `ide-extension/` | Open VS Code helper |
| `core/` | Analysis, evidence, bridge, lifecycle, diagnostics and native code journal |
| `src/engine/` | Existing instrumentation, observer, source slicing and framework handoff modules |
| `src/first-read/` | Controlled first-read compiler/channel/session, exact source pins and finite verifier |
| `scripts/` | Build, preparation, dev entrypoints and shared native harness support |
| `tests/*.test.mjs`, `tests/engine/`, `tests/browser/`, `tests/vue/` | Unit and semantic regressions |
| `tests/fixtures/inspection/` | Original synthetic React/Vue inspection applications and negative controls |
| `tests/integration/` | Repeatable native browser/IDE workflows and mechanism checks |
| `experiments/compiler/`, `experiments/execution/`, `experiments/network/`, `experiments/react-commit/` | Retained acquisition/rejected-mechanism probes and their controls |
| `docs/testing/` | Current first-read, short-loop, React host and state check instructions |
| `.runtime/` | Ignored private profiles, results, local packages and retained historical artifacts |
| `dist/`, `dist-fixtures/` | Reproducible generated outputs |

The existing `fixtures/` and `evaluator/` retain the original basic build examples
and oracle. They are separate from the source-connected inspection applications.
Existing npm command names remain the supported entrypoints; see package.json.
For the synthetic IDE-connected app, the source-folder setting is now
`tests/fixtures/inspection`. Browser URLs and API routes are unchanged.

## Historical relocation map

| Previous location | Current location |
| --- | --- |
| `stateatom-phase2/engine/` | `src/engine/` |
| `stateatom-phase2/fixtures/` | `tests/fixtures/inspection/` |
| `stateatom-phase2/tests/` | `tests/engine/` |
| Phase 2 server/demo/sanitizer | `scripts/inspection-server.mjs`, `tests/integration/ide.mjs`, `scripts/sanitize-artifacts.mjs` |
| `stateatom-field-revision/` | Product modules in `src/first-read/`; native checks in `tests/integration/first-read-*.mjs`; dev command in `scripts/dev-first-read.mjs` |
| `stateatom-oss-alpha/` | `tests/browser/` and `tests/integration/browser.mjs` |
| `stateatom-diagnosis/` | `tests/vue/` |
| `stateatom-short-loop/`, `stateatom-independent/` | `tests/integration/short-loop.mjs`, `tests/integration/independent.mjs` |
| `stateatom-react-host/`, `stateatom-react-state/` | React native checks in `tests/integration/` |
| `stateatom-query-handoff/`, `stateatom-write-access/` | Query/write native checks in `tests/integration/` |
| `stateatom-compiler-probe/`, `stateatom-execution-probe/` | `experiments/compiler/`, `experiments/execution/` |
| `stateatom-network-probe/`, `stateatom-react-commit/` | `experiments/network/`, `experiments/react-commit/` |

All 139 tracked files from those directories remain in the new locations. They
supply product behavior, registered npm checks or their regression dependencies;
none was removed merely for being an experimental negative result. Empty legacy
directories were deleted. The two ignored legacy artifact groups were moved into
`.runtime/restructure/20261018/legacy-artifacts/` with every file hash verified.
The old X-Ray checkout, frozen source candidates and historical run outputs were
not modified. Historical records and NOTICE keep original filenames as origin
references; use this map for their current counterparts.

The current sanitizer command handles root `artifacts/` and writes its summary to
`.runtime/redactions.json`. It does not sanitize private profiles or retained
historical archives. Review explicit synthetic diagnostic exports before sharing;
`.runtime/` remains private.

The [relocation verification record](testing/repository-layout-validation.md)
separates source/harness checks from the actual installed-helper UI run.
