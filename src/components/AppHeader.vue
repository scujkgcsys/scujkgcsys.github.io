<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTx } from '@/composables/useTx'
import { persistLocale } from '@/i18n'
import site from '@/data/site.json'

const { t, locale } = useI18n()
const { tx } = useTx()
const open = ref(false)

const navItems = [
  { name: 'home', path: '/', labelKey: 'home' },
  { name: 'research', path: '/research', labelKey: 'research' },
  { name: 'members', path: '/members', labelKey: 'members' },
  { name: 'publications', path: '/publications', labelKey: 'publications' },
  { name: 'activities', path: '/activities', labelKey: 'activities' },
  { name: 'contact', path: '/contact', labelKey: 'contact' }
]

function toggleLocale() {
  const next = locale.value === 'zh' ? 'en' : 'zh'
  locale.value = next
  persistLocale(next)
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-ink-100/80 bg-white/85 backdrop-blur-md">
    <div class="wrap flex h-16 items-center justify-between gap-4">
      <router-link to="/" class="group flex min-w-0 items-center gap-3" @click="open = false">
        <img
          :src="site.logo"
          alt="四川大学"
          class="h-10 w-10 shrink-0 object-contain"
          loading="eager"
        />
        <span class="min-w-0">
          <span class="block truncate text-[15px] font-semibold leading-tight text-ink-900">
            {{ tx(site.name) }}
          </span>
          <span class="block truncate text-[11px] leading-tight text-ink-400">
            {{ tx(site.university) }} · {{ tx(site.affiliation) }}
          </span>
        </span>
      </router-link>

      <!-- 桌面导航 -->
      <nav class="hidden items-center gap-1 lg:flex">
        <router-link
          v-for="item in navItems"
          :key="item.name"
          :to="item.path"
          class="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-brand-50 hover:text-brand-700"
          active-class="!bg-brand-50 !text-brand-700"
        >
          {{ t(`nav.${item.labelKey}`) }}
        </router-link>
      </nav>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="hidden items-center gap-1 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-semibold text-ink-600 transition hover:border-brand-300 hover:text-brand-700 sm:inline-flex"
          :aria-label="locale === 'zh' ? 'Switch to English' : '切换为中文'"
          @click="toggleLocale"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
          </svg>
          {{ locale === 'zh' ? 'EN' : '中文' }}
        </button>

        <button
          type="button"
          class="grid h-9 w-9 place-items-center rounded-lg border border-ink-200 text-ink-600 lg:hidden"
          :aria-expanded="open"
          aria-label="menu"
          @click="open = !open"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path v-if="!open" d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round" />
            <path v-else d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 移动端抽屉 -->
    <transition name="fade">
      <nav v-if="open" class="border-t border-ink-100 bg-white px-5 pb-4 pt-2 lg:hidden">
        <router-link
          v-for="item in navItems"
          :key="item.name"
          :to="item.path"
          class="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-brand-50 hover:text-brand-700"
          active-class="!bg-brand-50 !text-brand-700"
          @click="open = false"
        >
          {{ t(`nav.${item.labelKey}`) }}
        </router-link>
        <button
          class="mt-2 w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm font-semibold text-ink-600 sm:hidden"
          @click="toggleLocale"
        >
          {{ locale === 'zh' ? 'English' : '中文' }}
        </button>
      </nav>
    </transition>
  </header>
</template>
