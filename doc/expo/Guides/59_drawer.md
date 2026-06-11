# Expo Router 的 Drawer

## 文档解决的问题

这篇文档解决的是：如何在 Expo Router 中启用和使用 Drawer 布局，以及它依赖哪些安装项。

## 适用场景

- 你想在应用侧边滑出一个导航菜单。
- 你需要在 Expo Router 中做类似“侧边栏 / 抽屉式导航”的交互。
- 你想知道 SDK 56 以后 Drawer 的基础接入方式。

## React Web 开发者先要补的背景

- `Drawer` 是移动端常见导航模式，用户可从屏幕侧边滑出菜单。
- 它不像 Web 固定侧边栏那样始终展开，而更像一个可手势呼出的导航层。

## 文档中的核心内容

### Drawer 是什么

文档明确说明：

- Drawer 是一种常见移动导航模式
- 用户可以从屏幕侧边滑出菜单
- 也通常可以通过 header 中的按钮切换开关状态

### SDK 56 及以后如何提供 Drawer

文档明确说明：

- SDK 56+ 中，Drawer navigator 已经打包在 `expo-router` 里
- 底层使用 `react-native-drawer-layout`

这说明你不需要再单独寻找另一个 Drawer 路由集成入口。

## 安装要求

文档明确说明：

- Android / iOS 上，Drawer 动画依赖 `react-native-reanimated` 和 `react-native-worklets`
- Web 上动画由 CSS 处理

安装命令：

```sh
# npm
npx expo install react-native-reanimated react-native-worklets react-native-gesture-handler
```

这说明 Drawer 不只是“一个路由组件”，它还依赖手势与动画基础设施。

## 基础用法

文档给出的最小写法：

```tsx
import { Drawer } from 'expo-router/drawer';

export default function Layout() {
  return <Drawer />;
}
```

这表示当前目录下的页面将被组织成 Drawer 导航。

## 配置 Drawer.Screen

文档给出的扩展示例：

```tsx
<Drawer>
  <Drawer.Screen
    name="index"
    options={{
      drawerLabel: 'Home',
      title: 'overview',
    }}
  />
</Drawer>
```

以及动态路由页面：

```tsx
<Drawer.Screen
  name="user/[id]"
  options={{
    drawerLabel: 'User',
    title: 'overview',
  }}
/>
```

### `name` 的含义

文档明确说明：

- `name` 必须匹配从根开始的页面 URL 对应名称

这说明 Drawer.Screen 不是随便写一个别名，而是要对齐实际路由路径。

## 命令、配置、文件说明

### 安装命令

```sh
npx expo install react-native-reanimated react-native-worklets react-native-gesture-handler
```

### 关键导入

```tsx
import { Drawer } from 'expo-router/drawer';
```

### layout 文件职责

和其他导航器一样，Drawer 通常放在 `_layout.tsx` 里声明。

## 注意事项、限制与坑点

### 1. 原生端依赖动画与手势库

如果缺少这些依赖，Drawer 不是“降级一下还能用”，而是基础能力就不完整。

### 2. `name` 必须和路由匹配

否则你配置的 Screen 可能不会对应正确页面。

### 3. 当前文档非常简短

这篇文档只覆盖了安装与最小使用方式，没有深入讲：

- 手势细节
- 自定义 drawer 内容
- 嵌套导航
- 权限控制

所以如果你在做复杂抽屉导航，这一页只能当起点。

## React Web 开发者最容易误解的点

### 1. Drawer 不等于固定侧边栏

它更强调手势、动画与隐藏/展开行为。

### 2. 导航器配置仍然写在 layout 中

不是像有些 Web 框架那样单独写一份“菜单配置”就结束。

### 3. Web 支持不代表实现方式一样

文档明确说明 Web 侧动画靠 CSS，而原生侧依赖 Reanimated / Worklets。

## 实际开发建议

- 基于经验建议：先确认产品真的适合 Drawer，再决定是否使用，因为它更偏移动端导航习惯。
- 基于经验建议：接入前先把手势与动画依赖装齐，避免把问题误判成路由问题。
- 基于文档内容推导：如果你的 App 既有 Drawer 又有 Stack / Tabs，最好先画出导航层级，再决定 Drawer 放在哪一层的 `_layout.tsx`。

## 文档明确说明

- Drawer 是可从侧边滑出的导航菜单模式。
- SDK 56+ 的 Drawer 已内置在 `expo-router` 中。
- Android / iOS 需要 `react-native-reanimated`、`react-native-worklets`、`react-native-gesture-handler`。
- Web 侧动画由 CSS 处理。
- 可通过 `Drawer` 和 `Drawer.Screen` 定义布局与页面选项。
- `Drawer.Screen.name` 必须匹配实际路由。

## 基于文档内容推导

- Drawer 在 Expo Router 中的接入方式与 Stack / Tabs 一致，都是 layout 驱动。
- 如果你要做复杂 Drawer，后续大概率还需要继续查更深入的 API 参考。
- 依赖手势和动画库意味着 Drawer 的“运行环境准备”比普通静态页面更重要。

## 当前文档未涉及

- Drawer 的完整 options 列表。
- 自定义抽屉内容。
- 深链、鉴权、嵌套路由与 Drawer 的组合模式。

<!-- NAVIGATION START -->
---
[← 上一页：Expo Router 的 Native Tabs](./58_native-tabs.md) | [下一页：Expo Router 中的认证与受保护路由 →](./60_authentication.md)
<!-- NAVIGATION END -->
