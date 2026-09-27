/**
 * 根据论文结构化信息自动生成 BibTeX——数据文件中无需再手写 bibtex 字段
 */
function splitAuthors(authors) {
  return String(authors || '')
    .split(/[,，]/)
    .map((s) => s.replace(/[*#]/g, '').trim())
    .filter(Boolean)
}

function bibKey(paper) {
  const first = splitAuthors(paper.authors)[0] || 'key'
  const surname = first.split(/\s+/)[0].toLowerCase()
  const word = String(paper.title || '')
    .split(/\s+/)
    .find((w) => /^[a-zA-Z]{4,}$/.test(w))
  return `${surname}${paper.year}${word ? word.toLowerCase() : ''}`
}

export function buildBibtex(paper) {
  if (!paper) return ''
  const authors = splitAuthors(paper.authors).join(' and ')
  const venue = (paper.venueShort || paper.venue || '').trim()
  const lines = []

  if (paper.type === 'book') {
    lines.push(`@book{${bibKey(paper)},`)
    lines.push(`  author    = {${authors}},`)
    lines.push(`  title     = {${paper.title}},`)
    lines.push(`  publisher = {${venue}},`)
    lines.push(`  year      = {${paper.year}}`)
  } else {
    lines.push(`@article{${bibKey(paper)},`)
    lines.push(`  author  = {${authors}},`)
    lines.push(`  title   = {${paper.title}},`)
    lines.push(`  journal = {${venue}},`)
    lines.push(`  year    = {${paper.year}},`)
    if (paper.doi) lines.push(`  doi     = {${paper.doi}}`)
    if (paper.venue && paper.venue !== venue) {
      const note = paper.venue.replace(venue, '').replace(/^\s*[\.,]?\s*/, '').trim()
      if (note) lines.push(`  note    = {${note}}`)
    }
  }
  lines.push('}')
  return lines.join('\n')
}
