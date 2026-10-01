<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTx } from '@/composables/useTx'
import { displayEmail, openMail } from '@/utils/contact'
import site from '@/data/site.json'

const { t } = useI18n()
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
          <img
            :src="site.logo"
            alt="四川大学"
            class="h-10 w-10 shrink-0 object-contain"
            loading="lazy"
          />
          <span class="text-[15px] font-semibold text-ink-900">{{ tx(site.name) }}</span>
        </div>
        <p class="mt-4 max-w-xs text-sm leading-relaxed text-ink-600">{{ t('footer.about') }}</p>
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
            <a
              href="#"
              class="transition hover:text-brand-700"
              :title="t('contact.email')"
              @click.prevent="openMail(site.email)"
            >
              {{ displayEmail(site.email) }}
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
      <p class="wrap mt-1.5 text-center text-[11px] text-ink-400/80">
        {{ t('footer.aiImages') }}
      </p>
    </div>
  </footer>
</template>
