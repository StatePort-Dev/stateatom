// SPDX-License-Identifier: Apache-2.0
// Separate P02 fixture; the original P01 source-analysis fixture is preserved.
import React from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {perform} from './SourceAnalysisHelper.js';
const variant=APP_VARIANT;
window.sourceWorkerCounts??={a:0,b:0,c:0,inline:0,sourceurl:0,sourceEffect:0};
function selectedHandler(event){
 const description='FUNCTION_SOURCE_CONTEXT_PRIVATE';
 return perform(variant,event.currentTarget.id);
}
flushSync(()=>createRoot(document.getElementById('root-'+variant)).render(React.createElement('button',{id:'bundle-'+variant,onClick:selectedHandler},'Confirm')));
const native=document.createElement('button');native.id='native-'+variant;native.textContent='Native Confirm';native.addEventListener('click',selectedHandler);document.body.append(native);
