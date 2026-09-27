/**
 * 联系方式防爬虫：页面只渲染 `xxx [at] domain` 形式，
 * 真实邮箱地址在用户点击时由 JS 组装，HTML 源码中不会出现完整邮箱。
 */
export function displayEmail(email) {
  if (!email) return ''
  const [user, domain] = String(email).split('@')
  return domain ? `${user} [at] ${domain}` : user
}

export function openMail(email, subject = '') {
  if (!email) return
  const url = subject
    ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
    : `mailto:${email}`
  window.location.href = url
}
