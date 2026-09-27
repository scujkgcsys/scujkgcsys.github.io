// 诊断：用 jsdom 以 file:// 方式加载 dist/index.html（经典脚本可执行），检查是否渲染成功
const entry =
  'C:/Users/11876/.workbuddy/binaries/node/workspace/node_modules/jsdom/lib/api.js'
const { JSDOM, VirtualConsole } = await import(`file:///${entry}`)

const target = process.argv[2] || 'D:/WorkBuddyProjects/网页展示/dist/index.html'
const problems = []
const vc = new VirtualConsole()
// jsdom 未实现 window.scrollTo，真实浏览器中不存在，忽略该项
const IGNORE = /Not implemented: Window's scrollTo/
vc.on('jsdomError', (e) => !IGNORE.test(e.message) && problems.push(`jsdomError: ${e.message}`))
vc.on('error', (...a) => {
  const msg = String(a[0])
  if (!IGNORE.test(msg)) problems.push(`console.error: ${msg.slice(0, 200)}`)
})

const dom = await JSDOM.fromFile(target, {
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true,
  virtualConsole: vc
})

const { window } = dom
await new Promise((r) => setTimeout(r, 2500))

const app = window.document.querySelector('#app')
const text = app ? app.textContent.replace(/\s+/g, ' ').trim() : ''
const tags = [...window.document.querySelectorAll('script')].map((s) => ({
  type: s.getAttribute('type') || '(classic)',
  src: s.getAttribute('src') || '(inline)',
  len: (s.textContent || '').length
}))

console.log('file        :', target)
console.log('script tags :', JSON.stringify(tags))
console.log('#app chars  :', text.length)
console.log('sample      :', text.slice(0, 120))
console.log('problems    :', problems.length ? problems.slice(0, 5) : 'none')
window.close()
console.log(text.length > 500 && !problems.length ? 'RENDER OK' : 'RENDER FAILED')
