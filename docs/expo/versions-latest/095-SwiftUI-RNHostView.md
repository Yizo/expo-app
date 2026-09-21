# 095｜SwiftUI RNHostView

**翻页：**[上一页：SwiftUI ProgressView](./094-SwiftUI-ProgressView.md) · [目录](./README.md) · [下一页：SwiftUI ScrollView](./096-SwiftUI-ScrollView.md)

**官方页面：**[SwiftUI RNHostView · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/rnhostview/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/rnhostview/)推荐 `~56.0.26`。此容器支持 iOS、tvOS，并可在 Expo Go 使用。

## 在 SwiftUI 树中嵌入 React Native 视图

`RNHostView` 让 React Native `View`、`Text`、`Pressable` 等组件进入 SwiftUI 控件内部，例如 BottomSheet、Popover 或 HStack。它会把 SwiftUI 的尺寸信息同步回 React Native Yoga 布局系统。

- 开启 `matchContents`：React Native 容器按其子 View 的尺寸测量，让 SwiftUI 父组件随内容大小伸展。
- 关闭 / 不传 `matchContents`：RNHostView 使用 SwiftUI 父级给的空间，适合 React Native 子视图使用 `flex: 1` 填充。
- 只支持一个 RN 元素作为 `children`；要放多个组件，先用一个 `View` 包起来。

安装：

~~~sh
npx expo install @expo/ui
~~~

## matchContents：父组件由 RN 内容决定尺寸

示例把 React Native 内容放在 BottomSheet 中，容器高度按内部文本和按钮确定：

~~~tsx
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  Host,
  BottomSheet,
  Button,
  RNHostView,
} from '@expo/ui/swift-ui';

function MatchContentsExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Button
        label="Open sheet"
        onPress={() => setIsPresented(true)}
      />
      <BottomSheet
        isPresented={isPresented}
        onIsPresentedChange={setIsPresented}>
        <RNHostView matchContents>
          <View style={{ padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
              React Native Content
            </Text>
            <Pressable
              style={{
                backgroundColor: '#007AFF',
                padding: 12,
                borderRadius: 8,
                marginTop: 16,
              }}
              onPress={() => setIsPresented(false)}>
              <Text style={{ color: 'white', textAlign: 'center' }}>
                Close
              </Text>
            </Pressable>
          </View>
        </RNHostView>
      </BottomSheet>
    </Host>
  );
}
~~~

## 不用 matchContents：让 RN 内容填充父级

当内部 React Native 布局依赖 `flex: 1` 占满 BottomSheet 时，不要启用 `matchContents`。下面同时设置 sheet 的 medium / large detents：

~~~tsx
import { useState } from 'react';
import { Text, View } from 'react-native';
import {
  Host,
  BottomSheet,
  Button,
  Group,
  RNHostView,
} from '@expo/ui/swift-ui';
import { presentationDetents } from '@expo/ui/swift-ui/modifiers';

function FlexibleContentExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Button
        label="Open sheet"
        onPress={() => setIsPresented(true)}
      />
      <BottomSheet
        isPresented={isPresented}
        onIsPresentedChange={setIsPresented}>
        <Group modifiers={[presentationDetents(['medium', 'large'])]}>
          <RNHostView>
            <View
              style={{
                flex: 1,
                backgroundColor: '#007AFF',
                padding: 24,
              }}>
              <Text style={{ color: 'white', fontSize: 18 }}>
                This content fills the available space
              </Text>
            </View>
          </RNHostView>
        </Group>
      </BottomSheet>
    </Host>
  );
}
~~~

## 在 Popover 中放交互式 RN 内容

RNHostView 也能让 Popover 中的 React Native 按钮更新 React state：

~~~tsx
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Host, Button, Popover, RNHostView } from '@expo/ui/swift-ui';

function PopoverContentExample() {
  const [isPresented, setIsPresented] = useState(false);
  const [counter, setCounter] = useState(0);

  return (
    <Host style={{ flex: 1 }}>
      <Popover
        isPresented={isPresented}
        onIsPresentedChange={setIsPresented}>
        <Popover.Trigger>
          <Button
            onPress={() => setIsPresented(true)}
            label="Show Popover"
          />
        </Popover.Trigger>
        <Popover.Content>
          <RNHostView matchContents>
            <View style={{ padding: 24 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginBottom: 8,
                }}>
                React Native Content
              </Text>
              <Text style={{ color: '#666', marginBottom: 12 }}>
                Counter: {counter}
              </Text>
              <Pressable
                style={{
                  backgroundColor: '#007AFF',
                  padding: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={() => setCounter(counter + 1)}>
                <Text style={{ color: 'white', fontWeight: '600' }}>
                  Increment
                </Text>
              </Pressable>
            </View>
          </RNHostView>
        </Popover.Content>
      </Popover>
    </Host>
  );
}
~~~

## API 速查

| 属性 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `children` | 单个 `React.ReactElement` | 要嵌入 SwiftUI 的 React Native 元素；多个子视图需要共同放在一个 RN `View` 中。 |
| `matchContents` | `boolean`，默认 `false` | `true` 时 RNHostView 跟随子内容尺寸；`false` 时使用 SwiftUI 父容器尺寸。只能在首次挂载时设置。 |

### 新手术语

- **Yoga**：React Native 的布局计算引擎，负责 flex 布局并产生 Shadow Node 尺寸。
- **Shadow Node**：React Native 用于描述 UI 结构和布局计算的节点；RNHostView 会把同步后的尺寸反馈给它。
- **intrinsic size / 固有尺寸**：子内容根据自身内容自然计算出的大小，而不是父布局分配的尺寸。
- **布局桥接**：React Native 和 SwiftUI 各有布局系统；RNHostView 在两边交换尺寸信息，避免一边不知道另一边内容有多大。

## 源页代码主题覆盖

已覆盖四种安装命令和官方三种完整示例：在 BottomSheet 内按 React Native 内容测量、让 flex 内容填满 SwiftUI 空间、在 Popover 内嵌入可交互 RN 计数器；并说明仅测量第一个子节点。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/rnhostview/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/rnhostview/)

**翻页：**[上一页：SwiftUI ProgressView](./094-SwiftUI-ProgressView.md) · [目录](./README.md) · [下一页：SwiftUI ScrollView](./096-SwiftUI-ScrollView.md)
