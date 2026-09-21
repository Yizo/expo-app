# 044｜Jetpack Compose ModalBottomSheet

**翻页：**[上一页：Jetpack Compose Material Colors](./043-Jetpack-Compose-Material-Colors.md) · [目录](./README.md) · [下一页：Jetpack Compose Modifiers](./045-Jetpack-Compose-Modifiers.md)

**官方页面：**[Jetpack Compose ModalBottomSheet · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/bottomsheet/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/bottomsheet/)推荐 `~56.0.26`，也包含本页这些基本用法。`ModalBottomSheet` 是 Android Jetpack Compose 组件；跨平台需求应查看 Expo UI 的通用 `BottomSheet`。

## 从底部弹出的原生模态面板

`ModalBottomSheet` 是一个覆盖当前界面的面板，可从屏幕底部滑入。用户通常可以拖动、按系统返回键或点击遮罩关闭它。Expo UI 组件必须置于 `<Host>` 中。

安装 Expo UI：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

## 基础开合和动画关闭

React 状态负责决定面板是否挂载。调用 `ref.hide()` 先播放原生关闭动画，Promise 完成后再更新状态卸载面板；`onDismissRequest` 接管用户通过手势等方式关闭时的状态同步：

```tsx
import { useRef, useState } from 'react';
import {
  Host,
  ModalBottomSheet,
  Button,
  Column,
  Text,
} from '@expo/ui/jetpack-compose';
import type { ModalBottomSheetRef } from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';

export default function BasicBottomSheetExample() {
  const [visible, setVisible] = useState(false);
  const sheetRef = useRef<ModalBottomSheetRef>(null);

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
            verticalArrangement={{ spacedBy: 12 }}
            modifiers={[paddingAll(24)]}>
            <Text>Hello from bottom sheet!</Text>
            <Text>You can add more content here.</Text>
            <Button onClick={hideSheet}>
              <Text>Close</Text>
            </Button>
          </Column>
        </ModalBottomSheet>
      )}
    </Host>
  );
}
```

## 跳过半展开状态

默认打开时面板可能先停在部分展开的位置。设置 `skipPartiallyExpanded` 后会直接打开至全展开；示例用 `height(600)` 设定内容高度：

```tsx
import { useRef, useState } from 'react';
import {
  Host,
  ModalBottomSheet,
  Button,
  Column,
  Text,
} from '@expo/ui/jetpack-compose';
import type { ModalBottomSheetRef } from '@expo/ui/jetpack-compose';
import {
  paddingAll,
  height,
} from '@expo/ui/jetpack-compose/modifiers';

export default function SkipPartiallyExpandedExample() {
  const [visible, setVisible] = useState(false);
  const sheetRef = useRef<ModalBottomSheetRef>(null);

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
          onDismissRequest={() => setVisible(false)}
          skipPartiallyExpanded>
          <Column
            verticalArrangement={{ spacedBy: 12 }}
            modifiers={[paddingAll(24), height(600)]}>
            <Text>This sheet skips the partially expanded state.</Text>
            <Text>It opens directly in the fully expanded position.</Text>
            <Button onClick={hideSheet}>
              <Text>Close</Text>
            </Button>
          </Column>
        </ModalBottomSheet>
      )}
    </Host>
  );
}
```

## 初次直接全展开，但仍允许部分展开

`initialFullyExpanded` 让面板第一次组合时就全展开；和 `skipPartiallyExpanded` 不同，用户仍然可以拖回部分展开位置，也可以通过 `partialExpand()` 命令式切换：

```tsx
import { useRef, useState } from 'react';
import {
  Host,
  ModalBottomSheet,
  Button,
  Column,
  Text,
} from '@expo/ui/jetpack-compose';
import type { ModalBottomSheetRef } from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';

export default function InitialFullyExpandedExample() {
  const [visible, setVisible] = useState(false);
  const sheetRef = useRef<ModalBottomSheetRef>(null);

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
          onDismissRequest={() => setVisible(false)}
          initialFullyExpanded>
          <Column
            verticalArrangement={{ spacedBy: 12 }}
            modifiers={[paddingAll(24)]}>
            <Text>This sheet opened fully expanded.</Text>
            <Text>You can still drag it down to the partial state.</Text>
            <Button onClick={() => sheetRef.current?.partialExpand()}>
              <Text>Collapse to partial</Text>
            </Button>
            <Button onClick={hideSheet}>
              <Text>Close</Text>
            </Button>
          </Column>
        </ModalBottomSheet>
      )}
    </Host>
  );
}
```

当 `skipPartiallyExpanded` 同时为 `true` 时，`initialFullyExpanded` 会被忽略。

## 自定义面板、文字和遮罩颜色

`containerColor` 是面板背景，`contentColor` 是内容建议颜色，`scrimColor` 是面板背后遮罩颜色：

```tsx
import { useRef, useState } from 'react';
import {
  Host,
  ModalBottomSheet,
  Button,
  Column,
  Text,
} from '@expo/ui/jetpack-compose';
import type { ModalBottomSheetRef } from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';

export default function CustomColorsExample() {
  const [visible, setVisible] = useState(false);
  const sheetRef = useRef<ModalBottomSheetRef>(null);

  const hideSheet = async () => {
    await sheetRef.current?.hide();
    setVisible(false);
  };

  return (
    <Host matchContents>
      <Button onClick={() => setVisible(true)}>
        <Text>Open colored sheet</Text>
      </Button>
      {visible && (
        <ModalBottomSheet
          ref={sheetRef}
          onDismissRequest={() => setVisible(false)}
          containerColor="#1a1a2e"
          contentColor="#e0e0e0"
          scrimColor="#6200EE80">
          <Column
            verticalArrangement={{ spacedBy: 12 }}
            modifiers={[paddingAll(24)]}>
            <Text>Custom styled bottom sheet.</Text>
            <Text>Dark container with a purple scrim overlay.</Text>
            <Button onClick={hideSheet}>
              <Text>Close</Text>
            </Button>
          </Column>
        </ModalBottomSheet>
      )}
    </Host>
  );
}
```

## 自定义拖拽把手

可以将 `ModalBottomSheet.DragHandle` 内容槽替换为自己的 Compose UI；若想完全隐藏默认把手，则设置 `showDragHandle={false}`：

```tsx
import { useRef, useState } from 'react';
import {
  Host,
  ModalBottomSheet,
  Button,
  Column,
  Box,
  Text,
} from '@expo/ui/jetpack-compose';
import type { ModalBottomSheetRef } from '@expo/ui/jetpack-compose';
import {
  background,
  clip,
  fillMaxWidth,
  height,
  padding,
  Shapes,
  width,
} from '@expo/ui/jetpack-compose/modifiers';

export default function CustomDragHandleExample() {
  const [visible, setVisible] = useState(false);
  const sheetRef = useRef<ModalBottomSheetRef>(null);

  const hideSheet = async () => {
    await sheetRef.current?.hide();
    setVisible(false);
  };

  return (
    <Host matchContents>
      <Button onClick={() => setVisible(true)}>
        <Text>Open custom handle sheet</Text>
      </Button>
      {visible && (
        <ModalBottomSheet
          ref={sheetRef}
          onDismissRequest={() => setVisible(false)}>
          <ModalBottomSheet.DragHandle>
            <Column
              horizontalAlignment="center"
              modifiers={[fillMaxWidth(), padding(0, 12, 0, 8)]}>
              <Box
                modifiers={[
                  width(60),
                  height(6),
                  clip(Shapes.Circle),
                  background('#6200EE'),
                ]}
              />
            </Column>
          </ModalBottomSheet.DragHandle>
          <Column
            verticalArrangement={{ spacedBy: 12 }}
            modifiers={[padding(16, 16, 16, 16)]}>
            <Button onClick={hideSheet}>
              <Text>Close</Text>
            </Button>
          </Column>
        </ModalBottomSheet>
      )}
    </Host>
  );
}
```

## 在面板内嵌 React Native 组件

`RNHostView` 可以在 Compose 面板里承载 React Native 组件，例如 `View`、`Text` 和可交互的 `Pressable`：

```tsx
import { useRef, useState } from 'react';
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
import { Pressable, Text as RNText, View } from 'react-native';

export default function RNContentBottomSheetExample() {
  const colors = useMaterialColors();
  const [visible, setVisible] = useState(false);
  const sheetRef = useRef<ModalBottomSheetRef>(null);

  const hideSheet = async () => {
    await sheetRef.current?.hide();
    setVisible(false);
  };

  return (
    <Host matchContents>
      <Button onClick={() => setVisible(true)}>
        <Text>Open RN content sheet</Text>
      </Button>
      {visible && (
        <ModalBottomSheet
          ref={sheetRef}
          onDismissRequest={() => setVisible(false)}
          skipPartiallyExpanded={false}>
          <Column
            verticalArrangement={{ spacedBy: 16 }}
            modifiers={[padding(16, 16, 16, 16)]}>
            <Text>Mixing Compose + RN in a Bottom Sheet</Text>
            <RNHostView>
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

注意这里有两套点击属性：Expo UI 的 Compose `Button` 使用 `onClick`，React Native 的 `Pressable` 使用 `onPress`。

## RN 子视图填满剩余空间

下面的 `RNHostView` 没有 `matchContents`，所以可以让 RN 子树伸展；父 `Column` 用固定高度给它定义可用空间：

```tsx
import { useRef, useState } from 'react';
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
import { Text as RNText, View } from 'react-native';

export default function FlexRNContentExample() {
  const [visible, setVisible] = useState(false);
  const sheetRef = useRef<ModalBottomSheetRef>(null);

  const hideSheet = async () => {
    await sheetRef.current?.hide();
    setVisible(false);
  };

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
            <Text>RN View with flex: 1</Text>
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

## 可滚动 RN 列表和嵌套手势

将 `FlatList`、`ScrollView`、FlashList 或 Legend List 放入 RNHostView 时，设置 `nestedScrollEnabled`。列表先滚动自己的内容，到达边缘后剩余拖动才交给底部面板：

```tsx
import { useState } from 'react';
import {
  Host,
  ModalBottomSheet,
  Button,
  Column,
  RNHostView,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import {
  fillMaxHeight,
  padding,
} from '@expo/ui/jetpack-compose/modifiers';
import { FlatList, Text as RNText } from 'react-native';

const DATA = Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`);

export default function ScrollableContentBottomSheetExample() {
  const colors = useMaterialColors();
  const [visible, setVisible] = useState(false);

  return (
    <Host matchContents>
      <Button onClick={() => setVisible(true)}>
        <Text>Open scrollable sheet</Text>
      </Button>
      {visible && (
        <ModalBottomSheet onDismissRequest={() => setVisible(false)}>
          <Column
            modifiers={[fillMaxHeight(), padding(16, 16, 16, 16)]}>
            <RNHostView>
              <FlatList
                nestedScrollEnabled
                style={{ flex: 1 }}
                data={DATA}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <RNText
                    style={{
                      paddingVertical: 16,
                      color: colors.onSurface,
                    }}>
                    {item}
                  </RNText>
                )}
              />
            </RNHostView>
          </Column>
        </ModalBottomSheet>
      )}
    </Host>
  );
}
```

## 仅允许由代码关闭

把面板手势和窗口关闭选项都关闭后，用户不能滑动、按返回键或点击外部关闭；应用需保留自己的关闭操作，以免让用户无法离开：

```tsx
import { useRef, useState } from 'react';
import {
  Host,
  ModalBottomSheet,
  Button,
  Column,
  Text,
} from '@expo/ui/jetpack-compose';
import type { ModalBottomSheetRef } from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';

export default function NonDismissibleExample() {
  const [visible, setVisible] = useState(false);
  const sheetRef = useRef<ModalBottomSheetRef>(null);

  const hideSheet = async () => {
    await sheetRef.current?.hide();
    setVisible(false);
  };

  return (
    <Host matchContents>
      <Button onClick={() => setVisible(true)}>
        <Text>Open Non-Dismissible Sheet</Text>
      </Button>
      {visible && (
        <ModalBottomSheet
          ref={sheetRef}
          onDismissRequest={() => setVisible(false)}
          sheetGesturesEnabled={false}
          properties={{
            shouldDismissOnBackPress: false,
            shouldDismissOnClickOutside: false,
          }}>
          <Column
            verticalArrangement={{ spacedBy: 12 }}
            modifiers={[paddingAll(24)]}>
            <Text>
              This sheet cannot be dismissed by swiping, back press,
              or tapping outside.
            </Text>
            <Text>Only the button below will close it.</Text>
            <Button onClick={hideSheet}>
              <Text>Close</Text>
            </Button>
          </Column>
        </ModalBottomSheet>
      )}
    </Host>
  );
}
```

## API 属性和 ref

| 属性 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `children` | `ReactNode` | 面板内容，可含 `ModalBottomSheet.DragHandle` 自定义拖拽把手槽。 |
| `containerColor` | `ColorValue`，可选 | 面板背景色。 |
| `contentColor` | `ColorValue`，可选 | 面板内容优先使用的颜色。 |
| `initialFullyExpanded` | `boolean`，默认 `false` | 初次组合即全展开；`skipPartiallyExpanded` 为 true 时忽略。 |
| `modifiers` | `ModifierConfig[]`，可选 | Compose modifiers。 |
| `onDismissRequest` | `() => void` | 用户通过滑动、返回或点击遮罩关闭时调用。 |
| `properties` | `ModalBottomSheetProperties`，可选 | 模态窗口行为。 |
| `ref` | `Ref<ModalBottomSheetRef>`，可选 | 命令式操作面板。 |
| `scrimColor` | `ColorValue`，可选 | 面板后的遮罩颜色。 |
| `sheetGesturesEnabled` | `boolean`，默认 `true` | 是否允许通过手势（如滑动）关闭。 |
| `showDragHandle` | `boolean`，默认 `true` | 是否显示默认把手；提供自定义 DragHandle 时该属性会被忽略。 |
| `skipPartiallyExpanded` | `boolean`，默认 `false` | 跳过半展开，直接打开为全屏 / 全展开。 |

`ModalBottomSheetProperties`：

| 字段 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `shouldDismissOnBackPress` | `boolean`，默认 `true` | 是否允许系统返回键关闭。 |
| `shouldDismissOnClickOutside` | `boolean`，默认 `true` | 是否允许点击遮罩外侧关闭。 |

`ModalBottomSheetRef` 提供三个异步方法：

| 方法 | 效果 |
| --- | --- |
| `expand()` | 动画展开到完全高度，返回 `Promise<void>`。 |
| `hide()` | 动画隐藏；Promise 在关闭动画结束后 resolve。 |
| `partialExpand()` | 动画折叠到约 50% 的部分展开状态；`skipPartiallyExpanded` 为 false 时才有效。 |

## 关键名词

- **模态 / Modal**：暂时覆盖并承接交互的界面层；通常先处理面板，再返回背后的页面。
- **Bottom sheet**：从屏幕底部出现的操作或内容面板。
- **Scrim**：面板后方用于弱化背景的半透明遮罩；默认可点击遮罩关闭面板。
- **部分展开 / 半展开**：面板先停在中间高度，以便同时露出部分背景页面。
- **命令式 ref**：父组件通过 `ref.current?.hide()` 直接调用已渲染原生组件的方法。此处 ref 是 `ModalBottomSheetRef`，不只是 DOM 引用。
- **组合 / Composition**：Compose 构造或更新原生界面的阶段；`initialFullyExpanded` 只决定首次组合时的初始高度。
- **RNHostView**：在 Jetpack Compose 子树中承载 React Native 子树的桥接视图。
- **嵌套滚动 / Nested scrolling**：滚动列表先消费自己的滑动，滚到边缘后把剩余滚动交给外层面板。
- **`nestedScrollEnabled`**：React Native 滚动视图用于参与 Android 嵌套滚动的属性。
- **dp**：Android 密度无关像素单位。布局 modifier 的宽、高、padding 等参数通常以 dp 表示。
- **`onClick` 与 `onPress`**：Compose Button 用 `onClick`；React Native Pressable 用 `onPress`，不要混用。

## 官方代码主题覆盖

本页保留安装命令及官方全部九个示例：基本开合、跳过半展开、初始全展开后仍允许部分展开、自定义面板和遮罩颜色、自定义拖拽把手、嵌入 RN 内容、RN flex 填充、可滚动 FlatList 嵌套手势、禁用所有用户关闭入口。API 表列出全部 props、modal properties 和 ref 上的 expand / hide / partialExpand。

## 下一页

Latest 页脚 **Next** 指向 [Jetpack Compose Modifiers](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/modifiers/)，汇总 Compose 布局、绘制、外观和交互修饰器。

**翻页：**[上一页：Jetpack Compose Material Colors](./043-Jetpack-Compose-Material-Colors.md) · [返回目录](./README.md) · [下一页：Jetpack Compose Modifiers](./045-Jetpack-Compose-Modifiers.md)
