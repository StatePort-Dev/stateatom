<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { calculateEligibility, selectAllowance } from '../shared/logic';
import { semanticCheck } from '../shared/semantics';
import { cache } from '../shared/cache';
import Row from './Row.vue';
const data = ref<any>(null);
const permission = ref<any>(null);
const race = ref<any>(null);
const form = ref('');
onMounted(async () => {
  const account = await (await fetch('/api/account')).json();
  const access = await (await fetch('/api/permission')).json();
  await (await fetch('/api/noise')).json();
  cache.setQueryData(['account'],account);
  data.value=account;permission.value=access;
  const [slow,fast]=await Promise.all([fetch('/api/race').then(r=>r.json()),fetch('/api/race').then(r=>r.json())]);
  race.value=fast;
});
const shown = computed(() => { if(!data.value)return 0; const {rules:{quota: allowance}}=data.value;return allowance+1; });
const eligible = computed(() => data.value ? calculateEligibility(data.value) : false);
const cached = computed(() => data.value ? selectAllowance(cache.getQueryData(['account'])) : 0);
const creditHold = computed(() => data.value?.risk.hold);
const canConfirm = computed(() => permission.value?.access.ready);
const opaque = computed(() => data.value ? structuredClone(JSON.parse(JSON.stringify(data.value))) : null);
</script>
<template><main v-if="data && permission && race"><h1>StateAtom Vue + TS</h1>
<p id="p1">{{ shown }}</p>
<button id="p2" :disabled="!eligible">Confirm transformed</button>
<p id="p3">{{ cached }}</p>
<button id="p4" :disabled="creditHold || !canConfirm">Confirm combined</button>
<label>Name <input id="form" v-model="form" /></label>
<button id="p5" :disabled="form.length < 3">Local validation</button>
<p id="p6">{{ race.amount }}</p>
<p id="opaque">{{ opaque.rules.quota }}</p>
<p id="semantics">{{ semanticCheck() }}</p>
<Row :row="data"/><Row :row="{rules:{quota:77}}"/>
</main><p v-else>Loading</p></template>
