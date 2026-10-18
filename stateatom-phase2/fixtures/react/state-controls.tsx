// SPDX-License-Identifier: Apache-2.0
import React,{useState,useEffect,Suspense,startTransition,useMemo} from 'react';
import {createRoot} from 'react-dom/client';
const counts={lazy:0,updater:0,stable:true,suspended:0,iterators:0,nativeGets:0,nativeErrorSame:false},setters={},previous={},current={},alternates={};let release,ready=false;
const pending=new Promise(resolve=>{release=()=>{ready=true;resolve();};});
function Item({name}){
 const [data,setData]=useState(()=>{counts.lazy++;return null;});
 const [tick,setTick]=useState(0);
 if(previous[name]&&previous[name]!==setData)counts.stable=false;previous[name]=setData;
 useEffect(()=>{setters[name]={setData,setTick};void(async()=>{const value=await(await fetch('/api/account?state='+name)).json();setData(value);})();},[]);
 current[name]=data;if(!data)return <p>Loading</p>;
 if(data.suspend&&!ready){counts.suspended++;throw pending;}
 return <section><p id={'state-'+name}>{data.rules.quota}</p><p id={'tick-'+name}>{tick}</p></section>;
}
let activeWrapper=null;const originalUseState=React.useState;
React.useState=function(initial){const pair=originalUseState(initial),other=alternates[activeWrapper];if(pair[0]&&other){if(activeWrapper==='array')pair[0]=other;else if(activeWrapper==='iterator')pair[Symbol.iterator]=function*(){counts.iterators++;yield other;yield pair[1];};}return pair;};
function Wrapped({mode}){
 activeWrapper=mode;const [value,setValue]=React.useState(null);activeWrapper=null;
 useEffect(()=>{void(async()=>{const first=await(await fetch('/api/account?wrapper='+mode)).json();const other=await(await fetch('/api/noise?wrapper='+mode)).json();alternates[mode]=other;setValue(first);})();},[]);
 if(!value)return <p>Loading wrapper</p>;
 return <p id={'wrapper-'+mode}>{value.rules.quota}</p>;
}
let cachedAdvance,cachedB;
function Cached(){
 const [data,setData]=useState(null);const [phase,setPhase]=useState(false);
 useEffect(()=>{void(async()=>{const a=await(await fetch('/api/account?cached=A')).json();cachedB=await(await fetch('/api/noise?cached=B')).json();setData(a);})();cachedAdvance=()=>setPhase(true);window.startCached=()=>cachedAdvance();},[]);
 const view=useMemo(()=>data?<p id="cached-state">{data.rules.quota}</p>:<p>Loading cached</p>,[phase]);
 if(phase&&data!==cachedB)setData(cachedB);
 return view;
}
function App(){
 useEffect(()=>{window.stateControls={counts:()=>({...counts}),replace:(name,value)=>setters[name].setData(value),batch:()=>{setters.left.setData({rules:{quota:21}});setters.left.setData({rules:{quota:22}});},functional:()=>setters.left.setData(value=>{counts.updater++;return {...value,rules:{quota:value.rules.quota+1}};}),repaint:()=>setters.left.setTick(value=>value+1),computedWrite:()=>{current.left.rules['quota']=12;setters.left.setTick(value=>value+1);},logicalWrite:()=>{current.right.rules['quota']||=++counts.updater;setters.right.setTick(value=>value+1);},sameWrite:()=>{current.left.rules.quota=12;setters.left.setTick(value=>value+1);},nativeWrite:()=>{Object.assign(current.right.rules,{quota:12});setters.right.setTick(value=>value+1);},nativePartial:()=>{const error={original:true};try{Object.assign(current.right.rules,{quota:12,get poison(){counts.nativeGets++;throw error;}});}catch(e){counts.nativeErrorSame=e===error;}setters.right.setTick(value=>value+1);},rawWrite:()=>{current.left.rules.quota=99;setters.left.setTick(value=>value+1);},suspend:()=>startTransition(()=>setters.left.setData({rules:{quota:33},suspend:true})),resume:()=>release()};},[]);
 return <main><button id="state-computed-write" onClick={()=>window.stateControls.computedWrite()}>Computed same quota</button><button id="state-logical-write" onClick={()=>window.stateControls.logicalWrite()}>Skipped logical quota</button><button id="state-same-write" onClick={()=>window.stateControls.sameWrite()}>Assign same quota</button><button id="state-native-write" onClick={()=>window.stateControls.nativeWrite()}>Native assign same quota</button><Suspense fallback={<p>Pending</p>}><Item name="left"/><Item name="right"/><Wrapped mode="array"/><Wrapped mode="iterator"/><Cached/></Suspense></main>;
}
createRoot(document.getElementById('root')).render(<App/>);
