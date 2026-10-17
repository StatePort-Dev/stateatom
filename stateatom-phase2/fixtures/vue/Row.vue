<script setup lang="ts">
const props = defineProps<{row:any}>();
</script>
<template><span class="row">{{ props.row.rules.quota }}</span></template>
