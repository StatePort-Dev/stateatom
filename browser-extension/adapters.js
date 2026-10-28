// Executed in MAIN world by the extension after an actual picker event.
// Only observations, untrusted data; no bridge credentials and no RPC exposure.
export function observeElement(selector,framework=true){
 const find=s=>s.split(' >>> ').reduce((root,part,i)=>i?root?.shadowRoot?.querySelector(part):document.querySelector(part),null);
 let el;try{el=find(selector);}catch{return {selector,unsupported:'Could not use this CSS selector. Check it or use Pick element.'};}
 if(!el)return {selector,unsupported:'No accessible element matches this selector. Check it or pick an element again.'};
 const owners=[],runtime={},markers=[];let n=el;
 for(let level=0;n&&framework&&level<8;level++,n=n.parentElement){
  const marker=n.getAttribute('data-xray-source');if(marker)markers.push(marker);
  const fiberKey=Object.keys(n).find(k=>k.startsWith('__reactFiber$'));let f=fiberKey?n[fiberKey]:null;
  for(let i=0;f&&i<20;i++,f=f.return){const type=f.type;const name=typeof type==='function'?(type.displayName||type.name):null;if(name&&!owners.includes(name))owners.push(name);}
  const vue=n.__vueParentComponent;if(vue){const type=vue.type;runtime.vue={name:type?.name||type?.__name,file:type?.__file||null};if(runtime.vue.name&&!owners.includes(runtime.vue.name))owners.push(runtime.vue.name);}
 }
 return {selector,id:el.id||null,tag:el.localName,classes:[...el.classList].slice(0,12),text:(Object.getOwnPropertyDescriptor(Node.prototype,'textContent').get.call(el)||'').trim().slice(0,2000),owners,runtime,markerOnSelected:framework&&!!el.getAttribute('data-xray-source'),marker:markers[0]||null,shadow:el.getRootNode() instanceof ShadowRoot?'open':null,observedAt:Date.now()};
}
