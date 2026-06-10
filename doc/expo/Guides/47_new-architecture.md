# React Native 的 New Architecture

## 文档解决的问题

这篇文档解决的是：Expo 项目中 React Native New Architecture 是什么、为什么要迁移、不同 SDK 版本下如何启用或停用，以及如何检查三方库兼容性。

## 适用场景

- 你正在维护 Expo SDK 54 或更早的项目，准备升级。
- 你看到 `newArchEnabled`，但不清楚它现在是否还有效。
- 你担心第三方原生库在新架构下是否兼容。
- 你需要向团队解释“为什么现在必须关心新架构”。

## React Web 开发者先要补的背景

- React Native 的“架构”不是路由结构或组件结构，而是 JS 和原生之间的底层运行与通信方式。
- `legacy architecture` 指旧实现。
- `New Architecture` 指 React Native 内部的大规模重构。
- 对 Web 开发者来说，可以把它理解成“框架底层运行时升级”，影响性能特性、能力边界、原生库兼容性。

## 文档中的核心结论

### SDK 55 及以后已经完全进入新架构

文档明确说明：

- `SDK 55 and later run entirely on the New Architecture`
- 新架构始终开启，不能关闭。
- 如果你必须使用旧架构，只能停留在 SDK 54 或更早。

这是整篇文档最关键的结论。

### 新架构不是可选未来，而是当前现实

文档明确说明：

- React Native 0.82 开始，新架构无法关闭。
- 旧架构在 2025 年 6 月被冻结，不再接收新特性和修复。
- 新 React / React Native 特性会只支持新架构。

### Expo 自家生态已基本支持

文档明确说明：

- 从 SDK 53 开始，所有 `expo-*` 包都支持新架构。
- 用 Expo Modules API 编写的原生模块默认支持新架构。

## 为什么要迁移

文档给出的理由主要有三类：

### 1. 这是 React Native 的现在和未来

不是“是否值得尝试”的问题，而是“迟早必须面对”的问题。

### 2. 新特性只会继续落在新架构上

文档举例提到：

- 完整的 Suspense 支持
- 新的样式能力

### 3. 三方库生态正在向新架构集中

很多流行库只支持新架构，或者优先支持新架构。

## Expo 与第三方库的关系

### Expo SDK 库支持状态

文档明确说明：

- SDK 53 起所有 `expo-*` 包支持新架构。
- 包括 `bridgeless` 支持。
- Expo SDK 库当前没有已知的新架构专属问题。

### 第三方库支持状态

文档建议使用 `React Native Directory` 和 `Expo Doctor` 进行检查。

用于检查的命令：

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

### `package.json` 配置

文档给出可配置项：

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

相关配置含义：

- `enabled`：是否对未收录包发出警告。
- `exclude`：排除指定包，支持精确名称和正则。
- `listUnknownPackages`：是否列出 React Native Directory 中未知的包。
- `EXPO_DOCTOR_ENABLE_DIRECTORY_CHECK`：可用环境变量覆盖 `enabled`。

## 新项目与老项目的处理方式

### 新项目

文档明确说明，SDK 52 起新项目默认启用新架构。

示例命令：

```sh
# npm
npx create-expo-app@latest --template default@sdk-56
```

其他包管理器命令文档也有给出。

### 现有项目启用新架构

文档明确说明：

- SDK 55+ 无需也无法手动关闭。
- 如果你还写着 `newArchEnabled: false`，这个配置会被忽略，建议删除。

对于较老的 bare React Native / Expo 项目，文档给出：

- Android：在 `gradle.properties` 里设置 `newArchEnabled=true`
- iOS：在 `Podfile.properties.json` 里设置 `"newArchEnabled": "true"`

### 现有项目关闭新架构

文档明确说明：

- SDK 55+ 不支持关闭。
- Expo Go 只支持新架构。

SDK 54 及更早版本才可以在 app config 中设置：

```json
{
  "expo": {
    "newArchEnabled": false
  }
}
```

文档还明确要求：如果选择关闭，需要使用 development build。

## 常见问题与排查思路

### 1. 我可以先试试，即使有些库还不支持吗

文档给出的建议是可以，但最好：

- 临时移除不兼容库
- 单独开分支试验
- 观察到底哪些库阻塞迁移

### 2. 启用后构建失败怎么办

文档建议：

- 先读日志，定位具体不兼容库
- 再运行 `npx expo-doctor@latest`
- 更新到库的最新版本
- 如果仍不兼容，给对应仓库提 issue 或 PR

### 3. 已知不兼容或需要替代的库

文档列出一些典型例子：

- `@react-native-community/masked-view` 替换为 `@react-native-masked-view/masked-view`
- `@react-native-community/clipboard` 替换为 `@react-native-clipboard/clipboard`
- `rn-fetch-blob` 替换为 `react-native-blob-util`
- `react-native-fs` 可考虑 `expo-file-system`
- `react-native-geolocation-service` 可考虑 `expo-location`
- `react-native-datepicker` 可考虑 `react-native-date-picker` 或 `@react-native-community/datetimepicker`

## React Web 开发者最容易误解的点

### 1. 这不是“打开一个实验 flag”那么简单

文档反复强调，新架构涉及 React Native 底层重构，所以它会真实影响构建、运行时、原生库兼容性。

### 2. “Expo 支持了”不等于“你的所有依赖都没问题”

Expo 自家库支持，并不代表所有第三方原生库都支持。

### 3. Expo Go 不是兜底方案

文档明确说明 Expo Go 只支持新架构，所以它不能帮助你继续停留在旧架构。

## 实际开发建议

- 基于经验建议：升级前先跑一次 `expo-doctor`，把兼容性问题尽量前置。
- 基于经验建议：如果你的项目依赖很多原生库，先开迁移分支，不要直接在主分支硬升。
- 基于文档内容推导：对 SDK 54 项目来说，真正的升级风险不在 Expo 本身，而更可能在第三方原生依赖。

## 文档明确说明

- SDK 55+ 强制使用新架构，不能关闭。
- 旧架构在 2025 年 6 月被冻结。
- SDK 53 起所有 `expo-*` 包支持新架构。
- Expo Modules API 编写的模块默认支持新架构。
- Expo Doctor 能结合 React Native Directory 检查依赖兼容性。
- SDK 54 及更早版本仍可通过配置关闭新架构，但 Expo Go 不支持旧架构。

## 基于文档内容推导

- 新项目如果继续围绕旧架构做技术决策，后续升级成本会更高。
- 迁移工作最值得优先排查的是“带原生代码的第三方库”。
- 删除已失效的 `newArchEnabled: false` 可以减少团队误解和配置噪音。

## 当前文档未涉及

- 新架构底层实现细节。
- 如何重写一个不兼容的原生模块。
- 每一个第三方库的完整兼容矩阵。
