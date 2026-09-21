# 170｜Expo SDK ImageManipulator 图像处理

**翻页：**[上一页：Expo SDK Image 跨平台图像](./169-Expo-SDK-Image.md) · [目录](./README.md) · [下一页：Expo SDK ImagePicker 图片选择器](./171-Expo-SDK-ImagePicker.md)

**官方页面：**[ImageManipulator · Latest](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/imagemanipulator/)

**版本与平台：**Latest 推荐 `expo-image-manipulator ~57.0.19`；SDK v56.0.0 推荐 `~56.0.26`。支持 Android、iOS、tvOS、Web，并标记可在 Expo Go 中使用。

## 图像操作采用“排队 → 渲染 → 保存”

ImageManipulator 修改设备本地图片。新 API 先由 `useImageManipulator(uri)` 或 `ImageManipulator.manipulate(uri)` 创建上下文，再用同步、可链式调用的方法排队变换；`renderAsync()` 等待后台处理并生成图像引用；最后调用 `ImageRef.saveAsync()` 把结果保存到 cache。

这个分阶段流程让一组旋转、裁切、缩放可以一次性渲染，避免每个操作都立即写出一个临时文件。它和旧 API `manipulateAsync(uri, actions, saveOptions)` 都能操作图片，但旧函数在当前文档已标为 deprecated，优先用新的上下文式 API。

安装：

```sh
npx expo install expo-image-manipulator
```

## 旋转后翻转并保存 PNG

源页示例从打包资源创建 `Asset`，下载资源得到本地 URI；使用 hook 创建处理上下文；先顺时针旋转 90°，再沿竖直轴翻转；渲染后写出 PNG，并用新 URI 更新预览：

```tsx
import { useEffect, useState } from 'react';
import { Asset } from 'expo-asset';
import { Button, Image, StyleSheet, Text, View } from 'react-native';
import { FlipType, SaveFormat, useImageManipulator } from 'expo-image-manipulator';

const sourceAsset = Asset.fromModule(require('./assets/snack-icon.png'));

export default function App() {
  const [imageUri, setImageUri] = useState(sourceAsset.uri);
  const [isReady, setIsReady] = useState(false);
  const context = useImageManipulator(imageUri);

  useEffect(() => {
    let mounted = true;
    void sourceAsset.downloadAsync().then(() => {
      if (mounted) {
        setImageUri(sourceAsset.localUri ?? sourceAsset.uri);
        setIsReady(true);
      }
    });
    return () => { mounted = false; };
  }, []);

  async function rotateAndFlip() {
    context.rotate(90).flip(FlipType.Vertical);
    const rendered = await context.renderAsync();
    const result = await rendered.saveAsync({ format: SaveFormat.PNG });
    setImageUri(result.uri);
  }

  if (!isReady) {
    return <View style={styles.container}><Text>图片加载中……</Text></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />
      </View>
      <Button title="旋转并翻转" onPress={() => void rotateAndFlip()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  imageContainer: { marginVertical: 20, alignItems: 'center', justifyContent: 'center' },
  image: { width: 300, height: 300, resizeMode: 'contain' },
});
```

`Asset.uri` 可以是打包资源引用；先 `downloadAsync()` 后优先用 `localUri`，再交给图像处理 API。新 API 的 `rotate` 正值顺时针、负值逆时针；`flip(Vertical)` 是上下翻转，`flip(Horizontal)` 是左右镜像。

## 核心操作方法

`ImageManipulatorContext` 是共享对象上下文，操作方法同步返回同一个 context，可以串接。实际像素转换由 `renderAsync()` 异步执行。

| 方法 | 参数与作用 |
| --- | --- |
| `crop({ originX, originY, width, height })` | 从左上角坐标开始，截取指定矩形区域。 |
| `flip('horizontal' \| 'vertical')` | 水平镜像或垂直翻转；一次只翻一个轴，要双向翻转需分别调用两次。 |
| `resize({ width, height })` | 设定输出宽高；只指定一个维度时会保留纵横比自动计算另一维度。 |
| `rotate(degrees)` | 按角度旋转，正值顺时针、负值逆时针。 |
| `extent({ width, height, originX, originY, backgroundColor })` | **仅 Web**：设定画布尺寸 / 图像偏移；扩展区域用背景色填充。 |
| `reset()` | 丢弃当前排队操作，回到最初载入的图像。 |
| `renderAsync()` | 等待全部操作执行，返回 `ImageRef`。 |
| `ImageRef.saveAsync(options?)` | 保存渲染后的图片到应用 cache，返回图片 URI / 尺寸和可选 Base64。 |

如果同一上下文要多次执行独立编辑，可先 `reset()`，否则前一次排队的操作会影响后续渲染。

## 旧函数与 API 边界

`ImageManipulator.manipulateAsync(uri, actions?, saveOptions?)` 已标为 deprecated。旧 `actions` 数组里每个对象只能包含一种操作 key（crop、extent、flip、resize、rotate）；URI 必须是本地路径或 Base64 data URI。一次调用完成一组动作并创建一个新文件；覆盖源文件不保证显示会刷新，因为图像有缓存。新写法可按上方分阶段流程操作。

另外，`ImageManipulator.manipulate(source)` 是命名空间级 API，载入 URI 或共享图片引用并返回新的 context；`ImageManipulator.ImageManipulator` 是命名空间中导出的类类型。React 中优先使用 `useImageManipulator` hook。

## 保存选项和结果

| 项目 | 说明 |
| --- | --- |
| `SaveOptions.format` | `SaveFormat.JPEG`（默认）、`PNG` 或 `WEBP`。PNG 无损但较慢；JPEG 速度更快但可能有可见压缩痕迹。 |
| `SaveOptions.compress` | 0.0 到 1.0；1 为最高质量 / 最少压缩，0 为最大压缩 / 最低质量。 |
| `SaveOptions.base64` | 可选同时返回 Base64 数据。 |
| `ImageResult.uri` | 写出的本地文件 URI，可传给 Expo Image / RN Image。 |
| `ImageResult.width` / `height` | 处理后图像像素维度。 |
| `ImageResult.base64?` | 设置 `base64: true` 后返回编码数据；要作为 data URI 使用时需添加 `data:image/jpeg;base64,` 或 `data:image/png;base64,` 前缀。 |

### Base64 输出示例

```ts
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

async function createJpegDataUri(localUri: string) {
  const context = ImageManipulator.manipulate(localUri);
  const rendered = await context.renderAsync();
  const result = await rendered.saveAsync({
    format: SaveFormat.JPEG,
    compress: 0.85,
    base64: true,
  });

  return result.base64 ? `data:image/jpeg;base64,${result.base64}` : null;
}
```

## API 结构与类型

| 名称 | 说明 |
| --- | --- |
| `useImageManipulator(source)` | Hook 输入 URI 或 image SharedRef，返回 `ImageManipulatorContext`。 |
| `ImageManipulator.manipulate(source)` | 非 Hook 入口，基于 URI / SharedRef 创建新处理上下文。 |
| `ImageManipulatorContext` | 延迟处理上下文；同步链式 `crop`、`extent`、`flip`、`resize`、`rotate` / `reset`，异步 `renderAsync`。 |
| `ImageRef` | 渲染后图像引用，含 `width`、`height`、`nativeRefType` 和 `saveAsync()`。 |
| `Action` | 旧 `manipulateAsync` 的联合类型：`ActionCrop`、`ActionExtent`、`ActionFlip`、`ActionResize`、`ActionRotate`。 |
| `ActionCrop` | `crop: { originX, originY, width, height }`。 |
| `ActionExtent` | Web 专属 `extent: { originX, originY, width, height, backgroundColor }`。 |
| `ActionFlip` | `flip: FlipType`。 |
| `ActionResize` | `resize: { width, height }`；只给一边保比例。 |
| `ActionRotate` | `rotate: number` 度。 |
| `FlipType` | `Horizontal = 'horizontal'`、`Vertical = 'vertical'`。 |
| `SaveFormat` | `JPEG = 'jpeg'`、`PNG = 'png'`、`WEBP = 'webp'`。 |

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-image-manipulator ~57.0.19`，SDK v56 推荐 `~56.0.26`。
- 两版 `useImageManipulator`、上下文 API、ImageRef / SaveOptions、旧 API deprecated 状态和文件处理示例一致。
- 两版 Next 都是 Expo SDK ImagePicker。

## 源页代码主题覆盖

- Installation：覆盖 `expo-image-manipulator` 安装命令。
- Basic usage：覆盖 `expo-asset` 本地图片、`Asset.downloadAsync()` / `localUri`、`useImageManipulator`、loading 状态、旋转、垂直翻转、`renderAsync()` 和保存 PNG 更新 Image URI。
- API：覆盖 Hook / 类工厂、context 链式变换、Web-only `extent`、`ImageRef.saveAsync`、已 deprecated 的 `manipulateAsync` 与 Actions 类型。
- Save options：覆盖格式、压缩率、Base64 输出及 data URI 转换。
- Latest / SDK v56 对照：标出安装版本并确认 Next 均为 ImagePicker。

**翻页：**[上一页：Expo SDK Image 跨平台图像](./169-Expo-SDK-Image.md) · [目录](./README.md) · [下一页：Expo SDK ImagePicker 图片选择器](./171-Expo-SDK-ImagePicker.md)
