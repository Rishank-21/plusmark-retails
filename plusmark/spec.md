# Plusmark Retail 项目开发规格说明书（spec.md）

> 本文档基于对当前仓库 `plusmark-retails` 的**完整源码分析**生成，覆盖代码目录结构、技术栈、
> 架构约定与编码规范。所有结论均来自实际文件（`package.json`、`next.config.ts`、`wrangler.jsonc`、
> `open-next.config.ts`、`app/**`、`components/**`、`lib/**`、`data/**`、`scripts/**` 等）。

---

## 0. 重要说明：这是 TypeScript / Next.js 项目，不是 Java 项目

分析当前项目后发现，仓库中**不存在任何 Java 代码**（无 `*.java`、无 `pom.xml`、无 `build.gradle`）。
项目实际是一个 **Next.js 16（App Router）+ TypeScript 营销/目录站点**。经与需求方确认，本 spec.md
按“**当前项目的真实技术栈**”撰写（选项：Actual project spec (TS)）。

若后续确有把本项目迁移/重写为 Java 后端的需求，应另起文档，不能从当前 TS 代码“推导”出 Java 技术栈。

> 命名规范（需求第 3 条）：文档中凡出现 `qoderWake` 一词，一律写作 `qoderwake`。
> （注：本仓库源码中当前没有 `qoderWake` 引用，此规则在新增文档/代码时生效。）

---

## 1. 项目概述

- **产品**：Plusmark Display System —— 印度白板 / 黑板 / 公告板 / 磁性板 / 陶瓷板 / 板架 / 写字板 /
  校用长凳 制造商的企业官网与产品目录（站点无价格、无评分、无评论，仅展示目录事实 + 询盘）。
- **形态**：内容驱动 + 询盘获客 + 轻量后台（`/admin`）的管理型网站。
- **仓库**：`github.com/Rishank-21/plusmark-retails`，分支 `main`。
- **包名**：`plusmark`（`package.json`），Node 引擎要求 `>= 22.18`。
- **规模**（源码文件计数，已排除构建产物）：`app/` 55、`components/` 87、`lib/` 20、`data/` 21、`scripts/` 20；
  26 个 `page.tsx` 路由段，5 个 `route.ts` 路由处理器，5 个 `"use server"` 服务端动作文件，61 个含 `"use client"` 的组件。

---

## 2. 技术栈

### 2.1 运行时 / 框架

| 类别 | 选型 | 版本 | 证据 |
| --- | --- | --- | --- |
| 语言 | TypeScript | ^5 | `tsconfig.json`（`strict: true`, `noEmit`, `moduleResolution: bundler`） |
| 框架 | Next.js（App Router） | ^16.4.2 | `package.json`；注意 AGENTS.md 声明“这是**非你熟悉的** Next.js”，有破坏性变更 |
| UI | React / React DOM | 19.2.8 | `package.json` |
| 样式 | Tailwind CSS v4（`@tailwindcss/postcss`） | ^4 | `postcss.config.mjs`、`app/globals.css`（`@import "tailwindcss"; @theme {…}`） |
| 动画 | Framer Motion / GSAP(+@gsap/react) | ^13.4.4 / ^3.15 | `package.json`；GSAP ScrollTrigger 驱动首页 Hero 滚动编排 |
| 3D | React Three Fiber / drei / three | ^9.8 / ^10.7 / ^0.186 | `components/three/**`、`components/hero/**` |
| 图标 | lucide-react | ^1.48 | 全站图标 |
| 校验 | Zod | ^4.6.5 | `lib/enquiry.ts`（`enquirySchema.safeParse`） |
| 数据/后端 | Firebase（Firestore + RTDB + Storage + Analytics） | firebase 12.19 / firebase-admin 14.5 | `lib/firebase-*`、`data/*`、后台管理 |
| 图片/视频 CDN | Cloudinary | cloudinary ^2.11 | `lib/cloudinary.ts`、`next.config.ts` remotePatterns |
| 部署 | Cloudflare Workers（经 OpenNext） | @opennextjs/cloudflare ^1.20 / wrangler ^4.15 | `wrangler.jsonc`、`open-next.config.ts` |

> **部署形态**：站点以 `@opennextjs-cloudflare` 把 Next 构建产物打包成 Cloudflare Worker
> （`wrangler.jsonc.main = .open-next/worker.js`），静态资产走 `ASSETS` binding，ISR + 标签缓存走 KV。
> 关键约束见 §7.5（Workers Free 单请求 10 ms CPU 限制）。

### 2.2 类型 / 路由约定

- Next 16 的**类型化路由 props**：布局用 `LayoutProps<"/">`、页面用 `PageProps<"/products/[slug]">`
  （`app/layout.tsx`、`app/products/[slug]/page.tsx`），是框架注入的全局类型，勿自行重复声明。
- 参数在 App Router 中是 Promise：`const { slug } = await params;`（异步解构是约定写法）。

---

## 3. 代码目录结构

```
plusmark/
├── app/                      # Next 16 App Router：路由、布局、服务端动作、路由处理器
│   ├── layout.tsx            # 根布局：字体、metadata、viewport、JSON-LD、设计变体引导脚本
│   ├── template.tsx          # 每次导航重新挂载的子布局壳
│   ├── globals.css           # Tailwind v4 @theme 设计令牌、全站样式、x{a-f} 设计变体类
│   ├── page.tsx              # 首页（Hero + 各 section 装配）
│   ├── products/
│   │   ├── page.tsx          # 产品总览
│   │   └── [slug]/page.tsx   # 单段同时承载“分类页”和“产品页”（slug 全局唯一）
│   ├── blog/  faq/  about/  quality/  custom-solutions/  industries/
│   ├── experience/  showroom/  contact/  buying-guide/  site-map/
│   ├── privacy-policy/  terms/
│   ├── admin/                # 受保护后台（登录 + 询盘/产品/视频/客户管理 + 上传）
│   │   ├── actions.ts        # "use server"：登录/登出/状态变更/删除 + 每 IP 限流
│   │   ├── *Manager.tsx      # 各实体的后台 CRUD 界面
│   │   └── */actions.ts / init|export/route.ts
│   ├── api/                  # 路由处理器（Route Handlers）
│   │   ├── enquiry/route.ts  # 询盘接收：限流 + Zod 校验 + 落库 + 通知投递
│   │   └── clients/route.ts
│   ├── robots.ts  sitemap.ts opengraph-image.tsx   # 元数据路由（MetadataRoute）
│   ├── error.tsx  not-found.tsx
│   └── globals.css
├── components/               # 可复用 UI / 体验组件
│   ├── hero/                 # 首页 3D Hero（GSAP ScrollTrigger + R3F），含客户端组件
│   ├── three/                # R3F 场景：ProductModel、Lighting、capabilities、错误边界
│   ├── experience/           # 滚动叙事场景、翻转、轨道展示等（重动效）
│   ├── products/             # ProductDetail/Viewer3D/筛选/尺寸/定价 等目录组件
│   ├── sections/             # 首页各区块（About/Industries/Reviews/Enquiry …）
│   ├── showroom/  media/  footer/  navbar/  analytics/  animations/
│   └── ui/                   # 基础件：Button、Breadcrumbs、JsonLd、Logo、LegalPage …
├── lib/                      # 服务端与领域逻辑（多为 "server-only"）
│   ├── catalog.ts            # 内置 data/products.ts ⊕ Firestore 管理端编辑（unstable_cache, tag=catalog）
│   ├── db.ts db-shared.ts    # 询盘存储（Firestore，服务端 Admin 适配器）
│   ├── firebase-admin.ts     # Cloudflare 兼容的 Firebase REST/OAuth-JWT 适配器（不用 Admin SDK 原生）
│   ├── firebase-config.ts    # 客户端 firebase 初始化（单例）
│   ├── admin-auth.ts         # 单管理员口令 + HMAC-SHA256 httpOnly Cookie 会话（constant-time）
│   ├── seo.ts                # siteConfig / buildMetadata / absoluteUrl / absoluteImage
│   ├── structured-data.ts    # JSON-LD 生成器
│   ├── enquiry*.ts           # 询盘类型、选项、投递（SMS/WhatsApp/Email/Webhook）
│   ├── design.ts site-settings.ts videos.ts video-embed.ts blog.ts filter.ts utils.ts …
├── data/                     # 纯 TS 内容源（目录事实的唯一来源）
│   ├── types.ts products.ts categories.ts subcategories.ts featured.ts sizes.ts …
│   └── company.ts industries.ts custom.ts quality.ts faq.ts articles.ts reviews.ts …
├── scripts/                  # Node CLI（.mts/.mjs）：资产生成与数据迁移
│   ├── generate-models.mts render-products.mts import-photos.mts   # GLB/webp/照片
│   ├── migrate-to-plusmarkleads.mjs migrate-to-cloudinary.mjs      # 一次性迁移
│   └── sync-videos.mjs test-admin-*.mjs …
├── public/                   # 静态资产：models/*.glb、images/**、draco 解码器
├── sheets/  data/            # 内容/规格表
├── *.config.ts | *.jsonc     # next / open-next / wrangler / tsconfig / eslint / postcss
└── .env(.example)  .dev.vars.example  README.md  AGENTS.md  CLAUDE.md
```

**分层心智模型**：`app/`(路由+装配) → `components/`(呈现，含 client islands) → `lib/`(领域/服务，多 server-only)
→ `data/`(内置内容) ⊕ Firestore(管理端覆盖)。3D/滚动等“仅客户端能力”被隔离在最小 islands。

---

## 4. 架构与关键约定

### 4.1 服务端 / 客户端边界（RSC-first）
- 默认服务端组件渲染全部文案、规格、面包屑与 JSON-LD（见 README「Architecture」）。
- 仅以下场景标注 `"use client"`：3D（`components/three/**`、`components/hero/**`）、滚动编排、
  筛选器、移动菜单、询盘表单、后台交互组件（`*Manager.tsx`）。
- 服务端专属模块顶部 `import "server-only";`（`lib/db.ts`、`lib/catalog.ts`、`lib/admin-auth.ts`、
  `lib/firebase-admin.ts` 均如此）——**禁止从客户端组件导入**（`admin-auth.ts` 注释明确警告）。

### 4.2 数据层：内置内容 ⊕ 管理端覆盖
- `data/products.ts` 等为“编译期事实源”，`getCatalog()` 用 `unstable_cache(..., { tags: ["catalog"] })`
  叠加 Firestore 中 `/products` 的管理端编辑：同 slug 覆盖字段、`deleted:true` 隐藏、新 slug 新增。
- **降级优先**：Firebase 不可用时回落内置目录，站点绝不因后端抖动而 500（`lib/catalog.ts` 头注释）。
- 后台保存通过 `revalidatePath(..., "layout")` / 标签失效驱动 ISR 更新。

### 4.3 Firebase 适配（Cloudflare 运行时特殊处理）
- Worker 运行时禁用 Firebase Admin SDK 依赖的 Node 代码生成 API，故 `lib/firebase-admin.ts`
  用 **OAuth-JWT + Firestore/RTDB REST** 自行实现 `DocumentSnapshot/QuerySnapshot/RestCollection/RestBatch`
  最小兼容面，暴露 `websiteFirestore()` / `leadsDb()` / `websiteStorage()`（后者在 Worker 不支持，显式 throw）。
- 服务账号 JSON **仅**从 Worker secret（`FIREBASE_TARGET_SERVICE_ACCOUNT`）读取，`private_key` 的 `\n`
  需转义还原；token 有进程内缓存（`tokenCache`，提前 60s 续期）。

### 4.4 认证与会话（`/admin`）
- 单管理员口令 `ADMIN_PASSWORD`；会话为 `httpOnly` Cookie `pm_admin`，值 `exp.HMAC-SHA256(exp, ADMIN_SESSION_SECRET)`，
  12h 过期，`secure`（生产）、`sameSite: strict`。
- 口令比对走 constant-time（两侧 HMAC 后 `timingSafeEqual`），登录对每 IP 限流（15 分钟 8 次失败）。
- `secret()` 要求密钥 ≥ 32 字符，否则视为未配置。

### 4.5 SEO / 元数据
- `lib/seo.ts`：`siteConfig`、`buildMetadata({title,description,path,image,...,noIndex,absoluteTitle})` 统一产出
  `alternates.canonical` + OG + Twitter + robots；OG 缺图回落品牌卡（`/opengraph-image`，1200×630）。
- 元数据路由：`app/sitemap.ts`（静态段 + 分类/子分类/产品/博客，`lastmod` **仅在有真实时间戳时**输出，
  杜绝“每次请求都盖时间戳”导致爬虫忽略 lastmod）、`app/robots.ts`（禁 `/api/`、`/admin`）、
  `app/opengraph-image.tsx`（文件约定）。
- JSON-LD 注入统一经 `components/ui/JsonLd.tsx`，且 `JSON.stringify(...).replace(/</g,"\\u003c")` 防脚本注入。

### 4.6 安全响应头与图片
- `next.config.ts.headers()`：全站 `X-Content-Type-Options: nosniff`、`Referrer-Policy`、`X-Frame-Options: SAMEORIGIN`、
  `Permissions-Policy`；HTML/RSC 一律 `no-store`，`/_next/static`、`/images`、`/models`、`/draco` `immutable`。
- 图片 `unoptimized: true`（Cloudflare 图像优化器有 HTTP/2 ping 间歇故障，且资产已在 Cloudinary/静态缓存）；
  远程仅允许 `res.cloudinary.com/drt0rpkn2/image/upload/**`，本地允许 `/images/products|aplus/**`（带 `?v=` 内容哈希缓存串）。
- 域名规范化在 `next.config.ts.redirects()`（**不用** Next 16 的 `proxy.ts`，因其跑在 Node 运行时、OpenNext 无法为 Cloudflare 打包）：
  `www.plusmarkboards.com` → apex `plusmarkboards.com`（301 永久）。

### 4.7 设计变体（A–F）与站点设置
- 首页/展厅有 6 套设计变体（README §Design variants），URL `?design=a..f` 切换，写入 `localStorage: plusmark:design`；
  变体以 `app/globals.css` 中 `.x{a-f}` 作用域 CSS 实现，**不新增路由**。
- 变体 B–F 未进 sitemap 且带 `noindex`；A 用 `x-hide-media` 隐藏重复产品媒体避免 SEO 稀释。
- `lib/design.ts` 提供 `CUSTOM_HOME_PATHS` 与 `designBootScript()`（首屏前应用选择，见 `app/layout.tsx` `<head>`）。
- 公开默认变体可在后台“站点设置”配置（`lib/site-settings.ts`），无 `?design` 参数时作为回退。

---

## 5. 编码规范（Coding Conventions）

### 5.0 代码风格（Code Style）
> 项目**没有** Prettier / EditorConfig 配置文件；风格由 ESLint（`eslint-config-next` 的
> `core-web-vitals` + `typescript`）约束 + 现有代码约定共同维持。新增代码请**贴合既有观感**。

实测代码（`lib/`、`app/`、`components/`）确立的硬性风格：

| 维度 | 约定 | 依据 |
| --- | --- | --- |
| 缩进 | **2 空格**，不用 Tab | `app/sitemap.ts` 缩进直方图全为 2 的倍数 |
| 引号 | **双引号** `"…"`（含 JSX 属性、import 源） | 全仓 import/字符串均为 `"…"` |
| 分号 | **保留**行末分号 | `lib/catalog.ts` 91、`lib/seo.ts` 20 处行尾 `;` |
| 尾逗号 | 多行对象/数组/参数**保留尾逗号** | `app/sitemap.ts` `[...], ,` |
| 行宽 | 约 100–120 列软上限，长表达式换行续缩进 | `lib/db.ts`、`next.config.ts` |
| 模板串 | 插值一律用反引号模板字符串 | `firebase-admin.ts` URL 拼接 |
| type-only 导入 | 纯类型用 `import type { … }` | 遍布 `app/`、`lib/` |
| 别名导入 | 一律 `@/…`，不用相对 `../../` | `tsconfig.json.paths` + 现有代码 |
| 导出形态 | `lib`/`components` **命名导出**（129 `export function`、74 `export const`）；`app/**/page|layout|route|sitemap|robots` 用 **`export default`**（路由入口约定，35 处） | 计数来自全仓 grep |
| 辅助函数 | 模块内私有小函数用 `const fn = (x) => …` 箭头表达式；导出谓词加显式返回类型 | `const str = (v: unknown) => …`、`export const isEnquiryId = (id: string): boolean => …` |
| 常量 | 枚举式常量数组/对象加 `as const` | `navLinks`、`ENQUIRY_STATUSES` 等（6 文件） |
| 异步 | `async` 函数 + `try/catch` 只在边界；`Promise.all` 并行取数 | `lib/db.ts` `loadAll()`、`app/sitemap.ts` |

**风格红线**：不改现有 R3F `useFrame` 命令式写法（§5.6）；注释解释“为什么/为什么放这里”，
不复述代码在做什么；服务端模块首行保持 `import "server-only";`。

### 5.1 语言与类型
- TypeScript `strict` 全开；优先显式领域类型，跨层共享类型放 `data/types.ts`（`Category`、`Product`、`Spec`、
  `CategorySlug`、`Series` 等）。`type` 与 `interface` 按语义选择；`as const` 用于枚举式常量（`navLinks`）。
- 运行时边界数据（来自 Firestore/请求体）一律经**净化器**转换：`lib/catalog.ts` 的 `strings()/specs()/isAllowedImage()`、
  `lib/db.ts` 的 `str()/toRecord()`——不要信任库中形状，逐字段校验并回落默认值。
- Zod 用于 API 入站校验（`lib/enquiry.ts` → `enquirySchema.safeParse`），返回结构化 `fieldErrors` + 422。

### 5.2 导入与路径别名
- 统一用别名 `@/*`（`tsconfig.json.paths`）：`@/lib/...`、`@/components/...`、`@/data/...`。
- 相邻内容源可带扩展名导入（如 `@/data/company.ts`，配合 `allowImportingTsExtensions`）。
- 服务端模块首行 `import "server-only";`。

### 5.3 文件与导出布局
- 每个源文件顶部用块注释 `/** … */` 说明**职责与关键权衡**（`lib/`、`app/admin/actions.ts`、`lib/seo.ts` 均如此，
  注释解释“为什么这样设计/为什么放这里”，而非复述代码）。
- 路由处理器：`export async function POST(req: Request)` + `NextResponse.json(...)`；元数据路由 `export default function`。
- 服务端动作：文件首行 `"use server";`，函数 `async`，改状态后 `revalidatePath()`。
- 组件：命名导出为主（`export function Navbar`），Props 用具名 `interface`；client 组件首行 `"use client";`。

### 5.4 命名
| 对象 | 规范 | 示例 |
| --- | --- | --- |
| 变量/函数 | camelCase | `buildMetadata`、`getCatalog`、`requireAdmin` |
| 类型/接口/组件 | PascalCase | `EnquiryRecord`、`ProductDetail`、`JsonLd` |
| 常量/枚举标签 | SCREAMING_SNAKE | `COLLECTION`、`CATALOG_TAG`、`MAX_SCAN`、`WINDOW` |
| 布尔取值函数 | `is*` / `has*` | `isAllowedImage`、`isEnquiryStatus`、`websiteFirebaseConfigured` |
| 文件 | 路由段用 Next 约定名（小写）；组件/模块 PascalCase 或 kebab | `page.tsx`、`AdminNav.tsx`、`enquiry-delivery.ts` |

### 5.5 样式
- Tailwind v4 单一入口：`app/globals.css` 的 `@theme` 内声明**设计令牌**（`--color-*`、`--shadow-*`、
  `--font-*`、`--ease-premium`、`--animate-*`、`@keyframes`）；组件用 utility 组合，颜色语义化（`bg-paper`、`text-graphite`、
  `border-line`、`text-accent`、`bg-brand`、`text-flame`）。
- 自定义断点/变体用 `@custom-variant`（如 `xe-split`）。避免硬编码 hex，优先引用 `@theme` 令牌。

### 5.6 3D / 动效特例（ESLint 例外）
- `eslint.config.mjs` 对 `components/three/**`、`components/hero/**`、`components/products/ViewerCanvas.tsx`
  关闭 `react-hooks/immutability`（R3F 在 `useFrame` 内**命令式改写场景对象**是既定模式，不得触发重渲染）。
- 全局关闭 `react-hooks/set-state-in-effect`（读取仅浏览器可用值/URL 参数需在挂载后 setState 以保持 SSR/CSR 一致）。
- 能力探测：无 WebGL / 低端设备 / `Save-Data` / `?no3d` → 回落产品图；模型仅加载“当前+前后各一”，下一个预加载，
  离屏暂停渲染，canvas DPR 自适应（`components/three/capabilities.ts`、`ModelErrorBoundary.tsx`）。

### 5.7 质量门（提交前必须全绿）
```bash
npm run lint        # eslint（flat config，含上述例外）
npm run typecheck   # next typegen && tsc --noEmit
```
- 无独立单测框架；行为验证用 `scripts/test-admin-*.mjs`、以及本地 `npm run preview:cloudflare` 实测。
- 关键路径必须**真机/真实 Worker 验证**（README：`/api/enquiry`、`/admin` 登录与 CRUD 需在部署后实测，
  本地 dev 无 Worker 密钥会走内置目录回落）。

---

## 6. 构建 · 运行 · 部署（命令）

```bash
npm install                       # Node >= 22.18

# 本地开发
cp .env.example .env.local        # 填必要变量（见 §7.4）
npm run dev                        # http://localhost:3000（无 Firebase 密钥→内置目录回落）

# 校验
npm run lint
npm run typecheck

# 生产（纯 Next）
npm run build && npm start

# Cloudflare Workers（实际部署形态，经 OpenNext）
npm run build:cloudflare           # opennextjs-cloudflare build
npm run preview:cloudflare         # 本地 wrangler dev，注入 .dev.vars
npm run deploy:cloudflare          # 构建 + 发布
npm run upload:cloudflare          # 上传 Worker secrets（含 Firebase 服务账号）

# 资产生成
npm run assets:models              # 生成 public/models/*.glb（Draco 压缩）
npm run assets:renders             # 渲染产品图
npm run assets:placeholders        # 生成占位图
npm run assets                     # 以上三者

# 迁移
npm run migrate:plusmarkleads
```

> **禁止**用本地构建产物预填 KV（`opennextjs-cloudflare populate-cache`）：本地无 Firestore 访问，
> 生成的 HTML 缺管理端数据，会被当作缓存命中提供出去（`open-next.config.ts` 注释明确警告）。

---

## 7. 配置 · 环境变量 · 密钥

### 7.1 环境解析（Cloudflare vs Node）
- `lib/firebase-config.ts` 的 `readEnv(key)`：Worker 运行时读 `process.env`（由 secrets 注入），
  Node dev 读 `.env.local`（dotenv）。
- 本地 `wrangler dev` 从 `.dev.vars` 读取（模板 `.dev.vars.example`）；生产走 Worker Secrets。

### 7.2 公开变量（`NEXT_PUBLIC_*`）
`NEXT_PUBLIC_SITE_URL`、`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`(默认 `drt0rpkn2`)、
`NEXT_PUBLIC_FIREBASE_*`（apiKey/projectId 等有内置默认）、`NEXT_PUBLIC_WHATSAPP_NUMBER`、
`NEXT_PUBLIC_CONTACT_PHONE/EMAIL`。

### 7.3 服务端密钥（严禁提交；`.gitignore` 已排除 `.env`/`.dev.vars`）
- 后台：`ADMIN_PASSWORD`、`ADMIN_SESSION_SECRET`（≥32 随机字符，
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`）。
- Firebase 目标项目（`plusmarkleads`）：`FIREBASE_TARGET_SERVICE_ACCOUNT`（整段 JSON 单行）或
  `FIREBASE_TARGET_CLIENT_EMAIL` + `FIREBASE_TARGET_PRIVATE_KEY`；`FIREBASE_TARGET_DATABASE_URL`、
  `FIREBASE_TARGET_STORAGE_BUCKET`、`FIREBASE_TARGET_PROJECT_ID`。
- Cloudinary 签名上传：`CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`。
- 询盘通知：`FAST2SMS_API_KEY` / `TWILIO_*` / `WHATSAPP_*` / `CALLMEBOT_*` / `SMS_GATEWAY_URL` /
  `ENQUIRY_WEBHOOK_URL` / `RESEND_API_KEY` / `ENQUIRY_TO_EMAIL` / `ENQUIRY_FROM_EMAIL`。

### 7.4 `.env.example` 与代码键不一致（已知坑）
`.env.example` 里写的是 `NEXT_PUBLIC_FIREBASE_STORAGE_*` 键名，而 `lib/firebase-config.ts`
`readEnv()` 实际读取 `FIREBASE_STORAGE_BUCKET` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` /
`FIREBASE_DATABASE_URL` / `FIREBASE_PROJECT_ID`（无 `NEXT_PUBLIC_` 前缀）。新增密钥时**以 `readEnv` 的
字符串为准**，或先对齐命名，避免“配了但不生效”。

### 7.5 Cloudflare Workers 运行时约束（架构级）
- Workers Free 单请求 **10 ms CPU** 上限；冷启动本身即 ~16 ms。默认 `dummy` 增量缓存只在单个 isolate 内，
  冷启动后会在请求期重渲染 → 触发 error 1102 → **503**。
- 解决：`open-next.config.ts` 用 **KV 增量缓存 + KV 标签缓存**（`kvIncrementalCache` / `kvTagCache`，
  `queue: "direct"`），使页面“每个重验证窗口渲染一次”而非“每次访问渲染一次”；`wrangler.jsonc`
  绑定 `NEXT_INC_CACHE_KV` / `NEXT_TAG_CACHE_KV`。
- `firebase-admin` 依赖会经可选 peer `@opentelemetry/api` 泄漏进输出 → 这也是把 host 重定向放在
  `next.config.ts` 而非 `proxy.ts` 的原因之一（§4.6）。

---

## 8. 数据与内容源

- **目录事实唯一来源** = `data/`（README: products/categories/featured/visuals/company/industries/custom/quality…）。
- 目录仅“按名列出”的产品（板架、存储、校用长凳）标 `catalogDetail: "listing"`，页面提示“规格请询”，
  站点**不含价格/评分/评论/SKU/统计**——新增内容不得引入这些（内容红线）。
- 管理端在 `/admin/products` 的编辑落 Firestore `products`，经 `getCatalog()` 覆盖内置数据（§4.2）。
- 询盘落 Firestore `website_enquiries/{id}`（毫秒时间戳 `createdAt`），公开访问由 `database.rules.json` 拒绝，
  仅服务端读写；`/admin` 展示并可改状态/删除，可选 webhook/email 投递（`lib/enquiry-delivery.ts`）。

---

## 9. 测试与验证策略

1. 静态门：`npm run lint` + `npm run typecheck`（含 `next typegen` 生成路由类型）。
2. 本地：`npm run dev` 验证渲染与交互；`npm run preview:cloudflare` + `.dev.vars` 验证 Worker 路径。
3. 部署后实测（本地无法覆盖 Worker 密钥注入）：
   - `GET /api/enquiry` 限流（>5/10min → 429）与校验（400/422）；有效询盘落库并在 `/admin/enquiries` 可见。
   - `/admin/login`：`/init` 初始化、口令登录（错误口令返回 `Incorrect password.`）、会话 Cookie 生效、
     products/enquiries/visits 正常。
4. 后台/数据类脚本级验证：`scripts/test-admin-crud.mjs`、`scripts/test-admin-features.mjs`。
5. SEO 事实核查：`/sitemap.xml` 的 `lastmod` 是否为真实时间戳、canonical 与 sitemap URL 是否逐字一致、
   `/robots.txt` 是否禁 `/api/` `/admin`。

---

## 10. 贡献约定摘要（Checklist）

- [ ] 内容改动优先落在 `data/`；不要在组件里硬编码目录事实。
- [ ] 服务端逻辑放 `lib/` 且 `import "server-only"`；client island 最小化（3D/滚动/表单/筛选/移动菜单）。
- [ ] 库/请求等**外部数据**经净化器/Zod 校验，永不信任形状。
- [ ] 元数据统一经 `lib/seo.ts:buildMetadata`；JSON-LD 统一经 `components/ui/JsonLd`（保留 `<` 转义）。
- [ ] 新增/修改后台保存要触发 `revalidatePath`/标签失效。
- [ ] 样式令牌加到 `app/globals.css @theme`，不要在组件内散落 hex。
- [ ] 涉及 Worker 行为（缓存、Firebase、限流）部署后实测；禁止本地 populate-cache。
- [ ] 提交前 `lint` + `typecheck` 全绿；遵守 §5.6 的 ESLint 例外（勿误改 R3F 命令式写法）。
- [ ] 遵循本文件对 `qoderWake → qoderwake` 的书写规范。

---

*本文档由对 `plusmark-retails` 仓库的静态分析生成；“Java” 相关诉求已在 §0 说明并选择按真实 TS 技术栈撰写。*
