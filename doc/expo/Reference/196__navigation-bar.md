# Expo NavigationBar 学习指南

## 文档解决的问题

`expo-navigation-bar` 用于控制 **Android 系统导航栏**，主要支持：

- 隐藏或显示导航栏。
- 设置导航栏按钮的明暗样式。
- 通过 React 组件声明式配置导航栏。
- 通过方法命令式修改导航栏。

这里的“导航栏”不是 React Navigation 的页面导航栏，也不是网页中的顶部菜单，而是 Android 屏幕底部由操作系统提供的系统区域。它可能显示“返回、主页、最近任务”三个按钮，也可能采用手势导航。

> 本文档对应尚未正式发布的下一版 Expo SDK。文档标明当前最新稳定版本为 SDK 56，因此实际项目应确认所使用 SDK 版本对应的 API。

## 适用场景与平台

适合以下场景：

- 视频、游戏、阅读器等沉浸式页面需要隐藏系统导航栏。
- 深色页面需要使用浅色系统导航按钮，避免按钮看不清。
- 不同页面需要使用不同的导航栏样式。
- 需要为 Android 应用设置启动时的导航栏状态。

平台支持情况：

| 平台 | 支持情况 |
| --- | --- |
| Android | 支持 |
| Expo Go | 已内置该库 |
| iOS | 不支持这些导航栏控制功能 |
| Web | 不支持 |

对于 React Web 开发者，可以把它理解成“控制浏览器之外的操作系统 UI”。它不是 DOM 元素，不能通过 CSS 操作，部分配置还必须在构建原生应用时写入 Android 工程。

## 安装

根据项目使用的包管理器执行：

```sh
# npm
npx expo install expo-navigation-bar

# yarn
yarn expo install expo-navigation-bar

# pnpm
pnpm expo install expo-navigation-bar

# bun
bun expo install expo-navigation-bar
```

`expo install` 与普通 `npm install` 的重要区别是：它会尽量安装与当前 Expo SDK 兼容的依赖版本。

如果是在已有的原生 React Native 项目中使用，还需要先为项目安装并配置 Expo Modules，也就是文档中的“install `expo`”。

## 两类配置方式

该库的配置分为两类：

1. **构建时配置**：写入 `app.json` 等应用配置，需要重新构建应用。
2. **运行时控制**：在 React 代码中通过组件或方法动态修改。

这类似于 Web 项目中“构建工具配置”和“页面运行时 JavaScript”的区别，只是构建时配置最终会进入 Android 原生工程和应用安装包。

## 使用 Config Plugin 进行构建时配置

使用 Expo 的 Continuous Native Generation（CNG）工作流时，可以在应用配置中加入该库的 config plugin：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-navigation-bar",
        {
          "enforceContrast": true,
          "hidden": false,
          "style": "light"
        }
      ]
    ]
  }
}
```

Config plugin 会在生成 Android 原生工程时修改相应原生配置。此处设置的是应用启动时或原生层面的行为，修改后必须重新生成并构建应用二进制，仅刷新 JavaScript 不会生效。

### 配置项

| 配置项 | 默认值 | 作用 |
| --- | --- | --- |
| `enforceContrast` | `true` | 是否由 Android 保持导航栏半透明，以确保系统导航按钮和应用内容之间有足够对比度。Android 9 及以下无效。 |
| `hidden` | `undefined` | 控制系统栏初始是否隐藏，值为 `true` 或 `false`。 |
| `style` | `undefined` | 设置导航栏启动时的样式，配置值为 `light` 或 `dark`。 |

### `enforceContrast` 的实际影响

`enforceContrast` 不只是视觉偏好设置，它会影响运行时的 `style` 和 `setStyle()` 是否真正生效。

只有同时满足以下条件，动态设置按钮样式才有效：

- 设备使用传统按钮导航，而不是手势导航。
- Config plugin 的 `enforceContrast` 被设置为 `false`。

因此，如果需要精确控制按钮明暗，可以配置：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-navigation-bar",
        {
          "enforceContrast": false
        }
      ]
    ]
  }
}
```

修改后需要重新构建应用。

## 不使用 CNG 时的原生配置

如果项目不使用 CNG，或者由开发者手动维护 `android` 原生工程，就不能依赖 config plugin 自动修改原生文件。

要让 Android 应用启动时隐藏导航栏，需要编辑：

```text
android/app/src/main/res/values/styles.xml
```

加入：

```xml
<style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
  <!-- ... -->
  <item name="expoNavigationBarHidden">true</item>
</style>
```

这段 XML 属于 Android 原生主题配置，不是 React 组件样式。它会被编译进 Android 应用，因此修改后需要重新进行原生构建。

> 原文对 config plugin 的 `hidden` 描述为“status bar starts hidden”，但本页主题及手动配置均指向 navigation bar。这里很可能是文档表述不一致，实际使用前应在目标 Expo SDK 和 Android 设备上验证。

## 声明式使用

文档推荐通过 `NavigationBar` 组件声明当前页面所需的导航栏状态：

```jsx
import { StyleSheet, Text, View } from 'react-native';
import { NavigationBar } from 'expo-navigation-bar';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Notice that the navigation bar has light buttons!
      </Text>

      <NavigationBar style="light" />
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

`NavigationBar` 不负责渲染一个可见的 React Native 视图。它更像 React Web 中的 `<title>` 或用于管理全局副作用的组件：组件挂载后，将配置同步到 Android 系统导航栏。

### `NavigationBar` 属性

#### `hidden`

```tsx
<NavigationBar hidden />
```

类型：

```ts
boolean | undefined
```

控制系统导航栏是否隐藏。

#### `style`

```tsx
<NavigationBar style="light" />
```

类型：

```ts
'auto' | 'inverted' | 'light' | 'dark'
```

默认值为 `auto`，用于设置导航栏的颜色与内容对比样式：

| 值 | 含义 |
| --- | --- |
| `auto` | 根据当前主题自动选择样式，例如深色模式下自动使用适合深色背景的样式。 |
| `inverted` | 使用与当前主题相反的导航栏配色。 |
| `light` | 浅色导航栏，使用深色内容。 |
| `dark` | 深色导航栏，使用浅色内容。 |

原文示例文字将 `style="light"` 描述成“light buttons”，而类型说明将 `light` 定义为“浅色导航栏和深色内容”，两处表述存在歧义。实际开发时不要只根据名称猜测按钮颜色，应在目标 Android 版本和主题下验证最终效果。

### 多个组件的合并规则

应用中可能同时挂载多个 `NavigationBar`，例如多个页面各自声明一个。它们的属性会按照组件挂载顺序合并。

这意味着导航栏不是严格的“每个页面独立状态”。如果页面导航方案会保留旧页面挂载，多个组件可能共同影响最终配置。

**基于文档内容推导：** 使用多页面导航时，应关注页面是否真的卸载，以及 `NavigationBar` 的挂载顺序。不要假设当前屏幕中的组件一定是唯一生效来源。

## 命令式控制

当导航栏变化由按钮点击、全屏播放等事件触发时，可以使用命令式方法。

### 隐藏或显示

```ts
NavigationBar.setHidden(true);
```

方法签名：

```ts
NavigationBar.setHidden(hidden: boolean): void
```

示例：

```ts
NavigationBar.setHidden(true);  // 隐藏
NavigationBar.setHidden(false); // 显示
```

### 设置样式

```ts
NavigationBar.setStyle('dark');
```

方法签名：

```ts
NavigationBar.setStyle(
  style: 'auto' | 'inverted' | 'light' | 'dark'
): void
```

该方法同样受到以下限制：

- 设备必须使用按钮导航。
- `enforceContrast` 必须设置为 `false`。
- Android 15 模拟器存在已知问题，调用后可能没有视觉效果。

组件属性和上述方法都返回 `void`，文档没有提供用于等待原生操作完成的 Promise。

## 声明式与命令式如何选择

一般情况下：

- 页面存在期间始终需要固定配置：使用 `<NavigationBar />`。
- 由临时交互触发，例如进入全屏播放：使用 `setHidden()` 或 `setStyle()`。

**基于经验建议：** 同一项状态尽量只由一种方式管理。若组件声明 `hidden={false}`，业务代码又调用 `setHidden(true)`，后续组件更新可能覆盖命令式设置，使最终状态难以判断。

## 已弃用的 API

文档还列出了旧版可见性 API，但明确标记为 deprecated，并说明将在未来版本删除：

### `useVisibility()`

```ts
const visibility = useVisibility();
```

用于响应式获得系统导航栏可见性，返回：

```ts
'visible' | 'hidden' | null
```

异步初始化期间返回 `null`。

### `getVisibilityAsync()`

```ts
const visibility = await NavigationBar.getVisibilityAsync();
```

返回当前导航栏可见性。在 iOS、Web 等不支持的平台上返回 `hidden`。

这意味着返回 `hidden` 不一定代表设备上的导航栏真的隐藏，也可能只是当前平台不支持该 API。

### `setVisibilityAsync()`

```ts
await NavigationBar.setVisibilityAsync('hidden');
```

接受：

```ts
'visible' | 'hidden'
```

该方法已弃用，应改用：

```ts
NavigationBar.setHidden(true);
```

### `addVisibilityListener()`

旧版监听方式：

```ts
const subscription = NavigationBar.addVisibilityListener(event => {
  console.log(event.visibility);
});
```

事件对象包含：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `visibility` | `'visible' \| 'hidden'` | 当前导航栏可见性。 |
| `rawVisibility` | `number` | Android 原生 `setOnSystemUiVisibilityChangeListener` 返回的系统 UI 状态。 |

由于 Android 平台限制，状态栏可见性变化也会触发这个监听器。因此，收到事件不等于导航栏一定发生了变化。

文档列出的 `NavigationBarVisibility` 和 `NavigationBarVisibilityEvent` 类型也属于旧 API，将随相关功能在未来版本删除。

## 注意事项与限制

### 仅支持 Android

该库控制的是 Android 特有的系统导航栏。不能把相同效果直接套用到 iOS 或 Web，也不应把它当作跨平台页面导航方案。

如果编写跨平台组件，需要明确处理平台差异，不能根据旧 API 在不支持平台返回的 `hidden` 判断真实系统状态。

### 手势导航下样式设置可能无意义

`style` 只会在设备使用导航按钮时生效。现代 Android 设备可能使用底部手势提示条，此时没有传统的返回、主页和最近任务按钮可供调整。

隐藏导航栏与设置按钮样式是两种不同操作。文档只明确限制了样式设置的生效条件，没有说明隐藏操作也受相同条件限制。

### Android 15 模拟器问题

由于 Android 15 模拟器存在已知缺陷，设置导航栏样式可能没有效果。遇到这一现象时，应改用：

- Android 真机。
- 其他 Android 版本的模拟器。

不能仅凭 Android 15 模拟器的表现认定代码或配置无效。

### 构建时配置不会通过热更新生效

Config plugin 和 `styles.xml` 都属于原生配置。修改后必须重新构建应用二进制，React Native 的 Fast Refresh 或 JavaScript 更新不足以应用这些变化。

### 旧 API 不适合新代码

可见性 Hook、查询方法、监听方法和 `setVisibilityAsync()` 已明确弃用。新代码应优先使用：

```tsx
<NavigationBar hidden style="dark" />
```

或：

```ts
NavigationBar.setHidden(true);
NavigationBar.setStyle('dark');
```

当前文档没有提供新 API 来替代旧版的可见性查询和事件监听能力。

## React Web 开发者容易误解的地方

1. **它不是页面导航组件。**  
   它不负责路由、页面切换或标题栏，和 React Router、React Navigation 解决的问题不同。

2. **它操作的是操作系统 UI。**  
   `NavigationBar` 组件不会在 React Native 布局中占据一个普通视图位置。

3. **不存在 CSS 级别的统一行为。**  
   效果取决于 Android 版本、导航模式、系统对比度策略、模拟器实现和原生构建配置。

4. **“样式”不等于任意 CSS。**  
   `style` 只能取 `auto`、`inverted`、`light`、`dark`，不能传背景色、尺寸或 CSS 对象。

5. **配置文件会影响 JavaScript API。**  
   `enforceContrast` 是构建时选项，但会决定运行时的 `setStyle()` 是否有效。这种原生配置与运行时代码联动，在纯 React Web 项目中较少遇到。

6. **安装依赖不一定等于配置完成。**  
   CNG 项目可以使用 config plugin；手动维护原生 Android 工程时，还可能需要修改 XML 并重新构建。

## 实际开发中的使用方式

可以按以下顺序接入：

1. 使用 `expo install` 安装与当前 Expo SDK 匹配的版本。
2. 确认项目是 CNG 工作流，还是手动维护 Android 原生工程。
3. 如果需要动态控制样式，在 config plugin 中将 `enforceContrast` 设置为 `false`。
4. 重新构建 Android 应用。
5. 页面级固定配置优先使用 `<NavigationBar />`。
6. 全屏等临时交互使用 `setHidden()` 和 `setStyle()`。
7. 分别在传统按钮导航和手势导航模式下测试。
8. 不要只依赖 Android 15 模拟器判断样式是否生效。
9. 避免在新代码中继续使用已弃用的可见性 API。

## 文档未涉及的内容

当前文档未说明：

- 如何设置任意导航栏背景颜色。
- 如何控制导航栏高度或布局。
- 如何实现对应的 iOS 系统 UI 效果。
- 新 API 如何监听或查询导航栏可见性。
- 多个 `NavigationBar` 的属性发生冲突时，每个属性的完整覆盖细节。
- 与 React Navigation 等页面导航库集成的具体示例。
- Android 手势导航模式下隐藏导航栏的具体表现。
- 用户通过系统手势重新显示导航栏后的恢复策略。

对于这些问题，不能仅根据当前文档作出确定结论。

## 总结

`expo-navigation-bar` 是一个仅面向 Android 系统导航栏的 Expo 模块。它提供：

- `<NavigationBar />` 声明式组件。
- `setHidden()` 和 `setStyle()` 命令式方法。
- 通过 config plugin 或 Android XML 设置启动状态和原生行为。

使用时最关键的限制是：样式控制只适用于按钮导航，并且要求 `enforceContrast: false`；原生配置修改后必须重新构建；Android 15 模拟器可能无法正确展示样式变化；旧版可见性查询和监听 API 已弃用。

---

## 文档导航

- **上一页**：[mesh gradient](./195__mesh-gradient.md)
- **下一页**：[network](./197__network.md)
