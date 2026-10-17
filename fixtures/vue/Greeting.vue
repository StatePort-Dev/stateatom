<script setup>
import {ref} from 'vue';const props=defineProps({name:String});const saved=ref(props.name);
</script>
<template><p id="forwarded">Hello {{ saved }}</p></template>
