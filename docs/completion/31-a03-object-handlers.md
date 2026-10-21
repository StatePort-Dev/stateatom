# A03.1 — bounded local object handler declarations

Status: complete within this source-only increment; **parent A03 remains open**.
Dirty source BASEaae5141ec8abefb793e8dcc4b3b4d8b2ebca502d; local candidate
0.1.0-candidate.20261021.2. Plan:../superpowers/plans/2026-10-21-a03-object-handlers.md.
No runtime adapter, invocation trace, new UI/layout/token, SDK or publication.

## Result and boundary

Previously every `onClick={actions.save}` member stopped with a generic boundary.
The source resolver now links an unambiguous own method/data callback in a local
constant object literal. Methods use their source key/range; named data callbacks
reuse their actual lexical function/hook relation. Anonymous functions retain a
null symbol and their expression range, so the existing UI shows the real binding
expression rather than an invented business name. Each relation carries its own
Code-linked evidence ID/source digest. It observes no application function identity
and never calls a handler, getter, hook or factory.

Const alone is insufficient: the receiver must have only direct static JSX event
member reads, no write/alias/return/argument/spread escape or other unsupported use.
Exported receivers, global-script/dynamic scopes, getters/setters, spreads,
computed/duplicate/prototype keys and ambiguous/unsupported imports stay Unknown.
The declaration/reference budget is64 each, with the existing alias/depth/file/
excerpt limits retained. Module-private and function-local objects are distinct
from accessible global-script bindings. No whole-app ownership certificate follows.

This is a declaration relationship at a digest-bound selected JSX marker/column,
not a committed callback witness or an observed invocation. Native registrations
remain separate and execution stays not-observed. Existing source/DOM/navigation/
detach freshness rules apply. Ordinary React19 state/prop/HTTP lineage remains open.

## Meaningful checks and exact package scope

- Existing source baseline:30PASS. New final tests fail8 on the original resolver
  and pass26 on the correction (five supported-path failures plus explicit refused-
  boundary classification controls). Focused action suite38PASS; full npm test
  1629PASS, zero fail/skipped. Initial RED25/5 and later exact-final RED26/8 logs
  remain separate; no invalid harness record is counted as a product failure.
- npm run build:extensions completed; existing esbuild CJS/import.meta warnings
  remain. npm run pack:atom produced exact immutable handoff
  .artifacts/atom/2026-10-21T00-38-37-796Z/atom-handoff.json.
  Strict packed TS consumers2PASS and package admission7PASS. Archives/installed
  pair/both entire host manifests are verified, not rebuilt under an issued ID.
- The new resolver executes in the current open IDE/analyzer, **not inside the Atom
  tarball**. Its source and built IDE bytes are sealed by the native run's own
  before/after input manifest and actual positive results. The Atom handoff alone
  does not prove analyzer or installed-VSIX support. This is current contributor
  VS Code Extension Host evidence, not a newly installed VSIX acceptance.

Current native command:

`node tests/integration/actions-native.mjs .artifacts/atom/2026-10-21T00-38-37-796Z/atom-handoff.json`

Result59PASS across standalone and embedding:
.artifacts/a03/actions-native/2026-10-21T00-41-13-311Z/results.json.
Browser plugin unavailable; explicit native inspector/app Input uses the existing
Atom debugger with no parallel app CDP owner or generic Playwright compatibility
layer. Actual source-open audits match original file/range/selected bytes. Twelve
source cases per host cover existing direct/inline/hook/memo/factory/prop plus own
method/data/anonymous/getter/mutation/escape cases. Original two-custom-hook instance
and disabled controls remain separate from the added two-object-method instances.
Inspection never increments application invocation/getter counters; original render
getter reads exist and are unchanged. A normal native method click produces the
same application effect off/on; Atom still reports invocation not-observed.

The original keyboard/template, actual native listener once/target metadata,
delegation boundary, saved/reviewed v1 action export with default excerpts omitted,
DOM replacement/navigation/detach freshness and browser-only native fallback all
pass. This export control proves exact stored/reviewed bytes; native download and
new offline reader acceptance are not claimed. App console/exception monitoring
is not a parallel app-CDP session; no all-console-health claim is inferred from
the inspector/cleanup error list. No model or model download ran.

Final aggregate:.artifacts/a03/object-handlers/verification2.json,
PASS_SCOPED_OBJECT_DECLARATIONS_NOT_WHOLE_A03. It matches all166 native input
hashes against current files, including analyzer and built IDE, plus exact package/
consumer/host receipts, actual12-case/IDE/instance/off-on/export records per host
and original archived57-driver input. WholeA03Complete and invocationObservedByAtom
are false. Package/contract/source counts alone are not the acceptance argument.

The first current native run passed57 with the added object pair; it remains
.artifacts/a03/actions-native/2026-10-21T00-39-13-590Z/results.json. The final59 adds
the original custom-hook pair explicitly and seals the final driver; the old57
driver is archived and is not relabelled current. The original legacy
`npm run verify:actions` attempt remains failed at Attach:
.runtime/action-runs/2026-10-21T00-30-32-046Z/results.json. Its screenshot explicitly
says Native debugger resource is already attached. No owner guard was weakened;
that failed command is not called PASS or a product source-resolver failure.

## Visual and remaining parent scope

Current390/1100px candidates retain13px Inter base and no horizontal overflow.
Compared against supplied13-actions-handlers.png: shared header/type/control base,
white source card, neutral source/evidence labels and native expanders persist.
The existing Atom inline Actions section, direct source button and template output
remain deliberate deviations from the prototype's tabs/tree/simulated Trace/Observe
flow. No simulated POST/observed-callback support is added. These are agent-operated
geometry/visual checks; screenshots remain human-review candidates, not acceptance.

Next bounded A03.2: forwarded handler source paths, with explicit selected-instance/
override/ambiguous-parent controls and no runtime prop witness invented. Parent
A03 also retains relevant custom-hook forms, capture/bubble/stopPropagation and
replaced-listener/prop freshness controls before its ONE whole-item review. A05
invocation observation, A02 lineage, mandatory L02 and P04/C07/release stay open.
