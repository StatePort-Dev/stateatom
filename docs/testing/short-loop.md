# Short developer workflow

This is the local, automated acceptance check for the bounded developer inspector.
The harness is adapted from the historical MIT short-loop experiment. Historical
reports, checkpoints and artifacts remain outside this checkout and are not rewritten.

The primary supported path is React dev + the open development plugin + the open
VS Code source bridge. Vue is a limited subset. Basic browser-only inspection retains
DOM observations with source and operands explicitly unavailable. A source connection
without the plugin supplies code links, not observed operands.

## Run

Follow the root README's pinned Node/npm, Chromium and graphical VS Code requirements.
Reserve ports 4173, 4175, 47731 and 49331. Stop separately started fixture servers.

```sh
npm run prepare:short-loop
npm test
npm run build:extensions
npm run verify:short-loop
```

Preparation is one-time. It exports the React/Vue source, public assets and lockfiles
from TodoMVC revision `ff43b02e59dfa604386bb382034b2cd07c2bcd8a`, retains the license,
and installs only their locked production dependencies with lifecycle scripts disabled.
The applications stay in ignored `.runtime/todomvc/`; they are not shipped with Atom.
`TODOMVC_SOURCE=/path/to/local/git/mirror` can supply the pinned Git objects instead
of cloning the public upstream. The source mirror is only read. Preparation refuses
to overwrite any existing destination. Incomplete preparation requires inspection
before removing that generated destination and retrying.

Each verification run exclusively creates `.runtime/short-loop-runs/<timestamp>/`.
`SHORT_TAG=an-unused-name npm run verify:short-loop` chooses a readable new name;
an existing name or traversal characters are rejected. Profiles are separate under
`.runtime/short-*`. Outputs include actual state JSON, screenshots, health records,
VS Code API audit and source/build/fixture SHA256 maps. Raw private profiles contain
the ephemeral pairing credential: do not share profiles, IDE logs or unsanitized output.
No diagnostic export or State Card is created by this harness.

`SHORT_ONLY_TODO=1` limits the run to the independent cases. The full default includes
the additional Vue `<strong>` variant; `SHORT_COUNT_VARIANT=0` explicitly omits it.
Subset output does not establish the complete matrix.

## Criteria and controls

Each scored inspection retains the original criteria:

| Criterion | Required evidence |
| --- | --- |
| T | The selected DOM property and expected instance/value agree |
| E | Exactly one expected source expression/range appears in the actual panel |
| V | A useful scalar operand from the supported selected computation appears in the main block |
| I | Clicking that expression's Open in IDE produces a new matching VS Code API audit entry |

PASS requires all four. Known PARTIAL cases are intentional negative controls, not
passes: Vue Row operands, Vue TodoMVC labels and aggregate count, A+IDE without
instrumentation, and browser-only A. The additional Vue `<strong>` count is scored
separately and never replaces the aggregate-count failure. The harness fails if a
case's expected T/E/V/I combination changes; a new genuine capability requires a
separately reviewed expectation change.

The default matrix has 30 scored inspections. Additional lifecycle actions check
immediate clearing when the picker starts, property/tab switching, a 390px viewport,
stale-data clearing and snapshot labelling. Navigation automatically marks the old
observation Stale and removes its source/value actions; Inspect again must record
a new observation in the new run/page context and recover the selected expression.
Both form hypotheses use ordinary input `'' → 'Alex' → ''` and explicit **Inspect again**
for the later observations, expecting `disabled: true → false → true`. Existing
snapshots stay visibly labelled “Not live” between input and reinspection. P4 checks
that the skipped `canConfirm` read is absent; independent binding observations are
never substituted for that read. React/Vue Row and independent TodoMVC cases retain
separate instances.

The harness verifies prepared fixture hashes, records startup source and actual
extension build hashes, and checks that inputs stay unchanged through teardown.
Page exceptions, overlays, changed expectations and cleanup errors fail the run.
Console/resource errors are recorded separately; inspect them before claiming a
clean console. Collection is bounded by the existing instrumentation and worker.

Main interactions use the real MV3 panel and app; pairing, server/profile setup,
state reads and audit collection also use harness operations. For every Open in IDE
check, the isolated test host first closes its editors;
the click must produce a new matching API event. This prevents reusing an earlier
selection when two component instances share the same source range. Reset requests
are published atomically, and this precondition does not run in the product.
After successful host assertions, the test host issues Quit for its isolated IDE;
the runner must return exit code 0. A completed Extension Host with a still-running
IDE is a cleanup failure, not a successful harness result.
The result is automated UI evidence, not a human usability study or installed
Store/VSIX acceptance. Browser
plugin is not available in the current development session, so the retained native
Playwright workflow is used. Full HTTP, cache and framework-commit provenance remain
outside this acceptance criterion. Save/export is checked separately when its UI changes.
