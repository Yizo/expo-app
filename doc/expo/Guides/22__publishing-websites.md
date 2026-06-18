# 发布网站

> 原文地址：https://docs.expo.dev/guides/publishing-websites/

## 概述

Expo 应用可以在本地测试，也可以部署到托管服务商。官方推荐使用 **EAS Hosting** 以获得最佳功能兼容性，当然你也可以选择自托管或第三方托管方案。

> **初学者须知**：
> - **Expo**：一个基于 React Native 的开发框架，帮助你构建跨平台的移动和 Web 应用
> - **EAS**（Expo Application Services）：Expo 官方提供的一套云服务，包括构建、更新和托管功能
> - **托管**（Hosting）：将你的网站文件放到服务器上，让用户可以通过互联网访问

> **注意**：如果你使用的是较旧的 SDK 版本（49 及以下），可能需要参考专门的 webpack 指南。

## 输出目标配置

在应用配置文件中，你可以通过 `web.output` 属性设置导出方式。

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

> **初学者须知**：
> - `web.output`：决定你的 Web 应用以什么形式导出
> - `bundler`：打包工具，这里使用的是 Metro（Expo 默认的 JavaScript 打包器）

### 三种输出模式详解

Expo Router 支持三种输出模式：

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| **single**（默认） | 生成单页应用（SPA），只包含一个 `index.html` 文件，没有可被静态索引的页面 | 简单应用、后台管理系统 |
| **server** | 生成 client 和 server 文件夹。客户端资源变成独立的 HTML 文件，API 路由变成独立的 JavaScript 文件 | 需要服务端渲染的自定义 Node.js 环境 |
| **static** | 为 `app` 文件夹中的每个路由创建独立的 HTML 文档 | SEO 优化、静态站点 |

> **初学者须知**：
> - **单页应用（SPA）**：整个应用只有一个 HTML 入口，页面切换通过 JavaScript 动态完成
> - **静态站点**：每个页面都有对应的 HTML 文件，有利于搜索引擎优化（SEO）
> - **API 路由**：后端接口代码，可以直接在项目中编写服务端 API

> **注意**：`static` 和 `server` 模式允许通过 expo-router 插件为所有路由响应设置全局 HTTP 头。

## 创建构建

导出 JavaScript 和资源文件会在 `dist` 文件夹中创建静态包。`public` 文件夹中的文件也会被复制到这里。

> **初学者须知**：
> - **构建**（Build）：将源代码转换成浏览器可以运行的文件的过程
> - **dist**：distribution 的缩写，存放构建产出的目录
> - **public**：存放静态资源的目录，如图片、字体等

使用以下命令进行构建：

```bash
# 使用 npm
npx expo export -p web

# 使用 yarn
yarn expo export -p web

# 使用 pnpm
pnpm expo export -p web

# 使用 bun
bun expo export -p web
```

> **警告**：Metro 保留了一些特定路径，例如 `/assets`。不要在 `public/assets/` 或类似的受限目录中放置文件，否则可能导致路径冲突。

> **基于经验建议**：在部署前，建议先检查 `dist` 文件夹的内容，确保所有必要的文件都已正确生成。

## 本地预览

要在本地预览生产环境的行为，可以使用 serve 命令，它会在 `localhost:8081` 启动站点。

```bash
# 使用 npm
npx expo serve

# 使用 yarn
yarn expo serve

# 使用 pnpm
pnpm expo serve

# 使用 bun
bun expo serve
```

> **注意**：此命令仅支持 HTTP（不支持 HTTPS），这意味着需要安全上下文的功能（如摄像头或位置权限）可能无法正常工作。

> **基于经验建议**：本地预览时如果发现功能异常，先检查是否是因为 HTTP 限制导致的安全 API 不可用。正式部署到支持 HTTPS 的环境后再做最终测试。

## 使用 EAS Hosting 托管

EAS CLI 支持即时生产部署，包含自定义域名和 SSL 证书功能。

> **初学者须知**：
> - **SSL**：Secure Sockets Layer，一种加密协议，让网站可以通过 HTTPS 安全访问
> - **自定义域名**：使用你自己的域名（如 `myapp.com`）而不是默认的托管商域名

> **基于文档内容推导**：EAS Hosting 是 Expo 官方推荐的托管方案，与 Expo 生态集成最紧密，配置最简单，适合希望快速上线的开发者。

## 第三方托管方案

### Netlify

Netlify 是一个较为中立的托管平台，兼容性很高。

**安装 Netlify CLI：**

```bash
npm install --global netlify-cli
```

> **初学者须知**：
> - **Netlify**：一个流行的静态网站托管平台，支持自动部署、表单处理等功能
> - **CLI**（Command Line Interface）：命令行工具，通过终端进行操作

**单页应用配置**：如果你使用 SPA 模式（`output: "single"`），需要创建 `./public/_redirects` 文件，内容如下：

```
/* /index.html 200
```

这个配置将所有请求路由到主 HTML 文件，让前端路由正常工作。修改后需要重新构建。

**部署命令：**

```bash
netlify deploy --dir dist
```

> **基于经验建议**：Netlify 支持持续交付，可以通过在 Netlify 控制台关联 Git 仓库实现自动部署。每次推送代码都会自动触发新的部署。

---

### Vercel

**安装 Vercel CLI：**

```bash
npm install --global vercel@latest
```

**配置文件**：在项目根目录创建 `vercel.json`：

```json
{
  "buildCommand": "expo export -p web",
  "outputDirectory": "dist",
  "devCommand": "expo",
  "cleanUrls": true,
  "framework": null,
  "rewrites": [
    {
      "source": "/:path*",
      "destination": "/"
    }
  ]
}
```

> **配置说明**：
> - `buildCommand`：构建命令
> - `outputDirectory`：输出目录
> - `devCommand`：开发模式命令
> - `cleanUrls`：启用干净 URL（自动去除 `.html` 后缀）
> - `framework`：设为 `null` 以避免 Vercel 自动检测框架导致冲突
> - `rewrites`：URL 重写规则，将所有路径重定向到根路径

**部署：**

```bash
vercel
```

> **注意**：静态渲染可能需要额外的动态路由配置。

> **基于经验建议**：Vercel 的自动框架检测可能会干扰 Expo 的构建流程，所以务必在配置中明确设置 `"framework": null`。

---

### AWS Amplify Console

AWS Amplify Console 是一个基于 Git 的持续部署服务，适用于无服务器应用。

**配置步骤：**

1. 在仓库根目录添加 `amplify-explicit.yml` 文件
2. 从 `.gitignore` 文件中移除 `dist` 目录（让构建产物可以被提交）
3. 将代码推送到 GitHub
4. 在 AWS 控制台中：
   - 关联 GitHub 仓库
   - 指定 monorepo 中构建文件夹的路径
   - 允许自动部署根目录文件
5. 审查并保存，即可部署到 `amplifyapp.com` 域名
6. 后续可以添加自定义域名和 SSL

> **初学者须知**：
> - **AWS Amplify**：亚马逊云科技提供的前端应用托管服务
> - **持续部署**：代码更新后自动部署到生产环境
> - **monorepo**：一个代码仓库中包含多个项目的结构

> **基于文档内容推导**：AWS Amplify 适合已经使用 AWS 生态的团队，但配置相对复杂，需要一定的云服务经验。

---

### Firebase Hosting

**安装和初始化：**

```bash
# 安装 Firebase CLI
npm install --global firebase-tools

# 登录 Firebase
firebase login

# 初始化项目
firebase init
```

**初始化配置**：
- 设置 public 路径为 `dist`
- 仅在使用 `single` 输出模式时，对单页应用重写提示回答"是"

**配置部署脚本**，在 `package.json` 中添加：

```json
"scripts": {
  "predeploy": "expo export -p web",
  "deploy-hosting": "npm run predeploy && firebase deploy --only hosting"
}
```

**执行部署：**

```bash
npm run deploy-hosting
```

**可选优化**：修改 `firebase.json`，为 HTML 文件添加缓存控制头（`no-cache`），为静态资源添加长期缓存（`max-age=604800`，即 7 天）：

> **初学者须知**：
> - **Firebase**：Google 提供的应用开发平台，包含数据库、托管、分析等服务
> - **缓存控制**：通过 HTTP 头告诉浏览器如何缓存文件，合理配置可以提升网站加载速度

> **基于经验建议**：Firebase Hosting 的缓存策略很重要。HTML 文件应该设置 `no-cache` 以确保用户总是获取最新内容，而静态资源（JS、CSS、图片）可以设置较长的缓存时间以提升性能。

---

### GitHub Pages

GitHub Pages 是 GitHub 提供的免费静态网站托管服务。

**准备工作：**

1. 初始化 Git 并关联 GitHub 仓库
2. 安装 `gh-pages` 开发依赖：

```bash
npm install --save-dev gh-pages
```

**配置 baseUrl**，在应用配置中设置实验性的 `baseUrl`，值需匹配仓库名称：

```json
{
  "expo": {
    "experiments": {
      "baseUrl": "/expo-gh-pages"
    }
  }
}
```

> **初学者须知**：
> - **GitHub Pages**：GitHub 提供的免费静态网站托管，适合开源项目文档和演示站点
> - **baseUrl**：基础路径配置，因为 GitHub Pages 的网站地址包含仓库名作为路径前缀

**添加部署脚本**，在 `package.json` 中添加：

```json
"scripts": {
  "deploy": "gh-pages --nojekyll -d dist",
  "predeploy": "expo export -p web"
}
```

> **关于 `--nojekyll` 参数**：此标志防止 Jekyll 处理以下划线开头的生成文件时出现问题。GitHub Pages 默认使用 Jekyll 构建站点，而 Jekyll 会忽略以 `_` 开头的文件和文件夹，这会导致 Expo 生成的文件丢失。

**执行部署：**

```bash
npm run deploy
```

**GitHub 设置**：在仓库设置中，配置 Pages 从 `gh-pages` 分支的根目录部署。站点将可在 `github.io` 子域名访问。

> **基于经验建议**：GitHub Pages 适合个人项目和演示用途，但不适合生产级应用。它的更新不是实时的，通常需要几分钟才能生效。

---

## 托管方案对比

| 托管方案 | 难度 | 适用场景 | 自定义域名 | SSL |
|----------|------|----------|------------|-----|
| EAS Hosting | 低 | Expo 项目首选 | 支持 | 支持 |
| Netlify | 低 | 通用静态站点 | 支持 | 支持 |
| Vercel | 低 | 前端项目 | 支持 | 支持 |
| AWS Amplify | 中 | AWS 生态用户 | 支持 | 支持 |
| Firebase Hosting | 中 | Google 生态用户 | 支持 | 支持 |
| GitHub Pages | 低 | 演示/文档站点 | 支持 | 支持 |

> **基于文档内容推导**：选择托管方案时应考虑：团队技术栈偏好、项目复杂度、是否需要服务端功能、以及预算。对于纯 Expo 项目，EAS Hosting 集成度最高；对于已有云服务账号的团队，选择对应云平台可能更合适。

---

## 文档导航

- **上一页**：[web](./21__web.md)
- **下一页**：[dom components](./23__dom-components.md)
