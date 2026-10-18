# Native Query handoff experiment plan

1. Review the exact pinned native source and select hash/site guards. Add failing
   tests for default-off configuration, source mismatch, original values/errors,
   native branding/frame identity and competing/reentrant reads.
2. Implement a small WeakMap/WeakRef handoff ledger and private vendor-input taps.
   No key/payload export, no getter re-evaluation, no functional updater replay.
3. Add an explicitly opt-in server mode and standalone native harness. Verify
   unchanged P2/P1 plus the preselected controls and original off/on semantics.
4. Keep current value ancestry Unknown. Review acquisition before considering UI
   delivery or using these facts in an ownership certificate.
