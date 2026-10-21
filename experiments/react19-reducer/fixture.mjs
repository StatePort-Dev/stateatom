// SPDX-License-Identifier: Apache-2.0
// Explicit synthetic app+oracle, not instrumentation of the independent TodoMVC.
import React,{StrictMode,Suspense,useReducer,startTransition} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
const experiment=globalThis.__R19_EXPERIMENT__;
// Both original vendor modules captured their private callback before app execution.
delete globalThis.__STATEATOM_REACT19_TAP__;
const counts={reducerCalls:0,titleGets:0,actionGets:0,renders:0,suspended:0,caughtSame:false};
const sentinel=Object.freeze(new Error('synthetic original reducer sentinel'));
let dispatch,lastState,lastRows=[],firstDispatch,released=false,resolveGate;
const gate=new Promise(resolve=>resolveGate=resolve);
function row(label){return{label,suspend:false,get title(){counts.titleGets++;return 'SAME';}};}
const initial=[row('first'),row('second')];
function reducer(state,action){
 counts.reducerCalls++;
 if(action.kind==='throw')throw sentinel;
 const replacements=[];
 const result=state.map((item,index)=>{
  if(index!==action.index)return item;
  const next={...item,title:action.title,suspend:action.kind==='suspend'};
  replacements.push([item,next]);return next;
 });
 experiment.oracle.reducerResult(state,action,result,replacements);
 return result;
}
function Row({item,state,slot}){
 if(item.suspend&&!released){counts.suspended++;throw gate;}
 const title=item.title;
 const element=React.createElement('span',{id:'row-'+slot},title);
 experiment.oracle.consumer(element,item,state,title,slot);
 return React.createElement('li',null,element);
}
function App(){
 const [state,send]=useReducer(reducer,initial);counts.renders++;
 dispatch=send;firstDispatch??=send;lastState=state;
 return React.createElement('ul',null,state.map((item,index)=>{lastRows[index]=item;return React.createElement(Row,{key:index,item,state,slot:String(index+1)});}));
}
class Boundary extends React.Component{
 state={failed:false};static getDerivedStateFromError(){return{failed:true};}
 componentDidCatch(error){counts.caughtSame=error===sentinel;}
 render(){return this.state.failed?React.createElement('p',{id:'error'},'Original error caught'):this.props.children;}
}
const root=createRoot(document.getElementById('root'));
flushSync(()=>root.render(React.createElement(StrictMode,null,React.createElement(Boundary,null,React.createElement(Suspense,{fallback:React.createElement('p',{id:'fallback'},'Pending')},React.createElement(App))))));
function action(index,title,kind='replace'){return{index,kind,get title(){counts.actionGets++;return title;}};}
const controls=globalThis.r19Controls={
 ready:true,
 metrics(){return{...counts,dispatchStable:dispatch===firstDispatch};},
 identities(){return{stateId:experiment.id(lastState),firstRowId:experiment.id(lastRows[0]),secondRowId:experiment.id(lastRows[1])};},
 sync(index,title){const a=action(index,title);controls.lastActionId=experiment.id(a);flushSync(()=>dispatch(a));},
 suspend(){const a=action(0,'RESUMED','suspend');controls.suspendActionId=experiment.id(a);startTransition(()=>dispatch(a));},
 resume(){released=true;resolveGate();},
 rebase(){const low=action(0,'LOW'),urgent=action(1,'URGENT');controls.lowActionId=experiment.id(low);controls.urgentActionId=experiment.id(urgent);startTransition(()=>dispatch(low));flushSync(()=>dispatch(urgent));controls.rebaseUrgent={first:experiment.snapshot('1'),second:experiment.snapshot('2')};},
 throwOriginal(){const a={kind:'throw'};controls.errorActionId=experiment.id(a);flushSync(()=>dispatch(a));}
};
