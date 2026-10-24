# A02.7 — owned-process identity diagnostic (planning)

Starts from A02.6/58796e7: source113/full3151PASS, ONE review0/1/1 with I1fixed;
both native attempts literal Incomplete/appmodes0. Final integrity: product327/old9,
firstcase401physical+6historicalGit, second409physical+4historicalGit; raw unchanged.
Saved final checkpoint `.artifacts/a02/array-callsite-review/2026-10-24/final-checkpoint.json`.
Do not restart either case or treat its missing profile argument bytes as known.

[Spec](../superpowers/specs/2026-10-24-owned-process-diagnostic-design.md),
[plan](../superpowers/plans/2026-10-24-owned-process-diagnostic.md). Executor chooses
separate scoped facts/pure admission and at most one blank-browser diagnostic.
Only reported PID/direct children inspected; facts saved before assertions, no
reported PID kill. Same launch flags; no app/extension/IDE/certificate/trust change.
No new code/tests/runtime result from this document.20/29/fullA02 open.

Source lookup reused exact A02.6 helper, found no second SystemInfo collector in
experiments/scripts. Context7 official Playwright1.63 documents supplied persistent
userDataDir and context close. Local pinned coreBundle passes user-data-dir=path;
this static source is not proof of actual failed command-line bytes or root cause.
Review M1's stale duplicate current pointer is reconciled at this new-work handoff,
retaining its historical value below. No A02.6 source/result is changed.
