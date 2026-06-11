# 使用 EAS Build 配置云端 Development Build

> 原文标题：Configure a development build in cloud  
> 文档更新时间：2026 年 6 月 3 日  
> 本文范围：配置 Development Build，不包含实际创建、下载和运行 Android/iOS 构建产物。

## 文档解决的问题

这篇文档介绍如何将一个 Expo 项目配置成可以通过 **EAS Build** 创建 Development Build 的项目。

完成文档中的步骤后，项目将具备以下状态：

1. 安装了 `expo-dev-client`。
2. 本地安装并登录了 EAS CLI。
3. 本地项目已经与 Expo 的 EAS 云端项目关联。
4. 项目根目录中生成了 `eas.json`。
5. `eas.json` 中包含用于开发、预览和生产的构建配置。
6. `development` 配置可以生成支持本地开发服务器和动态更新 JavaScript 的调试版本。

本文只完成“配置”。真正创建 Android Development Build、安装到设备或模拟器并连接开发服务器，是下一篇文档的内容。

## 适用场景

Development Build 适合以下情况：

- 项目需要使用包含原生代码的第三方库。
- 项目需要通过 config plugins 修改原生配置。
- 项目需要直接修改 `android` 或 `ios` 原生目录中的代码。
- 团队需要共享一致的原生运行环境。
- 应用最终准备发布到应用商店，而不只是学习或快速原型验证。
- 希望保留类似 React Web 的快速 JavaScript 迭代体验，同时又能自定义原生能力。

如果只是学习 Expo、快速验证想法，并且只使用 Expo Go 已经内置支持的能力，Expo Go 通常更直接。

## 阅读前需要理解的背景

### React Native 应用包含两类代码

对于 React Web 项目，浏览器通常已经提供了运行环境，开发服务器主要负责提供打包后的 JavaScript。

React Native 应用则可以粗略理解为由两部分组成：

- **JavaScript/TypeScript 代码**：React 组件、状态管理和业务逻辑。
- **原生运行环境**：安装在 Android 或 iOS 设备上的应用程序，负责调用相机、文件系统等原生能力，并执行 React Native 代码。

只启动 JavaScript 开发服务器，并不会自动得到一个可以安装到手机上的原生应用。设备上还必须存在一个与项目原生依赖相匹配的运行客户端。

### Metro

Metro 是 React Native 使用的 JavaScript 打包器。

`npx expo start` 会启动 Metro。它在开发阶段的作用类似 React Web 项目中的 Vite 或 webpack dev server：

- 处理项目模块。
- 向设备或模拟器提供 JavaScript。
- 支持开发期间快速更新代码。

但 Metro 不是 Android/iOS 应用本身。设备仍然需要安装 Expo Go 或项目自己的 Development Build。

### 原生库

原生库是包含 Android 或 iOS 原生代码的依赖。它不只是可以由 Metro 动态加载的 JavaScript。

这意味着：

- 增加或修改普通 JavaScript 代码时，通常不需要重新生成原生应用。
- 增加需要自定义原生代码的依赖时，现有原生客户端可能不包含它，因而需要生成新的 Development Build。

后一条是根据 Development Build 工作方式得出的结论，属于**基于文档内容推导**。

## Development Build 是什么

文档将 Development Build 定义为项目的调试版本，针对应用开发期间的快速迭代进行了优化。

它包含 `expo-dev-client`，因此能够提供完整的开发环境，并允许项目：

- 集成任意原生库。
- 修改原生目录中的代码。
- 使用开发工具。
- 连接本地开发服务器。
- 在不重新安装应用的情况下动态更新 JavaScript。

### 与 Expo Go 的区别

文档提供了一个便于理解的类比：

> Development Build 可以看作一个能够按照项目需求定制、只属于当前项目的 Expo Go。

| 对比项 | Development Build | Expo Go |
| --- | --- | --- |
| 开发体验 | 为移动应用提供接近 Web 开发的快速迭代体验 | 可以快速运行和测试 Expo SDK 项目 |
| 团队协作 | 团队成员可共享相同的原生运行环境 | 可以通过二维码方便地分享项目 |
| 第三方库 | 完整支持第三方库，包括需要自定义原生代码的库 | 受 Expo Go 已包含的原生能力限制 |
| 原生定制 | 支持 config plugins，也能直接修改原生代码 | 主要使用 Expo SDK，不适合直接修改原生代码 |
| 目标用途 | 面向最终需要发布到应用商店的完整应用开发 | 适合学习、原型和实验，不推荐用于生产应用 |

### React Web 开发者容易产生的误解

Development Build 并不是另一种 JavaScript 开发服务器。

它是一个真正的 Android/iOS 原生应用构建产物，需要先构建，再安装到设备或模拟器。Metro 只负责在开发时向它提供 JavaScript。

也不能将 Expo Go 理解为“React Native 浏览器”。Expo Go 只包含预先集成的一组原生能力，无法在扫描二维码时临时加入项目自定义的原生代码。

## 配置流程

### 第一步：安装 `expo-dev-client`

进入项目目录后，根据包管理器执行对应命令：

```sh
# npm
npx expo install expo-dev-client

# yarn
yarn expo install expo-dev-client

# pnpm
pnpm expo install expo-dev-client

# bun
bun expo install expo-dev-client
```

`expo-dev-client` 会被编译进 Development Build，为应用提供开发菜单、开发服务器连接等开发能力。

这里使用 `expo install`，而不是直接使用包管理器的普通安装命令。当前文档没有进一步解释两者的差异。

### 第二步：启动开发服务器

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

命令会启动 Metro，并在终端中显示：

- 二维码。
- `Metro waiting on...` 提示。
- Manifest URL。

安装 `expo-dev-client` 后可以观察到两项变化：

- Manifest URL 中包含 `expo-development-client` 和应用 scheme。
- 开发服务器改为服务 Development Build，而不是 Expo Go。

此时项目还不能直接运行，因为设备、Android 模拟器或 iOS 模拟器中尚未安装对应的 Development Build。

这是本流程中最重要的限制之一：

> `npx expo start` 只启动开发服务器，不会替你创建或安装原生 Development Build。

## 初始化 EAS 项目

### 安装 EAS CLI

EAS CLI 是操作 EAS 云端服务的命令行工具。文档要求将它全局安装到本机：

```sh
# npm
npm install --global eas-cli

# yarn
yarn global add eas-cli

# pnpm
pnpm add --global eas-cli

# bun
bun add --global eas-cli
```

它与 Expo CLI 的职责不同：

- Expo CLI 用于启动开发服务器等 Expo 项目操作。
- EAS CLI 用于关联 EAS 项目、配置云端构建以及执行 EAS 相关任务。

### 登录 Expo 账号

如果尚未通过 Expo CLI 登录，执行：

```sh
eas login
```

命令会要求输入 Expo 账号的邮箱或用户名以及密码。

如果没有账号，需要先注册 Expo 账号。如果已经登录，则可以跳过这一步。

### 创建并关联 EAS 项目

对于新项目，执行：

```sh
eas init
```

该命令会：

1. 确认 EAS 项目所属的 Expo 账号。
2. 询问是否创建新的 EAS 项目。
3. 在 EAS 服务器上创建项目。
4. 提供 EAS Dashboard 中的项目链接。
5. 生成唯一的 `projectId`。
6. 修改本地 `app.json`，把本地应用与云端项目关联。

典型执行结果如下：

```text
✔ Which account should own this project? > your-username
✔ Would you like to create a project for @your-username/sticker-smash? … yes
✔ Created @your-username/sticker-smash
✔ Project successfully linked (ID: XXXX-XX-XX-XXXX) (modified app.json)
```

### `app.json` 中的 `projectId`

`eas init` 会向 `app.json` 写入类似配置：

```json
{
  "extra": {
    "eas": {
      "projectId": "0cd3da2d-xxx-xxx-xxx-xxxxxxxxxx"
    }
  }
}
```

`extra.eas.projectId` 是 EAS 服务器识别项目的唯一标识，用于建立以下关联：

```text
本地 Expo 项目
       ↓ projectId
EAS 服务器上的项目
```

它不是 Android 包名、iOS Bundle Identifier，也不是 npm 包名。文档只明确说明它用于在 EAS 服务器上识别项目，没有在本页介绍这些其他标识的配置方式。

由于 `eas init` 会修改 `app.json`，执行后应检查并将该变更纳入项目的正常版本管理。此项属于**基于经验建议**。

## 配置 EAS Build

执行：

```sh
eas build:configure
```

命令会要求选择目标平台：

- Android
- iOS
- All

示例项目同时开发 Android 和 iOS，因此文档选择 `All`。

随后，命令会在项目根目录创建 `eas.json`：

```json
{
  "cli": {
    "version": ">= 16.18.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

这是新项目默认生成的 EAS Build 配置，主要完成两件事：

- 约束 EAS CLI 版本。
- 创建 `development`、`preview` 和 `production` 三个构建配置档案。

## 理解 `eas.json`

`eas.json` 是 EAS 的构建配置文件，位于项目根目录。

其中的 build profile 可以理解为 React Web 项目里针对不同环境设置的构建模式，例如 development、staging 和 production。区别在于，这里配置的不只是环境变量和 JavaScript 优化方式，还会影响 Android/iOS 原生构建产物的类型和分发方式。

每个 profile：

- 可以使用不同配置生成不同类型的构建。
- 可以包含 Android 或 iOS 专属配置。
- 可以继承其他 profile 的配置。

本页没有展开平台专属配置和 profile 继承的具体写法。

### `cli.version`

```json
{
  "cli": {
    "version": ">= 16.18.0"
  }
}
```

要求执行该项目 EAS 操作时使用的 EAS CLI 版本不低于 `16.18.0`。

它有助于避免团队成员或 CI 使用过旧 CLI，从而无法识别当前配置。

后一项开发影响属于**基于文档内容推导**。

### `cli.appVersionSource`

```json
{
  "cli": {
    "appVersionSource": "remote"
  }
}
```

该字段被默认配置为 `remote`，但当前文档没有解释它的具体行为。

因此，仅根据本页不能进一步断定远程版本号的管理流程。如需修改该字段，应查阅对应的版本管理文档，而不应只根据字段名称猜测。

### `build.development`

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    }
  }
}
```

这是本文真正关注的构建配置。

#### `developmentClient: true`

表示创建 Development Build。

该构建会使用 `expo-dev-client`，并生成可以安装到真机、Android 模拟器或 iOS 模拟器的构建产物。安装后，它可以连接本地开发服务器，在开发期间动态接收 JavaScript 更新。

需要区分两个相关操作：

- 安装 `expo-dev-client`：把开发客户端库加入项目依赖。
- 设置 `developmentClient: true`：告诉 EAS 按 Development Build 的方式进行构建。

二者共同构成本文的开发客户端配置。

#### `distribution: "internal"`

表示构建用于内部分享，而不是上传到应用商店。

“内部分享”并不等于“运行一个 Web URL”。这里分享的是需要安装到设备或模拟器上的原生构建产物。

### `build.preview`

```json
{
  "build": {
    "preview": {
      "distribution": "internal"
    }
  }
}
```

`preview` profile 同样采用内部发布。

当前文档没有解释 preview build 与 development build 的完整差异，也没有使用该 profile，因此不应仅根据本页补充更多行为。

### `build.production`

```json
{
  "build": {
    "production": {
      "autoIncrement": true
    }
  }
}
```

`production` 是生产构建配置，启用了 `autoIncrement`。

当前文档没有说明该字段递增哪一个平台版本值，也没有讲解生产构建流程。

### `submit.production`

```json
{
  "submit": {
    "production": {}
  }
}
```

配置文件预留了 production 提交配置，但当前文档没有介绍如何提交应用商店，也没有解释空对象的详细行为。

## 完整操作顺序

```sh
# 1. 在项目目录中安装开发客户端库
npx expo install expo-dev-client

# 2. 启动 Metro，观察开发服务器已切换到 Development Build 模式
npx expo start

# 3. 全局安装 EAS CLI
npm install --global eas-cli

# 4. 登录 Expo 账号
eas login

# 5. 创建并关联 EAS 云端项目
eas init

# 6. 生成 EAS Build 配置
eas build:configure
```

第 2 步启动 Metro 后暂时无法运行应用，这是预期行为。后续还需要创建 Development Build，并安装到设备或模拟器。

## 文件与服务之间的关系

```text
本地项目
├── package.json
│   └── 包含 expo-dev-client 依赖
│
├── app.json
│   └── extra.eas.projectId
│       └── 关联 EAS 云端项目
│
└── eas.json
    ├── cli
    │   └── 约束 CLI 和版本来源设置
    ├── build
    │   ├── development
    │   ├── preview
    │   └── production
    └── submit
        └── production
```

对应的工具职责为：

| 工具或服务 | 作用 |
| --- | --- |
| Metro | 打包并向开发客户端提供 JavaScript |
| `expo-dev-client` | 为项目的原生构建提供开发客户端能力 |
| Expo CLI | 启动 Metro 等本地开发流程 |
| EAS CLI | 初始化、关联和配置 EAS 项目 |
| EAS Build | 在云端生成 Android/iOS 构建产物 |
| EAS Dashboard | 查看和管理 EAS 云端项目 |

## 注意事项和限制

### 当前没有 Development Build 时，项目无法运行

安装 `expo-dev-client` 并启动 Metro 后，如果设备或模拟器上没有 Development Build，就不能运行当前项目。

这不是 Metro 启动失败，而是缺少能够连接 Metro 的原生客户端。

### Development Build 与项目需求绑定

Development Build 是按当前项目的原生需求定制的，不是像 Expo Go 一样通用于所有 Expo 项目。

因此，团队共享 Development Build 的价值在于让成员使用一致的原生运行环境。这一点是文档明确说明的。

### JavaScript 更新与原生变更不是同一层

文档明确说明 Development Build 支持动态更新 JavaScript，同时也允许集成原生库和修改原生目录。

由此可以推导：

- 只修改 JavaScript/TypeScript 时，可继续使用现有 Development Build 连接 Metro。
- 当原生依赖或原生代码发生变化时，原有构建可能无法反映这些变化，需要新的原生构建。

第二项是**基于文档内容推导**，本页没有给出重新构建的具体判断规则。

### `eas init` 会修改项目文件

该命令不是只在云端创建记录，还会修改本地 `app.json`，写入 `extra.eas.projectId`。

在已有项目中运行时，需要注意该文件变更，避免错误覆盖原有配置。此项属于**基于经验建议**。

### 本页没有覆盖的内容

当前文档未涉及：

- 如何实际执行云端构建命令。
- 如何下载和安装 Development Build。
- Android 真机和模拟器的安装步骤。
- iOS 真机和模拟器的安装步骤。
- Android/iOS 签名与证书管理。
- 构建费用、配额和等待时间。
- CI/CD 集成。
- 环境变量和密钥配置。
- 原生依赖变化后何时必须重新构建。
- `preview` 与 `production` profile 的完整使用方式。
- 应用商店提交流程。
- EAS Update 的使用方式。
- 构建失败的故障排查方法。

## 实际开发中的使用方式

建议将 Development Build 理解为项目的“可定制原生开发容器”：

1. 使用 `expo-dev-client` 和 `developmentClient: true` 创建项目专属的原生客户端。
2. 将该客户端安装到开发设备或模拟器。
3. 日常开发时运行 `npx expo start`。
4. Development Build 连接 Metro 并加载最新 JavaScript。
5. 当项目引入新的原生能力时，评估是否需要重新生成 Development Build。

第 5 步的判断方式属于**基于文档内容推导**，本页没有提供具体检测命令。

团队中还应将 `app.json` 和 `eas.json` 纳入版本管理，使项目关联信息和构建配置保持一致。此项属于**基于经验建议**。

## 文档明确结论与推导结论

### 文档明确说明

- Development Build 是项目的调试版本。
- Development Build 包含 `expo-dev-client`。
- 它支持任意第三方库，包括需要自定义原生代码的库。
- 它允许使用 config plugins 和直接修改原生代码。
- Expo Go 不适合需要自定义原生依赖的项目，也不推荐用于生产应用。
- `eas init` 会创建并关联 EAS 项目，同时修改 `app.json`。
- `extra.eas.projectId` 用于在 EAS 服务器上识别项目。
- `eas build:configure` 会创建 `eas.json` 和默认 build profiles。
- `developmentClient: true` 用于创建 Development Build。
- `distribution: "internal"` 表示内部分享，而不是上传应用商店。
- 没有安装 Development Build 时，仅启动 Metro 还不能运行项目。

### 基于文档内容推导

- 普通 JavaScript/TypeScript 修改通常可以通过 Metro 继续迭代。
- 原生依赖或原生代码变化后，现有 Development Build 可能需要重新构建。
- `cli.version` 可以减少团队或 CI 使用不兼容 EAS CLI 版本的风险。
- Development Build 是项目专属的原生运行环境，不是通用的移动端 JavaScript 播放器。

## 总结

本篇文档完成的是 Development Build 的准备和配置链路：

```text
安装 expo-dev-client
        ↓
启动 Metro 并切换到 Development Build 模式
        ↓
安装和登录 EAS CLI
        ↓
使用 eas init 关联 EAS 云端项目
        ↓
使用 eas build:configure 生成 eas.json
        ↓
获得可用于创建 Development Build 的 development profile
```

对于 React Web 开发者，最关键的认知是：Metro 类似 Web 开发服务器，但移动设备还需要安装一个原生客户端。Development Build 就是针对当前项目定制的原生开发客户端，它在保留 JavaScript 快速迭代体验的同时，解除了 Expo Go 在原生依赖和原生定制方面的限制。

<!-- NAVIGATION START -->
---
[下一页：使用 EAS Build 创建并运行 Android 开发构建 →](./2__android-development-build.md)
<!-- NAVIGATION END -->
