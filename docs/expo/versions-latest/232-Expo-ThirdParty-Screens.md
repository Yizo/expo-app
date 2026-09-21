# 232｜react-native-screens 原生屏幕

**翻页：**[上一页：Safe Area Context 安全区域](./231-Expo-ThirdParty-SafeAreaContext.md) · [目录](./README.md) · [下一页：react-native-svg 矢量图形](./233-Expo-ThirdParty-SVG.md)

**官方页面：**[React Native Screens · Latest](https://docs.expo.dev/versions/latest/sdk/screens/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/screens/) · [库的完整官方文档](https://docs.swmansion.com/react-native-screens/)

**版本与平台：**Latest 与 SDK v56 reference 均推荐 `react-native-screens ~4.26.0`。页面列出 Android、iOS、tvOS、Web，并包含在 Expo Go 中。

## 用原生屏幕实现导航页面

`react-native-screens` 提供原生 screen primitives，代替单纯由 React Native `<View>` 表示屏幕的方案，从而更好利用 Android / iOS 对屏幕和导航的系统优化。它也是 React Navigation `createNativeStackNavigator` 等导航 API 背后的基础库；大多数应用开发者会经由导航库间接使用它，而不是直接操作其内部组件。

安装：

```sh
npx expo install react-native-screens
yarn expo install react-native-screens
pnpm expo install react-native-screens
bun expo install react-native-screens
```

已有的纯 React Native 工程还需要先安装 Expo，再遵循[库的 README](https://docs.swmansion.com/react-native-screens/)中的原生安装步骤。

## 新手名词解释

- **Screen primitive（原生屏幕基元）：**以 Android / iOS 原生屏幕组件实现导航页面的基础能力，能让操作系统对不可见页面进行资源与转场优化。
- **`View` 与 Screen：**普通 `View` 是 React Native 布局容器；原生 Screen 专门代表一个导航屏幕，两者角色不同。
- **`createNativeStackNavigator`：**React Navigation 的原生堆栈导航器，利用 `react-native-screens` 实现栈式页面。
- **Expo Go 内置：**该原生库已编译进 Expo Go，并被导航库广泛依赖。

## 源页代码主题覆盖

- Installation：保留 npx、Yarn、pnpm、Bun 四种安装命令。
- Expo reference 页没有示例代码，只介绍屏幕原生优化作用，并链接到 `react-native-screens` 完整文档。
- Latest 与 SDK v56 推荐版本均为 `~4.26.0`，平台和 Next 顺序一致。

**翻页：**[上一页：Safe Area Context 安全区域](./231-Expo-ThirdParty-SafeAreaContext.md) · [目录](./README.md) · [下一页：react-native-svg 矢量图形](./233-Expo-ThirdParty-SVG.md)
