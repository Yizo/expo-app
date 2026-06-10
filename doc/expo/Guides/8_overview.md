# Overview of Linking, Deep Links, Android App Links, and iOS Universal Links

## 文档解决的问题

这篇文档提供了 Linking 总览：Expo 应用如何接收外部链接、如何从应用跳到别的应用、Deep Link 与 Universal Link / App Link 有什么区别，以及为什么 Expo Router 在这件事上更省心。

## 适用场景

- 你要让网页、短信、邮件、广告或其他 App 打开你的应用某个页面。
- 你要从你的应用跳转到浏览器、电话、邮箱或其他 App。
- 你对“scheme、deep link、universal link、app link”这些词还没有统一概念。

## 核心概念

### Linking

Linking 指应用与 URL 的双向交互：

- 外部 URL 打开你的应用
- 你的应用打开外部 URL 或其他应用

### Deep Links

Deep Link 是指能直达应用内具体页面的链接。文档示例把一个链接拆成三部分：

- scheme
- host
- path

### Universal Linking

它是基于标准 `http` / `https` 链接的深链方式：

- Android 上叫 App Links
- iOS 上叫 Universal Links

它们都依赖你拥有一个可验证的网站域名。

### Expo Router

文档明确推荐使用 Expo Router，因为它会自动为所有路由启用深链支持，并减少运行时路由配置工作。

## 关键流程

### 链接策略分类

文档把链接策略分成三类：

1. 使用你自己的 Web 域名链接到 App
2. 通过自定义 scheme 从其他 App 或网站链接到你的 App
3. 从你的 App 链接到其他 App

### 链接到你的 App

如果使用自定义 scheme，就是标准 Deep Link。

如果使用 `https` / `http` 域名并完成双向验证，则是：

- Android App Links
- iOS Universal Links

### 从你的 App 链接出去

你可以使用目标 App 的 URL scheme，例如：

- `https`
- `mailto`
- `tel`
- `sms`

## 命令、配置、文件说明

### 关键配置方向

- 自定义 scheme：见“Linking into your app”
- Android App Links：`intentFilters`
- iOS Universal Links：`associatedDomains`

### 涉及文件与目录

文档是总览页，没有展开具体文件编辑步骤；具体文件位置当前文档未涉及，只给了后续专题入口。

### 测试环境说明

文档明确提示：Expo Go 对入站链接支持有限，建议使用 Development Build 测试。

## 注意事项、限制条件和坑点

- 如果你要做正式深链方案，不能只在 Expo Go 里验证。
- 使用 `http(s)` 链接时，不能把普通 Deep Link 与 Universal Link / App Link 混为一谈；后者需要网站所有权验证。
- 链接不只是“打开应用”，还包括“进入应用内正确路由”。

## React Web 开发者容易误解的点

- Web 中 URL 到页面路由通常只在浏览器内发生；移动端还牵涉“哪个 App 接管这个 URL”。
- 自定义 scheme 不是普通网页协议标准，它更像 App 之间约定的入口协议。
- `https://your-domain/...` 在移动端不一定先进浏览器，完成双向验证后可以直接拉起 App。

## 实际开发建议

- 如果你已有网站域名，优先考虑 Universal Links / App Links，而不是只做自定义 scheme。
- 如果项目已使用 Expo Router，优先沿用它的路由能力处理链接，减少手写映射。
- 基于文档内容推导：应把“链接协议设计”和“应用内路由设计”一起考虑，否则外部入口会和内部导航脱节。

## 文档明确说明

- Linking 包括入站和出站 URL 交互。
- Universal Linking 在 Android 和 iOS 上分别由 App Links / Universal Links 实现。
- Expo Router 会自动为所有屏幕启用 deep linking。
- Expo Go 对入站链接支持有限。

## 基于文档内容推导

- 这篇文档的价值主要在于“分类和选型”，不是详细配置手册。
- 对多数业务应用，最终往往要同时拥有“自定义 scheme + 标准域名链接”两套入口。
- 当前文档未涉及某个平台的逐步配置细节，这些内容在后续专题页中展开。
