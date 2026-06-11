# 使用 EAS Build 创建并运行 iOS 真机开发构建

> 原文标题：Create and run a cloud build for iOS device  
> 文档修改日期：2026 年 6 月 3 日

## 文档解决的问题

本文介绍如何使用 **EAS Build** 在云端生成一个能够安装到 iPhone 等 iOS 真机上的 **development build（开发构建）**，并完成以下流程：

1. 准备 Apple Developer 账号和 iOS 设备。
2. 注册需要安装应用的设备。
3. 配置并执行 iOS 云构建。
4. 将生成的 `.ipa` 文件安装到设备。
5. 启动 Expo 开发服务器，让真机中的应用连接到开发代码。

最终目标不是发布 App Store 正式版本，而是得到一个用于日常开发和调试的 iOS 应用。

## 适用场景

这篇文档适合以下情况：

- 使用 Expo 项目开发 React Native 应用。
- 没有本地构建 iOS 应用，而是希望 EAS 在云端完成构建。
- 需要在真实 iPhone 或 iPad 上测试应用。
- 应用依赖 Expo Go 不包含的原生能力，需要自定义开发客户端。
- 需要团队中的多台设备安装同一个开发版本。

当前文档主要讨论 **iOS 真机开发构建**，未具体介绍：

- iOS 模拟器构建的完整流程。
- Android 开发构建。
- App Store 或 TestFlight 发布流程。
- React Native 代码编写。
- 原生 Xcode 工程的开发与调试。
- Apple Developer 账号的申请和付费流程。
- EAS CLI 的安装及 Expo 项目的初始化。

开始操作前，应确保项目已经能够使用 EAS CLI。

---

## React Web 开发者需要先理解的背景

### Development build 是什么

Development build 是专门用于开发和调试的应用安装包。

可以将它理解为 React Web 开发中的“本地开发运行环境”，但二者存在重要差异：

- React Web 通常由浏览器直接加载开发服务器提供的 JavaScript。
- iOS 必须先安装一个经过 Apple 签名的原生应用。
- 安装完成后，该应用再连接 Expo 开发服务器，加载并运行项目代码。

因此，真机开发分为两个相对独立的部分：

1. **原生应用外壳**：由 EAS Build 云端构建并安装到设备。
2. **开发服务器**：通过 `npx expo start` 在开发电脑上运行。

只修改 JavaScript 或 TypeScript 代码时，通常不需要重新生成原生安装包；但本文并未进一步说明哪些项目变更必须重新构建。

### EAS Build 是什么

EAS Build 是 Expo 提供的云构建服务。本文使用它生成 iOS 开发安装包，因此不需要在本地完成完整的 iOS 编译流程。

它还会协助管理 iOS 构建所需的签名凭证，包括：

- Apple Distribution Certificate。
- Provisioning profile。
- 已注册设备。

不过，“协助管理”不代表绕过 Apple 的安全机制。每个 iOS 构建仍然必须经过签名。

### `.ipa` 文件是什么

iOS 真机开发构建以 `.ipa` 格式生成。

它可以类比为：

- Android 的 `.apk`。
- Web 项目构建后的部署产物。

但 `.ipa` 不能像普通文件一样任意安装。开发构建必须具有有效签名，并且目标设备需要满足对应的设备注册要求。

### 为什么需要代码签名

Apple 要求 iOS 应用通过签名证明其来源可信。

本文明确要求准备 Apple Developer 账号，因为 EAS Build 需要访问必要的凭证来签署应用。首次构建时，EAS CLI 可以引导生成新的 Apple Distribution Certificate。

### Provisioning profile 与设备注册

本文将设备注册流程归入“Provisioning profile”部分。其核心目的，是让 Apple 和构建系统知道哪些设备被允许安装该开发版本。

对 React Web 开发者而言，这与浏览器访问开发站点不同：

- Web 开发服务器通常不需要提前登记访问者的设备。
- iOS ad hoc 开发构建只能安装到构建时授权的设备。
- 构建时需要选择一个或多个已注册设备。

因此，新设备加入测试范围后，不能默认旧构建会自动支持该设备。

> **基于文档内容推导：**由于构建时需要选择允许安装的设备，如果后来添加了新设备，通常需要创建包含该设备的新构建。本文没有明确给出更新旧构建的操作步骤。

---

## 前置条件

### 1. Apple Developer 账号

Apple Developer 账号用于获取应用签名所需的凭证。每个构建都需要签名，以证明应用来自可信来源。

EAS Build 可以帮助管理这些凭证，但仍需要登录 Apple Developer 账号并完成相关授权。

### 2. 启用 Developer Mode

对于运行 iOS 16 或更高版本的设备，安装开发构建前必须启用 **Developer Mode（开发者模式）**。

如果设备第一次用于开发，或者开发者模式目前处于关闭状态，需要先按照 Expo 的 Developer Mode 指南启用它。

当前文档未展开开发者模式的具体启用步骤。

---

## 完整操作流程

## 第一步：注册 iOS 设备

在 Expo 项目目录中运行：

```sh
eas device:create
```

该命令用于将一台新的 Apple 设备注册为开发设备。

执行期间会出现几个交互式问题。

### 确认 Expo 账号

CLI 会询问是否使用当前项目关联的 Expo 账号：

```text
You're inside the project directory.
Would you like to use the your-account-name account?
```

按照文档操作，输入 `Y`。

这里确认的是 EAS 操作归属的 Expo 账号，不是 Apple ID。

### 登录 Apple Developer 账号

CLI 会要求输入 Apple ID，并引导登录 Apple Developer 账号。后续操作按照终端提示完成。

Expo 账号和 Apple Developer 账号承担不同职责：

| 账号 | 主要用途 |
|---|---|
| Expo/EAS 账号 | 管理项目、云构建和构建记录 |
| Apple Developer 账号 | 管理 iOS 设备、签名和 Apple 凭证 |

不要把 EAS CLI 已登录理解为 Apple Developer 账号也已经登录。

### 选择设备注册方式

当看到以下问题时：

```text
How would you like to register your devices?
```

选择 **Website**。

EAS 会生成一个注册链接。该链接需要在目标 iOS 设备上打开，用于下载注册配置描述文件。

> **文档明确说明：**如果个人或团队有多台设备，可以把该链接分享给其他设备，让它们分别下载并安装描述文件。

需要注意，该链接用于注册设备，不是安装最终开发应用。

---

## 第二步：在设备上安装注册描述文件

在目标 iOS 设备的浏览器中打开上一步生成的链接，然后：

1. 点击 **Download Profile**。
2. 打开 iOS 的 **Settings（设置）**。
3. 根据系统提示进入设备注册流程。
4. 点击 **Install**。
5. 安装完成后，设备会跳转回浏览器。
6. 浏览器显示成功消息，表示注册流程完成。

这里安装的是设备注册所需的 profile，不是应用本身。

React Web 开发者最容易混淆以下三个动作：

| 动作 | 安装的内容 | 目的 |
|---|---|---|
| 安装注册 profile | 配置描述文件 | 注册并授权设备 |
| 安装 `.ipa` 开发构建 | 原生应用 | 在设备上获得可运行的开发客户端 |
| 启动 Expo 开发服务器 | 不在设备安装文件 | 为开发客户端提供项目代码 |

---

## 第三步：检查开发构建配置

在 `eas.json` 的 `build.development` profile 下，需要确保：

```json
{
  "build": {
    "development": {
      "developmentClient": true
    }
  }
}
```

文档说明，默认配置会将 `developmentClient` 设置为 `true`。

### `build.development`

这是名为 `development` 的 EAS 构建 profile，表示这组配置用于开发构建。

它不是固定的 iOS 系统概念，而是 `eas.json` 中的一组构建配置。后续命令通过：

```sh
--profile development
```

选择它。

### `developmentClient: true`

该配置表示构建一个 Expo development client。

它不是普通的 App Store 正式应用，也不是 Expo Go，而是为当前项目准备的可调试开发客户端。安装后，它能够连接 Expo 开发服务器并运行项目。

---

## 第四步：创建 iOS 云构建

运行：

```sh
eas build --platform ios --profile development
```

参数含义如下：

| 参数 | 作用 |
|---|---|
| `eas build` | 发起 EAS 云构建 |
| `--platform ios` | 指定构建平台为 iOS |
| `--profile development` | 使用 `eas.json` 中的开发构建配置 |

`--platform` 可以简写为 `-p`：

```sh
eas build -p ios --profile development
```

### 首次构建时的交互问题

#### 设置 Bundle Identifier

CLI 会询问：

```text
What would you like your iOS bundle identifier to be?
```

按照教程可以直接按 Return，接受默认值。

如果 `app.json` 尚未定义该配置，CLI 会添加：

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.owner.stickersmash"
    }
  }
}
```

#### Bundle Identifier 的作用

`ios.bundleIdentifier` 是 iOS 应用的唯一标识。

如果应用发布到 App Store，Apple 会使用该值识别应用。它并不是给用户阅读的应用名称，也不是网页 URL。

文档给出的结构是：

```text
host.owner.app-name
```

例如：

```text
com.owner.stickersmash
```

其中：

- `com.owner` 是域名风格的命名空间。
- `stickersmash` 是应用名称。

它的作用类似 Web 项目的全局唯一应用 ID，而不是 `package.json` 中仅用于 npm 生态的包名。

#### 登录 Apple 账号并生成证书

CLI 会询问是否登录 Apple 账号。首次创建开发构建时，还会要求生成新的 **Apple Distribution Certificate**。

按照教程，两次均选择 `Y`。

该证书用于签署构建产物。没有有效签名的 iOS 应用不能按本文流程安装和运行。

#### 选择允许安装的设备

CLI 会显示：

```text
Select a device for ad hoc build
```

此处可以选择一台、几台或所有已注册设备。

这是预先注册设备的直接用途：构建系统需要知道哪些设备可以安装当前 ad hoc 构建。

> **重要限制：**必须在这里选中目标设备。设备已注册不等于它自动被包含在每一次构建中。

---

## 关于加密合规问题

如果跳过了教程前面的 iOS Simulator 章节，首次构建时可能还会看到：

```text
iOS app only uses standard/exempt encryption?
```

教程中的示例应用不使用非豁免加密，因此按 Return 或选择 `Y` 接受默认值。

这会将 `Info.plist` 中的以下配置设置为 `NO`：

```text
ITSAppUsesNonExemptEncryption = NO
```

该配置会影响以后向 TestFlight 或 App Store 发布时的加密合规检查。

> **文档明确说明：**如果你自己的应用使用了加密，可以选择 `N`，从而跳过以后重复出现的该提示。

这里不能机械照抄教程答案。是否选择 `Y` 应根据实际应用是否使用相关加密能力判断。当前文档没有详细说明哪些加密功能属于 standard、exempt 或 non-exempt encryption。

---

## 第五步：查看云构建进度

完成交互后，任务会进入 EAS Build 队列。EAS CLI 会提供一个链接，可在 EAS Dashboard 中查看构建详情。

构建详情页包含：

- 构建类型。
- 使用的构建 profile。
- Expo SDK 版本。
- 应用版本。
- Build number。
- 最近一次 Git commit hash。
- 发起构建的开发者或账号所有者。
- Build artifact 状态。
- 完整构建日志。

构建期间，**Build artifact** 会显示正在处理。完成后，该区域会提供下载和安装选项。

**Logs** 会记录 EAS Build 执行的每一个 iOS 构建步骤，但当前文档未逐项解释这些日志。

---

## 第六步：将开发构建安装到设备

构建完成后，可以通过以下两种方式安装。

### 方式一：使用 Expo Orbit

Expo Orbit 是用于安装和启动开发构建的桌面工具。

操作步骤：

1. 使用 USB 将 iOS 设备连接到开发电脑。
2. 打开 Expo Orbit 菜单栏应用。
3. 在 Orbit 中选择目标设备。
4. 在 EAS Dashboard 的 **Build artifact** 区域点击 **Open with Orbit**。
5. Orbit 安装完成后，会在设备上启动开发构建。

当前文档未说明 Expo Orbit 的安装步骤以及支持的桌面操作系统。

### 方式二：使用 Install 按钮和二维码

操作步骤：

1. 在 EAS Dashboard 的 **Build artifact** 区域点击 **Install**。
2. 页面弹出安装二维码。
3. 使用 iOS 设备相机扫描二维码。
4. 打开二维码对应的链接。
5. 点击链接，将开发构建下载并安装到设备。

这种方式不要求通过 USB 和 Orbit 安装，但设备仍然必须已经注册并被当前构建选中。

---

## 第七步：启动并连接开发服务器

安装 `.ipa` 只完成了原生应用部分。接下来还需要在项目目录启动 Expo 开发服务器。

根据包管理器选择对应命令：

```sh
# npm
npx expo start

# yarn
yarn expo start

# pnpm
pnpm expo start

# bun
bun expo start
```

然后在 iOS 设备上：

1. 点击应用图标，打开开发构建。
2. 确保 EAS CLI 和设备中的开发构建登录了相同或可同步的账号。
3. 在开发构建 UI 中完成登录。
4. 点击 **Fetch development servers**。
5. 在 **Development servers** 列表中选择正在运行的服务器。

这与 React Web 中打开 `localhost` 的体验不同：开发服务器运行在电脑上，而应用运行在手机上，需要通过开发客户端发现并连接服务器。

> **文档明确说明：**这里使用账号同步功能发现开发服务器。当前文档未讨论局域网地址、网络隔离、防火墙或无法发现服务器时的排查方式。

---

## 容易踩坑的地方

### 注册 profile 与应用安装包不是同一个东西

设备注册阶段下载的 profile 只负责注册设备。真正的应用要等 EAS Build 完成后，通过 Orbit 或二维码安装。

### 每台目标设备都需要注册

iOS ad hoc 构建不是任意设备都能安装。团队增加测试设备时，需要先执行设备注册流程。

### 构建时仍需选择设备

注册设备后，第一次构建过程中还需要在 `Select a device for ad hoc build` 中选择它。

### iOS 16 及以上需要 Developer Mode

即使设备已经注册、应用也已正确签名，没有启用 Developer Mode 仍会影响开发构建的安装或运行。

### Expo 账号不等于 Apple 账号

EAS CLI 登录状态主要关联 Expo/EAS 服务；设备注册和签名凭证管理还涉及 Apple Developer 账号。

### 云构建完成不等于开发环境已经运行

构建完成仅表示 `.ipa` 已生成。要进行日常开发，还需要：

- 在设备上安装开发构建。
- 启动 `expo start`。
- 从开发构建中选择开发服务器。

### 不要随意回答加密问题

教程示例选择 `Y`，是因为示例应用不使用非豁免加密。实际项目必须根据自身功能判断。

### Bundle Identifier 不是展示名称

用户在桌面看到的应用名称与 `ios.bundleIdentifier` 不是同一概念。Bundle Identifier 用于 Apple 生态内部唯一识别应用。

---

## React Web 开发者的正确心智模型

可以将完整流程对应到熟悉的 Web 开发概念：

| iOS / Expo 概念 | 可辅助理解的 Web 类比 | 关键区别 |
|---|---|---|
| Development build | 本地开发运行环境 | 必须先编译、签名并安装 |
| Expo 开发服务器 | Vite/Webpack dev server | 客户端是手机中的原生应用 |
| Bundle Identifier | 全局唯一应用 ID | 由 Apple 用于识别应用 |
| Provisioning/设备注册 | 测试环境访问白名单 | 白名单绑定具体 Apple 设备 |
| `.ipa` | 构建产物 | 不能在任意设备上自由安装 |
| EAS Build | 云端 CI 构建任务 | 同时处理 iOS 编译和签名 |
| Expo Orbit | 设备安装工具 | 通过 USB 向真机安装应用 |

最重要的区别是：React Web 的开发入口通常是 URL，而 iOS 真机开发的入口是一个已经安装并签名的原生应用。

---

## 实际开发中的使用方式

以下工作流是对本文流程的归纳：

1. 项目首次开始 iOS 真机开发时，准备 Apple Developer 账号。
2. 为每台测试设备启用 Developer Mode。
3. 通过 `eas device:create` 注册设备。
4. 检查 `eas.json` 中的开发 profile。
5. 运行 EAS 云构建，并选择目标设备。
6. 通过 Orbit 或二维码安装开发构建。
7. 日常开发时运行 `npx expo start`。
8. 在设备中的开发构建里选择对应开发服务器。

> **基于文档内容推导：**原生开发客户端成功安装后，日常修改 JavaScript/TypeScript 代码的主要操作会集中在启动开发服务器和连接设备，而不是每次都重新执行云构建。

> **基于经验建议：**团队应维护设备注册清单，并在发起构建前确认本次需要覆盖的设备，避免构建完成后才发现某位测试人员的设备未被选中。

> **基于经验建议：**正式项目应尽早确定稳定且唯一的 Bundle Identifier，避免不同环境或应用之间发生标识冲突。多环境应用的具体配置方式不在当前文档范围内，原文下一章会继续介绍如何配置多个应用变体。

---

## 文档明确结论与推导边界

### 文档明确说明

- iOS 真机开发构建使用 `.ipa` 格式。
- 每个构建都需要签名。
- 签名流程需要 Apple Developer 账号。
- EAS Build 可以帮助管理签名凭证。
- iOS 16 及以上需要启用 Developer Mode。
- 需要注册目标设备。
- `developmentClient` 应设置为 `true`。
- 使用 `eas build --platform ios --profile development` 创建开发构建。
- 首次构建会处理 Bundle Identifier、Apple 证书和设备选择。
- 可以通过 Expo Orbit 或二维码安装构建。
- 使用 `expo start` 启动开发服务器。
- 可以通过账号同步功能获取开发服务器。

### 基于文档内容推导

- 新设备加入后，可能需要创建包含该设备的新构建。
- 安装好的开发客户端与 JavaScript 开发服务器是两个独立部分。
- 日常纯 JavaScript/TypeScript 开发不应把云构建当成每次修改后的固定步骤。

### 当前文档未涉及

- EAS CLI 的安装方法。
- Expo 项目的创建和首次 EAS 配置。
- Apple Developer 账号申请与费用。
- Developer Mode 的详细启用步骤。
- `.ipa` 内部结构。
- iOS 模拟器的完整构建流程。
- 哪些代码或依赖变更必须重新构建 development client。
- 网络连接失败或找不到开发服务器的排查。
- 证书过期、撤销和轮换机制。
- 设备注册数量限制。
- TestFlight 和 App Store 的完整发布流程。
- 加密合规分类的具体判定标准。

## 总结

本文建立的是一条完整的 iOS 真机开发链路：

```text
准备 Apple Developer 账号
        ↓
启用 iOS Developer Mode
        ↓
注册目标设备
        ↓
配置 developmentClient
        ↓
使用 EAS Build 生成并签名 .ipa
        ↓
通过 Orbit 或二维码安装
        ↓
启动 Expo 开发服务器
        ↓
在真机开发构建中连接服务器
```

对于 React Web 开发者，最需要建立的认识是：iOS 真机不能直接访问代码就开始开发。必须先获得一个经过签名、明确授权给目标设备的原生开发客户端，然后才能像连接 Web 开发服务器一样加载和调试项目代码。

<!-- NAVIGATION START -->
---
[← 上一页：使用 EAS Build 创建并运行 iOS 模拟器开发构建](./3__ios-development-build-for-simulators.md) | [下一页：配置多个 App 变体：让开发版、预览版和生产版共存 →](./5__multiple-app-variants.md)
<!-- NAVIGATION END -->
