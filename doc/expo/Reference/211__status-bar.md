# Expo StatusBar 学习指南

> 本文对应 Expo 下一 SDK 版本的文档。原文提示：当前稳定版本为 SDK 56，实际项目应优先查阅对应 SDK 版本的文档。

## 文档解决的问题

`expo-status-bar` 用于控制移动应用顶部的系统状态栏，包括：

- 设置状态栏文字和图标的颜色风格
- 显示或隐藏状态栏
- 为状态变化添加动画
- 配置应用启动时的状态栏初始状态

它提供了与 React Native `StatusBar` 相似的接口，但默认值更适合 Expo 项目。

### 什么是状态栏

状态栏是手机屏幕顶部由操作系统管理的区域，通常显示：

- 时间
- 电量
- 网络和信号状态
- 系统通知图标

`expo-status-bar` 主要控制该区域内文字和图标的显示风格以及整个状态栏是否隐藏，并不等同于普通 React 组件中的导航栏。

## 适用场景

适合在以下场景中使用：

- 深色页面需要将状态栏文字切换为浅色
- 浅色页面需要使用深色状态栏文字
- 全屏图片、视频或沉浸式页面需要隐藏状态栏
- 不同页面需要不同的状态栏样式
- 希望状态栏显示、隐藏或颜色变化时带有动画
- 需要配置应用刚启动时的状态栏状态

支持的平台包括：

- Android
- iOS
- tvOS
- Web
- Expo Go

不过，“支持”并不表示每个平台都有实际视觉效果，具体限制见后文。

## 安装

根据项目使用的包管理器执行对应命令：

```sh
# npm
npx expo install expo-status-bar

# yarn
yarn expo install expo-status-bar

# pnpm
pnpm expo install expo-status-bar

# bun
bun expo install expo-status-bar
```

这里使用的是 `expo install`，它会帮助项目安装与当前 Expo SDK 兼容的依赖版本。

如果是在已有的普通 React Native 原生项目中安装该库，需要先按照 Expo 文档为项目安装 `expo` 和 Expo Modules 基础设施。仅安装 `expo-status-bar` 包并不一定足够。

## 基本用法

```jsx
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Notice that the status bar has light text!
      </Text>

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

示例页面使用黑色背景，因此通过：

```jsx
<StatusBar style="light" />
```

将系统状态栏中的文字和图标设置为浅色，使其在深色背景上保持可读。

需要注意，`style="light"` 设置的是状态栏**文字和图标的风格**，不是将状态栏背景设置为浅色。

## 声明式组件 API

导入组件：

```js
import { StatusBar } from 'expo-status-bar';
```

然后在 JSX 中声明状态栏配置：

```jsx
<StatusBar style="dark" hidden={false} animated />
```

这种方式与 React Web 中通过组件属性描述 UI 状态相似，适合让状态栏配置跟随页面组件的生命周期。

### 多个 `StatusBar` 组件

一个应用中可以同时挂载多个 `StatusBar` 组件。例如，每个页面都可以声明自己的状态栏配置。

多个组件的属性会按照它们的**挂载顺序**合并。

这意味着最终状态并不只取决于组件在源代码中的视觉位置，还取决于组件何时被挂载。页面导航、弹窗或条件渲染都可能改变最终生效的配置。

**基于文档内容推导：** 在多页面应用中，可以让各页面就近管理自己的状态栏，但需要避免在不清楚挂载顺序的情况下，由多个位置重复设置同一属性。

## `StatusBar` 属性

### `style`

```jsx
<StatusBar style="auto" />
```

可选值：

```ts
'auto' | 'inverted' | 'light' | 'dark'
```

默认值为：

```ts
'auto'
```

用于设置状态栏文字和图标的颜色风格。

| 值 | 文档明确说明的含义 |
| --- | --- |
| `light` | 使用浅色状态栏文字和图标 |
| `dark` | 使用深色状态栏文字和图标 |
| `auto` | 根据当前配色方案自动选择；例如应用处于深色模式时使用 `light` |
| `inverted` | 原文仅将其列为合法值，未进一步解释具体选择规则 |

不应仅根据名称推测 `inverted` 在所有平台上的确切表现；需要使用时，应查阅当前 SDK 对应文档并进行真机验证。

### `hidden`

```jsx
<StatusBar hidden />
```

类型：

```ts
boolean
```

控制状态栏是否隐藏：

- `true`：隐藏
- `false`：显示

### `animated`

```jsx
<StatusBar style="light" animated />
```

类型：

```ts
boolean
```

决定状态栏属性发生变化时是否使用动画。

文档明确说明它支持以下属性的变化：

- `style`
- `hidden`

### `hideTransitionAnimation`

仅支持 iOS：

```jsx
<StatusBar
  hidden
  hideTransitionAnimation="fade"
/>
```

类型：

```ts
'none' | 'fade' | 'slide'
```

默认值：

```ts
'fade'
```

它指定通过 `hidden` 属性显示或隐藏状态栏时使用的过渡效果。

不要假设 Android 会执行该配置。文档将这个属性明确标记为 iOS 专用。

## 命令式 API

除了 JSX 组件，`StatusBar` 还提供了可以直接调用的方法。

命令式调用适合事件触发的即时操作，例如用户进入全屏模式后立即隐藏状态栏。

### `StatusBar.setHidden`

```ts
StatusBar.setHidden(true, 'slide');
```

签名概念如下：

```ts
StatusBar.setHidden(
  hidden: boolean,
  animation?: StatusBarAnimation
): void
```

参数：

| 参数 | 类型 | 作用 |
| --- | --- | --- |
| `hidden` | `boolean` | 决定是否隐藏状态栏 |
| `animation` | `StatusBarAnimation` | 可选，切换显示状态时使用的动画，默认是 `'none'` |

返回值为 `void`。

### `StatusBar.setStyle`

```ts
StatusBar.setStyle('dark', true);
```

签名概念如下：

```ts
StatusBar.setStyle(
  style: StatusBarStyle,
  animated?: boolean
): void
```

参数：

| 参数 | 类型 | 作用 |
| --- | --- | --- |
| `style` | `StatusBarStyle` | 设置状态栏文字和图标的颜色风格 |
| `animated` | `boolean` | 可选，是否为变化添加动画 |

返回值为 `void`。

### 声明式与命令式方式的区别

声明式方式：

```jsx
<StatusBar style={isDarkPage ? 'light' : 'dark'} />
```

命令式方式：

```ts
StatusBar.setStyle('light', true);
```

对于 React Web 开发者，可以将二者理解为：

- 声明式：状态栏配置是组件渲染结果的一部分
- 命令式：直接调用 API 修改系统 UI 状态

**基于经验建议：** 如果状态栏样式可以由页面状态计算出来，优先使用声明式组件；只有在全屏切换等事件型场景中，再考虑命令式调用。混合使用时需要明确最终由哪一处负责状态栏状态。

## 已废弃的方法

以下方法已经废弃，并将在未来版本中移除。

### `StatusBar.setStatusBarHidden`

```ts
StatusBar.setStatusBarHidden(hidden, animation);
```

应替换为：

```ts
StatusBar.setHidden(hidden, animation);
```

### `StatusBar.setStatusBarStyle`

```ts
StatusBar.setStatusBarStyle(style, animated);
```

应替换为：

```ts
StatusBar.setStyle(style, animated);
```

新代码不应继续使用旧方法。已有项目升级时，可以搜索这两个旧方法并完成替换。

## 类型说明

### `StatusBarAnimation`

```ts
'none' | 'fade' | 'slide'
```

表示状态栏显示或隐藏时的动画类型：

- `none`：无动画
- `fade`：淡入淡出
- `slide`：滑动

原文没有进一步保证每种动画在所有平台上的视觉表现完全一致。

### `StatusBarStyle`

```ts
'auto' | 'inverted' | 'light' | 'dark'
```

用于描述状态栏文字和图标的颜色风格。

## 应用配置与原生构建

除了运行时组件和方法，`expo-status-bar` 还内置了 config plugin，可以设置无法在运行时完成、必须重新构建应用二进制文件才能生效的初始属性。

### 什么是 config plugin

对 React Web 开发者来说，可以将 config plugin 理解为一种“构建阶段配置转换器”。

它会根据 `app.json` 等 Expo 配置，在生成或修改 iOS、Android 原生工程时写入相应的原生配置。这些配置不是浏览器运行时配置，因此修改后通常需要重新构建应用。

该方式适用于使用 Expo Config Plugins 和 Continuous Native Generation（CNG）的项目。

### CNG 的含义

Continuous Native Generation 是 Expo 根据应用配置持续生成或同步原生工程的工作流。

它与 React Web 构建的一个重要区别是：移动应用最终需要生成 iOS 或 Android 原生二进制文件。某些系统级配置必须进入原生工程，不能只靠 JavaScript 热更新或组件重新渲染完成。

### `app.json` 配置示例

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

可配置属性：

| 属性 | 默认值 | 作用 |
| --- | --- | --- |
| `hidden` | `undefined` | 决定应用启动时状态栏是否隐藏，可取 `true` 或 `false` |
| `style` | `undefined` | 决定应用启动时的状态栏风格，可取 `light` 或 `dark` |

这里的 `style` 与运行时组件属性范围不同：

- config plugin：只列出 `light`、`dark`
- 运行时 `StatusBar` 组件：还支持 `auto`、`inverted`

不要直接将运行时所有合法值复制到 `app.json` 插件配置中。

### 何时需要重新构建

文档明确说明，config plugin 配置的是不能在运行时设置的属性，需要构建新的应用二进制文件后才能生效。

因此，修改插件配置后，仅刷新 JavaScript 页面或使用热更新不足以验证结果。

## 不使用 CNG 时的原生配置

如果项目不使用 CNG，或者由开发者手动维护 iOS、Android 原生工程，就需要直接修改原生文件。

对于只开发过 React Web 的开发者，这类似于绕过框架配置层，直接修改底层平台工程。

### Android：启动时隐藏状态栏

修改：

```text
android/app/src/main/res/values/styles.xml
```

添加：

```xml
<style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
  <!-- ... -->
  <item name="expoStatusBarHidden">true</item>
</style>
```

`styles.xml` 是 Android 原生资源文件。这里将 `expoStatusBarHidden` 写入应用主题，使状态栏以隐藏状态启动。

### iOS：启动时隐藏状态栏

修改：

```text
ios/<project>/Info.plist
```

添加：

```xml
<key>UIStatusBarHidden</key>
<true/>
```

`Info.plist` 是 iOS 应用的原生配置文件，其中保存系统启动应用时需要读取的配置。

原文在手动原生配置部分只给出了“隐藏状态栏”的配置，没有提供手动设置初始 `style` 的具体步骤。对此不应自行补充未经文档说明的配置。

## 平台限制

### Web

Web 平台没有用于控制操作系统状态栏的 API。

因此，`expo-status-bar` 在 Web 上：

- 不产生实际效果
- 不会抛出错误

这与普通 React Web 页面中的顶部导航栏完全不同。浏览器页面无法通过该组件修改手机或桌面操作系统的系统状态栏。

“API 标记支持 Web”在这里表示代码可以运行，并不代表系统状态栏会发生变化。

### tvOS

在 tvOS 上：

- 代码可以编译和运行
- 不会显示状态栏

因此，不应通过 tvOS 是否出现视觉变化来判断代码是否调用成功。

### Android 与 iOS

能够执行的具体状态栏操作取决于当前平台。文档特别明确：

- `hideTransitionAnimation` 仅适用于 iOS
- config plugin 配置需要重新构建
- 手动原生配置文件和方式在 Android、iOS 上不同

**基于经验建议：** 涉及系统 UI 的效果应分别在 Android 和 iOS 设备或模拟器上验证，不能仅根据 Web 预览结果判断。

## React Web 开发者容易误解的地方

### 状态栏不是应用内的普通 DOM 区域

React Web 中的页面顶部通常属于应用布局，可以使用 CSS 完全控制。移动端状态栏则由操作系统管理，应用只能通过平台提供的能力修改部分属性。

### `style` 不是背景色

```jsx
<StatusBar style="light" />
```

表示使用浅色文字和图标，不代表状态栏背景变成浅色。

选择时应该考虑状态栏后方区域的视觉背景：

- 深色背景通常搭配 `light`
- 浅色背景通常搭配 `dark`

### Web 无效果也不报错

如果只在 Web 环境调试，即使代码完全正确，也不会看到操作系统状态栏发生变化。这是平台能力限制，不一定是组件失效。

### 配置文件修改不等于运行时状态更新

`app.json` 中的 config plugin 配置用于原生构建阶段。修改后通常需要重新生成或构建应用，而不是依赖 React 的重新渲染。

### 多个页面可能同时影响状态栏

React 导航场景中，多个页面组件可能同时处于挂载状态。多个 `StatusBar` 的属性会按照挂载顺序合并，因此不能简单假设“当前屏幕 JSX 中的组件一定覆盖所有其他配置”。

### “支持的平台”不代表效果相同

API 表格可能将 Web 和 tvOS 列为支持平台，但文档同时明确说明：

- Web 上操作无效果
- tvOS 上不会显示状态栏

阅读跨平台 API 文档时，需要同时检查平台备注和限制说明。

## 实际开发中的使用方式

### 普通深色页面

```jsx
function DarkScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar style="light" />
    </View>
  );
}
```

### 根据主题自动选择

```jsx
<StatusBar style="auto" />
```

文档明确说明，`auto` 会根据当前配色方案选择合适的风格。

### 全屏场景

声明式写法：

```jsx
<StatusBar hidden={isFullscreen} animated />
```

命令式写法：

```ts
StatusBar.setHidden(true, 'slide');
```

如果全屏状态本身已经保存在 React state 中，声明式写法通常更容易保持 UI 状态一致。

### 为不同页面设置样式

```jsx
function LightBackgroundScreen() {
  return (
    <>
      <StatusBar style="dark" />
      {/* 页面内容 */}
    </>
  );
}

function DarkBackgroundScreen() {
  return (
    <>
      <StatusBar style="light" />
      {/* 页面内容 */}
    </>
  );
}
```

使用这种模式时，要结合所用导航库确认页面卸载和保留策略，因为它会影响多个 `StatusBar` 的挂载与合并顺序。

## 文档未涉及的内容

当前文档未涉及以下内容：

- 如何设置状态栏背景色
- 如何处理刘海、灵动岛或安全区域布局
- 如何与具体导航库集成
- `inverted` 的详细选择规则
- Android 与 iOS 各动画效果的具体差异
- 手动原生工程中设置初始 `style` 的方式
- 不同 Android 或 iOS 系统版本的兼容性差异
- 状态栏高度的读取方式

这些问题不能仅根据本文档得出确定结论，需要查阅对应 SDK、React Native API或相关平台文档。

## 总结

`expo-status-bar` 提供了两类控制方式：

- 通过 `<StatusBar />` 组件声明状态栏状态
- 通过 `StatusBar.setHidden` 和 `StatusBar.setStyle` 命令式修改状态

应用启动时的状态可以通过 config plugin 配置；不使用 CNG 时，则需要修改 Android 或 iOS 原生工程。构建阶段配置发生变化后，需要重新构建应用二进制文件。

使用时最重要的限制是：平台行为并不完全一致。Web 上调用不会产生效果，tvOS 不显示状态栏，部分动画配置仅适用于 iOS。对于多页面应用，还需要注意多个 `StatusBar` 组件会按照挂载顺序合并属性。

---

## 文档导航

- **上一页**：[sqlite](./210__sqlite.md)
- **下一页**：[storereview](./212__storereview.md)
