# V01.3 — installed VSIX maintainer route and whole V01 checkpoint

2026-10-23, scope-review-1. Local V01.1–.3 implementation/checks complete;
ONE whole V01 review pending.19/29 whole tasks unchanged until that verdict.
No remote CI/push/upload/release occurred. V02 performance and L02 remain open.

[Plan](../superpowers/plans/2026-10-23-v01-installed-maintainer.md),f1483f0;
implementation b61daa9. The maintainer route is deliberately Linux graphical,
using installed VS Code and a nested X11 display with separate user/extensions
directories. Missing environment and occupied49331/cooperative lock are
non-success. An actual occupied-port control refused before installation or GUI,
preserving its existing socket owner. Main user profiles/windows were not used.

```sh
node scripts/verify-installed-maintainer.mjs .artifacts/development/2026-10-21T04-00-48-663Z/handoff.json
```

This consumes the **original** helper0.1.3 VSIX, SHA256
`261ca69de815b8e4749a3e4070a177826bc6cdd592c9ab616b7a08856234a1a6`,
from source revision6a61c8aa8560f0f9845d63c780fb5ab143796dcd. The original handoff
and artifact bytes remain unchanged; pack:development/producer/plugin rebuild was
not run. Current helper protocol/id/version are checked. This does not qualify
the old plugin as a freshly built current plugin.

## Actual installed result

First actual GUI attempt passes10 checks,15 before/after/current source identities:
`.artifacts/v01/installed-helper/2026-10-23T14-21-12-112Z/results.json`.
Actual VS Code1.142.0 Extension API resolves the product from the isolated installed
extensions directory, validates its packaged manifest and loaded bundle against
the exact VSIX. Bundle SHA256
`1ef5f5de27dddc64d48ba126c19b5cc050199db7e8f525254728268a86a18c8e`.
Only the inert acceptance driver uses Extension Development Host loading.

The real public pairing/copy-receipt command produces a matching private receipt
for the chosen trusted synthetic workspace/session. Controlled **Node protocol**
requests then pair that workspace, refuse stale source and path traversal before
any editor selection, and open `src/example.js` line1 columns14–23. Actual
`window.activeTextEditor` audit observes selected text `readiness`. The dedicated
IDE quits cleanly with trusted host-complete/offline-guard records. The guard's
scope is Node http/https/fetch in that test Extension Host, not all Electron,
native/child-process networking or a universal security certificate.

Protocol requests use a synthetic extension origin. They are **not** actual Atom
browser UI pairing, element/source association or ordinary React/query ancestry.
The job adds installed package/IDE acceptance; browser/source user workflows and
other platforms retain their own V03/A02 requirements. No CA/browser/model/app
instrumentation is used by this job.

Private connection/receipt/token and IDE profiles remain under the private run
directory, outside CI upload patterns. Public result is an explicit allowlist of
archive/installed hashes, trusted host version and the synthetic relative file/
range. It contains no private token/workspace/profile path. DISPLAY/session-bus
settings apply to this process's isolated child; clipboard use stays on the nested
display. No main IDE instance was closed. Preflight is an exercised occupied-owner
refusal, not a global concurrency or every-launcher-race certification.

Meaningful classifier RED4→GREEN8 with existing installed-helper controls refuses
EDH, wrong archive/bundle/helper/version/trust/completion/file/range/observation;
public projection excludes private authority. Actual negative port job is
BLOCKED_ENVIRONMENT as expected, not a successful installed run.

## Whole V01 verification

One final `npm test` after the new CI/test tools: **2469/2469 PASS**,0fail/skip/
cancel,100627.076161ms.901 current source/test/harness/plan inputs before/after
match; this is a source identity set, not901 demonstrated capabilities.

- [109](109-v01-packed-ci-lane.md): install/unit/build preserved, deterministic
  UI check and separate clean-SHA immutable pair/types/admission job; actual YAML
  selector positive/wrong-revision control and check:ui pass.
- [110](110-v01-native-candidate-lane.md): actual browser matrix has23 retained
  unchanged Basic/fresh-reader checks plus39 fresh maps checks,341 frozen inputs,
  exact65/UI2 archives/installed pair/both hosts. Original failed lane and parser-
  message correction remain explicit; no Basic repeat or old FAIL promotion.
- This record: exact installed VSIX/actual GUI10 checks/15 inputs,8 source
  controls; fixed synthetic protocol/source Open route with private evidence.

Original Atom65 qualification full2454/types2/admission9/H0917 remains scoped108
evidence. Product269/326 bundled/build inputs and package bytes are unchanged;
new harness/full2469 does not imply rebuilding65 or fresh performance acceptance.
No ordinary-framework/model/usefulness, real StatePort/Capture, macOS/Windows,
clean full-V03 user path or public-release claim is added.

Local raw/control/full logs and reproducible `verify-whole.mjs`,
`source-whole-before.json`/`source-whole-after.json`, `whole-verification.json`:
`.artifacts/v01/packed-ci/2026-10-23/`. The verifier checks901 current inputs,
actual native join/provenance, exact pair/hosts and actual installed archive/
editor/host records without printing private receipts. The build artifact's
original BUILT_NOT_VERIFIED field is preserved; derived receipts state scope.

## Acceptance boundary and next item

The V01 deliverable is implemented lanes plus a summary of what actually ran;
the hosted GitHub jobs remain unexecuted until separately authorized push. A
local green matrix is not remote CI proof or release readiness. ONE whole V01
review now checks109–111 and the finite code range; at most one material correction
pass/no re-review. Its verdict/rulings will be appended before whole-task credit.

One next dependency-ready unfinished item after that review: **A02**, the bounded
ordinary query/state-lineage gap, depending on completed A01. Preserve its existing
private reducer-only proof and Unknown boundaries; choose one unproved path from
its current checkpoint, without repeating old experiments or a blind model run.
I01/I02 still require another repository and I03 depends on I02/V02, so they are
not silently selected as dependency-ready local work. No SDK/publication/redesign.
