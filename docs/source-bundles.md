# Prepare a local source bundle

The Node-only `prepare:source-bundle` command packages **already-built** JavaScript
and flat-v3 source maps for Atom's existing local ZIP import. It does not run a
project build, execute JavaScript, search source folders or download anything.
Use the repository's Node24.19.0/npm11.17.0 environment; Linux is verified.

List exact paths relative to one built-artifact directory in `release-input.json`:

```json
{
  "schema": "stateatom.release-bundle-recipe/1",
  "releaseId": "release-001",
  "assets": [
    {"asset": "assets/main.js", "sourceMap": "assets/main.js.map"},
    {"asset": "assets/lazy.js", "sourceMap": "assets/lazy.js.map"}
  ]
}
```

From the StateAtom checkout, after the application's build has finished:

```sh
mkdir -p .artifacts/private-sources
npm run prepare:source-bundle -- \
  --root /path/to/application/dist \
  --recipe /path/to/release-input.json \
  --output .artifacts/private-sources/release-001.zip
```

CI uses the same command with its explicit artifact directory/recipe. No project
configuration or build plugin is loaded. The command creates a new ZIP and a small
JSON stdout receipt (`PREPARED_NOT_ATTACHED`, releaseId, asset count, bytes, SHA-256,
staging cleanup status).
It refuses an existing output; choose a new name for another release. The output
directory must already exist. The complete file is written0600 in a unique private
directory beside the output, then a hard link atomically creates its new final name.
An existing destination is never replaced; the final path is never deleted by cleanup.
The private staging directory is removed. This local same-filesystem workflow needs
hard-link support; there is no rename/overwrite fallback. Keep the bundle private
unless its owner deliberately distributes it.
Maps may contain complete private source text. Nothing is uploaded or published.

The ZIP includes only root `manifest.json` and listed JS/map files. The manifest
uses the existing schemaVersion1 and SHA-256 of the **raw** artifact bytes. The
loaded-script comparison still uses its separately decoded UTF-8 text digest;
CDP/V8 hashes are another domain. Filenames, releaseId and this locally generated
manifest are not independent authenticity, a CI signature or a DOM/runtime anchor.
Mapping content remains owner-supplied data.

Assets and ZIP entries have stable ordering and fixed metadata. Repeating the same
recipe/artifact bytes in the same recorded Node/zlib environment produces identical
ZIP bytes regardless of file mtimes or recipe order. No cross-zlib binary identity
is promised. Schema1 preserves original artifact/map bytes without rewriting. The explicit
schema2 below creates a separately hashed enriched map copy.

Limits remain those of the importer:8MiB ZIP,16MiB expanded,4MiB per entry,128 entries
including manifest,64 manifest assets, and the existing flat-v3 map limits. Thus64
distinct JS/map pairs exceed the entry limit. Several JS files may explicitly share
one named map; it is stored once. Duplicate assets, map/JS role collisions, reserved
manifest paths, invalid UTF-8/maps, unsafe paths and symlinks below the selected
canonical root refuse. Recipe JSON is closed, rejects duplicate keys and is at most
128KiB. `sources` and `sourceRoot` are inert metadata and are never followed.

With schema1, maps without `sourcesContent` remain usable for positions/names only.
Schema2 accepts only explicitly selected local companion files, as described below;
it never searches for them. Read-only file-size/change checks, selected-root/ancestor identity checks before
opening, after opening and before accepting bytes, and cooperative cancellation
bound this local preparation; they are not an atomic
input snapshot or a guarantee for hostile/network filesystems. Before the final link,
cancellation removes private staging and leaves no final output. After that commit
point, the complete artifact is retained. `cleanup.status: Unavailable` explicitly
reports a private staging directory name/code if its removal failed; it does not
undo a completed final file or promise erasure after an OS/process crash.
The installed inspector uses a fixed owned parser Worker for map/ZIP work on
candidate `.20261021.43`; preparation in this Node command remains a separate
cooperatively cancelled local process.

In Atom, select the real supported element, choose its native/own-host callback's
Connect source map action, import the ZIP once, then View source. The connection
stays private in this tab session. Later supported handler source actions match
their actual loaded script lazily, including chunks loaded later; no second file
selection is needed when the release contains that exact artifact. There is no
automatic source download. Same URLs or release labels never replace the loaded
script's byte identity; missing or ambiguous artifacts stay explicit gaps.

The session accounts unique retained raw maps plus unique parsed-map input sizes
inside its existing8MiB cache budget, with at most8 parsed maps. It admits a release
index only when retained maps plus its largest parse fit that budget. Thus a ZIP
within the archive limits above can still be refused by the connection-cache
limit. Recoverable parsed maps can be evicted and reparsed on explicit use; built
JS bodies are dropped after hashing. This accounts cache input sizes, not total
RSS/AST or in-flight allocations. Clear source connection, navigation, detach,
expiry and runtime restart drop the connection; reconnect explicitly afterward.

[P02.2 evidence](completion/77-p02-single-release-connection.md) establishes this
finite native/own-host flow on synthetic minified chunks in both exact hosts.
[P02.3b evidence](completion/79-p02-mv3-source-parser.md) establishes fixed one-shot
parser Workers through the exact host-owned offscreen document. Maps retain1.5s,
ZIPs2s, at most2 jobs and the same artifact/cache bounds. A missing service gives
an explicit source gap. Clear/navigation/restart cancels work; after offscreen
loss explicitly Attach/import again, and after service-worker restart reopen the
inspector before doing so. Sources and permissions are not silently restored.
[Bounded real-application qualification](completion/81-p02-real-application-qualification.md)
records original prebuilt JavaScript ES6/React/Ember maps, actual non-React native
source navigation and distinct artifact-only cases. Indexed maps remain unsupported;
all original tested maps fit existing caps. Full P02 review and broad V02/V03
acceptance remain open; the explicit companion-source workflow below has its own
bounded verification.

Node filesystem/compression APIs were checked against the primary
[Node24 filesystem](https://nodejs.org/docs/latest-v24.x/api/fs.html) and
[zlib](https://nodejs.org/docs/latest-v24.x/api/zlib.html) documentation via Context7.

## Explicit missing source files

Use recipe schema2 when a matching map omits some original text and you own the
corresponding source files. Put the selected files under the same explicit input
root, for example `provided/Main.tsx`. This command does not copy or search the
application's source folders for you.

```json
{
  "schema": "stateatom.release-bundle-recipe/2",
  "releaseId": "release-001-with-sources",
  "assets": [
    {"asset": "assets/main.js", "sourceMap": "assets/main.js.map"}
  ],
  "companions": [
    {
      "sourceMap": "assets/main.js.map",
      "sourceMapSha256": "<64 lowercase hex digits for the original raw map>",
      "sourceIndex": 0,
      "source": "../src/Main.tsx",
      "file": "provided/Main.tsx"
    }
  ]
}
```

Replace the digest placeholder with the SHA-256 of that exact original map. Index0
means the first entry of its `sources` array; `source` must equal that entry exactly.
Even duplicate logical names are distinguished by index. `file` is the only local
path followed; `source` and `sourceRoot` remain inert metadata. All paths selected
for reading must be safe regular files beneath the canonical root, with no symlinks.
Use the same `prepare:source-bundle` command/output rules as above.

Only absent/null `sourcesContent` slots may be filled. Existing text, including an
empty string, refuses replacement. Unlisted missing sources remain unavailable.
UTF-8 decoding is strict; source BOM/line breaks/Unicode are preserved. Source text
is never executed. The original map/JS/source files on disk remain unchanged.

The ZIP stores an enriched COPY at the declared map entry, with its new raw SHA-256
in manifest-v1. This is no longer the original map byte sequence. Mappings, names,
source order, root and other JSON data retain their values; duplicate JSON members
in a transformed input refuse rather than disappear. The companion files are not
additional ZIP entries. Stdout includes `companionSources` digest provenance:
original/enriched map hashes and each source index/raw-file hash/byte count, without
source text, filenames or absolute paths. Keep this receipt with the private ZIP.
It does not certify source authenticity or prove runtime execution/values.

At most512 companions overall, no repeated map/index, same recipe128KiB,3MiB source
content per map and4MiB raw enriched map, plus the existing ZIP/cache budgets.
JSON escaping can cause an enriched map to exceed4MiB even below3MiB source text;
the command refuses. A source file cannot double as a listed JS/map/manifest input.
No caps are raised. Imported content uses the same transient source preview and
explicit analysis workflow; it is omitted from default diagnostics/models.

[P02.4 execution](completion/80-p02-explicit-companion-sources.md) distinguishes
producer/source checks, actual installed consumption and remaining real-app work.
