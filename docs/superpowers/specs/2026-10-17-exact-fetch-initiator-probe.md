# Next bounded experiment: exact fetch initiator script identity

The accepted host-props scope still ends before a browser exchange identity.
Current fetch/Response.json WeakMaps identify the exact JavaScript Response and
parsed object, but their URL/start ordinal is not a CDP Network.requestId binding.
Do not relabel that existing association as a full HTTP path.

Test a small opt-in acquisition before integrating it: create one private,
single-use function containing **constant trusted passthrough code** per supported
fetch invocation. Its unique sourceURL contains only page/exchange UUIDs. It calls
the original fetch with unchanged receiver/argument identities via captured
Reflect.apply and returns the original promise. No headers, Request, response,
body, expression or getter is rewritten or evaluated again. No user source is
compiled. Function construction/CSP failure falls back to the original fetch and
explicit Unknown; never bypass CSP. Cap generated scripts per navigation.

Debugger.scriptParsed/getScriptSource must confirm the actual compiled constant
script, its exact scriptId, execution context and main frame. Network's synchronous
initiator call frame must refer to that same scriptId and the exact native call
site. The function must be created once and invoked once. Duplicate candidates,
redirects, service workers, another frame/page, absent source, budget loss or a
missing stack stay Unknown. URL, timestamps, request order and equal bodies cannot
replace script identity. Continue treating all page reports as untrusted claims,
not host authority or independent runtime attestation.

Primary/control remain unchanged original P2/P1. First acquisition-only probe also
checks concurrent repeated /api/race requests, an unwrapped native fetch, original
promise identity, an init getter count and original errors. Actual HTTP metadata
and original app outcomes must agree off/on. Record actual generated/compiled
source, CDP IDs, version, frames, cleanup and unsupported controls in new outputs.

Source for protocol fields: pinned Playwright CDP declarations and the official
[Network initiator](https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-Initiator)
and [Runtime call frame](https://chromedevtools.github.io/devtools-protocol/tot/Runtime/#type-CallFrame)
definitions. Actual availability/behavior needs native Chromium proof.

This would close only Response-to-browser-exchange identity. It does not supply
state write, async continuation, same-value raw JSON writes, cache history or every
meaningful deep-case edge. Keep fullPath false until a separate complete verifier
can substantiate all required connections. This is not a new resolver or framework.
