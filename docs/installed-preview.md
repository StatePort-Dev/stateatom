# Use a supplied local StateAtom preview

This guide is for a local candidate kit supplied by a maintainer, on Linux with
a Chromium browser that allows unpacked extensions. There is no public download
or Store release. See [current support](status.md) for tested capability boundaries.
The full clean-installation/user-workflow matrix is still in progress; writing
this guide does not establish that it passed.

## What to obtain

Ask for the prepared **standalone extension folder** and its candidate receipt.
The folder contains `manifest.json`, `panel.html`, `reader.html`, scripts, assets
and license notices. Keep the whole folder together. The Atom/UI npm tarballs are
library dependencies for a host builder; they are not folders to select in Chrome.
Basic inspection needs the prepared browser folder and reader. It requires no IDE,
Desktop, account, model or application plugin.

The receipt identifies the actual Atom/UI candidates and supplied files. Chrome's
extension version currently displays `0.1.0`; that alone does not identify which
candidate you received. Do not combine files from different kits. A current local
checkpoint is Atom `0.1.0-candidate.20261021.70` with UI
`0.2.0-candidate.20261018.2`; this is an identity reference, not a download link.
Use its matching reader: newly supported larger detailed reports can exceed the
older65 reader's structure limit. This is not a general old-reader compatibility
promise. [The scoped qualification](completion/117-v03-packed-detailed-report.md)
records the earlier66 report route. [Current70 browser installation](completion/125-v03-guide-browser-install.md)
records actual Developer mode/Load unpacked and assisted Basic/report transfer;
full guide/source/platform acceptance remains incomplete.

For optional development-source access, obtain the helper VSIX and the separate
Vite plugin tarball with their own compatibility record. A helper installation
alone does not instrument the application. Their installation steps are below.

## Install and inspect a page

1. Use a separate empty browser profile for this preview. Open `chrome://extensions`,
   enable **Developer mode**, choose **Load unpacked**, then select the prepared
   standalone folder containing `manifest.json`.
2. Open your application normally. Start a local application using its own documented
   development command; this guide does not require an Atom fixture or special port.
   Ordinary loopback HTTP supports Basic read-only inspection. Other HTTP/HTTPS
   sites need their explicit supported site-access flow.
3. Open StateAtom from Chrome's Extensions menu or its toolbar icon. Open connection
   settings, expand **Browser connection**, refresh the tab list and choose the exact
   application tab. Keep **Read-only** for inspection. If this exact site needs a
   connection record, use **Save exact site permissions** and its explicit access
   prompt before attachment. Choose **Attach** (the initial
   static label may read **Attach debugger**). A site-access prompt, when needed,
   is separate from permission to change application inputs.
4. Choose **Text** or **Disabled** under **Property**. Choose **Select page element**,
   return to the application and use the primary mouse button to select the target.
   Back in the inspector, **Select parent** advances to its actual DOM parent when
   available. **Element details** contains the longer DOM identity and boundaries.
5. Check the chosen property and value. **Basic** gives a DOM snapshot; it does not
   establish source execution or where a value came from. Missing, skipped,
   unsupported and stale evidence remain labelled. After an application update,
   use **Inspect again** to obtain a new occurrence.

Use **Cancel element selection** in the inspector to cancel a pending pick without
sending a key to the application. Escape can also cancel but may reach application
key handlers. Frames and closed shadow roots are unsupported. Browser-internal
pages cannot be inspected like ordinary application pages. A busy debugger owner
must be released by its owner; the inspector does not take it over.

The [Chrome unpacked-extension instructions](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)
describe the browser installation UI. This guide does not ask you to change system
certificate trust. For HTTPS, use an application with a normally trusted certificate.

## Save a snapshot or prepare an issue

Open **Save and export a diagnostic**. **Save locally** stores a historical snapshot;
it does not send anything. Local diagnostic history is limited to **8 reports,
2 MiB and 7 days**. Download a reviewed file to keep it beyond that history.
**Review / export selected** opens the selected diagnostic
for review before **Download reviewed JSON**. Review target values, notes and URLs
as well as optional source/response excerpts. Removing excerpts alone is not a
guarantee that your own words or remaining values contain no private information.

For a readable bug handoff, use **Prepare current issue**, or select a locally saved
snapshot and choose **Prepare saved issue**. Enter **Issue title**, **What happened**
and **Expected behavior**; steps and a question are optional. Review the **Privacy
review** and optional technical categories. Choose **Review report**, then
**Save reviewed report locally** or **Download reviewed file**. Nothing is sent
automatically. The recipient can open the supplied **Open diagnostic reader** and
import the file in a separate session. Imported observations are historical; they
do not resume collection, source access or edits. This is not a StatePort State Card.

If **Review report** reports `HANDOFF_LIMIT`, the detailed report could not be
prepared. You can explicitly choose the offered simple report and **Review report**
again. That file omits technical details and input history; it does not prove the
detailed transfer succeeded. Review the exclusions and your words before download.

Where **Optional observation window** is available, **Start window**, reproduce
the issue yourself, then **Stop and review**. **Read selected state** adds a sampled
read rather than performing the application action. Review the resulting window
and omissions before download. Starting observation does not grant input editing;
missing earlier history or context remains unknown. If collection is unavailable,
use the simple report path and retain the stated gap.

## Optional development-source connection

The installed [Vite plugin recipe](../packages/vite-plugin/README.md) is a limited
React18/classic-JSX development profile, with its tested Node/Vite/React versions
and conflicts documented there. The separate React19 contributor recipe is not
an installed React19 support promise. Obtain a compatibility-qualified kit before
relying on a plugin/helper/browser combination: the old plugin acceptance and the
current Atom65/helper-only protocol check do not establish a fresh combined UI run.

1. In VS Code, open **Extensions: Install from VSIX** from the Command Palette and
   select the supplied helper file. Open and trust only the intended workspace.
   This is an installed helper, not an Extension Development Host launch.
2. Follow the supplied plugin recipe in that application's own project, using its
   local tarball and explicit configuration. It is an opt-in development integration;
   it does not apply to the production build. Restart the application's documented
   dev server after configuration changes.
3. Set the helper's `stateatom.appOrigin` to the exact app origin and
   `stateatom.sourceFolder` to the intended relative source root. `.` authorizes
   the opened workspace. If needed choose `stateatom.helperPort` explicitly.
4. Run **StateAtom: Copy connection receipt**, choosing the intended workspace if
   asked. Paste its private JSON in **Source connection and setup** and select
   **Connect receipt**. Keep this session secret out of URLs, application code,
   screenshots and shared reports.
5. In **Browser connection**, separately choose development mode and approve only
   the displayed actions you intend to use for that exact origin. **Save exact site
   permissions**, attach and reload when the supported recipe calls for collection
   from startup. Reinspect the selected property. Available **Open in IDE** links
   should select the actual source range; a source link alone is not execution proof.

VS Code documents [Install from VSIX](https://code.visualstudio.com/docs/configure/extensions/extension-marketplace#_install-from-a-vsix).
If source or observation support is unavailable, retain Basic and the repair
message. Do not select a nearby component or equal value as a replacement proof.

## Supported input editing and other optional tools

Input editing requires separately admitted permissions and eligible controls or
response fields. Choose a source and **Open inputs** only on an app you intend to
change. **Live** sends valid edits according to the timing shown in the inspector;
**Draft** keeps local edits until **Apply draft**. An acknowledgement does not by
itself establish application consumption or causality. Unsupported fields stay
unavailable. Review **Undo last** and **Restore baseline** outcomes explicitly: refusal is not
restoration. Closing editing does not automatically restore app state or reverse
server effects.

Production begins read-only. Input-change enablement has two separate Settings
confirmations for the displayed supported scope; observation setup is not either
confirmation. Use only the actual displayed permission and expiry information.
Reopening an inspector or importing a report does not restore old editing authority.

**Actions**, source-map exploration and local explanations have separate supported
boundaries. A registered handler is not necessarily an invoked handler, and a
matching source artifact is not the selected property's producer. Local-model
usefulness remains an unfinished delivery gate; a deterministic fallback or a
model-shaped answer is not proof that useful model inference passed.

## Disconnect, remove or recover

- A lost inspector connection asks you to **Reopen inspector** and inspect again.
  Old snapshots and drafts do not restore runtime authority.
- **Disconnect IDE**, or run **StateAtom: Disconnect source helper** in VS Code,
  to disconnect source access. Basic has its separate browser connection.
- To remove the development plugin, follow its recipe's removal/cache instructions
  and restart/reload the app. Keep application edits you intentionally made.
- Remove the helper from VS Code's installed extensions and remove the unpacked
  StateAtom entry from `chrome://extensions` when finished. Preserve any reviewed
  files you want to keep outside the profile before discarding the test profile.

Report the candidate receipt identity, browser/OS, exact step, displayed outcome
and missing evidence when something fails. Review the report before sharing; the
guide does not automatically contact a maintainer or upload application data.
