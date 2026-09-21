# 010｜Expo Router Native Tabs

**翻页：**[上一页：Expo Router Link API](./009-Expo-Router-Link.md) · [目录](./README.md) · [下一页：Split View API](./011-Split-View.md)

**官方页面：**[Expo Router Native tabs](https://docs.expo.dev/versions/latest/sdk/router/native-tabs/)

**版本边界：**Latest 推荐 `expo-router ~57.0.22`；SDK v56 Router reference 对应 `~56.2.21`。本地项目依赖需与 v56 精确 reference 对照。子路径 `unstable-native-tabs` 虽然可用，部分 native props 仍标为 unstable。

## NativeTabs 是什么

`expo-router/unstable-native-tabs` 提供由 iOS / Android native UI 绘制的 Tab bar。传统 `<Tabs>` 可自定义较多 React 外观；NativeTabs 让系统负责原生标签栏交互、字体和平台呈现。

```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function Layout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name={'home'}>
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={'house'} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name={'settings'}>
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={'gearshape'} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

每个 Trigger 的 `name` 对应 `_layout` 中一个 route；也可以在单独 screen 内渲染 Trigger 的子组件，定义 label / icon / badge。

## NativeTabs 属性分类

| 配置方向 | Latest API 字段 | 说明 |
| --- | --- | --- |
| 选择 / 返回 | `backBehavior`、`disableIndicator`、`hidden` | Android 返回行为；选择指示和 tab bar 可见性。 |
| 外观颜色 | `backgroundColor`、`iconColor`、`indicatorColor`、`tintColor`、`badgeBackgroundColor`、`badgeTextColor` | tab bar、激活图标和 badge 颜色。 |
| 原生材质 | iOS `blurEffect`、`disableTransparentOnScrollEdge`、`titlePositionAdjustment`、`minimizeBehavior` | 选择毛玻璃、滚动边界显示、标签位移和 iOS 26+ tab bar 收缩方式。 |
| Android 表现 | `labelVisibilityMode`、`rippleColor`、`tabBarRespectsIMEInsets` | 标签显示规则、按压波纹和 IME / 键盘上移布局。 |
| 触发页设置 | `disabled`、`hidden`、`contentStyle`、`disableAutomaticContentInsets`、`listeners` | 禁用 tab 点按、隐藏项、页面内容与导航事件。 |
| Native host 扩展 | `unstable_nativeProps` | 往 `react-native-screens` 传 Router 没直接暴露的 host / screen 属性；可能被下一小版本调整。 |

属性可用平台不同。比如 `blurEffect` 是 iOS 样式，`rippleColor` 是 Android 交互效果；不要把所有设置都看作跨端通用 CSS。

## Trigger 子组件、图标与底部 accessory

- `NativeTabs.Trigger.Label` 可传字符串和选中态 label style。
- `NativeTabs.Trigger.Badge` 可显示 / 隐藏文字 badge。
- `NativeTabs.Trigger.Icon` 可用 Material `md`、Apple `sf`、Android `drawable`、iOS `xcasset` 或图片 `src`；部分 icon props 支持 default / selected 两种状态。
- `NativeTabs.Trigger.VectorIcon` 可加载指定 vector icon family；页面建议优先使用 Icon 的 Material / SF symbol prop。
- `NativeTabs.BottomAccessory` 可在 native tab host 下方渲染配件区。

页面也列出 type interfaces `DrawableIcon`、`MaterialIcon`、`SFSymbolIcon`、`SrcIcon`、`XcassetIcon`、`NativeTabsLabelStyle`、`SymbolOrImageSource`，分别描述资源格式和 label 类型。

## 关键名词

- **Native tab host**：由平台系统绘制和负责选中交互的标签栏容器。
- **Trigger**：一个可点击 tab / route。
- **SF Symbol / Material icon**：iOS / Android 各自的原生系统图标资源。
- **IME insets**：键盘显示时 Android 应用布局要留出的空间。
- **Bottom accessory**：原生 tab bar 下的内容栏，例如小型播放器控制条。

## 官方代码主题覆盖

源页代码主题均已覆盖：从 `expo-router/unstable-native-tabs` 导入并创建 NativeTabs、按 name 映射 routes、Label / Icon / Badge、原生图标资源格式、icon selected state、Android / iOS 样式属性、content insets / keyboard behavior、event listeners、BottomAccessory 和 `unstable_nativeProps`。v56 对应 API reference 已链接，Latest 推荐版本差异已说明。

## 下一页

页脚 **Next** 指向 [Split View](https://docs.expo.dev/versions/latest/sdk/router/split-view/)，介绍实验性的双栏路由布局。

**翻页：**[上一页：Expo Router Link API](./009-Expo-Router-Link.md) · [返回目录](./README.md) · [下一页：Split View API](./011-Split-View.md)
