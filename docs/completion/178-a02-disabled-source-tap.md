# A02.28 — disabled source-tap collection (planning checkpoint)

Fix a concrete source API boundary observed in A02.26, separate from A02.27's
native Off configuration with no global hook. Disabled App/Main observer must
return tap values without delegation/metadata reads/nested collection. Enabled
outer-invalid paths must keep Main-local evidence. Two source/test edits only,
baseline119 with two declared deltas/117remaining and327payload/raw immutable.
No new native/browser/model/installed/privacy qualification; historical native
proof remains9bf056c/c8350fc.11oldminors/20of29/fullA02 unchanged.

## Actual source fix and checks

Original failing controls24/26PASS,2FAIL: disabled delegatedconfig retained1
instead of0, metadataProxy trap1instead of0. Healthy enabled-but-outer-invalid
MainObserved1 passed before fix. Minimal change: early enabled=false return
before Main delegation. No !live()/invalid gate; enabled Main-local evidence
continues even when outer App path is invalid. tap/mainInput.tap share function,
object and primitive return values preserved without metadata access.

GREEN26/26PASS62.957333ms; affected109/109PASS2117.926647ms (terminal30627exit0).
Full npm test4593/4593PASS118490.262036ms (terminal61618exit0),0fail/skip.
Syntax/diff pass. Exactly2declared source/test deltas,117otherresearch/327payload
and all historical evidence unchanged; no new files/driver/schema/vendor/UI.
No native/browser/model/source qualification or saved-reader reruns.

Historical A02.27 remains at9bf056c/c8350fc. After this source fix its1145
prepared inputs reconcile as1143currentphysical+2exactpreparedGit bytes for
observer/test. This is NOT a current-byte native qualification. Current changed
Off branch is covered by owned source controls; native On/hook-absentOff were
not rerun or upgraded. Product/global lifecycle/privacy acceptance remains open.
11oldminors/20of29/fullA02 unchanged. ONE finalreviewpending.
