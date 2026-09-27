<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTx } from '@/composables/useTx'
import site from '@/data/site.json'

const { t, locale } = useI18n()
const { tx } = useTx()

const year = new Date().getFullYear()
const navKeys = ['research', 'members', 'publications', 'activities', 'contact']
const paths = {
  research: '/research',
  members: '/members',
  publications: '/publications',
  activities: '/activities',
  contact: '/contact'
}
const external = computed(() => site.links || [])
</script>

<template>
  <footer class="mt-24 border-t border-ink-100 bg-ink-50/60">
    <div class="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
      <div>
        <div class="flex items-center gap-3">
          <span
            class="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white"
          >
            {{ (site.shortName[locale] || site.shortName.zh).slice(0, 2).toUpperCase() }}
          </span>
          <span class="text-[15px] font-semibold text-ink-900">{{ tx(site.name) }}</span>
        </div>
        <p class="mt-4 max-w-xs text-sm leading-relaxed text-ink-600">{{ t('footer.about') }}</p>
        <p class="mt-4 text-xs text-ink-400">{{ t('footer.builtWith') }}</p>
      </div>

      <div>
        <h3 class="text-xs font-semibold uppercase tracking-widest text-ink-400">
          {{ t('footer.navTitle') }}
        </h3>
        <ul class="mt-4 space-y-2.5">
          <li v-for="k in navKeys" :key="k">
            <router-link
              :to="paths[k]"
              class="text-sm text-ink-600 transition hover:text-brand-700"
            >
              {{ t(`nav.${k}`) }}
            </router-link>
          </li>
        </ul>
      </div>

      <div>
        <h3 class="text-xs font-semibold uppercase tracking-widest text-ink-400">
          {{ t('footer.contactTitle') }}
        </h3>
        <ul class="mt-4 space-y-2.5 text-sm text-ink-600">
          <li>{{ tx(site.location) }}</li>
          <li>
            <a :href="`mailto:${site.email}`" class="transition hover:text-brand-700">
              {{ site.email }}
            </a>
          </li>
          <li>{{ site.phone }}</li>
        </ul>
      </div>

      <div>
        <h3 class="text-xs font-semibold uppercase tracking-widest text-ink-400">
          {{ t('footer.links') }}
        </h3>
        <ul class="mt-4 space-y-2.5">
          <li v-for="l in external" :key="l.url">
            <a
              :href="l.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-ink-600 transition hover:text-brand-700"
            >
              {{ tx(l.label) }}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="border-t border-ink-100 py-5">
      <p class="wrap text-center text-xs text-ink-400">
        {{ t('footer.copyright', { year }) }}
      </p>
    </div>
  </footer>
</template>
