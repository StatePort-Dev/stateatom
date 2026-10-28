# A02 — separate helper process reaches the owned verifier

28 October2026, after8bc7cf8, frozen case307. Whole A02 and21/29 remain unchanged.

The ordinary source bridge now uses a private local verifier when no in-process
list context was explicitly bound. The launcher retains the actual compiler,
effect and native capabilities and performs verifyListFieldRoute for each request.
The helper forwards the trusted inspector's selection/journal/facts; serialized
page objects cannot issue a verifier context. An explicit local binding still
uses its existing path and does not fall back after a verification refusal.

The short-lived endpoint is loopback-only with exact Host, bearer token, no browser
Origin admission, bounded request/response and timeout. Metadata is in the selected
workspace's .runtime/selected-list-live: owner-only600 files, protected owner
folders, no symlinks, exact workspace/session/request identities, at most one active
channel and15minute expiry. Helper rechecks file identity/digest/expiry and discovery
before accepting the answer. A positive also must match the selected DOM/page/time
and valid source record. No capability, launcher secret or executable content is
returned. The trusted local user/helper/launcher filesystem is part of the existing
computing base; this is not protection from another process with the same user.
Close removes only the channel file with the original device/inode and closes its
own server. Missing, changed, ambiguous or expired channels explicitly refuse.

## Actual checks

`node tests/integration/selected-list-route.mjs --private-channel`:
`.artifacts/a02/selected-list-route/2026-10-28T19-11-39-304Z/` — **7PASS**, errors[],
browser/channel/helper/source closed. results.json SHA256
`9d65458e465cddb9fabf2897aa87e1b5f6ef730cb6dd180d6122bf37de4855ee`.

Actual native create/changed/same-value chains pass through a separate Node helper
process without a context binder or shared WeakMap. Untouched-row and unknown-code
controls remain refused. Actual browser-Origin, wrong-bearer and wrong-Host calls
receive403. Closing the channel denies fresh separate-helper analysis. The child
helper is the ordinary bridge module; its onOpen is still a diagnostic stub, not
an installed IDE or navigation claim. Private credentials were not written into
shared run output. Application bundle remains306's39-input1258081byte artifact.

19affectedPASS in
`.artifacts/a02/selected-list-integration/2026-10-28/list-channel-final-affected.log`:
list-field-channel, bridge-source-priority, project-setup. Includes invalid private
context, absent/symlink/writable metadata, expired/ambiguous channel, mismatched
reply session, malformed positive and authenticated explicit negative response.
Transport fakes are refusal tests only, not native source evidence. The real
positive is the browser case above. Build:extensions PASS, existing CJS/import.meta
warnings retained; git diff --check PASS. Earlier3/18PASS source logs retained.

This completes a transport prerequisite for an installed helper. It does not yet
provide a normal packaged plugin launcher, installed VSIX/real IDE source action,
matching official host, held-out graph or complete282 matrix. Next bounded step:
package the changed helper independently and qualify the actual installed IDE
source action against this channel. No push/publication/SDK or account changes.
