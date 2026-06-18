# 键盘管理 (Keyboard Handling)

> 原文地址：https://docs.expo.dev/guides/keyboard-handling/

---

在 iOS 和 Android 平台上管理屏幕键盘的行为，是构建良好用户体验的关键一环。React Native 内置了 `Keyboard` 和 `KeyboardAvoidingView` API 来处理常见的键盘事件。如果你需要更复杂、更定制化的交互，可以使用 `react-native-keyboard-controller` 这个第三方库，它提供了更高级的能力。

本指南将介绍常见的键盘场景以及对应的处理策略。

---

## 基础键盘管理

下面介绍如何使用 React Native 内置 API 来管理键盘交互。

### KeyboardAvoidingView（键盘避让视图）

`KeyboardAvoidingView` 是一个内置组件，它会根据键盘的高度**自动调整视图的尺寸、位置或底部内边距**，从而确保输入框不被键盘遮挡。

**关于 `behavior` 属性的平台差异：**

- **iOS**：通常使用 `padding` 效果最好，它会通过增加底部内边距来避让键盘。
- **Android**：很多情况下只需用 `KeyboardAvoidingView` 包裹输入框即可，`behavior` 可以传 `undefined`。

> 基于经验建议：不同应用的布局结构不同，建议对 `behavior` 的三种取值（`height`、`position`、`padding`）都进行尝试，找到最适合你应用的效果。

```tsx
import { KeyboardAvoidingView, TextInput } from 'react-native';

export default function HomeScreen() {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <TextInput placeholder="Type here..." />
    </KeyboardAvoidingView>;
  );
}
```

**代码说明：**
- `behavior={Platform.OS === 'ios' ? 'padding' : undefined}`：根据平台动态设置行为，iOS 使用 `padding`，Android 不设置。
- `style={{ flex: 1 }}`：确保容器占满整个屏幕，这样组件才能正确计算键盘避让的空间。
- 当键盘弹出时，组件的高度会自动适配，保证输入框始终可见。

### 处理 Android 底部 Tab 导航栏被键盘推上去的问题

当你在 Android 上使用底部 Tab 导航器（Bottom Tab Navigator）时，聚焦输入框可能会把 Tab 栏推到键盘上方，影响用户体验。有两种解决方案：

#### 方案一：设置 `softwareKeyboardLayoutMode` 为 `pan`

在应用的 Android 配置中添加 `softwareKeyboardLayoutMode` 属性：

```json
"expo" {
  "android": {
    "softwareKeyboardLayoutMode": "pan"
  }
}
```

**说明：** `pan` 模式会让整个界面随键盘平滑上移，而不是压缩布局。添加此配置后，需要**重启开发服务器并刷新应用**才能生效。

#### 方案二：键盘弹出时隐藏底部 Tab 栏

使用 `expo-router` 的 `Tabs` 组件时，可以通过 `tabBarHideOnKeyboard` 选项在键盘显示时隐藏导航栏：

```tsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarHideOnKeyboard: true,
      }}>
      <Tabs.Screen name="index" />
    </Tabs>
  );
}
```

**说明：** 设置 `tabBarHideOnKeyboard: true` 后，当键盘弹出时底部导航栏会自动隐藏，键盘收起时恢复显示。

> 基于经验建议：方案一适合大多数场景，能保留导航栏的可用性；方案二适合输入频繁且不需要频繁切换页面的场景（如聊天界面）。

### 键盘事件监听 (Keyboard Events)

React Native 的 `Keyboard` 模块允许你**监听原生键盘事件**、对事件做出响应，以及**手动操控键盘**（例如关闭它）。

使用 `Keyboard.addListener` 函数来监听事件，它接收一个事件标识符和一个回调函数。当键盘出现或消失时，回调函数会被调用并携带事件数据。

**可用的键盘事件：**

| 事件名 | 说明 |
|---|---|
| `keyboardDidShow` | 键盘完全显示后触发 |
| `keyboardDidHide` | 键盘完全隐藏后触发 |
| `keyboardWillShow` | 键盘即将显示时触发（仅 iOS） |
| `keyboardWillHide` | 键盘即将隐藏时触发（仅 iOS） |

下面的示例展示了一个实用场景：用一个状态变量 `isKeyboardVisible` 来跟踪键盘是否可见，并在键盘显示时提供一个"关闭键盘"按钮。注意 `Keyboard.dismiss` 的用法——它可以**程序化地收起键盘**。

```tsx
import { useEffect, useState } from 'react';
import { Keyboard, View, Button, TextInput } from 'react-native';

export default function HomeScreen() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    // 注册键盘显示事件监听器
    const showSubscription = Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
    // 注册键盘隐藏事件监听器
    const hideSubscription = Keyboard.addListener('keyboardDidHide', handleKeyboardHide);

    // 组件卸载时移除监听器，防止内存泄漏
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleKeyboardShow = event => {
    setIsKeyboardVisible(true);
  };

  const handleKeyboardHide = event => {
    setIsKeyboardVisible(false);
  };

  return (
    <View>
      {isKeyboardVisible && <Button title="Dismiss keyboard" onPress={Keyboard.dismiss} />}
      <TextInput placeholder="Type here..." />
    </View>
  );
}
```

**代码说明：**
- `Keyboard.addListener('keyboardDidShow', callback)`：注册一个键盘显示事件的监听器，返回一个订阅对象。
- `subscription.remove()`：在 `useEffect` 的清理函数中移除监听器，这是**防止内存泄漏**的重要步骤。
- `Keyboard.dismiss()`：手动关闭键盘的静态方法，可以在任何需要的地方调用。

---

## 高级键盘管理：使用 react-native-keyboard-controller

对于更复杂的交互场景——比如包含大量输入框的可滚动表单——推荐使用 `react-native-keyboard-controller` 库。它扩展了 React Native 原生 API 的能力，确保跨平台一致性，且只需少量配置就能获得原生级别的体验。

### 前置要求

#### 1. 需要开发构建 (Development Build)

这个库**不包含在 Expo Go 中**，你需要创建一个开发构建（Development Build）才能使用。

> 基于文档内容推导：这是因为该库包含原生代码，需要通过自定义构建才能集成到应用中。

#### 2. 安装 react-native-reanimated

`react-native-keyboard-controller` 依赖 `react-native-reanimated` 才能正常工作。

### 安装

通过命令行将库添加到你的 Expo 项目中：

```sh
npx expo install react-native-keyboard-controller
```

**说明：** 使用 `npx expo install` 而非 `npm install`，可以确保安装的版本与当前 Expo SDK 兼容。

### 设置 KeyboardProvider

用 `KeyboardProvider` 包裹你的应用入口，完成全局配置：

```tsx
import { Stack } from 'expo-router';
import { KeyboardProvider } from 'react-native-keyboard-controller';

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <Stack>
        <Stack.Screen name="home" />
        <Stack.Screen name="chat" />
      </Stack>
    </KeyboardProvider>
  );
}
```

**说明：** `KeyboardProvider` 必须放在应用的顶层（通常是根布局组件），这样它才能管理全局的键盘状态。所有使用 `react-native-keyboard-controller` 提供的 Hook 和组件都必须在 `KeyboardProvider` 内部。

### 处理多个输入框

`KeyboardAvoidingView` 在简单原型阶段很好用，但它需要针对不同平台做调优，且缺乏深度定制能力。

`KeyboardAwareScrollView` 是一个更强大的替代方案——它会**自动滚动到当前聚焦的 `TextInput`**，并提供原生级别的性能表现。对于元素较少的简单页面，它非常高效。

对于包含大量输入框的复杂界面，该库还提供了 `KeyboardToolbar`，可以与 `KeyboardAwareScrollView` 搭配使用。两者结合后，能自动管理输入框之间的导航（上一个/下一个），并防止屏幕被键盘遮挡，无需额外自定义配置：

```tsx
import { TextInput, View, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView, KeyboardToolbar } from 'react-native-keyboard-controller';

export default function FormScreen() {
  return (
    <>
      <KeyboardAwareScrollView bottomOffset={62} contentContainerStyle={styles.container}>
        <View>
          <TextInput placeholder="Type a message..." style={styles.textInput} />
          <TextInput placeholder="Type a message..." style={styles.textInput} />
        </View>
        <TextInput placeholder="Type a message..." style={styles.textInput} />
        <View>
          <TextInput placeholder="Type a message..." style={styles.textInput} />
          <TextInput placeholder="Type a message..." style={styles.textInput} />
          <TextInput placeholder="Type a message..." style={styles.textInput} />
        </View>
        <TextInput placeholder="Type a message..." style={styles.textInput} />
      </KeyboardAwareScrollView>
      <KeyboardToolbar />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 16,
  },
  listStyle: {
    padding: 16,
    gap: 16,
  },
  textInput: {
    width: 'auto',
    flexGrow: 1,
    flexShrink: 1,
    height: 45,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#d8d8d8',
    backgroundColor: '#fff',
    padding: 8,
    marginBottom: 8,
  },
});
```

**代码说明：**
- `KeyboardAwareScrollView`：包裹所有输入框，当某个输入框获得焦点时自动滚动使其可见。
- `bottomOffset={62}`：设置滚动时的底部偏移量，确保输入框不会被键盘工具栏遮挡。数值需要根据实际布局调整。
- `KeyboardToolbar`：渲染在键盘上方的工具栏，提供"上一个/下一个"导航按钮和"完成"按钮来收起键盘。开箱即用，也支持自定义内容。

> 基于经验建议：`bottomOffset` 的值通常设置为键盘工具栏的高度加上一些额外间距，如果你的工具栏高度不同，需要相应调整。

### 随键盘高度同步动画视图

对于高度定制化的需求，可以使用 `useKeyboardHandler` Hook。它能让你访问键盘的**生命周期事件**，跟踪动画的启动过程，以及在**每一帧中获取键盘的精确位置**。

利用这个 Hook，你可以构建一个自定义 Hook 来逐帧获取键盘高度。它使用 `react-native-reanimated` 的 `useSharedValue` 来返回这个值：

```tsx
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

const useGradualAnimation = () => {
  const height = useSharedValue(0);

  useKeyboardHandler(
    {
      onMove: event => {
        'worklet';
        height.value = Math.max(event.height, 0);
      },
    },
    []
  );
  return { height };
};
```

**代码说明：**
- `useSharedValue(0)`：创建一个可在 UI 线程上共享的响应式值，初始值为 0。
- `useKeyboardHandler`：注册键盘生命周期回调。`onMove` 在键盘动画的每一帧都被调用。
- `'worklet'`：标记该函数为 worklet，使其可以在 UI 线程上运行（这是 `react-native-reanimated` 的要求）。
- `Math.max(event.height, 0)`：确保高度值不为负数。

你可以将这个自定义 Hook 应用到需要在键盘出现或消失时**平滑动画**的视图中，例如聊天界面。组件获取到键盘高度后，通过 `useAnimatedStyle` 创建一个名为 `fakeView` 的动画样式。这个样式只定义了一个属性：`height`，其值与键盘高度匹配。

`fakeView` 样式被应用到一个位于 `TextInput` 之后的动画视图上。它的高度会**逐帧跟随键盘变化**，从而平滑地将内容向上推。键盘关闭时，它的高度缩小到零。

```tsx
import { StyleSheet, Platform, FlatList, View, StatusBar, TextInput } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useKeyboardHandler } from 'react-native-keyboard-controller';

import MessageItem from '@/components/MessageItem';
import { messages } from '@/messages';

const useGradualAnimation = () => {
  // 与上例相同的代码
};

export default function ChatScreen() {
  const { height } = useGradualAnimation();

  const fakeView = useAnimatedStyle(() => {
    return {
      height: Math.abs(height.value),
    };
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => <MessageItem message={item} />}
        keyExtractor={item => item.createdAt.toString()}
        contentContainerStyle={styles.listStyle}
      />
      <TextInput placeholder="Type a message..." style={styles.textInput} />
      <Animated.View style={fakeView} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  listStyle: {
    padding: 16,
    gap: 16,
  },
  textInput: {
    width: '95%',
    height: 45,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#d8d8d8',
    backgroundColor: '#fff',
    padding: 8,
    alignSelf: 'center',
    marginBottom: 8,
  },
});
```

**代码说明：**
- `useAnimatedStyle`：创建一个根据共享值变化而自动更新的动画样式，在 UI 线程上运行，性能优秀。
- `Animated.View`：使用 Reanimated 提供的 `Animated.View` 而非普通的 `View`，以支持动画样式。
- `fakeView` 的核心思路：在输入框下方放置一个高度动态变化的占位视图，当键盘升起时占位视图高度等于键盘高度，从而将输入框和消息列表推上去；键盘降下时高度归零。
- `Math.abs(height.value)`：取绝对值，确保高度始终为正数。

> 基于经验建议：这种"占位视图"的技巧在聊天界面中特别有用，因为它可以让消息列表随键盘自然上推，而不需要复杂的布局计算。但要注意，如果列表很长且使用了 `FlatList`，需确保 `contentContainerStyle` 的设置不会影响滚动行为。

---

## 方案选型总结

| 场景 | 推荐方案 |
|---|---|
| 简单页面，单个输入框 | `KeyboardAvoidingView`（内置） |
| 表单页面，多个输入框 | `KeyboardAwareScrollView` + `KeyboardToolbar` |
| 聊天界面，需要逐帧动画 | `useKeyboardHandler` + `useAnimatedStyle` |
| 仅需监听键盘事件 | `Keyboard.addListener`（内置） |
| Android 底部导航栏被键盘推起 | `softwareKeyboardLayoutMode: "pan"` 或 `tabBarHideOnKeyboard` |

> 基于文档内容推导：内置 API 足以应对简单场景；当需求涉及复杂表单或精细动画控制时，`react-native-keyboard-controller` 是更好的选择，但代价是需要使用开发构建而非 Expo Go。

---

## 补充资源

- **示例代码**：可在 GitHub 上查看示例项目的源代码。
- **react-native-keyboard-controller 官方文档**：查阅该库的官方文档以获取更多详细信息。

---

## 文档导航

- **上一页**：[local first](./160__local-first.md)
- **下一页**：[expo ui swift ui](./162__expo-ui-swift-ui.md)
