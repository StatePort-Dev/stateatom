// SPDX-License-Identifier: Apache-2.0
// Synthetic React 18 action controls; not real application coverage.
import React, {useCallback, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {useOrders} from './action-hooks';
(window as any).actionInvocations = 0;
(window as any).actionGetterReads = 0;
function save() { (window as any).actionInvocations++; }
function useUnrelated() { return 42; }
function Row({id}: {id: string}) {
 const {confirmOrder} = useOrders();
 const memoSave = useCallback(() => save(), []);
 const objectActions = {save() { (window as any).actionInvocations++; }};
 const dataActions = {save:memoSave};
 const anonymousActions = {save:() => { (window as any).actionInvocations++; }};
 const getterActions = {get save() { (window as any).actionGetterReads++; return save; }};
 const mutableActions = {save};
 mutableActions.save = save;
 const escapedActions = {save};
 const escapedAlias = escapedActions;
 void escapedAlias;
 useUnrelated();
 return <section>
  <button id={'direct-'+id} onClick={save}>Direct {id}</button>
  <button id={'inline-'+id} onClick={() => save()}>Inline {id}</button>
  <button id={'hook-'+id} disabled={true} onClick={confirmOrder}>Confirm {id}</button>
  <button id={'memo-'+id} onClick={memoSave}>Memo {id}</button>
  <button id={'factory-'+id} onClick={factory(save)}>Factory {id}</button>
  <button id={'prop-'+id} onClick={(window as any).unknownHandler}>Unknown {id}</button>
  <button id={'object-method-'+id} disabled={id==='two'} onClick={objectActions.save}>Object method {id}</button>
  <button id={'object-data-'+id} onClick={dataActions.save}>Object data {id}</button>
  <button id={'object-anonymous-'+id} onClick={anonymousActions.save}>Anonymous object {id}</button>
  <button id={'object-getter-'+id} onClick={getterActions.save}>Object getter {id}</button>
  <button id={'object-mutable-'+id} onClick={mutableActions.save}>Mutable object {id}</button>
  <button id={'object-escape-'+id} onClick={escapedActions.save}>Escaped object {id}</button>
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
