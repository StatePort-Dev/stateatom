// SPDX-License-Identifier: Apache-2.0
// Unsupported paths and bounded retention are synthetic controls, not feature claims.
import React from 'react';
import {createPortal} from 'react-dom';
import {createRoot,hydrateRoot} from 'react-dom/client';
class Witness extends HTMLElement {connectedCallback(){(window as any).customConnected=true;}}
customElements.define('host-witness',Witness);
function Portals(){return <main><span id="nonportal-value">{12}</span>{createPortal(<span id="portal-value">{12}</span>,document.getElementById('portal-destination')!)}</main>;}
function Custom(){return <main><host-witness/><span id="custom-value">{12}</span></main>;}
function Hydrated(){return <span id="hydrated-value">{12}</span>;}
function Nodes(){const nodes=[];for(let i=0;i<280;i++)nodes.push(<span key={i} id={'node-'+i}>{i}</span>);return <main>{nodes}</main>;}
function Fibers(){const nodes=[];for(let i=0;i<540;i++)nodes.push(<span key={i} id={'fiber-'+i}>{i}</span>);return <main>{nodes}</main>;}
createRoot(document.getElementById('portal-root')!).render(<Portals/>);
createRoot(document.getElementById('custom-root')!).render(<Custom/>);
hydrateRoot(document.getElementById('hydrated')!,<Hydrated/>);
(window as any).mountNodeBudget=()=>createRoot(document.getElementById('nodes-root')!).render(<Nodes/>);
(window as any).mountFiberBudget=()=>createRoot(document.getElementById('fibers-root')!).render(<Fibers/>);
