# 223｜@shopify/flash-list 高性能列表

**翻页：**[上一页：Segmented Control 分段控制器](./222-Expo-ThirdParty-SegmentedControl.md) · [目录](./README.md) · [下一页：@shopify/react-native-skia 二维图形](./224-Expo-ThirdParty-Skia.md)

**官方页面：**[FlashList · Latest](https://docs.expo.dev/versions/latest/sdk/flash-list/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/flash-list/) · [库的完整官方文档](https://shopify.github.io/flash-list/)

**版本与平台：**Latest 与 SDK v56 reference 均推荐 `@shopify/flash-list 2.0.2`。支持 Android、iOS、tvOS、Web，并包含在 Expo Go 中。

## FlashList 是什么

FlashList 是 Shopify 提供的高性能 React Native 列表组件，可作为 React Native `FlatList` 的替代品。文档说明它会回收复用列表组件（component recycling），减少快速滚动长列表时反复创建 / 销毁视图的成本。属性和迁移细节请查阅 [FlashList 官方文档](https://shopify.github.io/flash-list/)。

安装与当前 Expo SDK 兼容的版本：

```sh
npx expo install @shopify/flash-list
yarn expo install @shopify/flash-list
pnpm expo install @shopify/flash-list
bun expo install @shopify/flash-list
```

已有的纯 React Native 工程还要先安装 Expo，并按 [FlashList 安装文档](https://shopify.github.io/flash-list/)配置项目。

## 新手名词解释

- **列表虚拟化（Virtualized list）：**只渲染靠近可视区域的列表项，避免一次创建成百上千个原生视图。
- **组件回收（Recycling）：**列表项滚出屏幕后复用其视图实例来显示之后的数据，进一步减少创建成本。
- **`FlatList`：**React Native 内置虚拟化列表。FlashList 的常见用途是作为它的替代品，具体 API 差异应参照 FlashList 官方文档。
- **Expo Go 内置：**此库已包含在 Expo Go 中，当前项目可直接快速试用。

## 源页代码主题覆盖

- Installation：保留 npx、Yarn、pnpm、Bun 四种安装命令。
- Expo reference 页没有列表组件代码示例；覆盖了它作为 FlatList 替代方案、组件回收、支持平台和 Expo Go 状态。
- Latest 与 SDK v56 的推荐版本、功能说明和 Next 顺序一致。

**翻页：**[上一页：Segmented Control 分段控制器](./222-Expo-ThirdParty-SegmentedControl.md) · [目录](./README.md) · [下一页：@shopify/react-native-skia 二维图形](./224-Expo-ThirdParty-Skia.md)
