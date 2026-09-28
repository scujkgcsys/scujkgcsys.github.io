// SSR 冒烟测试：逐个路由渲染出 HTML，校验内容长度与关键文案（中/英双语）
import { createServer } from 'vite'

const CHECKS = [
  {
    path: '/',
    keywords: {
      zh: ['健康工程实验室', '代表性论著'],
      en: ['Welcome to the Health Engineering Laboratory', 'Selected Publications']
    }
  },
  {
    path: '/research',
    keywords: { zh: ['研究方向与科研项目', '国家自然科学基金'], en: ['Research Directions and Projects', 'NSFC'] }
  },
  {
    path: '/members',
    keywords: { zh: ['刘展', '课题组创建人', '老师'], en: ['Zhan Liu', 'Faculty'] }
  },
  { path: '/publications', keywords: { zh: ['BibTeX', 'J Biomech'], en: ['BibTeX', 'J Biomech'] } },
  {
    path: '/activities',
    minChars: 250,
    keywords: { zh: ['暂无活动记录'], en: ['No activities recorded'] }
  },
  {
    path: '/contact',
    keywords: { zh: ['招生信息', 'bmeliuzhan [at] 163.com'], en: ['Admissions', 'bmeliuzhan [at] 163.com'] }
  },
  {
    // 管理后台仅在开发模式存在，用于验证组件本身可无异常渲染
    path: '/admin',
    minChars: 150,
    onlyDev: true,
    keywords: { zh: ['内容管理后台'], en: ['内容管理后台'] }
  }
]

const server = await createServer({
  root: process.cwd(),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'warn'
})

let failed = 0

try {
  const mod = await server.ssrLoadModule('/src/entry-ssr.js')

  for (const check of CHECKS) {
    if (check.onlyDev && process.env.NODE_ENV === 'production') continue
    for (const locale of ['zh', 'en']) {
      const keywords = check.keywords[locale] || []
      let html = ''
      try {
        html = await mod.render(check.path, locale)
      } catch (e) {
        failed++
        console.log(`FAIL ${check.path} [${locale}] threw: ${e.message}`)
        continue
      }
      const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      const missing = keywords.filter((k) => !html.includes(k))
      const minChars = check.minChars || 600
      const pass = text.length > minChars && missing.length === 0
      if (!pass) failed++
      console.log(
        `${pass ? 'PASS' : 'FAIL'} ${check.path.padEnd(14)} [${locale}] chars=${String(text.length).padStart(5)} missing=[${missing.join('|')}]`
      )
    }
  }
} finally {
  await server.close()
}

console.log(failed === 0 ? '\nSSR SMOKE TEST: PASS' : `\nSSR SMOKE TEST: FAIL (${failed} checks)`)
process.exit(failed === 0 ? 0 : 1)
