# DateTimePicker - 日期与时间选择器

> 原文档地址：https://docs.expo.dev/versions/unversioned/sdk/date-time-picker.md
>
> 对应 npm 包：`@react-native-community/datetimepicker`
>
> 支持平台：Android、iOS、Expo Go

---

## 文档解决的问题

在移动端应用中，用户经常需要选择日期或时间（例如设置闹钟、选择出生日期、预约时间等）。在 Web 开发中，我们可以使用 `<input type="date">` 或 `<input type="datetime-local">` 来实现类似功能，浏览器会提供原生的日期/时间选择界面。

但在 React Native 中，并没有内置的日期/时间选择组件。`@react-native-community/datetimepicker` 就是用来填补这个空缺的——它封装了 iOS 和 Android 平台**原生的日期/时间选择器控件**，让你可以用 React 组件的方式调用系统级别的 UI。

> **对 React Web 开发者的类比**：你可以把它理解为移动端版本的 `<input type="date">`，但它渲染的不是浏览器内置的控件，而是 iOS 的滚轮选择器和 Android 的弹窗选择器，外观和行为完全跟随系统原生体验。

---

## 阅读前需要理解的背景知识

### 什么是"原生 UI"

在 React Web 中，所有 UI 都由浏览器渲染（HTML + CSS）。而在 React Native 中，UI 由设备的操作系统渲染。所谓"原生"（Native），就是指组件直接调用 iOS 或 Android 的系统 API 来绘制界面，而非通过 WebView 或自定义绘制。

这意味着 `DateTimePicker` 在 iOS 上看起来像 iOS 系统的日期选择器，在 Android 上看起来像 Android 系统的日期选择器。用户体验与系统内置应用一致。

### 什么是 Expo Go

Expo Go 是 Expo 提供的一个"沙盒"应用，你可以在手机上安装它，然后直接运行你的 Expo 项目，无需编译原生代码。`@react-native-community/datetimepicker` 已经被预置在 Expo Go 中，因此你可以在 Expo Go 里直接使用，无需额外的原生配置。

### 什么是 Bare Workflow

Bare Workflow 是指你已经"弹出"（eject）了 Expo 的托管环境，直接管理原生工程（ios/ 和 android/ 目录）。类似于你在 React Web 中使用自定义的 Webpack 配置而非 Create React App。在这种模式下，你需要手动处理原生依赖的链接和配置。

### 什么是 Jetpack Compose 和 SwiftUI

- **Jetpack Compose**：Android 平台的现代声明式 UI 框架（类似于 React 的声明式理念，但用于 Android 原生开发）
- **SwiftUI**：iOS 平台的声明式 UI 框架（Apple 推出，同样采用类似 React 的声明式范式）

这两个框架是 `@expo/ui` 的底层技术，下文会提到。

---

## 核心内容

### 包的基本信息

| 属性 | 值 |
|------|------|
| 包名 | `@react-native-community/datetimepicker` |
| 支持平台 | Android、iOS、Expo Go |
| 源码托管 | GitHub（社区维护） |
| 文档更新时间 | 2026 年 5 月 18 日 |

> **注意**：原文档标注此为"即将发布的 SDK"版本的文档。如果你使用的是 SDK 56（当前稳定版），请参考 SDK 56 对应的文档以获取准确的细节。

### 替代方案：`@expo/ui`

文档明确提到，开发者可以使用 `@expo/ui` 作为 `@react-native-community/datetimepicker` 的**直接替代品**。

`@expo/ui` 的特点：
- 在 Android 上基于 **Jetpack Compose** 构建
- 在 iOS 上基于 **SwiftUI** 构建

这意味着 `@expo/ui` 使用的是各平台最新的声明式 UI 框架，而非传统的 UIKit / Android View 体系。对于追求现代化技术栈的项目，`@expo/ui` 可能是更好的选择。

> **基于文档内容推导**：`@expo/ui` 采用平台最新的 UI 框架，可能在外观和性能上更贴近平台最新的设计语言，但作为较新的库，其生态成熟度和社区资源可能不如已经广泛使用的 `@react-native-community/datetimepicker`。在选择时需要根据项目实际情况权衡。

---

## 安装配置

### 在 Expo 托管项目中安装

Expo 使用 `expo install` 命令来安装依赖。这个命令会自动选择与你当前 Expo SDK 版本兼容的包版本，避免版本冲突。

根据你使用的包管理器，选择对应的命令：

```sh
# 使用 npm
npx expo install @react-native-community/datetimepicker

# 使用 yarn
yarn expo install @react-native-community/datetimepicker

# 使用 pnpm
pnpm expo install @react-native-community/datetimepicker

# 使用 bun
bun expo install @react-native-community/datetimepicker
```

> **对 React Web 开发者的说明**：在 Web 项目中，你通常直接使用 `npm install xxx` 或 `yarn add xxx`。但在 Expo 项目中，推荐使用 `expo install` 而非直接 `npm install`，因为 `expo install` 会查询 Expo 的版本兼容表，自动安装一个经过测试、与当前 SDK 兼容的版本。直接 `npm install` 可能会安装最新版，而该版本可能与你的 SDK 不兼容，导致运行时错误。

### 在 Bare Workflow（裸工作流）项目中安装

如果你是在一个已有的 React Native 项目中添加此库（即 Bare Workflow），文档指出你需要：

1. **首先确保项目已经设置了 `expo` 包**——即项目中已经安装并配置了 Expo 的基础依赖
2. **然后参考该库 GitHub README 中的安装说明**完成剩余配置

> **为什么 Bare Workflow 需要额外步骤**：在 Expo 托管项目中，原生代码由 Expo 管理，你不需要关心原生链接。但在 Bare Workflow 中，你需要自己处理原生模块的链接（类似于 Web 项目中手动配置 Webpack loader）。这可能涉及修改 `ios/Podfile`、运行 `pod install`、修改 Android 的 `build.gradle` 等操作。

---

## 进一步学习

文档本身是一个概览页面，详细的 API 属性说明、组件用法、代码示例等内容托管在该库的 GitHub 仓库中。你需要访问其源码仓库的 README 获取：

- 完整的 Props（属性）列表及说明
- 各平台上的 UI 展示差异
- 具体的使用示例代码
- 常见问题和解决方案

---

## 注意事项、限制条件和坑点

### 1. SDK 版本匹配

文档明确标注此文档面向"即将发布的 SDK"。如果你正在使用稳定版 SDK（如 SDK 56），务必切换到对应版本的文档，因为 API 可能存在差异。

### 2. `expo install` vs `npm install`

始终使用 `expo install` 而非直接 `npm install`，这是 Expo 项目中避免原生依赖版本不兼容的关键实践。

### 3. Bare Workflow 的额外配置

在裸工作流中使用此库不能仅靠 `expo install`，还需要按照 GitHub README 完成原生层的手动配置。遗漏这一步是 Bare Workflow 项目中最常见的报错原因之一。

### 4. 平台差异

由于 `DateTimePicker` 封装的是各平台的原生控件，iOS 和 Android 上的外观、交互方式、甚至部分行为可能不同。在 Web 开发中，`<input type="date">` 在不同浏览器中也有类似的情况（Chrome 和 Safari 的日期选择器外观不同），但移动端的差异通常更为显著。

### 5. `@expo/ui` 作为替代方案

如果你正在启动新项目或考虑重构，可以评估 `@expo/ui`。但要注意它可能在社区支持、第三方教程资源方面不如 `@react-native-community/datetimepicker` 丰富。（基于文档内容推导）

---

## React Web 开发者需要特别注意的地方

1. **没有 CSS 样式控制**：在 Web 中你可以通过 CSS 自由定制 `<input type="date">` 的外观。但 `DateTimePicker` 渲染的是原生控件，你无法像 Web 那样用 CSS 随意修改其样式。你能控制的主要是颜色主题和显示模式，而非像素级布局。

2. **不是 HTML 表单元素**：`DateTimePicker` 不是一个可以放在 `<form>` 中自动提交数据的表单控件。它是一个 React 组件，你需要通过 `onChange` 回调手动获取选中的值，然后存入 React state。

3. **平台行为差异大于浏览器差异**：Web 开发者已经习惯了不同浏览器之间相对一致的表单行为。但在移动端，iOS 和 Android 的日期选择器在交互模式上有本质区别（iOS 通常是滚轮/内联选择，Android 通常是弹窗对话框），你需要在代码中考虑这种差异。

4. **安装方式不同**：Web 项目直接 `npm install` 即可，Expo 项目需要 `expo install` 以确保原生兼容性。

---

## 实际开发建议

1. **先在 Expo Go 中验证功能**：Expo Go 已经预置了此库，你可以在 Expo Go 中快速原型验证日期/时间选择的交互逻辑，确认可行后再进行深度开发。

2. **认真处理平台差异**：建议在开发阶段就在 iOS 和 Android 两个平台上测试 `DateTimePicker` 的表现，不要只在一个平台上开发完毕后再适配另一个平台。

3. **评估 `@expo/ui`**：如果是新项目，花一些时间对比 `@react-native-community/datetimepicker` 和 `@expo/ui`，选择更适合你项目技术栈和长期维护策略的方案。

4. **阅读 GitHub README**：由于 Expo 官方文档页面只提供了概览，真正的 API 细节和代码示例在 GitHub 仓库中。在动手写代码之前，务必通读一遍 README 中的 Props 说明和示例代码。

---

## 总结

`@react-native-community/datetimepicker` 是 Expo/React Native 生态中实现日期和时间选择功能的标准库。它通过封装 iOS 和 Android 的原生控件，为用户提供了与系统一致的日期/时间选择体验。

对于从 React Web 转过来的开发者，核心要记住三点：
1. 它是原生控件，不是 Web 表单元素，样式可控性有限
2. 安装时必须使用 `expo install`，不能直接 `npm install`
3. 详细的 API 文档在 GitHub 仓库中，Expo 官方页面只提供概览

此外，`@expo/ui` 作为新兴替代方案值得关注，它基于各平台最新的声明式 UI 框架构建，代表了未来的技术方向。

---

## 文档导航

- **上一页**：[async storage](./223__async-storage.md)
- **下一页**：[netinfo](./225__netinfo.md)
