# Host caller private weak references

Native work is deferred before launch because known observer call sites143/417
still look up a later `.deref`. Reuse its captured nativeWeakDeref and nativeApply
(chosen) rather than accept extra app callbacks or create a new intrinsic layer.
Preserve every host/commit/selected-value/source/state gate and weak lifetime.
No actual GC-cause, attestation, stronger lineage or missing-capability policy claim.

Test the whole original createObserver using an owned mock DOM and authored
React18-shaped events. Positive complete source branch first, late method/getter
controls at commit and snapshot, plus lost refs/changed props/marker/Stop refusals.
This explicitly is not React/browser execution. One source observer file and new
test only; exact9archive/oldraw/current86unchanged. ONE source review, no re-review.
