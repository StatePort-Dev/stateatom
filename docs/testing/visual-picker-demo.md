# Visual picker demo (U05)

This uses the actual packed standalone extension and a synthetic local page.
It needs the repository's installed Chromium/Playwright and a graphical display
for the interactive mode. No IDE, Desktop, account, model or application change
grant is needed. The extension attaches read-only to the demo page.

From the repository root:

```sh
npm run demo:picker -- /absolute/path/to/atom-handoff.json
```

Use the exact accepted U05 handoff named in the
[execution record](../completion/18-u05-visual-picker.md). The runner verifies its
tarball hashes and standalone host manifest before opening a fresh profile with
only that extension. It opens the synthetic application and actual inspector,
chooses the application tab and attaches. Ctrl+C closes the isolated demo.

1. Click **Select page element** in the inspector; switch to the application.
2. Hover the small text within **Confirm nested target**. Chrome shows its native
   outline and element label. Click that nested target.
3. Return to the inspector. The selected node is the actual `span`, not an
   automatically substituted ancestor. Click or keyboard-activate **button#confirm**
   to refine to the real parent button. The app click/submit counters stay zero.
4. Start selection again, then click **Cancel element selection** in the
   inspector. A normal click on the application button now increments the
   click and submit counters. Repeat selection or try disabled/repeated targets.

Escape also cancels, but Chrome can deliver the key to application key handlers.
Use inspector Cancel to avoid page keys. Frame and closed-shadow internals are
unsupported. Tested primary pointer/mouse selection paths do not establish
universal touch, secondary/multi-click or keyboard suppression. Basic intentionally
shows missing source/runtime evidence; selecting a node does not discover its
producer or prove a causal dependency. The saved observation remains a snapshot.

A finite, headless preparation check runs the same nested selection, keyboard
refinement and UI cancellation on the packed host:

```sh
npm run demo:picker -- --smoke /absolute/path/to/atom-handoff.json
```

It writes `demo.json` and four screenshots under `.artifacts/u05/demo/<time>/`.
`PASS_SMOKE` is preparation evidence, not a demonstration already shown to a
human or acceptance of the whole completion scope. Screenshots remain candidates
for human review. Broader native controls are `npm run verify:picker -- <handoff>`;
see the execution record for the actual run, package identities and limits.
