# 068｜SwiftUI BottomSheet

**翻页：**[上一页：SwiftUI Alert](./067-SwiftUI-Alert.md) · [目录](./README.md) · [下一页：SwiftUI Button](./069-SwiftUI-Button.md)

**官方页面：**[SwiftUI BottomSheet · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/bottomsheet/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.19；[SDK 56 reference](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/bottomsheet/)推荐 ~56.0.24。跨平台需求请看 universal BottomSheet。此组件是 iOS / tvOS SwiftUI 底部面板。

## 从屏幕底部滑入的原生 Sheet

BottomSheet 使用 SwiftUI sheet API，在触发按钮附近呈现从屏幕底部滑入的内容。React state 通过 isPresented 和 onIsPresentedChange 控制显示。可在 Group 上应用 presentation modifiers 来设置面板高度、背景、拖拽把手和交互规则。

安装：

~~~sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
~~~

## 基础 BottomSheet

将打开面板的 Button 作为 anchor，面板内容放在 BottomSheet 的 children 中：

~~~tsx
import { useState } from 'react';
import {
  Host,
  BottomSheet,
  Button,
  Text,
  VStack,
} from '@expo/ui/swift-ui';

export default function BasicBottomSheetExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <VStack>
        <BottomSheet
          isPresented={isPresented}
          onIsPresentedChange={setIsPresented}
          anchor={
            <Button
              label="Open sheet"
              onPress={() => setIsPresented(true)}
            />
          }>
          <Text>Hello, world!</Text>
        </BottomSheet>
      </VStack>
    </Host>
  );
}
~~~

## 用 React Native View 作 anchor

anchor 也可以是 React Native View，通过 RNHostView 放进 SwiftUI 布局。示例用 RN Pressable 打开一个贴合内容高度的面板：

~~~tsx
import { useState } from 'react';
import { Pressable, Text as RNText } from 'react-native';
import {
  Host,
  BottomSheet,
  Button,
  RNHostView,
  Text,
  VStack,
} from '@expo/ui/swift-ui';

export default function BottomSheetRNAnchorExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <VStack>
        <BottomSheet
          isPresented={isPresented}
          onIsPresentedChange={setIsPresented}
          fitToContents
          anchor={
            <RNHostView matchContents>
              <Pressable
                onPress={() => setIsPresented(true)}
                style={{
                  backgroundColor: '#007AFF',
                  padding: 12,
                  borderRadius: 8,
                  alignSelf: 'flex-start',
                }}>
                <RNText style={{ color: 'white', fontWeight: '600' }}>
                  Open sheet
                </RNText>
              </Pressable>
            </RNHostView>
          }>
          <VStack>
            <Text>Opened from a React Native anchor.</Text>
            <Button
              label="Close"
              onPress={() => setIsPresented(false)}
            />
          </VStack>
        </BottomSheet>
      </VStack>
    </Host>
  );
}
~~~

## BottomSheet 自动贴合内容高度

fitToContents 会根据面板 children 高度设置 sheet detent：

~~~tsx
import { useState } from 'react';
import {
  Host,
  BottomSheet,
  Button,
  Text,
  VStack,
} from '@expo/ui/swift-ui';

export default function BottomSheetFitsContentExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <VStack>
        <BottomSheet
          isPresented={isPresented}
          onIsPresentedChange={setIsPresented}
          fitToContents
          anchor={
            <Button
              label="Open sheet"
              onPress={() => setIsPresented(true)}
            />
          }>
          <VStack>
            <Text>This sheet automatically sizes to fit its content.</Text>
            <Button
              label="Close"
              onPress={() => setIsPresented(false)}
            />
          </VStack>
        </BottomSheet>
      </VStack>
    </Host>
  );
}
~~~

## 自定义面板背景色

默认采用系统半透明材料背景（iOS 26 上是 Liquid Glass）。使用 Group 与 presentationBackground modifier 改成纯色背景；Form / List 等本身带 grouped 背景时，要使用 scrollContentBackground('hidden') 才能透出 sheet 背景色：

~~~tsx
import { useState } from 'react';
import {
  Host,
  BottomSheet,
  Button,
  Group,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import {
  presentationBackground,
  presentationDetents,
  padding,
  foregroundStyle,
} from '@expo/ui/swift-ui/modifiers';

export default function BottomSheetBackgroundColorExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <VStack>
        <BottomSheet
          isPresented={isPresented}
          onIsPresentedChange={setIsPresented}
          anchor={
            <Button
              label="Open sheet"
              onPress={() => setIsPresented(true)}
            />
          }>
          <Group
            modifiers={[
              presentationDetents(['medium', 'large']),
              presentationBackground('#ffffff'),
            ]}>
            <VStack modifiers={[padding({ all: 20 })]}>
              <Text modifiers={[foregroundStyle('#000000')]}>
                Solid white sheet background.
              </Text>
              <Button
                label="Close"
                onPress={() => setIsPresented(false)}
              />
            </VStack>
          </Group>
        </BottomSheet>
      </VStack>
    </Host>
  );
}
~~~

## 定义 BottomSheet 停靠高度

presentationDetents 决定 sheet 可停留的高度。支持系统 medium（约半屏）、large（全屏）、屏幕高度比例、固定 point 高度：

~~~tsx
import { useState } from 'react';
import {
  Host,
  BottomSheet,
  Button,
  Group,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import { presentationDetents } from '@expo/ui/swift-ui/modifiers';

export default function BottomSheetWithDetentsExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <VStack>
        <BottomSheet
          isPresented={isPresented}
          onIsPresentedChange={setIsPresented}
          anchor={
            <Button
              label="Open sheet"
              onPress={() => setIsPresented(true)}
            />
          }>
          <Group
            modifiers={[
              presentationDetents([
                'medium',
                'large',
                { fraction: 0.3 },
                { height: 200 },
              ]),
            ]}>
            <Text>This sheet can snap to multiple heights.</Text>
          </Group>
        </BottomSheet>
      </VStack>
    </Host>
  );
}
~~~

### 追踪并控制当前 detent

将 selection 与 onSelectionChange 传给 presentationDetents modifier，可以读取当前 sheet 停靠位置，也能从面板内容切换到另一个高度：

~~~tsx
import { useState } from 'react';
import {
  Host,
  BottomSheet,
  Button,
  List,
  Section,
  Text,
  VStack,
  Group,
} from '@expo/ui/swift-ui';
import {
  presentationDetents,
  presentationDragIndicator,
  foregroundStyle,
} from '@expo/ui/swift-ui/modifiers';
import type { PresentationDetent } from '@expo/ui/swift-ui/modifiers';

export default function BottomSheetWithDetentSelectionExample() {
  const [isPresented, setIsPresented] = useState(false);
  const detents: PresentationDetent[] = [
    { height: 300 },
    { fraction: 0.3 },
    'medium',
    'large',
  ];
  const [selectedDetent, setSelectedDetent] =
    useState<PresentationDetent>('medium');

  const formatDetent = (detent: PresentationDetent): string => {
    if (typeof detent === 'string') return detent;
    if ('fraction' in detent) return 'Fraction ' + detent.fraction;
    return 'Height ' + detent.height;
  };

  return (
    <Host style={{ flex: 1 }}>
      <VStack>
        <BottomSheet
          isPresented={isPresented}
          onIsPresentedChange={setIsPresented}
          anchor={
            <Button
              label="Show sheet"
              onPress={() => setIsPresented(true)}
            />
          }>
          <Group
            modifiers={[
              presentationDetents(detents, {
                selection: selectedDetent,
                onSelectionChange: setSelectedDetent,
              }),
              presentationDragIndicator('visible'),
            ]}>
            <List>
              <Section title="Change detent">
                <Button
                  label="Height 300"
                  onPress={() => setSelectedDetent({ height: 300 })}
                />
                <Button
                  label="Fraction 0.3"
                  onPress={() => setSelectedDetent({ fraction: 0.3 })}
                />
                <Button
                  label="Medium"
                  onPress={() => setSelectedDetent('medium')}
                />
                <Button
                  label="Large"
                  onPress={() => setSelectedDetent('large')}
                />
              </Section>
              <Section title="Current">
                <Text modifiers={[foregroundStyle('secondaryLabel')]}>
                  {formatDetent(selectedDetent)}
                </Text>
              </Section>
            </List>
          </Group>
        </BottomSheet>
      </VStack>
    </Host>
  );
}
~~~

## 允许与面板后面的界面交互

presentationBackgroundInteraction 控制 sheet 展开到什么 detent 之前，用户仍可点击背景内容：

~~~tsx
import { useState } from 'react';
import {
  Host,
  BottomSheet,
  Button,
  Group,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import {
  presentationDetents,
  presentationBackgroundInteraction,
} from '@expo/ui/swift-ui/modifiers';

export default function BottomSheetWithBackgroundInteractionExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <VStack>
        <BottomSheet
          isPresented={isPresented}
          onIsPresentedChange={setIsPresented}
          anchor={
            <Button
              label="Open sheet"
              onPress={() => setIsPresented(true)}
            />
          }>
          <Group
            modifiers={[
              presentationDetents(['medium', 'large']),
              presentationBackgroundInteraction({
                type: 'enabledUpThrough',
                detent: 'medium',
              }),
            ]}>
            <Text>Interact with content behind when at medium height.</Text>
          </Group>
        </BottomSheet>
      </VStack>
    </Host>
  );
}
~~~

## 禁止通过滑动关闭

interactiveDismissDisabled modifier 禁止手势下滑关闭。示例仍保留面板内的显式 Close 按钮：

~~~tsx
import { useState } from 'react';
import {
  Host,
  BottomSheet,
  Button,
  Group,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import { interactiveDismissDisabled } from '@expo/ui/swift-ui/modifiers';

export default function NonDismissibleBottomSheetExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <VStack>
        <BottomSheet
          isPresented={isPresented}
          onIsPresentedChange={setIsPresented}
          anchor={
            <Button
              label="Open sheet"
              onPress={() => setIsPresented(true)}
            />
          }>
          <Group modifiers={[interactiveDismissDisabled()]}>
            <VStack>
              <Text>This sheet cannot be dismissed by swiping.</Text>
              <Button
                label="Close"
                onPress={() => setIsPresented(false)}
              />
            </VStack>
          </Group>
        </BottomSheet>
      </VStack>
    </Host>
  );
}
~~~

## 嵌入 React Native 内容

RNHostView 可以在 SwiftUI BottomSheet 内放置可交互的 React Native View / Pressable：

~~~tsx
import { useState } from 'react';
import {
  PlatformColor,
  Pressable,
  Text as RNText,
  View,
} from 'react-native';
import {
  Host,
  BottomSheet,
  Button,
  Group,
  RNHostView,
  VStack,
} from '@expo/ui/swift-ui';
import { presentationDragIndicator } from '@expo/ui/swift-ui/modifiers';

export default function BottomSheetWithRNContentExample() {
  const [isPresented, setIsPresented] = useState(false);
  const [counter, setCounter] = useState(0);

  return (
    <Host style={{ flex: 1 }}>
      <VStack>
        <BottomSheet
          isPresented={isPresented}
          onIsPresentedChange={setIsPresented}
          fitToContents
          anchor={
            <Button
              label="Open sheet"
              onPress={() => setIsPresented(true)}
            />
          }>
          <Group modifiers={[presentationDragIndicator('visible')]}>
            <RNHostView matchContents>
              <View style={{ padding: 24 }}>
                <RNText
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginBottom: 8,
                    color: PlatformColor('label'),
                  }}>
                  React Native Content
                </RNText>
                <RNText style={{ color: '#666', marginBottom: 16 }}>
                  Counter: {counter}
                </RNText>
                <Pressable
                  style={{
                    backgroundColor: '#007AFF',
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                  onPress={() => setCounter(counter + 1)}>
                  <RNText style={{ color: 'white', fontWeight: '600' }}>
                    Increment
                  </RNText>
                </Pressable>
                <Pressable
                  style={{
                    backgroundColor: '#FF3B30',
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                  }}
                  onPress={() => setIsPresented(false)}>
                  <RNText style={{ color: 'white', fontWeight: '600' }}>
                    Close
                  </RNText>
                </Pressable>
              </View>
            </RNHostView>
          </Group>
        </BottomSheet>
      </VStack>
    </Host>
  );
}
~~~

matchContents 让 RNHostView 根据 React Native View 尺寸测量并适配内容高度；多个 RN 子组件先放进同一父 View。

## 面板内填满剩余高度的 RN 内容

RN 内容使用 flex: 1 时，省略 RNHostView 的 matchContents；通过 presentationDetents 给 sheet 一个有限高度：

~~~tsx
import { useState } from 'react';
import { Text as RNText, View } from 'react-native';
import {
  Host,
  BottomSheet,
  Button,
  Group,
  RNHostView,
  VStack,
} from '@expo/ui/swift-ui';
import {
  presentationDetents,
  presentationDragIndicator,
} from '@expo/ui/swift-ui/modifiers';

export default function BottomSheetWithFlexRNContentExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <VStack>
        <BottomSheet
          isPresented={isPresented}
          onIsPresentedChange={setIsPresented}
          anchor={
            <Button
              label="Open sheet"
              onPress={() => setIsPresented(true)}
            />
          }>
          <Group
            modifiers={[
              presentationDetents(['medium', 'large']),
              presentationDragIndicator('visible'),
            ]}>
            <RNHostView>
              <View
                style={{
                  flex: 1,
                  backgroundColor: '#007AFF',
                  padding: 24,
                }}>
                <RNText
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: 'white',
                  }}>
                  Flexible React Native Content
                </RNText>
                <RNText style={{ color: 'white', marginTop: 8 }}>
                  This content fills the available space in the sheet.
                </RNText>
              </View>
            </RNHostView>
          </Group>
        </BottomSheet>
      </VStack>
    </Host>
  );
}
~~~

## 可滚动 React Native 列表

FlatList 或 ScrollView 等 RN 滚动内容可以放在 RNHostView 内。SwiftUI 面板的 detents 定义可视高度，列表在该高度范围里滚动：

~~~tsx
import { useState } from 'react';
import {
  FlatList,
  PlatformColor,
  Text as RNText,
  View,
} from 'react-native';
import {
  Host,
  BottomSheet,
  Button,
  Group,
  RNHostView,
  VStack,
} from '@expo/ui/swift-ui';
import {
  presentationDetents,
  presentationDragIndicator,
} from '@expo/ui/swift-ui/modifiers';

const DATA = Array.from({ length: 50 }, (_, i) => 'Item ' + (i + 1));

export default function BottomSheetWithScrollableContentExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <VStack>
        <BottomSheet
          isPresented={isPresented}
          onIsPresentedChange={setIsPresented}
          anchor={
            <Button
              label="Open sheet"
              onPress={() => setIsPresented(true)}
            />
          }>
          <Group
            modifiers={[
              presentationDetents(['medium', 'large']),
              presentationDragIndicator('visible'),
            ]}>
            <RNHostView>
              <View style={{ padding: 16 }}>
                <FlatList
                  data={DATA}
                  keyExtractor={item => item}
                  renderItem={({ item }) => (
                    <RNText
                      style={{
                        paddingVertical: 16,
                        color: PlatformColor('label'),
                      }}>
                      {item}
                    </RNText>
                  )}
                />
              </View>
            </RNHostView>
          </Group>
        </BottomSheet>
      </VStack>
    </Host>
  );
}
~~~

## API 属性

| 属性 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| anchor | ReactNode，可选 | 触发 sheet 的视图；保持原位挂载，显示面板时不会挤动周边布局。 |
| children | ReactNode | 面板内容，只在显示期间挂载，关闭后卸载。用 Group 包裹以添加 presentation modifiers。 |
| fitToContents | boolean，默认 false | 自动按 children 高度决定 detent。 |
| isPresented | boolean | sheet 当前是否显示。 |
| onDismiss | () => void，可选 | sheet 完全关闭后调用。 |
| onIsPresentedChange | (isPresented: boolean) => void | sheet 状态变化回调。 |
| CommonViewModifierProps | - | SwiftUI view 通用修饰属性。 |

## 关键名词

- **BottomSheet / Sheet**：从屏幕底部出现的原生面板。
- **Anchor / 锚点**：打开面板的触发视图；可以是 SwiftUI Button，也可以用 RNHostView 嵌入 React Native Pressable。
- **Detent**：面板可以停靠的高度。系统 medium 约半屏，large 为全屏；还可给屏幕比例或固定高度。
- **presentationDetents**：SwiftUI presentation modifier，用于指定可用停靠高度集合。
- **Group**：SwiftUI 子视图容器；本页用它组合 detents、背景、拖动指示器、背景交互、禁止下滑等 presentation modifiers。
- **fitToContents**：自动按 sheet 内容高度决定 detent。
- **presentationBackground**：直接修改 sheet 表面背景。List / Form 自带 grouped 背景时可能还需关闭 scrollContentBackground 让底色透出。
- **Background interaction**：指定 sheet 停在某高度时，后面页面是否仍可点击。
- **RNHostView**：在 SwiftUI 原生视图层级中托管 React Native 子树的桥接组件。
- **matchContents**：RNHostView 按 RN 子视图自然尺寸测量；flex 布局要填满时则省略。
- **SwiftUI BottomSheet 与 universal BottomSheet**：本页是 @expo/ui/swift-ui 的 Apple 平台实现；universal 入口提供 Android、iOS 与 Web 的跨平台接口。
- **Sheet dismissal**：interactiveDismissDisabled 限制下滑关闭，不会替代页面内的显式关闭操作。

## 官方代码主题覆盖

保留安装命令和全部十一种使用方式：基础 sheet、RN anchor、内容自适应、纯色背景、多个 detent、detent selection 读写、背景交互、禁止下滑关闭、RN counter 交互内容、RN flex 填充、FlatList 滚动列表。API 表涵盖 anchor、children、fitToContents、isPresented、onDismiss、onIsPresentedChange。

## 下一页

Latest 页脚 Next 指向 [SwiftUI Button](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/button/)，介绍原生 SwiftUI 按钮及样式。

**翻页：**[上一页：SwiftUI Alert](./067-SwiftUI-Alert.md) · [返回目录](./README.md) · [下一页：SwiftUI Button](./069-SwiftUI-Button.md)
