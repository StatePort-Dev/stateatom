// SPDX-License-Identifier: Apache-2.0
// Synthetic ordinary/default-plugin grammar controls. No host/first-read adapter.
import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Forward} from './Forward.jsx';
const events=[];
window.ordinaryPropertyEvents=events;
function App() {
 const [name,setName]=useState('Cedar');
 const [hold,setHold]=useState(true);
 const declared=name;
 const effective='Cedar';
 const policy={get allowed(){events.push('allowed:'+name);return name.trim().length>=3;}};
 return <section>
  <h1>Ordinary property controls</h1>
  <label>Name <input id="controls-name" value={name} onChange={e=>setName(e.target.value)}/></label>
  <label>Hold <input id="controls-hold" type="checkbox" checked={hold} onChange={e=>setHold(e.target.checked)}/></label>
  <button id="condition" disabled={hold || !policy.allowed}>Continue</button>
  <button id="mask" disabled={hold || true}>Masking constant control</button>
  <button id="mask-negated" disabled={!(false && false)}>Negated masking true control</button>
  <button id="mask-negated-false" disabled={!(true || true)}>Negated masking false control</button>
  <p>Direct: <span id="direct">{name}</span></p>
  <p>Forwarded: <Forward id="forwarded" text={declared}/></p>
  <p>Overridden: <Forward id="overridden" text={declared} {...{text:effective}}/></p>
 </section>;
}
createRoot(document.getElementById('root')).render(<App/>);
