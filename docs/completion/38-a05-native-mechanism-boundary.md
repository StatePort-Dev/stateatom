# A05.1 — native invocation-boundary experiment

Mandatory A05/O02 remains in progress; this closes only its preregistered finite
native mechanism question. BASE84e3e23, dirty new experiment/fixture; no product
runtime, source compiler, package, permission or UI changed. Plan:
[native boundary](../superpowers/plans/2026-10-21-a05-native-boundary.md).

One owned Chrome153.0.8010.12 raw-CDP session per off/on mode, no Atom extension,
framework, external server or application evaluation. Real native Input clicks
exercise17 original synthetic interactions. Only minimal native pause/frame/
currentTarget metadata and fixture-produced synthetic output are retained; no
arguments, scope contents, function bodies/descriptions or return values.

## Actual result

`node experiments/actions/native-boundary.mjs` produced
.artifacts/a05/native-boundary/2026-10-21T03-14-12-563Z/results.json:
PARTIAL_NATIVE_ENTRY_AND_RETURN_POINTS_NOT_A05_ACCEPTANCE; errors[], stable inputs.
Five finite control checks passed.17 EventListener pauses and14 owned return-point
pauses, plus one same-source function breakpoint control, total32 native pauses.
Off mode had0 pauses. All17 original outputs/order agree; original exception
identity remains true, disabled handler does not run, disarmed click adds0 pauses.
Owned breakpoints/object group/process cleanup verified. No performance acceptance
or general scheduling equivalence follows from these fixture controls.

- Ordinary native `this` identifies the actual registered currentTarget at entry.
  Nested target and capture/bubble/delegation show why this is not original target
  or event-object identity: native auxiliary data only has eventName/targetName.
- Arrow/bound handlers have no native DOM `this`; no nearby node is substituted.
- Throwing, return-with-finally and finally-overrides-return-by-throw have NO native
  return break locations in this actual Chrome. Other return-point pauses do not
  establish completed exit. Async return is not async completion or linked work.
- Two factory closures have identical generated function locations and different
  native receivers. A function breakpoint obtained from registration A actually
  stops invocation B. Neither function breakpoint nor source equality identifies
  the selected callback object.
- Real node/listener replacement changes backend node and function location;
  no old identity is borrowed. Application output is a semantic control only,
  not Atom-observed invocation/effects or an evidence oracle passed to an analyzer.

`node .artifacts/a05/native-boundary/verify.mjs` →
.artifacts/a05/native-boundary/verification.json:
VERIFIED_FINITE_PARTIAL_NATIVE_MECHANISM_NOT_A05. Checks exact current inputs,
archived driver,17 off/on outputs/error identity/disabled, target/closure/replacement
counterexamples, absent try/finally returns and cleanup. `node --check` and
`git diff --check` also pass. No global test rerun is needed for this isolated
non-product experiment; the existing1664 source suite remains its prior checkpoint.

## Failures and history

The initial shell redirection failed because its new output parent did not exist;
the experiment had not started. After creating that directory, the first actual
run at03-13-29 failed its OFF-mode cleanup assertion: an unarmed breakpoint sentinel
was undefined while compared with null. Actual off-mode17 controls and owned
cleanup were retained; no ON-mode mechanism ran. Initializing the sentinel to null
corrected this harness defect without changing any mechanism/control predicate.
Original FAIL result/driver remain:
.artifacts/a05/native-boundary/2026-10-21T03-13-29-360Z/results.json.
Logs: .artifacts/a05/native-boundary-{first,second}.log.

The earlier experiments/execution/entry.mjs beforeScriptExecution rejection is
unchanged and was NOT repeated. It tested script instrumentation pauses, whereas
this new question tested actual listener and return breakpoints. Neither result
is promoted into a complete invocation/ownership certificate.

Next bounded item: A05.2, finite development instrumentation for an exact original
event carrier and supported synchronous function entry/exit. First verify original
returns/throws/Promise identity/order, capture/bubble/disabled/replacement and gaps;
do not build a whole application graph or generic async tracker. Only after that
mechanism works should the original armed UI consume it. Native read-only production
observation remains a separate boundary, independent of F05 mutation grants; native
partial evidence does not enable source or production trace support. A05/L02 and
A02's reducer-lineage gap stay open. No SDK, publication or other repository work.
