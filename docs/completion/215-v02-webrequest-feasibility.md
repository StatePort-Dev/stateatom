# V02.25 — passive API feasibility: drop-in parity not established

Bounded source/API decision complete, base297ac5a. Product/source unchanged;
20of29/fullV02/16historicaldeferred unchanged. No browser/native/model/permission/
trust/package change or new measurement. Existing82 active/off28.1136/21.0570% misses
10%; this finding is not a waiver, feature, performance floor or new capability.

[Chrome's webRequest contract](https://developer.chrome.com/docs/extensions/reference/api/webRequest#permissions),
retrieved through Context7 and the primary page on2026-10-26, requires the API
permission plus host access to both a subresource URL and its initiator. Restricted
or ungranted requests may be absent from that API's events. Nonblocking MV3 is
available, but that does not establish equivalent visibility. requestId is native
webRequest identity; optional documentId/frameId/timeStamp cannot be labelled CDP
loader/frame/monotonic-clock evidence without a separate explicit binding.

Current `production-observation.mjs` admits Network events by exact tab/frame/loader,
then `production-observations.mjs` retains a sanitised destination origin. There is
no destination-origin equality requirement. One new owned pure-source witness
admits a completed request from selectedapp.invalid context to api.other.invalid,
omits its secret query, and rejects wrongframe/loader. This is conditional source
behaviour, not fresh native cross-origin delivery. The existing map session also
consumes Network Script response source-map headers; replacement must preserve it.

A same-origin-only webRequest prototype could succeed while missing the current
cross-origin path under existing per-origin permissions. It would not establish
an equivalent product Active mode. No new all-host grant, narrower coverage, gap
reinterpretation, timestamp rounding/tolerance or changed10% criterion is approved
here. P04 already disclaims complete capture; this assessment preserves existing
admitted paths, not a newly invented universal-capture requirement. Future optional
coverage design remains possible, separately scoped and explicit about omissions.

Decision: do not switch the product transport or run another benchmark on that
assumption. No general claim that webRequest is unusable or CDP imposes an unavoidable
floor. Source/API constraint was sufficient for this finite decision; a new native
same-origin success would not resolve it, so no browser/CA/permission experiment was
run. Existing5720 source results stay historical, not fresh tests of a new path.

Artifacts `.artifacts/v02/webrequest-feasibility/2026-10-26/` bind the exact relevant
source, owned source witness and primary API reference. No full-suite/build/type/
backend/oldreader repeat for this source/API memo; no implementation was changed.
Next ONE L02.17: source preparation for a single owned Chrome Load unpacked dialog
inventory. Capture the missing native window/owner/private-bus/display evidence;
no directory/credential input, extension install, model API, newCA or oldcase retry.
Exact diagnostic protocol belongs to that task. Old16 installation cause remains
Unknown, not automatically attributed to portal/keyring from log activation alone.
