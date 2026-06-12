# Expo Pedometer：设备计步器 API 学习指南

## 文档解决的问题

`Pedometer` 是 `expo-sensors` 包提供的计步器 API，用于：

- 判断设备是否支持并启用了计步器。
- 查询一段时间内的历史步数。
- 订阅实时步数更新。
- 查询或请求计步器访问权限。

底层实现因平台而异：

- Android 使用系统的 `hardware.Sensor`。
- iOS 使用 Core Motion。
- 可以在 Expo Go 中使用。

> 本文对应的是“下一个 Expo SDK 版本”的未发布版本文档，修改日期为 2026 年 1 月 15 日。原文提示，稳定且最新的 SDK 56 文档应查看 `latest` 版本页面。因此，本文中的 API 可能尚未进入当前稳定版本。

## 适用场景

该 API 适合以下功能：

- 在应用前台显示用户当前产生的步数。
- 在 iOS 上查询最近一段时间的历史步数。
- 在使用计步功能前检查硬件和系统支持情况。
- 构建简单的运动记录、步数展示或健身辅助功能。

它不适合直接解决以下需求：

- 应用进入后台后继续通过监听器接收步数更新。
- 在 Android 上使用本 API 查询指定时间范围内的历史步数。
- 在 iOS 上查询超过系统保留范围的完整历史记录。

## React Web 开发者需要先理解的背景

### `expo-sensors` 不是浏览器 API

React Web 通常通过浏览器提供的 API 访问设备能力，而 `expo-sensors` 通过 React Native 和 Expo 调用 Android、iOS 的原生能力。

因此，是否能使用某个功能不仅取决于 JavaScript 代码，还取决于：

- 当前运行平台。
- 设备是否具有相应传感器。
- 系统是否启用了该能力。
- 用户是否授予访问权限。
- 应用当前处于前台还是后台。

### “支持平台”是 API 级别的限制

虽然 `Pedometer` 整体支持 Android 和 iOS，但不代表每一个方法在两个平台上都可用。

最重要的差异是：

| 能力 | Android | iOS |
| --- | --- | --- |
| 检查计步器可用性 | 支持 | 支持 |
| 查询或请求权限 | 支持 | 支持 |
| 订阅步数更新 | 支持 | 支持 |
| 查询指定日期范围的历史步数 | 不支持 | 支持 |
| 后台接收监听更新 | 不支持 | 不支持 |

### Expo Go 的含义

“Included in Expo Go”表示该原生模块已经包含在 Expo Go 客户端中，开发时可以直接在 Expo Go 中测试，无需先制作包含该模块的自定义原生构建。

不过，Expo Go 已包含模块不等于所有设备都支持计步器。代码仍应调用 `isAvailableAsync()` 检查当前设备。

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

`expo install` 与 React Web 项目中直接执行 `npm install` 的关注点有所不同：它会按照当前 Expo SDK 选择兼容的依赖版本。

如果项目是已有的 React Native 原生工程，而不是标准 Expo 项目，还必须先按照 Expo 的说明安装并配置 `expo` 模块。

当前文档未涉及：

- `app.json` 或 `app.config.js` 配置。
- iOS 原生权限描述字段。
- Android Manifest 权限配置。
- Development Build 或生产构建流程。

不要仅根据本文自行推断这些配置不需要处理，应结合项目所使用的 Expo SDK 版本和构建方式查看对应版本文档。

## 基本使用流程

完整流程可以整理为：

1. 从 `expo-sensors` 导入 `Pedometer`。
2. 检查当前设备上的计步器是否可用。
3. 根据业务需要处理权限。
4. iOS 可以查询指定时间范围内的历史步数。
5. Android 和 iOS 均可以订阅前台步数更新。
6. 组件卸载或不再需要监听时调用 `remove()`。

导入方式如下：

```js
import { Pedometer } from 'expo-sensors';
```

## 检查计步器是否可用

```js
const isAvailable = await Pedometer.isAvailableAsync();
```

返回值类型：

```ts
Promise<boolean>
```

- `true`：当前设备上的计步器可用。
- `false`：当前设备上的计步器不可用或未启用。

应在调用后续计步功能前执行此检查，不要仅通过 `Platform.OS` 判断。平台支持某个 API，不代表每台设备都具备可用的计步能力。

## 权限处理

### 查询权限

```js
const permission = await Pedometer.getPermissionsAsync();
```

该方法只检查现有权限状态，不会主动弹出授权请求。

### 请求权限

```js
const permission = await Pedometer.requestPermissionsAsync();
```

该方法请求用户授予计步器访问权限，支持 Android 和 iOS。

两个方法都返回 `PermissionResponse`：

```ts
type PermissionResponse = {
  canAskAgain: boolean;
  expires: 'never' | number;
  granted: boolean;
  status: PermissionStatus;
};
```

各字段含义如下：

| 字段 | 含义 |
| --- | --- |
| `granted` | 是否已经获得权限，适合直接用于条件判断 |
| `status` | 更具体的权限状态 |
| `canAskAgain` | 应用是否还能再次向用户发起权限请求 |
| `expires` | 权限过期时间；当前权限均为永久授权 |

`PermissionStatus` 有三种状态：

| 状态 | 字符串值 | 含义 |
| --- | --- | --- |
| `PermissionStatus.GRANTED` | `"granted"` | 用户已授权 |
| `PermissionStatus.DENIED` | `"denied"` | 用户已拒绝 |
| `PermissionStatus.UNDETERMINED` | `"undetermined"` | 用户尚未做出选择 |

当 `canAskAgain` 为 `false` 时，继续调用请求方法可能无法让用户重新选择。文档明确说明，此时应引导用户前往系统设置修改权限。

> 原文示例只检查了计步器是否可用，没有展示 `getPermissionsAsync()` 或 `requestPermissionsAsync()` 的调用流程。实际应用如果需要主动处理权限，应根据返回的 `PermissionResponse` 决定后续行为。

## 查询历史步数

```js
const result = await Pedometer.getStepCountAsync(start, end);
```

参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `start` | `Date` | 查询时间范围的开始时间 |
| `end` | `Date` | 查询时间范围的结束时间 |

返回值：

```ts
Promise<PedometerResult>
```

结果结构：

```ts
type PedometerResult = {
  steps: number;
};
```

例如查询最近 24 小时：

```js
const end = new Date();
const start = new Date();

start.setDate(end.getDate() - 1);

const result = await Pedometer.getStepCountAsync(start, end);
console.log(result.steps);
```

### 平台限制

`getStepCountAsync()` **仅支持 iOS**。

这意味着不能因为 `Pedometer` 在 Android 上可用，就直接在 Android 上调用该方法。跨平台代码应明确保护：

```js
import { Platform } from 'react-native';

if (Platform.OS === 'ios') {
  const result = await Pedometer.getStepCountAsync(start, end);
}
```

以上平台判断写法是为了说明调用保护方式，原文示例未提供该判断。

### iOS 的七天限制

Apple 只保留并允许查询过去七天的计步数据。

如果传入的 `start` 早于七天前，系统不会返回完整时间范围的数据，而只会返回仍然可用的数据。调用可能成功，但结果并不代表请求范围内的全部步数。

因此，业务界面不应将该 API 描述为“任意历史步数查询”。

## 订阅步数更新

```js
const subscription = Pedometer.watchStepCount(result => {
  console.log(result.steps);
});
```

回调参数是 `PedometerResult`：

```ts
type PedometerResult = {
  steps: number;
};
```

停止监听时调用：

```js
subscription.remove();
```

`remove()` 返回 `void`。调用后，该监听器不会再接收事件。

这与 React Web 中使用 `addEventListener` 后调用 `removeEventListener` 类似，但这里不需要再次传入原回调函数，而是通过订阅对象自行注销。

### React 组件中的清理

监听器属于组件之外持续存在的原生事件订阅，因此必须在组件卸载时清理：

```jsx
useEffect(() => {
  const subscription = Pedometer.watchStepCount(result => {
    setCurrentStepCount(result.steps);
  });

  return () => {
    subscription.remove();
  };
}, []);
```

否则可能出现：

- 组件卸载后监听器仍然存在。
- 重复进入页面时创建多个监听器。
- 同一个事件触发多次状态更新。
- 不必要的资源占用。

## 后台运行限制

文档明确说明：应用进入后台后，`watchStepCount()` 不会继续向应用传递计步更新。

这里的“后台”是指移动应用不再处于用户当前可见、活跃的前台状态，例如用户切换到其他应用或回到主屏幕。

不能将该监听器理解为 Web 中一个可以长期运行的普通事件监听器。移动操作系统会对后台应用施加更严格的执行限制。

文档给出的替代方向是：

- Android：采用基于 Health Connect API 的其他方案。
- iOS：重新进入前台后，可以通过 `getStepCountAsync()` 查询两个时间点之间的步数。

当前文档没有提供：

- Health Connect 的接入代码。
- Android 后台计步实现方案。
- 后台任务配置方式。
- 应用恢复前台后的自动补算逻辑。

## 原文示例的执行逻辑

示例维护三个状态：

```js
const [isPedometerAvailable, setIsPedometerAvailable] =
  useState('checking');
const [pastStepCount, setPastStepCount] = useState(0);
const [currentStepCount, setCurrentStepCount] = useState(0);
```

分别表示：

- 计步器可用性检查结果。
- 过去 24 小时的步数。
- 当前监听到的步数。

订阅函数首先检查可用性：

```js
const isAvailable = await Pedometer.isAvailableAsync();
setIsPedometerAvailable(String(isAvailable));
```

仅在可用时查询历史数据并启动监听：

```js
if (isAvailable) {
  // 查询历史步数
  // 启动实时监听
}
```

这种先检查再调用的顺序值得保留，但示例需要注意两个问题。

### 示例未处理平台差异

示例无条件调用：

```js
Pedometer.getStepCountAsync(start, end);
```

但 API 表格明确说明该方法仅支持 iOS。

**基于文档内容推导：** 如果同一份代码需要在 Android 上运行，应增加平台判断，或者将历史步数查询封装为仅在 iOS 执行的逻辑。

### 示例中的异步清理值得警惕

原文写法为：

```js
const subscription = subscribe();

return () => subscription && subscription.remove();
```

但 `subscribe` 被声明为 `async`，因此调用后得到的是 `Promise`，而不是最终的订阅对象。`Promise` 本身没有 `remove()` 方法。

**基于文档内容推导：** 这段清理代码在标准 JavaScript 语义下存在问题。更稳妥的写法是等待异步初始化完成，并在清理阶段注销最终取得的订阅对象：

```jsx
useEffect(() => {
  let subscription;
  let cancelled = false;

  async function setupPedometer() {
    const isAvailable = await Pedometer.isAvailableAsync();
    setIsPedometerAvailable(String(isAvailable));

    if (!isAvailable || cancelled) {
      return;
    }

    subscription = Pedometer.watchStepCount(result => {
      setCurrentStepCount(result.steps);
    });
  }

  setupPedometer();

  return () => {
    cancelled = true;
    subscription?.remove();
  };
}, []);
```

这里的 `cancelled` 还能避免组件已经卸载、异步检查才完成时继续创建监听器。

## 一个更完整的跨平台使用思路

下面的流程综合了文档明确提供的 API，并补充必要的平台保护：

```jsx
import { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { Pedometer } from 'expo-sensors';

export default function App() {
  const [available, setAvailable] = useState(null);
  const [steps, setSteps] = useState(0);
  const [pastSteps, setPastSteps] = useState(null);

  useEffect(() => {
    let subscription;
    let cancelled = false;

    async function initialize() {
      const isAvailable = await Pedometer.isAvailableAsync();

      if (cancelled) {
        return;
      }

      setAvailable(isAvailable);

      if (!isAvailable) {
        return;
      }

      const permission = await Pedometer.requestPermissionsAsync();

      if (cancelled || !permission.granted) {
        return;
      }

      if (Platform.OS === 'ios') {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 1);

        const result = await Pedometer.getStepCountAsync(start, end);

        if (!cancelled) {
          setPastSteps(result.steps);
        }
      }

      if (!cancelled) {
        subscription = Pedometer.watchStepCount(result => {
          setSteps(result.steps);
        });
      }
    }

    initialize();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  return (
    <View>
      <Text>计步器可用：{String(available)}</Text>
      <Text>监听到的步数：{steps}</Text>
      {Platform.OS === 'ios' && (
        <Text>过去 24 小时步数：{pastSteps ?? '读取中'}</Text>
      )}
    </View>
  );
}
```

其中：

- API 名称、返回结构和平台能力来自原文档。
- 平台判断、取消标记和权限流程组合属于**基于文档内容推导**的工程化组织方式。
- 文档没有说明各系统版本下请求权限时的具体界面表现。

## 注意事项与容易踩坑的地方

### 可用性和权限不是同一个状态

`isAvailableAsync()` 检查的是计步器是否可用；权限方法检查的是应用是否被允许访问。

因此，计步器可用不等于应用已经获得权限。实际代码应分别处理这两个条件。

### Android 不支持历史范围查询

Android 可以监听前台步数更新，但不能通过本文的 `getStepCountAsync()` 查询日期范围。需要历史健康数据时，文档建议考虑 Health Connect 方向。

### 实时监听不能覆盖后台时间

当应用进入后台时，监听器不会收到更新。若产品要求全天持续统计，不能只依赖 `watchStepCount()`。

### iOS 历史数据最多七天

超过七天的开始时间不会产生完整的查询结果。系统只返回仍然保留的数据。

### 必须保存并清理订阅对象

`watchStepCount()` 返回的不是普通数据，而是具有生命周期的 `Subscription`。组件卸载时必须调用 `remove()`。

### 时间范围使用 JavaScript `Date`

该 API 接收 JavaScript `Date` 对象，而不是时间戳或日期字符串。当前文档没有进一步说明时区、夏令时或无效时间范围的处理方式。

**基于经验建议：** 对“自然日步数”和“最近 24 小时步数”进行产品定义时，应明确两者区别，并使用实际设备和目标时区测试日期边界。

### 文档没有说明错误处理

示例没有使用 `try...catch`，API 说明也没有列出具体错误类型。

**基于经验建议：** 原生能力调用可能受到设备、系统和权限状态影响，生产代码应为异步调用添加错误处理，并向用户展示可理解的降级状态。

## 对实际开发的影响

在设计功能前，应先明确需要的是哪一种数据：

| 产品需求 | 可以采用的方式 |
| --- | --- |
| 判断设备能否计步 | `isAvailableAsync()` |
| 处理访问授权 | `getPermissionsAsync()`、`requestPermissionsAsync()` |
| 展示应用前台期间的步数变化 | `watchStepCount()` |
| 查询 iOS 最近一段时间的步数 | `getStepCountAsync()` |
| Android 历史健康数据 | 本文 API 无法直接提供，文档建议考虑 Health Connect |
| 应用后台持续接收监听事件 | 本文 API 不支持 |

对于跨平台应用，建议把“实时监听”和“历史查询”视为两个独立能力，而不是假设两端 API 完全对称。

**基于文档内容推导：** UI 也应按能力降级。例如，Android 页面可以隐藏仅适用于 iOS 的历史步数区域，而不是调用失败后才显示错误。

## 文档明确说明与推导内容边界

### 文档明确说明

- `Pedometer` 属于 `expo-sensors`。
- Android 底层使用 `hardware.Sensor`。
- iOS 底层使用 Core Motion。
- Android 和 iOS 支持可用性检查、权限处理和步数订阅。
- `getStepCountAsync()` 仅支持 iOS。
- iOS 只保留过去七天的可查询数据。
- 应用在后台时不会收到计步器监听更新。
- Android 可考虑 Health Connect API。
- 监听结束后可通过订阅对象的 `remove()` 注销。

### 基于文档内容推导

- 跨平台调用历史查询前应增加 iOS 平台判断。
- 可用性检查不能代替权限检查。
- 原文异步订阅示例的清理代码存在 JavaScript 语义问题。
- 应用从后台恢复后，iOS 可以查询时间范围来补充后台期间的数据。
- UI 和业务逻辑应根据平台能力进行降级。

### 当前文档未涉及

- Android Health Connect 的具体实现。
- 后台任务或后台服务配置。
- 原生权限描述文件的配置。
- 错误码和异常类型。
- 最低 Android、iOS 系统版本。
- 传感器更新频率。
- 步数精度、延迟和设备差异。
- 数据持久化、同步或跨设备合并。
- 自动化测试和传感器模拟方法。

## 总结

`Pedometer` 提供的是一组范围明确的移动端计步能力：检查设备、管理权限、监听前台步数，以及在 iOS 上查询最近七天内的历史步数。

使用时最重要的限制是：

- 历史范围查询仅支持 iOS。
- iOS 历史数据最多保留七天。
- Android 和 iOS 都不会在应用后台传递监听更新。
- 可用性、权限和平台支持必须分别判断。
- 所有监听器都应在组件卸载时调用 `remove()`。

对于 React Web 开发者，关键认知转变是：这不是一个只要导入并调用就能在所有环境下保持一致的 JavaScript API。它受到移动设备硬件、原生平台、系统权限和应用生命周期的共同约束。

---

## 文档导航

- **上一页**：[notifications](./198__notifications.md)
- **下一页**：[print](./200__print.md)
