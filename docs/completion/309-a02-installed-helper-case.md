# A02 — installed helper/source action case

Frozen before execution, aftere341258, 28 October2026. Run
`node tests/integration/selected-list-route.mjs --installed-vsix=<exact local VSIX>`.

Reuse case307's private verifier, original create/changed/same-value positives,
untouched-row/unknown-code negatives, endpoint refusals and channel-close refusal.
Replace only the synthetic child bridge with the actual VSIX installed into an
isolated VS Code extension/profile directory. Trust the explicitly selected local
workspace; use a chosen available loopback port and matching private receipt.
The verifier capability stays in the launcher, not in the IDE or browser payload.

Before mutation negatives, the current mounted text-origin source link must be
available; keyboard activation must open the exact original writer file/line/column
in the installed IDE. Actual VS Code activeTextEditor API records that selection.
Loaded installed helper metadata/bundle bytes must match the supplied VSIX, outside
the inert acceptance-driver development extension. Record archive hash, source-open
audit, installed-helper-host/host-complete, owned resource cleanup. Private receipts
stay private and are not copied into shared evidence or screenshots.

Local `npm run pack:development -- --helper-only` prepares only this VSIX, avoiding
an unrelated old plugin-version archive. Filename includes the helper bundle digest;
helper protocol/version is unchanged. The unique handoff records archive/source
identity and dirty state. No Marketplace/registry publication or personal IDE use.

This does not establish normal packaged selected-list plugin launch, official host,
held-out effect binding or complete282. Source helper remains an open optional
integration; no SDK/account requirement is introduced.
