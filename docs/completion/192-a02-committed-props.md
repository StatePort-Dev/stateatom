# A02.36 — selected committed ancestor props reference, source only

Base afa3d634bb201a6aa514074eb78e95bbb78bd02e, current main/local commits.
The previous A02.35 original full source gate remains acquired in its declared
research-retention configuration. This item addresses a different edge: supplied
props/type references on the exact current ancestor of a selected DOM node.

createReact19Acquisition now shares one private committed-tree selector between its
old state snapshot and new matchCommittedProps(node, props, component). The new
method requires exactly one tag0 ancestor with identical memoizedProps and type
references. It ignores uncommitted alternates and stale return pointers. Equal
values/names, duplicate matching ancestors, changed root/props/type/unmount,
duplicate hosts, malformed or unregistered tree edges, cycles and limits refuse.
Props need no eligible state hook. No props/type/node content reflection, user
function execution, serialization of app references or new strong retention.

The result is a query-time, caller-supplied reference association with opaque
page/root/commit/node/fiber/props/component IDs. suppliedReferenceOnly:true;
sourceElementIdentity/selectedPropertyOrigin/stateToProp/fieldOwnership remain
Unknown/Unsupported and fullPath:false. It does not identify a unique JSX element,
attest source references/revision/frame origin or establish property consumption.
No new UI, instrumented source reference admission, package or installed integration.

Legacy snapshot shape and predicates remain; strict tree-edge checks apply only to
the new method. Its ancestry limit is64 inclusive. A new boundary test actually
failed with65 because reaching root as an unvisited next pointer passed; the new
method now also requires root visited. Legacy snapshot's existing loop behavior
was preserved, so its analogous limit edge is not claimed fixed here.

Initial project in-process RED24 missing-method failures. A default isolated-child
attempt failed in the sandbox without useful child details and is retained separately.
Initial extended focused48PASS/1FAIL and full5106PASS/1FAIL exposed only that boundary;
no old named test disappeared versus the retained prior5080 log. New file adds27
cases; focused final49PASS55.323457ms after the correction. Full final5107PASS131111.007494ms, exit0. Syntax and diff checks passed.

Baseline registration covers1792current tracked files and1642current prior-native
dependencies (case itself is additionally tracked). Only collector source, its
construction API-list test, status and task index are declared old-file changes.
All older research modules/raw/cases/readers remain unchanged. In the prior-native
manifest the collector source is now an exact historical afa3d63 input, not current
byte qualification; no old reader/native rerun or historical result rewrite.
Package80's immutable bytes and previous admission stay historical for its own source.

Source artifacts: `.artifacts/a02/committed-props-source/2026-10-26/`.
20of29/fullA02 and15deferred minors remain. Full source checks passed; ONE final review pending. Next one distinct source question: admit actual existing source references
to this matcher without replacing original complete gates or inferring JSX identity.
