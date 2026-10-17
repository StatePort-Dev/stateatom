// Isolated world. Page never receives bridge token or privileged command channel.
let picking=false,lastPickedAt=-1000;
chrome.runtime.onMessage.addListener((m,s,reply)=>{if(m.op==='pick'){picking=true;reply({ok:true});}});
document.addEventListener('click',e=>{if(performance.now()-lastPickedAt<500){e.preventDefault();e.stopImmediatePropagation();}},true);
document.addEventListener('pointerdown',e=>{if(!picking)return;lastPickedAt=performance.now();picking=false;e.preventDefault();e.stopImmediatePropagation();
 const target=e.composedPath().find(x=>x instanceof Element);if(!target)return;
 let node=target.id?target:target.parentElement?.id?target.parentElement:target;let selector;
 if(node.getRootNode() instanceof ShadowRoot){const host=node.getRootNode().host;selector='#'+CSS.escape(host.id)+' >>> #'+CSS.escape(node.id);}
 else if(node.id)selector='#'+CSS.escape(node.id);
 else {const parts=[];let n=node;for(let i=0;n&&i<8;i++,n=n.parentElement){parts.unshift(n.localName+':nth-of-type('+(Array.from(n.parentElement?.children||n.ownerDocument?.children||[]).filter(x=>x.localName===n.localName).indexOf(n)+1)+')');}selector=parts.join(' > ');}
 chrome.runtime.sendMessage({op:'selected',selector}).catch(()=>{});
},true);
