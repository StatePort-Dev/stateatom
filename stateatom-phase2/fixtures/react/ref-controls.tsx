// SPDX-License-Identifier: Apache-2.0
import React,{useState,useEffect,useMemo} from 'react';import {createRoot} from 'react-dom/client';
const mode=new URLSearchParams(location.search).get('case')||'plain',error=new Error('synthetic-ref-original'),counts={lazy:0,effects:0,updaters:0,getters:0,setters:0,caught:false,windowErrors:0,events:[] as string[]};let raw:any,stored:any=null,repaint:()=>void;
window.addEventListener('error',event=>{if(event.error===error){counts.windowErrors++;event.preventDefault()}});
function makeRef(target:any){
 if(['accessor','getter-throw','setter-throw'].includes(mode))Object.defineProperty(target,'current',{configurable:true,get(){counts.getters++;if(mode==='getter-throw')throw error;return stored},set(value){counts.setters++;counts.events.push(value===null?'detach':'attach');if(mode==='setter-throw'&&value!==null)throw error;stored=value}});
 if(mode==='proxy')return new Proxy(target,{get(t,k,r){counts.events.push('get:'+String(k));return Reflect.get(t,k,r)},set(t,k,v,r){counts.events.push('set:'+String(k));return Reflect.set(t,k,v,r)},getOwnPropertyDescriptor(t,k){counts.events.push('descriptor:'+String(k));return Reflect.getOwnPropertyDescriptor(t,k)}});
 return target;
}
class Boundary extends React.Component<any,any>{state={failed:false};static getDerivedStateFromError(){return {failed:true}}componentDidCatch(value:any){counts.caught=value===error}render(){return this.state.failed?<p id="ref-caught">Caught original ref error</p>:this.props.children}}
function App(){
 const [data,setData]=useState<any>(()=>{counts.lazy++;return null});
 const [tick,setTick]=useState(0);
 const ref=useMemo(()=>data?makeRef(data.rules):null,[data]);
 repaint=()=>setTick(value=>{counts.updaters++;return value+1});
 useEffect(()=>{counts.effects++;void(async()=>{const value=await(await fetch('/api/react-ref')).json();raw=value;setData(value)})()},[]);
 if(!data)return <p>Loading ref</p>;
 return <main><h1>React native object ref</h1><p id="ref-value" ref={ref}>{data.rules.quota}</p><p id="ref-tick">{tick}</p><button id="ref-repaint" onClick={()=>repaint()}>Read after native ref assignment</button></main>;
}
const root=createRoot(document.getElementById('root'));root.render(<Boundary><App/></Boundary>);
window.refControls={repaint:()=>repaint(),unmount:()=>root.unmount(),stats:()=>{const d=raw&&Object.getOwnPropertyDescriptor(raw.rules,'current'),value=d&&Object.hasOwn(d,'value')?d.value:stored;return {...counts,refIsDOM:!!value&&value===document.getElementById('ref-value'),refIsNull:value===null,quota:raw?.rules.quota??null}}};
