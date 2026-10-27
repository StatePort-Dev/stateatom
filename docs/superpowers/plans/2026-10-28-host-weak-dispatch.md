# Host weak dispatch implementation plan

> Inline superpowers:executing-plans; ONE final source-slice review.

Goal: prevent post-bootstrap app weak-method dispatch at two host caller sites.
Architecture: reuse existing captured nativeWeakDeref/nativeApply, no extra stores.
Spec ../specs/2026-10-28-host-weak-dispatch-design.md. JavaScript/node:test.

Constraints: main/local until09:00 Mauritius October28; one existing source file;
no native/browser/GC/model/CA/SDK/host/publish or archive9/Atom86reissue in this item.
Original50cause/budgets/old raw/reader criteria and all native limits preserved.

Review focus: original positive host/state gates reached, both late getter/method
sites refuse app dispatch, original receiver used, lost refs/identity/Stop remain
Unknown, no extra retention or falsely native interpretation of mock DOM/events.

- [ ] Freeze source/9payload/raw/protected/current327 before edits.
- [ ] Add tests/engine/react-host-weak-dispatch.test.mjs with full authored source
  branch and restoration in finally; watch commit/snapshot late method/getter RED.
- [ ] Modify only src/engine/observer.mjs two private deref calls, using captured
  apply/method; no gate or schema change.
- [ ] New/affected/full source tests, syntax/diff/hash preservation; ONE review,
  at most one tested I/C correction pass/no rereview or native campaign.
- [ ] Local commit/verified own workspace archive/close55; choose one next item.
