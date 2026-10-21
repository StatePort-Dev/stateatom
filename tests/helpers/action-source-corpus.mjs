// SPDX-License-Identifier: Apache-2.0
// Explicit finite parity inputs retained before extracting the Node resolver.
export const actionSourceCorpus=[
 {id:'lexical',text:'function save(){}export function View(){return <button onClick={save}/>}'},
 {id:'inline',text:'const save=()=>42;export const View=()=> <button onClick={()=>save(1)}/>'},
 {id:'factory',text:'function valid(){}export const View=()=> <button onClick={factory(valid)}/>'},
 {id:'mutable',text:'let save=()=>42;save=other;export const View=()=> <button onClick={save}/>'},
 {id:'getter',text:'const actions={get save(){throw Error("never")}};export const View=()=> <button onClick={actions.save}/>'},
 {id:'member',text:'const actions={save(){return 42}};export const View=()=> <button onClick={actions.save}/>'},
 {id:'forwarded',text:'function Button({press}){return <button onClick={press}/>}function save(){}export const View=()=> <Button press={save}/>'},
 {id:'multiple',text:'function Button({press}){return <button onClick={press}/>}function save(){}export const View=()=> <><Button press={save}/><Button press={save}/></>'},
 {id:'hook',text:"import {useCallback as memo} from 'react';export function View(){const save=memo(()=>42,[]);return <button onClick={save}/>}",},
 {id:'import',text:"import {save} from './helper';export const View=()=> <button onClick={save}/>",extra:[{file:'src/helper.ts',text:'export function save(){return 42}'}]},
 {id:'custom-hook',text:"import {useWork} from './helper';export function View(){const {save}=useWork();return <button onClick={save}/>}",extra:[{file:'src/helper.ts',text:'export function useWork(){const save=()=>42;return {save}}'}]},
 {id:'vue',file:'src/View.vue',text:'<script setup>\nfunction save(){return 42}\n</script>\n<template><button @click="save">Save</button></template>',line:4,column:11}
];
