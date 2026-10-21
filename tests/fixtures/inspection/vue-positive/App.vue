<script setup lang="ts">
import {ref,computed} from 'vue';
import {useRoute,RouterLink} from 'vue-router';
import Row from './Row.vue';
import {useCounter as useActions} from './use-actions';
const count=ref(7);
const scaled=computed(()=>count.value*3);
const route=useRoute();
const routeBlocked=computed(()=>route.name !== 'active');
const {submit}=useActions(count);
const swapped=ref(false);
function ordinary(){(window as any).vueInvocations++;count.value++;(window as any).vueSchedule.push('handler');Promise.resolve().then(()=>(window as any).vueSchedule.push('after-handler'));}
function alternative(){(window as any).vueAlternativeInvocations++;}
const callback=computed(()=>swapped.value?alternative:ordinary);
function replaceHandler(){swapped.value=!swapped.value;}
function semantics(){const target={base:2,get value(){(window as any).vueGetterReads++;return this.base}};let skipped=0;try{throw (window as any).vueError}catch(e){return JSON.stringify({value:true?target.value:(skipped++,0),same:e===(window as any).vueError,skipped});}}
</script>
<template><main>
<h1>Vue source and library controls</h1>
<p id="direct">{{ count }}</p><p id="computed">{{ scaled }}</p>
<button id="condition" :disabled="scaled < 25" @click="ordinary">Condition</button>
<button id="method" @click="ordinary">Advance</button><button id="composable" @click="submit">Add two</button>
<RouterLink id="route-active" to="/active">Active route</RouterLink><RouterLink id="route-all" to="/">All route</RouterLink>
<button id="library" :disabled="routeBlocked">Router condition</button>
<Row name="first" :start="2"/><Row name="second" :start="5"/>
<button id="replace-handler" @click="replaceHandler">Replace callback</button><button id="replaced" @click="callback">Current callback</button>
<p id="semantics">{{ semantics() }}</p>
</main></template>
