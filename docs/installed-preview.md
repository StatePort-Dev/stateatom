# Use a supplied local StateAtom preview

This guide is for a local candidate kit supplied by a maintainer, on Linux with
a Chromium browser that allows unpacked extensions. There is no public download
or Store release. See [current support](status.md) for tested capability boundaries.
The full clean-installation/user-workflow matrix is still in progress; writing
this guide does not establish that it passed.

## What to obtain

Obtain one prepared extension folder and its candidate receipt:

- The official **StatePort — Atom & Capture** folder contains `manifest.json`,
  `atom.html`, Capture assets, scripts, fonts and notices. Atom Basic works without
  Desktop; Capture requires its separately compatible Desktop/native bridge.
- The independent **StateAtom** folder contains `manifest.json`, `panel.html`,
  the reader and notices. It exposes Atom without StatePort Capture.

Choose the folder for your intended route; do not load both for the same task.
Keep the whole folder together. Atom/UI npm tarballs are host-builder dependencies,
not folders to select in Chrome. Basic needs no IDE, account, model or app plugin.
The receipt's component versions and hashes identify the kit. Chrome's displayed
extension version alone does not identify the Atom candidate. Never mix files from
kits. Use the matching reader; old readers may reject newer detailed reports.
Historical70 installation records125/126 do not certify a new kit. Current normal
installation/update acceptance is still being completed. macOS installation is
explicitly deferred to a later maintainer check; it is not a verified platform.

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
3. Open the installed extension from Chrome's Extensions menu or its toolbar icon.
   Official StatePort opens a side panel; select **Atom**. Use the chain icon
   (**Open connection settings**) when Page connection is hidden. Refresh the tab
   list, choose the exact app under **Page to inspect**, then **Connect to page**.
   A site requiring browser access shows **Allow site and connect**. That permission
   is separate from permission to change app values.
4. For an explicitly read-only local connection, expand **Page connection →
   Advanced connection options**, select **Read-only**, then **Save connection
   options**. HTTPS sites start read-only automatically. Local development otherwise
   exposes eligible editing; connection or selection alone does not change values.
5. Use the selection icon beside Atom (**Select page element**), then click the
   target on the page. The inspector shows supported property cards, including
   Text and Disabled where applicable. **Select parent** uses the actual picked
   DOM ancestor; **Element details** contains technical identity and the advanced
   **Select by CSS selector** lookup. After a failed lookup, use the picker again.
6. **Dependencies** shows supported expressions/inputs or an explicit missing
   source explanation. **Actions**, **Source**, and **Details** provide the other
   views. Basic observes the DOM; it does not establish execution or complete value
   ancestry. Missing, skipped, unsupported and stale evidence remain labelled.
   Use **Refresh inspection** after changing the app.

Use **Cancel element selection** in the inspector to cancel a pending pick without
sending a key to the application. Escape can also cancel but may reach application
key handlers. Frames and closed shadow roots are unsupported. Browser-internal
pages cannot be inspected like ordinary application pages. A busy debugger owner
must be released by its owner; the inspector does not take it over.

The [Chrome unpacked-extension instructions](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)
describe the browser installation UI. This guide does not ask you to change system
certificate trust. For HTTPS, use an application with a normally trusted certificate.

## Save a snapshot or prepare an issue

Open **Details**, then the diagnostic/save controls. **Save locally** stores a historical snapshot;
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
relying on a plugin/helper/browser combination: current combined runs and their limits are recorded in
[the acceptance record](completion/337-i02-current93-completion.md); older helper-only checks do not certify a newer kit.

1. In VS Code, open **Extensions: Install from VSIX** from the Command Palette and
   select the supplied helper file. Open only the intended workspace. If it opens
   in **Restricted Mode**, use the banner’s **Manage** link and trust that workspace
   in the Workspace Trust editor.
   This is an installed helper, not an Extension Development Host launch.
2. Follow the supplied plugin recipe in that application's own project, using its
   local tarball and explicit configuration. It is an opt-in development integration;
   it does not apply to the production build. Restart the application's documented
   dev server after configuration changes.
3. Set the helper's `stateatom.appOrigin` to the exact app origin and
   `stateatom.sourceFolder` to the intended relative source root. `.` authorizes
   the opened workspace. If needed choose `stateatom.helperPort` explicitly.
4. Run **StateAtom: Copy connection receipt**, choosing the intended workspace if
   asked. Open **Source → Connect project**, expand **Connect your project**,
   paste its private JSON into **Private connection receipt** and choose **Connect project**. Keep this session secret out of URLs, application code,
   screenshots and shared reports.
5. In **Page connection → Advanced connection options**, choose development mode and approve only
   the displayed actions you intend to use for that exact origin. **Save connection options**, connect and reload when the supported recipe calls for collection
   from startup. Reinspect the selected property. Available **Open in IDE** links
   should select the actual source range; a source link alone is not execution proof.

VS Code documents [Install from VSIX](https://code.visualstudio.com/docs/configure/extensions/extension-marketplace#_install-from-a-vsix).
If source or observation support is unavailable, retain Basic and the repair
message. Do not select a nearby component or equal value as a replacement proof.

## Supported input editing and other optional tools

Input editing requires separately admitted permissions and eligible controls or
response fields. Under **Source**, choose the appropriate editing source and **Show editable fields** only on an app you intend to
change. **Live** sends valid edits according to the timing shown in the inspector;
**Draft** keeps local edits until **Apply changes**. An acknowledgement does not by
itself establish application consumption or causality. Unsupported fields stay
unavailable. Review **Undo last change** and **Restore original values** outcomes explicitly: refusal is not
restoration. Closing editing does not automatically restore app state or reverse
server effects.

Production begins read-only. Input-change enablement has two separate Settings
confirmations for the displayed supported scope; observation setup is not either
confirmation. Use only the actual displayed permission and expiry information.
Reopening an inspector or importing a report does not restore old editing authority.

**Actions**, source-map exploration and local explanations have separate supported
boundaries. A registered handler is not necessarily an invoked handler, and a
matching source artifact is not the selected property's producer. The optional English local note is available inside a supported property’s
**Explain this result** disclosure, with the recorded answer and limitations still
visible. Opt in, then **Explain locally**; an initial request may download a model.
Cancel or leave it off to use ordinary inspection. Unsupported browsers/devices
retain that fallback. The bounded real-device validation is [recorded separately](completion/334-l02-completion.md); it does not promise arbitrary AI analysis.

## Disconnect, remove or recover

- A lost inspector connection asks you to **Reopen inspector** and inspect again.
  Old snapshots and drafts do not restore runtime authority.
- **Disconnect IDE**, or run **StateAtom: Disconnect source helper** in VS Code,
  to disconnect source access. Basic has its separate browser connection.
- To remove the development plugin, follow its recipe's removal/cache instructions
  and restart/reload the app. Keep application edits you intentionally made.
- Remove the helper from VS Code's installed extensions and remove the unpacked
  extension entry from `chrome://extensions` when finished. Preserve any reviewed
  files you want to keep outside the profile before discarding the test profile.

Report the candidate receipt identity, browser/OS, exact step, displayed outcome
and missing evidence when something fails. Review the report before sharing; the
guide does not automatically contact a maintainer or upload application data.

## Update or roll back a supplied local extension kit

Finish or cancel active Capture, save any needed review, and close editing first.
Keep the previous complete kit. Replace the files in the same extension folder
with the matching supplied kit, open `chrome://extensions`, and choose the
extension's **Reload** control. Use the same steps with the retained folder
contents to roll back. Do not remove the browser profile or Desktop data.
Check the supplied component receipt after each change; the displayed Chrome
version can remain unchanged. Reconnect explicitly: an update must not resume
recording or editing automatically. Current Linux94→95→94→95 verification retains
a real saved Capture Card and historical Atom diagnostic ([345](completion/345-i03-native-update-and-capture-shell.md)).
This local component procedure does not certify a separately supplied Desktop
installer: its bundled extension must match the same release receipt.
