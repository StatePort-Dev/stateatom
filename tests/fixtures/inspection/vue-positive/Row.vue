<script setup lang="ts">
import {ref,computed} from 'vue';
import {useCounter} from './use-actions';
const props=defineProps<{name:string,start:number}>();
const count=ref(props.start);
const shown=computed(()=>count.value*2);
const blocked=computed(()=>count.value<4);
const {submit}=useCounter(count);
</script>
<template><section>
<p :id="'row-value-'+props.name">{{ shown }}</p>
<button :id="'row-'+props.name" :disabled="blocked" @click="submit">Row action</button>
</section></template>
