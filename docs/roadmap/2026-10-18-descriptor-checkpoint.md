# Captured descriptor intrinsic checkpoint

The late-descriptor fix preserves original calls after an app replaces the public
Object.getOwnPropertyDescriptor function. Retained RED: 10 additional host-tap and
two parsed-field calls. Captured bootstrap descriptor/apply functions remove those
extra calls. Source review found no TDZ/branding or receiver/error regression; it
ran 27 focused checks, not an independent native run. No general guarantee for
all later intrinsic replacements is made.

Root unit suite: **204 PASS**, full build PASS, final notices rebuilt. Logs:
`.runtime/late-descriptor-final-{unit,build}.log` and
`.runtime/late-descriptor-notices-build.log`. Revision remains bcde3d0f1572878df662db6bab79e65bc66dd6d0
plus each run's exact dirty source/build manifests.

## Native/harness checks

Run sequentially with unused tags and no separately running dev server:

```sh
CONSUMPTION_TAG=<unused> npm run verify:source-consumption
HOST_TAG=<unused> npm run verify:react-host
STATE_TAG=<unused> npm run verify:source-writes
SHORT_TAG=<unused> npm run verify:short-loop
```

The frozen tags are late-descriptor-20261018, except consumption uses
late-descriptor-poison-scope-20261018. Consumption **8 PASS**, including actual
browser off/on descriptor calls=0; host **21 PASS**; state/write **14 PASS**.
Short loop retains **20 PASS /10 expected PARTIAL**, **106 UI checks**, stable source,
build and fixtures. Resource/TodoMVC learn.json 404s remain recorded; no clean-console
claim. The initial consumption harness falsely included the new positive descriptor
case in its broad '-control' poison assertion. The failed run is retained; the fixed
assertion explicitly covers all four original poison cases, without changing their
required rejection.

Browser-only investigation **26 PASS** with
`BROWSER_TAG=late-descriptor-20261018 npm run verify:browser`.
`IDE_TAG=late-descriptor-20261018 npm run verify:ide` again verified exact editor
range, three masked left/right/joint repetitions, consumed responses/rollback,
Restore true and Stale, with strict clean IDE shutdown. Independent evaluation
`INDEPENDENT_TAG=late-descriptor-20261018 npm run verify:independent` retained all
three useful fragments and held-out labels; no store/HTTP lineage claim.
Run commands/exit statuses: `.runtime/late-descriptor-regression/pipeline.json`.

## Actual UI and clean acceptance

`HOST_UI_TAG=late-descriptor-20261018 npm run verify:source-writes-ui` passed
**19 actual panel/IDE/review/export/fresh-offline checks**, stable inputs, no run errors.
This verifies the working React inspection cycle and explicit limits, separately
from the native acquisition mechanisms.

A 193-file clean source archive at `/tmp/stateatom-late-descriptor-candidate-20261018`
preserved executable modes and excluded Git history/dependencies/runtime/inherited
builds/the old spike. Fresh public npm cache/empty configuration install, **204 unit
tests** and full build passed; all **27 output hashes** match this checkout's frozen
product candidate. The poison-harness correction was amended with exact old/new
hashes after install/build; it changes neither dependencies nor output inputs.
Record: `.runtime/candidate-bootstrap/late-descriptor-20261018/results.json`.

`HOST_UI_TAG=late-descriptor-clean-acceptance-20261018 npm run verify:source-writes-ui`
passed the same **19 checks from that clean copy**, correctly recording revision:null
and sourceArchive:true. User-authorized acceptance is agent-operated, not independent
human/manual installation. Safe reviewed synthetic exports/screenshots/results are
in `.runtime/preview-acceptance/late-descriptor-accepted-20261018/`; profiles, pairing
credentials and raw IDE logs were excluded. The intentional duplicate-disabled
negative fixture still emits its Vite warning.

All 1,527 general historical-spike and 241 old short-loop hashes matched again in
history-preservation.json. The old experiment remains unchanged. Only standalone
experimental commands/docs added after this frozen product checkpoint are outside
that 193-file archive; they do not change the accepted UI/runtime mechanism.

## Following mechanism

The source-use/function-fragment prerequisites remain conditional/incomplete.
The script-entry probe separately found beforeScriptExecution does not establish
actual Function invocation history; retain its PARTIAL result. It supplies no
product ownership capability. The next bounded native observation is actual Query
cache/query handoff/revision identity, motivated by the first opaque source-use
boundary. It remains design-only and will not establish readonly field lifetime
by itself. Historical deep results remain **0/6**, fullPath false. Private security
reporting authorization, independent human usability and publication remain pending.
