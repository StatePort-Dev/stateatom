// SPDX-License-Identifier: Apache-2.0
// Synthetic application behavior only; no fabricated observer/native events.
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
window.fixture={tag:'stateatom-current10-weak-source/1',renders:0,lazy:0,inputs:0,traps:0,confirms:0,weakCalls:0,weakStacks:[],lastTrusted:null};
function App(){
 window.fixture.renders++;
 const [name,setName]=useState(()=>{window.fixture.lazy++;return 'AB';});
 return <main><h1>Owned React state</h1><label>Name<input id="name" value={name} onChange={event=>{window.fixture.inputs++;window.fixture.lastTrusted=event.nativeEvent.isTrusted;setName(event.target.value);}}/></label>
  <button type="button" id="confirm" disabled={name.length<3} onClick={()=>{window.fixture.confirms++;}}>Confirm</button>
  <button type="button" id="install-trap" onClick={()=>{window.fixture.traps++;Object.defineProperty(WeakRef.prototype,'deref',{configurable:true,get(){window.fixture.weakCalls++;const error=Error('APP_WEAKREF_GETTER_MUST_NOT_BE_CALLED');if(window.fixture.weakStacks.length<4)window.fixture.weakStacks.push(error.stack);throw error;}});}}>Install test trap</button>
  <output id="value">{name}</output></main>;
}
createRoot(document.getElementById('root')).render(<App/>);
