# A02.44 — complete pinned memo overlay integration, source only

A02.43 standalone factory works with owned event streams. Before any new actual
native acquisition, compile the actual retained App/Main/JSX/native source chain
with that factory, keeping the original bundle and all previous gates unchanged.
This is a source-only prerequisite, not permission or proof to rerun an old case.

Create `buildCommittedMemoOverlay()` in one new module. Reuse the unchanged
A02.35 `buildCallbackJSXMainOverlay()` result: original bundle/CSS, App/config,
Main/lowered/config, JSX runtime compiler inputs and original physical hashes.
Transform the same pinned ReactDOM input through `transformPinnedMemoBranch`,
which retains old reducer/state events + native return/render sites before new
native element/fiber and memo branch return events. Recompile ONLY observed bundle
using original App/Main/JSX compiler inputs and new final native code. Keep the same
bundle settings/relative paths so unrelated output bytes/receipts stay comparable.
Build no bundle artifacts on disk or runtime server/browser; no App/React execution.
The ordinary existing esbuild compiler service remains allowed.

Result includes original and new observed bundles/metafiles, original physical
inputs and complete original/observed loaded-input receipts, intermediates for
source audit, new native memo code/receipt, exact source policy and standalone
factory. Closed policy joins App/Main/config/native return/element/memo source
sites. Original native-return output digest must equal the memo chain's native
return intermediate. Every physical input rehashed before and after compilation;
reject unseen/missing/changed inputs and changed old compiler input digests.
Only the observed ReactDOM compiler-input digest changes from old overlay; original
bundle/CSS and App/Main/JSX outputs stay identical. Keep sourceOnly/appExecutedfalse/
browserStartedfalse/retainedMemoItemQualifiedfalse/fullA02false.

Tests first: actual retained source compiles but NEVER executes. Confirm literal
historical original bundle/CSS hash and previous old observed hash differs, complete
input receipts, single intended changed compiler input, output hashes/byte sizes,
original source files preserved, and exact final native helper call-site IDs using
AST of emitted native code. Instantiate actual-policy bootstrap only in EMPTY
owned VM to verify On/Off policies/hooks/zero events/research retention and Stop;
no fake native/MemoItem or consumer-origin claim. Existing semantic recipe controls
remain the source of getter/call/throw/branch preservation evidence.

Current main/local commits; two new codefiles only; old product/research/raw/cases/
readers unchanged. No model/install/package/UI/SDK/otherrepo/cert/trust/publication
or new GC campaign. Required source suite may include its old owned NodeGC fixture,
which proves no historical browser/App GC cause.20of29/fullA02/15deferred unchanged.
Next ONE separately scoped actual integration/acquisition case with prewritten
criteria, frozen sources and at most one launch, if its gates can be satisfied.
