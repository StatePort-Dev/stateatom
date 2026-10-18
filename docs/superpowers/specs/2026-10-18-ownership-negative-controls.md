# Owned-JSON proposal: concrete negative controls

The review rejects a one-time QueryClient first-write summary as a complete
field-ownership proof. Validate its exact counterexamples before deciding whether
to build any new effect mechanism. No full-path support is introduced.

1. With actual pinned QueryClient, preserve the public setQueryData function,
   empty initial entry, default structural sharing, no observers/listeners and
   exact return/storage object identity. Wrap the nested Query.setData method to
   perform an equal-value write. This demonstrates the missing transitive method
   identity/effect premise, not an application regression or instrumentation proof.
2. In unchanged original P2/P1, install a synthetic development-tools root hook
   before React loads. Walk only known own data descriptors of native Fiber/hook
   objects, perform one explicit same-value write on the synthetic account quota
   during the loading commit, and retain a counter. Do not invoke user functions
   or getters, proxy/freeze objects or replace setters. Original app bytes stay
   unchanged. Check actual host/state correspondence can coexist with that writer,
   while HTTP current-field ancestry correctly remains Unknown.

The extra hook is declared test code, not a supported page integration or an
invisible writer assumption. This is native/harness evidence, not product UI
acceptance. Preserve original outputs and exact input/dependency hashes. A new
whole-program resolver is not authorized merely by these negative results.
