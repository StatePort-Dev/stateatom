# V02.8 — Live/Draft measurements and superseded inspection errors

2026-10-23, scope-review-1. Bounded implementation and measurements complete;
ONE whole-item review pending. Whole V02 remains open,19/29 whole tasks unchanged.

## Product result

Atom65 fixes an independently reproduced UI race: a rejected state read from an
old selection could overwrite the status of a newer inspection. Primary and
ordinary-deep fallback errors now check their generation before reporting.
Background reads wait while an explicit CSS Inspect or Inspect-again RPC replaces
the occurrence; an older completion cannot release a newer pending inspection.
Actual failures for the current request remain visible. Native/runtime identity,
marker fallback, selected property, permission,250ms debounce and64-history guards
are unchanged. No automatic retarget/retry or source getter evaluation is added.
There is no layout/token/font/visual contract change.

Controlled source tests first failed on four actual assertions, then119 focused
checks passed, including seven new regression/control tests. This establishes the
UI races; it does **not** prove exact causal ordering of the archived64 native
Stale-action-identity error, whose ordering was not captured.

Plans frozen before their attempts: [original protocol](../superpowers/plans/2026-10-23-v02-input-modes.md),
[retained-phase preparation correction](../superpowers/plans/2026-10-23-v02-input-modes-remainder.md),
and [bounded product correction/new65 qualification](../superpowers/plans/2026-10-23-v02-input-stale-load.md).
Implementation revision fa9515743a76b9ff48beeddd93735cbda8725fed.

## Current immutable qualification

Exact handoff `.artifacts/atom/2026-10-23T13-08-24-618Z/atom-handoff.json`:
Atom0.1.0-candidate.20261021.65,875144bytes,
SHA256 `70ea7087ab4359ab8b52db519849610a1b1a13ff9d94f29020415c248af6b7a3`.
Unchanged UI0.2.0-candidate.20261018.2,368693bytes,
SHA256 `2bfc8229a45e02f775bb563f27d9a803d51dd977145f46843c45a884e07289e5`.
API/wire1/UI contract2.1;269 bundled/326 overlapping build inputs,union326.
The handoff's original BUILT_NOT_VERIFIED status is preserved; the derived receipt
records scoped qualification rather than rewriting the build artifact.

```sh
node --test --test-isolation=none tests/atom/inspector-ui.test.mjs tests/atom/input-mode-performance.test.mjs tests/atom/input-controller.test.mjs tests/atom/input-ui.test.mjs tests/atom/control-editor.test.mjs tests/control-ledger.test.mjs
npm test
npm run pack:atom
npm run verify:atom-types -- .artifacts/atom/2026-10-23T13-08-24-618Z/atom-handoff.json
npm run verify:atom-package -- .artifacts/atom/2026-10-23T13-08-24-618Z/atom-handoff.json
node tests/integration/handoff-observation-input-native.mjs .artifacts/atom/2026-10-23T13-08-24-618Z/atom-handoff.json
node tests/integration/input-mode-performance-native.mjs .artifacts/atom/2026-10-23T13-08-24-618Z/atom-handoff.json
```

Actual full2454/2454,0fail/skip/cancel; pack PASS; packed strict types2
(TypeScript5.9.3); admission9; affected actual H09 coexistence17 both hosts PASS,
0 inspector warnings/errors. H09 includes real temporary-profile HTTPS/site
access and distinct Settings production confirmations, recording, Live/Draft,
downloaded reader and revocation; this is scoped regression, not all P04 rerun.
887 frozen inputs match before/after full and native measurement; archives,
installed pair and complete host manifests match. These include source, harness
and plan inputs, not887 independently tested capabilities. Subsequent edits to
status/roadmap/task index are reporting changes; frozen versions remain in Git
fa95157. The original full/build/native inputs and receipts remain untouched.

## Finite input protocol and results

Chrome153.0.8010.12/Linux/Ryzen5 5600H/12 logical CPUs; separate disposable headed
profiles/Xephyr and exact packed standalone/embedding hosts. Existing unchanged
native-controls fixture over loopback HTTP/development; development approval RPC
is setup, real attach/select/field input/Apply/Close use the inspector UI. No
app-target test CDP, app callback/transport wrapper, new app listener or model.
The own-inspector timing observer checks trusted gestures, new busy transition,
current expected observed value/acknowledgement and two-frame paint.

Three fixed warmup blocks plus20 measured blocks per host, each Live and Draft in
alternating order:92 fresh rows/80 measured/12 warmup. Live measures input to
acknowledged paint, including default debounce; Draft local paint and explicit
Apply-to-ack paint are separate clocks. Before every Apply, app output remains
unchanged. After every committed write it matches the fixed synthetic recipe;
unrelated outputs and getterReads0 remain unchanged. Readiness and all tails are
raw alongside paint; no per-keystroke dispatch time is inferred.

Two-frame paint p50 / nearest-rank p95 / max, milliseconds,20 measured per endpoint:

| Endpoint | Standalone | Embedding |
| --- | ---: | ---: |
| Live input to acknowledged paint |2199.5 /3905.6 /4602.2|1482.15 /2057.2 /2323.7|
| Draft input to local-ready paint |21.7 /28.3 /29.1|23.1 /24.8 /24.9|
| Explicit Apply to acknowledged paint |1947.85 /3023.3 /3311.2|1404.45 /1662 /1748.7|

These are descriptive measurements, **not** a newly approved Live/Apply SLO or a
performance pass. The warm-source3000ms target is not reassigned to these paths.
Several-second tails remain visible. Shared-host1min load standalone6.42→10.97,
embedding10.97→9.78,freeRAM~7.1–9.5GB; no causal attribution or tail exclusion.

132 ledger checkpoints cover opened0,every write1..64,and refused proposal65
per host.46 timed+18 untimed Draft writes reach the unchanged cap. Serialized
UTF8 DTO bytes grow standalone3561→4293(first)→37063(46)→50184(64),
embedding3560→4292→37062→50183. Resources stay within32; history transactions
and outcomes are applied with consumption/effect Unknown and applicationRestored
false. Persisted history keeps last8,resources empty,executable false. These are
accounted DTO proxies, not heap/RSS/leak proof; no new memory ceiling is invented.
Both actual65th UI proposals refuse HISTORY_LIMIT with64 rows/app unchanged.

Both actual native pointer Close controls occur before250ms debounce:
19.8/17.8ms after trusted input, including real blur. After500ms quiet, app is
unchanged,pending null,cleanup closed,history empty. No hidden Apply or undo of
previous acknowledged edits is claimed. Original outputs remain after the prior
64-write investigation; a fresh investigation supplies the unsent-close case.

Current fresh results/preregistration/driver/fixture/JSONL:
`.artifacts/v02/input-modes/2026-10-23T13-15-48-304Z/`.
Source maps, RED/GREEN/full/build/type/admission/H09 logs, independent raw
recomputation `verify65.mjs` and `verification65.json`:
`.artifacts/v02/input-modes/2026-10-23/`. Both current native hosts complete,
0 inspector console/errors;92 rows/132 checkpoints/2 refusals/2 Close controls.

## Preserved original64 attempts

- `12-43-03-089Z`,driver b624192,885 hashes,INCOMPLETE after46 valid standalone
  rows/66 checkpoints/one refusal. Redundant native property selection used Home
  while already disabled; its asynchronous property RPC prevented ArrowDown.
  This was harness preparation, not a product failure. Correction skips the
  no-op selection. Original tails, including3751.4ms Apply max, remain.
- `12-49-04-617Z`,driver7a5eb1d,886 hashes,INCOMPLETE after92 joined rows/132
  checkpoints/two refusals/one standalone Close35.8ms. Original standalone46 are
  byte-identical retained rows; embedding46 are fresh. Embedding's fresh Inspect
  after Close/Discard reported Stale action identity before its Close control.
  It is not counted as a successful second cancellation.0 console/errors.

`verification64-historical.json` independently checks original885/886 input
identities (changed files against original Git), joined bytes/order/DTOs/limits,
actual standalone Close and exact64 archives/install/hosts. No failed attempt
is promoted to COMPLETE. New65 product bytes justify the fresh unchanged input
protocol; all original64 results remain historical. In particular104 Basic
p95=683.1/2021.8ms and active/off25.08/26.87% retain their misses;107 warm-source
results and U02/A05 earlier checks are not silently current65 qualification.

## Remaining work and one next item

ONE fresh whole V02.8 review follows this checkpoint; at most one material
correction pass, no re-review. Review findings/rulings will be appended here.
Whole V02 still requires its remaining mode/workload/performance acceptance;
L02 mandatory usefulness,A02,integration/clean-platform/release gaps remain open.
Independent human is not a blocker. No SDK/publication/redesign/other repository.

Next **V01**: reconcile the existing install/unit/build CI with packed contracts
and a reproducible native-candidate lane. F01/F04 dependencies are complete.
Preserve meaningful existing commands and explicit blocked environment states;
local implementation/checks cannot claim a remote CI run or publication.
