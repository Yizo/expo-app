# Brownfield：用 Integrated 方式把 Expo 直接接入原生工程

## 文档解决的问题

这篇文档解决的是：如何把 Expo/React Native 直接接到现有原生 App 工程内部，让宿主原生代码和 React Native 代码一起工作。

## 适用场景

- 原生与 React Native 代码需要频繁同时迭代。
- 同一个团队会同时修改原生工程和跨平台页面。
- 你接受把 Node、Metro、Gradle、CocoaPods 等工具链直接带进现有原生项目。

## 核心概念

- `integrated approach`：Expo/React Native 不是作为独立库发布，而是直接嵌入现有原生工程。
- `ReactActivity`：Android 上承载 React Native 页面的一种 Activity。
- `autolinking`：自动发现并接入 React Native / Expo 原生模块。
- `monorepo`：若原生目录结构不标准，可以用 monorepo 管理工程根目录和工作区。

## 按原文结构整理的核心内容

### 1. 先在原生工程根目录创建 Expo 项目

```sh
npx create-expo-app@latest my-project --template default@sdk-56
```

这会得到一个新的 Expo 项目目录，例如 `my-project`。

### 2. 尽量靠近 React Native 的标准目录结构

标准 React Native 项目希望原生代码位于：

- `android`
- `ios`

如果现有项目不能迁到这种结构，文档建议用 monorepo，把 Expo 项目作为 workspace，并在 Gradle/CocoaPods 中显式配置自定义 project root。

这一步的本质是：让原生脚本能正确找到 Node 模块和 React Native 工程根目录。

### 3. Android 原生工程需要做哪些事

文档重点展开了 Android 方向：

- 改 `settings.gradle`
- 改顶层 `build.gradle`
- 改 `app/build.gradle`
- 改 `gradle.properties`
- 改 `AndroidManifest.xml`
- 改 `Application` 类
- 新建继承 `ReactActivity` 的 Activity

#### `settings.gradle`

作用包括：

- 引入 React Native Gradle Plugin
- 引入 Expo autolinking settings
- 启用 Expo modules 自动链接
- 如目录结构非标准，显式指定项目根目录

#### `gradle.properties`

文档给出的关键项：

```properties
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64
newArchEnabled=true
hermesEnabled=true
```

#### `AndroidManifest.xml`

至少要：

- 添加 `INTERNET` 权限
- 在 debug manifest 里允许 cleartext traffic，以便访问本地 Metro HTTP 服务

#### `Application` 和 `ReactActivity`

`Application` 负责初始化 React Native 运行时。

新建的 `ReactActivity` 负责承载 React Native 页面。文档示例中：

- `getMainComponentName()` 返回 `"main"`
- 用 `ReactActivityDelegateWrapper` 包装默认 delegate
- 结合 `fabricEnabled` 和 New Architecture 配置

还要把这个 Activity 注册到 `AndroidManifest.xml`，并使用非 ActionBar 主题。

### 4. 如何测试集成

在 Expo 项目目录里启动：

```sh
npm run start
```

Metro 会构建并通过本地 HTTP 服务提供 JS bundle。然后像平常一样编译运行原生 App，进入该 Activity 后就会加载 React Native 页面。

## 关键命令、配置、文件说明

关键命令：

- `npx create-expo-app@latest my-project --template default@sdk-56`
- `yarn install`
- `npm run start`

关键文件：

- 根 `package.json`
- `settings.gradle`
- 顶层 `build.gradle`
- `app/build.gradle`
- `gradle.properties`
- `AndroidManifest.xml`
- `MainApplication.kt` 或对应 `Application` 类
- 自定义 `ReactActivity`

关键配置：

- workspaces
- custom project root
- `newArchEnabled`
- `hermesEnabled`

## 注意事项、限制条件和坑点

- 这条路线会把 React Native/Expo 工具链直接带入原生工程，工程耦合更高。
- 如果目录结构不标准，必须处理 project root，不然 autolinking 可能失效。
- Debug 模式要能连到本地 Metro，所以 Android debug manifest 需要允许明文 HTTP。
- Activity 主题不能带 ActionBar，否则 React Native 页面上方会有原生标题栏遮挡。

## React Web 开发者易误解点

- 容易把“把页面接进去”理解成只写一个 React 组件。实际上宿主原生需要先准备运行时、入口 Activity、Manifest、Gradle。
- 容易低估目录结构的重要性。Web 项目里根目录问题多半只影响路径；这里会直接影响 autolinking 和原生构建。
- 容易把 Metro 当成普通前端 dev server。它在这里还是原生 App 调试时的 JS bundle 提供者。

## 实际开发建议

- 如果你预计长期频繁混改原生和 React Native，这条路线更顺手。
- 若现有目录结构复杂，尽早决定是迁成标准结构还是用 monorepo。
- 基于经验建议：先按最小页面打通 `ReactActivity`，再接入更复杂的原生交互。

## 文档明确说明

- integrated 方案是在现有原生工程中直接接入 Expo/React Native。
- Android 侧需要改 Gradle、Manifest、Application、Activity 等多个入口。
- 非标准目录结构可通过 monorepo 和自定义 project root 处理。
- 测试时通过 Metro 提供本地 bundle。

## 基于文档内容推导

- 基于文档内容推导：integrated 的优势是联调效率高，代价是宿主工程复杂度会上升。
- 基于文档内容推导：如果原生主工程本身已经很复杂，前期集成成本可能明显高于 isolated。

## 当前文档未涉及

- 当前文档未展开 iOS 侧与 Android 同等详细的接入步骤。
- 当前文档未涉及 React Native 页面与原生导航、数据通信的复杂实践。

<!-- NAVIGATION START -->
---
[← 上一页：Brownfield：用 Isolated 方式把 Expo 打成原生库](./38_isolated-approach.md) | [下一页：Brownfield 中的生命周期监听机制 →](./40_lifecycle-listeners.md)
<!-- NAVIGATION END -->
