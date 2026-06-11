# 使用 EAS Build 创建并运行 iOS 模拟器开发构建

> 原文标题：Create and run a cloud build for iOS Simulator  
> 文档更新时间：2026 年 6 月 3 日

## 文档解决的问题

这篇教程说明如何：

1. 在 `eas.json` 中配置专用于 iOS Simulator 的构建配置。
2. 使用 EAS Build 在云端生成开发构建。
3. 将构建产物安装到 iOS Simulator。
4. 启动 Expo 开发服务器并运行项目。

最终得到的是一个可在 **iOS Simulator** 中运行的开发版应用。

这不是面向真实 iPhone/iPad 的构建。iOS Simulator 的构建产物是 `.app` 格式，与真实 iOS 设备使用的构建产物不同。

## 适用场景

本文适合以下情况：

- 正在使用 Expo 和 EAS Build 开发 React Native 项目。
- 希望在 iOS Simulator 中测试开发构建。
- 项目需要使用 Expo Go 无法支持的原生能力。
- 希望由 EAS 云端完成 iOS 构建，而不是只在本地编译。

本文不涉及：

- 如何安装或配置 Xcode 与 iOS Simulator。
- 如何创建 Expo 项目。
- 如何安装 EAS CLI 或登录 Expo 账号。
- 如何编写 React Native 页面和组件。
- 如何为真实 iPhone/iPad 创建开发构建。
- EAS 内部完整的 iOS 构建步骤。
- Android 构建。
- App Store 发布的完整流程。

## 阅读前需要理解的概念

### Development build

Development build 可以理解为专门用于开发和调试的原生应用程序。

对于 React Web 开发者，可以将其粗略类比为：

- 原生应用外壳：类似已经编译好的浏览器运行环境。
- Expo 开发服务器：类似 Web 项目中的 Vite 或 webpack dev server。
- JavaScript 代码：由开发服务器提供给原生应用运行。

这个类比并不完全等价。React Native 最终渲染的是原生界面，而不是浏览器 DOM。

### EAS Build

EAS Build 是 Expo 提供的云端构建服务。

运行 `eas build` 后，项目会被提交到 EAS 的构建环境中，由云端执行 iOS 编译。构建状态、日志和产物可以在 EAS dashboard 中查看。

### iOS Simulator

iOS Simulator 是运行在 macOS 上的 iOS 模拟环境，通常通过 Xcode 提供。

模拟器构建针对 Mac 上的模拟运行环境，不能直接安装到真实 iPhone 或 iPad。

### 构建配置 profile

`eas.json` 中的 build profile 是一组具名构建配置。例如：

- `development`：通用开发构建配置。
- `ios-simulator`：本文新增的 iOS 模拟器构建配置。

使用 `eas build --profile ios-simulator` 时，EAS CLI 会读取对应配置。

### 开发构建与开发服务器不是同一件事

本文包含两个彼此独立的步骤：

1. 使用 EAS Build 编译并安装 `.app`。
2. 使用 `npx expo start` 启动开发服务器。

开发构建不是每次启动开发服务器时都重新生成的。它是一个已经编译好的原生应用；开发服务器主要负责向它提供项目代码和开发服务。

## 完整操作流程

## 1. 创建 iOS Simulator 构建配置

打开项目根目录中的 `eas.json`，在 `build` 下增加名为 `ios-simulator` 的 profile：

```json
{
  "build": {
    "development": {
      ...
    },
    "ios-simulator": {
      "ios": {
        "simulator": true
      }
    }
  }
}
```

其中：

```json
"simulator": true
```

表示这个 profile 生成的是 iOS Simulator 构建，而不是真实设备构建。

### 复用 development 配置

开发构建还必须在 profile 中定义 `developmentClient` 和 `distribution`。

为了避免在 `ios-simulator` 中重复这些属性，原文推荐继承已有的 `development` profile：

```json
{
  "ios-simulator": {
    "extends": "development",
    "ios": {
      "simulator": true
    }
  }
}
```

这里的含义是：

- `extends: "development"`：继承 `development` profile 的配置。
- `ios.simulator: true`：在继承配置的基础上，将构建目标设置为 iOS Simulator。

完整结构通常类似：

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "ios-simulator": {
      "extends": "development",
      "ios": {
        "simulator": true
      }
    }
  }
}
```

上例中的 `developmentClient` 和 `distribution` 具体值用于展示继承关系。本文明确要求开发构建必须定义这两个属性，但没有详细解释其所有可选值。

## 2. 在云端创建构建

在项目目录中运行：

```sh
eas build --platform ios --profile ios-simulator
```

参数含义：

| 参数 | 作用 |
| --- | --- |
| `eas build` | 请求 EAS Build 编译项目 |
| `--platform ios` | 指定目标平台为 iOS |
| `--profile ios-simulator` | 使用 `eas.json` 中的 `ios-simulator` 配置 |

这条命令生成的是供 iOS Simulator 使用的开发构建。

## 3. 回答首次构建问题

第一次创建该构建时，EAS CLI 会询问若干配置。

### iOS bundle identifier

提示内容：

```text
What would you like your iOS bundle identifier to be?
```

原文操作是按 Return，接受 CLI 提供的默认值。

接受后，EAS CLI 会在 `app.json` 中添加：

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.owner.stickersmash"
    }
  }
}
```

`ios.bundleIdentifier` 是应用在 Apple 生态中的唯一标识。App Store 会使用它识别应用。

原文给出的命名形式是：

```text
host.owner.app-name
```

例如：

```text
com.owner.stickersmash
```

其中：

- `com.owner` 是域名式前缀。
- `stickersmash` 是应用名称。

它与 Web 开发中的 `package.json` 包名并不等价。它是 iOS 原生应用身份的一部分，不只是项目中的展示名称。

### 加密合规声明

提示内容：

```text
iOS app only uses standard/exempt encryption?
```

原文示例应用不使用需要额外申报的加密，因此按 `Y` 接受默认值。

该操作会在原生 `Info.plist` 中将以下字段设为 `NO`：

```text
ITSAppUsesNonExemptEncryption
```

这个配置用于处理以后发布到 TestFlight 或 App Store 时的加密合规检查。

如果自己的应用使用了相关加密能力，原文要求选择 `N`。不能因为教程示例选择了 `Y`，就在所有项目中机械地使用相同答案。

> **注意：** 当前文档没有定义哪些加密属于 standard、exempt 或 non-exempt，也没有提供具体的合规判断规则。

## 4. 查看构建进度

回答问题后，EAS Build 会进入队列。EAS CLI 会返回一个链接，可在 EAS dashboard 中查看构建详情。

构建详情页面包括：

- 构建类型
- 使用的 profile
- Expo SDK 版本
- 应用版本
- build number
- 最近一次提交的 commit hash
- 发起构建的开发者或账号所有者
- 构建产物状态
- 构建日志

构建进行中时，`Build artifact` 会显示对应状态；完成后，该区域会提供下载构建产物的入口。

`Logs` 会列出 EAS Build 执行的 iOS 构建步骤。本文没有逐步解释这些日志，只指向了单独的 iOS build process 文档。

## 5. 安装开发构建

### 通过 EAS CLI 安装

构建完成后，EAS CLI 会询问是否在 iOS Simulator 中运行该构建。

按 `Y` 继续安装和运行。

### 通过 Expo Orbit 安装

也可以使用 Expo Orbit：

1. 打开 EAS dashboard 中的构建详情。
2. 找到 `Build artifact`。
3. 点击 **Open with Expo Orbit**。
4. 通过 Expo Orbit 将开发构建安装到 iOS Simulator。

Expo Orbit 是本文提供的替代安装方式，不是完成整个流程的必选项。

## 6. 启动开发服务器并运行项目

安装开发构建后，在项目目录启动 Expo 开发服务器。

使用 npm：

```sh
npx expo start
```

也可以使用项目对应的包管理器：

```sh
# yarn
yarn expo start

# pnpm
pnpm expo start

# bun
bun expo start
```

开发服务器启动后，在终端按：

```text
I
```

这里是大写展示的快捷键名称，实际操作即按键盘上的 `i` 键。Expo CLI 会尝试在 iOS Simulator 中打开项目。

流程可以概括为：

```text
配置 eas.json
    ↓
EAS 云端编译 .app
    ↓
安装到 iOS Simulator
    ↓
启动 Expo 开发服务器
    ↓
按 i 在模拟器中打开项目
```

## 文件与配置汇总

### `eas.json`

负责定义 EAS Build 的构建行为。

本文涉及的关键配置：

| 配置 | 含义 |
| --- | --- |
| `build.ios-simulator` | 名为 `ios-simulator` 的构建 profile |
| `extends` | 继承另一个 profile |
| `ios.simulator` | 是否生成模拟器构建 |
| `developmentClient` | 开发构建所需属性 |
| `distribution` | 开发构建所需属性 |

### `app.json`

保存 Expo 应用配置。

首次构建时，EAS CLI 可以向其中添加：

```text
expo.ios.bundleIdentifier
```

### `Info.plist`

iOS 原生应用的配置文件。

本文涉及：

```text
ITSAppUsesNonExemptEncryption
```

该字段用于描述应用是否使用需要额外申报的加密。

如果项目采用 Expo 管理的配置流程，你可能不会经常直接编辑 `Info.plist`。本文描述的是 EAS CLI 根据回答设置该原生配置的过程。

### `.app`

iOS Simulator 开发构建的产物格式。

需要重点区分：

- `.app`：本文中的模拟器构建产物。
- 真实 iOS 设备构建：格式和签名要求不同，本文未展开。

## 注意事项与限制

### 模拟器构建不能当作真实设备构建

`ios.simulator: true` 明确改变了构建目标。生成的 `.app` 用于 iOS Simulator，不能据此认为应用已经在真实 iPhone 上验证通过。

真实设备开发构建属于下一篇教程的内容。

### profile 名称必须与命令一致

配置名称为：

```json
"ios-simulator"
```

命令就必须使用：

```sh
--profile ios-simulator
```

如果名称不一致，EAS CLI 不会读取预期配置。

### 不要遗漏开发构建属性

原文明确指出，development build 必须定义：

- `developmentClient`
- `distribution`

通过 `extends: "development"` 继承它们，是为了避免重复配置，而不是让这两个要求消失。

### 加密问题必须根据实际应用回答

教程示例选择 `Y`，是因为示例应用不使用相关加密。实际项目若使用加密，应根据真实情况选择，不能照抄示例答案。

### 构建成功不等于开发服务器已经运行

EAS Build 完成的只是原生应用构建。安装完成后，仍需要运行：

```sh
npx expo start
```

然后通过终端快捷键打开项目。

### 当前文档没有覆盖的限制

以下问题在当前文档中未涉及：

- iOS Simulator 是否必须运行在 macOS 上。
- Xcode 和 Simulator 的安装要求。
- EAS Build 的免费额度、计费和队列策略。
- Apple Developer 账号要求。
- 模拟器支持的 CPU 架构。
- 原生依赖变化后何时必须重新构建。
- 构建失败时的具体排查方法。
- Apple 加密合规的详细法律判断。
- 多个模拟器同时运行时如何选择目标设备。

这些内容不能仅依据本文得出结论。

## React Web 开发者容易误解的地方

### EAS Build 不是前端打包器

它不能简单等同于 `vite build` 或 `webpack`。

Web 构建通常输出浏览器可以加载的静态资源；EAS Build 会执行原生 iOS 编译，输出能够安装到模拟器中的 `.app`。

### iOS Simulator 不是浏览器设备模式

Chrome DevTools 的移动设备模式仍然是在浏览器中模拟屏幕和部分输入特征。

iOS Simulator 运行的是模拟的 iOS 环境和原生应用。它不是一个调整了尺寸的网页窗口。

### `bundleIdentifier` 不是 JavaScript 包名

它是 iOS 应用的唯一身份标识，会影响 Apple 平台对应用的识别。不要把它当作可以随意修改的普通显示名称。

### 安装应用与加载项目代码是两个阶段

在 React Web 中，启动开发服务器后直接打开 URL 通常就能运行项目。

本文流程中，需要先安装原生开发构建，再启动开发服务器。前者提供原生运行环境，后者支持日常开发和加载项目代码。

### `eas.json` 与 `app.json` 职责不同

- `eas.json`：控制如何构建。
- `app.json`：描述应用本身及其平台配置。

`ios-simulator` profile 属于构建策略，因此放在 `eas.json`；`ios.bundleIdentifier` 属于应用身份，因此放在 `app.json`。

## 实际开发中的使用方式

以下结论均为**基于文档内容推导**：

1. 可以把 `ios-simulator` 长期保留为独立 profile，供团队统一创建模拟器开发构建。
2. 通过继承 `development` profile，可以将通用开发配置集中维护，只在模拟器 profile 中声明平台差异。
3. 原生开发构建不需要为每次 JavaScript 修改都重新执行云构建；日常开发通过 Expo 开发服务器加载代码。
4. 当构建失败时，可以先通过 EAS dashboard 的 `Logs` 确认失败发生在哪个 iOS 构建步骤。
5. 在准备真实设备测试或发布前，必须切换到对应的设备构建流程，不能继续使用 `ios.simulator: true` 的产物。

> **基于经验建议：** 将 `bundleIdentifier` 视为稳定的应用标识，在团队确定命名规则后再使用，避免不同开发者接受不同默认值。

> **基于经验建议：** 团队应在项目文档中记录各个 EAS profile 的用途，防止把模拟器 profile 用于真实设备或发布流程。

## 文档明确说明与推导内容边界

### 文档明确说明

- iOS Simulator 开发构建使用 `.app` 格式。
- 需要将 `ios.simulator` 设置为 `true`。
- 开发构建需要定义 `developmentClient` 和 `distribution`。
- 可以通过 `extends` 继承 `development` profile。
- 使用 `eas build --platform ios --profile ios-simulator` 创建构建。
- 首次构建会询问 bundle identifier 和加密合规问题。
- EAS dashboard 提供构建信息、产物状态和日志。
- 构建完成后可以通过 CLI 或 Expo Orbit 安装。
- 安装后需要启动 Expo 开发服务器，并按 `i` 打开项目。

### 基于文档内容推导

- 模拟器 profile 适合长期保留并由团队复用。
- 模拟器构建不能代替真实设备验证。
- EAS Build 与 Expo 开发服务器分别承担原生编译和开发期代码服务。
- 应优先通过构建日志定位云端构建失败的阶段。

### 基于经验建议

- 稳定管理 `bundleIdentifier`，不要让团队成员各自采用不同默认值。
- 为每个 EAS profile 记录明确用途。
- 遇到加密合规问题时，应根据应用实际能力确认，必要时寻求专业合规意见。

## 总结

本文的核心操作是为 EAS Build 增加一个模拟器专用 profile：

```json
{
  "ios-simulator": {
    "extends": "development",
    "ios": {
      "simulator": true
    }
  }
}
```

随后依次执行：

```sh
eas build --platform ios --profile ios-simulator
npx expo start
```

构建完成后将 `.app` 安装到 iOS Simulator，并在开发服务器终端中按 `i` 打开项目。

需要始终记住：这是 **iOS Simulator 开发构建流程**，不是面向真实 iOS 设备或 App Store 发布的完整流程。

<!-- NAVIGATION START -->
---
[← 上一页：使用 EAS Build 创建并运行 Android 开发构建](./2__android-development-build.md) | [下一页：使用 EAS Build 创建并运行 iOS 真机开发构建 →](./4__ios-development-build-for-devices.md)
<!-- NAVIGATION END -->
