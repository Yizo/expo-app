# 180｜Expo SDK Location 定位、权限与后台跟踪

**翻页：**[上一页：Expo SDK Localization 地区与语言设置](./179-Expo-SDK-Localization.md) · [目录](./README.md) · [下一页：Expo SDK Magnetometer 磁力计](./181-Expo-SDK-Magnetometer.md)

**官方页面：**[Location · Latest](https://docs.expo.dev/versions/latest/sdk/location/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/location/)

**版本与平台：**Latest 推荐 `expo-location ~57.0.19`；SDK v56.0.0 推荐 `~56.0.26`。支持 Android、iOS、Web 和 Expo Go。后台定位、原生前台服务和地理围栏受平台限制；Expo Go 不能完整验证这些原生功能，需按功能使用 development build。

## 定位的几类工作

`expo-location` 读取经纬度、方向、地址、设备位置更新和运动状态。调用前要先取得对应权限；取得权限后，当前定位、旧位置、前台连续监听、后台任务是不同工作模式：

- **一次定位：**`getCurrentPositionAsync()` 向系统请求新的位置，通常较新但可能要等几秒。
- **旧位置：**`getLastKnownPositionAsync()` 读取系统缓存，速度快，但结果可能过时，也可能返回 `null`。
- **前台监听：**`watchPositionAsync()` 在应用前台持续回调；应用进入后台时会暂停。
- **后台任务：**`startLocationUpdatesAsync()` 注册由 TaskManager 执行的任务，可在后台接收批量位置；要预先在模块顶层定义任务，并配置平台权限 / 原生后台模式。
- **地理围栏（geofencing）：**监视一个或多个经纬度圆形区域的进出事件，任务会收到进入 / 离开类型与区域对象。

`accuracy` 越高通常耗电越多、等待越久；`distanceInterval` 控制至少移动多少米再推送一次。权限、定位服务开关、GPS / 网络 provider 状态互不相同，出错时应分别检查。

## 安装与 app config

```sh
npx expo install expo-location
yarn expo install expo-location
pnpm expo install expo-location
bun expo install expo-location
```

已有 React Native 原生工程还要先接入 `expo`。采用 config plugin / Continuous Native Generation（CNG）时，可以在 `app.json` 配置权限说明和后台能力：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "允许应用在使用期间获取位置",
          "locationAlwaysAndWhenInUsePermission": "允许应用在后台继续获取位置",
          "isIosBackgroundLocationEnabled": true,
          "isAndroidBackgroundLocationEnabled": true,
          "isAndroidForegroundServiceEnabled": true,
          "androidForegroundServiceIcon": "./assets/location-service.png"
        }
      ]
    ]
  }
}
```

| 插件属性 | 默认值 / 平台 | 用途 |
| --- | --- | --- |
| `locationAlwaysAndWhenInUsePermission` | iOS | 写入 `NSLocationAlwaysAndWhenInUseUsageDescription`，说明始终访问位置的原因。 |
| `locationAlwaysPermission` | iOS，已弃用 | 旧 `NSLocationAlwaysUsageDescription` 权限说明；iOS 11 及以上优先使用上一个属性。 |
| `locationWhenInUsePermission` | iOS | 写入 `NSLocationWhenInUseUsageDescription`，说明应用运行前台时使用位置的原因。 |
| `motionUsagePermission` | iOS | 写入 `NSMotionUsageDescription`；Latest 的运动活动 API 首次调用时显示此说明。SDK v56 文档保留此配置项，但没有公开对应的 Motion Activity API。 |
| `isIosBackgroundLocationEnabled` | `false`，iOS | 将 `location` 加入 `UIBackgroundModes`。 |
| `isAndroidBackgroundLocationEnabled` | `false`，Android | 加入 `ACCESS_BACKGROUND_LOCATION`。 |
| `isAndroidForegroundServiceEnabled` | 未显式设置时，后台定位启用则默认为 `true`，否则 `false`；Android | 加入 `FOREGROUND_SERVICE` 与 `FOREGROUND_SERVICE_LOCATION`。Android 14 起位置前台服务需要后一个权限。 |
| `androidForegroundServiceIcon` | 未设置，Android | `startLocationUpdatesAsync` 前台服务通知图标的本地路径；要求 96×96、白色、透明 PNG。没设时依次尝试 `expo-notifications` 通知图标，再退回彩色 App 图标；后者可能被系统显示成白色方块。 |

这些是构建时原生配置；修改后要重新 prebuild / 构建应用。没有使用 CNG 的原生工程，iOS `Info.plist` 至少需要相应用途说明，例如：

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>允许应用在使用期间获取位置</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>允许应用在后台继续获取位置</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>允许应用始终访问位置（旧版系统兼容）</string>
```

如果 iOS 要在后台运行定位，还需在 `Expo.plist` 手动配置 `UIBackgroundModes`；CNG 会由 prebuild 自动设置：

```xml
<key>UIBackgroundModes</key>
<array>
  <string>location</string>
</array>
```

## 后台定位与地理围栏限制

| 场景 | 必要条件与平台行为 |
| --- | --- |
| 后台位置更新 | 已授予位置权限；`TaskManager.defineTask()` 必须在模块顶层调用；iOS 还要启用 `location` 后台模式，并使用 development build，Expo Go 不支持。 |
| 后台权限 | Android 需先取得前台权限，再单独请求后台权限；iOS 后台对应 `Always`，通过 `requestBackgroundPermissionsAsync()` 请求。 |
| 地理围栏 | 已获位置权限；任务需在模块顶层定义。Android 每个应用最多 100 个活跃围栏；iOS 同时最多监控 20 个，应用启动时会报告已注册围栏的初始状态。 |
| 应用被终止 | 用户手动结束应用后后台位置更新停止；用户重新启动后可以恢复。Android 不会因位置 / 围栏事件自动重启已终止应用；iOS 可在新围栏事件到来时重启应用。Android 厂商对“从最近任务移除应用”的处理不同。 |
| Expo Go | Android 的前台服务 / 后台服务功能不完整；iOS 后台定位不支持。后台服务建议用 development build 做设备验证。 |

iOS 前台权限对应 `When In Use`，后台权限对应 `Always`。用户在前台权限框选 `Allow Once` 后，该授权只在本次应用会话有效，关闭应用即撤销；iOS 不提供 API 区分 `Allow Once` 和 `Allow While Using the App`。如果随后同一会话请求后台权限，系统可能不再弹窗，结果会是拒绝。应用应允许只拿到 `When In Use` 时仍能工作，并在确有需要时分步说明、请求权限。

若用户需要自行去设置打开后台定位，可以打开应用设置页：

```ts
import { Linking } from 'react-native';

export function openAppSettings() {
  return Linking.openURL('app-settings:');
}
```

Android 11 及以上请求后台权限可能会跳转系统设置页，因此应先向用户说明用途。后台定位权限如果要随新版本启用，官方文档提示可能需要向应用商店提交审核并申请使用后台位置权限。

### 延迟 / 批处理位置更新

`LocationTaskOptions` 的 `deferredUpdatesDistance`、`deferredUpdatesInterval`、`deferredUpdatesTimeout` 可让系统达到一定移动距离或等待时间后再批量回调，降低耗电；只对应用处于后台时的更新生效。Latest 页面说明段有一处写作 `deferredTimeout`，其 API 属性表名为 `deferredUpdatesTimeout`。

## 读取当前坐标

下面示例覆盖官方 Usage 流程：Android 模拟器特殊提示、申请前台权限、权限拒绝状态、获取一次当前位置、等待 / 错误 / 坐标显示。示例中模拟器检查对应 Expo Snack 的限制；真机和已配置位置服务的模拟器可读取定位。

示例额外导入 `expo-device` 来判断真机 / 模拟器；独立复制时安装：`npx expo install expo-device`。

```tsx
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import * as Device from 'expo-device';
import * as Location from 'expo-location';

export default function CurrentLocationScreen() {
  const [position, setPosition] = useState<Location.LocationObject | null>(null);
  const [message, setMessage] = useState('正在读取位置…');

  useEffect(() => {
    async function loadPosition() {
      if (Platform.OS === 'android' && !Device.isDevice) {
        setMessage('请在真机或已配置位置的模拟器中运行此示例。');
        return;
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setMessage('未获准读取位置');
        return;
      }

      try {
        const result = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setPosition(result);
        setMessage(JSON.stringify(result));
      } catch (error) {
        setMessage(error instanceof Error ? error.message : '无法取得位置');
      }
    }

    void loadPosition();
  }, []);

      return (
        <View style={styles.container}>
          <Text style={styles.text}>
            {position
              ? `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`
              : message}
          </Text>
        </View>
      );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
  },
});
```

Android Emulator 要在 Android Studio 虚拟设备里开启 Settings → Location → Use location。若没有位置，可关掉 Improve Location Accuracy 后从模拟器的 GPS 控件注入坐标。iOS Simulator 在 Features → Location 中选择一个非 None 的位置。

## 权限 Hook

```ts
import * as Location from 'expo-location';

const [foregroundStatus, requestForeground, getForeground] =
  Location.useForegroundPermissions();
const [backgroundStatus, requestBackground, getBackground] =
  Location.useBackgroundPermissions();
// Latest only; SDK v56 没有公开运动活动权限 API。
const [motionStatus, requestMotion] = Location.useMotionActivityPermissions();
```

前两个 Hook 在 Android、iOS、Web 可用，motion 权限 Hook 是 Android / iOS 的 Latest API。每个 Hook 可选接收 `PermissionHookOptions`，返回 `[PermissionResponse | null, requestPermission, getPermission]`；示例里不需要读取当前权限时可只解构前两项。异步请求 / 读取权限的方法可用于按钮事件，避免刚挂载时自动弹权限框。

## 方法参考

### 定位和 provider

| 方法 | 返回值 / 行为 | 平台与注意 |
| --- | --- | --- |
| `getCurrentPositionAsync(options?)` | `Promise<LocationObject>`；请求一次新坐标。 | Android、iOS、Web。可能要等数秒；精度要求高或室内会更慢。 |
| `getLastKnownPositionAsync(options?)` | `Promise<LocationObject \| null>`；读取缓存坐标。 | 三个平台；更快但可能过时；不符合 `maxAge` / `requiredAccuracy` 则为 `null`。 |
| `watchPositionAsync(options, callback, errorHandler?)` | `Promise<LocationSubscription>`；订阅前台位置。 | Android、iOS、Web；后台暂停，要后台更新则使用 `startLocationUpdatesAsync()`。 |
| `getHeadingAsync()` | `Promise<LocationHeadingObject>`；取指南针方位。 | Android、iOS、Web；内部监听几次 heading，等待精度较合适的结果。 |
| `watchHeadingAsync(callback, errorHandler?)` | `Promise<LocationSubscription>`；持续接收指南针更新。 | Android、iOS；记得 `subscription.remove()`。 |
| `getProviderStatusAsync()` | `Promise<LocationProviderStatus>`；读 provider 可用状态。 | Android、iOS、Web。 |
| `hasServicesEnabledAsync()` | `Promise<boolean>`；检查用户是否开启系统定位服务。 | Android、iOS、Web。 |
| `enableNetworkProviderAsync()` | `Promise<void>`；请求用户启用高精度网络 provider。 | 仅 Android；用户拒绝时 Promise reject。 |
| `installWebGeolocationPolyfill()` | `void`；给 `navigator.geolocation` 安装兼容层。 | Web；让 Web Geolocation API 与 React Native geolocation 用法互通。 |
| `isBackgroundLocationAvailableAsync()` | `Promise<boolean>`；查询后台定位是否可用。 | Android、iOS、Web。 |

### 权限

| 方法 | 返回值 / 行为 |
| --- | --- |
| `getForegroundPermissionsAsync()` | `Promise<LocationPermissionResponse>`；读取前台定位权限状态。 |
| `requestForegroundPermissionsAsync()` | `Promise<LocationPermissionResponse>`；请求前台定位权限。 |
| `getBackgroundPermissionsAsync()` | `Promise<PermissionResponse>`；读取后台定位权限状态。 |
| `requestBackgroundPermissionsAsync()` | `Promise<PermissionResponse>`；请求后台定位权限；Android 11+ 可能转系统设置，需先取得前台权限。 |
| `getMotionActivityPermissionsAsync()` | `Promise<PermissionResponse>`；读取运动活动权限。Latest only，Android / iOS。 |
| `requestMotionActivityPermissionsAsync()` | `Promise<PermissionResponse>`；请求运动活动权限；Android 10+ 涉及 `ACTIVITY_RECOGNITION`，iOS 首次会弹运动与健身权限。Latest only。 |

### 地理编码与方向

**地理编码（geocoding）**把地址转成坐标，反向地理编码把坐标换成地址字段。它需要网络 / 系统地理编码服务，属于耗资源调用；不要在后台频繁请求或一次发送大量请求。Android 两个地理编码 API 都要求先申请前台位置权限。

| 方法 | 返回值 / 参数 |
| --- | --- |
| `geocodeAsync(address)` | `Promise<LocationGeocodedLocation[]>`；`address: string` 地址转换为坐标数组，通常一项。 |
| `reverseGeocodeAsync(location)` | `Promise<LocationGeocodedAddress[]>`；按 `{ latitude, longitude }` 转成地址数组，通常一项。 |

示例：

```ts
const [match] = await Location.geocodeAsync('台北市信义区市府路 1 号');
if (match) {
  const [address] = await Location.reverseGeocodeAsync({
    latitude: match.latitude,
    longitude: match.longitude,
  });
  console.log(address?.city, address?.street, address?.streetNumber);
}
```

### 后台位置和地理围栏任务

`TaskManager.defineTask()` 要写在模块顶层而不是组件函数内。围栏事件会收到 `eventType` 和 `region`；后台位置任务会收到 `locations` 数组。开始任务时传入的任务名必须与定义任务的名字一致。

```ts
import { GeofencingEventType } from 'expo-location';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const REGION_TASK = 'store-region-events';
const POSITION_TASK = 'background-position-batch';

TaskManager.defineTask(REGION_TASK, ({ data, error }) => {
  if (error || !data) return;
  const { eventType, region } = data as {
    eventType: GeofencingEventType;
    region: Location.LocationRegion;
  };
  if (eventType === GeofencingEventType.Enter) console.log('进入区域', region.identifier);
  if (eventType === GeofencingEventType.Exit) console.log('离开区域', region.identifier);
});

TaskManager.defineTask(POSITION_TASK, ({ data, error }) => {
  if (error || !data) return;
  const { locations } = data as { locations: Location.LocationObject[] };
  console.log('后台收到位置批次', locations);
});

export async function startTracking() {
  await Location.startGeofencingAsync(REGION_TASK, [
    {
      identifier: 'office',
      latitude: 25.033,
      longitude: 121.5654,
      radius: 250,
      notifyOnEnter: true,
      notifyOnExit: true,
    },
  ]);

  await Location.startLocationUpdatesAsync(POSITION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    distanceInterval: 100,
    timeInterval: 60_000,
    deferredUpdatesDistance: 250,
    deferredUpdatesInterval: 120_000,
    foregroundService: {
      notificationTitle: '位置跟踪已开启',
      notificationBody: '应用正在记录位置更新',
    },
  });
}

export async function stopTracking() {
  await Location.stopGeofencingAsync(REGION_TASK);
  await Location.stopLocationUpdatesAsync(POSITION_TASK);
}
```

`startGeofencingAsync(taskName, regions?)` 可再次调用以替换正在监控的 regions；`stopGeofencingAsync()` 与 `stopLocationUpdatesAsync()` 会注销对应任务。`hasStartedGeofencingAsync(taskName)`、`hasStartedLocationUpdatesAsync(taskName)` 可分别检查是否已注册；后台位置要同时满足权限、CNG / 原生配置和运行时 TaskManager 定义。

### Motion Activity（仅 Latest）

Latest 参考加入读取 / 订阅行走、骑行、驾驶、静止等活动的 API。它是设备运动状态，不是坐标位置。Android 使用 Google Play Services 活动识别；Android 10+ 需要运行时 `ACTIVITY_RECOGNITION` 权限。iOS 使用运动协处理器，首次请求会提示 Motion & Fitness 权限。订阅只在前台运行，后台会暂停，回到前台再恢复。

```ts
import * as Location from 'expo-location';

const snapshot = await Location.getMotionActivityAsync();
if (snapshot.activities.automotive.detected) {
  console.log('当前可能在乘车，置信度：', snapshot.activities.automotive.confidence);
}

const subscription = await Location.watchMotionActivityAsync(activity => {
  console.log('运动状态快照', activity.activities.walking.detected);
});

// 不再需要时
subscription.remove();
```

## 类型参考

### 坐标、位置和订阅

| 类型 | 字段 / 说明 |
| --- | --- |
| `LocationObject` | `coords: LocationObjectCoords`、`timestamp: number`（Unix epoch 毫秒）；Android 另有可选 `mocked: boolean`。 |
| `LocationObjectCoords` | `latitude` / `longitude: number`；`accuracy`、`altitude`、`altitudeAccuracy`、`heading`、`speed` 为 `number \| null`，Web 数据源不提供时可空。heading 从北方 0° 顺时针计算；speed 单位 m/s。 |
| `LocationGeocodedLocation` | 地址地理编码结果：`latitude`、`longitude`；可选 `accuracy`（不确定半径，米）、`altitude`（WGS 84 椭球面以上高度，米）。 |
| `LocationSubscription` | `remove(): void`，停止 watch 回调。 |
| `LocationCallback` | 收到 `LocationObject` 的位置回调。 |
| `LocationHeadingCallback` | 收到 `LocationHeadingObject` 的方向回调。 |
| `LocationErrorCallback` | 收到错误原因 `string` 的回调。 |

### 地址、方向与区域

| 类型 | 字段 |
| --- | --- |
| `LocationGeocodedAddress` | `city`、`country`、`district`、`formattedAddress`、`isoCountryCode`、`name`、`postalCode`、`region`、`street`、`streetNumber`、`subregion`、`timezone` 都是 `string \| null`；`formattedAddress` 仅 Android，`timezone` 仅 iOS。 |
| `LocationHeadingObject` | `magHeading` 磁北方位°、`trueHeading` 真北方位°（需定位权限，否则 `-1`）、`accuracy` 校准等级：0 无、1 低、2 中、3 高。iOS 的不确定度分别大于 50°、小于 50°、35°、20°。 |
| `LocationRegion` | `latitude`、`longitude` 圆心；`radius` 米；可选 `identifier`（默认自动 UUID）、`notifyOnEnter` / `notifyOnExit`（默认 true）、`state: GeofencingRegionState`。 |
| `LocationProviderStatus` | `backgroundModeEnabled`、`locationServicesEnabled`；Android 还可能有 `gpsAvailable`、`networkAvailable`、`passiveAvailable`。 |

### 请求选项

| 类型 | 字段 / 默认值 |
| --- | --- |
| `LocationOptions` | `accuracy?: Accuracy`（默认 Balanced）；`distanceInterval?: number`（至少移动米数，默认可随精度变化）；Android `timeInterval?: number`（毫秒，最小更新间隔）、`mayShowUserSettingsDialog?: boolean`（默认 true，是否提示改善定位精度）。 |
| `LocationLastKnownOptions` | `maxAge?: number`（缓存最大有效毫秒数）；`requiredAccuracy?: number`（最大误差半径，米；缓存误差更大时返回 null）。 |
| `LocationTaskOptions` | 继承 `LocationOptions`；`activityType?: ActivityType`（iOS，默认 Other）；`deferredUpdatesDistance?: number`、`deferredUpdatesInterval?: number`、`deferredUpdatesTimeout?: number`；`foregroundService?: LocationTaskServiceOptions`；iOS `pausesUpdatesAutomatically?: boolean`（默认 false）、`showsBackgroundLocationIndicator?: boolean`（默认 false）。 |
| `LocationTaskServiceOptions` | Android 通知 `notificationTitle`、`notificationBody`；可选 `killServiceOnDestroy?: boolean`、`notificationColor?: string`（`#RRGGBB` / `#AARRGGBB`）。 |

### 权限类型

| 类型 | 字段 / 含义 |
| --- | --- |
| `PermissionResponse` | `canAskAgain` 是否还能再弹授权框；`expires: PermissionExpiration`；`granted` 便捷布尔值；`status: PermissionStatus`。 |
| `PermissionExpiration` | `'never' \| number`；当前系统授权通常为永久。 |
| `LocationPermissionResponse` | 继承 `PermissionResponse`，另带可选 `android?: PermissionDetailsLocationAndroid`、`ios?: PermissionDetailsLocationIOS`。 |
| `PermissionDetailsLocationAndroid` | `accuracy: 'fine' \| 'coarse' \| 'none'`。 |
| `PermissionDetailsLocationIOS` | iOS 14+ `accuracy: 'full' \| 'reduced'`（精确 / 大致位置）；`scope: 'whenInUse' \| 'always' \| 'none'`。iOS 14 前 accuracy 总为 full。 |
| `PermissionHookOptions` | Hook 参数联合类型：`PermissionHookBehavior \| Options`。 |

### Motion Activity 类型（仅 Latest）

| 类型 | 字段 / 含义 |
| --- | --- |
| `MotionActivityObject` | `activities: Record<MotionActivityType, MotionActivityState>`，每类活动都有独立状态；`timestamp: number` 为 Unix epoch 毫秒。 |
| `MotionActivityState` | `detected: boolean`；`confidence: MotionActivityConfidence`。未检测到时置信度总为 `Low`。 |
| `MotionActivityCallback` | 每次更新时接收 `MotionActivityObject`。 |

## 枚举

### `Accuracy`

| 成员 | 值 | 粗略目标 |
| --- | ---: | --- |
| `Lowest` | `1` | 约 3 公里。 |
| `Low` | `2` | 约 1 公里。 |
| `Balanced` | `3` | 约 100 米。 |
| `High` | `4` | 约 10 米。 |
| `Highest` | `5` | 系统可用的最佳精度。 |
| `BestForNavigation` | `6` | 导航可用的最高精度，会借助额外传感器。 |

这些是等级说明，不是定位结果的精度保证；设备、权限、遮挡和系统服务都影响实际结果。

### `ActivityType`

| 成员 | 值 | 说明 |
| --- | ---: | --- |
| `Other` | `1` | 默认；没有更匹配活动时使用。 |
| `AutomotiveNavigation` | `2` | 汽车导航。 |
| `Fitness` | `3` | 步行、跑步、骑行等健身活动。 |
| `OtherNavigation` | `4` | 非汽车类的其它交通导航。 |
| `Airborne` | `5` | 飞行活动；仅 iOS，不支持时回退为 Other。 |

### 地理围栏与权限枚举

| 枚举 | 成员和值 | 含义 |
| --- | --- | --- |
| `GeofencingEventType` | `Enter = 1`、`Exit = 2` | 设备进入 / 离开围栏。 |
| `GeofencingRegionState` | `Unknown = 0`、`Inside = 1`、`Outside = 2` | 围栏的未知、区域内、区域外状态。 |
| `PermissionStatus` | `DENIED = 'denied'`、`GRANTED = 'granted'`、`UNDETERMINED = 'undetermined'` | 用户拒绝、已授权、尚未选择。 |

### Motion Activity 枚举（仅 Latest）

| 枚举 | 成员和值 | 含义 |
| --- | --- | --- |
| `MotionActivityConfidence` | `Low = 0`、`Medium = 1`、`High = 2` | 置信度。Android 把 0–100 的平台概率分桶；iOS 映射系统置信度。 |
| `MotionActivityType` | `Automotive = 'automotive'`、`Cycling = 'cycling'`、`Running = 'running'`、`Stationary = 'stationary'`、`Unknown = 'unknown'`、`Walking = 'walking'` | 乘车、骑行、跑步、静止、未知、步行。Android 映射 Play Services 活动常量；iOS 按运动状态布尔值映射。 |

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-location ~57.0.19`；SDK v56.0.0 推荐 `~56.0.26`。其它定位 / 地理编码 / 后台任务主要 API 及 Accuracy、ActivityType、围栏和基础权限类型在两版均列出。
- Latest 增加 `useMotionActivityPermissions()`、`getMotionActivityAsync()`、`getMotionActivityPermissionsAsync()`、`requestMotionActivityPermissionsAsync()`、`watchMotionActivityAsync()`，以及 `MotionActivityCallback`、`MotionActivityObject`、`MotionActivityState`、`MotionActivityConfidence`、`MotionActivityType`。SDK v56 页面没有这些 API / 类型；虽有 `motionUsagePermission` 插件说明，不代表 v56 已公开运动活动 API。
- 两版都将后台定位、地理围栏标注为需 TaskManager 顶层任务；两版 Next 均为 Expo SDK Magnetometer。

## 源页代码主题覆盖

- Installation / app config：覆盖四种包管理器安装命令、完整 config plugin JSON、全部 8 个插件属性、手动 Info.plist 权限项和 iOS `UIBackgroundModes` 配置。
- 权限流程：保留前台 / 后台权限区别、iOS Allow Once 限制、打开系统设置示例、Android 11+ 设置跳转和 Expo Go / development build 背景能力边界。
- Usage：改写设备检测、前台权限、错误状态、一次性坐标读取和 RN 样式示例；保留 Android Emulator / iOS Simulator 的位置开关步骤。
- Hooks / API：列出权限 hooks、所有前台 / 后台定位方法、地理编码、provider 检查、geofencing / location task 启停、方向与 Web polyfill 方法。
- Background code：改写地理围栏事件 `TaskManager.defineTask` 示例、位置批次后台 task 示例与开始 / 停止注册调用；补充 Latest 的 motion snapshot / watcher 示例。
- Types / Enums：覆盖坐标、地址、方向、围栏、定位 options、后台 task options、权限响应及全部公开枚举；将 Latest 新增 Motion Activity 类型明确隔离为 SDK 57 API。
- 源页未提供每个简单查询方法各自的独立 runnable 示例；按 Usage / task 示例覆盖每类执行路径，并在方法 / 类型表中列明其余公开 API 行为、参数、返回和平台边界。

**翻页：**[上一页：Expo SDK Localization 地区与语言设置](./179-Expo-SDK-Localization.md) · [目录](./README.md) · [下一页：Expo SDK Magnetometer 磁力计](./181-Expo-SDK-Magnetometer.md)
