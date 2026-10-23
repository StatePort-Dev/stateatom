# V01.2 — reproducible native browser candidate lane

2026-10-23, scope-review-1. Local bounded browser matrix verified on unchanged
Atom65/UI2; whole V01 remains open for installed VSIX/whole-item review.19/29
whole tasks unchanged. Remote GitHub Actions execution remains unverified.

[Original plan](../superpowers/plans/2026-10-23-v01-native-candidate.md),0358ade;
[retained-phase correction](../superpowers/plans/2026-10-23-v01-native-remainder.md),00884e5.
New command `node scripts/verify-native-candidate.mjs <timestamped atom-handoff.json>`
is declared explicitly; no nonexistent npm alias is implied. Fixed two child
scripts execute sequentially under an owned cooperative lock, with unique outputs,
frozen source/build inputs and exact archives/installed pair/full host checks.
Mutable latest paths, missing/duplicate hosts, failed/skipped/empty checks,
different candidates, input/host drift and console errors cannot pass its result
contract. Lock conflict refuses without touching the existing owner's marker;
shared port4175 conflict is non-success, never permission to kill another process.

## Exercised browser paths

Real Chrome153.0.8010.12/Linux/headless-new MV3, no app-target test debugger,
IDE/account/model/CA/TLS bypass or mutation grant. Exact65 handoff:
`.artifacts/atom/2026-10-23T13-08-24-618Z/atom-handoff.json`; same package/UI hashes,
269 bundled/326 build inputs as108. New tests/CI files do not change product bytes.

- **Basic23:** one exact-pair check plus11 per host. Actual nested picker/text,
  keyboard parent refinement, inspector Cancel, zero app pointer/key/action calls,
  read-only/Unknown evidence; historical diagnostic Save, explicit review/default
  exclusions, actual download equal to reviewed bytes; ordinary app click works
  after Cancel. Originating browser closes before a new profile imports that file.
  Fresh reader has no app tab/live stored state, retains Unknown, loads bundled
  font and makes no app request. Both full host manifests remain unchanged.
- **Maps39:** existing19 predicates per host plus exact-pair check. Actual manual
  production-map association/lookup, default-safe report/reader, wrong artifact,
  positions-only/hostile text/traversal/HTTP/redirect controls, narrow/keyboard,
  navigation/picker/detach and own-console health. Manual generated coordinates
  remain explicitly **not linked to the element**; this is not ordinary React
  callback identity, runtime causality or fresh performance acceptance. Screens
  remain candidates, not human visual review.

## Failure and verified reuse

First clean5a52dc7 lane `2026-10-23T13-54-05-335Z` remains **FAIL**. Basic23 passed
with all inputs unchanged and0 errors/console. Maps stopped after global+9
standalone checks: old predicate awaited `Error:.*Unsafe` after traversal import.
Current existing Worker intentionally emits closed SOURCE_PARSE_INVALID, not the
raw archive error. Archived traversal ZIP through the real Worker implementation
confirms refusal/no path echo; the old predicate fails on that actual message.
Only its expected safe text changed; refusal and prior Unverified map retention
remain required. Original archive/parser tests pass. No product guard was relaxed.

The remainder explicitly uses:

```sh
node scripts/verify-native-candidate.mjs .artifacts/atom/2026-10-23T13-08-24-618Z/atom-handoff.json --retained-basic=.artifacts/v01/native-candidate/2026-10-23T13-54-05-335Z/results.json
```

It validates original before/after/candidate/process0/PASS/reference hash, complete
23/two-host result and every Basic child's current input before reuse. It then
executes only maps39. Result `2026-10-23T14-02-47-873Z` is a declared join:
**23 retained +39 fresh**, not62 fresh operations or an upgraded failed first run.
The incomplete map fragment is not counted complete; its closed browser context
required fresh setup. New parent failures record failed child FAIL rather than
leaving it RUNNING; the original file stays unchanged.

## Checks and CI configuration

Meaningful unchecked-contract RED6→GREEN7, retention RED2→GREEN10; affected
runner/archive/Worker command **24/24**,0fail/skip/cancel. Actual CLI occupied-lock
control blocks with0 cases and preserves the foreign marker. YAML/Bash/Node/diff
checks pass. Independent recomputation verifies341 current frozen inputs,
23+39 child checks, original hashes, archives/install/hosts and zero observed
inspector/reader warnings/errors. Original65 full2454/types2/admission9/H0917 remain
108 qualification, not a new whole-repository full-suite run after harness edits.
No product rebuild/new candidate/performance run was needed.

The existing packed-contracts job now installs lockfile Playwright1.63 Chromium
and system dependencies and runs this command on **its same immutable pair** after
types/admission.20min job budget. Official Playwright1.63 install/real headless-MV3
docs were retrieved through Context7. Future CI result retention uses official
upload-artifact7.0.1 with an explicit run-root JSON/log allowlist, profile exclusion
and7day retention. No package/profile/certificate upload or release is configured;
no remote job/upload/push has occurred. Local parsing cannot verify hosted service
behavior. This extends109's earlier configuration, whose old no-upload state was
accurate at that checkpoint.

Raw original/remainder parents under `.artifacts/v01/native-candidate/`; Basic
`.artifacts/v01/basic-reader/2026-10-23T13-54-06-279Z/`; fresh maps
`.artifacts/l01/maps-native/2026-10-23T14-02-48-799Z/`. Source/control logs and derived
receipt `.artifacts/v01/packed-ci/2026-10-23/verification-native65.json`.

Next **V01.3**: reproducible maintainer job for actual isolated installed VSIX,
kept distinct from Extension Development Host; refuse missing environment/foreign
IDE ownership. Then ONE whole V01 review. V02 target misses/L02/A02 and clean-
platform/integration/release gaps remain; no independent-human blocker, SDK,
redesign/publication or changes in another repository.
