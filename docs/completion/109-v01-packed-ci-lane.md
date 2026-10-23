# V01.1 — deterministic UI and packed-contract CI checks

2026-10-23, scope-review-1. V01 is now in progress; this bounded configuration
increment is implemented and checked locally. It does not complete whole V01 or
prove a GitHub-hosted run.19/29 whole tasks remain complete; V02 remains open.

[Plan](../superpowers/plans/2026-10-23-v01-packed-ci.md),ff89a92, implements the
first part of09-validation V01 using completed F01/F04 dependencies. No product,
package identity, shared UI style/token, dependency or action-version change.

`.github/workflows/ci.yml` preserves install/unit/build in its existing job and
adds `npm run check:ui`. A separate `packed-contracts` job installs from the same
lockfile, runs `npm run pack:atom`, selects that job's timestamped immutable
handoff, then runs `verify:atom-types` and `verify:atom-package` sequentially on
that exact path. The selector requires clean source at GITHUB_SHA, a contained
timestamped path and equal immutable/latest handoff contents. Consumers receive
the selected path through a quoted environment variable, rather than reading the
mutable latest pointer again. It does not reuse a previous CI artifact.

Both checkouts disable persisted credentials. Existing push/pull_request triggers
and contents:read permissions stay; no private secrets, pull_request_target,
release/upload/deploy/push or remote job invocation is added. Existing checkout@v4,
setup-node@v4,.nvmrc and package/lock versions stay authoritative. The executor
chose two jobs to distinguish fast/source failures from package/type failures;
this is an implementation choice, not a new scope or publication approval.

Official [workflow output commands](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands?tool=bash),
[permissions syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
and [checkout credential option](https://github.com/actions/checkout/blob/main/README.md)
were fetched through Context7. No action upgrade is assumed from newer examples.

## Actual local checks

- YAML parses; original fast commands/triggers/read-only permissions remain.
  The exact embedded Bash and Node programs pass syntax checks.
- Executed the **actual YAML selection shell block** against unchanged qualified65
  with isolated GITHUB_OUTPUT and matching source SHA. It emits only the immutable
  `2026-10-23T13-08-24-618Z/atom-handoff.json` path. A wrong source SHA produces an
  actual AssertionError/nonzero exit and **no output**, before either consumer.
- `npm run check:ui` exits0 without generated changes.
- Existing exact65 full2454/build/packed types2/admission9/H0917 and input protocol
  qualification remain [108](108-v02-input-modes-and-stale-load.md) evidence. They
  were not rerun or relabelled as execution of this new workflow. No product bytes
  changed, so no new candidate, full/native rerun or new performance claim.
- `git diff --check` passes. Configuration checks do not establish runner-side
  npm installation, remote job success, native extension behavior or release.

Local workflow snapshot/selector/negative logs/UI log and derived receipt:
`.artifacts/v01/packed-ci/2026-10-23/verification.json` and adjacent files.
No CI run was triggered, no branch was pushed, and no artifact was published.

## One next unfinished item

**V01.2 — reproducible exact-candidate native browser lane.** It must cover actual
MV3 Basic/picker/save/export/reader, production maps and packed embedding with
sequential shared-port use and explicit environment refusal. The old general
`verify:embedding` script still expects some now-implemented capabilities to be
unavailable and also starts an IDE; it is not silently added as a current green
gate. Reconcile the concrete affected paths before selecting commands, without a
whole-project re-audit or changing old evidence.

The actual installed-VSIX graphical/maintainer route remains a separate V01 gap;
Extension Development Host must not be renamed installed acceptance. ONE whole
V01 review follows its finite implementation stages; this configuration slice
does not add another per-step review campaign. Remote CI execution remains
unverified until separately authorized push; no SDK/redesign/other repository.
