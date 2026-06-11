# Apple Handoff

## 文档解决的问题

这篇文档讲的是：如何让 Expo Router 应用支持 **Apple Handoff**，也就是用户可以在 Apple 设备之间无缝继续当前页面或当前应用状态。

它要解决的是“路由连续性跨设备迁移”的问题。

## 适用场景

- 用户在 iPhone 上打开某个页面，希望在 Mac 上继续。
- 你同时有 Web 和 iOS 体验，希望两者之间能通过 Apple Handoff 接续浏览。
- 你的应用已经使用 Expo Router，希望把当前路由自动同步到 Apple 的跨设备接力机制中。

## 阅读前需要理解的背景知识

- **Apple Handoff**：Apple 生态的跨设备接续能力。
- **Universal Links**：iOS 与网站之间共享链接归属的重要基础。
- **`NSUserActivity`**：iOS 底层用于 Handoff 的能力。
- **`expo-router/head`**：Expo Router 用它来把当前页面信息写入可被 Handoff 使用的元数据。
- **AASA 文件**：`apple-app-site-association`，用于声明站点和 App 的关联关系。

## 按原文结构整理的核心内容

## 1. Expo Router 做了什么，开发者还要做什么

文档明确说：

- Expo Router 会自动处理 Handoff 所需的运行时路由部分
- 但**一次性的配置工作必须手动完成**

也就是说，这不是“装上就能用”的能力。

## 2. 使用限制与前提条件

文档在 setup 一开始就列出了一组关键限制：

- **仅限 Apple 平台**
- **Expo Go 不支持**
- 必须配置 **Universal Links**
- AASA 文件里必须包含 `activitycontinuation`
- 想支持 Handoff 的页面必须使用 `expo-router/head`

这几条都很关键，因为任何一条缺失都会导致你明明写了页面代码，却完全没有接力效果。

## 3. AASA 文件怎么配

文档要求在：

`public/.well-known/apple-app-site-association`

里包含：

- `applinks`
- `activitycontinuation`
- 可选但推荐的 `webcredentials`

并且 `activitycontinuation.apps` 要写成：

`<APPLE_TEAM_ID>.<IOS_BUNDLE_ID>`

例如：

`QQ57RJ5UTD.app.expo.acme`

文档明确说明 Team ID 和 Bundle ID 的拼接格式，不能随便写。

## 4. 可以用命令生成 AASA 文件

文档提供了统一命令：

```sh
npx setup-safari
```

以及 yarn / pnpm / bun 的对应写法。

这一步的作用是：根据 app config 生成 `apple-app-site-association` 文件。

## 5. `app.config` 里还要配什么

文档要求通过 `expo-router` config plugin 设置 `headOrigin`，并在 iOS `associatedDomains` 中加入：

- `applinks:...`
- `activitycontinuation:...`
- `webcredentials:...`

开发态示例里用的是固定子域名的 ngrok 地址，并明确提醒：

- `headOrigin` 必须是 `https://` 开头

这意味着 Handoff 的 URL 基础必须是一个可信 HTTPS 地址。

## 6. 配完后还要重新生成原生工程

文档明确要求：

```sh
npx expo prebuild -p ios
```

因为这些配置会影响原生工程能力声明，单纯改 JS 文件不够。

## 7. 开发环境下一个非常容易踩的坑

文档特别提醒：

- **必须先启动网站，再把 App 安装到设备上**

原因是：

- 安装 App 时，系统会触发 Apple 服务器去访问你的网站，查找 AASA 文件
- 如果此时网站没开，系统拿不到文件，Handoff 就不会生效

如果发生这种情况，文档建议重新构建并安装：

```sh
npx expo run:ios -d
```

## 8. 页面里如何启用 Handoff

文档要求在要支持 Handoff 的路由里使用：

```tsx
import Head from 'expo-router/head';
```

并渲染：

```html
<meta property="expo:handoff" content="true" />
```

也可以直接放在根布局里，让所有页面都支持。

## 9. `Head` 支持哪些元信息

文档列出的关键 meta 包括：

- `expo:handoff`
- `og:title`
- `og:description`
- `og:url`
- `<title>`

其中最重要的是：

- `expo:handoff=true`：当前路由开启 Handoff
- `og:url`：切换到 App 时应打开的 URL

文档还说明：

- 默认 `og:url` 会基于 `headOrigin` + 当前路径生成
- 如果要分平台，可以用 `Platform.select`

## 10. 调试方法

文档建议：

1. 确认设备系统里已开启 Handoff
2. 在原生应用中打开一个渲染了 `<Head />` 的路由
3. 在 Mac Dock 或 iPhone/iPad App Switcher 中查看是否出现对应接力入口

文档给出一个很实用的判断标准：

- 如果你在 iPhone 的 App Switcher 里只看到了 Safari 图标，说明 Handoff 没成功

## 11. Troubleshooting 的重点

文档列出了大量排错项，关键包括：

- 不要把 `<Head />` 条件渲染掉
- 调试时可以直接放到 Root Layout，保证所有页面都可接力
- 不要用 `?mode=developer`
- 不要用 `http://localhost:8081`
- 开发态要用可访问的 ngrok HTTPS 地址
- AASA 里必须有 `activitycontinuation`
- `ios/...entitlements` 里的 associated domains 要正确
- Expo Go 不支持

文档还提到一个经验性已观察问题：

- 在某些 iOS / macOS 版本上，以 `app.` 或 `io.` 开头的 bundle id 可能更容易触发异常，建议用 `com.` 开头

这是文档明确记录的观察结果。

## 12. 已知问题

文档最后说明：

- **Web 到 Native 的 Handoff 不支持客户端路由**

也就是说，切换时使用的是你点击链接或刷新页面时的 URL，而不是 Web SPA 内部在不刷新情况下的所有实时路由状态。

这是平台限制，不是 Expo Router 单独能修复的问题。

## 关键流程 / 命令 / 配置说明

### 关键文件

- `public/.well-known/apple-app-site-association`
- `app.config.tsx` 或对应 app config
- 页面或根布局中的 `expo-router/head`
- `ios/...entitlements`

### 关键命令

```sh
npx setup-safari
```

```sh
npx expo prebuild -p ios
```

```sh
npx expo run:ios -d
```

### 关键配置

- `ios.associatedDomains`
- `expo-router` plugin 的 `headOrigin`
- `<meta property="expo:handoff" content="true" />`

## 注意事项、限制条件和坑点

- 仅 Apple 平台支持。
- Expo Go 不支持。
- 必须使用 HTTPS。
- 开发态不要用 localhost，要用可被 Apple 访问的公网 HTTPS 地址。
- 先开网站，再安装 App 到设备，这一点非常容易遗漏。
- `<Head />` 不能被条件渲染掉，否则对应页面不会参与 Handoff。
- Web 到 Native 的 Handoff 不支持客户端路由连续性。

## React Web 开发者最容易误解的地方

- **误解 1：只要页面有 URL，就天然能 Handoff。**  
  实际上还需要 AASA、associated domains、`Head` 元信息、原生构建能力等整套配置。

- **误解 2：开发环境下 localhost 就够了。**  
  文档明确说不行，因为需要 Apple 能访问的 HTTPS 地址。

- **误解 3：Expo Go 可以直接测。**  
  文档明确说不支持。

- **误解 4：Web SPA 客户端路由状态会 100% 被接力。**  
  文档明确指出 Web 到 Native 不支持客户端路由连续性。

## 实际开发建议

- 基于文档内容推导：如果你只是想先验证整条链路是否可用，先把 `<Head />` 放到根布局，待通路打通后再细化到具体页面。
- 基于文档内容推导：把 Handoff 视为“网站、原生工程、Apple 设备设置”三方联调问题，而不是单纯前端页面功能。
- 基于经验建议：先确保 Universal Links 本身已经稳定可用，再接着调 Handoff，否则排错范围会非常大。

## 文档明确说明 vs 基于文档内容推导

### 文档明确说明

- Handoff 仅限 Apple，且 Expo Go 不支持。
- 需要 Universal Links、AASA 文件、`activitycontinuation`、`expo-router/head`。
- 要配置 `headOrigin` 和 associated domains。
- 调试时必须使用 HTTPS 可访问地址，而不是 localhost。
- Web 到 Native 的 Handoff 不支持客户端路由。

### 基于文档内容推导

- Handoff 的难点不在页面代码本身，而在 Web 域名、原生签名、系统能力声明和设备设置的一致性。
- 这是一个强依赖外部环境的能力，联调成本会明显高于普通路由功能。

<!-- NAVIGATION START -->
---
[← 上一页：Router settings](./69_router-settings.md) | [下一页：Expo Router 自定义标签页布局 →](./71_custom-tabs.md)
<!-- NAVIGATION END -->
