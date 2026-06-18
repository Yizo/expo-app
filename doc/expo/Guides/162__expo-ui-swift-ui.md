# Expo UI (SwiftUI) - Apple 声明式界面集成指南

> 原文地址：https://docs.expo.dev/guides/expo-ui-swift-ui.md

---

## 概述

本文档介绍如何在 Expo 项目中集成 Apple 的声明式界面（SwiftUI）组件。`@expo/ui` 库允许你在 iOS、macOS 和 tvOS 平台上直接使用 Apple 原生 UI 组件，同时保持 React Native 的开发体验。

**核心特性：**

- **原生构建块**：直接访问 Apple 原生 UI 元素，而非自定义设计系统的模拟
- **直接对应**：每个组件都与其原生 SwiftUI  counterpart 一一对应，开发者可以直接参考 Apple 官方文档
- **完整架构支持**：支持构建完整的应用界面，可与标准 React 元素、DOM 节点或 Skia 图形无缝混合使用

**平台要求：**
- iOS、macOS、tvOS
- 需要 Expo SDK 54 或更高版本
- 需要最新的 Xcode 版本（部分高级功能如 glass effect）

---

## 安装与配置

### 安装依赖

在终端中执行以下命令安装 `@expo/ui` 库：

```sh
npx expo install @expo/ui
```

**命令说明：**
- `npx expo install` 是 Expo 推荐的包安装方式，它会自动选择与当前 SDK 版本兼容的依赖版本
- `@expo/ui` 是提供 SwiftUI 组件的核心包

> 基于经验建议：安装完成后，建议在 iOS 模拟器上运行 `npx expo run:ios` 确认依赖正确链接。如果遇到原生编译错误，尝试先清理构建缓存：`cd ios && xcodebuild clean`。

---

## 核心概念

### Host 容器组件

由于 React Native 使用 UIKit 布局系统，而 SwiftUI 组件使用原生布局系统，两者之间需要一个桥梁。`Host` 组件就是这个桥梁容器。

**工作原理：**
- `Host` 充当边界容器，底层使用原生 Hosting Controller
- 它的功能类似于 SVG 或 Canvas 元素——在其内部使用原生布局而非 Flexbox
- 在 `Host` 内部，应使用原生的 Stack 布局组件（`VStack`、`HStack`）而非 React Native 的 `View` + `flexDirection`

---

## 基础用法

### 基本包装器实现

最简单的用法是将 SwiftUI 组件放入 `Host` 容器中：

```tsx
import { CircularProgress, Host } from '@expo/ui/swift-ui';
import { View, Text } from 'react-native';

export default function LoadingView() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Host matchContents>
        <CircularProgress />
      </Host>
      <Text>Loading...</Text>
    </View>
  );
}
```

**代码说明：**
- `CircularProgress`：SwiftUI 原生的圆形进度指示器
- `Host` 的 `matchContents` 属性：让容器自动匹配其内容的大小（类似 "wrap content"）
- `Host` 外部的 `View` 和 `Text` 使用标准的 React Native 布局和样式
- 注意：Flexbox（`flex: 1`, `justifyContent`, `alignItems`）只在 `Host` **外部**生效

### 使用 Stack 布局

在 `Host` 内部，使用原生的 `VStack`（垂直堆栈）和 `HStack`（水平堆栈）来组织界面：

```tsx
import { CircularProgress, Host, HStack, LinearProgress, VStack } from '@expo/ui/swift-ui';

export default function LoadingView() {
  return (
    <Host style={{ flex: 1, margin: 32 }}>
      <VStack spacing={32}>
        <HStack spacing={32}>
          <CircularProgress />
          <CircularProgress color="orange" />
        </HStack>
        <LinearProgress progress={0.5} />
        <LinearProgress color="orange" progress={0.7} />
      </VStack>
    </Host>
  );
}
```

**代码说明：**
- `VStack`：垂直堆栈布局，子元素从上到下排列
- `HStack`：水平堆栈布局，子元素从左到右排列
- `spacing` 属性：设置子元素之间的间距（单位为点）
- `LinearProgress`：线性进度条，`progress` 值范围为 0 到 1
- `color` 属性：设置组件颜色，支持颜色名称

> 基于文档内容推导：`Host` 的 `style` 属性支持部分 React Native 样式（如 `flex`、`margin`），但这些样式仅在 Host 容器层面生效，不影响其内部的原生布局。

---

## Modifiers（修饰器）系统

Modifier 是 SwiftUI 的自定义机制，通过函数调用来修改组件的外观和行为。在 `@expo/ui` 中，modifier 以数组形式传入组件的 `modifiers` 属性。

### 导入方式

```tsx
import { glassEffect, padding } from '@expo/ui/swift-ui/modifiers';
```

**注意：** Modifier 从 `@expo/ui/swift-ui/modifiers` 子路径导入，而非主路径。

### 玻璃效果（Glass Effect）示例

结合网格渐变和玻璃效果，创建液态外观：

```tsx
import { Host, Text } from '@expo/ui/swift-ui';
import { glassEffect, padding } from '@expo/ui/swift-ui/modifiers';
import { MeshGradientView } from 'expo-mesh-gradient';
import { View } from 'react-native';

export default function Page() {
  return (
    <View style={{ flex: 1 }}>
      <MeshGradientView
        style={{ flex: 1 }}
        columns={3}
        rows={3}
        colors={['red', 'purple', 'indigo', 'orange', 'white', 'blue', 'yellow', 'green', 'cyan']}
        points={[
          [0.0, 0.0],
          [0.5, 0.0],
          [1.0, 0.0],
          [0.0, 0.5],
          [0.5, 0.5],
          [1.0, 0.5],
          [0.0, 1.0],
          [0.5, 1.0],
          [1.0, 1.0],
        ]}
      />
      <Host style={{ position: 'absolute', top: 0, right: 0, left: 0, bottom: 0 }}>
        <Text
          size={32}
          modifiers={[
            padding({
              all: 16,
            }),
            glassEffect({
              glass: {
                variant: 'clear',
              },
            }),
          ]}>
          Glass effect text
        </Text>
      </Host>
    </View>
  );
}
```

**代码说明：**
- `MeshGradientView`：来自 `expo-mesh-gradient` 包的网格渐变视图，提供彩色背景
- `glassEffect`：SwiftUI 的玻璃效果修饰器，`variant: 'clear'` 表示清晰变体
- `padding`：内边距修饰器，`all: 16` 表示四边均为 16 点
- `size={32}`：Text 组件的字体大小属性
- `Host` 使用绝对定位覆盖在渐变背景之上

> 基于经验建议：Glass effect 需要 Xcode 16+ 和 iOS 26+（或对应的 macOS/tvOS 版本）。在旧版本系统上运行时，该效果可能不会生效或导致编译错误。

---

## 实战示例

### 系统设置界面复刻

以下示例展示如何复刻 iOS 系统设置界面的外观，包含开关、图标和导航链接：

```tsx
import {
  Button,
  Form,
  Host,
  HStack,
  Image,
  Section,
  Spacer,
  Toggle,
  Text,
} from '@expo/ui/swift-ui';
import { background, buttonStyle, foregroundStyle, clipShape, frame } from '@expo/ui/swift-ui/modifiers';
import { Link } from 'expo-router';
import { useState } from 'react';

export default function SettingsView() {
  const [isAirplaneMode, setIsAirplaneMode] = useState(true);

  return (
    <Host style={{ flex: 1 }}>
      <Form>
        <Section>
          <HStack spacing={8}>
            <Image
              systemName="airplane"
              color="white"
              size={18}
              modifiers={[
                frame({ width: 28, height: 28 }),
                background('#ffa500'),
                clipShape('roundedRectangle'),
              ]}
            />
            <Text>Airplane Mode</Text>
            <Spacer />
            <Toggle isOn={isAirplaneMode} onIsOnChange={setIsAirplaneMode} />
          </HStack>

          <Link href="/wifi" asChild>
            {/* Use buttonStyle('plain') to prevent default blue button styling */}
            <Button modifiers={[buttonStyle('plain')]}>
              <HStack spacing={8}>
                <Image
                  systemName="wifi"
                  color="white"
                  size={18}
                  modifiers={[
                    frame({ width: 28, height: 28 }),
                    background('#007aff'),
                    clipShape('roundedRectangle'),
                  ]}
                />
                {/* When Text is wrapped in a Link, the color needs to be specified explicitly */}
                <Text modifiers={[foregroundStyle({type: 'color', color: 'black'})]}>Wi-Fi</Text>
                <Spacer />
                <Image systemName="chevron.right" size={14} color="secondary" />
              </HStack>
            </Button>
          </Link>
        </Section>
      </Form>
    </Host>
  );
}
```

**代码说明：**
- `Form` + `Section`：SwiftUI 的表单结构组件，自动提供 iOS 设置页面的标准样式
- `Image` 的 `systemName`：使用 Apple SF Symbols 系统图标（如 `"airplane"`、`"wifi"`、`"chevron.right"`）
- `Spacer`：弹性空间组件，推开两侧的兄弟元素
- `Toggle`：开关组件，`isOn` 控制状态，`onIsOnChange` 是状态变更回调
- `buttonStyle('plain')`：移除按钮的默认蓝色样式，使其看起来像普通可点击区域
- `Link` + `asChild`：使用 `expo-router` 的路由链接，`asChild` 让子组件作为点击目标
- `foregroundStyle`：前景色修饰器，当 `Text` 被 `Link` 包裹时需要显式指定颜色

**常用 Modifier 说明：**
| Modifier | 作用 |
|---|---|
| `frame({ width, height })` | 设置组件的固定尺寸 |
| `background(color)` | 设置背景色 |
| `clipShape(shape)` | 裁剪形状，如 `'roundedRectangle'` |
| `buttonStyle(style)` | 按钮样式，`'plain'` 去除默认样式 |
| `foregroundStyle(config)` | 前景色/文字颜色 |

### 次级文本样式

使用分层前景样式让文本显示为次要信息的浅色效果：

```tsx
import { Button, Form, Host, HStack, Image, List, Section, Spacer, Text } from '@expo/ui/swift-ui';
import { buttonStyle, font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';

export default function SecondaryTextExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Form>
        <Section>
          <List>
            <Button onPress={() => console.log('Navigate')} modifiers={[buttonStyle('plain')]}>
              <HStack>
                <Text>Night Shift</Text>
                <Spacer />
                <Text
                  modifiers={[
                    foregroundStyle({type: 'hierarchical', style: 'secondary'}),
                    padding({ trailing: 8 }),
                  ]}>
                  22:00 to 07:00
                </Text>
                <Image systemName="chevron.right" size={14} color="#C7C7CC" />
              </HStack>
            </Button>
          </List>
          <List>
            <Text modifiers={[foregroundStyle({type: 'hierarchical', style: 'secondary'}), font({ size: 14 })]}>
              Save up to 280.7 MB. This will permanently delete all photos and videos kept in the
              "Recently Deleted" album.
            </Text>
          </List>
        </Section>
      </Form>
    </Host>
  );
}
```

**代码说明：**
- `foregroundStyle({type: 'hierarchical', style: 'secondary'})`：使用分层样式将文本设为次要颜色（系统自动适配深色/浅色模式）
- `font({ size: 14 })`：设置字体大小
- `padding({ trailing: 8 })`：只在尾部（右侧）添加内边距
- `List`：列表容器组件，提供标准的列表行样式
- `color="#C7C7CC"`：Image 支持十六进制颜色值

> 基于文档内容推导：`foregroundStyle` 支持两种模式——`type: 'color'` 用于直接指定颜色，`type: 'hierarchical'` 用于按语义层级自动适配系统颜色。

### 带图标的滑块

实现类似系统亮度调节的滑块控件，两侧带有最小/最大图标：

```tsx
import { useState } from 'react';
import {
  Form,
  Host,
  HStack,
  Image,
  List,
  Section,
  Slider,
  Spacer,
  Text,
  Toggle,
} from '@expo/ui/swift-ui';
import { padding } from '@expo/ui/swift-ui/modifiers';

export default function SliderWithIconsExample() {
  const [brightness, setBrightness] = useState(0.5);
  const [trueToneEnabled, setTrueToneEnabled] = useState(true);

  return (
    <Host style={{ flex: 1 }}>
      <Form>
        <Section
          header={<Text>Brightness</Text>}
          footer={
            <Text>
              Automatically adapt iPhone display based on ambient lighting
              conditions to make colors appear consistent in different
              environments.
            </Text>
          }
        >
          <List>
            <HStack modifiers={[padding({ vertical: 6 })]}>
              <Image systemName="sun.min.fill" size={22} color="#8E8E93" />
              <Spacer />
              <Slider value={brightness} onValueChange={setBrightness} />
              <Spacer />
              <Image systemName="sun.max.fill" size={22} color="#8E8E93" />
            </HStack>
            <Toggle
              label="True Tone"
              isOn={trueToneEnabled}
              onIsOnChange={setTrueToneEnabled}
            />
          </List>
        </Section>
      </Form>
    </Host>
  );
}
```

**代码说明：**
- `Section` 的 `header` 和 `footer` 属性：分别设置分区的标题和底部说明文字
- `Slider`：滑块组件，`value` 为当前值，`onValueChange` 为值变更回调
- `padding({ vertical: 6 })`：只在垂直方向（上下）添加内边距
- `Toggle` 的 `label` 属性：直接在开关旁边显示标签文字
- SF Symbols 图标：`"sun.min.fill"`（小太阳）、`"sun.max.fill"`（大太阳）

### 多行列表项

实现包含主标题和副标题的列表行：

```tsx
import {
  Button,
  Form,
  Host,
  HStack,
  Image,
  List,
  Section,
  Spacer,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import { buttonStyle, font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';

export default function MultiLineListItemExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Form>
        <Section>
          <List>
            <HStack>
              <Image
                systemName="safari"
                size={22}
                modifiers={[padding({ trailing: 6 })]}
              />
              <Spacer />
              <Button
                onPress={() => console.log('Navigate')}
                modifiers={[buttonStyle('plain'), padding({ vertical: 6 })]}
              >
                <VStack spacing={4} alignment="leading">
                  <Text>Chrome</Text>
                  <Text modifiers={[foregroundStyle({type: 'hierarchical', style: 'secondary'}), font({ size: 14 })]}>
                    Last used: Today
                  </Text>
                </VStack>
                <Spacer />
                <Text
                  modifiers={[
                    foregroundStyle({type: 'hierarchical', style: 'secondary'}),
                    font({ size: 16 }),
                  ]}
                >
                  1.57 GB
                </Text>
                <Image systemName="chevron.right" size={14} color="#C7C7CC" />
              </Button>
            </HStack>
          </List>
        </Section>
      </Form>
    </Host>
  );
}
```

**代码说明：**
- `VStack` 的 `alignment="leading"`：子元素左对齐
- `VStack` 嵌套在 `Button` 内部，实现主标题 "Chrome" + 副标题 "Last used: Today" 的多行结构
- 整个行被 `Button` 包裹，支持点击事件（`onPress`）
- `padding({ trailing: 6 })`：Image 右侧间距
- 右侧展示存储大小 "1.57 GB" 和右箭头图标

---

## 常见问题（FAQ）

### Flexbox 在 Host 内部能用吗？

**不能。** `Host` 内部使用原生布局系统（Yoga 布局引擎不可用）。在 `Host` 内部必须使用原生的 Stack 布局组件（`VStack`、`HStack`）。Flexbox 只在 `Host` 外部的 React Native 组件上生效。

### Host 包装器的作用是什么？

`Host` 是 UIKit 和原生 SwiftUI 布局系统之间的桥梁容器。它底层使用 Apple 的 UIHostingController，将 SwiftUI 视图嵌入到 React Native 的视图层级中。

### @expo/ui 和设计系统库有什么区别？

`@expo/ui` 是一个**原语库（primitives library）**，直接暴露原生 SwiftUI 组件给 JavaScript，不进行模拟或封装。而设计系统库（如 NativeBase、Tamagui）通常提供自定义的跨平台设计组件。`@expo/ui` 的目标是与 Apple 原生 UI 保持直接一致。

### 支持哪些平台？

目前专注于 Apple 生态系统的完整对等支持（iOS、macOS、tvOS）。Android 的 Compose 支持和 Web 的 DOM 支持已列入后续路线图。

### 能在 Host 内部嵌套普通 React Native 组件吗？

**可以。** 标准 React Native 组件可以通过自动 Representable 转换嵌套在 `Host` 内部。但需要注意：
- 原生布局系统严格控制子视图的 bounds 和 frame
- 手动操作布局会导致冲突
- 从 React Native 组件再次进入原生上下文时，需要一个新的 `Host` 包装器

### 对开发者有什么好处？

- 将 Apple 原生 UI 开发能力引入 React 生态系统
- 可与 Web 和高级渲染集成（如 Skia）配合使用
- 保持跨平台开发体验的同时获得原生 UI 保真度

---

## 补充资源

文档提及了以下额外资源可供深入学习：

- **API 参考文档**：`@expo/ui` 的完整 API 文档
- **官方示例**：Expo 提供的官方演示项目
- **热巧克力节应用复刻**：一个完整的应用复刻示例
- **多平台电视演示**：展示 tvOS 平台的跨平台能力

> 基于经验建议：建议从官方的 API 参考文档开始，结合本文档中的示例逐步实践。SwiftUI 组件的属性和行为与 Apple 原生 API 保持一致，因此 [Apple SwiftUI 官方文档](https://developer.apple.com/documentation/swiftui) 也是非常有价值的参考资料。

---

## 文档导航

- **上一页**：[keyboard handling](./161__keyboard-handling.md)
- **下一页**：[extending](./163__extending.md)
