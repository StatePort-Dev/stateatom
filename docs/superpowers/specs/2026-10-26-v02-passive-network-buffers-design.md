# V02.21 — avoid unused passive response-body buffers

Main/local commits from630ee6f, fullscope/20of29/16deferred unchanged. User autonomy
opts out of design-selection questions. This ONE source optimization does not promise
that it explains the full24–29% original current80 overhead miss or meets10%.
Original207198row workload/denominator/threshold and all old results remain immutable.

Runtime374 sends Network.enable2MBtotal/512KBresource for every attachment. Read-only
without a productionGrantId returns before collectInputNetwork; post-start observation
and source-map headers consume metadata, not Network.getResponseBody. Thus these
renderer payload-preservation buffers have no Atom body consumer in that state.
The [official CDP Network.enable contract](https://chromedevtools.github.io/devtools-protocol/tot/Network/#method-enable)
specifies byte budgets for preserving payloads, separately from network tracking.
Context7 retrieved current docs. Chromium primary inspector_network_agent.cc enable
uses explicit optional values (0 is not omitted/default); network_resources_data.cc
sets byte limits and evicts content beyond them. Source inspection supports trying
0/0 for this scoped state; it is not an installed-version or performance result.
Primary sources: https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/renderer/core/inspector/inspector_network_agent.cc
and https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/renderer/core/inspector/network_resources_data.cc .
No upstream code is copied into Atom. No claim that browser/app/HTTP cache contains
no bodies; these parameters govern the inspector's extra preservation budget only.

Change ONLY Network.enable parameters in packages/atom/src/runtime.mjs: readOnly with
no current local productionGrantId→explicit0/0; local development or grant-bearing
read-only→original2000000/512000. Keep grant-bearing full budget even if a later
policy query would reject: presence is never authority, and existing collection and
writer revalidation remain unchanged. Confirmation already detaches/forces fresh
attach; no privilege transition is added here. Revocation/navigation/restart retain
existing detach/clear behavior. Every repeat attach must reapply explicit parameters
rather than Network.enable without arguments resetting browser defaults. No runtime
mode switches, new policy, new duration/scope, source-body retrocapture, reload or
buffer change while recording. All other enable commands, metrics baseline/lifetime,
script source/anchors/maps/picker/observation/input lifecycle remain unchanged.

TDD new tests/atom/passive-network-buffers.test.mjs uses existing runtime fixture;
additional tests in production-runtime.test.mjs use its existing full production
policy fixture. Reproduce explicit unused budgets and repeat-attach defaults before
fix; verify development/body collection and metadata-only observation unchanged.
Double-confirmation tests pin full budget before eligible future JSON response and
Live/Draft actions; incomplete/cancelled/denied grant stays passive. Fake CDP/source
checks are not actual metadata delivery/response editing or performance proof.
Exactly TWO existing code deltas (runtime + production runtime tests) and ONE new
source test, no UI/tokens/public contract/dependencies/provider/SDK/otherrepo changes.

Register priortracked/product327/archives2/current80V02+closedL02frozen inputs before
edits. Intentional runtime/test deltas become historical via exact pre-edit Git630ee6f;
old raw/case/reader/markers remain byte-identical. Product current80 no longer matches
new runtime after fix; explicitly require a NEW candidate before any installed claim.
This bounded source item ends after focused/full/syntax/hash verification and one
fresh read-only review/one tested I/Cpass/minorsdefer/no rereview. It runs no native,
model, certificates/import or performance measurement. ONE next item after completion:
new immutable package and actual changed-byte correctness, then separately frozen
original performance gate on new candidate if prerequisites permit. No blind matrix,
Debugger removal, lazyPerformance policy, old native/reader rerun or waiver.
