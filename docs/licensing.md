# Licensing

The intended license for new, original StateAtom code is **Apache-2.0**. This is a project direction; the existing prototype has not been relicensed by this documentation package. The source import preserves the existing MIT root LICENSE and the explicit Apache-2.0 files. See [provenance](provenance.md), [NOTICE](../NOTICE) and [the full Apache text](../LICENSES/Apache-2.0.txt).

Before publishing a source release, the maintainer must identify the material being distributed and apply the intended license only where the necessary rights exist. A public repository alone does not provide an open-source license. See the [Open Source Definition](https://opensource.org/osd).

## Original and existing work

Record which files are original Atom work, which came from the historical prototype, and which were copied or adapted from another project. Preserve the license and attribution that apply to each source. Do not replace an upstream copyright notice with the StateAtom name.

The historical spike was reported as MIT-licensed. The supplied source is a directory snapshot without Git history. Its existing MIT text and original attribution are retained. This import does not assert permission to relicense historical contributions.

## Third-party code and assets

Peekly is a candidate for reuse. Its [upstream license](https://github.com/rosoam/peekly/blob/main/LICENSE) is MIT and requires preservation of the copyright and permission notice in copies or substantial portions. That establishes a reuse option, not that Peekly code is already included in StateAtom or that all dependencies share the same license.

For each component actually distributed, record its origin, revision or version, applicable license, and required notices. Include vendored code, generated bundles, copied examples, icons, fonts, and other assets. An upstream project's root license is not a completed inventory of its transitive dependencies.

Generate distribution notices from this inventory. Do not list proposed dependencies as if they were already shipped. Keep source and packaged notices consistent with the exact release contents.

## Apache-2.0 requirements

Use the [official license text](https://www.apache.org/licenses/LICENSE-2.0) when adopting Apache-2.0. Its distribution conditions include providing the license, identifying modified files, and retaining applicable notices. If an upstream distribution includes a NOTICE file, preserve the relevant notices as required by the license. A NOTICE file does not replace third-party license terms.

Apache-2.0 permits commercial redistribution and includes a limited contributor patent grant. It does not prevent a competitor from using the code or provide clearance of unrelated patents. Conditions excluding commercial use or particular competitors would change the intended open-source model.

## Contributions

Before accepting external source contributions, publish the effective repository license and the terms under which contributions are accepted. Do not imply that a contributor has assigned copyright or accepted a separate agreement that the project has not established.

Contributors must identify copied or adapted material and have the right to submit it. Review new dependencies and source imports as part of the change that introduces them. Preserve notices through refactoring and packaging.

## Names and distribution identity

Code licensing and product names are separate matters. Apache-2.0 does not grant general rights to use the licensor's trade names or marks. This document does not assert a trademark registration or introduce a separate brand license.

Forks and third-party builds should state their origin and avoid implying that they are an official StatePort distribution. Any future name or logo policy must be published explicitly rather than hidden in build scripts or unrelated contribution rules.

## Source release record

The release record must identify the source revision, effective licenses, dependency and asset inventory, required notices, and the build artifact they accompany. Verify these against the files actually being released. Keep that record with the release so later consumers can inspect the applicable terms.


## Local UI font inventory — 2026-10-18

`packages/extension-ui/assets/fonts/InterVariable.woff2` is the unmodified Inter
Variable font from `rsms/inter`, revision
`353b61b9f4430d5f420d56605a6e7993e0941470`, distributed under **SIL OFL 1.1**.
Its original license and exact source URLs/SHA-256 digests are stored next to it
in `Inter-LICENSE.txt` and `provenance.json`. It is not relicensed as Apache-2.0.
The UI tarball and built browser/reader/embedding hosts carry the font notice.
