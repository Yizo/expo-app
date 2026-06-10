# Expo Router Stack 原生工具栏

## 文档解决的问题

本文说明如何在 Expo Router 的 Stack 页面中使用 `Stack.Toolbar` 添加原生顶部或底部工具栏，包括按钮、菜单、子菜单、间距、徽标、自定义视图和动态显隐。

适合收藏、分享、编辑、筛选、删除等与当前页面强关联的操作。

> **文档明确说明：** `Stack.Toolbar` 是 Alpha API。Android 从 Expo SDK 56 起可用，iOS 从 SDK 55 起可用，可能发生破坏性变更。

## 基础结构与位置

`Stack.Toolbar` 通过 `placement` 决定位置：

- `"left"`：导航栏左侧。
- `"right"`：导航栏右侧。
- 不传：默认是底部工具栏。

```tsx
import { Stack } from 'expo-router';

export default function Page() {
  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon={require('./assets/share.png')}
          onPress={() => {}}
        />
      </Stack.Toolbar>
      {/* 页面内容 */}
    </>
  );
}
```

底部工具栏只能写在页面组件内，不能写在布局文件中，因为它必须绑定到某个具体 screen。

## 图标

### iOS：SF Symbols

可直接把 SF Symbol 名称传给 `icon`：

```tsx
<Stack.Toolbar.Button icon="star.fill" onPress={() => {}} />
```

SF Symbols 只适用于 iOS。

### Android：Material Symbols

文档推荐安装 `@expo/material-symbols`：

```sh
npx expo install @expo/material-symbols
```

每个图标从单独的 XML 子路径导入，Metro 只打包实际导入的资源：

```tsx
import Star from '@expo/material-symbols/star.xml';

<Stack.Toolbar.Button icon={Star} onPress={() => {}} />;
```

Android 的 XML drawable 默认跟随工具栏 tint 着色；设置 `iconRenderingMode="original"` 可保留原色。

### 同一组件适配双平台

```tsx
import Star from '@expo/material-symbols/star.xml';

<Stack.Toolbar.Button
  icon={process.env.EXPO_OS === 'ios' ? 'star.fill' : Star}
  onPress={() => {}}
/>;
```

Metro 会在构建时把 `process.env.EXPO_OS` 替换为平台字符串，并移除另一平台分支，因此 Android XML 不会进入 iOS 包，反之亦然。

### 自定义图片

Android 和 iOS 都可以使用 `require('./assets/icon.png')` 等图片源。图片默认以 `template` 模式被 tint；多彩图标应设置 `iconRenderingMode="original"`。

## 操作菜单

多个动作可放入 `Stack.Toolbar.Menu`，每项使用 `Stack.Toolbar.MenuAction`：

```tsx
<Stack.Toolbar placement="right">
  <Stack.Toolbar.Menu icon={require('./assets/menu.png')}>
    <Stack.Toolbar.MenuAction isOn={archived} onPress={toggleArchive}>
      Archive
    </Stack.Toolbar.MenuAction>
    <Stack.Toolbar.MenuAction destructive onPress={removeItem}>
      Delete
    </Stack.Toolbar.MenuAction>
  </Stack.Toolbar.Menu>
</Stack.Toolbar>
```

- `isOn` 表示选中/开启状态。
- `destructive` 表示破坏性动作。
- 菜单可继续嵌套 `Stack.Toolbar.Menu`。
- 子菜单加 `inline` 后，其选项直接显示在当前菜单内，而不是再展开一层。

部分 `Menu` 和 `MenuAction` 属性仅支持 iOS，使用前需核对具体属性的平台可用性。

## 底部工具栏与 Spacer

```tsx
<Stack.Toolbar>
  <Stack.Toolbar.Button icon={require('./assets/select.png')} onPress={() => {}} />
  <Stack.Toolbar.Spacer width={24} />
  <Stack.Toolbar.Button icon={require('./assets/plus.png')} onPress={() => {}} />
</Stack.Toolbar>
```

平台差异：

- Android 的 `Spacer` 必须提供明确 `width`，目前没有自动填满剩余空间的能力。
- iOS 不传 `width` 时是弹性间距，可把两侧按钮推向工具栏两端；传 `width` 时为固定间距。

## 徽标、自定义视图与动态显隐

### iOS Header 徽标

在 `left`/`right` Header 中，可以组合 `Stack.Toolbar.Icon`、`Label` 和 `Badge`：

```tsx
<Stack.Toolbar placement="right">
  <Stack.Toolbar.Button onPress={() => {}}>
    <Stack.Toolbar.Icon sf="bell" />
    <Stack.Toolbar.Label>Notifications</Stack.Toolbar.Label>
    <Stack.Toolbar.Badge>5</Stack.Toolbar.Badge>
  </Stack.Toolbar.Button>
</Stack.Toolbar>
```

徽标不支持底部工具栏，也不支持 Android。Android 会丢弃 `Badge` 和 `Label` 子元素，只渲染按钮图标。

### 自定义 React Native 视图

`Stack.Toolbar.View` 可以嵌入任意 React Native 组件，适合标准按钮/菜单无法表达的 UI，也可用于在 Android 自行实现徽标效果。

### 动态显示

按钮等项目支持 `hidden`，可依据编辑状态等条件切换显示，无需替换整个工具栏。

## 常见问题

### iOS 26 深色模式下 Liquid Glass 闪烁

原因是导航默认主题与系统深色模式不一致。根布局应根据 `useColorScheme()` 选择 `DarkTheme` 或 `DefaultTheme`，并传给 Expo Router 的 `ThemeProvider`。

### 页面切换时白色闪屏

同样通常来自导航栈背景仍为浅色。为根布局设置与应用一致的 Router 主题。

### Large Title 滚动时不折叠

`ScrollView` 或 `FlatList` 应是 screen 返回的第一个直接子元素。若必须包一层 `View`，给该包装层设置 `collapsable={false}`。

## 已知限制与坑点

- 只渲染于 Android 和 iOS；Web 需要自己实现工具栏。
- Android 的 `icon` 必须是 `ImageSourcePropType`，也可通过 `Stack.Toolbar.Icon src` 提供跨平台图标。
- Android 的无宽度 `Spacer` 不产生效果。
- 底部工具栏不能放在布局文件。
- `Stack.Toolbar` 之间不能嵌套。
- `Badge` 只支持 iOS Header 的 `left`/`right`。
- Android 不支持 `Badge`、`Label` 和 `SearchBarSlot`；跨平台搜索应使用 `Stack.SearchBar`。

## React Web 开发者容易误解的地方

- 这是原生导航栏能力，不是页面 DOM 中 `position: fixed` 的普通工具条；平台会决定可用元素与布局行为。
- 相同 JSX 在 iOS 和 Android 上可能故意表现不同，例如图标来源、弹性 Spacer、徽标和菜单属性。
- `require()` 在这里用于打包本地原生图片资源，不等同于 Webpack 中任意 CommonJS 模块加载。
- Web 没有自动降级出的等价 Toolbar，需要另写 UI。

## 实际开发建议

> **基于文档内容推导：** 先确定操作属于 Header 还是页面底部，再为 iOS 与 Android 分别选择图标来源；不要先设计一个完全统一的视觉稿，再假设所有原生能力跨平台一致。

> **基于文档内容推导：** 对跨平台关键操作，优先使用 Button、Menu、固定宽度 Spacer 等双方都有明确支持的能力；平台专属徽标或子菜单属性应作为增强，而不是核心功能的唯一入口。

当前文档未涉及：Web 工具栏的推荐实现、完整无障碍配置、所有菜单属性的逐项平台表。
