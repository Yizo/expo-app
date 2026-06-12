# Expo Image 学习指南

`expo-image` 是一个面向 Android、iOS、tvOS 和 Web 的高性能跨平台图片组件，也包含在 Expo Go 中。它负责加载、缓存和渲染图片，可视为 React Native 内置 `Image` 组件的增强替代方案。

> 本文对应 Expo 下一 SDK 版本的未发布文档，并非当前稳定版。原文指出，当前最新稳定文档为 SDK 56。

## 文档解决的问题

在移动应用中，图片不仅需要显示，还涉及：

- 网络加载与失败处理
- 内存和磁盘缓存
- 大图内存控制
- 占位图与加载过渡
- 动图播放
- 多分辨率图片选择
- Android、iOS、Web 的平台差异
- 原生图片资源和系统图标
- 图片预加载与原生实例复用

`expo-image` 将这些能力整合进一个 React 组件，并在原生端分别使用高性能图片库：

- iOS：SDWebImage
- Android：Glide

它适用于头像、商品图、图片列表、相册、远程封面、动图、渐进式加载、高性能图片预览等场景。

## React Web 开发者需要先理解的背景

### 它不是浏览器 `<img>` 的简单封装

在 Web 上，`expo-image` 最终会使用浏览器图片能力；在 iOS 和 Android 上，它会调用原生图片视图和原生解码、缓存库。

因此，同一个属性可能：

- 仅在某个平台生效；
- 在不同平台上有不同实现；
- 涉及原生构建配置；
- 受设备内存、系统版本和图片解码器影响。

阅读 API 时必须关注每个属性标注的支持平台。

### React Native 布局不等于普通 CSS

组件通常需要通过 `style` 明确获得尺寸：

```tsx
<Image
  source="https://example.com/photo.jpg"
  style={{ width: 300, height: 200 }}
/>
```

对于来自 Xcode Asset Catalog 或 Android drawable 的原生资源，文档明确要求手动指定尺寸。

React Native 中的数字尺寸通常表示 point 或逻辑像素，而不是图片文件的物理像素。实际像素尺寸可由逻辑尺寸乘以图片的 `scale` 得到。

### Expo 配置插件属于构建期配置

`app.json` 或 `app.config.js` 中的 config plugin 会修改 iOS、Android 原生工程配置。修改这类配置后，需要重新构建原生项目，仅刷新 JavaScript 通常不会生效。

这与 React Web 修改运行时配置后重新启动开发服务器并不完全相同。

## 核心能力

### 支持的图片格式

| 格式 | Android | iOS | Web |
| --- | --- | --- | --- |
| WebP | 支持 | 支持 | 支持 |
| PNG / APNG | 支持 | 支持 | 支持 |
| AVIF | 支持 | 支持 | 支持 |
| HEIC | 支持 | 支持 | 不支持 |
| JPEG | 支持 | 支持 | 支持 |
| GIF | 支持 | 支持 | 支持 |
| SVG | 支持 | 支持 | 支持 |
| ICO | 支持 | 支持 | 支持 |
| ICNS | 不支持 | 支持 | 不支持 |
| PSD 合成预览 | 不支持 | 支持 | 不支持 |

不能因为某种格式能在 iPhone 上显示，就假定浏览器或 Android 也能显示。跨平台业务应选择所有目标平台共同支持的格式，或者由服务端按平台提供不同资源。

### 缓存

组件支持：

- 磁盘缓存
- 内存缓存
- 内存与磁盘组合缓存
- 预加载
- 查询磁盘缓存文件
- 清除缓存
- iOS 缓存淘汰策略配置

### 占位图

组件支持普通图片、BlurHash 和 ThumbHash 占位符。

BlurHash、ThumbHash 不是完整图片，而是用较短字符串编码出的低清视觉预览。客户端可先渲染占位内容，再加载原图，从而减少空白和突兀跳变。

### 图片切换过渡

`transition` 可在图片来源变化时添加过渡动画，避免直接替换导致闪烁。传入数字时，数字表示交叉淡化时长，单位为毫秒。

### 类似 CSS 的裁剪和定位

- `contentFit` 类似 CSS `object-fit`
- `contentPosition` 类似 CSS `object-position`

这两个属性是 React Web 开发者最容易直接迁移理解的部分。

## 安装与构建配置

### 安装

根据包管理器执行对应命令：

```sh
npx expo install expo-image
```

```sh
yarn expo install expo-image
```

```sh
pnpm expo install expo-image
```

```sh
bun expo install expo-image
```

`expo install` 会根据当前 Expo SDK 选择兼容版本，不应简单理解成 `npm install` 的别名。

如果是已有的裸 React Native 工程，还需要先安装并配置 Expo Modules，也就是文档所说的安装 `expo`。

### iOS AVIF 解码配置

可在 `app.json` 或 `app.config.js` 中添加 config plugin：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-image",
        {
          "disableLibdav1d": true
        }
      ]
    ]
  }
}
```

唯一列出的配置项是：

| 配置项 | 默认值 | 平台 | 作用 |
| --- | --- | --- | --- |
| `disableLibdav1d` | `false` | iOS | 不添加随包提供的 `libavif/libdav1d` Pod |

当其他依赖，例如 FFmpegKit，已经链接 `libdav1d` 时，可启用该配置以避免重复链接。

需要注意：

- 禁用这个 Pod 后，如果没有其他可用解码器，iOS 将失去 AVIF 支持。
- 修改插件配置后需要重新构建原生项目。
- 当前文档未提供 Android 对应的构建配置项。

如果项目不使用 Continuous Native Generation，或者手动维护 `ios` 工程，可以在执行 `pod install` 前设置：

```sh
EXPO_IMAGE_DISABLE_LIBDAV1D=1 pod install
```

文档也给出了在 `Podfile` 顶部设置环境变量的方式：

```ruby
ENV['EXPO_IMAGE_DISABLE_LIBDAV1D'] ||= '0'
```

这里的 `Podfile` 是 iOS CocoaPods 依赖配置文件，与 Web 项目的 `package.json` 不属于同一层级。

## 基础用法

```tsx
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function App() {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source="https://picsum.photos/seed/696/3000/2000"
        placeholder={{ blurhash }}
        contentFit="cover"
        transition={1000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    flex: 1,
    width: '100%',
    backgroundColor: '#0553',
  },
});
```

加载过程可以理解为：

1. `Image` 获得布局尺寸。
2. 先显示 BlurHash 占位内容。
3. 从 URL 加载并解码原图。
4. 按 `cover` 裁剪到容器尺寸。
5. 通过 1000 毫秒交叉淡化替换占位图。
6. 按缓存策略保存图片。

### 加载原生工程资源

Xcode Asset Catalog 或 Android drawable 中的图片可以按名称加载：

```tsx
import { Image } from 'expo-image';

export default function AppIcon() {
  return (
    <Image
      source={{ uri: 'app_icon' }}
      style={{ width: 40, height: 40 }}
    />
  );
}
```

资源名不包含扩展名，而且需要手动设置尺寸。

## `Image` 组件的关键属性

### 图片来源 `source`

`source` 支持：

- 远程 URL 字符串
- `ImageSource` 对象
- `require()` 返回的数字资源标识
- 已加载到内存中的 `ImageRef`
- 多个候选来源组成的数组
- iOS SF Symbol，例如 `sf:star.fill`

使用来源数组时，组件会根据容器尺寸和屏幕缩放比例选择最适合的资源。此时应为来源提供 `width`、`height` 和 `scale` 信息。

常用对象形式：

```tsx
<Image
  source={{
    uri: 'https://example.com/photo.jpg',
    headers: {
      Authorization: 'Bearer token'
    },
    cacheKey: 'photo-123'
  }}
  style={{ width: 300, height: 200 }}
/>
```

`ImageSource` 的重要字段包括：

| 字段 | 作用 |
| --- | --- |
| `uri` | 网络地址、本地路径或原生静态资源名 |
| `headers` | 请求远程图片时附带的 HTTP 请求头 |
| `cacheKey` | 自定义缓存键，默认使用 `uri` |
| `width`、`height` | 已知尺寸，可作为组件默认尺寸 |
| `blurhash`、`thumbhash` | 表示占位图，不能与同一来源中的 `uri` 同时生效 |
| `isAnimated` | Android、iOS 上提示资源是否为动图 |
| `webMaxViewportWidth` | Web 静态响应式选择中的旧式视口断点 |

Web 使用自定义请求头时，图片服务器必须通过 `Access-Control-Allow-Origin` 允许当前域名，否则会受到浏览器 CORS 限制。

### 图片填充 `contentFit`

默认值为 `cover`：

| 值 | 效果 | 类似 Web CSS |
| --- | --- | --- |
| `cover` | 保持比例填满容器，多余部分裁剪 | `object-fit: cover` |
| `contain` | 保持比例完整显示，可能留空 | `object-fit: contain` |
| `fill` | 强制填满，可能拉伸变形 | `object-fit: fill` |
| `none` | 不缩放，默认居中 | `object-fit: none` |
| `scale-down` | 在 `none` 和 `contain` 中选择更小结果 | `object-fit: scale-down` |

当 `contentFit` 为 `none` 或 `fill` 时，不会使用 `allowDownscaling` 的降采样行为。

### 图片定位 `contentPosition`

默认值是 `center`。它用于决定图片在容器中的对齐位置，例如：

```tsx
<Image
  source="https://example.com/photo.jpg"
  contentFit="cover"
  contentPosition="top right"
/>
```

也可以使用对象：

```tsx
contentPosition={{ top: 0, right: 0 }}
```

数值表示距相应边缘的 point 或逻辑像素距离；百分比表示容器尺寸与图片尺寸差值中的相对位置。`center` 等价于 `50%`。

### 占位图 `placeholder`

```tsx
<Image
  source="https://example.com/full.jpg"
  placeholder={{ blurhash }}
  placeholderContentFit="cover"
  contentFit="cover"
/>
```

关键限制是：

- 正式图片的 `contentFit` 默认是 `cover`。
- 占位图的 `placeholderContentFit` 默认是 `scale-down`。
- 两者缩放方式不同可能在替换时产生闪烁。

因此，占位图与正式图视觉比例一致时，通常应让两者使用相同的 fit 策略。

使用 BlurHash 时可设置解码宽高，默认均为 `16`。更大的值可能提升细节，但会降低性能。

### 缓存策略 `cachePolicy`

默认值为 `disk`：

| 值 | 行为 |
| --- | --- |
| `none` | 完全不缓存 |
| `disk` | 优先查询磁盘，不存在则下载并写入磁盘 |
| `memory` | 仅缓存于内存 |
| `memory-disk` | 优先使用内存，并以磁盘缓存作为后备 |

内存缓存可能很快被系统清理，以降低内存占用和 OOM 风险。因此，不能把 `memory` 理解为应用生命周期内永久存在。

### 大图缩放与内存

`allowDownscaling` 默认为 `true`，允许图片按视图容器大小降采样。关闭后可以保留更高质量，并使动态调整尺寸更平滑，但大型资源可能显著增加内存与性能压力。

iOS 的 `enforceEarlyResizing` 可强制尽早按容器尺寸缩小图片，从而降低内存占用，但动态改变图片视图尺寸时，可能影响缩放类型和定位效果。

Android 的 `decodeFormat` 支持：

- `argb`：32 位，带 Alpha 通道，质量和透明度支持更完整。
- `rgb`：16 位，不带 Alpha 通道，内存更低。

平台不保证一定采用指定格式。

### 加载优先级 `priority`

可选值为 `low`、`normal`、`high`，默认 `normal`。

它只影响同时排队请求时的尝试顺序，属于 best effort，不保证图片实际开始或完成加载的严格先后顺序。

### 加载生命周期

| 回调 | 触发时机 |
| --- | --- |
| `onLoadStart` | 开始加载 |
| `onProgress` | 加载过程中，可触发多次 |
| `onLoad` | 加载成功 |
| `onDisplay` | 图片已成功渲染到视图 |
| `onError` | 获取图片失败 |
| `onLoadEnd` | 成功或失败后都会触发 |

`onProgress` 提供 `loaded` 和 `total` 字节数。`onLoad` 返回的事件包含实际来源尺寸、URL、媒体类型、是否为动图以及缓存命中类型。

`onLoad` 表示加载完成，`onDisplay` 更接近“已经显示出来”，两者不要混为一个阶段。

### 图片切换动画 `transition`

```tsx
<Image
  source={currentUrl}
  transition={300}
/>
```

对象形式可配置：

- `duration`
- `effect`
- `timing`

Android 只支持 `cross-dissolve`。Web 不支持 `curl-up` 和 `curl-down`。部分 `sf:` 动画仅适用于 iOS 17 及以上的 SF Symbols。

### 列表复用 `recyclingKey`

在 FlashList 等会复用单元格视图的列表中，原来的图片视图可能被用于展示新数据。新图加载完成前，旧图可能短暂残留。

为每条数据设置不同的 `recyclingKey`，可以在键变化时先清空图片或恢复占位图：

```tsx
<Image
  recyclingKey={item.id}
  source={item.imageUrl}
  placeholder={placeholder}
/>
```

该属性只支持 Android 和 iOS。

### 动图

Android 和 iOS 默认通过 `autoplay={true}` 自动播放动图。还可以通过组件实例方法：

- `startAnimating()`
- `stopAnimating()`

手动控制播放。Web 不支持这些实例控制方法。

### 可访问性

`accessibilityLabel` 是屏幕阅读器读取的文本，在 Web 上还会设置 `<img>` 的 `alt`。`alt` 是它的别名。

```tsx
<Image
  source={productImage}
  accessibilityLabel="黑色双肩背包正面图"
/>
```

Android 和 iOS 上的 `accessible` 表示该视图是一个可访问性元素。Android 会将其映射到原生屏幕阅读器焦点行为。

### 平台专用属性

| 属性 | 平台 | 用途 |
| --- | --- | --- |
| `draggable` | Web | 控制 `<img>` 是否可拖动 |
| `loading` | Web | 设置浏览器原生 `lazy` 或 `eager` 加载 |
| `responsivePolicy` | Web | 决定响应式来源的选择方式 |
| `enableLiveTextInteraction` | iOS 16+ | 启用图片文字识别交互 |
| `preferHighDynamicRange` | iOS 17+、tvOS 17+ | 允许显示 HDR/EDR 图片 |
| `sfEffect` | iOS 17+ | 为 SF Symbol 添加系统动画 |
| `focusable` | Android | 允许硬件键盘等非触摸设备聚焦 |
| `decodeFormat` | Android | 控制期望的图片解码格式 |
| `useAppleWebpCodec` | iOS | 选择 Apple 或标准 libwebp 解码器 |

Apple 默认 WebP 解码器速度更快、内存更低，但可能错误处理动画混合或帧率。遇到这类问题时，可以设置：

```tsx
<Image source={animatedWebp} useAppleWebpCodec={false} />
```

## Web 响应式图片策略

`responsivePolicy` 仅用于 Web。

### `static`

默认策略。浏览器通过生成的 `srcset` 和 `sizes` 选择来源，支持静态渲染。

生成的 `sizes` 会优先使用 `auto`。该机制需要图片使用懒加载，因此默认将 `loading` 设置为 `lazy`。如果显式设置 `loading="eager"`，`sizes="auto"` 会被忽略。

不支持 `sizes="auto"` 的浏览器会依次回退到：

1. 来源中的 `webMaxViewportWidth` 断点；
2. `100vw`。

### `initial`

组件挂载时根据容器大小选择一次图片。不支持静态渲染。

### `live`

每次容器大小变化时重新选择图片。不支持静态渲染。

对于熟悉 React SSR 的开发者，关键区别是：`static` 的选择可交给浏览器并与静态输出配合；`initial` 和 `live` 依赖组件运行时测量。

## `ImageBackground`

`ImageBackground` 用于把图片作为背景，并在上面渲染其他内容：

- `style` 控制外层容器；
- `imageStyle` 控制背景图片；
- 其余图片能力继承自 `Image`。

这相当于一个容器与内部图片视图的组合，不等同于 Web CSS 的 `background-image`。

## 静态方法

### 预加载图片

```tsx
import { Image } from 'expo-image';

await Image.prefetch(
  ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
  { cachePolicy: 'memory-disk' }
);
```

`prefetch` 会提前下载图片，默认使用内存和磁盘缓存。只要其中一张图片预加载失败，Promise 就会立即解析为 `false`，不会抛出“部分成功”的详细结果。

可通过 options 传入：

- `cachePolicy`
- HTTP `headers`

预加载要真正提升后续显示效果，预加载和渲染时必须能命中相同缓存键与资源。

### 清理缓存

```tsx
await Image.clearDiskCache();
await Image.clearMemoryCache();
```

这两个方法主要支持 Android 和 iOS。Web 会解析为 `false`。

Android 上如果 Activity 已不可用，也可能返回 `false`。这里的 Activity 可以粗略理解为承载当前 React Native 界面的 Android 原生页面实例。

### 查询磁盘缓存

```tsx
const path = await Image.getCachePathAsync(cacheKey);
```

如果资源存在于磁盘缓存中，返回本地路径，否则返回 `null`。默认缓存键通常是图片 URL，除非设置了自定义 `cacheKey`。

### iOS 缓存配置

```tsx
Image.configureCache({
  maxDiskSize: 500 * 1024 * 1024,
  maxMemoryCost: 100 * 1024 * 1024,
  maxMemoryCount: 200
});
```

该方法只支持 iOS，可配置：

| 字段 | 说明 |
| --- | --- |
| `maxDiskSize` | 最大磁盘缓存字节数 |
| `maxMemoryCost` | 最大内存成本，按实际占用字节计算 |
| `maxMemoryCount` | 内存中最多缓存的对象数量 |

三个字段默认都是 `0`，表示对应维度不设上限。ARGB8888 图片通常每个像素占 4 字节，因此不能只根据压缩后的 JPEG、WebP 文件大小估算解码后的内存成本。

### 生成 BlurHash 和 ThumbHash

```tsx
const blurhash = await Image.generateBlurhashAsync(source, [4, 3]);
const thumbhash = await Image.generateThumbhashAsync(source);
```

两个方法只支持 Android 和 iOS。

BlurHash 横向、纵向组件数必须在 `1` 到 `9` 之间，默认是 `[4, 3]`。

### 预先加载原生图片实例

```tsx
const imageRef = await Image.loadAsync(source, {
  maxWidth: 800
});
```

`loadAsync` 将图片加载进内存，并返回指向原生图片实例的 `ImageRef`。之后可直接把这个引用传给 `Image`，避免再次等待原生解码。

## `useImage` Hook

```tsx
import { Image, useImage } from 'expo-image';
import { Text } from 'react-native';

export default function MyImage() {
  const image = useImage('https://picsum.photos/1000/800', {
    maxWidth: 800,
    onError(error, retry) {
      console.error('Loading failed:', error.message);
    }
  });

  if (!image) {
    return <Text>Image is loading...</Text>;
  }

  return (
    <Image
      source={image}
      style={{
        width: image.width / 2,
        height: image.height / 2
      }}
    />
  );
}
```

Hook 在首次成功加载前返回 `null`，成功后返回 `ImageRef`。

当来源的 `uri` 改变时，它会加载新图片。若其他状态变化也应触发重载，可传入第三个依赖数组，其作用类似 React Hook 的依赖数组。

`ImageLoadOptions` 支持：

| 选项 | 作用 |
| --- | --- |
| `maxWidth` | 在保持宽高比的情况下限制最大像素宽度 |
| `maxHeight` | 在保持宽高比的情况下限制最大像素高度 |
| `tintColor` | 为模板图片着色 |
| `onError` | 接收错误和 `retry` 重试函数 |

文档明确警告：不要在没有尺寸约束的情况下用 `useImage` 加载大图，否则可能因内存占用过高而崩溃。应根据用途设置 `maxWidth` 或 `maxHeight`。

## `ImageRef` 与原生图片实例

`ImageRef` 不是 URL，也不是图片二进制字符串，而是对已存在原生图片实例的引用：

- Android 对应 `Drawable`
- iOS 对应 `UIImage`

因为原生表示已在内存中，所以传给 `Image` 后可以立即渲染。

重要属性包括：

| 属性 | 含义 |
| --- | --- |
| `width`、`height` | 图片逻辑尺寸 |
| `scale` | 逻辑尺寸到物理像素尺寸的倍率 |
| `isAnimated` | 是否为动图 |
| `mediaType` | iOS 上识别到的 MIME 类型 |
| `nativeRefType` | 原生引用类型 |

物理像素尺寸的计算方式为：

```text
像素宽度 = width × scale
像素高度 = height × scale
```

iOS 文件名包含 `@2x` 时，`scale` 为 `2`；其他图片通常按 `1` 处理。Android 根据位图密度与屏幕密度计算。

## 组件实例方法

通过组件 ref 可以调用：

| 方法 | 平台 | 作用 |
| --- | --- | --- |
| `getAnimatableRef()` | 全平台 | 获得可参与动画的底层引用 |
| `lockResourceAsync()` | Android、iOS | 锁定资源，阻止重新加载 |
| `unlockResourceAsync()` | Android、iOS | 解除锁定 |
| `reloadAsync()` | Android、iOS | 忽略锁定并重新加载 |
| `startAnimating()` | Android、iOS | 开始播放动图 |
| `stopAnimating()` | Android、iOS | 停止播放动图 |

文档列出了资源锁定能力，但没有进一步说明典型业务场景或锁的生命周期管理方式。使用前应结合具体版本的实现和测试验证，不能自行假定它等同于网络请求锁或 JavaScript 并发锁。

## SF Symbols 与动画

iOS 支持使用 `sf:` 前缀加载 SF Symbol：

```tsx
<Image source="sf:star.fill" />
```

iOS 17 及以上可通过 `sfEffect` 添加系统符号动画：

```tsx
<Image
  source="sf:star.fill"
  sfEffect={{ effect: 'bounce', repeat: -1, scope: 'by-layer' }}
/>
```

`repeat` 的含义：

- `-1`：无限重复
- `0`：只播放一次，默认值
- 大于等于 `1`：重复指定次数

`scope` 可选择逐图层动画或把整个符号视为一个整体。

可用效果受系统版本限制：

- iOS 17+：`bounce`、`pulse`、`variable-color`、`scale`、`appear`、`disappear` 等。
- iOS 18+：增加 `wiggle`、`rotate`、`breathe`。
- iOS 26+：增加 `draw/on`、`draw/off`。

这些效果属于 Apple 系统能力，不是跨平台动画 API。Android 和 Web 需要单独设计替代效果。

## 从 React Native `Image` 迁移

为方便迁移，`expo-image` 支持部分 React Native `Image` 属性，但文档明确表示这些兼容属性已经弃用，未来可能移除：

| 已弃用属性 | 推荐替代 |
| --- | --- |
| `defaultSource` | `placeholder` |
| `loadingIndicatorSource` | `placeholder` |
| `fadeDuration` | `transition` |
| `resizeMode` | `contentFit` 和 `contentPosition` |

`resizeMode="repeat"` 完全不受支持。

新代码不应继续使用这些兼容属性，即使当前版本还能运行。

## 在服务端生成 BlurHash

文档示例使用 Express.js，在图片上传后生成 BlurHash。所需依赖：

```sh
npm install multer sharp blurhash
```

各依赖职责如下：

- `multer`：处理 `multipart/form-data` 图片上传。
- `sharp`：解码图片，并转换为原始像素字节。
- `blurhash`：把像素数据编码成 BlurHash 字符串。

初始化代码：

```js
const multer = require('multer');
const sharp = require('sharp');
const { encode } = require('blurhash');

const upload = multer();
```

接口示例：

```js
app.post('/blurhash', upload.single('image'), async (req, res) => {
  const { file } = req;

  if (file === null) {
    res.status(400).json({ message: 'Image is missing' });
    return;
  }

  const componentX = req.body.componentX ?? 4;
  const componentY = req.body.componentY ?? 3;

  const { data, info } = await sharp(file.buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

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

处理流程是：

1. 接收上传图片。
2. 使用 Sharp 解码图片。
3. `ensureAlpha()` 确保每个像素都有 RGBA 四个通道。
4. 转换为原始字节数组。
5. 将字节、图片宽高和组件数量传给编码器。
6. 返回 BlurHash 字符串。
7. 客户端把字符串保存为图片元数据，并通过 `placeholder` 显示。

`componentX` 和 `componentY`：

- 必须处于 `1` 到 `9`；
- 比例应接近原图宽高比；
- 值越大，结果通常越精细；
- 值为 `9` 时生成时间可能更长。

当编码器要求原始像素数据时，必须包含 Alpha 通道，即每个像素都应包含红、绿、蓝、透明度四个值。否则可能出现 `width and height must match the pixels array` 错误。

该流程不限于 Node.js。其他语言只要能：

1. 解码图片；
2. 获得编码器要求的数据格式；
3. 调用对应 BlurHash 编码器；

就能实现相同能力。

## 注意事项与常见坑点

### 当前文档属于下一 SDK 版本

API、默认值和平台支持情况可能尚未进入当前稳定 SDK。实际项目必须对照所使用 Expo SDK 的版本文档，不能直接假定这里的全部能力已经可用。

### 图片能下载不代表内存安全

压缩图片文件可能只有几 MB，解码到内存后却可能占用数十 MB。大图列表、轮播和原图预览尤其容易造成内存压力。

文档明确提供的控制方式包括：

- 保持 `allowDownscaling` 开启；
- 为 `useImage` 设置 `maxWidth` 或 `maxHeight`；
- iOS 可考虑 `enforceEarlyResizing`；
- Android 可根据透明度和质量要求考虑 `decodeFormat`。

### 占位图和正式图的 fit 默认值不同

这是最容易造成视觉闪烁的默认行为之一。正式图默认 `cover`，占位图默认 `scale-down`。需要时应显式统一。

### 平台支持必须逐项检查

例如：

- 缓存清理在 Web 返回 `false`；
- `configureCache` 仅支持 iOS；
- `decodeFormat` 仅支持 Android；
- 动图实例控制仅支持 Android 和 iOS；
- SF Symbols 仅属于 Apple 平台；
- Web 的 `loading`、`responsivePolicy` 不影响原生端。

### 缓存优先级不是确定性调度

`priority="high"` 不能保证请求一定最先完成。网络、连接复用、缓存命中和原生解码仍会影响最终顺序。

### 自定义缓存键需要保持稳定

**基于文档内容推导：** 如果同一资源在预加载与渲染阶段使用了不同缓存键，后续渲染可能无法复用预加载结果。缓存键还应随真实图片版本变化，否则资源更新后可能继续命中旧缓存。

### 受保护图片存在 Web 与原生差异

原生请求可以携带自定义 HTTP Header；Web 除了 Header 配置，还受浏览器 CORS 规则约束。服务端必须允许当前 Web 域名。

### 原生配置变更需要重新构建

`disableLibdav1d` 影响 CocoaPods 依赖，不是 JavaScript 运行时开关。热更新、Fast Refresh 或重新加载页面都不足以应用这项变更。

## 实际开发建议

以下内容属于**基于经验建议**，用于把文档能力落到项目设计中：

1. 普通远程图片优先使用默认磁盘缓存；高频反复展示的小图可评估 `memory-disk`。
2. 图片列表同时设置固定布局尺寸、占位图和稳定的 `recyclingKey`。
3. 后端在上传图片时生成缩略图、宽高、BlurHash 或 ThumbHash，并与图片 URL 一起返回。
4. 不要让客户端为列表中的大量原图实时生成 BlurHash。
5. 根据展示尺寸请求 CDN 缩放后的图片，避免下载和解码远大于容器的资源。
6. 只有关键首屏图片使用高优先级或预加载，避免所有图片都设为 `high`。
7. 为内容图片提供准确的 `accessibilityLabel`；纯装饰图片则根据产品的可访问性策略处理。
8. 在真机上测试内存、动图、滚动列表和低速网络。桌面浏览器表现不能代表移动设备原生表现。
9. 采用 HEIC、AVIF、HDR、SF Symbols 等能力前，先定义不支持平台的降级资源和效果。

## 文档明确内容与推导内容

### 文档明确说明

- `expo-image` 支持跨平台图片加载、渲染、缓存、占位图和切换动画。
- iOS 和 Android 分别使用 SDWebImage 与 Glide。
- 各图片格式、属性和方法的平台支持范围。
- `contentFit`、`contentPosition` 与 CSS 对应概念。
- 占位图和正式图的默认 fit 不同，可能造成闪烁。
- `useImage` 加载无尺寸约束的大图可能导致崩溃。
- `disableLibdav1d` 可能导致 iOS 失去 AVIF 支持。
- 部分 React Native `Image` 兼容属性已弃用。
- BlurHash 组件数范围为 `1` 到 `9`，原始像素数据需要 Alpha 通道。

### 基于文档内容推导

- 图片组件选型不能只按 API 统一程度判断，还必须评估原生内存和格式兼容性。
- 缓存键应在预加载和正式渲染阶段保持一致，并随资源版本变化。
- 高性能列表应组合使用尺寸约束、占位图、缓存和 `recyclingKey`。
- Web SSR 场景应优先评估 `responsivePolicy="static"`，运行时测量策略不适合静态输出。
- 服务端生成图片元数据和占位哈希，通常比在客户端批量生成更适合内容型应用。

## 当前文档未涉及

当前文档没有明确说明：

- 缓存文件的默认过期时间和具体磁盘上限；
- Android 缓存淘汰策略的自定义配置；
- 请求超时、自动重试次数和取消请求 API；
- 图片鉴权令牌刷新方案；
- CDN 图片变换参数规范；
- 与 Next.js `next/image` 的迁移方式；
- 完整的错误码分类；
- BlurHash 与 ThumbHash 的量化性能对比；
- 测试环境中如何 mock `expo-image`；
- 离线图片同步和缓存一致性方案。

这些问题需要结合具体 Expo SDK 版本、底层库文档和项目架构另行设计，不能从当前文档中直接得出结论。

## 总结

`expo-image` 的价值不只是“显示图片”，而是提供一套覆盖加载、解码、缓存、占位、过渡、响应式选择、原生资源和内存复用的跨平台图片方案。

React Web 开发者可以借助 `object-fit`、`object-position`、懒加载和响应式图片等已有知识快速理解其表层 API，但需要额外注意三个移动端特有问题：

1. 原生构建配置不是 JavaScript 运行时配置。
2. 图片解码后的内存成本远高于压缩文件大小。
3. API 和图片格式的支持范围会因平台及系统版本而变化。

实际项目中，应把明确尺寸、合适的服务端图片规格、占位哈希、缓存策略和平台降级方案作为完整图片链路统一设计。

---

## 文档导航

- **上一页**：[haptics](./176__haptics.md)
- **下一页**：[imagemanipulator](./178__imagemanipulator.md)
