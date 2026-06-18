# @react-native-picker/picker

## 文档解决的问题

在移动端应用中，经常需要让用户从多个选项中选择一个值——例如选择国家、选择语言、选择数量等。在 Web 开发中，我们通常使用 `<select>` 元素来实现这一功能。

`@react-native-picker/picker` 就是 React Native 生态中对应的跨平台解决方案。它封装了各平台的原生选择器 UI（Android 的 Spinner、iOS 的 UIPickerView 等），让开发者可以用统一的 React 组件接口来实现"从多个选项中选择一项"的交互。

## 阅读前需要理解的背景知识

### 什么是 Picker

Picker（选择器）是一种 UI 组件，允许用户从预定义的选项列表中选择一个值。在 Web 中，`<select>` + `<option>` 就是最典型的 Picker。在移动端，各操作系统提供了各自的原生选择器控件：

- **iOS**：UIPickerView（滚轮式选择器）或 Action Sheet（底部弹出菜单）
- **Android**：Spinner（下拉选择器）
- **macOS**：NSPopUpButton（下拉菜单）
- **Web**：回退为 HTML `<select>` 元素

`@react-native-picker/picker` 将这些原生控件统一封装为一个 React 组件，开发者不需要关心底层差异。

### 第三方库在 Expo 中的定位

这个包不是 Expo 官方自己开发的组件，而是一个被广泛使用的第三方开源库（源码托管在 [GitHub](https://github.com/react-native-picker/picker)）。Expo 对它提供了良好的集成支持——在 Expo Go（Expo 的官方开发客户端）中已经预装了这个库，可以直接使用，无需额外配置原生代码。

> **给 React Web 开发者的类比**：这类似于你在 React Web 项目中使用 `react-select` 或 `@headlessui/react` 的 Listbox 组件——它们是社区维护的第三方库，但被广泛认可为某类 UI 问题的标准解决方案。

## 核心内容

### 支持的平台

| 平台 | 支持情况 | 说明 |
|------|----------|------|
| Android | 支持 | 使用 Android 原生的 Spinner 控件 |
| iOS | 支持 | 使用 iOS 原生的 UIPickerView 等控件 |
| macOS | 支持 | 使用 macOS 原生的下拉菜单 |
| Web | 支持 | 回退为 HTML `<select>` 元素 |
| Expo Go | 已预装 | 在 Expo 开发客户端中可直接使用 |

> **对 React Web 开发者的意义**：这个库实现了真正的跨平台——同一套组件代码可以在手机、平板、桌面和浏览器上运行，且各平台呈现各自原生的交互体验。这与 Web 开发中"一套代码、统一外观"的思路不同，移动端的 Picker 会主动适配各平台的 UI 规范。

### 替代方案：@expo/ui

文档提到 `@expo/ui` 库提供了 `@react-native-picker/picker` 的**直接替代品（drop-in replacement）**。

- **drop-in replacement** 的含义：你可以用 `@expo/ui` 的 Picker 组件直接替换 `@react-native-picker/picker`，无需修改组件的 props 或用法。
- **技术差异**：`@expo/ui` 的底层实现不同——在 Android 上使用 Jetpack Compose（Google 推出的现代声明式 UI 框架），在 iOS 上使用 SwiftUI（Apple 推出的现代声明式 UI 框架）。这意味着它使用了更新一代的原生渲染技术。

> **基于文档内容推导**：`@expo/ui` 可能是 Expo 团队对未来原生 UI 组件方向的布局，但目前 `@react-native-picker/picker` 仍然是主流选择，生态更成熟。如果是新项目，可以关注 `@expo/ui` 的发展。

## 安装与配置

### 安装命令

根据你使用的包管理器，选择对应的安装命令：

```sh
# 使用 npm
npx expo install @react-native-picker/picker

# 使用 yarn
yarn expo install @react-native-picker/picker

# 使用 pnpm
pnpm expo install @react-native-picker/picker

# 使用 bun
bun expo install @react-native-picker/picker
```

**关键说明：**

- **为什么用 `expo install` 而不是 `npm install`**：`expo install` 会自动选择与当前 Expo SDK 版本兼容的包版本，避免版本不匹配导致的原生模块冲突。这在 React Native 开发中尤为重要，因为原生模块的版本不兼容可能导致应用编译失败或运行时崩溃。
- **`npx` 的含义**：`npx` 是 npm 附带的命令执行工具，会临时下载并运行 `expo` CLI。如果你已全局安装了 `expo-cli`，也可以直接使用 `expo install`。
- **yarn / pnpm / bun 的用法**：注意这些包管理器同样通过 `expo install` 子命令来安装，而不是直接使用 `yarn add` 或 `pnpm add`。这确保了 Expo 的版本兼容检查能够生效。

> **给 React Web 开发者的类比**：在纯 Web 项目中，你习惯用 `npm install react-select` 来添加依赖。但在 Expo 项目中，推荐始终通过 `expo install` 来安装包含原生代码的库，这类似于 Web 开发中某些库需要确认与你的 React 版本兼容后再安装。

### 已有 React Native 项目中的安装

如果你不是从零开始创建 Expo 项目，而是在一个**已有的纯 React Native 项目**（即 bare workflow，裸工作流）中集成这个库，需要注意：

1. **先安装 `expo` 模块**：确保项目中已经安装了 `expo` 核心包。这是因为 `@react-native-picker/picker` 在 Expo 生态下依赖 Expo 模块系统来加载原生代码。
2. **再按照库自身的文档完成配置**：访问 [库的 GitHub README](https://github.com/react-native-picker/picker#getting-started)，按照其安装说明完成原生端的配置（例如在 iOS 端运行 `pod install`，在 Android 端可能需要的 Gradle 配置等）。

> **bare workflow（裸工作流）解释**：Expo 有两种主要的项目模式——managed workflow（托管工作流，Expo 管理所有原生代码）和 bare workflow（裸工作流，开发者自己管理原生代码）。如果你在已有 React Native 项目中集成 Expo 生态的库，属于 bare workflow 场景，需要自己处理原生端的配置。

## API 与用法

当前 Expo 文档页面本身只提供了安装指引，**完整的 API 文档（包括组件 Props、方法、使用示例等）需要访问库的官方 GitHub 仓库**：

[https://github.com/react-native-picker/picker](https://github.com/react-native-picker/picker)

> **基于文档内容推导**：这是 Expo 对第三方库文档的常见处理方式——Expo 文档负责安装和平台集成说明，具体 API 用法由库的维护者在其自身仓库中提供。

> **基于经验建议**：在使用前，建议先浏览 GitHub 仓库的 README，了解 `Picker` 和 `Picker.Item` 两个核心组件的 Props（如 `selectedValue`、`onValueChange`、`mode` 等），以及各平台特有的配置选项。

## 注意事项、限制条件和坑点

### 1. SDK 版本注意事项

文档开头明确提示：**当前页面是下一个 SDK 版本（unversioned / 未发布版本）的文档**。如果你正在使用当前稳定版（SDK 56），应参考对应版本的文档以确保信息准确。

> **开发影响**：unversioned 文档中的安装命令或 API 可能与当前稳定版存在差异。在生产项目中，务必使用与你 SDK 版本匹配的文档。

### 2. 跨平台 UI 差异

虽然 Picker 组件在所有平台上提供统一的 JS 接口，但各平台的**视觉呈现和交互方式是不同的**：

- iOS 上通常是滚轮选择器或 Action Sheet
- Android 上通常是下拉菜单（Spinner）或对话框（Dialog）
- Web 上是标准的 `<select>` 下拉框

> **对 React Web 开发者的重要提醒**：在 Web 开发中，你习惯所有平台看到一样的 UI。但在 React Native 中使用 Picker，各平台的用户体验是**刻意不同**的——这是移动端的设计规范，不是 bug。如果你需要完全统一的外观，可能需要自己实现自定义选择器组件，或使用 `@expo/ui` 等方案。

### 3. 原生模块的本质

`@react-native-picker/picker` 包含原生代码（Objective-C/Swift for iOS, Java/Kotlin for Android）。这意味着：

- **不能像纯 JS 库那样即装即用**：安装后可能需要重新编译原生项目（例如运行 `npx expo run:ios` 或 `npx expo run:android`）。
- **Expo Go 中已预装**：如果你使用 Expo Go 进行开发，这个库已经内置，无需额外编译。
- **自定义开发客户端（Custom Dev Client）**：如果你使用 Expo 的 EAS Build 或自定义开发客户端，需要确保这个原生模块被正确包含在构建中。

> **给 React Web 开发者的类比**：在 Web 中，安装一个 npm 包后刷新浏览器就能用。但在 React Native 中，包含原生代码的库安装后通常需要重新编译应用，类似于修改了 Webpack 配置后需要重启开发服务器。

### 4. 文档当前未涉及的内容

以下是当前 Expo 文档页面未明确说明的内容（需参考库的 GitHub 仓库获取）：

- Picker 和 Picker.Item 的完整 Props 列表
- 各平台特有的配置属性（如 Android 的 `mode` 属性可选择 `dialog` 或 `dropdown`）
- 样式自定义的方式和限制
- 无障碍访问（Accessibility）的支持情况
- TypeScript 类型定义的详情

## React Web 开发者需要特别注意的地方

1. **没有 `<select>` 的 `onChange` 事件**：React Native Picker 的值变更回调是 `onValueChange`，而不是 Web 中 `<select>` 的 `onChange`。回调参数直接是选中的值，而不是一个 Event 对象。

2. **选项通过子组件定义**：在 Web 中你用 `<option>` 标签定义选项，在 React Native Picker 中用 `<Picker.Item>` 组件定义。语法类似但属性名不同（`label` 和 `value` 而非 `children` 和 `value`）。

3. **样式系统不同**：React Native 使用 `StyleSheet` 而非 CSS。Picker 的样式定制能力受限于各平台的原生控件，不像 Web 中的 `<select>` 可以通过 CSS 深度定制外观。

4. **受控组件模式相同**：与 Web 中的受控 `<select>` 类似，React Native Picker 也推荐使用受控组件模式——通过 `selectedValue` 控制当前选中项，通过 `onValueChange` 响应用户选择。这部分心智模型可以直接迁移。

## 实际开发建议

1. **优先使用 `expo install` 安装**：始终通过 Expo 的安装命令来添加依赖，确保版本兼容性。

2. **先确认 SDK 版本**：在开始开发前，确认你使用的是稳定版 SDK 的文档，避免 unversioned 文档中的信息与实际版本不匹配。

3. **评估 `@expo/ui` 替代方案**：如果是新项目或需要更现代的原生渲染技术，可以考虑使用 `@expo/ui` 提供的 Picker 替代组件。

4. **阅读库的 GitHub 文档**：Expo 文档只是入口，真正的 API 用法和高级配置都在 [GitHub 仓库](https://github.com/react-native-picker/picker) 中，务必仔细阅读。

5. **测试各平台表现**：由于各平台的 Picker UI 差异较大，建议在 iOS、Android 和 Web 上都进行实际测试，确保交互体验符合预期。

## 总结

`@react-native-picker/picker` 是 React Native 生态中实现跨平台选项选择的标准方案。它封装了 Android、iOS、macOS 和 Web 各平台的原生选择器控件，提供统一的 React 组件接口。

对于有 React Web 经验的开发者，核心要点是：

- 它在概念上等价于 Web 的 `<select>` 元素，但各平台呈现原生 UI 而非统一外观
- 安装时务必使用 `expo install` 确保版本兼容
- 完整 API 需查阅库的 GitHub 仓库
- 注意包含原生代码的库需要重新编译才能在真机或自定义客户端中运行

---

## 文档导航

- **上一页**：[masked view](./227__masked-view.md)
- **下一页**：[segmented control](./229__segmented-control.md)
