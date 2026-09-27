// 仅供 SSR 冒烟测试使用：在 Node 端渲染各路由，用于验证组件能否无异常地渲染出内容
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from '@/App.vue'
import routes from '@/router/routes.js'
import { i18n } from '@/i18n'

export async function render(path, locale = 'zh') {
  const app = createSSRApp(App)
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  await router.isReady()
  i18n.global.locale.value = locale
  app.use(router).use(i18n)
  const html = await renderToString(app)
  return html
}
