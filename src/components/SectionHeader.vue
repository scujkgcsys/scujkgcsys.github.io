<script setup>
defineProps({
  label: { type: String, default: '' },
  title: { type: String, required: true },
  desc: { type: String, default: '' },
  center: { type: Boolean, default: false },
  cover: { type: String, default: '' }
})
</script>

<template>
  <div :class="['mb-10', center ? 'text-center' : '']">
    <!-- 带主题横幅的页头 -->
    <template v-if="cover">
      <div class="banner mb-7 h-36 sm:h-44">
        <img :src="cover" alt="" class="absolute inset-0 h-full w-full object-cover" />
        <div class="banner-veil"></div>
        <div class="relative flex h-full items-center px-6 sm:px-10">
          <div>
            <p
              v-if="label"
              class="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75"
            >
              {{ label }}
            </p>
            <h2 class="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {{ title }}
            </h2>
          </div>
        </div>
      </div>
      <p
        v-if="desc"
        :class="[
          'text-[15px] leading-relaxed text-ink-600',
          center ? 'mx-auto max-w-2xl' : 'max-w-3xl'
        ]"
      >
        {{ desc }}
      </p>
    </template>

    <!-- 普通页头 -->
    <template v-else>
      <p v-if="label" class="label mb-2">{{ label }}</p>
      <h2
        :class="[
          'text-3xl font-bold tracking-tight text-ink-900 sm:text-[34px]',
          center ? 'mx-auto' : ''
        ]"
      >
        {{ title }}
      </h2>
      <p
        v-if="desc"
        :class="[
          'mt-3 text-[15px] leading-relaxed text-ink-600',
          center ? 'mx-auto max-w-2xl' : 'max-w-3xl'
        ]"
      >
        {{ desc }}
      </p>
    </template>
  </div>
</template>
