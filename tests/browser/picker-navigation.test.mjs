import test from 'node:test';
import assert from 'node:assert/strict';
import {createPickerNavigationClient} from '../../browser-extension/picker-navigation.mjs';
const deferred=()=>{let resolve;return{promise:new Promise(r=>resolve=r),resolve};};
function fixture(){
 const calls=[],updates=[],pages=new Map([[1,{id:1,windowId:10,active:false}],[9,{id:9,windowId:10,active:true}],[3,{id:3,windowId:10,active:false}]]);
 let reply,closed=false;
 const client={request:async(m,o)=>{calls.push(m);return reply?reply(m,o):m.op==='pick'?{id:m.pickerId,status:'picking'}:{};},subscribe:()=>()=>{},subscribeConnection:()=>()=>{},dispose(){closed=true;}};
 const chrome={tabs:{get:async id=>({...pages.get(id)}),update:async(id,patch)=>{updates.push({id,...patch});for(const p of pages.values())p.active=p.id===id;return{...pages.get(id)};}},windows:{get:async()=>({focused:true}),update:async()=>{}}};
 const view=createPickerNavigationClient(client,chrome,9);
 return{calls,updates,pages,view,setReply(fn){reply=fn;},closed:()=>closed};
}
const pick={op:'pick',tabId:1,pickerId:'own'};
const selected={picker:{id:'own',status:'selected'},selection:{selector:'#confirm'},analysis:{}};
test('one picker gesture shows the target and its completed current state returns to the inspector',async()=>{
 const f=fixture();await f.view.request(pick);assert.deepEqual(f.updates,[{id:1,active:true}]);f.setReply(()=>selected);assert.equal(await f.view.request({op:'state',tabId:1}),selected);assert.deepEqual(f.updates,[{id:1,active:true},{id:9,active:true}]);await f.view.request({op:'state',tabId:1});assert.equal(f.updates.length,2);f.view.dispose();
});
test('no activation before native picker readiness, or after a rejected picker start',async()=>{
 const f=fixture(),gate=deferred();f.setReply(()=>gate.promise);const starting=f.view.request(pick);assert.equal(f.updates.length,0);gate.resolve(Promise.reject(Error('Debugger resource busy')));await assert.rejects(starting,/busy/);assert.equal(f.updates.length,0);f.view.dispose();
});
test('a user switching to another tab prevents a late result from stealing focus',async()=>{
 const f=fixture();await f.view.request(pick);f.pages.get(1).active=false;f.pages.get(3).active=true;f.setReply(()=>selected);await f.view.request({op:'state',tabId:1});assert.deepEqual(f.updates,[{id:1,active:true}]);f.view.dispose();
});
test('an unrelated picker state cannot return this inspector to the front',async()=>{
 const f=fixture();await f.view.request(pick);f.setReply(()=>({...selected,picker:{id:'foreign',status:'selected'}}));await f.view.request({op:'state',tabId:1});assert.equal(f.updates.length,1);f.view.dispose();
});
test('context cancellation while preparation waits prevents late activation',async()=>{
 const f=fixture(),gate=deferred(),controller=new AbortController();f.setReply(()=>gate.promise);const starting=f.view.request(pick,{signal:controller.signal});controller.abort();gate.resolve({id:'own',status:'picking'});await starting;assert.equal(f.updates.length,0);f.view.dispose();
});
test('page Escape or native failure returns to the inspector once, without a new inspection',async()=>{
 for(const status of ['cancelled','unsupported']){const f=fixture();await f.view.request(pick);f.setReply(()=>({picker:{id:'own',status}}));await f.view.request({op:'state',tabId:1});assert.deepEqual(f.updates,[{id:1,active:true},{id:9,active:true}]);assert.deepEqual(f.calls.map(x=>x.op),['pick','state']);f.view.dispose();}
});
test('switching away during native startup prevents opening the target late',async()=>{
 const f=fixture(),gate=deferred();f.setReply(()=>gate.promise);const starting=f.view.request(pick);f.pages.get(9).active=false;f.pages.get(3).active=true;gate.resolve({id:'own',status:'picking'});await starting;assert.equal(f.updates.length,0);f.view.dispose();
});
test('disposal while native startup waits prevents all navigation',async()=>{
 const f=fixture(),gate=deferred();f.setReply(()=>gate.promise);const starting=f.view.request(pick);f.view.dispose();gate.resolve({id:'own',status:'picking'});await starting;assert.equal(f.updates.length,0);assert.equal(f.closed(),true);
});
