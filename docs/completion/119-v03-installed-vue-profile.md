# V03.6 — installed Vue profile, source/native phase in progress

2026-10-23, scope-review-1, base df68377. **In progress.** Source/profile admission
now passes; the independent source-connected application/browser/helper workflow
has **not run** in this increment. No full V03/C09 or new Vue runtime acceptance.
20/29 whole tasks unchanged.

[Executor design](../superpowers/specs/2026-10-23-v03-installed-vue-profile-design.md),
[plan](../superpowers/plans/2026-10-23-v03-installed-vue-profile.md),
[preregistered source question](../testing/independent-vue-source-case.json).

## Implemented boundary and actual checks

Installed wrapper adds explicit experimental `profile:'vue3'` for exact
Node18.18.2/Vite4.4.9/Vue3.3.4/@vitejs/plugin-vue4.3.2. It checks app and plugin
resolved Vite metadata, original Vue plugin presence and rejects mixed React,
Query, writes, fetch initiators and Action Trace flags. Unknown profiles fail.
Default installed profile retains Node24/Vite7.3.7 and existing React/classic
conflict/controlled-first-read refusals; npm's expanded peer range alone must not
admit the cross product. Disabled mode remains transparent; plugin remains serve-only.
Historical transformer/observer code and all326 qualified Atom66 inputs unchanged.
This is a new bounded engineering profile, not a previously user-approved version
matrix or new Live/production/handoff product parameters.

Actual source checks, logs in `.artifacts/v03/installed-vue-profile/2026-10-23/`:

- Original wrapper RED16:14FAIL/2PASS; extended matrix RED17:15FAIL/2PASS.
- Initial focused56:55PASS/1FAIL was a fixture assumption about Node walking to a
  parent's node_modules. Corrected fixture removes the actual metadata file;
  focused56/full2512 PASS. Original failed log retained.
- First actual installed candidate2 exposed package exports: compiler plugin4.3.2
  does not export `package.json`. Direct metadata lookup failed before app startup.
- Exact regression RED19:18PASS/1FAIL. Corrected lookup resolves the public entry
  **without loading/executing it**, bounded-walks to the matching package's metadata
  and keeps name/version checks. Throwing entry fixture proves it is not executed.
- Corrected focused57 and full **2513 PASS**, no skips/failures; full source command
  is existing `npm test`. No previous React/native matrix was repeated.
- `node --check` for preparation and the isolated-IDE helper harness; `git diff --check`.

Context7 Vite/npm/Node APIs were checked; official Vite4 documentation supplements
the current index. Source tests do not establish a running installed Vue application. The retained
`source-and-admission-checkpoint.json` seals the actual current source/package/log
identities, with native application execution and review explicitly pending.

## Immutable packages and private consumer admission

Original plugin1/helper and failed candidate2 remain unchanged. Candidate2 strict
Node18/npm9 installation succeeded, then its actual wrapper metadata probe failed:
`.artifacts/v03/installed-vue-consumer/2026-10-23T17-58-02-443Z/result.json` remains
**FAIL**. No application/browser ran for that failure. No tarball was patched in place.

Corrected candidate3 handoff:
`.artifacts/development/2026-10-23T18-07-11-697Z/handoff.json`.

| Artifact | Identity |
| --- | --- |
| Plugin3 |`3377285825741edb4d2bb2c78af5146f8596b5c277c2dd7fc2b5b0eac8131c51` |
| Companion helper0.1.3 |`a0e94647c9f3c143a16bb47d66cec8aa9f8fc0ba3eb5c74413c247c01a61b307` |
| Producer |134f936 plus pending profile/package/test edits; sourceDirty true |
| Plugin source manifest |19 exact inputs, unchanged transform and observer |

Existing `npm run pack:development` builds the plugin and packages the present
helper output; its original BUILT_NOT_VERIFIED marker stays unchanged. The helper
has the same version string but a **different extension.cjs payload** from the old
21Oct VSIX. An initial equality assertion failed; actual per-entry diff is retained.
Do not inherit the old helper's source/build or installed-workflow qualification.
The new actual payload requires its own installed-host checks. Package version or
plugin-only source manifest does not establish current-source provenance for it.

Command:
`node tests/helpers/prepare-installed-vue-consumer.mjs .artifacts/development/2026-10-23T18-07-11-697Z/handoff.json .artifacts/v03/dependency-prep/2026-10-23T15-48-05-165Z/results.json`

Actual new result:
`.artifacts/v03/installed-vue-consumer/2026-10-23T18-08-27-909Z/result.json`:
**PASS_INSTALLED_PROFILE_ADMISSION_NOT_APP_ACCEPTANCE**. Node18.18.2/npm9.8.1,
engine-strict install0/null with ignore-scripts/no-audit/no-fund, empty private npm
configs/cache and explicit public registry. No force/legacy-peer bypass, account or
global manager change. Original prepared1308 Vue dependencies were not reinstalled.
14 installed plugin payload files/source-manifest/notices checked; actual wrapper
under Node18 passes six probe groups (exact tuple plus unsupported configurations).
Those metadata fixtures execute no application code and do not stand in for the
real original Vue compiler, source observations or native browser flow.

## Current next step and retained boundaries

Complete the preregistered source-connected native driver before the first new
app/browser run. Use the installed plugin3 and exact new companion VSIX, isolated
owned helper endpoint/VS Code, native private-receipt connect and exact-origin dev
cache/reload scope. Development collection requires its active inspection mode;
this is separate from production change permission or input editing. No override/
replay grant is requested, and no production confirmation is supplied.

Question: why is the original c-input-text textarea enabled? Require disabled=false
on the exact selected marker, original SFC/expression/digest, an actual selected
scalar read and exact IDE range. Preserve parent/default/consumer/NaiveUI-counter
Unknown boundaries. Keep the original app runtime/lock/config/dependencies exact;
its sole prior generated components.d.ts delta is registered. Config overlay is
named setup assistance. An app, source or helper failure remains a failing gate,
never an excuse to use a nearby fixture or remove original macros/dependencies.

ONE whole-increment review remains due **after** the native phase; no premature
review acceptance or completed V03.6 claim. Full V03/A02/L02/V02, local AI,
production/model/performance/macOS/embedding and Chrome installation UI stay open.
No SDK, new design, push/publication or other repository changes.
