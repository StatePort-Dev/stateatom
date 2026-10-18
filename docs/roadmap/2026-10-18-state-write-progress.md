# React state handoff and write invalidation checkpoint

This checkpoint extends the working React inspection cycle. It does not complete
HTTP field provenance, independent human acceptance or alpha publication. Original
six-family results remain **0/6**, and `fullPath:false` is retained.

## Confirmed links and limits

In pinned React/DOM 18.3.1 dev, opt-in instrumentation observes the original native
JSON consumption, exact native queue/update, actual destructured state binding,
and retained hook on the selected committed host's actual ancestor path. It handles
bailouts only when the exact hook object/state is retained; render-phase cached JSX,
suspended/uncommitted updates, competing equal-valued instances, wrapped hook result
arrays/iterators and unsupported updates cannot borrow a correspondence. No setter,
updater, user expression, getter or Promise reaction is rerun to obtain values.

The current observed field value is still **Unknown/Unsupported** as HTTP ancestry.
Parsed identity and object state handoff do not prove that no writer changed a
field, including an equal-value write. Supported noncomputed completed source
operations invalidate parsed field identities. Recognized captured native Object/
Reflect calls conservatively invalidate parsed target descriptors even on partial
throw. This records a native call, not every individual property write. Aliases,
other realms, computed/logical/class-initializer forms, custom/opaque functions
and incomplete history retain explicit limitations.

The actual panel shows these boundaries; Inspect again after ordinary or recognized
native same-value writes obtains a new snapshot, removes invalid original field
identities and keeps only the independently supported object handoff. Five reviewed
synthetic exports also retain these boundaries in a fresh passive offline reader.

Review caught hook-array/iterator false joins, render-phase/bailout ancestry issues,
reentrant class-initializer receiver capture, invalidation lost through event-map
eviction, and calls to subsequently replaced Object.is/Array methods. Their failing
controls were retained and fixes verified. Review is source evidence, not another
independent native run. Receiver references are weak; no application graph is held
across an abrupt assignment solely to obtain a write observation.

## Frozen commands and results

All tags below are exclusive, new result directories. Run native checks sequentially
with no separately started dev server. Host prerequisites and versions are in the
root README. Revision: `bcde3d0f1572878df662db6bab79e65bc66dd6d0` plus exact dirty input
manifests in each result. These are not committed-revision release claims.

| Check | Command / result |
| --- | --- |
| Unit | `npm test`: **174 PASS** in `.runtime/native-writes-final-unit.log` |
| Build | `npm run build`: PASS in `.runtime/state-write-candidate-build.log` |
| Native mechanism | `STATE_TAG=state-write-candidate-20261017 npm run verify:source-writes`: **14 PASS**, stable inputs, no run errors |
| Actual UI | `HOST_UI_TAG=state-write-candidate-20261017 npm run verify:source-writes-ui`: **19 PASS**, stable inputs, no page/cleanup errors; real panel, exact fresh IDE range, reinspection/stale behavior, five reviewed exports and fresh offline reading |
| Short loop | `SHORT_TAG=state-write-candidate-20261017 npm run verify:short-loop`: original **20 PASS / 10 expected PARTIAL**, **106 UI checks**, stable source/build/fixtures. Nine resource-404 console entries and three TodoMVC learn.json HTTP 404s remain recorded; no page exceptions/cleanup errors |
| Browser-only investigation | `BROWSER_TAG=state-write-candidate-20261017 npm run verify:browser`: **26 PASS**, stable inputs, no run errors; actual 13→2→13 experiment, ABA/control, save/review/export/restart/offline/delete |
| IDE investigation | `IDE_TAG=state-write-candidate-20261017 npm run verify:ide`: exact IDE range, three masked left/right/joint repetitions with consumed response/rollback, Restore true and Stale, strict clean shutdown PASS |
| Independent apps | `INDEPENDENT_TAG=state-write-candidate-20261017 npm run verify:independent`: all three preregistered **USEFUL_SUPPORTED_FRAGMENT** answers; React activeTodos.length=1, React Redux activeCount=1 and todo.text="Alpha independent". Stable product/build/business sources; five resource-404 console entries; no store/HTTP-lineage claim |

The prior affected default-mode checks `state-writes-default-semantics-20261017`
(7 semantic controls) and `state-writes-host-regression-20261017` (21 host controls)
remain applicable. Later native write recognition is opt-in and default false;
these checks were not repeated without a concrete new risk.

## Clean source acceptance

A fresh 172-file source archive at `/tmp/stateatom-state-write-candidate-20261017`
contains no Git history, dependencies, inherited builds/runtime or old prototype.
Public-registry installation used empty user/global npm configurations and a fresh
cache. Installation, 174 unit tests and full build PASS; all 27 browser/IDE/reader
output hashes equal this checkout. This is not a fresh OS or published-source test.
Manifest/logs: `.runtime/candidate-bootstrap/state-write-candidate-20261017/`.

The first clean UI attempt failed because the archive constructor lost the IDE shell
wrapper's executable bit. That failure is retained. Source modes were restored from
the checkout and recorded in `source-modes.json`; bytes were rechecked unchanged.
`HOST_UI_TAG=state-write-clean-acceptance-modes-20261017 npm run verify:source-writes-ui`
then passed **19 actual UI checks**, stable inputs, no run errors. The result correctly
records `revision:null`, `sourceArchive:true`. User-authorized acceptance was
**agent-operated**, not independent human or manual Store/VSIX installation.
Safe allowlisted results/screenshots/synthetic exports are retained in
`.runtime/preview-acceptance/state-write-accepted-20261017/`; no profiles, pairing
credentials or raw IDE logs were copied.

All 1,527 historical general-spike and 241 short-loop manifest hashes matched at
20:02:16 UTC on 2026-10-17. Those experiments were not edited. The 26 bundled IDE
license-text sections and a narrow credential-signature scan were checked; this is
not a general security audit. Private vulnerability reporting was still disabled
at the latest read; enabling that repository setting awaits explicit authorization.
No publication or account change was performed.

## Next mechanism, still in progress

Review rejected a one-time QueryClient first-write contract as sufficient ownership
proof: the object escapes into a reachable cache, and a nested setData method or
later listener/React devtools hook can write the same value without changing object
identity. The existing executed sample selection also omits dependency code.

The next bounded acquisition experiment records all captured compiled main-world
script sources before navigation and compares exact bytes with trusted final dev
server receipts, including dependencies. Compilation is not execution; a content
match does not prove the response created that script; disk hashes are not proof
of actual compiler inputs. Even a successful inventory does not establish readonly
effects or field ancestry. It precedes any bounded ownership/effect certificate;
a universal resolver is not introduced. See the 2026-10-18 specs/plans for the exact
controls and decision gate.

## Later concrete semantic regression

Source review found late replacement of Object.getOwnPropertyDescriptor could be
called additionally by native host taps and parsed-field guards. Retained regression
`.runtime/late-descriptor-red.log` recorded 10 extra factory-tap calls and two extra
parsed-field calls. The fix uses captured bootstrap descriptor/apply intrinsics;
the host helper captures its descriptor function before the native module executes,
so factory branding remains available. This changes served probe code and therefore
requires fresh affected native/UI checks rather than reusing the preceding frozen
candidate as proof of the fix. A new browser semantic control compares the exact
late-replacement count off/on. Other uncaptured intrinsic replacements are not a
claim of general semantic transparency.
