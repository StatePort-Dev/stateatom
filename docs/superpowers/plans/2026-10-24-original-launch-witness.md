# Original launch witness implementation plan

> **For agentic workers:** REQUIRED superpowers:executing-plans inline. ONE final fresh read-only whole-item review; no implementers/per-task reviewers.

**Goal:** Test a public owner-process invocation witness corroborated by scoped proc and browser metadata.
**Architecture:** New inert witness/metadata helper consumes immutable A02.7 collector/deadlines; separate finite BrowserServer driver. Old source/cases stay unchanged.
**Tech Stack:** Existing Node24/Playwright1.63/Chrome153, no upgrade.
**Spec:** ../specs/2026-10-24-original-launch-witness-design.md

## Global Constraints

- Main/local/latestOct25evening/scope-review-1/20of29/fullA02 open.
- Research only/no app, old case rerun, product/UI/SDK/otherrepo/extension/helper/IDE/trust/publication change.
- Max1 new metadata case after source/full/clean frozen gate; no retry or title-to-argv parsing.
- Private endpoint/full argv/credential data never serialized. Only returned owner ChildProcess, CDP PID and driver children inspected.
- Native profile rule /tmp/playwright_chromiumdev_profile- plus safe suffix; no user profile or arbitrary PID kill. Owner-server kill API only on failed own close, original error retained.
- Harness5000ms operation/20000ms launch deadlines are not product Live/latency choices.

## Review Focus

- A rewritten process title must not replace or be relabelled as original invocation evidence.
- Mutable/getter-backed ChildProcess metadata or credential options cannot create accepted/leaking snapshots.
- Generated profile must stay in managed temporary scope and match independent metadata, not its own derived expectation alone.
- Late/unresolved metadata/close operations must preserve partial facts and independently clean actual owner handles.
- Current/historical/native/source evidence and launch-route changes must remain explicit; no fullA02/app pass inference.

### Task 1: Inert original invocation and independent metadata qualification

**Files:** new experiments/browser-launch-witness.mjs, tests/engine/browser-launch-witness.test.mjs; completion149/current metadata.
**Interfaces:** captureBrowserLaunchWitness(child,policy) -> inert {pid,executable,profile,argumentCount,vectorDigest,commandLineDigest,flags,errors}; captureChromeVersionMetadata(page,{timeoutMs=5000}) -> {url,executableDigest,profileDigest,commandLineDigest,commandLineLength,errors}; Task2 adds document:{before:{frameId,loaderId,targetId},after:same-shape,mainOnly}, managedProfile:{realPath,isDirectory,isSymbolicLink}; admitBrowserLaunchWitness(witness,proc,metadata,policy) -> scoped DTO status/failures/nativeRuntimeProvenfalse/appExecutedfalse. policy exact executable/hash/profileRoot/profilePrefix/metadataURL. No launch on import.

- [x] TDD missing-module RED; original/offline descriptor snapshot/getter avoidance/copy privacy, managed-profile/flag boundaries, pure PID/start/exe/hash/metadata/document guards. Implement helper without modifying old modules. Run `node --test --test-isolation=none tests/engine/browser-launch-witness.test.mjs` -> PASS.
- [x] Real owned Node child process.title rewrite vs preserved spawnargs; synthetic UI hashes/source-only label. Unresolved/late metadata controls and exact EOF/private-data boundaries. Focused/full npm test -> PASS; retained source/raw integrity/local source commit/task-done. No Chrome credit.

### Task 2: One frozen public BrowserServer metadata diagnostic

**Files:** new experiments/browser-launch-witness-run.mjs, tests/engine/browser-launch-witness-driver.test.mjs; docs/testing/browser-launch-witness-case.json; completion149/current metadata; unique ignored outputs.
**Interfaces:** consumes Task1 witness/metadata/admission and immutable A02.7 collectOwnedBrowserProcess/ownedProcessDeadline; --prepare CASE OUT / --preflight CASE / CASE. Emit registration/raw witness/proc/metadata/result/cleanup before qualification; never persist websocket.

- [x] TDD driver CLI/case/provenance/save-before-refusal/independent owner cleanup/fallback/error retention/input drift RED→GREEN. Implement 127.0.0.1/port0/managed generated profile; no app or old source change. Affected/full source gates -> PASS; clean local source commit.
- [ ] Resource-free prepare/inspect/freeze/commit strict max1 case. ONE actual launch/poll same handle; save literal partial/refusal and original source. Independent saved facts/input/cleanup verifier and negative controls, no blind repeat.
- [ ] Relevant final aggregate/local commit/task-done; actual launch/metadata route only, no app/product/fullA02 credit.

## Final closeout

- [ ] ONE fresh final read-only whole-item review; regrade effects, one tested I/C correction pass maximum/no rereview. Explicit all rulings/deferred Minors, archive own workspace, clean final checkpoint and one next dependency.
