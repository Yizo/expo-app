# 148｜Expo SDK Camera 相机预览、拍照与扫码

**翻页：**[上一页：Expo SDK Calendar（legacy）旧版日历 API](./147-Expo-SDK-Calendar-Legacy.md) · [目录](./README.md) · [下一页：Expo SDK Cellular 蜂窝网络](./149-Expo-SDK-Cellular.md)

**官方页面：**[Camera · Latest](https://docs.expo.dev/versions/latest/sdk/camera/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/camera/)

**版本边界：**Latest 推荐 `expo-camera ~57.0.5`；SDK v56.0.0 推荐 `~56.0.8`。两版主要相机预览 / 拍照 / 录像 API 一致。Latest 文档对 `barcodeScannerEnabled` 的包体积优化前置条件解释得更清楚：Android 预编译模块已经带扫码库，只有从源码构建 `expo-camera` 时关闭该项才会减少体积。

## 能做什么

`expo-camera` 提供 `<CameraView>` 来显示前置 / 后置相机画面，并可拍照、录像、读取条码。输出照片和视频默认保存在 App cache；页面失焦或切走后应卸载相机，App 同一时间只能有一个活跃 Camera preview。

相机只能在 Android / iOS 真机访问；Web 由浏览器摄像头能力支持，图片 URI 以 base64 表示。App 在 Expo Go 可使用。安装方式：

```sh
npx expo install expo-camera
# 也可使用 yarn / pnpm / bun expo install expo-camera

# Expo 官方带有完整相机示例的模板：
npx create-expo-app --example with-camera
# yarn create expo-app --example with-camera
# pnpm create expo-app --example with-camera
# bun create expo --example with-camera
```

## 权限与原生配置

通过 Config Plugin 配置 iOS 权限提示和是否在 Android 添加麦克风权限；改完需要重建原生 App：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "允许 $(PRODUCT_NAME) 使用相机。",
          "microphonePermission": "允许 $(PRODUCT_NAME) 使用麦克风。",
          "recordAudioAndroid": true,
          "barcodeScannerEnabled": true
        }
      ]
    ]
  }
}
```

| 插件选项 | 平台 / 默认 | 说明 |
| --- | --- | --- |
| `cameraPermission` | iOS | 设置 `NSCameraUsageDescription`。 |
| `microphonePermission` | iOS | 设置 `NSMicrophoneUsageDescription`。 |
| `recordAudioAndroid` | Android，默认 `true` | 是否添加 `RECORD_AUDIO`；录无声视频不需要麦克风授权。 |
| `barcodeScannerEnabled` | 默认 `true` | 是否打包扫码支持。关闭可减体积；Android 只有从源码构建该模块时才生效，预编译模块已经带扫码库。 |

Localization 文件可分别配置相机 / 麦克风说明字符串；prebuild 会将本地化值写入 `InfoPlist.strings`。手动维护原生项目时 Android 需要 CAMERA；只有录像带声音时再加 RECORD_AUDIO。Android 还需把 expo-camera 随附的 Maven 仓库加入 build.gradle；iOS 设置两个用途说明：

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.CAMERA" />
<!-- 只在录像需要声音时添加 -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

```gradle
// android/build.gradle：放在其他仓库声明之后
allprojects {
  repositories {
    maven { url "$rootDir/../node_modules/expo-camera/android/maven" }
  }
}
```

```xml
<!-- ios/[app]/Info.plist -->
<key>NSCameraUsageDescription</key>
<string>允许 $(PRODUCT_NAME) 使用相机</string>
<key>NSMicrophoneUsageDescription</key>
<string>允许 $(PRODUCT_NAME) 使用麦克风</string>
```

## 权限通过后显示 CameraView

`useCameraPermissions()` 返回 permission state 和请求方法；首次进入时权限可能仍在加载。相机组件只在授权后渲染。`facing` 在前置与后置镜头间切换：

```tsx
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) return <View />; // 权限状态仍在加载

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>需要授权才能显示相机</Text>
        <Button title="授权相机" onPress={requestPermission} />
      </View>
    );
  }

  function toggleFacing() {
    setFacing(current => current === 'back' ? 'front' : 'back');
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleFacing}>
          <Text style={styles.text}>切换镜头</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  message: { textAlign: 'center', paddingBottom: 10 },
  camera: { flex: 1 },
  buttonContainer: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '100%',
    paddingHorizontal: 64,
  },
  button: { flex: 1, alignItems: 'center' },
  text: { fontSize: 24, fontWeight: 'bold', color: 'white' },
});
```

录像带声音前还需要 `useMicrophonePermissions()` 并请求麦克风权限。镜头页面放进多屏导航时，在页面 blur / unfocused 时卸载 `CameraView`，避免多个相机预览同时活跃。

## 拍照、录像和图片数据

调用 `takePictureAsync()` 前先等 `onCameraReady`；预览暂停时不建议拍照，Android 会抛错，iOS 只会拍到屏幕上最后那帧。默认照片存 cache，并做旋转 / 尺寸处理；`skipProcessing: true` 更快，但设备可能返回方向不正确的图片，且 `quality` 设置会被忽略。

```tsx
import { useRef } from 'react';
import { CameraView } from 'expo-camera';

function CameraWithRef() {
  const cameraRef = useRef<CameraView | null>(null);
  // onCameraReady 触发后，后续的 takePictureAsync 可调用此 ref。
  return <CameraView ref={cameraRef} onCameraReady={() => console.log('预览已就绪')} />;
}
```

```ts
const picture = await cameraRef.current?.takePictureAsync({
  quality: 0.8,
  base64: true,
  exif: true,
});
// picture.uri 指缓存图片；Web 上 uri 与 base64 相同。

const imageRef = await cameraRef.current?.takePictureAsync({ pictureRef: true });
// PictureRef 可传给支持原生图像引用的 Expo 模块。
const saved = await imageRef?.savePictureAsync({ quality: 0.9 });
```

相机录像可通过 `recordAsync({ maxDuration?, maxFileSize?, codec? })` 开始，`stopRecording()` 停止。视频存 cache，并旋转为设备方向；录像中切换前后相机将停止录像。达到最长时间 / 文件大小，停止录制或关闭预览都会结束 Promise。`CameraRecordingOptions.codec` 只用于 iOS；iOS 上若设置 `videoBitrate`，调用 `recordAsync()` 时也要指定 codec。

```tsx
async function recordClip() {
  const result = await cameraRef.current?.recordAsync({
    maxDuration: 30,
    maxFileSize: 20_000_000,
    codec: 'avc1', // iOS 可用编码示例
  });
  if (result) console.log('录像 URI：', result.uri);
}

function stopClip() {
  cameraRef.current?.stopRecording();
}
```

`toggleRecordingAsync()` 不是所有设备都有；先检查 `toggleRecordingAsyncAvailable` 再显示对应控件：

```tsx
import { Button } from 'react-native';

const canToggleRecording = cameraRef.current?.getSupportedFeatures()
  .toggleRecordingAsyncAvailable;

return canToggleRecording ? (
  <Button
    title="暂停 / 恢复录像"
    onPress={() => cameraRef.current?.toggleRecordingAsync()}
  />
) : null;
```

`videoBitrate` 的单位是 bits per second，例如 `10_000_000`。`videoQuality` 可选 `2160p`、`1080p`、`720p`、`480p`，以及 4:3 的 `'4:3'`；若设备没有该规格，会取最高可用规格。

## 条码扫码

在预览中筛选条码类型，并用 `onBarcodeScanned` 处理解析结果：

```tsx
<CameraView
  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
  onBarcodeScanned={({ type, data, bounds }) => {
    console.log('条码类型 / 内容 / 区域：', type, data, bounds);
  }}
/>
```

新式系统扫码器也可以用 `launchScanner({ barcodeTypes })` 打开，不必自己绘制相机界面；Android 使用 Google Code Scanner，iOS 使用 iOS 16+ 的 `DataScannerViewController`。Android 扫描到条码后会自动关闭 Scanner；iOS 可调用 `dismissScanner()` 关闭。`scanFromURLAsync(url, barcodeTypes?)` 则扫描现有图片 URL；iOS 仅支持 QR，Android 图像中的条码应占较大面积。

```ts
import * as Camera from 'expo-camera';

const scannerAvailable = Camera.isModernBarcodeScannerAvailable;
const barcodeSubscription = Camera.onModernBarcodeScanned(({ type, data }) => {
  console.log('扫描结果：', type, data);
});

// 某些设备还可按需启用系统扫码 UI
if (scannerAvailable) {
  await Camera.launchScanner({ barcodeTypes: ['qr'] });
}
// 使用完毕时取消 listener
barcodeSubscription.remove();
```

摄像头支持范围可用 `Camera.isAvailableAsync()` 检查；CameraView 可用 `getSupportedFeatures()` 查询是否支持 modern scanner / 暂停录像。如果要在 Chrome 跨域 iframe 使用 Web camera，iframe 需要 `allow="microphone; camera;"`：

```html
<iframe src="https://example.com/camera-app" allow="microphone; camera;"></iframe>
```

Web 图片没有本地文件路径，因此图片 `uri` 会是 Base64 字符串。浏览器是否支持取决于其相机功能。

## CameraView Props

`CameraView` 继承 React Native `ViewProps`。常用 Props：

| Prop | 平台 / 默认值 | 用途 |
| --- | --- | --- |
| `active` | iOS / `true` | 不卸载组件时停止 / 启用相机 session。 |
| `animateShutter` | 全平台 / `true` | 控制快门动画。 |
| `autofocus` | iOS / `off` | `FocusMode` 为 `on` / `off`。 |
| `barcodeScannerSettings`、`onBarcodeScanned` | 全平台 | 筛选条码并接收扫码结果。 |
| `enableTorch` | 全平台 / `false` | 开关手电筒。 |
| `facing` | 全平台 / `back` | `front` 前置或 `back` 后置镜头。 |
| `flash` | 全平台 / `off` | `off` / `on` / `auto` / `screen`。 |
| `mirror` | 全平台 / `false` | 前置相机图像镜像。录像 / 拍照选项中的 mirror 已弃用，应设置此 prop。 |
| `mode` | 全平台 / `picture` | `picture` 或 `video`。 |
| `mute` | 全平台 / `false` | 录像是否录音。 |
| `onAvailableLensesChanged` / `selectedLens` | iOS | 查询 / 选择镜头。默认 `builtInWideAngleCamera`。 |
| `onCameraReady` / `onMountError` | 全平台 | 预览准备好或启动失败时通知。 |
| `onResponsiveOrientationChanged` / `responsiveOrientationWhenOrientationLocked` | iOS | 屏幕方向锁定时是否仍响应相机方向。 |
| `pictureSize` | 全平台 | 选择 `getAvailablePictureSizesAsync()` 返回的尺寸；设置后 `ratio` 不再生效。 |
| `poster` | Web | 相机加载时显示的图片 URL。 |
| `ratio` | Android | `4:3` / `16:9` / `1:1`；会让 preview 从填满视图改为完整适配。 |
| `videoBitrate` / `videoQuality` / `videoStabilizationMode` | 各平台 | 录像比特率、清晰度、防抖。 |
| `zoom` | 全平台 / `0` | `0` 不变焦，`1` 到设备最大缩放。 |

## API、类型与平台行为

### `CameraView` 实例方法

| 方法 | 作用 |
| --- | --- |
| `getAvailableLensesAsync()` | iOS 查询当前相机的镜头名。 |
| `getAvailablePictureSizesAsync()` | 查询可设置的照片尺寸。 |
| `getSupportedFeatures()` | 返回 `isModernBarcodeScannerAvailable`、`toggleRecordingAsyncAvailable`。 |
| `pausePreview()` / `resumePreview()` | 暂停 / 恢复预览；预览暂停时不要调用拍照。 |
| `takePictureAsync(options?)` | 拍照并存入 cache；需等待 `onCameraReady`。可返回 `CameraCapturedPicture`。 |
| `takePictureAsync({ pictureRef: true })` | 返回 `PictureRef` 原生图片对象，供其他 Expo 模块直接处理。 |
| `recordAsync(options?)` / `stopRecording()` | 开始 / 停止录像；返回视频 `uri`，iOS 还可返回 codec。 |
| `toggleRecordingAsync()` | iOS 18+ 支持暂停 / 恢复录像；先查 `toggleRecordingAsyncAvailable`。 |

`PictureRef` 有 `width`、`height`、`nativeRefType` 与 `savePictureAsync(options?)`。`CameraCapturedPicture` 有 `uri`、`width`、`height`、`format: 'jpg' | 'png'`，以及可选 Base64 / EXIF；Web 的 `uri` 等于 Base64。

### 条码类型

`BarcodeScanningResult` 包含 `type`、`data`、可选 `bounds`、`cornerPoints`、Android `extra?`。`bounds` 是 `origin + size`，某些条码不会返回精确的完整边框；corner point 顺序在 Android、iOS、Web 可能不同。

支持类型：`aztec`、`ean13`、`ean8`、`qr`、`pdf417`、`upc_e`、`datamatrix`、`code39`、`code93`、`itf14`、`codabar`、`code128`、`upc_a`。

`launchScanner(options?)`、`dismissScanner()`、`Camera.onModernBarcodeScanned(listener)` 由 native camera module 提供；`Camera.scanFromURLAsync(url, barcodeTypes?)` 结果为 `BarcodeScanningResult[]`。扫描 callback subscription 可用 `.remove()` 清理。

### 其他常用类型

- `CameraMode`: `picture | video`；`CameraType`: `front | back`；`CameraRatio`: `4:3 | 16:9 | 1:1`。
- `FlashMode`: `off | on | auto | screen`，screen 是自拍时屏幕补光；`FocusMode`: `on | off`。
- `CameraOrientation`: `portrait | portraitUpsideDown | landscapeLeft | landscapeRight`；`ImageType`: `png | jpg`。
- `CameraPictureOptions`: `additionalExif?`、`base64?`、`exif?`、Web `imageType?` / `isImageMirror?` / `scale?`、`mirror?`（已弃用）、`onPictureSaved?`、`pictureRef?`、`quality?`、`shutterSound?`、`skipProcessing?`。`quality` 为 `0`–`1`；跳过处理会忽略质量压缩并可能造成方向异常。
- `CameraRecordingOptions`: `codec?`（iOS）、`maxDuration?`、`maxFileSize?`、`mirror?`（已弃用）。支持 codec：`avc1`、`hvc1`、`jpeg`、`apcn`、`ap4h`。
- `VideoStabilization`: `off | standard | cinematic | auto`；`FocusMode` 默认 `off`。Android 的几种防抖模式具体实现因设备而异。
- `ScanningOptions`: iOS `barcodeTypes`，以及 `isGuidanceEnabled?`（默认 true）、`isHighlightingEnabled?`（默认 false）、`isPinchToZoomEnabled?`（默认 true）。
- `PermissionResponse`: `canAskAgain`、`expires`、`granted`、`status`；状态为 `DENIED | GRANTED | UNDETERMINED`。
- 其他类型包括 `AvailableLenses`、`BarcodeBounds`、`BarcodePoint`、`BarcodeSize`、`BarcodeSettings`、`CameraMountError`、`CameraEvents`、`PermissionExpiration`、`PermissionHookOptions`、`PhotoResult`、`ResponsiveOrientationChanged`、`SavePictureOptions`、`ScanningResult` 与 `VideoCodec`。

## 页面代码主题覆盖

本页重写官方全部主要示例主题：安装与 `with-camera` 模板命令；Config Plugin；手动 Android Manifest / Maven / iOS plist 配置；CameraView 权限流程、预览与前后镜头切换；动态列表扫描配置；录制比特率示例；录像能力检测与 toggle recording；双权限 Hooks；Web iframe 摄像头授权。拍照与 pictureRef、录像、现代扫码器 / URL 扫码、组件 Props 和平台限制也已按 API 主题补齐。

**来源：**[Expo Camera · Latest](https://docs.expo.dev/versions/latest/sdk/camera/) · [Expo Camera · SDK v56.0.0](https://docs.expo.dev/versions/v56.0.0/sdk/camera/)

**翻页：**[上一页：Expo SDK Calendar（legacy）旧版日历 API](./147-Expo-SDK-Calendar-Legacy.md) · [目录](./README.md) · [下一页：Expo SDK Cellular 蜂窝网络](./149-Expo-SDK-Cellular.md)
