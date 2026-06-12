# Expo DeviceMotion 学习指南

`DeviceMotion` 是 `expo-sensors` 提供的设备运动与方向传感器 API，可用于获取设备加速度、旋转角度、旋转速度和屏幕方向等数据。

> 本文对应 Expo 下一版本 SDK 的未发布文档。原文指出，当前最新稳定版本为 SDK 56。实际项目应优先核对所使用 Expo SDK 版本对应的文档。

## 文档解决的问题

这篇文档主要说明：

- 如何安装和导入 `DeviceMotion`
- 如何配置 iOS 运动数据权限说明
- 如何请求、检查传感器权限
- 如何判断设备是否支持运动传感器
- 如何订阅和取消订阅运动数据
- 如何调整传感器更新频率
- 每次测量数据包含哪些字段
- Android、iOS 和 Web 平台有哪些限制

它适合需要根据设备运动或姿态实现交互的场景，例如：

- 根据手机倾斜方向控制界面
- 检测设备旋转或晃动
- 制作体感交互
- 采集设备运动数据
- 根据横竖屏方向调整业务逻辑

文档只介绍传感器 API，没有提供完整业务示例，也没有涉及数据滤波、手势识别、动画联动或后台采集方案。

## 阅读前需要理解的概念

### `expo-sensors` 与 `DeviceMotion`

`expo-sensors` 是 Expo 的传感器库，`DeviceMotion` 是其中用于访问设备运动与空间方向数据的模块。

```js
import { DeviceMotion } from 'expo-sensors';
```

对于 React Web 开发者，可以把它理解为一个事件数据源：

- `addListener()` 类似注册浏览器事件监听器
- 传感器产生新数据时会调用回调函数
- 返回的订阅对象类似事件清理句柄
- 组件卸载时需要调用 `remove()`，类似执行 `removeEventListener`

与普通 DOM 事件不同，这些数据通常来自手机的原生硬件传感器，并受到设备能力、系统权限和平台安全策略限制。

### 三维坐标轴

所有运动数据都使用穿过设备的三条轴表示。以设备处于竖屏方向为基准：

- X 轴：从设备左侧指向右侧
- Y 轴：从设备底部指向顶部
- Z 轴：垂直穿过屏幕，从设备背面指向屏幕正面

坐标方向以竖屏为参照。处理横屏设备时，还应结合测量结果中的 `orientation` 判断当前屏幕旋转方向。

### 重力加速度

`DeviceMotion.Gravity` 表示地球标准重力加速度：

```text
9.80665 m/s²
```

该常量支持 Android、iOS 和 Web。

## 安装

根据项目使用的包管理器执行对应命令：

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

`expo install` 会根据项目当前使用的 Expo SDK 选择兼容的包版本。它不完全等同于 React Web 项目中直接执行 `npm install`。

如果是在已有的 React Native 原生项目中使用该模块，需要先为项目安装并配置 Expo Modules 所需的 `expo` 包。原文没有展开具体步骤。

## 原生配置与 iOS 权限说明

### 使用 CNG 和 config plugin

如果项目使用 Expo 的 Continuous Native Generation（CNG，持续原生工程生成），可以通过 `expo-sensors` 内置的 config plugin 配置无法在运行时修改的原生属性。

在 `app.json` 中添加：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-sensors",
        {
          "motionPermission": "Allow $(PRODUCT_NAME) to access your device motion."
        }
      ]
    ]
  }
}
```

`motionPermission` 只影响 iOS，用于配置原生 `Info.plist` 中的 `NSMotionUsageDescription`。

| 配置项 | 默认值 | 作用 |
| --- | --- | --- |
| `motionPermission` | `"Allow $(PRODUCT_NAME) to access your device motion"` | 设置 iOS 向用户展示的运动数据权限用途说明 |

`$(PRODUCT_NAME)` 是原生工程中的产品名称占位符，不是 JavaScript 模板字符串。

Config plugin 修改的是原生工程配置，因此修改后需要重新构建 App 二进制文件，仅刷新 JavaScript 或重新加载页面不会生效。

### 不使用 CNG

如果项目不使用 CNG，或者由开发者手动维护 iOS 原生工程，需要直接在 iOS 工程的 `Info.plist` 中配置：

```xml
<key>NSMotionUsageDescription</key>
<string>Allow $(PRODUCT_NAME) to access your device motion</string>
```

该字段用于向用户解释应用为什么需要访问设备运动数据。

对于只开发过 React Web 的开发者，需要注意：

- `app.json` 不只是前端运行时配置，也可能参与生成 iOS、Android 原生工程
- `Info.plist` 是 iOS 原生应用配置文件，不是 Web 项目中的 JSON 配置
- 权限用途说明属于构建时配置
- `requestPermissionsAsync()` 属于应用运行时权限请求

二者不能互相替代。

## 推荐使用流程

基于文档中的 API 和限制，一个完整的使用流程应当是：

1. 安装并导入 `expo-sensors`
2. 完成必要的 iOS 原生权限说明配置
3. 检查或请求用户权限
4. 调用 `isAvailableAsync()` 检查传感器是否可用
5. 根据需要调用 `setUpdateInterval()` 设置更新间隔
6. 使用 `addListener()` 订阅测量数据
7. 不再使用时调用订阅对象的 `remove()`

> **基于文档内容推导：** 权限和可用性是两个不同条件。用户授予权限，并不必然表示当前设备或浏览器能够产生运动数据。

## 权限 API

### 检查已有权限

```js
const permission = await DeviceMotion.getPermissionsAsync();
```

返回 `Promise<PermissionResponse>`，不会主动弹出权限请求界面。

### 请求权限

```js
const permission = await DeviceMotion.requestPermissionsAsync();
```

返回相同结构的 `PermissionResponse`。

### `PermissionResponse`

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `granted` | `boolean` | 是否已经授权 |
| `status` | `PermissionStatus` | 完整权限状态 |
| `canAskAgain` | `boolean` | 应用是否还能再次请求该权限 |
| `expires` | `'never' \| number` | 权限过期时间；当前权限均为永久授权 |

`PermissionStatus` 有三种状态：

| 状态 | 值 | 含义 |
| --- | --- | --- |
| `GRANTED` | `"granted"` | 用户已授权 |
| `DENIED` | `"denied"` | 用户已拒绝 |
| `UNDETERMINED` | `"undetermined"` | 用户尚未选择 |

如果 `canAskAgain` 为 `false`，应用不能继续依靠权限弹窗解决问题，应提示用户前往系统设置修改权限。

## 检查传感器可用性

```js
const available = await DeviceMotion.isAvailableAsync();
```

文档明确建议：使用传感器前始终检查其可用性。

该方法返回 `Promise<boolean>`。原文的接口描述中写的是“返回加速度计是否启用”，但本页上下文是判断设备运动传感器是否可用。

### 移动端 Web 的特殊要求

在移动端 Web 中，必须在用户交互事件内调用：

```js
await DeviceMotion.requestPermissionsAsync();
```

用户交互包括点击或触摸事件。不能假设页面加载后自动请求权限会成功。

如果状态不是 `granted`，应告知用户可能需要进入系统设置开启相关权限。

### Web 可用性检测并不完全可靠

Web 平台没有正式 API 可以直接查询 `DeviceMotion` 的实际状态。因此，`isAvailableAsync()` 会启动计时器，观察是否收到传感器事件，再据此推测是否可用。

以下情况可能导致收不到事件：

- iOS 的 Safari 设置中关闭了 **Motion & Orientation Access**
- 网站没有通过 HTTPS 提供
- 设备或浏览器不支持相关 API
- 浏览器因权限或安全策略阻止事件

因此，Web 上返回的结果只是一种探测结果，可能不完全可靠。

## 订阅运动数据

### 添加监听器

```js
const subscription = DeviceMotion.addListener(measurement => {
  // 处理 measurement
});
```

监听器会在新的设备运动数据到达时被调用，并接收一个 `DeviceMotionMeasurement` 对象。

返回值是 `EventSubscription`。不再监听时调用：

```js
subscription.remove();
```

在 React 组件中，订阅通常应与组件生命周期绑定：

```js
useEffect(() => {
  const subscription = DeviceMotion.addListener(measurement => {
    // 处理传感器数据
  });

  return () => {
    subscription.remove();
  };
}, []);
```

> 上述 React 生命周期写法是**基于文档内容推导**的使用方式。原文只明确说明通过 `subscription.remove()` 取消订阅。

### 监听器管理 API

```js
DeviceMotion.getListenerCount();
DeviceMotion.hasListeners();
DeviceMotion.removeAllListeners();
DeviceMotion.removeSubscription(subscription);
```

| API | 作用 |
| --- | --- |
| `getListenerCount()` | 返回当前注册的监听器数量 |
| `hasListeners()` | 判断是否至少注册了一个监听器 |
| `removeAllListeners()` | 删除全部监听器 |
| `removeSubscription(subscription)` | 删除指定订阅 |

`removeAllListeners()` 已被标记为废弃。新代码应保留 `addListener()` 返回的订阅对象，并调用其 `remove()`。

文档没有将 `removeSubscription()` 标记为废弃，但 `subscription.remove()` 的所有权更明确，也更适合 React 组件分别管理自己的订阅。

## 设置更新间隔

```js
DeviceMotion.setUpdateInterval(intervalMs);
```

`intervalMs` 是期望的两次传感器更新之间的时间，单位为毫秒。

例如：

```js
DeviceMotion.setUpdateInterval(100);
```

表示期望大约每 `100ms` 获取一次更新。

需要注意：

- 这是期望间隔，不应将其理解为 Web 中绝对精确的定时器
- 从 Android 12（API 31）开始，系统将每个传感器的更新频率限制为最高 `200Hz`
- `200Hz` 对应理论上的最短间隔约为 `5ms`
- 文档没有说明其他平台能够保证的最高频率

> **基于文档内容推导：** 更新频率越高，监听器执行越频繁。应避免在回调中直接进行昂贵的 React 渲染或复杂计算。

## `DeviceMotionMeasurement` 数据结构

每次监听器回调接收的数据包含以下字段。

### `acceleration`

```ts
null | {
  timestamp: number;
  x: number;
  y: number;
  z: number;
}
```

表示去除重力影响后的三轴设备加速度，单位为 `m/s²`。

该字段可能为 `null`，使用前必须检查。

### `accelerationIncludingGravity`

```ts
{
  timestamp: number;
  x: number;
  y: number;
  z: number;
}
```

表示包含重力影响的三轴加速度，单位同样为 `m/s²`。

静止设备也可能因为重力而产生非零读数，因此不能把它直接理解为“用户正在移动设备”。

### `rotation`

```ts
{
  alpha: number;
  beta: number;
  gamma: number;
  timestamp: number;
}
```

表示设备在空间中的方向：

| 字段 | 旋转轴 |
| --- | --- |
| `alpha` | 绕 Z 轴旋转 |
| `beta` | 绕 X 轴旋转 |
| `gamma` | 绕 Y 轴旋转 |

原文没有在该字段说明中明确给出角度单位。

### `rotationRate`

```ts
null | {
  alpha: number;
  beta: number;
  gamma: number;
  timestamp: number;
}
```

表示设备绕三个轴的旋转速度，单位为度每秒（`deg/s`）。

该字段也可能为 `null`，必须进行空值处理。

### `orientation`

表示基于屏幕旋转状态得到的设备方向：

| 枚举 | 数值 | 含义 |
| --- | ---: | --- |
| `DeviceMotionOrientation.Portrait` | `0` | 竖屏 |
| `DeviceMotionOrientation.RightLandscape` | `90` | 右横屏 |
| `DeviceMotionOrientation.UpsideDown` | `180` | 倒置竖屏 |
| `DeviceMotionOrientation.LeftLandscape` | `-90` | 左横屏 |

这里的 `orientation` 是离散的屏幕方向，不等同于 `rotation` 中连续变化的空间旋转数据。

### `interval`

表示底层原生平台获取数据的间隔，单位为毫秒。

它描述实际测量数据的获取间隔，不应与传入 `setUpdateInterval()` 的期望值混为一谈。

## 容易踩坑的地方

### 权限、配置和硬件可用性是不同问题

- `NSMotionUsageDescription`：iOS 构建时用途说明
- `requestPermissionsAsync()`：运行时请求用户授权
- `isAvailableAsync()`：检查当前环境能否使用传感器

只完成其中一步，不代表传感器一定可以工作。

### 不能忘记取消订阅

React Web 开发者可能习惯于将普通状态更新视为低频操作，但传感器可能持续高频推送数据。如果组件卸载后没有取消监听，可能造成重复回调、无效计算或生命周期问题。

### 部分字段允许为 `null`

以下字段类型明确包含 `null`：

- `acceleration`
- `rotationRate`

不要直接访问：

```js
measurement.acceleration.x
```

应先判断：

```js
if (measurement.acceleration) {
  const { x, y, z } = measurement.acceleration;
}
```

### Web 与原生平台并不完全一致

虽然 API 标记为支持 Android、iOS 和 Web，但 Web 受浏览器权限、HTTPS、安全设置和事件探测可靠性的影响，不能把“支持 Web”理解为所有浏览器中行为完全一致。

### 修改 config plugin 后需要重新构建

`motionPermission` 会写入原生配置，修改它不会通过热更新立即生效，必须生成并构建新的应用二进制文件。

## 实际开发建议

以下内容属于**基于经验建议**，不是原文明确要求：

- 在点击按钮等用户操作中发起移动端 Web 权限请求
- 为权限拒绝、设备不支持和 Web 探测失败分别设计提示
- 在 React 组件的 effect 清理函数中调用 `subscription.remove()`
- 根据交互所需精度设置更新频率，不要默认使用极高频率
- 高频数据可保存在 `ref` 或动画系统中，避免每次测量都触发完整 React 渲染
- 对加速度数据设置阈值或进行滤波，避免把传感器噪声误判为用户动作
- 分别在真实 Android、iOS 设备和目标移动浏览器中测试；桌面浏览器通常无法代表实际传感器行为

## 文档明确内容与推导内容

### 文档明确说明

- `DeviceMotion` 来自 `expo-sensors`
- 支持 Android、iOS 和 Web，并包含在 Expo Go 中
- 三维坐标轴以竖屏设备为参照
- iOS 使用 `NSMotionUsageDescription` 说明权限用途
- Config plugin 的修改需要重新构建 App
- 使用前应检查传感器可用性
- 移动端 Web 权限请求必须由用户交互触发
- Web 可用性检测可能不可靠，并可能要求 HTTPS
- Android 12 起传感器更新频率最高为 `200Hz`
- 应通过订阅对象的 `remove()` 取消监听
- `removeAllListeners()` 已废弃
- `acceleration` 和 `rotationRate` 可能为 `null`

### 基于文档内容推导

- 推荐按照“权限检查、可用性检查、设置频率、订阅、清理”的顺序组织代码
- 权限已授予不等于传感器一定可用
- `setUpdateInterval()` 是期望值，不应视为严格的实时调度保证
- 高频传感器回调可能增加 React 渲染和计算压力
- `orientation` 与 `rotation` 分别代表离散屏幕方向和连续空间姿态

## 当前文档未涉及

原文没有说明以下内容：

- 完整可运行的 React Native 示例
- 数据滤波和传感器噪声处理
- 后台运行时是否持续采集
- 各平台数据精度差异
- `rotation` 角度的明确单位
- 时间戳的单位和时间基准
- 模拟器中的支持情况
- 传感器数据与动画库的集成方式
- 测试和 Mock 方案
- 功耗影响的具体数据

这些问题不能仅根据当前文档得出确定结论，应查阅对应 Expo SDK 文档或进行目标设备测试。

## 总结

`DeviceMotion` 的核心使用模式是：配置原生权限说明、获取运行时权限、检查传感器可用性、订阅测量数据，并在结束时取消订阅。

对 React Web 开发者而言，最大的认知差异是：这不只是一个 JavaScript 事件 API。它同时受到原生构建配置、系统权限、真实硬件、浏览器安全策略和平台差异影响。特别是在移动端 Web 中，需要同时处理用户交互触发权限、HTTPS 要求以及可用性探测不可靠的问题。

---

## 文档导航

- **上一页**：[device](./165__device.md)
- **下一页**：[dev menu](./167__dev-menu.md)
