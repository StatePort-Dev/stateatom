# A02.29 — native returned-state reference source checks

Source recipes and private reference observer implemented in four NEW source/test
files. Source base3d4214dd7674e680cf01ab4c9913b5113811aa60; registration:
.artifacts/a02/native-state-return-source/2026-10-25/registration.json.
No existing research/product source changed.

The pinned ReactDOM19.2.5 recipe captures each original reducer-return element
once, in order, and forwards its already-computed value. Three native return sites
and two renderer entries carry source locations/digests. App entry supplies the
actual constant lexical App function reference. The observer relates private App
tokens, exact component/fiber/tuple/state/dispatch references and complete windows;
it reads no tuple slots or hook/queue/fiber payload properties. Duplicate,
mismatched, missing, stale, stopped, weak-unavailable and capped paths refuse.

Checks: node --test --test-isolation=none tests/engine/react19-native-state-return-*.test.mjs
Initial52/52PASS1564.245294ms/full4645PASS116511.342075ms. After review,
55/55PASS1598.090896ms/full4648/4648PASS0failed0skipped118273.137462ms,exit0. Four syntax checks and git diff --check exit0.
1203 registered hash comparisons equal, including119currentresearch/327product,
all historical groups and3pre-code documents. Exact checks/logs retained in the
plan workspace pending final review/archive.

The semantic controls used18 OWNED VM contexts per final test pass:12 native original/transformed,
one App identity, three composed and two nested-eval semantic controls. They cover getter count/order,
throw identity, function shapes, lexical collisions, proxy opacity, mismatches,
Off/Stop/windows and weak/bound constraints. Actual retained ReactDOM and App
were compiled/parsed ONLY. Initial RED imports established missing modules,
not a pre-existing behavioral defect.

A source DTO may report nativeReturnedStateReferenceAssociation:Observed
conditionally on the supplied declared events. It remains sourceOnly:true,
native origin NotAttested, nativeStateOrigin/tupleIndexOrigin/public hook kind/
revision/storage/ownership/instance/selectedDOM Unknown, fullA02 false. No native
qualification, browser, real App invocation, model or saved-reader run occurred.
No product capability or readiness credit follows from these source checks.

Final review: ONE fresh gpt-6-astra/high,0Critical2Important0newMinor. Both
Important fixed in ONE tested pass: nested direct eval/getters/closures now cause
whole-source refusal; duplicate native tuple after App exit/before seal invalidates.
Both new behavioral controls failed before fixes (53PASS2FAIL) and passed after.
Unrelated out-of-frame tuples remain accepted as irrelevant. No rereview.
Sixteen declined review domains have explicit effect/cost rulings in the ledger:
native/installed execution; event authenticity; state/index/hook kind; commit/revision;
ownership/DOM; scheduling; production wiring; unsupported profiles; preinstalled
intrinsics; GC/performance; independent repeats; historical-current proof; oldminors;
UI/model/SDK/release; archive closeout. No missing premise is converted to evidence.

20/29/fullA02 and11 old deferred minors unchanged. Review correction complete.
Next ONE bounded step: separately scoped native integration and actual acquisition
qualification of this exact returned-state-reference premise; no generic ownership
kernel, oldnative retry, SDK, otherrepo, publication or user-profile changes.
