# 227｜react-native-keyboard-controller 键盘控制

**翻页：**[上一页：Gesture Handler 手势处理](./226-Expo-ThirdParty-GestureHandler.md) · [目录](./README.md) · [下一页：react-native-maps 地图](./228-Expo-ThirdParty-Maps.md)

**官方页面：**[Keyboard Controller · Latest](https://docs.expo.dev/versions/latest/sdk/keyboard-controller/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/keyboard-controller/) · [库的完整官方文档](https://kirillzyusko.github.io/react-native-keyboard-controller/)

**版本与平台：**Latest 推荐 `react-native-keyboard-controller 1.21.9`；SDK v56 推荐 `1.21.6`。支持 Android / iOS，并包含在 Expo Go 中。

## 统一 Android 和 iOS 的键盘交互

React Native 内置键盘 API 在不同平台的交互行为会有差异。`react-native-keyboard-controller` 在系统键盘上提供额外管理能力，帮助 Android 和 iOS 使用更一致的滚动、工具栏和键盘避让行为。

安装当前 Expo SDK 兼容的包：

```sh
npx expo install react-native-keyboard-controller
yarn expo install react-native-keyboard-controller
pnpm expo install react-native-keyboard-controller
bun expo install react-native-keyboard-controller
```

## 表单滚动示例

`KeyboardAwareScrollView` 会在键盘打开时调整滚动区域，让输入框能移到可视位置；`KeyboardToolbar` 用来显示键盘操作工具栏。`bottomOffset={62}` 给内容区域额外留出底部空间。

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

## 新手名词解释

- **键盘避让（Keyboard avoiding）：**系统键盘覆盖输入框时，滚动或移动页面内容，让当前正在编辑的输入框仍可见。
- **`KeyboardAwareScrollView`：**能感知键盘状态并帮助滚动定位的视图容器。
- **`KeyboardToolbar`：**与软键盘配合展示的工具栏组件。
- **`bottomOffset`：**键盘 / 页面底部额外预留的偏移量，示例中为 62 个 React Native 布局点。

更完整的用法可继续阅读[官方键盘控制指南](https://kirillzyusko.github.io/react-native-keyboard-controller/)。

## 源页代码主题覆盖

- Installation：保留 npx、Yarn、pnpm、Bun 四种安装命令。
- Usage：保留官方完整 `KeyboardAwareScrollView`、`KeyboardToolbar`、TextInput 与 StyleSheet 示例。
- Expo Latest 与 SDK v56 的功能、示例和 Next 顺序一致；包版本分别为 `1.21.9` / `1.21.6`。

**翻页：**[上一页：Gesture Handler 手势处理](./226-Expo-ThirdParty-GestureHandler.md) · [目录](./README.md) · [下一页：react-native-maps 地图](./228-Expo-ThirdParty-Maps.md)
