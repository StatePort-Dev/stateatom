# A02.38 — conditional native element/current fiber consumer, source only

Base e420e34592a8528d4a3113db7b0d1e840a1e9fcf/current main/local commits.
Reuse the existing collector current-root/tree selector: new JSON-only currentCommit()
and optional fourth expectedFiber conjunction on matchCommittedProps. Normal three-arg
props and old state snapshot predicates/shape stay unchanged. Shared root extraction
preserves the original invalid-node short-circuit order. No callback/second tree walk.

New research native-element-fiber-observer consumes the separate A02.37 hook alongside
native fiber/root/commit taps, without installing any hook/global or product wiring.
Closed own-data19.2.5 schema/file/digest/three unique roles/sites metadata is required.
It records registered tag0 fiber pendingProps/type and native element refs weakly,
indexes latest event per fiber and intervals from authoritative currentCommit IDs.
A selected result requires current fiber/props/type references, immediately preceding
render interval and complete available current records. Same props on other sibling,
uncommitted alternate, newer element on reused fiber, a commit with no fresh event,
ambiguous/incomplete/weak/malformed/stopped/capped metadata stays Unknown.

An initial partial-loss control exposed that skipping an unavailable current record
could hide ambiguity. Another control exposed needless dereference of known expired
records; a mixed-props case hid an ambiguous candidate behind a matching candidate.
Actual93PASS3FAIL RED retained, then fixed: filter known expired/superseded records
first; unavailable current latest record or non-definitive core Unknown refuses whole
result. Only explicit authoritative nonmatch reasons may be ignored. Controlled
SelectiveRef is synthetic and deliberately strong/forced-unavailable; no GC cause or
browser liveness evidence. Real missing refs are never reconstructed from IDs.

Weak maps/WeakRefs only; maximum4096element events separate from inherited4096semantic
events. Overflow/Stop clears own bindings. No graph-byte/GC/heap/performance or product
retention policy claim. Output null-prototype frozen DTOs contain primitive IDs only;
application element/props/component values are not inspected, invoked or serialized.

Result is a conditional nativeElementReferenceAssociation, sourceOnly:true and
nativeOrigin:NotAttested. Supplied policy/owned events do not attest actual loaded
React execution. sourceElementOrigin/selectedPropertyOrigin/fieldOwnership/stateToProp
stay Unknown/fullPath:false. The original complete App/Main/native source gate is not
joined or relaxed; source occurrence/origin and installed/native qualification remain open.

Declared changes: collector/API-list test;3newcodefiles (research consumer, owned
fixture, tests); own docs/status/index. Baseline1802tracked/1642current prior-native
dependencies. Dependency paths are preserved at their CURRENT pre38 bytes. Collector predecessor
e420e34/source5512637 was source-tested, already different from original native35
b07c29b; its historical hash is not original-native qualification. New source is
unqualified natively. collector-source-history.json binds all three exact byte states;
other historical research/raw/cases/readers preserved, no old case/reader rerun.
RED34 missing API/consumer, initial93PASS, then3actual failures fixed.37new/
137focusedPASS1598.059748ms/full5190PASS132961.167653ms, exit0. Syntax/diff checks passed.
Artifacts `.artifacts/a02/committed-element-source/2026-10-26/`.
20of29/fullA02/15deferred unchanged; ONE final review pending.

NextONE: join existing complete source-element gate by actual references and source
qualification. No new native/App/browser/model/package/UI/SDK/otherrepo/cert/trust/
publication or old retention/weak/installation campaign is authorized by this record.
