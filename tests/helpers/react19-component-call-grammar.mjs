// SPDX-License-Identifier: Apache-2.0
// OWNED renderer grammar; not React or a native-admitted profile.
export function componentCallGrammar(){return `
var trace=[], nativeCalls=0, againRemaining=1, skipNative=false;
var work={label:'initial'}, againWork={label:'again'};
var callComponent={react_stack_bottom_frame:function react_stack_bottom_frame(Component,props,secondArg){
 nativeCalls++;trace.push({kind:'callee',component:Component,props,secondArg,receiver:this===callComponent,caller:react_stack_bottom_frame.caller.name,arity:arguments.length});
 try{return Component(props,secondArg);}finally{trace.push({kind:'callee-finally'});}
}};
var callComponentInDEV=callComponent.react_stack_bottom_frame.bind(callComponent);
function renderWithHooks(current,workInProgress,Component,props,secondArg,nextRenderLanes){
 if(skipNative)return 'SKIPPED';
 var children=callComponentInDEV(Component,props,secondArg);
 return children;
}
function renderWithHooksAgain(workInProgress,Component,props,secondArg){
 var children;
 do { children=callComponentInDEV(Component,props,secondArg); } while(--againRemaining>0);
 return children;
}
globalThis.__fixture={trace,work,againWork,initial:(c,p,a)=>renderWithHooks(null,work,c,p,a,0),again:(c,p,a,n=1)=>{againRemaining=n;return renderWithHooksAgain(againWork,c,p,a);},count:()=>nativeCalls,skip:()=>{skipNative=true;}};
`;}
