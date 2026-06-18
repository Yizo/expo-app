> 原文地址：https://docs.expo.dev/router/reference/reserved-paths/
>
> 本文档基于 Expo Router 官方文档翻译整理，适用于 Expo SDK v56。

# 保留路径（Reserved Paths）

> **摘要**：开发者必须避免使用特定的 URL 路由路径，因为这些路径已被 Metro 打包器和 Expo Router 内部占用。如果在这些路径上放置静态文件或创建路由，将会导致冲突。

在 Expo Router 项目中，某些 URL 路径被框架内部保留使用。如果你在这些被保留的路径上放置静态文件或创建路由页面，框架会拦截这些请求，可能导致以下问题：

- 出现 **"404 Asset not found"**（资源未找到）错误
- 内部开发服务器**悄无声息地替换掉你的页面**，让你误以为页面没有生效

> **新手须知**：
> - **保留路径（Reserved Paths）**：指框架内部已经占用的 URL 路径，开发者不应在这些路径上创建自己的页面或放置文件。
> - **Metro**：React Native 使用的 JavaScript 打包工具（bundler），负责将你的源代码和资源文件编译、打包成可以在设备上运行的格式。
> - **路由（Route）**：在 Expo Router 中，路由是指应用中的页面，通常与 `app/` 目录下的文件一一对应。例如 `app/about.tsx` 对应 `/about` 这个 URL 路径。

---

## 保留路径一览

下表汇总了所有被保留的路径及其用途和冲突风险：

| 路径 | 用途 | 能否自定义 |
|---|---|---|
| `/assets/*` | 打包器提供静态资源（字体、图片等） | 不能 |
| `/_expo/*` | Expo 内部中间件（清单文件、开发者工具等） | 不能 |
| `/_flight/*` | React Server Components（RSC）内部操作 | 不能 |
| `/inspector` | 调试器工具（网络检查、调试面板等） | 不能 |
| `/expo-dev-plugins/*` | 开发工具扩展插件 | 不能 |
| `/manifest` | 应用清单 JSON 文件 | 不能 |
| `/_sitemap` | 自动生成的调试用站点地图 | 有限度可覆盖 |
| `/public/*` | 公共目录静态资源 | 不能 |
| `/favicon.ico` | 网站图标 | **可以自定义** |

---

## 详细说明

### 资源目录（`/assets/*`）

Metro 打包器会将所有打包后的文件（如字体和图片）通过此路径提供。如果你在 `app/assets.tsx` 创建路由，或在 `public/assets/` 放置静态文件，都会与打包器产生冲突。

**冲突范围**包括：

- 顶层路由文件，例如 `app/assets.tsx`
- 嵌套路由文件，例如 `app/assets/index.tsx`
- 公共目录中的文件，例如 `public/assets/logo.png`

**解决方法**：重命名你的文件或文件夹。例如：

```tsx
// 错误做法：与保留路径冲突
// app/assets.tsx — 会与 /assets/* 保留路径冲突

// 正确做法：使用其他名称
// app/media.tsx — 使用 "media" 替代 "assets"
```

```
// 错误做法
public/assets/logo.png   — 与 /assets/* 保留路径冲突

// 正确做法
public/images/logo.png   — 使用 "images" 替代 "assets"
```

> **基于经验建议**：即使你的项目当前没有使用 `public/assets/` 目录，也建议从一开始就避免使用 `assets` 作为路由名称，以免后续团队成员误用导致难以排查的问题。

---

### Expo 内部路径（`/_expo/*`）

Expo Router 框架使用此路径处理各种内部中间件操作，包括：

- 应用清单（manifest）服务
- 开发者工具通信
- 内部 API 调用

> **警告**：切勿在此路径下放置静态文件或创建路由，否则可能破坏框架的核心功能。

---

### React Server Components（`/_flight/*`）

此路径专为 **React Server Components（RSC）** 的内部操作而保留。

> **新手须知**：
> - **React Server Components（RSC）**：一种 React 的新架构特性，允许组件在服务器端渲染，然后将渲染结果传输到客户端。`_flight` 指的是 RSC 使用的序列化传输格式（Flight protocol）。

请勿在此路径下放置路由或静态资源。

---

### 调试器（`/inspector`）

Expo 框架使用此路径及其子路径来提供调试工具，例如：

- `/inspector/debug` — 调试面板
- `/inspector/network` — 网络请求检查工具

> **注意**：不要创建匹配 `/inspector` 基础路径或其任何子路径的路由，否则会与调试工具产生冲突。

---

### 开发插件（`/expo-dev-plugins/*`）

开发工具扩展插件使用此路径进行注册和通信。

请勿在此路径下放置静态资源或创建路由。

---

### 应用清单（`/manifest`）

开发环境通过此路径提供原生应用的清单 JSON 文件（manifest）。

> **新手须知**：
> - **清单文件（Manifest）**：一个 JSON 格式的配置文件，包含应用的名称、图标、版本号等元数据。Expo Go 等客户端通过读取此清单来了解如何加载和运行你的应用。

如果你在 `app/manifest.tsx` 创建了路由，开发服务器会返回清单 JSON 而不是你的页面 UI，**这会让你的页面看起来像是静默失效了**。

```tsx
// 错误做法：你的页面将不会渲染
// app/manifest.tsx — 服务器会返回清单 JSON 而非你的 UI

// 正确做法：使用其他名称
// app/app-manifest.tsx
```

> **基于文档内容推导**：由于清单路径的冲突表现为页面"无声失效"（不报错但不渲染），这类问题在开发中非常难以察觉。如果你发现某个页面突然"消失"且控制台没有错误信息，应首先检查是否与保留路径冲突。

---

### 站点地图（`/_sitemap`）

Expo Router 会在此路径自动生成一个用于调试的站点地图（sitemap）。

> **新手须知**：
> - **站点地图（Sitemap）**：一个列出应用中所有可访问页面的列表。在 Expo Router 的开发模式中，访问 `/_sitemap` 可以查看当前项目中所有已注册的路由，方便调试。

如果你在 `app/_sitemap.tsx` 创建路由，会**覆盖默认的站点地图行为**。如需自定义站点地图，请参考 Expo Router 官方的 [Sitemap 文档](https://docs.expo.dev/router/reference/sitemap/)。

> **基于经验建议**：如果你不需要自定义站点地图，最好不要创建 `_sitemap` 路由，保留框架的默认行为即可。默认的调试站点地图在开发阶段非常有用。

---

### 公共目录（`/public/*`）

当项目中包含 `public/` 文件夹时，该 URL 路径可能与静态资源交付产生冲突。

> **新手须知**：
> - **public 目录**：项目根目录下的 `public/` 文件夹，其中的文件会被直接复制到构建产物中，可以通过 URL 直接访问。例如 `public/logo.png` 可以通过 `/logo.png` 访问。

请避免创建以下路由，因为框架隐式保留了此路径空间：

```tsx
// 以下路径均会导致冲突：

// app/public.tsx — 与 /public/* 保留路径冲突

// app/public/index.tsx — 与 /public/* 保留路径冲突
```

> **基于文档内容推导**：`/public/*` 路径的保留是隐式的（implicit），这意味着框架文档中可能不会显式报错提示，而是以不可预期的行为表现出来。开发时应当主动避免使用 `public` 作为路由名称。

---

### 网站图标（`/favicon.ico`）

与其他保留路径不同，`/favicon.ico` **可以安全地自定义**。

> **新手须知**：
> - **favicon**：浏览器标签页上显示的小图标。在 Web 端部署 Expo 应用时，favicon 是用户体验的重要组成部分。

如果你没有提供自定义图标，CLI 工具会提供一个默认图标。你可以通过以下方式自定义 favicon：

1. **将文件放入 `public/` 目录**：直接在 `public/` 目录下放置 `favicon.ico` 文件
2. **创建 API 路由**：通过编程方式动态生成图标，详见 [API 路由文档](https://docs.expo.dev/router/web/api-routes/)

```
public/
  favicon.ico    — 自定义网站图标，会被自动识别
```

> **基于经验建议**：对于大多数项目，直接将 `favicon.ico` 放入 `public/` 目录是最简单的做法。只有在需要动态生成图标（例如根据不同用户显示不同图标）时，才考虑使用 API 路由的方式。

---

## 快速排查清单

当你遇到以下情况时，请检查是否与保留路径冲突：

- [ ] 页面无法渲染且没有任何错误提示
- [ ] 访问某个路由时返回 JSON 而非 UI
- [ ] 出现 "404 Asset not found" 错误
- [ ] 静态资源（图片、字体等）无法正常加载
- [ ] 调试工具或开发者面板无法正常工作

> **基于经验建议**：建议在项目的 `README` 或开发规范中明确列出这些保留路径，并在代码审查（Code Review）时将路由命名作为检查项之一，可以从根本上避免此类问题。

---

## 总结

| 最佳实践 | 说明 |
|---|---|
| 避免使用保留路径名称 | 不要将路由文件命名为 `assets`、`manifest`、`inspector` 等 |
| 使用语义化替代名称 | 用 `media` 代替 `assets`，用 `images` 代替 `assets` 目录 |
| 注意隐式保留 | `/public/*` 是隐式保留的，不会给出明确报错 |
| favicon 可以自由定制 | 通过 `public/favicon.ico` 或 API 路由自定义 |
| 出现问题先查保留路径 | 页面"无声失效"时，优先检查路径冲突 |

---

## 文档导航

- **上一页**：[troubleshooting](./93__troubleshooting.md)
- **下一页**：[from react navigation](./95__from-react-navigation.md)
