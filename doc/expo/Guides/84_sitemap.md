# Expo Router Sitemap

## 文档解决的问题

这篇文档讲的是：如何利用 Expo Router 自动注入的 sitemap 调试路由，以及如何在原生设备上测试深链接。它解决的是“我有哪些路由”“深链接是否能打开正确页面”“调试时怎么快速检查路由结构”这些问题。

## 适用场景

- 你要调试 Expo Router 的路由列表。
- 你要在真机上验证深链接能否打开指定页面。
- 你想知道如何关闭自动注入的 `/_sitemap` 调试入口。

## 核心概念

### 1. `/_sitemap`

文档明确说明：Expo Router 会自动注入一个 `/_sitemap` 路径，列出应用中的所有路由，用于调试。

### 2. 深链接测试

在原生环境下，可以通过 `uri-scheme` CLI 主动打开某个链接，验证路由跳转。

### 3. 这是调试能力，不是业务页面

从文档内容看，`/_sitemap` 的重点是调试路由，不是给最终用户使用的正式产品页面。

## 关键流程

### 在原生设备上测试深链接

文档给出的示例命令：

```bash
npx uri-scheme open exp://192.168.87.39:19000/--/form-sheet --ios
```

含义：

- `exp://...` 是 Expo 开发环境链接。
- `/--/form-sheet` 表示打开应用中的目标路由。
- `--ios` 表示在 iOS 设备或模拟器上打开。

文档提醒：其中的 IP 地址要替换成运行 `npx expo start` 时显示的实际地址。

### 直接查看 sitemap

文档说明访问 `/_sitemap` 可以看到当前应用全部路由列表，用于调试。

### 关闭 sitemap

如果你不想保留这个调试入口，可在插件配置中关闭：

```json
{
  "plugins": [
    [
      "expo-router",
      {
        "sitemap": false
      }
    ]
  ]
}
```

## 命令、配置、文件说明

### 命令

```bash
npx uri-scheme open exp://<your-ip>:19000/--/form-sheet --ios
```

作用：在原生设备上主动测试深链接是否命中正确路由。

### 配置

- `sitemap: false`
  关闭 Expo Router 自动注入的 `/_sitemap`。

### 路径

- `/_sitemap`
  自动生成的路由调试入口。

## 注意事项、限制条件和坑点

- `uri-scheme` 示例依赖你正在运行 Expo 开发服务，并且 IP 地址正确。
- 文档里的 `/_sitemap` 是自动注入的调试页面，不代表你手动写了一个业务路由。
- 当前文档未涉及 sitemap 的 SEO 语义或面向搜索引擎的 XML 站点地图生成。

## React Web 开发者容易误解的地方

- 不要把这里的 sitemap 理解成传统 SEO 网站地图文件。
  当前文档讲的是路由调试入口。
- 不要把深链接测试只理解成浏览器地址栏输入 URL。
  在原生端还需要通过 URI scheme 触发应用打开。
- 不要忽略 `/_sitemap` 的调试属性。
  如果不需要，文档明确提供了关闭方式。

## 实际开发建议

- 基于经验建议：开发和联调深链接时，先用 `/_sitemap` 确认路由是否存在，再用 `uri-scheme` 测试设备跳转。
- 基于经验建议：如果你的 App 对外暴露深链接，团队最好把常用测试命令沉淀下来，方便 QA 与开发复现。
- 基于文档内容推导：如果你不希望线上暴露这个调试入口，可以主动把 `sitemap` 设为 `false`。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- Expo Router 自动注入 `/_sitemap`，列出全部路由用于调试。
- 可用 `npx uri-scheme open ...` 在原生设备测试深链接。
- 可通过 `sitemap: false` 关闭该入口。

### 基于文档内容推导

- 本页的 sitemap 更接近“路由调试工具”，不是 SEO 站点地图方案。
- 深链接调试通常应同时覆盖 Web 浏览器验证与原生设备 URI scheme 验证。

<!-- NAVIGATION START -->
---
[← 上一页：Expo Router Color API](./83_color.md) | [下一页：Expo Router Redirects →](./85_redirects.md)
<!-- NAVIGATION END -->
