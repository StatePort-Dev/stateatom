# Source-use inventory plan

1. Add failing tests for exact lexical alias traversal, shadowed bindings, writes,
   candidate React setter/value pairing, unsupported escape and fail-closed budgets.
2. Implement a small source-use verifier beside the existing source slice. Use
   binding reference paths, retain source digests/spans, and reuse sourceSlice only
   for possible dependency code links. No new module resolution implementation.
3. Add one source-only command producing a new result directory for the unchanged
   original App. Confirm all account/data references and first opaque boundaries;
   leave all runtime/ownership/fullPath claims Unknown.
4. Review before any actual ownership certificate or product integration.
