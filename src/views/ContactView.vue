<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTx } from '@/composables/useTx'
import SectionHeader from '@/components/SectionHeader.vue'
import { displayEmail, openMail } from '@/utils/contact'
import site from '@/data/site.json'

const { t } = useI18n()
const { tx } = useTx()

const contacts = computed(() => [
  {
    key: 'address',
    label: t('contact.address'),
    value: `${tx(site.university)} ${tx(site.affiliation)} · ${tx(site.location)}`,
    href: ''
  },
  {
    key: 'email',
    label: t('contact.email'),
    value: displayEmail(site.email),
    mail: site.email
  },
  { key: 'phone', label: t('contact.phone'), value: site.phone, href: `tel:${site.phone.replace(/[^+\d]/g, '')}` }
])
</script>

<template>
  <div class="wrap py-16">
    <SectionHeader
      :label="t('contact.label')"
      :title="t('contact.title')"
      :desc="t('contact.desc')"
      center
      :cover="site.heroImage"
    />

    <div class="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <!-- 联系方式 -->
      <div class="space-y-5">
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-ink-900">{{ t('footer.contactTitle') }}</h2>
          <dl class="mt-4 space-y-4">
            <div v-for="c in contacts" :key="c.key" class="flex gap-3">
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <template v-if="c.key === 'address'">
                    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" stroke-linejoin="round" />
                    <circle cx="12" cy="10" r="2.5" />
                  </template>
                  <template v-else-if="c.key === 'email'">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" stroke-linecap="round" />
                  </template>
                  <template v-else>
                    <path
                      d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z"
                      stroke-linejoin="round"
                    />
                  </template>
                </svg>
              </span>
              <div class="min-w-0">
                <dt class="text-xs text-ink-400">{{ c.label }}</dt>
                <dd class="break-all text-sm font-medium text-ink-800">
                  <a
                    v-if="c.mail"
                    href="#"
                    class="hover:text-brand-700"
                    @click.prevent="openMail(c.mail)"
                  >
                    {{ c.value }}
                  </a>
                  <a
                    v-else-if="c.href"
                    :href="c.href"
                    class="hover:text-brand-700"
                  >
                    {{ c.value }}
                  </a>
                  <span v-else>{{ c.value }}</span>
                </dd>
              </div>
            </div>
          </dl>

          <div class="mt-6 flex flex-wrap gap-2 border-t border-ink-100 pt-5">
            <a
              v-for="l in site.links"
              :key="l.url"
              :href="l.url"
              target="_blank"
              rel="noopener noreferrer"
              class="chip hover:border-brand-300 hover:text-brand-700"
            >
              {{ tx(l.label) }} ↗
            </a>
          </div>
        </div>

        <div class="card overflow-hidden">
          <div class="relative aspect-[16/10] bg-gradient-to-br from-brand-50 to-brand-100">
            <svg viewBox="0 0 400 250" class="h-full w-full" role="img" :aria-label="t('contact.mapTitle')">
              <g stroke="#1b56f1" stroke-opacity="0.25" stroke-width="1">
                <template v-for="i in 9" :key="`v${i}`"><path :d="`M${i * 40} 0 V250`" /></template>
                <template v-for="i in 6" :key="`h${i}`"><path :d="`M0 ${i * 40} H400`" /></template>
              </g>
              <path d="M0 190 C90 150 130 210 220 170 S330 120 400 150 V250 H0 Z" fill="#1b56f1" fill-opacity="0.12" />
              <path d="M20 60 H160 V120 H20 Z" fill="#ffffff" fill-opacity="0.9" stroke="#1b56f1" stroke-opacity="0.4" />
              <path d="M200 40 H330 V110 H200 Z" fill="#ffffff" fill-opacity="0.9" stroke="#1b56f1" stroke-opacity="0.4" />
              <circle cx="248" cy="150" r="16" fill="#1b56f1" fill-opacity="0.15" />
              <circle cx="248" cy="150" r="7" fill="#1b56f1" />
              <text x="248" y="182" text-anchor="middle" font-size="14" fill="#1b56f1" font-family="Arial">
                {{ tx(site.shortName) }}
              </text>
            </svg>
          </div>
          <p class="p-4 text-xs text-ink-400">{{ t('contact.mapHint') }}</p>
        </div>
      </div>

      <!-- 招生 / 合作 -->
      <div class="space-y-5">
        <section class="card bg-gradient-to-br from-brand-600 to-brand-800 p-7 text-white">
          <h2 class="text-xl font-bold">{{ t('contact.admission') }}</h2>
          <p class="mt-3 text-sm leading-relaxed text-white/85">{{ t('contact.admissionText') }}</p>
          <a
            href="#"
            class="btn mt-6 bg-white text-brand-700 hover:bg-brand-50"
            @click.prevent="openMail(site.email)"
          >
            {{ displayEmail(site.email) }}
          </a>
        </section>

        <section class="card p-7">
          <h2 class="text-xl font-bold text-ink-900">{{ t('contact.cooperation') }}</h2>
          <p class="mt-3 text-sm leading-relaxed text-ink-600">{{ t('contact.cooperationText') }}</p>
          <ul class="mt-5 space-y-3">
            <li
              v-for="a in site.researchAreas"
              :key="a.id"
              class="flex items-start gap-3 rounded-xl bg-ink-50 p-4"
            >
              <span class="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white text-brand-600 ring-1 ring-brand-100">
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="m5 13 4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <div>
                <p class="text-sm font-semibold text-ink-900">{{ tx(a.title) }}</p>
                <p class="mt-0.5 text-xs text-ink-500">{{ tx(a.summary) }}</p>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>
