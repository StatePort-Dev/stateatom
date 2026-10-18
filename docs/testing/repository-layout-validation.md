# Repository relocation verification — 2026-10-18

The local working tree based on `2958d2be0d3b41e4aa599630e22af1f66d8a99cf`
was reorganized according to [the layout map](../repository-layout.md). This is
local cleanup after the accepted alpha; it is not a new release or capability.
The command names and dependencies are unchanged. Node was 24.19.0, with the
repository's pinned dependencies, Chromium sandbox enabled and isolated VS Code
profiles. Native checks ran sequentially. Evidence was agent-operated.

## Source and harness checks

| Actual command | Result |
| --- | --- |
| `npm test` | 491 passed, no failures or skips |
| `npm run build` | Passed |
| `npm run build:extensions` | Passed after documentation/notice updates |
| `node --test --test-isolation=none tests/browser/diagnostic.test.mjs` | 24 passed after restoring the original traversal-control input |
| `FIRST_READ_TAG=layout-20261018 npm run verify:first-read-query` | 15 passed; bounded Query/React first-read branches |
| `SHORT_TAG=layout-20261018 npm run verify:short-loop` | 106 checks passed; 20 PASS and 10 expected PARTIAL cases; source/build/fixture stable |
| `FIRST_SESSION_TAG=layout-20261018 npm run verify:first-read-session` | 5 passed; bounded controlled-session lifecycle |
| `COMPILER_TAG=layout-20261018 npm run verify:observer-closure` | 43 passed; bounded compiler/observer closure and refusal controls |
| `git diff --check` | Passed |

An existing first-read build regression failed with a missing import after the
moves and before repairing callers. Its RED log is retained; assertions were not
removed to obtain GREEN. Exact recipe/browser source pins were rebound to their
new paths and changed bytes. Third-party tool/API/binary pins and all 39 original
browser-input pin values stayed unchanged. Compiler trust boundaries were not
relaxed.

A separate temporary-directory sanitizer smoke verified current-artifact token
redaction, unchanged private historical sentinel bytes and no recreation of a
legacy root folder. It does not establish sanitation of private archives.

## Real interface checks

A newly packaged local VSIX was installed into the isolated real VS Code host:

```sh
FIRST_UI_TAG=layout-installed-20261018 npm run verify:first-read-ui -- --installed-vsix=/home/roman/projects/stateatom/.runtime/restructure/20261018/distribution/stateatom-helper-layout.vsix
```

All 17 panel/IDE/export/fresh-reader checks passed. Open in IDE reached
`tests/fixtures/inspection/react/App.tsx` line 30 for P1. The existing original
P2/P1 controlled first-read profiles, new-occurrence reinspection, Unknown/stale
boundaries, interventions and rollback/Restore remained functional. Negative
literal/bound-native/getter/CSP controls retained their refusals. The short-loop
also exercised the panel picker, selection/property/navigation freshness and
existing React/Vue/TodoMVC cases. Vue PARTIAL remains a limitation control.

VSIX SHA-256:
`ca2e15c6b5c3cb1d53ade1cb2018afcebd002af29c8e1e14cc1d80735f888e70`.
This relocated local package is separate from the frozen accepted candidate.
The standalone IDE-free 26-check workflow and every historical deep experiment
were not rerun for this relocation; their earlier results remain historical.

## Integrity and retained records

- All 139 source files from the fourteen former root directories exist at their
  mapped destinations. No `stateatom-*` root directory remains.
- All 45 inspection fixture files are byte-identical to the pre-move baseline.
- Both legacy ignored artifact groups, 18 files, were moved into private
  `.runtime/restructure/20261018/legacy-artifacts/`; every hash matches.
- The six inventoried unrelated untracked documents are unchanged. The pending
  maintainer-alpha acceptance edits were preserved.
- The lockfile is byte-identical, dependency versions and command names are
  unchanged, and all 55 direct Node npm entrypoints exist.
- Original X-Ray history matches all 1,527 recorded file hashes; its short-loop
  subset separately matches all 241 recorded hashes. Frozen candidates and
  existing run outputs were not edited.
- Final source review found no Critical/Important issue. Both minor path/test-data
  findings were corrected and confirmed in the review addendum.

Private relocation inventory, pre-move copies, logs, VSIX, integrity summary and
mapping are under `.runtime/restructure/20261018/`. Native results are under
`.runtime/first-read-runs/layout-20261018/`,
`.runtime/first-read-ui-runs/layout-installed-20261018/`,
`.runtime/short-loop-runs/layout-20261018/`,
`.runtime/first-read-session-runs/layout-20261018/` and
`.runtime/compiler-probes/layout-20261018/`. Reuse the same npm commands with a
**new unique tag** for each subsequent run; existing evidence directories are
not overwritten. The original fixture setup needs `npm run prepare:short-loop`
on a checkout where its pinned external fixtures have not been prepared.

The finite HTTP profile, original deep-case criteria, source ownership and
Unknown/Unsupported boundaries retain their existing scope. No new resolver,
framework support, commit, push or publication was part of this cleanup.
