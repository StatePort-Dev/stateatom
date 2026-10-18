# Experimental final host-props probe

Opt-in **React + React DOM 18.3.1 development, classic React.createElement JSX**
only. The host-props probe remains off by default. The served dev plugin uses
source promise consumption by default, without extra Promise reactions. This is instrumented-page evidence,
not authentication of a hostile page or native runtime attestation. Standard
intrinsics must be intact when the observer boots. Full HTTP provenance remains
unestablished, and `fullPath` remains false.

```sh
npm test
npm run build:extensions
npm run verify:source-consumption
npm run verify:react-host
npm run verify:react-host-ui
```

For manual inspection of this same synthetic example, use `npm run dev:react-host`
instead of `npm run dev`, then follow the root README's extension/IDE setup.
Choose Disabled → Confirm transformed (P2), or Text → the `13` paragraph (P1).

Run native commands sequentially. `HOST_TAG` and `HOST_UI_TAG` optionally choose
new directories under `.runtime/react-host-runs/` and
`.runtime/react-host-ui-runs/`; existing directories are rejected. Use the root
README's Node, Playwright Chromium, native host libraries and VS Code prerequisites.
The UI check uses the real unpacked extension and VS Code development host, not a
Store extension or installed VSIX. The host and browser sandbox stay enabled.

The mechanism check retains the unchanged original P2/P1 and Row controls. It
connects an exact JSX target execution to actual final immutable props and the
same DOM node in a committed pinned React DOM Fiber tree. It does not add refs,
rerun expressions, invoke getters to discover values, or force skipped branches.
Exact vendor hashes/site counts guard input-copy transformations; installed React
sources are untouched, and hashes of actual served optimized files are recorded.

Clone/manual/mutable/replacement-freeze props, spread overrides, copied DOM,
post-commit mutation, portals, hydration, custom-element witnesses, source/stop
and node/Fiber/trace budgets must remain unsupported. Suspense/discarded work,
separate roots/instances and explicit duplicate prop/children precedence have
separate controls. No general last-DOM-writer or framework/store/async lineage is
claimed. Source/compiler/version mismatches disable this private adapter.

The UI check separately exercises both selected properties, exact IDE ranges,
explicit reinspection after a real form update, clone/mutation limitations,
reviewed export and a new standalone offline reader. Export retains only bounded
host identity/scope in optional v1 fields; it carries neither DOM nodes nor raw
props. Imported records remain untrusted historical claims and authorize no action.

Off/on application getter/call/ref/introspection and suspended/resumed event logs
are compared. Single-load timings, CDP heap usage, transformed byte counts and
record bounds are diagnostics, not a performance benchmark or a heap-leak proof.
The failed earlier ref/Profiler probe and failing mutable-props run remain retained.

`CONSUMPTION_TAG` selects a new `.runtime/source-consumption-runs/` directory.
This separate semantic gate compares off/on await/callback/receiver/error/getter
behavior, original unhandled rejection promise identities, hostile Promise
descriptors/species, prototype serialization hooks and P2/P1 field fragments.
The explicit legacy-false branch is retained only as a failing-behavior control.
Changing observation mode on an active page requires reload. Uninstrumented or
escaped first JSON consumers remain unknown. Observed field values and parsed
object/field identity are retained with **current value origin Unknown/Unsupported**:
unobserved equal-value/raw writes are not excluded.

`npm run verify:preview` runs the agent-operated acceptance variant of the actual
panel/IDE check, adding form value freshness, property/picker clearing, navigation
invalidation and export cancellation before a fresh offline read. It does not
verify manual unpacked/VSIX installation or independent human usability.
