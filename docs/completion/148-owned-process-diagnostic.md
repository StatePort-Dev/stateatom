# A02.7 — owned-process identity diagnostic (source implementation)

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

## Source implementation checkpoint

Collector missing-module RED→20PASS; driver missing-module6FAIL→combined26PASS.
Malformed separate-token flag control20PASS/1FAIL→accurate summary→27PASS.
Actual owned Node child proves only process IO/child relationship, not Chrome.
Full npm test running; source/local commit/frozen native case still due. Product327,
old9 and A02.6 final source8 hashes unchanged; both raw failures retained.
Separate process facts/save-before-admission/strict case and independent cleanup
are implemented. No browser/application/server/UI operation yet.

Final source gate27PASS; full npm test3178PASS/0FAIL/0cancelled/0SKIP98.07s terminal84206. No native yet. Need clean sourcecommit then resource-freeprepare/freeze/newcasecommit/max1blankdiagnostic.

Resource-freeprepare62580/preflight65558terminal0: f0917b6clean/369sourceinputs/370includingcase. CoreBundle/localmodulegraph/Node/Chrome/source/tests/spec/plan and oldraw/checkpoints pinned. args[]/headless/sandbox/onlyaboutblank/max1; profileabsent; no browseryet. Commitcase thenONErun, preserveallliteraloutcomes.

## One actual blank diagnostic: literal refusal with owned PID confirmed

Sourcef0917b6/case439f645; job3891 terminalexit1, **DIAGNOSTIC_REFUSED_NO_APP**.
Chrome153.0.8010.12/exact8c599d43 binary, CDP PID2930867 equals current driver's
only direct child, same start identity12703612 and before/after executable. Only
about:blank; no app/server/extension/helper/IDE operation. Recorded process summary
has profileOptions[] and headlessfalse; admission refuses PROFILE_MISMATCH and
HEADLESS_MISSING. This means those flags were not recognized by that reader;
**actual profile use/headed mode remain Unknown**, not asserted absent/unsafe.
Session/context close true; the exact recorded PID is subsequently Absent/ENOENT.
Owned profile has LocalState/Default Preferences files, which alone do not attest
command-line identity. No reported PID was killed or other browser scanned.

Raw resultSHA4a1d447fad7b347049370a42806bd6ea00d470763c4cebbefda6fa027e6f02d7;
facts-before-admissionSHA85cffdc2ac94d36c3bd45aad3e5a04e20d5a0e0e0d21f69a0ce3615c08021ef3.
Independent verifier (no collector/driver imports) checks370physical frozeninputs,
exact raw-before-admit/registration/priorraw2 and12isolated negatives. Output in
`.artifacts/a02/owned-process-diagnostic-saved-verification/2026-10-24`.

Source limitation found after the attempt: one file read can return a prefix.
Missing-export RED→bounded EOF reader GREEN29; real temporary-file short reads
retain a later forbidden flag and oversized input refuses. Full **3180PASS/0FAIL/
0cancelled/0SKIP**,97.43s terminal19866. Future metadata includes byte/digest/arg
counts and incomplete vectors refuse. The historical raw has no counts and used
single-read code; do not reinterpret it as a complete argv measurement. No native
repeat or retroactive process-flag/profile acceptance. Both A02.6 raw failures and
source remain unchanged. Next prerequisite is original launch argument provenance,
not another blind app case, a whitespace split or criteria relaxation.

Possible representation limitation, not a confirmed cause of this run: current
[Chromium SetProcessTitleFromCommandLine source](https://chromium.googlesource.com/chromium/src/base/+/main/process/set_process_title.cc)
constructs a process title from argument text; [Linux implementation](https://chromium.googlesource.com/chromium/src/+/HEAD/base/process/set_process_title_linux.cc)
replaces argument memory. The main/HEAD sources are not mapped to this exact binary
and the current raw omitted argument-count/representation bytes. They justify
checking a separate original-invocation witness; they do not establish the cause,
recover old argv boundaries or authorize parsing a title as a true argument vector.
