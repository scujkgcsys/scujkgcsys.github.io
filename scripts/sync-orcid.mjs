/**
 * 从 ORCID 公开 API 同步成果并合并进 src/data/publications.json
 * 用法：node scripts/sync-orcid.mjs [ORCID]
 *   ORCID 默认 0000-0001-7336-6685（刘展教授）
 * 说明：
 *   - ORCID 为作者本人维护的公开数据源，主题准确；
 *   - 作者列表、卷期页通过 Crossref 按 DOI 补全（免费公开 API，无需 Key）；
 *   - 按标题归一化去重，已存在的条目不会重复导入，也不会覆盖已有字段。
 */
import fs from 'node:fs'
import path from 'node:path'

const ORCID = process.argv[2] || '0000-0001-7336-6685'
const POLITE = 'mailto:bmeliuzhan@163.com'
const DATA_FILE = path.resolve('src/data/publications.json')

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9一-龥]/g, '')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getJson(url, accept = 'application/json') {
  const res = await fetch(url, {
    headers: { Accept: accept, 'User-Agent': `hel-site/1.0 (${POLITE})` },
    redirect: 'follow'
  })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json()
}

/** 用 Crossref 按 DOI 补全元数据 */
async function crossref(doi) {
  if (!doi) return null
  try {
    const d = await getJson(`https://api.crossref.org/works/${encodeURIComponent(doi)}`)
    const m = d.message || {}
    const authors = (m.author || [])
      .map((a) => [a.given, a.family].filter(Boolean).join(' '))
      .filter(Boolean)
    const container = Array.isArray(m['container-title']) ? m['container-title'][0] : m['container-title']
    const parts = [container, m.volume && `vol.${m.volume}`, m.issue && `(${m.issue})`, m.page]
      .filter(Boolean)
      .join(' ')
    const year = m.issued?.['date-parts']?.[0]?.[0]
    return {
      authors: authors.join(', '),
      venue: parts || container || '',
      venueShort: container || '',
      year: year || null,
      type: (m.type || '').includes('journal') ? 'journal' : 'other'
    }
  } catch (e) {
    return null
  }
}

async function main() {
  const works = await getJson(`https://pub.orcid.org/v3.0/${ORCID}/works`)
  const items = new Map()
  for (const g of works.group || []) {
    for (const s of g['work-summary'] || []) {
      const title = s.title?.title?.value?.trim()
      if (!title) continue
      const year = Number(s['publication-date']?.year?.value || 0) || null
      const jt = s['journal-title']
      const journal = typeof jt === 'string' ? jt : jt?.value || ''
      let doi = ''
      for (const e of s['external-ids']?.['external-id'] || []) {
        if (e['external-id-type'] === 'doi') doi = (e['external-id-value'] || '').trim()
      }
      const key = norm(title)
      if (key && !items.has(key)) {
        items.set(key, { title, year, journal, doi, type: s.type || '' })
      }
    }
  }

  const existing = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
  const have = new Set(existing.map((p) => norm(p.title)))
  const candidates = [...items.values()].filter((v) => !have.has(norm(v.title)))

  console.log(`ORCID 去重后 ${items.size} 条；本地已有 ${existing.length} 条；新增候选 ${candidates.length} 条`)
  console.log('开始用 Crossref 补全元数据…')

  const added = []
  let okCount = 0
  for (const c of candidates) {
    const meta = await crossref(c.doi)
    await sleep(120) // 礼貌限速
    const year = c.year || meta?.year || new Date().getFullYear()
    const type = c.type === 'conference-paper' ? 'conference' : 'journal'
    added.push({
      id: `oa-${norm(c.title).slice(0, 10)}`,
      title: c.title,
      authors: meta?.authors || '',
      venue: meta?.venue || c.journal || '',
      venueShort: meta?.venueShort || c.journal || '',
      year,
      type,
      highlight: false,
      doi: c.doi || '',
      url: c.doi ? `https://doi.org/${c.doi}` : '',
      summary: {}
    })
    if (meta) okCount++
  }

  const merged = [...existing, ...added].sort((a, b) => b.year - a.year || a.id.localeCompare(b.id))
  fs.writeFileSync(DATA_FILE, JSON.stringify(merged, null, 2) + '\n', 'utf-8')

  console.log(`\n已合并：原有 ${existing.length} + 新增 ${added.length} = 共 ${merged.length} 条`)
  console.log(`Crossref 成功补全 ${okCount}/${candidates.length} 条（其余缺 DOI，作者列表留空）`)
  const byYear = {}
  for (const p of added) byYear[p.year] = (byYear[p.year] || 0) + 1
  console.log('新增年份分布：', Object.entries(byYear).sort((a, b) => b[0] - a[0]).map(([y, n]) => `${y}:${n}`).join('  '))
  console.log('\n新增中 2024 年及以后：')
  for (const p of added.filter((x) => x.year >= 2024).sort((a, b) => b.year - a.year)) {
    console.log(`- ${p.year} | ${p.title.slice(0, 70)} | ${p.venueShort.slice(0, 34)}`)
  }
}

main().catch((e) => {
  console.error('同步失败：', e.message)
  process.exit(1)
})
