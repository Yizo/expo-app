# 110｜Expo UI Universal BottomSheet

**翻页：**[上一页：Universal Overview](./109-Universal-Overview.md) · [目录](./README.md) · [下一页：Universal Button](./111-Universal-Button.md)

**官方页面：**[BottomSheet · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/universal/bottomsheet/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/bottomsheet/)推荐 `~56.0.26`。最新页面支持 Android、iOS、Web，且可在 Expo Go 中使用。SDK 56 页面还包含 React Native 列表嵌入示例，并提示 iOS 多层 sheet 应嵌套展示。

## 从屏幕底部弹出的模态面板

`BottomSheet` 是一个从屏幕底部滑入的模态面板。React state 中的 `isPresented` 控制显隐；用户下滑或点击遮罩关闭时，会触发 `onDismiss`。**模态（modal）**表示当前交互暂时聚焦在弹出内容上。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 基本用法

按钮打开 sheet，用户可以下拉、点击遮罩或点“关闭”将其关闭。Universal 组件需要放在 `Host` 中：

~~~tsx
import { useState } from 'react';
import { useColorScheme } from 'react-native';
import { Host, Column, Button, BottomSheet, Text } from '@expo/ui';

export default function BottomSheetExample() {
  const [isPresented, setIsPresented] = useState(false);
  const colorScheme = useColorScheme();
  const ink = { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' };

  return (
    <>
      <Host matchContents>
        <Button label="Open sheet" onPress={() => setIsPresented(true)} />
      </Host>
      <BottomSheet isPresented={isPresented} onDismiss={() => setIsPresented(false)}>
        <Column spacing={12}>
          <Text textStyle={{ ...ink, fontSize: 18, fontWeight: '700' }}>Sheet contents</Text>
          <Text textStyle={ink}>Drag down or tap the overlay to dismiss.</Text>
          <Button label="Close" onPress={() => setIsPresented(false)} />
        </Column>
      </BottomSheet>
    </>
  );
}
~~~

## 隐藏拖动指示条

设置 `showDragIndicator={false}` 可隐藏 sheet 顶部的拖动把手：

~~~tsx
import { useState } from 'react';
import { useColorScheme } from 'react-native';
import { Host, Button, BottomSheet, Text } from '@expo/ui';

export default function BottomSheetNoIndicatorExample() {
  const [isPresented, setIsPresented] = useState(false);
  const colorScheme = useColorScheme();
  const ink = { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' };

  return (
    <>
      <Host matchContents>
        <Button label="Open" onPress={() => setIsPresented(true)} />
      </Host>
      <BottomSheet
        isPresented={isPresented}
        onDismiss={() => setIsPresented(false)}
        showDragIndicator={false}>
        <Text textStyle={ink}>No drag handle.</Text>
      </BottomSheet>
    </>
  );
}
~~~

## 设置停靠高度

`snapPoints` 指定用户拖动后 sheet 可以停留的高度。`'half'` 和 `'full'` 分别表示约半屏与全屏；iOS / Web 还精确支持 `{ fraction }` 与 `{ height }`。内容可能超过最小停靠高度时，应在内部放置 `ScrollView`：

~~~tsx
import { useState } from 'react';
import { useColorScheme } from 'react-native';
import { Host, BottomSheet, Button, Column, ScrollView, Text } from '@expo/ui';

export default function BottomSheetSnapPointsExample() {
  const [isPresented, setIsPresented] = useState(false);
  const colorScheme = useColorScheme();
  const ink = { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' };

  return (
    <>
      <Host matchContents>
        <Button label="Open" onPress={() => setIsPresented(true)} />
      </Host>
      <BottomSheet
        isPresented={isPresented}
        onDismiss={() => setIsPresented(false)}
        snapPoints={['half', 'full']}>
        <ScrollView>
          <Column spacing={12}>
            <Text textStyle={{ ...ink, fontSize: 20, fontWeight: '700' }}>Half / full sheet</Text>
            <Text textStyle={ink}>Drag the sheet between half and full screen height.</Text>
          </Column>
        </ScrollView>
      </BottomSheet>
    </>
  );
}
~~~

Android 底层使用 Material `ModalBottomSheet`，只支持两个停靠状态；`{ fraction }`、`{ height }` 会就近映射到 `'half'` / `'full'`。短内容可能达不到 partial 状态阈值，需要显式设定内容高度或让内容填满可用空间。

## 在 sheet 内滚动 React Native 列表（SDK 56 页面示例）

SDK 56 官方页面还展示了把 React Native `FlatList` 包进 `RNHostView` 的做法。列表先滚动自身，到顶部后继续拖动才带动 sheet；`nestedScrollEnabled` 启用这种嵌套滚动协调：

~~~tsx
import { useState } from 'react';
import { FlatList, Text } from 'react-native';
import { Host, BottomSheet, Button, RNHostView } from '@expo/ui';

const DATA = Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`);

export default function BottomSheetScrollableExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host matchContents>
      <Button label="Open" onPress={() => setIsPresented(true)} />
      <BottomSheet
        isPresented={isPresented}
        onDismiss={() => setIsPresented(false)}
        snapPoints={['half', 'full']}>
        <RNHostView>
          <FlatList
            nestedScrollEnabled
            style={{ flex: 1 }}
            data={DATA}
            keyExtractor={item => item}
            renderItem={({ item }) => <Text style={{ padding: 16 }}>{item}</Text>}
          />
        </RNHostView>
      </BottomSheet>
    </Host>
  );
}
~~~

在 iOS 上，如果要让一个 sheet 之上再显示另一个 sheet，应将第二个 `BottomSheet` 嵌套在第一个 sheet 的内容内，而不是把它们并列放在同一层；这是底层 SwiftUI `sheet` modifier 的限制。

## 属性速查

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `children` | `ReactNode`（可选） | sheet 内部显示的内容。 |
| `isPresented` | `boolean` | 当前是否显示。 |
| `modifiers` | `ModifierConfig[]`（可选） | SwiftUI / Jetpack Compose 专用修饰器的逃生口。 |
| `onDismiss` | `() => void` | 用户关闭 sheet 时调用。 |
| `showDragIndicator` | `boolean`（默认 `true`） | 是否显示顶部拖动指示条。 |
| `snapPoints` | `SnapPoint[]`（可选） | 可停靠高度；不传时根据内容自动调整。 |
| `testID` | `string`（可选） | 用于端到端测试定位组件的标识。 |

API 导入：

~~~tsx
import { BottomSheet } from '@expo/ui';
~~~

`SnapPoint` 可以是 `'half'`、`'full'`、`{ fraction: number }` 或 `{ height: number }`。后两种只在 iOS / Web 精确生效；Android 会映射到最接近的半屏 / 全屏状态。

### 新手术语

- **Bottom sheet**：从屏幕底部滑出的面板，常用于筛选、详情、操作菜单等不需离开当前页面的任务。
- **遮罩（overlay）**：弹窗背后的半透明区域。点击遮罩通常表示取消或关闭弹窗。
- **停靠点（snap point）**：可拖动面板停下来的预设高度。
- **`RNHostView`**：Expo UI 原生视图树与 React Native 子树之间的嵌入容器。
- **嵌套滚动（nested scrolling）**：内容列表与外层面板共享拖动手势时，协调先滚内容、再拖面板的行为。

## 源页代码主题覆盖

已覆盖四种安装命令、Latest 的基础弹层 / 隐藏拖动条 / 半屏与全屏 snap points 三种示例，以及 SDK 56 文档中用 RN FlatList 构造 sheet 内容的示例；API 导入、dismiss 和平台 snap point 差异均已列出。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/universal/bottomsheet/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/bottomsheet/)

**翻页：**[上一页：Universal Overview](./109-Universal-Overview.md) · [目录](./README.md) · [下一页：Universal Button](./111-Universal-Button.md)
