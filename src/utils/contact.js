/**
 * 联系方式防爬虫：页面只渲染 `xxx [at] domain` 形式，
 * 真实邮箱地址在用户点击时由 JS 组装，HTML 源码中不会出现完整邮箱。
 */
// 数据里写 `xxx@domain` 或 `xxx [at] domain` 都能正确解析
export function realEmail(email) {
  return String(email || '')
    .replace(/\s*\[\s*at\s*\]\s*/gi, '@')
    .replace(/\s+/g, '')
}

export function displayEmail(email) {
  if (!email) return ''
  const [user, domain] = realEmail(email).split('@')
  return domain ? `${user} [at] ${domain}` : user
}

export function openMail(email, subject = '') {
  const target = realEmail(email)
  if (!target || !target.includes('@')) return
  const url = subject
    ? `mailto:${target}?subject=${encodeURIComponent(subject)}`
    : `mailto:${target}`
  window.location.href = url
}
