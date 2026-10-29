# I03 — coordinated local Linux component distribution

29 October 2026. **I03 complete for the supplied local directory distribution**;
not a Store release, published installer, ordinary OS-installed Desktop acceptance,
or completion of V03. The chosen route is the documented unpacked extension,
with optional retained Linux Desktop beta107 and separate development tools.
The whole plan is **26/29 (89.66%)**. U04, V03 and V04 remain open.

## Exact candidate and delivery routes

Atom95 is the unchanged archive from344, SHA256
`33850e1cf3016e0608808ec626b26e4a97528eb5329ce76096c9c897e1d43f7a`,
producer `6fc9198d6590ee26dfc6f13350c65325fda2a058`.
UI2/contract2.1.0 is unchanged; the optional kit includes plugin17 and helper0.1.3.
the executable identities are recorded in the kit receipt, not inferred from an
installed version label. Host commit `ac733e03` adds the qualified-kit receipt and
About window. Other concurrent Desktop work is not included in the binary proof.

Local archive: `.artifacts/i03/final95/stateatom-linux-component-kit95.tar.gz`,
381593242 bytes, SHA256
`524fcf8b7252ff14d6ec1cc59d876ced19cadd0dc970ff00e097fa18b3890d54`.
It contains the official extension, standalone public development folder,
optional plugin/helper, retained Linux Desktop with the same official extension,
guide, install/update/rollback instructions and full file receipt.
No profiles, captured Cards or credentials are included. This local archive
contains StatePort Desktop; Atom's public license does not authorize publishing it.

Assembly and archive verification are retained under `.artifacts/i03/final95/`.
The final528 payload files plus receipt are read back from the compressed archive,
SHA-checked and executable modes checked. Both official-extension delivery folders
match all36 files. Standalone files match344. The standalone route is independent
Atom development/use, not a second commercial Store extension.

`docs/testing/current95-about-host-case.json` freezes the final official folder.
Only `BUILD-INFO.json` and `atom-page.js` differ from the packaged Capture proof.
The Atom/UI payload, service worker, permissions, bridge and Capture implementation
are unchanged. Old manifests, binaries and raw experiments remain intact.

## Actual packaged Desktop result

The existing Desktop output still held Atom90. A separate local kit copied its
beta107 executable and native helper and replaced only extension resources with95.
This does not claim a fresh build of the concurrent Desktop source or an updated
old installer. Packaged app.asar SHA256:
`46169c1ee3d5e8b695e843bec0324cca354d8a88a5211b5863dc9fc6bc31c3f7`;
native helper SHA256:
`487ccc622061f0557dfe1567a00940dcd444bc23efee4f69747c9d5c606cf097`.

Actual packaged Desktop registers that helper in an owned home; real Chrome156
Capture Start reloads/records, Stop produces a review, and actual Desktop typed
Review/Save persists the Card. After restarting the packaged Desktop, its public
`runtime.list()` returns the same Card revision and exact saved source files.
No product runtime imports and no competing test debugger on the app tab.

Final join:
`.artifacts/i03/packaged95/native-2026-10-29-cold/results.json`,
SHA256 `acb4c7abf07097a5512b4fa803992f1a8b9bb57c2920c521eb5c369ebcf0f854`,
`PASS_PACKAGED95_JOINED_CAPTURE_SAVE_COLD_READ`: **3 retained successful checks
+ 2 fresh cold-read/identity checks**. The retained result's digest, Card files and
stage identity are checked before continuing; Capture is not repeated for credit.
Driver: host `apps/desktop/scripts/package-atom95-native-capture-proof.mjs`.
Exact command and retained driver are in the raw directory; cold invocation uses
the original stage `/tmp/stateatom-i03-desktop95-he05ycsw` and prior result
`native-2026-10-29-2/results.json`.

Assistance remains explicit: isolated home namespace, Desktop `--no-sandbox`,
test extension-load API, and typed Desktop APIs for Review/Save. This is actual
packaged execution, not normal OS installation or manual Desktop GUI usability.
Normal Chrome folder installation and update are separate344/345 evidence.

Earlier failures remain failures: a Playwright app debugger conflicted with
Capture; a background requestAnimationFrame delayed test geometry; the successful
capture run then called nonexistent `runtime.listStateCards` instead of `list`.
The last error was confined to the cold-read driver, so only that step continued.
The failed CDP prototype is retained in the evidence folder, not a product script.

## About and source verification

The toolbar **About this build** button is available without a selected page.
Its native dialog uses existing shared styles, keyboard/Escape/focus behavior and
a lazy disclosure. It shows extension, bridge, Atom source/package, UI contract
and qualified Desktop/plugin/helper versions. Compatibility is explicitly not
installed-tool detection. The complete receipt link remains extension-local.
Unavailable/mismatched metadata never blocks inspection. No permission is granted.

Settings was rejected as the placement: that existing control belongs to HTTPS
editing permission and is not generally available. The two unsuccessful native
placement attempts remain recorded. The final independent About window passed
**6 actual native checks**, including440/390px geometry, keyboard access and Escape
focus return, on the exact final36-file extension:
`.artifacts/i03/about95/2026-10-29T13-06-26-001Z/results.json`, SHA256
`cfc2caf2c8a6619f340829443dc64cfe699a30f708aac8e7c8dd0c1379195aab`.
The390px rendered candidate was inspected by the agent: existing type hierarchy,
readable wrapped versions, no clipped controls. No independent human claim.

Observed missing-button RED, then12 affected Vitest checks PASS; TypeScript and
extension build PASS;9 sequential intake/packed-asset checks PASS. Commands:

```sh
pnpm exec vitest run apps/chrome-extension/tests/atom-build-details.test.ts apps/chrome-extension/tests/atom-workspace-package.test.ts apps/chrome-extension/tests/workspace-launch.test.ts
pnpm --filter @scenariodeck/chrome-extension check
pnpm --filter @scenariodeck/chrome-extension build
node --test --test-concurrency=1 apps/chrome-extension/tests/atom-current-intake.test.mjs apps/chrome-extension/tests/atom-package.test.mjs apps/chrome-extension/tests/ui-package.test.mjs
node tests/integration/current95-about-native.mjs
```

Logs `/tmp/stateatom95-about-final-{green,types,build,package}.log` and
`/tmp/stateatom95-about-native-final.log`; source command is in StatePort, final
native command in StateAtom. No Atom source changed and full6514 from344 is retained,
not rerun or relabelled as a new host/full-platform result.

## I03 acceptance boundaries

| Requirement | Result |
| --- | --- |
| Component identity and About | Exact95/UI2/bridge5/qualified Desktop107/plugin17/helper0.1.3, final native6 |
| Same accepted pair in delivery routes | All36 official files agree in standalone-folder and optional Desktop resources; public standalone95 matches344 |
| Installation/update/rollback | Normal Linux Chrome folder install344; real94→95→94→95 Reload345 preserves real Capture Card, source/checkpoints and historical Atom diagnostic; no resumed lease/edit/recording |
| Actual optional Desktop | Packaged native Capture/Review/Save plus cold read above; final shell delta confined to separately checked About |
| Permissions/disclosures | Final manifest byte-identical to345: activeTab/debugger/nativeMessaging/storage/scripting/tabs/offscreen/sidePanel; required loopback and optional HTTP/HTTPS access. About adds none. Site access is distinct from two-stage editing permission; Capture data and reviewed Atom files remain separate |
| Bundled execution | CSP self-only; existing verified Atom/UI/worker assets bundled, maps remain data. No new remote module loader. Store submission/disclosure approval not claimed; Store channel remains unpublished |
| Optional model and profiles | Completed334/337 supported/unavailable paths retained; kit does not promise unsupported devices/profiles |

Focused source/receipt review found no unresolved I03 mismatch. This acceptance
is of the supplied local distribution route; it does not waive V03's Linux
clean-guide/independent-app requirements. macOS remains unverified, deferred by287;
Windows is not added. Basic343 and Active281 exceptions remain explicit in V02.
No push, public tag, upload, Store submission or update-channel mutation occurred.
Next dependency-ready item: **U04 final reference-to-runtime screen/control join**.
