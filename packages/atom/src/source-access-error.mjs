// SPDX-License-Identifier: Apache-2.0
// Closed messages: response bodies, URLs and browser error strings never enter UI.
const reasons=Object.freeze({
 SOURCE_ACCESS_AUTH:'Artifact access was denied.',
 SOURCE_ACCESS_HTTP:'Artifact download returned an unsuccessful HTTP response.',
 SOURCE_ACCESS_DOCUMENT:'The server returned a document instead of a source artifact; it may be a sign-in page.',
 SOURCE_ACCESS_NETWORK_POLICY:'Artifact download was blocked by network, redirect or browser policy.',
 SOURCE_ACCESS_REDIRECT:'Artifact redirect refused; use the final approved artifact URL.',
 SOURCE_ACCESS_PERMISSION:'Origin permission denied or revoked for artifact download.',
 SOURCE_ACCESS_POLICY:'Artifact URL is not allowed; use HTTPS without credentials or a fragment.',
 SOURCE_ACCESS_BUDGET:'Artifact download exceeds the existing size budget.',
 SOURCE_ACCESS_EMPTY:'Artifact response is empty.',
 SOURCE_ACCESS_CANCELLED:'Artifact download cancelled.',
 SOURCE_ACCESS_TIMEOUT:'Artifact download timed out after 10 seconds.',
 SOURCE_ACCESS_INVALID:'Source artifact could not be validated.',
 SOURCE_ACCESS_UNAVAILABLE:'Source artifact download is unavailable.',
 SOURCE_PARSE_INVALID:'Source artifact parsing failed validation.',
 SOURCE_PARSE_UNSUPPORTED:'Unsupported source map (flat v3 only).',
 SOURCE_PARSE_BUDGET:'Source artifact parsing exceeded a budget.',
 SOURCE_PARSE_CANCELLED:'Source artifact parsing cancelled.',
 SOURCE_PARSE_UNAVAILABLE:'Source artifact parsing unavailable.',
 SOURCE_PARSE_BUSY:'Source parser busy; try again.'
});
export function sourceAccessError(code,status){
 if(!Object.hasOwn(reasons,code))code='SOURCE_ACCESS_UNAVAILABLE';
 const http=['SOURCE_ACCESS_HTTP','SOURCE_ACCESS_AUTH'].includes(code)&&Number.isInteger(status)&&status>=100&&status<=599;
 const message=(http?'Artifact download HTTP '+status+(code==='SOURCE_ACCESS_AUTH'?': access denied.':'.'):reasons[code])+' Choose a local .map or release ZIP.';
 return Object.assign(Error(message),{code});
}
export function safeSourceAccessError(error,fallback='SOURCE_ACCESS_UNAVAILABLE'){
 const code=Object.hasOwn(reasons,error?.code)?error.code:fallback;
 const status=['SOURCE_ACCESS_HTTP','SOURCE_ACCESS_AUTH'].includes(code)?Number(/^Artifact download HTTP ([1-5]\d\d)(?:[.:])/.exec(error?.message||'')?.[1]):undefined;
 return sourceAccessError(code,status);
}
