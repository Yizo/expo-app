# Expo Maps 学习指南

> 原文档更新时间：2026 年 4 月 7 日  
> 包名：`expo-maps`  
> 支持平台：iOS、Android  
> 当前状态：Alpha  
> 文档版本：下一版 Expo SDK 的未发布文档；稳定使用时应参考 SDK 56 对应的最新版本文档。

## 文档解决的问题

`expo-maps` 用于在 Expo / React Native 应用中嵌入平台原生地图：

- iOS 使用 Apple Maps。
- Android 使用 Google Maps。
- 不支持 Web。
- 不支持在 Expo Go 中运行，必须使用 development build（开发构建）。

它提供地图展示、相机位置控制、标记、圆形、折线、多边形、当前位置、地图点击事件等能力。Android 还提供 Google Street View。

适用场景包括：

- 在地图上显示门店、设备或业务地点。
- 让用户在地图上选择坐标。
- 展示路线、服务范围或地理围栏。
- 根据用户位置移动地图。
- 在 Android 中展示 Google 街景。

## 阅读前需要理解的背景

### 它不是 Web 地图库

在 React Web 中，地图通常是浏览器中的 DOM、Canvas 或 WebGL 组件。`expo-maps` 渲染的是 iOS 和 Android 的原生地图视图，因此会涉及：

- iOS 的 `Info.plist`。
- Android 的 `AndroidManifest.xml`。
- Google Cloud API Key 和 Android 应用签名。
- 系统位置权限。
- 重新构建原生应用。

这些配置不能全部通过刷新 JavaScript 或热更新生效。

### Expo Go 与 development build

Expo Go 是预装了一组固定原生模块的通用客户端。`expo-maps` 不包含在其中，因此安装 npm 包后不能直接在 Expo Go 中测试。

development build 是包含项目所需原生模块的自定义应用二进制。安装或修改 `expo-maps` 的原生配置后，需要创建新的开发构建。

这类似于 Web 项目增加了必须在服务器或构建环境中安装的原生依赖，仅刷新浏览器无法让依赖出现。

### CNG 与 config plugin

Continuous Native Generation（CNG）允许 Expo 根据 `app.json` 等配置生成和维护 iOS、Android 原生工程。

config plugin 会在生成原生工程时修改 `Info.plist`、`AndroidManifest.xml` 等原生文件。它处理的是构建期配置，不是 React 组件运行时的 props。

如果项目不使用 CNG，就需要手动修改原生工程。当前 Maps 文档没有给出手动配置的具体操作步骤。

## 安装

选择项目使用的包管理器：

```sh
# npm
npx expo install expo-maps

# yarn
yarn expo install expo-maps

# pnpm
pnpm expo install expo-maps

# bun
bun expo install expo-maps
```

`expo install` 会根据当前 Expo SDK 选择兼容的包版本，因此通常比直接执行 `npm install expo-maps` 更合适。

如果是在已有的裸 React Native 项目中安装，还必须先按照 Expo Modules 的流程安装 `expo`。只有 JavaScript 包而没有对应 Expo 原生模块基础设施，`expo-maps` 无法正常工作。

## 平台差异与基础配置

| 平台 | 地图实现 | 额外要求 |
| --- | --- | --- |
| iOS | Apple Maps | 安装包后即可显示基础地图 |
| Android | Google Maps | 必须配置 Google Cloud 项目、Maps SDK for Android 和 API Key |
| Web | 不支持 | 需要提供替代界面或使用其他 Web 地图库 |

虽然 Google 提供 iOS 版 Google Maps SDK，但 `expo-maps` 只在 Android 上支持 Google Maps。需要在 iOS 使用 Google Maps 时，原文建议选择替代库或自行编写 Expo 原生模块。

这意味着两端并不是“同一个地图组件切换底层实现”，而是两个独立的组件及 API 命名空间：

```ts
import { AppleMaps, GoogleMaps } from 'expo-maps';
```

## Android 的 Google Maps 配置流程

Android 在渲染地图前必须完成以下流程。

### 1. 创建 Google Cloud 项目

在 Google API Manager 中创建项目，然后为该项目启用 **Maps SDK for Android**。

如果已经为 Google Sign In 等 Android 服务创建过项目，可以直接在该项目中启用 Maps SDK for Android，然后继续配置 API Key。

### 2. 获取应用签名的 SHA-1

如果应用将发布到 Google Play，必须至少上传一次应用二进制，Google 才会生成对应的应用签名凭据。

之后在 Google Play Console 中进入：

```text
应用
→ Release
→ Setup
→ App integrity
→ App Signing
```

复制 `SHA-1 certificate fingerprint`。

SHA-1 在这里不是业务数据加密配置，而是 Google 用来确认“哪个签名证书签发的 Android 应用可以使用该 Key”的应用身份信息。

### 3. 创建并限制 API Key

在 Google Cloud Credential Manager 中：

1. 选择 **Create Credentials > API Key**。
2. 编辑生成的 API Key。
3. 在 **Application restrictions** 中选择 **Android apps**。
4. 添加允许使用该 Key 的 Android 应用。
5. 填写应用包名和上一步获得的 SHA-1。
6. 保存配置。

应用包名来自 `app.json` 的 `android.package`，例如：

```json
{
  "expo": {
    "android": {
      "package": "com.company.myapp"
    }
  }
}
```

包名与 SHA-1 共同构成 API Key 的 Android 应用限制条件。如果实际构建所使用的包名或签名与云端配置不匹配，Google Maps 将无法正常授权。

### 4. 将 API Key 写入 Expo 配置

把 Key 放入 `app.json` 的以下位置：

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_API_KEY"
        }
      }
    }
  }
}
```

然后创建新的 development build。修改 API Key 后只重新加载 JavaScript 不够，因为该配置需要进入 Android 原生应用。

## 位置权限配置

显示普通地图不等于获取用户位置。只有要在地图中显示或使用用户位置时，才需要配置并请求位置权限。

整个权限流程分为两层：

1. **构建期声明**：把权限写入 Android Manifest 或 iOS Info.plist。
2. **运行时请求**：应用启动后，通过权限 API 请求用户授权。

只做其中一层并不完整。

### 使用 config plugin 声明权限

```json
{
  "expo": {
    "plugins": [
      [
        "expo-maps",
        {
          "requestLocationPermission": true,
          "locationPermission": "Allow $(PRODUCT_NAME) to use your location"
        }
      ]
    ]
  }
}
```

配置项说明：

| 配置项 | 默认值 | 作用 |
| --- | --- | --- |
| `requestLocationPermission` | `false` | 是否向 AndroidManifest.xml 和 Info.plist 添加位置权限声明 |
| `locationPermission` | `"Allow $(PRODUCT_NAME) to use your location"` | iOS 的前台位置权限说明，对应 `NSLocationWhenInUseUsageDescription` |

`$(PRODUCT_NAME)` 会由 iOS 构建系统替换为应用名称。

修改这些配置后必须重新构建应用二进制。若项目不使用 CNG，则需要手动配置原生工程；当前文档未展开手动配置步骤。

### 运行时请求权限

可以使用 Hook：

```tsx
const [status, requestPermission] = useLocationPermissions();
```

`useLocationPermissions(options)` 内部结合了权限查询与请求能力，完整返回值包含：

1. 当前权限响应或 `null`。
2. 请求权限的方法。
3. 重新查询权限的方法。

也可以直接调用：

```ts
await Maps.getPermissionsAsync();
await Maps.requestPermissionsAsync();
```

- `getPermissionsAsync()`：查询当前授权状态，不主动弹出系统授权窗口。
- `requestPermissionsAsync()`：请求位置权限，系统可能显示授权窗口。

在启用 `isMyLocationEnabled` 等位置展示能力前，应先检查授权结果。

### 原文列出的原生权限

Android 与位置相关的权限包括：

| 权限 | 含义 |
| --- | --- |
| `ACCESS_COARSE_LOCATION` | 获取大致位置 |
| `ACCESS_FINE_LOCATION` | 获取精确位置 |
| `FOREGROUND_SERVICE` | 允许应用启动前台服务 |
| `FOREGROUND_SERVICE_LOCATION` | 允许启动位置类型的前台服务 |
| `ACCESS_BACKGROUND_LOCATION` | 允许应用在后台获取位置 |

原文明确指出，在地图上显示用户位置需要 `ACCESS_COARSE_LOCATION` 和 `ACCESS_FINE_LOCATION`。文档虽然同时列出了前台服务及后台位置权限，但没有说明基础地图展示一定需要这些额外权限，也没有提供后台定位流程。

iOS 使用：

| Info.plist Key | 含义 |
| --- | --- |
| `NSLocationWhenInUseUsageDescription` | 告诉用户应用为何需要在前台运行时访问其位置 |

当前文档未涉及“始终允许”位置、后台定位实现或权限被拒绝后的交互策略。

## 最小使用示例

```tsx
import { AppleMaps, GoogleMaps } from 'expo-maps';
import { Platform, Text } from 'react-native';

export default function App() {
  if (Platform.OS === 'ios') {
    return <AppleMaps.View style={{ flex: 1 }} />;
  }

  if (Platform.OS === 'android') {
    return <GoogleMaps.View style={{ flex: 1 }} />;
  }

  return <Text>Maps are only available on Android and iOS</Text>;
}
```

`Platform.OS` 相当于运行时的平台判断：

- iOS 渲染 `AppleMaps.View`。
- Android 渲染 `GoogleMaps.View`。
- 其他平台返回降级界面。

`style={{ flex: 1 }}` 用于让地图占据父容器可用空间。React Native 不使用 CSS 文件和 DOM 布局；这里的 `style` 是 React Native `ViewStyle`。

## 地图功能模型

两种地图组件都围绕以下几类数据组织：

- `cameraPosition`：地图镜头中心和缩放级别。
- `markers` / `annotations`：地图上的离散地点。
- `circles`：以某个坐标为中心的圆形区域。
- `polylines`：由一组坐标连接成的线。
- `polygons`：由一组坐标围成的区域。
- `properties`：地图内容、图层、样式等属性。
- `uiSettings`：按钮、指南针和手势等界面行为。
- 事件回调：把原生地图交互传回 JavaScript。

这些图形通过数组 props 传给地图，而不是像 HTML 那样作为地图组件的子元素逐个声明。

## 坐标与相机

### `Coordinates`

```ts
type Coordinates = {
  latitude?: number;
  longitude?: number;
};
```

- `latitude`：纬度。
- `longitude`：经度。

文档将两个字段定义为可选。实际创建有效地点时通常需要同时提供，但这是基于类型用途的推导，原文没有说明缺少某个字段时的运行行为。

### `CameraPosition`

```ts
type CameraPosition = {
  coordinates?: Coordinates;
  zoom?: number;
};
```

它控制地图镜头的中心点和缩放等级。某些视图尺寸下，较低的缩放等级可能不可用。

`cameraPosition` 在组件 props 中被描述为**初始**相机位置。如果要在挂载后主动移动镜头，应通过组件 ref 调用 `setCameraPosition`，而不能默认持续修改该 prop 就等同于 Web 中的受控组件。

### `onCameraMove`

iOS 和 Android 都支持该回调：

```ts
(event: CameraMoveEvent) => void
```

事件数据包括：

| 字段 | 含义 |
| --- | --- |
| `coordinates` | 当前镜头中心坐标 |
| `zoom` | 当前缩放等级 |
| `bearing` | 镜头朝向角度 |
| `tilt` | 镜头倾斜角度 |
| `latitudeDelta` | 当前可见区域的纬度跨度 |
| `longitudeDelta` | 当前可见区域的经度跨度 |

它不仅会在用户移动地图时触发，还会在组件首次挂载时，以初始视口触发一次。业务代码不能假设第一次调用一定来自用户手势。

## Apple Maps：iOS

### `AppleMaps.View` 主要 props

| 属性 | 用途 |
| --- | --- |
| `cameraPosition` | 初始相机位置 |
| `annotations` | 显示 Apple Maps annotation |
| `markers` | 显示标记 |
| `circles` | 显示圆形覆盖物 |
| `polylines` | 显示折线 |
| `polygons` | 显示多边形 |
| `colorScheme` | 强制浅色、深色或跟随应用 |
| `properties` | 地图类型、交通、当前位置、POI 等地图属性 |
| `uiSettings` | 指南针、比例尺、当前位置按钮等 UI 设置 |
| `style` | React Native 视图样式 |
| `ref` | 调用命令式地图方法 |

### 交互事件

| 事件 | 说明 |
| --- | --- |
| `onCameraMove` | 用户移动地图及首次挂载时触发 |
| `onMapClick` | 点击普通地图区域时触发 |
| `onAnnotationClick` | 点击 annotation 时触发，仅 iOS 18+ |
| `onMarkerClick` | 点击 marker 时触发，仅 iOS 18+ |
| `onCircleClick` | 点击圆形时触发，仅 iOS 18+ |
| `onPolylineClick` | 点击折线时触发，仅 iOS 18+ |
| `onPolygonClick` | 点击多边形时触发，仅 iOS 18+ |

点击 POI 或 marker 时不会触发 `onMapClick`。事件之间不能按 DOM 冒泡模型理解。

### Marker 与 Annotation 的差异

`AppleMapsMarker` 支持：

- 坐标和唯一 `id`。
- 标题和颜色。
- SF Symbol 图标名称 `systemImage`。
- 由一两个字符组成的 `monogram`。

`monogram` 需要 iOS 17+。它与 `systemImage` 互斥；两者都提供时，以 `systemImage` 为准。

`AppleMapsAnnotation` 扩展自 marker，并增加：

- `backgroundColor`
- 自定义图片 `icon`
- `text`
- `textColor`

因此 annotation 更适合需要自定义文字或图片内容的地点展示。

### Apple Maps 图形

圆形需要中心坐标和以米为单位的半径，可设置填充色、边线颜色和宽度。

折线需要坐标数组，可选择：

- `STRAIGHT`：直线。
- `GEODESIC`：测地线。

多边形需要坐标数组，并可设置填充色和边线样式。

这些对象都可以提供 `id`，用于在点击事件中识别具体对象。

### `AppleMapsProperties`

| 属性 | 作用 |
| --- | --- |
| `isMyLocationEnabled` | 是否显示用户位置，默认 `false` |
| `isTrafficEnabled` | 是否显示交通图层 |
| `mapType` | 标准地图、卫星影像或混合地图 |
| `pointsOfInterest` | 过滤地图上的 POI |
| `elevation` | 平面或真实感 3D 高程 |
| `emphasis` | 地图要素的视觉强调程度 |
| `selectionEnabled` | 是否允许用户选择位置并查看更多信息 |
| `polylineTapThreshold` | 点击折线的最大命中距离，默认 20 米 |

`polylineTapThreshold` 越大，用户越容易点中较细的路线，但也可能扩大路线周围的命中范围。

### POI 过滤

`pointsOfInterest` 支持：

- `including`：只包括指定类别；空数组表示隐藏全部 POI。
- `excluding`：排除指定类别；空数组表示显示全部 POI。

原文列出的类别覆盖机场、餐饮、酒店、医院、学校、公园、停车场、公共交通、商店、体育设施和旅游设施等。完整枚举包括：

```text
AIRPORT, AMUSEMENT_PARK, ANIMAL_SERVICE, AQUARIUM, ATM,
AUTOMOTIVE_REPAIR, BAKERY, BANK, BASEBALL, BASKETBALL, BEACH,
BEAUTY, BOWLING, BREWERY, CAFE, CAMPGROUND, CAR_RENTAL, CASTLE,
CONVENTION_CENTER, DISTILLERY, EV_CHARGER, FAIRGROUND, FIRE_STATION,
FISHING, FITNESS_CENTER, FOOD_MARKET, FORTRESS, GAS_STATION, GO_KART,
GOLF, HIKING, HOSPITAL, HOTEL, KAYAKING, LANDMARK, LAUNDRY, LIBRARY,
MAILBOX, MARINA, MINI_GOLF, MOVIE_THEATER, MUSEUM, MUSIC_VENUE,
NATIONAL_MONUMENT, NATIONAL_PARK, NIGHTLIFE, PARK, PARKING, PHARMACY,
PLANETARIUM, POLICE, POST_OFFICE, PUBLIC_TRANSPORT, RESTAURANT,
RESTROOM, ROCK_CLIMBING, RV_PARK, SCHOOL, SKATE_PARK, SKATING, SKIING,
SOCCER, SPA, STADIUM, STORE, SURFING, SWIMMING, TENNIS, THEATER,
UNIVERSITY, VOLLEYBALL, WINERY, ZOO
```

### Apple Maps UI 设置

可配置：

- 指南针。
- 当前位置按钮。
- 缩放时显示的比例尺。
- 用户是否可以切换地图俯仰方式。

指南针即使启用，也只会在地图发生旋转时显示。

### 通过 ref 控制地图

`AppleMapsViewType` 提供：

- `setCameraPosition(config)`：更新相机位置；iOS 不支持设置动画时长。
- `openLookAroundAsync(coordinates)`：打开指定位置的 Look Around。
- `selectMarker(id, options)`：以编程方式选择 marker，仅 iOS 18+。
- `selectAnnotation(id, options)`：以编程方式选择 annotation，仅 iOS 18+。

选择方法的 `options` 可以控制是否移动镜头以及使用的缩放等级。

## Google Maps：Android

### `GoogleMaps.View` 主要 props

| 属性 | 用途 |
| --- | --- |
| `cameraPosition` | 初始相机位置 |
| `markers` | 地图标记 |
| `circles` | 圆形覆盖物 |
| `polylines` | 折线 |
| `polygons` | 多边形 |
| `colorScheme` | 浅色、深色或跟随系统 |
| `contentPadding` | 告知地图边缘存在被遮挡的区域 |
| `mapOptions` | Google Map 创建选项 |
| `properties` | 图层、地图类型和样式 |
| `uiSettings` | 控件及手势设置 |
| `userLocation` | 用自定义用户坐标覆盖默认位置行为 |
| `style` | React Native 视图样式 |
| `ref` | 调用命令式方法 |

### 交互事件

Android 支持：

- 相机移动和地图加载完成。
- 普通点击和长按。
- POI、marker、圆形、折线、多边形点击。

`onPOIClick` 会返回 POI 的坐标和名称。`onMapClick` 不会在点击 POI 或 marker 时触发。

`onMapLoaded` 适合在底层地图加载完成后执行依赖地图就绪状态的逻辑。

### Marker

`GoogleMapsMarker` 支持：

- 坐标、`id`、标题和说明文本。
- 自定义图片。
- 是否可拖动。
- 是否显示 callout。
- `zIndex` 层叠顺序。
- 自定义锚点。

锚点使用 `0.0` 到 `1.0` 的归一化坐标：

- `x = 0` 为图标左边，`x = 1` 为右边。
- `y = 0` 为顶部，`y = 1` 为底部。

默认锚点是图标底部中心，适合让定位图标的尖端对准地理坐标。

### Google Maps 图形

Android 的圆形、折线和多边形与 iOS 具有相似的数据结构，并可使用 `id` 识别点击对象。

Android 折线额外支持 `geodesic`，用于决定是否按测地线绘制。Google 圆形点击事件对象还可能包含 `clickCoordinates`。

### `contentPadding`

它不只是给 React Native 视图增加视觉内边距，而是通知 Google 地图“这些边缘区域可能被其他 UI 遮挡”。地图会移动 Google Logo 等内部元素，避免与这些区域重叠。

支持：

- `top`
- `bottom`
- `start`
- `end`

`start` 和 `end` 会根据 LTR / RTL 书写方向映射到不同的物理边缘。

### Google Maps 样式与 Map ID

`mapOptions.mapId` 是存储在 Google Cloud 中的地图样式和配置的唯一标识。

`properties.mapStyleOptions.json` 则接收地图样式配置的 JSON 字符串，用于修改道路、公园和 POI 等标准地图要素的呈现。

文档列出了这两种能力，但没有解释它们同时使用时的优先级或冲突规则。

### `GoogleMapsProperties`

可配置：

- 建筑图层。
- 室内地图。
- 用户位置。
- 交通图层。
- 地图样式 JSON。
- 地图类型。
- 最小和最大缩放等级。
- 地点选择能力。

地图类型包括：

| 类型 | 含义 |
| --- | --- |
| `NORMAL` | 标准道路地图 |
| `SATELLITE` | 卫星影像 |
| `HYBRID` | 卫星影像叠加道路和 POI |
| `TERRAIN` | 地形数据 |

### `GoogleMapsUISettings`

可控制：

- 指南针和比例尺。
- 室内楼层选择器。
- 地图工具栏。
- 当前位置按钮。
- 缩放控件。
- 旋转、滚动、倾斜和缩放手势。
- 旋转或缩放期间是否允许滚动。
- 是否允许切换俯仰方式。

这些设置控制的是用户与地图原生 UI 的交互能力，不等同于地图数据本身。

### 自定义用户位置

```ts
type GoogleMapsUserLocation = {
  coordinates: Coordinates;
  followUserLocation: boolean;
};
```

它可以提供自定义用户坐标，并决定相机是否跟随该位置。文档将其描述为覆盖默认行为，但没有进一步说明数据更新频率或位置来源。

### 通过 ref 控制地图

`GoogleMapsViewType` 提供：

- `setCameraPosition(config)`：更新相机，可通过 `duration` 设置动画毫秒数。
- `selectMarker(id, options)`：选择 marker，并可移动相机和指定缩放等级。

Android 的 `selectMarker` 是异步动画操作。短时间内连续调用时，后一次动画可能取消前一次动画，导致前一次返回的 Promise 被拒绝。因此调用方应处理 rejection。

## Google Street View：仅 Android

`GoogleStreetView` 是独立于普通地图视图的 Android 组件。

必须提供：

```ts
type StreetViewCameraPosition = {
  coordinates: Coordinates;
  bearing?: number;
  tilt?: number;
  zoom?: number;
};
```

组件还支持控制：

- 是否允许平移手势。
- 是否显示街道名称。
- 是否启用用户导航。
- 是否允许缩放手势。
- React Native 视图样式。

当前文档没有说明：

- 指定坐标没有街景数据时的行为。
- 街景加载状态或错误事件。
- iOS Look Around 与 Android Street View 的统一封装方式。

## 颜色模式与地图类型差异

iOS 颜色模式：

- `AUTOMATIC`：跟随应用配色。
- `LIGHT`：始终使用浅色。
- `DARK`：始终使用深色。

Android 颜色模式：

- `FOLLOW_SYSTEM`：跟随系统。
- `LIGHT`
- `DARK`

两端枚举名称并不完全一致。共享业务配置时，需要转换为各自平台的枚举，不能直接把同一个字符串传给两个组件。

iOS 地图类型使用 `STANDARD`、`IMAGERY`、`HYBRID`；Android 使用 `NORMAL`、`SATELLITE`、`HYBRID`、`TERRAIN`。这也是需要平台适配的差异。

## React Web 开发者最容易误解的地方

### 1. 不能直接用一个组件覆盖所有平台

iOS 和 Android 分别使用 `AppleMaps.View` 与 `GoogleMaps.View`。组件属性有重叠，但事件、类型、枚举和部分功能不同。

如果业务需要跨平台统一接口，应在项目内部建立一层薄封装，但仍要保留平台差异，不能假设所有能力都能一一对应。

### 2. 安装 npm 包不代表功能立即可用

`expo-maps` 包含原生代码，并且不在 Expo Go 中。安装、API Key、权限声明或 config plugin 发生变化后，需要重新构建 development build。

### 3. 权限声明不等于用户已经授权

config plugin 只是把权限需求写入原生配置。应用运行时仍然要调用 Hook 或异步方法请求授权，并处理允许、拒绝等结果。

### 4. iOS 不会使用 Google Maps

`expo-maps` 的 iOS 实现固定为 Apple Maps。即使已经配置 Google API Key，也不会让 iOS 组件切换为 Google Maps。

### 5. 原生事件不应按 DOM 事件理解

地图、POI 和 marker 有各自的事件规则。例如点击 POI 或 marker 不会继续触发普通地图点击事件。这里没有 React Web 中常见的 DOM 捕获和冒泡模型。

### 6. `contentPadding` 不等同于 CSS padding

它用于让 Google 地图重新安排 Logo 等内部元素，而不是简单缩小地图容器。

### 7. 初始相机位置不等同于受控状态

`cameraPosition` 被定义为初始位置。后续命令式移动应通过 ref 的 `setCameraPosition` 完成。

### 8. iOS 版本限制会直接影响交互能力

Apple Maps 中 marker、annotation、圆形、折线和多边形的点击事件，以及编程选择 marker / annotation，都要求 iOS 18+。如果应用支持更低版本，必须接受这些功能不可用或提供降级方案。

## 限制、警告与坑点

1. `expo-maps` 当前处于 Alpha，可能频繁发生破坏性变更，不应把当前 API 当作长期稳定合同。
2. 当前页面属于下一版 SDK 的文档，并非 SDK 56 的稳定文档。实际项目应对照所使用 Expo SDK 的对应文档。
3. 不支持 Expo Go，必须使用 development build。
4. 仅支持 iOS 和 Android，不支持 Web。
5. Android 必须启用 Maps SDK for Android 并正确配置 API Key。
6. Android API Key 的包名和 SHA-1 必须匹配实际应用。
7. Google Play 应用签名的 SHA-1 需要先上传一次应用二进制才能生成。
8. 修改 API Key、config plugin 或原生权限后需要重新构建应用。
9. 显示用户位置前必须完成原生权限声明和运行时授权。
10. Apple Maps 多种点击与选择能力只支持 iOS 18+。
11. Android `selectMarker` 的动画可能因连续调用被取消，其 Promise 可能 reject。
12. iOS 的 `setCameraPosition` 不支持动画时长，Android 支持 `duration`。
13. 两个平台的枚举、组件和部分字段不同，不能无条件共享同一份配置对象。
14. 文档中的 `Coordinates.latitude` 和 `longitude` 类型是可选字段，但没有说明不完整坐标的处理结果。
15. 文档未说明 API Key 的多环境管理、费用、配额、账单、Key 泄露处理或错误诊断流程。
16. 文档未涉及离线地图、路线规划、地理编码、地点搜索、聚合标记和后台持续定位。

## 实际开发建议

以下内容属于**基于文档内容推导**：

- 把地图功能拆成平台组件，例如 `IOSMap` 与 `AndroidMap`，再由上层组件根据 `Platform.OS` 选择实现。
- 仅在确实需要显示用户位置时申请权限，普通地图、固定 marker 或业务区域展示不必自动申请位置权限。
- 为所有可点击的 marker、圆形、折线和多边形设置稳定 `id`，事件处理时不要依赖数组下标识别对象。
- 在支持旧版 iOS 时，将 iOS 18+ 点击事件视为增强功能，不要让核心流程完全依赖它们。
- 对 Android 的 `selectMarker()` 使用 `try/catch` 或 Promise rejection 处理，避免快速连续操作产生未处理异常。
- 为 Web 平台提供明确降级页面，或单独集成 Web 地图库。

以下属于**基于经验建议**，不是当前文档明确要求：

- 不要把 Google Maps API Key 硬编码到业务组件中；应通过 Expo 配置及不同环境的构建配置管理。
- API Key 应限制到 Maps SDK for Android，并绑定正确的包名和签名，避免使用无限制 Key。
- 开发签名、Google Play App Signing 和其他发布渠道可能使用不同 SHA-1，应分别核对实际构建身份。
- `onCameraMove` 可能高频触发，不宜直接在其中执行昂贵请求；可使用防抖、节流或在交互结束后再加载数据。
- 地图上覆盖物数量较大时，应在真实设备上测试性能。当前文档没有给出数量上限或性能承诺。
- 权限被拒绝时应提供可理解的降级界面，不要只留下一个无法工作的“定位”按钮。

## 文档明确内容与推导内容

### 原文明确说明

- iOS 使用 Apple Maps，Android 使用 Google Maps。
- Google Maps 不通过 `expo-maps` 支持 iOS。
- 库处于 Alpha，可能频繁出现破坏性变更。
- 库不能在 Expo Go 中使用。
- Android 使用地图前必须配置 Google Cloud、Maps SDK、API Key、包名和 SHA-1。
- 位置权限可通过 config plugin 声明，并通过 Hook 或异步方法请求。
- config plugin 修改后需要新的应用构建。
- Apple Maps 的若干点击和选择 API 仅支持 iOS 18+。
- Android 支持 Google Street View。
- `onCameraMove` 会在首次挂载时触发一次。
- 点击 POI 或 marker 不会触发 `onMapClick`。

### 基于文档内容推导

- 跨平台项目需要主动设计适配层，因为两个平台不是完全相同的 API。
- API Key、权限和 config plugin 属于构建期或原生层配置，不能依靠 JavaScript 热刷新生效。
- 支持低于 iOS 18 的应用需要为部分地图点击功能设计降级方案。
- 位置权限应在启用用户位置功能前完成检查和请求。
- 有效业务坐标通常应同时包含经纬度，但文档没有定义不完整坐标的行为。

## 总结

`expo-maps` 提供了直接访问 iOS Apple Maps 与 Android Google Maps 原生视图的能力。它的使用重点不只是渲染一个 React 组件，还包括平台分支、原生构建、Android Google Cloud 配置和位置权限管理。

开始集成时，应按以下顺序处理：

1. 确认接受 Alpha 状态和潜在破坏性变更。
2. 安装 `expo-maps`。
3. Android 配置 Maps SDK、受限 API Key、包名和 SHA-1。
4. 如需用户位置，通过 config plugin 声明权限。
5. 创建新的 development build。
6. 运行时请求并检查位置权限。
7. 分别实现 `AppleMaps.View` 和 `GoogleMaps.View`。
8. 对 iOS 18 限制、Android 异步动画和 Web 不支持提供降级处理。

---

## 文档导航

- **上一页**：[manifests](./191__manifests.md)
- **下一页**：[media library](./193__media-library.md)
