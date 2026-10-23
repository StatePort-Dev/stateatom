# V03.8 — exact retained source scan diagnosis

2026-10-24 local, base10409c9/main; scope-review-1. **Read-only diagnosis complete,
no product fix or new source/native acceptance.** Whole20/29 unchanged.

## Finding

Retained exact70 original result
`.artifacts/v03/independent-vue-source/2026-10-23T20-58-40-652Z/results.json`
has4 setup PASS, raw selected textarea disabled=false trace Observed, but helper
analysis Stale with “workspace digest differs from executed instrumentation”.
The original FAIL and all original source/scalar-read/IDE/input/export criteria stand.

All6 retained trace nodes belong to `src/ui/c-input-text/c-input-text.vue` and carry
the same digest as the unchanged original SFC:
`471084ece218e50e82feeeeb684d494978f4d9522bf45aea4b19a6f59edf7ce7`.
The actual source reader in `core/bridge.mjs` stops admitting files after160
(per-file256000B, total2000000B). On the unchanged original working copy and mapped
source folder `.`, it indexes160 files/333727B and omits that exact selected file.
The file cap is reached before the byte cap. This explains both absent source
links and Stale validation: `validateTrace` also uses the generic digest-difference
reason when a trace file is absent from its supplied file map.

## Actual source reproduction

`.artifacts/v03/target-source-scan/2026-10-24/retained-scan-diagnosis.mjs` extracts
and executes only the unchanged trusted filesystem-reader function, using its
real filesystem dependencies. Its parent bridge source SHA
`e657aa06f7353a3625d4d5db5449765c72a9d45f8f95c983db4fad62bf84eb43` matches the
exact222-input helper5 source proof. No application module/expression/getter,
browser or IDE is executed. Current product/helper behavior is not modified.

`node .artifacts/v03/target-source-scan/2026-10-24/retained-scan-diagnosis.mjs`
actually verifies the160-file omission and6 matching digests. The real existing
`validateTrace` returns Stale with the original file list; a synthetic control
which supplies the missing unchanged file returns Observed. Result:
`.artifacts/v03/target-source-scan/2026-10-24/retained-scan-diagnosis.json`.
The control is a diagnosis, not a product fix, installed-helper run, or acceptance
of the original independent question. It does not weaken the original native FAIL.

## One next item

**V03.9 — bounded acquisition of the selected workspace source before background
index exhaustion.** Define the smallest safe implementation within the existing
file/byte limits; do not merely increase limits or pretend missing files are
validated. Preserve mapped-root/symlink/trust/range/digest safety, unavailable and
stale outcomes, the exact original target and all original acceptance criteria.
The detailed lookup strategy is an executor decision to make in that task.

Changing `core/bridge.mjs` will genuinely change the helper's recorded source
inputs, requiring a new exact installed helper artifact and its checks. Reuse
unchanged Atom70/UI2 and plugin5 only if their recorded inputs still match.
No dependency reinstall, app patch, publication, SDK, other repository or design
work is implied. Prior V03.7 correction seal/routing belongs to10409c9; later
current-routing edits do not invalidate its historical functional results.
