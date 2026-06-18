> 原始文档来源：https://docs.expo.dev/workflow/using-libraries/

# 使用 Expo SDK、React Native 和第三方库

本文档详细介绍如何在 Expo 项目中集成和使用 Expo SDK 模块、React Native 核心组件以及第三方 npm 包，帮助开发者理解库的查找、兼容性评估和安装流程。

---

## 核心概念

在开始使用各种库之前，需要先理解以下关键概念。

> **关键术语解释**
>
> - **库（Library）**：也称为"包"（Package）或"模块"（Module），是预先编写好的可复用代码集合，用于实现特定功能。例如，一个处理日期的库可以帮助你格式化日期显示。
> - **npm（Node Package Manager）**：JavaScript 生态系统中最大的包注册中心（registry），托管了数十万个开源库。开发者可以从中安装依赖到自己的项目中。
> - **依赖（Dependency）**：你的项目所依赖的外部库。例如，如果你的项目使用了 React Navigation 来实现导航功能，那么 React Navigation 就是你项目的一个依赖。
> - **原生代码（Native Code）**：用平台原生语言编写的代码，iOS 上使用 Swift/Objective-C，Android 上使用 Kotlin/Java。某些功能（如直接访问相机硬件）需要通过原生代码实现。

---

## React Native 核心库

React Native 框架本身提供了一系列基础的 UI 组件（也称为"核心组件"或"内置组件"），这些组件是构建任何移动应用界面的基石。

> **关键术语解释**
>
> - **UI 组件（UI Component）**：用户界面的基本构建块。类似于 HTML 中的 `<div>`、`<span>` 等标签，React Native 使用 `<View>`、`<Text>` 等组件来构建界面。
> - **基础组件（Core Components）**：React Native 内置的组件，无需额外安装即可直接使用。它们提供了最基本的界面元素，如文本显示、输入框、滚动区域等。

React Native 提供的基础组件包括：

- `<ActivityIndicator>`：加载指示器（旋转的菊花图标），用于提示用户当前正在加载数据
- `<TextInput>`：文本输入框，允许用户输入文字
- `<Text>`：文本显示组件，用于在屏幕上显示文字内容
- `<ScrollView>`：可滚动的容器视图，当内容超出屏幕时允许用户滑动查看
- `<View>`：基础容器组件，类似于 HTML 中的 `<div>`，用于布局和包裹其他组件

你可以在 React Native 官方的"核心组件和 API"文档中查看完整列表，也可以检查当前 Expo SDK 版本所对应的 React Native 版本。

使用这些核心组件时，直接从 `react-native` 包中导入即可：

```tsx
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Hello, world!</Text>
    </View>
  );
}
```

> **关键术语解释**
>
> - **`import`**：JavaScript 的模块导入语法，用于从其他文件中引入需要的功能。这里从 `react-native` 包中导入了 `Text` 和 `View` 两个组件。
> - **`style` 属性**：React Native 中用于设置组件样式的属性。`flex: 1` 表示组件占满可用空间；`justifyContent: 'center'` 表示垂直居中；`alignItems: 'center'` 表示水平居中。
> - **`export default`**：JavaScript 的默认导出语法，表示这个函数是该文件的默认输出。在 React Native 中，应用入口文件的默认导出就是应用的根组件。

---

## Expo SDK 库

Expo SDK 是对 React Native 核心功能的扩展，提供了访问设备硬件和系统功能的模块，例如相机、音频播放、条形码扫描、日历、地图、OAuth 认证等。

> **关键术语解释**
>
> - **Expo SDK**：Expo 官方维护的一组库的集合，这些库封装了设备层面的能力（如相机、传感器、文件系统等），让开发者可以用 JavaScript 调用原生功能，而无需自己编写原生代码。
> - **API 参考（API Reference）**：文档中详细列出某个库所有可用函数、属性、方法的页面，类似于"使用说明书"。

你可以在 Expo 的 API 参考文档中搜索需要的模块。每个模块的文档页面通常会展示：

1. **平台兼容性标签**：显示该模块支持哪些平台（iOS、Android、Web 等）
2. **安装说明**：如何使用 `npx expo install` 命令安装
3. **配置插件详情**：是否需要进行原生配置
4. **使用示例**：具体的代码示例
5. **API 部分**：列出所有可用的导入、钩子（Hooks）、属性和方法

### 安装 Expo SDK 库

`npx expo install` 命令会自动为你的包管理器（npm、yarn、pnpm 或 bun）选择兼容的库版本。

```sh
# npm
npx expo install expo-device

# yarn
yarn expo install expo-device

# pnpm
pnpm expo install expo-device

# bun
bun expo install expo-device
```

> **关键术语解释**
>
> - **`npx expo install`**：Expo CLI 提供的安装命令。与直接使用 `npm install` 不同，它会根据你的 Expo SDK 版本自动选择兼容的库版本，避免因版本不匹配而导致的错误。
> - **`expo-device`**：一个具体的 Expo SDK 模块示例，用于获取设备信息（如设备型号、操作系统版本等）。

> **提示**：如果你使用 TypeScript，可以在兼容 TypeScript 的代码编辑器（如 VS Code）中通过自动补全功能查看 API 的详细信息，无需离开编辑器即可了解可用的属性和方法。

### 在已有的 React Native 应用中使用 Expo SDK 库

如果你的应用是通过 React Native CLI 初始化的，且尚未安装 `expo` 包，则需要先参考"在已有 React Native 应用中安装 Expo 模块"指南进行配置，然后才能使用 Expo SDK 的库。

---

## 第三方库

第三方库是指由社区或其他组织开发和维护的库，不属于 React Native 核心或 Expo SDK 的一部分。它们提供了各种各样的功能，从导航、状态管理到图表绘制等。

> **关键术语解释**
>
> - **第三方库（Third-party Library）**：不是由框架官方（如 Meta 或 Expo 团队）维护的库，而是由社区开发者或第三方组织开发。例如 `react-navigation`（导航库）、`react-native-reanimated`（动画库）等。
> - **开发构建（Development Build）**：包含 `expo-dev-client` 库的自定义应用构建版本。与 Expo Go 不同，开发构建支持所有 React Native 原生库，是生产环境推荐的使用方式。

### 查找第三方库

查找 React Native 兼容库的推荐途径：

1. **React Native Directory**（https://reactnative.directory）：这是搜索 React Native 专用包的首选资源。它是一个可搜索的数据库，收录了大量兼容 React Native 的库，并标注了每个库的平台兼容性和 Expo Go 支持情况。
2. **npm 注册中心**（https://www.npmjs.com/）：如果在 React Native Directory 中找不到需要的包，可以在 npm 注册中心搜索。但请注意，**并非所有 npm 包都兼容 React Native**。

> **关键术语解释**
>
> - **React Native Directory**：由 React Native 社区维护的库目录网站。你可以按关键词搜索，并通过标签筛选出支持特定平台（iOS、Android、Web）和特定环境（Expo Go、开发构建）的库。

### 判断第三方库的兼容性

理解库的兼容性是避免开发过程中遇到问题的关键。

#### 开发构建 vs. Expo Go

- **开发构建**推荐用于生产环境应用，因为它包含了所有必要的原生代码，支持**所有**兼容 React Native 的库。
- **Expo Go** 只是一个学习用的"受限游乐场"，它不包含所有原生库的支持。你可以在 React Native Directory 上查看每个库是否带有 "Expo Go" 兼容标签来确认支持情况。

> **关键术语解释**
>
> - **Expo Go**：一个预装在手机上的应用，可以即时预览 Expo 项目而无需编译原生代码。它内置了一组常用的 Expo SDK 模块，但对于需要额外原生代码的第三方库则无法支持。

#### 判断库是否需要原生代码修改

要判断一个依赖是否会修改原生目录，可以逐一检查以下问题：

1. 该库是否包含 `android` 或 `ios` 目录？
2. 该库是否提到了"链接"（linking）？
3. 该库是否要求修改 Android 的 `AndroidManifest.xml`、iOS 的 `Info.plist`，或 `Podfile` 文件？
4. 该库是否使用了**配置插件**（Config Plugin）？

如果以上任何一个问题的答案是"是"，那么你就需要生成一个**开发构建**。

> **关键术语解释**
>
> - **`AndroidManifest.xml`**：Android 应用的清单文件，声明了应用所需的权限、组件（如 Activity）等信息。
> - **`Info.plist`**：iOS 应用的配置文件，包含了应用的元数据，如权限声明、支持的 URL 方案等。
> - **`Podfile`**：iOS 项目使用 CocoaPods（iOS 的依赖管理工具）时的依赖声明文件。
> - **链接（Linking）**：将原生库的代码与你的应用关联起来的过程。在较新的 React Native 版本中，大多数库通过"自动链接"（autolinking）机制自动完成此步骤。

#### 查找库的 GitHub 仓库

如果某个库未被列在 React Native Directory 上，你可以使用 `npm-home` 命令配合 `--github` 标志来定位其 GitHub 仓库：

```sh
# npm
npx npm-home --github react-native-localize

# yarn
yarn dlx npm-home --github react-native-localize

# pnpm
pnpm dlx npm-home --github react-native-localize

# bun
bunx npm-home --github react-native-localize
```

> **关键术语解释**
>
> - **`npm-home`**：一个命令行工具，用于快速打开某个 npm 包的主页或其 GitHub 仓库页面。这对于查看源代码、提交 Issue 或阅读文档非常方便。

> **提示**：如果你需要帮助判断库的兼容性，可以在 [React Native Directory 的 GitHub 仓库](https://github.com/react-native-community/directory)上提交一个 Issue。这不仅会帮助到你，也会帮助其他开发者在未来找到现成的答案。

### 安装第三方库

> **重要建议**：我们始终推荐使用 `npx expo install` 而不是直接使用 `npm install` 或 `yarn add`，因为前者允许 Expo CLI 自动选择兼容的库版本，并在发现已知的不兼容问题时发出警告。

```sh
# npm
npx expo install @react-navigation/native

# yarn
yarn expo install @react-navigation/native

# pnpm
pnpm expo install @react-navigation/native

# bun
bun expo install @react-navigation/native
```

> **关键术语解释**
>
> - **`@react-navigation/native`**：React Navigation 的核心包，一个广泛使用的 React Native 导航库。`@` 开头的包名表示它是一个 npm 作用域（scope）包，即属于 `react-navigation` 组织的一组相关包之一。

#### 安装后的额外步骤

安装完成后，务必查阅该库的 README 文件，了解是否需要额外的配置步骤（如添加权限声明、初始化代码等）。你可以使用 `npm-home` 命令（不带 `--github` 标志）快速打开库的主页：

```sh
# npm
npx npm-home @react-navigation/native

# yarn
yarn dlx npm-home @react-navigation/native

# pnpm
pnpm dlx npm-home @react-navigation/native

# bun
bunx npm-home @react-navigation/native
```

#### 使用配置插件处理原生配置

对于需要原生配置的模块，可以使用**配置插件**（Config Plugin）。如果某个库没有提供官方的配置插件，可以查阅[社区维护的非官方配置插件列表](https://github.com/expo/config-plugins/)。

> **关键术语解释**
>
> - **配置插件（Config Plugin）**：一种在不直接编辑原生代码的前提下，自动修改原生项目配置（如 `AndroidManifest.xml`、`Info.plist`）的机制。它是 Expo 预构建（prebuild）系统的重要组成部分，使得原生配置的修改可以被自动化和可重复执行。
> - **非官方配置插件（Out-of-tree Config Plugins）**：不是由 Expo 官方维护，而是由社区开发者创建的配置插件。它们通常托管在独立的 GitHub 仓库中。

### 在已有的 React Native 应用中使用第三方库

如果你的应用是一个已有的 React Native 项目，且尚未采用 Expo Prebuild，则配置插件无法正常工作。你有两个选择：

1. **采用 Expo Prebuild**：这是推荐的方式，可以让配置插件自动管理原生配置。
2. **手动配置**：如果不打算采用 Prebuild，则需要手动按照库的文档进行原生配置。

如果某个库在 Expo Go 中不受支持，你需要创建一个开发构建来添加自定义的原生代码。

### 排除第三方库的版本检查

当你运行 `npx expo install`、`npx expo-doctor` 或 `npx expo start` 等命令时，Expo CLI 会自动检查已安装的库版本是否与当前的 Expo SDK 版本兼容。

> **关键术语解释**
>
> - **`npx expo-doctor`**：Expo 提供的诊断工具，用于检查项目的配置和依赖是否存在已知问题。类似于"体检"工具，帮助你发现潜在的配置错误。

如果你需要跳过某些特定包的版本检查（例如，你确认某个较新版本的库即使不在官方兼容列表中也能正常工作），可以在 `package.json` 文件中使用 `expo.install.exclude` 属性来排除这些包。

> **基于文档内容推导**：此配置的位置在 `package.json` 文件中。具体做法是在 `package.json` 的 JSON 对象中添加 `"expo"` 字段，并在其中设置 `"install"` 下的 `"exclude"` 数组，将需要跳过检查的包名列出。例如：
>
> ```json
> {
>   "expo": {
>     "install": {
>       "exclude": ["some-package-name", "another-package"]
>     }
>   }
> }
> ```
>
> 这样，Expo CLI 在执行安装、诊断和启动命令时将不会对这些包进行版本兼容性检查。

> **基于经验建议**：除非你明确知道自己在做什么，否则不建议轻易排除版本检查。版本不兼容是导致运行时错误的常见原因之一，Expo CLI 的版本检查机制可以帮你提前发现这些问题。

---

## 总结：库的选择与安装流程

```
需要某个功能？
    │
    ├── 是基础 UI 组件？ → 从 'react-native' 直接导入
    │
    ├── 是设备/系统功能？ → 在 Expo SDK 中查找，使用 npx expo install 安装
    │
    └── 是其他功能？ → 查找第三方库
            │
            ├── 在 React Native Directory 搜索
            │
            ├── 判断兼容性：
            │     ├── 是否需要原生代码？ → 需要开发构建
            │     └── 是否支持 Expo Go？ → 可在 Expo Go 中使用
            │
            └── 使用 npx expo install 安装
                  │
                  └── 检查 README 中的额外配置步骤
```

| 库的类型 | 来源 | 安装方式 | 是否需要开发构建 |
|---------|------|---------|---------------|
| React Native 核心组件 | 内置于 `react-native` | 无需安装，直接导入 | 否 |
| Expo SDK 模块 | Expo 官方 | `npx expo install` | 视模块而定 |
| 第三方库（纯 JS） | npm / React Native Directory | `npx expo install` | 否 |
| 第三方库（含原生代码） | npm / React Native Directory | `npx expo install` + 额外配置 | 是 |

---

## 文档导航

- **上一页**：[continuous native generation](./4__continuous-native-generation.md)
- **下一页**：[apple privacy](./6__apple-privacy.md)
