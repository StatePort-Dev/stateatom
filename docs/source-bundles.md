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
is promised. Original artifact bytes are preserved; the maps are never rewritten.

Limits remain those of the importer:8MiB ZIP,16MiB expanded,4MiB per entry,128 entries
including manifest,64 manifest assets, and the existing flat-v3 map limits. Thus64
distinct JS/map pairs exceed the entry limit. Several JS files may explicitly share
one named map; it is stored once. Duplicate assets, map/JS role collisions, reserved
manifest paths, invalid UTF-8/maps, unsafe paths and symlinks below the selected
canonical root refuse. Recipe JSON is closed, rejects duplicate keys and is at most
128KiB. `sources` and `sourceRoot` are inert metadata and are never followed.

Maps without `sourcesContent` remain usable for positions/names only. This command
does not find or add companion sources. Read-only file-size/change checks and
cooperative cancellation bound this local preparation; they are not an atomic
input snapshot or a guarantee for hostile/network filesystems. Before the final link,
cancellation removes private staging and leaves no final output. After that commit
point, the complete artifact is retained. `cleanup.status: Unavailable` explicitly
reports a private staging directory name/code if its removal failed; it does not
undo a completed final file or promise erasure after an OS/process crash.
Source parsing preemption in the inspector is a
separate P02 deliverable.

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
Independent real-app qualification, companion source files, preemptible inspector
archive/map parsing and full P02 acceptance remain open.

Node filesystem/compression APIs were checked against the primary
[Node24 filesystem](https://nodejs.org/docs/latest-v24.x/api/fs.html) and
[zlib](https://nodejs.org/docs/latest-v24.x/api/zlib.html) documentation via Context7.
