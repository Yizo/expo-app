# iOS 缩放动画过渡（Zoom Transition）

> 原始文档地址：[https://docs.expo.dev/router/advanced/zoom-transition/](https://docs.expo.dev/router/advanced/zoom-transition/)

---

## 概述

本指南介绍如何在 iOS 设备上通过 Expo Router 实现**缩放动画过渡**（Zoom Transition），即从一个源组件平滑扩展到目标视图的动画效果。

该功能利用 **iOS 18** 的原生能力，在不同路由之间建立空间上下文关系——例如，将一个小缩略图放大过渡为一个大尺寸的详情头部图片。

> **关键术语解释（面向初学者）：**
>
> - **缩放过渡（Zoom Transition）**：一种页面切换动画，源元素在视觉上"扩展"为目标页面上的对应元素，给用户一种"从缩略图放大到全图"的连续感。
> - **路由（Route）**：应用中的一个页面或视图。Expo Router 使用文件系统路由，每个文件对应一个页面。
> - **空间上下文（Spatial Context）**：指源页面和目标页面之间的视觉空间关系，让用户在页面切换时能感知到"从哪里来、到哪里去"。

### 实验性状态

> **Alpha 特性**
>
> 此功能当前标记为 **alpha**（内测阶段），需要 **Expo SDK 55** 或更高版本。API 可能会发生**破坏性变更**（breaking changes），请在生产项目中谨慎使用。

> **基于经验建议：** 由于该功能处于 alpha 阶段，建议在实验性项目或个人项目中先行尝试，待 API 稳定后再引入正式的生产环境。

---

## 基础用法

实现缩放动画过渡的核心步骤非常简单：将源元素包裹在 `Link.AppleZoom` 组件中，可选地在目标页面使用 `Link.AppleZoomTarget` 来精确定位。

### 源页面（起始页）

将你的源图像（或其他组件）包裹在 `Link.AppleZoom` 中，并放置在带有 `asChild` 属性的 `Link` 内部：

```tsx
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Image } from 'expo-image';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Link href="/image" asChild>
        <Link.AppleZoom>
          <Pressable>
            <Image
              source={{ uri: 'https://example.com/image-1.jpg' }}
              style={{ width: 100, height: 200 }}
            />
          </Pressable>
        </Link.AppleZoom>
      </Link>
    </View>
  );
}
```

> **关键术语解释（面向初学者）：**
>
> - **`asChild`**：`Link` 组件的一个属性，表示将链接行为委托给子组件，而非渲染额外的 `<a>` 标签。这在 React Native 中非常常见，用于将导航行为附加到自定义组件上。
> - **`Link.AppleZoom`**：Expo Router 提供的子组件，标记缩放动画的**源元素**（即动画起始位置的组件）。
> - **`Pressable`**：React Native 内置的可点击组件，提供触摸反馈。

### 目标页面（详情页）

在目标页面上，直接渲染目标图像即可：

```tsx
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

export default function DetailsScreen() {
  return <Image source={{ uri: 'https://example.com/image-1.jpg' }} style={{ flex: 1 }} />;
}
```

---

## 使用源包装器（Source Wrapper）

`Link.AppleZoom` 用于标记动画的**起始点**。当你只想让特定内容参与动画，而保持其他元素静止时，这个组件非常有用。

> **重要限制：** `Link.AppleZoom` 仅接受**一个直接子节点**。如果需要包裹多个元素，必须用一个容器（如 `View`）将它们包裹起来。

```tsx
<Link href="/image" asChild>
  <Pressable>
    <Link.AppleZoom>
      <View>{/* 你的内容 */}</View>
    </Link.AppleZoom>
    <Text>副标题（不参与动画）</Text>
  </Pressable>
</Link>
```

> **基于经验建议：** 将 `Link.AppleZoom` 放在 `Pressable` 内部（而非外部）可以让触摸反馈更自然。注意上面的结构中，`Link.AppleZoom` 和 `<Text>` 都是 `Pressable` 的子节点，但只有被 `Link.AppleZoom` 包裹的 `View` 会参与缩放动画。

---

## 调整目标定位（Target Positioning）

### 使用 `Link.AppleZoomTarget`

在目标页面上使用 `Link.AppleZoomTarget` 来定义动画的**落点位置**：

```tsx
export default function ImageScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Link.AppleZoomTarget>
        <Image source={{ uri: 'https://example.com/image-1.jpg' }} style={{ width: '100%' }} />
      </Link.AppleZoomTarget>
    </View>
  );
}
```

> **关键术语解释（面向初学者）：**
>
> - **`Link.AppleZoomTarget`**：Expo Router 提供的子组件，标记缩放动画的**目标元素**（即动画终点位置的组件）。它告诉系统"动画应该在这里结束"。

### 使用自定义对齐矩形（Alignment Rectangle）

在大多数情况下，`Link.AppleZoomTarget` 已足够使用。但如果需要更精确的控制，可以传入自定义的 `alignmentRect` 属性：

```tsx
<Link.AppleZoom alignmentRect={{ x: 0, y: 0, width: 200, height: 300 }}>
  <Image source={{ uri: 'https://example.com/image-1.jpg' }} style={{ width: 100, height: 150 }} />
</Link.AppleZoom>
```

> **基于文档内容推导：** `alignmentRect` 定义了组件在动画中实际参与的区域（坐标和尺寸），底层使用 Apple 的 `alignmentRectProvider` 机制。当组件的视觉边界与其实际布局边界不一致时（例如图片有内边距或阴影），此属性特别有用。

---

## 完整图库示例（Gallery Implementation）

以下是一个完整的图库（Gallery）实现示例，展示了如何通过路由参数传递图片尺寸信息，以便在目标页面上计算正确的宽高比。

### 源页面——缩略图网格

源页面遍历图片数组，将每张图片包裹在 `Link.AppleZoom` 中，并通过路由参数传递图片的原始尺寸：

```tsx
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, Pressable, ScrollView, StyleSheet } from 'react-native';

const IMAGES = [
  // 在此定义你的图片数组
];

export default function Index() {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
      contentInsetAdjustmentBehavior="automatic">
      {IMAGES.map((_, index) => (
        <Thumbnail key={index} index={index} />
      ))}
    </ScrollView>
  );
}

function Thumbnail({ index }: { index: number }) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  return (
    <Link
      href={{
        pathname: `/image/[id]`,
        // 你需要将图片尺寸传递到详情页，这样布局可以在首次渲染时进行计算
        params: { id: index, width: size?.width, height: size?.height },
      }}
      asChild>
      <Pressable style={styles.thumbnail}>
        <Link.AppleZoom>
          <Image
            source={IMAGES[index % IMAGES.length]}
            style={styles.thumbnailImage}
            onLoad={e => setSize({ width: e.source.width, height: e.source.height })}
          />
        </Link.AppleZoom>
        <Text style={{ textAlign: 'center' }}>Photo {index + 1}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  scrollViewContent: {
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  thumbnail: {
    width: 170,
    aspectRatio: 1,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
});
```

> **关键术语解释（面向初学者）：**
>
> - **`useLocalSearchParams`**：Expo Router 提供的 Hook，用于获取当前路由的参数（类似于 Web 开发中的 URL query 参数）。
> - **`onLoad`**：`Image` 组件的事件回调，在图片加载完成时触发，可以获取图片的原始宽高。
> - **动态路由 `[id]`**：Expo Router 的文件系统路由约定，方括号表示该路径段是动态参数。例如 `/image/[id]` 可以匹配 `/image/0`、`/image/1` 等。

> **基于经验建议：** 注意代码中 `onLoad` 获取的图片尺寸通过路由 `params` 传递到详情页。这是因为目标页面需要在**首次渲染时**就知道图片尺寸来计算布局，否则动画过渡时可能出现尺寸跳变。

### 目标页面——图片详情

目标页面读取路由参数，根据窗口尺寸和图片原始尺寸计算最优显示大小（保持宽高比），并将图片包裹在 `Link.AppleZoomTarget` 中：

```tsx
import { Image } from 'expo-image';
import { Link, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

export default function ImagePage() {
  const params = useLocalSearchParams();
  const index = params.id ? parseInt(params.id as string, 10) : 0;
  const imageSource = IMAGES[index % IMAGES.length];
  const imageSize = {
    width: parseInt(params.width as string, 10),
    height: parseInt(params.height as string, 10),
  };
  const windowDimensions = useWindowDimensions();
  // 计算在保持宽高比的前提下，适应窗口的最佳尺寸
  const computedSize = useMemo(() => {
    if (!imageSize.width || !imageSize.height) {
      return { width: windowDimensions.width, height: windowDimensions.height };
    }
    const widthRatio = windowDimensions.width / imageSize.width;
    const heightRatio = windowDimensions.height / imageSize.height;
    const minRatio = Math.min(widthRatio, heightRatio);
    return {
      width: imageSize.width * minRatio,
      height: imageSize.height * minRatio,
    };
  }, [imageSize, windowDimensions]);

  return (
    <View style={styles.container}>
      <Link.AppleZoomTarget>
        <View style={{ ...computedSize }}>
          <Image source={imageSource} style={styles.image} />
        </View>
      </Link.AppleZoomTarget>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
```

> **基于文档内容推导：** `computedSize` 的计算逻辑采用了经典的"适应容器"算法：分别计算宽度和高度的缩放比例，取较小值作为最终缩放比，确保图片完整显示在窗口内而不被裁切。

---

## 管理滑动关闭手势（Swipe-to-Dismiss）

Expo Router 提供了 `usePreventZoomTransitionDismissal` Hook 来管理交互式滑动返回手势。这个 Hook 可以防止意外关闭，或将关闭手势限制在屏幕的特定区域内。

> **关键术语解释（面向初学者）：**
>
> - **滑动关闭（Swipe-to-Dismiss）**：iOS 上的常见交互模式，用户可以从屏幕顶部向下滑动来关闭当前页面。在缩放过渡中，这个手势会让图片"缩回"到源位置。
> - **Hook**：React 的特殊函数，让你在函数组件中使用状态和其他 React 特性。以 `use` 开头命名。

### 完全禁用滑动关闭

不带参数调用 `usePreventZoomTransitionDismissal()`，将完全禁用滑动返回手势，用户只能通过导航按钮返回：

```tsx
import { usePreventZoomTransitionDismissal } from 'expo-router';

export default function DetailScreen() {
  usePreventZoomTransitionDismissal();
  // 滑动手势已被禁用 —— 用户必须通过导航控件返回
  return <View>{/* 内容 */}</View>;
}
```

### 限制关闭区域

传入一个边界矩形（bounding rectangle），只允许在该区域内发起的滑动手势触发关闭。这对图片查看器场景非常理想：

```tsx
import { usePreventZoomTransitionDismissal } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

export default function DetailScreen() {
  // 只允许在此矩形范围内发起的手势触发关闭
  usePreventZoomTransitionDismissal({
    unstable_dismissalBoundsRect: { minX: 100, minY: 100, maxX: 300, maxY: 300 },
  });

  return (
    <View style={styles.container}>
      {/* 关闭区域的可视化指示（仅用于演示） */}
      <View style={styles.dismissalZone} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
  },
  dismissalZone: {
    position: 'absolute',
    left: 100,
    top: 100,
    width: 200, // maxX - minX = 300 - 100
    height: 200, // maxY - minY = 300 - 100
    borderWidth: 2,
    borderColor: 'rgba(0, 122, 255, 0.5)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
});
```

> **基于文档内容推导：** `unstable_dismissalBoundsRect` 使用 `minX`、`minY`、`maxX`、`maxY` 四个值定义一个矩形区域（而非 `x, y, width, height`），这与 Apple 原生 API 的坐标系保持一致。属性名中的 `unstable_` 前缀表明该 API 可能在未来版本中发生变化。

> **基于经验建议：** 在图片查看器应用中，建议将关闭区域限制在图片本身所在的范围内，这样用户在滑动页面其他区域（如文字描述、评论区）时不会意外触发关闭。

---

## 操作系统兼容性

缩放动画过渡需要 **iOS 18** 或更高版本。在不支持的设备或操作系统上，组件会正常渲染，但**不会出现特殊的缩放动画**——即自动降级为标准页面过渡。

> **基于经验建议：** 如果你的应用需要同时支持 iOS 和 Android，请确保页面在没有缩放动画的情况下依然有良好的用户体验。不要依赖此动画来传达关键信息。

---

## 已知限制

以下是目前该功能的已知限制，使用时需要特别注意：

### 1. 导航栏冲突

> **警告：** 避免将缩放过渡与导航栏（headers/top bars）一起使用，原生 iOS 存在 Bug，会导致**视觉异常**（visual glitches）。

### 2. 链接预览（Link Previews）限制

将缩放过渡与链接预览功能结合使用时，目标页面必须是 **`fullScreenModal`** 模式，否则会回退到标准过渡动画。

> **关键术语解释（面向初学者）：**
>
> - **`fullScreenModal`**：一种页面展示模式，新页面以全屏模态框的形式覆盖当前页面，而非推入导航栈。在 Expo Router 中可以通过布局配置来设置。

### 3. 模态页面上的手势限制不生效

`usePreventZoomTransitionDismissal` Hook 在**模态页面（modal screens）**上不起作用，标准手势行为将照常生效。

### 4. 单子节点要求

`Link.AppleZoom` 和 `Link.AppleZoomTarget` 都严格要求只有**一个子节点**。传入多个子节点会触发警告和渲染失败。

**错误写法：**

```tsx
<Link.AppleZoom>
  <View />
  <Text />
</Link.AppleZoom>
```

**正确写法：**

```tsx
<Link.AppleZoom>
  <View>
    <Image />
    <Text />
  </View>
</Link.AppleZoom>
```

### 5. 延迟问题

在快速连续执行打开/关闭操作时，可能会出现**约一秒钟的延迟**。这是底层原生 screens 库的上游问题（已在 GitHub issue #42797 中跟踪），团队正在积极调查和修复。

> **基于经验建议：** 如果你的应用场景中用户可能快速反复打开和关闭图片详情（例如图片浏览器），建议添加防抖（debounce）机制或在 UI 上增加加载提示，避免用户感知到延迟。

### 6. 导航器限制

缩放过渡仅在内置的 **Stack 导航器**中有效。其他导航器（如 Tab、Drawer 等）不支持此功能。

### 7. 上下文要求

`Link.AppleZoom`（源包装器）必须嵌套在使用了 `asChild` 属性的 `Link` 组件内部。

### 8. 操作系统要求

动画严格要求 **iOS 18+**，但在低版本 iOS 或 Android 上 UI 仍会正常渲染（只是没有动画效果）。

---

## API 速查表

| API | 用途 | 说明 |
|-----|------|------|
| `Link.AppleZoom` | 标记缩放动画的**源元素** | 必须嵌套在带 `asChild` 的 `Link` 内，仅接受一个子节点 |
| `Link.AppleZoomTarget` | 标记缩放动画的**目标元素** | 用于目标页面上精确定位动画落点，仅接受一个子节点 |
| `alignmentRect` | 自定义对齐矩形 | `Link.AppleZoom` 的属性，提供精确的动画区域坐标 |
| `usePreventZoomTransitionDismissal()` | 完全禁用滑动关闭 | 不带参数调用时禁用所有滑动返回手势 |
| `usePreventZoomTransitionDismissal({ unstable_dismissalBoundsRect })` | 限制关闭区域 | 只在指定矩形区域内允许滑动关闭 |

---

## 文档导航

- **上一页**：[stack toolbar](./74__stack-toolbar.md)
- **下一页**：[api routes](./76__api-routes.md)
