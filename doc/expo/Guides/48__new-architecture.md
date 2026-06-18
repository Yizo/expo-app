# React Native 新架构

> 原文地址：https://docs.expo.dev/guides/new-architecture/
>
> 最后修改日期：2025 年 6 月 3 日

---

## 概述

React Native 新架构（New Architecture）是 React Native 框架的一次重大底层重构，旨在解决长期以来在 Meta 内部及更广泛社区中发现的生产环境局限性。**从 SDK 55 开始，Expo 仅运行在新架构之上，新架构始终启用且无法禁用。** 如果你需要使用旧架构（Legacy Architecture），请使用 SDK 54 或更早版本。

> **关键术语解释（面向初学者）：**
>
> - **新架构（New Architecture）**：React Native 的全新底层框架设计，引入了 JSI（JavaScript Interface）、Fabric（新渲染器）、TurboModules（新原生模块系统）等核心组件，大幅提升了性能和开发体验。
> - **旧架构（Legacy/Old Architecture）**：React Native 早期的底层框架，依赖异步 Bridge 通信，存在性能瓶颈和功能限制。
> - **JSI（JavaScript Interface）**：允许 JavaScript 直接调用 C++ 原生对象的接口，消除了旧架构中 Bridge 的序列化开销。
> - **Fabric**：React Native 的新渲染系统，支持同步渲染和并发特性。
> - **TurboModules**：新的原生模块系统，支持懒加载和直接调用，减少启动时间和内存占用。
> - **Interop Layer（互操作层）**：一种兼容层，允许为旧架构编写的原生模块在新架构下运行，无需完全重写。

---

## 为什么要迁移？

迁移到新架构是势在必行的，原因如下：

### 面向未来

新架构代表了 React Native 的当前和未来发展方向。**旧架构已于 2025 年 6 月冻结**，不再接收任何新功能或错误修复。从 React Native 0.82 和 SDK 55 开始，新架构被永久强制执行。

### 独有功能

一些新功能**仅在新架构下可用**，包括：

- **完整的 Suspense 支持**：React 的 Suspense 机制在数据加载和代码分割场景下的完整集成
- **高级样式功能**：新的 CSS 特性支持（如 `gap`、`display: contents` 等）

> **基于文档内容推导**：随着旧架构的冻结，未来所有 React Native 的新特性和性能优化都将仅面向新架构，继续使用旧架构意味着你的项目将逐渐落后于生态发展。

---

## Expo 工具兼容性

### 官方包

从 **SDK 53** 开始，所有 Expo 官方包以及通过 [Modules API](https://docs.expo.dev/modules/overview/) 构建的自定义模块都**原生支持新架构**。

### 采用率

截至 2026 年初，大约 **83%** 的 SDK 54 云端构建项目已采用新架构。

> **基于经验建议**：如果你正在使用 Expo 官方包（如 `expo-camera`、`expo-notifications` 等），可以放心迁移到新架构——这些包已经完全兼容。

---

## 第三方库与兼容性验证

### 社区兼容性追踪

社区通过 [React Native Directory](https://reactnative.directory/)（React Native 目录网站）追踪第三方包的兼容性状态。Expo Doctor 工具集成了这些数据来自动验证你的项目依赖。

### 运行兼容性检查

使用你喜欢的包管理器运行 Expo Doctor：

```sh
# npm
npx expo-doctor@latest

# yarn
yarn dlx expo-doctor@latest

# pnpm
pnpm dlx expo-doctor@latest

# bun
bunx expo-doctor@latest
```

### 配置验证行为

你可以在 `package.json` 中修改验证行为：

```json
{
  "expo": {
    "doctor": {
      "reactNativeDirectoryCheck": {
        "exclude": ["react-redux"]
      }
    }
  }
}
```

可用配置选项：

| 选项 | 类型 | 说明 |
|------|------|------|
| `enabled` | `boolean` | 切换是否对目录中未找到的包发出警告。SDK 52+ 默认启用。 |
| `exclude` | `string[]` | 排除特定包的警告检查。支持精确包名或正则表达式。 |
| `listUnknownPackages` | `boolean` | 设为 `false` 时，隐藏目录中未收录的包的警告信息。 |

> **基于经验建议**：在迁移前务必先运行 `npx expo-doctor@latest`，它会清晰告诉你哪些第三方库可能存在兼容性问题，避免盲目迁移后的排查困难。

---

## 初始化新项目

SDK 52 及更高版本**默认启用新架构**。使用以下命令创建新项目（指定 `sdk-56` 模板）：

```sh
# npm
npx create-expo-app@latest --template default@sdk-56

# yarn
yarn create expo-app --template default@sdk-56

# pnpm
pnpm create expo-app --template default@sdk-56

# bun
bun create expo --template default@sdk-56
```

新项目开箱即用地运行在新架构之上，无需任何额外配置。

---

## 在现有项目中启用新架构

根据不同 SDK 版本，启用方式有所不同：

### SDK 55 及更高版本

新架构**永久启用**。如果 `app.json` 中存在 `newArchEnabled` 配置项，请直接删除——它已不再起作用。

### SDK 53 和 54

新架构**默认启用**。只需移除任何显式禁用它的配置即可。SDK 54 是最后一个允许切换架构的版本。

### SDK 52

在 `app.json`（或 `app.config.js`）中设置启用标志：

```json
{
  "expo": {
    "newArchEnabled": true
  }
}
```

然后执行清理预构建并运行目标平台：

**Android：**

```sh
# npm
npx expo prebuild --clean && npx expo run:android
# 或使用 EAS Build
eas build -p android

# yarn
yarn expo prebuild --clean && yarn expo run:android
eas build -p android

# pnpm
pnpm expo prebuild --clean && pnpm expo run:android
eas build -p android

# bun
bun expo prebuild --clean && bun expo run:android
eas build -p android
```

**iOS：**

```sh
# npm
npx expo prebuild --clean && npx expo run:ios
# 或使用 EAS Build
eas build -p ios

# yarn
yarn expo prebuild --clean && yarn expo run:ios
eas build -p ios

# pnpm
pnpm expo prebuild --clean && pnpm expo run:ios
eas build -p ios

# bun
bun expo prebuild --clean && bun expo run:ios
eas build -p ios
```

> **关键术语解释**：
>
> - **prebuild**：Expo 的预构建命令，根据 `app.json` 配置生成原生项目文件（Android 的 `android/` 目录和 iOS 的 `ios/` 目录）。`--clean` 参数会先清除已有的原生目录再重新生成。
> - **EAS Build**：Expo Application Services 提供的云端构建服务，无需本地配置原生开发环境即可构建应用。

### SDK 51 及更早版本

**强烈建议升级到更新的 SDK 版本**，因为旧架构已被冻结。如果确实需要在此版本启用新架构，需要安装 [build properties 插件](https://docs.expo.dev/versions/latest/sdk/build-properties/) 并手动配置目标平台。

### Bare 工作流（SDK 52 及更早版本）

> **关键术语解释**：
>
> - **Bare 工作流（Bare workflow）**：不使用 Expo 的托管构建流程，而是直接管理原生 Android（Gradle）和 iOS（CocoaPods/Xcode）项目文件的开发方式。

对于 Bare 工作流项目，需要手动修改原生配置文件：

- **Android**：修改 `android/gradle.properties` 文件中的 `newArchEnabled` 属性
- **iOS**：修改 `ios/Podfile.properties.json` 文件中的 `newArchEnabled` 属性

---

## 禁用新架构

### SDK 55 及更高版本

**无法禁用。** 从 React Native 0.82 开始，禁用新架构的选项已被完全移除。Expo Go 客户端也仅支持新架构。

> ⚠️ **警告**：SDK 55 及更高版本不支持禁用新架构。如果你需要使用旧架构，请使用 SDK 54 或更早版本。

### SDK 54 及更早版本

在 `app.json` 中将标志设为 `false`，然后生成开发构建（development build）：

```json
{
  "expo": {
    "newArchEnabled": false
  }
}
```

### Bare 工作流

同样需要手动调整 Android 的 `gradle.properties` 和 iOS 的 `Podfile.properties.json` 文件，将 `newArchEnabled` 设为 `false`。

---

## 故障排除

### 不支持的第三方库

如果遇到兼容性问题，可以在测试分支中**临时移除不兼容的包**来评估迁移的可行性。这有助于隔离问题并确认哪些库是阻碍迁移的瓶颈。

### React Native 核心问题

如果怀疑是 React Native 本身的问题，可以在 [React Native GitHub 仓库](https://github.com/facebook/react-native) 中查找带有 **"Type: New Architecture"** 标签的 Issues。

### Expo 官方库

目前没有已知的 Expo 官方库在新架构下的特定问题。

### 第三方库与互操作层（Interop Layer）

> **关键术语解释**：
>
> - **互操作层（Interop Layer）**：从 React Native 0.74 开始提供的兼容层，它充当新旧架构之间的桥梁，允许为旧架构编写的原生模块在新架构下运行。虽然不完美，但对于大多数场景已经足够，尤其有助于地图类库等场景的平滑过渡。

**重要提醒**：互操作层对于纯 JavaScript 库和轻量原生模块效果良好，但**重度依赖自定义原生代码的模块可能需要专门的更新**。以下是已知需要关注的库及其推荐方案：

| 库类别 | 问题包 | 推荐替代方案 |
|--------|--------|-------------|
| 地图 | `react-native-maps`（1.20.x 和 1.21.0 版本有讨论） | 使用 [`expo-maps`](https://docs.expo.dev/versions/latest/sdk/maps/) 或关注版本更新 |
| 支付 | `@stripe/stripe-react-native` | 升级到 `0.45.0` 或更高版本，该版本已添加新架构支持 |
| 遮罩视图 | `@react-native-community/masked-view` | 替换为 [`@react-native-masked-view/masked-view`](https://github.com/react-native-masked-view/masked-view) |
| 剪贴板 | `@react-native-community/clipboard` | 替换为 [`@react-native-clipboard/clipboard`](https://github.com/react-native-clipboard/clipboard) |
| 文件 Blob | `react-native-blob-util` 旧版本 | 升级到最新版本的 `react-native-blob-util` |
| 文件系统 | 部分旧文件系统库 | 使用 [`expo-file-system`](https://docs.expo.dev/versions/latest/sdk/filesystem/) 或其兼容分支 |
| 地理位置 | 旧地理位置库 | 使用 [`expo-location`](https://docs.expo.dev/versions/latest/sdk/location/) |
| 日期选择器 | 旧日期选择器库 | 使用 [`react-native-date-picker`](https://github.com/henninghall/react-native-date-picker) 或 [`@react-native-community/datetimepicker`](https://github.com/react-native-datetimepicker/datetimepicker) |

> **基于经验建议**：上表中的替代方案列表是经过社区验证的可靠选择。迁移时优先采用 Expo 官方模块（如 `expo-maps`、`expo-location`、`expo-file-system`），它们对新架构的支持最为完善。如果必须使用第三方库，务必检查其在 [React Native Directory](https://reactnative.directory/) 上的兼容状态。

### 构建失败

当构建失败时，建议按以下步骤排查：

1. **检查构建日志**：仔细阅读错误输出，定位具体失败的模块或依赖
2. **更新依赖包**：确保所有包都使用最新版本
3. **运行诊断工具**：执行 `npx expo-doctor@latest` 检查已知问题
4. **提交 Bug 报告**：向相关维护者提交包含最小可复现示例（Minimal Reproducible Example）的 Bug 报告

> **基于经验建议**：构建失败最常见的原因是某个第三方原生模块尚未适配新架构。使用 `npx expo-doctor@latest` 快速定位问题包，然后查阅上表中的替代方案或在该包的 GitHub 仓库中搜索 "new architecture" 相关的 Issues。

---

## 迁移检查清单

> **基于文档内容推导**：以下检查清单根据文档中的各章节要点汇总而成，供迁移时参考。

- [ ] 确认当前 SDK 版本（SDK 55+ 强制使用新架构）
- [ ] 运行 `npx expo-doctor@latest` 检查第三方库兼容性
- [ ] 替换已知不兼容的第三方库（参考上方替代方案表）
- [ ] 更新 `app.json` 配置（如需）
- [ ] 执行 `npx expo prebuild --clean` 重新生成原生项目
- [ ] 在 Android 和 iOS 上分别测试应用功能
- [ ] 检查 React Native GitHub 上的已知问题
- [ ] 如遇到问题，向相关库维护者提交 Bug 报告

---

## 文档导航

- **上一页**：[ios simulator](./47__ios-simulator.md)
- **下一页**：[react compiler](./49__react-compiler.md)
