# V02 — obsolete tab cleanup must not supersede the current read

Final93 warm-source attempt11:22:15 retained two warmup rows only, then failed on
reselecting the already-current javascript-es6 target via Home/ArrowDown. It is not
a latency PASS. The two-target setup-only attempt11:21:54 passed; earlier first
attempt11:12:36 failed while preparing javascript-es6. All raw attempts remain.

A bounded diagnostic11:23:54 reproduced the empty inspector while runtime retained
the selected element. Request-order diagnostic11:27:57 established the cause:
rapid tab changes issue two current-tab deep reads after different cleanup promises.
The older change's cleanup finishes late and starts a newer load generation. That
read conflicts with the current choice's ongoing property refresh, fails with
`Element changed during property refresh`, and supersedes its valid reply. The
old action belongs to an obsolete tab generation, so its error is not displayed.
The inspector ends empty/OK even though backend state remains attached/selected.
Diagnostic wrappers only observe actual own-extension sendMessage calls/results;
no response substitution, application instrumentation or performance credit.
Three attempted pre-navigation diagnostic hooks failed before setup (invalid own
page session); their files remain. They establish nothing about product behavior.

Add the missing tab ID AND generation guard after context cleanup, before load.
A deterministic regression holds the first production-close, makes a newer tab
choice, then resolves the obsolete cleanup while the current state read is pending.
RED:2reads instead of1. GREEN:87 inspector/source-map tests, including the new race,
ordinary tab changes, pending picker cleanup, stale replies and source invalidation.
Commands: `node --test --test-name-pattern='late tab cleanup' tests/atom/inspector-ui.test.mjs`
and `node --test tests/atom/inspector-ui.test.mjs tests/atom/source-map-ui.test.mjs`.
Ordinary local logs `/tmp/stateatom-tab-cleanup-{red-native,green}.log`; an earlier
restricted-sandbox launch failed at the runner level and is not a regression proof.

Issue immutable Atom94 for the executable UI change; preserve93 and all existing
feature evidence. UI2, plugin17, helper and runtime authority policies unchanged.
This guard is not a visual redesign. Full final acceptance is still open; next is
actual corrected two-target switching and the unchanged warm-source protocol on94.
No repeated Active-overhead campaign, trust import, model corpus or publication.
