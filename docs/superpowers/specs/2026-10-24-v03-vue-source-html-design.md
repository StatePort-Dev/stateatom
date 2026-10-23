# V03.10 — Vue source-template HTML parsing

Executor design under existing autonomous task/check/local-commit authorization,
not a newly approved product matrix. Base3ff130a/main, scope-review-1.

## Problem and scope

Corrected helper7 acquires the exact original it-tools CInputText source and its
trace validates Observed. The original selected-source question still fails0/1:
core/vue-source.mjs calls generic baseParse without HTML rules, rejecting the
ordinary non-self-closing input after the selected textarea. Preserve all old
failures and original source/scalar/digest/IDE/range/input/export acceptance gates.

Use the existing locked @vue/compiler-dom3.5.44 parse export in vueSourceUnit,
matching the Vite transform's DOM parse choice. Its local primary implementation
calls baseParse with parserOptions (HTML mode, void/native tags, namespaces and
text modes). Context7 resolved exact version; its narrow version query had no
match, general query returned SFC options only. Locked installed implementation
is authoritative for this exact API; no upgrade/new dependency is needed.

Alternative baseParse plus manually supplied DOM options duplicates the existing
parse export; manual tag rewriting changes original offsets and cannot meet the
exact original-source requirement. Use parse, retain parser refusals, event-inner
mapping boundaries, digest/marker/instance matching and Code-linked semantics.
No source execution, transformation or application patch belongs in this fix.

## Checks

Synthetic source-only regressions cover ordinary input and all standard void
siblings, repeated same-line selection, original source spans, SVG/foreignObject
namespace retention, textarea text that looks like markup, malformed nonvoid
refusal, self-closing control and encoded event mapping refusal. Existing Vue
source-action and instrumentation controls remain required. No fixture proves the
original runtime. Replay the retained unchanged original source/selection through
the actual reader/analyzer and check exact selected expression/digest/range.

Run focused checks and full npm test after implementation. Commit source before
building a new helper with declared build:extensions/pack:development. Reproduce
exact bundled bytes/input hashes and retain warnings/licenses. Atom70/UI2 product
inputs327 and plugin5 inputs19/installed14 exclude core/vue-source.mjs; reuse only
after checking every recorded input/archive, no dependency reinstall.

Preregister only new helper/development/consumer identities, then run unchanged
original native driver on exact Atom70/new helper. It must pass its actual gates
or retain the next concrete FAIL. Source-only success is not native acceptance,
consumer provenance or full C09/V03. ONE fresh whole-increment review at the end,
at most one tested correction pass/full suite, no re-review. Preserve history and
local ledger. No SDK, publication/push, UI redesign, account/certificate/user
profile, other repository or independent-human blocker.
