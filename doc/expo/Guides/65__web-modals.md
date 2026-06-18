# Web 模态框（Web Modals）

> **原文地址**：https://docs.expo.dev/router/advanced/web-modals/
>
> **文档版本**：SDK 56.0.0 | 最后更新于 2026 年 6 月 11 日

---

## 功能状态

> **注意**：此功能目前处于 **alpha（内测）** 状态，需要 **SDK 54 或更高版本**。使用前必须设置特定的环境变量来启用该功能。

**关键术语解释**：
- **Alpha 状态**：表示功能尚在早期测试阶段，API 可能会发生变化，不建议在生产环境中直接使用。
- **SDK（Software Development Kit）**：软件开发工具包，这里指 Expo 的版本。

---

## 概述

现代 Web 应用需要灵活的模态界面（Modal Interface）。Expo Router 提供了多种展示样式，能够根据**视口宽度（viewport width）** 自动调整，并提供了专门的样式属性。

**关键术语解释**：
- **模态框（Modal）**：一种覆盖在当前页面上的弹窗界面，用户通常需要关闭它才能回到原页面。
- **视口（Viewport）**：浏览器中可见的区域大小，不同设备（手机、平板、桌面）的视口宽度不同。
- **底部表单（Bottom Sheet）**：一种从屏幕底部滑出的面板，常见于移动端应用。

---

## 快速开始

### 第一步：启用功能

在你的项目根目录的环境变量文件中添加所需的环境标志，或者在本地开发和 [export 构建](https://docs.expo.dev/deploy/web.md) 命令前添加该标志。

> **基于经验建议**：常见的做法是在项目根目录创建 `.env` 或 `.env.local` 文件，将环境变量写入其中，避免在命令行中反复添加。

### 第二步：配置布局文件

模态框通过应用布局文件（layout file）中的 `Stack.Screen` 组件进行配置。

```tsx
import { Stack } from 'expo-router';

export const unstable_settings = {
  anchor: 'index',
};

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal', // 启用模态行为
          sheetAllowedDetents: [0.5, 1], // 当屏幕宽度小于 768px 时的吸附位置数组
        }}
      />
    </Stack>
  );
}
```

**关键术语解释**：
- **`Stack.Screen`**：Expo Router 中用于定义堆栈导航中每个屏幕的组件。
- **`presentation`**：控制屏幕展示方式的属性，设为 `'modal'` 时以模态框形式展示。
- **`sheetAllowedDetents`**：控制底部表单（Sheet）可停靠的高度位置，值为 0 到 1 之间的小数数组。例如 `[0.5, 1]` 表示可以在 50% 和 100% 高度处停靠。
- **`unstable_settings`**：一个导出对象，用于配置路由器的不稳定（实验性）设置。`anchor` 指定锚定路由。

### 第三步：创建模态页面组件

模态组件返回一个基本的视图容器：

```tsx
import { Text, View } from 'react-native';

export default function Modal() {
  return <View style={{ flex: 1, padding: 16 }}>{/* 模态框内容放在这里 */}</View>;
}
```

### 第四步：从首页触发模态框

使用路由器的 `push` 方法打开模态框：

```tsx
import { router } from 'expo-router';
import { Pressable, Text, View, StyleSheet } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <Pressable onPress={() => router.push('/modal')} style={styles.button}>
        <Text style={styles.buttonText}>Open Modal</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

**关键术语解释**：
- **`router.push()`**：Expo Router 提供的导航方法，将新页面推入导航堆栈。
- **`Pressable`**：React Native 中可响应点击/按压事件的组件，比 `TouchableOpacity` 更灵活。
- **`StyleSheet`**：React Native 的样式工具，用于创建优化的样式对象。

---

## 锚点与嵌套堆栈（Anchors and Nested Stacks）

模态框需要正确设置锚点（anchor），以便在**深度链接（deep linking）** 时保留背景导航上下文。锚点充当基础路由。对于嵌套堆栈，需要在布局配置中定义锚点。

**关键术语解释**：
- **深度链接（Deep Linking）**：通过 URL 直接打开应用中的特定页面，而非从首页开始。
- **锚点（Anchor）**：指定一个基础路由，当通过深度链接访问模态框时，确保背景页面正确显示。

```tsx
export const unstable_settings = {
  anchor: 'index', // 锚定到 index 路由
};
```

> **基于经验建议**：如果你的应用有多层嵌套的 Stack 布局，务必在每个包含模态框的布局文件中都设置 `anchor`，否则深度链接时可能出现背景空白或导航异常。

---

## 模态展示样式（Modal Presentation Style）

模态框的外观在大屏幕和移动设备之间有所不同，取决于传递给屏幕选项的特定配置。

| 选项 | 类型 | 描述 |
| --- | --- | --- |
| `presentation` | 特定字符串字面量 | 指定视觉样式。宽屏显示居中覆盖层；窄屏对表单类型使用底部表单。透明变体允许看到背景，但不使用表单机制。 |
| `sheetAllowedDetents` | 数字数组或字符串 | 为窄视口设置停靠点（snap points）或自动调整大小。 |
| `sheetGrabberVisible` | 布尔值 | 切换顶部拖拽把手的显示（仅 iOS）。 |
| `sheetCornerRadius` | 数字 | 定义表单边缘的像素圆角半径。 |
| `webModalStyle` | 特定对象类型 | 提供 Web 专属的视觉调整属性。 |

**关键术语解释**：
- **停靠点（Detents / Snap Points）**：底部表单可以"吸附"停靠的高度位置，用户可以拖动到不同停靠点。
- **`formSheet`**：一种模态展示类型，以圆角表单形式呈现，通常在底部留出部分背景可见。
- **`transparentModal`**：透明模态框，背景内容可见，没有默认的背景遮罩。

> **基于文档内容推导**：`presentation` 的值决定了模态框在不同设备上的基础行为——宽屏（如桌面浏览器）默认使用居中弹窗样式，窄屏（如手机浏览器）则自动切换为底部表单样式。`transparentModal` 则跳过了这些自适应逻辑，始终使用透明背景。

---

## 使用 `webModalStyle` 自定义模态框样式

> **注意**：这些调整**仅影响 Web 环境**；移动端默认使用触控优化的底部表单（Sheet）。

| 属性 | 类型 | 描述 | 默认值 |
| --- | --- | --- | --- |
| `width` | 数字或字符串 | 通过像素或百分比调整桌面端宽度。 | `83vw` |
| `height` | 数字或字符串 | 通过像素或百分比调整桌面端高度。 | `79vh` |
| `minHeight` | 数字或字符串 | 设定桌面端最小高度，覆盖默认值。 | `min(586px, 79vh)` |
| `minWidth` | 数字或字符串 | 设定桌面端最小宽度，覆盖默认值。 | `min(936px, 83vw)` |
| `border` | 字符串 | 应用标准 CSS 边框定义。 | 无 |
| `overlayBackground` | 字符串 | 使用 CSS 颜色格式设置背景遮罩颜色。 | 半透明黑色 |
| `shadow` | 字符串 | 配置 CSS 投影滤镜（drop-shadow filter）。 | drop-shadow 滤镜 |

**关键术语解释**：
- **`vw` / `vh`**：CSS 视口单位。`1vw` = 视口宽度的 1%，`1vh` = 视口高度的 1%。
- **`drop-shadow`**：CSS 滤镜函数，为元素添加阴影效果，与 `box-shadow` 类似但作用于元素的不规则轮廓。
- **`min()`**：CSS 函数，返回参数中的最小值。例如 `min(586px, 79vh)` 表示取 586px 和 79vh 中较小的值。

---

### 自定义 CSS 变量

Expo Router 框架使用特定的 CSS 变量来进行模态框样式控制，你可以在全局范围内修改这些变量。

#### 宽度和高度尺寸变量

```css
/* 默认模态框宽度（桌面端为 83vw，遵循 iOS 26 规范） */
--expo-router-modal-width: 83vw;

/* 模态框最大宽度（默认最大 936px，83vw，遵循 iOS 26） */
--expo-router-modal-max-width: min(936px, 83vw);

/* 模态框最小宽度（默认 auto） */
--expo-router-modal-min-width: auto;

/* 默认模态框高度（79vh，遵循 iOS 26 规范） */
--expo-router-modal-height: 79vh;

/* 模态框最小高度（默认最小 586px，79vh，遵循 iOS 26） */
--expo-router-modal-min-height: min(586px, 79vh);
```

#### 边框和遮罩层样式变量

```css
/* 模态框边框（默认 none） */
--expo-router-modal-border: none;

/* 模态框圆角（默认 24px，遵循 iOS 26） */
--expo-router-modal-border-radius: 24px;

/* 模态框阴影滤镜（默认 drop-shadow） */
--expo-router-modal-shadow: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04))
  drop-shadow(0 4px 3px rgb(0 0 0 / 0.1));

/* 遮罩层背景颜色（默认 25% 黑色） */
--expo-router-modal-overlay-background: rgba(0, 0, 0, 0.25);
```

---

#### `webModalStyle` 如何映射到 CSS 变量

通过配置对象传入的值会自动更新对应的 CSS 变量：

```tsx
// 这个 webModalStyle 配置
webModalStyle: {
  width: 800,
  height: 600,
  border: '2px solid blue',
  overlayBackground: 'rgba(0, 0, 0, 0.7)',
  shadow: 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))',
}

// ...会自动设置这些 CSS 变量：
// --expo-router-modal-width: 800px
// --expo-router-modal-height: 600px
// --expo-router-modal-border: 2px solid blue
// --expo-router-modal-overlay-background: rgba(0, 0, 0, 0.7)
// --expo-router-modal-shadow: drop-shadow(0 8px 16px rgba(0,0,0,0.2))
```

> **基于文档内容推导**：数字类型的值（如 `width: 800`）会自动加上 `px` 单位，字符串类型的值（如 `width: '83vw'`）则直接使用。这意味着你可以灵活地混用固定像素和相对单位。

---

## 常见示例

### 全屏模态框示例

通过将宽度和高度调整为 95 视口单位并移除边框，可以最大化覆盖范围：

```tsx
import { Stack } from 'expo-router';

export const unstable_settings = {
  anchor: 'index',
};

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
          webModalStyle: {
            width: '95vw',
            height: '95vh',
            border: 'none',
          },
        }}
      />
    </Stack>
  );
}
```

对于移动端，结合"适应内容"的停靠点设置，可以防止模态框占满整个屏幕：

```tsx
import { Stack } from 'expo-router';

export const unstable_settings = {
  anchor: 'index',
};

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
          webModalStyle: {
            width: '95vw',
            height: '95vh',
            border: 'none',
          },
          sheetAllowedDetents: 'fitToContents',
        }}
      />
    </Stack>
  );
}
```

**关键术语解释**：
- **`fitToContents`**：`sheetAllowedDetents` 的特殊字符串值，表示底部表单的高度自动适应其内容高度，而非固定比例。

---

### 紧凑型模态框示例

通过设置固定宽度、自动高度、最小高度和细边框来设计较小的对话框：

```tsx
import { Stack } from 'expo-router';

export const unstable_settings = {
  anchor: 'index',
};

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
          webModalStyle: {
            width: 400,
            height: 'auto',
            minHeight: 200,
            border: '1px solid #e5e7eb',
            overlayBackground: 'rgba(0, 0, 0, 0.3)',
          },
          sheetCornerRadius: 12,
          sheetAllowedDetents: 'fitToContents',
        }}
      />
    </Stack>
  );
}
```

> **基于经验建议**：紧凑型模态框适合用于确认对话框、表单输入弹窗等场景。设置 `height: 'auto'` 让内容决定高度是最佳实践，避免内容溢出或空白过多。

---

### 透明模态框示例

通过切换展示类型来保持底层视觉上下文（即看到背景内容）：

```tsx
import { Stack } from 'expo-router';

export const unstable_settings = {
  anchor: 'index',
};

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'transparentModal',
        }}
      />
    </Stack>
  );
}
```

> **基于文档内容推导**：`transparentModal` 不会自动添加背景遮罩层，因此你需要在模态页面组件中自行实现背景遮罩和关闭逻辑（参见下方"自定义模态路由实现"部分）。

---

### 圆角半径示例

使用 `sheetCornerRadius` 属性配合 `formSheet` 展示类型来修改边缘圆角：

```tsx
import { Stack } from 'expo-router';

export const unstable_settings = {
  anchor: 'index',
};

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.4],
          sheetCornerRadius: 32,
        }}
      />
    </Stack>
  );
}
```

---

### 自定义停靠点示例

使用小数数组指定多个停靠高度：

```tsx
import { Stack } from 'expo-router';

export const unstable_settings = {
  anchor: 'index',
};

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.2, 0.5, 0.8, 0.98],
        }}
      />
    </Stack>
  );
}
```

> **基于经验建议**：多个停靠点适用于内容可能动态变化的场景（例如地图应用中先显示摘要，用户上拉后显示完整详情）。数组中的值应按从小到大排列，`0.98` 比 `1.0` 更推荐，因为它保留了顶部状态栏的可见性。

---

## 全局 CSS 自定义

通过在根级 [全局 CSS](https://docs.expo.dev/versions/latest/config/metro.md#global-css) 样式表中定义变量，可以在整个应用范围内覆盖默认的模态框尺寸和视觉特性：

```css
/* 全局覆盖默认模态框样式 */
:root {
  --expo-router-modal-width: 700px;
  --expo-router-modal-min-width: auto;
  --expo-router-modal-max-width: 95vw;
  --expo-router-modal-height: 640px;
  --expo-router-modal-min-height: 640px;
  --expo-router-modal-border: none;
  --expo-router-modal-border-radius: 16px;
  --expo-router-modal-shadow: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
  --expo-router-modal-overlay-background: rgba(0, 0, 0, 0.5);
}
```

> **基于经验建议**：全局 CSS 变量的优先级低于 `webModalStyle` 属性配置。如果你需要为不同模态框设置不同样式，应使用 `webModalStyle`；如果希望统一所有模态框的风格，则全局 CSS 是更好的选择。

---

## 自定义模态路由实现

通过组合 `transparentModal` 展示类型、自定义样式和 [react-native-reanimated](https://docs.expo.dev/versions/latest/sdk/reanimated.md#installation) 库，可以创建一个带有渐背景遮罩并聚焦于中心内容的自定义模态框。

### 更新根布局

将根布局改为使用透明展示类型、淡入动画和隐藏标题栏：

```tsx
import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
```

> **注意**：`unstable_settings` 导出目前仅适用于 Stack 导航器。设置 `initialRouteName` 可确保在直接导航时正确的渲染顺序。

**关键术语解释**：
- **`animation: 'fade'`**：指定页面切换时使用淡入淡出动画效果。
- **`headerShown: false`**：隐藏导航栏头部，模态框通常不需要默认的导航栏。
- **`initialRouteName`**：指定堆栈导航器的初始路由名称。

### 实现模态页面

使用动画视图实现入场效果，使用绝对填充的可按压区域实现点击外部关闭，使用标准链接进行导航：

```tsx
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

export default function Modal() {
  return (
    <Animated.View
      entering={FadeIn}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000040',
      }}
    >
      {/* 点击模态框外部区域时关闭模态框 */}
      <Link href={'/'} asChild>
        <Pressable style={StyleSheet.absoluteFill} />
      </Link>
      <Animated.View
        entering={SlideInDown}
        style={{
          width: '90%',
          height: '80%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
        }}
      >
        <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Modal Screen</Text>
        <Link href="/">
          <Text>← Go back</Text>
        </Link>
      </Animated.View>
    </Animated.View>
  );
}
```

**关键术语解释**：
- **`react-native-reanimated`**：一个高性能的 React Native 动画库，提供了比内置 `Animated` API 更强大的动画能力。
- **`FadeIn`**：Reanimated 提供的入场动画，元素从透明渐变到完全可见。
- **`SlideInDown`**：Reanimated 提供的入场动画，元素从上方滑入。
- **`StyleSheet.absoluteFill`**：一个预设样式，使元素绝对定位并铺满父容器，这里用于创建一个覆盖整个屏幕的可点击遮罩层。
- **`asChild`**：`Link` 组件的属性，将链接行为委托给子元素，而非渲染额外的 `<a>` 标签。

> **基于经验建议**：自定义模态实现中，`#00000040` 是带透明度（约 25%）的黑色，等价于 `rgba(0, 0, 0, 0.25)`。如果你需要更精确的透明度控制，建议使用 `rgba()` 格式。此外，确保安装了 `react-native-reanimated` 并正确配置了 Babel 插件，否则动画将不会生效。

---

## 总结与最佳实践

> **基于文档内容推导**：

1. **选择合适的展示类型**：
   - 常规弹窗 → `presentation: 'modal'`
   - 需要看到背景 → `presentation: 'transparentModal'`
   - 底部表单风格 → `presentation: 'formSheet'`

2. **响应式设计**：
   - Web 端通过 `webModalStyle` 控制桌面端样式
   - 移动端通过 `sheetAllowedDetents`、`sheetCornerRadius` 等属性控制底部表单
   - 768px 是宽屏与窄屏行为的分界点

3. **样式定制的三个层次**：
   - **组件级**：通过 `webModalStyle` 属性（优先级最高）
   - **全局级**：通过 CSS 变量（统一所有模态框）
   - **完全自定义**：使用 `transparentModal` + 动画库（最灵活）

4. **别忘了锚点**：每个包含模态框的布局文件都应设置 `anchor`，确保深度链接正常工作。

---

## 文档导航

- **上一页**：[modals](./64__modals.md)
- **下一页**：[shared routes](./66__shared-routes.md)
