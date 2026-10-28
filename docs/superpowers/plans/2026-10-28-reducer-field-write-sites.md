# A02 original reducer field-write sites

> **For agentic workers:** Use superpowers:executing-plans inline under approved282/autonomous execution.

**Goal:** Acquire the original newly created row object at an explicit action-derived field definition without replaying its initializer.
**Architecture:** One compiler-only recipe admits a selected two-parameter reducer and explicit ordinary object-literal field definitions sourced from the original action parameter. It wraps the completed literal with a private, failure-isolated observer call and returns the original object. This is a writer-site prerequisite only; no field ownership or applied/selected origin is inferred.
**Tech Stack:** Existing Babel parser/traverse/types/generator and Node VM tests.
**Spec:** Approved282; source gap283. This new bounded mechanism does not reopen native209/276.

## Constraints / decisions
- Explicit reducer binding/field options, arbitrary names/files, no TodoMVC special name/path/value match.
- Only one unique non-async two-identifier-parameter function binding and explicit action-member initializer. Reject binding reassignment, helper collisions, computed/duplicate/accessor keys and a later spread that could override the field.
- Calls/getters in the original initializer run exactly as before, once; failed original creation emits nothing and preserves the thrown object. Observer failure must not become an app failure.
- Metadata records source digest/position/property and action member path, not raw application values. No new runtime global or package route installed in this source-only item.
- A supplied observer is a declared compiler integration input; this module does not attest it or exclude outside writes. Original source remains unchanged on refusal.

## Review focus
Shadowed action parameters, duplicate/overridden fields, initializer exceptions, property evaluation order, helper-name collision. Each has a test. Prototype/accessor fields and unsupported action expressions must not become accepted producers.

## Task 1
- [x] Add tests/engine/reducer-field-writes.test.mjs: dynamic import RED; original retained reducer manifest binding; held-out renamed reducer/field; emitted exact reference and single getter read; order; source exception identity; observer exception isolation; refusal/control cases above.
- [x] Implement src/engine/reducer-field-writes.mjs `instrumentReducerFieldWrites(source,file,{binding,field,observerName})` returning `{status,code,sites,unsupported,fullPath:false,fieldOwnership:'Unknown/Unsupported'}`. Helper name generated collision-free in the source scope; external observerName must be a valid unbound identifier. No AST evaluation.
- [x] Run new/affected write-access/source-write suites; full source once if this compiler source is retained. Preserve RED/GREEN actual logs.
- [x] One read-only review and necessary single correction pass; local commit with285record and current ledger. No native/model/build/publish.

Next finite piece after this prerequisite: bounded runtime writer receipt joined to exact applied state/row reference, and full graph/alias admission; neither is supplied by source transformation. No complete-lineage claim.

## Execution ledger

BASE489ab97.18RED missing module→18GREEN;2additional integration/branch controls and115affectedPASS. Actual retained reducer/constants execute in Node VM, no native React/UI or writer-exclusion credit. Full npm test6063PASS/0fail/cancel/skip162344.717777ms; review pending. Synchronous observer is trusted compiler input; no public runtime route installed.

Final: fixed observer/helper binding collision — four configured-name regressions
RED20/4→GREEN24; affected119/full6067PASS,0fail/cancel/skip,exit0. One read-only
review0C/1I/0M and one correction pass; no rereview/native/package.
