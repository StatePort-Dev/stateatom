# A02 — private verifier to separate helper case

Frozen before execution, after8bc7cf8, 28 October2026.
`node tests/integration/selected-list-route.mjs --private-channel` keeps case301's
original create/changed/same-value positives and untouched-row/unknown-code negatives.

New required conjunction: owned compilation/source/native capability remains solely
in the parent launcher. The ordinary authenticated source bridge runs in a separate
Node process, receives no capability/binder and forwards trusted inspector facts
through the owner-only local verifier channel. A successful positive must therefore
cross the private HTTP channel. Closing the channel must deny fresh helper analysis;
no old profile or page JSON can replace it. Each channel has exact workspace, opaque
session/request identity, expiry, strict loopback Host, bearer authentication and no
browser Origin admission. Preserve source drift/current native gates on every call.

Also require actual403 refusals for browser Origin, wrong bearer and wrong Host.
Record browser/helper/source/channel cleanup. Private connection/channel secrets are
not run evidence and must not be printed or saved in shared diagnostics.
This is transport qualification, not installed VSIX, normal package/plugin launch,
real IDE navigation, held-out or complete282 acceptance. Historical runs unchanged.
