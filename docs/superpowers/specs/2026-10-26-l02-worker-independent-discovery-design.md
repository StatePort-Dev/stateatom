# L02.14 — worker-independent evaluation host discovery

Resume main03b378e under existing autonomous local task/commit authorization.
One source-only prerequisite, no native/browser/model/install/download/profile or
certificate/trust changes. FullL02 mandatory/open, 20/29 unchanged; preserve original
quality corpus, thresholds, fallback, raw results and frozen readers/cases.

## Existing evidence
L02.13 record158 stopped waiting for a new service_worker target. Zero API calls,
34unvisited, load unknown. Read-only current owned-cache Preferences includes only
the previous evaluation path among the two exact relevant paths; mutable current
inventory does not establish historical load failure or its cause. Do not retry158.
Chrome documents ephemeral workers; worker presence is neither path identity nor a
necessary installed-host condition. Its WebUI extensions-item.data exposes
ExtensionInfo(id/path/state/location). These are unstable internal UI fields:
missing fields or ambiguous exact-path rows must refuse, never guess by name.
Sources consulted2026-10-25:
https://developer.chrome.com/docs/extensions/develop/migrate/to-service-workers
https://raw.githubusercontent.com/chromium/chromium/main/chrome/browser/resources/extensions/item.ts
https://raw.githubusercontent.com/chromium/chromium/main/chrome/common/extensions/api/developer_private.webidl
Not native Chrome156 compatibility proof; no direct developerPrivate calls.

## Contract
Within existing local-comparison-native.mjs, add a browser-evaluated read-only
snapshot of the initialized extensions-manager backing inventory, restricted to the exact prepared host path.
Return only id/path/state/location and UI readiness; no unrelated extension data.
Node-side classifier requires ONE exact-path item, a-p32 ID different from priorID,
location UNPACKED and state ENABLED. TERMINATED is explicitly not usable in this
bounded route; no enabling/reloading or worker wakeup. Missing UI/rows return null,
malformed matching rows, duplicates or contradictory identity refuse. Baseline
must contain no expected path before drag. No ID derivation, name match, active
worker fallback, preferences read/write or new permission.

After native drop, poll this path snapshot under existing20s bound; targets remain
diagnostics only. Keep discovery before model, then existing exact nonce + actual
Debugger.getScriptSource SHA check before the explicit driver availability poll and trusted Run/create/prompt. Failure
retains latest bounded discovery snapshot in raw result. Change only this driver
and its already-frozen owner test file; no source-list/preparer/qualifier/schema/
provider/UI/package changes. Existing frozen case source drift must refuse; no new
native case in this item. Source controls include worker-absent matchinghost,
foreignsame-name, unknown fields, blocked/disabled/terminated, wrongID/location,
duplicate/path-prefix, baseline replay and nonce/loaded-byte rejection retained.
No fixture is actual installation/model evidence. One final whole-item review;
ONE tested I/C fix pass, minors deferred. Local commits and archive ownworkspace.

## ONE review correction rulings
I1: manager presence and rendered-row absence cannot establish inventory readiness.
Require didInitPage_===true plus typed extensions_/apps_ arrays; Chrome populates
both before initPage_. Read their exact-path records, not potentially delayed or
filtered DOM rows. Missing/changed initialization shape refuses. Two new controls
cover incomplete inventory and pre-existing host whose DOM row is delayed. This is
an explicitly necessary refinement within the same two research files; no native
compatibility claim. Source consulted:
https://raw.githubusercontent.com/chromium/chromium/main/chrome/browser/resources/extensions/manager.ts
I2: the inherited page performs availability() at load before loaded-script proof.
The proof gates the explicit driver poll and trusted Run/create/prompt only. Do not
claim a pre-any-API barrier. Keep startup feature detection unchanged; it starts no
model session/inference. This corrects the new contract/report, not historical data.
