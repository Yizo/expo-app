# Precompiled Expo Modules 学习整理

## 文档解决的问题

这篇文档解决的是：如何通过 Expo 预编译好的原生模块，减少 Android 和 iOS 的本地原生构建时间。

对 React Web 开发者来说，可以把它理解为：某些依赖不再每次从源码重新编译，而是直接链接已经准备好的二进制产物，从而缩短构建时间。

## 适用场景

- 你感觉原生构建太慢，想知道 Expo 如何加速。
- 你在排查 iOS / Android 原生构建时间问题。
- 你需要关闭某些预编译模块，改为从源码构建。
- 你在 EAS Build 上遇到 `react-native-reanimated` / `react-native-worklets` 相关问题。

## 核心概念

### 什么是预编译 Expo Modules

文档说明：

- Android 上预编译模块以 **`.aar`** 形式通过 Gradle 链接。
- iOS 上预编译模块以 **`XCFrameworks`** 形式通过 CocoaPods 链接。

这些二进制已经打包进常规的 Expo npm 包中。没有预编译的模块仍然会自动走源码构建，因此两种模式可以在同一个项目里共存。

### 为什么能加速

原因很直接：项目不必每次都把这些复杂模块重新从源码编译一遍，而是链接已经编好的二进制。

## 默认行为

文档明确说明，大多数项目**什么都不用做**：

- Android：SDK 53 起默认开启
- iOS：SDK 56 起默认开启
- iOS 在 SDK 55：EAS Build 默认开启；本地构建需手动设置 `EXPO_USE_PRECOMPILED_MODULES=1`

这说明它是 Expo 逐步默认化的一项性能优化，而不是必须手动接入的高级特性。

## 如何关闭

### 全局关闭 iOS 预编译模块

设置环境变量：

- 开启值：`1`
- 关闭值：`0`

本地构建时可直接在 shell 中导出环境变量；EAS Build 则可以创建环境变量：

```sh
eas env:create --name EXPO_USE_PRECOMPILED_MODULES --value 0 --visibility plaintext
```

CLI 会继续让你选择作用环境：`development`、`preview`、`production`。

### 只关闭特定模块

文档给出的做法是在 `package.json` 里配置 Expo Autolinking 的 `buildFromSource`：

```json
{
  "expo": {
    "autolinking": {
      "android": {
        "buildFromSource": [".*"]
      },
      "ios": {
        "buildFromSource": [".*"]
      }
    }
  }
}
```

说明：

- `".*"` 表示所有预编译模块都改为源码构建。
- 也可以只列出个别包名。

文档指出，这通常用于你需要修改模块源码的时候。

## iOS / EAS Build 排查重点

### `react-native-reanimated` 和 `react-native-worklets`

这是文档中特别强调的坑点。

原因：

- 两者在原生层紧密耦合。
- `react-native-reanimated` 会在 native 层链接 `react-native-worklets`。

因此文档明确要求：

- **如果要从源码构建其中一个，就要把两个都一起加入 `buildFromSource`。**

示例：

```json
{
  "expo": {
    "autolinking": {
      "ios": {
        "buildFromSource": ["react-native-reanimated", "react-native-worklets"]
      }
    }
  }
}
```

如果只让其中一个走源码，另一个继续走预编译，会变成混合链接，运行时可能找不到匹配 framework。

### 自定义 feature flags 的影响

文档说明：

- 预编译二进制在构建时已经把 feature flags 固化进去了。
- 所以 `worklets.staticFeatureFlags` 或 `reanimated.staticFeatureFlags` 在 `package.json` 里的改动，**不会作用到预编译产物**。

如果你必须让这些 flags 生效，需要：

- 关闭预编译模块，改走源码构建。

### 典型报错信号

如果 EAS Build 上出现类似：

- `Unable to recognize flag: <NAME>`

而本地没问题，文档建议：

1. 用 `buildFromSource` 改为源码构建
2. 到 GitHub 提 issue

## 命令、配置、文件说明

### 环境变量

- `EXPO_USE_PRECOMPILED_MODULES=1`：启用
- `EXPO_USE_PRECOMPILED_MODULES=0`：禁用

### 命令

```sh
eas env:create --name EXPO_USE_PRECOMPILED_MODULES --value 0 --visibility plaintext
```

### 配置文件

- `package.json`：通过 `expo.autolinking.[platform].buildFromSource` 指定从源码构建的模块。

## 注意事项、限制条件与坑点

- 文档中的“默认开启”并不代表所有 SDK 版本行为一致，iOS 在 SDK 55 与 SDK 56 的默认值不同。
- `react-native-reanimated` 和 `react-native-worklets` 不能只切换一个。
- 自定义 `staticFeatureFlags` 时，预编译模块可能直接忽略你的配置。
- 本地 `pod install` 与 EAS Build 的第三方预编译下载路径不完全一致，问题常在 EAS Build 才暴露。

## React Web 开发者最容易误解的点

- **误解 1：npm 包安装完就是源码直接参与构建。**
  在这里不一定，Expo 可能直接链接预编译二进制。
- **误解 2：改了配置文件，构建时一定会实时生效。**
  对预编译二进制来说，某些能力已经在编译时固化了。
- **误解 3：本地能跑，云端也一定没问题。**
  文档明确指出某些问题主要出现在 EAS Build。

## 实际开发建议

- 基于文档内容推导：默认情况下应优先享受预编译模块带来的构建速度收益，不要无故关闭。
- 基于经验建议：只有在需要修改模块源码、应用特殊 feature flags、或排查预编译相关兼容问题时，再切换到 `buildFromSource`。
- 基于文档内容推导：排查 iOS 构建差异时，要把“本地源码构建”和“EAS 预编译下载”视为两条不同执行路径。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- Android 从 SDK 53 起默认开启预编译模块。
- iOS 从 SDK 56 起默认开启；SDK 55 本地构建需手动开启。
- 可通过环境变量全局关闭 iOS 预编译模块。
- 可通过 `buildFromSource` 为全部或部分模块关闭预编译。
- `react-native-reanimated` 与 `react-native-worklets` 需要一起切换到源码构建。

### 基于文档内容推导

- Expo 把“构建速度优化”做进了模块分发层，而不只是构建脚本层。
- 当你需要更深的原生可定制性时，通常就要牺牲一部分构建速度。
- 构建时间优化和可调试性之间存在取舍。

## 当前文档未涉及

- 预编译模块覆盖了哪些 Expo 包的完整清单
- Android 侧的详细故障排查案例
- 预编译与源码构建的具体性能对比数据
