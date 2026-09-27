import { createI18n } from 'vue-i18n'
import zh from './locales/zh.js'
import en from './locales/en.js'

const STORAGE_KEY = 'ipclab-locale'

function detectLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'zh' || saved === 'en') return saved
  } catch (e) {
    /* localStorage 不可用时忽略 */
  }
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('zh')
    ? 'zh'
    : 'en'
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: detectLocale(),
  fallbackLocale: 'zh',
  messages: { zh, en }
})

export function persistLocale(locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch (e) {
    /* 忽略写入失败 */
  }
  document.documentElement.setAttribute('lang', locale === 'zh' ? 'zh-CN' : 'en')
}

export default i18n
