# F04 — immutable package pair and consumer receipt

Date: 2026-10-19. Source base `61eb183`; checks use its bounded working overlay.
Scope: [F04](03-runtime-and-onboarding.md#f04--immutable-package-pair-and-consumer-receipt)
under approved `scope-review-1`. Status: **complete within the F04 brief**.
The execution ledger is [here](../superpowers/plans/2026-10-19-immutable-package-pair.md).

## Exact accepted inputs

Reuse the actual F03 Atom `.8` and UI `.2` bytes; no new package content or
identity was needed for packaging-script, example-host and test-driver changes.
All prior candidate bytes and handoffs remain untouched.

| Identity | Value |
| --- | --- |
| Atom package | `@stateport/atom@0.1.0-candidate.20261019.8` |
| Atom SHA-256 | `58da6251b0c88ccdf9cba5086b43b1daaf47aa3047d63c8e4be750c52b2dc2a8` |
| UI package | `@stateport/extension-ui@0.2.0-candidate.20261018.2` |
| UI SHA-256 | `2bfc8229a45e02f775bb563f27d9a803d51dd977145f46843c45a884e07289e5` |
| Atom API / wire | `1` / `1` |
| UI visual contract | `2.1.0` |
| Current build-source digest | `2c35c28fb1142b8f8b7fba331c9bc146f43c762ddb99c3b6edec563f0bf58203` |

Final handoff:
`.artifacts/atom/2026-10-19T14-45-10-114Z/atom-handoff.json`.
Its additive `consumerReceipt` records all 37 installed package files, public
exports/declarations/assets, exact peer resolution, dependency tree, deterministic
tarballs, both host file manifests, tool versions and earlier identical artifacts.
`buildSources` binds 81 package/build/host inputs, including the lockfile, license
inputs and admission implementation. Its digest method is recorded in the JSON.
Absolute paths identify this local run; hashes identify the bytes.

## Packaging behavior

- `pack:atom` serializes its work, builds into hidden staging and refuses different
  bytes under an already-issued Atom or UI identity. Only a completed candidate
  is promoted to a visible timestamp directory. Failed staging is evidence, not
  an issued identity. `pack:ui` checks prior Atom-pair artifacts too.
- Both tarballs are packed twice and compared byte for byte, then installed
  offline into a new consumer. The consumer retains its own tarball copies;
  neither installation nor its dependency lock points to removed staging.
- One exact UI peer must resolve from both the host and installed Atom. Supported
  API/wire/UI contract, all required exports, declarations, local font, reader
  files and notices are checked before a handoff is emitted.
- Standalone and example hosts bundle only installed package imports. Bundle
  input receipts reject source-checkout escapes and Node/compiler/IDE inputs.
  Both output hosts now include the actual bundled third-party notices in
  `atom-licenses/THIRD_PARTY_LICENSES.md`; the public example build carries them too.
- `verify:atom-package` checks tarball hashes, installed files, both host manifests
  and build-source hashes. Its wrong-peer/old-wire/missing-export/missing-font/
  stale-declaration/wrong-tarball controls mutate disposable copies only.

Handoff status remains `BUILT_NOT_VERIFIED`; a package build does not certify new
features. Runtime evidence is separate. No package was published or installed
into StatePort's repository.

## Actual checks

Agent-operated Linux, Node 24.19.0, npm 11.17.0, esbuild 0.25.12 and strict
TypeScript 5.9.3. Native checks use repository Playwright with Chromium 153.0.8010.12 sandbox
enabled and actual VS Code Extension Host. Browser plugin was unavailable.

| Command / check | Result | Local evidence |
| --- | --- | --- |
| `npm run pack:atom` | PASS, twice-packed tarballs identical to issued pair | `.artifacts/f04/pack-final.log`, final handoff above |
| `npm run verify:atom-package` | 7/7 PASS, real installed positive and refusal controls | `.artifacts/atom/compatibility/2026-10-19T14-47-15-374Z/result.json` |
| `npm test` | 628/628 PASS, no skips/failures, after review fixes | `.artifacts/f04/tests-final.log` |
| Focused package controls | 10/10 PASS | `.artifacts/f04/controls-green.log` |
| `npm run verify:atom-types` | 2 strict consumers PASS: NodeNext and Bundler | final candidate `type-consumer-result.json`, `.artifacts/f04/types-final.log` |
| `npm run check:ui` | PASS; no UI/token changes | `.artifacts/f04/ui.log` |
| `npm run verify:embedding` | 35/35 PASS, no errors | `.artifacts/atom/verification/2026-10-19T14-40-29-462Z/results.json` |
| `verify:production-source-mapping`, standalone | 19/19 PASS, no errors | `.artifacts/production-source-mapping-2026-10-19T14-40-32-415Z/result.json` |
| `verify:production-source-mapping`, embedding | 19/19 PASS, no errors | `.artifacts/production-source-mapping-2026-10-19T14-42-11-619Z/result.json` |
| `verify:actions`, final embedding host | 32/32 PASS, no errors | `.runtime/action-runs/f04-embedding-final-20261019/results.json` |
| `verify:actions`, final standalone host | 32/32 PASS, no errors | `.runtime/action-runs/f04-standalone-final-20261019/results.json` |

Final machine-readable evidence binding: `.artifacts/f04/f04-verification.json`.
It verifies current source/package/host hashes, retained runtime outcomes, final
commit file hashes and unchanged approved scope and other 28 task objects.

The two-host run covers Basic picker, explicit Unknown, save/review/download,
source-connected observed operands, actual exact IDE document/range, new
occurrence after app input, HMR invalidation, tab switching, disconnect, panel
reopening, embedding lifecycle and foreign debugger refusal, worker restart,
permission denial and offline reader. The additional HTTPS control verifies
that default embedding omits the unsupported tab and directly denies read-only
attachment. Loopback read-only map support remains available as before; this does
not opt the host into HTTPS or prove native optional permission prompt acceptance.

Embedding and map runs used the earlier F04 host build at
`.artifacts/atom/2026-10-19T14-37-48-065Z/`. Final hosts differ only by the added
third-party notice file: every existing executable/UI/reader/manifest/font byte
is identical. No runtime experiment was repeated merely for this notice copy.
Actions runs bind before/after hashes of the exact final host. The final sidecar
records this equivalence rather than pretending the earlier run used a later path.

## Retained failures and review

- First native embedding run passed 13 checks, then the new HTTPS control wrongly
  searched Atom's intentionally filtered tab list. The corrected control also
  asserts omission and obtains the native tab ID only to test direct denial.
  Original result: `.artifacts/atom/verification/2026-10-19T14-38-37-773Z/results.json`.
- First embedding maps run stopped before assertions because shared harness
  helpers used standalone IDs. Helpers and the Actions/maps drivers now use the
  existing semantic `data-atom-id` attributes; original assertions remain.
  Original result: `.artifacts/production-source-mapping-2026-10-19T14-41-07-573Z/result.json`.
- First Actions run correctly remained read-only: its old driver treated source
  pairing as development approval. It now performs F02's explicit UI approval
  before attachment. Product permissions and source semantics are unchanged.
  Original: `.runtime/action-runs/f04-embedding-20261019/results.json`.
- Initial full unit run collided with the native Vite suite on fixed first-read
  port 4173. Its failed receipt remains `.artifacts/f04/tests.log`; a subsequent
  sequential run passed 627 checks before the final review fixes.
- Real negative-control driver initially expected ENOENT for a missing exported
  font; Node's resolver reports `Cannot find module`. Both remain refusal, and
  the driver checks that actual outcome. Original compatibility receipt at
  `2026-10-19T14-39-14-465Z` remains FAIL.

Fresh review found rejected-candidate poisoning and omitted bundled notices.
Both are addressed by staging/admission tests and actual final host validation.
The source-input omissions were treated as material to the claimed exact input
inventory and included in the fix. Manifest JSON key order is also tested as
irrelevant to file-byte identity. The additive `/1` handoff is a compatibility
choice: older consumers can ignore new fields, so API/wire/UI compatibility is
checked explicitly. No independent-human visual/model acceptance is inferred.

## Boundary and one next item

This item changes packaging and verification, not Atom runtime behavior, tokens,
visual layout or historical experiment criteria. F01–F03 remain credited without
rerunning their specialised experiments. This record establishes neither Live/
Draft, production grants, Action Trace, real model inference, production element
source anchors, a redesigned handoff journey nor a public release. I01 remains
separate official-host intake in a separately authorized repository.

The one next dependency-ready item is **U05 — visual element picker**: F01/F02
are complete. Reuse the current picker and complete hover/refine/cancel,
application-event suppression controls, inaccessible-path limits and cleanup in
both packed hosts. Do not begin the wider U01 redesign or all remaining items.
