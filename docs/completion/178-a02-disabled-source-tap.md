# A02.28 — disabled source-tap collection (planning checkpoint)

Fix a concrete source API boundary observed in A02.26, separate from A02.27's
native Off configuration with no global hook. Disabled App/Main observer must
return tap values without delegation/metadata reads/nested collection. Enabled
outer-invalid paths must keep Main-local evidence. Two source/test edits only,
baseline119 with two declared deltas/117remaining and327payload/raw immutable.
No new native/browser/model/installed/privacy qualification; historical native
proof remains9bf056c/c8350fc.11oldminors/20of29/fullA02 unchanged.
