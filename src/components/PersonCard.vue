<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTx } from '@/composables/useTx'
import { avatarData } from '@/utils/media'
import { openMail } from '@/utils/contact'

const props = defineProps({
  person: { type: Object, required: true }
})

const { t, locale } = useI18n()
const { tx } = useTx()
const expanded = ref(false)

// 有真实照片时用 photo 字段，否则用生成的渐变头像占位
const avatar = computed(
  () => props.person.photo || avatarData(props.person.name.zh, props.person.name.en)
)
const interests = computed(() => props.person.interests || [])
const bio = computed(() => tx(props.person.bio))
const isShortBio = computed(() => bio.value.length <= 90)
</script>

<template>
  <article class="card card-hover flex flex-col p-5">
    <div class="flex items-start gap-4">
      <img
        :src="avatar"
        :alt="tx(person.name)"
        class="h-16 w-16 shrink-0 rounded-2xl object-cover ring-1 ring-ink-100"
        loading="lazy"
      />
      <div class="min-w-0 flex-1">
        <h3 class="truncate text-lg font-semibold text-ink-900">
          {{ tx(person.name) }}
          <span v-if="person.name.zh !== person.name.en" class="ml-1 text-sm font-normal text-ink-400">
            {{ locale === 'zh' ? person.name.en : person.name.zh }}
          </span>
        </h3>
        <p class="mt-0.5 text-sm text-brand-600">{{ tx(person.title) }}</p>
        <p v-if="person.role !== 'alumni'" class="mt-0.5 text-xs text-ink-400">
          {{ t('members.enrolled') }} {{ person.year }}
        </p>
        <p v-else class="mt-0.5 text-xs text-ink-400">{{ person.year }}</p>
      </div>
    </div>

    <div v-if="interests.length" class="mt-4 flex flex-wrap gap-1.5">
      <span
        v-for="kw in interests"
        :key="tx(kw)"
        class="badge bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100"
      >
        {{ tx(kw) }}
      </span>
    </div>

    <div class="mt-4">
      <p
        class="text-sm leading-relaxed text-ink-600"
        :class="expanded || isShortBio ? '' : 'line-clamp-3'"
      >
        {{ bio }}
      </p>
      <button
        v-if="!isShortBio"
        class="mt-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
        @click="expanded = !expanded"
      >
        {{ expanded ? t('common.showLess') : t('common.showMore') }}
      </button>
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-3 border-t border-ink-100 pt-4">
      <a
        v-if="person.email"
        href="#"
        @click.prevent="openMail(person.email)"
        class="inline-flex items-center gap-1 text-xs text-ink-600 transition hover:text-brand-700"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" stroke-linecap="round" />
        </svg>
        {{ t('members.contactMe') }}
      </a>
      <a
        v-if="person.homepage"
        :href="person.homepage"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 text-xs text-ink-600 transition hover:text-brand-700"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
        </svg>
        {{ t('members.homepage') }}
      </a>
      <a
        v-if="person.scholar"
        :href="person.scholar"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 text-xs text-ink-600 transition hover:text-brand-700"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 3 2 8l10 5 10-5-10-5Z" stroke-linejoin="round" />
          <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" stroke-linecap="round" />
        </svg>
        {{ t('members.scholar') }}
      </a>
      <span v-if="!person.email && !person.homepage && !person.scholar" class="text-xs text-ink-400">
        {{ t('members.noEmail') }}
      </span>
    </div>
  </article>
</template>
