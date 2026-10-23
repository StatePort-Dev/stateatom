# P04 — bounded whole-item acceptance

2026-10-23. Reviewed range `3681f5d…ae2b4a9`, main; approved `scope-review-1`.
**P04 is complete within its documented finite brief**, following ONE fresh-context
scope/code/evidence review. The U06/U03/P04 C07 reporter-to-recipient path now has
its bounded implementation/actual acceptance. **19/29 whole tasks (~66% equal
count), not release readiness**. Mandatory L02 usefulness/A02 and integration/
validation/release gates remain open; A05 remains mandatory/scoped complete.
No SDK/publication/redesign/other repository or independent-human blocker.

## Review and acceptance

Applied `superpowers:requesting-code-review`, fresh reviewer
`/root/p04_whole_review`, no inherited conversation, read-only. No other reviewer
or review loop. Verdict: Yes for bounded whole-P04 acceptance; Critical0,
Important0, Minor0 requiring correction. No correction pass was necessary.
The reviewer inspected current collector/runtime/ownership/capture/report/privacy/
reader/Continue/cleanup paths, actual native13/17/25/7 receipts and historical
matrix reuse, rather than accepting documentation as runtime proof.

Independent review verification: all511 final source/test/helper hashes and268
handoff source-manifest hashes match, as do archives, referenced logs/aggregate
receipts and both installed host manifests.171/171 focused checks PASS,
0fail/skip/cancel,5693.890737ms:

```sh
node --test --test-isolation=none \
  tests/production-observations.test.mjs \
  tests/handoff-observation-evidence.test.mjs \
  tests/handoff-observation-report.test.mjs \
  tests/atom/production-observation-runtime.test.mjs \
  tests/atom/production-observation-capture.test.mjs \
  tests/atom/observation-controller.test.mjs \
  tests/atom/observation-history-runtime.test.mjs \
  tests/atom/handoff-observation-coexistence.test.mjs \
  tests/browser/handoff-observation-reader.test.mjs
```

Review output is copied from `/tmp/stateatom-p04-review-focused.log` to
`.artifacts/p04/whole-review/2026-10-23/focused171.log`; report/rulings handoff and
`acceptance60.json` reside beside it. No broad/native experiment was repeated for
review. `git diff --check` passes.

## Accepted product and evidence

Atom `0.1.0-candidate.20261021.60` / UI `0.2.0-candidate.20261018.2`, exact handoff
`.artifacts/atom/2026-10-23T07-59-52-553Z/atom-handoff.json`.
Current full source2379 PASS with511 matching inputs; installed types2/admission9/
build PASS on unchanged product/build inputs. Actual native scopes:13 primary
X11/keyboard/denial/tab-switch,17 independently admitted F05/U02 coexistence,
25 normal/inspector/worker-loss/passive-history and7 local-map exclusion, both hosts,
0 inspector console warnings/errors in these scopes. Details and exact receipts:
[98](98-p04-primary-reporter-and-context-stop.md),
[99](99-p04-named-coverage.md).

Finite collector: explicit Start, bounded post-start temporal request/error metadata
and sampled selected DOM reads; exact owned context; Stop/Delete/limits; unknown
prehistory and mutation time; no collection-induced app action. Reporter words,
original point, observation window and separately admitted edit outcomes remain
separate through reviewed privacy/save/download/passive reader. Continue/reopen
stays in the same inspector. Worker-loss history has unknown end/no resumed owner.
Context cleanup retains its actual closing reason. Default-private maps/bodies/
queries/forms/source content stay excluded; dependency/effect/consumption and
server restoration are not inferred.

[99's named H07–H09 table](99-p04-named-coverage.md) is the coverage map. The nine
relevant ledger/native/data/report/history modules remain byte-identical58→60;
the recorded runtime diff and current changed-path checks justify scoped reuse.
Historical58 FAIL29 remains FAIL,59 embedding remainder is separate, and neither
is described as a new60 full-matrix run. All source/native/picker/CA/driver/port/
interrupted-helper failures and original criteria remain intact.

## Rulings on behaviors set aside by reviewer

| Reviewer set aside | Executor ruling |
| --- | --- |
| Release-wide performance/universal applications/official distribution/publication | Agreed: V02/V03/I01–I03/V04 stay open. No latency, overhead, release or real StatePort/Capture claim follows from P04. |
| Independent-human usability/comprehensive visual fidelity | Agreed: actual agent-operated flow/narrow/keyboard checks are credited; screenshots remain candidates, no human study invented. A second person is not a baseline gate. |
| Consumption/causal effect/complete server restoration | Agreed: intentionally Unknown; failed constraint-refused Undo stays failure, not positive restoration. |
| Historical failure causes beyond recorded controls | Agreed: preserve the actual observed failure/control boundary; no retroactive pass or universal cause claim. |
| Mandatory L02/A02 and remaining requirements | Agreed: neither is waived or closed. SDK remains outside Atom. |

Next ONE dependency-ready bounded item: **V02.1 preregistered Basic/active-observer
latency and overhead measurements**, after completed F01/F02 (and now P04).
No dedicated performance command currently exists; add only the small declared
measurement harness needed for this slice. Preregister workload/order/sample counts,
retain raw distributions and target misses; do not tune the workload after results
or silently waive approved thresholds. Full V02 still needs its other modes and
additional completed-baseline dependencies, including useful L02.
