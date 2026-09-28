<script setup>
import { computed } from 'vue'
import { useTx } from '@/composables/useTx'

const props = defineProps({
  area: { type: Object, required: true }
})

const { tx } = useTx()

// 图标路径为内置白名单常量，不读取外部 HTML
const ICONS = {
  eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" stroke-linejoin="round"/><circle cx="12" cy="12" r="3"/>',
  shield:
    '<path d="M12 3l7 3v5.5c0 4.3-2.9 7.9-7 9.5-4.1-1.6-7-5.2-7-9.5V6l7-3Z" stroke-linejoin="round"/><path d="m9 12 2.2 2.2L15.5 10" stroke-linecap="round" stroke-linejoin="round"/>',
  chip:
    '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10 3v2M14 3v2M10 19v2M14 19v2M3 10h2M3 14h2M19 10h2M19 14h2" stroke-linecap="round"/>',
  sparkles:
    '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" stroke-linejoin="round"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" stroke-linejoin="round"/>',
  heart:
    '<path d="M12 20.3S4.3 15.8 4.3 10.6A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.7 3c0 5.2-7.7 9.7-7.7 9.7Z" stroke-linejoin="round"/><path d="M3 13h3l1.6-2.6L10 15l2-3 2 2h5" stroke-linecap="round" stroke-linejoin="round"/>'
}

const icon = computed(() => ICONS[props.area.icon] || ICONS.sparkles)
</script>

<template>
  <article class="card card-hover flex h-full flex-col overflow-hidden">
    <!-- 主题配图（有图时显示横幅，无图时退化为图标） -->
    <div v-if="area.image" class="relative">
      <img
        :src="area.image"
        :alt="tx(area.title)"
        class="h-40 w-full object-cover sm:h-44"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
      <span
        class="absolute left-5 top-5 grid h-11 w-11 place-items-center rounded-xl bg-white/90 text-brand-600 shadow-card"
      >
        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" v-html="icon" />
      </span>
    </div>

    <div :class="area.image ? 'flex flex-1 flex-col p-6 pt-1' : 'flex flex-1 flex-col p-6'">
      <span
        v-if="!area.image"
        class="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600"
      >
        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" v-html="icon" />
      </span>
      <h3 class="mt-4 text-lg font-semibold text-ink-900">{{ tx(area.title) }}</h3>
      <p class="mt-2 text-sm leading-relaxed text-ink-600">{{ tx(area.summary) }}</p>
      <div class="mt-4 flex flex-wrap gap-1.5">
        <span
          v-for="k in area.keywords"
          :key="tx(k)"
          class="badge bg-ink-50 text-ink-600 ring-1 ring-inset ring-ink-100"
        >
          {{ tx(k) }}
        </span>
      </div>
    </div>
  </article>
</template>
