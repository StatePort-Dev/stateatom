# A04 — whole-item review and closure

A04 is complete within its original positive Vue property/source/action matrix.
One read-only agent review `/root/a04_whole_review` checked e4dcbac..0bb401f against
original05/A04, approved02/12, evidence model and the actual declared matrix:
0 Critical,2 Important,0 Minor. Both Important findings were reproduced and fixed;
no mandatory criterion was waived, and no second whole-item review was started.
Receipt: .artifacts/a04/review/result.json.

## Review resolutions

1. A template interpolation `{{ save = other }}` previously did not enter lexical
   binding analysis, leaving the original mutable callback incorrectly Code-linked.
   Interpolation expressions now participate in the same write analysis as
   directives. The changed callback is Unknown; an unchanged direct-handler
   positive control stays Code-linked. No expression is evaluated by inspection.
2. Compiler expressions decode HTML entities, while their locations address raw
   SFC bytes. Previously the decoded offsets could truncate the raw binding and
   misidentify an inline source range. Vue bindings now retain the exact complete
   compiler raw expression span. Encoded inner source mapping explicitly refuses
   with Unknown/Unsupported, no guessed callback/source/calls. Direct encoded names
   and inline `&quot;`/`&lt;` controls assert original text and exact range.

## Actual post-review verification

Dirty BASE0bb401fa8e2c376e980cb0109b0a950bd5478fc8; exact unchanged local Atom
0.1.0-candidate.20261021.6 from02-27-38. The rebuilt contributor analyzer/IDE are
separately sealed; they are not part of that tarball or installed-VSIX acceptance.

- `node --test --test-isolation=none tests/vue/source-actions.test.mjs`:
  RED9PASS/2FAIL, then GREEN11PASS. Both original failures are retained.
- Focused command from36-a04 with the same Vue/source-marker/action/diagnostic/
  template/plugin/worker/UI files:131PASS,0 fail.
- `npm test`:1664PASS,0 fail/skipped; no original control removed or weakened.
- `npm run build:extensions`:PASS with the previously recorded CJS/import.meta
  warnings. No optional dependencies or replacement compiler added.
- `node tests/integration/vue-positive-native.mjs .artifacts/atom/2026-10-21T02-27-38-725Z/atom-handoff.json`:
  47PASS, errors[],228 stable scoped inputs, actual two-host property/source/IDE/
  real-router/updates/two-instance/HMR/v1/Basic/reader/semantic-control matrix.
  .artifacts/a04/vue-native/2026-10-21T03-05-58-773Z/results.json.
- `node .artifacts/a04/review/verify.mjs`:checks current native input hashes,
  immutable archive/entire hosts, saved bytes, RED/GREEN/full/focused logs and the
  unchanged earlier pending matrix receipt. Result .artifacts/a04/review/result.json.
- `git diff --check`:PASS before commit.

Logs: .artifacts/a04/source-adapter/review-{red,green,focused,full,build,native}.log.
Only the affected Vue native workflow was repeated after these source fixes.
Earlier React105, original short-loop30 per host20PASS/10PARTIAL, admission7,
strict consumers2 and finite compilation4 stay their recorded checkpoint in36-a04.
They were not rerun or relabelled as fresh current checks. The prior
verification6.json keeps WHOLE_REVIEW_PENDING/reviewCount0 unchanged; this later
record adds the actual review and fixes. All old PARTIALs and failed attempts remain.

The [framework matrix](../testing/framework-capabilities.md) names supported
versions/modes and missing inner router read/opaque cache ancestry. Callback runtime
identity, invocation and complete committed producer/lineage remain unobserved.
Human visual/installed-product/distribution/release acceptance is not inferred.
SDK remains outside Atom; no publication or other repository change.

Next unfinished dependency-ready item: mandatory A05/O02 bounded Action Trace.
Begin with the preregistered finite native listener/return mechanism experiment;
the historical beforeScriptExecution rejection is retained, not repeated. A05/L02
and A02's concrete reducer-lineage gap remain open.
