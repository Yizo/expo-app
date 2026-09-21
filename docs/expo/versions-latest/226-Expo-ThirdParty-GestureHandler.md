# 226｜react-native-gesture-handler 手势处理

**翻页：**[上一页：Stripe React Native 支付](./225-Expo-ThirdParty-Stripe.md) · [目录](./README.md) · [下一页：react-native-keyboard-controller 键盘控制](./227-Expo-ThirdParty-KeyboardController.md)

**官方页面：**[Gesture Handler · Latest](https://docs.expo.dev/versions/latest/sdk/gesture-handler/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/gesture-handler/) · [React Native Gesture Handler 官方文档](https://docs.swmansion.com/react-native-gesture-handler/)

**版本与平台：**Latest 推荐 `react-native-gesture-handler ~2.32.0`，SDK v56.0.0 推荐 `~2.31.1`。支持 Android、iOS、Web，并包含在 Expo Go 中。

## 处理复杂触摸手势

`react-native-gesture-handler` 提供复杂手势识别 API，例如拖动、滑动、长按等。与只依赖 JavaScript touch callbacks 的实现不同，官方介绍说明它调用移动平台原生的触摸与手势能力，让手势识别逻辑运行在原生线程，从而减少 JS 主线程负载并获得更稳定的响应。

安装当前 Expo SDK 兼容的版本：

```sh
npx expo install react-native-gesture-handler
yarn expo install react-native-gesture-handler
pnpm expo install react-native-gesture-handler
bun expo install react-native-gesture-handler
```

已有纯 React Native 项目还需先安装 Expo，并按[官方安装说明](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation/)完成原生配置。

## 新手名词解释

- **Gesture（手势）：**用户在屏幕上的一系列触摸动作，例如点击、滑动、拖动、捏合。
- **原生线程（Native thread）：**由 Android / iOS 系统执行 UI 和交互代码的线程；识别手势时不需要每一帧都等待 JavaScript 线程响应。
- **Deterministic（稳定可预测）：**手势状态更新更贴近原生触摸事件时间线，减少 JS 忙碌时产生的掉帧或迟滞。
- **Expo Go 内置：**此库已经预编译进 Expo Go，可用于快速试用；其它原生依赖仍需按项目配置决定是否需要 development build。

## 源页代码主题覆盖

- Installation：保留 npx、Yarn、pnpm、Bun 四种安装命令。
- 官方 Expo reference 页没有手势处理示例代码；功能介绍链接到 Gesture Handler 的完整文档。
- Latest 与 SDK v56 平台支持及 Next 一致；推荐版本分别为 `~2.32.0` / `~2.31.1`。

**翻页：**[上一页：Stripe React Native 支付](./225-Expo-ThirdParty-Stripe.md) · [目录](./README.md) · [下一页：react-native-keyboard-controller 键盘控制](./227-Expo-ThirdParty-KeyboardController.md)
