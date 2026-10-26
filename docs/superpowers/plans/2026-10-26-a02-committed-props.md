# Selected Committed Props Implementation Plan

> REQUIRED superpowers:executing-plans inline; ONE fresh final whole-item reviewer.

**Goal:** Match supplied props/type references on one exact selected current ancestor.
**Architecture:** Share the existing private committed-tree selector; leave old native
state snapshot behavior and provenance limits intact.
**Tech Stack:** Existing JS/Node24/assert; no library/dependency changes.
**Spec:** ../specs/2026-10-26-a02-committed-props-design.md

## Global Constraints
Current main/local commits. No native/browser/model/package/UI/SDK/otherrepo/publish.
Old experimental/raw/case/reader bytes protected. Props are opaque identity references;
source/element/property/ownership origins stay Unknown. 20of29/15minors unchanged.

## Review Focus
- Query-time exact current ancestry, no uncommitted alternate or stale return shortcut.
- Duplicate/missing/cyclic/capped metadata refuses a partial positive result.
- Supplied refs do not attest source history or unique JSX element identity.
- No app reference serialization, reflection, invocation or strong lifetime extension.
- Legacy native state snapshot predicates and bounds remain valid after extraction.

### Task 1: Shared selector and bounded props reference method
**Files:** src/engine/react19-acquisition.mjs; tests/engine/react19-acquisition.test.mjs;
NEW tests/engine/react19-committed-props.test.mjs; docs/completion/192-a02-committed-props.md;
docs/status.md; docs/completion/task-index.json.
**Interfaces:** existing factory returns additional matchCommittedProps(node,props,component),
schema stateatom.committed-props-reference/1; original snapshot(node) stays unchanged.
- [x] task-start/read brief/register baseline current tracked files.
- [x] RED new method missing; implement shared selector and strict opaque match.
- [x] GREEN focused legacy/new controls, full npm test, syntax/diff/protected hashes.
Expected: zero source failures, no undeclared historical changes; no native execution.
- [x] Record exact results/limits and local commit; task-done uses saved result/hash binder.
- [x] ONE whole-item review; ONE tested I/C pass, defer minors; archive only own workspace
with CRC/byte/identity checks, remove own workspace, close commit and continue next item.
