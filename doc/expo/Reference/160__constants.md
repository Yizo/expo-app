# Expo Constants 学习指南

`expo-constants` 是 Expo 提供的系统信息 API，用于读取在一次应用安装生命周期内保持稳定的应用、设备和运行环境信息。

> 原文档更新时间：2026 年 1 月 15 日。  
> 当前页面描述的是“下一版本 SDK”的未发布文档。原文明确指出，稳定版本文档为 SDK 56。使用时应确认项目实际采用的 Expo SDK 版本。

## 文档解决的问题

这篇文档主要说明：

- 如何安装和导入 `expo-constants`
- 可以读取哪些应用配置、原生构建信息和运行环境信息
- Android、iOS、Web、tvOS 之间有哪些平台差异
- 如何判断 JavaScript 当前运行在 Expo Go、开发构建、独立应用还是裸 React Native 工程中
- 哪些旧 API 已废弃，以及应迁移到什么模块

它适合需要完成以下工作的开发者：

- 在运行时读取 `app.json` 或 `app.config.js` 中的 Expo 配置
- 判断应用当前的执行环境
- 获取运行会话 ID、状态栏默认高度或系统字体
- 区分原生二进制中的构建版本与可远程更新的 Expo 配置
- 维护同时运行于 Android、iOS、Web 或 tvOS 的 Expo 项目

它不是设备信息的通用入口。设备型号、操作系统版本、设备类型等能力已经逐步迁移到 `expo-device`。

## React Web 开发者需要先理解的背景

### Expo 与 React Native

React Native 使用 React 编写界面，但最终运行的是原生 Android 或 iOS 应用，而不是浏览器页面。

Expo 在 React Native 之上提供了：

- 原生能力封装
- 项目配置系统
- 构建和发布工具
- Expo Go 调试容器
- EAS Build、EAS Update 等云服务

因此，移动端应用除了 JavaScript 代码，还有原生二进制、应用商店构建版本和原生配置。

### Expo Go、开发构建与独立应用

- **Expo Go**：预先安装好的通用 Expo 客户端，可以加载项目的 JavaScript 代码。
- **开发构建（development build）**：为特定项目生成的开发客户端，可以包含项目需要的原生模块。
- **独立应用（standalone app）**：可以作为正式产品安装或发布的应用。
- **裸 React Native 工程（bare app）**：项目包含并直接维护 `android`、`ios` 原生工程目录。

这类似于 React Web 项目在浏览器开发服务器、定制测试环境和正式部署环境中运行，但移动端还需要区分承载 JavaScript 的原生二进制。

### 原生二进制与远程清单

移动应用包含一个安装到设备上的原生二进制。Expo Updates 还可以在兼容的原生二进制中远程更新 JavaScript 和资源。

因此，以下信息可能不同：

- 编译进原生二进制的构建版本
- 当前远程清单中的 Expo 配置

这种区别在 Web 开发中不太常见。Web 应用通常部署后整体替换静态资源，不需要同时考虑“设备上原生壳的版本”和“远程 JavaScript 更新版本”。

## 安装

根据项目使用的包管理器执行对应命令：

```sh
# npm
npx expo install expo-constants

# yarn
yarn expo install expo-constants

# pnpm
pnpm expo install expo-constants

# bun
bun expo install expo-constants
```

`expo install` 会根据当前 Expo SDK 选择兼容的依赖版本。它并不只是 `npm install` 的别名。

如果是在已有的裸 React Native 项目中安装，还必须先按照 Expo 文档为工程安装并配置 `expo` 模块。仅安装 `expo-constants` 不足以让原生工程具备 Expo Modules 支持。

## 导入方式

```js
import Constants from 'expo-constants';
```

`Constants` 是默认导出对象，后续通过它读取配置和系统常量，例如：

```js
const config = Constants.expoConfig;
const environment = Constants.executionEnvironment;
```

具体属性是否存在以及返回值是否为 `null`，取决于平台和运行环境。

## 核心信息分类

### Expo 配置信息

#### `Constants.expoConfig`

类型：

```ts
ExpoConfig & { hostUri: string } | null
```

它表示定义在以下文件中的标准 Expo 配置：

- `app.json`
- `app.config.js`

无论使用旧版还是现代 manifest，也无论 manifest 是嵌入二进制还是远程获取，都应通过 `Constants.expoConfig` 读取 Expo 配置。

例如，可从中读取应用名称或 `extra` 自定义配置：

```js
import Constants from 'expo-constants';

const appName = Constants.expoConfig?.name;
const apiUrl = Constants.expoConfig?.extra?.apiUrl;
```

访问前应处理 `null`，尤其是在跨平台代码或测试环境中。

#### `Constants.manifest2`

类型：

```ts
ExpoUpdatesManifest | null
```

这是使用现代 Expo Updates、EAS Update 等远程更新机制时的 manifest。

原文明确要求：如果目的是读取 Expo 配置对象，应使用 `Constants.expoConfig`，不要从 `manifest2` 中自行寻找或拼装配置。

#### `Constants.expoGoConfig`

类型：

```ts
ManifestsExpoGoConfig | null
```

仅在 Expo Go 环境中提供 Expo Go 配置。代码不能假设独立应用或 Web 环境中一定存在该值。

#### `Constants.easConfig`

类型：

```ts
ManifestsEASConfig | null
```

使用 EAS 时填充的标准 EAS 配置对象。

### 运行环境

#### `Constants.executionEnvironment`

该属性用于判断应用的 JavaScript bundle 当前运行在哪里。

可能的值来自 `ExecutionEnvironment` 枚举：

| 枚举值 | 字符串值 | 含义 |
| --- | --- | --- |
| `ExecutionEnvironment.Bare` | `"bare"` | 运行在由开发者直接维护原生目录的裸 React Native 工程中 |
| `ExecutionEnvironment.Standalone` | `"standalone"` | 使用或不使用 EAS Build 创建的生产或发布构建 |
| `ExecutionEnvironment.StoreClient` | `"storeClient"` | 运行在 Expo Go 或通过 `expo-dev-client` 构建的开发客户端中 |

示例：

```js
import Constants, { ExecutionEnvironment } from 'expo-constants';

if (
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient
) {
  // 当前运行于 Expo Go 或 development build
}
```

需要注意，`StoreClient` 同时包含 Expo Go 和开发构建。仅判断该值不能进一步区分两者。

#### `Constants.appOwnership`

类型：

```ts
AppOwnership | null
```

该属性已经废弃，应改用 `Constants.executionEnvironment`。

旧枚举仅定义了：

```ts
AppOwnership.Expo = 'expo';
```

当应用运行于 Expo Go 时，旧属性返回 `"expo"`；其他情况下返回 `null`。它表达的信息有限，不适合继续作为环境判断依据。

#### `Constants.expoVersion`

类型：

```ts
string | null
```

表示当前承载项目的 Expo Go 应用版本。

在以下环境中返回 `null`：

- 裸 React Native 工程
- Web

它不是业务应用自身的版本号。

#### `Constants.expoRuntimeVersion`

类型：

```ts
string | null
```

表示 Expo runtime version。原文只明确说明它在 Web 上可能为 `null`，没有进一步解释其匹配或更新规则。

### 调试、会话与后台状态

#### `Constants.debugMode`

应用运行在 `__DEV__` 调试模式时为 `true`，否则为 `false`。

它反映 React Native 的开发模式，不应被理解为业务中的测试环境标记。

#### `Constants.sessionId`

当前应用会话的唯一字符串：

- 不同应用之间不同
- 同一应用多次启动之间也不同

它适合标记一次应用启动会话，但不是稳定的设备 ID、用户 ID或安装 ID。

#### `Constants.isHeadless`

应用运行于 headless 模式时返回 `true`。

Headless 模式通常表示 JavaScript 在没有可见应用界面的情况下执行，例如原生系统触发后台任务。原文没有提供具体使用流程。

### 原生界面与设备相关信息

#### `Constants.statusBarHeight`

返回设备状态栏的默认高度。

该值不会考虑以下动态变化：

- 正在使用定位时的状态栏变化
- 通话进行时的状态栏变化

因此它不是实时安全区域或实时状态栏布局信息。

**基于文档内容推导：** 不应仅依赖该值处理所有顶部安全区域布局，因为文档明确指出它不反映部分动态状态。

#### `Constants.systemFonts`

返回当前设备可用的系统字体名称数组：

```ts
string[]
```

不同平台和设备的结果可能不同。业务代码不应假定所有设备都拥有同一组字体。

#### `Constants.deviceName`

可选字符串，表示便于人类阅读的设备类型名称。由于属性本身是可选的，使用前需要进行缺失值处理。

#### `Constants.getWebViewUserAgentAsync()`

异步获取该设备上 WebView 发起请求时可能携带的 User-Agent：

```ts
const userAgent = await Constants.getWebViewUserAgentAsync();
```

返回类型：

```ts
Promise<string | null>
```

WebView 是原生应用内嵌的网页浏览容器，作用类似应用内部的小型浏览器。

文档特别指出，该 User-Agent 很可能不同于 JavaScript `fetch` 请求使用的 User-Agent。不能读取它之后就假设所有网络请求都会发送相同标识。

### 链接和地址相关属性

`NativeConstants` 还声明了以下字符串属性：

- `experienceUrl`
- `linkingUri`
- 可选的 `intentUri`

原文没有提供这些属性的具体语义、格式或使用示例，因此当前文档不足以支持进一步说明。实际使用前需要查阅对应的 Linking 或 manifest 文档。

### 其他缺少说明的属性

以下属性在类型中出现，但原文没有解释具体语义：

- `isDetached`
- `systemVersion`
- `PlatformManifest.detach`
- `PlatformManifest.developer`
- `PlatformManifest.hostUri`
- `PlatformManifest.scheme`

不能仅根据属性名推断其业务含义。

## 平台原生 Manifest

### `PlatformManifest`

`Constants.platform` 是特定平台的 manifest 对象，可能包含：

```ts
{
  android?: AndroidManifest;
  ios?: IOSManifest;
  web?: WebManifest;
  detach?: { scheme: string };
  developer?: string;
  hostUri?: string;
  scheme?: string;
}
```

文档强调，平台 manifest 与 `manifest`、`manifest2` 是不同概念。

- `platform`：平台特有的 manifest 信息
- `manifest2`：现代 Expo Updates 的远程 manifest
- `expoConfig`：标准 Expo 配置对象

如果只是读取 `app.json` 或 `app.config.js` 配置，应优先使用 `expoConfig`。

### Android Manifest

`AndroidManifest` 是一个可包含任意键值的记录，并额外声明了 `versionCode`：

```ts
versionCode: number
```

该属性已经废弃，应改用：

```js
Application.nativeBuildVersion
```

它来自 `expo-application` 模块。

`versionCode` 对应 `app.json` 中的：

```json
{
  "expo": {
    "android": {
      "versionCode": 1
    }
  }
}
```

在 Expo Go 中，其值为 `null`。原因是项目运行在 Expo Go 的原生容器中，并没有属于当前业务应用的独立 Android 原生构建版本。

### iOS Manifest

#### `buildNumber`

类型：

```ts
string | null
```

它读取当前原生应用二进制 `Info.plist` 中 `CFBundleVersion` 的值。独立应用可以通过以下配置设置：

```json
{
  "expo": {
    "ios": {
      "buildNumber": "1"
    }
  }
}
```

在 Expo Go 中返回 `null`。

`Constants.platform.ios.buildNumber` 可能不同于：

```js
Constants.expoConfig?.ios?.buildNumber
```

原因是：

- `platform.ios.buildNumber` 来自已安装的原生二进制，在该二进制的生命周期中不会变化
- `expoConfig.ios.buildNumber` 来自 manifest，而 manifest 可以通过更新发生变化

这是文档中最重要的版本信息区别之一。判断当前实际安装的原生构建版本时，不应把可更新配置中的值当成二进制真实值。

#### 已废弃的设备信息

以下 iOS Manifest 属性均已废弃：

| 旧属性 | 含义 | 替代 API |
| --- | --- | --- |
| `model` | 可读设备型号，例如 `"iPhone 7 Plus"` | `Device.modelName` |
| `platform` | Apple 内部设备型号，例如 `iPhone1,1` | `Device.modelId` |
| `systemVersion` | iOS 系统版本，例如 `10.3` | `Device.osVersion` |
| `userInterfaceIdiom` | iPhone、iPad、Mac、Apple TV 等设备类别 | `Device.getDeviceTypeAsync()` |

这些替代能力位于 `expo-device` 模块。

### Web Manifest

`WebManifest` 的类型是：

```ts
Record<string, any>
```

原文没有列出固定字段，也没有提供使用示例。

这意味着当前页面只声明了该对象可能存在，并未给出可依赖的稳定字段契约。不要根据 Android 或 iOS 的字段结构推测 Web Manifest。

## `UserInterfaceIdiom` 设备界面类型

该枚举描述当前设备适合使用的界面类别：

| 枚举值 | 字符串值 | 含义 |
| --- | --- | --- |
| `Desktop` | `"desktop"` | 桌面设备 |
| `Handset` | `"handset"` | 手机 |
| `Tablet` | `"tablet"` | 平板 |
| `TV` | `"tv"` | 电视 |
| `Unsupported` | `"unsupported"` | 当前不支持的类别 |

CarPlay 会被识别为 `"unsupported"`。

虽然该枚举仍在文档中定义，但 `IOSManifest.userInterfaceIdiom` 已废弃。获取设备类型应使用 `expo-device` 的 `Device.getDeviceTypeAsync()`。

## 其他导出类型

文档还列出了以下类型，它们主要是 manifest 模块相关类型的重新导出：

- `ClientScopingConfig`
- `EASConfig`
- `ExpoGoConfig`
- `ExpoGoPackagerOpts`
- `Manifest`
- `ManifestAsset`
- `ManifestExtra`

这些类型支持 Android、iOS、tvOS 和 Web，但当前页面未展开其字段定义，而是链接到 manifests 文档。

如果需要在 TypeScript 中精确处理这些对象，应继续查阅对应的 manifests 类型文档，不能从本页推断完整结构。

## 容易踩坑的地方

### 1. 当前页面不是稳定 SDK 文档

原文明确说明，该页面对应下一版本 SDK；稳定版本是 SDK 56。

项目开发时应以项目安装的 Expo SDK 版本为准。未发布版本中的类型或行为可能与稳定版本不同。

### 2. “安装期间保持不变”不代表所有字段永久不变

模块的目标是提供在一次应用安装生命周期内稳定的信息，但其中也包含：

- 每次启动都会变化的 `sessionId`
- 可来自远程 manifest 的 `expoConfig`
- 仅在特定运行环境存在的 Expo Go 或 EAS 配置

应按照每个属性的具体说明判断稳定性，不能把模块名称理解成“所有返回值永远不变”。

### 3. Expo Go 不等于业务应用自己的原生二进制

在 Expo Go 中：

- Android `versionCode` 为 `null`
- iOS `buildNumber` 为 `null`
- `expoVersion` 表示 Expo Go 自身版本

这与 React Web 在浏览器中运行有一定相似性：浏览器版本不是网站版本。同样，Expo Go 的原生版本也不是业务应用的原生构建版本。

### 4. 配置版本和原生构建版本可能不同

manifest 可以更新，已安装的原生二进制不会因此自动改变。读取版本号前必须先确定需要的是：

- 当前配置声明的值
- 当前实际安装二进制中的值

### 5. 不要继续依赖废弃 API

文档明确给出的迁移方向包括：

- `appOwnership` → `executionEnvironment`
- Android `versionCode` → `expo-application` 的 `Application.nativeBuildVersion`
- 设备型号和系统信息 → `expo-device`

废弃 API 可能暂时可用，但不适合作为新代码的基础。

### 6. 平台和环境差异必须显式处理

许多属性具有以下特征：

- 只支持某个平台
- 类型允许 `null`
- 属性本身可选
- 在 Expo Go、Web 或裸工程中行为不同

跨平台代码应使用可选链、空值处理和环境判断：

```js
const buildNumber = Constants.platform?.ios?.buildNumber ?? null;
```

### 7. `statusBarHeight` 不是实时安全区域

该值只是默认状态栏高度，不包含定位和通话等动态变化。它不应被当作所有设备、所有状态下都准确的顶部布局偏移量。

### 8. `ExecutionEnvironment.StoreClient` 范围比 Expo Go 更大

它既表示 Expo Go，也表示通过 `expo-dev-client` 创建的开发构建。将它直接命名为 `isExpoGo` 会产生错误语义。

## 实际开发中的使用方式

### 读取自定义运行配置

可以在 Expo 配置中定义业务参数：

```js
// app.config.js
export default {
  expo: {
    extra: {
      apiBaseUrl: 'https://api.example.com',
    },
  },
};
```

运行时读取：

```js
import Constants from 'expo-constants';

const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl;

if (typeof apiBaseUrl !== 'string') {
  throw new Error('Missing Expo config: extra.apiBaseUrl');
}
```

**基于经验建议：** 对必要配置进行运行时校验，不要让缺失值在业务深处才表现为网络请求错误。

### 按运行环境启用开发功能

```js
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isStoreClient =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
```

**基于文档内容推导：** 如果功能只支持 Expo Go，不能仅凭 `StoreClient` 判断，因为开发构建也属于该环境。还需要使用文档明确提供的其他信息，例如检查 `expoGoConfig` 是否存在，但当前文档没有将其定义为正式的 Expo Go 判断流程。

### 标记一次应用启动会话

```js
const telemetryContext = {
  sessionId: Constants.sessionId,
  executionEnvironment: Constants.executionEnvironment,
};
```

`sessionId` 可用于关联同一次启动中的日志和事件，但不能替代用户账号或设备标识。

### 读取原生构建版本

新代码应通过 `expo-application` 读取原生构建版本，而不是使用已废弃的 Android `versionCode`。

**基于文档内容推导：** iOS 原生构建版本同样需要关注“原生二进制值”和“Expo 配置值”的区别；本页只明确给出了 Android 废弃属性的替代 API。

## 文档未涉及的内容

当前文档没有提供以下内容：

- `expo-constants` 的完整运行示例
- EAS Build 和 EAS Update 的配置流程
- runtime version 的匹配规则
- Linking URI 的格式和使用方式
- Web Manifest 的固定字段
- Headless 模式的启动和配置方法
- `expo-device`、`expo-application` 的安装及完整 API
- 如何区分 Expo Go 与 `expo-dev-client` 开发构建的官方完整流程
- 各属性在单元测试环境中的模拟方式
- Android、iOS 原生工程如何生成相应配置文件

需要这些能力时，应查阅对应模块或专题文档，不能根据本页内容自行推断。

## 明确信息与推导结论

### 文档明确说明

- `expo-constants` 提供应用安装生命周期中的稳定系统信息
- 模块支持 Android、iOS、tvOS、Web，并包含在 Expo Go 中
- 裸 React Native 工程需要先安装 Expo Modules 支持
- `expoConfig` 是读取标准 Expo 配置的入口
- `manifest2` 不应作为读取 Expo 配置的首选入口
- `executionEnvironment` 用于识别 JavaScript 的运行环境
- Expo Go 中 Android `versionCode` 和 iOS `buildNumber` 为 `null`
- iOS 原生 `buildNumber` 可能与 manifest 配置值不同
- 多个设备信息 API 已迁移到 `expo-device`
- Android 原生构建版本应通过 `expo-application` 获取
- `statusBarHeight` 不反映定位和通话造成的动态变化
- WebView User-Agent 可能不同于 JavaScript `fetch` 的 User-Agent

### 基于文档内容推导

- 读取字段前应同时考虑平台、执行环境、可选属性和 `null`
- 需要原生真实版本时，不能依赖可能被远程更新的 manifest 配置
- `sessionId` 适合关联单次启动数据，不适合作为持久身份标识
- `StoreClient` 不能直接等同于 Expo Go
- `statusBarHeight` 不适合作为完整的动态安全区域解决方案
- 未提供字段说明的 manifest 属性不应作为稳定业务契约使用

## 总结

`expo-constants` 的主要价值不是提供普通 JavaScript 常量，而是在运行时连接三个层面的信息：

1. Expo 配置，如 `app.json` 和 `app.config.js`
2. 当前原生二进制及设备环境
3. Expo Go、开发构建、独立应用和裸工程等执行环境

对 React Web 开发者而言，最关键的是理解：移动端 JavaScript 运行在一个原生容器中，原生二进制、远程更新配置和当前 JavaScript 会话是不同层次的数据。

实际使用时，应优先采用 `expoConfig` 和 `executionEnvironment` 等推荐入口，处理好平台差异与空值，并将已经废弃的设备、系统和构建版本 API 迁移到 `expo-device` 或 `expo-application`。

---

## 文档导航

- **上一页**：[clipboard](./159__clipboard.md)
- **下一页**：[contacts](./161__contacts.md)
