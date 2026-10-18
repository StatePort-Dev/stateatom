# Two-site native Query census plan

1. Add failing model checks for exact native call-site/body association, native body
   through a wrapper, build substitution, options-getter reentry before args-ready,
   incomplete/throw/noncallable paths, nesting, weak retention and budget/stop.
2. Implement a separate small bounded census reused by the existing Query ledger;
   add opt-in/default-off configuration and hash/site-guarded private input taps.
   Preserve original callee chains and complete argument evaluation once.
3. Add actual pinned-bundle and browser off/on controls, including the original
   nested equal-write counterexample and later alias write. No readonly inference.
4. Review before any support claim. Verify affected existing UI/mechanism paths;
   retain clean accepted candidate separately. Record the exact remaining effect,
   React/props lifetime and code-history gaps, not a full-path pass.
