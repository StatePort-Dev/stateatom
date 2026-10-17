# Source provenance

## Import boundary

The 2026-10-17 import selects the current maintainer-supplied StatePort X-Ray
prototype directory snapshot. No upstream Git revision is asserted: the supplied
directory has no Git history. No experimental repository history was imported.
The first local StateAtom source commit is the reproducible public baseline.
Private source paths, per-file import hashes and historical run artifacts stay outside this repository.

| Imported path | Origin and role | Effective terms |
| --- | --- | --- |
| `core/`, except the two files below | Existing prototype analyzer, source bridge, evidence and lifecycle | MIT, root LICENSE |
| `core/basic-analysis.mjs`, `core/diagnostic.mjs` | Later prototype basic inspection and diagnostic modules; original SPDX headers retained | Apache-2.0, LICENSES/Apache-2.0.txt |
| `browser-extension/`, except reader below | Existing single MV3 shell, picker, adapters, experiments and UI | MIT, root LICENSE |
| `browser-extension/reader.mjs` | Existing diagnostic reader; original SPDX header retained | Apache-2.0, LICENSES/Apache-2.0.txt |
| `ide-extension/` | Existing open VS Code helper; development identity/display metadata updated for StateAtom | MIT, ide-extension/LICENSE |
| `stateatom-phase2/engine/` | Existing observer, Babel/Vue transform, static slice and intervention controller | MIT, root LICENSE |
| `fixtures/`, `stateatom-phase2/fixtures/`, `evaluator/` | Existing synthetic examples and independent test oracle | MIT, root LICENSE |
| `tests/`, `stateatom-phase2/tests/`, `stateatom-oss-alpha/tests/`, `stateatom-diagnosis/tests/` | Existing regression suites and real IDE test host | MIT, root LICENSE |
| selected `scripts/`, Phase 2 server/demo/sanitizer, browser-only check | Existing development and bounded validation tools | MIT, root LICENSE |
| root documents, `docs/`, `.github/` templates | Maintainer-supplied 15-document StateAtom pack, reconciled with actual sources | Root LICENSE applies; future Apache direction does not relicense history |

Import edits are limited to package/extension metadata, explicit already-locked direct
dependencies, local run commands, build/verification portability, CI, documentation and notices.
Existing source filenames and the `xray.pair` command are retained to avoid a cosmetic engine rewrite.
The documentation's ts-morph/Joern and adapter design describes possible future work;
the implemented analyzer uses Babel and Vue compilers. There is no second resolver.

## External code and build tools

No Peekly, TodoMVC, MDN application, external images/fonts, closed StatePort source,
Desktop code, capture profiles, raw reports, or generated binary assets are imported.
Peekly was researched by the prototype but is not a runtime origin for the selected code.
The original MIT attribution is preserved verbatim rather than replaced with a new author.

All npm resolutions in package-lock.json are pinned public registry URLs with integrity
values. Direct dependency versions are preserved; `esbuild`, `@babel/types` and
`@vue/compiler-dom` are now explicitly declared at their already locked versions because
the existing source imports them directly. No resolved version was upgraded.

The browser shell bundles local project modules. The IDE bundle additionally includes
Babel and Vue compiler dependencies. `npm run build` generates the exact package names,
versions, declared licenses and original license texts in `dist/ide/THIRD_PARTY_LICENSES.md`
from esbuild's input graph. Do not ship the IDE bundle without those notices and its LICENSE.
Public npm packages retain their own licenses; repository metadata is not a license for them.
The lockfile also includes synthetic fixture and build/test dependencies that are not shipped
in the browser bundle. Installed VS Code and Playwright Chromium are host prerequisites,
not distributed StateAtom binaries. This inventory is not a patent or trademark clearance.
