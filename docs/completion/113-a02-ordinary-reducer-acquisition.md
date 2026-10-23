# A02.3 — ordinary React19 native reducer acquisition, lineage still incomplete

2026-10-23, scope-review-1; native source b6708cb, corrected source b50b26e.
Finite experiment accepted after ONE whole-stage review/correction.
**A02 remains open;20/29 whole tasks**.
No product adapter, upstream application, Atom65/UI2, SDK or other repository changed.
[Plan](../superpowers/plans/2026-10-23-a02-ordinary-reducer-acquisition.md).

## New evidence and its limit

A02.2 already proved native identities on a synthetic fixture with a declared
consumer/reducer oracle. Its original14 checks, source and artifacts are preserved;
they were not rerun. This stage executes the retained **ordinary original TodoMVC**
ff43b02e59dfa604386bb382034b2cd07c2bcd8a with React/react-dom19.2.5. Original
SOURCE_SHA256/REVISION/license/application/package inputs match before/after. This
is a retained source copy with its recorded revision, not a nested Git checkout.

Same automatic-JSX/development bundling in original/off/on configurations; only
the two already hash-pinned vendor inputs use the existing declared transforms.
All original/derivative JS/CSS, metafiles, site counts and64 input hashes are
registered before browser execution. The application source is unchanged. The new
isolated companion wraps the existing experiment tap; no app callback/getter is
re-executed and no consumer/reducer oracle is supplied or called.

An actual supplied DOM node is matched to root.current's committed child/sibling
tree. The resulting native ancestor path can contain exact hook/queue/returned
state/revision/update identities. Reused child .return pointers can refer to an
old alternate, so committed tree edges determine this path. Function/forward-ref/
simple-memo hook lists are inspected; class component app state is not treated as
a hook list. Foreign/detached/stale/missing/primitive/disabled/stopped/capped inputs
refuse. This is page evidence, not hostile-page attestation.

**An ancestor is not the selected property's producer.** Both equal rows can have
the same parent queue/version while different selected DOM IDs remain distinct.
No first-row replacement origin is assigned to the second row's property. State/
row/prop/parameter/destructure transfer, field ownership and selected-property
origin stay Unknown; fullPath=false. Native updateReducerImpl is shared machinery
and does not independently classify every candidate's public hook kind. Filtering
adds another native ancestor candidate with Unknown dispatch origin; it is not
silently equated with the observed application queue.

## Actual finite run

Command:

```sh
node experiments/react19-reducer/ordinary-run.mjs
```

Actual result:
`.artifacts/a02/ordinary-reducer/2026-10-23T15-00-13-717Z/results.json`:
**22/22 PASS**,3 actual pages, Chromium153.0.8010.12, sandbox enabled, headless,
no extension/IDE/CA/security arguments,0errors/console warnings.64 registered
inputs match before/after/current. Original/off/on operate the real application
UI, including Enter/blur editing behavior; visible outputs agree across modes.
This establishes neither equal callback counts nor general concurrent semantics.

| Phase | Actual selected/native result in on page |
| --- | --- |
| Two equal labels | DOM object:18/19 distinct; shared queue:object:1, result object:17, revision:3, update:object:14 |
| Real same-value first-row edit | Labels still SAME/SAME; same selected node IDs; result object:26/revision:5/update:object:23 all new |
| Different first-row edit | CHANGED/SAME; result object:36/revision:8/update:object:33; both selected-property origins remain Unknown |
| Real toggle then Active filter | First actual label detaches and is refused; second remains observed; additional ancestor has Unknown update origin |
| Stop then add | Ordinary app continues to show SAME/AFTER_STOP; no current witness |

IDs are scoped to this on page. No row value, application name, endpoint or
ground-truth hint is input to the companion's matching algorithm. UI selectors
belong to the harness that performs the declared user steps. A native ancestor
queue is not an HTTP exchange; none is invented for this local-state application.

Source controls: initial positive acquisition RED then GREEN; stale-return tree
control independently RED then GREEN. Final **12 focused** includes8 new controls
plus the unchanged original4 semantic/vendor controls. `npm test`: **2484/2484
PASS**,0fail/skip/cancel,86960.212016ms.908 current source/test/harness/plan inputs
match before/after. Syntax/diff pass. Product326 inputs remain unchanged.

Reproducible verifier/receipt and logs:
`.artifacts/a02/ordinary-reducer/2026-10-23/verify.mjs`, `verification.json`.
The original Atom65/V01/native/IDE records keep their own scopes; this experiment
does not requalify installed Atom, its plugin or the old synthetic14 campaign.

## Remaining edge and stopping point

This newly acquires ordinary-app native reducer ancestors on the pinned derivative.
Product React19 eligibility/integration is still unsupported. It does **not**
complete the selected property's ordinary lineage or A02's query/refetch/cache,
masked condition, ownership and escaped-alias acceptance rows.

The next missing edge is the exact state-array row delivered through original
map/React-element prop/Item parameter/destructure into the selected committed host
property, together with a bounded writer/effect argument. Current native ancestor
IDs cannot supply that edge. A possible finite experiment would observe original
object-to-prop transfer with same-value and equal-row counterexamples while leaving
writer exclusion Unknown; this is a proposal, not an approved complete solution.
Invoke the existing stopping rule instead of constructing general ownership proof
infrastructure in this cycle. No blind repeat of the old synthetic/model campaigns.

After this stage's review, one independent dependency-ready item is **V03.1**:
reconcile the installed-user guide with clean-profile artifacts and preregister
the first developer path. V03's full baseline additionally requires unfinished
A02/L02 and retains Linux/macOS targets. Independent application coverage is
mandatory; a separate human participant is not a blocker. No publication follows.


## ONE review and single correction pass

Whole range11573b8..9bcee2f review:0 Critical/1 Important/1 Minor, report
`.artifacts/a02/ordinary-reducer/2026-10-23/review/review.md`. Independent908/64/
326 input and22-record checks plus fresh focused12 passed; no native/full repeat.

Important: a newer `render-phase-unresolved` revision returning the identical object
could borrow an older applied updateId. The review's bounded native-event-stream
probe reproduced it. Four new controls first failed, then16 focused controls pass:
origin is now bound to **exact revision/queue/result**, pending applied origin is
consumed on return and cleared on unresolved. A same revision may carry its own
origin to its next current hook; a reset revision cannot resurrect an old origin.
The original failing probe now returns updateId=null/origin Unknown. This is
source/event-stream proof, not a claim the original22 native cases exercised it.

Minor: current scope says native React reducer/state machinery, with public hook
kind explicitly Unknown. Original native raw `useReducer hook` wording is preserved
as an over-specific label; the filtered additional state candidate is not publicly
classified. Plan/current source are aligned. No second review.

Final corrected `npm test`: **2488/2488 PASS**,0fail/skip/cancel,89172.808463ms;
16 focused, syntax/diff,908 current before/after identities. Final verifier/receipt:
`.artifacts/a02/ordinary-reducer/2026-10-23/verify-final.mjs`,
`final-verification.json`. The earlier manifest containing an invalid placeholder
revision was corrected **before** final testing and retained as invalid metadata;
it is not execution evidence. Original full2484/908 stays at its original bytes.

The original native22/64 run is retained, not rerun. Its companion/test/plan are
three explicit changed inputs; current exact908 source proof and the corrected
refusal/public-kind controls are separate evidence. Original application/vendor/
bundles and all326 product inputs remain unchanged. This is an accepted finite
A02.3 acquisition experiment, not full A02 or installed React19 support.

Executor rulings on all declined boundaries:

1. Full A02/row/prop/destructure/ownership/alias/masked/query/cache/refetch: open;
   no newly acquired native ancestor edge is promoted into that missing argument.
2. Product19/MV3/IDE/plugin/installation: unproved by this experiment; unchanged
   product inputs preserve prior scope and are not fresh installed acceptance.
3. Other versions/flavors/arbitrary concurrency/multi-root completeness/hostile
   proxies/attestation: unsupported. Corrected unresolved revision refusal enforces
   an existing boundary without claiming broader scheduling support.
4. Arbitrary DOM removal/reparenting without a React commit: unverified. This
   experiment matches native committed-tree membership; actual detached refusal
   is specifically the React toggle/filter commit.
5. Fresh native/visual/human proof: none added after correction or by reviewer.
   Detached refusal is the actual harness assertion/PASS; its payload was not
   separately serialized. Candidate screenshots remain candidates; no human gate.
6. Callback/getter counts and timing equality: not measured in ordinary native
   original/off/on. Visible outcomes plus scoped semantic source controls only.
7. Fresh full-suite proof: reviewer reran12 focused only; executor subsequently
   ran corrected full2488/908. These are distinct commands and revisions.
8. Old synthetic14/Atom65/V01/native/installed matrices: unchanged records at their
   own boundaries, not repeated or requalified by this stage.
9. V03/platforms/independent transferability/L02: separate owning tasks.20/29 whole
   tasks unchanged; V03.1 starts from its base dependencies, not full acceptance.
10. Publication/external mutations/accounts/other repositories: unperformed and
    outside this stage; no release follows from this review.
