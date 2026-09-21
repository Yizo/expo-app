# 233｜react-native-svg 矢量图形

**翻页：**[上一页：react-native-screens 原生屏幕](./232-Expo-ThirdParty-Screens.md) · [目录](./README.md) · [下一页：react-native-view-shot 截图](./234-Expo-ThirdParty-ViewShot.md)

**官方页面：**[React Native SVG · Latest](https://docs.expo.dev/versions/latest/sdk/svg/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/svg/) · [库的完整官方文档](https://github.com/software-mansion/react-native-svg)

**版本与平台：**Latest 与 SDK v56 reference 均推荐 `react-native-svg 15.15.4`。支持 Android、iOS、macOS、tvOS、Web，并包含在 Expo Go 中；可渲染 SVG 矢量图形，并支持交互和动画。

## 用 React Native 组件绘制 SVG

`react-native-svg` 把 SVG 元素映射为 React Native 组件，例如 `Circle`、`Rect`、`Path`、`ClipPath` 和 `Polygon`。它支持大多数 SVG 元素与属性。官方基础示例在一个 100×100 的坐标空间中画绿色圆形和黄色方形：

```tsx
import Svg, { Circle, Rect, type SvgProps } from 'react-native-svg';

export default function SvgComponent(props: SvgProps) {
  return (
    <Svg height="50%" width="50%" viewBox="0 0 100 100" {...props}>
      <Circle cx="50" cy="50" r="45" stroke="blue" strokeWidth="2.5" fill="green" />
      <Rect x="15" y="15" width="70" height="70" stroke="red" strokeWidth="2" fill="yellow" />
    </Svg>
  );
}
```

安装与 Expo SDK 兼容的版本：

```sh
npx expo install react-native-svg
yarn expo install react-native-svg
pnpm expo install react-native-svg
bun expo install react-native-svg
```

已有的纯 React Native 工程还需要先安装 Expo，再根据[库的 README](https://github.com/software-mansion/react-native-svg)完成原生安装配置。

## SVG 资源与工具

- [Lucide](https://lucide.dev/)：可直接查找和使用的 SVG 图标库。
- [Figma](https://www.figma.com/)：创建或修改 SVG 图形。
- [SVGOMG](https://jakearchibald.github.io/svgomg/)：压缩 / 优化 SVG 文件。
- [SVGR](https://react-svgr.com/)：在浏览器中把 SVG 转成 React Native / Expo 组件。

优化 SVG 时，官方特别提示 Android 使用时不要删掉 `viewBox`；它定义图形内部坐标区域与外部显示尺寸如何对应。

## 新手名词解释

- **SVG（Scalable Vector Graphics）：**以线条、路径、圆形等数学图形描述图像；放大时通常不会像位图那样模糊。
- **Vector primitive（矢量图形原语）：**构成复杂图像的基础 SVG 元素，例如 `Circle`、`Rect`、`Path`。
- **`viewBox`：**定义 SVG 的内部坐标系。本例 `0 0 100 100` 表示从原点 `(0,0)` 到 `(100,100)` 的绘图区域。
- **SVG 优化：**移除冗余元数据和格式内容以减小资源体积；优化后需要确认 `viewBox` 保留、Android 渲染仍正确。

## 源页代码主题覆盖

- Installation：保留 npx、Yarn、pnpm、Bun 四种安装命令。
- API / Svg：覆盖默认 namespace 导入与基础 SVG 组件示例。
- Tips：列出 Lucide、Figma、SVGOMG、SVGR，并保留 Android 的 `viewBox` 提示。
- Latest 与 SDK v56 的代码、平台和 Next 顺序一致，推荐版本均为 `15.15.4`。

**翻页：**[上一页：react-native-screens 原生屏幕](./232-Expo-ThirdParty-Screens.md) · [目录](./README.md) · [下一页：react-native-view-shot 截图](./234-Expo-ThirdParty-ViewShot.md)
