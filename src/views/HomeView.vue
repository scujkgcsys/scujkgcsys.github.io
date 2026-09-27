<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTx } from '@/composables/useTx'
import SectionHeader from '@/components/SectionHeader.vue'
import StatCard from '@/components/StatCard.vue'
import ResearchCard from '@/components/ResearchCard.vue'
import PublicationCard from '@/components/PublicationCard.vue'
import site from '@/data/site.json'
import publications from '@/data/publications.json'
import activitiesData from '@/data/activities.json'
import projects from '@/data/projects.json'
import { formatDate, photoData, shortDate } from '@/utils/media'

const router = useRouter()
const { t } = useI18n()
const { locale, tx } = useTx()

const stats = computed(() => [
  { value: publications.length, label: t('hero.statsPublications') },
  { value: projects.length, label: t('hero.statsProjects') },
  { value: site.researchAreas.length, label: t('hero.statsAreas') },
  { value: '100+', label: t('hero.statsSci') }
])

const latestNews = computed(() => [...site.news].slice(0, 4))

const selectedPapers = computed(() =>
  [...publications]
    .filter((p) => p.highlight)
    .sort((a, b) => Number(b.year) - Number(a.year))
    .slice(0, 3)
)

const recentActivities = computed(() => [...activitiesData].slice(0, 4))

function cover(activity) {
  return activity.images?.[0] || photoData(activity.id, 1, tx(activity.location))
}
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden border-b border-ink-100">
      <div class="grid-pattern absolute inset-0 opacity-70" aria-hidden="true"></div>
      <div
        class="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-brand-200/40 blur-3xl"
        aria-hidden="true"
      ></div>
      <div
        class="pointer-events-none absolute -left-32 top-60 h-[320px] w-[320px] rounded-full bg-teal-100/50 blur-3xl"
        aria-hidden="true"
      ></div>

      <div class="wrap relative py-20 sm:py-28">
        <div class="max-w-3xl animate-fade-up">
          <span
            class="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3 py-1 text-xs font-medium text-brand-700"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
            {{ t('hero.badge') }}
          </span>
          <h1 class="mt-5 text-4xl font-bold leading-tight tracking-tight text-ink-900 sm:text-5xl">
            {{ tx(site.name) }}
          </h1>
          <p class="mt-3 text-xl font-medium text-brand-700 sm:text-2xl">{{ tx(site.tagline) }}</p>
          <p class="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-600">
            {{ tx(site.intro) }}
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <button class="btn-primary" @click="router.push('/publications')">
              {{ t('hero.ctaPrimary') }}
            </button>
            <button class="btn-ghost" @click="router.push('/contact')">
              {{ t('hero.ctaSecondary') }}
            </button>
          </div>
        </div>

        <div class="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            v-for="s in stats"
            :key="s.label"
            :value="s.value"
            :label="s.label"
            class="animate-fade-up"
          />
        </div>
      </div>
    </section>

    <!-- 研究方向 -->
    <section class="wrap py-20">
      <SectionHeader
        :label="t('home.areasLabel')"
        :title="t('home.areasTitle')"
        :desc="tx(site.tagline)"
      />
      <div class="grid gap-5 md:grid-cols-2">
        <ResearchCard v-for="a in site.researchAreas" :key="a.id" :area="a" />
      </div>
    </section>

    <!-- 最新动态 -->
    <section v-if="latestNews.length" class="border-y border-ink-100 bg-ink-50/50 py-20">
      <div class="wrap">
        <SectionHeader :label="t('home.newsLabel')" :title="t('home.newsTitle')" />
        <div class="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <ul class="space-y-4">
            <li
              v-for="n in latestNews"
              :key="n.id"
              class="card flex gap-4 p-5"
            >
              <span
                class="mt-0.5 shrink-0 rounded-lg bg-white px-3 py-1.5 text-center text-xs font-semibold text-brand-600 ring-1 ring-brand-100"
              >
                {{ shortDate(n.date, locale) }}
              </span>
              <p class="text-[15px] leading-relaxed text-ink-700">{{ tx(n.text) }}</p>
            </li>
          </ul>

          <div class="card p-6">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-ink-900">{{ t('contact.admission') }}</h3>
              <router-link to="/contact" class="text-sm font-semibold text-brand-600 hover:text-brand-700">
                {{ t('common.readMore') }} →
              </router-link>
            </div>
            <p class="mt-3 text-sm leading-relaxed text-ink-600">
              {{ t('contact.admissionText') }}
            </p>
            <div class="mt-6 grid gap-3 sm:grid-cols-2">
              <div class="rounded-xl bg-ink-50 p-4">
                <p class="text-xs text-ink-400">{{ t('contact.email') }}</p>
                <a :href="`mailto:${site.email}`" class="text-sm font-medium text-brand-700 break-all">
                  {{ site.email }}
                </a>
              </div>
              <div class="rounded-xl bg-ink-50 p-4">
                <p class="text-xs text-ink-400">{{ t('contact.address') }}</p>
                <p class="text-sm font-medium text-ink-700">{{ tx(site.location) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 代表性论文 -->
    <section class="wrap py-20">
      <SectionHeader :label="t('home.papersLabel')" :title="t('home.papersTitle')" />
      <div class="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <PublicationCard
          v-for="p in selectedPapers"
          :key="p.id"
          :paper="p"
        />
      </div>
      <div class="mt-8 flex justify-center">
        <router-link to="/publications" class="btn-ghost">
          {{ t('home.papersMore') }} →
        </router-link>
      </div>
    </section>

    <!-- 日常活动 -->
    <section v-if="recentActivities.length" class="border-t border-ink-100 bg-ink-50/50 py-20">
      <div class="wrap">
        <SectionHeader :label="t('home.galleryLabel')" :title="t('home.galleryTitle')" />
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <router-link
            v-for="a in recentActivities"
            :key="a.id"
            to="/activities"
            class="card card-hover group overflow-hidden"
          >
            <div class="relative aspect-[4/3] overflow-hidden">
              <img
                :src="cover(a)"
                :alt="tx(a.title)"
                class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <span
                class="absolute bottom-3 left-3 rounded-md bg-black/55 px-2 py-1 text-[11px] font-medium text-white"
              >
                {{ a.photos }} 📷
              </span>
            </div>
            <div class="p-4">
              <p class="text-xs text-ink-400">{{ formatDate(a.date, locale) }}</p>
              <h3 class="mt-1 line-clamp-2 text-[15px] font-semibold text-ink-900">
                {{ tx(a.title) }}
              </h3>
            </div>
          </router-link>
        </div>
        <div class="mt-8 flex justify-center">
          <router-link to="/activities" class="btn-ghost">
            {{ t('home.galleryMore') }} →
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>
