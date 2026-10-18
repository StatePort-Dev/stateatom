# Compiled-source inventory acquisition experiment

```sh
EXECUTION_TAG=<unused-tag> npm run verify:compiled-inventory
```

Use root README's native Chromium prerequisites. Stop other fixture servers and
run native harnesses sequentially. This command starts its own local Vite server
and does not start the extension or IDE. Results go exclusively into
`.runtime/execution-probes/<tag>/`. App/engine/harness/package bytes and the listed
dependency disk snapshot are checked before/after the run. The old spike is not used
or changed. No new package is required.

CDP Runtime/Debugger are enabled before fresh navigation. Every received scriptParsed
notification immediately reserves an identity and invalidates an earlier checkpoint;
source lookups are completed with a bounded CDP barrier/drain. Pending/missing source,
unknown context metadata, sourceURL/eval code, competing response revisions, lost or
cleared context history and budgets remain Unknown. Confirmed isolated-world records
are counted separately. This is a main-default-context inventory, not complete target,
worker, realm or whole-page coverage.

The trusted in-process server captures final response bodies after Vite's middleware
pipeline. Comparison is byte-exact after UTF-8 decoding; no import/source-map
normalization is used. Inline scripts require the exact document source span.

The unchanged P2/P1 baseline must match before the overall acquisition check can pass.
Real controls then compile anonymous and forged-sourceURL code, reload the same URL,
substitute dependency bytes while preserving the App source, and attach late. Model
checks additionally cover lost/unknown contexts, async pending sources, budgets,
missing sources and incorrect inline offsets. Expected Unknown control results are
successful checks of refusal, not support for those execution paths.

**Limits next to every result:** compilation is not execution; matching content does
not prove that a particular response created the script; disk hashes are snapshots,
not proof of actual loaded compiler inputs. This is a harness-only experiment, not
product UI evidence, an ownership/readonly certificate or HTTP current-field ancestry.
`fullPath:false` and `readonlyEffects:Unknown/Unsupported` remain invariant.

## Ownership counterexamples

```sh
OWNERSHIP_TAG=<unused-tag> npm run verify:ownership-controls
```

This separate native negative control installs a declared synthetic devtools hook
before unchanged original P2/P1. It performs one same-value write through the actual
native Fiber/hook during the loading commit. Original UI output and host/state
correspondence coexist with that writer; current HTTP field ancestry must remain
Unknown. It reads known own data descriptors and never invokes user getters or
functions for inspection. Results live in `.runtime/ownership-probes/<tag>/`.
The unit suite also demonstrates nested Query.setData and later cache-alias writers.
These are counterexamples to an insufficient ownership premise, not feature passes.

## Source-use prerequisite

```sh
SOURCE_TAG=<unused-tag> npm run verify:source-uses
```

This source-only command uses no browser/IDE. It inventories exact lexical references
and supported aliases of the original account/data candidate. Cache/function/props
escapes, candidate native state links and unsupported forms remain explicit
boundaries. Results are Code-linked syntax facts, not a readonly or ownership proof;
`complete:false` on the original case is expected. Results go to
`.runtime/source-use-probes/<tag>/`. The existing sourceSlice supplies only possible
code links; no new module resolver or product lineage claim is added.

The source command also checks the two original shared straight-line helper
functions. It returns **Conditional source fragment**, with own-data/primitive/
actual-callee premises explicitly unverified. Hidden calls, free globals, writes,
computed access, escaping whole regions and unsupported bodies are refused. A
supported syntax fragment is not a readonly certificate. The original Row and
whole App remain outside this narrow grammar.

## CDP instrumentation pause limitation

```sh
ENTRY_TAG=<unused-tag> npm run verify:script-entry
```

The historical command name investigates CDP beforeScriptExecution, not proven
invocations. Captured records are **instrumentation pauses**. In the retained
Function control, the body counter is zero while a pause already exists; one real
invocation changes the counter to one without a new pause. It is both a false
precall witness and a missed invocation. Complete invocation witness coverage is
**NOT ACCEPTED**, even though the original app output/control recording succeeds.
The overall result is PARTIAL; fullPath and invocationWitnessAccepted remain false.
Debugger pauses can affect timing/scheduling. This harness never supplies a product
ownership certificate and always attempts to resume original execution. Browser
and server are closed independently, including on failure.
