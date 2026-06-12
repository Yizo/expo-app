# Expo Gyroscope：读取设备陀螺仪数据

> 原文档修改日期：2026 年 1 月 15 日  
> 所属包：`expo-sensors`  
> 支持平台：Android、iOS 真机、Web、Expo Go  
> 文档版本：下一版本 SDK 的未发布文档。稳定项目应参考 Expo SDK 56 对应的最新正式文档。

## 文档解决的问题

`Gyroscope` API 用于读取设备陀螺仪传感器的数据，从而感知设备在三维空间中的旋转变化。

它适用于需要响应设备转动的功能，例如：

- 根据手机转动调整界面。
- 构建体感交互。
- 采集设备绕 X、Y、Z 轴旋转的角速度。
- 为游戏、可视化或运动分析提供旋转数据。

陀螺仪返回的是**旋转角速度**，不是设备当前朝向，也不是设备在空间中的位置。

## 阅读前需要理解的概念

### Expo 与 React Native

React Native 使用 JavaScript/React 编写移动应用，但界面最终由原生组件渲染。Expo 在 React Native 之上提供了开发工具和原生能力封装。

`expo-sensors` 是 Expo 提供的传感器库。JavaScript 本身不能直接读取手机的硬件传感器，该库负责连接 JavaScript 代码与 Android、iOS 或浏览器提供的底层传感器 API。

### 陀螺仪测量什么

陀螺仪测量设备绕三个轴旋转的速度：

| 轴 | 数据含义 |
| --- | --- |
| `x` | 绕设备 X 轴的旋转角速度 |
| `y` | 绕设备 Y 轴的旋转角速度 |
| `z` | 绕设备 Z 轴的旋转角速度 |

单位是弧度每秒，即 `rad/s`。

这些数值表示“转得多快”，而不是“已经转到了多少度”。如果设备没有旋转，三个轴的值通常会接近 `0`，但文档没有承诺传感器不存在测量误差。

### 事件订阅模型

`Gyroscope` 持续产生数据，因此使用监听器订阅，而不是只调用一次函数取得结果。

对 React Web 开发者而言，可以将它理解为类似：

```js
const subscription = Gyroscope.addListener(handleData);

// 不再需要时取消监听
subscription.remove();
```

这类似于浏览器中的 `addEventListener` 和 `removeEventListener`，但这里通过订阅对象的 `remove()` 方法取消监听。

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

`expo install` 会按照当前 Expo SDK 选择兼容的包版本，这与直接执行普通的 `npm install` 不完全相同。

如果项目是已有的 React Native 原生项目，而不是通过 Expo 创建或管理的项目，必须先在项目中安装并配置 Expo Modules，才能使用 `expo-sensors`。

原文档没有涉及以下内容：

- iOS 原生工程中的具体配置步骤。
- Android 原生工程中的具体配置步骤。
- `app.json` 或 `app.config.js` 配置。
- 应用商店隐私声明配置。
- 后台持续读取陀螺仪的方法。

## 基本使用流程

完整流程可以归纳为：

1. 从 `expo-sensors` 导入 `Gyroscope`。
2. 检查设备上的陀螺仪是否可用。
3. 在需要时申请传感器权限。
4. 设置数据更新间隔。
5. 使用 `addListener()` 订阅数据。
6. 将收到的 `x`、`y`、`z` 数据用于界面或业务逻辑。
7. 组件卸载或功能停止时调用 `subscription.remove()`。

原文示例主要展示了第 4 至第 7 步，没有在示例代码中演示可用性检查和权限申请。实际开发不能因此忽略这两个步骤。

## 原文示例解析

### 状态结构

```jsx
const [{ x, y, z }, setData] = useState({
  x: 0,
  y: 0,
  z: 0,
});

const [subscription, setSubscription] = useState(null);
```

第一个状态保存最新一次陀螺仪测量结果。第二个状态保存订阅对象，用于判断当前是否正在监听，以及之后取消监听。

### 设置更新间隔

```jsx
const _slow = () => Gyroscope.setUpdateInterval(1000);
const _fast = () => Gyroscope.setUpdateInterval(16);
```

参数单位是毫秒：

- `1000`：期望每秒更新约一次。
- `16`：期望约每 16 毫秒更新一次，理论上接近每秒 60 次。

这是期望更新间隔，不应将其理解为严格实时的定时器保证。设备能力和操作系统限制都可能影响实际频率。

从 Android 12（API 31）开始，每个传感器的更新频率受到最高 `200Hz` 的系统限制，也就是最快大约每 `5ms` 一次。

### 创建订阅

```jsx
const _subscribe = () => {
  setSubscription(
    Gyroscope.addListener(gyroscopeData => {
      setData(gyroscopeData);
    })
  );
};
```

每次传感器产生新数据时，回调都会收到一个 `GyroscopeMeasurement` 对象，并通过 `setData()` 触发组件重新渲染。

高频更新时，这意味着组件可能频繁重新渲染。原文档没有讨论性能优化方案。

### 取消订阅

```jsx
const _unsubscribe = () => {
  subscription && subscription.remove();
  setSubscription(null);
};
```

`subscription.remove()` 会移除当前监听器。调用后，该监听器不会继续接收数据。

这里将状态重置为 `null`，主要是为了让界面知道监听已经关闭。

### 组件生命周期管理

```jsx
useEffect(() => {
  _subscribe();
  return () => _unsubscribe();
}, []);
```

组件挂载后开始订阅，组件卸载时取消订阅。

这与 React Web 中在 `useEffect` 内注册 DOM 事件、在清理函数中移除事件的模式相同。清理订阅可以避免：

- 组件卸载后继续执行状态更新。
- 重复创建监听器。
- 不再使用传感器时仍然消耗资源。

## API 说明

### 导入方式

```js
import { Gyroscope } from 'expo-sensors';
```

`Gyroscope` 是一个可订阅的传感器类，继承自 Expo Sensors 提供的 `DeviceSensor` 基类。

### `Gyroscope.addListener(listener)`

订阅陀螺仪更新：

```js
const subscription = Gyroscope.addListener(measurement => {
  console.log(measurement.x, measurement.y, measurement.z);
});
```

参数 `listener` 是一个回调函数，每次有新测量数据时都会被调用。

返回值是 `EventSubscription`，可以通过以下方式取消订阅：

```js
subscription.remove();
```

### `Gyroscope.setUpdateInterval(intervalMs)`

设置期望的传感器更新间隔：

```js
Gyroscope.setUpdateInterval(100);
```

`intervalMs` 的单位是毫秒。数值越小，回调通常越频繁。

Android 12 及以上系统对单个传感器设有 `200Hz` 更新频率上限。即使传入小于 `5ms` 的间隔，也不能据此假设实际更新频率会超过该限制。

### `Gyroscope.isAvailableAsync()`

检查当前设备是否能够使用陀螺仪：

```js
const available = await Gyroscope.isAvailableAsync();
```

返回 `Promise<boolean>`。

文档明确建议：**尝试使用传感器前，应始终先检查可用性。**

Web 平台上的检测存在特殊限制：

- 该方法会启动计时器，等待浏览器是否产生传感器事件。
- 它可以尝试判断 iOS Safari 是否关闭了“Motion & Orientation Access”。
- 部分设备只有在站点通过 HTTPS 提供时才会产生事件。
- 浏览器没有正式 API 可以直接查询 `DeviceMotion` 状态，因此检测结果有时并不可靠。

### `Gyroscope.requestPermissionsAsync()`

请求访问传感器的权限：

```js
const response = await Gyroscope.requestPermissionsAsync();
```

返回 `Promise<PermissionResponse>`。

在移动端 Web 中，必须在用户交互中调用，例如按钮的点击或触摸事件：

```jsx
<TouchableOpacity
  onPress={async () => {
    const permission = await Gyroscope.requestPermissionsAsync();
  }}
>
  <Text>启用陀螺仪</Text>
</TouchableOpacity>
```

不能假设在页面加载或普通 `useEffect` 中自动请求一定有效。

如果权限状态不是 `granted`，应通知用户可能需要前往系统或浏览器设置中手动启用。

### `Gyroscope.getPermissionsAsync()`

查询当前传感器权限：

```js
const response = await Gyroscope.getPermissionsAsync();
```

该方法只检查已有权限状态，不负责主动弹出授权请求。

### `Gyroscope.getListenerCount()`

返回当前已注册监听器的数量：

```js
const count = Gyroscope.getListenerCount();
```

返回值类型为 `number`。

它可以用于诊断是否意外注册了多个监听器，但原文档没有给出具体使用场景。

### `Gyroscope.hasListeners()`

判断当前是否至少存在一个监听器：

```js
const listening = Gyroscope.hasListeners();
```

返回值类型为 `boolean`。

### `Gyroscope.removeAllListeners()`

删除所有已注册的监听器：

```js
Gyroscope.removeAllListeners();
```

该方法已被弃用。文档要求改用订阅对象的 `remove()`：

```js
subscription.remove();
```

### `Gyroscope.removeSubscription(subscription)`

移除指定订阅：

```js
Gyroscope.removeSubscription(subscription);
```

参数类型是 `EventSubscription`，返回 `void`。

对于新代码，优先使用更直接的：

```js
subscription.remove();
```

## 测量数据类型

### `GyroscopeMeasurement`

监听器收到的数据包含：

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `timestamp` | `number` | 测量时间戳，单位为秒 |
| `x` | `number` | 绕 X 轴的旋转角速度，单位为 `rad/s` |
| `y` | `number` | 绕 Y 轴的旋转角速度，单位为 `rad/s` |
| `z` | `number` | 绕 Z 轴的旋转角速度，单位为 `rad/s` |

原文示例只使用了 `x`、`y`、`z`，没有展示 `timestamp`。

文档没有说明：

- `timestamp` 使用哪一个时间基准。
- 不同设备之间的传感器精度差异。
- 坐标轴与设备屏幕方向之间的具体对应关系。
- 如何将角速度积分为旋转角度。
- 是否需要进行校准或噪声过滤。

因此不能仅根据当前文档对这些行为作出额外假设。

## 权限返回值

### `PermissionResponse`

权限查询和请求方法返回以下结构：

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `granted` | `boolean` | 是否已获得权限的便捷判断值 |
| `status` | `PermissionStatus` | 权限的完整状态 |
| `canAskAgain` | `boolean` | 是否还能再次向用户发起权限请求 |
| `expires` | `PermissionExpiration` | 权限过期时间 |

当前文档说明，权限目前均为永久授权，因此 `expires` 当前表现为 `'never'`；其类型仍允许为数字。

### `PermissionStatus`

权限状态有三种：

| 枚举值 | 字符串值 | 含义 |
| --- | --- | --- |
| `PermissionStatus.GRANTED` | `"granted"` | 用户已授权 |
| `PermissionStatus.DENIED` | `"denied"` | 用户已拒绝 |
| `PermissionStatus.UNDETERMINED` | `"undetermined"` | 用户尚未授权或拒绝 |

当 `canAskAgain` 为 `false` 时，应用不应反复请求权限，而应引导用户前往设置页面手动修改权限。

## 平台限制与容易踩坑的地方

### iOS 只支持真机

页面的平台标记明确注明 iOS 为“device only”。这意味着不能依赖 iOS 模拟器验证真实的陀螺仪行为，应使用具有传感器的 iPhone 或 iPad 测试。

### Web 检测并不完全可靠

Web 上没有正式 API 能直接判断 `DeviceMotion` 是否可用。`isAvailableAsync()` 通过等待事件来推测可用性，因此可能产生不准确的结果。

iOS Safari 用户还可能需要在以下位置启用相关能力：

```text
Settings > Safari > Motion & Orientation Access
```

### Web 通常需要 HTTPS

`DeviceMotion` 被视为安全上下文 API。部分设备在非 HTTPS 页面上不会产生事件。

对 React Web 开发者而言，本地开发环境和生产环境可能表现不同，不能只根据桌面浏览器或普通 HTTP 环境下的结果判断功能是否可用。

### 移动 Web 权限请求需要用户操作

权限请求必须由触摸等用户交互触发。将请求直接放进组件初始化逻辑，可能无法正常弹出授权流程。

### 高频更新可能导致频繁渲染

原文示例在每次传感器回调中直接执行 `setData()`。当更新间隔设置为 `16ms` 时，理论上可能接近每秒触发 60 次 React 状态更新。

**基于文档内容推导：** 如果业务不需要每次测量都更新界面，可以让数据采集频率与 UI 渲染频率分离，以减少无意义的重新渲染。

### 必须保留并清理订阅对象

调用 `addListener()` 后应保存其返回值，并在功能关闭或组件卸载时调用 `remove()`。不要使用已经弃用的 `removeAllListeners()` 作为常规清理方式，因为它会影响其他地方注册的监听器。

## React Web 开发者最容易误解的地方

1. `Gyroscope` 不是浏览器 DOM API，而是 Expo 对多平台传感器能力的封装。
2. 返回值是旋转角速度，不是 CSS `rotate()` 所需的累计角度。
3. 设置 `16ms` 只是请求更新频率，不代表系统会严格按 `setInterval(16)` 执行。
4. 浏览器支持 Web API，不代表用户设备一定拥有可用传感器。
5. Web、Android 和 iOS 的权限及可用性行为并不完全一致。
6. iOS 模拟器不能替代真机传感器测试。
7. 订阅属于外部副作用，应像 DOM 事件监听器一样在 `useEffect` 清理函数中释放。
8. `expo-sensors` 的数据来自设备硬件，桌面浏览器上的测试结果不能代表手机端结果。

## 实际开发中的推荐处理顺序

下面是根据文档 API 整理的流程示意：

```jsx
import { useEffect, useState } from 'react';
import { Gyroscope } from 'expo-sensors';

export function useGyroscope() {
  const [measurement, setMeasurement] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let subscription;

    async function start() {
      const available = await Gyroscope.isAvailableAsync();

      if (!available) {
        setError('当前设备无法使用陀螺仪');
        return;
      }

      const permission = await Gyroscope.getPermissionsAsync();

      if (!permission.granted) {
        setError('尚未获得传感器权限');
        return;
      }

      Gyroscope.setUpdateInterval(100);
      subscription = Gyroscope.addListener(setMeasurement);
    }

    start();

    return () => {
      subscription?.remove();
    };
  }, []);

  return { measurement, error };
}
```

这段代码用于说明可用性检查、权限检查和订阅清理之间的关系，并不是原文提供的完整示例。

在移动 Web 上，不能直接照搬其中的权限处理。若需要申请权限，应在按钮点击等用户交互中调用 `requestPermissionsAsync()`。

**基于经验建议：**

- 将“不支持传感器”“权限被拒绝”和“用户尚未决定”显示为不同状态。
- 根据业务需求选择更新间隔，不要默认使用最高频率。
- 在 Android、iOS 真机和目标移动浏览器上分别测试。
- 对依赖传感器的功能提供不可用时的降级界面。
- 不要仅凭开发环境中的一次测试认定 Web 端能力稳定可用。

## 文档明确内容与推导内容

### 文档明确说明

- `Gyroscope` 属于 `expo-sensors`。
- 它提供设备三维旋转变化的陀螺仪数据。
- 测量值包含 `x`、`y`、`z` 和 `timestamp`。
- 三个轴的单位是 `rad/s`。
- 使用前应检查传感器可用性。
- 移动 Web 请求权限时必须由用户交互触发。
- Web 的可用性检测可能不可靠，并可能受 Safari 设置和 HTTPS 限制影响。
- Android 12 开始，单个传感器更新频率上限为 `200Hz`。
- 应通过订阅对象的 `remove()` 取消监听。
- `removeAllListeners()` 已弃用。
- iOS 需要使用真机。

### 基于文档内容推导

- 高频回调直接更新 React 状态可能导致频繁渲染。
- 应将传感器不可用和权限未授权作为正常运行状态处理，而不是只处理成功情况。
- 跨平台项目不能假设三个平台具有完全相同的权限和可用性行为。
- `isAvailableAsync()` 在 Web 上适合作为能力判断信号，但不应被视为绝对可靠的硬件检测结果。

## 总结

使用 Expo Gyroscope 的核心是：检查能力和权限、设置更新间隔、订阅测量数据，并及时取消订阅。

对于首次接触移动端开发的 React Web 开发者，最重要的是认识到传感器并非稳定一致的普通事件源。它受到真实硬件、操作系统权限、浏览器安全策略、HTTPS 环境和更新频率限制的共同影响。业务代码必须同时处理可用、不可用、未授权和授权被拒绝等状态。

---

## 文档导航

- **上一页**：[gl view](./174__gl-view.md)
- **下一页**：[haptics](./176__haptics.md)
