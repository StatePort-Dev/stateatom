# Bounded native compiler-input acquisition

This is one prerequisite for the original React P2/P1 investigation, following
[the product compilation journal](2026-10-18-code-journal-progress.md). It does not
complete the selected full HTTP path. Source is the dirty `main` working tree over
`bcde3d0f1572878df662db6bab79e65bc66dd6d0`; native manifests identify executed inputs.

## Supported fact

A separate Node acquisition hook observes the original Vite 7.1.9 client compiler
invocations. A private pipeline identity connects the exact frozen workspace input,
one actual StateAtom stage, final plugin-container bytes, the exact native result
object returned by the original environment method, and completed HTTP response
bytes. CDP compiled source must match the entire response, exact URL and main-frame
context. A canonical single inert inline-map comment may follow final code; no
executable bytes are stripped or normalized, and the map supplies no source claim.

App.tsx and the three shared logic/cache/semantics inputs have this bounded
Code-linked correspondence. Unknown dependencies and runtime helpers do not gain
workspace certificates. Cached reuse accepts only a previously sealed exact object;
invalidation stales the old claim, and a new observed compilation gets a new pipeline.
The model reports `sourceEquivalence: Unknown/Unsupported`, `completeCompilerInputs:
false`, and Unknown invocation, readonly effects, response creator and current-field
ancestry. `fullPath` remains false. These are compiler/content facts, not proof that
a particular response created a script or that the selected expression executed.

The probe verifies the installed Vite implementation SHA256
`4d3cb3c01758834aaaa3fb1fcfe04daed36996606284efee26809ec2785002aa`.
It does not patch installed Vite or expose a new bridge endpoint. Hook closure
restores original methods. The product journal remains digest-only and unchanged;
these native certificates are not presented in the product or exported diagnostics.

## Controls and retained failures

The first RED controls exposed mutable result/receipt identities and unsafe own-data
inspection. Review then reproduced a late public module-graph registration borrowing
an earlier pipeline for an equal-code clone, valid `res.end(callback)` throwing,
300 retained receipts despite the 256 limit, two omitted hash-budget charges, and
mutation of a returned binding affecting its private input record. All failures are
retained; the focused controls now pass. Only an exact original environment return
can commit a bounded registration proposal. Late callbacks share a closed owner
scope and cannot mint a certificate through the public graph method.

The first native harness comparison included a random page UUID in outerHTML;
that failure is retained. Assertions now compare actual visible text and disabled
state, with raw DOM separately retained. A later native failure exposed Vite warmup
coalescence: an HTTP branch can receive the result before the original warmup
wrapper returns. Acquisition now checks already-sealed identity at native response
`finish`, without delaying or altering the response. Finish timing never supplies
identity; an unsealed object remains Unknown. Abort/close/error-monitor cleanup
releases buffers and creates no finished receipt; original unhandled errors remain
unhandled. The native cache-clone control exercises this with a real post-plugin.

Bounds are 128 pipelines, 256 results/receipts, 2 MiB per source, and 8 MiB processed
source bytes. Seal and integrity rehashes count too. HTTP capture additionally limits
64 active captures, 4096 nonempty chunks and 2 MiB per response, with 8 MiB globally
retained bytes. Receipt metadata stops at 256 with sticky model loss; errors are
bounded deduplicated static strings. Bodies are transient, not persisted source logs.

## Commands and actual evidence

```sh
npm test
npm run build
COMPILER_TAG=<unused> npm run verify:compiler-inputs
```

Run native browser/IDE harnesses sequentially, with no separately running dev server.
Tags never overwrite existing directories. Output is `.runtime/compiler-probes/<tag>/`.
Browser plugin is unavailable; this uses the repository's pinned Playwright 1.63.0,
sandboxed Chromium 153.0.8010.12, Node 24.19.0/npm 11.17.0 and React 18.3.1 dev.

Root final run `compiler-input-final-20261018`: **9 native checks PASS**, no errors,
66 stable source-input hashes and five stable dependency hashes. Inventory has 17
captured scripts, 16 matched main-world scripts, one excluded isolated script,
zero unknown and zero pending sources. The four workspace modules are Code-linked;
other matched bytes do not become trusted workspace/compiler inputs.

The nine native checks separately cover original P1=13/P2.disabled=false and original
P3/P6/semantic getter/error controls off/on; exact compiler correspondence; cached
identity without recompilation; stale invalidation and new pipeline; missing
dependency inputs; same-URL wire substitution; changed StateAtom input; a real
post-stage operator rewrite; and a delayed native graph cache-clone substitution.
The operator rewrite changes the original `* 2` computation to `* 0 + 24` while
retaining the same tested UI result. Compiler input correspondence still holds,
which concretely demonstrates why it cannot certify source semantics or effects.

Focused model/hook checks: **23 PASS**. Root full suite: **343 PASS**, no failures,
skips or cancellations; full build PASS. Mechanism unit tests use synthetic native
interfaces and real Node ServerResponse/streams; they are not browser evidence.
The native harness observes original DOM through CDP and does not re-evaluate app
functions, expressions or getters to extract values.

## UI evidence is separate

This increment has no extension, IDE or panel UI acceptance run. Reuse the frozen
journal candidate's **26 actual panel/IDE/export/fresh-reader checks** and earlier
marker **5**, short loop **20 PASS / 10 expected PARTIAL + 106 UI assertions**, and
browser-only **26**, as recorded at their exact revisions. Vue PARTIAL remains a
negative control. New native compiler facts do not upgrade those UI support claims.

## Remaining decision

A trusted compiler-content link does not establish semantic equivalence across
later transforms, a closed executable set, selected invocation/effect coverage or
complete alias-lifetime write history. The original full current-field HTTP path
remains NOT MET and the historical deep matrix remains 0/6. Independent human
usability and publication remain separate; private reporting is now enabled as
recorded in SECURITY.md.

The next bounded task is an acquisition-only effect premise for the selected
P2/P1 alias lifetime, beginning with the original post-stage rewrite and opaque/
native competing-writer controls. Before issuing any readonly/current-field
certificate, establish exactly which compiler stage's executable bytes the effect
analysis describes and which original invocations are covered. Missing or altered
executables must deny the certificate. Do not add product authority or call a
source-level write inventory a complete effect proof.


## Clean-source reproduction and reuse boundary

The frozen `/tmp/stateatom-compiler-input-candidate-20261018` contains **249 regular
source files**, with no inherited node_modules, build outputs or old spike. A fresh
`npm ci --offline` used empty user/global npm configurations and the previously
public-verified dependency cache. Lockfile/dependency settings are unchanged; this
is not a new empty-cache network claim. Clean **343 tests/build** pass and all
**34 build outputs** match root. Native `clean-compiler-input-final-20261018` from
that checkout passes the same **9 checks**, stable inputs/dependencies and no errors.
The archive has no Git revision; its source manifest identifies the dirty origin.

Compared with the previously accepted frozen journal candidate, **31 executable/
license outputs are byte-identical**; only the three NOTICE files differ, adding
the original compiler-probe origin. This supports reusing the recorded UI checks
for unchanged product binaries. It does not turn the new acquisition harness into
UI acceptance. No source publication, commit, push, release or Store action occurred.
All **1,527 historical** and **241 old short-loop** hashes still match.

Manifests/logs: `.runtime/candidate-bootstrap/compiler-input-final-20261018/`;
root native results: `.runtime/compiler-probes/compiler-input-final-20261018/`;
clean native results: the frozen candidate's `.runtime/compiler-probes/clean-compiler-input-final-20261018/`.
Review re-ran the 23 focused controls and identified no remaining blocker in this
bounded acquisition contract; review did not operate the browser.
