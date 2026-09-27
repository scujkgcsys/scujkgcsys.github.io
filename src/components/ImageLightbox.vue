<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  photos: { type: Array, required: true }, // [{ src, caption }]
  start: { type: Number, default: 0 },
  title: { type: String, default: '' }
})

const emit = defineEmits(['close'])
const { t } = useI18n()
const current = ref(Math.max(0, Math.min(props.start, props.photos.length - 1)))

const item = computed(() => props.photos[current.value] || {})
const hasPrev = computed(() => props.photos.length > 1)
const hasNext = computed(() => props.photos.length > 1)

function go(step) {
  const n = props.photos.length
  current.value = (current.value + step + n) % n
}

function onKey(e) {
  if (e.key === 'Escape') emit('close')
  if (e.key === 'ArrowRight') go(1)
  if (e.key === 'ArrowLeft') go(-1)
}

onMounted(() => {
  document.addEventListener('keydown', onKey)
  document.body.style.overflow = 'hidden'
})
onUnmounted(() => {
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <teleport to="body">
    <transition name="pop">
      <div
        class="fixed inset-0 z-[100] flex flex-col bg-ink-950/92 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        @click.self="emit('close')"
      >
        <div class="flex items-center justify-between gap-4 px-5 py-4 text-white">
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold">{{ title }}</p>
            <p class="text-xs text-white/60">
              {{ current + 1 }} / {{ photos.length }} · {{ t('common.photoCount', { n: photos.length }) }}
            </p>
          </div>
          <button
            type="button"
            class="grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
            :aria-label="t('common.close')"
            @click="emit('close')"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <div class="flex flex-1 items-center justify-center gap-3 px-2 pb-2 sm:px-6">
          <button
            v-if="hasPrev"
            class="hidden h-12 w-12 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:grid"
            :aria-label="t('common.prev')"
            @click="go(-1)"
          >
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m14 6-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <figure class="flex min-h-0 max-h-full flex-col items-center">
            <img
              :src="item.src"
              :alt="item.caption || title"
              class="max-h-[68vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <figcaption v-if="item.caption" class="mt-3 max-w-2xl text-center text-sm text-white/70">
              {{ item.caption }}
            </figcaption>
          </figure>

          <button
            v-if="hasNext"
            class="hidden h-12 w-12 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:grid"
            :aria-label="t('common.next')"
            @click="go(1)"
          >
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m10 6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>

        <div class="flex gap-2 overflow-x-auto px-5 py-4">
          <button
            v-for="(p, i) in photos"
            :key="i"
            class="h-14 w-20 shrink-0 overflow-hidden rounded-lg ring-2 transition"
            :class="i === current ? 'ring-white' : 'ring-transparent opacity-60 hover:opacity-100'"
            @click="current = i"
          >
            <img :src="p.src" :alt="p.caption || ''" class="h-full w-full object-cover" />
          </button>
        </div>
      </div>
    </transition>
  </teleport>
</template>
