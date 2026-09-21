# 224｜@shopify/react-native-skia 二维图形

**翻页：**[上一页：FlashList 高性能列表](./223-Expo-ThirdParty-FlashList.md) · [目录](./README.md) · [下一页：@stripe/stripe-react-native Stripe 支付](./225-Expo-ThirdParty-Stripe.md)

**官方页面：**[React Native Skia · Latest](https://docs.expo.dev/versions/latest/sdk/skia/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/skia/) · [Skia 官方文档](https://shopify.github.io/react-native-skia/)

**版本与平台：**Expo Latest 与 SDK v56 reference 均推荐 `@shopify/react-native-skia 2.6.2`。支持 Android、iOS、tvOS、Web，并包含在 Expo Go 中。

## Skia 是什么

`@shopify/react-native-skia` 把 Skia 图形库带到 React Native，供应用绘制高性能图形。Expo 文档列举 Skia 作为 Google Chrome / Chrome OS、Android、Flutter、Firefox 等产品使用的图形引擎。

安装：

```sh
npx expo install @shopify/react-native-skia
yarn expo install @shopify/react-native-skia
pnpm expo install @shopify/react-native-skia
bun expo install @shopify/react-native-skia
```

已有的纯 React Native 工程需先安装 Expo，并依照[库 README](https://shopify.github.io/react-native-skia/)进行原生配置。

### Web 支持

Skia Web 版本还需要按官方[Web 安装指南](https://shopify.github.io/react-native-skia/docs/getting-started/web)加载 CanvasKit。CanvasKit 是 Skia 面向 Web 的运行时实现，需由网页构建 / 资源配置提供。

## 新手名词解释

- **Skia：**跨平台 2D 图形引擎，可绘制路径、文本、图片与自定义画面。
- **CanvasKit：**Skia 的 Web/WebAssembly 构建，Web 端运行 Skia 所需加载的资源。
- **Expo Go 内置：**Skia 已编译进 Expo Go，可以在兼容用法范围内直接预览。

## 源页代码主题覆盖

- Installation：保留 npx、Yarn、pnpm、Bun 四种安装命令。
- Web：保留需要配置 CanvasKit 并链接安装指南的说明。
- Expo reference 页没有图形 API 代码示例；完整 API 指向 Skia 官方文档。
- Latest 与 SDK v56 的推荐版本、平台和 Next 顺序一致，版本均为 `2.6.2`。

**翻页：**[上一页：FlashList 高性能列表](./223-Expo-ThirdParty-FlashList.md) · [目录](./README.md) · [下一页：@stripe/stripe-react-native Stripe 支付](./225-Expo-ThirdParty-Stripe.md)
