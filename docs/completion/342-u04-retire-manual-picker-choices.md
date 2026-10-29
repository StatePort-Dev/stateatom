# U04 — manual selection retires the old picker

Actual94 official390 screenshot in341 shows selected #run with the old #counter
picker ancestors. Manual selection did not cancel the prior native picker session,
so the parent/refinement controls still belonged to a different selection intent.
This is a real product defect, not a cosmetic layout disagreement.

Before a new inspect-selector operation, cancel the current picker and await native
overlay cleanup. A failed cleanup refuses new inspection. No selected expression
is re-executed to repair UI; normal explicit manual inspection retains its original
identity/semantic guards. Historical saved reports are unchanged.

RED runtime test retained the selected picker after manual inspection. GREEN120
checks cover retired choices/refinement authority, late native events after manual
selection, failed cleanup without new injected inspection, existing picker races,
UI tab races and malformed-selector recovery. Command:
`node --test tests/atom/picker.test.mjs tests/atom/picker-lifecycle.test.mjs tests/atom/inspector-ui.test.mjs tests/browser/selection-errors.test.mjs`.
Logs `/tmp/stateatom-manual-picker-{red,green}.log`.

Issue immutable95, preserving94/93; no UI token/layout change, SDK or publication.
Actual corrected native manual/reselection and final checks follow; source tests
alone do not close U04. Basic94 latency is subsequently accepted by the maintainer343.

Full source verification on16351af: `npm test`, **6514PASS,0FAIL/skip**;
`/tmp/stateatom95-full.log`. This is source evidence, before the immutable95 native run.
