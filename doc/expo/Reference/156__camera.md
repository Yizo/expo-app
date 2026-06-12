# Expo Camera 学习文档

> 原文档适用于 Expo 下一版本；如需稳定、最新版本，应查看 Expo SDK 56 对应文档。  
> 支持平台：Android 真机、iOS 真机、Web、Expo Go。

## 文档解决的问题

`expo-camera` 为 React Native / Expo 应用提供摄像头能力。它主要解决以下问题：

- 在 React 组件中显示前置或后置摄像头预览。
- 拍摄照片并录制视频。
- 控制缩放、闪光灯、手电筒、镜像、画质和防抖等参数。
- 扫描预览画面或已有图片中的条形码、二维码。
- 管理摄像头和麦克风权限。
- 处理 Android、iOS 和 Web 之间的能力差异。

与 React Web 中普通的 `<video>` 或文件上传控件不同，`CameraView` 会直接占用设备摄像头，并调用原生系统的拍照、录像和扫码能力。

## 安装

```sh
# npm
npx expo install expo-camera

# yarn
yarn expo install expo-camera

# pnpm
pnpm expo install expo-camera

# bun
bun expo install expo-camera
```

推荐使用 `expo install`，因为它会选择与当前 Expo SDK 兼容的包版本。

如果是在已有 React Native 工程中使用，而不是从 Expo 项目开始，需要先安装并配置 Expo Modules。

## 配置原生权限和构建能力

### 使用 Expo Config Plugin

使用 Continuous Native Generation（CNG）的项目，可以在 `app.json` 中配置 `expo-camera`：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera",
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone",
          "recordAudioAndroid": true,
          "barcodeScannerEnabled": true
        }
      ]
    ]
  }
}
```

Config Plugin 可以理解为“由 Expo 自动修改 iOS 和 Android 原生工程配置的构建插件”。这些选项会影响生成的原生工程，因此修改后通常需要重新构建 App，不能仅靠 JavaScript 热更新生效。

| 配置项 | 默认值 | 平台及作用 |
| --- | --- | --- |
| `cameraPermission` | `"Allow $(PRODUCT_NAME) to access your camera"` | iOS 摄像头权限说明，对应 `NSCameraUsageDescription` |
| `microphonePermission` | `"Allow $(PRODUCT_NAME) to access your microphone"` | iOS 麦克风权限说明，对应 `NSMicrophoneUsageDescription` |
| `recordAudioAndroid` | `true` | Android 是否加入 `RECORD_AUDIO` 权限 |
| `barcodeScannerEnabled` | `true` | 是否启用扫码支持；不需要扫码时关闭可减小 App 体积 |

`$(PRODUCT_NAME)` 是 iOS 构建系统中的应用名称占位符，不是 JavaScript 模板字符串。

### 不使用 CNG 时的手动配置

如果项目直接维护 `android` 和 `ios` 原生目录，需要手动修改原生工程。

#### Android

`expo-camera` 会自动添加摄像头权限：

```xml
<uses-permission android:name="android.permission.CAMERA" />
```

录制带声音的视频时还需要：

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

权限位于：

```text
android/app/src/main/AndroidManifest.xml
```

还需要在 `android/build.gradle` 的其他仓库配置之后加入：

```groovy
allprojects {
  repositories {
    // 其他 repositories

    maven {
      // expo-camera 内置了自定义的 com.google.android:cameraview
      url "$rootDir/../node_modules/expo-camera/android/maven"
    }
  }
}
```

#### iOS

在 `ios/[app]/Info.plist` 中加入：

```xml
<key>NSCameraUsageDescription</key>
<string>Allow $(PRODUCT_NAME) to access your camera</string>

<key>NSMicrophoneUsageDescription</key>
<string>Allow $(PRODUCT_NAME) to access your microphone</string>
```

这些字符串会显示在系统权限弹窗中，应替换为能向用户解释用途的实际文案。

## 最小使用流程

一个基本摄像头页面需要完成四件事：

1. 查询摄像头权限。
2. 在没有权限时请求权限。
3. 权限通过后挂载 `CameraView`。
4. 保存组件引用，以便调用拍照或录像方法。

文档中的基础示例：

```tsx
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // 权限状态仍在加载
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={toggleCameraFacing}
        >
          <Text style={styles.text}>Flip Camera</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

这里的 `CameraView` 类似一个具有原生能力的 React 组件。改变 `facing` 状态会切换前后摄像头：

```ts
type CameraType = 'front' | 'back';
```

### 权限 Hook

```tsx
const [permission, requestPermission, getPermission] =
  useCameraPermissions();
```

- `permission`：当前权限信息；首次查询完成前可能为 `null`。
- `requestPermission`：触发系统权限申请。
- `getPermission`：重新查询当前权限状态。

麦克风权限使用：

```tsx
const [permission, requestPermission] = useMicrophonePermissions();
```

`PermissionResponse` 的关键字段：

| 字段 | 含义 |
| --- | --- |
| `granted` | 是否已经授权 |
| `status` | `undetermined`、`granted` 或 `denied` |
| `canAskAgain` | 是否还能再次弹出系统授权请求 |
| `expires` | 权限过期时间；当前权限均为永久授权 |

当 `canAskAgain` 为 `false` 时，继续调用请求方法通常不能解决问题，应引导用户进入系统设置修改权限。

> 文档明确说明：`isAvailableAsync()` 只检查设备是否有摄像头，不代表用户已经授予权限。设备能力检查和权限检查必须分开处理。

## `CameraView` 核心属性

### 预览与摄像头控制

| 属性 | 默认值 | 作用与限制 |
| --- | --- | --- |
| `facing` | `'back'` | 选择前置或后置摄像头 |
| `active` | `true` | 仅 iOS；组件未卸载时暂停或恢复摄像头会话 |
| `zoom` | `0` | `0` 到 `1`，表示设备最大缩放范围的百分比 |
| `mirror` | `false` | 使用前置摄像头时是否镜像输出 |
| `mode` | `'picture'` | `'picture'` 或 `'video'` |
| `animateShutter` | `true` | 是否显示快门动画 |
| `autofocus` | `'off'` | 仅 iOS；控制对焦方式 |
| `poster` | 无 | 仅 Web；摄像头加载时显示的占位图片 |
| `responsiveOrientationWhenOrientationLocked` | 无 | 仅 iOS；屏幕锁定竖屏时是否仍按设备方向拍摄 |

`active` 与条件渲染不同：条件渲染会卸载组件，`active={false}` 则保留组件但停止 iOS 摄像头会话。

### 闪光灯与手电筒

```tsx
<CameraView
  enableTorch
  flash="auto"
/>
```

- `enableTorch`：持续开启补光灯，类似手电筒。
- `flash`：拍照瞬间的闪光策略。

`FlashMode` 支持：

| 值 | 含义 |
| --- | --- |
| `off` | 禁用闪光灯 |
| `on` | 每次拍照均闪光 |
| `auto` | 系统判断是否需要闪光 |
| `screen` | 前置自拍时用屏幕补光 |

不要把 `enableTorch` 和 `flash` 当作同一个功能：前者持续照明，后者服务于拍照瞬间。

### 图片尺寸与预览比例

```tsx
<CameraView pictureSize="1920x1080" />
```

可用尺寸应通过组件方法查询：

```ts
const sizes = await cameraRef.current?.getAvailablePictureSizesAsync();
```

设置 `pictureSize` 后，`ratio` 会被忽略，因为图片尺寸本身已经确定了宽高比。

`ratio` 仅适用于 Android，可选：

```ts
type CameraRatio = '4:3' | '16:9' | '1:1';
```

设置 `ratio` 会使预览缩放模式由 `FILL` 变为 `FIT`。设备不支持指定比例时，会使用最接近的比例；`1:1` 尤其受设备支持情况限制。

### 视频配置

| 属性 | 作用 |
| --- | --- |
| `mute` | 录制无声视频 |
| `videoQuality` | 设置目标视频质量 |
| `videoBitrate` | 设置每秒比特数 |
| `videoStabilizationMode` | 设置录像防抖 |
| `mode="video"` | 选择视频输出模式 |

`videoQuality` 可选：

```ts
'2160p' | '1080p' | '720p' | '480p' | '4:3'
```

其中 `2160p`、`1080p`、`720p`、`480p` 的说明标注为 Android 16:9 质量。设备不支持目标质量时，会选择设备可用的最高质量。

iOS 使用 `videoBitrate` 时，调用 `recordAsync` 还必须指定视频编码器。

防抖模式包括：

```ts
'off' | 'standard' | 'cinematic' | 'auto'
```

Android 上除 `off` 外的三个值都表示开启防抖，具体算法由设备决定，不能假定 `cinematic` 在 Android 上一定对应独立的电影级算法。

### iOS 镜头选择

iOS 可以通过以下属性和方法处理广角等具体镜头：

- `selectedLens`
- `onAvailableLensesChanged`
- `getAvailableLensesAsync()`

默认镜头是：

```text
builtInWideAngleCamera
```

镜头列表可能随当前前后摄像头变化，切换 `facing` 后应重新读取或监听可用镜头。

## 组件生命周期与事件

### 同时只能激活一个预览

文档明确警告：任意时刻只能有一个摄像头预览处于活动状态。

在多页面应用中，页面失去焦点时应该卸载 `CameraView`。仅仅把页面隐藏起来，不代表其摄像头资源已经释放。

这与 React Web 中隐藏 DOM 节点的思维不同。摄像头是排他性较强的硬件资源，后台页面继续占用它可能造成新页面无法启动预览。

### 常用事件

| 事件 | 用途 |
| --- | --- |
| `onCameraReady` | 摄像头预览准备完成 |
| `onMountError` | 摄像头预览启动失败，事件中包含 `message` |
| `onBarcodeScanned` | 识别到条形码或二维码 |
| `onAvailableLensesChanged` | 仅 iOS；可用镜头发生变化 |
| `onResponsiveOrientationChanged` | 仅 iOS；响应式拍摄方向变化 |

必须等待 `onCameraReady` 后再调用 `takePictureAsync()`。组件已经渲染，不等于底层摄像头已经准备完成。

## 拍照

拍照方法需要通过 `CameraView` 的 `ref` 调用：

```tsx
import { useRef } from 'react';
import { CameraView } from 'expo-camera';

const cameraRef = useRef<CameraView>(null);

<CameraView
  ref={cameraRef}
  onCameraReady={() => {
    // 此后才可安全拍照
  }}
/>;
```

### 保存到缓存目录

```ts
const picture = await cameraRef.current?.takePictureAsync({
  quality: 0.8,
  base64: false,
  exif: false,
});
```

返回的 `CameraCapturedPicture` 主要包含：

```ts
{
  uri: string;
  width: number;
  height: number;
  format: 'jpg' | 'png';
  base64?: string;
  exif?: object;
}
```

平台差异：

- Android、iOS：`uri` 是本地临时文件地址。
- Web：没有相同意义的本地文件路径，`uri` 是 Base64 数据。
- `base64: true` 时额外返回 JPEG Base64。
- `exif: true` 时额外返回图片元数据。

在原生平台上，拍摄结果位于缓存目录，不是永久文件。需要长期保留时，应使用 `FileSystem.copy` 复制到持久位置。

### 返回原生图片引用

```ts
const pictureRef = await cameraRef.current?.takePictureAsync({
  pictureRef: true,
});
```

此重载返回 `PictureRef`，它引用底层原生图片实例，可以直接传递给支持该引用的其他 Expo 包，避免先写入文件再重新读取。

需要真正保存时：

```ts
const result = await pictureRef.savePictureAsync({
  quality: 0.8,
  base64: false,
});
```

### 重要拍照选项

| 选项 | 作用 |
| --- | --- |
| `quality` | `0` 到 `1`；控制压缩质量 |
| `base64` | 是否附带 Base64 数据 |
| `exif` | 是否附带 EXIF 元数据 |
| `additionalExif` | Android、iOS；添加额外 EXIF，要求同时启用 `exif` |
| `shutterSound` | 是否播放快门声，默认 `true` |
| `onPictureSaved` | 图片保存后通过回调取得结果 |
| `skipProcessing` | 跳过方向校正及整个处理流程 |
| `imageType` | 仅 Web；选择 `png` 或 `jpg` |
| `scale` | 仅 Web；设置缩放 |
| `isImageMirror` | 仅 Web；设置图片镜像 |

设置 `onPictureSaved` 后，`takePictureAsync()` 的 Promise 会在拍摄后立即以无数据形式完成，最终图片数据通过回调传入。它适合不需要立即等待图片保存完成的场景。

### `skipProcessing` 风险

`skipProcessing: true` 可以显著缩短图片交付时间，但会跳过整个处理流程：

- `quality` 选项不再生效。
- 图片不会进行方向校正。
- React Native `Image` 可能不读取 EXIF 中记录的方向。
- 最终图片可能旋转 90°、180° 或 270°。
- 不同厂商、不同设备返回的原始方向可能不同。

需要稳定、正确的图片方向时，应关闭 `skipProcessing`。

### 暂停预览后的行为

```ts
await cameraRef.current?.pausePreview();
await cameraRef.current?.resumePreview();
```

不要在预览暂停时调用 `takePictureAsync()`：

- Android 会抛出错误。
- iOS 会拍下屏幕上的最后一帧，而不是新的实时画面。

## 录像

```ts
const result = await cameraRef.current?.recordAsync({
  maxDuration: 30,
  maxFileSize: 50 * 1024 * 1024,
});
```

录像保存在缓存目录，成功时返回：

```ts
{
  uri: string;
  codec?: string; // iOS
}
```

`recordAsync()` 会一直等待，直到发生以下任一情况：

- 调用了 `stopRecording()`。
- 达到 `maxDuration`。
- 达到 `maxFileSize`。
- 摄像头预览被停止。

停止录像：

```ts
cameraRef.current?.stopRecording();
```

录制期间切换前后摄像头会直接停止当前录像。

`CameraRecordingOptions` 包括：

| 选项 | 说明 |
| --- | --- |
| `maxDuration` | 最大录像秒数 |
| `maxFileSize` | 最大文件字节数 |
| `codec` | 仅 iOS；视频编码器 |
| `mirror` | 已废弃，应改用 `CameraView` 的 `mirror` 属性 |

iOS 可先查询支持的编码器：

```ts
const codecs = await CameraView.getAvailableVideoCodecsAsync();
```

可用编码器类型包括：

```ts
'avc1' | 'hvc1' | 'jpeg' | 'apcn' | 'ap4h'
```

### 暂停和恢复录像

```ts
const features = cameraRef.current?.getSupportedFeatures();

if (features?.toggleRecordingAsyncAvailable) {
  await cameraRef.current?.toggleRecordingAsync();
}
```

该方法只在录像已经开始时有效。iOS 仅从 iOS 18 开始支持，因此不能仅根据平台名称决定是否显示按钮，应以运行时能力检测结果为准。

## 条形码与二维码扫描

### 在摄像头预览中扫描

```tsx
<CameraView
  barcodeScannerSettings={{
    barcodeTypes: ['qr'],
  }}
  onBarcodeScanned={result => {
    console.log(result.type, result.data);
  }}
/>
```

`barcodeScannerSettings` 用于限制需要识别的码类型，`onBarcodeScanned` 在识别成功时调用。

支持类型包括：

```ts
'aztec'
| 'ean13'
| 'ean8'
| 'qr'
| 'pdf417'
| 'upc_e'
| 'datamatrix'
| 'code39'
| 'code93'
| 'itf14'
| 'codabar'
| 'code128'
| 'upc_a'
```

识别结果主要包含：

| 字段 | 说明 |
| --- | --- |
| `type` | 识别出的码类型 |
| `data` | 条码中编码的字符串 |
| `bounds` | 扫描区域的边界 |
| `cornerPoints` | 边界角点，可能为空 |
| `extra` | 仅 Android；特定条码的附加信息 |

`bounds` 可能为空矩形，也不保证覆盖整个条码。`cornerPoints` 同样不保证存在。

角点顺序存在平台差异：

- Android、Web：左上、右上、右下、左下。
- iOS：左下、右下、左上、右上。
- iOS 的 `code39` 和 `pdf417` 不提供角点。

因此，跨平台绘制扫码框时不能直接假设角点顺序一致。

### 调用系统扫码界面

```ts
await CameraView.launchScanner({
  barcodeTypes: ['qr'],
});
```

- Android 使用 Google Code Scanner。
- iOS 使用 iOS 16 及以上提供的 `DataScannerViewController`。
- Android 扫描成功后自动关闭。
- iOS 需要调用 `dismissScanner()` 关闭。

监听现代扫码结果：

```ts
const subscription = CameraView.onModernBarcodeScanned(result => {
  console.log(result.type, result.data);
});

subscription.remove();
```

组件卸载或不再需要监听时，应调用 `remove()`，避免遗留事件监听器。

iOS 扫码选项还包括：

| 选项 | 默认值 | 作用 |
| --- | --- | --- |
| `isGuidanceEnabled` | `true` | 显示“减慢速度”等引导文字 |
| `isHighlightingEnabled` | `false` | 高亮已识别内容 |
| `isPinchToZoomEnabled` | `true` | 允许双指缩放 |

### 从已有图片扫描

```ts
const results = await CameraView.scanFromURLAsync(imageUrl, ['qr']);
```

返回值是数组，未识别到条码时可能为空。

平台限制：

- iOS 从图片扫描时只支持二维码。
- Android 上，条码在图片中占据主要区域时效果更好。

## Web 支持

大多数现代浏览器支持摄像头，但仍应检查目标浏览器对媒体流的支持情况。

Web 与原生平台最重要的差异是文件表示方式：浏览器不能提供原生 App 缓存目录中的本地文件 URI，因此拍照结果使用 Base64 字符串。

`isAvailableAsync()` 可用于检查当前环境是否有摄像头：

```ts
const available = await CameraView.isAvailableAsync();
```

但它不检查：

- 用户是否授予摄像头权限。
- 页面是否满足浏览器摄像头所需的协议条件。
- 摄像头最终能否成功启动。

仍需同时处理权限和 `onMountError`。

### Chrome 跨域 iframe

Chrome 64 及以上版本中，跨域 iframe 默认不能使用摄像头。iframe 必须显式授权：

```html
<iframe src="..." allow="microphone; camera;">
  <!-- iframe 内部的 CameraView -->
</iframe>
```

否则摄像头内容不会渲染。

## 平台差异速查

| 能力 | Android | iOS | Web |
| --- | --- | --- | --- |
| 摄像头预览 | 真机 | 真机 | 支持的浏览器 |
| 拍照 | 支持 | 支持 | 支持 |
| 录像 | 支持 | 支持 | `recordAsync` 文档未标注支持 |
| `active` | 不支持 | 支持 | 不支持 |
| `ratio` | 支持 | 不支持 | 不支持 |
| 具体镜头选择 | 不支持 | 支持 | 不支持 |
| 系统扫码界面 | 支持 | iOS 16+ | 不支持 |
| 图片 URI | 临时文件 | 临时文件 | Base64 |
| 录像暂停/恢复 | 按能力检测 | iOS 18+ | API 类型存在，但应按能力检测 |
| `poster` | 不支持 | 不支持 | 支持 |

> “文档未标注支持”不等于底层平台绝对无法实现，而是不能根据当前 `expo-camera` API 文档假定该方法可用。

## React Web 开发者最容易误解的地方

### 1. 安装 npm 包不等于配置完成

Web 库通常安装后即可运行，但摄像头涉及原生权限、系统描述文案和构建配置。Config Plugin 修改的是原生工程生成结果，配置变更需要重新构建应用。

### 2. 组件可见性不等于硬件会话生命周期

在 Web 中使用 CSS 隐藏元素，通常不会引起严重资源冲突。摄像头页面失焦时则应卸载 `CameraView`，否则旧页面可能继续占用摄像头。

### 3. `uri` 不是跨平台统一的 URL

- 原生端是临时本地文件地址。
- Web 端是 Base64。
- 缓存文件可能被系统清理。

业务层如果要上传或长期保存照片，应先针对平台统一数据处理流程。

### 4. 渲染完成不等于摄像头准备完成

React 组件挂载只是 UI 生命周期的一部分。底层摄像头还要异步初始化，拍照必须等待 `onCameraReady`。

### 5. 权限被拒绝不一定还能再次申请

`permission.granted === false` 时还要检查 `canAskAgain`。当它为 `false` 时，需要引导用户去系统设置，而不是重复弹出申请按钮。

### 6. 同名功能可能具有不同平台语义

画质、防抖、镜像、扫码坐标和文件 URI 都存在平台差异。不能只在一个平台测试后假定另一个平台行为相同。

## 注意事项与限制

1. Android 和 iOS 摄像头预览应在真机上测试。
2. 同一时间只能激活一个 `CameraView`。
3. 调用拍照前必须等待 `onCameraReady`。
4. 预览暂停时不要拍照。
5. 拍摄结果默认保存在缓存目录，原生端 URI 是临时的。
6. 录像期间切换摄像头会停止录像。
7. 录制带声音的视频需要麦克风权限。
8. `pictureSize` 会覆盖 `ratio` 的效果。
9. 不支持的图片比例或视频质量可能被设备替换为最接近的可用值。
10. `skipProcessing` 会导致图片方向不确定，并使 `quality` 失效。
11. 条码边界和角点可能为空，角点顺序还存在平台差异。
12. iOS 从图片扫描时仅支持二维码。
13. iOS 的录像暂停/恢复仅支持 iOS 18，应通过 `getSupportedFeatures()` 检测。
14. Web 跨域 iframe 必须通过 `allow` 属性授权摄像头和麦克风。
15. `CameraPictureOptions.mirror` 和 `CameraRecordingOptions.mirror` 已废弃，应使用 `CameraView` 的 `mirror` 属性。

## 实际开发建议

以下内容为**基于文档内容推导**：

- 将摄像头页面设计为独占页面，并把导航焦点状态与 `CameraView` 的挂载状态绑定。
- 将权限、设备能力和摄像头初始化错误视为三个独立状态：
  - 权限是否允许；
  - 设备是否具备该能力；
  - 本次摄像头会话是否成功启动。
- 在展示录像暂停、镜头选择等按钮前先检测能力，不要只判断 Android 或 iOS。
- 上传图片前统一处理原生文件 URI 与 Web Base64 的差异。
- 对扫码结果增加节流或业务锁。`onBarcodeScanned` 可能在条码持续位于画面中时被多次触发，虽然原文没有规定触发频率，但业务不应假定只触发一次。
- 将 `onMountError`、拍照失败和录像失败显示为可恢复的用户界面，而不是只写入控制台。

以下内容为**基于经验建议**：

- 权限说明文案应明确解释拍照、扫码或录像用途，避免只写“需要摄像头权限”。
- 照片上传成功后及时清理不再需要的缓存文件，控制本地空间占用。
- 对 `recordAsync()` 增加界面状态锁，避免重复开始录像。
- 在真实的低端 Android 设备、不同摄像头数量的 iPhone 和目标浏览器中分别测试。
- 处理前后摄像头切换时，可暂时禁用拍照按钮，避免切换过程中调用拍照。
- 扫码业务应校验 `data` 内容，不应因为二维码来自摄像头就将其视为可信输入。

## 文档明确说明与推导内容

### 文档明确说明

- `CameraView` 可以预览前后摄像头、拍照、录像和扫描条码。
- 同一时间只能激活一个摄像头预览。
- 拍照前必须等待 `onCameraReady`。
- 原生端拍照结果位于临时缓存目录。
- Web 拍照 URI 使用 Base64。
- 录像期间切换摄像头会停止录像。
- `skipProcessing` 会带来图片方向不确定问题。
- iOS 与 Android 在扫码能力、角点顺序、镜头和录像能力方面存在差异。
- 部分配置属于构建期配置，需要重新构建 App。
- `barcodeScannerEnabled: false` 可以在不需要扫码时减小应用体积。

### 基于文档内容推导

- 页面导航状态应参与摄像头资源管理。
- 业务层需要统一不同平台的图片结果格式。
- UI 应根据运行时能力检测结果展示高级控制按钮。
- 权限检查、硬件检查和会话启动错误不能合并成一个状态。
- 对平台差异明显的功能，需要真机和跨平台验证。

### 当前文档未涉及

- 如何将照片或视频保存到系统相册。
- 如何将拍摄文件上传到服务器。
- 如何删除缓存文件。
- 如何编辑、裁剪或压缩已经拍摄的图片。
- 如何自定义原生系统扫码界面的完整视觉样式。
- Android 和 iOS 模拟器的完整测试方案。
- 后台录像、直播推流或实时视频通话。
- 摄像头帧级图像处理和计算机视觉模型接入。
- 具体导航库中如何监听页面焦点。

## 总结

`expo-camera` 将摄像头预览、拍照、录像和扫码封装成了 React API，但其运行基础仍是移动端原生硬件和权限系统。

实际开发的主流程是：

1. 安装模块并配置构建期权限。
2. 查询并请求摄像头或麦克风权限。
3. 权限通过后挂载唯一的 `CameraView`。
4. 等待 `onCameraReady`。
5. 通过 props 控制预览，通过 ref 调用拍照、录像等命令。
6. 根据平台和运行时能力处理差异。
7. 对缓存文件进行持久化、上传或清理。
8. 页面失焦时释放摄像头资源。

对 React Web 开发者而言，最需要建立的新认识是：摄像头组件不仅是 UI，它还管理权限、原生会话、临时文件和设备能力，因此生命周期与跨平台差异是实现可靠功能的核心。

---

## 文档导航

- **上一页**：[calendar legacy](./155__calendar-legacy.md)
- **下一页**：[cellular](./157__cellular.md)
