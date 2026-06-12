# Expo Magnetometer：读取设备磁力计数据

> 原文档修改日期：2026 年 1 月 15 日  
> 所属包：`expo-sensors`  
> 支持平台：Android、iOS、Expo Go

> **版本提示：**原文属于“下一版本 SDK”的未版本化文档。文档明确指出，当前最新稳定文档对应 Expo SDK 56。实际项目应优先查看与项目 Expo SDK 版本匹配的文档。

## 文档解决的问题

`expo-sensors` 提供的 `Magnetometer` API 用于访问手机或平板中的磁力计，持续获取设备周围磁场在三个坐标轴上的强度。

它适合以下场景：

- 获取设备周围磁场变化。
- 开发指南针或方向感知功能的底层数据采集部分。
- 检测磁场强度变化。
- 在 Expo Go 中快速验证磁力计功能。
- 在 Android 或 iOS React Native 应用中订阅传感器数据。

需要注意：本文档主要介绍如何读取磁力计数据，并没有提供根据磁场数据计算罗盘方向、真北方向或航向角的完整算法。

## 阅读前需要理解的概念

### 磁力计

磁力计是移动设备中的硬件传感器，用于测量周围磁场。测量单位为微特斯拉，即 `μT`。

API 返回三个方向上的磁场强度：

- `x`：X 轴方向的磁场强度。
- `y`：Y 轴方向的磁场强度。
- `z`：Z 轴方向的磁场强度。

这些值描述的是三维空间中的磁场分量，不是可以直接显示给用户的“东、南、西、北”。

**基于文档内容推导：**如果要实现完整指南针，还需要结合设备坐标系、设备姿态、数据校准以及方向计算。当前文档没有介绍这些算法。

### 设备坐标轴

React Web 开发通常处理页面中的二维坐标，而移动设备传感器返回的是相对于设备本身的三维坐标。

本文档只说明了 `x`、`y`、`z` 分别代表对应轴上的磁场强度，没有详细定义设备在不同握持方向下的轴线朝向，也没有说明横竖屏切换时应如何转换坐标。

因此，不应仅凭本文档假设：

- `x` 永远代表东西方向。
- `y` 永远代表南北方向。
- 某一个轴的值可以直接作为指南针角度。

### 校准值与原始值

`expo-sensors` 提供两种磁力计接口：

- `Magnetometer`：获取经过校准的磁力计值。
- `MagnetometerUncalibrated`：获取未经校准的原始值。

文档示例和详细 API 说明集中在 `Magnetometer`。虽然导入示例中包含 `MagnetometerUncalibrated`，但当前页面没有进一步说明它的方法、数据结构、平台差异或校准方式。

### 监听器与订阅对象

磁力计数据是连续产生的，使用方式更接近浏览器事件监听，而不是发起一次 HTTP 请求。

调用 `Magnetometer.addListener()` 后会获得一个订阅对象。调用订阅对象的 `remove()` 方法即可停止监听：

```js
const subscription = Magnetometer.addListener(measurement => {
  console.log(measurement);
});

subscription.remove();
```

对 React Web 开发者来说，可以将它类比为：

```js
window.addEventListener('resize', listener);
window.removeEventListener('resize', listener);
```

区别在于 Expo API 把取消监听封装到了返回的订阅对象中。

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

`expo install` 会根据当前 Expo SDK 选择兼容的依赖版本。它不是普通的浏览器端传感器库，而是包含移动端原生能力的 Expo 模块。

如果是在已有的 React Native 原生项目中安装，必须先按照 Expo 文档为项目安装并配置 `expo` 模块。当前页面没有展开这一配置流程。

## 基本使用流程

使用磁力计通常包括以下步骤：

1. 安装 `expo-sensors`。
2. 从包中导入 `Magnetometer`。
3. 检查设备是否具有可用的磁力计。
4. 根据需要检查或请求权限。
5. 设置更新间隔。
6. 注册监听器并处理测量结果。
7. 组件卸载或功能停用时移除监听器。

文档示例展示了其中的订阅、更新频率控制和取消订阅。

### 导入 API

```js
import {
  Magnetometer,
  MagnetometerUncalibrated,
} from 'expo-sensors';
```

只需要校准数据时，可以仅导入：

```js
import { Magnetometer } from 'expo-sensors';
```

### 订阅数据

```js
const subscription = Magnetometer.addListener(result => {
  setData(result);
});
```

每次有新数据时，回调都会收到一个 `MagnetometerMeasurement` 对象。

### 在 React 组件中清理监听器

文档示例在 `useEffect` 中开始订阅，并通过清理函数取消订阅：

```jsx
useEffect(() => {
  const subscription = Magnetometer.addListener(result => {
    setData(result);
  });

  return () => {
    subscription.remove();
  };
}, []);
```

这与 React Web 中清理定时器、WebSocket 或 DOM 事件监听器的原则相同：组件卸载后不能继续保留外部订阅。

### 控制更新频率

使用 `setUpdateInterval()` 设置两次传感器更新之间期望的时间间隔：

```js
Magnetometer.setUpdateInterval(1000); // 约每秒一次
Magnetometer.setUpdateInterval(16);   // 期望约每 16 毫秒一次
```

参数单位是毫秒。间隔越短，理论上的数据更新频率越高：

| 间隔 | 理论频率 | 示例用途 |
| --- | ---: | --- |
| `1000ms` | 约 1Hz | 低频观察或调试 |
| `16ms` | 约 62.5Hz | 更流畅地观察变化 |

这里设置的是期望间隔，不应理解为所有设备都会严格按照该周期产生数据。

Android 12（API Level 31）及更高版本对每个传感器的更新频率设置了 `200Hz` 上限。也就是说，要求超过每秒 200 次的更新不会突破系统限制。

## 文档示例解析

示例组件实现了以下功能：

- 使用 `useState` 保存最新的 `x`、`y`、`z` 数据。
- 使用另一个 state 保存订阅对象。
- 组件挂载时自动订阅。
- 组件卸载时取消订阅。
- 允许用户手动开启或关闭订阅。
- 提供 `Slow` 和 `Fast` 按钮修改更新间隔。
- 使用 React Native 的 `View`、`Text` 和 `TouchableOpacity` 构建界面。

其中：

```jsx
const [{ x, y, z }, setData] = useState({
  x: 0,
  y: 0,
  z: 0,
});
```

使用对象解构保存最新测量值。

```jsx
const [subscription, setSubscription] = useState(null);
```

保存当前订阅对象。值为 `null` 时表示没有活动订阅。

```jsx
subscription && subscription.remove();
setSubscription(null);
```

先停止接收事件，再清空订阅状态。

### React Native UI 与 React Web 的区别

示例中的组件不能直接替换成 HTML 标签来理解：

| React Native | React Web 中的近似概念 |
| --- | --- |
| `View` | `div` |
| `Text` | 文本元素，如 `span` 或 `p` |
| `TouchableOpacity` | 可点击按钮 |
| `StyleSheet.create()` | 集中定义样式对象 |
| `onPress` | 类似 `onClick` |

React Native 样式使用 JavaScript 对象，不是 CSS 文件。例如：

```js
flexDirection: 'row'
```

对应 Web CSS 中的：

```css
flex-direction: row;
```

这些 UI API 只是示例界面的组成部分，与磁力计本身没有直接关系。

## `Magnetometer` API

`Magnetometer` 是一个继承自 `DeviceSensor<MagnetometerMeasurement>` 的类，支持 Android 和 iOS。

### `addListener(listener)`

订阅磁力计更新：

```js
const subscription = Magnetometer.addListener(measurement => {
  console.log(measurement);
});
```

参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `listener` | `Listener<MagnetometerMeasurement>` | 有新测量值时调用的回调 |

返回值为 `EventSubscription`，可调用 `remove()` 取消监听。

### `getListenerCount()`

```js
const count = Magnetometer.getListenerCount();
```

返回已经注册的监听器数量，类型为 `number`。

### `hasListeners()`

```js
const listening = Magnetometer.hasListeners();
```

返回 `boolean`，表示当前传感器是否存在已注册的监听器。

### `isAvailableAsync()`

```js
const available = await Magnetometer.isAvailableAsync();
```

异步检查当前设备是否具有可用磁力计，返回 `Promise<boolean>`。

最低系统要求：

- Android 2.3，即 API Level 9。
- iOS 8。

文档明确警告：尝试使用磁力计前，应始终先检查传感器是否可用。

即使应用运行在受支持的系统版本上，也不能据此认定具体设备一定配备磁力计。系统版本兼容性与硬件可用性是两个不同条件。

### `getPermissionsAsync()`

```js
const permission = await Magnetometer.getPermissionsAsync();
```

检查用户是否授予传感器访问权限，返回 `Promise<PermissionResponse>`。

### `requestPermissionsAsync()`

```js
const permission = await Magnetometer.requestPermissionsAsync();
```

请求用户授予传感器访问权限，同样返回 `Promise<PermissionResponse>`。

文档提供了权限 API 和返回类型，但没有说明磁力计在各 Android、iOS 版本上的具体弹窗行为或所需原生权限配置。

### `setUpdateInterval(intervalMs)`

```js
Magnetometer.setUpdateInterval(100);
```

设置期望的传感器更新间隔：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `intervalMs` | `number` | 两次更新之间期望的毫秒数 |

返回值为 `void`。

### `removeSubscription(subscription)`

```js
Magnetometer.removeSubscription(subscription);
```

接收一个 `EventSubscription` 并移除对应订阅，返回 `void`。

文档同时推荐直接使用订阅对象的 `remove()` 方法进行清理。

### `removeAllListeners()`

移除全部已注册监听器，返回 `void`。

该方法已经被标记为废弃。应改用：

```js
subscription.remove();
```

使用订阅对象精确移除自己创建的监听器，可以避免意外影响应用中其他模块注册的监听器。

## 测量数据结构

`MagnetometerMeasurement` 表示一次磁力计测量结果：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `timestamp` | `number` | 测量时间戳，单位为秒 |
| `x` | `number` | X 轴方向的磁场强度，单位为 `μT` |
| `y` | `number` | Y 轴方向的磁场强度，单位为 `μT` |
| `z` | `number` | Z 轴方向的磁场强度，单位为 `μT` |

示例回调：

```js
Magnetometer.addListener(({ x, y, z, timestamp }) => {
  console.log({ x, y, z, timestamp });
});
```

注意，`timestamp` 的单位是秒，不应在没有转换的情况下将它当成 JavaScript 常见的毫秒时间戳使用。

## 订阅对象

`Subscription` 用于移除对应的事件监听器。

### `remove()`

```js
subscription.remove();
```

调用后，该监听器将不再接收事件。方法返回 `void`。

取消订阅后，不应继续把该对象视为活动订阅。React 组件中通常还需要同步将保存它的状态或 ref 清空。

## 权限返回结构

`PermissionResponse` 包含以下属性：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `granted` | `boolean` | 是否已经获得权限 |
| `status` | `PermissionStatus` | 权限的详细状态 |
| `canAskAgain` | `boolean` | 是否还能再次向用户请求权限 |
| `expires` | `PermissionExpiration` | 权限过期时间 |

### 权限状态

`PermissionStatus` 有三个值：

| 枚举值 | 字符串值 | 含义 |
| --- | --- | --- |
| `PermissionStatus.GRANTED` | `"granted"` | 用户已授权 |
| `PermissionStatus.DENIED` | `"denied"` | 用户已拒绝 |
| `PermissionStatus.UNDETERMINED` | `"undetermined"` | 用户尚未授权或拒绝 |

权限处理不能只区分成功与失败。`UNDETERMINED` 表示还没有得到用户决定，通常可以发起权限请求；`DENIED` 则表示用户已经拒绝。

如果 `canAskAgain` 为 `false`，文档指出应引导用户前往系统设置页面修改权限，而不是反复调用请求权限 API。

### 权限过期时间

`PermissionExpiration` 的类型为：

```ts
'never' | number
```

文档说明当前所有权限都是永久授予，因此实际值目前是 `'never'`。类型中仍保留了数字形式，代码不应错误地把 `expires` 固定声明成字符串。

## 推荐的实际接入方式

下面的流程组合了文档中分别提供的可用性、权限和订阅 API：

```jsx
import { useEffect, useState } from 'react';
import { Magnetometer } from 'expo-sensors';

export default function SensorExample() {
  const [measurement, setMeasurement] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let subscription = null;
    let active = true;

    async function start() {
      const available = await Magnetometer.isAvailableAsync();

      if (!available) {
        if (active) {
          setError('当前设备不支持磁力计');
        }
        return;
      }

      const permission = await Magnetometer.requestPermissionsAsync();

      if (!permission.granted) {
        if (active) {
          setError('未获得传感器访问权限');
        }
        return;
      }

      Magnetometer.setUpdateInterval(100);

      subscription = Magnetometer.addListener(result => {
        if (active) {
          setMeasurement(result);
        }
      });
    }

    start();

    return () => {
      active = false;
      subscription?.remove();
    };
  }, []);

  // 根据 measurement 和 error 渲染 React Native 界面
}
```

这段代码属于**基于文档内容推导**的组合示例，并非原文直接提供。它体现了三个必要的防御点：

- 使用前检查硬件是否可用。
- 根据权限结果决定是否订阅。
- 组件卸载时移除订阅。

## 注意事项与限制

### 必须检查硬件可用性

文档明确要求在使用磁力计前调用 `isAvailableAsync()`。不能因为应用运行在 Android 或 iOS 上，就假设设备一定包含磁力计。

### 高频更新会频繁触发 React 状态更新

文档的快速模式使用 `16ms` 间隔。每次监听回调都调用 `setState`，可能导致每秒数十次组件更新。

**基于文档内容推导：**实际项目应根据业务需要选择更新频率，不要默认使用最短间隔。若只需要低频展示，可以增大间隔；若需要高频计算，可以考虑避免让整个页面跟随每个传感器事件重新渲染。

### Android 12 存在频率上限

从 Android 12（API Level 31）开始，每个传感器的更新频率上限为 `200Hz`。设置更短的间隔不代表系统会提供超过这一限制的数据。

### 必须清理订阅

忘记调用 `subscription.remove()` 可能导致：

- 组件离开后回调仍在执行。
- 出现重复订阅。
- 不必要地持续处理传感器数据。
- 多次进入页面后收到多份相同更新。

应优先移除当前模块创建的具体订阅，不要依赖已废弃的 `removeAllListeners()`。

### 示例没有完整处理权限与可用性

原文的基础示例直接开始订阅，主要用于演示 API 用法。它没有调用：

- `isAvailableAsync()`
- `getPermissionsAsync()`
- `requestPermissionsAsync()`

正式应用不能因此忽略这些 API，尤其是文档已经明确要求先检查传感器可用性。

### 当前页面没有覆盖的内容

当前文档未涉及：

- 根据磁力计数据计算指南针方向的公式。
- 真北、磁北以及磁偏角处理。
- 设备横竖屏变化时的坐标转换。
- 如何检测或处理磁场干扰。
- 用户执行“画 8 字”等校准动作的流程。
- `MagnetometerUncalibrated` 的详细 API。
- 后台运行时是否可以继续接收数据。
- 各平台具体需要修改哪些原生配置文件。
- 测量精度、误差范围及不同设备间的差异。
- 自动化测试或模拟磁力计数据的方法。

## React Web 开发者容易误解的地方

1. **这不是浏览器 API。**  
   `expo-sensors` 通过 React Native 和 Expo 访问移动设备原生传感器，不能按普通 npm 前端库理解。

2. **支持平台不等于硬件一定存在。**  
   Android 和 iOS 支持这套 API，但具体设备仍可能没有可用磁力计。

3. **监听回调不是 React 生命周期的一部分。**  
   React 不会自动释放传感器订阅，必须在 `useEffect` 清理函数中调用 `remove()`。

4. **三个轴的值不是方向角。**  
   `x`、`y`、`z` 是磁场分量，不能直接当作经纬度、旋转角度或指南针读数。

5. **更新间隔不是精确计时器。**  
   `setUpdateInterval()` 表示期望的传感器采样间隔，还会受到设备硬件和操作系统限制。

6. **Expo Go 支持不代表所有原生项目都无需配置。**  
   在 Expo Go 中模块已经包含；已有 React Native 原生项目则需要先安装 Expo 模块支持。

## 实际开发建议

以下内容属于**基于经验建议**：

- 在真实设备上测试。桌面浏览器无法复现移动设备磁力计的硬件行为。
- 将传感器订阅封装为自定义 Hook，统一处理可用性、权限、更新间隔和清理。
- 仅在相关页面可见或功能开启时订阅，功能关闭后立即移除订阅。
- 高频数据用于计算时，可以使用 `useRef` 保存最新值，避免每次更新都触发整棵组件树渲染。
- 为“不支持传感器”“权限被拒绝”和“不能再次询问权限”提供不同的用户提示。
- 不要仅在模拟器中验证最终效果。磁力计功能依赖真实硬件，模拟环境的行为可能不具代表性。
- 如果目标是实现可靠指南针，应另外查阅设备方向、坐标转换和磁场校准相关资料。

## 总结

`Magnetometer` 是 `expo-sensors` 中用于读取校准后磁力计数据的接口。它通过监听器连续返回以 `μT` 为单位的 `x`、`y`、`z` 三轴磁场强度及秒级时间戳。

实际接入时最重要的是：

- 使用 `isAvailableAsync()` 检查硬件可用性。
- 正确处理传感器权限状态。
- 使用 `setUpdateInterval()` 控制更新频率。
- 通过 `addListener()` 获取连续测量数据。
- 在组件卸载或功能停用时调用 `subscription.remove()`。
- 不要把三轴磁场数据误认为已经计算完成的指南针方向。
- 根据项目使用的 Expo SDK 版本阅读对应版本的文档。

---

## 文档导航

- **上一页**：[location](./188__location.md)
- **下一页**：[mail composer](./190__mail-composer.md)
