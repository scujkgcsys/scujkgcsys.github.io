<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTx } from '@/composables/useTx'
import SectionHeader from '@/components/SectionHeader.vue'
import ImageLightbox from '@/components/ImageLightbox.vue'
import activitiesData from '@/data/activities.json'
import { formatDate, photoData, shortDate } from '@/utils/media'

const { t } = useI18n()
const { locale, tx } = useTx()

const view = ref('timeline') // timeline | gallery
const category = ref('all')

const categories = [
  { key: 'all', labelKey: 'catAll' },
  { key: 'academic', labelKey: 'catAcademic' },
  { key: 'seminar', labelKey: 'catSeminar' },
  { key: 'award', labelKey: 'catAward' },
  { key: 'outreach', labelKey: 'catOutreach' },
  { key: 'life', labelKey: 'catLife' }
]

const catColor = {
  academic: 'bg-brand-50 text-brand-700 ring-brand-100',
  seminar: 'bg-violet-50 text-violet-700 ring-violet-100',
  award: 'bg-amber-50 text-amber-700 ring-amber-100',
  outreach: 'bg-teal-50 text-teal-700 ring-teal-100',
  life: 'bg-rose-50 text-rose-700 ring-rose-100'
}

const list = computed(() => {
  const arr =
    category.value === 'all'
      ? activitiesData
      : activitiesData.filter((a) => a.category === category.value)
  return [...arr].sort((a, b) => (a.date < b.date ? 1 : -1))
})

// 有真实照片时用 images 数组，否则按 photos 数量生成占位图
function photosOf(activity) {
  const caption = tx(activity.location)
  if (Array.isArray(activity.images) && activity.images.length) {
    return activity.images.map((src) => ({ src, caption }))
  }
  return Array.from({ length: activity.photos || 0 }, (_, i) => ({
    src: photoData(activity.id, i + 1, caption),
    caption
  }))
}

// 灯箱状态
const lightbox = ref({ open: false, photos: [], title: '', start: 0 })

function openLightbox(activity, index = 0) {
  lightbox.value = {
    open: true,
    photos: photosOf(activity),
    title: tx(activity.title),
    start: index
  }
}
</script>

<template>
  <div class="wrap py-16">
    <SectionHeader
      :label="t('activities.label')"
      :title="t('activities.title')"
      :desc="t('activities.desc')"
      center
    />

    <!-- 控制栏 -->
    <div class="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="c in categories"
          :key="c.key"
          class="chip"
          :class="{ 'chip-active': category === c.key }"
          @click="category = c.key"
        >
          {{ t(`activities.${c.labelKey}`) }}
        </button>
      </div>
      <div class="inline-flex rounded-xl border border-ink-200 p-1">
        <button
          class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
          :class="view === 'timeline' ? 'bg-brand-600 text-white' : 'text-ink-600 hover:text-brand-700'"
          @click="view = 'timeline'"
        >
          {{ t('activities.viewTimeline') }}
        </button>
        <button
          class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
          :class="view === 'gallery' ? 'bg-brand-600 text-white' : 'text-ink-600 hover:text-brand-700'"
          @click="view = 'gallery'"
        >
          {{ t('activities.viewGrid') }}
        </button>
      </div>
    </div>

    <p v-if="!list.length" class="card p-10 text-center text-sm text-ink-500">
      {{ t('activities.empty') }}
    </p>

    <!-- 时间线 -->
    <div v-if="list.length && view === 'timeline'" class="relative">
      <span class="absolute left-[7px] top-2 bottom-2 w-px bg-ink-200 md:left-[15px]" aria-hidden="true"></span>
      <article v-for="a in list" :key="a.id" class="relative mb-8 pl-8 md:pl-12">
        <span
          class="absolute left-0 top-3 h-4 w-4 rounded-full border-2 border-white bg-brand-500 md:left-2"
          aria-hidden="true"
        ></span>
        <div class="card overflow-hidden transition hover:border-brand-200">
          <div class="grid gap-0 md:grid-cols-[260px_1fr]">
            <div class="relative cursor-pointer" @click="openLightbox(a, 0)">
              <img
                :src="photosOf(a)[0].src"
                :alt="tx(a.title)"
                class="h-48 w-full object-cover md:h-full"
                loading="lazy"
              />
              <span
                class="absolute bottom-2 right-2 rounded-md bg-black/55 px-2 py-1 text-[11px] font-medium text-white"
              >
                {{ t('activities.viewPhotos', { n: a.photos }) }}
              </span>
            </div>
            <div class="p-5">
              <div class="flex flex-wrap items-center gap-2 text-xs">
                <span class="badge ring-1 ring-inset" :class="catColor[a.category]">
                  {{ t(`activities.cat${a.category.charAt(0).toUpperCase() + a.category.slice(1)}`) }}
                </span>
                <time class="font-semibold text-ink-400">{{ formatDate(a.date, locale) }}</time>
                <span class="inline-flex items-center gap-1 text-ink-400">
                  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" stroke-linejoin="round" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                  {{ tx(a.location) }}
                </span>
              </div>
              <h3 class="mt-2 text-lg font-semibold text-ink-900">{{ tx(a.title) }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-ink-600">{{ tx(a.desc) }}</p>

              <div class="mt-4 flex gap-2 overflow-x-auto pb-1">
                <button
                  v-for="(p, i) in photosOf(a).slice(1)"
                  :key="i"
                  class="h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-1 ring-ink-100 transition hover:ring-brand-300"
                  @click="openLightbox(a, i + 1)"
                >
                  <img :src="p.src" :alt="p.caption" class="h-full w-full object-cover" loading="lazy" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>

    <!-- 相册墙 -->
    <div v-else-if="list.length" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="a in list"
        :key="a.id"
        class="card card-hover cursor-pointer overflow-hidden"
        @click="openLightbox(a, 0)"
      >
        <div class="relative aspect-[4/3] overflow-hidden">
          <img
            :src="photosOf(a)[0].src"
            :alt="tx(a.title)"
            class="h-full w-full object-cover"
            loading="lazy"
          />
          <span
            class="absolute right-3 top-3 rounded-md bg-black/55 px-2 py-1 text-[11px] font-medium text-white"
          >
            {{ shortDate(a.date, locale) }}
          </span>
        </div>
        <div class="p-4">
          <span class="badge ring-1 ring-inset" :class="catColor[a.category]">
            {{ t(`activities.cat${a.category.charAt(0).toUpperCase() + a.category.slice(1)}`) }}
          </span>
          <h3 class="mt-2 line-clamp-2 text-[15px] font-semibold text-ink-900">
            {{ tx(a.title) }}
          </h3>
          <p class="mt-1 text-xs text-ink-400">{{ t('activities.viewPhotos', { n: a.photos }) }}</p>
        </div>
      </article>
    </div>

    <ImageLightbox
      v-if="lightbox.open"
      :photos="lightbox.photos"
      :start="lightbox.start"
      :title="lightbox.title"
      @close="lightbox.open = false"
    />
  </div>
</template>
