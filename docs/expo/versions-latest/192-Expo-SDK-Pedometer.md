# 192｜Expo SDK Pedometer 计步器

**翻页：**[上一页：Expo SDK Observe 性能观测与自定义事件](./191-Expo-SDK-Observe.md) · [目录](./README.md) · [下一页：Expo SDK Print](./193-Expo-SDK-Print.md)

**官方页面：**[Pedometer · Latest](https://docs.expo.dev/versions/latest/sdk/pedometer/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/pedometer/)

**版本与平台：**Latest 推荐 `expo-sensors ~57.0.3`；SDK v56.0.0 推荐 `~56.0.6`。Pedometer API 支持 Android 与 iOS，并包含在 Expo Go 中。SDK v56 对照页没有重要 API 差异。

## 计步器与术语

`Pedometer` 是 `expo-sensors` 提供的步数 API。Android 通过设备的 `hardware.Sensor`，iOS 通过 Core Motion 获取步数。它给出系统处理后的计步结果，而不是每毫秒的加速度原始数据。

- **可用性（availability）：**设备当前是否能提供计步数据。模拟器或没有相应硬件 / 系统服务的设备可能不可用，因此先调用 `isAvailableAsync()`。
- **权限（permission）：**读取运动 / 步数数据需要系统授权。`getPermissionsAsync()` 读取当前状态，`requestPermissionsAsync()` 请求授权。
- **历史查询：**`getStepCountAsync(start, end)` 查询一个时间范围的步数；官方页面说明 iOS 只保留最近 7 天的数据。此方法在 API 表中标为 iOS 支持。
- **订阅（subscription）：**`watchStepCount(callback)` 持续监听新数据，并返回一个订阅对象。组件卸载或不再需要更新时必须调用 `remove()`，以停止监听。

## 安装

Expo CLI 会根据 SDK 选择兼容版本；页面也列出了其他包管理器的 Expo CLI 命令：

```sh
npx expo install expo-sensors
yarn expo install expo-sensors
pnpm expo install expo-sensors
bun expo install expo-sensors
```

如果是已有的 React Native 项目，还需要先安装并配置 `expo`。

## 查询历史步数并监听新数据

下面的示例覆盖官方 Usage 的主要路径：检查传感器、读取权限、在 iOS 查询最近一天步数、订阅新的步数结果，并在组件卸载时移除订阅。历史查询只在 iOS 调用，因为文档将该 API 标为 iOS：

```tsx
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Pedometer } from 'expo-sensors';

export default function StepCounter() {
  const [availability, setAvailability] = useState('检查中');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [pastSteps, setPastSteps] = useState<number | null>(null);
  const [latestSteps, setLatestSteps] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let subscription: ReturnType<typeof Pedometer.watchStepCount> | undefined;

    async function start() {
      const available = await Pedometer.isAvailableAsync();
      if (cancelled) return;
      setAvailability(available ? '可用' : '不可用');
      if (!available) return;

      let permission = await Pedometer.getPermissionsAsync();
      if (!permission.granted && permission.canAskAgain) {
        permission = await Pedometer.requestPermissionsAsync();
      }
      if (cancelled) return;
      setPermissionGranted(permission.granted);
      if (!permission.granted) return;

      if (Platform.OS === 'ios') {
        const end = new Date();
        const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
        const result = await Pedometer.getStepCountAsync(start, end);
        if (!cancelled && result) setPastSteps(result.steps);
      }

      if (cancelled) return;
      subscription = Pedometer.watchStepCount(({ steps }) => {
        setLatestSteps(steps);
      });
    }

    void start().catch(error => {
      console.warn('读取计步器失败', error);
    });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text>计步器：{availability}</Text>
      <Text>步数权限：{permissionGranted ? '已授权' : '未授权'}</Text>
      {pastSteps !== null && <Text>过去 24 小时：{pastSteps} 步</Text>}
      <Text>最新监听结果：{latestSteps} 步</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

`cancelled` 防止异步初始化在界面卸载后继续更新 React state；`subscription.remove()` 停止事件监听。用户已拒绝且 `canAskAgain` 为 false 时，不要反复弹权限请求；引导用户到系统设置更合适。

## API 方法与平台边界

| API | 平台 | 用途与返回值 |
| --- | --- | --- |
| `Pedometer.getPermissionsAsync()` | Android、iOS | 查询步数权限，返回 `Promise<PermissionResponse>`。 |
| `Pedometer.requestPermissionsAsync()` | Android、iOS | 请求步数权限，返回 `Promise<PermissionResponse>`。 |
| `Pedometer.isAvailableAsync()` | Android、iOS | 检查计步器是否可用，返回 `Promise<boolean>`。 |
| `Pedometer.getStepCountAsync(start, end)` | iOS | 查询两个 `Date` 之间的步数，返回 `Promise<PedometerResult>`。iOS 仅保留最近 7 天，超出范围时只能返回可用数据。 |
| `Pedometer.watchStepCount(callback)` | Android、iOS | 订阅新步数结果，callback 收到 `PedometerResult`；返回具有 `remove()` 的 `EventSubscription`。 |
| `subscription.remove()` | Android、iOS | 移除监听器；此后不再收到该 emitter 的更新。 |

### 权限类型

`PermissionResponse` 是权限查询 / 请求的统一响应，包含：

- `granted: boolean`：是否已授权。
- `status: PermissionStatus`：权限状态，取值为 `denied`、`granted`、`undetermined`。
- `canAskAgain: boolean`：是否还可再次向用户请求；为 false 时应考虑系统设置引导。
- `expires: PermissionExpiration`：当前 Expo 文档说明权限不会到期，类型仍写为 `'never' | number`。

### 计步数据类型

- `PedometerResult`：`{ steps: number }`，`steps` 是给定时间区间的步数结果。
- `PedometerUpdateCallback(result)`：接收 `PedometerResult`、无返回值的回调。
- `Subscription.remove()`：清理监听器的方法，返回 `void`。

## 后台行为

`watchStepCount` 在应用进入后台期间不会继续推送更新。需要后台长期运动记录时，不能把这个实时 listener 当后台任务 API；Expo 页面建议 Android 另寻基于 Health Connect 的方案，iOS 可用 `getStepCountAsync` 查询日期区间。后台限制、系统权限和用户隐私需要单独设计。

## Latest 与 SDK v56 差异

| 项目 | Latest | SDK v56.0.0 |
| --- | --- | --- |
| 推荐依赖 | `expo-sensors ~57.0.3` | `expo-sensors ~56.0.6` |
| Expo Go | 支持 | 支持 |
| 主要方法、权限类型、平台标注 | 与 v56 对照相同 | 与 Latest 对照相同 |
| 官方页脚 Next | Print | Print |

本地项目应安装与 SDK 56 匹配的 `expo-sensors`，不要因为参考的是 Latest 页面而升级到 SDK 57 依赖。

## 官方源页代码主题覆盖

- 安装代码：覆盖 npx、Yarn、pnpm、Bun 的 Expo CLI 安装形式。
- Usage 计步示例：改写设备可用性判断、最近 24 小时历史查询、监听当前步数变化、React Native 页面展示与 `StyleSheet` 布局；增加权限处理、iOS 平台保护和安全清理订阅。
- 源页 API 部分无独立 runnable 代码块；`getPermissionsAsync`、`requestPermissionsAsync`、`getStepCountAsync`、`isAvailableAsync`、`watchStepCount` 与 `Subscription.remove` 均在方法表中列全。
- 源页没有配置插件或原生权限清单代码；本文代码覆盖按实际代码区块统计。

**翻页：**[上一页：Expo SDK Observe 性能观测与自定义事件](./191-Expo-SDK-Observe.md) · [目录](./README.md) · [下一页：Expo SDK Print](./193-Expo-SDK-Print.md)
