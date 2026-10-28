# A02 — original React19 DevTools type observations

28 October2026, continues Task3 after f843942. The exact pinned React19 derivative
now observes the results of its four original hook `typeof` operations (one inside
injectInternals, three module checks). The observer returns the original value;
it neither repeats the lookup nor invokes hook accessors for bookkeeping.

Only the optional list-data collector records these events. It requires four unique
sites and the expected role counts, all with original result `undefined`. Missing,
present, duplicate, malformed, capped or stopped observations refuse. The DTO says
`originalChecksUndefined`, not that a property/accessor never existed. A getter may
itself return undefined. Closed code, fresh realm and native/source effect premises
are still required; this event stream is not proof of no alias writer.

The owned list compiler pins this new transform and the changed native recipe.
Its source/tool drift rules remain. No older compiled or browser artifact is
upgraded to the new bytes, and the public route remains unchanged.

## Verification

Logs in `.artifacts/a02/selected-list-integration/2026-10-28/`:
- `devtools-final-affected.log`:39PASS,0fail/cancel/skip,2184.147688ms;
  original/transformed lookup and injection counts, original realm getter exception
  identity, no observer-runtime accessor call, all collector refusal boundaries and
  exact retained native4/1/3 static counts. Source/VM/native-shaped controls only.
- The earlier VM getter test assumption was corrected: host-installed getters and
  getters defined inside the VM realm behave differently in Node. Original and
  transformed actual access counts and thrown identity are compared; no successful
  native/browser observation was invented (`devtools-affected.log`:37PASS).
- `devtools-compilation-final.log` preserves a failed self-pin update: the update
  script also replaced the canonical placeholder inside the hash expression.
  Corrected the update to replace only the declaration; no admission relaxation.
- `devtools-compilation-corrected.log`:14PASS,0fail/cancel/skip,11015.483991ms,
  new compilation plus existing first-read build/code/premise controls. Actual
  compilation, recipe substitution refusal and source-change revocation pass.

No Chromium run, new package, host intake or model invocation. Shared full failures
from294 and historical full6263PASS remain as recorded. Full A02 remains open,
whole21/29 unchanged. Next: bound a finite whole-source effect account to these
owned compiled bytes, then the actual armed code interval. Public integration and
final qualification/review remain pending.
