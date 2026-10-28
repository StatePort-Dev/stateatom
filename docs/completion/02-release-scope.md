# Release scope and completion contract

**28 October performance decision:** the maintainer accepts the recorded Active overhead (10.71737255% standalone / 27.31871841% embedding) for the planned release. See [the scoped exception](281-active-overhead-maintainer-acceptance.md). The original target and measured MISS remain; this deviation no longer blocks release. Other requirements are unchanged.

**Status:** approved scope, revision `scope-review-1`, incorporating the maintainer's item-by-item decisions. Implementation and release acceptance remain separate. The source audit still concerns `f3a7a7e1ba43bea4e39954eaf49b95266822692b`; no new execution result is implied by this revision.

The [decision record](12-scope-decisions.md) records the changes from the proposed contract. The historical requirement IDs O01/O02 are retained for traceability; both are now mandatory deliverables.

## Product boundary

StateAtom helps a developer investigate a selected UI property or interaction, understand supported code/data relationships, try eligible changes and preserve an intelligible record. The official distribution is the StatePort extension. The complete Atom implementation and a usable standalone build remain public. The official host does not supply a hidden resolver.

The baseline is free and local. Basic works without IDE, Desktop or account. A matching source connection or explicit open dev instrumentation may be required for a particular deeper capability. Neither an application QA role nor a StatePort account is required. Source maps may provide source text without an IDE; they do not provide execution history. The production SDK belongs to the wider StatePort project, outside Atom's completion scope.

## Meaning of “working”

A capability is working when its documented task can be completed through the real interface on a declared supported environment, with correct results and clean interruption/recovery. Installation and UI acceptance may be agent-operated. Participation by another person is not a release prerequisite. A library export, green test count, screenshot or isolated positive fixture is insufficient by itself.

The completed baseline is a bounded supported product, not a promise to understand all JavaScript, every framework version, all backend state or events before observation started. Unknown cases stay visible and do not count as positive coverage.

Narrower public previews are permitted before completion. They must name their actual scope and outstanding requirements. Publication still needs authorization for the concrete artifact and destination. A preview does not remove an approved requirement or rewrite the original experiments or earlier maintainer alpha acceptance. [R02]

## Requirement matrix

All rows below are mandatory for the **completed baseline**. A narrower preview may omit unfinished rows if it says so explicitly.

| ID | User outcome | Completion evidence | Tasks |
| --- | --- | --- | --- |
| C01 | Use Basic without IDE, Desktop or account | Install/open, visually select a real tab/element, see snapshot, save/reopen/export | F02, U01, U03, U05, V03 |
| C02 | Connect an ordinary supported dev project | Installed open helper/plugin, normal project start, no fixture paths or research launcher required | F01, F03, A01, V03 |
| C03 | Understand a supported property | Exact source binding, relevant observed inputs, readable condition summary and explicit missing inputs | A01, A02, L01 |
| C04 | Find application handlers and related hooks | Supported function/return path; native registration distinguished from source binding and actual invocation | A03, A04 |
| C05 | Change inputs in Live and Draft/Apply modes | Live for most inputs in the declared editable scope; grouped draft, observed result, undo and return to baseline | U02, F05, V02 |
| C06 | Investigate production with private/local source artifacts | Matching loaded JS/map plus a supported selected-element/action anchor; no manual generated coordinates in the normal flow | P01, P02, P03, U05 |
| C07 | Prepare and hand off a useful QA/PM investigation | Explicitly developed end-to-end UX, expected/actual behavior, bounded observations, preview/redaction and passive reader | U06, U03, P04 |
| C08 | Keep one UI and one engine across products | Current shared UI peer, same packed Atom in standalone and official host, joint lifecycle and design checks | F04, I01, I02, U04 |
| C09 | Support more than React honestly | Universal Basic and positive named React/Vue property/action/data cases; other frameworks disclose scope | A01–A04, V03 |
| C10 | Update and distribute reliably | Reproducible packages, checked contracts, current native/CI evidence, upgrade/rollback and reviewed artifacts | F01, F04, I03, V01–V04 |
| C11 | Select page elements visually | Hover outline and label, click-to-inspect, nested-target refinement, Escape/cancel and no selection-induced application action in supported cases | U05, U01, U04, V03 |
| O01 | Receive local AI explanations when enabled | Useful real-device results, explicit opt-in, bounded facts, no account/paid/cloud dependency and complete model-free fallback | L01, L02, V03 |
| O02 | Observe an action's actual execution | Explicitly armed observation, actual handler/event/instance identity and separately justified consequences | A05, V02, V03 |

O01 is mandatory to implement and validate, but optional for the end user to enable. An unavailable model on a particular device must not disable Atom. A fallback-only test does not complete O01. O02 is mandatory bounded Action Trace, not a requirement for a whole-application call graph or universal async causality.

O03/S01 (production SDK) is outside this Atom plan. It is owned by the wider StatePort project and is not a future Atom release gate; see [ownership boundary](10-later-sdk-and-extension-points.md).

## Input editing

**Live:** supported valid edits apply without a separate Apply click. Boolean controls act immediately; text/number fields commit a valid value after a short input delay or the control's documented commit event. The target is most inputs in the declared editable scope, not only a demonstration toggle. The exact eligible-input catalogue, coverage denominator and control timing are implementation decisions for U02 and must be recorded before evaluating coverage.

**Draft / Apply:** users prepare related edits, inspect their diff and apply them as one requested group. Adapters must state whether application is atomic; where it is not, partial failure and compensating cleanup are explicit.

Both modes provide undo of the last supported edit and return to the investigation baseline. Keep prepared, installed/applied, awaiting consumption, consumed, effect observed and restored distinct. A response override is not consumed until the application actually receives it. A Live edit does not imply continuous observation of all application values or automatic experimental verification. Preserve the original repeated-trial criteria for a verified causal claim.

Observation and mutation authority remain separate. A readable value is not automatically writable. Unsupported writes need an explicit reason; they cannot silently reduce the agreed Live coverage. No generic evaluator, automatic source-code fix or privileged backend operation is introduced.

## Production mode and intentional overrides

Production starts **read-only**. Inspection and trace arming must not themselves reset state, clear cache/storage, reload, submit, invoke application callbacks or install response overrides. User interactions with the application may be observed.

Users may disable read-only mode **in Settings through two sequential warnings and confirmations**. The enabled state must remain visible. Both Live and Draft/Apply become available for the specifically supported operations; no automatic mutation follows from enabling them. Source-map access, IDE access, an imported report or a page message cannot substitute for this decision.

F05 must define and document the scope/lifetime of the enablement, revocation and behavior after navigation, restart and update. Those lifecycle parameters were not decided in the scope discussion. They must prevent accidental permission transfer to an unrelated target. Technical support checks, browser permissions and debugger ownership still apply after confirmation.

The warnings must explain that local input changes can cause real application/backend effects. Undo removes or compensates the supported local change; it cannot promise reversal of arbitrary server-side consequences. Automated acceptance exercises this on controlled production-like environments, not customer production data.

## Operating modes

Capabilities are independent dimensions, not an A/B label or one “deep” flag.

| Mode | Required resources | Supported claims and operations |
| --- | --- | --- |
| Basic | Extension; explicit site access where required | Browser observations and safe diagnostic records without invented source origins |
| Source-connected | Basic plus matching IDE workspace or release artifacts | Supported code locations/relationships; execution remains separate |
| Instrumented development | Trusted dev project, enabled open instrumentation and source identity | Recorded selected reads and supported handoffs; no blanket complete lineage |
| Controlled first-read | Existing exact controlled profile | Only its original finite proof and regression criteria |
| Read-only production | Explicitly permitted production tab; optional maps | Passive supported inspection and user-action observation; no inspector-initiated changes |
| Production changes enabled | Same production context plus the two-confirmation Settings workflow | Only admitted Live/Draft operations, visible enabled state and explicit local-rollback limits |

Source access is not permission to write files. Artifact match is not DOM producer match. A possible source call is not an observed invocation. A successful intervention does not prove every intermediate edge.

## Minimum positive coverage

Register input cases and expected assertions before changing the mechanism. Keep original experiment criteria separately.

**Ordinary React dev:** direct/destructured text; a condition transformed across modules; two independent blocking conditions; local form state; one declared query/state handoff pattern; refetch/re-render with a distinguishable data revision. Positive source and observed-value results must work outside `dev:first-read`. Exact HTTP lineage is required only for the cases whose registered complete path is actually established; do not claim it for every property.

**Vue dev:** direct and computed template bindings; a method/composable-returned handler; two instances with distinct inputs; reinspection after normal state changes. At least one positive property/data path must use a real library from the independent application, not a test-only replacement store. Other template/aggregate cases remain explicitly partial.

**Production:** native DOM handler source mapping and one supported framework handler mapping in minified builds. At least one handler/source result comes from selecting the real element without generated coordinates. Missing anchors give bounded output, not complete `disabled` provenance. The default read-only and deliberately enabled change modes have separate tests.

**Visual selection:** hover preview, nested-target refinement, cancel/reselect and exact instance binding on repeated, small and disabled targets. Test scrolling and moved/replaced elements. Unsupported frames or inaccessible roots must be identified rather than selecting a different target. Test no application action caused by the selection gesture in the declared supported cases.

**Transferability:** at least two independent applications, one non-React; preregister questions and record useful confirmed answers. Keep one structurally different control unused while implementing the mechanism. A known TodoMVC regression remains a regression. These are independent-code checks and may be agent-operated.

**Local AI and Action Trace:** L02 needs a real supported-device model run and a useful, accurate result over the agreed evidence corpus. A05 needs actual handler invocation identity for the registered interaction cases; source declarations or time correlation alone do not pass. Broader unobserved consequences remain unknown.

## Acceptance states

Record `implemented`, `native-verified`, `integrated` and `released` separately. An agent may operate the real installation/UI path; record that fact. Use `user-verified` only if an independent person actually completed it. That label is optional and does not gate the baseline.

These delivery states do not replace claim-level evidence. Approving this scope does not approve all existing screenshots, reset historical results, grant publication authority or establish completion.

C07's outcome is approved; its specific reporter-to-developer journey is not. U06 must develop that UX before treating the existing technical export as a finished handoff.

## Explicit exclusions

Outside Atom's baseline: its own cloud backend, QA-role/auth integration, protected diagnostic endpoints, universal production instrumentation, the production SDK (StatePort-owned), a whole-app call graph, automatic bug fixing, effort/story-point estimates, a second official Store product and a rewrite in a different UI framework. Deeper Angular/Svelte/other adapters remain separate later scope. This does not remove universal Basic or the approved React/Vue support.

## Performance and freshness

**Approved engineering targets:** Basic first useful result within **1 second at p95** on the reference desktop; warm source/action result within **3 seconds at p95** for the registered small/medium project corpus. Measure user gesture to rendered useful content, not only analyzer time. Initial large-project indexing may take longer but must show progress, allow cancellation and keep the panel responsive. Initial model download is excluded, without hiding source acquisition.

Active observation should cause **no more than 10% median workload degradation** against observer-off on the same workload/hardware. Retain distributions and tail effects. A miss requires explicit maintainer agreement; documentation of a miss is not a self-approved waiver. Do not shrink the corpus or workload after results are known. These are targets, not current performance claims.

For this scope, the inspector remains a **snapshot with explicit reinspection** by default. The target, observation time, missing resources and next action must be clear. Live editing must show the newly observed result or that it is still pending; an older snapshot is never presented as the effect of a new edit. Continuous monitoring of every value is not required.

[R02]: https://github.com/StatePort-Dev/stateatom/blob/f3a7a7e1ba43bea4e39954eaf49b95266822692b/docs/status.md "Historical status and recorded results"
