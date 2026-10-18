// SPDX-License-Identifier: Apache-2.0
// Bounded experimental syntax/checkpoint inventory, never an effect certificate.
import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import generatorModule from '@babel/generator';
import {createHash} from 'node:crypto';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule,hash=text=>createHash('sha256').update(text).digest('hex');
const unknown=reason=>({status:'Unknown/Unsupported',reason,readonlyEffects:'Unknown/Unsupported',fullPath:false});
function sourceIndex(source){
  if(typeof source!=='string'||source.length>1048576||Buffer.byteLength(source)>1048576)return{at:()=>unknown('Invalid or exceeded source budget')};
  // Keep native offsets and the full-source digest. A final inert map comment
  // supplies no source authority and is not decoded or used to remap locations.
  const marker=source.lastIndexOf('\n//# sourceMappingURL=data:application/json;base64,'),tail=marker>=0?source.slice(marker):'';
  const code=marker>=0&&/^\n\/\/# sourceMappingURL=data:application\/json;base64,[A-Za-z0-9+/]+={0,2}\n?$/.test(tail)?source.slice(0,marker):source;
  if(code.length>256000||Buffer.byteLength(code)>256000)return{at:()=>unknown('Invalid or exceeded source budget')};
  const paths=[],lineStarts=[0],lineEnds=[];
  for(let i=0;i<code.length;i++)if(/[\r\n\u2028\u2029]/.test(code[i])){lineEnds.push(i);if(code[i]==='\r'&&code[i+1]==='\n')i++;lineStarts.push(i+1);}lineEnds.push(code.length);
  let ast,steps=0;try{ast=parse(code,{sourceType:'unambiguous'});traverse(ast,{enter(){if(++steps>50000)throw Error('Source AST budget');},Function(p){paths.push(p);if(paths.length>1000)throw Error('Function index budget');}});}catch{return{at:()=>unknown('Source parse/index budget unavailable')};}
  const sourceDigest=hash(source);
  return{at(location){
    if(!location)return unknown('No direct JS location; builtin identity and effects are not established');
    const {lineNumber,columnNumber}=location;if(!Number.isSafeInteger(lineNumber)||!Number.isSafeInteger(columnNumber)||lineNumber<0||lineNumber>=lineStarts.length||columnNumber<0)return unknown('Invalid exact function header location');
    if(lineStarts[lineNumber]+columnNumber>lineEnds[lineNumber])return unknown('Invalid exact function header location');
    const offset=lineStarts[lineNumber]+columnNumber,matches=paths.filter(p=>p.node.start<=offset&&offset<=p.node.body.start);
    if(matches.length!==1)return unknown('Missing or ambiguous exact function header');
    const p=matches[0],syntax={calls:0,assignments:0,updates:0,memberExpressions:0,constructors:0,spreads:0,nestedFunctions:0};
    p.traverse({Function(q){syntax.nestedFunctions++;q.skip();},CallExpression(){syntax.calls++;},OptionalCallExpression(){syntax.calls++;},AssignmentExpression(){syntax.assignments++;},UpdateExpression(){syntax.updates++;},MemberExpression(){syntax.memberExpressions++;},OptionalMemberExpression(){syntax.memberExpressions++;},NewExpression(){syntax.constructors++;},SpreadElement(){syntax.spreads++;}});
    return{status:'Observed',sourceDigest,functionDigest:hash(source.slice(p.node.start,p.node.end)),range:{start:p.node.start,end:p.node.end},syntax,claim:'Exact checkpoint JS syntax facts only; writes may concern private telemetry and calls are not execution witnesses',readonlyEffects:'Unknown/Unsupported',fullPath:false};
  }};
}
export function functionEvidence(source,location){return sourceIndex(source).at(location);}
export async function effectFrontier({refs,cdp,member,binding,scripts,contexts}){
  const nodes=[],edges=[],handles=new Map(),indices=new Map();let sourceBytes=0,sourceRequests=0,sourceStop=null;
  const inventory={entry:Object.fromEntries(['nodeId','page','entrySequence','frameId','contextUniqueId','checkpoint'].map(key=>[key,binding[key]])),nodes,edges,complete:false,readonlyEffects:'Unknown/Unsupported',fullPath:false,claim:'Declared candidate captured-reference frontier at checkpoint, not a complete call graph or event-time closure/effect witness',gaps:['Native enclosing-scope slots are candidate references, not proof of lexical body-operand identity; local/parameter shadowing is not acquired.','Original receiver/key/metadata own-data and primitive premises at entry are not acquired.','Native/bound/opaque callable identity is not established by absence of JS location.','Unexpanded helper calls, implicit reads/coercions, bootstrap/closure history and alias-lifetime effects remain unknown.'],limits:{nodes:26,sourceFiles:8,sourceBytes:1048576,perSourceEnvelopeBytes:1048576,perSourceCodeBytes:256000},sourceBudgetPolicy:'Post-response UTF-8 stop; one offending protocol reply may exceed the byte threshold. Failed script attempts are cached; no subsequent source fetch after global overflow.'};
  async function source(scriptId){
    if(indices.has(scriptId))return indices.get(scriptId);
    if(sourceStop)return{at:()=>unknown(sourceStop)};
    if(indices.size>=8){sourceStop='Effect source-file budget';return{at:()=>unknown(sourceStop)};}
    // Count every attempt, including failed requests, and retain a denial so a
    // later reference to the same script cannot request it again.
    let index={at:()=>unknown('Effect source request unavailable')};indices.set(scriptId,index);
    try{
      refs.guard();sourceRequests++;
      const text=(await cdp.send('Debugger.getScriptSource',{scriptId})).scriptSource;refs.guard();
      if(typeof text!=='string')throw Error('Native source unavailable');
      sourceBytes+=Buffer.byteLength(text);
      if(sourceBytes>1048576){sourceStop='Effect source-byte budget exceeded after retrieval';throw Error(sourceStop);}
      index=sourceIndex(text);
    }catch(error){const reason=String(error.message);index={at:()=>unknown(reason)};}
    indices.set(scriptId,index);return index;
  }
  async function add(key,fn,parent,via){
    if(nodes.length>=26)throw Error('Effect frontier node budget');if(parent)edges.push({from:parent,to:key,via,executionAtThisSite:'Unknown/Unsupported'});
    const node={key,referenceStatus:'Unknown/Unsupported',evidence:unknown('Captured reference unavailable')};nodes.push(node);
    try{
      if(fn?.type!=='function'||fn.subtype==='proxy')throw Error('Ordinary function reference unavailable');
      const location=await refs.location(fn);node.referenceStatus='Observed';node.location=location;handles.set(key,fn);
      if(!location){node.evidence=unknown('No direct JS location; builtin identity and effects are not established');return;}
      const script=scripts.get(location.scriptId),context=contexts.get(script?.executionContextId);
      if(!context?.auxData?.isDefault||context.auxData.frameId!==binding.frameId||context.uniqueId!==binding.contextUniqueId)throw Error('Function source outside the bound checkpoint context');
      node.evidence=(await source(location.scriptId)).at(location);
    }catch(error){node.referenceStatus='Unknown/Unsupported';node.evidence=unknown(String(error.message));}
  }
  async function slots(fn,names){
    const result=new Map(),p=await refs.properties(fn),list=p.internalProperties?.find(v=>v.name==='[[Scopes]]')?.value;if(!list)throw Error('Native captured scopes unavailable');
    const scopes=(await refs.properties(list)).result.filter(p=>/^\d+$/.test(p.name));if(scopes.length>16)throw Error('Captured scope budget');
    for(const slot of scopes){if(slot.value?.subtype!=='internal#scope'||/^Global/.test(slot.value.description||''))continue;const values=await refs.properties(slot.value);for(const name of names)if(!result.has(name)&&values.result.some(p=>p.name===name))result.set(name,refs.data(values,name));if(result.size===names.length)break;}
    for(const name of names)if(!result.has(name))throw Error('Captured frontier slot unavailable: '+name);return result;
  }
  try{
    await add('member',member);
    if(!nodes[0].evidence.sourceDigest)throw Error('Entry source unavailable at checkpoint: '+nodes[0].evidence.reason);
    if(nodes[0].evidence.sourceDigest!==binding.callee.sourceDigest)throw Error('Entry body source changed since binding');
    const root=await slots(member,['object','mapRead','ownDescriptor','potentialObject','add','pointer','telemetryOps']);
    for(const key of['object','mapRead','ownDescriptor','potentialObject','add','pointer'])await add(key,root.get(key),'member','captured slot '+key);
    const ops=await refs.properties(root.get('telemetryOps'));
    for(const key of['weakGet','weakHas','string'])await add(key,refs.data(ops,key),'member','native enclosing scope slot telemetryOps, own data '+key);
    const local=await slots(root.get('add'),['primitive','feed','telemetryOps']),addOps=await refs.properties(local.get('telemetryOps'));
    for(const key of['dependencies','now','mapSet','mapSize','mapDelete','firstKey'])await add(key,refs.data(addOps,key),'add','native enclosing scope slot telemetryOps, own data '+key);
    for(const key of['primitive','feed'])await add(key,local.get(key),'add','captured slot '+key);
    await add('clock',(await slots(handles.get('now'),['clock'])).get('clock'),'now','captured clock');
    const deps=await slots(handles.get('dependencies'),['S','describe','append']);for(const key of['S','describe','append'])await add('dependencies.'+key,deps.get(key),'dependencies','captured slot '+key);
    const map=await slots(handles.get('mapSet'),['set','invoke']);for(const key of['set','invoke'])await add('mapSet.'+key,map.get(key),'mapSet','captured slot '+key);
    await add('potential.nativeWeakSetHas',(await slots(handles.get('potentialObject'),['nativeWeakSetHas'])).get('nativeWeakSetHas'),'potentialObject','captured WeakSet operation');
    // V8 exposes this for the declared bound-clock control. Never unwrap a proxy.
    const clock=handles.get('clock');if(clock){const target=(await refs.properties(clock)).internalProperties?.find(p=>p.name==='[[TargetFunction]]')?.value;if(target)await add('clock.boundTarget',target,'clock','native bound-target reference at checkpoint');}
    refs.guard();inventory.referenceStatus=nodes.every(n=>n.referenceStatus==='Observed')?'Observed':'Unknown/Unsupported';
  }catch(error){inventory.referenceStatus='Unknown/Unsupported';inventory.gaps.push(String(error.message));}
  finally{indices.clear();handles.clear();}
  inventory.sourceBytes=sourceBytes;inventory.sourceRequests=sourceRequests;inventory.sourceBudgetExceeded=!!sourceStop;return inventory;
}
export function helperWriterControl(source){
  const ast=parse(source,{sourceType:'module'}),matches=[];traverse(ast,{FunctionDeclaration(p){if(p.node.id?.name==='add'&&p.findParent(q=>q.isFunctionDeclaration()&&q.node.id?.name==='createObserver'))matches.push(p);}});
  if(matches.length!==1)throw Error('Expected exact add helper');
  matches[0].node.body.body.unshift(...parse('const __sa_effect_control=globalThis.__SA_DECLARED_CLOCK_STATE__;if(__sa_effect_control){__sa_effect_control.calls++;__sa_effect_control.data.quota=99;}',{sourceType:'module'}).program.body);
  return generate(ast,{comments:true}).code;
}
