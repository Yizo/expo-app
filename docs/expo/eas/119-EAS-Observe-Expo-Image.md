# 119｜Expo Image 性能 Integration

**翻页：**[上一页：React Navigation EAS Observe Integration](./118-EAS-Observe-React-Navigation.md) · [目录](./README.md) · [下一页：为第三方 Package 集成 EAS Observe](./120-EAS-Observe-Third-Party-Integration.md)

**官方页面：**[Expo Image integration](https://docs.expo.dev/eas/observe/integrations/expo-image/)

**版本边界：**该 integration 要 Expo SDK 57+ 与 `expo-image` 57.0.2+，应用已启用 EAS Observe。本地项目 SDK 56 不满足版本门槛，因此这里的代码只展示将来升级到受支持版本后的配置方法，不能当成本地 App 可启用的能力。

## 发现加载过大的图片

Integration 会监控经 `expo-image` 加载的图片，并对比解码后的像素面积与设备屏幕物理像素面积。默认情况下，超过阈值的图片会发出 `expo-image.oversized` warning event，便于从生产用户设备中查出下载 / 内存浪费。未安装 `expo-observe` 时它静默不启用；使用其他 image 库的图片也不会报告。

配置必须在模块 scope、App mount 之前完成：

```ts
import { Observe } from 'expo-observe';

Observe.configure({
  integrations: { 'expo-image': true },
});
```

不需再对每个 Image 加 instrumentation；开启之后自动观察 expo-image 图像加载。

## 各平台解码尺寸差异

对于 `expo-image` 的 `<Image>` 组件，原图解码像素可能因平台实现而不同：

- **Android：**通常会在 decode 时按组件大小 downscale，因此大源图显示在小容器里，通常不会报告超大图。
- **iOS：**integration 在 expo-image 再次 downscale 前看原始解码大小；即使开启 `allowDownscaling`，大源图显示在小组件中也仍可能报告。
- **`useImage` / `Image.loadAsync`：**默认两平台均以源图完整尺寸解码。通过 load options 的 `maxWidth` / `maxHeight` 限制解码尺寸，会让报告行为更一致。

SDK 57+ 的 load options 形态示例：

```ts
const image = useImage(imageUrl, {
  maxWidth: 480,
  maxHeight: 320,
});
```

这里的尺寸是解码限制，遵循原图纵横比例；具体 API 类型应对照目标 `expo-image` 版本。

## Event Attributes 与去重

当前文档提供的 `expo-image.oversized` event 带下列属性：

| Attribute | 内容 |
| --- | --- |
| `url` | 清理后的图片地址。 |
| `urlSanitized` | 是否删掉了 URL 部分内容。 |
| `imageWidth` / `imageHeight` | 图片实际解码像素尺寸。 |
| `screenWidth` / `screenHeight` | 设备屏幕尺寸，单位 point。 |
| `pixelRatio` | 把 points 转为屏幕物理像素的设备倍率。 |

同一图片 URL 在一个 App session 里最多上报一次；按 sanitized URL 去重，因此仅 query 参数不同的轮换签名 URL 默认会合并到一条记录。

## URL 隐私与开关

该 event 离开设备上传，Integration 默认删除 URL query string 与 fragment，因为它们常带 signing token / API key；用户名密码始终移除。仅上报 `http`、`https`、`file`、`android.resource` scheme；像 `data:` 会包含图片 payload，`ph:` 可能包含稳定个人照片标识，因此永不出设备。

`urlSanitized` 表示 URL 有内容被移除；URL 格式本身归一化不视为 sanitize。

如要让 event 含 query / fragment，可在配置中打开 `includeUrlParams`；Basic Auth credentials 无论如何都移除：

```ts
Observe.configure({
  integrations: {
    'expo-image': {
      includeUrlParams: true,
    },
  },
});
```

由于 query 常包含签名 token 与 API key，仅在明确没有敏感参数时才应开启。SDK 56 本地项目不支持此 Expo Image integration，但这一隐私边界同样适用于其他自行埋点的图片事件。

## Oversize Threshold 配置

可以把 Integration 从 `true` 改为一个配置对象：

```ts
Observe.configure({
  integrations: {
    'expo-image': {
      oversizeThreshold: 2,
    },
  },
});
```

阈值是“解码图片像素面积 / 屏幕物理像素面积”的比率。默认值 1.5 给全屏图片额外留约 50% 空间；值为 2 表示面积需超过屏幕像素的两倍才报告。数值越大，检测越宽松。

## 修复找到的 Oversized Images

1. 从图片 CDN 请求接近实际展示尺寸的 resized variant，避免把超大原图发送给小卡片 / 缩略图。
2. 若用 `useImage` hook 或 `Image.loadAsync`，设置 `maxWidth` / `maxHeight` 在解码时缩小，同时维持 aspect ratio。
3. 调整后在 Observe > Events 里查看后续是否仍出现该资源的 oversized 事件。

在 Dashboard 的 Observe > Events 选择 `expo-image.oversized` 可以看单条 image report、attribute 与 session。CLI：

```sh
eas observe:events expo-image.oversized
```

## 关键名词

- **Decoded size：**图片解码到内存后的像素宽 / 高；过大图片消耗额外内存与处理时间。
- **Screen physical pixels：**屏幕 point 尺寸乘 `pixelRatio` 得到的物理像素范围。
- **Oversize threshold：**解码面积超出屏幕物理像素面积多少倍才记为事件。
- **URL sanitization：**上传前删除 query、fragment 等 URL 部分，避免泄露 token / key。
- **Downscale at decode time：**解码阶段限制目标宽高，避免先将整张大图展开到内存再缩小。

## 官方代码主题覆盖

源页代码主题全部覆盖：SDK57+ 的 `Observe.configure({ integrations: { 'expo-image': true } })`；threshold 配置对象与默认值解释；`includeUrlParams` URL 隐私选项；`useImage` / `Image.loadAsync` 的 maxWidth / maxHeight 优化概念；`eas observe:events expo-image.oversized` 查询命令；平台解码行为、event attributes 与 URL sanitize 规则。所有 Expo Image 集成代码标为 SDK57+，本地 SDK 56 不可用。

## 下一页

官方页脚 **Next** 是 [Integrate a third-party package with EAS Observe](https://docs.expo.dev/eas/observe/integrations/third-party/)，指导库作者以 optional peer dependency 添加自己的 Observe integration。

**翻页：**[上一页：React Navigation EAS Observe Integration](./118-EAS-Observe-React-Navigation.md) · [返回目录](./README.md) · [下一页：为第三方 Package 集成 EAS Observe](./120-EAS-Observe-Third-Party-Integration.md)
