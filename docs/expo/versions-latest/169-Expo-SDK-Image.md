# 169｜Expo SDK Image 跨平台图像

**翻页：**[上一页：Expo SDK Haptics 触觉反馈](./168-Expo-SDK-Haptics.md) · [目录](./README.md) · [下一页：Expo SDK ImageManipulator 图像处理](./170-Expo-SDK-ImageManipulator.md)

**官方页面：**[Image · Latest](https://docs.expo.dev/versions/latest/sdk/image/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/image/)

**版本与平台：**Latest 推荐 `expo-image ~57.0.5`；SDK v56.0.0 推荐 `~56.0.13`。支持 Android、iOS、tvOS、Web，并标记可在 Expo Go 中使用。

## 为什么使用 `expo-image`

`expo-image` 的 `Image` 是跨平台图片组件，替代常见的 React Native `Image` 使用场景，并提供磁盘 / 内存缓存、动画图片、占位图、图片切换动画及类似 CSS 的 `object-fit` / `object-position` 适配。原生端底层分别使用 Glide（Android）和 SDWebImage（iOS）。

- 图片尺寸差异可以通过 `contentFit` 与 `contentPosition` 调整；设置布局宽高可以避免未加载时页面跳动。
- `placeholder` 可使用 BlurHash / ThumbHash 等压缩占位表示，在原图加载前先呈现模糊预览。
- `cachePolicy` 控制不缓存、磁盘缓存、内存缓存或两级缓存；加载来源变化时可使用 `transition` 减少闪烁。
- 常见格式包含 WebP、PNG / APNG、AVIF、HEIC、JPEG、GIF、SVG、ICO、ICNS 和 PSD 合成预览。iOS 系统 SVG 解码器对部分有效 path 有限制；更广的 SVG path 兼容可选 react-native-svg。

## 安装与构建配置

安装：

```sh
npx expo install expo-image
```

iOS 的 AVIF 解码使用内置 `libavif/libdav1d` Pod。如果另一个原生依赖已经链接 `libdav1d`，可以禁用内置 Pod；这可能同时移除 iOS AVIF 支持，除非其它解码器提供该格式：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-image",
        { "disableLibdav1d": true }
      ]
    ]
  }
}
```

该插件是 build-time 配置，修改后重建原生工程。手动维护 iOS 原生工程时，Expo 页面建议在运行 `pod install` 前设置 `EXPO_IMAGE_DISABLE_LIBDAV1D=1`，或在 Podfile 中配置该环境变量。

## 显示远程图片和 BlurHash 占位

下面示例展示源页的核心组合：远程 URL、BlurHash placeholder、`contentFit="cover"` 和淡入时间。BlurHash 是将图像低频颜色信息压缩成短字符串，适合作为图片载入前的小占位图。

```tsx
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

const placeholderHash = 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';

export default function ProductPhoto() {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source="https://example.com/product-photo.jpg"
        placeholder={{ blurhash: placeholderHash }}
        contentFit="cover"
        transition={700}
        accessibilityLabel="商品预览"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  image: { flex: 1, width: '100%', backgroundColor: '#eee' },
});
```

占位图的默认 `placeholderContentFit` 是 `scale-down`，可能与最终图的 `contentFit` 不同而显得闪烁；需要时让二者使用相同 fit。`transition` 可以设置数字毫秒或动画对象。组件也提供 `ImageBackground`，可把图片用作背景、在上层绘制其他 children，并分别设置容器 `style` 和图片 `imageStyle`。

## 从原生资源目录加载图片

已放入 Xcode asset catalog / Android drawable 资源的图片，可用资源名加载，省略扩展名并手工给出布局尺寸：

```tsx
import { Image } from 'expo-image';

export function AppIcon() {
  return <Image source={{ uri: 'app_icon' }} style={{ width: 40, height: 40 }} />;
}
```

图片文件作为 React Native 静态资源时也可以使用 `require('./assets/photo.png')`；远程图片可以带 URI、headers 和 cacheKey。若传入多资源数组，Expo Image 会结合容器尺寸和屏幕 scale 选最合适的图片；数组项应带 `width`、`height`、`scale`。

## 图片适配、缓存和加载反馈

`contentFit` 对应 CSS `object-fit`：

| 值 | 行为 |
| --- | --- |
| `cover` | 保留纵横比，填满容器；超出的边缘裁切，默认值。 |
| `contain` | 保留纵横比，完整显示；容器可能有空白。 |
| `fill` | 完全填满容器，必要时拉伸变形。 |
| `none` | 保留图片原始尺寸，默认居中；可用 `contentPosition` 调整。 |
| `scale-down` | 选择 `none` 或 `contain` 中显示尺寸较小者。 |

`contentPosition` 对应 CSS `object-position`，可传 `'top right'` 等字符串或轴向百分比 / 数值对象。`placeholder` 可放 BlurHash、ThumbHash、静态资源或共享 `ImageRef`；`placeholderContentFit` 默认 `scale-down`。

| 属性 / API | 说明 |
| --- | --- |
| `cachePolicy` | `'none'`、`'disk'`（默认）、`'memory'`、`'memory-disk'` 或 `null`。内存缓存可能被系统快速回收以控制 OOM 风险。 |
| `priority` | 排队下载的 `low` / `normal`（默认）/ `high`；仅尽力调度，不保证顺序。 |
| `recyclingKey` | 在 FlatList / FlashList 等复用视图中，键变化时先清空旧图或显示 placeholder，防止新图未到时短暂显示上一项。 |
| `allowDownscaling` | 默认 `true`，依容器大小缩小大图；关闭可保留高分辨率，但会增加内存和性能压力。`contentFit` 为 `none` / `fill` 时不缩放。 |
| `onLoadStart` / `onProgress` / `onLoad` / `onLoadEnd` | 图片开始读取、接收字节进度、成功完成、成功或失败结束时的回调。 |
| `onError` / `onDisplay` | `onError` 收到失败信息；`onDisplay` 在图片已成功渲染时触发。 |
| `alt` / `accessibilityLabel` | 屏幕阅读器说明；Web 上同时成为 `<img alt>`。`alt` 是 `accessibilityLabel` 的别名。 |
| `draggable` / `focusable` | `draggable` 控制 Web 图片能否拖动；Android `focusable` 控制键盘等非触控输入能否聚焦。 |
| `autoplay` | 动画图片自动播放，默认 `true`。需要时还可调用组件 `startAnimating()` / `stopAnimating()`。 |
| `tintColor` | 给仅使用透明度的模板图着色；占位图不受此项影响。 |
| `blurRadius` | 图片模糊半径，0 表示无模糊；不作用于 placeholder。 |
| `decodeFormat` | Android 解码格式 `argb`（含 alpha、默认）或 `rgb`（16 位、无 alpha）；系统不保证总能使用指定格式。 |
| `enableLiveTextInteraction` | iOS 16+ 为图像开启 Live Text 交互。 |
| `preferHighDynamicRange` | iOS / tvOS 17+ 启用 EDR/HDR 图像支持；默认 `false`。 |
| `useAppleWebpCodec` | iOS 默认使用 Apple WebP codec，较快、内存更省；设为 `false` 可改用兼容性更严格的 libwebp，避免部分动画混合 / 帧率问题。 |

部分旧 React Native `Image` 兼容属性已经 deprecated：`defaultSource` / `loadingIndicatorSource` 改用 `placeholder`；`fadeDuration` 改用 `transition`；`resizeMode` 改用 `contentFit` + `contentPosition`。`accessible`、`focusable`、`draggable` 则保留各平台可访问性 / Web 拖动设置。

## Web 响应式资源与原生 SVG 注意事项

Web 的 `responsivePolicy` 默认为 `static`，通过浏览器 `srcset` / `sizes` 选择图源，可用于静态渲染；该模式默认启用 `loading="lazy"`，需要立即加载时可改成 `eager`（这会放弃 `sizes="auto"` 自动布局选择）。`initial` 在 mount 后测量容器一次；`live` 在 resize 时持续重新选择，两者不适用于静态渲染。

SVG 在 iOS 上由系统解码器处理，复杂 arc 命令可能扭曲或消失。若 SVG 压缩器把 arc 的 `large-arc-flag` 与 `sweep-flag` 合并成紧凑值，可把两个 flag 分开并使用空格；要覆盖更多路径形式，Expo 页面建议改用 `react-native-svg`。

## SF Symbols 与过渡

iOS 上可用 `source="sf:star.fill"` 加载 SF Symbol（iOS 17+ 支持 symbol effect）。`sfEffect` 可写字符串、对象，或两者数组；效果包括 bounce、pulse 等。源页的代码形态：

```tsx
<Image source="sf:star.fill" sfEffect="bounce" />
<Image source="sf:star.fill" sfEffect={{ effect: 'bounce', repeat: -1, scope: 'by-layer' }} />
<Image source="sf:star.fill" sfEffect={['bounce', { effect: 'pulse', repeat: -1 }]} />
```

当 source 从一个 SF Symbol 变为另一个时，`transition.effect` 可设 `sf:replace` / `sf:down-up` / `sf:up-up` / `sf:off-up`；其它 bounce / pulse / scale 类动画用 `sfEffect`。普通 source 切换支持 cross-dissolve、翻转、curl 等过渡；Android 只支持 `cross-dissolve`，Web 不支持 `curl-up` / `curl-down`。

## `useImage` 与内存中的 `ImageRef`

`useImage(source, options?, dependencies?)` 异步读图，返回 `ImageRef | null`。当 URI 变化会自动载入新图；如果其它依赖变化也需要重载，可传 dependencies。`ImageRef` 指向内存中的原生 Drawable / UIImage，传给 `Image.source` 时可直接渲染；对于大图片一定通过 `maxWidth` 或 `maxHeight` 控制尺寸，以免占用过多内存。

```tsx
import { Image, useImage } from 'expo-image';
import { Text } from 'react-native';

export function MemoryImage() {
  const image = useImage('https://example.com/large.jpg', {
    maxWidth: 800,
    onError(error, retry) {
      console.error(error.message);
      // 由界面操作决定何时重试，避免失败后自动无限循环。
    },
  });

  if (!image) return <Text>图片加载中……</Text>;
  return <Image source={image} style={{ width: image.width / 2, height: image.height / 2 }} />;
}
```

`ImageRef` 的 `width` / `height` 是逻辑尺寸，乘 `scale` 得像素尺寸；还暴露是否动画、MIME / mediaType、nativeRefType 等只读信息。

## 缓存与图片预载

`Image.prefetch(urls, cachePolicy?)` 或 `Image.prefetch(urls, options?)` 可在显示前预加载网络图片。`writeToCacheAsync` 可把本地文件 / 已加载 ImageRef 放进指定 cacheKey，`readFromCacheAsync` 再以 ImageRef 读回。读取 cache miss 返回 `null`；`getCachePathAsync(cacheKey)` 返回磁盘缓存路径或 `null`。

```ts
import { Image } from 'expo-image';

const urls = ['https://example.com/a.jpg', 'https://example.com/b.jpg'];
const ready = await Image.prefetch(urls, {
  cachePolicy: 'memory-disk',
  headers: { Authorization: 'Bearer example-token' },
});

if (!ready) console.warn('至少一张图片预载失败');
const cachePath = await Image.getCachePathAsync(urls[0]);
const cachedImage = await Image.readFromCacheAsync(urls[0]);
console.log(cachePath, cachedImage?.width);
```

`Image.writeToCacheAsync(source, cacheKey)` 不联网，可从本地文件或 ImageRef 预填磁盘缓存。注意：用 ImageRef 写缓存会把动画 GIF / APNG / animated WebP 压平成单帧；要无损保存动画，请传原始本地文件 URI。

其它静态 API：`clearDiskCache()` / `clearMemoryCache()` 清空对应缓存（Web 返回 `false`，Android activity 不可用时也可能返回 `false`）；iOS `configureCache(config)` 配置缓存淘汰限制；`loadAsync(source, options?)` 加载出 ImageRef；`generateBlurhashAsync(source, components)` 与 `generateThumbhashAsync(source)` 计算占位 hash。

BlurHash 网格组件每轴必须在 1–9，默认 `[4, 3]`。BlurHash 有助于生成低分辨率模糊预览；ThumbHash 为另一种轻量占位表示。

静态缓存 / 预载方法：

| 静态方法 | 用途与返回 |
| --- | --- |
| `clearDiskCache()` / `clearMemoryCache()` | 清空磁盘 / 内存图片缓存，Promise<boolean>；Web 返回 `false`，Android activity 不可用时也可能返回 `false`。 |
| `configureCache(config)` | 仅 iOS，配置 cache eviction 限制。 |
| `generateBlurhashAsync(source, components)` / `generateThumbhashAsync(source)` | 从 URL 或 ImageRef 生成占位 hash；BlurHash 每轴 1–9、默认 `[4, 3]`。 |
| `getCachePathAsync(cacheKey)` | 查询磁盘缓存路径；没有缓存时返回 `null`。 |
| `loadAsync(source, options?)` | 预先把图载入内存并返回 `ImageRef`。 |
| `prefetch(urls, cachePolicy?)` / `prefetch(urls, options?)` | 预下载一张或多张 URL 并写缓存；Promise<boolean> 表示是否成功。 |
| `readFromCacheAsync(cacheKey)` / `writeToCacheAsync(source, cacheKey)` | 从缓存读 ImageRef，或把本地路径 / ImageRef 预置到磁盘缓存。 |

常用类型：

| 类型 | 关键字段 / 含义 |
| --- | --- |
| `ImageCacheConfig` | `maxDiskSize`、`maxMemoryCost`、`maxMemoryCount`；文档默认 0 表示不设对应容量 / 数量上限。 |
| `ImageContentPosition` / `ImageContentPositionValue` | `center`、`top right` 等 CSS 风格关键字，或按轴用数字 dp / 百分比表达位置。 |
| `ImageSource` | `uri`、`cacheKey`、请求 `headers`、`width` / `height`、Web `webMaxViewportWidth`、animated 标志及 BlurHash / ThumbHash 字段。Web 请求的服务器必须返回允许当前域名的 CORS header。 |
| `ImageTransition` | `duration`（毫秒）、`effect`、`timing`；Android 只支持 `cross-dissolve`，Web 不支持 curl。iOS SF Symbol 可选 `sf:replace`、`sf:down-up`、`sf:up-up`、`sf:off-up`。 |
| `ImageLoadOptions` | `maxWidth` / `maxHeight` 尺寸上限、模板图 `tintColor`、`onError(error, retry)` 重试回调。 |
| `ImagePrefetchOptions` | `cachePolicy`（默认 memory-disk）和请求 headers。 |
| `ImageProgressEventData` | 当前已加载 `loaded` 和总字节 `total`。 |
| `ImageLoadEventData` | `cacheType` 与来源 URL、尺寸、动画状态、mediaType。 |
| `ImageErrorEventData` | 错误文本 `error`。 |
| `ImageRef` | 内存中原生图片引用；含逻辑 `width` / `height`、`scale`、animated 状态、mediaType 与 nativeRefType。 |
| `SFSymbolEffectType` | `bounce`、`bounce/up`、`bounce/down`、`pulse`、`variable-color` 系列、`scale` 系列、`appear`、`disappear`、`wiggle`、`rotate`、`breathe`；iOS 26+ 另有 `draw/on` / `draw/off`。 |
| `SFSymbolEffectObject` | `effect`、`repeat`（-1 无限、0 一次、正数重复次数）、`scope`（by-layer / whole-symbol）。 |

其它组件方法：`getAnimatableRef()` 获取可动画引用；`lockResourceAsync()` 锁住当前资源避免重载，`reloadAsync()` 强制重载（忽略锁）；`unlockResourceAsync()` 解锁；`startAnimating()` / `stopAnimating()` 控制动画图片播放。

## BlurHash 服务端生成示例

源页还包含 Express 后端示例：客户端上传 multipart 图片，后端用 Multer 取文件、Sharp 转 RGBA 像素缓冲，再用官方 BlurHash encoder 计算 hash。下面等价重写其依赖、文件检查、用户自定义每轴组件数与 JSON 响应：

```sh
npm install multer sharp blurhash
```

```js
const multer = require('multer');
const sharp = require('sharp');
const { encode } = require('blurhash');

const upload = multer();

app.post('/blurhash', upload.single('image'), async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ message: 'Image is missing' });
    return;
  }

  const componentX = Number(req.body.componentX ?? 4);
  const componentY = Number(req.body.componentY ?? 3);
  if (componentX < 1 || componentX > 9 || componentY < 1 || componentY > 9) {
    res.status(400).json({ message: 'componentX / componentY must be from 1 to 9' });
    return;
  }

  const { data, info } = await sharp(file.buffer).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });
  const blurhash = encode(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    componentX,
    componentY
  );

  res.json({ blurhash });
});
```

原始像素需包含 RGBA 四通道；缺少 alpha 或宽高与像素数组不匹配会导致编码失败。服务器也可用其它语言 / 图像库生成 BlurHash，但需让所用 encoder 的像素格式相符。

## Native image formats 与重要 prop 总览

官方页格式表列出 WebP、PNG / APNG、AVIF、HEIC、JPEG、GIF、SVG、ICO、ICNS 和 PSD 合成预览。支持矩阵依平台解码器不同；特别是 iOS SVG arc 路径有已知限制。

| prop | 关键默认 / 行为 |
| --- | --- |
| `source` | URL、本地 `require()` 资源、ImageSource 或 source 数组；iOS SF Symbols 可用 `sf:` 前缀。远程 Web 图片需要服务端 CORS headers。 |
| `contentFit` / `contentPosition` | 类 CSS `object-fit` / `object-position`；默认 `cover` / `center`。 |
| `placeholder` / `placeholderContentFit` | 加载期间的图；可用 BlurHash / ThumbHash；fit 默认 `scale-down`。 |
| `transition` | source 改变时平滑切换，duration 以毫秒计；默认 0。 |
| `cachePolicy` / `priority` / `recyclingKey` | 缓存位置、预载队列优先级、列表复用前清除旧内容。 |
| `onLoadStart` / `onProgress` / `onLoad` / `onLoadEnd` / `onError` / `onDisplay` | 监控网络加载与最终渲染状态。 |
| `isAnimated` / `autoplay` / `startAnimating()` / `stopAnimating()` | 动画文件识别和播放控制；autoplay 默认 true。 |
| `alt` / `accessibilityLabel` / `accessible` | 辅助技术文本与可访问性元素。 |
| `blurRadius` / `tintColor` / `imageStyle` | 模糊、模板图着色、ImageBackground 内层图片样式。 |
| `responsivePolicy` / `loading` | Web 响应式 source 选择与 lazy / eager 加载；static 默认 lazy。 |
| `enableLiveTextInteraction` / `preferHighDynamicRange` | iOS Live Text 和 iOS / tvOS HDR / EDR 开关。 |
| `useAppleWebpCodec` | iOS WebP decoder 选择；系统默认较快省内存，libwebp 更符合动画混合 / 帧率表现。 |
| `decodeFormat` / `allowDownscaling` / `enforceEarlyResizing` | 解码色彩空间、像素降采样和原生早期缩放。 |
| Deprecated: `resizeMode` / `fadeDuration` / `defaultSource` / `loadingIndicatorSource` | 对应改用 `contentFit` + `contentPosition`、`transition`、`placeholder`。 |

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-image ~57.0.5`，SDK v56.0.0 推荐 `~56.0.13`。
- 两页的 plugin、缓存 API、useImage、Image / ImageBackground、SF Symbols、BlurHash 服务端流程和 Next 大体相同。Web 响应式图片细节有文档调整：v56 说明需用 `webMaxViewportWidth` 设定 breakpoint；Latest 描述浏览器用 `srcset/sizes`，`sizes="auto"` 依赖 lazy loading。使用响应式 source 时按目标 SDK 页面与对应浏览器支持验证。
- 两版页脚都进入 ImageManipulator。

## 源页代码主题覆盖

- Configuration：覆盖 `disableLibdav1d` app config plugin、AVIF decoder 冲突 / 功能边界，以及不使用 CNG 时手动设置环境变量的说明。
- Basic Image：覆盖远程 source、BlurHash placeholder、`contentFit`、transition、Image 样式与布局。
- Native resources：覆盖 Xcode / Android drawable 资源名 `source={{ uri }}`、不写扩展名和手工尺寸。
- SF Symbols：覆盖 `sfEffect` 字符串、带 options 对象和字符串 + 对象数组三种写法。
- `useImage`：覆盖请求大图限制 `maxWidth`、加载状态、`onError(error,retry)` 和 ImageRef 源。
- Backend BlurHash：覆盖 Multer 文件上传、缺文件响应、可配置 components、Sharp RGBA buffer、BlurHash encode 与 JSON 返回。
- API Reference：覆盖 ImageBackground、缓存配置与清理、generate hash、load/prefetch/read/write cache、动画组件方法、ImageRef 与各类 props / type。
- Latest / SDK v56：标出 package version、Web responsive behavior 文档差异和共同的 ImageManipulator Next。

**翻页：**[上一页：Expo SDK Haptics 触觉反馈](./168-Expo-SDK-Haptics.md) · [目录](./README.md) · [下一页：Expo SDK ImageManipulator 图像处理](./170-Expo-SDK-ImageManipulator.md)
