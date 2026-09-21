# 008｜Expo Router Experimental Stack

**翻页：**[上一页：Expo Router Color](./007-Expo-Router-Color.md) · [目录](./README.md) · [下一页：Expo Router Link API](./009-Expo-Router-Link.md)

**官方页面：**[Expo Router Experimental Stack](https://docs.expo.dev/versions/latest/sdk/router/experimental-stack/)

**版本 / 稳定性说明：**Latest 页面给出的 Expo Router 推荐版本是 `~57.0.20`，并标示 `ExperimentalStack` 为 Alpha；它是 SDK 56+ 能用来测试的能力（SDK v56 Router reference 也列出该 API），但生产 API / 支持选项可能变化。

## ExperimentalStack 与普通 Stack

`ExperimentalStack` 是普通 Expo Router `Stack` 的 opt-in sibling，底层采用 `react-native-screens/experimental`。可以逐个 layout 把 `<Stack />` 换成 `<ExperimentalStack />`；不过 Android 上同一个 app 不能同时混用这两种 native stack。Web 会回退到普通 `Stack`。

```tsx
import { ExperimentalStack as Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="details" options={{ title: 'Details' }} />
    </Stack>
  );
}
```

当前只支持有限 screen options：`title`、`headerShown`、`headerTransparent`、`headerBackVisible`。其它选项可能在开发环境警告且不生效。

## Android 预测返回手势

Experimental Stack 支持 Android predictive back，但 app config 里仍需打开设置：

```json
{
  "expo": {
    "android": { "predictiveBackGestureEnabled": true }
  }
}
```

修改 app config 是 native build-time 变更，需要重新 Prebuild / 构建 Development Build。

## Back button API

`ExperimentalStack.Screen.BackButton` 可以为特定 Screen 设置 back button 显示文本 / display mode，也可在 Screen 内直接隐藏按钮。过时的 `ExperimentalStack.Screen.Title` API 应按 reference 的 deprecation 提示替换为新的 Stack title 用法。

```tsx
import { Stack } from 'expo-router';

export default function DetailsLayout() {
  return (
    <Stack>
      <Stack.Screen name="details">
        <Stack.Screen.BackButton displayMode="minimal">Back</Stack.Screen.BackButton>
      </Stack.Screen>
    </Stack>
  );
}
```

## 目前的限制

- `presentation: 'modal'` / `transparentModal`、`formSheet` 等 sheet / detent 能力未实现；所有 screens 以 push 方式堆栈。
- 暂无自定义 header、header tint / style；不能设置自定义 header component。
- per-screen animation 和 status bar options 尚不生效。
- Android 原生端不可与标准 `Stack` 混用。
- API 标记 Alpha，适合试用和反馈，不能默认作生产稳定承诺。

## 关键名词

- **Experimental / Alpha**：正在开发的 API，命名、能力和行为可在正式稳定前改变。
- **Stack**：通过堆栈维护页面顺序的导航方式。
- **Predictive back gesture**：Android 新返回手势在用户完成返回前预览将返回到的页面。
- **Presentation mode**：screen 如何叠在当前视图上，例如 push、modal 或 sheet。

## 官方代码主题覆盖

源页示例用途全部有改写示例：ExperimentalStack root layout、Stack.Screen 标题、`screenOptions`、Android `predictiveBackGestureEnabled`、嵌入 / 隐藏 `Screen.BackButton`。有限 option surface、平台回退行为和 Alpha 限制均已逐项说明。

## 下一页

页脚 **Next** 指向 [Expo Router Link](https://docs.expo.dev/versions/latest/sdk/router/link/)，介绍页面链接、预览与导航行为。

**翻页：**[上一页：Expo Router Color](./007-Expo-Router-Color.md) · [返回目录](./README.md) · [下一页：Expo Router Link API](./009-Expo-Router-Link.md)
