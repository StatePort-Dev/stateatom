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
