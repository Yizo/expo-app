# Expo Router iOS 缩放转场

## 文档解决的问题

本文说明如何让用户从缩略图、卡片等源元素进入详情页时，使用 iOS 原生缩放动画把源元素自然过渡到目标页面，从而增强页面之间的空间关系。

> **文档明确说明：** 这是 Alpha API，仅在 Expo SDK 55 及以上提供，并且真正的缩放效果仅支持 iOS 18 及以上。

## 核心概念

- `Link.AppleZoom`：标记转场的源元素。
- `Link.AppleZoomTarget`：可选，标记目标页中用于对齐动画的元素。
- `Link`：负责实际路由跳转；`AppleZoom` 必须位于带 `asChild` 的 `Link` 内。
- `usePreventZoomTransitionDismissal`：控制缩放页面的交互式滑动关闭手势。

缩放转场依赖 iOS 18+ 原生 API。旧版 iOS 和其他平台仍正常导航，只是不显示缩放动画。

## 基础实现

源页面：

```tsx
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable } from 'react-native';

<Link href="/image" asChild>
  <Link.AppleZoom>
    <Pressable>
      <Image
        source={{ uri: 'https://example.com/image-1.jpg' }}
        style={{ width: 100, height: 200 }}
      />
    </Pressable>
  </Link.AppleZoom>
</Link>;
```

目标页面正常渲染对应内容即可。若需要精确指定目标对齐位置，在目标元素外包裹：

```tsx
<Link.AppleZoomTarget>
  <Image source={source} style={{ width: '100%' }} />
</Link.AppleZoomTarget>
```

`Link.AppleZoom` 也可以只包裹可点击卡片中的一部分，让图片参与缩放、标题保持普通转场。

## 对齐与尺寸

通常使用 `Link.AppleZoomTarget` 即可建立目标对齐。若需要直接控制对齐矩形，可向源端传入 `alignmentRect`：

```tsx
<Link.AppleZoom alignmentRect={{ x: 0, y: 0, width: 200, height: 300 }}>
  <Image source={source} style={{ width: 100, height: 150 }} />
</Link.AppleZoom>
```

完整图库示例中，源页面在图片加载后记录原始宽高，并通过路由参数传给详情页；详情页首屏据此计算保持宽高比的目标尺寸。这样目标布局在第一次渲染时就可测量，动画对齐更稳定。

## 控制关闭手势

完全禁止交互式滑动关闭：

```tsx
import { usePreventZoomTransitionDismissal } from 'expo-router';

export default function DetailScreen() {
  usePreventZoomTransitionDismissal();
  return null;
}
```

也可以通过实验性 `unstable_dismissalBoundsRect` 只允许手势从指定矩形开始：

```tsx
usePreventZoomTransitionDismissal({
  unstable_dismissalBoundsRect: {
    minX: 100,
    minY: 100,
    maxX: 300,
    maxY: 300,
  },
});
```

该矩形适合把关闭手势限制在图片区域，避免用户操作页面其他控件时误触。

## 关键限制与坑点

- 仅 Router 内置 `Stack` 导航器支持该能力。
- `Link.AppleZoom` 必须是带 `asChild` 的 `Link` 的直接或间接子元素，否则会报错。
- `Link.AppleZoom` 和 `Link.AppleZoomTarget` 都只能有一个直接子组件；多个元素必须先包进一个 `View`。
- 文档建议避免在带 Header/导航栏的页面之间使用，iOS 原生 API 存在视觉异常或不可预期行为。
- 与 `Link.Preview` 一起使用时，目标页必须采用 Modal 展示，例如 `presentation: 'fullScreenModal'`；否则会回退到普通转场。
- `usePreventZoomTransitionDismissal` 对 Modal 页面无效。
- 快速打开、关闭、再打开时可能出现约 1 秒延迟，这是 `react-native-screens` 上游转场处理问题。
- iOS 18 以下和其他平台不会报废页面，而是优雅降级为标准导航。

## React Web 开发者容易误解的地方

- 这不是 CSS View Transitions 或 Framer Motion 的共享布局动画，而是 iOS 原生导航转场，生命周期和限制由原生 Stack 控制。
- “单个 child”是组件结构要求，不是只允许显示一个视觉元素；可先用 `View` 包装多个元素。
- 目标页尺寸会影响原生动画对齐。Web 中常见的“页面加载后再自然撑开”可能导致首帧测量不足，因此示例提前传递图片宽高。
- 非 iOS 平台正常渲染并不代表拥有同样动画效果。

## 实际开发建议

> **基于文档内容推导：** 先在无 Header、非 Modal、简单图片详情页上验证缩放转场，再加入预览、复杂手势或自定义对齐，能减少多个原生限制叠加后的排查难度。

> **基于文档内容推导：** 动画只应作为体验增强，页面跳转和信息理解不能依赖该效果，因为不支持的平台会自动使用普通导航。

当前文档未涉及：Android 等价转场、动画时长或缓动参数、自定义降级动画、安装额外原生依赖的命令。

<!-- NAVIGATION START -->
---
[← 上一页：Expo Router Stack 原生工具栏](./72_stack-toolbar.md) | [下一页：Expo Router API Routes →](./74_api-routes.md)
<!-- NAVIGATION END -->
