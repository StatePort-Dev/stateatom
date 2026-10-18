// SPDX-License-Identifier: Apache-2.0
// Synthetic React 18 action controls; not real application coverage.
import React, {useCallback, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {useOrders} from './action-hooks';
(window as any).actionInvocations = 0;
function save() { (window as any).actionInvocations++; }
function useUnrelated() { return 42; }
function Row({id}: {id: string}) {
 const {confirmOrder} = useOrders();
 const memoSave = useCallback(() => save(), []);
 useUnrelated();
 return <section>
  <button id={'direct-'+id} onClick={save}>Direct {id}</button>
  <button id={'inline-'+id} onClick={() => save()}>Inline {id}</button>
  <button id={'hook-'+id} disabled={true} onClick={confirmOrder}>Confirm {id}</button>
  <button id={'memo-'+id} onClick={memoSave}>Memo {id}</button>
  <button id={'factory-'+id} onClick={factory(save)}>Factory {id}</button>
  <button id={'prop-'+id} onClick={(window as any).unknownHandler}>Unknown {id}</button>
 </section>;
}
function factory(callback: () => void) { return () => callback(); }
function App() {
 useEffect(() => {
  const element = document.getElementById('native-action')!;
  const native = () => { (window as any).actionInvocations++; };
  element.addEventListener('click', native, {once:true});
  document.addEventListener('keydown', native, {capture:true});
  return () => { element.removeEventListener('click', native); document.removeEventListener('keydown', native, {capture:true}); };
 }, []);
 return <main><h1>Action Inspector controls</h1><Row id="one"/><Row id="two"/></main>;
}
createRoot(document.getElementById('root')!).render(<App/>);
