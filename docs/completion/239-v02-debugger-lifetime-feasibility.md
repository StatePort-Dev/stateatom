# V02.30 — read-only Debugger lifetime: drop-in equivalence not established

Finite source/API decision, after238actual84MISS20.54356509/27.05667272%. No product
change/new domain matrix/native/model/CA/package/host work; full21/29 unchanged.

Current attach enables Debugger with2MBscript cache in both modes. Read-only returns
before the full code-journal/body acquisition path, but createSourceMapSession still
consumes Debugger.scriptParsed for its loaded-script catalog and live-edit staleness.
The catalog is available before acquiring any map; it has no optional inventory
activation gate. Map acquisition consent does not make existing metadata disposable.

Current [CDP Debugger contract](https://chromedevtools.github.io/devtools-protocol/tot/Debugger/#event-scriptParsed),
retrieved through Context7 on2026-10-27, describes replay on enable for scripts still
known/uncollected. It does not promise reconstruction of every earlier occurrence.
Runtime context events do not replace native compiled-script IDs/revision/hash.
Enabling later therefore cannot silently substitute for the existing bounded
continuous catalog; disabling also stops immediate live-edit invalidation.

One owned conditional DTO witness uses the actual unmodified source-map session:
continuous transient+survivor catalog retains2identities; a permitted later replay
of survivor only has1. Actual source live-edit event marks the continuous session
Stale; no source/body/network command is requested. This is source behavior under
a documented possible history, not new Chrome-GC/native event-loss proof.
Evidence .artifacts/v02/debugger-lifetime-feasibility/2026-10-27/witness.mjs/result.json.

Historical106already measured350rows of bare/Network-only/Debugger-only/full raw
commands. Debugger-only did not show consistent positive median cost; Network-only
was positive. It did not establish universal floor or safe domain removal. Record136
separately tested Performance configuration; that budget is not reopened either.

Decision: do not remove/lazily enable Debugger as an assumed low-risk performance
fix, narrow the catalog/identity/freshness contract, replace native IDs with matching
URLs, or repeat a domain benchmark. An explicit future acquisition-mode design
could discuss its evidence boundary; no such product decision is approved here.
No universal claim that lazy Debugger is impossible/useless or causally explains
current overhead. Existing10%target/MISS and all historical results remain intact.

One next bounded **L02.24**: inspect the actual pending readiness/metadata path against
I02.25's retained Unknown/Checking and current provider/controller timeouts. Reuse
existing source controls and actual metadata6; no native/model/device/browser/CA
campaign. Resolve a concrete source lifecycle/UI gap if present; do not invent an
API settlement cause, unavailable-device verdict or useful-model acceptance.
