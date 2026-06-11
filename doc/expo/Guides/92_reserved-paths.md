# Expo Router 与 Metro 保留路径

## 文档解决的问题

本文列出不能随意用于页面路由或静态文件的 URL 路径。若与 Metro、Expo Router、React Server Components 或调试器的内部端点冲突，请求会先被内部服务拦截，表现为 `404 Asset not found`、返回内部 JSON，或页面被静默替换。

适合设计路由、整理 `public` 静态资源目录，以及排查“文件存在但 URL 永远打不开”的问题。

## 保留路径总览

| 路径 | 占用方 | 影响 |
| --- | --- | --- |
| `/assets/*` | Metro | 提供打包后的图片、字体和其他资源。 |
| `/_expo/*` | Expo Router | 内部中间件、开发工具和 manifests。 |
| `/_flight/*` | React Server Components | RSC 内部通信。 |
| `/inspector/*` | React Native 调试器 | `/inspector/debug`、`/inspector/network` 等。 |
| `/expo-dev-plugins/*` | Expo 开发工具插件 | 插件内部请求。 |
| `/manifest` | Expo 开发服务器 | 返回原生 App manifest。 |
| `/_sitemap` | Expo Router | 自动生成调试用 sitemap。 |
| `/public/*` | 静态文件服务 | 项目存在 `public` 目录时可能冲突。 |

## `/assets/*`

Metro 会拦截此路径，因此以下文件不会按预期作为页面或普通静态文件访问：

```text
app/assets.tsx
app/assets/index.tsx
public/assets/logo.png
```

应改用不冲突的名称，例如：

```text
app/media.tsx
public/images/logo.png
```

`/assets` 的限制同时作用于顶层页面和静态资源目录。

## `/_expo/*`、`/_flight/*` 与开发工具路径

- `/_expo/*` 被 Expo Router 多个内部中间件使用，不要创建同名路由或静态文件。
- `/_flight/*` 由 React Server Components 内部使用。
- `/inspector` 及其子路径属于 React Native 调试器。
- `/expo-dev-plugins/*` 属于 Expo 开发工具插件。

这些路径不是普通业务命名空间，应用代码应整体避开，而不是只避开文档举出的某个具体子路径。

## `/manifest`

开发服务器会在此返回原生应用 manifest。若创建 `app/manifest.tsx`，开发环境收到的仍可能是 manifest JSON，页面看起来像“静默未加载”。

## `/_sitemap`

Expo Router 会自动生成该调试路由。创建 `app/_sitemap.tsx` 会覆盖内置 sitemap，而不是与它并存。

## `/public/*`

项目存在 `public` 目录时，URL `/public` 可能与静态文件服务冲突。应避免：

```text
app/public.tsx
app/public/index.tsx
```

注意：磁盘上的 `public/foo.png` 通常通过 URL `/foo.png` 访问，并不意味着业务页面应该使用 `/public` 前缀。

## `/favicon.ico` 是例外

`/favicon.ico` 可以安全覆盖。Expo CLI 在没有自定义 favicon 时提供默认图标；可通过 `public/favicon.ico` 或 API Route 自定义响应。

## React Web 开发者容易误解的地方

- 文件系统路由存在，并不保证请求一定到达该文件；Metro 和开发服务器中间件可能更早匹配 URL。
- `public` 是磁盘目录名，不等同于线上 URL 必须带 `/public`。
- `/assets` 不只是常见静态目录约定，而是 Metro 明确保留的运行时路径。
- 某些冲突只在开发服务器表现明显，例如 `/manifest`，因此不能只根据生产 Web 服务器经验判断。

## 实际开发建议

> **基于文档内容推导：** 在建立公共 URL 命名规范时，直接把这些顶层前缀加入禁用列表，并在新增路由或静态目录的代码审查中检查，而不是等出现静默冲突后再排查。

> **基于文档内容推导：** 遇到“同名文件存在但响应内容完全不对”时，应先检查 URL 是否被内部服务保留，再检查页面组件代码。

## 文档明确说明的限制

- 不应在保留路径下创建业务路由或静态文件。
- `/assets/*` 同时影响 route 和 `public` 静态资源。
- `/_sitemap` 可被自定义页面覆盖。
- `/favicon.ico` 允许覆盖。

当前文档未涉及：自定义修改保留路径、生产托管平台额外保留的 URL、自动检测冲突的命令或 lint 规则。

<!-- NAVIGATION START -->
---
[← 上一页：Expo Router 常见故障排查](./91_troubleshooting.md) | [下一页：从 React Navigation 迁移到 Expo Router →](./93_from-react-navigation.md)
<!-- NAVIGATION END -->
