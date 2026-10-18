# Action Inspector implementation plan

Spec: [Action Inspector and Local Explanations](STATEATOM_ACTION_INSPECTOR_LOCAL_AI.md).
Execute locally on the checked-out branch; no publication or StatePort changes.

## Constraints

Source links are not invocation evidence. Preserve the property workflow, exact selected
DOM occurrence, digest-bound source identity, existing evidence edges and stale states.
React native JSX is the initial supported source path. Vue and opaque factories retain
Unsupported/Unknown. No getters, expressions, hooks or handlers run for inspection.
Use the supplied Actions reference and existing shared UI primitives; no token redesign.
AI is optional, experimental, extension-page-only, and must fall back to templates.

## Tasks

1. [x] Add failing real-analyzer tests for exact JSX occurrences, direct/inline/factory/
   prop/conditional bindings, lexical shadowing, custom-hook returns and useCallback.
   Implement bounded action records and per-edge evidence in the existing analyzer;
   reuse the authorized IDE source set and digest-checked Open path.
2. [x] Test and add selected-target native CDP metadata with bounded propagation targets,
   no function serialization, and released handles. Bind action snapshots to tab/frame/
   backend node/run/generation/build. Invalidate on source, DOM, navigation and detach.
3. [x] Add compact Actions UI below inputs using reference typography, source rows and
   native disclosures (three entries initially); existing evidence semantics and
   keyboard/narrow layout retained. Add bounded diagnostic records with optional excerpts.
4. [x] Test deterministic fact minimization, malicious inputs, all local provider states,
   output validation, cancellation and fallback with at least 25 evidence examples.
   Implement optional Chrome provider behind explicit user action. Reject unsupported
   prose through a finite grounded sentence allowlist; model output adds no evidence.
5. [x] Run full tests/build and real MV3 + VS Code selection/navigation checks, native
   fallback, stale/export and responsive/keyboard checks. Record actual Chrome API
   availability separately; no mock can pass the real-device AI acceptance gate.

## Review focus

Repeated elements and inherited markers cannot select a neighbor. Mutable bindings,
getters, spread overrides, dynamic calls and factories must stop resolution. Cross-file
source changes cannot leave enabled stale handler links. Late model completions cannot
attach to a new selection. Untrusted strings, filenames and values stay out of prompts.

## Execution record

- Initial working tree clean. User supplied the design and authorized implementation;
  routine implementation decisions proceed without intermediate approvals (AGENTS.md).
- The proposed historical paths have moved: runtime/UI live in packages/atom/src,
  instrumentation in src/engine. Extend these rather than the now-thin entry points.
- Execution tracing is explicitly deferred by the supplied spec.

- Verification completed on the final working-tree product bytes: 544 unit/harness
  checks, full build, 32 Actions MV3/IDE checks, 26 browser-only checks, existing IDE
  interventions/Restore regression and shared UI generation check. See the linked
  validation record for exact commands, artifacts, failures retained and limitations.
- Real Chrome AI availability was unavailable; model acceptance remains unpassed,
  and the implemented provider is explicitly experimental. No trace/release claim.
