# Expo ImagePicker 学习指南

> 原文档更新时间：2026 年 4 月 7 日  
> 包名：`expo-image-picker`  
> 支持平台：Android、iOS、Web、Expo Go  
> 文档版本：下一版 Expo SDK 的未发布文档。原文指出，当前稳定版本为 SDK 56，实际项目应核对所用 Expo SDK 对应的文档。

## 文档解决的问题

`expo-image-picker` 用于调用操作系统提供的界面，让用户：

- 从手机照片库中选择图片或视频。
- 使用相机拍摄照片或视频。
- 在系统支持的情况下裁剪、旋转或压缩媒体。
- 获取所选媒体的本地 URI、尺寸、文件名、文件大小、EXIF 等信息。
- 在 Android、iOS 和 Web 中使用相对统一的 JavaScript API。

它适合头像选择、图片上传、视频投稿、拍照上传、相册多选等场景。

需要特别明确：这个库负责**选择或拍摄媒体并返回本地资源信息**，不负责上传、云端存储、图片展示以外的长期文件管理，也不负责完整的图片编辑。上传到 S3、Firebase 或业务服务器需要继续编写上传逻辑。

---

## React Web 开发者需要先理解的背景

### 系统选择器不是 React 组件

`launchImageLibraryAsync()` 和 `launchCameraAsync()` 打开的主要是操作系统提供的原生界面，而不是渲染在 React Native 组件树中的普通组件。

这类似于 Web 中点击 `<input type="file">` 后浏览器弹出的文件选择器，但移动端还涉及：

- 相机和照片库权限。
- iOS `Info.plist` 权限说明。
- Android Manifest 权限。
- 系统版本差异。
- 原生应用重新构建。
- Android Activity 被系统销毁后的结果恢复。

因此，不能像定制普通 React 弹窗一样完全控制选择器的外观和行为。

### URI 不等同于浏览器中的公网 URL

返回结果中的 `asset.uri` 通常指向设备上的本地文件，例如：

```text
file:///data/user/0/.../cropped-image.jpg
```

它可以交给 React Native 的 `<Image source={{ uri }}>` 显示，但不是服务器可以访问的 URL。若要上传，需要读取该本地文件，并按照后端要求构造请求。

Web 平台还会额外返回浏览器的 `File` 对象，可以直接配合 `FormData` 上传。

### 构建期配置与运行时调用不同

权限说明文案、Android 权限声明和原生裁剪界面颜色属于原生工程配置，通常需要通过 config plugin 写入原生项目，并重新构建 App。

而 `launchImageLibraryAsync()`、`quality`、`mediaTypes` 等属于运行时 API，可以在 JavaScript 代码中使用。

这类似于 React Web 中：

- 构建期配置：PWA manifest、CSP、打包配置。
- 运行时逻辑：组件 props、事件处理和浏览器 API 调用。

---

## 安装

根据包管理器执行相应命令：

```sh
# npm
npx expo install expo-image-picker

# yarn
yarn expo install expo-image-picker

# pnpm
pnpm expo install expo-image-picker

# bun
bun expo install expo-image-picker
```

`expo install` 会根据当前 Expo SDK 选择兼容版本，通常比直接执行 `npm install` 更适合 Expo 项目。

如果是在已有的普通 React Native 原生项目中安装，还必须先安装和配置 Expo Modules 所需的 `expo` 包。

---

## 原生配置

### 使用 CNG 和 config plugin

如果项目使用 Continuous Native Generation（CNG），可以在 `app.json` 中配置插件：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos to let you share them with your friends.",
          "colors": {
            "cropToolbarColor": "#000000"
          },
          "dark": {
            "colors": {
              "cropToolbarColor": "#000000"
            }
          }
        }
      ]
    ]
  }
}
```

CNG 可以根据 Expo 配置生成 iOS 和 Android 原生工程。config plugin 则负责在生成期间写入权限声明、原生资源等配置。

这些属性不能全部在运行时修改。配置发生变化后，需要生成并构建新的 App 二进制文件，单纯刷新 JavaScript 代码不会使其生效。

### 配置项

| 配置项 | 平台 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `photosPermission` | iOS | `Allow $(PRODUCT_NAME) to access your photos` | 设置 `NSPhotoLibraryUsageDescription`，向用户解释为什么访问照片库 |
| `cameraPermission` | iOS、Android | `Allow $(PRODUCT_NAME) to access your camera` | 设置 iOS 相机权限文案；设为 `false` 时阻止 Android 声明 `CAMERA` 权限 |
| `microphonePermission` | iOS、Android | `Allow $(PRODUCT_NAME) to access your microphone` | 设置 iOS 麦克风权限文案；设为 `false` 时阻止 Android 声明 `RECORD_AUDIO` 权限 |
| `colors` | Android | `undefined` | 设置浅色模式下的裁剪界面颜色 |
| `colors.cropToolbarColor` | Android | `#00000000` | 裁剪工具栏背景色 |
| `colors.cropToolbarIconColor` | Android | `#000000` | 工具栏图标颜色 |
| `colors.cropToolbarActionTextColor` | Android | `#000000` | 工具栏操作文字颜色 |
| `colors.cropBackButtonIconColor` | Android | `#000000` | 返回按钮颜色 |
| `colors.cropBackgroundColor` | Android | `#ffffff` | 裁剪页面背景色 |
| `dark.colors` | Android | 预设深色配色 | 设置深色模式下对应的裁剪界面颜色 |

Android 默认会加入 `RECORD_AUDIO` 权限。如果应用不需要录制带声音的视频，可将：

```json
{
  "microphonePermission": false
}
```

写入插件配置，以阻止该权限被添加。

### 不使用 CNG 时的 iOS 配置

手动维护 iOS 原生工程时，需要在 `ios/[app]/Info.plist` 中加入：

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>Give $(PRODUCT_NAME) permission to save photos</string>
<key>NSCameraUsageDescription</key>
<string>Give $(PRODUCT_NAME) permission to access your camera</string>
<key>NSMicrophoneUsageDescription</key>
<string>Give $(PRODUCT_NAME) permission to use your microphone</string>
```

这些内容会显示在 iOS 权限弹窗中。它们不是普通的界面文字，而是操作系统要求的隐私用途说明。

---

## 基本使用流程

典型流程如下：

1. 在用户点击按钮后开始操作。
2. 必要时申请相机或媒体库权限。
3. 调用系统相机或照片库选择器。
4. 通过 `result.canceled` 判断用户是否取消。
5. 从 `result.assets` 中读取媒体。
6. 使用 `uri` 展示、处理或上传文件。
7. Android 中考虑恢复因 Activity 被销毁而丢失的结果。

示例：

```tsx
import { useState } from 'react';
import { Alert, Button, Image, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ImagePickerExample() {
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission required',
        'Permission to access the media library is required.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Pick an image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
  },
});
```

成功结果大致如下：

```json
{
  "assets": [
    {
      "assetId": "C166F9F5-B5FE-4501-9531",
      "base64": null,
      "duration": null,
      "exif": null,
      "fileName": "IMG.HEIC",
      "fileSize": 6018901,
      "height": 3025,
      "type": "image",
      "uri": "file:///data/user/0/.../cropped-image.jpg",
      "width": 3024
    }
  ],
  "canceled": false
}
```

不要在用户取消时直接访问 `assets[0]`。正确写法是先用 `canceled` 做类型分支。

---

## 权限管理

### 两类权限

这个库主要涉及：

- 相机权限：调用设备相机。
- 媒体库权限：读取或写入用户照片库。

权限状态包含：

| 字段 | 含义 |
| --- | --- |
| `granted` | 是否已经授权 |
| `status` | `granted`、`denied` 或 `undetermined` |
| `canAskAgain` | 应用是否还能再次弹出权限请求 |
| `expires` | 权限过期时间；当前权限均为永久授权 |

当 `canAskAgain` 为 `false` 时，继续调用请求方法通常无法再次弹窗，应引导用户前往系统设置修改权限。

### 权限 Hook

```ts
const [status, requestPermission, getPermission] =
  ImagePicker.useCameraPermissions();
```

`useCameraPermissions()` 封装了相机权限的查询与申请。

```ts
const [status, requestPermission, getPermission] =
  ImagePicker.useMediaLibraryPermissions();
```

`useMediaLibraryPermissions()` 封装了媒体库权限的查询与申请，并支持 `writeOnly` 配置。

初次渲染时 `status` 可能为 `null`，因为权限状态仍在异步加载。

### 权限方法

```ts
await ImagePicker.getCameraPermissionsAsync();
await ImagePicker.requestCameraPermissionsAsync();

await ImagePicker.getMediaLibraryPermissionsAsync(false);
await ImagePicker.requestMediaLibraryPermissionsAsync(false);
```

媒体库方法的 `writeOnly` 默认为 `false`：

- `false`：检查或申请读写权限。
- `true`：检查或申请仅写权限。

Web 上两个 `request...PermissionsAsync()` 方法不执行原生权限请求。其中相机权限方法也不会使用浏览器摄像头权限，因为该库在 Web 上通过系统文件输入能力工作。

### 有限照片权限

`MediaLibraryPermissionResponse` 额外提供：

```ts
accessPrivileges?: 'all' | 'limited' | 'none';
```

- `all`：可以访问整个照片库。
- `limited`：只能访问用户指定的部分照片，适用于 Android API 34+ 和 iOS 14+。
- `none`：尚未授权或已拒绝。

即使 `assetId`、`fileName` 等字段正常情况下可用，在有限授权等情况下也可能为 `null`。

---

## 选择照片库内容

```ts
const result = await ImagePicker.launchImageLibraryAsync(options);
```

该方法打开系统媒体库选择界面，并返回：

```ts
type ImagePickerResult =
  | {
      canceled: false;
      assets: ImagePickerAsset[];
    }
  | {
      canceled: true;
      assets: null;
    };
```

### iOS 视频权限时机

从 SDK 54 开始，默认配置为：

```ts
allowsEditing: false
videoExportPreset: ImagePicker.VideoExportPreset.Passthrough
```

这会跳过压缩并立即返回原始视频，包括 HEIC、AVIF 等原始资源。不过，iOS 访问原始视频文件需要媒体库权限。如果没有提前申请，用户可能在选完视频后才看到权限弹窗。

为了避免突兀的交互，应在打开选择器前调用：

```ts
await ImagePicker.requestMediaLibraryPermissionsAsync();
```

或者使用 `useMediaLibraryPermissions()`。

原文同时指出，单纯启动图片库选择器通常不需要先请求权限；上述提前申请主要针对 iOS 原始视频访问场景。因此，不应将“任何选择操作都必须先申请完整照片库权限”理解为通用规则。

### Android 动态 GIF

Android 只有在以下条件同时成立时，才会保留 GIF 动画：

```ts
{
  quality: 1.0,
  allowsEditing: false
}
```

一旦压缩或裁剪，Android 会取 GIF 第一帧并返回 PNG。iOS 支持 GIF 的质量设置和裁剪。

### Web 限制

Web 上必须直接在用户交互中调用选择器，例如：

```tsx
<Button
  title="Select"
  onPress={() => ImagePicker.launchImageLibraryAsync()}
/>
```

不能在 `componentDidMount`、`useEffect`、定时器或与点击事件脱离的异步流程中自动弹出，否则浏览器可能无提示地阻止请求。

由于浏览器限制和实现差异，Web 不保证返回取消事件。

---

## 调用相机

```ts
const result = await ImagePicker.launchCameraAsync(options);
```

该方法打开系统拍摄界面，需要相机权限。文档还指出，Android 和 iOS 10 可能同时需要照片库权限。

与照片库选择器相同：

- 必须检查 `result.canceled`。
- Web 上必须由用户交互直接触发。
- Web 不保证返回取消事件。
- Android 需要处理 `MainActivity` 被销毁后的结果恢复。
- `cameraType` 只是选择前置或后置摄像头的意图，Android 上最终行为可能受设备安装的相机应用影响。

---

## Android 结果恢复

Android 系统有时会在 ImagePicker 完成后销毁应用的 `MainActivity`。这不是 React 组件卸载，而是承载 React Native 的原生页面被系统回收，可能导致选择结果丢失。

可调用：

```ts
const pendingResult = await ImagePicker.getPendingResultAsync();
```

在 Android 上：

- 成功时返回与 `launchImageLibraryAsync()` 或 `launchCameraAsync()` 相同结构的结果。
- 失败时返回 `ImagePickerErrorResult`。
- 其他平台返回 `null`。

可以在 Android 开发者选项中开启 **Don't keep activities** 来测试该流程。

`ImagePickerErrorResult` 包含：

```ts
{
  code: string;
  message: string;
  exception?: string;
}
```

**基于文档内容推导：** 对选择结果有业务价值的应用，应在应用恢复或相关页面初始化时检查 pending result，避免只依赖首次调用返回的 Promise。

---

## `ImagePickerOptions` 详解

### 媒体类型

```ts
mediaTypes: ['images', 'videos', 'livePhotos']
```

支持：

- `images`：图片。
- `videos`：视频。
- `livePhotos`：iOS Live Photo。

旧的 `MediaTypeOptions.All`、`Images`、`Videos` 已被标记为弃用，应使用 `MediaType` 数组。

在 Android 和 Web 上，`livePhotos` 会被忽略。

选择 Live Photo 后：

- 主资源包含未修改的图片。
- `pairedVideoAsset` 包含配对视频。
- 启用 `allowsEditing` 时，Live Photo 选项会被忽略。
- 由于平台限制，Live Photo 始终按原始质量返回，`quality` 不生效。

### 编辑和裁剪

```ts
{
  allowsEditing: true,
  aspect: [4, 3],
  shape: 'rectangle'
}
```

- `allowsEditing` 默认为 `false`。
- Android 支持裁剪和旋转。
- iOS 只支持裁剪。
- `aspect` 仅在 Android 上有效；iOS 裁剪框始终为正方形。
- `shape` 仅在 Android 上有效，支持 `rectangle` 和 `oval`。
- 多选与裁剪互斥。启用 `allowsMultipleSelection` 后，`allowsEditing` 会被忽略。

iOS 存在一个底层已知问题：从相册选择通常是高分辨率的图片并裁剪时，返回的裁剪矩形在某些情况下可能不正确。问题来自 iOS 闭源的 `UIImagePickerController`，Expo 无法在库层彻底修复。

### 多选

```ts
{
  allowsMultipleSelection: true,
  selectionLimit: 5,
  orderedSelection: true
}
```

- `allowsMultipleSelection` 支持 Android、iOS 14+ 和 Web。
- `selectionLimit` 支持 Android 和 iOS 14+。
- `selectionLimit: 0` 表示使用系统允许的最大数量。
- `orderedSelection` 仅支持 iOS 15+，会显示选择顺序编号，并保证按该顺序返回。
- 未开启 `orderedSelection` 时，系统通常仍按选择顺序返回，但文档明确表示不作绝对保证。

### 图片质量与数据

```ts
{
  quality: 0.8,
  base64: false,
  exif: true
}
```

#### `quality`

取值范围为 `0` 到 `1`：

- `0`：更小的文件。
- `1`：尽可能高的质量，默认值。
- iOS 从照片库选择 BMP 或 PNG 时，该配置会被忽略。
- 已经压缩过的图片再次处理后，输出文件甚至可能比原文件更大。

因此，`quality: 1` 不代表“文件大小不变”，较低质量也不保证结果一定比原文件小。

#### `base64`

启用后，图片结果会包含 JPEG 数据的 Base64 字符串：

```tsx
<Image
  source={{
    uri: `data:image/jpeg;base64,${asset.base64}`,
  }}
  style={{ width: 200, height: 200 }}
/>
```

原文只说明如何获取和展示 Base64，没有说明其传输性能或内存成本。

#### `exif`

启用后，Android 和 iOS 会返回图片 EXIF 元数据。iOS 使用相机拍摄时，EXIF 不包含 GPS 标签。

### 相机和选择器界面

| 配置 | 平台 | 说明 |
| --- | --- | --- |
| `cameraType` | Android、iOS、Web | `front` 或 `back`，默认后置；Android 行为可能因相机应用而异 |
| `defaultTab` | Android | 以 `photos` 或 `albums` 标签页打开，默认 `photos` |
| `presentationStyle` | iOS | 控制选择器以全屏、表单、页面、浮层等方式呈现 |
| `legacy` | Android | 使用旧版选择器，并允许从用户照片库之外选择媒体 |

Web 未提供 `cameraType` 时，内部输入元素会为了向后兼容使用 `"camera"` 作为默认值。

### iOS 资源表示与远程文件

`preferredAssetRepresentationMode` 支持 iOS 14+：

- `Automatic`：系统自动选择。
- `Compatible`：优先使用兼容性更好的表示。
- `Current`：尽可能使用当前表示，避免转码。

`shouldDownloadFromNetwork` 默认为 `false`。开启后，如果媒体只存在于 iCloud 或其他远程来源，选择器可以下载该资源。

对于视频，这个选项只在 `videoExportPreset` 为 `Passthrough` 时适用；其他导出模式会自动从 iCloud 下载视频。

### 视频选项

#### `videoMaxDuration`

单位为秒，`0` 表示不限制：

- iOS 开启 `allowsEditing` 后，最长自动限制为 10 分钟，即使配置为 `0` 或没有设置。
- Android 是否生效取决于设备安装的相机应用。
- Web 上不生效，由浏览器决定。

#### `videoQuality`

仅支持 iOS，用于设置录制视频质量，默认使用设备支持的最高质量：

- `High`
- `Medium`
- `Low`
- `VGA640x480`
- `IFrame960x540`
- `IFrame1280x720`

#### `videoExportPreset`

仅适用于 iOS 11+，文档将该选项标记为弃用。它控制所选视频的导出压缩方式，默认是 `Passthrough`。

主要模式如下：

| 模式 | 分辨率 | 视频编码 | 音频编码 |
| --- | --- | --- | --- |
| `Passthrough` | 不变 | 不压缩 | 不压缩 |
| `LowQuality` | 由设备决定 | H.264 | AAC |
| `MediumQuality` | 由设备决定 | H.264 | AAC |
| `HighestQuality` | 由设备决定 | H.264 | AAC |
| `H264_640x480` | 640 × 480 | H.264 | AAC |
| `H264_960x540` | 960 × 540 | H.264 | AAC |
| `H264_1280x720` | 1280 × 720 | H.264 | AAC |
| `H264_1920x1080` | 1920 × 1080 | H.264 | AAC |
| `H264_3840x2160` | 3840 × 2160 | H.264 | AAC |
| `HEVC_1920x1080` | 1920 × 1080 | HEVC | AAC |
| `HEVC_3840x2160` | 3840 × 2160 | HEVC | AAC |

---

## 返回的媒体资源

`ImagePickerAsset` 表示一张图片或一个视频。

| 字段 | 含义与限制 |
| --- | --- |
| `uri` | 本地文件 URI，必有；图片可直接作为 React Native `Image` 的 source |
| `width`、`height` | 媒体尺寸；系统未提供时可能为 `0` |
| `type` | `image`、`video`、`livePhoto`、`pairedVideo` 或 `null` |
| `assetId` | Android、iOS 媒体库资源 ID；有限权限或 Android 文件系统选择等情况下可能为 `null` |
| `fileName` | 建议保存时使用的文件名；可能为 `null` |
| `fileSize` | 文件大小，单位为字节 |
| `mimeType` | MIME 类型；无法识别时可能不存在或为空 |
| `duration` | 视频时长，单位为毫秒；非视频为 `null` |
| `base64` | 开启 `base64` 后返回的 JPEG Base64 数据 |
| `exif` | 开启 `exif` 后返回的 EXIF 对象 |
| `file` | 仅 Web，浏览器 `File` 对象，可通过 `FormData` 上传 |
| `pairedVideoAsset` | 仅 iOS，Live Photo 对应的视频资源 |

不要假定所有可选字段都存在。上传前至少应验证：

- `type` 是否符合业务要求。
- `fileSize` 是否超过服务器限制。
- `width`、`height` 是否有效。
- `mimeType` 是否在允许列表中。
- 视频 `duration` 是否满足业务限制。

其中验证建议属于**基于文档内容推导**；原文只定义了字段及其可能为空的情况。

---

## 平台权限声明

### Android

库的 `AndroidManifest.xml` 会自动添加：

| 权限 | 作用 |
| --- | --- |
| `CAMERA` | 访问相机设备 |
| `READ_EXTERNAL_STORAGE` | 读取外部存储 |
| `WRITE_EXTERNAL_STORAGE` | 写入外部存储 |

文档配置部分还明确说明，库默认会加入 `RECORD_AUDIO`，可通过 `microphonePermission: false` 移除。

### iOS

使用以下 `Info.plist` 字段：

| 字段 | 作用 |
| --- | --- |
| `NSMicrophoneUsageDescription` | 解释为什么需要麦克风 |
| `NSPhotoLibraryUsageDescription` | 解释为什么需要访问照片库 |
| `NSCameraUsageDescription` | 解释为什么需要相机 |

权限文案应准确描述实际用途。原文未涉及 App Store 审核规则和具体文案规范。

---

## 容易踩坑的地方

1. **不要把本地 URI 当作上传后的 URL。**  
   `uri` 主要供本机读取和展示，上传后应使用服务器返回的资源地址。

2. **多选与编辑不能同时使用。**  
   开启 `allowsMultipleSelection` 后，`allowsEditing` 会被忽略。

3. **平台相同 API 不代表行为完全一致。**  
   `aspect`、`shape`、`defaultTab` 等只在特定平台有效；Android 的相机能力还可能受设备相机应用影响。

4. **Web 必须由用户操作直接触发。**  
   在生命周期或脱离点击事件的异步回调中调用，浏览器可能静默阻止。

5. **取消结果必须先判断。**  
   取消时 `assets` 是 `null`，不能访问 `assets[0]`。

6. **Android 可能丢失首次 Promise 的结果。**  
   系统销毁 `MainActivity` 后，应通过 `getPendingResultAsync()` 恢复。

7. **iOS 原始视频可能在选择后弹权限框。**  
   使用默认 `Passthrough` 且不编辑视频时，应考虑提前请求媒体库权限。

8. **`quality` 不是精确的文件大小控制器。**  
   输出可能比已压缩的原文件更大，PNG 和 BMP 在 iOS 上还会忽略该选项。

9. **Android GIF 容易丢失动画。**  
   必须使用 `quality: 1` 且关闭编辑，否则只返回第一帧。

10. **iOS 高分辨率图片裁剪存在系统缺陷。**  
    某些情况下裁剪矩形数据不准确，这是底层 `UIImagePickerController` 的已知问题。

---

## 实际开发中的推荐组织方式

下面内容是**基于经验建议**，不是原文要求。

将“权限、选择、结果校验和上传”分成不同职责：

```ts
async function selectImage() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.8,
  });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];

  if (asset.type !== 'image') {
    throw new Error('Unsupported media type');
  }

  return asset;
}
```

业务层拿到 `asset` 后再执行：

1. 校验类型、尺寸和大小。
2. 在界面中显示本地预览。
3. 上传到服务器或云存储。
4. 保存服务端返回的永久 URL。
5. 在失败时保留重试能力。

Web 上传可以直接使用 `asset.file`：

```ts
const formData = new FormData();
formData.append('file', asset.file);
```

原生平台通常需要根据上传 SDK 或后端接口读取 `asset.uri`。具体写法取决于所用网络库和存储服务，当前文档没有给出统一实现。

原文提供了 AWS S3 和 Firebase Storage 示例入口，但没有在本页展开配置与上传代码。

---

## 文档明确说明与合理推导的边界

### 文档明确说明

- 支持 Android、iOS、Web 和 Expo Go。
- 可以打开系统照片库或相机界面。
- 原生配置可能需要重新构建应用。
- Android 默认加入录音权限，并可通过配置移除。
- Web 必须在用户操作中打开选择器。
- 多选与裁剪互斥。
- Android GIF 动画有特定保留条件。
- Android Activity 销毁后可以恢复 pending result。
- iOS 原始视频可能需要提前申请媒体库权限。
- 各选项的平台支持范围、默认值和限制。
- iOS 高分辨率图片裁剪存在底层已知问题。

### 基于文档内容推导

- 业务代码应将系统选择结果视为不完全可信的外部输入，并验证可选字段。
- Android 应在应用恢复流程中检查 pending result。
- 同一套选项需要按平台分别测试，不能只依赖 TypeScript 类型。
- 返回的本地 URI 适合临时预览，长期资源地址应由上传服务产生。
- 有限照片权限下，业务不能依赖 `assetId` 或 `fileName` 一定存在。

### 当前文档未涉及

- 后端上传接口设计。
- 文件断点续传。
- 上传进度和失败重试的完整实现。
- 图片缓存和本地文件生命周期。
- 图片压缩算法及精确输出大小。
- App Store 和 Google Play 的审核要求。
- AWS S3、Firebase Storage 的完整配置步骤。
- 自动化测试 ImagePicker 的推荐方案。

---

## 总结

`expo-image-picker` 将 Android、iOS 和 Web 的相机及媒体选择能力封装成统一 API，但底层仍然受操作系统权限、系统选择器和设备实现影响。

实际使用时应重点处理四件事：

1. 区分构建期原生配置与运行时 API。
2. 正确处理权限状态、有限授权和无法再次询问的情况。
3. 先检查 `canceled`，再校验 `assets` 中可能缺失的字段。
4. 针对 Web 用户激活、Android Activity 恢复、iOS 视频权限和平台选项差异分别实现与测试。

---

## 文档导航

- **上一页**：[imagemanipulator](./178__imagemanipulator.md)
- **下一页**：[intent launcher](./180__intent-launcher.md)
