// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
import {listFunctionRanges,listFunctionCounts} from './helpers/list-function-counts.mjs';
test('semantic counter maps named source roles to actual function ranges and refuses ambiguous or missing range evidence',()=>{
 const ranges=listFunctionRanges('function Scene(){}; const reduce=(a)=>a; const Row=memo(function Internal(){});',{Scene:'root',reduce:'writer',Row:'row'});
 assert.deepEqual(Object.keys(ranges),['root','writer','row']);
 const coverage={result:[{url:'http://local/bundle.js',functions:Object.values(ranges).map(r=>({ranges:[{startOffset:r.start,endOffset:r.end,count:2}]}))}]};
 assert.deepEqual(listFunctionCounts(coverage,'http://local/bundle.js',ranges),{root:2,writer:2,row:2});
 assert.throws(()=>listFunctionCounts(coverage,'other',ranges));
 coverage.result[0].functions[0].ranges[0].startOffset++;
 assert.throws(()=>listFunctionCounts(coverage,'http://local/bundle.js',ranges),/Exact native function/);
 assert.throws(()=>listFunctionRanges('const a=()=>1; function b(){}',{a:'same',b:'same'}),/Ambiguous/);
});

test('only first-load zero-count parent proves a not-yet-created nested callback has no invocations',()=>{
 const ranges=listFunctionRanges('function Item(){ const toggle=()=>1; return toggle; }',{Item:'row',toggle:'toggle'});
 const parent={startOffset:ranges.row.start,endOffset:ranges.row.end,count:0},coverage={result:[{url:'bundle',functions:[{ranges:[parent]}]}]};
 assert.throws(()=>listFunctionCounts(coverage,'bundle',ranges),/Exact native function/);
 assert.deepEqual(listFunctionCounts(coverage,'bundle',ranges,{initial:true}),{row:0,toggle:0});
 parent.count=1;assert.throws(()=>listFunctionCounts(coverage,'bundle',ranges,{initial:true}),/Exact native function/);
 parent.count=0;coverage.result[0].functions=[];assert.throws(()=>listFunctionCounts(coverage,'bundle',ranges,{initial:true}),/Exact native function/);
});
