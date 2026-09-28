<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTx } from '@/composables/useTx'
import SectionHeader from '@/components/SectionHeader.vue'
import ResearchCard from '@/components/ResearchCard.vue'
import site from '@/data/site.json'
import projects from '@/data/projects.json'

const { t } = useI18n()
const { tx } = useTx()

const cap = (s) => s.replace(/(^|-)([a-z])/g, (_, _d, c) => c.toUpperCase())

const CAT_ORDER = ['nsfc', 'nsfc-key', 'central', 'cooperation', 'university', 'horizontal']

const catColor = {
  nsfc: 'bg-brand-50 text-brand-700 ring-brand-100',
  'nsfc-key': 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  central: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  cooperation: 'bg-teal-50 text-teal-700 ring-teal-100',
  university: 'bg-violet-50 text-violet-700 ring-violet-100',
  horizontal: 'bg-amber-50 text-amber-700 ring-amber-100'
}

const grouped = computed(() => {
  const map = new Map()
  for (const p of projects) {
    if (!map.has(p.category)) map.set(p.category, [])
    map.get(p.category).push(p)
  }
  return [...map.entries()]
    .sort((a, b) => CAT_ORDER.indexOf(a[0]) - CAT_ORDER.indexOf(b[0]))
    .map(([key, list]) => ({
      key,
      count: list.length,
      label: t(`research.cat${cap(key)}`),
      color: catColor[key] || 'bg-ink-100 text-ink-600 ring-ink-200',
      list
    }))
})
</script>

<template>
  <div class="wrap py-16">
    <SectionHeader
      :label="t('research.label')"
      :title="t('research.title')"
      :desc="t('research.desc')"
      center
      :cover="site.bannerImage"
    />

    <!-- 研究方向 -->
    <h2 class="mb-5 flex items-center gap-3 text-xl font-bold text-ink-900">
      {{ t('research.areasSub') }}
      <span class="h-px flex-1 bg-ink-100"></span>
    </h2>
    <div class="grid gap-5 md:grid-cols-2">
      <ResearchCard v-for="a in site.researchAreas" :key="a.id" :area="a" />
    </div>

    <!-- 科研项目 -->
    <h2 class="mb-6 mt-16 flex items-center gap-3 text-xl font-bold text-ink-900">
      {{ t('research.projectsSub') }}
      <span class="badge bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100">
        {{ projects.length }}
      </span>
      <span class="h-px flex-1 bg-ink-100"></span>
    </h2>

    <section v-for="g in grouped" :key="g.key" class="mb-10">
      <div class="mb-4 flex items-center gap-3">
        <span class="badge ring-1 ring-inset" :class="g.color">{{ g.label }}</span>
        <span class="text-sm text-ink-400">{{ g.count }}</span>
        <span class="h-px flex-1 bg-ink-100"></span>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <article v-for="p in g.list" :key="p.id" class="card card-hover p-5">
          <div class="flex items-start justify-between gap-3">
            <h3 class="text-[15px] font-semibold leading-snug text-ink-900">{{ tx(p.name) }}</h3>
            <span
              v-if="p.role"
              class="badge shrink-0 bg-ink-50 text-ink-600 ring-1 ring-inset ring-ink-100"
            >
              {{ tx(p.role) }}
            </span>
          </div>
          <p v-if="tx(p.desc)" class="mt-3 text-sm leading-relaxed text-ink-600">
            {{ tx(p.desc) }}
          </p>
          <dl v-if="p.period || p.amount" class="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs">
            <div v-if="p.period" class="flex gap-1">
              <dt class="text-ink-400">{{ t('research.projectPeriod') }}</dt>
              <dd class="font-medium text-ink-700">{{ p.period }}</dd>
            </div>
            <div v-if="p.amount" class="flex gap-1">
              <dt class="text-ink-400">{{ t('research.projectAmount') }}</dt>
              <dd class="font-medium text-ink-700">{{ p.amount }}</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  </div>
</template>
