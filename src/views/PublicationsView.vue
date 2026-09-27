<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SectionHeader from '@/components/SectionHeader.vue'
import PublicationCard from '@/components/PublicationCard.vue'
import publications from '@/data/publications.json'
import { buildBibtex } from '@/utils/bibtex'

const { t } = useI18n()

const keyword = ref('')
const year = ref('all')
const type = ref('all')
const sort = ref('year-desc')
const highlightOnly = ref(false)

const years = computed(() => [
  ...new Set(publications.map((p) => Number(p.year)))
].sort((a, b) => b - a))

const types = [
  { key: 'all', labelKey: 'common.all' },
  { key: 'journal', labelKey: 'publications.typeJournal' },
  { key: 'book', labelKey: 'publications.typeBook' }
]

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  let list = publications.filter((p) => {
    if (year.value !== 'all' && Number(p.year) !== Number(year.value)) return false
    if (type.value !== 'all' && p.type !== type.value) return false
    if (highlightOnly.value && !p.highlight) return false
    if (!kw) return true
    return [p.title, p.authors, p.venue, p.venueShort, p.award, p.summary?.zh, p.summary?.en]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(kw)
  })

  list = [...list].sort((a, b) => {
    if (sort.value === 'year-asc') return Number(a.year) - Number(b.year)
    if (sort.value === 'venue') return a.venueShort.localeCompare(b.venueShort)
    return Number(b.year) - Number(a.year)
  })
  return list
})

const groupedByYear = computed(() => {
  const map = new Map()
  for (const p of filtered.value) {
    const y = Number(p.year)
    if (!map.has(y)) map.set(y, [])
    map.get(y).push(p)
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0])
})

function reset() {
  keyword.value = ''
  year.value = 'all'
  type.value = 'all'
  highlightOnly.value = false
  sort.value = 'year-desc'
}

function exportBib() {
  if (!filtered.value.length) return
  const content = filtered.value.map((p) => buildBibtex(p)).join('\n\n') + '\n'
  const blob = new Blob([content], { type: 'application/x-bibtex;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'publications.bib'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const hasFilter = computed(
  () => keyword.value || year.value !== 'all' || type.value !== 'all' || highlightOnly.value
)
</script>

<template>
  <div class="wrap py-16">
    <SectionHeader
      :label="t('publications.label')"
      :title="t('publications.title')"
      :desc="t('publications.desc')"
      center
    />

    <!-- 筛选区 -->
    <div class="card sticky top-[72px] z-20 mb-10 p-5">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-3 sm:flex-row">
          <div class="relative flex-1">
            <svg
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" stroke-linecap="round" />
            </svg>
            <input
              v-model="keyword"
              type="search"
              :placeholder="t('publications.searchPlaceholder')"
              class="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-9 pr-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <select
            v-model="sort"
            class="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          >
            <option value="year-desc">{{ t('publications.sortYearDesc') }}</option>
            <option value="year-asc">{{ t('publications.sortYearAsc') }}</option>
            <option value="venue">{{ t('publications.sortVenue') }}</option>
          </select>

          <button class="btn-ghost shrink-0" @click="exportBib">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 3v12m0 0 4-4m-4 4-4-4" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke-linecap="round" />
            </svg>
            {{ t('publications.exportAll') }}
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="mr-1 text-xs font-semibold text-ink-400">{{ t('common.year') }}</span>
          <button class="chip" :class="{ 'chip-active': year === 'all' }" @click="year = 'all'">
            {{ t('common.all') }}
          </button>
          <button
            v-for="y in years"
            :key="y"
            class="chip"
            :class="{ 'chip-active': year === String(y) }"
            @click="year = String(y)"
          >
            {{ y }}
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="tp in types"
            :key="tp.key"
            class="chip"
            :class="{ 'chip-active': type === tp.key }"
            @click="type = tp.key"
          >
            {{ t(tp.labelKey) }}
          </button>
          <label
            class="ml-auto inline-flex cursor-pointer select-none items-center gap-2 text-xs font-medium text-ink-600"
          >
            <input
              v-model="highlightOnly"
              type="checkbox"
              class="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-200"
            />
            {{ t('publications.highlightOnly') }}
          </label>
        </div>
      </div>
    </div>

    <!-- 结果 -->
    <div class="mb-6 flex items-center justify-between">
      <p class="text-sm text-ink-500">
        {{ t('publications.paperCount', { n: filtered.length }) }}
      </p>
      <button v-if="hasFilter" class="text-sm font-semibold text-brand-600 hover:text-brand-700" @click="reset">
        {{ t('common.reset') }}
      </button>
    </div>

    <p v-if="!filtered.length" class="card p-10 text-center text-sm text-ink-500">
      {{ t('common.noResults') }}
    </p>

    <section v-for="[y, papers] in groupedByYear" :key="y" class="mb-10">
      <div class="mb-4 flex items-center gap-3">
        <h2 class="text-2xl font-bold tracking-tight text-ink-900">{{ y }}</h2>
        <span class="badge bg-ink-100 text-ink-600">{{ papers.length }}</span>
        <span class="h-px flex-1 bg-ink-100"></span>
      </div>
      <div class="grid gap-5">
        <PublicationCard v-for="p in papers" :key="p.id" :paper="p" />
      </div>
    </section>
  </div>
</template>
