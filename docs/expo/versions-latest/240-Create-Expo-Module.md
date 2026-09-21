# 240｜create-expo-module 生成 Expo 原生模块

**翻页：**[上一页：create-expo-app 创建项目](./239-Create-Expo-App.md) · [目录](./README.md) · [下一页：qr.expo.dev 二维码工具](./241-QR-Expo-Dev.md)

**官方页面：**[create-expo-module](https://docs.expo.dev/more/create-expo-module/)

**版本范围：**这是 Expo 当前未版本化的 CLI 指南（页面标注更新于 2026-09-17）。Standalone module（独立模块）默认使用最新模板；local module（本地模块）会尽量选择与当前项目已安装 Expo SDK 相匹配的模板，如果无法识别 SDK 才回退到最新版。

## 它解决什么问题

`create-expo-module` 是生成 Expo Modules API 原生模块的命令行工具，可新建模块，也能给已有模块补平台代码。原生模块用 Swift / Kotlin / C++ 等原生实现系统功能，再通过 JavaScript / TypeScript API 暴露给 React Native App。

开始前先决定模块是否需要脱离单一 App 单独复用：

| 类型 | 适用场景 | 生成位置与内容 |
| --- | --- | --- |
| **Local module** | 只给一个 Expo App 增加自定义原生代码，不需要独立发布或在其他项目复用。 | 放在 App 内；使用 App 现有依赖与构建工具；Expo Autolinking 从原生模块目录自动发现。默认生成在 `modules`，也可由 `package.json` 的 `expo.autolinking.nativeModulesDir` 改目录。 |
| **Standalone module** | 多个 App 复用、monorepo 内独立 package 或发布到 npm。 | 独立 npm package，带模块依赖、脚本、原生源文件和 example App 供开发测试。 |

## 创建 Local module

在一个已有 Expo 项目根目录运行：

```sh
npx create-expo-module@latest --local
yarn create expo-module --local
pnpm create expo-module --local
bun create expo-module --local
```

交互提示会询问本地目录名、原生模块名、支持平台和要加入的功能示例。典型目录结构：

```text
modules/
  my-module/
    android/
    ios/
    src/
    expo-module.config.json
```

`expo-module.config.json` 提供 Autolinking 所需模块信息；`android`、`ios` 是各原生平台实现，`src` 放 JS / TS API 或模块代码。Local 模块不额外安装独立 package 依赖，也不会创建 example App。

## 创建 Standalone module

在要存放 package 的位置运行：

```sh
npx create-expo-module@latest my-module
yarn create expo-module my-module
pnpm create expo-module my-module
bun create expo-module my-module
```

交互流程会收集 npm package 名称、native module 名称、平台、示例功能、package metadata 和包管理器。随后生成模块与可运行的示例 App：

```text
my-module/
  android/
  ios/
  src/
  example/
  expo-module.config.json
  package.json
```

若该目录不属于现有 Git 仓库，生成器会自行初始化 Git 并创建初始提交。生成 example App 时会安装依赖并对 App 执行 Prebuild；macOS 上还会为 iOS 工程安装 CocoaPods。

## 开发 Standalone module

在模块根目录用当前包管理器打开 Android / iOS 原生工程：

```sh
cd my-module
npm run open:android
npm run open:ios
```

```sh
cd my-module
yarn open:android
yarn open:ios
```

```sh
cd my-module
pnpm run open:android
pnpm run open:ios
```

```sh
cd my-module
bun run open:android
bun run open:ios
```

`open:ios` 需要 macOS 与 Xcode；Windows 用户可在 Android Studio 打开生成的 `android` 目录。开发时还要从示例 App 目录启动 Expo：

```sh
cd example
npx expo start
```

Standalone module 的 package.json 通常包含以下脚本：

| 脚本 | 用途 |
| --- | --- |
| `build` | 编译 TypeScript 文件。 |
| `clean` | 删除生成的 build 输出。 |
| `test` | 运行模块测试。 |
| `prepare` | 发布或打包前构建 package targets。 |
| `open:ios` / `open:android` | 打开生成的 iOS / Android 示例原生工程。 |

修改 native code 后要重编译并重新安装 example App 才能看到变化；修改 JS / TS 可由开发服务器热更新。

## 常用选项

| 选项 | 作用 |
| --- | --- |
| `[path]` | 指定模块目标目录；不传时使用交互填写的名称。 |
| `--local` | 在当前 Expo 项目内建模块；跳过独立 package 依赖安装与 example App。 |
| `--platform <platform...>` | 指定平台：`android`、`apple`、`web`。Local 模式交互时默认从 App config 的 `platforms` 预选；Standalone 交互默认全选。非交互模式不指定时也默认全选。 |
| `--features <feature...>` | 决定生成哪些 Expo Modules API 功能示例；没有示例则生成最小模块。 |
| `--full-example` | 加入全部功能示例，效果等同 `--features all`。 |
| `--package-manager` | Standalone 模块使用的 `npm` / `pnpm` / `yarn` / `bun`；没传时按当前进程和机器已装管理器探测，交互模式会预选探测结果。 |
| `--no-example` | Standalone module 不生成示例 App。 |
| `--barrel` | 仅 local 模式下生成 `index.ts` 汇总导出文件；默认由 `src` 内文件直接导入。 |
| `--source <path>` | 使用本机的 expo-module-template 目录代替下载 npm 模板。 |
| `--with-readme` / `--with-changelog` | Standalone 模块附加 README.md / CHANGELOG.md。 |
| `--name` | 指定 Swift / Kotlin 等原生模块名；如与 Apple framework 冲突，工具会重命名以避免构建错误。 |
| `--description` | 写入 package metadata 的描述。 |
| `--package` | 指定 Android package 名，例如 `expo.modules.mymodule`。 |
| `--author-name`、`--author-email`、`--author-url` | 设置 package 作者资料。 |
| `--repo` | 指定源码仓库 URL。 |
| `--license` | 指定授权许可证，默认 `MIT`。 |
| `--module-version` | 指定初始 package 版本，默认 `0.1.0`。 |
| `--version` / `--help` | 分别打印生成器版本 / 全部命令选项后退出。 |

查询生成器版本或完整帮助：

```sh
npx create-expo-module@latest --version
npx create-expo-module@latest --help
```

### 功能示例

`--features` 里的功能是生成出来供学习和修改的短代码片段，不限制最终模块能够实现什么。支持：

| 名称 | 示例用途 |
| --- | --- |
| `Constant` | 从原生侧导出常量。 |
| `Function` | 同步原生函数。 |
| `AsyncFunction` | 异步原生函数。 |
| `Event` | 模块级事件发射器。 |
| `View` | 原生 View 组件。 |
| `ViewEvent` | 原生 View 发出的事件；同时生成 View 示例。 |
| `SharedObject` | JavaScript 与原生侧共享的对象。 |

例如，创建同时支持 Android 与 Apple 平台的模块：

```sh
npx create-expo-module@latest my-module --platform android apple
```

选择部分功能或全套功能：

```sh
npx create-expo-module@latest my-module --features Function AsyncFunction
npx create-expo-module@latest my-module --features all
```

## 非交互模式与 CI

当运行在 CI、`EXPO_NONINTERACTIVE` 环境变量已设置或 stdin 不是 TTY 时，工具不显示问题提示。未给出的值会从目标路径推导或填默认值，并输出 warning。Local module 在非交互模式也默认所有平台，除非明确传 `--platform`；给现有模块加平台时则必须显式指定新增平台。

完整传值示例：

```sh
npx create-expo-module@latest my-module \
  --name MyModule \
  --package expo.modules.mymodule \
  --platform android apple \
  --features Function AsyncFunction \
  --description "My module" \
  --license MIT \
  --module-version 0.1.0
```

新增平台在非交互模式需要明确给出目标：

```sh
npx create-expo-module@latest add-platform-support --platform android
```

## 给已有模块增加平台

`add-platform-support` 在现有 Expo module 中增加平台源文件，并更新 `expo-module.config.json`。它只处理配置中尚未登记的平台，不覆盖已存在的 `android` / `ios` 目录。

从模块根目录交互选择尚未支持的平台：

```sh
npx create-expo-module@latest add-platform-support
```

也能指定模块路径：

```sh
npx create-expo-module@latest add-platform-support ./packages/my-module
```

为新平台补 Android 支持的示例：

```sh
npx create-expo-module@latest add-platform-support --platform android
```

如果工具推断的示例功能不适合你的模块，可手动指定；未检测 / 未指定时会生成最小平台骨架：

```sh
npx create-expo-module@latest add-platform-support --platform android --features Function Event
```

检测已有模块功能是 best effort：常规 Expo Modules API 定义效果较好；多文件分散定义、生成文件或非典型实现可能漏检。可用 `--features` 覆盖。既有原生模块必须使用 Expo Modules API DSL，旧式模块定义无法自动扫描。`--source` 也可以指定本地模板。

## 模板版本和环境变量

`EXPO_BETA=1` 会改用下一版的模块与示例 App 模板，适合验证 beta 模板：

```sh
EXPO_BETA=1 npx create-expo-module@latest my-module
```

| 环境变量 | 作用 |
| --- | --- |
| `EXPO_BETA` | 选下一版模板。 |
| `EXPO_DEBUG` | 输出命令调试日志。 |
| `EXPO_NO_TELEMETRY` | 禁用遥测。 |
| `EXPO_NONINTERACTIVE` | 无提示运行并采用默认值。 |

## 新手名词解释

- **Native module（原生模块）：**在 Swift / Kotlin 等平台代码中调用系统 API，再通过 Expo Modules API 暴露 JS 接口的 package。
- **Local module：**和 App 一起维护的私有原生功能；只有一个 App 使用时，通常比拆包发布更直接。
- **Standalone module：**独立可安装的原生 package；可供 monorepo 多 App 共用或发到 npm。
- **Expo Autolinking：**扫描模块配置并把包接入 iOS / Android 工程，减少手工配置原生依赖的步骤。
- **Example App：**与模块一同生成的示例宿主，用于在真实原生运行时编译、安装和调试模块。
- **CocoaPods：**iOS 原生依赖管理器；生成 iOS example 后通常需安装 Pods。
- **Feature example：**生成器添加到模块的演示片段，提供实现常量、函数、事件、View 等 API 起点。
- **Platform 名称 apple：**文档 CLI 以 `apple` 表示 Apple 平台目标（iOS）；本地原生目录通常叫 `ios`。
- **Non-interactive：**没有可供回答问题的终端，或明确设置了 `EXPO_NONINTERACTIVE`；自动化环境需要预先传入必要选项。
- **Template version：**生成器使用的模块模板版本。Local 模块优先匹配 App SDK，Standalone 模块跟随最新模板。

## 源页代码与命令主题覆盖

共 19 个本地代码块 / 命令主题均有对应示例：Local / Standalone 四种包管理器创建命令、两个项目树、四种管理器打开 native 工程、运行 example、版本与帮助、平台选择、部分 / 全部功能示例、完整非交互参数、新增平台（交互、指定路径、Android、指定 features）以及 beta 模板。页面列出的全部参数、feature 名称、生成脚本、默认值、自动平台检测规则和环境变量另以表格 / 文字覆盖。

**翻页：**[上一页：create-expo-app 创建项目](./239-Create-Expo-App.md) · [目录](./README.md) · [下一页：qr.expo.dev 二维码工具](./241-QR-Expo-Dev.md)
