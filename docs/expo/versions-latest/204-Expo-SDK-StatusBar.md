# 204｜Expo SDK StatusBar 状态栏

**翻页：**[上一页：Expo SDK SQLite 本地数据库](./203-Expo-SDK-SQLite.md) · [目录](./README.md) · [下一页：Expo SDK StoreReview 应用评分](./205-Expo-SDK-StoreReview.md)

**官方页面：**[StatusBar · Latest](https://docs.expo.dev/versions/latest/sdk/status-bar/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/status-bar/)

**版本与平台：**Latest 推荐 `expo-status-bar ~57.0.1`，SDK v56.0.0 推荐 `~56.0.4`。组件支持 Android、iOS、tvOS、Web；tvOS 没有可见的系统状态栏，Web 也没有控制操作系统状态栏的接口，因此这两端调用不会产生可见效果。

## 状态栏是什么

状态栏是手机屏幕顶部显示时间、网络和电量等系统信息的区域。`expo-status-bar` 提供 React 组件和命令式 API，用来控制状态栏文字 / 图标颜色、显示隐藏和切换动画；底层基于 React Native 的 `StatusBar`，但默认值更适合 Expo。

安装与当前 Expo SDK 兼容的包：

```sh
npx expo install expo-status-bar
yarn expo install expo-status-bar
pnpm expo install expo-status-bar
bun expo install expo-status-bar
```

## 声明式用法

在 JSX 中渲染 `<StatusBar />`，用 props 描述期望状态。适合随页面主题或页面切换更新状态栏：

```tsx
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Notice that the status bar has light text!</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
});
```

应用有多个页面时可能同时挂载多个 `StatusBar`。各实例的 props 会按挂载顺序合并，因此导航场景应有意管理各页面状态栏属性的覆盖顺序。

## 配置默认值

可用 `expo-status-bar` config plugin 在应用构建时设置初始状态。Config plugin（配置插件）修改生成的原生项目；更改后需要重新生成并构建原生 App。没有使用 CNG（Expo 连续原生生成）时，需手动修改平台原生工程。

### `app.json`

```json
{
  "expo": {
    "plugins": [
      [
        "expo-status-bar",
        {
          "hidden": false,
          "style": "dark"
        }
      ]
    ]
  }
}
```

| 插件属性 | 默认值 | 说明 |
| --- | --- | --- |
| `hidden` | 未设置 | 初始是否隐藏状态栏，可设 `true` 或 `false`。 |
| `style` | 未设置 | 初始状态栏文字 / 图标样式，可设 `light` 或 `dark`。 |

### 手动修改原生工程

如果不使用 CNG，Android 可在 `android/app/src/main/res/values/styles.xml` 的 `AppTheme` 主题内增加 `expoStatusBarHidden`：

```xml
<style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
  <!-- ... -->
  <item name="expoStatusBarHidden">true</item>
</style>
```

iOS 可在 `ios/<project>/Info.plist` 加入以下键值：

```xml
<key>UIStatusBarHidden</key>
<true/>
```

## API

```ts
import { StatusBar } from 'expo-status-bar';
```

### `<StatusBar />` 属性

| 属性 | 类型 | 默认值 / 平台 | 说明 |
| --- | --- | --- | --- |
| `animated` | `boolean` | 所列平台 | `style` 或 `hidden` 变化时是否播放动画。 |
| `hidden` | `boolean` | 所列平台 | 是否隐藏状态栏。 |
| `hideTransitionAnimation` | `StatusBarAnimation` | iOS，默认 `'fade'` | 改变 `hidden` 时使用的过渡效果。 |
| `style` | `StatusBarStyle` | Android、iOS、tvOS、Web；默认 `'auto'` | 状态栏文字 / 图标的颜色风格。`auto` 根据当前颜色方案选择；深色背景通常配 `'light'`，浅色背景配 `'dark'`。 |

### 组件命令式方法

| 方法 | 参数 | 作用 |
| --- | --- | --- |
| `StatusBar.setHidden(hidden, animation?)` | `hidden: boolean`；动画默认 `'none'` | 显示或隐藏状态栏。 |
| `StatusBar.setStyle(style, animated?)` | `style: StatusBarStyle`；`animated` 是否动画 | 更改状态栏文字 / 图标颜色，可选过渡动画。 |

```ts
StatusBar.setHidden(true, 'slide');
StatusBar.setStyle('dark', true);
```

### 已弃用的方法

以下旧方法已弃用，未来会移除，应迁移到上面的组件方法：

| 旧方法 | 新方法 |
| --- | --- |
| `StatusBar.setStatusBarHidden(hidden, animation?)` | `StatusBar.setHidden(hidden, animation?)` |
| `StatusBar.setStatusBarStyle(style, animated?)` | `StatusBar.setStyle(style, animated?)` |

### 联合类型

| 类型 | 可用值 |
| --- | --- |
| `StatusBarAnimation` | `'none'`、`'fade'`、`'slide'`。 |
| `StatusBarStyle` | `'auto'`、`'inverted'`、`'light'`、`'dark'`。 |

## 新手名词解释

- **声明式（Declarative）：**在 JSX 中描述目标状态，例如 `<StatusBar hidden />`；React 根据属性更新原生状态栏。
- **命令式（Imperative）：**直接调用函数触发变化，例如 `StatusBar.setHidden(true)`。
- **状态栏样式：**`light` / `dark` 指状态栏文字和图标的明暗，不是背景色；应根据后面的页面颜色保证对比度。
- **挂载（Mount）：**React 把组件加入当前界面树。多个状态栏组件存在时，Expo 会按挂载顺序合并它们的 props。
- **CNG / config plugin：**Expo 生成原生项目时运行的插件配置；它设置构建期默认值，运行时主题变化仍可用组件 props 管理。

## 源页代码主题覆盖

- Installation：保留 npx、Yarn、pnpm、Bun 四种安装命令。
- Configuration：保留 `app.json` config plugin、Android `styles.xml` 和 iOS `Info.plist` 配置片段。
- Usage：保留官方完整 React Native 页面组件示例和 `StatusBar` 导入语句。
- API：覆盖 `StatusBarProps` 全部字段、`setHidden()` / `setStyle()` 示例和两个已弃用方法。
- Types：覆盖动画与文字样式两个联合类型及其全部取值。
- Latest 与 SDK v56 页面内容、平台说明和 Next 一致；推荐包版本分别为 `~57.0.1` / `~56.0.4`。

**翻页：**[上一页：Expo SDK SQLite 本地数据库](./203-Expo-SDK-SQLite.md) · [目录](./README.md) · [下一页：Expo SDK StoreReview 应用评分](./205-Expo-SDK-StoreReview.md)
