# Embeddable Atom implementation plan

> Execution: native, in the current checkout, as explicitly requested. No push or publication.

Goal: package the existing analyzer-facing browser runtime and inspector once, retain standalone, prove a distinct MV3 consumer from the same tarball.
Spec: `03-stateatom-embeddable.md`.

Architecture: `packages/atom` exposes inert browser runtime, UI and transport entrypoints. The existing worker body becomes a factory with explicit platform resources; the existing panel becomes a root-scoped mount. Hosts own registration, trusted-page routing and a shared exclusive debugger broker. Existing analyzer/evidence modules retain placement and semantics.

Constraints: preserve dirty documentation and historical artifacts; one pinned extension-ui foundation, host-owned CSS imports; current localhost allowlist only; no Capture, private StatePort, new tracing, branch change or publication.

Review focus: cancellation during async analysis; metadata versus live leases on restart; exact extension page authentication versus content messages; competing consumer ownership and cleanup; duplicate mounts and host sibling CSS.

- [x] Runtime and contracts: first add failing contract tests for inert import, BUSY, capabilities, validation, cancellation and shutdown; extract existing runtime and inject browser engine resources; scoped namespaced storage, host event adapter and debugger broker.
- [x] UI and hosts: root-scoped mount/dispose, client cancellation and resource cleanup; same panel template and scoped styles; standalone thin shell, distinct embedding page/root/dispatcher/neighbor controls; UI contract changelog.
- [x] Packaging and verification: deterministic browser bundles, tarball + pinned UI peer; install into a clean consumer without checkout imports; build both hosts from that install. Run contracts, full suite/build, browser/IDE, marker/short-loop, embedding lifecycle/CSS/evidence comparison. Preserve honest failure evidence.
- [x] Handoff: exact types/ownership/commands, source and package digests, notices, `.artifacts/atom/atom-handoff.json`, one bounded official-host integration task; independent review of the completed diff.

## Execution ledger

- User supplied the complete design and explicitly requested autonomous execution; it is the approved specification. Work stays in the current checkout/branch and preserves pre-existing dirty docs. No commits, push or publication are inferred.
- Runtime/transport and UI extraction implemented with contract-first checks. Initial missing-module tests failed, then passed. Existing worker/view harnesses adapted to factories without weakening original stale/evidence assertions.
- Independent read-only reviewer requested changes: Basic Detach retained reservation; cancellation invalidated unrelated inspection; attach/release race transferred ownership too early; stale experiment replies rendered under another tab. Each was reproduced RED and fixed; focused suite 40/40 GREEN.
- Final: Ruling: experiment type omission of requestId was regraded Important, because the declared public payload could not perform the supported response experiment. Type and wire validation fixed. Cost if wrong: stricter callers must include the existing required request identity.
- Final: Ruling: native getTargets().attached is not an ownership proof. A real Chromium probe reported true before Atom attached, because Playwright was present. A proposed native-flag gate was removed; host consumers share an exclusive broker, native attach conflicts remain BUSY and unknown native sessions are never detached. Cost if wrong: an out-of-contract consumer bypassing the broker cannot be safely arbitrated by this in-memory API.
- Verification scheduling: a parallel full unit/browser attempt collided on the shared fixture port 4173; it is retained as a failed run and rerun serially. Two-host harness fixes retained failures: await tab UI load; recreate the extension page after extension reload closes it.
- Clean consumer declares pinned esbuild 0.25.12; local Atom/UI tarballs are installed with public build-tool cache preferred. First offline build-tool install failed ENOTCACHED; the actual declared public dependency installation/build succeeded afterward.
- Additional lifecycle RED→GREEN checks: own Fetch events remain serviced until shutdown cleanup settles; tab removal is queued behind asynchronous storage initialization and cannot resurrect removed metadata. IDE fetches receive request AbortSignal. Picker target takes native sender documentId, not page-supplied identity.
- Shared-host native test caught Atom claiming unrelated hostControl messages. Dispatcher now ignores non-Atom host messages; the same contract test covers this routing boundary. Real native reserve → Atom BUSY → Atom shutdown → foreign command still succeeds → release passed.
- Final: Ruling: preserve the open IDE helper's single-extension origin binding. Native hosts use separate real IDE sessions instead of widening the helper's trusted origin policy. Cost if wrong: switching official extension identities requires an explicitly fresh helper connection/session.
- Optional extension-reload probe was removed after Chrome closed its page/lazily restarted the worker; the task's actual worker-only stop/restart is verified directly with CDP ServiceWorker.stopWorker and the next authenticated request. This does not claim every suspension/reload schedule is verified.

- Final verification: 509 unit tests; full build; 30 dual-host native checks; 26 IDE-free checks; short-loop 106 checks with unchanged 20 PASS / 10 PARTIAL; original first-read UI 16; extension-ui 22. All required successful reports, exact commands and source/artifact digests are in the delivery handoff.
- First-read native commandLine guard was not changed: exact packaged standalone bytes were mirrored at its required dist/browser path after preserving the generated build; a fresh rerun passed. The failed launch-path attempt remains retained.
- Independent reviewer findings resolved; no deferred minors. Current checkout left in place with unrelated documentation preserved, no branch switch, commit, push or publication.

- Follow-up: user explicitly requested a local commit. Only embeddable changes are included; earlier documentation edits remain outside it. A pre-commit EOF blank-line cleanup rebuilt with `npm run build:atom`; all 13 emitted code/static/type files remain byte-identical to the verified build. The handoff preserves original build source hashes and records the normalization separately. No push or publication.
