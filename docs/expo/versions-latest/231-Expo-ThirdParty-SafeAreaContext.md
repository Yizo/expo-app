# 231｜react-native-safe-area-context 安全区域

**翻页：**[上一页：react-native-reanimated 动画库](./230-Expo-ThirdParty-Reanimated.md) · [目录](./README.md) · [下一页：react-native-screens 原生屏幕](./232-Expo-ThirdParty-Screens.md)

**官方页面：**[Safe Area Context · Latest](https://docs.expo.dev/versions/latest/sdk/safe-area-context/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/safe-area-context/) · [库的完整官方文档](https://appandflow.github.io/react-native-safe-area-context/)

**版本与平台：**Latest 与 SDK v56 页面均推荐 `react-native-safe-area-context ~5.7.0`。支持 Android、iOS、tvOS、Web，并包含在 Expo Go 中。

## 安全区域是什么

安全区域（safe area）指系统界面可能遮住内容的屏幕边缘，例如刘海、状态栏和底部 Home Indicator。`react-native-safe-area-context` 读取这些边缘的 inset（内缩距离），帮助应用把文字和控件放到系统 UI 之外。

`SafeAreaView` 会自动把 inset 加到 padding；需要根据距离做自定义布局时可以用 `useSafeAreaInsets()` 读取四个方向的数据。

安装：

```sh
npx expo install react-native-safe-area-context
yarn expo install react-native-safe-area-context
pnpm expo install react-native-safe-area-context
bun expo install react-native-safe-area-context
```

## `SafeAreaView` 组件

这个组件相当于带安全区 padding 的普通 `View`。自己传入的 padding 会和系统 inset padding 叠加，而非覆盖。Web 项目必须先设置 `SafeAreaProvider`。

```tsx
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';

function SomeComponent() {
  return (
    <SafeAreaView>
      <View />
    </SafeAreaView>
  );
}
```

### `SafeAreaView` 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `edges` | `Edge[]` | `['top', 'right', 'bottom', 'left']` | 指定哪些边缘使用安全区域 inset。 |
| `emulateUnlessSupported` | `boolean` | `true` | iOS 10+ 缺少原生 safe area API 时，模拟状态栏和 Home Indicator 尺寸。 |

## 通过 Hook / Context 读取 inset

### `useSafeAreaInsets()`

Hook 返回 `EdgeInsets`，可用于内边距或位置计算。官方提醒：设备旋转时直接用 Hook 可能比原生 `SafeAreaView` 性能差。

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function HookComponent() {
  const insets = useSafeAreaInsets();
  return <View style={{ paddingTop: insets.top }} />;
}
```

### 添加 `SafeAreaProvider`

应用根组件必须包一层 `SafeAreaProvider`，随后子组件才能使用 Hook 或 `SafeAreaInsetsContext`。使用原生屏幕或 Modal 时，有时也要在 Modal / route 根部再提供一层：

```tsx
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App() {
  return <SafeAreaProvider>{/* 应用内容 */}</SafeAreaProvider>;
}
```

不使用 Hook 时，可以通过 Context Consumer 读取 inset：

```tsx
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

function Component() {
  return (
    <SafeAreaInsetsContext.Consumer>
      {insets => <View style={{ paddingTop: insets.top }} />}
    </SafeAreaInsetsContext.Consumer>
  );
}
```

### 首屏优化

优先使用原生实现的 `SafeAreaView`，设备旋转时不必等待异步 bridge 更新 inset。也可以给首次 Provider 注入 `initialWindowMetrics`，减少首帧等待；若 Provider 会重新挂载，或正在使用 `react-native-navigation`，不要使用 `initialWindowMetrics`。

```tsx
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';

function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      {/* 应用内容 */}
    </SafeAreaProvider>
  );
}
```

## Web SSR 与 CSS 迁移

Web 端做服务端渲染（SSR）时，可以通过 `initialSafeAreaInsets` 注入设备对应的 inset，也可以传 0。若等待客户端异步测量，服务器渲染期间页面内容可能无法正确计算位置。

Web-only 项目过去可用 CSS 环境变量计算 safe-area inset。跨 Web / Native 共享界面时，可以改用 `useSafeAreaInsets()`：

### Before：CSS 环境变量

```css
div {
  padding-top: env(safe-area-inset-top);
  padding-left: env(safe-area-inset-left);
  padding-bottom: env(safe-area-inset-bottom);
  padding-right: env(safe-area-inset-right);
}
```

### After：跨平台 Hook

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function App() {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingBottom: insets.bottom,
        paddingRight: insets.right,
      }}
    />
  );
}
```

## 类型

| 类型 | 含义 |
| --- | --- |
| `Edge` | `'top'`、`'right'`、`'bottom'`、`'left'`。 |
| `EdgeInsets` | Hook 返回对象，含 `top`、`right`、`bottom`、`left` 四个数字 inset。 |

## 新手名词解释

- **Safe area inset：**系统界面遮挡范围到屏幕边界的距离值；在不同设备、方向和状态栏状态下可能变化。
- **`SafeAreaProvider`：**测量设备安全区并把结果放进 React Context 的根容器。
- **Context / Consumer：**React 跨组件传递数据的机制；Provider 提供当前 inset，Consumer 或 Hook 读取它。
- **Bridge：**React Native JavaScript 与原生平台代码通信的层；Hook 拿到原生测量值时可能经过异步更新。
- **SSR：**Server-side rendering，先在服务器生成 Web 页面；需要预先提供 inset，才能避免初始渲染等待设备测量。

## 源页代码主题覆盖

- Installation：保留 npx、Yarn、pnpm、Bun 安装命令。
- API：覆盖完整导入、SafeAreaView 示例与 `edges` / `emulateUnlessSupported` 属性。
- Hooks / Context / Optimization：保留 useInsets、Provider、Consumer、initialWindowMetrics 示例。
- Web SSR / CSS：覆盖 SSR inset 说明、CSS before 片段和 Hook after 示例。
- Types：列出 `Edge` 与 `EdgeInsets`。
- Latest 与 SDK v56 的主要说明、代码与 Next 顺序一致。

**翻页：**[上一页：react-native-reanimated 动画库](./230-Expo-ThirdParty-Reanimated.md) · [目录](./README.md) · [下一页：react-native-screens 原生屏幕](./232-Expo-ThirdParty-Screens.md)
