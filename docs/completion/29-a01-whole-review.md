# A01 — one whole-item review and bounded resolutions

Review target:c32722dec71982fa099d1cb27cb4f75bc8a3d4f8 →
e8cb00ee8ed5881016ff272413656b07d7896dcd (.37 accepted matrix).
Reviewer:a01_whole_review, one read-only automated whole-item pass; no files,
index, branch or experiments changed by the reviewer. No Critical/Important finding.
Verdict:ready to complete the bounded A01 scope, with two Minor findings. This is
not an independent-human acceptance, release or whole-project review.

The review checked the original A01 brief, scope02/12, plans, code, recorded
source/read/instance/HMR/grammar and retained UI workflows. It independently matched
122 current product/build hashes and1,315 executed-input hashes across eight
records; three explicitly archived test-driver/helper deltas remain disclosed.
Scope02/12 and runtime/observer/compiler sources were unchanged in the range.
Counts alone were not the readiness criterion. The original legacy setup failures,
synthetic grammar scope and20PASS/10PARTIAL per-host short-loop criteria stay intact.

## Findings and rulings

### A01-M1 — misleading pending-picker guidance (Minor)

At ui.mjs:84–86 on reviewed .37, a masked pending-picker view says Select page
element, but activation calls the toolbar's active branch and cancels. It also
checks pick admission although it performs cancel-pick. The recorded390px viewport
shows that state. Impact is a misleading reversible control; the evidence/runtime
record remains correct.

Ruling:accepted; fix the label to Cancel element selection, matching the existing
toolbar, and use cancel-pick admission for starting/picking/resolving. Outside that
branch preserve the current guidance. Do not clear the runtime snapshot or change
capability/controller policy.

Meaningful mounted controls use a valid capability-policy v1 record:pick denied /
cancel allowed across all three phases, exact tab/pickerId dispatch, same restored
snapshot; and pick allowed / cancel denied as a negative control. Both failed on
the reviewed implementation, then passed on the correction. Initial helper records
omitted a denial code and failed the policy schema; those initial logs are setup
failures, not contract RED. Corrected-policy RED2/GREEN2 are retained separately:
.artifacts/a01/review-fixes/guidance-confirmed-{red,green}.log.

New immutable candidate0.1.0-candidate.20261021.1:
.artifacts/atom/2026-10-21T00-14-06-283Z/atom-handoff.json.
Its receipt records dirty BASEe8cb00e and exact hashes, not a clean post-commit build.
Source1621/focused65, strict consumers2 and admission7 pass. Current native Basic/
read-only and source-profile controls pass16 across both immutable hosts, including
four trusted Enter activations of the guidance, original UI Cancel/Escape,
identical restored IDs/clocks/save bytes, unchanged application probe and390/1100
viewport candidates. Fonts remain13px root/21px title with no horizontal overflow.
Native record:.artifacts/a01/ordinary-picker-view-native/2026-10-21T00-18-09-045Z/results.json.
The original .37 package/results/review remain unchanged.

The preceding00-15-47-575Z native attempt remains FAIL3: its Enter keyDown had no
text and never activated the button, despite the correct visible label/focus.
The installed Chromium input mapping uses text/unmodifiedText `\r` for Enter;
the corrected driver records trusted keydown/keypress/click before cancellation.
No product keyboard workaround or acceptance predicate was removed.

### A01-M2 — ordinary contributor configuration missing (Minor)

The ordinary workflow documentation led into the installed React18/classic
reactHostProps recipe. Current React19 automatic/default source-read configuration
was visible only in native helper code.

Ruling:accepted. Add the exact contributor recipe to docs/testing/ordinary-react.md
and distinguish it at the local plugin README. It uses the current checked-out
plugin and locked tools with the original app/source root/cwd, existing automatic
JSX transformation and ordinary source consumption. Pair the exact app/src and
origin. Keep the older installed artifact/VSIX evidence separate, with no claim
that a README creates new installed-package support or React19 final-props proof.

Actual documented CLI/config setup PASS:
.artifacts/a01/review-fixes/recipe-2026-10-21T00-15-08-869Z/result.json.
The exact Markdown code fence was run via the local Vite CLI in an exclusive
unchanged locked React19 copy. HTML/index/item/footer200 responses and automatic
JSX metadata containing the current source digests are recorded. Original/copy
source/locks remain unchanged; only the owned server is closed. This proves the
recipe's setup/transform, not app execution, IDE receipt or installed artifacts.

## Reviewer exclusions and explicit coordinator rulings

- React19 final committed-property producer and upstream parameter/store/writer/
  HTTP ancestry:keep their explicit unsupported boundaries; A02 and later work
  do not receive a completed lineage claim from A01.
- Independent-app boolean/wrapper cases:the added grammar controls are synthetic;
  preserve that label. Independent count/title/source-edit/instance results retain
  their actual scope; no independent boolean claim is added.
- State-preserving Fast Refresh, fresh holdout generalisation and universal JS
  semantics:unestablished. Recorded watcher reload, already-exposed corpus and
  scoped getter/receiver/exception/Promise controls remain the actual claims.
- Fresh installed-VSIX acceptance for these increments:unestablished. Current
  contributor pairing and retained F03 installed evidence stay separate.
- Human visual/cross-platform/performance acceptance, official external host,
  SDK/AI/publication:outside this evidence; screenshots stay human-review candidates.
  An independent human is not introduced as a release-scope blocker.
- Prior U03 codec Minor M1:unchanged, separately deferred in26-u03 review history.
  It was not re-reviewed or silently closed here; A01-M1 above is a different issue.

## Final bounded acceptance

Final aggregate:.artifacts/a01/review-fixes/verification1.json,
PASS_A01_ACCEPTED_SCOPE_AND_REVIEW_FIXES,2026-10-21T00:20:46.242Z.
It binds the reviewed .37 matrix without relabelling it as a fresh .1 run, checks
the new candidate/hosts, and verifies that exactly four package inputs changed:
ui.mjs, package metadata/lock and changelog. Normalising only the three reviewed
UI edits reproduces the reviewed source exactly; dependency objects are identical
apart from Atom's candidate version. Runtime/compiler/observer/controller/format/
tokens/primitives/CSS are unchanged. RED2/GREEN2, current source/focused/consumer/
admission/native controls and exact documented recipe setup are bound separately.

A01 is complete within its declared ordinary source/read/profile scope, supported
by actual checks and one whole-item review. Both Minor findings are fixed/tested;
there are no Critical/Important findings. No second review or automatic re-review
loop is requested. The next unfinished dependency-ready item is A02: register one
real independent query/state usage and its missing producer/ownership edges before
implementation. A01 does not complete A02, P04/C07, mandatory A05/L02 or release.
