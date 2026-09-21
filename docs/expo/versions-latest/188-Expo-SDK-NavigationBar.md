# 188｜Expo SDK NavigationBar Android 系统导航栏

**翻页：**[上一页：Expo SDK MeshGradient 网格渐变](./187-Expo-SDK-MeshGradient.md) · [目录](./README.md) · [下一页：Expo SDK Network](./189-Expo-SDK-Network.md)

**官方页面：**[NavigationBar · Latest](https://docs.expo.dev/versions/latest/sdk/navigation-bar/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/navigation-bar/)

**版本与平台：**Latest 推荐 `expo-navigation-bar ~57.0.2`；SDK v56.0.0 推荐 `~56.0.3`。只支持 Android，并可在 Expo Go 使用。

## 这是什么导航栏

Android 手机底部系统区域包含系统返回 / Home 等**导航栏按钮**。`expo-navigation-bar` 可设定按钮颜色样式、显隐；它控制的是 OS 系统导航栏，不是 React Navigation、Expo Router 的页面导航，也不是 iOS 底部安全区。

用法分两类：React 组件 `<NavigationBar />` 可放在不同页面中声明样式 / 显示状态；命令式 `NavigationBar.setHidden()` / `setStyle()` 可在事件中即时调整。若多个组件同时挂载，组件属性会按挂载顺序合并。

## 安装与 app config

```sh
npx expo install expo-navigation-bar
yarn expo install expo-navigation-bar
pnpm expo install expo-navigation-bar
bun expo install expo-navigation-bar
```

在已有 React Native 工程中需要先接入 `expo`。CNG 项目可通过 config plugin 设置构建初始值：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-navigation-bar",
        {
          "enforceContrast": false,
          "hidden": false,
          "style": "light"
        }
      ]
    ]
  }
}
```

| 插件属性 | 默认值 | 说明 |
| --- | --- | --- |
| `enforceContrast` | `true` | Android 系统是否让导航栏半透明来保持按钮与内容对比；Android 9 及以下无效。若要手动决定按钮颜色，需要按 API 条件关闭它。 |
| `hidden` | 未设置 | 应用初始时是否隐藏系统导航栏。 |
| `style` | 未设置 | 初始按钮 / 栏样式；接受 `light` 或 `dark`。 |

这些 config plugin 值需要在构建阶段写入原生工程；手动维护 Android 工程时，如要隐藏导航栏，官方示例是在 `android/app/src/main/res/values/styles.xml` 增加：

```xml
<style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
  <!-- 其它主题项 -->
  <item name="expoNavigationBarHidden">true</item>
</style>
```

## 声明式组件示例

```tsx
import { NavigationBar } from 'expo-navigation-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function DarkScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>系统导航栏按钮使用浅色样式</Text>
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
  text: { color: '#fff' },
});
```

`NavigationBar` 是声明式组件，`style` 控制导航按钮配色，`hidden` 控制导航栏是否隐藏。它的 `style` 默认 `'auto'`，跟随 app 当前主题；暗色界面时可能自动选择浅色按钮。

## 命令式 API

```ts
import { NavigationBar } from 'expo-navigation-bar';

NavigationBar.setStyle('dark');
NavigationBar.setHidden(true);
```

| 方法 | 参数 / 返回 | 用途 |
| --- | --- | --- |
| `setStyle(style)` | `NavigationBarStyle`，返回 `void` | 设置系统导航栏按钮的明暗样式。 |
| `setHidden(hidden)` | `boolean`，返回 `void` | 隐藏或显示导航栏。 |

样式有 `'auto'`、`'inverted'`、`'light'`、`'dark'`：`light` 表示浅色导航区域配深色按钮；`dark` 表示深色区域配浅色按钮；`inverted` 按当前主题反转；`auto` 根据主题自动选。导航栏样式生效还要求系统处于三键按钮导航模式，并且 config plugin 的 `enforceContrast` 设为 false。Android 15 模拟器有样式不生效的已知问题，需用真机或其它 Android 版本模拟器确认。

## 已弃用的可见性 Hook / 方法

官方页将可见性查询和旧事件 API 标为 deprecated，计划在未来版本移除：

| API | 返回 / 行为 |
| --- | --- |
| `useVisibility()` | Hook 返回 `NavigationBarVisibility \| null`；异步初始化时为 null。 |
| `getVisibilityAsync()` | `Promise<NavigationBarVisibility>`；不支持的平台（iOS / Web）返回 `'hidden'`。 |
| `setVisibilityAsync(visibility)` | `Promise<void>`；按 `'visible'` / `'hidden'` 设置。 |
| `addVisibilityListener(listener)` | `EventSubscription`；观察系统导航栏变化。受 Android 平台限制，状态栏显隐变化也会触发。 |

`NavigationBarVisibilityEvent` 有 `rawVisibility: number`（Android 原生系统 UI bit flags）和 `visibility: 'visible' | 'hidden'`。事件完成后移除 subscription；不要将 `useVisibility` 与新组件 API 混为一谈。

> 源页在组件 API 中仍列有 `setStyle(style)`，但旧 Methods 子章节又将同名 `NavigationBar.setStyle` 标为 deprecated，并写“Use `NavigationBar.setHidden` instead”，这与两者用途不同的描述不一致。若依赖 imperative `setStyle`，按本地 Expo SDK 类型 / Changelog 核验；当前更明确的声明式入口是 `<NavigationBar style="..." />`。

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-navigation-bar ~57.0.2`；SDK v56.0.0 推荐 `~56.0.3`。
- 两版仅支持 Android；config plugin、组件 / 命令式显隐、可用样式、废弃可见性 API 和 Android 15 Emulator 提示一致。
- 两版页脚 Next 均为 Expo SDK Network。

## 源页代码主题覆盖

- Installation：覆盖 npm、Yarn、pnpm、Bun 安装命令和已有 React Native 工程需接入 Expo。
- Configuration：重写 config plugin JSON 的 `enforceContrast` / `hidden` / `style` 三项和手动 `styles.xml` 隐藏导航栏资源。
- Usage：重写黑色屏幕上浅色导航按钮的 React 组件布局示例。
- API 示例：覆盖 `NavigationBar` 导入、`setStyle('dark')` 和 `setHidden(true)`。
- Deprecated APIs：列出 `useVisibility`、`getVisibilityAsync`、旧 `setStyle` / `setVisibilityAsync`、`addVisibilityListener` 与事件类型；指出源页同名 `setStyle` 弃用信息不一致。
- Types：列出全部样式名、可见性状态与事件字段，以及对比度、系统三键导航和 Android 15 模拟器限制。

**翻页：**[上一页：Expo SDK MeshGradient 网格渐变](./187-Expo-SDK-MeshGradient.md) · [目录](./README.md) · [下一页：Expo SDK Network](./189-Expo-SDK-Network.md)
