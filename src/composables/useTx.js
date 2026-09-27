import { useI18n } from 'vue-i18n'

/**
 * 双语字段取值：数据层字段形如 { zh: '…', en: '…' }
 * 非组件场景下（如工具函数）请自行传入 locale。
 */
export function pick(value, locale, fallback = 'zh') {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    return value[locale] ?? value[fallback] ?? value.en ?? value.zh ?? ''
  }
  return String(value)
}

export function useTx() {
  const { locale, t } = useI18n()
  const tx = (value) => pick(value, locale.value)
  return { locale, t, tx }
}
