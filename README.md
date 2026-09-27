# 健康工程实验室课题组官网

四川大学建筑与环境学院「健康工程实验室」官方网站。Vue 3 + Vite 静态站点，中英双语，内容全部由 `src/data/*.json` 驱动——**改内容不需要改代码**。

---

## 一、本地运行与发布

```bash
# 首次安装依赖（Node 18+，本机受管版本路径见下）
npm install

# 本地开发 http://localhost:5173
npm run dev

# 出包：生成 dist/index.html（单文件，JS/CSS 全部内联）
npm run build

# 本地预览打包结果
npm run preview

# 渲染冒烟测试：逐路由检查中英双语是否正常渲染
npm run smoke
```

Windows 本机若 `node` 不在 PATH，先执行：

```bash
export PATH="/c/Users/11876/.workbuddy/binaries/node/versions/22.22.2-3:$PATH"
```

### 产物特点

`npm run build` 只产出一个 `dist/index.html`（约 290 KB，已内联 JS/CSS/字体图标）：

- 可直接**双击用 Edge/Chrome 打开**（不需要服务器，也不会被跨域策略拦截）；
- 也可直接上传到 GitHub Pages、Gitee Pages、任意虚拟主机或子目录。

---

## 二、内容怎么改（核心：只用改 JSON）

所有内容在 `src/data/` 下，共 5 个文件。改完执行 `npm run build` 重新出包即可。

| 文件 | 管什么 |
|---|---|
| `site.json` | 实验室名称、简介、联系方式、研究方向、最新动态 |
| `members.json` | 团队成员（PI / 教师 / 博士生 / 硕士生 / 毕业生） |
| `publications.json` | 论文、教材专著 |
| `projects.json` | 科研项目 |
| `activities.json` | 日常活动与相册 |

### 双语规则

凡需要中英双语的字段，写成对象：

```json
"name": { "zh": "健康工程实验室", "en": "Health Engineering Laboratory" }
```

只写 `"zh"` 时，英文界面会中文兜底显示，不会报错。论文标题、作者、期刊名这类**本来就是英文**的内容，直接写字符串即可。

### 1. 改实验室信息 / 联系方式 —— `site.json`

```json
"email": "bmeliuzhan@163.com",
"phone": "028-85405140",
"location": { "zh": "通讯地址", "en": "Address" }
```

改 `intro` 即改首页简介；`links` 是页脚常用链接；`researchAreas` 是首页与研究页的四个方向卡片（增删数组元素即可）。

### 2. 加/删/改成员 —— `members.json`

**新增成员**：在数组里追加一项（`role` 决定分组，页面自动分组显示）：

```json
{
  "id": "m-zhangsan",
  "name": { "zh": "张三", "en": "San Zhang" },
  "role": "phd",
  "title": { "zh": "博士研究生（一年级）", "en": "Ph.D. Student (1st year)" },
  "email": "san.zhang@example.com",
  "homepage": "",
  "scholar": "",
  "photo": "images/zhangsan.jpg",
  "year": "2025",
  "interests": [{ "zh": "口腔生物力学", "en": "Oral Biomechanics" }],
  "bio": { "zh": "个人简介…", "en": "Biography…" }
}
```

- `role` 取值：`pi`（学术带头人）、`faculty`（教师）、`phd`（博士生）、`master`（硕士生）、`alumni`（毕业生）。
- **删除成员**：删掉该对象即可。
- **换头像**：把照片放到 `public/images/`，填 `"photo": "images/zhangsan.jpg"`；不填则自动用渐变字母头像。
- 空数组或某组没有成员时，该分组自动隐藏，不会留白。

### 3. 加/删/改论文 —— `publications.json`

```json
{
  "id": "p051",
  "title": "论文题目（保留原文语言）",
  "authors": "Liu Z, Shao BM*, Fan YB",
  "venue": "J Biomech. 2026, 200: 112000",
  "venueShort": "J Biomech",
  "year": 2026,
  "type": "journal",
  "highlight": true,
  "doi": "",
  "url": "",
  "summary": { "zh": "一句话中文说明（可留空）", "en": "One-line summary (optional)" }
}
```

- `type`：`journal`（期刊）、`book`（教材专著）、`conference`（会议）、`patent`（专利）。
- `highlight: true` 会在右上角标"代表作"，并出现在首页"代表性论著"。
- **BibTeX 自动生成**，不用手写；页面上可单篇复制，也可一键导出当前筛选结果。
- 有 DOI 时把 `"doi": "10.xxxx/xxx"` 填上，页面会自动生成 DOI 链接。

### 4. 加/删/改项目 —— `projects.json`

```json
{
  "id": "p-nsfc-04",
  "name": { "zh": "项目中文名", "en": "Project title in English" },
  "category": "nsfc",
  "pi": "刘展",
  "role": { "zh": "主持", "en": "PI" },
  "period": "2026.01-2029.12",
  "amount": "￥ 50 万",
  "desc": { "zh": "", "en": "" }
}
```

`category` 可取值：`nsfc`、`nsfc-key`、`central`、`cooperation`、`university`、`horizontal`（显示在研究页的分类标签，中文名在 `src/i18n/locales/zh.js` 的 `research.cat*`）。`period`/`amount`/`desc` 可留空，页面会自动隐藏空字段。

### 5. 加/删/改活动与相册 —— `activities.json`

```json
{
  "id": "act-2026-09",
  "date": "2026-09-20",
  "category": "seminar",
  "location": { "zh": "生物力学工程省重点实验室", "en": "Key Lab of Biomechanical Engineering" },
  "title": { "zh": "活动标题", "en": "Event title" },
  "desc": { "zh": "活动描述", "en": "Description" },
  "images": ["images/act1.jpg", "images/act2.jpg"]
}
```

- 图片放 `public/images/`，在 `images` 数组里写路径（相对 `public/`），灯箱支持左右键/ESC。
- 若暂时没有照片，可删掉 `images`、改用 `"photos": 4`，系统会生成 4 张渐变占位图。
- 该文件为空数组时，页面显示"暂无活动记录"。

### 6. 改界面文案 —— `src/i18n/locales/{zh,en}.js`

导航、按钮、统计栏、页脚等固定文字都在这里，例如 `nav.members`、`footer.copyright`。两个文件保持键名一致即可。

---

## 三、放到 GitHub 上运行（两种做法）

### 做法 0：先把本地代码推上去（只需做一次）

```bash
cd 项目目录
git init -b main
git add .
git commit -m "feat: 健康工程实验室官网"

# 在 GitHub 网页上新建空仓库后，把 <用户名> <仓库名> 换成你自己的
git remote add origin https://github.com/<用户名>/<仓库名>.git
git push -u origin main
```

仓库名两种选择：

- `<用户名>.github.io` → 访问 `https://<用户名>.github.io/`（个人/课题组主页，路径最短）
- 任意名如 `hel-lab-site` → 访问 `https://<用户名>.github.io/hel-lab-site/`

两种站点都已在 `vite.config.js` 中用相对路径 + hash 路由处理好，无需额外配置。

### 做法 A：GitHub Actions 自动部署（推荐）

仓库里已带 `.github/workflows/deploy.yml`：推送到 `main` 后自动 `npm ci → npm run build → 发布到 GitHub Pages`。

步骤：

1. 新建仓库并推送代码（**不要**把 `node_modules` 推上去，已有 `.gitignore`）；
2. 进入仓库 **Settings → Pages → Source**，选 **GitHub Actions**；
3. 推送一次提交，Actions 跑完后会给出访问地址 `https://<用户名>.github.io/<仓库名>/`。

### 做法 B：只托管成品文件

如果不想跑构建，把 `dist/index.html` 复制到仓库根目录提交，然后 Settings → Pages → Deploy from branch → 选分支和根目录。因为产物是单文件，这样也能直接访问。

> 提示：GitHub Pages 访问路径带仓库名（子目录），本项目已使用相对路径 + hash 路由，子目录部署无需任何配置。

---

## 四、其他免费托管平台（可任选，也可同时部署多份）

| 平台 | 免费额度 | 国内访问 | 实名/备案 | 说明 |
|---|---|---|---|---|
| **GitHub Pages** | 免费（软限 1GB/月流量、100GB 存储） | 一般，部分地区较慢 | 不需要 | 本项目已内置自动部署流程，最省心 |
| **Cloudflare Pages** | 免费，流量不限 | 中等偏好 | 不需要 | 全球 CDN，支持 Git 自动构建 |
| **Netlify** | 免费 100GB/月 | 中等 | 不需要 | 自带表单、分支预览 |
| **Vercel** | 免费 Hobby 计划 | 一般 | 不需要 | 构建快，前端体验好 |
| **Gitee Pages** | 免费（需实名、仓库公开） | 快 | 需要 | 规则时有调整，以 Gitee 官网当前说明为准 |
| **腾讯云 EdgeOne Pages** | 有免费额度 | 快（国内节点） | 需要实名 | 适合作为国内主站 |
| **阿里云 OSS 静态网站** | 按量计费（小站约几元/月） | 快 | 需要实名 | 稳定，需绑定域名 |
| **学院/学校服务器** | 免费 | 校内最快 | 无 | 建议挂在学院官网子目录，如 `acem.scu.edu.cn/hel/` |

> 平台政策经常变化，上表为一般情况，实际以各平台官网为准。

### 怎么选

- **想最省心、国际可访问**：GitHub Pages（本项目已配好，推送即上线）。
- **主要面向国内招生/合作**：Cloudflare Pages 或国内平台；最稳妥的是请学院网管在学院官网下开一个子目录，把 `dist/index.html` 拷进去即可（单文件，零配置）。
- **双保险**：GitHub Pages + 国内平台各部署一份，内容一致，互不影响。

### 自定义域名（可选）

GitHub 仓库 **Settings → Pages → Custom domain** 填入域名（如 `hel.scu.edu.cn`），然后到你的域名解析商加一条 CNAME 记录指向 `<用户名>.github.io`。GitHub 会自动签发 HTTPS 证书。

## 五、版权与许可

- **源代码**：MIT 许可（见 `LICENSE`），可自由使用、修改和分发。
- **网页内容与图片**：文字、数据（成员/论文/项目清单）、照片以及实验室名称与标识，版权归**四川大学健康工程实验室**所有；未经书面许可不得用于商业用途或整体复制建站。

### 邮箱防爬说明

页面上的邮箱渲染为 `bmeliuzhan [at] 163.com`，真实地址在点击时由 JS 组装成 `mailto:` 打开——**查看网页源码（含打包后的 `index.html`）都看不到完整邮箱**，可显著降低爬虫抓取，同时不影响正常访客一键发信。

因此：若你在 `src/data/*.json` 里更换联系邮箱，页面会自动套用同样的防爬显示，无需额外处理。

> **想更彻底？** 把 `src/data/site.json`、`members.json` 里的邮箱直接写成 `bmeliuzhan [at] 163.com` 形式即可——代码已兼容两种写法，这样连打包后的 JS 内部也不会出现 `@` 形式的完整邮箱。

## 六、常见问题

- **双击 index.html 打不开？** 用 `npm run build` 产出的 `dist/index.html`（单文件版）即可，不要在 `src` 上直接改 HTML。
- **改了 JSON 但页面没变？** 必须重新 `npm run build`；本地开发时用 `npm run dev` 会自动热更新。
- **中文乱码？** 请保持文件为 UTF-8 编码保存（VS Code 默认即是）。
- **英文界面有中文？** 说明该字段只写了 `zh`，补上 `en` 即可。
