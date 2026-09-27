import { createRouter, createWebHashHistory, createMemoryHistory } from 'vue-router'
import routes from './routes.js'

export { routes }

// file:// 协议下浏览器禁止 history.replaceState/pushState，使用 hash 模式会在初始化阶段
// 抛 SecurityError 导致整站白屏，故在 file:// 下降级为内存历史，并手动同步地址栏 hash
const isFileProtocol = typeof window !== 'undefined' && window.location?.protocol === 'file:'

const history = isFileProtocol ? createMemoryHistory() : createWebHashHistory()

const router = createRouter({
  history,
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  }
})

if (isFileProtocol) {
  const initial = window.location.hash.replace(/^#/, '') || '/'
  router.push(initial).catch(() => {})
  // 直接赋值 hash 在 file:// 下允许，用于保持地址栏与刷新后仍停留在同一页
  router.afterEach((to) => {
    if (window.location.hash !== `#${to.fullPath}`) window.location.hash = to.fullPath
  })
}

export default router
