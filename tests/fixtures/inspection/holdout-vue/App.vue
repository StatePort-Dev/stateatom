<script setup lang="ts">
import{shallowRef,computed,onMounted}from'vue';import{takePermissions as classify}from'./format/bounds';
const details=shallowRef<any>(null);onMounted(async()=>{details.value=await(await fetch('/api/account')).json()});
const result=computed(()=>details.value?classify(details.value):'held');
</script>
<template><button v-if="details" id="holdout" :disabled="result !== 'ready'">Holdout Vue</button><p v-else>Loading</p></template>
