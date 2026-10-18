# Bounded native React state and write observations

Use the root native prerequisites. Run sequentially with unused result tags:

```sh
STATE_TAG=<unused> npm run verify:react-state
STATE_TAG=<unused> npm run verify:source-writes
HOST_UI_TAG=<unused> npm run verify:source-writes-ui
```

The first two write `.runtime/react-state-runs/`; UI writes
`.runtime/react-host-ui-runs/`. Source/build identities and unsupported controls
remain local. Source mode needs pinned React/DOM 18.3.1 dev, classic JSX and the
open plugin. `dev:react-state-writes` enables the optional combined path.

Native original useState queue/update/result identities join only after actual
source destructuring and exact committed ancestor/hook-state validation. Setters
and original actions/results are retained. Array/iterator replacement, abandoned
render, cloned/unseen updates and missing history do not inherit a parsed object.
Functional updater execution is not functional value-ancestry proof.

Completed noncomputed property operations invalidate known parsed fields even for
equal-value writes. Class initializer contexts, computed keys, logical assignments
and direct-eval scopes remain unsupported. Weak receiver tokens and cleared result
temps avoid holding temporary graphs across suspension. Without WeakRef, the
original operation still runs, without claiming its receiver observation.

Recognized direct captured native property calls conservatively invalidate known
target descriptors, including partial failure; they do not assert individual
writes. Aliases, another realm and unrecognized/opaque effects remain unsupported.
No helper re-reads descriptor getters, executes a skipped branch, adds Promise
reactions or reruns an application expression to recover a value.

This is **incomplete write coverage** and object/update identity evidence. Current
field-value ancestry remains Unknown and fullPath:false. Original P2/P1 and old
0/6 criteria are unchanged. Actual panel/IDE/review/download/offline checks are
separate from the native mechanism harness and from independent human acceptance.
