<script setup>
/**
 * 本地内容管理后台（仅开发模式可访问，不进入线上产物）
 * 访问：npm run admin → http://localhost:5173/#/admin
 */
import { computed, onMounted, reactive, ref } from 'vue'

const DATASETS = [
  { key: 'publications', label: '论文成果' },
  { key: 'members', label: '团队成员' },
  { key: 'projects', label: '科研项目' },
  { key: 'activities', label: '日常活动' },
  { key: 'site', label: '站点信息' }
]

const SCHEMAS = {
  publications: {
    titleOf: (x) => `${x.year} · ${x.title}`,
    fields: [
      { key: 'title', label: '标题', type: 'text', required: true },
      { key: 'authors', label: '作者（逗号分隔）', type: 'textarea' },
      { key: 'venue', label: '发表载体（含卷期页）', type: 'text' },
      { key: 'venueShort', label: '期刊简称', type: 'text' },
      { key: 'year', label: '年份', type: 'number' },
      {
        key: 'type',
        label: '类型',
        type: 'select',
        options: ['journal', 'book', 'conference', 'patent']
      },
      { key: 'highlight', label: '设为代表作', type: 'boolean' },
      { key: 'doi', label: 'DOI', type: 'text' },
      { key: 'url', label: '链接', type: 'text' },
      { key: 'summary', label: '一句话说明', type: 'bilingual' }
    ]
  },
  members: {
    titleOf: (x) => `${x.name?.zh || ''}（${x.role}）`,
    fields: [
      { key: 'name', label: '姓名', type: 'bilingual', required: true },
      {
        key: 'role',
        label: '分组',
        type: 'select',
        options: ['pi', 'faculty', 'phd', 'master', 'alumni']
      },
      { key: 'title', label: '职务/年级', type: 'bilingual' },
      { key: 'email', label: '邮箱', type: 'text' },
      { key: 'homepage', label: '个人主页', type: 'text' },
      { key: 'scholar', label: '学术主页', type: 'text' },
      { key: 'photo', label: '照片路径（public/ 下）', type: 'text' },
      { key: 'year', label: '入组年份', type: 'text' },
      { key: 'interests', label: '研究兴趣（每行一条：中文|English）', type: 'pairlist' },
      { key: 'bio', label: '个人简介', type: 'bilingual', rows: 8 }
    ]
  },
  projects: {
    titleOf: (x) => x.name?.zh || x.name?.en || '(未命名)',
    fields: [
      { key: 'name', label: '项目名称', type: 'bilingual', required: true },
      {
        key: 'category',
        label: '类别',
        type: 'select',
        options: ['nsfc', 'nsfc-key', 'central', 'cooperation', 'university', 'horizontal']
      },
      { key: 'pi', label: '负责人', type: 'text' },
      { key: 'role', label: '承担角色', type: 'bilingual' },
      { key: 'period', label: '起止时间', type: 'text' },
      { key: 'amount', label: '经费', type: 'text' },
      { key: 'desc', label: '项目简介', type: 'bilingual', rows: 5 }
    ]
  },
  activities: {
    titleOf: (x) => `${x.date} · ${x.title?.zh || x.title?.en || ''}`,
    fields: [
      { key: 'date', label: '日期（YYYY-MM-DD）', type: 'text', required: true },
      {
        key: 'category',
        label: '类别',
        type: 'select',
        options: ['academic', 'seminar', 'award', 'outreach', 'life']
      },
      { key: 'title', label: '标题', type: 'bilingual', required: true },
      { key: 'location', label: '地点', type: 'bilingual' },
      { key: 'desc', label: '描述', type: 'bilingual', rows: 5 },
      { key: 'images', label: '照片路径（每行一条，public/ 下）', type: 'lines' },
      { key: 'photos', label: '占位图数量（无照片时）', type: 'number' }
    ]
  }
}

const current = ref('publications')
const data = ref(null)
const rawText = ref('')
const keyword = ref('')
const editing = ref(null)
const draft = ref({})
const toast = ref('')
const busy = ref(false)

const schema = computed(() => SCHEMAS[current.value])
const isArray = computed(() => Array.isArray(data.value))

const list = computed(() => {
  if (!isArray.value) return []
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return data.value
  return data.value.filter((x) => JSON.stringify(x).toLowerCase().includes(kw))
})

function flash(msg) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 2600)
}

async function load(name = current.value) {
  current.value = name
  editing.value = null
  const res = await fetch(`/api/content/${name}`)
  data.value = await res.json()
  rawText.value = JSON.stringify(data.value, null, 2)
}

async function save(payload) {
  busy.value = true
  try {
    const res = await fetch(`/api/content/${current.value}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const r = await res.json()
    if (!res.ok) throw new Error(r.error || '保存失败')
    data.value = payload
    rawText.value = JSON.stringify(payload, null, 2)
    flash(`已保存（共 ${r.count ?? '?'} 条）`)
  } catch (e) {
    flash('保存失败：' + e.message)
  } finally {
    busy.value = false
  }
}

/* —— 双语字段读写 —— */
function biGet(obj, key, lang) {
  const v = obj?.[key]
  if (!v) return ''
  return typeof v === 'string' ? (lang === 'zh' ? v : '') : v[lang] || ''
}
function biSet(obj, key, lang, value) {
  const v = obj[key]
  const base = typeof v === 'object' && v ? { ...v } : { zh: typeof v === 'string' ? v : '', en: '' }
  base[lang] = value
  obj[key] = base
}

/* —— 行列表字段（数组 <-> 多行文本）—— */
function linesGet(obj, key, pair) {
  const arr = obj?.[key] || []
  if (pair) return arr.map((x) => `${x?.zh || ''}|${x?.en || ''}`).join('\n')
  return arr.join('\n')
}
function linesSet(obj, key, value, pair) {
  const rows = String(value)
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
  obj[key] = pair
    ? rows.map((r) => {
        const [zh, en = ''] = r.split('|')
        return { zh: zh?.trim() || '', en: en.trim() }
      })
    : rows
}

function startEdit(item) {
  draft.value = reactive(JSON.parse(JSON.stringify(item || {})))
  editing.value = item ? data.value.indexOf(item) : -1
}

function newItem() {
  const base = { id: `new-${Date.now()}` }
  for (const f of schema.value?.fields || []) {
    if (f.type === 'boolean') base[f.key] = false
    else if (f.type === 'number') base[f.key] = new Date().getFullYear()
    else if (f.type === 'bilingual' || f.type === 'pairlist') base[f.key] = f.type === 'pairlist' ? [] : { zh: '', en: '' }
    else if (f.type === 'lines') base[f.key] = []
    else base[f.key] = ''
  }
  draft.value = reactive(base)
  editing.value = -1
}

function commitEdit() {
  const row = JSON.parse(JSON.stringify(draft.value))
  const arr = [...data.value]
  if (editing.value >= 0) arr[editing.value] = row
  else arr.unshift(row)
  save(arr)
  editing.value = null
}

function remove(index) {
  if (!confirm('确认删除这一条？')) return
  const arr = [...data.value]
  arr.splice(index, 1)
  save(arr)
}

async function buildSite() {
  busy.value = true
  flash('正在重新构建…')
  try {
    const res = await fetch('/api/build')
    const r = await res.json()
    flash(r.ok ? '构建完成，dist/index.html 已更新' : '构建失败')
  } catch (e) {
    flash('构建失败：' + e.message)
  } finally {
    busy.value = false
  }
}

async function gitStatus() {
  const res = await fetch('/api/status')
  const r = await res.json()
  alert(`git 状态：\n\n${r.status || '（无变更）'}`)
}

function saveRaw() {
  try {
    const parsed = JSON.parse(rawText.value)
    save(parsed)
  } catch (e) {
    flash('JSON 格式错误：' + e.message)
  }
}

onMounted(() => load())
</script>

<template>
  <div class="min-h-screen bg-ink-50">
    <header class="sticky top-0 z-30 border-b border-ink-200 bg-white">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-5 py-3">
        <h1 class="text-lg font-bold text-ink-900">内容管理后台</h1>
        <span class="badge bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100">
          仅本机可用
        </span>
        <div class="ml-auto flex flex-wrap items-center gap-2">
          <button class="btn-ghost py-2 text-xs" @click="gitStatus">git 状态</button>
          <button class="btn-primary py-2 text-xs" :disabled="busy" @click="buildSite">
            重新构建网站
          </button>
          <a class="btn-ghost py-2 text-xs" href="#/" target="_blank">预览站点</a>
        </div>
      </div>
      <nav class="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 pb-2">
        <button
          v-for="d in DATASETS"
          :key="d.key"
          class="rounded-lg px-3 py-1.5 text-sm font-medium transition"
          :class="
            current === d.key ? 'bg-brand-600 text-white' : 'text-ink-600 hover:bg-brand-50 hover:text-brand-700'
          "
          @click="load(d.key)"
        >
          {{ d.label }}
        </button>
      </nav>
    </header>

    <main class="mx-auto max-w-6xl px-5 py-6">
      <p v-if="!data" class="text-sm text-ink-500">加载中…</p>

      <!-- 数组型数据集 -->
      <template v-else-if="isArray && schema">
        <div class="mb-4 flex flex-wrap items-center gap-3">
          <input
            v-model="keyword"
            placeholder="搜索…"
            class="w-64 rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
          <span class="text-sm text-ink-500">共 {{ data.length }} 条</span>
          <button class="btn-primary ml-auto py-2 text-xs" @click="newItem">+ 新增一条</button>
        </div>

        <ul class="space-y-2">
          <li
            v-for="(item, i) in list"
            :key="item.id || i"
            class="flex items-center gap-3 rounded-xl border border-ink-200 bg-white px-4 py-3"
          >
            <span class="min-w-0 flex-1 truncate text-sm text-ink-800">
              {{ schema.titleOf(item) }}
            </span>
            <button class="chip py-1 text-xs" @click="startEdit(item)">编辑</button>
            <button
              class="chip py-1 text-xs text-rose-600 hover:border-rose-300"
              @click="remove(data.indexOf(item))"
            >
              删除
            </button>
          </li>
        </ul>
      </template>

      <!-- 站点信息：原始 JSON -->
      <template v-else>
        <div class="mb-3 flex items-center gap-3">
          <span class="text-sm text-ink-600">站点信息字段较多，直接编辑 JSON（保存前会校验格式）</span>
          <button class="btn-primary ml-auto py-2 text-xs" @click="saveRaw">保存</button>
        </div>
        <textarea
          v-model="rawText"
          rows="28"
          spellcheck="false"
          class="w-full rounded-xl border border-ink-200 bg-white p-4 font-mono text-xs leading-relaxed outline-none focus:border-brand-400"
        ></textarea>
      </template>
    </main>

    <!-- 编辑弹窗 -->
    <div
      v-if="editing !== null && schema"
      class="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-ink-950/50 p-4"
      @click.self="editing = null"
    >
      <div class="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <h2 class="mb-4 text-lg font-bold text-ink-900">
          {{ editing >= 0 ? '编辑条目' : '新增条目' }}
        </h2>

        <div class="space-y-4">
          <div v-for="f in schema.fields" :key="f.key">
            <label class="mb-1 block text-xs font-semibold text-ink-600">{{ f.label }}</label>

            <input
              v-if="f.type === 'text'"
              v-model="draft[f.key]"
              class="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
            <input
              v-else-if="f.type === 'number'"
              v-model.number="draft[f.key]"
              type="number"
              class="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
            <select
              v-else-if="f.type === 'select'"
              v-model="draft[f.key]"
              class="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            >
              <option v-for="o in f.options" :key="o" :value="o">{{ o }}</option>
            </select>
            <label
              v-else-if="f.type === 'boolean'"
              class="inline-flex items-center gap-2 text-sm text-ink-700"
            >
              <input v-model="draft[f.key]" type="checkbox" class="h-4 w-4 rounded text-brand-600" />
              启用
            </label>
            <textarea
              v-else-if="f.type === 'textarea'"
              v-model="draft[f.key]"
              :rows="f.rows || 3"
              class="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            ></textarea>

            <!-- 双语 -->
            <div v-else-if="f.type === 'bilingual'" class="grid gap-2 sm:grid-cols-2">
              <textarea
                v-if="f.rows"
                :rows="f.rows"
                :value="biGet(draft, f.key, 'zh')"
                placeholder="中文"
                class="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                @input="biSet(draft, f.key, 'zh', $event.target.value)"
              ></textarea>
              <input
                v-else
                :value="biGet(draft, f.key, 'zh')"
                placeholder="中文"
                class="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                @input="biSet(draft, f.key, 'zh', $event.target.value)"
              />
              <textarea
                v-if="f.rows"
                :rows="f.rows"
                :value="biGet(draft, f.key, 'en')"
                placeholder="English"
                class="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                @input="biSet(draft, f.key, 'en', $event.target.value)"
              ></textarea>
              <input
                v-else
                :value="biGet(draft, f.key, 'en')"
                placeholder="English"
                class="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                @input="biSet(draft, f.key, 'en', $event.target.value)"
              />
            </div>

            <textarea
              v-else-if="f.type === 'pairlist'"
              :rows="3"
              :value="linesGet(draft, f.key, true)"
              class="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
              @input="linesSet(draft, f.key, $event.target.value, true)"
            ></textarea>
            <textarea
              v-else-if="f.type === 'lines'"
              :rows="3"
              :value="linesGet(draft, f.key, false)"
              class="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
              @input="linesSet(draft, f.key, $event.target.value, false)"
            ></textarea>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <button class="btn-ghost" @click="editing = null">取消</button>
          <button class="btn-primary" :disabled="busy" @click="commitEdit">保存</button>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div
        v-if="toast"
        class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-ink-900 px-5 py-3 text-sm text-white shadow-lg"
      >
        {{ toast }}
      </div>
    </transition>
  </div>
</template>
