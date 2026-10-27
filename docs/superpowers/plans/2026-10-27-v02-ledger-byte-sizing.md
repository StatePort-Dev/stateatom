# Exact observation ledger byte sizing implementation plan

Execute inline under existing autonomous authorization. No agents, worktree switch,
publication, host mutation or native campaign. Scope/design: completion/235.

- [x] Preserve exact before source/hash; characterize20requests/60transitions with
  a serialization counter. Observe RED for repeated unchanged record serialization.
- [x] Add the smallest private frozen-record byte cache in the existing ledger.
  Compare metadata[]+exact record bytes+commas to complete UTF8 JSON size; preserve
  all limits and frozen states. Observe focused GREEN.
- [x] Exercise exact byte-limit boundary using the original source as a retained
  one-off differential oracle; keep committed tests self-contained with independent
  full-JSON candidate size calculations and immutable-history controls.
- [x] Run affected existing ledger/native DTO/runtime/export checks, then full
  source suite once. Resolve actual failures, no unrelated audit/repeated native work.
- [x] Self-review scoped diff and record actual results/limits. Local commit only.

A passing source optimization justifies a later separately bounded new immutable
package and original acceptance gate; it cannot close V02 or certify performance.

Completed:7new/169affected/5868full PASS,30000differential; one Important fixed with
RED→GREEN, no rereview/native campaign. Commit records the accepted source only.
