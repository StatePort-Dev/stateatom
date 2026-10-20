// SPDX-License-Identifier: Apache-2.0
// Controlled native-DOM boundary for unit composition; not rendered/native evidence.
export function reviewDocument(){
 const document={activeElement:null};
 document.createElement=(tag='div')=>{
  const events=new Map();let ownText='';
  const n={tagName:String(tag).toUpperCase(),children:[],dataset:{},style:{},value:'',checked:false,disabled:false,hidden:false,open:false,ownerDocument:document,
   set textContent(v){ownText=String(v??'');this.children=[];},get textContent(){return ownText+this.children.map(c=>c.textContent??'').join('');},
   append(...children){for(const c of children){c.parentElement=this;this.children.push(c);}},replaceChildren(...children){ownText='';this.children=[];this.append(...children);},
   setAttribute(k,v){if(k==='id')this.id=String(v);else if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,x)=>x.toUpperCase())]=String(v);else this[k]=String(v);},
   getAttribute(k){return k==='id'?this.id??null:k.startsWith('data-')?this.dataset[k.slice(5).replace(/-([a-z])/g,(_,x)=>x.toUpperCase())]??null:this[k]??null;},removeAttribute(k){delete this[k];},
   addEventListener(k,f){events.set(k,f);},fire(k,values={}){const e={target:this,preventDefault(){},stopPropagation(){},...values};events.get(k)?.(e);this['on'+k]?.(e);},
   focus(){document.activeElement=this;this.focused=true;},showModal(){this.open=true;},close(){this.open=false;events.get('close')?.({});},getClientRects(){return this.hidden?[]:[{}];},
   querySelectorAll(){return[];},click(){if(this.disabled)return;if(this.type==='checkbox')this.checked=!this.checked;this.onclick?.({target:this});if(this.type==='checkbox')this.onchange?.({target:this});}
  };return n;
 };
 return document;
}
export function descendants(root){return[root,...root.children.flatMap(descendants)];}
export function control(root,key,value){return descendants(root).find(n=>n.dataset?.[key]===value);}
