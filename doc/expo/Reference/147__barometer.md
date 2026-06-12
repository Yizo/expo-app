# Expo Barometer：读取设备气压计数据

`Barometer` 是 `expo-sensors` 包提供的设备传感器 API，用于监听气压变化。气压数据以百帕（`hPa`）为单位；在 iOS 设备上还可以获得相对高度变化。

> 本文对应 Expo 下一版本 SDK 的文档，修改日期为 2026 年 1 月 15 日。原文提示：需要稳定、最新版本资料时，应查看 SDK 56 对应文档。

## 文档解决的问题

本文主要说明如何在 Expo 或 React Native 应用中：

- 安装 `expo-sensors`
- 判断设备是否提供气压计
- 订阅和取消订阅气压计数据
- 调整传感器更新间隔
- 处理权限状态
- 理解 Android、iOS 和 Web 的平台差异

适合需要根据气压变化实现高度变化检测、环境数据展示或其他传感器功能的移动端应用。

当前文档只介绍读取气压计数据的基础 API，没有涉及：

- 根据气压计算绝对海拔
- 气压数据校准
- 后台持续采集
- 数据持久化
- 气象预测
- 原生工程中的权限配置文件修改
- 模拟器中的传感器测试方法

## 阅读前需要理解的概念

### Expo 与 `expo-sensors`

Expo 是构建 React Native 应用的一套工具和运行环境。`expo-sensors` 是其中的传感器库，统一封装了 Android 和 iOS 的原生传感器 API。

对于 React Web 开发者，可以将它理解为一个面向移动设备硬件能力的 npm 包。不过它与普通 Web API 存在重要区别：

- 底层数据来自 Android/iOS 原生传感器。
- 同一个 API 在不同系统上的能力可能不同。
- 设备可能根本没有对应硬件。
- 浏览器环境不能使用本文介绍的气压计 API。

### 气压与相对高度

`Barometer` 主要提供气压值，单位为百帕（hectopascal，`hPa`）。

iOS 还会提供 `relativeAltitude`，单位为米（`m`）。它表示当前高度相对于某个参考点的变化，而不是相对于海平面的绝对海拔。

例如，开始监听后设备向上移动了一层楼，`relativeAltitude` 可以反映这段高度变化，但不能直接理解为“设备当前海拔是多少”。

### 监听器与订阅对象

气压计的数据会持续变化，因此 API 采用事件订阅模式，而不是只返回一次结果：

```ts
const subscription = Barometer.addListener(listener);
```

`addListener()` 返回一个订阅对象。停止监听时调用：

```ts
subscription.remove();
```

这与 React Web 中通过 `addEventListener()` 注册事件、再通过清理函数移除事件的思路相似。

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

`expo install` 会为当前 Expo SDK 选择兼容的软件包版本，不完全等同于直接执行 `npm install expo-sensors`。

如果是在已有的原生 React Native 项目中使用，还必须先在项目中安装和配置 Expo Modules，也就是原文所说的先安装 `expo`。单独添加 `expo-sensors` 并不代表普通 React Native 工程已经具备运行 Expo 模块的条件。

## 基本使用流程

使用时从 `expo-sensors` 导入 `Barometer`：

```js
import { Barometer } from 'expo-sensors';
```

典型流程是：

1. 检查设备是否支持气压计。
2. 必要时检查或申请权限。
3. 使用 `Barometer.addListener()` 开始监听。
4. 在回调中接收测量数据并更新界面。
5. 不再需要数据时调用 `subscription.remove()`。

### 文档示例解析

```jsx
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { Barometer } from 'expo-sensors';

export default function App() {
  const [{ pressure, relativeAltitude }, setData] = useState({
    pressure: 0,
    relativeAltitude: 0,
  });
  const [subscription, setSubscription] = useState(null);

  const toggleListener = () => {
    subscription ? unsubscribe() : subscribe();
  };

  const subscribe = () => {
    setSubscription(Barometer.addListener(setData));
  };

  const unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  return (
    <View style={styles.wrapper}>
      <Text>
        Barometer: Listener {subscription ? 'ACTIVE' : 'INACTIVE'}
      </Text>
      <Text>Pressure: {pressure} hPa</Text>
      <Text>
        Relative Altitude:{' '}
        {Platform.OS === 'ios'
          ? `${relativeAltitude} m`
          : 'Only available on iOS'}
      </Text>
      <TouchableOpacity onPress={toggleListener} style={styles.button}>
        <Text>Toggle listener</Text>
      </TouchableOpacity>
    </View>
  );
}
```

示例中包含两个状态：

- `data`：保存最近一次气压计测量结果。
- `subscription`：保存监听器的订阅对象，同时用于判断监听是否启用。

`Barometer.addListener(setData)` 会在每次收到数据时直接调用 React 的 `setData`。回调参数的结构与状态对象兼容，因此最新测量值会替换旧值并触发重新渲染。

`Platform.OS` 用来判断当前原生平台。由于 `relativeAltitude` 只有 iOS 支持，示例不会在 Android 上直接展示它。

`TouchableOpacity` 类似 Web 中可点击的按钮，但它是 React Native 组件，并不是 HTML 元素。

## 推荐的 React 生命周期写法

原文示例通过按钮手动开始和停止监听，但没有演示组件卸载时的清理。

下面是**基于文档内容推导**的 React 生命周期写法：

```tsx
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Barometer, BarometerMeasurement } from 'expo-sensors';

export default function BarometerView() {
  const [measurement, setMeasurement] =
    useState<BarometerMeasurement | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let subscription: { remove(): void } | undefined;

    async function start() {
      const isAvailable = await Barometer.isAvailableAsync();
      setAvailable(isAvailable);

      if (isAvailable) {
        subscription = Barometer.addListener(setMeasurement);
      }
    }

    start();

    return () => {
      subscription?.remove();
    };
  }, []);

  if (available === null) {
    return <Text>正在检查气压计...</Text>;
  }

  if (!available) {
    return <Text>当前设备不支持气压计</Text>;
  }

  return (
    <View>
      <Text>气压：{measurement?.pressure ?? '--'} hPa</Text>
    </View>
  );
}
```

这段代码不是原文直接给出的完整示例，但遵循了原文的两项明确要求：

- 使用前检查可用性。
- 使用订阅对象的 `remove()` 停止监听。

它类似于 React Web 中在 `useEffect` 里注册事件，并在 cleanup 函数里解除事件监听。

## `Barometer` API

`Barometer` 是一个继承自 `DeviceSensor<BarometerMeasurement>` 的类。这里的泛型表示其监听器接收的数据类型是 `BarometerMeasurement`。

### `addListener(listener)`

订阅气压计更新：

```ts
const subscription = Barometer.addListener(
  ({ pressure, relativeAltitude }) => {
    console.log({ pressure, relativeAltitude });
  }
);
```

参数：

| 参数 | 类型 | 作用 |
| --- | --- | --- |
| `listener` | `Listener<BarometerMeasurement>` | 每当产生气压计更新时执行的回调 |

返回值是 `EventSubscription`。停止监听时调用：

```ts
subscription.remove();
```

支持 Android 和 iOS。

### `isAvailableAsync()`

检查当前设备是否提供可用的气压计：

```ts
const available = await Barometer.isAvailableAsync();
```

返回：

```ts
Promise<boolean>
```

原文明确警告：**尝试使用传感器前，应始终检查其可用性。**

最低系统要求：

- Android 2.3，即 API Level 9
- iOS 8

满足系统版本要求并不必然代表设备存在气压计硬件，因此仍需调用该方法检查。

### `setUpdateInterval(intervalMs)`

设置期望的传感器更新间隔：

```ts
Barometer.setUpdateInterval(500);
```

参数单位为毫秒。例如 `500` 表示期望每 500 毫秒接收一次更新。

返回值为 `void`。

从 Android 12（API Level 31）开始，系统对每个传感器的更新频率设有 `200Hz` 上限。`200Hz` 表示理论上每秒最多更新 200 次，也就是约每 5 毫秒一次。

这里设置的是期望间隔。原文没有保证设备一定会严格按照该间隔产生数据。

### `getListenerCount()`

返回当前已注册的监听器数量：

```ts
const count = Barometer.getListenerCount();
```

返回类型为 `number`。

它可以用于调试重复注册监听器等问题。

### `hasListeners()`

判断气压计当前是否至少注册了一个监听器：

```ts
const listening = Barometer.hasListeners();
```

返回类型为 `boolean`。

### `removeAllListeners()`

移除全部已注册监听器：

```ts
Barometer.removeAllListeners();
```

返回值为 `void`。

该方法已经废弃。原文建议使用各订阅对象自己的 `subscription.remove()`，这样可以只移除对应监听器，避免影响其他模块创建的订阅。

### `removeSubscription(subscription)`

移除指定订阅：

```ts
Barometer.removeSubscription(subscription);
```

参数类型为 `EventSubscription`，返回值为 `void`。

原文列出了此方法，但没有提供额外的使用说明。常规取消订阅方式仍是直接调用 `subscription.remove()`。

### `getPermissionsAsync()`

检查用户是否已授予访问传感器的权限：

```ts
const permission = await Barometer.getPermissionsAsync();
```

返回：

```ts
Promise<PermissionResponse>
```

### `requestPermissionsAsync()`

请求用户授予传感器访问权限：

```ts
const permission = await Barometer.requestPermissionsAsync();
```

返回：

```ts
Promise<PermissionResponse>
```

原文没有说明具体系统版本是否一定会显示授权弹窗，也没有列出需要添加到 iOS 或 Android 原生配置文件中的权限声明。因此不能仅根据当前文档推断额外的原生配置要求。

## 测量数据结构

### `BarometerMeasurement`

监听器收到的测量对象包含以下字段：

| 字段 | 类型 | 平台 | 含义 |
| --- | --- | --- | --- |
| `pressure` | `number` | Android、iOS | 气压值，单位为 `hPa` |
| `relativeAltitude` | `number`，可选 | iOS | 相对高度，单位为米 |
| `timestamp` | `number` | Android、iOS | 测量时间戳，单位为秒 |

由于 `relativeAltitude` 是可选字段，业务代码不应默认它一定存在：

```ts
if (measurement.relativeAltitude !== undefined) {
  console.log(`${measurement.relativeAltitude} m`);
}
```

原文将该数据描述为来自原生传感器的高度数据，但 Android 实际只提供气压值；相对高度字段仅受 iOS 支持。

## 订阅对象

`Subscription` 表示一次事件订阅，提供一个 `remove()` 方法：

```ts
subscription.remove();
```

调用后，该订阅所对应的监听器将不再收到传感器事件。

应用应保留 `addListener()` 返回的订阅对象，否则后续很难准确移除对应监听器。

## 权限结果

### `PermissionResponse`

权限查询和请求方法返回以下对象：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `granted` | `boolean` | 是否已获得权限 |
| `status` | `PermissionStatus` | 具体权限状态 |
| `canAskAgain` | `boolean` | 是否还能再次向用户请求权限 |
| `expires` | `PermissionExpiration` | 权限何时过期 |

`status` 有三种值：

| 枚举值 | 字符串值 | 含义 |
| --- | --- | --- |
| `PermissionStatus.GRANTED` | `"granted"` | 用户已授权 |
| `PermissionStatus.DENIED` | `"denied"` | 用户已拒绝 |
| `PermissionStatus.UNDETERMINED` | `"undetermined"` | 用户尚未作出选择 |

当 `canAskAgain` 为 `false` 时，应用不能继续通过弹窗重复请求，应引导用户到系统设置中修改权限。

`PermissionExpiration` 的类型为：

```ts
'never' | number
```

当前所有权限都是永久授予，因此实际会使用 `'never'`；类型中仍保留了数字形式。

## 平台能力与底层实现

| 平台 | 单位 | 底层提供者 | 能力 |
| --- | --- | --- | --- |
| iOS | `hPa` | `CMAltimeter` | 提供气压；高度事件表示相对高度变化 |
| Android | `hPa` | `Sensor.TYPE_PRESSURE` | 监测气压变化 |
| Web | 不支持 | 无 | 无法访问该传感器 |

### iOS

iOS 的底层实现使用 `CMAltimeter`。

需要特别注意：

- 只支持真实设备，不能把 iOS 模拟器视为可用的气压计运行环境。
- `relativeAltitude` 表示从当前参考点开始的高度变化，不是绝对海拔。

### Android

Android 使用 `Sensor.TYPE_PRESSURE` 获取气压数据。

Android 不提供本文 API 中的 `relativeAltitude`。如果业务需要高度值，当前文档没有给出转换方法。

### Web

Web 完全不支持该传感器。尝试获取数据会抛出 `UnavailabilityError`。

这意味着共享 React Native 与 Web 代码时，不能只隐藏高度字段，还必须避免在 Web 上调用气压计 API。

```ts
import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  const available = await Barometer.isAvailableAsync();
  // 后续处理
}
```

以上平台分支示例属于**基于文档内容推导**。原文明确说明了 Web 不可用并会抛出错误，但没有提供这段防护代码。

## React Web 开发者容易误解的地方

### 这不是浏览器传感器 API

即使 React Native 项目可能同时构建 Web 版本，`Barometer` 也不能在浏览器中使用。React Native 的跨平台组件模型不代表所有原生硬件能力都能跨平台。

### 支持某个操作系统不等于所有设备都支持

API 标记支持 Android 和 iOS，只表示库为这些系统提供了实现。实际设备仍可能缺少气压计，所以不能用 `Platform.OS` 代替 `isAvailableAsync()`。

### `relativeAltitude` 不是海拔

它只表示相对高度变化，而且只存在于 iOS。不能直接把它展示成用户当前位置的绝对海拔。

### 订阅必须清理

组件重复挂载或重复调用 `addListener()` 会创建多个监听器。若不调用 `remove()`，旧监听器可能继续接收数据并触发状态更新。

对 React 开发者来说，应将它视为需要清理的外部副作用，与定时器、WebSocket 和 DOM 事件监听器类似。

### 更新频率不是渲染频率越高越好

频繁调用监听回调会带来更多状态更新和界面渲染。Android 12 的 `200Hz` 是系统上限，不是推荐的界面刷新频率。

**基于经验建议：** 如果只是向用户展示气压变化，应根据实际界面需要选择合理间隔，避免为人眼无法分辨的高频更新持续触发 React 渲染。

## 注意事项与限制

1. 使用前始终调用 `isAvailableAsync()`。
2. iOS 气压计只支持真实设备。
3. `relativeAltitude` 仅在 iOS 上存在，而且是可选字段。
4. 相对高度不是绝对海拔。
5. Web 不支持该 API，调用时会抛出 `UnavailabilityError`。
6. Android 12 及以上对单个传感器更新设有 `200Hz` 上限。
7. 不再需要监听时应调用 `subscription.remove()`。
8. `removeAllListeners()` 已废弃，不应在新代码中使用。
9. 文档没有保证 `setUpdateInterval()` 的实际更新间隔精确等于请求值。
10. 文档没有介绍后台采集，因此不能据此判断应用进入后台后是否会持续收到数据。
11. 文档没有提供从气压计算绝对海拔的方法。

## 实际开发建议

以下内容均为**基于文档内容推导**或**基于经验建议**：

- 在页面加载时先检查传感器可用性，再创建订阅。
- 将订阅对象保存在 `useEffect` 作用域或 `useRef` 中，并在组件卸载时清理。
- 对 Web、Android 和 iOS 明确设计不同的降级界面。
- 将 `relativeAltitude` 按可选值处理，不要使用非空断言掩盖平台差异。
- 权限被拒绝时检查 `canAskAgain`，为不能再次请求的情况准备跳转系统设置的提示。
- 只在界面或业务确实需要时启动传感器，离开相关页面后立即停止监听。
- 根据业务需要设置更新间隔，不要无目的地追求最高采样频率。
- 在 Android 与 iOS 真实设备上分别测试；iOS 模拟器不能覆盖真实气压计行为。
- 对 Web 调用增加平台保护和异常处理，不能仅依赖 UI 条件渲染。

## 总结

Expo Barometer 通过 `expo-sensors` 为 Android 和 iOS 提供气压计数据监听能力。核心用法是先检查设备可用性，再通过 `addListener()` 接收 `BarometerMeasurement`，最后通过订阅对象的 `remove()` 清理监听。

开发时最重要的平台差异是：

- Android 和 iOS 都能提供以 `hPa` 为单位的气压。
- 只有 iOS 真实设备提供以米为单位的相对高度。
- Web 完全不支持，调用会抛出错误。

文档明确介绍了安装、监听、权限、更新间隔、数据类型和平台能力，但没有涉及绝对海拔计算、后台采集、数据校准或原生权限文件配置。这些需求需要查阅其他文档，不能从当前页面直接得出结论。

---

## 文档导航

- **上一页**：[background task](./146__background-task.md)
- **下一页**：[battery](./148__battery.md)
