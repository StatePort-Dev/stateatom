// SPDX-License-Identifier: Apache-2.0
// Synthetic controls for commit identity; not an independent application evaluation.
import React, {StrictMode, Suspense, useState, useEffect, startTransition} from 'react';
import {createRoot as mount} from 'react-dom/client';
const events: string[]=[];
const probe={get quota(){events.push('get');return 12;},multiply(){events.push('call');return this.quota*2;}};
const pending=new Promise(()=>{});
function RetainedFirst(){let chosen;for(let i=0;i<2;i++){const candidate=<button id="retained-first" disabled={i<0}>First only</button>;if(i===0)chosen=candidate;}return chosen;}
function ExistingRef(){return <p id="user-ref" ref={e=>{if(e)events.push('user-ref');}}>{12}</p>;}
function Spread(){const props={title:'spread'};return <p id="spread" {...props}>{12}</p>;}
function Cloned(){const left=false,right=false;const original=<button id="cloned" disabled={left}>Cloned</button>;return React.cloneElement(original,{disabled:right});}
function ObservesRef(){const element=<button disabled={false}>Ref read</button>;return <p id="observed-ref">{element.ref?'ref added':'no ref'}</p>;}
function App(){
 const [stage,setStage]=useState(0);
 useEffect(()=>{(window as any).commitControls={suspend:()=>startTransition(()=>setStage(1)),resume:()=>setStage(2),events:()=>events.slice()};},[]);
 const eligible=probe.multiply()>=20;
 const button=<button id="controlled" disabled={!eligible}>Same value</button>;
 if(stage===1)throw pending;
 const duplicates=[];for(let i=0;i<2;i++)duplicates.push(<span key={i} className="duplicate">{12}</span>);
 return <main>{button}<p id="stage">{stage}</p>{duplicates}<RetainedFirst/><ExistingRef/><Spread/><Cloned/><ObservesRef/></main>;
}
function Other(){const [value,setValue]=useState(12);useEffect(()=>{(window as any).repaintOther=()=>setValue(v=>v+1);},[]);return <p id="other-value">{value}</p>;}
const root=mount(document.getElementById('root')!);
root.render(<StrictMode><Suspense fallback={<p>Pending</p>}><App/></Suspense></StrictMode>);
mount(document.getElementById('other')!).render(<Other/>);
