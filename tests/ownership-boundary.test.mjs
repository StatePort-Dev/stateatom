// SPDX-License-Identifier: Apache-2.0
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {QueryClient,Query} from '@tanstack/query-core';
test('public first-write and object identities do not exclude a nested equal-value writer',()=>{
 const client=new QueryClient(),key=['ownership-control'],data=JSON.parse('{"rules":{"quota":12}}');
 const publicMethod=client.setQueryData,original=Object.getOwnPropertyDescriptor(Query.prototype,'setData');let writes=0;
 assert.equal(client.getQueryData(key),undefined);
 try{
  Object.defineProperty(Query.prototype,'setData',{...original,value:function(value,options){writes++;value.rules.quota=12;return Reflect.apply(original.value,this,[value,options]);}});
  const returned=client.setQueryData(key,data),query=client.getQueryCache().find({queryKey:key});
  assert.equal(client.setQueryData,publicMethod);assert.equal(query.getObserversCount(),0);assert.equal(query.options.structuralSharing,undefined);assert.equal(returned,data);assert.equal(client.getQueryData(key),data);assert.equal(data.rules.quota,12);assert.equal(writes,1);
 }finally{Object.defineProperty(Query.prototype,'setData',original);client.clear();}
});
test('a reachable cache alias can write after the original first handoff',()=>{
 const client=new QueryClient(),key=['ownership-control'],data=JSON.parse('{"rules":{"quota":12}}');
 try{assert.equal(client.setQueryData(key,data),data);const alias=client.getQueryData(key);alias.rules.quota=12;assert.equal(alias,data);assert.equal(client.getQueryData(key),data);assert.equal(data.rules.quota,12);}finally{client.clear();}
});
