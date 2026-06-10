# iOS Universal Links

## 文档解决的问题

这篇文档说明如何把标准网站链接与 iOS 应用绑定，让用户点击 `https://` 链接时优先打开你的 App，并介绍 Apple Smart Banner、调试方法和常见错误点。

## 适用场景

- 你有网站域名，希望 iPhone 用户点网页链接时直接进 App。
- 你希望在用户未安装 App 时，仍然先落到网站。
- 你想做比自定义 scheme 更接近正式分发体验的 iOS 深链方案。

## 核心概念

### Universal Links

这是 iOS 基于标准 `http` / `https` 链接的入站链接机制。与普通 deep link 相比，它更适合真实用户使用，因为：

- 用户点击的是正常网页链接
- 没装 App 时会落到网站
- 装了 App 时可直接打开应用

### 双向关联

文档同样强调 two-way association：

1. 网站要发布 AASA 文件证明信任某个 App
2. App 要声明自己关联了哪个域名

### AASA 文件

即：

```text
/.well-known/apple-app-site-association
```

这个文件描述：

- Apple Team ID
- Bundle Identifier
- 支持哪些路径

## 关键流程

### 1. 创建 AASA 文件

如果使用 Expo Router 或现代 Web 框架，文档建议把文件放在：

```text
public/.well-known/apple-app-site-association
```

旧版 Expo webpack 项目则放：

```text
web/.well-known/apple-app-site-association
```

### 2. 配置支持路径

你可以在 `paths` 或较新的 `components` / `appIDs` 格式里描述哪些 URL 进入 App。

### 3. 通过 HTTPS 提供 AASA

网站必须能通过 HTTPS 访问该文件。

### 4. 在 app config 中声明关联域名

使用：

```json
{
  "expo": {
    "ios": {
      "associatedDomains": ["applinks:expo.dev"]
    }
  }
}
```

文档特别强调：不要把 `https://` 协议写进去。

### 5. 构建并安装 iOS App

文档推荐使用 EAS Build，确保 entitlement 自动向 Apple 注册。

### 6. 可选：配置 Apple Smart Banner

网站 `<head>` 中加入：

```html
<meta name="apple-itunes-app" content="app-id=<ITUNES_ID>" />
```

用于未安装 App 时提示用户下载。

## 命令、配置、文件说明

### 关键配置

- `ios.associatedDomains`

### 关键文件与目录

- `public/.well-known/apple-app-site-association`
- `web/.well-known/apple-app-site-association`
- `ios/[app]/[app].entitlements`
- `src/app/+html.js`（静态渲染网站中放 Smart Banner meta）

### 关键命令

- `npx setup-safari`
- `npx expo start --tunnel`
- `npx expo run:ios`

## 注意事项、限制条件和坑点

- `associatedDomains` 里不能写 `https://`，这是文档点名的常见错误。
- iOS 不会频繁刷新 AASA；文档明确说，生产环境如果改了 AASA 路径，通常需要通过 App Store 重新发版，让用户端重新抓取。
- AASA 文件未压缩大小不能超过 128KB。
- 网站必须通过 HTTPS 提供。
- 如果更新了网站文件，文档提醒要重建原生 App，触发 Apple 侧更新。

## React Web 开发者容易误解的点

- Universal Links 不是前端路由配置，而是网站和 iOS 应用 Entitlement 的配对。
- AASA 文件不是普通静态资源清单，它的格式和部署位置都非常严格。
- 即便网站内容更新了，用户手机上的系统缓存和抓取时机也会影响是否立刻生效。

## 实际开发建议

- 提前规划路径规则，避免上线后频繁修改 AASA。
- 如果需要多 App 共用同一域名，优先理解 iOS 13+ 的 `appIDs` / `components` 格式。
- 上线前同时验证：AASA 可访问、`associatedDomains` 正确、设备实机点击链接能进入目标页面。
- 基于文档内容推导：Universal Links 的发布节奏会受 App Store 发版影响，所以链接规则变更不应设计得过于频繁。

## 文档明确说明

- Universal Links 需要 AASA 文件和 `associatedDomains` 双向配置。
- 可用 `npx setup-safari` 简化部分流程。
- 可通过 Apple Smart Banner 在网站顶部提示安装 App。
- 调试时可结合 Expo `--tunnel` 功能。
- AASA 文件大小、HTTPS 部署和格式都有明确限制。

## 基于文档内容推导

- 对面向真实用户的 iOS 链接入口，Universal Links 比单独自定义 scheme 更自然。
- iOS 链接问题通常既可能出在网站部署，也可能出在 Apple 侧 Entitlement 配置。
- 当前文档未展开应用内收到 Universal Link 后如何映射到具体路由，只提到应继续接入入站链接处理。
