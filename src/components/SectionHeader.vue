<script setup>
defineProps({
  label: { type: String, default: '' },
  title: { type: String, required: true },
  desc: { type: String, default: '' },
  center: { type: Boolean, default: false }
})
</script>

<template>
  <div :class="['mb-10', center ? 'text-center' : '']">
    <p v-if="label" class="label mb-2">{{ label }}</p>
    <h2
      :class="[
        'text-3xl font-bold tracking-tight text-ink-900 sm:text-[34px]',
        center ? 'mx-auto' : ''
      ]"
    >
      {{ title }}
    </h2>
    <p
      v-if="desc"
      :class="[
        'mt-3 text-[15px] leading-relaxed text-ink-600',
        center ? 'mx-auto max-w-2xl' : 'max-w-3xl'
      ]"
    >
      {{ desc }}
    </p>
  </div>
</template>
