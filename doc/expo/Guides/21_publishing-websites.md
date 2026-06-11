# Publish websites 学习整理

## 文档解决的问题

这篇文档解决的是：Expo Web 项目在完成开发后，如何导出生产构建、如何本地模拟生产托管方式，以及如何部署到不同托管平台。

对 React Web 开发者来说，这篇文档最关键的点不是“怎么 build”，而是 Expo 网站有不同输出模式，不同平台的部署配置要跟输出模式匹配。

## 适用场景

- 你已经能用 Expo 开发网站，现在要部署上线。
- 你需要理解 `web.output` 对部署结果的影响。
- 你要在 EAS、Netlify、Vercel、Amplify、Firebase、GitHub Pages 中选择一种托管方式。
- 你想在本地先按生产方式测试 Web 构建。

## 核心概念

### 输出目标（output targets）

文档把 Expo Router 的 Web 输出分成三类：

- `single`：默认值，输出单页应用（SPA），只有一个 `index.html`
- `server`：输出 `client` 和 `server` 目录，支持 API Routes，需要自定义 Node.js 服务器托管
- `static`：为 `app` 目录中的每个路由生成单独 HTML

这三种模式的差异，会直接影响：

- 是否需要重写所有路由到 `index.html`
- 是否能部署 API Routes
- 是否有独立 HTML 可被静态索引

## 关键流程

### 1. 在 `app.json` 中确定 Web 输出模式

示例：

```json
{
  "expo": {
    "web": {
      "output": "server",
      "bundler": "metro"
    }
  }
}
```

这里的重点不是语法，而是你要先明确自己做的是：

- SPA
- 静态站点
- 带服务端能力的网站

### 2. 导出生产构建

```sh
npx expo export -p web
```

文档说明：

- 导出产物位于 `dist/`
- `public/` 目录中的文件也会复制到 `dist/`

### 3. 本地按生产方式预览

```sh
npx expo serve
```

访问：

- `http://localhost:8081`

文档特别提醒：这是 **HTTP only**，因此权限、相机、定位等依赖安全上下文的能力可能表现不正常。

### 4. 选择托管方案

文档推荐：

- **EAS Hosting**：最佳特性支持

也列出了第三方或自托管选项：

- Netlify
- Vercel
- AWS Amplify Console
- Firebase Hosting
- GitHub Pages

## 各托管平台的关键信息

### EAS Hosting

文档明确推荐，理由是支持自定义域名、SSL 等特性。

### Netlify

适合较少框架假设的托管平台。

对于 `web.output: "single"` 的 SPA，文档要求创建：

- `public/_redirects`

内容是：

```sh
/*    /index.html   200
```

作用是把所有路由都重写到 `index.html`。

### Vercel

需要在项目根目录创建：

- `vercel.json`

文档给出了完整示例，核心是：

- `buildCommand: "expo export -p web"`
- `outputDirectory: "dist"`
- 对 SPA 做 rewrites，把所有路径指向 `/`

如果你用了静态渲染，还可能需要额外配置动态路由。

### AWS Amplify Console

文档给的是 Git 驱动的持续部署流程。比较特别的点有：

- 根目录需要放 `amplify-explicit.yml`
- 要把生成的 `dist` 目录从 `.gitignore` 中移除并提交

这对 React Web 开发者来说是一个很容易忽视的差异，因为很多前端项目默认不会把构建产物纳入仓库。

### Firebase Hosting

重点在于：

1. `firebase init` 时指定 `dist` 为 public path
2. 只有在 `web.output: "single"` 时，才对“rewrite all urls to /index.html”选择 `Yes`
3. 在 `package.json` 里增加：

```json
"predeploy": "expo export -p web",
"deploy-hosting": "npm run predeploy && firebase deploy --only hosting"
```

文档还给了 `firebase.json` 中 `hosting.headers` 的缓存头配置示例。

### GitHub Pages

重点在于：

1. 安装 `gh-pages`
2. 使用 `experiments.baseUrl` 适配子路径部署
3. 在 `package.json` 添加：

```json
"deploy": "gh-pages --nojekyll -d dist",
"predeploy": "expo export -p web"
```

`--nojekyll` 的原因是 Expo 构建产物里有下划线文件名，而 GitHub Pages 的 Jekyll 处理会干扰它们。

## 命令、配置、文件说明

### 通用命令

```sh
npx expo export -p web
npx expo serve
```

### 常见配置与文件

- `app.json` 中的 `expo.web.output`
- `dist/`：导出后的生产目录
- `public/`：静态文件源目录
- `public/_redirects`：Netlify SPA 路由重写
- `vercel.json`：Vercel 部署配置
- `firebase.json`：Firebase Hosting 配置
- `amplify-explicit.yml`：Amplify 托管配置

## 注意事项、限制条件与坑点

- `single` / `static` / `server` 三种输出模式的部署要求不同，不能混用。
- `public/assets/` 等路径可能与 Metro 预留路径冲突，文档明确提醒要避开保留路径。
- `expo serve` 只是本地预览生产托管方式，不提供 HTTPS。
- SPA 场景下，如果漏掉重写配置，刷新非首页路由通常会出问题。
- GitHub Pages 部署子路径时，需要配置 `baseUrl`，否则资源路径容易错。

## React Web 开发者最容易误解的点

- **误解 1：Expo Web 部署跟任意 React SPA 一样。**
  不完全一样，因为 Expo 有明确的 `web.output` 模式差异。
- **误解 2：导出后只有前端静态资源。**
  当 `output` 为 `server` 时，文档明确说会产生 client / server 两部分。
- **误解 3：所有平台都统一做路由重写。**
  文档显示是否需要 rewrite，取决于是不是 SPA。

## 实际开发建议

- 基于经验建议：在选托管平台前，先确定自己项目是 SPA、静态站点还是需要服务端能力。
- 基于文档内容推导：如果你不想自己维护 Node 服务器，优先避免 `server` 输出模式。
- 基于文档内容推导：部署前先用 `npx expo serve` 做一次本地生产预览，尤其是检查静态资源和路由跳转。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- 生产导出使用 `npx expo export -p web`
- 导出产物在 `dist/`
- `public/` 文件会复制到 `dist/`
- 推荐 EAS Hosting
- 多个平台的部署方式各不相同

### 基于文档内容推导

- Expo Web 部署的核心不是“在哪托管”，而是“导出模式和托管模式是否匹配”。
- 对 Web 团队来说，最容易出错的不是构建本身，而是路由重写、子路径和缓存策略。
- Expo 把 Web 托管问题拆成了“导出 + 平台适配”两层。

## 当前文档未涉及

- CI/CD 自动化脚本的完整写法
- 各托管平台的价格、配额和权限策略
- 自定义 Node.js 服务器的具体实现

<!-- NAVIGATION START -->
---
[← 上一页：Develop websites with Expo 学习整理](./20_web.md) | [下一页：Using React DOM in Expo native apps 学习整理 →](./22_dom-components.md)
<!-- NAVIGATION END -->
