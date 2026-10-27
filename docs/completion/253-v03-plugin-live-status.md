# V03.31 — preserve live adapter status through the installed wrapper

Necessary bounded follow-up to252's actual2check/FAIL on exact plugin8. The existing
wrapper spreads the internal plugin, evaluating its reactHost/queryHandoffs getters
before config, then exposes stale null values. This is a package-entry contract
defect; underlying config/transform success is not falsely classified as native
failure. Source reproduction before fix; do not waive consumer's adapter assertion.

Executor choice: explicitly forward the two existing status getters to the same
underlying plugin. No generic proxy/descriptor framework, profiles/options/vendors/
permission/compiler/runtime changes. Exactly src/engine/vite-install.mjs source
plus focused tests; metadata9/README and verifier version guard updated separately
from preserved8driver/raw. No repack under8, Atom/UI/VSIX/SDK/host/native/AI changes.

Register current source, old8artifact/receipt/FAIL/executed driver and earlier
protected26/source34/current86inputs before source change. RED→GREEN actual pinned
React18 and Query source-config controls, disabled/instance boundaries; affected
profile checks and full source suite. One final source/package review (not two).
Clean source/metadata producer then one unique9pack and new offline consumer; keep
original15payload21source/hash/dependency/entry/virtual/17state criteria unchanged.

Spec: ../superpowers/specs/2026-10-28-plugin-live-status-design.md.
Plan: ../superpowers/plans/2026-10-28-plugin-live-status.md.
No installed/browser/GC/lineage/usefulness/performance/fullV03 acceptance inferred.
Whole21/29 remains; source implementation pending.
