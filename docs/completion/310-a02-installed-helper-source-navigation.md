# A02 — installed helper and actual IDE source navigation

28 October2026, aftere341258, frozen case309. Whole A02/21-of29 remain unchanged.

The changed open helper has now been installed as a VSIX in an isolated real
VS Code profile. It receives the current selected-list verification through the
private channel and opens the exact original writer range from the mounted Atom
source link. No in-memory verifier capability was injected into the IDE.

## Artifact and execution

`npm run pack:development -- --helper-only` prepares a standalone helper archive
without repacking plugin10 under an already used version. Default paired and
existing plugin-only modes retain their behavior. The helper-only archive name
includes its bundle digest; protocol/helper version remains0.1.3. This local
artifact makes no registry/Marketplace or new plugin-release claim.

Artifact:
`.artifacts/development/2026-10-28T19-17-21-591Z/stateatom-dev-helper-0.1.3-357612ba609c.vsix`
SHA256`c87714e736983c3e34f81977e2842c8bdfe8b8983bdf8da717865894d0cdbe45`.
Bundle SHA256
`357612ba609c1e5f9b4a812e43a4ba18dc036c1d46183c5f240b07293ed32901`.
Handoff records sourcee341258 and dirty state (packaging/qualification work). The
packaged helper bytes were built from the already committed308 implementation.
The initial sandboxed pack produced an archive but failed collecting Git metadata;
its log/artifact remain. The authorized local repeat produced the handoff above.

Actual command:
`node tests/integration/selected-list-route.mjs --installed-vsix=<above exact VSIX>`.
Evidence `.artifacts/a02/selected-list-route/2026-10-28T19-18-32-577Z/`, **8PASS**,
errors[], browser/channel/helper/source closed. results.json SHA256
`cf3bc96ec18106e98daa318fbbd629810bc39491edbc1e37be9022f44b2d6f7b`.

Actual installed helper package metadata and bundle match the VSIX, loaded from
the isolated extensions directory rather than the inert acceptance-driver dev
extension. VS Code1.143.1 reports trusted workspace and successful host completion.
`selected-source-open.json` records actual activeTextEditor navigation to original
`src/todo/reducer.js` line50 column84 in the retained TodoMVC application. Keyboard
activation used the current mounted Writes title link; no source-open success was
substituted by a test callback. Source helper private receipt was not copied into
shared result records. The original code-range SHA check remains enforced.

Create/changed/same-value positives, untouched-row/unknown-code negatives, channel
Origin/bearer/Host refusals and channel-close refusal all still pass. The native
bundle remains306's39-input compilation; this run also exercises the current
source link after that DOM guard change. This is agent-operated IDE evidence,
not human acceptance or generic IDE/platform support.

Checks for this packaging/harness increment: actual package build and installed
host identity/navigation/cleanup, script syntax and git diff --check.308's19helper
source checks remain current; no unrelated suite or benchmark was repeated.

## Remaining dependency

The source launcher still provisions the original application/browser/context.
Normal installed open-plugin launch remains unimplemented/unqualified, so A02 is
not complete merely because the helper VSIX works. Next ONE item: package-owned
selected-list launch/configuration for an ordinary source workspace, preserving
private compiler/native authority and original source behavior. Matching official
Atom package, held-out graph, remaining282 controls and one whole-integration
review also remain. No push/publication/SDK/accounts or other-repo changes here.
