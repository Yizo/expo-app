# 050｜Jetpack Compose RNHostView

**翻页：**[上一页：Jetpack Compose RadioButton](./049-Jetpack-Compose-RadioButton.md) · [目录](./README.md) · [下一页：Jetpack Compose Row](./051-Jetpack-Compose-Row.md)

**官方页面：**[Jetpack Compose RNHostView · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/rnhostview/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.18`；[SDK 56 文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/rnhostview/)推荐 `~56.0.26`。两个版本均记录 `matchContents` 的测量模式；Latest 外层 Host 示例使用 `matchContents={{ vertical: true }}`，SDK 56 的 Host 示例则使用 `style={{ flex: 1 }}` 等写法。

## 在 Compose 原生界面里承载 React Native 视图

`RNHostView` 让原生 Jetpack Compose 组件内部嵌入 React Native 子树。布局计算需把两个布局引擎连起来：Compose 负责原生父布局，React Native Yoga 负责 RN 子树。RNHostView 会把 Compose 的测量尺寸同步到 React Native shadow node（用于布局计算的影子节点）。

安装 Expo UI：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

## `matchContents`：父级包住 RN 子视图

设置 `matchContents` 后，RNHostView 会测量 RN 子节点的内在尺寸，让 Compose 父组件按 RN 内容大小排版。示例在 Material Card 内放两个 React Native Pressable，分别减少和增加计数：

```tsx
import { useState } from 'react';
import { Pressable, Text as RNText, View } from 'react-native';
import {
  Host,
  Card,
  Column,
  Row,
  RNHostView,
  Text,
} from '@expo/ui/jetpack-compose';
import {
  fillMaxWidth,
  padding,
} from '@expo/ui/jetpack-compose/modifiers';

export default function RNHostViewCounterExample() {
  const [counter, setCounter] = useState(0);

  return (
    <Host
      matchContents={{ vertical: true }}
      style={{ width: '100%' }}>
      <Card modifiers={[fillMaxWidth()]}>
        <Column
          verticalArrangement={{ spacedBy: 12 }}
          modifiers={[padding(16, 16, 16, 16)]}>
          <Text>Mixing RN Components with Compose</Text>
          <Row
            horizontalArrangement={{ spacedBy: 24 }}
            verticalAlignment="center">
            <RNHostView matchContents>
              <Pressable
                onPress={() => setCounter(prev => prev - 1)}
                style={{
                  height: 50,
                  width: 50,
                  borderRadius: 100,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#9B59B6',
                }}>
                <RNText style={{ color: 'white', fontSize: 24 }}>
                  -
                </RNText>
              </Pressable>
            </RNHostView>
            <Text>{counter}</Text>
            <RNHostView matchContents>
              <Pressable
                onPress={() => setCounter(prev => prev + 1)}
                style={{
                  height: 50,
                  width: 50,
                  borderRadius: 100,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#9B59B6',
                }}>
                <RNText style={{ color: 'white', fontSize: 24 }}>
                  +
                </RNText>
              </Pressable>
            </RNHostView>
          </Row>
        </Column>
      </Card>
    </Host>
  );
}
```

`matchContents` 让每个 RNHostView 按 50×50 RN 按钮尺寸参与 Compose Row 的排版。React Native Pressable 用 `onPress`；Expo UI / Compose 按钮则通常用 `onClick`。

## 省略 `matchContents`：RN 子视图填满可用空间

默认不传 `matchContents` 时，RNHostView 使用 Compose 父级分配给它的尺寸，因此 RN 内容可以使用 `flex: 1`：

```tsx
import { View } from 'react-native';
import {
  Host,
  Card,
  Column,
  Row,
  RNHostView,
  Text,
} from '@expo/ui/jetpack-compose';
import {
  fillMaxWidth,
  padding,
  size,
} from '@expo/ui/jetpack-compose/modifiers';

export default function RNHostViewFlexExample() {
  return (
    <Host
      matchContents={{ vertical: true }}
      style={{ width: '100%' }}>
      <Card modifiers={[fillMaxWidth()]}>
        <Column
          verticalArrangement={{ spacedBy: 12 }}
          modifiers={[padding(16, 16, 16, 16)]}>
          <Text>RN components with flex: 1 children</Text>
          <Row
            horizontalArrangement={{ spacedBy: 20 }}
            modifiers={[size(100, 100)]}>
            <RNHostView>
              <View
                style={{
                  flex: 1,
                  backgroundColor: '#9B59B6',
                  borderRadius: 10,
                }}
              />
            </RNHostView>
          </Row>
        </Column>
      </Card>
    </Host>
  );
}
```

父 Row 明确给出 100×100 尺寸，RN View 的 `flex: 1` 才能把这个有限空间填满。RNHostView 本身没有传 `matchContents`，因此采用父 Compose 尺寸。

## 在 Compose ModalBottomSheet 中放置交互式 RN 内容

RNHostView 可以在模态底部面板里承载 RN 文本和 Pressable。面板的关闭按钮由 RN Pressable 触发，关闭前通过 ref 播放 Compose 面板动画：

```tsx
import { useRef, useState } from 'react';
import { Pressable, Text as RNText, View } from 'react-native';
import {
  Host,
  ModalBottomSheet,
  Button,
  Column,
  RNHostView,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import type { ModalBottomSheetRef } from '@expo/ui/jetpack-compose';
import { padding } from '@expo/ui/jetpack-compose/modifiers';

export default function RNHostViewSheetExample() {
  const [visible, setVisible] = useState(false);
  const sheetRef = useRef<ModalBottomSheetRef>(null);
  const colors = useMaterialColors();

  const hideSheet = async () => {
    await sheetRef.current?.hide();
    setVisible(false);
  };

  return (
    <Host matchContents>
      <Button onClick={() => setVisible(true)}>
        <Text>Open sheet</Text>
      </Button>
      {visible && (
        <ModalBottomSheet
          ref={sheetRef}
          onDismissRequest={() => setVisible(false)}>
          <Column
            verticalArrangement={{ spacedBy: 16 }}
            modifiers={[padding(16, 16, 16, 16)]}>
            <Text>Mixing Compose + RN in a Bottom Sheet</Text>
            <RNHostView matchContents>
              <View>
                <RNText
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginBottom: 8,
                    color: colors.onSurface,
                  }}>
                  React Native Content
                </RNText>
                <Pressable
                  style={{
                    backgroundColor: '#007AFF',
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                  }}
                  onPress={hideSheet}>
                  <RNText style={{ color: 'white', fontWeight: '600' }}>
                    Close
                  </RNText>
                </Pressable>
              </View>
            </RNHostView>
          </Column>
        </ModalBottomSheet>
      )}
    </Host>
  );
}
```

`RNHostView` 的 `children` 类型是一个 `ReactElement`。当需要放多个 RN 组件（这里是 Text 和 Pressable）时，先用一个 RN `View` 包住它们。

## 在底部面板内使用可伸展的 RN 子视图

这类场景省略 RNHostView 的 `matchContents`，并为父 Compose Column 指定高度；RN 子 View 的 `flex: 1` 填满面板可用区域：

```tsx
import { useRef, useState } from 'react';
import { Text as RNText, View } from 'react-native';
import {
  Host,
  ModalBottomSheet,
  Button,
  Column,
  RNHostView,
  Text,
} from '@expo/ui/jetpack-compose';
import type { ModalBottomSheetRef } from '@expo/ui/jetpack-compose';
import {
  height,
  padding,
} from '@expo/ui/jetpack-compose/modifiers';

export default function RNHostViewFlexSheetExample() {
  const [visible, setVisible] = useState(false);
  const sheetRef = useRef<ModalBottomSheetRef>(null);

  return (
    <Host matchContents>
      <Button onClick={() => setVisible(true)}>
        <Text>Open flex content sheet</Text>
      </Button>
      {visible && (
        <ModalBottomSheet
          ref={sheetRef}
          onDismissRequest={() => setVisible(false)}
          skipPartiallyExpanded>
          <Column modifiers={[height(400), padding(16, 16, 16, 16)]}>
            <RNHostView>
              <View
                style={{
                  flex: 1,
                  backgroundColor: '#9B59B6',
                  borderRadius: 10,
                }}>
                <RNText
                  style={{
                    color: 'white',
                    fontSize: 18,
                    fontWeight: 'bold',
                    padding: 16,
                  }}>
                  React Native Content (flex: 1)
                </RNText>
              </View>
            </RNHostView>
          </Column>
        </ModalBottomSheet>
      )}
    </Host>
  );
}
```

## API 属性

```tsx
import { RNHostView } from '@expo/ui/jetpack-compose';
```

| 属性 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `children` | `ReactElement` | 被嵌入的 RN View 子树。Host 当前只测量第一个 React 子元素；需要多个子项时使用单个父 View 包裹。 |
| `matchContents` | `boolean`，默认 `false` | true 时跟随 RN 子节点大小；false 时使用 Compose 父级尺寸。只能在 mount（首次挂载）时设置，运行中不要切换模式。 |
| `modifiers` | `ModifierConfig[]`，可选 | Compose modifiers。 |
| `style` | `StyleProp<ViewStyle>`，可选 | 应用于 RN shadow node 的样式。可用于 `position: 'absolute'` 等布局定位，让 RN 测量坐标与 Compose 绘制位置对应，尤其影响 `Pressable` 这类依赖 measure 的命中测试。 |

## 关键名词

- **Yoga**：React Native 的布局引擎，用 flexbox 规则计算 RN 视图位置和尺寸。
- **Compose**：Android 原生声明式 UI 工具包；这里负责画出 Expo UI Jetpack Compose 组件。
- **Shadow node / 影子节点**：RN 内部用于布局测量的逻辑节点，不是视觉阴影。RNHostView 把 Compose 测量结果同步到它，才能正确算 RN 子树布局。
- **Intrinsic size / 内在尺寸**：内容本身想要的尺寸，如按钮按文本和 padding 计算的自然宽高。`matchContents` 会让 Compose 父节点按其包裹。
- **`matchContents`**：在 `RNHostView` 上决定尺寸从哪边来。true 从 RN children 测量；false 从 Compose parent 获得可用尺寸。
- **Flex `1`**：RN 子视图填满父级留下的空间；父级必须先提供有界的可用尺寸，例如示例 Row 的 100×100 或 Sheet Column 的 400 dp 高度。
- **mount / 首次挂载**：React 第一次把组件实例放到 UI 树的阶段。RNHostView 的 matchContents 模式需在此时确定。
- **`measure()` / Hit testing**：根据视图坐标判断触摸点命中谁。Compose 绘制区域与 RN shadow node 布局位置不一致时，Pressable 的测量式点击区域可能偏移。
- **Bridge / 布局桥接**：RN 与 Compose 两边的尺寸、位置和组件树协调机制；RNHostView 是专用容器。
- **`Pressable` 的 `onPress` 与 Compose `Button` 的 `onClick`**：同一页面可能同时出现两类组件，两边事件属性各自不同。

## 官方代码主题覆盖

本页保留安装命令和官方四段示例：Compose Card 中带 matchContents 的加减计数器、RN `flex: 1` 填充固定 100×100 Compose Row、包含 RN 交互按钮的 Compose ModalBottomSheet、在全展开 Sheet 里伸展的 RN View。API 覆盖 children、matchContents、modifiers、style，以及 Yoga 测量和 Pressable 命中区域说明。

## 下一页

Latest 页脚 **Next** 指向 [Jetpack Compose Row](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/row/)，介绍 Compose 水平布局容器。

**翻页：**[上一页：Jetpack Compose RadioButton](./049-Jetpack-Compose-RadioButton.md) · [返回目录](./README.md) · [下一页：Jetpack Compose Row](./051-Jetpack-Compose-Row.md)
