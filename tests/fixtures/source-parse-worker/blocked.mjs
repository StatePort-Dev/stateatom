// SPDX-License-Identifier: Apache-2.0
// Test-only independent termination control. Never a product asset or parser mode.
self.addEventListener('message',event=>{
 const m=event.data;self.postMessage({schema:'stateatom.source-parse-reply/1',id:m.id,kind:'started',operation:m.operation});
 for(;;){} // Parent hard deadline must terminate this dedicated thread.
});
