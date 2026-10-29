# CI clean-checkout portability repair — 2026-10-29

Scope: StatePort-Dev/stateatom CI, following the maintainer's repository
clarification. No StatePort host changes, product redesign, publication or
change to the accepted Atom96 release criteria.

## Original failure

[GitHub run 40907706853](https://github.com/StatePort-Dev/stateatom/actions/runs/40907706853)
on `b3f22d4b160cbe6897a7250e4a2e4362599e53be` failed both jobs:

- `build-and-test`: 6,359 PASS / 122 FAIL out of 6,481 reported tests. Missing
  pinned TodoMVC inputs also prevented some test modules from loading, so that
  total is not directly comparable to a fully prepared suite.
- `packed-contracts`: the independent embedding consumer's `npm install
  --offline` failed with `ENOTCACHED` for esbuild metadata. Root `npm ci` does
  not establish that an unlocked consumer has all required registry metadata.

The developer checkout had ignored build outputs, pinned upstream applications,
retained experiment archives and full Git history. Its previous local PASS was
not proof that a shallow CI checkout could run the same command unaided.

## Changes

1. CI prepares the existing pinned TodoMVC fixture and builds before `npm test`.
   The README records this order and the preparation command's refusal to
   overwrite an existing fixture.
2. Independent consumer installation uses `--prefer-offline`: missing public
   metadata may be fetched. Atom/UI still come from the exact local archives;
   digest, installed-tree, export and immutable-identity checks remain intact.
   CI gives this step a separate cold cache on every run/attempt, retaining a
   regression check for the original failure.
3. Pure guard fixtures use current-checkout paths/UID and explicitly synthetic
   registration metadata. They do not import workstation-only archive files.
   Socket-path acceptance/refusal is tested with controlled path lengths.
4. Exactly 24 historical assertions use `[retained evidence]`. Portable tests
   report SKIP, never PASS, for this separate evidence domain. The explicit
   `npm run test:with-retained` command enables all of them and fails on absent
   archives/history. Original assertions and historical receipts remain intact.
   Current-source input-order and portal/reviewed policy rejection controls also
   run independently of the archival assertions.
5. Two one-shot model-driver negative CLI checks validate the supplied revision
   before environment-specific profile metadata. No native attempt is started,
   and their case files, attempt budgets and saved results are unchanged.
6. The existing Basic and source-map CI drivers now use the current UI tabs,
   explicitly choose read-only attachment, and select an actual element before
   advanced selector/property controls. Basic waits for the Cancel UI action to
   finish before changing tabs. Failure output retains bounded inspector UI
   metadata. All original 23 Basic / 39 map predicates remain required.

## Verification

Local Linux, Node 24.19.0 / npm 11.17.0, shallow disposable checkout
`/tmp/stateatom-ci-clean-20261029`, with dependencies and TodoMVC prepared from
public pinned inputs. No original `.artifacts` archive was copied into it.

- Empty-cache old packaging reproduced `ENOTCACHED`; repaired packaging passed.
- Full `npm test`: **6,511 PASS, 0 FAIL, 24 SKIP**, 6,535 tests.
- Explicit retained assertions on the original evidence-bearing checkout:
  **24 PASS, 0 SKIP**. An explicitly enabled missing-archive control in the
  shallow checkout failed with `ENOENT`, as required.
- `npm run build`, `npm run check:ui`, packed NodeNext/browser declarations and
  all **9** installed-pair compatibility checks passed.
- Sequential native candidate lane passed: **23 Basic + 39 map checks**, both
  standalone and embedding hosts; empty console/error lists and unchanged host
  and registered input manifests. The final diagnostic lane receipt is
  `.artifacts/v01/native-candidate/2026-10-29T16-28-27-105Z/results.json` in the
  disposable checkout. Initial missing-navigation/read-only failures and the
  observed Cancel synchronization failure are retained, not overwritten.
- `git diff --check` passed.

Logs, including the original cold-cache failure and later successful checks,
are retained locally under `.artifacts/ci/2026-10-29-clean-checkout/`.
The above disposable-checkout run tested the working patch; committed-clean
verification is recorded separately in that directory, without relabelling
these receipts as clean or hosted CI.

The produced Atom96 archive remains SHA-256
`001180071d71e89d1bc5b95d7cf166b7ec2dc9a03ef9d8861566447ce899f98e`.
The UI2 archive remains SHA-256
`2bfc8229a45e02f775bb563f27d9a803d51dd977145f46843c45a884e07289e5`.
This repairs CI reproducibility and drivers; it does not create a new product
candidate, replace the qualified local96 kit, rerun historical acceptance, or
establish a successful GitHub run before the fix is pushed and executed there.
