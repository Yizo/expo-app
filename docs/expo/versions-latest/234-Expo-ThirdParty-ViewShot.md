# 234｜react-native-view-shot 截图

**翻页：**[上一页：react-native-svg 矢量图形](./233-Expo-ThirdParty-SVG.md) · [目录](./README.md) · [下一页：react-native-webview 内嵌网页](./235-Expo-ThirdParty-WebView.md)

**官方页面：**[View Shot · Latest](https://docs.expo.dev/versions/latest/sdk/captureRef/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/captureRef/) · [库的完整官方文档](https://github.com/gre/react-native-view-shot)

**版本与平台：**Latest 与 SDK v56 reference 均推荐 `react-native-view-shot 5.1.0`。支持 Android、iOS，并包含在 Expo Go 中。

## 把 React Native View 保存成图片

`react-native-view-shot` 可捕获某个 React Native 视图的像素，作为图片输出。示例用途之一是保存用户在签名板画下的内容。若目标是 `GLView`，Expo 文档建议直接使用 [GLView.takeSnapshotAsync](https://docs.expo.dev/versions/latest/sdk/gl-view/)。

安装：

```sh
npx expo install react-native-view-shot
yarn expo install react-native-view-shot
pnpm expo install react-native-view-shot
bun expo install react-native-view-shot
```

已有纯 React Native 工程还需要先安装 Expo，并参考[库 README](https://github.com/gre/react-native-view-shot)完成安装。

## 屏幕密度与物理像素

布局通常使用逻辑像素（React Native 的 density-independent units），PNG 图片却以物理像素计量。设备的 `PixelRatio.get()` 是物理像素与逻辑像素的比例。要输出 1080×1080 的图片，视图捕获区域的布局宽高应设为 `1080 / pixelRatio` 个逻辑单位：

```tsx
import { PixelRatio } from 'react-native';
import { captureRef } from 'react-native-view-shot';

const targetPixelCount = 1080; // 目标输出图片边长（物理像素）
const pixelRatio = PixelRatio.get();
// 逻辑像素 × pixelRatio = 目标物理像素。
const pixels = targetPixelCount / pixelRatio;

// this.imageContainer 应是需要截取的视图 ref。
const result = await captureRef(this.imageContainer, {
  result: 'tmpfile',
  height: pixels,
  width: pixels,
  quality: 1,
  format: 'png',
});
```

`captureRef` 返回生成图片的 URI；`result: 'tmpfile'` 表示写到临时文件。上例的 `this.imageContainer` 来自所属组件中绑定的视图引用。

## 新手名词解释

- **capture / screenshot：**把当前视图渲染结果复制成静态图像，不会对页面触发点击或截取系统屏幕区域。
- **逻辑像素（dp / points）：**布局使用的跨设备逻辑尺寸；iOS points 与 Android dp 都不是最终图片像素数。
- **物理像素：**图片文件真实保存的像素尺寸。高密度设备上 1 个逻辑单位可能对应多个物理像素。
- **`PixelRatio`：**React Native 提供的设备像素比例。输出固定大小图片时，可用目标物理像素除以 ratio，转换成 capture 尺寸。
- **GLView：**使用 OpenGL 渲染的图形视图；其截图应使用 GLView 自带的 snapshot API。

## 源页代码主题覆盖

- Installation：保留 npx、Yarn、pnpm、Bun 安装命令。
- Note on pixel values：保留完整 PixelRatio / FullHD 尺寸换算 / captureRef 参数示例，并补全库与 RN API 导入。
- Learn more：保留签名板用例，以及 GLView 使用 `takeSnapshotAsync` 的提示。
- Latest 与 SDK v56 的平台、版本、说明和 Next 顺序一致。

**翻页：**[上一页：react-native-svg 矢量图形](./233-Expo-ThirdParty-SVG.md) · [目录](./README.md) · [下一页：react-native-webview 内嵌网页](./235-Expo-ThirdParty-WebView.md)
