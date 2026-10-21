// SPDX-License-Identifier: Apache-2.0
// Separate product source-view fixture; preserves the earlier finite carrier probe.
import React from 'react';import {createRoot} from 'react-dom/client';import {flushSync} from 'react-dom';
window.probeCounts={first:0,second:0,capture:0,getter:0,traps:0};
function firstHandler() { window.probeCounts.first++; window.lastProbeAction='FIRST_REACT_HANDLER_PRIVATE'; }
function secondHandler() { window.probeCounts.second++; window.lastProbeAction='SECOND_REACT_HANDLER_PRIVATE'; }
function captureHandler() { window.probeCounts.capture++; window.lastProbeAction='CAPTURE_REACT_HANDLER_PRIVATE'; }
function makeHandler(key) { return function sameSourceHandler() { window.probeCounts[key]++; }; }
const mode=document.body.dataset.mode,root=createRoot(document.getElementById('root'));
function render(second=false){const one=mode==='same-source'?makeHandler('first'):mode==='bound'?firstHandler.bind(null):second?secondHandler:firstHandler,two=mode==='same-source'?makeHandler('second'):secondHandler;flushSync(()=>root.render(React.createElement('div',null,React.createElement('button',{id:'first',onClick:second===null?null:one,...(mode==='capture'?{onClickCapture:captureHandler}:{})},'Confirm'),React.createElement('button',{id:'second',onClick:two},'Confirm'))));}
render();window.fixtureControls={second(){render(true);},remove(){render(null);},replaceNode(){const n=document.getElementById('first');n.replaceWith(n.cloneNode(true));}};
const node=document.getElementById('first'),keys=Object.keys(node),propsKey=keys.find(k=>k.startsWith('__reactProps$')),fiberKey=keys.find(k=>k.startsWith('__reactFiber$')),props=node[propsKey];
if(mode==='getter-slot')Object.defineProperty(node,propsKey,{configurable:true,get(){window.probeCounts.getter++;return props;}});
if(mode==='getter-handler'){const next={...props};Object.defineProperty(next,'onClick',{get(){window.probeCounts.getter++;return firstHandler;}});node[propsKey]=next;}
const traps={get(t,k,r){window.probeCounts.traps++;return Reflect.get(t,k,r);},ownKeys(t){window.probeCounts.traps++;return Reflect.ownKeys(t);},getOwnPropertyDescriptor(t,k){window.probeCounts.traps++;return Reflect.getOwnPropertyDescriptor(t,k);},apply(t,s,a){window.probeCounts.traps++;return Reflect.apply(t,s,a);}};
if(mode==='proxy-props')node[propsKey]=new Proxy(props,traps);
if(mode==='proxy-function')node[propsKey]={...props,onClick:new Proxy(firstHandler,traps)};
if(mode==='duplicate')node.__reactProps$other=props;
if(mode==='wrong-host')node[fiberKey]={...node[fiberKey],stateNode:document.getElementById('second')};
