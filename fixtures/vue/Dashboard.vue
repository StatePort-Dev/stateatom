<script setup>
import {ref,onMounted} from 'vue';
import Greeting from './Greeting.vue';
import {loadAccount,loadCounter,noise,addShadows} from '../common.js';
const data=ref(null),counter=ref(null),local=ref(0);
onMounted(async()=>{data.value=await loadAccount();counter.value=await loadCounter();noise();addShadows();});
async function refresh(){counter.value=await loadCounter(true);}
function increment(){local.value++;noise();}
</script>
<template>
<main v-if="data && counter"><h1>Account</h1>
<p id="plan"><span>{{ data.profile.plan }}</span></p>
<p id="total">Total ${{ (data.invoice.cents/100).toFixed(2) }}</p>
<p id="feature">{{ data.flags.enabled ? 'Enabled' : 'Disabled' }}</p>
<Greeting :name="data.profile.name"/>
<p id="async">Count {{ counter.value }}</p><button id="refresh" @click="refresh">Refresh</button>
<p id="local">Local {{ local }}</p><button id="increment" @click="increment">Increment</button>
<p id="branch">{{ false ? data.hidden.label : 'Visible' }}</p>
</main>
</template>
