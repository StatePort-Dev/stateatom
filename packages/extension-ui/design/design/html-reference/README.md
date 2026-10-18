# HTML-derived design references

`extension-native-data.json` and `extension-svg/` were derived from the v3 HTML.
`atom-native-data.json` was derived from the preserved v2 Atom UI.
These are editable geometry/text references, not exports of the entire Figma file.
They may predate the Figma navigation consolidation and must not replace live Current
frames automatically. Use `../figma-current.json` for current node IDs.

To regenerate the extension HTML-reference set from this exact code:

```sh
python design/tools/export_html_reference.py
python design/tools/make_reference_svg.py
```

Outputs go into `generated/`. Requires the same Playwright setup as the browser tests.
The process opens only the bundled synthetic prototype; it does not upload to Figma.
