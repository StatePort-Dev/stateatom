# V03.3 — detailed report structure correction, source verified

2026-10-23, scope-review-1; base65dea62. The V03.2 detailed-report failure is
reproduced in pure codecs and corrected in source. **Full V03 remains open and
20/29 whole tasks unchanged.** Original Atom65 runtime failures remain failures;
this change is not installed/native acceptance of new package bytes.

[Plan](../superpowers/plans/2026-10-23-v03-handoff-structure-budget.md).

## Cause and implementation decision

The exact retained **before-Cart** diagnostic is32437B, SHA256
`f3536775d64e376a27c791654912225981e248954d4d878cb06c58a7f930d553`.
It is a different observation from the lost current1Cart private capture; no
substitution of event/property provenance is made. Registered diagnosis:
`.artifacts/v03/handoff-limit-diagnosis/2026-10-23/results.json`.

Draft/default projection and minimal report pass. Its detailed projection has778
fields,312658B,9440 object members,3088 array entries and12529 total nodes.
The old generic mixed10000-node guard rejects this shape in reviewed emit/decode.
Inert0/20-map derivatives pass and40 fails; they are controlled JSON derivatives,
not new browser observations. The code also has an independent lexical10000-member
guard. The same mixed-node limit appears across six decoder implementations.

The correction explicitly changes the internal **v2 aggregate node ceiling from
10000 to20000**, with two independent component bounds:

| Bound | Current correction |
| --- | --- |
| Total object members |10000, existing lexical guard unchanged |
| Total array entries |9999, new shared parsed-JSON guard |
| Total nodes |20000 = root +10000 members +9999 entries |
| Byte size/depth/string |1MiB /16 /16384, unchanged |
| Duplicate keys/decoded names/forbidden keys | Existing refusals retained |
| Schema/IDs/digests/exact parents/numbers/rows/privacy | Existing checks retained |
| Legacy-v1 read path | Original mixed10000-node rule retained |

These parser numbers are an implementation decision for this bounded defect,
not previously user-approved product parameters. This allows legitimate mixed
metadata while preserving the old worst-case flat-array ceiling and the existing
member bound. It does not guarantee every projection below2048 rows fits all
other independent bounds. Over-limit shapes continue to refuse; no truncation,
automatic simple fallback or evidence promotion is added.

One shared constant/array guard is consumed by minimal/reviewed/source/input and
the action/observation data decoders. The array helper accepts only already parsed
inert JSON after byte/syntax/lexical validation; it is not a safe live-object API.
Previously accepted small v2 files retain their formats and behavior. Old65 readers
can still reject newly supported larger mixed structures; sharing those files
requires a matching new reader, which has not yet been packed/qualified here.

## Actual checks and limits

Before product edits, the new synthetic large-metadata regression failed with
the same reviewed `HANDOFF_LIMIT`; existing refusals passed. The failed isolated
Node child-runner attempt and direct5-test RED3/PASS2 output are retained separately
in `.artifacts/v03/handoff-structure-budget/2026-10-23/`.

After correction:

- `node --test tests/handoff*.test.mjs tests/atom/handoff*.test.mjs tests/browser/handoff*.test.mjs`:
  **653/653 PASS**, no skips/cancellations (`focused.log`).
- Existing `npm test` with package-defined `--test-isolation=none` and root/engine/
  browser/Vue/Atom globs: **2494/2494 PASS**, no skips/cancellations (`full-source.log`).
- Six new shareable synthetic cases preserve every field/join/omission through
  reviewed creation/redaction, source/input/action/window/note composition and
  exact-parent checks. They retain Unknown map scope, private-value omissions,
  historical trust and unverified notes; they are not native acquisition evidence.
- New controls retain flat-array and aggregate nested-array refusal,10001-member,
  depth/text/byte/duplicate refusal across all six decoder paths, original legacy
  behavior, forbidden keys, forged evidence kinds/IDs and corrupted digests.
- `git diff --check` passes. No original test/evaluation criterion was deleted or
  changed; the explicit parser budget change above is not hidden as an unchanged
 10000-node control or a fully compatible old-reader capability.

### Exact retained snapshot under the corrected source

`.artifacts/v03/handoff-structure-budget/2026-10-23/retained-correction-v2/results.json`
strictly reparses fresh detailed313986B and composed317382B files. All778 fields,
17 joins and752 omissions equal the original projection, including their actual
evidence kinds; the original diagnostic digest is retained. Default selected text
remains omitted. Input history was not acquired: the control attaches an explicit
empty-history packet, preserves historical-untrusted and checks exact parent bytes.
It does not recreate the lost current1Cart capture or claim live input consumption.

The first verification script incorrectly supplied a new capture time; the product
correctly refused `INVALID_INPUT_EVIDENCE`. Original script/registration/failure note
remain in `retained-correction/`. The next script uses the exact historical createdAt
and completes codec assertions/output writes; sandbox then refused its read-only Git
metadata subprocess. A separate receipt continuation reparsed those existing output
files and finished the metadata with permitted read-only Git. No app/browser or file
generation was repeated for that receipt. No binding check was weakened.

Original65 archives and standalone host remain byte-exact. **Seven current product
source files differ** from that old receipt; all are the named decoder/budget files.
The retained-source registration checks its unchanged inputs. Full source tests ran
on this corrected checkout; the retained capture's old runtime identity is separate.
No new tarball, installed reader, Chrome UI install, source-connected app, Vue or
reserve run follows from these source results.

## Disposition

ONE fresh whole-increment review accepted this source correction,0 Critical/
0 Important/0 Minor. The next bounded item is **V03.4**: prepare a new exact Atom/UI pair and exercise only the
affected detailed current-report → download → fresh-reader route, preserving the
original65 failure. Reuse the already pinned app/dependencies/data and completed
Basic evidence; repeat only what the changed handoff bytes require. No old matrix,
CA/setup, SDK, another repository or publication is authorized by this correction.

Full V03/A02/L02/V02 and the baseline gates remain open. The source correction and
passing codec tests alone do not prove the new installed feature works.

## ONE whole-increment review

Range65dea62..dc53c70, report:
`.artifacts/v03/handoff-structure-budget/2026-10-23/review/review.md`.
Fresh reviewer6/6 tests,331 registered hashes and7 log/output hashes pass; retained
778-field/17-join/752-omission projection and exact-parent linkage independently
match. Focused653/full2494 are inspected original run results, not suite reruns.
No correction pass or re-review was required.

Rulings on every Declined item:

- D1: retain these explicit bounded implementation defaults for this local
  candidate under the defect-fix scope. They are not prior user approval or an
  immutable universal product policy; future budget changes need their own checks.
- D2: V03.4 owns new packed/native success. Original65 detailed FAIL stays FAIL.
- D3: require the new matching reader for enlarged reports. Old65 compatibility
  or future release negotiation is not inferred from unchanged format names.
- D4: retain all independent caps and the separate input-packet limit. No promise
  that every projection below2048 rows fits, or that packet capacities all expand.
- D5: fullV03/A02/L02/V02 and native/platform/runtime gates stay open; empty-history
  composition and source counts cannot replace their evidence.
- D6: keep the helper internal to parsed inert JSON callers. No general app-object,
  getter/proxy/cycle inspection capability is introduced or claimed.

Source checkpoint `source-checkpoint.json` seals source/logs without claiming final
document hashes. `final-verification.json` separately seals the final review and
current documents after these rulings. No native evidence is regenerated.
