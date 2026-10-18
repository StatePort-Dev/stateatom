# Next bounded experiment: final React host props

## Why the direction changes

The ref/Profiler probe is not accepted: cloneElement preserves a ref while replacing
the property's producer, and injected refs are observable to application code. Do
not extend that experiment with network correlation or enable it for the product.

The next experiment observes an earlier JSX construction and the **final host props
object actually used by React DOM at a commit**. It tests only the installed/pinned
React 18.3.1 development implementation. It is an opt-in experiment, not a general
React API, a new resolver, framework expansion or replacement analysis engine.

## Proposed mechanism, subject to source inspection

- Instrument specific pinned native React element factory return sites. Associate
  their actual plain props object by WeakMap with the current per-JSX construction
  context and its actual target execution IDs. Return the original element unchanged.
  Do not add a ref, wrap an app component, inspect arbitrary objects or compare values
  to infer origin. Native clone results with new props remain unknown.
- Instrument the pinned React DOM host property/placement commit boundary. Record
  the actual DOM node and the actual final props object passed by the renderer. A
  hand-built element or cloned props object absent from the factory map is unknown.
  Nodes created for an abandoned render are not committed merely because initial
  properties were prepared on detached DOM.
- Use the statically identified root container to check real attachment at placement
  and update. Scan only a bounded inserted subtree before publishing records. Observe
  native DOM values after the renderer's actual operation. Track mutation epochs;
  later same-value writes invalidate older observations instead of legitimizing them
  at an unrelated callback. No Profiler callback is used as producer evidence.
- Keep source digests, exact page/root/node/construction/execution/commit identities,
  bounded maps, stop/source invalidation and `fullPath:false`. This experiment closes
  only the selected host-property edge, if it succeeds.

The installed React/React DOM development sources must first confirm the smallest
hook sites and their semantics. Guard vendor transformations with exact versions,
source digests and expected site counts. A mismatch disables the adapter explicitly;
never patch a nearby function by name alone. Transform bundler input copies, never
installed packages or the historical directory. Production remains excluded.

### Source-inspected refinement (before implementation)

For this first experiment use the existing classic `React.createElement` configuration
only. Lower eligible host JSX with Babel's installed JSX transform, then change only
the generated factory callee to a passthrough which captures the original method and
receiver **before** its arguments evaluate. Its invocation opens a private factory
frame around the original call. Native public factory function identities must be
registered by the pinned React module: custom/replaced factories are not trusted.
The native factory entry/return observes its new local props object. Nested factory
calls from config getters are excluded by depth, and later calls from validators by
an already-produced flag. Do not inspect arbitrary factory return objects.

React DOM `updateFiberProps` prepares node→props identity. It is not a commit: it also
runs for detached nodes and hydration. Post-operation taps in `commitUpdate` and
`appendChild`, `appendChildToContainer`, `insertBefore`, `insertInContainerBefore`
can publish only an attached actual node/subtree under a registered root. Hydration
is not claimed. Root mutation records are drained before publishing a new actual
host operation; an unrelated operation must not revive older nodes' records. No
injected ref or Profiler is needed in this mechanism.

### Adversarial review corrections (still before implementation)

Exclude every JSX spread from producer support: a later spread can override a prop
inside the same native props object. Test duplicate explicit props and positional
children precedence separately. Test custom/replaced factories and native getter or
validator exceptions, with captured intrinsic Reflect.apply and finally cleanup.

Pending props plus attachment is insufficient: a custom connectedCallback could
insert an abandoned node into a genuine placement. Replace the DOM placement scan
proposal with the pinned `commitRootImpl` point immediately after `root.current =
finishedWork` (two static sites, before layout effects). Traverse only that actual
committed Fiber tree, capped and read-only. Native createFiber/createFiberRoot return
sites register identities in WeakSets; unknown/Proxy/accessor fields stop traversal
without invoking them. This is explicitly a guarded private React DOM 18 development
adapter, not a public React API. Skip portals, hydration/dehydrated and hidden pending
Suspense/Offscreen subtrees. A custom-element/customized-built-in witness makes the
root unsupported for the first probe.

Post `setInitialProperties` and `commitUpdate` taps retain actual node/final-props
identity and a bounded per-node native MutationObserver. Detached preparation is not
commit. A selected node is published only when the committed Fiber owns that exact
node/props pair and its native property observation has not been invalidated. Do not
revive an old dirty node at an unrelated commit. Later same-value DOM mutations,
imperative copies and ref/layout-effect writes remain unknown/stale. These observers
are capped and disconnected on eviction/stop; no unbounded DOM or props retention.

Record hashes of the actual optimized artifacts served to the browser; force a
fresh optimizer for the probe so cached uninstrumented code cannot satisfy a source
manifest alone. General DOM-writer provenance is outside this first experiment;
the claim is an actual React committed host prop, with explicit post-commit mutation
limits, never a universal last-writer analysis.

## Fixed controls before implementation

Primary unchanged original React P2, control original P1 and two Row instances.
Retained-first/discarded-second equal JSX; StrictMode/Suspense; equal-value cloning;
hand-built copied props; existing refs and code inspecting `ReactElement.ref`; spread
and suspended JSX; real DOM copy/replacement/imperative same-value write; roots,
retention, stop and revision invalidation. Compare app-visible getter/call/ref/branch
behavior off/on and disclose timing, source and memory/record measurements.

Review adds two required controls: namespaced SVG must preserve the existing
compiler's behavior, and mutable original props must not gain a producer after a
same-value write. Check the actual captured freeze function used by ReactElement,
not only final isFrozen: a replacement can mutate, freeze and restore itself.
Two guarded callee taps preserve receiver/lookup/arguments/return/errors. The
observer requires that exact successful freeze witness for the known props and
actual immutability. Intrinsics intact at observer bootstrap remain an explicit
precondition. Public page taps are not authenticated native attestations or host
authority; malicious inspected pages can fabricate page-reported observations.

A native pass requires exact final-props identity to distinguish original and
competing producers, while preserving the recorded application behavior. A missing
or unsupported hook is Unknown. Only after that pass may it be integrated into the
existing UI and used for the next exact consumed-exchange binding experiment. The
historical full-path criteria and full matrix remain unchanged.
