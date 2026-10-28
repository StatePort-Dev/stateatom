# A02 — native post-commit text mutation case

Frozen before execution, 28 October 2026, afterdcf3942. Run
`node tests/integration/selected-list-route.mjs --dom-controls` on the existing
built standalone/source-helper route. Unique browser and artifact paths; preserve
case301 positives/unknown-code/untouched-row controls.

In addition, require:

1. The actual selected first label has a supported original chain and exact revision.
2. A direct native text mutation of the second label leaves the first label's
   supported chain and applied revision unchanged. This tests unrelated sibling
   subtree isolation; it is not an actual picker-overlay interaction.
3. DOM.setNodeValue changes the selected first label after its acquired commit.
   A fresh inspection must refuse specifically because of the DOM interval while
   the code journal remains Recorded and the issued code context remains owned.
   Reinspection cannot restamp that same commit.
4. A new ordinary app edit creates a new React commit and restores a valid chain.
   Native setNodeValue then writes exactly the same current selected text. Despite
   equal final text, the new inspection must refuse for the DOM interval, with no
   unknown MAIN compilation. Reinspection must remain refused.
5. A subsequent original React edit/commit can establish a new supported interval.

Use original app native keyboard/mouse actions and direct CDP DOM mutation/read
commands. No application expression/getter/callback re-evaluation; unknown MAIN
expression remains solely the existing final code-refusal control. Native DOM
values identify/check the mutation input only, never infer causal authority.
Source/pass criteria unchanged. Context7 checked the official CDP DOM command
contract; documentation itself is not evidence of these results.

This finite mutation qualification is not complete282, held-out, installed open
plugin/IDE, official-host or picker-overlay acceptance. No benchmark rerun.

## Discovered control extension, before corrected execution

Initial native run18-55-57 reproduced a defect: after external selected text, a
new same-value React commit could leave that DOM unchanged yet reset its guard.
Preserve this failure; require an additional explicit negative for that no-op
host update. Recovery must use an actual original changed host write (`restored`),
then the native equal-value mutation writes `restored`. The original positive
recovery criterion remains; a root commit alone is insufficient evidence.
