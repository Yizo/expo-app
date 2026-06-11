# Linking into other apps

## 文档解决的问题

这篇文档讲的是：如何从你的 Expo 应用跳转到其他应用或系统能力，例如浏览器、邮箱、电话、短信，或者某个支持自定义 scheme 的第三方 App。

## 适用场景

- 你要在应用里打开网页、拨号、发邮件、发短信。
- 你要从应用跳到 Uber 等支持自定义 URL scheme 的第三方 App。
- 你需要为登录、支付、回跳等流程构造“从你的 App 跳出去再回来”的 URL。

## 核心概念

### 两种主要实现方式

文档给出两种方式：

- `expo-linking` API
- Expo Router 的 `Link` 组件

### Common URL schemes

这些是系统常见协议：

- `https` / `http`
- `mailto`
- `tel`
- `sms`

### Custom URL schemes

某些 App 会暴露自己的 scheme，例如 `uber://...`。只要知道目标 App 的 scheme，就可以尝试打开它。

### `Linking.createURL`

它用于创建一个“返回你自己应用”的 URL，避免把 `myapp://...` 或 Expo Go 下的 `exp://...` 写死。

## 关键流程

### 1. 打开常见外部链接

使用 `expo-linking`：

```tsx
Linking.openURL('https://expo.dev/')
```

或使用 Expo Router：

```tsx
<Link href="https://expo.dev">Open a URL</Link>
```

### 2. 打开第三方 App 的自定义 scheme

只要拿到对方文档提供的 URL scheme，就可以构造链接尝试打开。

### 3. 判断 iOS 是否允许查询某个 scheme

如果要用 `Linking.canOpenURL` 检测是否能打开某个 iOS App，需要在 `ios.infoPlist` 中添加 `LSApplicationQueriesSchemes`。

### 4. 构造回跳 URL

使用 `Linking.createURL()` 可自动根据环境构造：

- 生产 / Development Build：`myapp://...`
- Expo Go：`exp://127.0.0.1:8081/...`

## 命令、配置、文件说明

### 关键 API / 组件

- `Linking.openURL`
- `Linking.canOpenURL`
- `Linking.createURL`
- Expo Router 的 `Link`
- `expo-web-browser` 的 `openBrowserAsync`

### 关键配置

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "LSApplicationQueriesSchemes": ["uber"]
      }
    }
  }
}
```

### 涉及文件

- `app.json` / `app.config.*`
- `Info.plist`（通过 config 间接生成）
- Android Manifest 中的 queries（文档用 config plugin 示例说明）

## 注意事项、限制条件和坑点

- Android 11 及以上，如果你要处理某些常见 scheme，对应 intent 需要在 Manifest 中声明，文档给了 config plugin 示例。
- iOS 如果不声明 `LSApplicationQueriesSchemes`，`Linking.canOpenURL` 可能返回 `false`，即使目标 App 已安装。
- 文档明确提示：这类 iOS 配置不能在 Expo Go 中完整测试，应用 Development Build。
- 如果业务要求固定回调地址（如第三方登录），不要依赖 Expo Go 的 `exp://...` 地址，应用自定义 scheme 的 Development Build。

## React Web 开发者容易误解的点

- Web 中 `<a href>` 往往只是打开网页；移动端的 `<Link>` / `openURL` 可能直接唤起另一个原生 App。
- “检测某 App 是否已安装”在 iOS 上不是无条件允许的，需要显式白名单。
- `createURL()` 的目的不是简单拼字符串，而是屏蔽不同运行环境下 URL 前缀差异。

## 实际开发建议

- 如果项目使用 Expo Router，优先用 `Link` 统一处理跨平台链接行为。
- 与第三方 App 打通时，先确认其官方 scheme 文档和未安装时的兜底策略。
- 认证回跳、支付回跳等流程优先用 `Linking.createURL()` 生成返回地址。
- 基于文档内容推导：外跳流程通常要同时设计“已安装”和“未安装”两条路径。

## 文档明确说明

- 可通过 `expo-linking` 或 Expo Router `Link` 跳到其他应用。
- Android 11+ 需要额外声明部分 intent 查询。
- iOS 查询其他应用 scheme 需配置 `LSApplicationQueriesSchemes`。
- `Linking.createURL()` 会按环境生成不同前缀的返回地址。
- `expo-web-browser` 适合在应用内打开网页。

## 基于文档内容推导

- 如果你要实现 OAuth、支付或分享跳转，`Linking.createURL()` 是减少环境差异 bug 的关键工具。
- “能不能打开外部 App”除了代码本身，还受平台安全策略影响。
- 当前文档未涉及某个具体第三方 App 的业务参数规则，具体 URL 结构应以目标服务文档为准。

<!-- NAVIGATION START -->
---
[← 上一页：Overview of Linking, Deep Links, Android App Links, and iOS Universal Links](./8_overview.md) | [下一页：Linking into your app →](./10_into-your-app.md)
<!-- NAVIGATION END -->
