import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

/**
 * 本地内容管理后端：仅在 dev server（localhost）生效，不进入任何构建产物。
 * 接口：
 *   GET  /api/content/:name   读取 src/data/:name.json
 *   POST /api/content/:name   写回（请求体为 JSON）
 *   GET  /api/build           执行 npm run build
 *   GET  /api/status          返回 git 状态
 */
const ALLOWED = ['site', 'members', 'publications', 'projects', 'activities']

function send(res, code, data) {
  const body = typeof data === 'string' ? data : JSON.stringify(data)
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(body)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (c) => {
      raw += c
      if (raw.length > 20 * 1024 * 1024) reject(new Error('payload too large'))
    })
    req.on('end', () => resolve(raw))
    req.on('error', reject)
  })
}

export default function contentAdmin() {
  return {
    name: 'content-admin',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        const host = req.headers.host || ''
        if (!host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
          return send(res, 403, { error: '仅允许本机访问' })
        }

        try {
          if (url.pathname.startsWith('/api/content/')) {
            const name = path.basename(url.pathname).replace(/\.json$/, '')
            if (!ALLOWED.includes(name)) return send(res, 400, { error: '不支持的数据集' })
            const file = path.resolve('src/data', `${name}.json`)

            if (req.method === 'GET') {
              return send(res, 200, JSON.parse(fs.readFileSync(file, 'utf-8')))
            }
            if (req.method === 'POST') {
              const raw = await readBody(req)
              const parsed = JSON.parse(raw) // 校验合法 JSON
              const tmp = `${file}.tmp`
              fs.writeFileSync(tmp, JSON.stringify(parsed, null, 2) + '\n', 'utf-8')
              fs.renameSync(tmp, file) // 原子替换，避免写坏
              return send(res, 200, { ok: true, count: Array.isArray(parsed) ? parsed.length : 1 })
            }
            return send(res, 405, { error: 'method not allowed' })
          }

          if (url.pathname === '/api/build' && req.method === 'GET') {
            const out = execSync('npm run build', { encoding: 'utf-8', stdio: 'pipe' })
            return send(res, 200, { ok: true, log: out.split('\n').slice(-6).join('\n') })
          }

          if (url.pathname === '/api/status' && req.method === 'GET') {
            let status = ''
            try {
              status = execSync('git status --short && git log --oneline -1', { encoding: 'utf-8' })
            } catch (e) {
              status = String(e.message)
            }
            return send(res, 200, { ok: true, status })
          }
        } catch (e) {
          return send(res, 500, { error: e.message })
        }
        next()
      })
    }
  }
}
