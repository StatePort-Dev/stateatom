# A02.7 — owned browser process discrepancy diagnosis

Autonomous bounded continuation of A02.6/58796e7, latest instruction through
Oct25 evening. Executor choice, not a user-approved root-cause assumption.
Scope-review-1/main/local/20of29 unchanged. Both A02.6 cases are exhausted and
their source/raw/checkpoints remain immutable; fullA02/native acquisition open.

Goal: retain actual process facts before admission can throw, and determine why
CDP browser PID/profile does not match the registered launch. No app/lineage,
extension/helper/IDE, GUI/certificate/trust setting, product, SDK, otherrepo,
publication, dependency or browser-flag change. At most ONE new blank-browser
diagnostic, no TodoMVC/app operation, no rerun even on partial failure.

Alternatives considered by executor: retry app collector (rejected, old budgets
exhausted and facts missing); speculate/relax profile assertion (rejected, loses
ownership proof); retain independent process facts in a separate diagnostic
(chosen, bounded and can expose the discrepancy without app questions).

New `experiments/owned-browser-process.mjs`: capture reported browser PID via
SystemInfo; independently inspect this diagnostic Node process's direct children
via /proc/self/task/PID/children. For these scoped PIDs only, retain actual exe/hash,
profile option arguments (including separate-token form for diagnosis), headless
and forbidden-flag facts. Do not serialize unrelated full command lines or scan
arbitrary browser profiles. Missing/failed reads remain explicit Unknown/errors.
Pure admission retains old exact executable/hash/profile/headless/sandbox criteria;
data collection itself must not turn a refused fact into an exception before save.
No PID is killed based on these observations; close only returned owned context.

New `experiments/owned-browser-process-run.mjs`: frozen clean resource-free
prepare, preflight, committed case, exclusive run marker. Pin actual Node/Chrome,
local Playwright entry/index/coreBundle and own source/tests plus A02.6 baseline.
Launch same Chrome153/headless/chromiumSandboxtrue/args[] in new unique profile;
only about:blank, no server/application/source instrumentation. Save process facts
before admission, independently close context and capture post-close PID state.
One literal diagnostic report, even on refusal; no app or feature PASS label.

TDD must cover metadata preservation on exact profile/exe/hash refusal; separate
profile token remains a diagnostic fact without waiving original criterion;
missing/multiple browser PIDs, disappeared proc entries, forbidden flags; direct
child vs CDP mismatch; malformed/foreign PID scope; cleanup even on capture or
admission failure; CLI refusal before resources and immutable input comparison.
Real owned Node-child proc test proves only process IO, not Chrome admission.

After source checks/full suite/clean commit: freeze ONE diagnostic case before
launch, strict input hashes/result retention/cleanup and independent saved checks.
If refused, explain only actual retained facts; no guessed cause or second run.
ONE final fresh read-only whole-item review, one tested Important/Critical fix
pass maximum, no rereview. Minors explicit; human participation not blocker.


Post-attempt source correction: read argument bytes through EOF, with65536-byte
capacity and explicit incomplete-vector errors. Preserve byte count/digest/argument
count in future facts without serializing full arguments. Real short-read file
control proves a forbidden suffix cannot be omitted. The one executed native case
used earlier single-read source and is not repeated or upgraded by this fix.
Linux process titles may replace the original argv representation; absence of
recognized flags must not be described as actual headed mode/profile non-use.
Original invocation evidence is a separate next feasibility question, not waived.
