# Add custom native code

## 文档解决的问题

这篇文档说明当现成库不够用时，Expo 项目如何接入“自定义原生代码”：什么时候只是安装带原生代码的库，什么时候需要自己写原生模块，以及在 CNG 模式下应该怎样管理这些改动。

## 适用场景

- 你要接入某个需要原生能力的第三方库。
- 你发现现有库不满足需求，准备自己写 Swift / Kotlin 模块。
- 你想知道 Expo 项目里自定义原生代码的推荐方式，而不是直接手改 `android` / `ios`。

## 核心概念

### 两条路径

文档给出两种方式：

1. 使用包含原生代码的库
2. 自己编写原生代码

### Expo Modules API

文档明确推荐用 Expo Modules API 写原生模块和原生视图。它是 Expo 推荐的原生扩展方式。

### Local Expo Module

如果模块只给当前一个 App 用，文档推荐创建“本地 Expo 模块”，直接放在项目的 `modules` 目录里，不必发布到 npm。

### CNG 下的原生改动管理

如果项目使用 CNG，原生配置改动应尽量通过 config plugin、生命周期订阅器、Expo Modules API 来表达，而不是直接改原生目录。

## 关键流程

### 1. 先判断是否只需安装现成原生库

如果已有库能满足需求，则：

1. 安装库，例如 `npx expo install react-native-localize`
2. 如果它带 config plugin，就在 app config 中配置
3. 重新创建 Development Build

### 2. 现成库不够时，开始写原生模块

文档推荐先看 Expo Modules API 文档与教程。

### 3. 只在当前 App 中使用时，创建本地模块

```sh
npx create-expo-module@latest --local
npx expo run
```

这会在项目中的 `modules/` 目录生成 Swift / Kotlin 模块骨架。

### 4. 需要多应用复用时，创建独立模块

此时不要加 `--local`，而是创建可独立发布或放在 monorepo 包目录中的模块。

## 命令、配置、文件说明

### 关键命令

- `npx expo install react-native-localize`
- `npx create-expo-module@latest --local`
- `npx expo run`

### 关键目录与文件

- `modules/`
- `android/`
- `ios/`
- `app.json` / `app.config.*`

### 相关技术入口

- Expo Modules API
- config plugin
- Android lifecycle listeners
- iOS AppDelegate subscribers

## 注意事项、限制条件和坑点

- Expo Go 只能使用 Expo SDK 已内置的原生库，以及不包含自定义原生代码的库。
- 一旦引入你自己的原生代码或额外原生库，通常就要转向 Development Build。
- 文档明确建议：在 CNG 下不要直接修改 `android` / `ios` 中的配置文件，否则下次 prebuild 时可能丢失。
- 如果你要挂接 Android 生命周期或 iOS `AppDelegate` 事件，最好使用 Expo Modules 提供的订阅器接口，而不是直接改原生入口文件。
- 如果你的模块主要用 C++ 编写，文档提示可考虑 React Native 的 Turbo Modules API。

## React Web 开发者容易误解的点

- “写原生代码”不等于马上跳进整个 Android Studio / Xcode 工程手工改很多文件；Expo 提供了更模块化的入口。
- 本地模块不是临时 hack，它是 Expo 官方推荐的单项目原生扩展模式。
- 在 Web 里扩展能力通常是装个 JS 包；在移动端有时必须自己提供 Swift / Kotlin 实现。

## 实际开发建议

- 先尽量寻找已有库和现成 config plugin，避免过早自研原生模块。
- 只有在当前 App 独有需求明显时，再用 local module。
- 开发原生模块时优先本地构建与本地调试，反馈回路会更快。
- 基于文档内容推导：如果未来可能复用，最好从一开始就把模块边界设计清楚，避免 later 再从本地模块拆分成独立包。

## 文档明确说明

- 自定义原生代码可以通过“安装原生库”或“自己写原生代码”两条路径实现。
- Expo Modules API 是官方推荐方式。
- 单应用场景推荐 local Expo module。
- CNG 下应通过 config plugin 与订阅器管理原生配置和生命周期接入。

## 基于文档内容推导

- 文档推荐的本质是“把原生复杂度模块化”，而不是鼓励直接维护整份原生工程。
- Expo 项目并没有阻止你写原生代码，只是鼓励你用更可维护的方式写。
- 当前文档未涉及 Expo Modules API 的具体代码写法，只给出入口和工作流建议。

<!-- NAVIGATION START -->
---
[← 上一页：iOS Universal Links](./12_ios-universal-links.md) | [下一页：Adopt Prebuild →](./14_adopting-prebuild.md)
<!-- NAVIGATION END -->
