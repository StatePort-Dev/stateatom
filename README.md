# StateAtom

StateAtom is an experimental tool for investigating the code and data behind a selected UI property. It is being developed by StatePort for independent, open-source distribution.

The intended workflow is to select a property, inspect the available dependencies, change a supported input locally, and observe the result. An explanation must show its evidence and the point where tracing stops.

## Project status

The project is a prototype: **Product scope: NARROW SCOPE; OSS alpha: NOT READY**.
This source import preserves the existing browser/IDE workflow and later basic diagnostic modules.
Complete deep tracing remains historically **0/6**. See [current support](docs/status.md)
for the distinction between historical reports, this checkout's checks, and target design.

This is a local development preview, without a published extension, SDK package, or release.
The instructions below apply to the included synthetic localhost project. They do not establish
Store installation, general website support, or human usability acceptance.

## Develop locally

Use Node **24.19.0** (`.nvmrc`) and npm **11.17.0**. The verified host is Linux.
Install pinned public dependencies, run the unit suite, then build:

```sh
npm ci --no-audit --no-fund
npm test
npm run build
```

`npm run build` produces `dist/browser/`, `dist/ide/`, `dist/reader/`, and minified
synthetic fixtures in `dist-fixtures/`. `npm run build:extensions` builds just the
browser, IDE and reader. There is no separate lint or typecheck command in the inherited project.

For browser verification, install the Playwright-pinned Chromium and its host libraries:

```sh
npx playwright install chromium
```

On Linux, host libraries may need `npx playwright install-deps chromium` with system privileges.
The import checks used an already installed matching Chromium, with its sandbox enabled;
downloading a new host browser and provisioning a new OS are separate prerequisites.

Start the synthetic React/Vue development project with the existing open instrumentation:

```sh
npm run dev
```

Open `http://127.0.0.1:4173/react/` (or `/vue/`). The current extension allows only
`127.0.0.1` ports **4173–4175** plus the IDE bridge on **47731**.
Use disposable synthetic applications: interventions reload the page and clear app storage/cache.

## Load the browser and connect the IDE

1. In a Chromium browser with local extension loading, open `chrome://extensions`, enable
   Developer mode, and load unpacked `dist/browser/`. Click StateAtom's toolbar action to open its panel.
2. For the source-connected workflow, use the installed VS Code development host.
   From the repository root, `code --extensionDevelopmentPath="$PWD/dist/ide" "$PWD"`
   loads the open helper. Trust only the source workspace you intend to inspect.
3. Run **X-Ray: Show local pairing token** from the Command Palette (the existing command ID is
   retained). Enter the displayed local URL/token in the panel. Keep the token private.
   Set app origin to `http://127.0.0.1:4173`, source folder to `stateatom-phase2/fixtures`, and Pair.
4. Refresh tabs, choose the React fixture, Attach debugger, then reload the app so collection
   starts before the API responses. Choose **Disabled**, click **Select page element**, and select
   **Confirm combined**. **Read evidence** shows the available evidence; **Open in IDE** opens its source range.
5. The imported experiment control accepts variants below. Run its three repetitions, inspect
   the recorded rollback results, then click **Restore baseline**. The historical evidence must read **Stale**.

```json
[
  {"name":"left masked","rules":[{"url":"http://127.0.0.1:4173/api/account","patches":[{"path":"risk.hold","value":false}]}]},
  {"name":"right masked","rules":[{"url":"http://127.0.0.1:4173/api/permission","patches":[{"path":"access.ready","value":true}]}]},
  {"name":"joint unlock","rules":[{"url":"http://127.0.0.1:4173/api/account","patches":[{"path":"risk.hold","value":false}]},{"url":"http://127.0.0.1:4173/api/permission","patches":[{"path":"access.ready","value":true}]}]}
]
```

The IDE helper and the dev plugin are **required for this source-connected scenario**.
Basic DOM inspection and diagnostic save/export have their own IDE-free check; that does
not supply source or deep provenance. To read an exported diagnostic, open
`dist/reader/reader.html` and choose the JSON file. Imported claims are historical and untrusted.

## Repeat the automated workflow checks

On the verified Linux host, VS Code is at `/usr/share/code/code`; an available graphical
session is required for its Extension Host. **Python 3** (`python3` on PATH) is required
by the artifact sanitizer; the verified host used Python 3.12.3. Reserve local ports **4173, 47731 and 49331**.
Run these sequentially, with any separately started fixture server stopped:

```sh
npm run verify:browser
npm run verify:ide
npm run sanitize:artifacts
```

These are the retained Playwright workflows: they operate the actual MV3 panel and real
VS Code Extension Host in isolated profiles. Some setup and state reads use internal harness
RPC, explicitly distinguished from UI actions in [validation](docs/validation.md).
They are automated UI checks, not a human or Store installation acceptance test.
Generated artifacts and private profiles stay ignored. Sanitize generated artifacts before review;
the original private runtime contains the ephemeral pairing credential and must not be shared.

## An example

Consider a button with this condition:

```js
disabled = creditHold || !canConfirm;
```

A useful investigation identifies the expression, the relevant values, and any supported link to their sources. If both conditions block the action, changing one value can leave the button disabled. That result does not establish that the changed value is unrelated.

Source analysis may identify a possible dependency. Runtime observations may identify what happened in a particular update. An experiment may establish an effect under specific conditions. The evidence model keeps these claims separate.

## Scope

The target is a complete local inspection workflow: element selection, supported dependency analysis, controlled experiments, and readable evidence export. Basic use should not require StatePort Desktop, an account, a model subscription, or a private resolver.

An optional project connection can provide source information. Optional development instrumentation can provide additional execution observations. Connecting an IDE does not itself provide runtime tracing. Available capabilities and missing information must be visible.

StateAtom does not promise to explain every application, recover unobserved history, infer backend correctness, or estimate the time needed to fix a bug.

## Relationship to StatePort

The intended distribution is one StatePort browser extension containing Atom and an optional Desktop connector. Atom remains useful on its own. StatePort handles separate workflows for captured State Cards, replay, and repeated verification.

An Atom evidence bundle records an investigation. A State Card requires an actual capture and the information needed by StatePort to reproduce its supported conditions. Exporting an investigation does not create a State Card.

See [the integration boundary](docs/stateport-integration.md).

## Documentation and contributions

Start with the [documentation guide](docs/README.md). It links to the architecture, evidence model, experiments, validation rules, and recorded decisions.

[Contributing](CONTRIBUTING.md) describes useful changes and verification expectations. [AGENTS.md](AGENTS.md) gives project instructions for coding agents. Use the [security policy](SECURITY.md) for sensitive reports.

## Licensing

This import retains the historical [MIT license](LICENSE). Three existing files explicitly
use [Apache-2.0](LICENSES/Apache-2.0.txt); see [NOTICE](NOTICE) and the file-specific
[provenance](docs/provenance.md). This is a mixed-license tree, not an Apache-only relicensing.
The intended license for future original Atom work remains Apache-2.0.
Dependency notices are generated from actual IDE bundle inputs. See [licensing](docs/licensing.md).
