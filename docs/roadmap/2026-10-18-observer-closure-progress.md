# Same compiled observer body, different captured closure

Bounded follow-on to the [telemetry fix](2026-10-18-observer-intrinsics-progress.md),
under autonomous roadmap authorization. Product observer/browser/IDE code and
distributed outputs are unchanged. Only the original Apache-2.0 compiler harness,
synthetic control helper and package commands are extended. This assesses a
missing acquisition premise; it does not implement a new resolver or effect engine.

The preselected question: do exact compiled runtime/helper content, frozen API
slots and the current public clock identify the clock function already captured
by telemetry? Two fresh browser contexts receive the same runtime bytes. One
declared init script replaces Date.now before module initialization. The common
runtime control restores public Date.now **before** the selected synthetic call,
then runs capture/read/member once on a private quota object. The replacement
touches only that declared object while its control context exists; every global
and descriptor is cleaned up before React entry. Original app code/getters are
not rerun to extract values.

The expected refusal control is: identical runtime/helper hashes and original
P2/P1 outputs, but different captured clock behavior. The ordinary control keeps
quota 12; the pre-bootstrap wrapper writes quota 99 through the retained closure
while the originally read/result value remains 12. A current own clock descriptor
cannot identify a function captured earlier. This controlled marker is not a
product writer event, actual selected app invocation witness or readonly proof.

The first 41-check run is retained separately. It demonstrated same-code/different
bootstrap effects but restored the public clock only after the controlled call;
it therefore cannot support the stronger current-descriptor claim. The final
control moves restoration before the call and explicitly checks it. No acceptance
criterion is weakened, no product observer fix is claimed for pre-bootstrap code.

The existing compiler model keeps invocation, readonlyEffects, currentFieldAncestry
Unknown and fullPath:false. Exact compiled module content is available, while the
acquired ledger has no exact executed observer call/callee/captured-closure history.
There is no accepted readonly wrapper summary. A frozen method, a matching body,
an equal selected output or a restored public property is insufficient.

```sh
COMPILER_TAG=<unused> npm run verify:observer-closure
```

This includes all 38 preceding native controls and three closure refusal checks.
Keep native harnesses sequential. The preceding clean 259-file product candidate,
375 tests/build, 38 native and 26 actual UI checks remain revision-specific evidence;
this harness-only successor reuses them because product code/build bytes are
unchanged. Its new native result is separate from those UI results.

Nearest task: assess whether an exact executed callee and captured initialization
can be acquired for one selected own-data call without replay, forced evaluation
or debugger-pause effects. Define a minimal trusted observation and its negative
control before implementation. If unavailable, record it as a missing mechanism;
do not infer it from the compiler journal or current global descriptors. Alias
lifetime and complete current-field HTTP ancestry remain additional gates.
Original full P2/P1 is NOT MET, historical deep results remain 0/6, Vue PARTIAL is
not support, and publication/human acceptance remain separately uncompleted.

## Recorded result

`COMPILER_TAG=observer-closure-final-20261018 npm run verify:observer-closure`
passes **41 native checks** with stable source/dependency hashes and no errors.
The ordinary control has calls:0/quota:12/value:12; the pre-bootstrap control has
calls:3/quota:99/value:12. Both run the original callback once, report no error and
explicitly confirm publicClockRestored:true before capture. Both observed runtime
digests are `eb2c3f4b5a816c37d27e81b6a722204ffa706039e77116a72205b3f8f2bcdccf`.
These are actual synthetic native observations, not inferred application ancestry.

Final full **375 tests** pass again. All **34 product build outputs** are byte
identical to the frozen product candidate; the only package change is the new
harness script. Product observer/browser/IDE source is unchanged, so the preceding
26 actual UI checks are reused explicitly rather than presented as a new UI run.
Native results and evidence-reuse.json live in
`.runtime/compiler-probes/observer-closure-final-20261018/`; the first weaker run
is separately retained as observer-closure-first-20261018. No old/frozen source,
dependency setting, installed package, publication or acceptance threshold changed.

Independent read-only review identified the initial restoration timing mismatch
and confirmed the final source restores the public clock before controlled state
and capture, with the explicit check in both modes. No remaining blocker was found
in the limited inference/cleanup delta. The reviewer did not run native UI and made
no source edits; native/UI evidence retains the scopes above.
