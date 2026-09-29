// 零依赖内容管理后台服务：node scripts/cms-server.mjs
// 仅监听 127.0.0.1，读写 src/data/*.json，支持自动备份与重建站点
import http from 'node:http'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn, spawnSync } from 'node:child_process'
import os from 'node:os'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA_DIR = path.join(ROOT, 'src', 'data')
const BACKUP_DIR = path.join(ROOT, '.cms-backups')
const UI_FILE = path.join(ROOT, 'tools', 'admin.html')

const DATASETS = {
  site: { file: 'site.json', kind: 'object', label: '站点信息' },
  members: { file: 'members.json', kind: 'array', label: '团队成员' },
  publications: { file: 'publications.json', kind: 'array', label: '论文成果' },
  projects: { file: 'projects.json', kind: 'array', label: '科研项目' },
  activities: { file: 'activities.json', kind: 'array', label: '科研动态' }
}

const MAX_BODY = 12 * 1024 * 1024
const backupsEnabled = true

function json(res, code, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  })
  res.end(body)
}

function readDataset(name) {
  const meta = DATASETS[name]
  if (!meta) throw new Error('未知数据集')
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, meta.file), 'utf8'))
}

async function backup(name) {
  if (!backupsEnabled) return
  const meta = DATASETS[name]
  await fsp.mkdir(BACKUP_DIR, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const dest = path.join(BACKUP_DIR, `${name}.${stamp}.json`)
  await fsp.copyFile(path.join(DATA_DIR, meta.file), dest)
  // 仅保留每个数据集最近 20 份备份
  const files = (await fsp.readdir(BACKUP_DIR))
    .filter((f) => f.startsWith(`${name}.`))
    .sort()
  while (files.length > 20) {
    await fsp.unlink(path.join(BACKUP_DIR, files.shift())).catch(() => {})
  }
}

async function writeDataset(name, data) {
  const meta = DATASETS[name]
  if (meta.kind === 'array' && !Array.isArray(data)) throw new Error('该数据集必须是数组')
  if (meta.kind === 'object' && (Array.isArray(data) || typeof data !== 'object' || !data)) {
    throw new Error('站点信息必须是对象')
  }
  const target = path.join(DATA_DIR, meta.file)
  const tmp = `${target}.tmp-${process.pid}`
  await backup(name)
  await fsp.writeFile(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8')
  await fsp.rename(tmp, target)
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (c) => {
      size += c.length
      if (size > MAX_BODY) {
        reject(new Error('内容过大'))
        req.destroy()
        return
      }
      chunks.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

async function runBuild() {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  const result = await new Promise((resolve) => {
    const child = spawn(npm, ['run', 'build'], { cwd: ROOT, shell: process.platform === 'win32' })
    let out = ''
    child.stdout.on('data', (d) => (out += d))
    child.stderr.on('data', (d) => (out += d))
    const timer = setTimeout(() => child.kill(), 180000)
    child.on('exit', (code) => {
      clearTimeout(timer)
      resolve({ code, out: out.slice(-2000) })
    })
    child.on('error', (err) => resolve({ code: -1, out: String(err) }))
  })
  return result
}

function gitStatus() {
  try {
    const r = spawnSync('git', ['status', '-sb'], { cwd: ROOT, encoding: 'utf8' })
    return r.error ? String(r.error) : r.stdout || r.stderr || ''
  } catch (e) {
    return String(e)
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1')
  const remote = req.socket.remoteAddress || ''
  const isLocal = remote === '127.0.0.1' || remote === '::1' || remote === '::ffff:127.0.0.1'
  if (!isLocal) return json(res, 403, { ok: false, error: '仅允许本机访问' })

  try {
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      const html = await fsp.readFile(UI_FILE, 'utf8')
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' })
      return res.end(html)
    }

    if (req.method === 'GET' && url.pathname === '/api/datasets') {
      const list = Object.entries(DATASETS).map(([key, meta]) => {
        const data = readDataset(key)
        return {
          key,
          label: meta.label,
          kind: meta.kind,
          count: Array.isArray(data) ? data.length : 1,
          mtime: fs.statSync(path.join(DATA_DIR, meta.file)).mtime.toISOString()
        }
      })
      return json(res, 200, { ok: true, datasets: list })
    }

    if (req.method === 'GET' && url.pathname === '/api/data') {
      const name = url.searchParams.get('name') || ''
      if (!DATASETS[name]) return json(res, 400, { ok: false, error: '未知数据集' })
      return json(res, 200, { ok: true, name, kind: DATASETS[name].kind, data: readDataset(name) })
    }

    if (req.method === 'POST' && url.pathname === '/api/data') {
      const raw = await collectBody(req)
      const payload = JSON.parse(raw)
      const name = payload?.name
      if (!DATASETS[name]) return json(res, 400, { ok: false, error: '未知数据集' })
      await writeDataset(name, payload.data)
      return json(res, 200, { ok: true, name })
    }

    if (req.method === 'POST' && url.pathname === '/api/build') {
      const r = await runBuild()
      return json(res, 200, { ok: r.code === 0, code: r.code, output: r.out })
    }

    if (req.method === 'GET' && url.pathname === '/api/status') {
      return json(res, 200, { ok: true, output: gitStatus() })
    }

    return json(res, 404, { ok: false, error: 'Not found' })
  } catch (err) {
    return json(res, 500, { ok: false, error: String(err?.message || err) })
  }
})

function listen(startPort) {
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(startPort, '127.0.0.1', () => resolve(server.address().port))
  })
}

let port = Number(process.env.CMS_PORT || 5178)
let started = false
for (let i = 0; i < 10 && !started; i++) {
  try {
    await listen(port + i)
    port = port + i
    started = true
  } catch (e) {
    if (i === 9) {
      console.error('端口占用，无法启动：', String(e.message || e))
      process.exit(1)
    }
  }
}

const url = `http://127.0.0.1:${port}/`
console.log(`\n  内容管理后台已启动：${url}`)
console.log(`  数据目录：${DATA_DIR}`)
console.log(`  备份目录：${BACKUP_DIR}（每次保存自动备份，每数据集保留最近 20 份）`)
console.log(`  停止服务：按 Ctrl+C\n`)

if (process.platform === 'win32') spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref()
else if (process.platform === 'darwin') spawn('open', [url], { detached: true, stdio: 'ignore' }).unref()
else if (process.env.DISPLAY || os.platform() === 'linux') spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref()

process.on('SIGINT', () => {
  console.log('\n已停止。')
  process.exit(0)
})
