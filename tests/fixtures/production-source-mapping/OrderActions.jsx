// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import {createRoot} from 'react-dom/client';
function OrderActions(){
 const creditHold=true,canConfirm=false;
 return <main><h1>Release inspection fixture</h1><button id="confirm" disabled={creditHold || !canConfirm}>Confirm</button><p id="label">Synthetic order</p></main>;
}
createRoot(document.getElementById('root')).render(<OrderActions/>);
