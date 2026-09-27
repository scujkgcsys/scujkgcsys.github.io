<script setup>
import { computed, watch } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useI18n } from 'vue-i18n'
import site from '@/data/site.json'

const { locale } = useI18n()

const fullName = computed(() => site.name[locale.value] || site.name.zh)
const shortName = computed(() => site.shortName[locale.value] || site.shortName.zh)

function syncDocumentMeta() {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('lang', locale.value === 'zh' ? 'zh-CN' : 'en')
  document.title = `${shortName.value} · ${fullName.value}`
}

watch(locale, syncDocumentMeta, { immediate: true })
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white">
    <AppHeader />
    <main class="flex-1">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppFooter />
  </div>
</template>
