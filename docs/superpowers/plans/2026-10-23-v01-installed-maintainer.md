# V01.3 installed VSIX maintainer job implementation plan

> Execute inline/main/localcommits under existing authorization. ONE whole V01
> review after this finite stage; no per-step reviewer or new project audit.

**Goal:** make actual installed-VSIX acceptance reproducible without pretending
Extension Development Host loading, a React fixture or browser CI proves it.
**Spec:** approved09-validation V01; remaining gap110.
**Architecture:** a declared Linux graphical maintainer command consumes an exact
retained development handoff/VSIX, uses existing installed ide-runner and dedicated
test host. It creates a synthetic workspace and unique installed-extension/user
directories on a nested X11 display. No main IDE/profile, browser, CA or app actions.

Files: scripts/verify-installed-maintainer.mjs; tests/helpers/installed-maintainer-lane.mjs;
tests/atom/installed-maintainer-lane.test.mjs; completion111/index/status/roadmap.
Existing harness/IDE/backend/product/package files are not edited or rebuilt.

The job verifies original VSIX bytes and current helper protocol version, checks
49331 is free before startIDE (never attaches to/kills a foreign owner), owns a
cooperative lock, and refuses missing Linux/VSCode/Xephyr environment as BLOCKED.
DISPLAY and session-bus settings apply only to this process's isolated IDE child;
clipboard/private pairing command stays on the nested display. No secret/receipt
or private profile enters public result/log output or CI artifact allowlist.

Use existing host's actual VS Code Extension API installed-file checks, public
pairing/copy-receipt command and active-editor audit. Controlled Node protocol
requests use a synthetic extension origin and the private ephemeral helper token;
they are **not** real Atom browser UI pairing/source association. Pair exact chosen
workspace, reject stale digest and traversal before source Open, open exact
synthetic src/example.js range and observe actual selected `readiness`. Quit only
the owned IDE and verify trusted host completion/offline guard. Full React/plugin,
first-read, HMR and other platform installed workflows remain separate V03 evidence.

- [ ] RED evidence classifier rejects EDH/not-installed, wrong VSIX/helper/trust,
  wrong/outside selected range and private fields in public result; GREEN minimal
  explicit allowlist. Existing installed-helper controls remain meaningful.
- [ ] Implement fixed CLI/preflight/owned locking/private environment and metadata
  freeze. Syntax/focused source checks. Expected missing artifact/runtime/foreign
  port is non-success before installation. Commit before actual GUI attempt.
- [ ] Run once with exact retained `.artifacts/development/2026-10-21T04-00-48-663Z/handoff.json`;
  preserve its original revision/hash. No pack:development or producer rebuild.
  Expected actual installed0.1.3/VSIX hash, trusted VSCode1.142, synthetic Open
  exact range, negative refusals, owned clean exit; no token disclosure.
- [ ] Record111/recompute exact archive/source/public evidence, localcommit. Then
  ONE whole V01 review over V01.1–.3; at most one material correction pass/no
  re-review. Remote CI remains unexecuted until separately authorized push.

Review focus: foreign IDE must never be adopted/closed; EDH cannot pass installed
identity; artifact/source mismatches cannot become new package proof; no receipt
secret in shareable output; protocol-driver Open cannot be called an Atom UI flow.
This is the supported Linux maintainer route, not macOS/Windows or full V03/release.
