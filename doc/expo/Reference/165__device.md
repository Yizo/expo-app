# Expo Device 学习指南

`expo-device` 是 Expo 提供的跨平台设备信息库，用于读取当前设备的厂商、型号、操作系统、设备类型、内存、CPU 架构等系统信息。

> 本文对应 **下一版本 Expo SDK** 的文档，而不是当前稳定版本。原文指出，当前最新稳定版本为 **SDK 56**。实际项目应优先查阅与项目 Expo SDK 版本匹配的文档。

## 文档解决的问题

在 React Web 中，浏览器通常只提供有限且经过隐私保护的设备信息。React Native 应用运行在原生系统中，因此可以通过原生 API 获得更多硬件和操作系统信息。

`expo-device` 主要用于解决以下问题：

- 判断应用运行在真机还是模拟器中。
- 获取设备厂商、品牌和具体型号。
- 识别手机、平板、电视或桌面设备。
- 获取操作系统名称、版本和构建编号。
- 获取设备总内存和支持的 CPU 架构。
- 查询 Android 系统提供的硬件或软件能力。
- 实验性地检测设备是否 Root 或越狱。
- 检查 Android 是否允许应用请求安装其他安装包。

它适合以下场景：

- 调试和问题上报时收集设备环境信息。
- 根据设备类型调整界面布局。
- 分析某些问题是否集中出现在特定设备或系统版本。
- 在 Android 上检查特定硬件或系统能力。
- 在开发环境中区分真机和模拟器。
- 为性能策略提供设备等级参考信息。

它不应被理解为可靠的设备身份识别工具。文档没有说明这些字段可以作为唯一设备标识，也没有提供稳定的设备 ID。

## 阅读前需要理解的概念

### Expo 模块

Expo 模块可以理解为连接 JavaScript 与 iOS、Android 原生 API 的封装库。开发者通过 JavaScript 调用 `expo-device`，底层实际可能读取 Android `Build` 信息或 iOS 系统接口。

这与 React Web 中调用浏览器 API 类似，但原生系统存在更明显的平台差异和权限限制。

### 真机、模拟器与虚拟设备

- **真机**：实际的手机、平板或电视设备。
- **iOS Simulator**：在 macOS 上模拟 iOS 环境。
- **Android Emulator**：Android 虚拟设备。
- **Expo Go**：预装了常用 Expo 原生模块的开发客户端，`expo-device` 已被包含在其中。

模拟器适合开发，但某些硬件信息、设备能力和安全检测结果可能与真机不同。

### 常量与异步方法

该库提供两种主要 API：

- `Device.modelName` 这样的常量可以直接读取。
- `Device.getUptimeAsync()` 这样的方法返回 `Promise`，需要使用 `await`。

这类似于 Web 中同步读取 `navigator.userAgent` 与异步调用浏览器 API 的区别。

## 安装

根据项目使用的包管理器执行对应命令：

```sh
# npm
npx expo install expo-device

# yarn
yarn expo install expo-device

# pnpm
pnpm expo install expo-device

# bun
bun expo install expo-device
```

`expo install` 不只是普通的依赖安装命令，它会尽量选择与当前 Expo SDK 兼容的包版本。

如果项目是已有的纯 React Native 原生工程，还必须先按照 Expo 文档安装并配置 `expo`，否则无法直接使用这个 Expo 模块。

当前文档没有涉及：

- iOS Pod 安装的具体步骤。
- Android Gradle 配置细节。
- Expo 项目的创建流程。
- EAS Build 或应用商店发布流程。

## 基本用法

```jsx
import { Text, View } from 'react-native';
import * as Device from 'expo-device';

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>
        {Device.manufacturer}: {Device.modelName}
      </Text>
    </View>
  );
}
```

`react-native` 中的 `View` 和 `Text` 分别承担类似 Web 中容器元素和文本元素的职责，但它们不是 DOM 节点。

库采用命名空间方式导入：

```js
import * as Device from 'expo-device';
```

之后可以通过 `Device.manufacturer`、`Device.modelName` 等属性读取信息。

由于大量字段的类型包含 `null`，实际渲染时应提供降级内容：

```jsx
<Text>
  {Device.manufacturer ?? '未知厂商'}: {Device.modelName ?? '未知型号'}
</Text>
```

## 设备基本信息

### 品牌、厂商与产品信息

这些字段名称相近，但含义不同：

| API | 含义 | 主要平台 |
| --- | --- | --- |
| `Device.brand` | 面向消费者展示的硬件品牌 | Android、iOS |
| `Device.manufacturer` | 实际设备制造商 | Android、iOS、tvOS、Web |
| `Device.productName` | Android 设备实现者定义的产品名或开发代号 | Android |
| `Device.designName` | Android 生产设计阶段使用的设备名称 | Android |

示例：

```js
Device.brand;
// Android: "google"、"xiaomi"
// iOS: "Apple"
// Web: null

Device.manufacturer;
// Android: "Google"、"xiaomi"
// iOS: "Apple"
// Web: "Google" 或 null

Device.productName;
// Android: "kminiltexx"

Device.designName;
// Android: "kminilte"
```

`brand` 和 `manufacturer` 不能简单视为同一个字段。在 Android 上，它们直接对应不同的系统构建信息。

Web 上的支持尤其有限：

- `brand` 永远是 `null`。
- `designName` 和 `productName` 永远是 `null`。
- `manufacturer` 可能有值，也可能为 `null`。

### 用户设备名称

```js
Device.deviceName;
// "Vivian's iPhone XS"
```

`deviceName` 是用户可读、并且可能由用户设置的设备名称。无法获取时会返回 `null`，Web 上尤其容易出现这种情况。

#### iOS 16 及以上的限制

从 iOS 16 开始，如果应用没有添加正确的 entitlement，读取结果将只是通用名称 `"iPhone"`，而不是用户设置的具体名称。

**Entitlement** 可以理解为 iOS 原生工程声明的特殊系统能力授权。它不是普通 JavaScript 配置，也不等同于浏览器权限弹窗。

因此，即使代码调用成功，也不代表一定能获得具体设备名。需要按照 Expo 的 iOS Capabilities 文档为原生应用添加对应能力。

### 型号名称与内部型号 ID

```js
Device.modelName;
// Android: "Pixel 2"
// iOS: "iPhone XS Max"
// Web: "iPhone" 或 null

Device.modelId;
// iOS: "iPhone7,2"
// Android、Web: null
```

两者区别如下：

- `modelName` 是面向用户的型号名称。
- `modelId` 是 iOS 内部使用的程序化型号标识，不适合直接显示给用户。

文档将 `modelId` 的类型标为 `any`，但示例展示的是字符串。使用时不应未经检查就假定它始终是字符串。

## 设备类型

可以通过同步常量读取：

```js
Device.deviceType;
```

也可以通过异步方法读取：

```js
const type = await Device.getDeviceTypeAsync();
```

两者的结果都使用 `DeviceType` 枚举：

| 枚举值 | 数值 | 含义 |
| --- | ---: | --- |
| `DeviceType.UNKNOWN` | `0` | 无法识别 |
| `DeviceType.PHONE` | `1` | 手机 |
| `DeviceType.TABLET` | `2` | 平板 |
| `DeviceType.DESKTOP` | `3` | 桌面或笔记本电脑 |
| `DeviceType.TV` | `4` | 电视界面设备 |

### Android 判断并不完全可靠

除电视外，Android 主要根据屏幕对角线尺寸推断设备类型：

- 3 到 6.9 英寸：`PHONE`
- 7 到 18 英寸：`TABLET`
- 其他尺寸：`UNKNOWN`

因此，设备类型是推断结果，不是绝对可靠的硬件分类。折叠屏、特殊终端和尺寸异常的设备可能被错误分类。

**基于文档内容推导：** 可以使用该字段决定默认布局，但不应把它作为唯一布局条件。React Native 界面仍应根据实际窗口尺寸进行响应式适配。

## 真机判断

```js
Device.isDevice;
```

- 真机返回 `true`。
- iOS 模拟器或 Android 模拟器返回 `false`。
- Web 上始终返回 `true`。

Web 上的结果只是固定行为，不能据此证明网页运行在真实移动设备中。

典型用途包括：

```js
if (!Device.isDevice) {
  console.log('当前运行在模拟器中');
}
```

它适合开发和诊断逻辑，不适合作为安全验证机制。

## 设备年代、内存与 CPU

### 设备年代等级

```js
Device.deviceYearClass;
```

该字段返回设备的 year class，Web 上始终为 `null`。它表示设备大致所属的性能年代等级，而不是购买年份或生产日期。

**基于文档内容推导：** 该值可作为性能降级策略的参考，例如在较旧设备上减少动画或计算量，但文档没有给出具体的分级阈值。

### 总内存

```js
Device.totalMemory;
// 17179869184
```

单位是字节。它表示内核可访问的总内存，大致对应设备 RAM，但不包括某些内核以下的固定内存分配。

需要特别注意：

- 它不代表当前剩余内存。
- 它不代表单个应用可以使用的内存上限。
- Web 上始终为 `null`。

### Android Java VM 内存上限

```js
const maxMemory = await Device.getMaxMemoryAsync();
// 402653184
```

此方法只支持 Android，返回 Java VM 尝试使用的最大内存，单位也是字节。如果系统没有固有限制，则返回 `Number.MAX_SAFE_INTEGER`。

`totalMemory` 与 `getMaxMemoryAsync()` 不能互换：

- `totalMemory` 描述整个设备的大致 RAM。
- `getMaxMemoryAsync()` 描述 Android Java VM 的内存上限。

### CPU 架构

```js
Device.supportedCpuArchitectures;
// ['arm64-v8a', 'armeabi-v7a']
```

该字段表示设备能够运行哪些 CPU 架构编译的二进制程序。无法确定时返回 `null`，Web 上尤其如此。

对于只编写 JavaScript 的开发者，这通常不影响普通业务代码；但当项目包含原生模块、预编译二进制库或特定架构构建产物时，它会直接影响兼容性。

## 操作系统信息

### 系统名称

```js
Device.osName;
```

可能的结果包括：

- Android：`"Android"`，也可能是完整构建指纹。
- iOS：`"iOS"` 或 `"iPadOS"`。
- Web：可能为 `"iOS"`、`"Android"` 或 `"Windows"`。

Android 上该字段直接映射到 `Build.VERSION.BASE_OS`。部分厂商设备并不会返回简单的 `"Android"`，例如可能返回很长的系统构建字符串。

因此，不要这样判断平台：

```js
// 不可靠
if (Device.osName === 'Android') {
  // ...
}
```

如果目标是区分 React Native 运行平台，应使用：

```js
import { Platform } from 'react-native';

if (Platform.OS === 'android') {
  // Android 平台逻辑
}
```

这是本文最重要的平台判断注意事项之一。

### 系统版本

```js
Device.osVersion;
// Android: "4.0.3"
// iOS: "12.3.1"
// Web: "11.0" 或 "8.1.0"
```

版本字符串不保证始终由三个点分数字组成。因此，不应依赖简单字符串拆分后必然得到三个部分，也不应直接按字符串大小比较版本：

```js
// "10.0" 与 "9.0" 的字符串比较可能不符合版本语义
Device.osVersion > '9.0';
```

文档没有提供系统版本比较工具。

### 构建编号

`expo-device` 提供多个容易混淆的构建字段：

| API | Android 对应信息 | iOS 对应信息 | Web |
| --- | --- | --- | --- |
| `osBuildFingerprint` | 当前系统构建的完整唯一描述字符串 | `null` | `null` |
| `osBuildId` | `Build.DISPLAY` | `kern.osversion` | `null` |
| `osInternalBuildId` | `Build.ID` | 与 `osBuildId` 相同 | `null` |

示例：

```js
Device.osBuildFingerprint;
// "google/sdk_gphone_x86/generic_x86:9/...:user/release-keys"

Device.osBuildId;
// Android: "PSR1.180720.075"
// iOS: "16F203"

Device.osInternalBuildId;
// Android: "MMB29K"
// iOS: "16F203"
```

这些字段比 `osVersion` 更精确，适合诊断特定系统构建版本的问题，但通常不适合直接展示给普通用户。

### Android API Level

```js
Device.platformApiLevel;
// Android: 19
// iOS、Web: null
```

API Level 是 Android SDK 的整数版本标识。设备安装系统更新后，该值可能提高；在一次开机期间不会变化。

它与人类可读的 Android 版本号不是同一种值。开发中判断某项 Android 系统 API 是否可用时，API Level 通常比版本名称更直接。

## Android 平台能力检查

### 获取所有系统能力

```js
const features = await Device.getPlatformFeaturesAsync();
```

返回 Android 系统声明的硬件和软件能力名称：

```js
[
  'android.software.adoptable_storage',
  'android.software.backup',
  'android.hardware.sensor.accelerometer',
  'android.hardware.touchscreen',
]
```

这些字符串是 Android 平台定义的能力名称，不是 Expo 自行设计的跨平台枚举。

在 iOS 和 Web 上，该方法始终解析为空数组。

### 检查指定能力

```js
const hasFeature = await Device.hasPlatformFeatureAsync(
  'amazon.hardware.fire_tv'
);
```

Android 上返回设备是否具备指定系统能力；iOS 和 Web 上始终返回 `false`。

原文参数说明中提到可以通过 `Device.getSystemFeatureAsync()` 获取全部能力，但当前页面实际列出的 API 是 `Device.getPlatformFeaturesAsync()`。两处命名不一致，使用时应以当前 API 列表和实际 TypeScript 类型定义为准。

**基于经验建议：** 能力字符串拼写错误通常只会得到 `false`，因此应使用 Android 官方文档定义的常量值，避免自行拼写未经确认的名称。

## 设备运行时长

```js
const uptime = await Device.getUptimeAsync();
// 4371054
```

该方法支持 Android 和 iOS，返回设备自上次重启以来的毫秒数。

Android 不会把深度睡眠时间计入运行时长，因此不同平台的值不能完全按同一种语义比较。

该值不是：

- 应用运行时长。
- 用户使用应用的时长。
- 设备首次启用后的总时长。

## Root 与越狱检测

```js
const rooted = await Device.isRootedExperimentalAsync();
```

该方法尝试判断：

- Android 是否 Root。
- iOS 是否越狱。

但文档明确警告：这个方法是实验性的，并不完全可靠。

### 不可靠的原因

Android 的实现会搜索可能包含 `"su"` 可执行文件的路径，但：

- 未 Root 的设备也可能存在该文件。
- Root 环境可能隐藏这些文件。
- 检测逻辑可能被逆向和绕过。

iOS 使用一组越狱检查，但某些闭源工具会拦截系统调用，从而隐藏越狱状态。

Web 上始终返回 `false`，即使底层设备实际已被 Root。

因此，该结果可能同时存在：

- 误报：正常设备被判断为 Root 或越狱。
- 漏报：Root 或越狱设备未被检测出来。

**基于文档内容推导：** 不能仅凭这个结果执行不可恢复的账户封禁、资金冻结或永久拒绝服务。它最多只能作为风险信号之一。

调用过程中如果无法读取某些系统文件，可能抛出：

| 错误码 | 含义 |
| --- | --- |
| `ERR_DEVICE_ROOT_DETECTION` | Root 检测无法读取特定系统文件 |

因此需要处理异常，而不能只处理布尔结果：

```js
try {
  const rooted = await Device.isRootedExperimentalAsync();
  // 将 rooted 作为非绝对性的风险信号
} catch (error) {
  // 检测失败不等于设备已 Root
}
```

## Android 侧载检查

```js
const enabled = await Device.isSideLoadingEnabledAsync();
```

该方法判断当前 Android 应用是否可以请求通过系统的 `ACTION_INSTALL_PACKAGE` 机制安装应用，而不是只能通过 Google Play 等默认应用商店安装。

使用它之前必须添加 Android 权限：

```text
REQUEST_INSTALL_PACKAGES
```

这是原生应用权限，不是 React Web 中的浏览器权限。缺少权限时，不能假定调用会按预期工作。

方法返回的是“当前调用应用包是否被允许请求安装软件包”，不应扩大解释为：

- 用户一定会完成安装。
- 任意来源安装已对整个设备无限制开放。
- 当前设备一定安装过侧载应用。

当前文档未提供具体的 Expo 配置文件示例，只链接到 Expo 应用配置中的 `permissions` 文档。

## 平台差异速查

| 能力 | Android | iOS | tvOS | Web |
| --- | --- | --- | --- | --- |
| 品牌 `brand` | 支持 | 支持 | 未列出 | 始终 `null` |
| 设备名称 `deviceName` | 支持 | 支持，但有 entitlement 限制 | 支持 | 可能为 `null` |
| 设备类型 | 支持 | 支持 | 支持 | 支持 |
| 真机判断 | 支持 | 支持 | 支持 | 始终 `true` |
| 型号 ID `modelId` | `null` | 支持 | 未列出 | `null` |
| Android API Level | 支持 | `null` | 未列出 | `null` |
| 总内存 | 支持 | 支持 | 支持 | `null` |
| 平台能力查询 | 支持 | 空数组或 `false` | 未列出 | 空数组或 `false` |
| 运行时长 | 支持 | 支持 | 未列出 | 未列出 |
| Root/越狱检测 | 实验性 | 实验性 | 已列为支持 | 始终 `false` |
| 侧载检查 | 支持，需权限 | 不支持 | 不支持 | 不支持 |

“支持”不代表一定返回非空值。许多字段即使在支持平台上，也可能因为系统无法确定信息而返回 `null`。

## React Web 开发者最容易误解的地方

### 跨平台 API 不等于各平台结果一致

`expo-device` 是通用库，但很多字段只在特定原生平台有意义。Web 上常见的降级结果包括：

- `null`
- 空数组
- 固定的 `true`
- 固定的 `false`

业务代码必须将这些结果视为“平台不提供该信息”，而不是设备的真实硬件结论。

### 设备信息不是可靠身份

型号、品牌、设备名称和系统构建信息都可能重复、变化、缺失或被伪装。本文没有提供设备唯一标识能力。

### 设备类型不能替代响应式布局

React Web 开发者可能习惯通过 User-Agent 区分移动端和桌面端。在移动应用中，同样不应仅根据 `PHONE` 或 `TABLET` 决定全部布局。

**基于文档内容推导：** 设备类型适合表达设备类别，实际界面仍应以当前可用窗口尺寸为主要依据。

### 原生权限和 entitlement 会影响结果

JavaScript 代码正确不代表原生能力已经配置完成：

- iOS 16 以上读取具体设备名需要正确 entitlement。
- Android 侧载检查需要 `REQUEST_INSTALL_PACKAGES` 权限。

这些配置最终会进入原生构建产物，通常需要重新构建应用才能生效。

### 系统字段不一定适合直接比较

- `osName` 在 Android 上可能不是 `"Android"`。
- `osVersion` 格式不固定。
- `deviceType` 在 Android 上可能只是尺寸推断。
- Root 检测可能误报或漏报。

这些字段应根据文档定义使用，不能只依据字段名称猜测语义。

## 实际开发中的使用方式

### 采集诊断信息

```js
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export function getDeviceDiagnostics() {
  return {
    platform: Platform.OS,
    isPhysicalDevice: Device.isDevice,
    manufacturer: Device.manufacturer,
    modelName: Device.modelName,
    deviceType: Device.deviceType,
    osName: Device.osName,
    osVersion: Device.osVersion,
    osBuildId: Device.osBuildId,
    totalMemory: Device.totalMemory,
    cpuArchitectures: Device.supportedCpuArchitectures,
  };
}
```

这类信息适合附加到错误报告中，帮助定位特定机型或系统构建问题。

**基于经验建议：** `deviceName` 可能包含用户自定义内容，上传前应评估隐私需求，并避免采集与问题诊断无关的信息。

### 对平台专属逻辑做显式分支

```js
import { Platform } from 'react-native';
import * as Device from 'expo-device';

export async function supportsAndroidFeature(feature) {
  if (Platform.OS !== 'android') {
    return false;
  }

  return Device.hasPlatformFeatureAsync(feature);
}
```

这样比依赖 iOS 和 Web 返回固定 `false` 更清楚，也能表达业务代码的真实平台要求。

### 对可空字段提供降级值

```js
const deviceLabel =
  [Device.manufacturer, Device.modelName].filter(Boolean).join(' ') ||
  '未知设备';
```

类型中包含 `null` 就意味着调用方必须设计缺失信息的处理方式，不能只在 Web 上处理空值。

## 文档明确说明与合理推导

### 文档明确说明

- `expo-device` 用于访问物理设备的系统信息。
- 该模块支持 Android、iOS、tvOS 和 Web，并包含在 Expo Go 中。
- Android 设备类型主要按屏幕对角线推断，可能不准确。
- Web 上许多字段固定为 `null`，部分方法固定返回空数组或布尔值。
- iOS 16 以上读取具体设备名需要正确 entitlement。
- Android 的 `osName` 可能是构建指纹，平台判断应使用 `Platform.OS`。
- `osVersion` 不保证是三段式版本号。
- Root 和越狱检测是实验性的，可能被绕过或产生错误结果。
- Android 侧载检查需要 `REQUEST_INSTALL_PACKAGES` 权限。

### 基于文档内容推导

- 设备信息适合诊断和能力判断，不适合作为唯一设备身份。
- `DeviceType` 可以辅助选择默认布局，但不能替代基于窗口尺寸的响应式设计。
- Root 检测只能作为风险信号，不能单独作为高风险业务决策依据。
- 平台支持表中的“支持”不代表结果一定非空。
- 系统构建字段更适合故障定位，而不是普通用户界面展示。
- `totalMemory` 不能用于推断应用当前还能分配多少内存。

## 总结

`expo-device` 将多种原生设备信息封装为 JavaScript API。它的主要价值不是“精确识别每一台设备”，而是为应用提供设备类别、系统版本、硬件环境和平台能力等运行上下文。

使用时应把握三个原则：

1. 始终处理 `null`、空数组和平台固定返回值。
2. 不要把推断性或实验性结果当作绝对事实。
3. 涉及平台判断、权限和原生能力时，遵循对应 iOS 或 Android 的系统规则。

---

## 文档导航

- **上一页**：[dev client](./164__dev-client.md)
- **下一页**：[devicemotion](./166__devicemotion.md)
