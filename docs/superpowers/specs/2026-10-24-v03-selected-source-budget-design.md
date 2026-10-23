# V03.9 — selected workspace sources within existing budgets

Executor design under autonomous task/checks/local-commit authorization, not a
new user-approved product matrix. Base de6e0f8/main, scope-review-1.

## Problem and boundary

Record121 reproduces exact helper5 source: background admission exhausts160 files
before original it-tools selected CInputText SFC, although all6 trace digests equal
the original. Preserve native70 FAIL and all original source/scalar-read/IDE/input/
export criteria. Acquire necessary selected/trace files first within the same
160-file/256000-byte-file/2000000-byte-total limits. Do not validate missing files.

Approaches: raising limits only moves the failure and violates this task; ignoring
missing digest validation invents evidence; safe exact candidate reads followed by
the remaining background budget address the demonstrated cause. The third is the
executor's choice. No index service, source cache, adapter redesign or SDK.

## Implementation

core/workspace-sources.mjs owns the existing safePath semantics (re-exported from
core/bridge.mjs for all existing consumers) and bounded readWorkspaceSources(root,
sourceRoot,{priorityFiles,isAllowed}). Return the existing [{file,text}] schema.
The bridge derives at most160 distinct candidate paths from selected marker,
trace target/commit source and trace nodes; page claims grant no filesystem scope.
Default background acquisition shares the same budgets and excludes duplicates.

Resolve canonical root/mapped source folder; only supported js/jsx/ts/tsx/vue/svelte
files inside it can enter analysis. Priority paths use canonical relative POSIX
segments, <=1024 characters/48 segments; reject traversal/absolute/backslash/percent,
empty/dot segments and original excluded node_modules/.git/dist/artifacts segments.
Reject leaf and ancestor symlinks for candidate reads as the original walk does.
Read only regular files through an opened handle, with bounded buffer reads and
pre/post path/descriptor identity and metadata checks; never read a FIFO/device or
silently accept a concurrently replaced source. Recheck trusted isAllowed across
awaits/before reads. Close every descriptor. Revalidate admitted path/ancestor and
identity/metadata after all acquisition awaits; omit changed sources without
refilling. A bounded synchronous metadata fence adds no later-file await. This is
not an atomic filesystem snapshot or a watch against edits after return. Defaults
and limits are executor calls; other-platform and performance qualification remain
separate from Linux controls.

Wrong/missing digest remains Stale, unsupported/oversized/escaped/missing candidates
remain absent; marker identity and exact source location logic are unchanged.
No arbitrary code/getter/application execution, no source writes or authority grants.

## Evidence and delivery

Actual bridge HTTP RED must reproduce omission beyond160 background files. Real
filesystem controls cover priority/duplicate/file/UTF8 total limits, mapped subtree,
symlinks, path attacks, regular-file and trust boundaries; existing security/setup
tests and full npm test pass. Retained original source data is only an additional
source replay control, not independent runtime acceptance.

A real bridge-source change invalidates helper5's222-input proof. Build new exact
helper with existing build:extensions/pack:development commands; reproduce its
bundle and retain warnings/licenses. Reuse Atom70/UI2/plugin5 only after checking
their exact inputs and installed payloads. Do not reinstall original app dependencies
or an unchanged plugin merely to refresh counts. Derived consumer identity receipts
must identify inherited strict-install proof versus newly checked artifact identity.

Register new exact helper/receipt identities in the original source case before
native execution, with target/expression/scalar/digest/range/timeout unchanged.
Actual native gates must pass or remain FAIL; another distinct failure becomes one
next bounded item. Whole V03/C09/A02/L02/V02 and20/29 remain open without their gates.
ONE whole-increment fresh review, one tested correction pass at most, no re-review.
No publication/push/design/accounts/certificates/user profiles/other repository.
