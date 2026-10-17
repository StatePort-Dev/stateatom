import React,{useState,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {loadAccount,loadCounter,noise,addShadows} from '../common.js';
function Greeting({name}){const [saved]=useState(name);return <p id="forwarded">Hello {saved}</p>;}
function Dashboard(){
 const [data,setData]=useState(null),[counter,setCounter]=useState(null),[local,setLocal]=useState(0);
 useEffect(()=>{loadAccount().then(setData);loadCounter().then(setCounter);noise();addShadows();},[]);
 if(!data||!counter)return <p>Loading</p>;
 return <main><h1>Account</h1>
  <p id="plan"><span>{data.profile.plan}</span></p>
  <p id="total">Total ${(data.invoice.cents/100).toFixed(2)}</p>
  <p id="feature">{data.flags.enabled?'Enabled':'Disabled'}</p>
  <Greeting name={data.profile.name}/>
  <p id="async">Count {counter.value}</p><button id="refresh" onClick={()=>loadCounter(true).then(setCounter)}>Refresh</button>
  <p id="local">Local {local}</p><button id="increment" onClick={()=>{setLocal(local+1);noise();}}>Increment</button>
  <p id="branch">{false?data.hidden.label:'Visible'}</p>
 </main>;
}
createRoot(document.getElementById('root')).render(<Dashboard/>);
