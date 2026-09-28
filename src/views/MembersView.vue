<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTx } from '@/composables/useTx'
import SectionHeader from '@/components/SectionHeader.vue'
import PersonCard from '@/components/PersonCard.vue'
import { displayEmail, openMail } from '@/utils/contact'
import members from '@/data/members.json'
import site from '@/data/site.json'

const { t } = useI18n()
const { tx } = useTx()

const groups = [
  { key: 'teacher', roles: ['teacher', 'faculty'], titleKey: 'roleTeacher' },
  { key: 'phd', roles: ['phd'], titleKey: 'rolePhd' },
  { key: 'master', roles: ['master'], titleKey: 'roleMaster' },
  { key: 'alumni', roles: ['alumni'], titleKey: 'roleAlumni' }
]

const grouped = computed(() =>
  groups
    .map((g) => ({
      ...g,
      title: t(`members.${g.titleKey}`),
      list: members.filter((m) => g.roles.includes(m.role))
    }))
    .filter((g) => g.list.length > 0)
)

const total = computed(() => members.length)
</script>

<template>
  <div class="wrap py-16">
    <SectionHeader
      :label="t('members.label')"
      :title="t('members.title')"
      :desc="t('members.desc')"
      center
      :cover="site.heroImage"
    />

    <p class="mb-12 text-center text-sm text-ink-400">
      {{ t('common.total', { n: total }) }}
    </p>

    <section v-for="g in grouped" :key="g.key" class="mb-14">
      <div class="mb-5 flex items-center gap-3">
        <h2 class="text-xl font-bold text-ink-900">{{ g.title }}</h2>
        <span class="badge bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100">
          {{ g.list.length }}
        </span>
        <span class="h-px flex-1 bg-ink-100"></span>
      </div>

      <div :class="['grid gap-5', g.key === 'teacher' ? 'md:grid-cols-1' : 'md:grid-cols-2 xl:grid-cols-3']">
        <PersonCard v-for="m in g.list" :key="m.id" :person="m" />
      </div>
    </section>

    <!-- 招生提示 -->
    <section class="card mt-4 bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white">
      <h3 class="text-2xl font-bold">{{ t('contact.admission') }}</h3>
      <p class="mt-3 max-w-3xl text-sm leading-relaxed text-white/85">
        {{ t('contact.admissionText') }}
      </p>
      <div class="mt-6 flex flex-wrap gap-3">
        <a
          href="#"
          class="btn bg-white text-brand-700 hover:bg-brand-50"
          @click.prevent="openMail(site.email)"
        >
          {{ displayEmail(site.email) }}
        </a>
        <router-link
          to="/contact"
          class="btn border border-white/40 text-white hover:bg-white/10"
        >
          {{ t('common.readMore') }} →
        </router-link>
      </div>
    </section>
  </div>
</template>
