# Keyboard Controller（键盘控制器）

> 文档地址：https://docs.expo.dev/versions/unversioned/sdk/keyboard-controller.md

## 文档解决的问题

在移动端开发中，当用户聚焦到一个文本输入框（`TextInput`）时，系统软键盘会弹出并遮挡屏幕下半部分的内容。这在表单页面、聊天界面等场景中尤其常见。

在 React Web 开发中，你通常不需要关心软键盘的问题，因为桌面浏览器没有软键盘，移动端浏览器也会自动处理页面滚动。但在 React Native 中，**软键盘会直接覆盖在页面内容之上**，不会自动推高页面，这就需要开发者手动处理键盘与输入框之间的协调关系。

`react-native-keyboard-controller` 这个库正是为了解决这一问题：它提供了一个**在 Android 和 iOS 上行为完全一致的键盘管理器**。这意味着你不需要为两个平台分别编写不同的键盘处理逻辑，一套代码即可在双端表现统一。

## 阅读前需要理解的背景知识

### React Native 中的键盘问题

在 React Web 中，浏览器窗口在软键盘弹出时会自动缩小可视区域（viewport），页面内容自然上移。但在 React Native 中：

- **Android** 默认行为：键盘弹出时会覆盖在内容之上（`adjustResize` / `adjustPan` 模式需要手动配置，且行为不一致）。
- **iOS** 默认行为：键盘弹出时也是覆盖在内容之上。

React Native 内置了 `KeyboardAvoidingView` 组件来处理这个问题，但它在两个平台上的表现**并不完全一致**，且功能相对基础。

### `react-native-keyboard-controller` vs React Native 内置方案

`react-native-keyboard-controller` 是一个**第三方增强库**，相比 React Native 内置的 `KeyboardAvoidingView`，它提供了：

- 更一致的跨平台行为
- 更丰富的组件（如 `KeyboardAwareScrollView`、`KeyboardToolbar`）
- 更细粒度的键盘事件控制

## 安装

使用你惯用的包管理器执行以下命令即可安装：

```sh
# npm
npx expo install react-native-keyboard-controller

# yarn
yarn expo install react-native-keyboard-controller

# pnpm
pnpm expo install react-native-keyboard-controller

# bun
bun expo install react-native-keyboard-controller
```

**说明：**

- `npx expo install` 是 Expo 推荐的安装方式（类似于 `npm install`，但会自动选择与当前 Expo SDK 兼容的包版本）。作为 React Web 开发者，你可以把它理解为 Expo 版的 `npm install`，它会帮你处理版本兼容问题。
- 该库同时支持 **Expo Go**（Expo 的开发客户端），这意味着在开发阶段你可以直接在 Expo Go 中预览效果，无需构建自定义原生客户端。

### 已有 React Native 项目的额外步骤

如果你的项目不是通过 Expo 创建的，而是一个**已有的纯 React Native 项目**（即没有集成 Expo 模块的项目），你需要：

1. 先在项目中添加 `expo` 模块（Expo 提供了一套可以渐进式集成到已有 RN 项目中的原生模块）。
2. 然后参考该库官方 README 中的安装说明完成原生端的配置。

> **对 Web 开发者的提示：** 在 Web 项目中安装一个 npm 包后通常就可以直接使用了。但在 React Native 中，某些库包含**原生代码**（Android 的 Java/Kotlin 代码和 iOS 的 Swift/Objective-C 代码），安装后可能还需要进行原生端的链接或配置。`react-native-keyboard-controller` 在使用 Expo 管理的项目中可以自动处理这些原生依赖，这也是使用 Expo 的便利之处。

## 核心组件与用法

### 基本用法示例

以下是一个完整的表单页面示例，展示了如何使用该库的两个核心组件：

```tsx
import { TextInput, View, StyleSheet } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardToolbar,
} from 'react-native-keyboard-controller';

export default function FormScreen() {
  return (
    <>
      <KeyboardAwareScrollView
        bottomOffset={62}
        contentContainerStyle={styles.container}
      >
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

### 关键组件说明

#### `KeyboardAwareScrollView`（键盘感知滚动视图）

这是该库最核心的组件。你可以把它理解为一个**增强版的 `ScrollView`**，它会自动监听键盘的弹出和收起事件，并在键盘弹出时自动调整滚动区域的高度和位置，确保当前聚焦的输入框不会被键盘遮挡。

**与 Web 开发的类比：** 在 Web 中，当输入框获得焦点时，浏览器会自动将页面滚动到让输入框可见的位置。`KeyboardAwareScrollView` 在 React Native 中实现了类似的效果。

**关键属性：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `bottomOffset` | `number` | 键盘弹出时，输入框底部与键盘顶部之间保留的额外间距（单位：逻辑像素）。示例中设为 `62`，是为了给底部的 `KeyboardToolbar` 留出空间。如果不设置，输入框可能会紧贴键盘顶部。 |
| `contentContainerStyle` | `StyleProp<ViewStyle>` | 与 React Native 内置 `ScrollView` 的 `contentContainerStyle` 含义一致——控制**滚动内容容器**的样式（而非滚动视图本身的外层样式）。如果你是从 Web 转过来的开发者，可以把它理解为 CSS 中对内部内容 `div` 设置样式，而非对外层 `overflow: scroll` 的容器设置样式。 |

#### `KeyboardToolbar`（键盘工具栏）

这个组件会在屏幕底部渲染一个工具栏（通常包含"上一步""下一步""完成"等按钮），方便用户在多个输入框之间快速切换，或关闭键盘。

**使用方式：** 在示例中，`KeyboardToolbar` 被放置在 `KeyboardAwareScrollView` 的**同级位置**（即不在滚动视图内部），使用 React Fragment (`<>...</>`) 将两者包裹在一起。这样工具栏会始终固定在屏幕底部，不会随内容滚动。

**与 Web 开发的类比：** Web 中没有直接对应的原生概念。你可以把它理解为类似于移动端网页底部固定的导航栏（`position: fixed; bottom: 0`），但它是专门为键盘交互设计的。

### 代码结构解析

示例使用了以下 React Native 概念，这里为 Web 开发者做简要说明：

- **`StyleSheet.create()`**：React Native 的样式定义方式，类似于 Web 中用对象字面量写 CSS，但它不支持所有 CSS 属性，且使用的是驼峰命名（如 `borderRadius` 而非 `border-radius`）。
- **`<>` (Fragment)**：与 React Web 中的 Fragment 完全一致，用于包裹多个子元素而不添加额外的 DOM/原生节点。
- **`TextInput`**：React Native 的文本输入组件，对应 Web 中的 `<input type="text">` 或 `<textarea>`。
- **`flexGrow` / `flexShrink`**：与 Web CSS 的 Flexbox 含义一致，但在 React Native 中，Flexbox 是**默认的布局方式**（所有组件默认 `display: flex`，`flexDirection` 默认为 `column`），这与 Web 中默认为 `block` 布局不同。

## 注意事项、限制条件和坑点

### 1. `bottomOffset` 需要根据实际布局调整

示例中 `bottomOffset={62}` 是一个参考值，实际项目中你需要根据 `KeyboardToolbar` 的高度、底部安全区域（Safe Area）等因素来调整这个数值。如果设置过小，输入框可能被工具栏遮挡；设置过大，则会出现不必要的空白区域。

### 2. 平台一致性是核心卖点，但不等于零差异

该库的目标是让键盘处理在 Android 和 iOS 上行为一致，但底层实现仍然依赖各平台的原生键盘 API。在某些极端场景（如自定义键盘、第三方输入法、分屏模式）下，仍可能出现细微差异。**建议在两个平台上都进行充分测试。**

### 3. 注意与 React Native 内置键盘方案的冲突

如果你的项目中同时使用了 React Native 内置的 `KeyboardAvoidingView` 和 `react-native-keyboard-controller`，可能会导致**双重处理**——两个组件都在尝试响应键盘事件，产生抖动或布局错乱。使用时应移除对应的内置方案。

### 4. 文档版本说明

当前文档页面标注为 **unversioned（未发布版本）**，对应的是即将发布的 Expo SDK 版本。如果你使用的是当前的稳定版 SDK（如 SDK 56），应参考对应版本的文档以确保 API 一致性。

## React Web 开发者需要特别注意的地方

1. **键盘问题在移动端是真实存在的痛点：** 在 Web 开发中你几乎不需要关心键盘遮挡问题，但在 React Native 中，这是表单类页面的**必答题**。不使用任何键盘处理方案的表单页面，在用户体验上是不合格的。

2. **没有 CSS `overflow` 的概念：** 在 Web 中，你可以通过 `overflow: auto` 让一个 `div` 在内容超出时自动滚动。在 React Native 中，你需要**显式使用 `ScrollView` 或其变体**（如本库的 `KeyboardAwareScrollView`）来实现滚动。普通 `View` 不会自动滚动。

3. **Flexbox 是默认且唯一的布局方式：** React Native 中没有 Web 的 `block`、`inline`、`grid` 等布局模式。所有布局都基于 Flexbox，且默认方向是 `column`（纵向排列）。这意味着组件会默认从上到下排列，而非 Web 中的从左到右。

4. **`StyleSheet` 不支持所有 CSS 属性：** React Native 的样式系统是 CSS 的子集。例如不支持 `calc()`、CSS 变量、`hover` 伪类等。

## 进阶学习资源

文档推荐了以下进阶学习方向：

- **高级键盘处理指南：** 官方提供了关于"使用 Keyboard Controller 进行高级键盘处理"的示例指南，涵盖了更复杂的场景（如自定义键盘动画、键盘事件监听等）。
- **官方完整 API 文档：** `react-native-keyboard-controller` 的官方网站提供了完整的 API 参考和使用说明，建议在实际开发中查阅以了解更多可用组件和配置项。

## 总结

`react-native-keyboard-controller` 是一个专注于解决 React Native 键盘遮挡问题的库，它通过 `KeyboardAwareScrollView` 和 `KeyboardToolbar` 两个核心组件，提供了跨平台一致的键盘处理体验。对于从 React Web 转入 React Native 的开发者来说，键盘管理是一个全新的领域——在 Web 中由浏览器自动处理的事情，在移动端需要你主动介入。这个库大幅降低了处理这一问题的复杂度，是构建包含文本输入的 React Native 应用时的推荐方案。

---

## 文档导航

- **上一页**：[gesture handler](./233__gesture-handler.md)
- **下一页**：[map view](./235__map-view.md)
