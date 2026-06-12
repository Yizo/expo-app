# Expo Sensors 学习指南

`expo-sensors` 是 Expo 提供的设备传感器库，用于读取设备的运动、方向、气压、磁场、环境光和步数等数据。

> **版本提醒：** 原文档对应下一个 Expo SDK 版本，而不是当前稳定版。文档明确指出，当前最新稳定文档对应 **SDK 56**。实际项目应优先参考与项目 Expo SDK 版本一致的文档。

## 文档解决的问题

这篇文档主要说明：

- `expo-sensors` 能访问哪些设备传感器。
- 如何在 Expo 或现有 React Native 项目中安装它。
- 如何配置 iOS 运动数据权限。
- Android 12 及以上系统如何突破传感器每秒 200 次更新的限制。
- 每种传感器支持哪些平台。
- 如何进入各个具体传感器的独立 API 文档。

它是一篇传感器功能的入口文档，不包含每种传感器的完整 API、数据结构和订阅示例。

## 适用场景

`expo-sensors` 适合需要使用设备硬件传感器的移动应用，例如：

- 根据手机倾斜或旋转实现交互。
- 获取设备加速度或运动状态。
- 读取气压数据。
- 制作指南针或检测磁场。
- 获取 Android 设备周围的环境光强度。
- 统计用户步数。

需要注意的是，传感器能力取决于运行平台和设备硬件。即使库支持某个平台，也不代表每台设备都一定配备对应传感器。

> “设备是否一定具备相应硬件”并非当前文档的明确说明，而是**基于文档内容推导**出的实际开发影响。具体可用性检测方式需要阅读各传感器的独立文档。

## React Web 开发者需要了解的背景

### 传感器 API 不是普通 Web API

在 React Web 中，代码主要运行在浏览器提供的环境里。React Native 应用则可以通过原生模块调用 iOS 或 Android 的系统能力。

`expo-sensors` 就是这样一层封装：

```text
React Native JavaScript 代码
        ↓
expo-sensors
        ↓
iOS / Android 原生传感器 API
        ↓
设备硬件
```

因此，传感器相关功能会受到以下因素影响：

- iOS 与 Android 的权限机制。
- 操作系统版本。
- 设备是否有对应硬件。
- 原生工程中的配置。
- 当前构建出的 App 二进制文件是否包含所需权限。

这与安装一个纯前端 npm 工具库不同。部分配置不能通过热更新或运行时 JavaScript 修改，必须重新构建 App。

### Expo Go、Expo 项目与现有 React Native 项目

文档标明 `expo-sensors`：

- 支持 Android。
- 支持 iOS。
- 支持 Web。
- 已包含在 Expo Go 中。

Expo Go 是用于运行和调试 Expo 项目的通用客户端。由于其中已经包含 `expo-sensors` 原生模块，开发阶段通常可以直接使用。

现有 React Native 项目如果尚未接入 Expo Modules，则不能只安装 `expo-sensors`。文档要求先在项目中安装并配置 `expo`，使工程具备加载 Expo 原生模块的能力。

## 安装

根据包管理器选择对应命令：

```sh
# npm
npx expo install expo-sensors

# yarn
yarn expo install expo-sensors

# pnpm
pnpm expo install expo-sensors

# bun
bun expo install expo-sensors
```

这里使用的是 `expo install`，而不只是普通的 `npm install`。它会根据当前 Expo SDK 选择兼容的软件包版本，降低版本不匹配的风险。

如果是在现有 React Native 项目中安装，还需要先为工程安装 Expo Modules：

```text
现有 React Native 项目
        ↓
安装并配置 expo
        ↓
安装 expo-sensors
```

当前文档没有提供安装 Expo Modules 的具体步骤，只链接到了对应的独立指南。

## 导入 API

可以导入整个模块：

```js
import * as Sensors from 'expo-sensors';
```

也可以按传感器类型导入：

```js
import {
  Accelerometer,
  Barometer,
  DeviceMotion,
  Gyroscope,
  LightSensor,
  Magnetometer,
  MagnetometerUncalibrated,
  Pedometer,
} from 'expo-sensors';
```

两种写法都可以使用。按名称导入时，每个对象对应一种传感器能力。

当前文档只展示了导入方式，没有说明：

- 如何订阅传感器数据。
- 返回数据的字段和单位。
- 如何设置更新频率。
- 如何停止订阅。
- 如何检测传感器是否可用。
- React 组件卸载时如何清理监听。

这些内容需要查看各传感器的独立 API 文档。

## 原生配置与 Config Plugin

### 什么是 Config Plugin

部分权限和原生配置必须写入 iOS 或 Android 工程，不能在应用运行后通过 JavaScript 设置。

Expo 的 Config Plugin 可以根据 `app.json` 等 Expo 应用配置，自动修改生成的原生工程。它通常配合 Continuous Native Generation（CNG，持续原生工程生成）使用。

对于 React Web 开发者，可以将其理解为：

```text
app.json 中的声明式配置
        ↓
Config Plugin
        ↓
生成或修改 iOS / Android 原生配置
        ↓
重新构建 App 二进制文件
```

它与 Web 项目的运行时配置不同。修改这类配置后，仅刷新页面、重启 Metro 或发布 JavaScript 更新通常不够，必须重新构建应用。

### 配置 iOS 权限提示语

示例 `app.json`：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-sensors",
        {
          "motionPermission": "Allow $(PRODUCT_NAME) to access your device motion"
        }
      ]
    ]
  }
}
```

`plugins` 数组中的这一项包含：

1. 插件名称 `expo-sensors`。
2. 传递给插件的配置对象。

### `motionPermission`

| 配置项 | 默认值 | 作用 |
| --- | --- | --- |
| `motionPermission` | `"Allow $(PRODUCT_NAME) to access your device motion"` | 仅用于 iOS，设置 `NSMotionUsageDescription` 权限说明；也可以设置为 `false`，禁用运动权限配置。 |

`$(PRODUCT_NAME)` 是 iOS 构建配置中的产品名称占位符，不是 JavaScript 模板字符串。

这段文字会向用户解释应用为什么需要访问设备运动数据。配置会写入 iOS 原生工程的 `Info.plist`，对应：

```text
NSMotionUsageDescription
```

如果项目不使用 CNG，就不能依赖 Config Plugin 自动完成这些修改，需要手动配置原生工程。当前文档没有给出完整的手动 iOS 配置步骤。

## 权限与系统限制

## Android：200Hz 更新频率限制

从 Android 12（API 级别 31）开始，系统将每个传感器的更新频率限制为 **200Hz**。

`200Hz` 表示理论上每秒最多获得 200 次传感器更新。只有确实需要高频采样时，才需要申请额外权限。

### 使用 Expo 配置

如果需要超过 200Hz，应在 `app.json` 的 `expo.android.permissions` 数组中加入：

```text
HIGH_SAMPLING_RATE_SENSORS
```

完整结构可写成：

```json
{
  "expo": {
    "android": {
      "permissions": ["HIGH_SAMPLING_RATE_SENSORS"]
    }
  }
}
```

以上完整 JSON 是根据文档指定的配置路径整理出的写法。

该权限的作用是允许应用以超过 200Hz 的采样率读取传感器数据。

### 手动维护 Android 原生工程

如果项目不使用 CNG，或者手动管理原生 Android 工程，需要编辑：

```text
android/app/src/main/AndroidManifest.xml
```

加入：

```xml
<uses-permission android:name="android.permission.HIGH_SAMPLING_RATE_SENSORS" />
```

`AndroidManifest.xml` 类似 Web 应用的能力声明清单，但它属于 Android 原生工程。系统会根据其中的声明判断应用申请了哪些权限和能力。

### 开发影响

- 仅安装 npm 包不会自动解决所有原生权限问题。
- 普通采样频率不超过 200Hz 时，文档没有要求添加该权限。
- 添加权限后，需要重新构建 Android 应用。
- 文档没有说明申请该权限后一定能达到某个固定采样率，也没有给出高频采样的性能和耗电数据。

## iOS：运动数据用途说明

`expo-sensors` 使用以下 iOS `Info.plist` 配置键：

| `Info.plist` 键 | 作用 |
| --- | --- |
| `NSMotionUsageDescription` | 向用户说明应用为什么请求访问设备运动数据。 |

对于使用 CNG 的项目，可以通过 `motionPermission` 配置它。手动管理 iOS 原生工程时，则需要自行处理对应的原生配置。

权限说明应该描述应用中的真实用途，而不应只写模糊的“需要权限”。

> 最后一条属于**基于经验建议**；当前文档只说明了该字段的用途，没有提供权限文案规范。

## 可用传感器

### Accelerometer：加速度计

- 功能：测量设备加速度。
- 平台：Android、iOS、Web。

它通常用于判断设备移动、晃动或倾斜变化。具体坐标轴定义、单位和 API 需要查看 Accelerometer 独立文档。

### Barometer：气压计

- 功能：测量气压。
- 平台：Android、iOS。

Web 不在文档列出的支持范围内。

### DeviceMotion：设备运动

- 功能：测量设备运动状态。
- 平台：Android、iOS、Web。

它表示综合性的设备运动信息。当前入口文档没有解释它与加速度计、陀螺仪之间的数据差异。

### Gyroscope：陀螺仪

- 功能：测量设备旋转。
- 平台：Android、iOS、Web。

它关注设备围绕不同轴的旋转变化，不应简单等同于设备在空间中的位移。

### Magnetometer：磁力计

- 功能：测量磁场。
- 平台：Android、iOS。

常见用途包括方向或指南针相关功能，但具体计算方式不属于当前文档内容。

模块还导出了：

```js
MagnetometerUncalibrated
```

不过当前页面没有对它进行说明，也没有将其列入“Available sensors”列表，因此不能仅根据本页确定其平台支持、数据含义和使用限制。

### LightSensor：环境光传感器

- 功能：测量环境光。
- 平台：Android。

文档只列出 Android，不应假设 iOS 或 Web 也支持。

### Pedometer：计步器

- 功能：测量步数。
- 平台：Android、iOS。

当前文档没有说明步数统计的时间范围、后台运行能力或数据来源。

## 平台支持汇总

| 传感器 | Android | iOS | Web |
| --- | --- | --- | --- |
| Accelerometer | 支持 | 支持 | 支持 |
| Barometer | 支持 | 支持 | 未列出 |
| DeviceMotion | 支持 | 支持 | 支持 |
| Gyroscope | 支持 | 支持 | 支持 |
| Magnetometer | 支持 | 支持 | 未列出 |
| LightSensor | 支持 | 未列出 | 未列出 |
| Pedometer | 支持 | 支持 | 未列出 |

表格中的“未列出”表示当前文档没有将该平台列为支持平台，不应理解为经过测试后得出的绝对结论。

## 容易误解和踩坑的地方

### 包支持 Web，不代表所有传感器都支持 Web

文档顶部将整个库标记为支持 Web，但具体传感器的平台范围并不相同。Web 项目只能使用明确列出 Web 支持的传感器，并且还会受到浏览器和设备能力限制。

### Expo Go 可用不代表独立 App 无需配置

Expo Go 已经预装相应原生模块，适合开发验证。但构建自己的应用时，仍需确保权限及原生配置正确进入最终 App 二进制文件。

### Config Plugin 配置不是运行时配置

`motionPermission` 等设置会影响原生工程。修改后需要重新构建应用，不能期待 React 状态更新、浏览器刷新或 JavaScript 热更新使其生效。

### 权限声明不等于成功获取数据

权限只是访问传感器的必要条件之一。硬件是否存在、系统是否提供数据以及具体 API 是否可用，还需要在实际设备上检查。

这是**基于文档内容推导**出的结论；当前页面没有提供可用性检测 API。

### 模拟器不一定能代表真实传感器行为

传感器功能最终依赖设备硬件，应在真实 Android 和 iOS 设备上验证。

这是**基于经验建议**，不是当前文档明确说明的内容。

### 高频采样应谨慎使用

超过 200Hz 的读取需求会增加配置复杂度，也可能带来更多计算、渲染和耗电压力。不要因为可以添加权限，就默认使用最高更新频率。

性能和耗电影响属于**基于经验建议**；当前文档只明确说明了 Android 12 的频率限制及相应权限。

## 实际开发流程

推荐按照以下顺序使用本页知识：

1. 确认需要采集的数据类型，例如加速度、旋转、气压或步数。
2. 查看平台支持范围，确认目标 iOS、Android 或 Web 平台是否被列出。
3. 使用 `expo install` 安装 `expo-sensors`。
4. 如果是现有 React Native 项目，确认已经安装并配置 Expo Modules。
5. 打开对应传感器的独立文档，了解数据结构、单位、订阅和清理方式。
6. 根据平台配置 iOS 权限说明或 Android 高频采样权限。
7. 修改原生配置后重新构建应用。
8. 在真实设备上验证权限流程、硬件可用性和数据表现。

在 React 组件中订阅连续传感器数据时，还应在组件卸载时取消订阅，避免重复监听和无效更新。这是**基于经验建议**；当前入口文档没有给出监听代码。

## 文档明确内容与推导内容

### 文档明确说明

- `expo-sensors` 可以访问多种设备传感器。
- 支持 Android、iOS、Web，并包含在 Expo Go 中。
- 推荐通过 `expo install` 安装。
- 现有 React Native 项目需要先安装 Expo Modules。
- 使用 CNG 时可以通过 Config Plugin 设置 `motionPermission`。
- `motionPermission` 仅适用于 iOS，并对应 `NSMotionUsageDescription`。
- Android 12 开始将每个传感器的更新频率限制为 200Hz。
- 超过 200Hz 需要声明 `HIGH_SAMPLING_RATE_SENSORS` 权限。
- 各种传感器具有不同的平台支持范围。

### 基于文档内容推导

- 原生配置修改后需要生成新的应用二进制文件，单纯刷新 JavaScript 不足以生效。
- 使用传感器前应检查目标平台和设备是否具备对应能力。
- 库整体支持某个平台，不代表其中每个传感器都支持该平台。
- 权限声明只是访问传感器的一个条件，并不保证设备能够返回数据。

### 当前文档未涉及

- 各传感器 API 的完整方法和类型。
- 数据字段、坐标系和计量单位。
- 设置更新间隔的具体代码。
- 监听和取消监听的代码示例。
- 传感器可用性检测方式。
- 后台采集能力。
- 高频采样的耗电和性能数据。
- iOS 与 Android 数据精度差异。
- Web 浏览器兼容性细节。
- 测试、模拟和故障排查方法。

## 总结

`expo-sensors` 是 Expo 中访问设备传感器能力的统一入口，但每种传感器的平台支持和具体 API 都不同。

实际开发时需要同时处理三个层面：

1. 使用 JavaScript API 订阅传感器数据。
2. 根据 iOS 或 Android 要求声明权限和用途。
3. 将原生配置构建进最终 App，并在真实设备上验证。

本页主要负责安装、权限和传感器导航。确定要使用的传感器后，还必须继续阅读该传感器的独立文档，不能仅凭本页完成具体功能开发。

---

## 文档导航

- **上一页**：[securestore](./203__securestore.md)
- **下一页**：[server](./205__server.md)
