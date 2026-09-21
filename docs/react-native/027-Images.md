# 027 Images

**翻页：** [上一页：026 Layout with Flexbox](026-LayoutWithFlexbox.md) · [目录](README.md) · [下一页：028 Color Reference](028-ColorReference.md)

**官方页面：** [Images · React Native](https://reactnative.dev/docs/images)  
**源页代码覆盖：** 静态 `require` 与 `@2x/@3x`、静态路径约束、iOS asset catalog、非图像资源、混合工程资源、网络/POST 图片请求、data URI、缓存策略、本地文件与 Android drawable、远程图片尺寸、`source` 对象、ImageBackground、iOS 圆角限制、后台解码及原生缓存上限。

## RN `Image` 和资源打包

RN 为 Android/iOS 提供统一的 `Image` 组件和资源打包方式。图片来源可以是随应用打包的静态资源、已有原生工程资源、网络 URL 或 data URI。它们的 `source` 写法与可用元数据不同。

## 静态图片与屏幕密度

把图片放在 JS/TS 源码目录附近，用 `require` 引入。Metro 在打包时解析图片，所以 `require` 的路径必须是静态可分析的字面量，不能运行时拼路径。组件附近管理资源可避免全局命名冲突；未被使用的图片不会打进包。

```text
src/
  CheckIcon.tsx
  img/
    check.png
    check@2x.png
    check@3x.png
```

```tsx
<Image source={require('./img/check.png')} />
```

`@2x`、`@3x` 文件提供高像素密度设备版本，Metro 会按设备密度选择最合适的文件；缺少精确倍率时选最接近的资源。若需要状态切换，建立静态映射表，而不是把变量拼进 `require`：

```tsx
const icons = {
  active: require('./img/check-active.png'),
  inactive: require('./img/check-inactive.png'),
};

<Image source={isActive ? icons.active : icons.inactive} />
```

静态资源的宽高可由打包元数据获得。若用 flex 动态调整已经有打包尺寸的图片，可能需要在 style 中把宽高设为 `undefined` 让 flex 布局决定尺寸。

### iOS Asset Catalog

默认情况下，iOS bundle 会放入静态图及各密度文件。想让 Xcode 将资源编译到 Asset Catalog，可在 `Info.plist` 打开 `RCTUseAssetCatalog`；JS 的 `require` 写法不变，配置后需做 clean build。

```xml
<key>RCTUseAssetCatalog</key>
<true/>
```

### 其他静态资源

相同的静态 `require` 机制可打包常见音频、视频、文档等资源。新扩展名需要配置 Metro `assetExts`。源页指出非图片资源目前不一定带有可自动布局的尺寸信息；视频使用 flexGrow 时可能没有正确尺寸，页面建议使用绝对尺寸/定位。若资源由原生 Xcode/Android 工程管理，需按平台资源方式处理。

## 原生工程已有的图片

混合应用可引用原生工程中已有资源。Xcode Asset Catalog 或 Android drawable 资源通过名字（不含扩展名）设置 URI；Android `assets` 文件夹用 `asset:/` scheme。此方式不会自动检查资源是否存在，且要手工设置宽高。

```tsx
// Xcode asset catalog 或 Android res/drawable 中叫 app_icon 的资源
<Image source={{ uri: 'app_icon' }} style={{ width: 40, height: 40 }} />

// Android assets/app_icon.png
<Image source={{ uri: 'asset:/app_icon.png' }} style={{ width: 40, height: 40 }} />
```

Android drawable XML（如矢量图）也能静态打包：

```tsx
<Image source={require('./img/my_icon.xml')} style={{ width: 40, height: 40 }} />
```

静态放在 JS 目录的 XML drawable 可 `require`/`import`；`res/drawable` 中的资源名要以 URI 使用。Android AAPT 在应用编译时打包 Binary XML，Metro 无法在运行时从网络读出它，因此改动原生 drawable 的名字或目录需重新构建 Android App。若 drawable 引用其他资源/主题属性，应作为原生资源按名称使用，不要假定它是独立位图。

iOS 相册若同一图片有多种尺寸，RN 会自动优先挑接近显示尺寸的文件，减少内存占用和缩放模糊。

## 网络图片和请求属性

网络图片通常在编译时未知，需要手工指定 `width`/`height` 或可计算的宽高比例。官方建议使用 HTTPS；iOS App Transport Security 会限制不安全 HTTP。先给出布局尺寸，图片加载完成后界面不会从 0x0 突然跳到实际大小。

```tsx
<Image
  source={{ uri: 'https://example.com/banner.jpg' }}
  style={{ width: 320, height: 180 }}
  resizeMode="cover"
/>
```

如果图片接口需要方法、Headers 或 Body，可以将它们放进 `source` 对象：

```tsx
<Image
  source={{
    uri: 'https://example.com/private-image',
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ variant: 'thumbnail' }),
  }}
  style={{ width: 160, height: 160 }}
/>
```

这里展示 API 字段形状；不要把真实令牌硬编码到代码或日志里。复杂鉴权、失败重试和下载状态可能更适合先请求图片数据，再用明确的资源缓存方案处理。

## Base64 data URI

REST 响应若直接返回图片编码数据，可通过 `data:` URI 显示；同样要提供尺寸。官方仅建议把它用于很小、经常变化的图片，例如数据库里存的列表图标，不适合作为大图传输方式。

```tsx
const imageDataUri = `data:image/png;base64,${base64Png}`;

<Image
  source={{ uri: imageDataUri }}
  style={{ width: 48, height: 48 }}
  resizeMode="contain"
/>
```

## 图片缓存策略

`source.cache` 控制网络图片如何使用本机缓存：

| 策略 | 行为 |
|---|---|
| `default` | 使用平台默认缓存行为 |
| `reload` | 从源 URL 重新取数据，不以已有缓存满足请求 |
| `force-cache` | 有缓存就直接使用（不论过期与否），没有才请求源站 |
| `only-if-cached` | 只读缓存；没有缓存时请求失败，不访问源站 |

```tsx
<Image
  source={{ uri: cachedUri, cache: 'only-if-cached' }}
  style={{ width: 120, height: 120 }}
/>
```

## 图像作为背景与圆角

Web 中常见的 CSS background image 在 RN 可用 `ImageBackground` 实现，并在里面嵌套文字等组件。源页提醒它是简单封装；复杂遮罩或层叠效果可以自己组合 `Image` 与内容视图。需要给背景组件设置宽、高或 flex 尺寸。

```tsx
<ImageBackground
  source={require('./img/cover.png')}
  style={{ width: '100%', height: 220 }}
  resizeMode="cover"
>
  <Text>封面标题</Text>
</ImageBackground>
```

部分按角设置的边框圆角属性在 iOS 图片组件上可能被忽略，应在目标平台真机确认。图片解码在 RN 中放到另一个线程处理；网络尚未下载或正在解码时可显示占位视图。

## 原生 iOS 图片缓存上限

官方页面列出在 iOS AppDelegate 中调用的 Objective-C API，可设置单张图片尺寸限制与图片缓存总成本限制。示例中的数值分别是 4 MB 和 200 MB；应用应依据设备内存和图片使用情况决定，不要直接把示例容量当通用配置。

```objc
RCTSetImageCacheLimits(4 * 1024 * 1024, 200 * 1024 * 1024);
```

**翻页：** [上一页：026 Layout with Flexbox](026-LayoutWithFlexbox.md) · [目录](README.md) · [下一页：028 Color Reference](028-ColorReference.md)
