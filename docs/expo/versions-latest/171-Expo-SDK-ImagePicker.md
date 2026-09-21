# 171｜Expo SDK ImagePicker 图片选择器

**翻页：**[上一页：Expo SDK ImageManipulator 图像处理](./170-Expo-SDK-ImageManipulator.md) · [目录](./README.md) · [下一页：Expo SDK IntentLauncher](./172-Expo-SDK-IntentLauncher.md)

**官方页面：**[ImagePicker · Latest](https://docs.expo.dev/versions/latest/sdk/imagepicker/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/imagepicker/)

**版本与平台：**Latest 推荐 `expo-image-picker ~57.0.19`；SDK v56.0.0 推荐 `~56.0.25`。支持 Android、iOS、Web，并标记可在 Expo Go 中使用。它打开系统图片 / 视频选择界面，也能调用设备相机。

## 安装

```sh
npx expo install expo-image-picker
```

在现有 React Native 工程中安装 Expo module 时，先确保工程已安装并配置 `expo`。

## 选取图库内容或拍照

核心函数是 `launchImageLibraryAsync()`（打开图片 / 视频库）和 `launchCameraAsync()`（拍照或录像）。成功与取消结果通过 `canceled` 判别；只有成功时才读取 `assets`。Web 需要在按钮等用户交互中直接调用 picker；放在页面 mount 时，浏览器可能静默阻止。

```tsx
import { useState } from 'react';
import { Alert, Button, Image, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ChooseMedia() {
  const [uri, setUri] = useState<string | null>(null);

  async function pickFromLibrary() {
    // Expo 示例在 picker 前统一请求图库权限；只选普通图片时通常不要求该权限。
    // 若 iOS 要选 SDK 54+ Passthrough 原始视频，应提前请求以免选择后弹窗。
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('需要访问权限', '请在系统设置中允许访问照片。');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3], // iOS 编辑界面仍使用正方形裁切框
      quality: 1,
      selectionLimit: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setUri(asset.uri);
      console.log(asset.fileName, asset.mimeType, asset.width, asset.height);
    }
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('需要相机权限', '请在系统设置中允许相机访问。');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      cameraType: ImagePicker.CameraType.back,
    });

    if (!result.canceled) setUri(result.assets[0].uri);
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <Button title="从图库选择" onPress={() => void pickFromLibrary()} />
      <Button title="拍照" onPress={() => void takePhoto()} />
      {uri ? <Image source={{ uri }} style={{ width: 220, height: 220 }} /> : null}
    </View>
  );
}
```

`allowsEditing` 在 Android 的系统界面支持裁切 / 旋转，在 iOS 支持裁切；iOS 裁切框固定为正方形，`aspect` 只影响 Android。它与 `allowsMultipleSelection` 互斥；多选打开后编辑会被忽略。iOS Simulator 没有物理相机，`launchCameraAsync()` 应使用真机验证。

典型成功结果有 `assets` 数组和 `canceled: false`；取消结果为 `{ assets: null, canceled: true }`。Asset 对象通常有 `uri`、`width`、`height`、`fileName`、`fileSize`、`mimeType`、`type` 等字段；具体字段会因平台、媒体类型和授权范围而缺省。

## 权限与系统配置

### Config plugin

使用 CNG / config plugin 时，可以在 `app.json` 设置 iOS 权限提示语、裁切界面颜色，以及是否声明麦克风权限。默认 plugin 会为 Android 添加 `RECORD_AUDIO`；只选择图片、不录制带声音视频时，可设置 `microphonePermission: false` 去掉这项 Android 权限。

```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "应用需要访问照片，以便选择要分享的图片。",
          "cameraPermission": "应用需要相机权限，以便拍摄照片。",
          "microphonePermission": false,
          "colors": {
            "cropToolbarColor": "#202124",
            "cropToolbarIconColor": "#ffffff",
            "cropToolbarActionTextColor": "#ffffff",
            "cropBackButtonIconColor": "#ffffff",
            "cropBackgroundColor": "#101114"
          },
          "dark": {
            "colors": {
              "cropToolbarColor": "#101114",
              "cropToolbarIconColor": "#ffffff",
              "cropToolbarActionTextColor": "#ffffff",
              "cropBackButtonIconColor": "#ffffff",
              "cropBackgroundColor": "#000000"
            }
          }
        }
      ]
    ]
  }
}
```

这些 build-time 配置修改后需重新构建原生 App。既有原生 iOS 工程若不使用 CNG，需在 Info.plist 添加：

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>允许应用访问照片，以便选择媒体。</string>
<key>NSCameraUsageDescription</key>
<string>允许应用使用相机拍摄照片。</string>
<key>NSMicrophoneUsageDescription</key>
<string>允许应用在录像时使用麦克风。</string>
```

插件主要属性：

| 属性 | 默认值 / 平台 | 用途 |
| --- | --- | --- |
| `photosPermission` | iOS；默认说明应用访问照片 | `NSPhotoLibraryUsageDescription` 提示语。 |
| `cameraPermission` | iOS 提示语；Android 默认允许 | 设置 iOS `NSCameraUsageDescription`；若值为 `false`，Android CAMERA 权限会被屏蔽。 |
| `microphonePermission` | iOS 提示语；Android 默认会加入 | 设置 iOS `NSMicrophoneUsageDescription`；若值为 `false`，Android `RECORD_AUDIO` 会被屏蔽。 |
| `colors` | Android light 模式 | 裁切 toolbar 背景、图标、操作文案、返回图标及裁切背景颜色。 |
| `dark.colors` | Android dark 模式 | 深色裁切界面的对应颜色。 |

### 用 hooks 读 / 请求权限

`useCameraPermissions()` 和 `useMediaLibraryPermissions()` 返回当前状态、请求权限函数和查询函数，可在组件中按需调用：

```tsx
import { Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

function PermissionControls() {
  const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();
  const [libraryPermission, requestLibraryPermission] = ImagePicker.useMediaLibraryPermissions();

  return (
    <>
      <Button
        title={`相机：${cameraPermission?.status ?? '未知'}`}
        onPress={() => void requestCameraPermission()}
      />
      <Button
        title={`图库：${libraryPermission?.status ?? '未知'}`}
        onPress={() => void requestLibraryPermission()}
      />
    </>
  );
}
```

`requestCameraPermissionsAsync()` / `requestMediaLibraryPermissionsAsync(writeOnly?)` 是命令式对应方法；Web 上这两个 Expo 权限方法不做实际请求（浏览器自己管理）。Web 的 picker 必须受用户点击触发。

## iOS 视频与相册访问

从 iOS 14 起，用户可以授予 limited photo library（仅允许部分照片）。`MediaLibraryPermissionResponse.accessPrivileges` 可为 `all`、`limited`、`none`，不要假设拥有整库权限。

SDK 54+ 默认 `allowsEditing: false` 与 `videoExportPreset: 'Passthrough'` 会返回未经压缩的原始视频，iOS 需要访问原件时可能在用户选中视频后显示权限对话框。为避免突然出现系统权限弹窗，可在打开 picker 前调用 `requestMediaLibraryPermissionsAsync()` 或 permission hook。

Live Photo 选择需在 `mediaTypes` 包含 `'livePhotos'`。成功时 `ImagePickerAsset` 提供静态图片和 `pairedVideoAsset`；编辑选项会忽略 Live Photo 类型，质量也保持原始值。Android / Web 会忽略 `livePhotos`。

## 结果结构和 asset 元数据

```ts
type ImagePickerResult =
  | { canceled: true; assets: null }
  | { canceled: false; assets: ImagePickerAsset[] };
```

成功回来的 `assets[0].uri` 可传给 Expo Image 或 React Native Image。`ImagePickerAsset` 的关键字段：

| 字段 | 含义 |
| --- | --- |
| `assetId?: string \| null` | 图库中的媒体 ID；文件系统直接选择、limited 授权或系统无 ID 时可能为 null。 |
| `uri: string` | 本地图片 / 视频 URI。 |
| `width` / `height: number` | 媒体尺寸，系统未返回时可为 0。 |
| `fileName?: string \| null` / `fileSize?: number` | 文件名、字节数。 |
| `mimeType?: string` | 媒体 MIME type；可能无法识别。 |
| `type?: 'image' \| 'video' \| 'livePhoto' \| 'pairedVideo' \| null` | 媒体种类。livePhoto / pairedVideo 仅 iOS。 |
| `duration?: number \| null` | 视频时长，毫秒；图片为 null。 |
| `base64?: string \| null` | `base64: true` 时返回图片 JPEG Base64；视频不提供该值。 |
| `exif?: Record<string, any> \| null` | `exif: true` 时 Android / iOS 图片元数据；相机产生的 iOS EXIF 不含 GPS 标签。 |
| `file?: File` | Web-only 浏览器 File 对象，可附加到 FormData 上传。 |
| `pairedVideoAsset?: ImagePickerAsset \| null` | Live Photo 配套视频。 |

成功时的返回对象示意：

```json
{
  "assets": [
    {
      "assetId": "library-asset-id",
      "base64": null,
      "duration": null,
      "exif": null,
      "fileName": "IMG-example.HEIC",
      "fileSize": 6018901,
      "height": 3025,
      "type": "image",
      "uri": "file:///app/cache/cropped-image.jpg",
      "width": 3024
    }
  ],
  "canceled": false
}
```

Base64 作为图像源时，要转换为 data URI：

```tsx
import { Image } from 'react-native';

type PreviewAsset = { base64?: string | null };

function Base64Preview({ asset }: { asset: PreviewAsset }) {
  return asset.base64 ? (
    <Image
      source={{ uri: `data:image/jpeg;base64,${asset.base64}` }}
      style={{ width: 200, height: 200 }}
    />
  ) : null;
}
```

Android 下相机结果和 `ImagePickerAsset` 字段也会因系统媒体 provider 而不同。Picker 返回取消时不可访问 `assets[0]`；Web 浏览器对取消事件处理不一致，优先始终检查返回对象。

## 核心方法与重要 options

| 方法 / 选项 | 说明 |
| --- | --- |
| `launchImageLibraryAsync(options?)` | 打开图库选图片 / 视频；返回 Promise<ImagePickerResult>。Android 动图 GIF 只有 `quality: 1` 且 `allowsEditing: false` 时会保留动画，否则可能只取首帧并输出 PNG。 |
| `launchCameraAsync(options?)` | 打开相机；需要 CAMERA 权限和有摄像头的设备；Android / iOS 10 还需 CAMERA_ROLL。iOS Simulator 没有相机硬件。 |
| `getPendingResultAsync()` | Android MainActivity 被系统回收后，取回 picker 已经完成但 JS 尚未收到的选择结果；其他平台返回 null。 |
| `getCameraPermissionsAsync()` / `requestCameraPermissionsAsync()` | 查询 / 请求相机权限；请求方法在 Web 不起作用。 |
| `getMediaLibraryPermissionsAsync(writeOnly?)` / `requestMediaLibraryPermissionsAsync(writeOnly?)` | 查询 / 请求图库权限；`writeOnly` 默认 false。Web 上请求方法不做实际权限请求。 |
| `allowsEditing` | Android 可裁切和旋转，iOS 可裁切；不能和多选同时使用。iOS 编辑框为正方形；iOS crop BMP 会转 PNG。 |
| `allowsMultipleSelection` | 是否多选；iOS 14+、Android 支持，Web 按浏览器能力；与 `allowsEditing` 互斥。 |
| `selectionLimit` | iOS 14+ / Android 多选数量上限；`0` 表示系统最大值。 |
| `mediaTypes` | `['images']`、`['videos']`、`['livePhotos']` 的组合；默认 images。旧 `MediaTypeOptions` 已 deprecated。 |
| `quality` / `aspect` / `shape` | 压缩质量 0–1（默认 1）；Android crop aspect；Android crop 区域形状 rectangle / oval。 |
| `cameraType` / `defaultTab` | 前后相机；Android picker 初始 Photos / Albums tab。 |
| `exif` / `base64` | 附带图片 EXIF / Base64 数据。 |
| `orderedSelection` | iOS 15+ 显示多选编号徽标，并按用户选择顺序返回 assets；默认 `false`。 |
| `preferredAssetRepresentationMode` / `presentationStyle` | iOS 14+ 选择系统媒体表示方式；iOS picker 展示样式。 |
| `shouldDownloadFromNetwork` | iOS 是否允许从 iCloud 等远端下载原件；针对 Passthrough 视频时影响下载时机。 |
| `videoMaxDuration` / `videoQuality` / `videoExportPreset` | 录制时长和质量 / 转码 preset；iOS 编辑模式最高 10 分钟，Android 受相机 App 限制，Web 忽略 max duration。Expo 页将 `videoExportPreset` 标记 deprecated 并指向 Apple 对应设置。 |

### Android 系统回收后的结果恢复

Android 有时会在用户完成选择后回收 MainActivity；如重新启动后发现没有收到 picker result，可在应用恢复流程中调用：

```ts
import * as ImagePicker from 'expo-image-picker';

const pending = await ImagePicker.getPendingResultAsync();
if (pending && 'canceled' in pending && !pending.canceled) {
  console.log('恢复的选择结果', pending.assets);
} else if (pending && 'code' in pending) {
  console.error('恢复 picker 失败', pending.code, pending.message);
}
```

`ImagePickerResult` 是成功 / 取消判别联合；`getPendingResultAsync()` 还可能给 Android `ImagePickerErrorResult`（`code`、`message`、可选 `exception`）。

## VideoExportPreset 与权限类型

| 类型 / 值 | 作用 |
| --- | --- |
| `ImagePickerSuccessResult` | `{ canceled: false, assets: ImagePickerAsset[] }`。 |
| `ImagePickerCanceledResult` | `{ canceled: true, assets: null }`。 |
| `MediaLibraryPermissionResponse.accessPrivileges` | iOS / Android 34+ 可指示 all、limited、none。 |
| `PermissionResponse` | `status`、`granted`、`expires`、`canAskAgain`。 |
| `CameraType` | `back` / `front`。 |
| `CropShape` | Android crop `rectangle` / `oval`。 |
| `DefaultTab` | Android 初始图库标签 `photos` / `albums`。 |
| `PermissionStatus` | `DENIED`、`GRANTED`、`UNDETERMINED`。 |
| `UIImagePickerControllerQualityType` | iOS video quality：High、Medium、Low、VGA 640×480、IFrame 960×540、IFrame 1280×720。 |
| `UIImagePickerPreferredAssetRepresentationMode` | iOS 14+：Automatic、Compatible、Current（尽量避免转码）。 |
| `UIImagePickerPresentationStyle` | iOS modal 样式：Automatic、CurrentContext、FormSheet、FullScreen、OverCurrentContext、OverFullScreen、PageSheet、Popover。 |
| `VideoExportPreset` | Passthrough、Low / Medium / Highest Quality、H.264 640×480 / 960×540 / 1280×720 / 1920×1080 / 3840×2160、HEVC 1920×1080 / 3840×2160。 |

## 权限清单和已知问题

AndroidManifest 中库会自动添加 CAMERA、READ_EXTERNAL_STORAGE、WRITE_EXTERNAL_STORAGE。iOS 使用 `NSPhotoLibraryUsageDescription`、`NSCameraUsageDescription`、`NSMicrophoneUsageDescription`。Config plugin 的对应提示文案必须准确说明用途；CNG 外手动维护 iOS 原生工程需自行配置 Info.plist。

iOS 有一个系统已知问题：从相机胶卷选择高分辨率图片并裁切时，部分场景下返回的裁切矩形不正确；Expo 文档说明这是底层 UIImagePickerController 的系统 bug。

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-image-picker ~57.0.19`，SDK v56 推荐 `~56.0.25`。
- 两版基本 API、options、permission hooks、asset fields、iOS video passthrough 说明和 Next 内容一致。
- 两版页脚都进入 Expo SDK IntentLauncher。

## 源页代码主题覆盖

- Config plugin：覆盖 Photos / Camera / Microphone 使用说明、自定义裁切界面颜色与暗色配色；另列手动 Info.plist 三项键。
- Usage：覆盖图库选择、相机拍照、权限拒绝处理、编辑比例 / 质量、取消结果、assets 展示、摄像头真机限制和返回对象形态。
- API hooks：覆盖 `useCameraPermissions`、`useMediaLibraryPermissions` 示例。
- Asset result：覆盖 Base64 JPEG data URI 使用代码以及 ImagePickerAsset 字段表。
- Runtime cases：覆盖 iOS 54+ 原始视频 / iCloud 权限时机、Android MainActivity 回收恢复、Web 用户手势要求、animated GIF 兼容规则、Live Photo paired video。
- API reference：覆盖所有权限方法、launch 方法、ImagePickerOptions、结果联合类型、MediaType / Camera / crop / VideoExport enums 和原生权限说明。
- Latest / SDK v56 对照：列明推荐版本，确认 Next 均为 IntentLauncher。

**翻页：**[上一页：Expo SDK ImageManipulator 图像处理](./170-Expo-SDK-ImageManipulator.md) · [目录](./README.md) · [下一页：Expo SDK IntentLauncher](./172-Expo-SDK-IntentLauncher.md)
