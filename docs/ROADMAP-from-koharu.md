# 基于 astro-koharu 的博客搭建路线图

你已用 `npm create astro@latest` 创建了 astro-lyratu，自带「博客模板」：Content Collections、文章列表、文章详情、关于页、RSS。下面按阶段对照 astro-koharu 逐步增强。

---

## 当前已有（无需重做）

- `src/content/blog/`：博文 Markdown/MDX
- `src/content.config.ts`：博客 collection，schema 含 title、description、pubDate、updatedDate、heroImage
- `src/pages/index.astro`、`blog/index.astro`、`blog/[...slug].astro`、`about.astro`、`rss.xml.js`
- `src/layouts/BlogPost.astro`、`src/components/`（Header、Footer、BaseHead 等）

---

## 阶段一：基础工程化（优先做）

### 1.1 安装 Tailwind CSS

```bash
pnpm add -D tailwindcss @tailwindcss/vite
```

在 `astro.config.mjs` 的 `defineConfig` 里加入：

```js
import tailwind from '@tailwindcss/vite';

export default defineConfig({
  vite: { plugins: [tailwind()] },
  // ...
});
```

新建或合并 `src/styles/global.css`，加入 Tailwind 指令：

```css
@import "tailwindcss";
```

**参考**：astro-koharu 的 `src/styles/`、`tailwind.config.*`（若存在）。

### 1.2 站点配置集中管理

- 在项目根目录建 `config/site.yaml`（或 `src/constants/site.ts`），放站点标题、描述、作者、URL、时区等。
- 在代码里用 `import` 或 Astro 的 `loadConfig` 读取，避免魔法字符串。

**参考**：`astro-koharu/config/site.yaml`、`src/constants/site-config.ts`。

### 1.3 路径别名（和 koharu 对齐）

在 `tsconfig.json` 的 `compilerOptions` 里加：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@layouts/*": ["src/layouts/*"],
      "@lib/*": ["src/lib/*"],
      "@content/*": ["src/content/*"]
    }
  }
}
```

在 `astro.config.mjs` 的 `vite.resolve.alias` 里配同样别名（或用 Astro 自带方式），这样可以用 `@/components/Header.astro` 等。

**参考**：astro-koharu 的 `tsconfig.json`。

---

## 阶段二：内容模型与路由（对齐 koharu）

### 2.1 扩展 frontmatter schema

在 `src/content.config.ts` 里为博客增加可选字段，便于后续做分类、标签、列表展示：

- `tags: z.array(z.string()).optional()`
- `categories`：字符串或字符串数组（可参考 koharu 支持层级分类）
- `cover` 或 `heroImage`（你已有 heroImage，可保留）
- `draft: z.boolean().optional()`（草稿不参与列表）
- `sticky: z.boolean().optional()`（置顶）

构建时用 `getCollection('blog', ({ data }) => !data.draft)` 过滤草稿。

**参考**：`astro-koharu/src/content/config.ts`（BlogSchema、date 处理等）。

### 2.2 分类与标签路由

- 新建 `src/pages/categories/`：例如 `index.astro`（分类列表）、`[slug].astro` 或 `[...slug].astro`（某分类下的文章列表）。
- 新建 `src/pages/tags/`：`[tag].astro`、`index.astro`。

从 `getCollection('blog')` 里推导出所有 categories、tags，生成静态路径；列表页用 `getCollection` 再按 category/tag 过滤。

**参考**：`astro-koharu/src/pages/categories/`、`src/pages/tags/`，以及 `src/lib/content/` 下的分类/标签工具函数。

### 2.3 工具函数抽到 lib

- `src/lib/posts.ts`（或 `content/posts.ts`）：获取已发布文章、按日期排序、按分类/标签筛选等。
- `src/lib/categories.ts`、`src/lib/tags.ts`：从文章中聚合出分类/标签列表。

**参考**：`astro-koharu/src/lib/content/`（posts、categories、tags、transforms）。

---

## 阶段三：布局与组件

### 3.1 统一布局结构

- 一个主布局 `src/layouts/Layout.astro`：包含 `<head>`、Header、主内容区、Footer；接受 `title`、`description` 等 props。
- `BlogPost.astro` 继承或复用该布局，只负责文章标题、日期、正文容器和样式。

**参考**：`astro-koharu/src/layouts/Layout.astro`、`PageLayout.astro`。

### 3.2 首页与列表页组件

- 首页：可放「最新几篇文章」+ 站点简介；用 `getCollection('blog')` 取数据，传入列表组件。
- 文章列表组件：接收 `posts`，渲染为卡片列表（标题、摘要、日期、链接）；可再拆成 `PostCard.astro`。

**参考**：`astro-koharu/src/pages/index.astro`、`src/components/post/PostItemCard.astro`、`PostList.astro`。

### 3.3 样式与主题

- 在 `src/styles/` 下用 Tailwind 维护：全局样式、排版、文章正文样式（prose）、组件样式。
- 若要暗色/亮色切换，可先做 CSS 变量 + 一个 class 切换（如 `data-theme="dark"`），不必先上 React。

**参考**：`astro-koharu/src/styles/`（theme、markdown、components）。

---

## 阶段四：交互与增强（可选）

### 4.1 需要交互时再上 React

- 安装：`pnpm add @astrojs/react react react-dom`，在 `astro.config.mjs` 里 `integrations: [react()]`。
- 仅对需要状态的组件用 `.tsx`（如主题切换、搜索框、目录高亮），其余保持 Astro。

**参考**：astro-koharu 的 `components/theme/ThemeToggle.tsx`、`layout/SearchDialog.tsx`。

### 4.2 搜索、评论、RSS

- 搜索：可后期加 Pagefind（`astro-koharu` 用的）或 Algolia 等。
- 评论：Giscus / Waline 等，用 Astro 或 React 嵌一层即可。
- RSS：你已有 `rss.xml.js`，保持并随 schema 扩展（如加 tags）即可。

---

## 学习时建议对照的 koharu 文件

| 目标           | 参考路径 |
|----------------|----------|
| 内容 schema    | `astro-koharu/src/content/config.ts` |
| 站点配置       | `astro-koharu/config/site.yaml`、`src/constants/site-config.ts` |
| 文章/分类/标签 | `astro-koharu/src/lib/content/posts.ts`、`categories.ts`、`tags.ts` |
| 路由与列表     | `astro-koharu/src/pages/index.astro`、`categories/`、`tags/`、`post/` |
| 布局           | `astro-koharu/src/layouts/` |
| 列表与卡片     | `astro-koharu/src/components/post/PostList.astro`、`PostItemCard.astro` |
| 样式结构       | `astro-koharu/src/styles/` |

---

## 建议执行顺序（小结）

1. **阶段一**：Tailwind、站点配置、路径别名 → 先跑通构建和样式。
2. **阶段二**：扩展 schema → 分类/标签页与 lib 工具 → 内容侧和 koharu 对齐。
3. **阶段三**：统一布局、首页与列表组件、基础主题样式 → 观感完整。
4. **阶段四**：按需加 React、搜索、评论等。

每完成一小步就 `pnpm build` 和 `pnpm dev` 看一下效果，再对照 koharu 对应文件查漏补缺。这样可以在 astro-lyratu 里一步步搭出「仿照 koharu 结构」的博客，而不必一次性迁移整个 koharu。
