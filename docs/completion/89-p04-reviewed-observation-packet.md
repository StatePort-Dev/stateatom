# P04.4a reviewed observation packet

Continues dd7c18f/P04.3. This is a bounded source increment under scope-review-1,
not whole P04/C07 or new product workflow acceptance.18/29 whole tasks (~62% equal
count) stays unchanged. L02 is mandatory/open; A05 mandatory/scoped complete.

## Implemented

An unimported strict passive stopped-window decoder and separately versioned
`stateatom.observation-evidence` v1 packet. New modules never construct a collector,
restore an owner, read a browser, request source/network or grant input authority.
The existing strict input codec validates the unchanged nested capture and its
original integer clock/raw diagnostic digest. Outer precise acquisition time is a
separate field. A matched capture cannot silently refer to another property/tab.
Unjoined historical fragments stay explicitly unjoined; no causal join is added.

Structural metadata retains start/stop/deadline, unknown terminal clock, missing
history, limits/gaps/counters, independent HTTP versus transport outcome, native
phase ordering and sampled DOM read intervals. Pending Stop remains unobserved;
mutation time and dependency stay unknown. IDs, origins/positions and boolean
samples are optional review fields excluded by default. Selected text/form values,
bodies/headers, query/path details, errors' messages/stacks and source are never
eligible. Exact diagnostic references and acquisition digests remain provenance.
Known-pattern filtering is not a guarantee of PII removal.

Field/category inclusion/omission and reviewer replacements are explicit; a
replacement is not an observation. Privacy derivatives verify exact parent bytes
when provided, preserve structural claims and cannot restore omitted fields.
Duplicate JSON members, accessors, coercion, unknown/decorated fields, invalid
counts/clocks/read intervals, type promotion and re-signed semantic forgeries are
refused. Imported records are immutable historical-untrusted data, executable false.
The new packet is not yet an accepted public report profile/store input.

## Actual verification

`.artifacts/p04/public-evidence/verification.json`:
`PASS_SOURCE_REVIEWED_OBSERVATION_PACKET_NOT_PRODUCT_P04`.

- `node --test --test-isolation=none tests/handoff-observation-evidence.test.mjs`:
  **17/17 PASS**, no skips/cancellations (`green17.log`). A preserved semantic RED
  `property-red.log` has17/16 PASS/1 FAIL before the matched-property guard.
- `npm test`: **2278/2278 PASS**,0fail/skip/cancel,101002.768911ms
  (`full-source-current.log`). First restricted attempt `full-source-attempt1.log`
  retains13 failures from subprocess/listen sandbox EPERM and associated CLI cases;
  retry permits actual local subprocess/loopback checks. It did not lower criteria.
- `node .artifacts/p04/public-evidence/consume-native55.mjs`: **12 PASS** current
  source projections/privacy derivatives consuming the unchanged historical55
  read-only/text/actual-edited captures in both hosts. Source diagnostic hashes,
  both original clocks and text exclusion remain exact. This is current codec
  compatibility with historical native data, **not a new native run**.
- `node .artifacts/p04/public-evidence/verify.mjs`: source/log digests, counts,
  historical native source digest, issued55 archive/UI/install and both host file
  manifests plus all declared55 source/build inputs match. Runtime/UI55 remains
  unchanged and is the last qualified installed candidate; no new package issued.

Preserve `red.log` (test syntax setup), `missing-module-red.log`, initial runner
`green-attempt1.log`, source `green14.log` and stronger semantic RED/GREEN unchanged.
The first default node test-isolation runner hid useful child output in this
environment; subsequent runs use the repository's declared isolation-none setting.
Source-only additions need no repeated historical browser experiment or type/package
campaign on byte-identical55. New native/product claims require the next archive.

## Remaining

Next **P04.4b**: compose a distinct reviewed observation report profile with the
existing snapshot/input/action components; passive reader, notes/source comparison
and privacy copies must preserve evidence and handle overlapping private fields.
Then existing Diagnostic controls, interrupted-window data-only handling, actual
two-host H07-H09 and ONE whole-P04 review/correction remain. Old codecs stay strict.
No redesign, SDK, publication, other repository or independent-human blocker.
