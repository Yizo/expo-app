# Expo LightSensor：在 Android 设备中读取环境光照度

> 原文档修改日期：2026 年 1 月 15 日  
> 文档版本：下一版本 Expo SDK 的未发布文档  
> 当前稳定版本：SDK 56  
> 所属包：`expo-sensors`  
> 支持平台：Android、Expo Go

## 文档解决的问题

`LightSensor` 用于访问设备的环境光传感器，持续接收周围光线强度的变化。

应用可以根据光照度进行响应，例如：

- 显示当前环境的明暗程度。
- 根据环境光线调整界面。
- 收集设备传感器数据。
- 在光照变化时触发应用逻辑。

需要特别注意：当前文档明确标注 `LightSensor` **仅支持 Android**，不能将示例中的 `Platform.OS` 判断理解为 iOS 也能读取该传感器。

此外，这是一篇面向下一版本 Expo SDK 的未发布文档。实际项目应核对所使用 Expo SDK 版本对应的正式文档，避免直接采用尚未进入稳定版本的 API 行为。

## 阅读前需要理解的背景知识

### Expo、React Native 与 `expo-sensors`

React Native 使用 React 的组件和状态模型开发移动应用，但最终运行的是 iOS 或 Android 原生应用，而不是浏览器网页。

`expo-sensors` 是 Expo 提供的设备传感器模块，其中包含 `LightSensor`。它负责连接 JavaScript 代码与 Android 的原生传感器能力。

对于 React Web 开发者，可以这样类比：

- React Web 通过浏览器 API 访问设备能力。
- React Native 通过原生模块访问手机系统能力。
- `LightSensor.addListener()` 类似浏览器中的 `addEventListener()`。
- 返回的订阅对象类似事件监听句柄，调用 `remove()` 可以取消监听。

### 光照度与 lux

传感器返回的 `illuminance` 表示环境光照度，单位为 lux，缩写为 `lx`。

数值越高，通常表示设备周围越明亮。但本文档没有给出不同 lux 数值对应的具体环境，也没有规定应当使用什么阈值判断明暗。

### Expo Go

文档标注该功能包含在 Expo Go 中，意味着可以使用 Expo Go 对支持的 Android 设备进行开发测试。

不过，Expo Go 只解决模块是否随客户端提供的问题。设备本身仍然必须具有并启用光传感器，因此使用前依然需要调用 `isAvailableAsync()`。

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

`expo install` 不只是普通的依赖安装命令，它会为当前 Expo SDK 选择兼容的包版本。对于 Expo 项目，应优先使用它，而不是直接运行 `npm install expo-sensors`。

如果这是一个已有的、不以 Expo 为基础的 React Native 原生项目，还需要先按照 Expo 的说明安装并配置 `expo` 模块。仅安装 `expo-sensors` 并不一定足以完成原生集成。

本文档未涉及：

- iOS 原生工程配置。
- Android Manifest 配置。
- Development Build 的创建流程。
- 传感器模块的原生链接细节。

## 基本使用流程

首先导入 `LightSensor`：

```js
import { LightSensor } from 'expo-sensors';
```

完整使用过程可以归纳为：

1. 确认当前平台是 Android。
2. 检查设备是否提供并启用了光传感器。
3. 如有需要，检查或请求访问权限。
4. 使用 `addListener()` 订阅传感器更新。
5. 从回调参数中读取 `illuminance` 和 `timestamp`。
6. 不再需要数据时调用订阅对象的 `remove()`。
7. 组件卸载时清理订阅。

### 订阅传感器数据

```jsx
const subscription = LightSensor.addListener(sensorData => {
  setData(sensorData);
});
```

每次有新的传感器数据时，回调都会收到一个 `LightSensorMeasurement` 对象：

```ts
{
  illuminance: number;
  timestamp: number;
}
```

其中：

| 属性 | 含义 |
| --- | --- |
| `illuminance` | 环境光照度，单位为 lux（`lx`） |
| `timestamp` | 本次测量的时间戳，单位为秒 |

### 取消订阅

```js
subscription.remove();
```

取消后，对应监听器不会再收到传感器事件。

这相当于 React Web 中移除事件监听器。它既能避免组件卸载后继续更新状态，也能减少不必要的原生传感器工作。

### 在组件生命周期中使用

原文示例在组件挂载时开始订阅，并在 `useEffect` 清理函数中尝试取消订阅：

```jsx
useEffect(() => {
  subscribe();
  return () => unsubscribe();
}, []);
```

实际开发时，更直接的写法是让当前 `useEffect` 持有订阅对象：

```jsx
useEffect(() => {
  const subscription = LightSensor.addListener(sensorData => {
    setData(sensorData);
  });

  return () => {
    subscription.remove();
  };
}, []);
```

> **基于文档示例代码推导：**原示例把订阅对象保存在 state 中，但空依赖数组的 `useEffect` 清理函数可能捕获首次渲染时的旧 state 值。直接在 effect 内保存并清理订阅对象，可以避免闭包值不同步的问题。

## 平台与可用性检查

### 仅支持 Android

文档中的类、方法、接口和类型都标注为 Android 平台支持。

示例使用以下代码避免在其他平台显示 Android 传感器值：

```jsx
Platform.OS === 'android'
  ? `${illuminance} lx`
  : 'Only available on Android'
```

这只是界面显示判断，不会自动阻止业务代码在其他平台调用 `LightSensor`。实际开发应在订阅之前进行平台判断。

### 检查设备能力

```js
const available = await LightSensor.isAvailableAsync();
```

该方法返回 `Promise<boolean>`：

- `true`：光传感器可用并已启用。
- `false`：当前设备无法使用该传感器。

文档明确警告：**尝试使用传感器之前，应始终检查其可用性。**

该 API 至少要求 Android 2.3，即 API Level 9。但达到该系统版本并不代表设备一定配备光传感器。

## API 说明

`LightSensor` 是一个继承自 `DeviceSensor<LightSensorMeasurement>` 的类。这里的泛型表示该传感器发出的数据符合 `LightSensorMeasurement` 结构。

### `addListener(listener)`

订阅光传感器更新：

```js
const subscription = LightSensor.addListener(measurement => {
  console.log(measurement.illuminance);
});
```

参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `listener` | `Listener<LightSensorMeasurement>` | 有新数据时调用的回调函数 |

返回值为 `EventSubscription`，通过其 `remove()` 方法取消当前监听。

### `getListenerCount()`

```js
const count = LightSensor.getListenerCount();
```

返回当前已注册的监听器数量，类型为 `number`。

它适合用于调试重复订阅问题。文档没有要求业务代码必须调用该方法。

### `hasListeners()`

```js
const listening = LightSensor.hasListeners();
```

返回 `boolean`，表示当前传感器是否注册了至少一个监听器。

它只能说明是否存在监听器，不能代替 `isAvailableAsync()`，也不能证明监听器正在收到有效数据。

### `isAvailableAsync()`

```js
const available = await LightSensor.isAvailableAsync();
```

异步检查当前设备的光传感器是否可用并已启用，返回 `Promise<boolean>`。

### `setUpdateInterval(intervalMs)`

```js
LightSensor.setUpdateInterval(500);
```

设置期望的传感器更新间隔：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `intervalMs` | `number` | 两次传感器更新之间期望的毫秒数 |

例如，`500` 表示期望每 500 毫秒接收一次更新。

Android 12（API Level 31）开始，系统对每个传感器的更新频率设有 **200 Hz** 上限。

> **基于文档内容推导：**这里设置的是“期望间隔”，应用不应把传感器回调当作严格精确的定时器。文档没有保证回调一定按照指定毫秒数准时执行。

### `removeAllListeners()`

```js
LightSensor.removeAllListeners();
```

删除全部已注册的监听器，返回 `void`。

该方法已被弃用。文档要求改用具体订阅对象的：

```js
subscription.remove();
```

`removeAllListeners()` 会影响所有监听者，而 `subscription.remove()` 只清理由当前代码创建的订阅，所有权更明确。

### `removeSubscription(subscription)`

```js
LightSensor.removeSubscription(subscription);
```

接收一个 `EventSubscription` 并移除该订阅，返回 `void`。

文档保留了该方法，但主要示例和弃用提示推荐直接调用：

```js
subscription.remove();
```

### 权限相关方法

#### `getPermissionsAsync()`

```js
const response = await LightSensor.getPermissionsAsync();
```

检查用户授予的传感器访问权限，返回 `Promise<PermissionResponse>`。

#### `requestPermissionsAsync()`

```js
const response = await LightSensor.requestPermissionsAsync();
```

请求用户授予传感器访问权限，同样返回 `Promise<PermissionResponse>`。

本文档没有说明光传感器在不同 Android 版本中何时会弹出权限对话框，也没有给出完整的权限处理示例。

## 权限返回结构

`PermissionResponse` 包含以下属性：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `granted` | `boolean` | 是否已经获得权限的便捷判断值 |
| `status` | `PermissionStatus` | 权限当前状态 |
| `canAskAgain` | `boolean` | 是否还能再次向用户发起权限请求 |
| `expires` | `'never' \| number` | 权限的过期时间 |

当前所有权限均为永久授予，因此 `expires` 当前表现为 `'never'`。类型中仍然保留了 `number`，应用不应因为当前行为而随意忽略类型定义。

### `PermissionStatus`

权限状态共有三种：

| 枚举值 | 字符串值 | 含义 |
| --- | --- | --- |
| `PermissionStatus.GRANTED` | `"granted"` | 用户已授予权限 |
| `PermissionStatus.DENIED` | `"denied"` | 用户已拒绝权限 |
| `PermissionStatus.UNDETERMINED` | `"undetermined"` | 用户尚未作出选择 |

如果 `canAskAgain` 为 `false`，应用不能继续依赖重复调用请求方法，而应引导用户前往系统设置修改权限。

## 推荐的实际使用方式

下面的示例补充了平台检查、设备能力检查、错误状态和订阅清理：

```jsx
import { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { LightSensor } from 'expo-sensors';

export default function LightSensorExample() {
  const [illuminance, setIlluminance] = useState(null);
  const [message, setMessage] = useState('正在检查传感器');

  useEffect(() => {
    if (Platform.OS !== 'android') {
      setMessage('光传感器仅支持 Android');
      return;
    }

    let subscription;
    let cancelled = false;

    async function start() {
      const available = await LightSensor.isAvailableAsync();

      if (cancelled) {
        return;
      }

      if (!available) {
        setMessage('当前设备没有可用的光传感器');
        return;
      }

      setMessage('正在读取环境光');

      subscription = LightSensor.addListener(measurement => {
        setIlluminance(measurement.illuminance);
      });
    }

    start();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  return (
    <View>
      <Text>{message}</Text>
      {illuminance !== null && <Text>{illuminance} lx</Text>}
    </View>
  );
}
```

> **基于文档内容推导：**异步检查完成前，组件可能已经卸载，因此示例使用 `cancelled` 阻止卸载后创建订阅。原文档没有直接给出这一处理方式。

## 注意事项与容易踩坑的地方

### 不要把平台支持与设备支持混为一谈

Android 是受支持的平台，但并非所有 Android 设备都有光传感器。因此需要同时判断：

```js
Platform.OS === 'android'
```

以及：

```js
await LightSensor.isAvailableAsync()
```

### 必须管理订阅生命周期

每次调用 `addListener()` 都会创建一个新的监听器。反复订阅却不调用 `remove()`，可能造成：

- 同一数据被处理多次。
- 组件卸载后仍然触发回调。
- 不必要的传感器和计算开销。
- 开发环境中更难定位重复监听问题。

### 不要使用已弃用的清理方式

`removeAllListeners()` 已被明确标记为弃用。新代码应保存 `addListener()` 返回的订阅对象，并调用：

```js
subscription.remove();
```

### 更新间隔不是浏览器定时器

`setUpdateInterval()` 配置的是传感器数据更新频率，不等同于 `setInterval()`：

- 它控制的是原生传感器事件。
- 系统可能施加频率限制。
- 文档没有提供严格的回调时序保证。
- Android 12 及以上存在每个传感器最高 200 Hz 的限制。

### 不要直接假设 `illuminance` 一定有效

原文示例将初始值设为 `0`，但这可能让界面在首个测量值到达前显示 `0 lx`。

> **基于经验建议：**可使用 `null` 表示“尚未收到数据”，避免把初始状态误认为真实传感器读数。

### 真机与 Expo Go

文档说明该模块包含在 Expo Go 中，但没有说明模拟器是否能提供可信的环境光数据。

> **基于经验建议：**涉及物理传感器的功能应在具有光传感器的 Android 真机上验证，不要只依赖模拟环境。

## React Web 开发者需要特别注意的地方

1. `View`、`Text` 和 `TouchableOpacity` 是 React Native 组件，不是 HTML 元素。这里没有 `div`、`span` 或 DOM。
2. `StyleSheet.create()` 接收 JavaScript 样式对象，但它不是浏览器 CSS；例如 `paddingHorizontal` 是 React Native 样式属性。
3. `TouchableOpacity` 的 `onPress` 对应移动端点击交互，作用类似 Web 中按钮的 `onClick`。
4. `Platform.OS` 是运行平台判断，不是浏览器环境中的 User-Agent 检测。
5. `LightSensor` 依赖 Android 原生硬件能力，不是 React 自身提供的功能。
6. 传感器数据通过持续事件订阅到达，不是一次普通的 HTTP 请求。
7. React Native 的权限可能需要与操作系统设置交互，不能只通过应用内状态解决。
8. Fast Refresh、组件重新挂载或错误的 effect 依赖都可能产生重复订阅，因此清理函数是功能正确性的一部分，而不只是性能优化。

## 文档明确说明与推导内容的边界

### 文档明确说明

- `LightSensor` 来自 `expo-sensors`。
- 它用于访问设备的环境光传感器。
- 传感器数据包含 `illuminance` 和 `timestamp`。
- `illuminance` 使用 lux（`lx`）作为单位。
- 当前仅支持 Android，并包含在 Expo Go 中。
- 使用前应始终调用 `isAvailableAsync()` 检查可用性。
- 最低系统要求为 Android 2.3（API Level 9）。
- `addListener()` 返回可调用 `remove()` 的订阅对象。
- `removeAllListeners()` 已弃用。
- 可以通过 `setUpdateInterval()` 设置期望更新间隔。
- Android 12（API Level 31）开始存在 200 Hz 的传感器更新上限。
- 权限状态包括 `granted`、`denied` 和 `undetermined`。

### 基于文档内容推导

- 业务代码应分别处理平台不支持和设备缺少传感器两种情况。
- `setUpdateInterval()` 不应被当作精确计时器。
- 使用具体订阅对象清理比删除全部监听器更容易维护。
- 异步可用性检查需要考虑组件提前卸载的情况。
- 原文示例的 state 与闭包组合可能导致清理函数取得旧订阅值。

### 当前文档未涉及

- 不同 lux 数值对应的环境分类标准。
- 根据光照度自动切换主题的推荐阈值。
- 传感器数据的精度、误差范围和校准方式。
- 后台运行时是否持续接收数据。
- 电量消耗的具体数值。
- Android 原生权限配置文件的修改方式。
- iOS 的替代实现。
- 模拟器如何模拟环境光。
- 传感器异常的错误类型和异常处理 API。

## 总结

`LightSensor` 提供了一套事件订阅式 API，用于在 Android 设备上持续读取环境光照度。实际使用时，关键不只是调用 `addListener()`，还包括：

- 确认运行平台为 Android。
- 使用 `isAvailableAsync()` 检查硬件能力。
- 正确理解 `illuminance` 和 `timestamp`。
- 根据需要设置更新间隔。
- 在组件卸载或停止读取时调用 `subscription.remove()`。
- 正确处理权限状态和无法再次请求权限的情况。
- 按项目所使用的 Expo SDK 版本核对对应文档。

---

## 文档导航

- **上一页**：[keep awake](./181__keep-awake.md)
- **下一页**：[linear gradient](./183__linear-gradient.md)
