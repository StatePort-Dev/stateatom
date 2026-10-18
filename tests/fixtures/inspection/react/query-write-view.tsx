// SPDX-License-Identifier: Apache-2.0
import React,{useState,useEffect} from 'react';import {createRoot} from 'react-dom/client';import {QueryClient} from '@tanstack/query-core';
const counts={calls:0},client=new QueryClient({defaultOptions:{queries:{gcTime:Infinity,retry:false,queryFn:()=>{counts.calls++;return 7}}}});
function App(){
 const [data,setData]=useState<any>(null);
 const [tick,setTick]=useState(0);
 useEffect(()=>{void(async()=>{const value=await(await fetch('/api/query-write-options')).json();setData(value)})();window.queryWriteCounts=()=>({...counts})},[]);
 if(!data)return <p>Loading</p>;
 async function change(){await client.fetchInfiniteQuery(data.rules);setTick(value=>value+1)}
 return <main><h1>Native Query option access</h1><p id="query-options-quota">{data.rules.quota}</p><p id="query-options-tick">{tick}</p><button id="query-options-change" onClick={()=>void change()}>Run original Query option write</button></main>;
}
createRoot(document.getElementById('root')).render(<App/>);
