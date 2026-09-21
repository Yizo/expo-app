# 238｜Expo CLI 命令行工具

**翻页：**[上一页：Expo Structured Field Values 结构化字段值](./237-Expo-Structured-Field-Values.md) · [目录](./README.md) · [下一页：create-expo-app 创建项目](./239-Create-Expo-App.md)

**官方页面：**[Expo CLI](https://docs.expo.dev/more/expo-cli/)

**版本范围：**CLI 指南是 Expo 当前未版本化页面（页面标注更新于 2026-09-17），不是单独的 SDK v56 API 参考。CLI 由项目里的 `expo` 包提供；`npx expo` 在当前项目上下文中运行相应版本。与 SDK v56 有关的环境变量和命令差异在下面标注，遇到版本差异时以项目内 CLI 的 `--help` 和匹配 SDK 的版本化文档为准。

## Expo CLI 是什么

Expo CLI 是开发者与 Expo 工具交互的命令行入口。主要工作包括启动 Metro 开发服务器、生成原生 iOS / Android 工程、在本机编译运行、导出 JavaScript 与静态资源、安装与 SDK 兼容的依赖、读取 App config。

React Native App 可以粗略看作两层：

1. **原生 runtime（运行时）：**iOS / Android 宿主、原生模块、系统权限与生命周期。
2. **JavaScript bundle 和 assets（资源）：**React 组件、逻辑、图片、字体等。

`expo start` 通常只启动 JS 开发服务；`expo run:*` 会编译原生 App；`expo export` 会生成生产用 JS 和静态资源。

## 查看帮助

`expo` CLI 随 `expo` npm 包安装，不需要全局安装独立的旧版 CLI。用 `-h` / `--help` 查看全局或具体命令的选项：

```sh
npx expo -h
yarn expo -h
npx expo login -h
```

帮助输出的结构大致如下：

```text
Usage
  $ npx expo <command>

Commands
  start, export
  run:ios, run:android, prebuild
  install, customize, config
  login, logout, whoami, register

Options
  --version, -v   Version number
  --help, -h      Usage info
```

## 安装 Expo CLI

`expo` 包包含 Expo CLI。已有纯 React Native 项目还需要补齐 Expo 所需的 Metro 配置，否则一些 Expo bundling 功能不能自动使用：

```sh
npm install expo
yarn add expo
```

## 开发：启动 Metro

`expo start` 启动本地开发服务器，默认监听 `http://localhost:8081`；Metro 是打包与转换 JavaScript / TypeScript 的 bundler（打包器）。

```sh
npx expo start
```

`npx expo` 是 `npx expo start` 的简写。Terminal UI（终端交互界面）显示服务器 QR code、连接目标和快捷键：

| 快捷键 | 操作 |
| --- | --- |
| `A` / `Shift+A` | 打开已连接 Android 设备，或选择 Android 模拟器 / 设备。 |
| `I` / `Shift+I` | 打开当前或选择 iOS Simulator。 |
| `W` | 在浏览器打开 Web；项目可能需要配置 webpack / Web bundler。 |
| `R` | 重新载入已连接设备上的 App。 |
| `S` | 在 Expo Go 与 development build 之间切换启动目标。 |
| `M` / `Shift+M` | 打开原生设备 Dev Menu；或显示更多调试命令，如性能面板与元素检查器。Web 不支持此原生菜单。 |
| `J` | 为使用 Hermes 引擎的连接设备打开 React Native DevTools。 |
| `O` | 在编辑器打开项目；可通过 `EXPO_EDITOR` / `EDITOR` 选择。 |
| `E` | 把开发服务器 URL 显示为终端二维码。 |
| `?` | 显示全部快捷键。 |

### 选择 Expo Go 或 development build

若项目安装了 `expo-dev-client`，`expo start` 默认启动 development build；否则默认 Expo Go。可以在命令行强制选择，运行中也可按 `S` 切换：

```sh
npx expo start --dev-client
npx expo start --go
```

`expo run:ios` / `expo run:android` 编译后默认使用 development build。

### 开发服务器地址

默认设备通过同一局域网访问开发服务器。`--localhost` 将其限制在本机；`--port` 指定端口，默认 `8081`，`--port 0` 自动选可用端口。`--https` 已弃用，改用 `--tunnel`，且旧 HTTPS 选项目前只对 Web 有效。

通过环境变量可将 Expo dev server 的 packager URL 固定成自选 URL：

```sh
export EXPO_PACKAGER_PROXY_URL="http://expo.dev"
npx expo start
```

此例中 App 会使用类似 `exp://expo.dev:80` 的地址；`:80` 是 Android WebSocket 的临时兼容处理。

### Tunnel 连接

设备与开发电脑无法经 LAN / localhost 互通时，可以使用 tunnel（隧道）代理。首次使用先安装 Expo 使用的 ngrok 客户端，再启动 tunnel：

```sh
npm i -g @expo/ngrok
```

```sh
npx expo start --tunnel
```

公开 tunnel URL 会把设备请求转发到本机服务器，例如 `https://xxxxxx.bacon.19000.exp.direct:80`。隧道比 LAN 慢；URL 可由能联网的设备访问；电脑和手机都必须连网，所以不能与 `--offline` 一起使用。URL 带随机字符降低被猜中的风险；如需重置 URL 的随机部分，可清除项目的 `.expo` 目录。ngrok 服务也可能临时不可用。

`EXPO_TUNNEL_SUBDOMAIN` 是实验性选项，可指定测试 iOS Universal Links 时使用的子域名。虽然环境变量表把类型标为 boolean，实际传入应是一个不等于 `true`、`false`、`1` 或 `0` 的具体 string。

### 离线模式

`--offline` 阻止 CLI 发出网络请求。电脑断网时 CLI 也会自动尝试离线模式，但显式传参能省去网络探测等待。正常联网启动还会用登录凭据给 manifest 签名，以便在 Expo Go 等共享 runtime 中隔离敏感信息。

```sh
npx expo start --offline
```

### 项目本地 .expo 目录

第一次启动会在项目根目录创建 `.expo`，包含：

- `devices.json`：最近连接并打开此项目的设备信息。
- `settings.json`：向客户端提供 manifest 时所用的开发服务器配置。

这些信息和本机相关，新项目默认把 `.expo` 放入 `.gitignore`，通常不应与队友共享。

## Open endpoint：查询或打开开发链接

Metro dev server 提供 `/_expo/open`，供 CI、远程预览、云端工具查询 CLI 会为设备选用的 deep link，或从服务器宿主本机模拟 Terminal UI 的打开行为。旧 `/_expo/link` 端点只做 `307` 重定向，不能被非移动客户端直接跟随。

- `GET /_expo/open`：dry run，仅返回 JSON deep link，允许通过 tunnel 查询。
- `POST /_expo/open`：在开发服务器所在主机启动指定平台；等同于按 Terminal UI 的 `I`、`A` 或 `W`，只允许同源请求。
- `platform` query 或 `expo-platform` header：`ios`、`android`、`web`。GET 不传时返回各平台的发现信息。
- `runtime`：`default` 按启动服务器时的目标选择；`expo` 强制 Expo Go；`custom` 强制 development build；`unknown` 显示选择页，由设备决定。按 `S` 切换目标或在服务器运行中安装 `expo-dev-client` 后，下一次查询会反映新状态。

单平台查询的典型响应：

```json
{
  "runtime": "expo",
  "url": "exp://192.168.1.71:8081",
  "scheme": "myapp",
  "availableRuntimes": ["expo", "custom"],
  "appId": "com.example.app"
}
```

不指定平台时返回发现结果：

```json
{
  "scheme": "myapp",
  "availableRuntimes": ["expo", "custom"],
  "platforms": {
    "ios": {
      "url": "http://192.168.1.71:8081/_expo/loading?platform=ios",
      "appId": "com.example.app"
    },
    "android": {
      "url": "http://192.168.1.71:8081/_expo/loading?platform=android",
      "appId": "com.example.app"
    },
    "web": {
      "runtime": "web",
      "url": "http://192.168.1.71:8081",
      "appId": null
    }
  }
}
```

`url` 会在 tunnel 模式下使用 ngrok host。`scheme` 没配置时为 null；`appId` 是 iOS bundle id 或 Android package，Web / 尚未配置时为 null。若可选 `availableRuntimes` 同时有 `expo` 与 `custom`，调用方应显式选 runtime 或让设备显示选择页。

以下请求示例分别展示安全 GET、强制选择页 GET 和同源本机 POST：

```sh
# 通过 GET 取回 iOS deep link；可经 tunnel 使用。
curl "http://localhost:8081/_expo/open?platform=ios"

# 指示设备打开运行时选择页。
curl "http://localhost:8081/_expo/open?platform=android&runtime=unknown"

# 让 dev server 宿主机启动 iOS Simulator；只适用于服务器同一主机。
curl -X POST "http://localhost:8081/_expo/open?platform=ios"
```

POST 的状态码包括：`200` 已打开并返回平台 / runtime / URL；`403` 跨 origin，被拒绝并建议改用 GET；`501` 当前开发服务器主机不能启动请求的平台（例如 Windows 上请求 iOS Simulator）；`500` 平台启动函数抛错，响应包含错误码与消息。

## Building：构建 React Native App

Expo CLI 既能生成并编译原生 runtime，也能导出 JS 与静态资源。`expo run:*` 本机需要平台开发工具；发布商店且要云端签名时，使用 EAS Build。

### 本机编译

`run:ios` 只能在 macOS + Xcode 上运行；`run:android` 需要 Android Studio 与 Java。没有原生目录时，命令会先调用 `expo prebuild` 生成它：

```sh
npx expo run:ios
npx expo run:android
```

常用跨平台参数：

| 选项 | 作用 |
| --- | --- |
| `--no-build-cache` | 清原生构建缓存；iOS 对应 Derived Data，适合测构建耗时。 |
| `--no-install` | 跳过依赖安装；iOS 同时跳过 `pod install`（package.json dependency 有变化时本来会执行）。 |
| `--no-bundler` | 跳过启动开发服务器；若已有另一个进程服务该 App 会自动启用。 |
| `-d, --device [device]` | 选物理机或虚拟设备；不提供值会出现列表；`generic` 可做不指定设备的 build-only。 |
| `-o, --output <path>` | 构建完成后把二进制复制到指定目录，便于 CI 获得固定路径。 |
| `-p, --port <port>` | development build dev server 端口，默认 8081；production 会先 export 并把资源嵌入 App。 |
| `--binary <path>` | 跳过编译，尝试把指定已有二进制安装到设备；Simulator / 真机类型不匹配会失败。 |

直接本机构建可快速调试原生模块。`eas build` 在云端使用已配置好的构建环境，通常更稳健。若缺少 `ios` 或 `android` 目录，`expo run` 会对目标平台自动运行对应的 prebuild。

### Android variant 与原生调试

Android variant（变体）在 Gradle 工程中定义，可用 `--variant` 选择。以下命令分别构建 debug、`debugOptimized` 与 release：

```sh
npx expo run:android --variant debug
npx expo run:android --variant debugOptimized
npx expo run:android --variant release
```

`debugOptimized` 从 SDK 54 起可用：它让 C++ 库像 release 一样优化，运行性能更接近正式包，同时保留易调试的总体模式；代价是 C++ 调试关闭，C++ 崩溃堆栈可能较难读。EAS Build 要搭配对应 Gradle task，例如 `:app:assembleDebugOptimized`。SDK56 项目支持此变体。

在 Android Studio 中打开原生目录：

```sh
open -a "/Applications/Android Studio.app" android
```

product flavor（产品变体）项目可以同时传 Gradle variant 和 application id：

```sh
npx expo run:android --variant freeDebug --app-id dev.expo.myapp.free
```

`release` 用于复现只在正式编译出现的问题，但 CLI 本身不会给该 APK 自动签名以便提交 Google Play。需商店签名发布时使用 EAS Build。

### iOS scheme、Release 与 build-only

iOS scheme 可代表主 App、App Clip、watchOS App 等不同 target。CLI 默认选择主 App scheme；`--scheme` 可指定 scheme，单独传该选项会让 CLI 交互选择，也会筛选相符的 `--device` 列表。

Release 编译示例：

```sh
npx expo run:ios --configuration Release
```

CLI 不会为该本机构建自动完成 App Store 发布签名。真机开发调试时可连接设备并执行 `npx expo run:ios --device`，CLI 会尝试配置开发签名、安装和打开 App。Simulator 的原生日志会转发到终端；真机日志不会通过此方式转发。没有开发者 profile 时需在 Xcode 外部完成签名准备。

如需 Xcode 原生断点或 Instruments，可打开工程：

```sh
xed ios
```

`generic` 目标让 CI 无需启动一个具体 Simulator，就能生成可在兼容 Simulator 使用的 App：

```sh
npx expo run:ios --device generic
```

构建成功时会打印类似的产物位置：

```text
Build complete
Binary: ~/Library/Developer/Xcode/DerivedData/.../Release-iphonesimulator/MyApp.app
```

也可用 Release configuration 构建并把产物复制到 `./build`：

```sh
npx expo run:ios --configuration Release --device generic --output ./build
```

`--device generic` 适合 CI、分享 Simulator .app 和只构建不安装的流程。`--output` 指定副本目录；构建器仍会把编译产物放入 Xcode Derived Data。

## Exporting：导出 JavaScript 与资源

Metro export 会面向生产打包代码、移除由 `__DEV__` 控制的开发路径，将静态文件复制到 `dist`，并原样复制 `public` 目录。`eas update` 与原生生产编译也会自动执行 export。

```sh
npx expo export
```

常见参数：

| 参数 | 作用 |
| --- | --- |
| `--platform ios` / `android` / `all` | 导出平台；默认 all。若 app config 启用 Web，也可指定 web。 |
| `--dev` | 以开发模式打包，不压缩代码且保留 `__DEV__`。 |
| `--output-dir <dir>` | 导出路径，默认 `dist`。 |
| `--max-workers <number>` | 控制 bundler 并行 worker 数；传 0 会在同一进程转换，便于排查 Babel 问题。 |
| `-c, --clear` | 清 Metro 缓存。 |
| `--no-minify` | 不压缩 JS / CSS。 |
| `--no-bytecode` | 原生平台不生成 Hermes bytecode；仅用于分析 bundle 大小，生产 App 不应以 UTF-8 bundle 替代，因为启动会明显变慢。 |
| `--no-ssg` | 不生成 Web 静态 HTML，只导出 server code；适用于 Expo Router API routes 等场景。 |

### Web 部署在子路径

实验性 `experiments.baseUrl` 为 Web 静态资源配置部署前缀。设为 `/my-root` 后，服务器要把导出目录托管在这个子路径下，资源 URL 也会带此前缀；若修改此值，需重新 export。

```json
{
  "expo": {
    "experiments": {
      "baseUrl": "/my-root"
    }
  }
}
```

Expo Router 的 `Link` 和 `router` 会自动加 `baseUrl`：

```tsx
import { Link } from 'expo-router';

export default function Blog() {
  return <Link href="/blog/123">打开文章</Link>;
}
```

导出的链接形式：

```html
<a href="/my-root/blog/123">打开文章</a>
```

若直接使用 `<a>`、React Navigation 或 `Linking` API，需自行加前缀。`require` 或 `import` 的图片会自动加 prefix：

```tsx
import { Image } from 'expo-image';

export default function Blog() {
  return <Image source={require('@/assets/image.png')} />;
}
```

页面导出时会生成类似的图片资源地址：

```html
<img src="/my-root/assets/assets/image.png" />
```

手动拼接资源 URL 时必须自己加前缀：

```tsx
export default function Blog() {
  return <img src="/my-root/assets/image.png" />;
}
```

`baseUrl` 仅对生产 export 生效，必须在导出前配置；普通运行时不会自动加这个生产子路径。

### Webpack 导出（已弃用）

`expo export:web` 是旧 Webpack 工作流。SDK 50 及以后已弃用，推荐统一 Metro 的 `npx expo export`。`--dev` 和 `-c, --clear` 可用于旧流程；如果 App config 设 `expo.web.bundler: 'metro'`，旧命令会禁用。

```sh
npx expo export:web
```

## Prebuild：生成原生工程

Prebuild 将 Expo app config、插件与项目设置转换为 `ios` / `android` 原生 source code。只有原生源码生成后，App 才能被 Xcode / Gradle 编译：

```sh
npx expo prebuild
```

Prebuild 并不是 JS bundle：它负责生成原生项目；`expo export` 负责 JS / 资源的生产打包。需要了解 CNG 和原生目录生命周期时，继续读 Expo Prebuild 官方指南。

## Lint：运行 Expo ESLint 配置

`expo lint` 为项目准备 Expo 推荐的 ESLint 配置并运行 ESLint。默认检查 `src`、`app` 和 `components`；`--fix` 会自动修复部分问题。

```sh
npx expo lint
npx expo lint --fix
```

也能显式传文件和目录：

```sh
npx expo lint ./utils constants.ts
npx expo lint --ext .ts,.tsx
```

可把专属参数透传给 ESLint，分隔符 `--` 后面的参数由底层工具接收：

```sh
npx expo lint -- --no-error-on-unmatched-pattern
npx eslint
```

默认扩展名包括 `.js`、`.jsx`、`.ts`、`.tsx`、`.mjs`、`.cjs`。`--ext` 可选择文件类型；若要比 Expo 包装命令更精细控制，也可直接用 `npx eslint`。传入目录与文件时，未匹配模式等错误的行为可用上面的 ESLint 参数控制。

## Config：检查最终 App config

`expo config` 求值 `app.json` 或 `app.config.js` 并显示 CLI 得到的配置：

```sh
npx expo config
npx expo config --full --json
```

- `--full` 显示完整配置对象。
- `--json` 以 JSON 输出，常用于把动态 `app.config.js` 求值并转成 JSON。
- `-t, --type` 选择配置类型：
  - `public`：发给 App / OTA 更新所用的公开 manifest，可类比网页 `<head>` 中公开元信息。
  - `prebuild`：交给 Prebuild 的设置，包含异步 modifier；这是唯一可能尚不可序列化的配置视图。
  - `introspect`：Prebuild 配置的子集，展示 `Info.plist` / AndroidManifest.xml 等当前内存修改结果。

## Install：按当前 React Native 版本安装包

与 Web 生态相比，React Native 原生依赖通常需要匹配项目使用的 React Native 版本。`expo install` 根据 Expo / React Native 的已知兼容组合给常用包选择推荐版本，可作为原生依赖安装命令。一次可以装单个或多个包：

```sh
npx expo install expo-camera
npx expo install typescript expo-sms
```

向 package manager 传额外参数时，用 `--` 分隔。以下示例将 Yarn 的开发依赖参数传给底层 `yarn add`：

```sh
yarn expo install typescript -- -D
# 等价于 yarn add typescript -D
```

### 验证依赖版本

- `--check`：列出版本不匹配的包并询问是否修复；CI 环境中检查失败会返回非零退出码，适合不可变校验。
- `--fix`：自动把不匹配包改到兼容版本；需要批量对齐时使用。

```sh
npx expo install --check
npx expo install react-native expo-sms --check
npx expo install --fix
```

如果必须使用推荐表以外的自选版本，可在 package.json 的 `expo.install.exclude` 中排除相应包。支持 npm、Yarn、pnpm、Bun；默认依据锁文件选择，可用 `--npm`、`--yarn`、`--pnpm`、`--bun` 显式覆盖：

| 选择项 | 自动识别的锁文件 |
| --- | --- |
| `--npm` | `package-lock.json` |
| `--yarn` | `yarn.lock` |
| `--pnpm` | `pnpm-lock.yaml` |
| `--bun` | `bun.lock` / `bun.lockb` |

## Authentication：Expo 账户

CLI 注册 / 登录会把凭据用于给 manifest 签名，确保 OTA 更新等敏感内容在共享 runtime 中受到保护；概念上可类比 HTTPS。Expo CLI 和 EAS CLI 共用这些登录凭据：

```sh
npx expo register
npx expo login
npx expo whoami
npx expo logout
```

## Customize：显式生成配置文件

Expo CLI 能把原先在内存中生成的工具配置写到项目里，方便改用其他 bundler / 工具：

```sh
npx expo customize
```

命令会交互选择可生成的文件：

| 文件 | 用途 |
| --- | --- |
| `babel.config.js` | 使用 Expo CLI 以外的 bundler 时需要的 Babel 配置。 |
| `webpack.config.js` | Webpack Web 开发默认配置。 |
| `metro.config.js` | 通用 Metro 配置；使用 `npx react-native` 时需要。 |
| `tsconfig.json` | TypeScript 配置，并安装所需依赖。 |

## 常见环境变量

环境变量用于调整 CLI、Metro 或终端行为。表中“实验性 / 已弃用”是官方页面标记；慎重启用，仅在确有需要时使用。

| 变量 | 类型 / 状态 | 作用 |
| --- | --- | --- |
| `HTTP_PROXY` | string | 为所有网络请求设置 HTTP / HTTPS proxy。 |
| `EXPO_NO_WEB_SETUP` | boolean | 不让 CLI 在 Web 功能首次使用前强制安装 `react-dom`、`react-native-web`、`@expo/webpack-config`。 |
| `EXPO_OFFLINE` | boolean | 在适用时跳过网络请求；适合网络受限环境。 |
| `EXPO_NO_TYPESCRIPT_SETUP` | boolean | `expo start` 时不自动配置 TypeScript。 |
| `DEBUG=expo:*` / `EXPO_DEBUG` | string / boolean alias | 开启 Expo CLI 调试日志。 |
| `EXPO_PROFILE` | boolean | 采集 CLI profiling 统计，不是对 App runtime 做性能分析。 |
| `EXPO_NO_CACHE` | boolean | 禁用 Expo 全局缓存；默认可缓存 JSON schema、模拟器 Expo Go 与模板等。 |
| `CI` | boolean | 禁止交互；跳过可选提示，必需提示无法回答时失败。 |
| `EXPO_NO_TELEMETRY` | boolean | 关闭匿名遥测。 |
| `EXPO_NO_GIT_STATUS` | boolean | prebuild clean 等潜在危险操作时不提示 Git 状态。 |
| `EXPO_NO_REDIRECT_PAGE` | boolean | 不显示用于选择 Expo Go / dev client 的 redirect 选择页。 |
| `EXPO_PUBLIC_FOLDER` | string；默认 `public` | 指定 Web Metro 使用的 public 目录。 |
| `EDITOR` | string | 按 `O` 时使用的编辑器名称。 |
| `EXPO_EDITOR` | string | Expo 专用编辑器；比 `EDITOR` 优先。 |
| `EXPO_IMAGE_UTILS_NO_SHARP` | boolean | 禁用全局 Sharp CLI，改用较慢的 Jimp 图像处理（例如 prebuild 图标）。 |
| `EXPO_TUNNEL_SUBDOMAIN` | experimental；实际值是子域名 string | 指定 tunnel 子域名以测试 Universal Links；别传 `true`、`false`、`1`、`0`；可能影响 Expo Linking / Expo Go。 |
| `EXPO_METRO_NO_MAIN_FIELD_OVERRIDE` | boolean | 要求所有平台遵从 metro.config.js 的 resolver 字段；默认 Web 用 `browser`、`module`、`main`，其他平台用项目设置。 |
| `EXPO_NO_INSPECTOR_PROXY` | deprecated | 禁用改进 Chrome DevTools Protocol / network inspector 支持的代理。 |
| `EXPO_NO_CLIENT_ENV_VARS` | boolean | 阻止把 `EXPO_PUBLIC_` 环境变量编入客户端 bundle。 |
| `EXPO_NO_DOTENV` | boolean | 禁用 Expo CLI 载入所有 `.env` 文件。 |
| `EXPO_NO_METRO_LAZY` | boolean | 不给 Metro URL 增加 `lazy=true`；`metro@0.76.3` 及以上会因此失去 `import()` 支持。 |
| `EXPO_USE_TYPED_ROUTES` | boolean | 由 `expo.experiments.typedRoutes` 启用 Expo Router 静态路由类型。 |
| `EXPO_METRO_UNSTABLE_ERRORS` | deprecated | 关闭 Metro bundle 错误的反向依赖堆栈追踪；默认启用。 |
| `EXPO_USE_METRO_WORKSPACE_ROOT` | deprecated；SDK 52+ | 旧版自动把 Metro server root 切换到 workspace root。 |
| `EXPO_NO_METRO_WORKSPACE_ROOT` | SDK 52+ | 禁用 workspace root 自动发现；monorepo 可用来保留项目级 root。 |
| `EXPO_USE_UNSTABLE_DEBUGGER` | deprecated；SDK 52+ | 开启 React Native 实验版 debugger。 |
| `EXPO_ADB_USER` | string | Android 多用户设备安装 APK 时传给 ADB 的 `--user` 编号，默认 0。 |
| `EXPO_NO_TELEMETRY_DETACH` | SDK 51+ | 在 CLI 主线程发送遥测，等待事件发送会让 CLI 变慢。 |
| `EXPO_UNSTABLE_ATLAS` | experimental；SDK 51+，SDK53+ deprecated | 收集 Metro bundle 信息；后续改用 `EXPO_ATLAS`。 |
| `EXPO_ATLAS` | SDK 53+ | 开发或 export 时采集 Metro bundle 信息。 |
| `EXPO_NO_BUNDLE_SPLITTING` | experimental；SDK 51+ | Web production 下关闭异步 import 的 Metro 分块。 |
| `EXPO_USE_METRO_REQUIRE` | SDK 52+ | 使用 Expo 自定义 Metro require 与字符串模块 ID，利于调试及 React Server Components 确定性 ID；不支持旧 RAM bundles。 |
| `EXPO_UNSTABLE_METRO_OPTIMIZE_GRAPH` | experimental；SDK 52+ | 完整 bundle 生成后再对未缓存模块做转换，支持 production tree shaking；开发构建较慢。 |
| `EXPO_UNSTABLE_TREE_SHAKING` | experimental；SDK 52+ | 各平台启用实验 tree shaking。 |
| `EXPO_NO_REACT_NATIVE_WEB` | SDK 56+ deprecated | 旧实验开关：不要求 Web 项目使用 React Native Web；官方标为弃用。 |
| `EXPO_NO_DEPENDENCY_VALIDATION` | SDK 52+ | `expo install` / `expo start` 时关闭依赖版本验证。 |
| `EXPO_WEB_DEV_HYDRATE` | boolean | Web 开发启用 React hydration，便于发现 hydration 问题。 |
| `EXPO_UNSTABLE_LIVE_BINDINGS` | experimental；SDK 54+ | 控制实验 import/export live bindings；默认启用以改善循环依赖，但可能略降性能。 |
| `EXPO_UNSTABLE_LOG_BOX` | experimental；SDK 55+ | 原生 App 启用实验 LogBox；Web 默认启用。 |
| `EXPO_NO_QR_CODE` | boolean | 终端不显示二维码。 |

示例：`CI=1 npx expo install --check` 会在依赖版本过期时失败。遥测也可通过 `EXPO_NO_TELEMETRY=1` 退出。对 `DEBUG` 以外的大多数变量，`1` / `true` 通常表示开；用前应看该变量具体语义。

## 遥测

Expo 开发工具收集匿名常规使用数据，帮助判断哪些功能不稳定。此功能可选；设 `EXPO_NO_TELEMETRY=1` 关闭。

## 新手名词解释

- **CLI：**Command-Line Interface，命令行接口；用文字命令启动、构建、检查项目。
- **Metro：**React Native / Expo 的 JS bundler 与开发服务器，负责解析依赖、转换代码并向 App 提供 bundle。
- **Expo Go：**预先编译并包含一组原生库的通用客户端，适合快速开始；没有的自定义原生模块需要 development build。
- **Development build：**包含当前项目原生模块的自有开发版 App。JS 可热刷新，但原生依赖变化仍需重编译安装。
- **Prebuild / CNG：**Continuous Native Generation；把 app config 与插件转换成 iOS / Android 原生目录。
- **Bundle / export：**把 JavaScript 依赖打包成可分发文件；Web 项目也会生成可托管的静态资源。
- **Tunnel：**经公共代理把设备流量转发到本机 dev server；可以解决网络隔离，但速度较慢且 URL 可被联网设备访问。
- **Deep link：**用 URL scheme 或 Universal Link 指向 App 页面。Expo CLI 的 open endpoint 会返回设备应打开的链接。
- **Variant / scheme：**Android variant 选择 Gradle 构建类型与 flavor；iOS scheme 选择 Xcode 的 target / 构建方案。
- **Manifest 签名：**为 Expo Go 等共享 runtime 中的更新数据提供签名验证，避免把任意远端内容当作可信项目配置。
- **Environment variable：**由启动 shell 注入进 CLI 的键值配置，通常可临时覆盖默认行为；含 `EXPO_PUBLIC_` 的变量可能会被打包进客户端。

## 源页代码与命令主题覆盖

本页按主题覆盖官方页面列出的命令、配置与输出示例：查看 CLI / 子命令帮助及输出、安装 `expo`、启动开发服务、切换 Expo Go / dev client、强制代理 URL、安装并启动 tunnel、离线启动、Open endpoint 的两类 GET JSON 与三条 curl 请求、iOS / Android 本机构建、Android 三种 variant、Android Studio / flavor 与 app id、iOS Release / Xcode / generic Simulator / build 输出 / output 目录、Metro export、子路径 baseUrl 配置、Expo Router Link 和导出 HTML、require 图片与导出 URL、手动静态图片 URL、已弃用 Webpack export、prebuild、lint 与参数传递、config 与配置类型、依赖安装 / 包管理器透传 / check / fix、账户认证、customize 和 CI / telemetry 环境变量示例。命令参数、Open endpoint 状态码、export 选项及官方列出的 41 个环境变量均另有解释表。

**翻页：**[上一页：Expo Structured Field Values 结构化字段值](./237-Expo-Structured-Field-Values.md) · [目录](./README.md) · [下一页：create-expo-app 创建项目](./239-Create-Expo-App.md)

