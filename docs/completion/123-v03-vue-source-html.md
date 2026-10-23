# V03.10 — selected Vue source-template HTML parsing, in progress

2026-10-24 local, base3ff130a/main, scope-review-1. Previous V03.9 engineering
complete; corrected helper7 original native4 setup PASS/378 stable then exact
source links0/required1 FAIL. Whole20/29 (~69%) and full V03/C09 unchanged.

[Design](../superpowers/specs/2026-10-24-v03-vue-source-html-design.md),
[plan](../superpowers/plans/2026-10-24-v03-vue-source-html.md).

The generic source-template parser rejects the original ordinary input after the
selected textarea. Use the existing locked Vue DOM parse export, preserving
original text, exact ranges/digests, marker/instance identities and evidence kinds.
No source-only parser result proves execution, consumer lineage or native workflow.
Actual checks/new helper/original native outcome/ONE review remain due.

## Source implementation and actual checks

core/vue-source.mjs now uses existing locked compiler-dom parse, matching the
Vite transform. No dependency/version, source text, schema or validation change.
Actual synthetic source RED6:1PASS/5FAIL (void selected/siblings/repeated targets,
namespace and false raw-text handler). Malformed nonvoid/self-closing control
already passes. Focused39 PASS/0fail/skip across new source tests, existing Vue
action/transform and workspace/HTTP controls. Actual full npm test terminal28707:
**2585 PASS/0fail/skip**,91305ms. These are source checks, not installed acceptance.

Actual unchanged original-source replay now yields one exact selected expression,
same digest and range **156:9–174:11**, with runtimeValue=null and Code-linked
source edge. Actual source reader still shares160/338501B; retained trace validates
Observed and contains one selected disabled=false scalar read. This replay is
source-only; original native helper7 FAIL stays immutable.

The first replay preparation guessed the end at176:11 and failed against actual
174:11. Preserve initial script/log. Corrected oracle calculates the literal
unchanged textarea span and independently asserts156:9–174:11. No product/driver/
native criterion was changed, and the initial failure is not called a product bug.
