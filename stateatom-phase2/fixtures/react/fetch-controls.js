// SPDX-License-Identifier: Apache-2.0
// Synthetic acquisition controls, not an application or full provenance claim.
window.consumeFetchControl=async function(path='/api/account',init){return await(await fetch(path,init)).json();};
window.nestedFetchControl=async function(){let inner;const original={control:true};try{await fetch('/outer',{get method(){inner=Reflect.apply(window.savedNativeFetch,window,['/api/account']);throw original;}});}catch(e){if(e!==original)throw e;}return await(await inner).json();};
window.savedFetchControl=async function(){return await(await Reflect.apply(window.savedNativeFetch,window,['/api/account'])).json();};
const button=document.querySelector('#run');if(button)button.onclick=async()=>{window.controlResult=await window.consumeFetchControl();window.controlDone=true;};
window.fetchControlsReady=true;
