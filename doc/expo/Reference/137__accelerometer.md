# Expo Accelerometer：设备加速度计使用指南

## 文档解决的问题

`expo-sensors` 包中的 `Accelerometer` API 用于读取设备的加速度计数据，并通过监听器持续接收设备在三维空间中的运动或振动变化。

它适合以下场景：

- 检测设备移动、倾斜或振动
- 根据运动数据更新界面
- 实现体感交互
- 收集三轴加速度数据
- 判断当前设备或浏览器是否支持加速度计

> 本页是下一版本 Expo SDK 的未发布文档。文档明确指出，当前最新稳定版本为 **SDK 56**。实际项目应优先查看对应 Expo SDK 版本的文档，避免 API 或行为不一致。

## 平台支持

| 平台 | 支持情况 |
| --- | --- |
| Android | 支持 |
| iOS | 支持，但只能在真实设备上使用 |
| Web | 支持，但存在权限、HTTPS 和兼容性限制 |
| Expo Go | 已包含，可以直接测试 |

iOS 的“device only”意味着无法依赖 iOS 模拟器测试真实加速度计数据，需要使用 iPhone 或 iPad。

## 阅读前需要理解的概念

### 加速度计

加速度计是设备上的硬件传感器，用于测量设备沿三维坐标轴的加速度变化。

`Accelerometer` 每次产生的数据包含：

- `x`：X 轴加速度
- `y`：Y 轴加速度
- `z`：Z 轴加速度
- `timestamp`：测量时间

这些数据可以反映设备移动和振动。

文档没有定义 X、Y、Z 轴相对于屏幕的具体方向，也没有说明屏幕旋转后坐标轴如何变化。需要轴向转换时，应继续查阅对应平台或传感器坐标系文档，不能仅根据本页推断。

### g-force

三轴数据使用 `g` 作为单位，而不是常见的 `m/s²`：

```text
1g = 9.81 m/s²
```

这里的 `g` 表示地球重力场产生的重力加速度大小。

### 监听器与订阅对象

传感器数据不是通过一次普通函数调用获得的，而是持续产生事件：

1. 使用 `addListener()`注册回调。
2. 传感器产生新数据时，回调被调用。
3. `addListener()`返回一个订阅对象。
4. 不再需要数据时，调用订阅对象的 `remove()`。

这类似于 React Web 中注册和清理 `window` 事件：

```js
window.addEventListener('resize', listener);
window.removeEventListener('resize', listener);
```

区别在于 Expo 返回一个订阅对象，由它负责移除对应监听器。

## 安装

根据项目使用的包管理器执行其中一条命令：

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

`expo install` 会按照项目使用的 Expo SDK 版本选择兼容的软件包版本。对于 Expo 项目，不应简单把它理解为 `npm install` 的同义命令。

如果是在已有的 React Native 原生项目中使用，还必须先安装并配置 Expo Modules 所需的 `expo` 包。

当前文档未涉及：

- iOS 原生工程配置
- Android 原生工程配置
- `app.json` 或 `app.config.js` 配置
- 原生权限声明文件
- 构建和发布命令

## 基本用法

首先从 `expo-sensors` 导入：

```js
import { Accelerometer } from 'expo-sensors';
```

### 建立监听

```js
const subscription = Accelerometer.addListener(measurement => {
  console.log(measurement.x);
  console.log(measurement.y);
  console.log(measurement.z);
  console.log(measurement.timestamp);
});
```

每当传感器产生更新时，监听器会收到一个 `AccelerometerMeasurement` 对象。

### 停止监听

```js
subscription.remove();
```

停止监听非常重要。否则组件已经不再使用传感器时，回调仍可能继续执行。

### 在 React 组件中管理订阅

文档示例在组件挂载时订阅，并尝试在卸载时取消订阅。其核心意图可以表达为：

```jsx
useEffect(() => {
  const subscription = Accelerometer.addListener(setData);

  return () => {
    subscription.remove();
  };
}, []);
```

这种写法将订阅对象直接保存在当前 Effect 的闭包中，清理逻辑与订阅逻辑一一对应。

> **基于经验建议：** 如果界面不需要根据“是否已订阅”更新，通常不需要把订阅对象放入 React state。使用 Effect 局部变量或 `useRef` 更容易保证清理逻辑获得正确的订阅对象。

### 设置更新频率

```js
Accelerometer.setUpdateInterval(1000);
```

参数单位为毫秒：

```js
// 大约每秒更新一次
Accelerometer.setUpdateInterval(1000);

// 目标约为每 16 毫秒更新一次
Accelerometer.setUpdateInterval(16);
```

较短的间隔意味着更频繁的数据更新。文档示例使用 `16ms` 作为快速模式、`1000ms` 作为慢速模式。

> **基于文档内容推导：** 更新越频繁，React state 更新和组件重新渲染也可能越频繁。界面不一定需要消费每一个传感器事件，可以根据业务需求降低更新频率。

## 推荐使用流程

文档明确要求，在尝试使用传感器之前始终检查其可用性。结合权限 API，完整流程应关注以下步骤：

1. 检查或请求传感器权限。
2. 调用 `isAvailableAsync()`检查设备是否可用。
3. 设置合适的更新间隔。
4. 使用 `addListener()`订阅数据。
5. 不再需要时调用 `subscription.remove()`。

Web 平台的权限请求必须放在用户交互中，例如按钮点击：

```jsx
async function enableAccelerometer() {
  const permission = await Accelerometer.requestPermissionsAsync();

  if (permission.status !== 'granted') {
    return;
  }

  const available = await Accelerometer.isAvailableAsync();

  if (!available) {
    return;
  }

  const subscription = Accelerometer.addListener(measurement => {
    console.log(measurement);
  });

  return subscription;
}
```

文档没有提供一份覆盖所有平台的完整权限处理代码，因此上面只是根据本页 API 关系整理出的流程，不代表所有平台都一定弹出权限对话框。

## API 说明

### `Accelerometer.addListener(listener)`

订阅加速度计更新：

```js
const subscription = Accelerometer.addListener(measurement => {
  // 处理 measurement
});
```

`listener` 每次接收一个 `AccelerometerMeasurement` 对象。

返回值是 `EventSubscription`，可以调用：

```js
subscription.remove();
```

### `Accelerometer.setUpdateInterval(intervalMs)`

设置传感器更新间隔：

```js
Accelerometer.setUpdateInterval(100);
```

- 参数类型：`number`
- 参数单位：毫秒
- 返回值：`void`

Android 12（API Level 31）开始，系统对每个传感器设置了 **200Hz** 的更新频率上限。

200Hz 对应理论最短间隔约为：

```text
1000ms / 200 = 5ms
```

> **基于文档内容推导：** 即使传入小于 `5ms` 的间隔，也不能期待 Android 12 及以上系统突破 200Hz 限制。`intervalMs` 表示期望间隔，不应将其理解为跨设备严格保证的实际频率。

### `Accelerometer.isAvailableAsync()`

检查加速度计当前是否可用：

```js
const available = await Accelerometer.isAvailableAsync();
```

返回：

```ts
Promise<boolean>
```

文档明确要求应在使用传感器前执行此检查。

Web 上没有正式 API 可以直接获知 `DeviceMotion` 状态，因此 Expo 的实现会启动计时器，观察是否收到传感器事件。该检测有时并不可靠。

### `Accelerometer.getPermissionsAsync()`

检查当前传感器权限：

```js
const permission = await Accelerometer.getPermissionsAsync();
```

返回：

```ts
Promise<PermissionResponse>
```

它用于查询权限，不表示一定会向用户发起请求。

### `Accelerometer.requestPermissionsAsync()`

向用户请求传感器访问权限：

```js
const permission = await Accelerometer.requestPermissionsAsync();
```

返回：

```ts
Promise<PermissionResponse>
```

移动端 Web 必须在用户交互事件中调用，例如点击或触摸事件。不能指望在组件挂载时自动调用后正常弹出权限请求。

如果返回状态不是 `granted`，应提示用户可能需要进入系统或浏览器设置手动开启权限。

### `Accelerometer.getListenerCount()`

返回当前已注册的监听器数量：

```js
const count = Accelerometer.getListenerCount();
```

返回类型为 `number`。

它可以用于检查监听器管理情况，但不应替代正常的订阅清理。

### `Accelerometer.hasListeners()`

判断当前是否存在已注册监听器：

```js
const hasListeners = Accelerometer.hasListeners();
```

返回类型为 `boolean`。

### `Accelerometer.removeAllListeners()`

移除所有已注册监听器：

```js
Accelerometer.removeAllListeners();
```

该方法已经被标记为废弃。应优先保存 `addListener()`返回的订阅对象，并调用：

```js
subscription.remove();
```

这样只会移除当前代码创建的监听器，不会影响其他功能注册的监听器。

### `Accelerometer.removeSubscription(subscription)`

接收一个 `EventSubscription` 并移除它：

```js
Accelerometer.removeSubscription(subscription);
```

返回值为 `void`。

当前文档没有说明该方法已废弃，但推荐的主要清理方式仍是调用订阅对象自身的 `remove()`。

## 数据类型

### `AccelerometerMeasurement`

```ts
type AccelerometerMeasurement = {
  timestamp: number;
  x: number;
  y: number;
  z: number;
};
```

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `timestamp` | `number` | 测量时间戳，单位为秒 |
| `x` | `number` | X 轴方向的加速度，单位为 `g` |
| `y` | `number` | Y 轴方向的加速度，单位为 `g` |
| `z` | `number` | Z 轴方向的加速度，单位为 `g` |

需要注意，`timestamp` 的单位是秒，而 `setUpdateInterval()`参数的单位是毫秒。两者不能混用。

当前文档没有说明：

- `timestamp` 的时间起点
- 测量精度
- 各轴正负方向
- 数据误差范围
- 是否包含重力分量
- 不同设备之间如何校准

### `PermissionResponse`

权限查询和请求方法返回：

```ts
type PermissionResponse = {
  canAskAgain: boolean;
  expires: PermissionExpiration;
  granted: boolean;
  status: PermissionStatus;
};
```

| 属性 | 含义 |
| --- | --- |
| `canAskAgain` | 是否还能再次向用户请求权限 |
| `expires` | 权限的过期时间 |
| `granted` | 是否已经获得权限的便捷布尔值 |
| `status` | 完整权限状态 |

当 `canAskAgain` 为 `false` 时，应用不能继续重复弹出权限请求，应引导用户进入设置页面手动修改权限。

### `PermissionStatus`

权限状态包括：

| 枚举值 | 字符串值 | 含义 |
| --- | --- | --- |
| `PermissionStatus.GRANTED` | `"granted"` | 用户已授权 |
| `PermissionStatus.DENIED` | `"denied"` | 用户已拒绝 |
| `PermissionStatus.UNDETERMINED` | `"undetermined"` | 用户尚未授权或拒绝 |

### `PermissionExpiration`

可能的值为：

```ts
'never' | number
```

文档指出，目前所有权限都是永久授予，因此当前通常为 `'never'`。

### `Subscription`

订阅对象提供：

```js
subscription.remove();
```

调用后，对应监听器不再接收事件。多处业务分别订阅时，每处都应保存并清理自己的订阅对象。

## Web 平台的重要限制

Web 支持并不等于所有浏览器和部署环境都能直接使用。

### 必须由用户交互触发权限请求

在移动端 Web 中，以下做法可能不符合要求：

```jsx
useEffect(() => {
  Accelerometer.requestPermissionsAsync();
}, []);
```

权限请求应放在点击或触摸事件中：

```jsx
<button onClick={enableAccelerometer}>启用传感器</button>
```

这与浏览器对音频播放、通知、剪贴板等敏感能力的限制相似。

### 可能必须使用 HTTPS

部分设备只会在 HTTPS 页面中产生 `DeviceMotion` 事件，因为该 API 被视为安全上下文能力。

因此，开发环境可用不代表部署后的 HTTP 页面可用，反之亦然。

### Safari 设置可能禁用传感器

iOS Safari 中的以下设置会影响传感器事件：

```text
Settings > Safari > Motion & Orientation Access
```

如果它被关闭，页面可能无法收到事件。

### 可用性检测并非绝对可靠

由于 Web 平台没有正式 API 查询 `DeviceMotion` 是否启用，`isAvailableAsync()`只能等待事件并据此判断。因此：

- 返回结果可能受到权限状态影响。
- 可能受到 HTTPS 环境影响。
- 可能受到 Safari 设置影响。
- 无事件不一定代表设备没有加速度计。

应用需要提供失败提示，而不能只依赖一个布尔值静默处理。

## React Web 开发者容易误解的地方

### 这不是一次性数据请求

加速度计是持续事件源，不像调用 REST API 后获得一次响应。必须处理订阅的完整生命周期。

### 传感器更新频率不等于屏幕帧率

示例中的 `16ms` 接近 60Hz 屏幕的一帧时间，但这不表示传感器事件一定与浏览器或原生界面的渲染帧同步。

### 设置间隔不代表硬实时保证

`setUpdateInterval()`设置的是期望更新间隔。系统限制、硬件能力和平台实现都可能影响实际频率。

### React Native 组件不是 HTML 元素

文档示例使用：

- `View`：类似布局容器，但不是 `div`
- `Text`：用于显示文本
- `TouchableOpacity`：可点击触摸区域
- `StyleSheet.create()`：定义 React Native 样式

React Native 样式使用 JavaScript 对象，没有 CSS 选择器、级联和标准 DOM。

### Expo Go 支持不代表所有 Expo 库都无需原生构建

本页明确标记 `expo-sensors` 已包含在 Expo Go 中，因此可以直接测试当前功能。但不能据此推导所有 Expo 原生库都已包含在 Expo Go。

## 实际开发建议

以下为基于文档 API 和常见 React 生命周期管理方式给出的建议：

1. **先检查权限和可用性**  
   不要直接假设设备一定支持传感器。

2. **让用户主动启用传感器**  
   Web 平台尤其需要按钮点击等用户交互来触发权限请求。

3. **始终保存并清理订阅对象**  
   组件卸载、页面离开或功能关闭时调用 `subscription.remove()`。

4. **根据业务选择更新间隔**  
   只展示大致运动趋势时，不必采用非常高的更新频率。

5. **避免每次事件都触发昂贵渲染**  
   高频数据处理可以与界面展示频率分离。

6. **在真实设备上测试**  
   特别是 iOS，因为本功能只支持真实设备。

7. **为 Web 失败提供可操作提示**  
   提示用户检查权限、HTTPS 和 Safari 的 Motion & Orientation Access 设置。

8. **不要自行假设坐标轴方向和数据物理含义**  
   本页没有提供坐标系、重力分量和校准规则。依赖这些信息的功能需要查阅进一步文档并进行真机验证。

## 明确信息与推导信息

### 文档明确说明

- `Accelerometer` 来自 `expo-sensors`。
- 支持 Android、iOS 和 Web。
- iOS 需要真实设备。
- Expo Go 已包含该库。
- 数据包含 `x`、`y`、`z` 和 `timestamp`。
- 三轴加速度单位为 `g`，且 `1g = 9.81m/s²`。
- 应在使用前调用 `isAvailableAsync()`。
- 移动 Web 的权限请求必须由用户交互触发。
- Web 可能需要 HTTPS。
- Web 的可用性检测可能不可靠。
- Android 12 起每个传感器的更新频率上限为 200Hz。
- `removeAllListeners()`已经废弃，应使用 `subscription.remove()`。

### 基于文档内容推导

- Android 12 上 200Hz 对应理论最短更新周期约为 5ms。
- 高频监听可能导致频繁的 React state 更新和重新渲染。
- Web 上无事件可能由权限、HTTPS 或 Safari 设置导致，不一定表示设备缺少传感器。
- 完整业务流程应包括权限检查、可用性检查、订阅和清理。

## 总结

`Accelerometer` 提供了订阅式的三轴加速度数据访问能力。基本使用方式是安装 `expo-sensors`、检查权限和可用性、设置更新间隔、注册监听器，并在结束时移除订阅。

实际开发中的重点不只是读取 `x`、`y`、`z`，还包括正确管理监听器生命周期、控制更新频率，以及处理 Web 平台的用户交互权限、HTTPS、Safari 设置和检测可靠性问题。

---

## 文档导航

- **上一页**：[expo](./136__expo.md)
- **下一页**：[age range](./138__age-range.md)
