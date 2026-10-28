// SPDX-License-Identifier: Apache-2.0
// Presentation only: panels remain mounted; switching never changes inspection ownership.
export function createSectionNavigation({$}) {
 const names=['inputs','actions','source','evidence'],positions=new Map();
 let current,context;
 function show(name,{focus=false}={}) {
  if(!names.includes(name))return false;
  if(current!==name){
   if(current)positions.set(current,$('scroll').scrollTop);
   current=name;
   for(const key of names){
    const button=$(key+'-nav'),panel=$(key+'-section'),active=key===name;
    panel.hidden=!active;button.tabIndex=active?0:-1;
    button.setAttribute('aria-selected',String(active));
    if(active)button.setAttribute('aria-current','location');else button.removeAttribute('aria-current');
   }
   $('scroll').scrollTop=positions.get(name)||0;
  }
  if(focus)$(name+'-nav').focus({preventScroll:true});
  return true;
 }
 for(const [index,name] of names.entries()){
  const button=$(name+'-nav'),panel=$(name+'-section');
  button.setAttribute('role','tab');button.setAttribute('aria-controls',panel.id);
  panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',button.id);
  panel.setAttribute('data-atom-screen',name);
  button.onclick=()=>show(name);
  button.onkeydown=e=>{
   const next=e.key==='Home'?0:e.key==='End'?names.length-1:e.key==='ArrowRight'?(index+1)%names.length:e.key==='ArrowLeft'?(index+names.length-1)%names.length:null;
   if(next===null)return;e.preventDefault();show(names[next],{focus:true});
  };
 }
 show('inputs');
 return {show,setContext(next){if(next===context)return;context=next;positions.clear();$('scroll').scrollTop=0;},reveal(element){const screen=element.closest?.('[data-atom-screen]');if(screen)show(screen.dataset.atomScreen);}};
}
