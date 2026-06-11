# 使用 EAS Build 创建并运行 Android 开发构建

> 原文标题：Create and run a cloud build for Android  
> 文档更新时间：2026 年 6 月 3 日  
> 适用对象：需要通过 EAS Build 在 Android 真机或模拟器中运行 Expo 开发构建的开发者

## 文档解决的问题

这篇教程说明如何：

1. 使用 EAS Build 在云端生成 Android 开发构建。
2.确保构建产物是可以直接安装的 `.apk`。
3. 将开发构建安装到 Android 真机或 Android Emulator。
4. 启动 Expo 开发服务器，并在已安装的开发构建中运行项目。

文档的重点不是发布应用到 Google Play，而是创建供本地开发和调试使用的 Android 应用。

## 适用场景

适合以下场景：

- 需要在 Android 真机上开发或测试 Expo 应用。
- 需要在 Android Emulator 中运行项目。
- 项目需要使用 development build，而不只是普通的 Web 开发服务器。
- 希望由 EAS Build 在云端完成 Android 原生应用构建。

不适合直接作为 Google Play 发布教程。文档虽然介绍了 `.aab`，但没有讲解商店发布、审核或上架流程。

## React Web 开发者需要先理解的背景

### Expo 项目不只是一个网页

在 React Web 中，通常执行：

```sh
npm run dev
```

浏览器加载 JavaScript 后即可运行应用。

Android 开发则多了一层原生应用：

```text
React/Expo 源代码
        ↓
Android 原生构建
        ↓
生成 .apk
        ↓
安装到真机或模拟器
        ↓
连接 Expo 开发服务器
        ↓
加载并运行当前项目
```

因此，这篇文档实际上涉及两个独立环节：

1. **构建并安装原生开发客户端**：使用 `eas build`。
2. **启动 JavaScript 开发服务器**：使用 `expo start`。

只启动开发服务器不会自动生成一个可安装的 Android 应用；只安装 `.apk` 而不启动开发服务器，也不能按照本教程的开发流程加载当前项目。

### Development build

Development build 是为开发过程准备的原生应用构建。

可以把它粗略理解为：

> 一个预先编译并安装到 Android 系统中的“项目专用开发容器”，用于连接 Expo 开发服务器并运行项目。

它不同于浏览器页面，也不同于最终提交到应用商店的正式安装包。

### EAS Build

EAS Build 是 Expo 提供的云端构建服务。执行构建命令后，项目进入云端构建队列，开发者可通过 EAS CLI 提供的链接在 EAS Dashboard 中查看状态、日志和构建产物。

## 一、创建 Android 开发构建

### 1. 确认 `eas.json` 配置

在 `eas.json` 的 `build.development` profile 中，需要设置：

```json
{
  "build": {
    "development": {
      "developmentClient": true
    }
  }
}
```

其中：

- `build`：EAS 的构建配置集合。
- `development`：名为 `development` 的构建 profile。
- `developmentClient: true`：声明该 profile 用于创建 development build。

Profile 可以类比 React Web 项目中的不同构建环境配置，例如 development、preview 和 production。运行构建命令时，需要明确选择使用哪个 profile。

### 2. 为什么开发构建必须是 `.apk`

文档区分了两种 Android 构建格式：

| 格式 | 主要用途 | 能否按本文方式直接安装 |
|---|---|---|
| `.apk` | 真机或模拟器安装 | 可以 |
| `.aab` | Google Play Store 分发 | 不可以 |

Android 默认构建格式是 `.aab`，但 `.aab` 不能直接安装到设备或模拟器。因此，本教程中的 development build 必须生成 `.apk`。

这是 React Web 开发者容易忽略的区别：Android 构建产物并不只有一种格式，而且应用商店分发格式不等于设备安装格式。

### 3. 执行云端构建

运行：

```sh
eas build --platform android --profile development
```

参数含义：

| 参数 | 作用 |
|---|---|
| `eas build` | 提交 EAS Build 云端构建任务 |
| `--platform android` | 指定目标平台为 Android |
| `--profile development` | 使用 `eas.json` 中的 development profile |

后续可以将 `--platform` 简写为 `-p`：

```sh
eas build -p android --profile development
```

简写只改变命令形式，不改变构建行为。

## 二、回答首次构建时的配置问题

执行命令后，EAS CLI 会要求确认若干 Android 配置。

### Android application ID

命令行会询问：

```text
What would you like your Android application id to be?
```

文档要求按回车，接受默认值。该操作会在 `app.json` 中加入：

```json
{
  "expo": {
    "android": {
      "package": "com.owner.stickersmash"
    }
  }
}
```

对应配置项为：

```text
android.package
```

Android application ID 也称为 Android 应用的 package name，用于唯一标识应用。

它采用反向 DNS 形式：

```text
com.owner.appname
```

文档示例为：

```text
com.owner.stickersmash
```

其中：

- `com.owner` 是文档所称的 domain 部分。
- `stickersmash` 是应用名称部分。
- 每一部分都应以小写字母开头。

它不是 JavaScript 的 npm package 名称，也不是 React 组件所在目录。它属于 Android 原生应用身份配置。

### Android Keystore

命令行还会询问：

```text
Generate a new Android Keystore?
```

按照文档操作，输入：

```text
Y
```

Keystore 用于 Android 应用签名。Android 安装包需要经过签名，系统和分发渠道才能识别应用来源及身份。

当前文档只要求生成新的 Keystore，没有进一步介绍：

- Keystore 的保存和管理方式。
- 已有 Keystore 应如何复用。
- 正式发布时的签名策略。
- Keystore 丢失后的影响。

这些内容不能从当前文档中进一步得出。

## 三、查看云端构建过程

回答配置问题后，构建任务会进入队列。EAS CLI 会提供一个链接，用于在 EAS Dashboard 中跟踪进度。

构建详情页包含：

- 构建类型
- 使用的 profile
- Expo SDK 版本
- 应用版本
- Android version code
- 最近一次 Git commit hash
- 发起构建的开发者或账户所有者
- Build artifact 状态
- 构建日志

### Build artifact

构建进行时，Build artifact 区域显示构建尚未完成。完成后，该区域会提供构建产物的下载和安装入口。

### Logs

Logs 展示 EAS Build 执行 Android 构建时的各个步骤。

当前教程没有逐步解释日志内容，而是将详细流程留给单独的 Android build process 文档。

## 四、安装到 Android 真机

真机和模拟器的构建过程相同，区别主要在于构建完成后的安装方式。

### 方式一：使用 Expo Orbit

Expo Orbit 可以帮助开发者将 development build 安装到 Android 设备。

操作顺序：

1. 使用 USB 将 Android 设备连接到本地电脑。
2. 打开 Orbit 应用。
3. 在 Orbit 中选择对应设备。
4. 打开 EAS Dashboard。
5. 在 Build artifact 区域点击 **Open with Orbit**。
6. 等待构建安装完成。

安装完成后，Orbit 会在设备上启动 development build。

当前文档没有说明：

- Expo Orbit 的安装过程。
- Android 设备是否需要开启 USB 调试。
- 设备无法被 Orbit 识别时的排查方法。
- 不同操作系统上的 USB 驱动要求。

### 方式二：使用 Install 按钮和二维码

不使用 Orbit 时，可以通过二维码安装：

1. 在 Build artifact 区域点击 **Install**。
2. 页面显示安装二维码。
3. 使用 Android 设备相机扫描二维码。
4. 在默认浏览器中打开构建链接。
5. 点击网页中的 **Install** 下载 `.apk`。
6. 下载完成后打开 `.apk`。
7. 按照 Android 系统提示完成安装。

如果系统显示 **Unsafe app blocked**：

- 文档要求选择 **Install anyway**。
- 文档认为该警告可以忽略，因为 `.apk` 是开发者自己生成、来源可信的构建产物。

这项说明仅适用于确认构建链接和 `.apk` 确实来自自己 EAS 构建任务的情况。

## 五、在 Android 真机上运行项目

安装 development build 后，还需要从项目目录启动 Expo 开发服务器。

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

服务器启动后，在终端中按：

```text
A
```

Expo CLI 会尝试在 Android 环境中打开项目。

注意区分命令的职责：

```text
eas build
```

负责生成 Android 原生构建产物；而：

```text
npx expo start
```

负责启动开发服务器。修改日常 JavaScript 或 React 代码后，通常围绕开发服务器进行开发，不代表每次修改都要重新执行云端构建。

最后一句属于**基于文档流程推导**：文档明确把构建 development build 和启动 development server 分成两个步骤，但没有具体讨论哪些代码变更需要重新构建。

## 六、安装到 Android Emulator

Android Emulator 是运行在电脑上的 Android 虚拟设备。它不是浏览器中的手机尺寸预览，而是一个模拟 Android 系统环境的程序。

### 方式一：通过 EAS CLI 安装

构建完成后，EAS CLI 会询问是否在 Android Emulator 中运行该构建。

按照教程操作：

```text
Y
```

随后由 CLI 继续处理模拟器中的运行流程。

### 方式二：使用 Expo Orbit

也可以在 EAS Dashboard 的 Build artifact 区域点击：

```text
Open with Expo Orbit
```

通过 Orbit 将 development build 安装到 Android Emulator。

当前文档没有介绍：

- 如何安装 Android Studio。
- 如何创建或启动 Android Emulator。
- 模拟器所需的 Android 系统镜像。
- CLI 找不到模拟器时如何处理。

因此，本教程默认本地已经存在可用的 Android Emulator 环境。

## 七、在 Android Emulator 中运行项目

与真机相同，先在项目目录启动开发服务器：

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

服务器启动后，在终端中按：

```text
A
```

真机与模拟器在这里使用同一套 Expo 启动命令。二者的主要差异发生在 development build 的安装阶段。

## 完整流程

```text
配置 eas.json
    ↓
developmentClient 设置为 true
    ↓
运行 eas build --platform android --profile development
    ↓
确认 android.package
    ↓
生成 Android Keystore
    ↓
EAS 云端构建 .apk
    ↓
在 Dashboard 查看进度、日志和构建产物
    ↓
安装到 Android 真机或 Emulator
    ↓
运行 npx expo start
    ↓
在终端按 A 打开项目
```

## 容易误解的地方

### `.aab` 不能代替本文所需的 `.apk`

`.aab` 适合 Google Play 分发，但不能按本教程方式直接安装到真机或模拟器。开发构建需要 `.apk`。

### EAS Build 和 Expo 开发服务器不是同一个服务

- EAS Build：在云端编译 Android 原生应用。
- Expo 开发服务器：在本地为开发构建提供项目代码和开发服务。

前者产出可安装应用，后者支持日常开发运行。

### `android.package` 不是 npm 包名

它是 Android 系统识别应用使用的 application ID，采用类似 `com.owner.appname` 的反向 DNS 格式。

### Android Emulator 不是浏览器设备模拟模式

Chrome DevTools 的设备模式主要模拟视口、触摸等 Web 环境；Android Emulator 运行的是 Android 系统和 Android 应用。

### 构建完成不等于项目已经可以开发运行

构建完成后还需要：

1. 安装 `.apk`。
2. 启动 Expo 开发服务器。
3. 在 Android 环境中打开项目。

## 注意事项与限制

1. `build.development.developmentClient` 必须设置为 `true`。
2. 构建命令必须选择 Android 平台和 `development` profile。
3. 开发构建必须为可安装的 `.apk`，不能使用 `.aab` 代替。
4. Android application ID 的各部分应以小写字母开头。
5. 首次流程需要处理 Android Keystore。
6. 真机与模拟器使用同一构建流程，但安装方式不同。
7. 手动安装 `.apk` 时，Android 可能显示安全警告。
8. 使用 Orbit 安装到真机时，需要通过 USB 连接设备。
9. 运行项目前仍需执行 `expo start`。
10. 当前文档没有覆盖 Android 原生环境和模拟器的安装配置。

## 实际开发中的使用方式

### 文档明确说明

- 使用 `development` profile 创建 Android development build。
- 通过 EAS Build 在云端构建。
- 生成并安装 `.apk`。
- 真机可通过 Orbit 或二维码安装。
- 模拟器可通过 EAS CLI 提示或 Orbit 安装。
- 安装后运行 `expo start`，并在终端按 `A` 打开项目。

### 基于文档内容推导

- 可以先生成一次 development build，再将其作为本地开发期间运行 Expo 项目的原生载体。
- Dashboard 中的 profile、SDK 版本、应用版本、commit hash 和发起者信息有助于确认某个安装包对应哪次代码状态。
- Logs 适合在云端构建失败时确认失败发生在哪个构建阶段。
- 团队应明确区分开发安装包与面向 Google Play 的分发产物，避免把 `.aab` 当作本地可安装文件。

### 当前文档未涉及

- EAS CLI 的安装与登录。
- Expo 项目的初始创建。
- `eas.json` 的完整生成方法。
- Expo Orbit 的安装方法。
- Android Studio 和 Emulator 的安装与配置。
- USB 调试、ADB 和设备驱动。
- 构建额度、排队时间和费用。
- 构建失败的具体排查方法。
- 网络连接或终端按 `A` 无法打开应用时的处理方式。
- 正式版签名、Google Play 发布与版本升级。
- 哪些 JavaScript 或原生依赖变更需要重新生成 development build。

## 总结

这篇文档建立了 Android Expo 开发流程中的两层结构：

```text
EAS Build：生成并安装 Android 原生开发构建
Expo CLI：启动开发服务器并运行当前项目
```

核心操作是：

```sh
eas build --platform android --profile development
npx expo start
```

其中最重要的限制是：供真机或模拟器直接安装的 Android development build 必须是 `.apk`，而默认面向 Google Play 分发的 `.aab` 不能直接用于本文的安装流程。

<!-- NAVIGATION START -->
---
[← 上一页：使用 EAS Build 配置云端 Development Build](./1__configure-development-build.md) | [下一页：使用 EAS Build 创建并运行 iOS 模拟器开发构建 →](./3__ios-development-build-for-simulators.md)
<!-- NAVIGATION END -->
