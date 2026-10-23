# V03.9 — bounded selected workspace source acquisition, in progress

2026-10-24 local; base de6e0f8/main; scope-review-1. Source implemented;
new exact helper/native qualification and ONE review due. Whole20/29 unchanged.

[Design](../superpowers/specs/2026-10-24-v03-selected-source-budget-design.md),
[plan](../superpowers/plans/2026-10-24-v03-selected-source-budget.md).

## Change

Record121's real source reader exhausted160 unrelated files and omitted the
original selected CInputText SFC. The new workspace reader prioritizes candidate
paths from selected marker, trace target/commit and trace nodes before background
enumeration. Candidates share the existing160-file/256000B-file/2000000B-total
limits with background sources. No missing digest is treated as validated.

`safePath` moves with identical semantics to core/workspace-sources.mjs and stays
re-exported by core/bridge.mjs. Candidate paths remain constrained to canonical
mapped sources, supported extensions and existing excluded directories. Leaf and
ancestor symlinks/special files are refused. Bounded handle reads compare descriptor
identity/metadata and current paths before/after, and recheck host trust across
awaits. Acquired handles close after trust loss. No app code/getter is executed.
Path1024-character/48-segment candidate bounds are executor choices, not a new
user-approved capability matrix. Default returned source schema is unchanged.

## Actual source checks

Logs `.artifacts/v03/selected-source-budget/2026-10-24/`:

- Real helper HTTP RED4:2PASS/2FAIL. Late selected source and a distinct late
  dependency fail; wrong-digest and mapped-outside negatives already pass.
- New reader-module import RED is retained separately, not behavioral proof.
- Initial source/HTTP/security/setup24 PASS. New post-open trust cleanup test
  reproduces a descriptor leak9PASS/1FAIL; capture the handle before the awaited
  post-open check, then focused25 PASS.
- Full existing `npm test`: **2575 PASS**,0fail/skip. Final focused25 repeats the
  same assertions after explicit platform labels/skip predicates: descriptor
  probes are Linux-only, FIFO is not claimed on Windows; current Linux has0 skips.
  Full run used the prior test labels, with identical current-Linux behavior.

The retained original trace replay now includes the exact selected SFC first among
160 sources and matches its original digest. Existing validateTrace returns
Observed. **The source replay remains PARTIAL/exit1:** original analyzer produces
zero source links. Exact direct probes show original SFC parse has no errors and
setup TypeScript parses, while its ordinary non-self-closing HTML input triggers
the analyzer's generic template parser “Element is missing end tag”. This is a
distinct source-span parsing boundary. No original source/scalar/IDE/input/export
criterion is reduced or passed by the reader control. Original native70 FAIL stands.
Artifacts `retained-source-replay-initial.mjs`, `retained-source-replay.json` retain
the failed broader assumption and bounded actual result separately.

## Next exact execution

Commit source before new helper build. Existing build:extensions/pack:development
commands produce a new local immutable helper; no publication. Reproduce its
actual bundled bytes and new source inputs, retaining warnings/licenses. Atom70
and plugin5 are unchanged only if their full recorded inputs match. Reuse the
strictly installed plugin and its prior checks through an explicit derived
identity receipt; never claim a fresh install.

Preregister only necessary helper/development/consumer identities in the original
case; run that same native source question on exact Atom70/new helper. The source
span gate must pass or remain FAIL. The likely next parser boundary stays separate;
no app patch, target substitute, budget increase, SDK, design, account/certificate/
user profile or other repository change. ONE whole-increment review and at most
one tested correction pass remain due, with all evidence preserved.

## New immutable artifacts and original case registration

Source commit271b183 is clean producer for
`.artifacts/development/2026-10-23T21-23-20-987Z/handoff.json`.
Existing build:extensions and pack:development terminated0. New helper VSIX0.1.3
SHA `fb4135633b5701e83169e54847402fd3da6b71e1253ea8c476c2a3e3d108ca7f`,
bundle `3b7e4922f4ed102daec06b2feb22970008b453454584c1821921d8d3f47d176f`,
5073051B/223 current inputs reproduced exactly. The two existing CJS import.meta
warnings remain recorded, not suppressed or qualified by this source fix.

Repacked plugin5 is byte-identical to supplied5, SHA
`a6362897971eecdc0f0cd66a9cf25a4473be8224704e2a635cd4bbe7bf887453`;
its19 inputs and14 installed files match. Atom70/UI2 archives and327 source/build
inputs also match. No original app or plugin dependency install is repeated.
`consumer-reuse.json` explicitly distinguishes inherited strict Node18/npm9/profile
checks from two fresh artifact/installed-payload identity checks. It initially
marks the new helper NOT installed/native-qualified. All9 VSIX entries, package,
bundle and licenses are checked. Two preliminary verifier failures (sandbox
spawn and stored Node version's optional v prefix) remain in logs; the final
identity verifier actually terminates0. These are not product/native failures.

Preregistered commit8fb5795 adds
`docs/testing/independent-vue-source-case70-helper6.json`, changing only
`developmentHandoff`, `consumerReceipt`, `expectedHelperSha256`. Every original
question/assertion/target/expression/scalar/digest/range/timeout/action stays intact.
The first preparation attempt and corrected-context native run are recorded below.

## Actual new helper installed result

First registered case6 run failed preflight before browser/IDE/app creation:
`.artifacts/v03/independent-vue-source/2026-10-23T21-26-28-485Z/results.json`,
0 checks,378 stable inputs. Derived receipt omitted original `appRoot`. Preserve
that preparation FAIL and immutable receipt. Corrected derived receipt additionally
retains verified original appRoot/dependencyFile; all five fields read by the
native driver are checked. New case70-helper6-context changes only receipt path
and is preregistered in a4cca02. No helper/app/plugin rebuild or criterion change.

Actual corrected-context result
`.artifacts/v03/independent-vue-source/2026-10-23T21-28-25-366Z/results.json`:
**4 setup PASS /378 stable execution inputs, then selected-source FAIL**.
Actual installed isolated VSIX SHA and bundle match exact new helper6; private
receipt/source connection and empty original app baseline pass. Original textarea/
disabled=false/selected marker and helper-validated runtime Observed now pass,
removing the prior missing-source Stale barrier. Exact original source expression
still has zero links (required1), so the original question remains FAIL. No scalar-
read, exact IDE range, input, save/export or recipient acceptance is credited.
Immutable498 unchanged, working497+known components.d.ts delta unchanged; own
Vite exits0/null and helper closes. Old helper5/Atom70 Stale failures remain intact.
The new journal still has256 captures/source-budget/script-budget/anonymous/isolated
limitations, no finite first-read/code-history qualification from this increment.

ONE final whole-increment review remains due. Next bounded dependency-valid item
is **V03.10: correct the selected SFC source parser's HTML void-element handling**,
with actual original source/range/Observed-read/IDE criteria unchanged. Generic
baseParse rejects the original ordinary input; no original app rewrite or target
substitution is proposed. This is separate from the safe source acquisition fix.

## ONE final review and single correction pass

Fresh readonly astra/high review de6e0f8..a34eb0d reports Critical0/Important1/Minor0.
The Important is real: after admitting selected file A, awaited acquisition of B
could permit A to change, returning old bytes accepted by its old trace digest.
Reviewer probe/report are retained in the artifact directory. No re-review.

Four new real Linux controls replace, overwrite, delete or symlink the ancestor of
an already admitted selected source when the later source descriptor opens.
RED14=10PASS/4FAIL. Retain admission identity/metadata and perform a final bounded
synchronous path/ancestor/metadata fence after all acquisition awaits. Changed
sources are omitted, old trace becomes Stale, later unchanged source remains.
GREEN focused29 PASS/0fail/skip, full **2579 PASS/0fail/skip** (91150ms).
Invalidated slots are not refilled or reread; file/
byte budgets and wire schema unchanged. No watcher/resource lifecycle added.
The final metadata fence has bounded synchronous I/O (at most160 files/48 segments
each), not atomic snapshot, post-return freshness, performance or other-platform
qualification. Corrected retained replay still indexes160/338501B, exact original
selected digest and Observed validation; source0 remains PARTIAL/exit1. New exact
corrected helper/native execution follows;
helper6 results above stay historical for its precise pre-correction bytes.

## Corrected helper7 exact registration

Clean producer `2c888e296c8bacb98f6f6b780457da2d036b225e`; declared build/pack,
exact byte reproduction and identity derivation all terminate0. Immutable handoff
`.artifacts/development/2026-10-23T21-39-11-444Z/handoff.json`:
VSIX SHA `354f49d78d0b437bdbf0e6e03b82fa28b017323c2413a7bbea575dd294ae378f`,
bundle `dbc127ec8b2ec4e2d9604604697a5b0563efbc9417ffa2a5dd6d816ceb7389be`,
5073818B/223 exact inputs; two existing CJS warnings retained. Plugin5 archive,
19 inputs/14 installed files and Atom70/UI2 archives/327 inputs match unchanged.
New `consumer-reuse-helper7.json` explicitly inherits prior strict plugin admission
and retains verified original appRoot/dependencyFile; no reinstall/native pass.
Case70-helper7 changes only handoff/receipt/helperSHA from helper6-context and is
committed before execution. Original app, driver, question and criteria unchanged.
