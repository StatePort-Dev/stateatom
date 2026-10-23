# V03.6 — explicit installed Vue profile and independent connected route

Base df68377, main; [executor design](../specs/2026-10-23-v03-installed-vue-profile-design.md).
One finite package/integration increment. Scope-review-1, no redesign, SDK, push,
publication, account/certificate/user-profile or other repository changes.

Execution update: candidate2 failed its actual installed metadata probe on package
exports before any app/browser. Failed result/archive stay immutable. Corrected3
adds bounded nonexecuting metadata lookup with new RED→GREEN/strict consumer proof;
all subsequent native steps use3.

## 1. Profile contract RED → GREEN

Write focused tests before changing src/engine/vite-install.mjs. Watch the old
wrapper fail unknown-profile/mixed-options/missing-Vue/version refusals. Exercise
the actual wrapper under installed Node18.18.2 against private package metadata
fixtures, separately from root Node24 source tests. Positive exact tuple is allowed;
wrong Vite/Vue/missing metadata is refused, disabled mode transparent, default
React conflict and first-read refusal retained. No fixture grants runtime support.

Implement the narrow installed wrapper guard, keeping historical transformer
single-source and unchanged. Broaden package engines to exact18.18.2 plus prior24,
peer Vite to exact4.4.9 or prior7.3.7. New unused candidate identity; preserve1/failed2.
Because npm peers cannot encode profile combinations, retain Node24/Vite7 in the
default profile's runtime gate as well; do not accidentally admit the cross product.
Vue profile also checks the original @vitejs/plugin-vue4.3.2 and both app/plugin
resolved Vite metadata. These are version-admission checks, not runtime proof.
Run focused profile/engine/Vue source checks then full npm test once for behavior
change. Expected green counts must be read, not assumed. No Atom rebuild if all326
qualified Atom input hashes remain exact; if they drift, record and address it.

## 2. New actual installed artifact

Existing pack:development creates plugin2 and companion helper receipt. Do not
claim a reused helper byte identity unless hashes actually match. Qualify plugin
archive/source-manifest/metadata/notices, install under Node18 in a fresh private
npm consumer with private empty configs/cache, exact Vite4.4.9, engine-strict,
ignore-scripts, no-audit/fund. No global package-manager changes and no edits to
original it-tools package/lock/dependencies. Retain commands, logs and installed
payload hashes. Original dependency preparation is reused, not reinstalled.

Before first new app/browser execution, commit a separate registered Vue connected
case and driver. Config overlay imports original Vite config and actual installed
plugin3, adds profile:'vue3', explicit original root and private fresh cache. Use
original Node18 Vite4 on owned loopback strict port. Keep all original runtime files,
lock/config exact and acknowledge previously generated components.d.ts. Compare
original empty/entered/baseline DOM statistics to retained V03.5 (not a repeat off
run); no causal/performance claim from equality.

## 3. Actual connected native question

Fresh standalone exact66/UI2 and installed VSIX in isolated actual VS Code host,
open/trust only the private original application. Strict owned helper endpoint,
never adopt/stop another process. Copy private receipt, connect through actual
inspector controls; secret never enters public output or screenshots. Separately
admit exact-origin development inspection; native picker selects original textarea
disabled. Require exact selected marker, original source digest/SFC range, selected
target observation, runtime/source freshness and exact IDE selection audit.
Missing/unsupported selected operands/prop/default/consumer/NaiveUI ownership remain
explicit. No ancestor substitution or callback evaluation.

Ordinary text entry changes original character count0→8, baseline clear→0. Inspect
again obtains a new selected occurrence; disabled remains false. Native Save/review/
download retains original evidence kinds/default omissions. Stop origin app/helper/
browser before fresh matching reader; historical/untrusted/no resumed authority.
Retain actual screenshots/logs/failures and app/build/generated-file hashes. This is
agent operation/CLI preload/config assistance, not Chrome install UI, broad Vue/C09,
real-library property-consumer, Live/Draft, model/performance/macOS/full V03 acceptance.

If a product defect appears, preserve reproduction and apply RED→GREEN to that exact
mechanism; do not silently edit app source or weaken the registered case. Changes
outside this bounded wrapper/integration require a recorded direction adjustment.

## Completion and review

Record119/current dependencies and exact actual results; retain original receipts.
ONE fresh whole-increment reviewer at the final committed range, at most one tested
correction pass/no re-review. Local commit only. Next item follows the actual result:
first demonstrated source/runtime defect if any; otherwise remaining independent
Vue real-library property-consumer gap. Never equate a package/profile doc with a
new capability. Full V03/A02/L02/V02 and20/29 remain open.

## Review focus

Explicit profile checks cannot bypass existing React/first-read safety; Node18 and
actual app-root package resolution, disabled/build behavior, option/version negatives,
old artifact immutability, actual installed rather than checkout plugin/helper,
original app/lock/generator identity, exact selected occurrence and source/IDE range,
Unknown preservation, trusted native input and reader authority, private secrets,
honest unpassed gates. No full-project or previous matrix re-audit.
