# 004 Image

**翻页：** [上一页：003 FlatList](003-FlatList.md) · [目录](README.md) · [下一页：005 ImageBackground](005-ImageBackground.md)

**官方页面：** [Image · React Native](https://reactnative.dev/docs/image)  
**源页代码覆盖：** 本地/静态/network/data URI sources、Android GIF/WebP Fresco 依赖、图片无障碍、加载生命周期、resize/cache/referrer props、resizeMethod/resizeMode、source/src/srcSet 优先级、Image 静态方法与返回类型。

## `Image` 显示不同来源

RN `Image` 可读取打包内静态图片、网络图片、data URI 和本地文件。网页 `<img src>` 接收字符串；RN `source` 通常是带 `uri` 的对象，静态 `require` 则由 Metro 解析。网络和 data image 必须先知道显示尺寸，以免图片下载后布局突然变化。

```tsx
const tinyIconData = `data:image/png;base64,${base64ImagePayload}`;

<Image source={require('./assets/logo.png')} style={{ width: 96, height: 64 }} />

<Image
  source={{ uri: 'https://example.com/photo.jpg' }}
  style={{ width: 320, height: 180 }}
  resizeMode="cover"
/>

<Image source={{ uri: tinyIconData }} style={{ width: 48, height: 48 }} resizeMode="contain" />
```

data URI 适合很小且动态生成的图，例如列表图标，不适合传大图。

`source` 也可传候选数组，附上 uri、width、height 和 scale，让原生侧根据容器尺寸挑最合适图片。`src` 传 URL 字符串且优先于 `source`；`srcSet` 根据 pixel density 挑选候选源，优先级高于 `src` 和 `source`；未写倍率时默认 1x。

## Android GIF/WebP

当 App 自己构建 Android native code 时，GIF 与 WebP 需按需要添加 Fresco modules。下面是官方页给出的依赖类型和 RN 0.87 页面版本示例；RN 版本更新后 Fresco 版本可能变化，应从匹配 RN tag 的 `libs.versions.toml` 核实：

```gradle
dependencies {
  implementation 'com.facebook.fresco:animated-base-support:3.6.0'
  implementation 'com.facebook.fresco:animated-gif:3.6.0'
  implementation 'com.facebook.fresco:webpsupport:3.6.0'
  implementation 'com.facebook.fresco:animated-webp:3.6.0'
}
```

是否需要 animated-base-support 取决于最低 Android API 和动画格式要求，按当前模板依赖配置选择。

## 加载事件与占位

- `defaultSource` 在请求等待时显示静态 placeholder；Android Debug build 里可能被忽略。
- `loadingIndicatorSource` 可提供加载指示图源（uri 或静态资源编号）。
- `onLoadStart` 在开始加载时调用；`onLoad` 成功后可从 nativeEvent.source 读图片原始宽高；`onLoadEnd` 无论成功失败都会触发。
- `onError` 报错；`onProgress` 提供 loaded/total；iOS `onPartialLoad` 用于渐进 JPEG 的部分加载通知。
- Android `fadeDuration` 控制淡入时间，默认 300 ms；`progressiveRenderingEnabled` 可启用渐进式 JPEG，默认 false。

```tsx
<Image
  source={{ uri: photoUrl }}
  defaultSource={require('./assets/photo-placeholder.png')}
  style={{ width: 240, height: 160 }}
  onLoad={event => setIntrinsicSize(event.nativeEvent.source)}
  onError={event => reportImageFailure(event.nativeEvent.error)}
  onLoadEnd={() => setLoading(false)}
/>
```

## 无障碍与样式

`accessible` 默认 false；`accessibilityLabel` 提供读屏描述。`alt` 也能设置图片替代文本，并自动把图像标记为 accessible。`testID` 给 UI 自动化定位元素用，不替代读屏文本。Image 继承 View props。

`blurRadius` 添加模糊，iOS 上通常需大于 5 才明显。iOS `capInsets` 是九宫格式拉伸：设置固定的边角 inset，让中心/边框随尺寸拉伸，可用于按钮贴图或阴影。

## 尺寸与缩放方式

`width`/`height` 设置 Image view 尺寸。`resizeMode` 决定原图宽高比与 view 不一致时怎么填充：

| 值 | 行为 |
|---|---|
| `cover`（默认） | 保持比例并填满，超出部分裁切 |
| `contain` | 保持比例并完整显示，可能留白 |
| `stretch` | 分别拉伸宽/高，可能改变比例 |
| `repeat` | 重复平铺覆盖；原图过大时先缩小到容器内 |
| `center` | 居中显示；过大时缩小到容器内 |

Android `resizeMethod` 控制源图和 view 尺寸不匹配时怎么处理：`auto` 默认启发式选择；`resize` 先在软件解码阶段下采样，适合超大图；`scale` 绘制时缩放，通常更快且保真；`none` 不采样，超大图可能触发运行时内存异常。`resizeMultiplier` 仅在 `resize` 时有效，可让下采样尺寸稍大于 view，再缩小到目标大小以减少模糊，默认 1.0。

## 图片请求与缓存

`source` 对象可包含网络请求的 `method`（默认 GET）、`headers` 和 UTF-8 字符串 `body`。`crossOrigin` 可为 `anonymous`（默认，不发送用户凭证）或 `use-credentials`；`referrerPolicy` 可选策略决定图片请求使用何种 Referer。网络请求推荐 HTTPS。

`cache` 在 iOS 类型表中包含以下缓存策略：

| 策略 | 行为 |
|---|---|
| `default` | 使用平台默认 |
| `reload` | 不使用旧缓存，从源地址重新请求 |
| `force-cache` | 有缓存就用（即使过期），没有才请求 |
| `only-if-cached` | 只读缓存；未命中则失败，不联网 |

`ImageSource` 可是 source object、候选对象数组或 Metro `require()` 返回的 number。对象属性包括 `uri`、已知尺寸 `width/height`、密度 `scale`、iOS `bundle`、`method`、`headers`、`body` 和 iOS cache。静态图片的资源名需在打包时确定。

官方页提到的主要格式有 png、jpg/jpeg、bmp、gif、webp；PSD 为 iOS 支持，iOS 还支持部分 RAW 图片。WebP 在 iOS 只支持随 JS bundle 打包的资源。

## 静态方法

| 方法 | 用途和限制 |
|---|---|
| `Image.abortPrefetch(requestId)` | Android 取消预取；requestId 来自 `prefetch` callback |
| `Image.getSize(uri)` | Promise 获取网络图片尺寸；可能先下载并缓存，不是专用预取 API |
| `Image.getSizeWithHeaders(uri, headers)` | 带 header 获取网络图尺寸；不支持静态资源 |
| `Image.prefetch(url)` | 下载远程图到磁盘缓存，Promise 返回成功 boolean |
| `Image.queryCache(urls)` | URL 到 memory/disk/disk-memory 缓存状态的映射 |
| `Image.resolveAssetSource(source)` | 把静态 asset 编号解析为 uri、scale、width、height |

```tsx
const didPrefetch = await Image.prefetch(avatarURL);
const dimensions = await Image.getSize(avatarURL);
const cachedURLs = await Image.queryCache([avatarURL]);
```

`onLoad` 参数中的 `ImageLoadEvent.source` 有加载图片的 width/height/uri。图片缓存、progressive JPEG、GIF/WebP 等需在目标 iOS/Android 环境验证。

**翻页：** [上一页：003 FlatList](003-FlatList.md) · [目录](README.md) · [下一页：005 ImageBackground](005-ImageBackground.md)
