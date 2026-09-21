# 184｜Expo SDK Maps 原生地图

**翻页：**[上一页：Expo SDK Manifests Expo 清单类型](./183-Expo-SDK-Manifests.md) · [目录](./README.md) · [下一页：Expo SDK MediaLibrary](./185-Expo-SDK-MediaLibrary.md)

**官方页面：**[Maps · Latest](https://docs.expo.dev/versions/latest/sdk/maps/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/maps/)

**版本与平台：**Latest 推荐 `expo-maps ~57.0.3`；SDK v56.0.0 推荐 `~56.0.7`。这是 Alpha API，接口可能发生 breaking change；不能在 Expo Go 使用，需 development build。Google Maps 仅 Android；Apple Maps 仅 iOS。

## 两个平台使用不同地图 SDK

`expo-maps` 将原生地图控件封装为 React 组件：iOS 渲染 Apple Maps，Android 渲染 Google Maps。它没有 Web 地图实现，也不在 iOS 上提供 Google Maps。因此组件通常要按 `Platform.OS` 分支渲染。

地图 SDK 在原生应用二进制中，Expo Go 没有打包这个 Alpha 模块。安装包后要创建 development build。Apple Maps 安装后不需额外服务配置；Android Google Maps 需要 Google Cloud API 项目、受限 API key、包名 / SHA-1 签名配置。

## 安装 / 示例工程

```sh
npx expo install expo-maps
yarn expo install expo-maps
pnpm expo install expo-maps
bun expo install expo-maps
```

官方还提供已配置好 `expo-maps` 的 `with-maps` 示例模板：

```sh
npx create-expo-app --example with-maps
yarn create expo-app --example with-maps
pnpm create expo-app --example with-maps
bun create expo --example with-maps
```

在现有 React Native 工程安装前需先接入 `expo`。如果使用原生地图示例中自定义的图片标记，还需 `npx expo install expo-image`。

## Android Google Maps 配置

要在 Android 显示 Google 地图，Expo 官方步骤是：

1. 在 Google Cloud 创建项目，并启用 Maps SDK for Android。
2. 为不同签名准备 SHA-1：开发构建用 Expo 项目 Dashboard → Project settings → Credentials 里的 Android Keystore 指纹；Play Store 则需要先上传过应用，再从 Play Console → App integrity → App Signing 取 App signing key SHA-1。
3. 创建 API key，并将它限制为 Android apps；限制项需要填写 `android.package` 包名和对应 SHA-1。
4. 把 API key 写入 Expo app config，并新建 development build。

```json
{
  "expo": {
    "android": {
      "package": "com.example.fieldapp",
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_MAPS_API_KEY"
        }
      }
    }
  }
}
```

`android.package` 和 SHA-1 要与签名使用的应用一致；开发签名与 Play Store 签名通常不同。不要将无应用限制的 API key 放进客户端。

## 显示平台地图和当前位置权限

```tsx
import { AppleMaps, GoogleMaps } from 'expo-maps';
import { Platform, Text } from 'react-native';

export default function NativeMapScreen() {
  if (Platform.OS === 'ios') {
    return <AppleMaps.View style={{ flex: 1 }} />;
  }
  if (Platform.OS === 'android') {
    return <GoogleMaps.View style={{ flex: 1 }} />;
  }
  return <Text>地图仅支持 Android 与 iOS。</Text>;
}
```

如果要在地图上显示用户当前位置，先声明并请求位置权限。CNG 工程可用 `expo-maps` config plugin；手动维护原生工程需配置对应权限说明：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-maps",
        {
          "requestLocationPermission": true,
          "locationPermission": "允许应用在地图上显示你的位置"
        }
      ]
    ]
  }
}
```

| 插件属性 | 默认值 | 作用 |
| --- | --- | --- |
| `requestLocationPermission` | `false` | 在 AndroidManifest.xml 与 Info.plist 声明位置权限。 |
| `locationPermission` | iOS 专用 | `NSLocationWhenInUseUsageDescription` 的用户提示文案。 |

插件改动属于构建时配置，应用新配置要重新构建。检查 / 请求地图位置权限可用 `Maps.getPermissionsAsync()`、`Maps.requestPermissionsAsync()` 或 `useLocationPermissions()`。

## 自定义 Marker / Annotation 图标

自定义标记要传入由 `expo-image` 的 `useImage()` 取得的图片引用，不是直接传 `source` 字符串。Google Maps 的标记锚点 `anchor` 用 0–1 的比例定位（例如 `{ x: 0.5, y: 0.5 }` 为图标中心）；图片尺寸来自加载图片本身，可在 SVG 中设置 width / height / viewBox，或给 `useImage()` 指定最大尺寸。

Android Google Maps Marker 示例：

```tsx
import { useImage } from 'expo-image';
import { GoogleMaps } from 'expo-maps';

export function GoogleMapWithMarker() {
  const pin = useImage('https://example.com/pin.svg', { maxWidth: 48, maxHeight: 48 });

  return (
    <GoogleMaps.View
      style={{ flex: 1 }}
      markers={[
        {
          coordinates: { latitude: 37.78825, longitude: -122.4324 },
          icon: pin ?? undefined,
          anchor: { x: 0.5, y: 0.5 },
        },
      ]}
    />
  );
}
```

iOS Apple Maps Annotation 示例：

```tsx
import { useImage } from 'expo-image';
import { AppleMaps } from 'expo-maps';

export function AppleMapWithAnnotation() {
  const pin = useImage('https://example.com/pin.svg');

  return (
    <AppleMaps.View
      style={{ flex: 1 }}
      annotations={[
        {
          coordinates: { latitude: 37.78825, longitude: -122.4324 },
          icon: pin ?? undefined,
          text: '门店',
          textColor: '#ffffff',
          backgroundColor: '#276EF1',
        },
      ]}
    />
  );
}
```

`AppleMaps.Annotation` 可显示自定义图像、文字与背景；标准 `AppleMaps.Marker` 另有 SF Symbol、短 monogram、tintColor 等原生标记选项。二者不应混淆。

## 组件属性

### `AppleMaps.View`（仅 iOS）

| 属性 | 类型 | 行为 |
| --- | --- | --- |
| `annotations` | `AppleMapsAnnotation[]` | 文本 / 自定义图标注记列表。 |
| `cameraPosition` | `CameraPosition` | 初始地图相机中心与缩放级别。 |
| `circles` | `AppleMapsCircle[]` | 圆形覆盖层列表。 |
| `colorScheme` | `AppleMapsColorScheme`，默认 `AUTOMATIC` | 跟随应用、固定亮色或暗色。 |
| `markers` | `AppleMapsMarker[]` | Apple Maps 原生标记列表。 |
| `onAnnotationClick` | `(annotation) => void`，iOS 18+ | 注记被点击时触发。 |
| `onCameraMove` | `(CameraMoveEvent) => void` | 用户移动地图时触发；初次挂载也会用初始视口触发一次。 |
| `onCircleClick` | `(AppleMapsCircle) => void`，iOS 18+ | 圆形被点击。 |
| `onMapClick` | `({ coordinates }) => void` | 点击空白地图时触发；点到 POI 或 marker 不触发。 |
| `onMarkerClick` | `(AppleMapsMarker) => void`，iOS 18+ | 原生 marker 被点击。 |
| `onPolygonClick` / `onPolylineClick` | `(polygon/polyline) => void`，iOS 18+ | 对应覆盖图形被点击。 |
| `polygons` / `polylines` | `AppleMapsPolygon[]` / `AppleMapsPolyline[]` | 多边形 / 折线图层。 |
| `properties` | `AppleMapsProperties` | 地图样式、当前位置、交通和 POI 设置。 |
| `ref` | `AppleMapsViewType` | 调用镜头 / 选择原生标记方法。 |
| `style` | `StyleProp<ViewStyle>` | RN 布局样式，通常设置宽高 / `flex: 1`。 |
| `uiSettings` | `AppleMapsUISettings` | 指南针、我的位置按钮、比例尺等控件。 |

### `GoogleMaps.View`（仅 Android）

| 属性 | 类型 | 行为 |
| --- | --- | --- |
| `cameraPosition` | `CameraPosition` | 初始视口。 |
| `circles` / `markers` / `polygons` / `polylines` | 各自 GoogleMaps 图形数组 | 在底图上绘制原生图层。 |
| `colorScheme` | `GoogleMapsColorScheme` | 暗色、亮色或跟随系统。 |
| `contentPadding` | `GoogleMapsContentPadding` | 为被遮挡边缘留空间；start/end 会按 LTR / RTL 映射左右。 |
| `mapOptions` | `GoogleMapsMapOptions` | GoogleMapOptions 配置，如 Google Cloud 的 `mapId`。 |
| `onCameraMove` | `(CameraMoveEvent) => void` | 地图移动时触发，并在挂载时触发一次。 |
| `onCircleClick` / `onMarkerClick` / `onPolygonClick` / `onPolylineClick` | 对应图形事件回调 | 点击图层时收到对应对象。 |
| `onMapClick` / `onMapLongClick` | `({ coordinates }) => void` | 点击 / 长按地图时收到坐标。 |
| `onMapLoaded` | `() => void` | 地图加载完成。 |
| `onPOIClick` | `({ coordinates, name }) => void` | 点击 Google 地图兴趣点。 |
| `properties` | `GoogleMapsProperties` | 楼宇 / 室内 / 当前位置 / 交通 / 缩放 / 样式设置。 |
| `ref` | `GoogleMapsViewType` | 选择标记或移动相机。 |
| `style` | `StyleProp<ViewStyle>` | RN 视图布局样式。 |
| `uiSettings` | `GoogleMapsUISettings` | 地图交互手势与内建按钮。 |
| `userLocation` | `GoogleMapsUserLocation` | 指定用户位置并可让相机跟随。 |

### `GoogleStreetView`（仅 Android）

页面列出街景属性：`isPanningGesturesEnabled`、`isStreetNamesEnabled`、`isUserNavigationEnabled`、`isZoomGesturesEnabled`、`position: StreetViewCameraPosition`、`style: StyleProp<ViewStyle>`。

## Hooks 与方法

| API | 返回 / 用途 |
| --- | --- |
| `useLocationPermissions(options?)` | `[PermissionResponse \| null, requestPermission, getPermission]`；Hook 版读取 / 请求地图位置权限。 |
| `Maps.getPermissionsAsync()` | `Promise<PermissionResponse>`。 |
| `Maps.requestPermissionsAsync()` | `Promise<PermissionResponse>`。 |

## 主要类型

### 相机、坐标与事件

| 类型 | 字段 |
| --- | --- |
| `Coordinates` | `latitude?: number`、`longitude?: number`。 |
| `CameraPosition` | `coordinates?: Coordinates`、`zoom?: number`。某些视口尺寸下可用最小 zoom 会不同。 |
| `CameraMoveEvent` | `bearing`、`tilt`、`zoom`、`coordinates`、`latitudeDelta`（视口纬度范围）、`longitudeDelta`（视口经度范围）。 |
| `SetCameraPositionConfig` | 继承 `CameraPosition`，Android 另有可选 `duration?: number` 毫秒；iOS 不支持动画时长。 |
| `StreetViewCameraPosition` | Android：`coordinates`，可选 `bearing`、`tilt`、`zoom`。 |

### Apple Maps 类型

| 类型 | 字段 / 含义 |
| --- | --- |
| `AppleMapsAnnotation` | 继承 `AppleMapsMarker`；另含 `backgroundColor?`、图片引用 `icon?`、`text?`、`textColor?`。 |
| `AppleMapsCircle` | `center`、`radius` 米；可选 `color`、`lineColor`、`lineWidth`、`width`、`id`。 |
| `AppleMapsMarker` | 可选 `coordinates`、`id`、`monogram`（iOS 17+）、`systemImage`、`tintColor`、`title`；monogram 与 systemImage 互斥，若同时传，systemImage 优先。 |
| `AppleMapsPointOfInterestCategories` | `including?: AppleMapPointOfInterestCategory[]`、`excluding?: AppleMapPointOfInterestCategory[]`；空数组分别表示不包含任何类 / 不排除任何类。 |
| `AppleMapsPolygon` | `coordinates`，可选 `color`、`id`、`lineColor`、`lineWidth`。 |
| `AppleMapsPolyline` | `coordinates`，可选 `color`、`contourStyle`、`id`、`width`。 |
| `AppleMapsProperties` | 可选 `elevation`、`emphasis`、`isMyLocationEnabled`（默认 false）、`isTrafficEnabled`、`mapType`、`pointsOfInterest`、`polylineTapThreshold`（默认 20 米）、`selectionEnabled`。 |
| `AppleMapsUISettings` | 可选 `compassEnabled`、`myLocationButtonEnabled`、`scaleBarEnabled`、`togglePitchEnabled`。 |
| `AppleMapsViewType` | `openLookAroundAsync(coordinates)`；iOS 18+ 的 `selectAnnotation(id, options)` / `selectMarker(id, options)`；`setCameraPosition(config)`。iOS camera 不支持动画时长。 |

### Google Maps 类型

| 类型 | 字段 / 含义 |
| --- | --- |
| `GoogleMapsAnchor` | `x` / `y` 是 0–1 归一化锚点；左 / 上边为 0，右 / 下边为 1。 |
| `GoogleMapsCircle` | `center`、`radius`；可选 `clickCoordinates`、`color`、`id`、`lineColor`、`lineWidth`。 |
| `GoogleMapsContentPadding` | 可选 `top`、`bottom`、`start`、`end`；start/end 会考虑 RTL。 |
| `GoogleMapsMapOptions` | `mapId?: string`，引用 Google Cloud 中存储的地图样式 / 配置 ID。 |
| `GoogleMapsMapStyleOptions` | `json: string`，Google Map 样式 JSON 字符串。 |
| `GoogleMapsMarker` | 可选 `anchor`（默认图标底部中央）、`coordinates`、`draggable`、图片引用 `icon`、`id`、`showCallout`、`snippet`、`title`、`zIndex`（默认 0）。 |
| `GoogleMapsPolygon` | `coordinates`，可选 `color`、`id`、`lineColor`、`lineWidth`。 |
| `GoogleMapsPolyline` | `coordinates`，可选 `color`、`geodesic`、`id`、`width`。 |
| `GoogleMapsProperties` | 可选 `isBuildingEnabled`、`isIndoorEnabled`、`isMyLocationEnabled`、`isTrafficEnabled`、`mapStyleOptions`、`mapType`、`maxZoomPreference`、`minZoomPreference`、`selectionEnabled`。 |
| `GoogleMapsUISettings` | 可选指南针、室内楼层选择器、工具栏、我的位置按钮、旋转 / 缩放 / 倾斜 / 滚动手势、比例尺、缩放按钮。 |
| `GoogleMapsUserLocation` | `coordinates` 和 `followUserLocation: boolean`。 |
| `GoogleMapsViewType` | `setCameraPosition(config)`；`selectMarker(id, { moveCamera, zoom })` 返回 Promise，快速重复调用可能取消上一动画并 reject。 |

### Apple POI 分类枚举

`AppleMapPointOfInterestCategory` 每项的字符串值与成员名相同，可用于 include / exclude 筛选。完整成员为：

`AIRPORT`、`AMUSEMENT_PARK`、`ANIMAL_SERVICE`、`AQUARIUM`、`ATM`、`AUTOMOTIVE_REPAIR`、`BAKERY`、`BANK`、`BASEBALL`、`BASKETBALL`、`BEACH`、`BEAUTY`、`BOWLING`、`BREWERY`、`CAFE`、`CAMPGROUND`、`CAR_RENTAL`、`CASTLE`、`CONVENTION_CENTER`、`DISTILLERY`、`EV_CHARGER`、`FAIRGROUND`、`FIRE_STATION`、`FISHING`、`FITNESS_CENTER`、`FOOD_MARKET`、`FORTRESS`、`GAS_STATION`、`GO_KART`、`GOLF`、`HIKING`、`HOSPITAL`、`HOTEL`、`KAYAKING`、`LANDMARK`、`LAUNDRY`、`LIBRARY`、`MAILBOX`、`MARINA`、`MINI_GOLF`、`MOVIE_THEATER`、`MUSEUM`、`MUSIC_VENUE`、`NATIONAL_MONUMENT`、`NATIONAL_PARK`、`NIGHTLIFE`、`PARK`、`PARKING`、`PHARMACY`、`PLANETARIUM`、`POLICE`、`POST_OFFICE`、`PUBLIC_TRANSPORT`、`RESTAURANT`、`RESTROOM`、`ROCK_CLIMBING`、`RV_PARK`、`SCHOOL`、`SKATE_PARK`、`SKATING`、`SKIING`、`SOCCER`、`SPA`、`STADIUM`、`STORE`、`SURFING`、`SWIMMING`、`TENNIS`、`THEATER`、`UNIVERSITY`、`VOLLEYBALL`、`WINERY`、`ZOO`。

### 地图样式枚举

| 枚举 | 字符串值 | 用途 |
| --- | --- | --- |
| `AppleMapsColorScheme` | `AUTOMATIC` / `DARK` / `LIGHT` | 跟随应用、强制暗色 / 亮色。 |
| `AppleMapsContourStyle` | `GEODESIC` / `STRAIGHT` | 折线按地球测地曲线或直线显示。 |
| `AppleMapsMapStyleElevation` | `AUTOMATIC` / `FLAT` / `REALISTIC` | 默认 2D、平面、真实 3D 地形。 |
| `AppleMapsMapStyleEmphasis` | `AUTOMATIC` / `MUTED` | 默认重点或弱化底图影像。 |
| `AppleMapsMapType` | `HYBRID` / `IMAGERY` / `STANDARD` | 混合卫星与道路、卫星影像、标准道路地图。 |
| `GoogleMapsColorScheme` | `DARK` / `FOLLOW_SYSTEM` / `LIGHT` | 暗色、跟随系统、亮色。 |
| `GoogleMapsMapType` | `HYBRID` / `NORMAL` / `SATELLITE` / `TERRAIN` | 混合图、道路图、卫星图、地形图。 |

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-maps ~57.0.3`；SDK v56.0.0 推荐 `~56.0.7`。
- 两版都标记 Alpha、需要 development build、Google Maps Android / Apple Maps iOS 平台分工，以及 API key 与位置权限配置要求。
- API / 组件 / 类型字段总体一致；Latest 首页额外列出 `create-expo-app --example with-maps` 的模板命令，v56 页面未列该模板。
- 两版页脚 Next 均为 Expo SDK MediaLibrary。

## 源页代码主题覆盖

- Installation / starter：覆盖四种 `expo-maps` 安装命令和 Latest 专属 `with-maps` 示例模板命令。
- Google Maps 配置：覆盖创建并启用 Android Maps SDK、区分开发 / Play Store SHA-1、受限 API key 与 `android.config.googleMaps.apiKey` 配置步骤。
- Permissions：改写完整 maps config plugin JSON 和两个配置属性。
- Platform usage：改写 `Platform.OS` 区分 AppleMaps / GoogleMaps 组件及 Web fallback 的完整渲染示例。
- Custom icons：改写 Google marker 与 Apple annotation 的 `useImage` 加载示例；覆盖引用类型、尺寸、anchor、文字与背景字段。
- API / types：列全两类地图组件属性、StreetView 属性、位置 Hook / 方法、Apple 与 Google 叠加物及配置类型、POI 类别和样式枚举。
- 范围：Google Maps iOS SDK 并非本模块支持的平台；Expo Maps 仍是 Alpha 且 Expo Go 不支持。v56 与 Latest 的 API 文档均应按对应安装版本 / development build 验证。

**翻页：**[上一页：Expo SDK Manifests Expo 清单类型](./183-Expo-SDK-Manifests.md) · [目录](./README.md) · [下一页：Expo SDK MediaLibrary](./185-Expo-SDK-MediaLibrary.md)
