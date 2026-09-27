// 把 dist 的 JS/CSS 全部内联进 index.html，产出「单文件网页」，可直接双击用浏览器打开
import fs from 'node:fs'
import path from 'node:path'

const distDir = path.resolve(process.cwd(), 'dist')
const htmlPath = path.join(distDir, 'index.html')

if (!fs.existsSync(htmlPath)) {
  console.error('dist/index.html 不存在，请先执行 vite build')
  process.exit(1)
}

let html = fs.readFileSync(htmlPath, 'utf-8')
let inlinedCount = 0

/** 读取 dist 资源文件，src 形如 ./assets/app.js */
function readAsset(src) {
  const rel = decodeURIComponent(src).replace(/^\.?\//, '')
  const file = path.join(distDir, rel)
  if (!fs.existsSync(file)) return null
  return { content: fs.readFileSync(file, 'utf-8'), file }
}

// 内联脚本：经典脚本在 <head> 会立即执行、此时 #app 尚未解析，
// 因此先从原位置摘除，最后统一放到 </body> 之前执行
let scriptBlock = ''
html = html.replace(/<script\b[^>]*\bsrc="([^"]+\.js)"[^>]*>\s*<\/script>/gi, (tag, src) => {
  const asset = readAsset(src)
  if (!asset) return tag
  inlinedCount++
  const safe = asset.content.replace(/<\/script>/gi, '<\\/script>')
  scriptBlock = `<script>${safe}</script>`
  return ''
})

// 内联样式
html = html.replace(/<link\b[^>]*rel="stylesheet"[^>]*>/gi, (tag) => {
  const m = tag.match(/href="([^"]+)"/i)
  if (!m) return tag
  const asset = readAsset(m[1])
  if (!asset) return tag
  inlinedCount++
  return `<style>${asset.content}</style>`
})

// 清理残留的 modulepreload / preload link
html = html.replace(/<link\b[^>]*rel="modulepreload"[^>]*>/gi, '')

// 脚本放到 body 末尾，确保挂载点 #app 已存在
if (scriptBlock) {
  // 必须用函数形式：脚本内容里可能含 $&、$' 等特殊替换模式
  if (html.includes('</body>')) html = html.replace('</body>', () => `${scriptBlock}\n  </body>`)
  else html += `\n${scriptBlock}\n`
}

// 单文件模式下不再需要外链资源目录
for (const dir of ['assets']) {
  const target = path.join(distDir, dir)
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true })
}

fs.writeFileSync(htmlPath, html, 'utf-8')

const sizeKb = (fs.statSync(htmlPath).size / 1024).toFixed(1)
console.log(`已内联 ${inlinedCount} 个资源 → dist/index.html（${sizeKb} KB，单文件，可直接双击打开）`)
