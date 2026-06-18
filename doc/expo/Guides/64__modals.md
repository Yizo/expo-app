# 模态框（Modals）

> **原文地址**：https://docs.expo.dev/router/advanced/modals/

模态框（Modal）是一种覆盖在现有屏幕之上的界面元素，常用于提示alert、确认对话框或表单等场景。在 Expo Router 中，有两种主要方式来实现模态框：

1. **React Native 内置的 `<Modal>` 组件** —— 适合独立的简单任务或短暂的确认对话框，不需要与导航系统深度集成。
2. **Expo Router 的文件路由系统** —— 通过创建一个路由文件来实现模态框，适合复杂的多步骤工作流，支持深层链接（deep link）。

> **关键术语说明（面向初学者）**：
> - **模态框（Modal）**：一种悬浮在当前页面之上的界面层，通常需要用户交互后才能返回主界面。类似于网页中的"弹窗"。
> - **深层链接（Deep Link）**：通过 URL 直接打开应用内某个特定页面的能力。
> - **presentation（展示方式）**：控制页面以何种形式出现，例如以普通页面、模态框或底部抽屉的形式展示。
> - **detent（停靠点）**：底部表单（form sheet）可以"停靠"在不同的高度位置，每个高度就是一个 detent。

---

## 使用 React Native 的 `<Modal>` 组件

React Native 内置的 `<Modal>` 组件是一个核心 API，适用于以下场景：

- 孤立的任务（与其他页面没有导航关联）
- 简短的确认对话框
- 不需要与 Expo Router 导航系统集成的简单覆盖层

你可以对它进行自定义，满足大多数标准的覆盖层需求。

> **基于经验建议**：如果你的弹窗只需要展示一段文字确认（如"是否删除？"）或一个简单的输入框，使用 React Native 的 `<Modal>` 组件就足够了，不必引入路由级别的模态框。

---

## 使用 Expo Router 实现模态屏（Modal Screen）

这种方式通过在应用目录中创建路由文件来实现模态框，适用于：

- 复杂的多步骤工作流
- 需要支持深层链接的场景
- 需要与导航栈（navigation stack）深度集成的模态界面

### 基本用法

你需要创建一个特定的文件结构，包含一个布局文件（layout）、一个首页（index）和一个模态页（modal）。

**布局文件（layout.tsx）**：在 `<Stack>` 中将某个 screen 的 `presentation` 设置为 `'modal'`。

```tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
```

**首页文件（index.tsx）**：使用 `<Link>` 组件导航到模态页。

```tsx
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text>Home screen</Text>
      <Link href="/modal" style={styles.link}>
        Open modal
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    paddingTop: 20,
    fontSize: 20,
  },
});
```

**模态页文件（modal.tsx）**：展示模态框的内容。

```tsx
import { StyleSheet, Text, View } from 'react-native';

export default function Modal() {
  return (
    <View style={styles.container}>
      <Text>Modal screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

---

### 展示与关闭行为（Presentation and Dismiss Behavior）

当模态框处于活跃状态时，它会失去之前的上下文（prior context）。关闭行为因平台而异：

| 平台 | 展示方式 | 关闭方式 |
|------|---------|---------|
| **Android** | 从当前视图上方滑入 | 使用返回按钮 |
| **iOS** | 从底部向上滑入 | 向下轻扫（swipe down） |
| **Web** | 视为独立路由 | 需要手动实现关闭逻辑 |

> **注意**：Web 端的模态框不会自动提供关闭手势，你需要自行编写关闭逻辑。

**在模态页中添加关闭按钮的示例**：

```tsx
import { Link, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function Modal() {
  const isPresented = router.canGoBack();

  return (
    <View style={styles.container}>
      <Text>Modal screen</Text>
      {isPresented && <Link href="../">Dismiss modal</Link>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

> **代码说明**：
> - `router.canGoBack()` 用于检测是否可以从当前页面返回。如果可以返回（说明模态框是在已有页面的基础上弹出的），则显示关闭链接。
> - `href="../"` 表示导航回上一级页面，即关闭模态框。

---

### 调整 iOS 状态栏

iOS 上的模态框默认使用深色背景，可能会遮挡状态栏。你可以通过平台判断和 `StatusBar` 组件来有条件地调整状态栏样式。

```tsx
import { StyleSheet, Text, View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Modal() {
  return (
    <View style={styles.container}>
      <Text>Modal screen</Text>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

> **代码说明**：
> - `Platform.OS === 'ios'` 判断当前是否在 iOS 设备上运行。
> - `'light'` 表示使用浅色（白色）状态栏文字，适合深色背景。
> - `'auto'` 表示由系统自动决定状态栏样式（Android 端使用）。

---

### 处理深层链接的模态框（Deep-Linked Modals）

> **基于文档内容推导**：当用户通过深层链接直接打开一个模态页时，应用可能还没有加载底层的导航栈，这会导致模态框没有背景页面可以覆盖，从而出现显示异常。

模态框需要一个"锚点（anchor）"来在深层链接时保留背景导航上下文，这一点在嵌套的导航栈中尤为重要。通过在布局文件中导出 `unstable_settings` 并指定 `anchor`，可以建立基础路由。

```tsx
export const unstable_settings = {
  anchor: 'index', // 锚定到 index 路由
};
```

> **关键术语说明**：
> - **anchor（锚点）**：指定一个路由作为基础页面，确保通过深层链接打开模态框时，底层有正确的导航上下文。
> - **unstable_settings**：一个实验性的导出配置项，用于设置路由级别的全局行为。名称中的 `unstable_` 前缀表明该 API 可能会在未来版本中发生变化。

---

## 表单表单展示方式（Form Sheet Presentation）

`formSheet` 是一种特殊的展示方式，显示一个可拖拽的底部表单（bottom sheet），支持配置不同的高度停靠点（detents），非常适合部分屏幕覆盖的场景（如筛选面板、分享菜单等）。

### 基本实现

在布局选项中将 `presentation` 设置为 `"formSheet"`：

```tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'formSheet',
        }}
      />
    </Stack>
  );
}
```

### 配置停靠点（Detents）

停靠点（detents）控制底部表单可以停留的高度位置。有两种配置方式：

1. **数值数组**：指定屏幕高度的比例值（必须是升序排列），例如 `[0.25, 0.5, 1]` 分别代表 25%、50%、100% 的屏幕高度。
2. **`"fitToContents"`**：根据内容自动调整高度，但要求内容有明确的尺寸定义。

> **注意**：
> - **Android 限制**：Android 上最多支持 **3 个**停靠点位置。
> - **iOS**：不限制停靠点数量。

```tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.25, 0.5, 1],
          sheetInitialDetentIndex: 1,
        }}
      />
    </Stack>
  );
}
```

> **代码说明**：
> - `sheetAllowedDetents: [0.25, 0.5, 1]` —— 定义了三个停靠点：屏幕 25%、50%、100% 的高度。
> - `sheetInitialDetentIndex: 1` —— 初始停靠点为索引 1，即 50% 高度。

### 额外的表单属性

| 属性 | 数据类型 | 说明 |
|------|---------|------|
| `sheetInitialDetentIndex` | `number` 或 `"last"` | 起始高度位置，默认为 `0`。设为 `"last"` 表示从最高停靠点开始。 |
| `sheetGrabberVisible` | `boolean` | 是否显示 iOS 顶部的拖拽把手（handle）。 |
| `sheetCornerRadius` | `number` | 圆角半径（像素值），用于设置表单的圆角边缘。 |
| `sheetLargestUndimmedDetentIndex` | `number`、`"none"` 或 `"last"` | 低于此索引的停靠点不会使背景变暗（dimming）。设为 `"none"` 表示始终不变暗。 |

**完整配置示例**：

```tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.25, 0.5, 1],
          sheetInitialDetentIndex: 0,
          sheetGrabberVisible: true,
          sheetCornerRadius: 24,
          sheetLargestUndimmedDetentIndex: 1,
        }}
      />
    </Stack>
  );
}
```

> **基于经验建议**：在实际项目中，`sheetGrabberVisible: true` 能显著提升 iOS 用户体验，因为它直观地告诉用户可以拖拽调整高度。`sheetCornerRadius` 设置为 16-24 通常能获得较好的视觉效果。

### Android 表单底部固定栏（Sheet Footer）

这是一个实验性的 Android 功能，允许在所有停靠点位置添加一个持久化的底部组件。

```tsx
import { Stack } from 'expo-router';
import { View, Button } from 'react-native';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.5, 1],
          unstable_sheetFooter: () => (
            <View style={{ padding: 16, backgroundColor: 'white' }}>
              <Button title="Confirm" onPress={() => {}} />
            </View>
          ),
        }}
      />
    </Stack>
  );
}
```

> **注意**：`unstable_sheetFooter` 带有 `unstable_` 前缀，说明这是一个实验性 API，未来版本中可能会发生变化。该属性目前仅在 Android 上可用。

### 使用自定义停靠点进行灵活尺寸调整

从 SDK 55 开始，iOS 在使用数值型停靠点时能正确处理灵活尺寸（flexible sizing）。

> **限制**：此功能不能与 `fitToContents` 类型的停靠点一起使用，后者要求内容具有明确的尺寸定义。

**模态页内容示例**：

```tsx
import { StyleSheet, Text, View } from 'react-native';

export default function Modal() {
  return (
    <View style={styles.container}>
      <Text>Modal content</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
});
```

---

## 展示方式参考（Presentation Options Reference）

以下是所有可用的 `presentation` 值及其说明：

| 展示方式 | 说明 |
|---------|------|
| `card` | 将页面推入导航栈（push），默认动画因操作系统而异。这是默认值。 |
| `modal` | 以模态方式展示，支持嵌套的导航栈。 |
| `transparentModal` | 保持前一个页面可见（透过半透明背景可以看到）。适合需要自定义半透明遮罩的场景。 |
| `containedModal` | Android 上回退为 `card`；iOS 上使用当前上下文样式（over-current context）。 |
| `containedTransparentModal` | Android 上回退为透明模式；iOS 上使用 over-current context 样式。 |
| `fullScreenModal` | Android 上回退为 `card`；iOS 上使用全屏样式。 |
| `formSheet` | 显示底部表单，支持可调节的停靠点（detents）。 |

> **基于文档内容推导**：`containedModal` 和 `containedTransparentModal` 主要在 iOS 上有独特的展示效果（over-current context），而在 Android 上会回退为更简单的行为。如果你的应用需要跨平台一致的模态体验，建议优先使用 `modal` 或 `formSheet`，它们的跨平台行为更加可预测。

> **基于经验建议**：选择展示方式时的决策路径：
> 1. 需要简单的全屏弹窗？ → 用 `modal`
> 2. 需要用户看到背后的内容？ → 用 `transparentModal`
> 3. 需要类似 iOS 原生底部抽屉的效果？ → 用 `formSheet`
> 4. 需要全屏覆盖（如登录页面）？ → 用 `fullScreenModal`

---

## 文档导航

- **上一页**：[nesting navigators](./63__nesting-navigators.md)
- **下一页**：[web modals](./65__web-modals.md)
