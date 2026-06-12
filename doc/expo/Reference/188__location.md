# Expo Location 学习指南

> 原文档更新时间：2026 年 5 月 26 日  
> 包名：`expo-location`  
> 支持平台：Android、iOS、Web、Expo Go  
> 文档版本：下一版本 SDK 的未发布文档；当前最新稳定版为 SDK 56，实际项目应核对稳定版文档。

## 文档解决的问题

`expo-location` 用于从设备读取位置及相关传感器信息，主要覆盖以下场景：

- 单次获取当前位置。
- 在前台持续监听位置变化。
- 在后台持续接收位置更新。
- 监听设备进入或离开指定地理区域，即地理围栏。
- 经纬度与地址之间相互转换。
- 获取设备朝向，即指南针数据。
- 判断定位服务和定位数据源是否可用。
- 识别步行、跑步、骑行、驾车等运动状态。

它不仅是一组 JavaScript API，还涉及 iOS `Info.plist`、Android 权限、后台任务、系统服务以及应用重新构建。

## React Web 开发者需要先理解的背景

### 浏览器 API 与原生能力的区别

在 React Web 中，定位通常通过：

```js
navigator.geolocation.getCurrentPosition(...)
```

浏览器负责权限、定位服务和页面生命周期。

React Native 没有浏览器提供的完整运行环境。`expo-location` 的 JavaScript API 最终会调用 Android 或 iOS 的原生定位能力。因此：

- 部分功能必须写入原生配置。
- 修改原生配置后必须重新构建应用二进制。
- 权限不只分为允许和拒绝，还涉及前台、后台、精确和近似范围。
- 应用进入后台后，普通 React 组件和 Hook 不适合承担持续任务。
- Expo Go 不能支持所有后台定位能力。

Web 平台虽然受到部分 API 支持，但不能据此假设三端行为完全相同。

### 前台、后台与应用终止

- **前台**：应用正在屏幕上显示并与用户交互。
- **后台**：应用仍存在，但当前没有显示在前台。
- **终止**：应用进程被用户或系统结束。

这与网页标签页的可见和隐藏不完全等价。移动系统会限制后台应用的执行时间、传感器使用和自动重启。

### CNG、Config Plugin 与 Prebuild

**Continuous Native Generation（CNG）** 是 Expo 根据 `app.json` 等应用配置生成原生 iOS、Android 工程的工作流。

**Config Plugin** 会在生成原生工程时自动修改 `Info.plist`、Android 权限等原生文件。

**Prebuild** 是依据 Expo 配置生成或更新原生工程的过程。

如果使用 CNG，可以通过 `expo-location` 的 config plugin 声明大部分原生配置；如果手动维护原生工程，则必须自行修改原生文件。

## 安装

根据包管理器执行其中一条命令：

```sh
# npm
npx expo install expo-location

# yarn
yarn expo install expo-location

# pnpm
pnpm expo install expo-location

# bun
bun expo install expo-location
```

`expo install` 会根据当前 Expo SDK 选择兼容版本，不完全等同于直接执行 `npm install`。

如果是在已有的非 Expo React Native 工程中使用，还必须先安装并配置 Expo Modules 所需的 `expo` 包。

## 原生配置

### 使用 Config Plugin

示例 `app.json`：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location."
        }
      ]
    ]
  }
}
```

这些配置会改变原生工程，不能在 JavaScript 运行期间动态修改。修改后必须生成并构建新的应用二进制。

### Config Plugin 配置项

| 配置项 | 平台 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `locationAlwaysAndWhenInUsePermission` | iOS | `Allow $(PRODUCT_NAME) to use your location` | 设置始终定位权限的说明文字 |
| `locationAlwaysPermission` | iOS | 同上 | 设置已废弃的 `NSLocationAlwaysUsageDescription` |
| `locationWhenInUsePermission` | iOS | 同上 | 设置应用使用期间定位权限的说明文字 |
| `isIosBackgroundLocationEnabled` | iOS | `false` | 在 `UIBackgroundModes` 中启用 `location` |
| `isAndroidBackgroundLocationEnabled` | Android | `false` | 添加 `ACCESS_BACKGROUND_LOCATION` |
| `isAndroidForegroundServiceEnabled` | Android | 取决于后台定位配置 | 添加定位前台服务权限 |
| `androidForegroundServiceIcon` | Android | 未指定 | 设置后台定位前台服务的通知图标 |

`isAndroidForegroundServiceEnabled` 在后台定位开启时默认为 `true`，否则默认为 `false`。Android 14 及以上运行定位前台服务还需要 `FOREGROUND_SERVICE_LOCATION`。

`androidForegroundServiceIcon` 应是带透明背景的 `96x96` 全白 PNG。若未配置，会依次尝试：

1. `expo-notifications` 配置的 `notification_icon`。
2. 应用启动图标。

Android 通知图标要求单色。全彩启动图标作为回退方案时，可能显示成白色方块。

### 手动配置 iOS 权限说明

不使用 CNG 或手动维护 iOS 工程时，需要在 `ios/[app]/Info.plist` 中配置：

```xml
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Allow $(PRODUCT_NAME) to use your location</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>Allow $(PRODUCT_NAME) to use your location</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Allow $(PRODUCT_NAME) to use your location</string>
```

其中 `NSLocationAlwaysUsageDescription` 已从 iOS 11 开始废弃，新项目应以 `NSLocationAlwaysAndWhenInUseUsageDescription` 为主。

> 基于经验建议：权限说明应明确描述用户收益，例如“用于记录骑行路线”，不要只写“需要定位权限”。含糊的说明不利于用户授权，也可能影响应用商店审核。

## 权限模型

### 前台权限

```ts
const response = await Location.requestForegroundPermissionsAsync();
```

前台权限允许应用在用户正在使用应用时访问位置。

也可以只检查而不弹出请求：

```ts
const response = await Location.getForegroundPermissionsAsync();
```

对应 Hook：

```ts
const [permission, requestPermission, getPermission] =
  Location.useForegroundPermissions();
```

### 后台权限

```ts
const response = await Location.requestBackgroundPermissionsAsync();
```

后台权限用于后台位置跟踪和地理围栏。申请前应先获得前台权限，因为应用不能在没有前台权限的情况下获得后台权限。

在 Android 上需要同时拥有：

- 前台定位权限。
- 后台定位权限。

Android 11 及以上调用后台权限请求时，会打开系统设置页面。应用应提前向用户解释用途，例如先显示一个 `Modal`。

对应检查 API 和 Hook：

```ts
await Location.getBackgroundPermissionsAsync();

const [permission, requestPermission, getPermission] =
  Location.useBackgroundPermissions();
```

### iOS 权限映射

| Expo 权限 API | iOS 权限 |
| --- | --- |
| `requestForegroundPermissionsAsync` | `When In Use` |
| `requestBackgroundPermissionsAsync` | `Always` |

可以先申请前台权限，在真正需要后台功能时再申请后台权限。原文明确指出，这种渐进式申请可以改善用户体验。

直接申请后台权限时，iOS 会将其视为同时申请 `When In Use` 和 `Always`。系统先显示使用期间权限提示，之后在系统判断需要时再显示 `Always` 提示。用户仍可能只授予 `When In Use`，应用必须能够在这种权限范围下运行。

### iOS 的“允许一次”陷阱

用户在申请 `When In Use` 权限时可以选择 `Allow Once`：

- 权限只在当前应用会话中有效。
- 应用关闭后自动撤销。
- Expo 无法区分用户选择的是“允许一次”还是“使用 App 期间允许”，两者都会表现为 `When In Use`。
- 如果用户选择“允许一次”，同一会话中继续申请后台权限，系统不会再次弹窗，而会静默返回拒绝。

此时只能引导用户前往系统设置手动开启后台定位：

```js
import { Linking } from 'react-native';

function openSettings() {
  Linking.openURL('app-settings:');
}
```

### 权限响应

`PermissionResponse` 的主要字段：

| 字段 | 含义 |
| --- | --- |
| `status` | `granted`、`denied` 或 `undetermined` |
| `granted` | 是否已授权的便捷布尔值 |
| `canAskAgain` | 是否还能再次弹出系统权限请求 |
| `expires` | 权限过期时间，目前权限均为永久授权 |

当 `canAskAgain` 为 `false` 时，继续调用请求 API 通常不能解决问题，应引导用户打开系统设置。

位置权限还包含平台细节：

- Android：`accuracy` 为 `fine`、`coarse` 或 `none`。
- iOS：`accuracy` 为 `full` 或 `reduced`。
- iOS：`scope` 为 `whenInUse`、`always` 或 `none`。

因此，`status === 'granted'` 不代表一定获得了精确位置或后台访问能力。

## 获取当前位置

### 基本流程

```tsx
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] =
    useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLocation() {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError('定位权限被拒绝');
        return;
      }

      const result = await Location.getCurrentPositionAsync({});
      setLocation(result);
    }

    loadLocation();
  }, []);

  return (
    <View>
      <Text>
        {error ?? (location ? JSON.stringify(location) : 'Waiting...')}
      </Text>
    </View>
  );
}
```

流程为：

1. 申请前台权限。
2. 检查权限状态。
3. 调用 `getCurrentPositionAsync` 请求一次新位置。
4. 处理等待、成功和失败状态。

这与 React Web 中在 `useEffect` 里调用浏览器定位 API 类似，但背后使用的是原生定位管理器。

### 当前定位与最后已知位置

```ts
await Location.getCurrentPositionAsync(options);
```

该方法要求系统重新取得定位结果。精度越高，耗时通常越长；在室内可能需要数秒。

```ts
await Location.getLastKnownPositionAsync({
  maxAge: 30_000,
  requiredAccuracy: 100,
});
```

最后已知位置通常更快，因为它读取缓存，不主动获取新位置，但可能：

- 数据已经过期。
- 精度不满足要求。
- 没有缓存。

不满足条件时会返回 `null`。

**基于文档内容推导：** 可以先使用满足业务条件的最后已知位置快速渲染，再异步请求当前位置更新界面。但是否适用取决于业务能否接受短暂显示旧位置。

### 定位选项

`LocationOptions` 的主要字段：

| 字段 | 说明 |
| --- | --- |
| `accuracy` | 定位精度，默认 `Balanced` |
| `distanceInterval` | 至少移动指定米数后才产生更新 |
| `timeInterval` | Android 专用；两次更新之间的最短毫秒数 |
| `mayShowUserSettingsDialog` | Android 专用；是否允许提示用户开启高精度模式，默认 `true` |

精度等级：

| 枚举 | 文档描述 |
| --- | --- |
| `Lowest` | 约 3 千米 |
| `Low` | 约 1 千米 |
| `Balanced` | 约 100 米 |
| `High` | 约 10 米 |
| `Highest` | 设备可提供的最佳精度 |
| `BestForNavigation` | 使用额外传感器，面向导航的最高精度 |

精度越高，通常越耗电且越可能增加等待时间。不要仅因为“更准确”就默认选择最高级别。

## 持续监听位置

### 前台监听

```ts
const subscription = await Location.watchPositionAsync(
  {
    accuracy: Location.Accuracy.Balanced,
    distanceInterval: 20,
  },
  location => {
    console.log(location);
  },
  reason => {
    console.error(reason);
  }
);

// 不再需要时取消
subscription.remove();
```

`watchPositionAsync` 只在应用处于前台时更新。它返回 `LocationSubscription`，必须调用 `remove()` 取消监听。

对于 React 开发者，可以把它理解为需要在 `useEffect` 清理函数中释放的订阅资源，而不是普通 Promise 请求。

### 后台监听

后台位置更新使用：

```ts
Location.startLocationUpdatesAsync(taskName, options);
```

停止时调用：

```ts
Location.stopLocationUpdatesAsync(taskName);
```

检查是否已经启动：

```ts
Location.hasStartedLocationUpdatesAsync(taskName);
```

后台回调必须通过 `expo-task-manager` 在模块顶层定义：

```ts
import * as TaskManager from 'expo-task-manager';

TaskManager.defineTask(
  YOUR_TASK_NAME,
  ({ data: { locations }, error }) => {
    if (error) {
      return;
    }

    console.log('Received new locations', locations);
  }
);
```

“顶层定义”表示不能把 `defineTask` 放进 React 组件、Hook、事件回调或组件生命周期中。后台事件发生时，系统可能没有挂载任何 React 页面，但仍需要能够找到任务定义。

启动后台定位前必须满足：

- 已获得相应定位权限。
- 使用 `TaskManager.defineTask` 在顶层定义任务。
- iOS 已在 `Info.plist` 中声明 `location` 后台模式。
- iOS 使用 development build；Expo Go 不支持后台定位。

### 后台定位配置

iOS 必须在 `UIBackgroundModes` 中加入 `location`：

```xml
<key>UIBackgroundModes</key>
<array>
  <string>location</string>
</array>
```

使用 CNG 时，启用相应 config plugin 配置后由 prebuild 自动应用。手动维护原生工程时需要自行添加。

### 后台任务选项

`LocationTaskOptions` 在 `LocationOptions` 基础上增加：

| 字段 | 平台 | 作用 |
| --- | --- | --- |
| `activityType` | iOS | 告诉系统正在跟踪的活动类型 |
| `deferredUpdatesDistance` | 后台 | 移动一定距离后批量报告 |
| `deferredUpdatesInterval` | 后台 | 经过一定时间后批量报告 |
| `deferredUpdatesTimeout` | 后台 | 延迟更新超时参数 |
| `foregroundService` | Android | 配置前台服务通知 |
| `pausesUpdatesAutomatically` | iOS | 允许系统在位置不太可能变化时暂停更新 |
| `showsBackgroundLocationIndicator` | iOS | 是否在后台定位时改变状态栏外观 |

`activityType` 可选值包括普通活动、汽车导航、健身、其他导航和 iOS 的航空活动。它可以帮助 iOS 判断何时暂停或恢复定位。

### 延迟更新与电量

后台定位可以延迟并批量发送更新：

- `deferredUpdatesDistance`：移动多少米后发送。
- `deferredUpdatesInterval`：至少经过多少毫秒后发送。
- `deferredUpdatesTimeout`：延迟更新超时设置。

延迟更新只适用于后台。其目的不是提高精度，而是减少更新频率以节省电量。

### Android 前台服务通知

Android 的长时间后台定位可能通过前台服务运行。这里的“前台服务”不是应用界面位于前台，而是一类必须向用户显示持续通知的系统服务。

`foregroundService` 可配置：

```ts
{
  notificationTitle: '正在记录路线',
  notificationBody: '位置记录正在后台运行',
  notificationColor: '#3366FF',
  killServiceOnDestroy: false
}
```

其中标题和正文必填。`killServiceOnDestroy` 控制应用被销毁时是否同时销毁服务。

## 地理围栏

地理围栏是以某个经纬度为圆心、以指定米数为半径的区域。系统可以在设备进入或离开区域时触发任务，而不需要应用界面保持打开。

区域结构：

```ts
const region: Location.LocationRegion = {
  identifier: 'office',
  latitude: 31.2304,
  longitude: 121.4737,
  radius: 200,
  notifyOnEnter: true,
  notifyOnExit: true,
};
```

启动：

```ts
await Location.startGeofencingAsync(TASK_NAME, [region]);
```

停止：

```ts
await Location.stopGeofencingAsync(TASK_NAME);
```

检查状态：

```ts
await Location.hasStartedGeofencingAsync(TASK_NAME);
```

若任务已经运行，可再次调用 `startGeofencingAsync` 并传入新的完整区域数组，以增加或删除区域。

任务同样必须在模块顶层定义：

```ts
import { GeofencingEventType } from 'expo-location';
import * as TaskManager from 'expo-task-manager';

TaskManager.defineTask(
  TASK_NAME,
  ({ data: { eventType, region }, error }) => {
    if (error) {
      return;
    }

    if (eventType === GeofencingEventType.Enter) {
      console.log('进入区域', region);
    } else if (eventType === GeofencingEventType.Exit) {
      console.log('离开区域', region);
    }
  }
);
```

平台限制：

- Android：每个应用最多同时启用 100 个地理围栏。
- iOS：最多同时监控 20 个区域。
- iOS：应用启动时会报告已注册围栏的初始状态。

区域状态可能是 `Unknown`、`Inside` 或 `Outside`，不能假设系统始终能立即判断内外状态。

## 应用终止后的行为

原文明确说明：

- 用户终止应用后，后台定位会停止。
- 用户重新启动应用后，后台定位恢复。
- Android 上，已终止的应用不会因定位或地理围栏事件自动重启。
- iOS 上，新的地理围栏事件可以使系统重新启动已终止的应用。

Android 厂商对“从最近任务列表中移除应用”的处理不同。有些设备会将其视为终止应用，因此后台行为不能仅靠标准 Android 模拟器验证。

## 地址与坐标转换

### 地址转经纬度

```ts
const locations = await Location.geocodeAsync('Baker Street London');
```

通常返回一个元素，但返回类型始终是数组。结果包含经度、纬度，以及可选的精度和海拔。

### 经纬度转地址

```ts
const addresses = await Location.reverseGeocodeAsync({
  latitude: 31.2304,
  longitude: 121.4737,
});
```

结果可能包含城市、国家、街道、门牌号、邮编、行政区等字段。多数属性都可能为 `null`，且平台字段存在差异：

- `formattedAddress` 为 Android 字段。
- `timezone` 为 iOS 字段。

Android 在使用正向或反向地理编码前必须先获得前台定位权限。

地理编码消耗资源：

- 不应同时创建大量请求。
- 请求过多可能报错。
- 不建议在后台执行不会立即向用户展示结果的地理编码。

**基于文档内容推导：** 地址搜索输入框不应在每次键盘输入时直接调用 `geocodeAsync`；至少需要限制调用频率，并避免并发堆积。

## 朝向与指南针

```ts
const heading = await Location.getHeadingAsync();
```

该方法内部会暂时监听多个朝向更新，并返回精度足够的结果。

持续监听：

```ts
const subscription = await Location.watchHeadingAsync(
  heading => {
    console.log(heading);
  },
  reason => {
    console.error(reason);
  }
);

subscription.remove();
```

`LocationHeadingObject` 包含：

- `magHeading`：相对磁北的角度。
- `trueHeading`：相对真北的角度。
- `accuracy`：指南针校准等级，`3` 最高、`0` 最低。

`trueHeading` 需要定位权限；未获得权限时返回 `-1`。

## 运动状态识别

`expo-location` 还可以识别设备当前处于以下状态之一或多种：

- 驾车或其他机动车移动。
- 骑行。
- 跑步。
- 静止。
- 步行。
- 未知。

这项能力使用 Android 的 Google Play Services 活动识别或 iOS 的运动协处理器，不要求定位权限，但有独立的运动权限：

- Android 10 及以上需要运行时申请 `ACTIVITY_RECOGNITION`。
- iOS 第一次调用时会显示“运动与健身”权限提示。

申请权限：

```ts
await Location.requestMotionActivityPermissionsAsync();
```

对应 Hook：

```ts
const [permission, requestPermission] =
  Location.useMotionActivityPermissions();
```

单次获取：

```ts
const { activities } = await Location.getMotionActivityAsync();

if (activities.automotive.detected) {
  console.log(
    '正在驾车，置信度：',
    activities.automotive.confidence
  );
}
```

持续监听：

```ts
const subscription = await Location.watchMotionActivityAsync(
  activity => {
    console.log(activity);
  },
  reason => {
    console.error(reason);
  }
);
```

运动状态持续监听只支持前台。应用进入后台后更新暂停，返回前台后恢复。

每种活动都包含：

- `detected`：是否检测到。
- `confidence`：`Low`、`Medium` 或 `High`。

当 `detected` 为 `false` 时，`confidence` 始终为 `Low`。Android 为每种活动分别计算置信度；iOS 的已检测活动共享本次读取的整体置信度。

## 定位结果结构

`LocationObject`：

```ts
{
  coords: {
    latitude: number,
    longitude: number,
    altitude: number | null,
    accuracy: number | null,
    altitudeAccuracy: number | null,
    heading: number | null,
    speed: number | null
  },
  timestamp: number,
  mocked?: boolean
}
```

关键点：

- `accuracy` 表示不确定范围的半径，单位是米，数值越小通常越准确。
- `heading` 从正北开始顺时针计数：北为 `0`，东为 `90`。
- `speed` 单位是米/秒，不是千米/小时。
- `timestamp` 是 Unix Epoch 起算的毫秒数。
- Android 的 `mocked` 表示数据是否来自模拟位置。
- Web 上多个传感器字段可能为 `null`。

不要仅检查 `location` 是否存在，还应处理字段为 `null`、精度不足和数据过旧的情况。

## 定位服务与数据源检查

检查用户是否启用了系统定位服务：

```ts
const enabled = await Location.hasServicesEnabledAsync();
```

获取更完整的定位数据源状态：

```ts
const status = await Location.getProviderStatusAsync();
```

`LocationProviderStatus` 可能包含：

- `locationServicesEnabled`：系统定位总开关。
- `backgroundModeEnabled`：后台模式状态。
- `gpsAvailable`：Android GPS 是否可用。
- `networkAvailable`：Android 网络定位是否可用。
- `passiveAvailable`：Android 被动定位是否可用。

权限已授权不等于系统定位服务已开启。这是两个独立条件。

Android 还可主动请求用户启用高精度定位模式：

```ts
await Location.enableNetworkProviderAsync();
```

用户接受后 Promise 成功完成；拒绝时 Promise 会被拒绝。

## Web 兼容

```ts
Location.installWebGeolocationPolyfill();
```

该方法为 `navigator.geolocation` 安装 polyfill，用于兼容 React Native 核心方式和 Web Geolocation API。

但文档中多处“支持 Web”的类型标记不代表所有底层能力与移动端完全一致。例如：

- 地理编码方法正文只明确列出 Android 和 iOS。
- 后台执行能力受浏览器环境限制。
- Web 的海拔、速度和精度等字段可能为 `null`。

因此应以具体 API 的平台说明和实际运行环境为准，不能只根据共享 TypeScript 类型判断功能可用性。

## 模拟器定位

### Android Emulator

1. 在 Android Studio 中启动模拟器。
2. 打开模拟器的 **Settings > Location**。
3. 启用 **Use location**。

如果收不到模拟位置，可能需要关闭 Google 的位置精度增强，让模拟器仅使用 GPS 数据。

Android 12 及以上：

```text
Settings > Location > Location Services
> Google Location Accuracy > Improve Location Accuracy
```

Android 11 及以下：

```text
Settings > Location > Advanced
> Google Location Accuracy
```

### iOS Simulator

打开 Simulator 后进入：

```text
Features > Location
```

选择除 `None` 之外的任意位置选项。

模拟器设置了位置不代表应用已经获得权限，两者仍需分别处理。

## Android 权限与审核影响

安装模块后自动添加：

- `ACCESS_COARSE_LOCATION`：近似位置。
- `ACCESS_FINE_LOCATION`：精确位置。

可选权限：

- `FOREGROUND_SERVICE`
- `FOREGROUND_SERVICE_LOCATION`
- `ACCESS_BACKGROUND_LOCATION`

`FOREGROUND_SERVICE_LOCATION` 从 Android 14 开始是定位前台服务所需权限。

启用定位前台服务或后台定位后，新构建提交到 Google Play 时需要申请相应权限用途审核。它不是只改代码和配置即可发布的功能，还会影响商店合规流程。

### 排除不需要的权限

如果应用不需要精确定位，可以排除 `ACCESS_FINE_LOCATION`。例如业务只使用 `Accuracy.Low` 时，近似位置可能已经足够。

但排除模块依赖的必要权限会破坏相应功能，因此必须保证：

- API 所要求的权限仍然存在。
- 业务请求的精度与清单权限相匹配。
- 真机上验证过授权后的实际精度。

原文给出的 Android 参考范围是：

- 近似位置约在 3 平方千米范围内。
- 精确位置约在 50 米范围内。

## Expo Go 与 Development Build

文档顶部虽然标记该包包含在 Expo Go 中，但这不表示全部功能都可在 Expo Go 运行。

明确限制包括：

- iOS 后台定位不支持 Expo Go，必须使用 development build。
- Android 的前台服务和后台服务不支持 Expo Go，推荐使用 development build。

因此，前台单次定位可以先在 Expo Go 中验证，但后台定位、地理围栏和 Android 前台服务应尽早切换到 development build 与真机测试。

## API 选择速查

| 需求 | API |
| --- | --- |
| 申请前台权限 | `requestForegroundPermissionsAsync` |
| 申请后台权限 | `requestBackgroundPermissionsAsync` |
| 检查前台权限 | `getForegroundPermissionsAsync` |
| 检查后台权限 | `getBackgroundPermissionsAsync` |
| 获取一次新位置 | `getCurrentPositionAsync` |
| 快速读取缓存位置 | `getLastKnownPositionAsync` |
| 前台持续监听位置 | `watchPositionAsync` |
| 后台持续监听位置 | `startLocationUpdatesAsync` |
| 停止后台位置更新 | `stopLocationUpdatesAsync` |
| 启动地理围栏 | `startGeofencingAsync` |
| 停止地理围栏 | `stopGeofencingAsync` |
| 地址转经纬度 | `geocodeAsync` |
| 经纬度转地址 | `reverseGeocodeAsync` |
| 获取一次朝向 | `getHeadingAsync` |
| 持续监听朝向 | `watchHeadingAsync` |
| 获取运动状态 | `getMotionActivityAsync` |
| 监听运动状态 | `watchMotionActivityAsync` |
| 检查系统定位开关 | `hasServicesEnabledAsync` |
| 查看定位数据源状态 | `getProviderStatusAsync` |
| Android 请求高精度模式 | `enableNetworkProviderAsync` |
| 检查后台定位是否可用 | `isBackgroundLocationAvailableAsync` |
| 安装 Web 定位 polyfill | `installWebGeolocationPolyfill` |

## 容易踩坑的地方

1. **授权成功不等于获得精确定位。**  
   Android 用户可以只给近似位置，iOS 用户可以关闭精确位置。

2. **定位权限与系统定位开关是两回事。**  
   权限为 `granted` 时，系统定位服务仍可能被关闭。

3. **后台任务不能定义在组件中。**  
   它必须通过 `TaskManager.defineTask` 在模块顶层定义。

4. **修改 config plugin 后需要重新构建。**  
   热更新或重新加载 JavaScript 不会修改原生权限和 `Info.plist`。

5. **`watchPositionAsync` 不提供后台更新。**  
   后台更新必须使用 `startLocationUpdatesAsync`。

6. **订阅需要主动释放。**  
   `watchPositionAsync`、`watchHeadingAsync` 和 `watchMotionActivityAsync` 返回的订阅都应调用 `remove()`。

7. **iOS 的“允许一次”无法检测。**  
   同一会话继续申请后台权限可能静默失败。

8. **应用被终止后的行为存在平台差异。**  
   Android 不会因为定位或围栏事件自动重启；iOS 仅明确支持由新地理围栏事件重新启动。

9. **高精度并不适合所有场景。**  
   它可能增加等待时间和电量消耗。

10. **地理编码不能高频并发调用。**  
    请求过多可能失败，也不适合在后台无展示需求时执行。

11. **iOS 与 Android 的围栏数量不同。**  
    Android 上限为 100，iOS 上限为 20。

12. **Android 厂商的后台策略不同。**  
    从最近任务列表移除应用后，部分设备会直接停止后台能力。

13. **Google Play 可能要求额外审核。**  
    后台定位和定位前台服务权限会影响发布流程。

## 实际开发中的推荐流程

以下为**基于文档内容推导**的实现顺序：

1. 明确业务只需要前台定位，还是必须持续后台定位。
2. 根据业务误差范围选择精度，不默认使用最高精度。
3. 配置清晰的权限用途说明。
4. 先检查权限状态，再在用户触发相关功能时申请权限。
5. 后台权限采用渐进式申请，先前台、后后台。
6. 权限拒绝且 `canAskAgain` 为 `false` 时，引导用户进入设置。
7. 同时检查系统定位服务是否开启。
8. 快速展示场景可先读取最后已知位置，再请求新位置。
9. 进入持续监听时保存订阅，离开页面或停止功能时释放。
10. 后台任务在独立模块顶层定义，并提供明确的启动、检查和停止入口。
11. 在 development build 和真实设备上测试后台定位。
12. 分别测试拒绝、允许一次、近似位置、关闭系统定位、应用进入后台和应用被终止等情况。
13. 发布前确认 App Store 和 Google Play 的权限说明及审核要求。

## 文档明确说明与推导内容的边界

### 文档明确说明

- 安装方式、平台支持范围和 API 定义。
- CNG、config plugin 及手动原生配置要求。
- 前台与后台权限的系统映射。
- iOS “允许一次”无法检测及其静默失败行为。
- 后台任务和地理围栏任务必须在顶层定义。
- Expo Go 对后台服务的限制。
- 应用终止后的 Android、iOS 行为差异。
- 围栏数量限制。
- 延迟更新仅适用于后台。
- 地理编码的资源消耗和调用限制。
- Android 相关权限可能触发 Google Play 审核。
- 运动状态识别使用独立权限，前台监听在后台暂停。

### 基于文档内容推导

- 使用缓存位置先渲染，再以当前位置刷新界面。
- 对地理编码输入进行限频并控制并发。
- 将后台任务定义放在独立模块中，避免依赖 React 组件生命周期。
- 根据业务精度要求平衡耗电、速度和准确性。
- 将权限申请设计为与具体用户操作相关的渐进流程。
- 后台定位功能应尽早在 development build 和真机上验证。

### 当前文档未涉及

- 定位数据应如何上传、缓存或持久化。
- 地图组件和路线绘制方式。
- 服务端轨迹存储与处理方案。
- 地理编码服务的具体请求配额。
- 后台定位的具体耗电数据。
- App Store 审核后台定位的完整规则。
- 位置数据的隐私政策、加密和合规实现细节。
- 单元测试或自动化测试方案。

## 总结

`expo-location` 的前台单次定位用法与 React Web 的 Geolocation API 较为接近，但后台定位、地理围栏和运动识别属于受操作系统管理的原生能力。

真正影响实现的重点不是调用某一个函数，而是同时处理：

- 原生构建配置。
- 前台、后台、精确和近似权限。
- 系统定位服务状态。
- React 生命周期与系统后台任务的差异。
- iOS 和 Android 的平台限制。
- 电量、更新频率和精度之间的取舍。
- Expo Go、development build 与正式构建的能力差异。
- 应用商店对敏感权限的审核要求。

---

## 文档导航

- **上一页**：[localization](./187__localization.md)
- **下一页**：[magnetometer](./189__magnetometer.md)
