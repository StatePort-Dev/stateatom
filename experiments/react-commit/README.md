# Experimental React ref-commit probe

This is an opt-in mechanism experiment, **not supported property provenance** and
not a release feature. The normal plugin leaves `reactCommit` off. The earlier
inspection loop and the historical six-case acceptance criteria are unchanged.
The exact producer and general semantics gates are **NOT MET**. A completed probe
returns exit code 2 for this known non-acceptance; unexpected errors return 1.

```sh
npm run verify:react-commit
```

Requires the same installed Node/Playwright prerequisites as the root README.
`COMMIT_TAG` optionally names a new run; an existing directory is rejected.
Results and isolated profiles go to `.runtime/react-commit-runs/<tag>/`.
Run native browser/IDE harnesses sequentially: the local fixture port is shared.

The unchanged original React P2 and P1 and two Row occurrences are exercised. New
synthetic controls cover StrictMode/Suspense, retained-first/discarded-second equal
JSX, duplicate markers, different roots, copied/replaced DOM, mutation, source/stop
and retention boundaries. Actual getter/call/ref logs are compared with the plugin
off for the recorded workload. Timing is a single cold dev load per mode, not a
benchmark. Code sizes and trace record/byte counts are retained.

The ref callback can associate a specific JSX construction context with an actual
DOM node and a root Profiler commit. **It cannot identify the final property's
producer:** `cloneElement` can retain the ref and marker while replacing a property
with an equal value from another expression. `commit.producer` and the selected
trace therefore remain `Unknown/Unsupported`, and `fullPath` remains false. The
browser correspondence guard also rejects any claim of exact commit correspondence without a producer.

Adding a ref is itself observable through a React element. These tests do not
establish transparency for applications which inspect refs, arbitrary third-party
wrappers, React versions other than the recorded one, or production builds.
The actual `ObservesRef` control deliberately reads the constructed element's ref:
the plugin-off and probe-on UI differ. This is a retained semantic counterexample,
not a limitation-control pass that grants support to that path.
Existing user refs and JSX spreads are excluded, not composed. JSX suspension
(`await`/`yield`) is left outside this adapter to preserve execution syntax.

The earlier Profiler-only positive run was superseded after independent review
found a retained-first JSX false binding. It is not accepted evidence. Read the
[design and review correction](../../docs/superpowers/specs/2026-10-17-react-commit-probe.md)
and [deep baseline](../../docs/roadmap/deep-baseline.md) before using this experiment.

Next decision: assess an observation at the **final React element/prop construction
or replacement boundary**, including uninstrumented clone/wrapper controls. A root
commit hook alone cannot close that edge. Do not advance a full-HTTP claim by adding
network correlation to an unproven producer.
