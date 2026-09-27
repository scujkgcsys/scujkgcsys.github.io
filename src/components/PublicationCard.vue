<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTx } from '@/composables/useTx'
import { copyText } from '@/utils/media'
import { buildBibtex } from '@/utils/bibtex'

const props = defineProps({
  paper: { type: Object, required: true },
  index: { type: Number, default: 0 }
})

const { t } = useI18n()
const { tx } = useTx()
const copied = ref(false)
const showBib = ref(false)

const typeClass = {
  journal: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  conference: 'bg-brand-50 text-brand-700 ring-brand-100',
  patent: 'bg-amber-50 text-amber-700 ring-amber-100',
  book: 'bg-teal-50 text-teal-700 ring-teal-100'
}

const typeLabel = computed(
  () =>
    ({
      journal: t('publications.typeJournal'),
      conference: t('publications.typeConference'),
      patent: t('publications.typePatent'),
      book: t('publications.typeBook')
    })[props.paper.type] || ''
)

const bibtex = computed(() => buildBibtex(props.paper))

async function onCopy() {
  try {
    await copyText(bibtex.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  } catch (e) {
    copied.value = false
  }
}
</script>

<template>
  <article
    class="card card-hover relative overflow-hidden p-5 sm:p-6"
    :class="paper.highlight ? 'ring-1 ring-brand-100' : ''"
  >
    <span
      v-if="paper.highlight"
      class="absolute right-0 top-0 rounded-bl-xl bg-brand-600 px-2.5 py-1 text-[11px] font-semibold text-white"
    >
      ★ {{ t('publications.selected') }}
    </span>

    <div class="flex flex-wrap items-center gap-2 text-xs">
      <span class="badge ring-1 ring-inset" :class="typeClass[paper.type]">{{ typeLabel }}</span>
      <span v-if="paper.ccf" class="badge bg-ink-100 text-ink-600 ring-1 ring-inset ring-ink-200">
        {{ paper.ccf }}
      </span>
      <span class="font-semibold text-ink-400">{{ paper.year }}</span>
      <span v-if="paper.award" class="badge bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100">
        🏆 {{ paper.award }}
      </span>
    </div>

    <h3 class="mt-3 pr-6 text-[17px] font-semibold leading-snug text-ink-900">
      <a v-if="paper.url" :href="paper.url" target="_blank" rel="noopener noreferrer" class="hover:text-brand-700">
        {{ paper.title }}
      </a>
      <span v-else>{{ paper.title }}</span>
    </h3>

    <p class="mt-2 text-sm text-ink-600">{{ paper.authors }}</p>

    <p class="mt-1 text-sm font-medium italic text-brand-700">
      {{ paper.venue }}
    </p>

    <p v-if="tx(paper.summary)" class="mt-3 text-sm leading-relaxed text-ink-600">
      {{ tx(paper.summary) }}
    </p>

    <div class="mt-4 flex flex-wrap items-center gap-3 border-t border-ink-100 pt-4 text-xs">
      <a v-if="paper.doi" :href="`https://doi.org/${paper.doi}`" target="_blank" rel="noopener noreferrer"
        class="font-medium text-brand-600 hover:text-brand-700">
        {{ t('publications.doi') }} ↗
      </a>
      <a v-else-if="paper.url" :href="paper.url" target="_blank" rel="noopener noreferrer"
        class="font-medium text-brand-600 hover:text-brand-700">
        {{ t('publications.links') }} ↗
      </a>
      <a v-if="paper.code" :href="paper.code" target="_blank" rel="noopener noreferrer"
        class="font-medium text-brand-600 hover:text-brand-700">
        {{ t('publications.code') }} ↗
      </a>
      <span v-if="!paper.doi && !paper.url && !paper.code" class="text-ink-400">
        {{ t('publications.nolinks') }}
      </span>

      <button
        type="button"
        class="ml-auto inline-flex items-center gap-1 rounded-lg border border-ink-200 px-2.5 py-1.5 font-semibold text-ink-600 transition hover:border-brand-300 hover:text-brand-700"
        @click="showBib = !showBib"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M9 4v16M15 4v16M4 9h16M4 15h16" stroke-linecap="round" />
        </svg>
        {{ t('publications.bibtex') }}
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-lg bg-ink-900 px-2.5 py-1.5 font-semibold text-white transition hover:bg-ink-800"
        @click="onCopy"
      >
        {{ copied ? t('common.copied') : t('publications.copyBibtex') }}
      </button>
    </div>

    <transition name="fade">
      <pre
        v-if="showBib"
        class="mt-4 overflow-x-auto rounded-xl bg-ink-950 p-4 text-[12px] leading-relaxed text-ink-100"
      >{{ bibtex }}</pre>
    </transition>
  </article>
</template>
