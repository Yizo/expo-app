# 093｜SwiftUI Popover

**翻页：**[上一页：SwiftUI Picker](./092-SwiftUI-Picker.md) · [目录](./README.md) · [下一页：SwiftUI ProgressView](./094-SwiftUI-ProgressView.md)

**官方页面：**[SwiftUI Popover · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/popover/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/popover/)推荐 `~56.0.26`。Popover 页面支持 iOS，可在 Expo Go 使用；其触发器、弹出内容和显示状态由组件状态连接。

## 锚定到触发控件的浮层

`Popover` 在触发元素附近显示浮动内容。`Popover.Trigger` 定义触发控件，`Popover.Content` 包裹浮层本身；`isPresented` 和 `onIsPresentedChange` 让 React 管理展示状态。它适用于短暂、就地提示或一组小型交互内容。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 基础浮层

~~~tsx
import { useState } from 'react';
import {
  Host,
  Button,
  Popover,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import { padding } from '@expo/ui/swift-ui/modifiers';

export default function BasicPopoverExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Popover
        isPresented={isPresented}
        onIsPresentedChange={isPresented => setIsPresented(isPresented)}>
        <Popover.Trigger>
          <Button
            label="Show Popover"
            onPress={() => setIsPresented(true)}
          />
        </Popover.Trigger>
        <Popover.Content>
          <VStack modifiers={[padding({ all: 16 })]}>
            <Text>Hello from Popover!</Text>
          </VStack>
        </Popover.Content>
      </Popover>
    </Host>
  );
}
~~~

## 设置连接锚点

`attachmentAnchor` 控制弹出层连接到触发器的哪个点，支持 `center`、`leading`、`trailing`、`top`、`bottom`：

~~~tsx
import { useState } from 'react';
import {
  Host,
  Button,
  Popover,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import { padding } from '@expo/ui/swift-ui/modifiers';

export default function AttachmentAnchorExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Popover
        isPresented={isPresented}
        onIsPresentedChange={isPresented => setIsPresented(isPresented)}
        attachmentAnchor="trailing">
        <Popover.Trigger>
          <Button
            label="Show Popover"
            onPress={() => setIsPresented(true)}
          />
        </Popover.Trigger>
        <Popover.Content>
          <VStack modifiers={[padding({ all: 16 })]}>
            <Text>Attached to trailing edge</Text>
          </VStack>
        </Popover.Content>
      </Popover>
    </Host>
  );
}
~~~

## 设置箭头边缘

`arrowEdge` 控制气泡箭头显示在哪一边，支持 `none`、`leading`、`trailing`、`top`、`bottom`：

~~~tsx
import { useState } from 'react';
import {
  Host,
  Button,
  Popover,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import { padding } from '@expo/ui/swift-ui/modifiers';

export default function ArrowEdgeExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Popover
        isPresented={isPresented}
        onIsPresentedChange={isPresented => setIsPresented(isPresented)}
        arrowEdge="top">
        <Popover.Trigger>
          <Button
            label="Show Popover"
            onPress={() => setIsPresented(true)}
          />
        </Popover.Trigger>
        <Popover.Content>
          <VStack modifiers={[padding({ all: 16 })]}>
            <Text>Arrow on top edge</Text>
          </VStack>
        </Popover.Content>
      </Popover>
    </Host>
  );
}
~~~

## 在浮层里嵌入 React Native 内容

使用 `RNHostView` 把 React Native 子树放入 Popover。示例展示一个可以在浮层内更新的计数器：

~~~tsx
import { useState } from 'react';
import { Pressable, Text as RNText, View } from 'react-native';
import {
  Host,
  Button,
  Popover,
  RNHostView,
} from '@expo/ui/swift-ui';

export default function RNContentPopoverExample() {
  const [isPresented, setIsPresented] = useState(false);
  const [counter, setCounter] = useState(0);

  return (
    <Host style={{ flex: 1 }}>
      <Popover
        isPresented={isPresented}
        onIsPresentedChange={isPresented => setIsPresented(isPresented)}>
        <Popover.Trigger>
          <Button
            label="Show RN Popover"
            onPress={() => setIsPresented(true)}
          />
        </Popover.Trigger>
        <Popover.Content>
          <RNHostView matchContents>
            <View style={{ padding: 16 }}>
              <RNText style={{ fontSize: 16, fontWeight: 'bold' }}>
                React Native Content
              </RNText>
              <RNText style={{ color: '#666', marginVertical: 8 }}>
                Counter: {counter}
              </RNText>
              <Pressable
                style={{
                  backgroundColor: '#007AFF',
                  padding: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={() => setCounter(counter + 1)}>
                <RNText style={{ color: 'white' }}>Increment</RNText>
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
| `children` | `React.ReactNode` | 组件内容，应由 `Popover.Trigger` 与 `Popover.Content` 组成。 |
| `isPresented` | `boolean`（可选） | 当前浮层是否显示。 |
| `onIsPresentedChange` | `(isPresented: boolean) => void`（可选） | 展示状态改变时同步到 React。 |
| `attachmentAnchor` | `'center' \| 'top' \| 'bottom' \| 'leading' \| 'trailing'`（可选） | 浮层相对触发元素的连接点。 |
| `arrowEdge` | `'none' \| 'top' \| 'bottom' \| 'leading' \| 'trailing'`，默认 `none` | 浮层箭头所在边；默认由系统选择。 |

### 新手术语

- **Popover**：锚定到一个控件附近的小型浮动面板，不像整页导航那样替换当前屏幕。
- **Trigger**：用户点击以打开 Popover 的控件。
- **Attachment anchor / Arrow edge**：连接位置与箭头边缘是不同设置；一个选触发元素的锚点，一个选气泡尖角方向。
- **受控显示状态**：React state 保存当前是否呈现，回调接收原生界面的最新状态。

## 源页代码主题覆盖

已覆盖四种安装命令和官方四种完整用法：基础浮层、attachmentAnchor、arrowEdge，以及通过 `RNHostView` 放入带状态交互的 React Native 内容；显示状态回调和定位属性已逐项说明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/popover/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/popover/)

**翻页：**[上一页：SwiftUI Picker](./092-SwiftUI-Picker.md) · [目录](./README.md) · [下一页：SwiftUI ProgressView](./094-SwiftUI-ProgressView.md)
