// SPDX-License-Identifier: Apache-2.0
// Synthetic controls adapted from our action-trace-native.html, original cases retained.

'use strict';
const output=document.getElementById('output'),order=[],originalError=new Error('Synthetic original error'),originalFinallyError=new Error('Synthetic finally error');
let count=0,errorIdentity=true;
function record(label,event){order.push(label+(event?':'+event.target.id+':'+event.currentTarget.id+':'+event.isTrusted:''));count++;output.textContent=JSON.stringify({count,order,errorIdentity});}
window.addEventListener('error',function originalErrorControl(event){errorIdentity=errorIdentity&&(event.error===originalError||event.error===originalFinallyError);record('error-same:'+errorIdentity);event.preventDefault();});
document.getElementById('direct').addEventListener('click',function directListener(event){record('direct',event);return 7;});
document.getElementById('capture').addEventListener('click',function captureListener(event){record('capture',event);},true);
document.getElementById('capture-child').addEventListener('click',function bubbleListener(event){record('bubble',event);});
document.getElementById('delegated').addEventListener('click',function delegatedListener(event){record('delegated',event);});
document.getElementById('arrow').addEventListener('click',event=>{record('arrow',event);});
document.getElementById('bound').addEventListener('click',function boundOriginal(event){record('bound',event);}.bind({synthetic:true}));
document.getElementById('disabled').addEventListener('click',function disabledListener(event){record('DISABLED-MUST-NOT-RUN',event);});
function factory(label){return function sameSourceListener(event){record(label,event);};}
document.getElementById('factory-a').addEventListener('click',factory('factory-a'));
document.getElementById('factory-b').addEventListener('click',factory('factory-b'));
document.getElementById('replace-target').addEventListener('click',function originalListener(event){record('old',event);});
document.getElementById('replace-handler').addEventListener('click',function replaceListener(event){const replacement=document.createElement('button');replacement.id='replace-target';replacement.textContent='New listener';replacement.addEventListener('click',function replacementListener(event){record('new',event);});document.getElementById('replace-target').replaceWith(replacement);record('replaced',event);});
document.getElementById('throwing').addEventListener('click',function throwingListener(event){record('throwing',event);throw originalError;});
document.getElementById('finally').addEventListener('click',function finallyListener(event){try{record('before-finally',event);return 11;}finally{record('finally');}});
document.getElementById('finally-throw').addEventListener('click',function finallyThrowListener(event){try{record('before-finally-throw',event);return 13;}finally{record('finally-throws');throw originalFinallyError;}});
document.getElementById('async').addEventListener('click',async function asyncListener(event){record('async-entry',event);await Promise.resolve();record('async-continuation');});
document.getElementById('unrelated').addEventListener('click',function queuedListener(event){record('queued-entry',event);Promise.resolve().then(()=>record('promise-original'));setTimeout(()=>record('timer-original'),0);});
output.textContent=JSON.stringify({count,order,errorIdentity});

const originalPromise=Promise.resolve(17);
function promiseProducer(event){return originalPromise;}
document.getElementById('promise-return').addEventListener('click',function promiseCaller(event){const result=promiseProducer(event);record('promise-same:'+(result===originalPromise),event);result.then(()=>record('promise-observer-original'));});
let proxyTraps=0;
function receiveProxy(event){record('proxy-receiver');}
document.getElementById('proxy').addEventListener('click',function proxyCaller(event){const proxy=new Proxy(event,{get(){proxyTraps++;throw new Error('No inspector get');},getOwnPropertyDescriptor(){proxyTraps++;throw new Error('No inspector describe');}});receiveProxy(proxy);record('proxy-traps:'+proxyTraps,event);});
document.getElementById('stopped').addEventListener('click',function stoppedListener(event){event.stopPropagation();record('stopped',event);});
window.addEventListener('click',function earlierCapture(event){if(event.target.id==='before-capture'){event.stopImmediatePropagation();record('before-capture',event);}},true);
let retainedEvent;
function laterReuse(event){record('later-reuse');}
document.getElementById('reuse').addEventListener('click',function retainForLater(event){retainedEvent=event;record('retained',event);setTimeout(()=>laterReuse(retainedEvent),0);});
export {};
