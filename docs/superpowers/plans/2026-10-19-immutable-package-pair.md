# F04 execution ledger — immutable pair

Scope: docs/completion/03-runtime-and-onboarding.md, F04; base 61eb183.
Continue on the user's current main branch. F01–F03 and historical evidence
remain credited. No product redesign, public release, SDK or StatePort edits.

1. Add failing package-admission controls for identity reuse, mismatched peer,
   old contracts, missing exports/assets and stale declaration bytes. Implement
   shared installed-pair validation and immutable packing receipts.
2. Reproduce exact package bytes; install into a clean consumer, build both
   browser hosts from declared exports, compile strict packed declarations.
   Run native embedding acceptance and applicable Actions/maps on both hosts.
   Explicitly test default embedding HTTPS denial. Keep existing loopback
   read-only maps available; do not widen the default embedding host.
3. Review this bounded diff once with fresh context, resolve material findings,
   preserve all original receipts, record checks and update the one-item plan.
   Commit locally; name one next dependency-ready item, then stop.

Expected: focused negative tests fail before implementation, then pass; repeat
tarballs have identical SHA-256, clean type consumers pass, native suites retain
their existing assertions. Failures remain recorded, never reclassified as PASS.

Packaging outputs carry BUILT_NOT_VERIFIED until separate native evidence is
recorded. Source manifest digest includes package build/payload inputs and host
sources; consumer receipt includes installed export/type/asset hashes and host
bundle input/output hashes. Existing .8 bytes can be reused only if identical.

Pre-flight: exported assets/types → clean consumer → host bundles → native UI.
Ruling: extend the existing handoff additively, leaving its schema /1 and fields
readable by existing harnesses; verification is a separate append-only receipt.
Cost if wrong: old consumers could ignore added fields, so validation explicitly
checks the supported API/wire/UI contract rather than inferring new features.

Progress: 8 focused controls GREEN after observed RED (6 missing rejections;
missing font already refused); real installed matrix 7 PASS; strict types 2 PASS;
pack reproduced .8 and UI .2 exactly. First native embedding run passed 13
checks then the new HTTPS control incorrectly searched the product's filtered
tab list. Source shows unsupported origins are omitted; corrected test also
asserts this omission and obtains native tab ID solely to test direct refusal.
No product or acceptance change. Original failed receipt retained.


Final review: fresh-context f04_review. Two Important findings fixed: hidden
staging prevents rejected tarballs poisoning immutable history; bundled dependency
notices now enter both hosts. The source-inventory omission was regraded as
Important because claiming exact inputs while omitting license inputs misstates
reproducibility; it is fixed in the same pass, not deferred polish. Existing
negative controls and real installed receipt demonstrated missing notices RED;
staging restoration regression and final receipt are GREEN. No deferred minors.

Task 1: complete — 10 package controls PASS; real installed matrix 7 PASS; exact
Atom .8/UI .2 SHA reproduction; 81 source inputs, 37 installed package files.
Task 2: complete — strict consumers2 PASS; embedding35 PASS; Actions32 per host;
maps19 per host; final unit628/628 PASS; check:ui PASS. Native suites retain
original assertions. Actions driver now explicitly approves development via UI
before attach (F02), rather than treating source pairing as mutation permission.
Original failure receipts retained. No runtime or token/layout changes.
Task 3: complete — evidence/report/task-index updated; one next item U05.
Final integration: local commit on the existing main branch; no push/publication.
