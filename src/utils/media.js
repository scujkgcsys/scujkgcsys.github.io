const PALETTES = [
  ['#1b56f1', '#589fff'],
  ['#0f766e', '#2dd4bf'],
  ['#7c3aed', '#c4b5fd'],
  ['#b45309', '#fbbf24'],
  ['#be123c', '#fb7185'],
  ['#0369a1', '#38bdf8'],
  ['#4338ca', '#818cf8'],
  ['#15803d', '#86efac']
]

function hashOf(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

function svgToUri(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function initialsOf(enName = '', zhName = '') {
  const parts = enName.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (zhName || '?').slice(0, 1)
}

/** 生成带首字母的渐变头像 */
export function avatarData(nameZh, nameEn) {
  const seed = hashOf(nameEn || nameZh)
  const [a, b] = PALETTES[seed % PALETTES.length]
  const initials = initialsOf(nameEn, nameZh)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
<rect width="320" height="320" fill="url(#g)"/>
<circle cx="252" cy="60" r="90" fill="#ffffff" opacity="0.08"/>
<circle cx="48" cy="278" r="70" fill="#000000" opacity="0.08"/>
<text x="160" y="160" text-anchor="middle" dominant-baseline="central" font-family="Arial,Helvetica,sans-serif" font-size="120" font-weight="700" fill="#ffffff" opacity="0.95">${initials}</text>
</svg>`
  return svgToUri(svg)
}

/** 生成活动相册占位图 */
export function photoData(key, index, caption = '') {
  const seed = hashOf(`${key}-${index}`)
  const [a, b] = PALETTES[(seed + index) % PALETTES.length]
  const px = 60 + (seed % 180)
  const py = 50 + ((seed >> 3) % 140)
  const text = escapeXml(caption.slice(0, 18))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="560" viewBox="0 0 800 560">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
<rect width="800" height="560" fill="url(#g)"/>
<circle cx="${px}" cy="${py}" r="120" fill="#ffffff" opacity="0.09"/>
<circle cx="700" cy="500" r="180" fill="#000000" opacity="0.10"/>
<path d="M0 470 L200 340 L360 440 L540 300 L800 470 L800 560 L0 560 Z" fill="#000000" opacity="0.14"/>
<text x="40" y="80" font-family="Arial,Helvetica,sans-serif" font-size="30" font-weight="700" fill="#ffffff" opacity="0.92">${escapeXml(key)} #${index}</text>
<text x="40" y="520" font-family="Arial,Helvetica,sans-serif" font-size="26" fill="#ffffff" opacity="0.85">${text}</text>
</svg>`
  return svgToUri(svg)
}

export function escapeXml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** 日期格式化：中文 -> 2026年8月22日；英文 -> Aug 22, 2026 */
export function formatDate(dateStr, locale) {
  if (!dateStr) return ''
  const parts = String(dateStr).split('-')
  const y = Number(parts[0])
  const m = Number(parts[1] || 1)
  const d = Number(parts[2] || 1)
  if (locale === 'zh') return `${y}年${m}月${d}日`
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[m - 1]} ${d}, ${y}`
}

/** 短日期：中文 -> 2026.8.22；英文 -> Aug 22 */
export function shortDate(dateStr, locale) {
  if (!dateStr) return ''
  const full = formatDate(dateStr, locale)
  if (locale === 'zh') return full.replace(/[年月]/g, '.').replace('日', '')
  return full.replace(/,\s*\d{4}$/, '')
}

export function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
  }
  return new Promise((resolve, reject) => {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      resolve()
    } catch (e) {
      reject(e)
    }
  })
}
