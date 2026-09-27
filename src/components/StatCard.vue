<script setup>
const props = defineProps({
  value: { type: [String, Number], required: true },
  label: { type: String, required: true },
  hint: { type: String, default: '' }
})
</script>

<template>
  <div class="card p-5 text-center">
    <div class="text-3xl font-extrabold tracking-tight text-brand-600">{{ props.value }}</div>
    <div class="mt-1 text-sm font-medium text-ink-800">{{ props.label }}</div>
    <p v-if="props.hint" class="mt-1 text-xs text-ink-400">{{ props.hint }}</p>
  </div>
</template>
