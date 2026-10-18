# In-place write-access guard plan

1. Preserve RED controls for the current unguarded lvalue bugs. Add one exact
   write-target recognizer to both identifier/member read wrappers. Keep receiver,
   key, default-RHS subexpressions as ordinary reads. Verify default-off semantics.
2. Add a separately opted-in receiver pass-through AST helper and runtime method,
   using only metadata + receiver (no key/RHS/scope). Potential access invalidates
   private parsed descriptors without inspecting arbitrary/Proxy receivers.
3. Compare original/guarded semantics for computed/logical/class/params/await,
   destructuring and loop assignment. Super/optional-chain targets stay explicit
   exclusions; private access is conservative, not a public-field write claim.
4. Verify native source-only acquisition and existing UI separately. Review before
   adding private vendor-input guards; that integration is a following result.
   Missing native/history/code coverage never supplies readonly/fullPath proof.
