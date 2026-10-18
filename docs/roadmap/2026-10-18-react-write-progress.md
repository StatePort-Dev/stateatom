# Potential accesses in four private React compiler inputs

This follows [three private Query inputs](2026-10-18-query-write-progress.md).
Revision is `bcde3d0f1572878df662db6bab79e65bc66dd6d0` plus the dirty input
manifest of each run. Historical experiments and original P2/P1 criteria remain
unchanged. These are acquisition prerequisites, not a supported full trace.

## Mechanism and limits

Default-off `reactWriteAccessGuards` requires source receiver guards and pinned
React host-props acquisition. The shared AST helper processes exactly four existing
SHA-checked React/DOM 18.3.1 dev private inputs after adapter transforms. Installed
dependencies are unchanged. The eligible site counts are 112 (React), 21 (JSX
runtime), 20 (JSX dev runtime), and 1,187 (ReactDOM). Staged bytes and output digests
are retained. Metadata is hoisted into bounded tables; original CommonJS execution
and fixed-arity pass-through receivers are preserved. All six previously accepted
Query output hashes remain byte-identical after sharing the helper.

The notice identifies `__stateatom_private__/react18/<staged SHA>/<input>` and its
staged range. It is not an upstream/application IDE location. Validation leaves
this auxiliary source Unknown, without producer/value/action authority, while
retaining app source and committed host correspondence. Real workspace/commit
mismatches still become Stale. Wrong namespaces, hashes and selected producers
cannot use this exception.

Original object refs provide a concrete native writer: after the first render read,
React assigns the actual DOM instance to parsed `rules.current`. Only the following
render/read loses parsed field identity. Earlier snapshots remain historical; the
write notice is strictly between the old and new target events. Invalidating the
whole parsed receiver is conservative: the unchanged quota 12 is not evidence that
its current field ancestry is unchanged.

Potential access precedes the original operation. It does not prove completion or
invocation. Implicit/native/opaque effects, other code/realms, earlier history and
alias lifetimes remain incomplete. No complete-writer, readonly, current-field
ancestry or runtime-attestation certificate is accepted. `fullPath:false` and
historical deep **0/6** remain unchanged.

## Retained semantic failures

The first native run exposed an existing class JSX tag accidentally visited as a
ReferencedIdentifier call argument. The original failing run is retained; the
visitor now requires an Identifier and has a JSX class boundary regression.
Another RED control installed an inherited descriptor `value` getter: optional
`.value` access caused three extra application getter calls. Captured own-data
checks now avoid that inherited getter. No getter or user callback is run to obtain
inspection values.

## Repeatable commands

Stop other dev servers and run native checks sequentially with unused tags:

```sh
npm test
npm run build
REACT_WRITE_TAG=<unused> npm run verify:react-writes
HOST_TAG=<unused> npm run verify:react-host -- --react-write-access-guards
STATE_TAG=<unused> npm run verify:source-writes -- --react-write-access-guards
EXECUTION_TAG=<unused> npm run verify:compiled-inventory -- --private-writes
HOST_UI_TAG=<unused> npm run verify:react-writes-ui
```

Manual synthetic entry: `npm run dev:react-private-writes`, then
`/react/ref-controls.html?mode=plain`. Select the quota text, open its app source,
repaint, Inspect again, and review the potential private access. The combined UI
command also retains the previous Query, source-write, CSP and freshness controls.

## Native checks, separate from UI

Root tests passed **297**, full build passed. Native `four-input-reviewed-20261018`
passed **8 checks**, stable inputs/no run errors. Pristine/source-only/private
modes preserve original P1=13, P2=false and P3=15, DOM ref identity, Proxy/getter/
setter effects and original thrown error identity across five ref controls.
Inspection does not replay callbacks. Final served optimized inputs, not just
staged sources, stay below the existing 2 MiB per-source budget; largest captured
input is 1,427,868 bytes. No budget was raised to accept the feature.

The subsequent `react-write-guards-20261018` runs passed **21 host**, **14 state/write**
and **7 compiled inventory** regression checks with the guards enabled. Inventory
is acquisition-only content matching; it supplies neither invocation history nor
ownership. Expected duplicate JSX/prop warnings are negative-control fixtures.
Commands/logs are in `.runtime/react-write-regression/`.

## Actual interface

`react-write-first-20261018` passed **23 actual MV3/panel/IDE/export/offline checks**,
stable inputs/no errors. Chromium 153.0.8010.12 is controlled by pinned Playwright;
Browser plugin unavailable. The new control opens the exact ref-controls.tsx app
range in real VS Code, repeats inspection after the native ref assignment, keeps
the selected value 12 and current app commit, and explicitly removes field origin.
Private source is Unknown/unavailable in both the panel and fresh passive offline
reader. A second inspection produces a new snapshot without extra lazy/effect/
getter calls. Nine reviewed diagnostic exports include this control and the prior
Query/source/CSP paths. Screenshot review confirmed the visible Unknown notice.

Acceptance remains agent-operated under the user's explicit fallback instruction;
it is not independent human, manual installation, Store or publication evidence.

## Remaining decision

Receiver guards close a concrete observed private assignment gap. They do not
supply the missing product-owned code history or complete alias-lifetime effects
needed by the unchanged original P2/P1 full-field criteria. Assess those premises
explicitly before adding another handoff or treating absence of observed writes
as ownership. No new resolver or broader framework support is introduced here.

## Clean-source acceptance

The immutable `/tmp/stateatom-react-write-candidate-20261018` contains **236**
regular source files with original modes, no inherited outputs/dependencies or
old prototype. Fresh locked installation used the unchanged previously verified
public cache with empty npm user/global configuration; it is not a new empty-cache
network-install claim. **297 tests/build** passed and all **34 outputs** matched.
Separate clean runs passed **8 native** and **23 actual UI checks**, stable/no
errors. Commands, manifests and logs: `.runtime/candidate-bootstrap/react-write-final-20261018/`
and `.runtime/react-write-regression/acceptance-pipeline.json`. The review allowlist
`.runtime/preview-acceptance/react-write-accepted-20261018/` includes nine reviewed
exports and screenshots, excluding profiles, raw IDE logs and staged source text.
All 1,527 historical plus 241 old short-loop files were rehashed unchanged.
This freezes the React checkpoint; subsequent product-history work is a successor
candidate, not a retrospective change to these results.
