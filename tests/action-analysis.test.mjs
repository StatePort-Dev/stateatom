// SPDX-License-Identifier: Apache-2.0
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {analyzeSources,digest} from '../core/analyzer.mjs';
const file='src/Actions.tsx',identity={run:'run-1',build:'build-1',freshness:'instrumented-source-digest'};
function inspect(text,extra=[],selection={}){return analyzeSources([{file,text},...extra],{tag:'button',marker:`${file}:1:${digest(text).slice(0,12)}`,markerOnSelected:true,tabId:7,instance:'one',...selection},[],identity);}
test('exact native JSX binding links a lexical function with its own evidence and digest',()=>{
 const a=inspect('function save() {} function View(){return <button onClick={save}>Save</button>}');
 assert.equal(a.actionBindings?.length,1);const b=a.actionBindings[0];assert.equal(b.event,'click');assert.equal(b.binding.expression,'save');assert.equal(b.entry.symbol,'save');assert.equal(b.entry.source.column,10);assert.equal(b.entry.source.sourceDigest,digest('function save() {} function View(){return <button onClick={save}>Save</button>}'));assert.equal(b.execution.status,'not-observed');for(const id of b.entry.evidenceIds)assert(a.graph.edges.some(e=>e.id===id&&e.status==='Code-linked'));
});
test('inline callback keeps call as possible and never observed',()=>{const a=inspect('const save=()=>{};const View=()=> <button onClick={() => save(42)}/>');const b=a.actionBindings?.[0];assert.equal(b?.kind,'inline');assert.equal(b.calls[0].symbol,'save');assert.equal(b.calls[0].status,'Candidate');assert.equal(b.calls[0].source.file,file);assert.equal(b.execution.status,'not-observed');});
test('factory arguments do not become click callees',()=>{const a=inspect('function valid(){} function View(){return <button onClick={handleSubmit(valid)}/>}');const b=a.actionBindings?.[0];assert.equal(b?.kind,'factory');assert.equal(b.entry.status,'Unknown/Unsupported');assert.deepEqual(b.calls,[]);});
test('prop callbacks remain upstream unknown and member getter is never resolved',()=>{const a=inspect('function View(props){return <button onClick={props.save}/>}');assert.equal(a.actionBindings?.[0]?.entry.status,'Unknown/Unsupported');assert.match(a.actionBindings[0].entry.reason,/member|prop/i);});
test('conditional binding preserves both candidates',()=>{const a=inspect('function save(){} function cancel(){} function View({ok}){return <button onClick={ok ? save : cancel}/>}');assert.equal(a.actionBindings?.[0]?.kind,'alternatives');assert.deepEqual(a.actionBindings[0].calls.map(c=>c.symbol),['save','cancel']);assert(a.actionBindings[0].calls.every(c=>c.status==='Candidate'));});
test('same-line identical siblings cannot borrow another binding; column disambiguates',()=>{const text='const View=()=> <div><button onClick={first}/><button onClick={second}/></div>';assert.deepEqual(inspect(text).actionBindings,[]);const a=inspect(text,[],{marker:`${file}:1:${digest(text).slice(0,12)}:${text.indexOf('<button onClick={second}')+1}`});assert.equal(a.actionBindings[0].binding.expression,'second');});
test('inherited markers, wrong native tag, wrong digest and composite props cannot assert a selected binding',()=>{const text='const View=()=> <Button onClick={save}/>';assert.deepEqual(inspect(text).actionBindings,[]);const native='const View=()=> <button onClick={save}/>';for(const selection of[{markerOnSelected:false},{tag:'span'},{marker:`${file}:1:deadbeef0000`}])assert.deepEqual(inspect(native,[],selection).actionBindings,[]);});
test('spread override and mutable lexical binding stay unknown',()=>{const a=inspect('let save=()=>{};save=other;function View(props){return <button onClick={save} {...props}/>}');assert.equal(a.actionBindings?.[0]?.entry.status,'Unknown/Unsupported');assert.match(a.actionBindings[0].entry.reason,/spread/i);const b=inspect('let save=()=>{};save=other;const View=()=> <button onClick={save}/>').actionBindings[0];assert.equal(b.entry.status,'Unknown/Unsupported');});
test('local shadow resolves the selected lexical scope',()=>{const a=inspect('function save(){} function View(){const save=()=>42;return <button onClick={save}/>}');assert.equal(a.actionBindings?.[0]?.entry.source.column,41);});
test('useCallback links only the callback supplying the selected binding',()=>{const a=inspect("import {useCallback as memo} from 'react';function View(){const save=memo(()=>42,[]);return <button onClick={save}/>}");const b=a.actionBindings?.[0];assert.equal(b?.hookRelations[0]?.relation,'creates-callback');assert.equal(b.hookRelations[0].hook,'useCallback');assert.equal(b.hookRelations[0].status,'Code-linked');});
test('custom hook object return is proven through same-project named import',()=>{const hook='export function useOrders(){const commit=()=>42;return {commit}}';const a=inspect("import {useOrders} from './useOrders';function View(){const {commit: confirm}=useOrders();return <button disabled onClick={confirm}/>}",[{file:'src/useOrders.ts',text:hook}]);const b=a.actionBindings?.[0];assert.equal(b?.entry.symbol,'commit');assert.equal(b.entry.source.file,'src/useOrders.ts');assert.equal(b.hookRelations[0].hook,'useOrders');assert.equal(b.hookRelations[0].relation,'returns-handler');assert.equal(b.execution.status,'not-observed');});
test('hook-shaped names, opaque imports, conditional returns and cycles stay unknown',()=>{for(const text of["import {useOrders} from 'library';function View(){const {save}=useOrders();return <button onClick={save}/>}",'function useOrders(){if(ok)return {save};return {save:other}}function View(){const {save}=useOrders();return <button onClick={save}/>}', 'const a=b,b=a;const View=()=> <button onClick={a}/>']){const b=inspect(text).actionBindings?.[0];assert.equal(b?.entry.status,'Unknown/Unsupported');assert.deepEqual(b.hookRelations,[]);}});
test('nested JSX handlers are not collected for selected ancestor and records/excerpts are bounded',()=>{const a=inspect('const View=()=> <button><span onClick={save}/></button>');assert.deepEqual(a.actionBindings,[]);const b=inspect('const View=()=> <button '+Array.from({length:30},(_,i)=>`onEvent${i}={save}`).join(' ')+'/>');assert(b.actionBindings.length<=12);});
test('property source selection honors exact marker even for a dynamic id',()=>{const a=inspect('function View({id}){return <button id={id} disabled={true} onClick={save}/>} ',[],{id:'dynamic-one'});assert.equal(a.sources.length,1);assert(a.sources[0].expressions.includes('true'));});
test('imported mutable export cannot be promoted to a resolved handler',()=>{const a=inspect("import {save} from './mutable';const View=()=> <button onClick={save}/>",[{file:'src/mutable.ts',text:'export let save=()=>{};save=other;'}]);assert.equal(a.actionBindings[0].entry.status,'Unknown/Unsupported');});
test('inline call from custom hook keeps its own hook return evidence',()=>{const a=inspect('function useWork(){const save=()=>{};return {save}}function View(){const {save}=useWork();return <button onClick={()=>save()}/>}');assert.equal(a.actionBindings[0].hookRelations[0]?.relation,'returns-handler');});
test('export aliases are not overwritten by unrelated exported declarations',()=>{const a=inspect("import {save} from './aliases';const View=()=> <button onClick={save}/>",[{file:'src/aliases.ts',text:'const save=()=>42; const hidden=()=>1; export {hidden as save}; export const other=1;'}]);assert.equal(a.actionBindings[0].entry.symbol,'hidden');assert.equal(a.actionBindings[0].entry.source.column,26);});
test('async and generator hook returns cannot be immediate callback output',()=>{for(const prefix of ['async function','function*']){const a=inspect(`${prefix} useActions(){const save=()=>42;return {save}}function View(){const {save}=useActions();return <button onClick={save}/>} `);assert.equal(a.actionBindings[0].entry.status,'Unknown/Unsupported');assert.deepEqual(a.actionBindings[0].hookRelations,[]);}});
test('local object method links the exact selected own declaration without claiming invocation',()=>{
 const text='function View(){const actions={save(){return 42},cancel(){return 0}};return <button onClick={actions.save}/>}';
 const a=inspect(text),b=a.actionBindings[0];assert.equal(b.binding.expression,'actions.save');assert.equal(b.entry.status,'Code-linked');assert.equal(b.entry.symbol,'save');assert.equal(b.entry.source.column,text.indexOf('save(){')+1);assert.equal(b.entry.source.sourceDigest,digest(text));assert.equal(b.execution.status,'not-observed');assert(a.graph.edges.some(e=>e.relation==='declared-object-method'&&e.status==='Code-linked'));assert(!b.calls.length);
});
test('object data callback reuses its lexical hook relation and exact source symbol',()=>{
 const text="import {useCallback} from 'react';function View(){const submit=useCallback(()=>42,[]);const actions={save:submit};return <button onClick={actions.save}/>}",a=inspect(text),b=a.actionBindings[0];
 assert.equal(b.entry.status,'Code-linked');assert.equal(b.entry.symbol,'submit');assert.equal(b.entry.source.column,text.indexOf('submit=')+1);assert.equal(b.hookRelations[0].relation,'creates-callback');assert(a.graph.edges.some(e=>e.relation==='object-data-handler'&&e.status==='Code-linked'));assert.equal(b.execution.status,'not-observed');
});
test('anonymous object data callback uses its expression location instead of an invented function name',()=>{
 const text='const actions={save:()=>42};export const View=()=> <button onClick={actions.save}/>',b=inspect(text).actionBindings[0];
 assert.equal(b.entry.status,'Code-linked');assert.equal(b.entry.symbol,null);assert.equal(b.entry.source.column,text.indexOf('()=>42')+1);assert.equal(b.binding.expression,'actions.save');assert.equal(b.execution.status,'not-observed');
});
test('same source method in two selected JSX occurrences keeps marker column and lexical object separate',()=>{
 const text='function View(){const left={save(){return 1}},right={save(){return 2}};return <><button onClick={left.save}/><button onClick={right.save}/></>}';
 const at=expression=>inspect(text,[],{marker:`${file}:1:${digest(text).slice(0,12)}:${text.indexOf('<button onClick={'+expression)+1}`,instance:expression}).actionBindings[0];
 const a=at('left.save'),b=at('right.save');assert.equal(a.entry.status,'Code-linked');assert.equal(b.entry.status,'Code-linked');assert.notEqual(a.entry.source.column,b.entry.source.column);assert.notEqual(a.identity.instance,b.identity.instance);assert.equal(a.entry.source.column,text.indexOf('save(){return 1}')+1);assert.equal(b.entry.source.column,text.indexOf('save(){return 2}')+1);
});
test('getter computed spread duplicate and prototype object declarations remain unknown without execution',()=>{
 for(const declaration of ['{get save(){throw new Error("never inspect")}}','{[key]:()=>42}','{...base,save(){}}','{save(){},save(){}}','{__proto__:base,save(){}}']){
  const b=inspect(`const actions=${declaration};export const View=()=> <button onClick={actions.save}/>`).actionBindings[0];assert.equal(b.entry.status,'Unknown/Unsupported',declaration);assert.match(b.entry.reason,/spread\/getter\/computed\/duplicate\/prototype/);assert.deepEqual(b.hookRelations,[]);assert.equal(b.execution.status,'not-observed');
 }
});
test('const receiver does not hide writes aliases escapes or unsupported member uses',()=>{
 for(const effect of ['actions.save=other;','delete actions.save;','actions.save++;','const alias=actions;','consume(actions);','const copy={...actions};','const result=actions.save;','actions.save();']){
  const b=inspect(`const actions={save(){}};${effect}export const View=()=> <button onClick={actions.save}/>`).actionBindings[0];assert.equal(b.entry.status,'Unknown/Unsupported',effect);assert.match(b.entry.reason,/write, escape or unsupported reference/);assert.equal(b.execution.status,'not-observed');
 }
 for(const text of ['let actions={save(){}};actions=other;const View=()=> <button onClick={actions.save}/>','function View(actions){return <button onClick={actions.save}/>}','const View=()=> <button onClick={external.save}/>','const actions={save(){}};const View=()=> <button onClick={actions["save"]}/>'])assert.equal(inspect(text).actionBindings[0].entry.status,'Unknown/Unsupported',text);
});
test('module exports global script bindings dynamic scope and declaration budgets retain boundaries',()=>{
 for(const [text,reason] of [
  ['export const actions={save(){}};const View=()=> <button onClick={actions.save}/>','Exported object'],
  ['const actions={save(){}};const View=()=> <button onClick={actions.save}/>','global script'],
  ['const actions={save(){}};export function View(){eval("anything");return <button onClick={actions.save}/>}','dynamic'],
  ['const actions={save(){}};export {actions};const View=()=> <button onClick={actions.save}/>','escape'],
  ['const actions={save(){},'+Array.from({length:64},(_,i)=>`key${i}:0`).join(',')+'};export const View=()=> <button onClick={actions.save}/>','budget']
 ]){const b=inspect(text).actionBindings[0];assert.equal(b.entry.status,'Unknown/Unsupported');assert(b.entry.reason.includes(reason),b.entry.reason);}
});
test('multiple direct JSX callback reads keep an unescaped object admissible while an override still refuses',()=>{
 const text='const actions={save(){}};export const View=()=> <><button onClick={actions.save}/><button onClick={actions.save} {...extra}/></>', first=text.indexOf('<button'),second=text.indexOf('<button',first+1);
 const a=inspect(text,[],{marker:`${file}:1:${digest(text).slice(0,12)}:${first+1}`}).actionBindings[0],b=inspect(text,[],{marker:`${file}:1:${digest(text).slice(0,12)}:${second+1}`}).actionBindings[0];assert.equal(a.entry.status,'Code-linked');assert.equal(b.entry.status,'Unknown/Unsupported');assert.match(b.entry.reason,/override/);
});
test('private component prop forwarding links source declarations while preserving missing runtime transfer',()=>{
 const text='function Button({onPress}){return <button onClick={onPress}/>}function save(){}export function View(){return <Button onPress={save}/>}';
 const a=inspect(text),b=a.actionBindings[0];assert.equal(b.entry.status,'Code-linked');assert.equal(b.entry.symbol,'save');assert.equal(b.binding.expression,'onPress');assert.equal(b.entry.source.column,text.indexOf('save()')+1);assert.match(b.entry.reason,/transfer.*not observed/i);assert.equal(b.execution.status,'not-observed');
 for(const relation of ['supplied-handler-prop','forwarded-handler-parameter'])assert(a.graph.edges.some(e=>e.relation===relation&&e.status==='Code-linked'));
});
test('aliased destructured and props-member callbacks resolve only the private static supply',()=>{
 for(const [parameter,expression] of [['{onPress: click}','click'],['props','props.onPress']]){
  const text=`function Button(${parameter}){return <button onClick={${expression}}/>}const save=()=>42;export const View=()=> <Button onPress={save}/>`,b=inspect(text).actionBindings[0];
  assert.equal(b.entry.status,'Code-linked');assert.equal(b.entry.symbol,'save');assert.equal(b.binding.expression,expression);assert.equal(b.entry.source.column,text.indexOf('save=')+1);assert.equal(b.execution.status,'not-observed');
 }
});
test('bounded wrapper chain keeps exact upstream useCallback relation without inventing prop observations',()=>{
 const text="import {useCallback as memo} from 'react';function Button({click}){return <button onClick={click}/>}function Wrapper({onPress: handler}){return <Button click={handler}/>}export function View(){const save=memo(()=>42,[]);return <Wrapper onPress={save}/>}",a=inspect(text),b=a.actionBindings[0];
 assert.equal(b.entry.status,'Code-linked');assert.equal(b.entry.symbol,'save');assert.deepEqual(b.hookRelations.map(h=>h.relation),['creates-callback']);assert.equal(a.graph.edges.filter(e=>e.relation==='supplied-handler-prop').length,2);assert(!a.graph.edges.some(e=>e.status==='Observed'));assert.equal(b.execution.status,'not-observed');
});
test('anonymous supplied callback keeps its actual expression range and no invented name',()=>{
 const text='function Button({onPress}){return <button onClick={onPress}/>}export const View=()=> <Button onPress={()=>42}/>',b=inspect(text).actionBindings[0];assert.equal(b.entry.status,'Code-linked');assert.equal(b.entry.symbol,null);assert.equal(b.entry.source.column,text.indexOf('()=>42')+1);assert.match(b.entry.reason,/not observed/);
});
test('multiple private JSX supplies remain unresolved even with equal callback source',()=>{
 for(const second of ['save','other']){const text=`function Button({onPress}){return <button onClick={onPress}/>}function save(){}function other(){}export function View(){return <><Button onPress={save}/><Button onPress={${second}}/></>}`,b=inspect(text).actionBindings[0];assert.equal(b.entry.status,'Unknown/Unsupported');assert.match(b.entry.reason,/multiple|ambiguous/i);assert.deepEqual(b.hookRelations,[]);}
});
test('forwarding refuses spread duplicate missing getter and factory supplies without evaluating them',()=>{
 for(const attrs of ['onPress={save} {...extra}','{...extra} onPress={save}','onPress={save} onPress={other}','other={save}','onPress={handlers.save}','onPress={factory(save)}']){
  const text=`const handlers={get save(){throw Error('never')}};function Button({onPress}){return <button onClick={onPress}/>}function save(){}export const View=()=> <Button ${attrs}/>`,b=inspect(text).actionBindings[0];assert.equal(b.entry.status,'Unknown/Unsupported',attrs);assert.equal(b.execution.status,'not-observed');
 }
});
test('exported escaped mutable dynamic or wrapper-built component callers stay unknown',()=>{
 for(const [declaration,extra] of [
  ['export function Button({onPress}){return <button onClick={onPress}/>}',''],
  ['function Button({onPress}){return <button onClick={onPress}/>}','consume(Button);'],
  ['function Button({onPress}){return <button onClick={onPress}/>}','Button=Other;'],
  ['function Button({onPress}){return <button onClick={onPress}/>}','const other=React.createElement(Button,{onPress:save});'],
  ['const Button=memo(function Inner({onPress}){return <button onClick={onPress}/>});','']
 ]){const b=inspect(`${declaration}function save(){}${extra}export const View=()=> <Button onPress={save}/>`).actionBindings[0];assert.equal(b.entry.status,'Unknown/Unsupported');assert.equal(b.execution.status,'not-observed');}
});
test('default rest computed nested parameters and writes/escapes cannot become forwarded callback identity',()=>{
 for(const [parameter,expression,extra] of [
  ['{onPress=other}','onPress',''],['{...props}','props.onPress',''],['{[name]:onPress}','onPress',''],['{actions:{onPress}}','onPress',''],['props={}','props.onPress',''],['{onPress: click,onPress: other}','click',''],
  ['{onPress}','onPress','onPress=other;'],['props','props.onPress','props.onPress=other;'],['props','props.onPress','consume(props);']
 ]){const b=inspect(`function Button(${parameter}){${extra}return <button onClick={${expression}}/>}function save(){}export const View=()=> <Button onPress={save}/>`).actionBindings[0];assert.equal(b.entry.status,'Unknown/Unsupported',parameter+extra);assert.equal(b.execution.status,'not-observed');}
});
test('prop cycles and native JSX overrides preserve explicit unknown source boundaries',()=>{
 const cyclic='function Button({onPress}){return <><button onClick={onPress}/><Button onPress={onPress}/></>}export const something=1;';assert.equal(inspect(cyclic).actionBindings[0].entry.status,'Unknown/Unsupported');
 const override='function Button({onPress}){return <button onClick={onPress} {...other}/>}function save(){}export const View=()=> <Button onPress={save}/>';assert.match(inspect(override).actionBindings[0].entry.reason,/override/);
});
test('a JSX element handed through clone factories stored values or composite children is not a unique prop supply',()=>{
 for(const body of ['return React.cloneElement(<Button onPress={save}/>,{onPress:other});','const node=<Button onPress={save}/>;return node;','return <Transform><Button onPress={save}/></Transform>;','return <Transform node={<Button onPress={save}/>}/>;']){
  const b=inspect(`function Button({onPress}){return <button onClick={onPress}/>}function save(){}function other(){}export function View(){${body}}`).actionBindings[0];assert.equal(b.entry.status,'Unknown/Unsupported',body);assert.match(b.entry.reason,/transform|supply|caller/i);
 }
});
