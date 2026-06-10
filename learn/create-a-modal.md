# 使用 React Native Modal 创建 Emoji 选择器

> 原文档：Create a modal  
> 文档修改日期：2026 年 5 月 18 日  
> 适用上下文：Expo 教程第 5 章  
> 内容范围：创建 Emoji 选择弹窗、选择 Emoji，并将其显示在图片上

## 文档解决的问题

本章在已有的图片选择页面上增加一套图片编辑操作：

1. 用户选择图片或使用占位图片。
2. 页面显示 Reset、添加、Save 三个操作按钮。
3. 点击中间的添加按钮，从屏幕底部打开 Emoji 选择弹窗。
4. 用户在横向列表中选择一个 Emoji。
5. 弹窗关闭，选中的 Emoji 显示在图片上方。

最终建立的数据流是：

```text
选择或确认图片
    ↓
显示图片操作按钮
    ↓
点击添加按钮
    ↓
打开 Emoji Picker Modal
    ↓
选择 Emoji
    ↓
保存选中的 Emoji 到页面状态
    ↓
关闭 Modal
    ↓
将 Emoji 显示在图片上
```

本章重点不是完成完整的图片编辑器。以下能力会在后续章节实现：

- 拖动 Emoji
- 点击缩放 Emoji
- 保存编辑后的图片

---

## 适用场景

这篇文档适合学习：

- 如何使用 React Native 的 `Modal` 创建弹窗。
- 如何通过 React state 控制弹窗的显示和隐藏。
- 如何使用 `FlatList` 渲染横向可滚动列表。
- 如何通过回调函数将子组件中的选择结果传回父组件。
- 如何根据 state 条件渲染不同的操作界面。
- 如何在 Expo 应用中使用 `@expo/vector-icons` 和 `expo-image`。

本章实现的是一种底部弹出的选择面板。虽然使用的是 Emoji，类似结构也可以用于：

- 贴纸选择器
- 滤镜选择器
- 图片或素材选择器
- 底部操作面板
- 颜色或模板选择器

> **基于文档内容推导：**这些扩展场景与本章具有相同的“打开弹窗 → 选择项目 → 回传结果 → 关闭弹窗”数据流。

---

## 阅读前需要理解的背景

## React Native 组件不是 HTML 元素

React Web 中通常使用：

```tsx
<div>
  <button>Open</button>
</div>
```

React Native 中对应的基础组件是：

```tsx
<View>
  <Pressable>
    <Text>Open</Text>
  </Pressable>
</View>
```

本章主要使用以下组件：

| React Native 组件 | 大致对应的 Web 概念 | 作用 |
|---|---|---|
| `View` | `div` | 布局容器 |
| `Text` | 文本元素 | 显示文本 |
| `Pressable` | 可交互的 `button` | 处理点击或按压 |
| `Modal` | 弹窗或覆盖层 | 在应用其他内容上方显示内容 |
| `FlatList` | 列表渲染组件 | 高效渲染可滚动数据列表 |
| `StyleSheet` | CSS 样式声明 | 创建 React Native 样式对象 |

这里的 `onPress` 类似 React Web 中的 `onClick`。

---

## Expo 在本章中的作用

本章同时使用了 React Native API 和 Expo 提供的库：

| 来源 | 内容 |
|---|---|
| React Native | `Modal`、`View`、`Text`、`Pressable`、`FlatList`、`Platform` |
| Expo | `expo-image-picker`、`expo-image`、`@expo/vector-icons` |
| React | `useState`、`PropsWithChildren` |

需要区分：

- `Modal` 是 React Native 提供的组件，不是 Expo 专属组件。
- `expo-image-picker` 用来打开系统媒体库。
- `expo-image` 用来显示图片。
- `@expo/vector-icons` 提供图标集合。

---

# 实现流程

## 第一步：控制图片操作按钮是否显示

在 `app/(tabs)/index.tsx` 中增加状态：

```tsx
const [showAppOptions, setShowAppOptions] = useState<boolean>(false);
```

这个状态控制页面当前显示哪组操作：

| `showAppOptions` | 页面显示内容 |
|---|---|
| `false` | “Choose a photo”和“Use this photo” |
| `true` | Reset、添加和 Save |

初始值为 `false`，因为用户还没有选择或确认图片。

### 选择图片后显示操作按钮

图片选择成功后执行：

```tsx
setSelectedImage(result.assets[0].uri);
setShowAppOptions(true);
```

这里进行了两次状态更新：

- `selectedImage` 保存所选图片的 URI。
- `showAppOptions` 切换到编辑操作界面。

如果用户取消选择，则继续调用：

```tsx
alert('You did not select any image.');
```

### 使用占位图片

第二个按钮不打开媒体库，只切换界面状态：

```tsx
<Button
  label="Use this photo"
  onPress={() => setShowAppOptions(true)}
/>
```

因此，用户可以不选择新图片，直接使用当前占位图片进入后续流程。

### 条件渲染

页面使用三元表达式切换两组 UI：

```tsx
{showAppOptions ? (
  <View />
) : (
  <View style={styles.footerContainer}>
    ...
  </View>
)}
```

这一阶段暂时用空的 `<View />` 占位，下一步再替换为实际操作按钮。

这与 React Web 中常见的条件渲染完全相同，区别只在于使用 `View` 而不是 `div`。

---

## 第二步：确保自定义 Button 调用传入的事件

`components/Button.tsx` 中的 `Pressable` 更新为：

```tsx
<Pressable style={styles.button} onPress={onPress}>
```

这意味着 `Button` 自身不再写死 `alert` 行为，而是执行父组件传入的 `onPress`。

对应 React Web 的典型写法是：

```tsx
function Button({ onClick }) {
  return <button onClick={onClick}>...</button>;
}
```

这是实现可复用组件的重要模式：组件负责外观和交互入口，父组件决定具体业务行为。

---

## 第三步：创建三个图片操作按钮

操作区由三个横向排列的按钮组成：

```text
Reset        +        Save
```

中间按钮使用单独的圆形样式，负责打开 Emoji 弹窗。

### `CircleButton.tsx`

该组件接收一个回调：

```tsx
type Props = {
  onPress: () => void;
};
```

内部使用 `MaterialIcons` 的 `add` 图标：

```tsx
<MaterialIcons name="add" size={38} color="#25292e" />
```

两层 `View` 和 `Pressable` 分别负责：

- 外层：黄色边框、固定尺寸和圆形外观。
- 内层：白色背景、居中图标和点击处理。

`borderRadius: 42` 与 `84 × 84` 的尺寸配合形成圆形。

### `IconButton.tsx`

该组件用于 Reset 和 Save：

```tsx
type Props = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
};
```

各属性作用如下：

| 属性 | 作用 |
|---|---|
| `icon` | Material Icons 图标名称 |
| `label` | 图标下方的文字 |
| `onPress` | 用户按下按钮时执行的函数 |

`keyof typeof MaterialIcons.glyphMap` 限制 `icon` 必须是 Material Icons 支持的名称。

这比将它声明为普通 `string` 更安全：TypeScript 可以在开发阶段发现无效图标名。

### 在页面中组合按钮

```tsx
<View style={styles.optionsContainer}>
  <View style={styles.optionsRow}>
    <IconButton icon="refresh" label="Reset" onPress={onReset} />
    <CircleButton onPress={onAddSticker} />
    <IconButton icon="save-alt" label="Save" onPress={onSaveImageAsync} />
  </View>
</View>
```

对应行为：

| 按钮 | 回调 | 当前实现 |
|---|---|---|
| Reset | `onReset` | 返回图片选择界面 |
| 添加 | `onAddSticker` | 后续用于打开弹窗 |
| Save | `onSaveImageAsync` | 本章暂未实现 |

操作区样式：

```tsx
optionsContainer: {
  position: 'absolute',
  bottom: 80,
},
optionsRow: {
  alignItems: 'center',
  flexDirection: 'row',
},
```

`flexDirection: 'row'` 让子组件横向排列。

`position: 'absolute'` 和 `bottom: 80` 将操作区放置在距离底部 80 个单位的位置。

---

## 第四步：创建 Emoji Picker Modal

新建：

```text
components/EmojiPicker.tsx
```

组件属性定义如下：

```tsx
type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
}>;
```

### Props 说明

| 属性 | 类型 | 作用 |
|---|---|---|
| `isVisible` | `boolean` | 控制弹窗显示或隐藏 |
| `onClose` | `() => void` | 请求关闭弹窗 |
| `children` | React 子节点 | 插入 Emoji 列表 |

`PropsWithChildren` 是 React 提供的类型工具，用来为属性类型加入 `children`。

这与 React Web 中的弹窗容器模式相同：

```tsx
<Modal>
  <CustomContent />
</Modal>
```

### Modal 配置

```tsx
<Modal
  animationType="slide"
  transparent={true}
  visible={isVisible}
>
```

| 属性 | 文档中的作用 |
|---|---|
| `visible` | 根据 `isVisible` 控制弹窗打开或关闭 |
| `transparent` | 控制 Modal 是否使用透明呈现方式 |
| `animationType="slide"` | Modal 进入和离开屏幕时使用滑动动画 |

文档将这个 Modal 设计为从屏幕底部出现的面板：

```tsx
modalContent: {
  height: '25%',
  width: '100%',
  position: 'absolute',
  bottom: 0,
}
```

因此，实际内容只占屏幕高度的 `25%`，并固定在底部。

### 关闭按钮

```tsx
<Pressable onPress={onClose}>
  <MaterialIcons name="close" color="#fff" size={22} />
</Pressable>
```

`EmojiPicker` 不直接修改父组件状态，只调用 `onClose`。真正的关闭逻辑由父组件提供。

---

## 第五步：在页面中控制 Modal

增加状态：

```tsx
const [isModalVisible, setIsModalVisible] =
  useState<boolean>(false);
```

初始值为 `false`，所以页面首次加载时不会显示 Modal。

### 打开 Modal

```tsx
const onAddSticker = () => {
  setIsModalVisible(true);
};
```

该函数传给中间的圆形按钮：

```tsx
<CircleButton onPress={onAddSticker} />
```

### 关闭 Modal

```tsx
const onModalClose = () => {
  setIsModalVisible(false);
};
```

将状态和关闭函数传给 Emoji Picker：

```tsx
<EmojiPicker
  isVisible={isModalVisible}
  onClose={onModalClose}
>
  {/* Emoji list component will go here */}
</EmojiPicker>
```

完整控制关系是：

```text
Index 持有 isModalVisible
    ↓
isVisible 传给 EmojiPicker
    ↓
EmojiPicker 根据 visible 显示或隐藏
    ↓
用户点击关闭按钮
    ↓
EmojiPicker 调用 onClose
    ↓
Index 将 isModalVisible 设置为 false
```

这属于 React 中典型的“状态提升”：父组件持有状态，子组件通过 props 接收状态和操作回调。

---

## 第六步：使用 FlatList 显示 Emoji 列表

新建：

```text
components/EmojiList.tsx
```

组件接收两个回调：

```tsx
type Props = {
  onSelect: (image: ImageSourcePropType) => void;
  onCloseModal: () => void;
};
```

| 属性 | 作用 |
|---|---|
| `onSelect` | 将选中的 Emoji 图片传给父组件 |
| `onCloseModal` | 选择完成后关闭 Modal |

### Emoji 数据

```tsx
const [emoji] = useState<ImageSourcePropType[]>([
  require("../assets/images/emoji1.png"),
  require("../assets/images/emoji2.png"),
  require("../assets/images/emoji3.png"),
  require("../assets/images/emoji4.png"),
  require("../assets/images/emoji5.png"),
  require("../assets/images/emoji6.png"),
]);
```

`ImageSourcePropType` 是 React Native 图片来源的类型。

这里的图片是项目内的静态资源，因此使用 `require()` 引入，而不是 Web 中常见的普通 URL 字符串。

> 文档没有说明如何下载、创建或配置这六张 Emoji 图片，只假定它们已经存在于 `assets/images` 目录。

### FlatList 配置

```tsx
<FlatList
  horizontal
  showsHorizontalScrollIndicator={Platform.OS === 'web'}
  data={emoji}
  contentContainerStyle={styles.listContainer}
  renderItem={...}
/>
```

| 属性 | 作用 |
|---|---|
| `data` | 要渲染的数据数组 |
| `renderItem` | 定义每一项如何渲染 |
| `horizontal` | 将列表改为横向滚动 |
| `contentContainerStyle` | 设置列表内容容器的样式 |
| `showsHorizontalScrollIndicator` | 控制横向滚动条是否显示 |

滚动条仅在 Web 平台显示：

```tsx
Platform.OS === 'web'
```

`Platform` 是 React Native 的平台判断模块。这里体现了 Expo 应用可以同时面向 Android、iOS 和 Web，但针对不同平台调整部分 UI 行为。

### 选择 Emoji

每张图片外面包裹一个 `Pressable`：

```tsx
<Pressable
  onPress={() => {
    onSelect(item);
    onCloseModal();
  }}
>
  <Image source={item} key={index} style={styles.image} />
</Pressable>
```

用户点击后依次发生：

1. `onSelect(item)` 将当前 Emoji 传给父组件。
2. `onCloseModal()` 关闭选择弹窗。

---

## 第七步：保存用户选择的 Emoji

页面增加状态：

```tsx
const [pickedEmoji, setPickedEmoji] =
  useState<ImageSourcePropType | undefined>(undefined);
```

初始值为 `undefined`，表示还没有选中任何 Emoji。

将状态更新函数直接作为回调传给列表：

```tsx
<EmojiList
  onSelect={setPickedEmoji}
  onCloseModal={onModalClose}
/>
```

当 `EmojiList` 调用：

```tsx
onSelect(item);
```

实际执行的就是：

```tsx
setPickedEmoji(item);
```

这是 React 中很常见的写法：当回调参数与 state setter 的参数完全一致时，可以直接传递 setter。

---

## 第八步：显示选中的 Emoji

新建：

```text
components/EmojiSticker.tsx
```

组件接收：

```tsx
type Props = {
  imageSize: number;
  stickerSource: ImageSourcePropType;
};
```

| 属性 | 作用 |
|---|---|
| `imageSize` | 设置 Emoji 的宽度和高度 |
| `stickerSource` | 要显示的 Emoji 图片来源 |

渲染逻辑：

```tsx
<View style={{ top: -350 }}>
  <Image
    source={stickerSource}
    style={{ width: imageSize, height: imageSize }}
  />
</View>
```

页面中通过条件渲染显示贴纸：

```tsx
{pickedEmoji && (
  <EmojiSticker
    imageSize={40}
    stickerSource={pickedEmoji}
  />
)}
```

含义是：

- `pickedEmoji` 为 `undefined` 时，不渲染贴纸。
- 用户选择 Emoji 后，渲染 `EmojiSticker`。
- 当前贴纸固定为 `40 × 40`。
- 当前通过 `top: -350` 将贴纸向上移动到图片区域。

文档说明 `imageSize` 会在下一章用于点击缩放，本章尚未实现缩放。

---

# 文件与目录变化

本章涉及以下文件：

```text
app/
└── (tabs)/
    └── index.tsx

components/
├── Button.tsx
├── CircleButton.tsx
├── IconButton.tsx
├── EmojiPicker.tsx
├── EmojiList.tsx
└── EmojiSticker.tsx

assets/
└── images/
    ├── background-image.png
    ├── emoji1.png
    ├── emoji2.png
    ├── emoji3.png
    ├── emoji4.png
    ├── emoji5.png
    └── emoji6.png
```

各文件职责：

| 文件 | 职责 |
|---|---|
| `index.tsx` | 持有页面状态并协调所有组件 |
| `Button.tsx` | 图片选择阶段的通用按钮 |
| `CircleButton.tsx` | 打开 Emoji Picker 的圆形按钮 |
| `IconButton.tsx` | Reset 和 Save 操作按钮 |
| `EmojiPicker.tsx` | Modal 外壳、标题和关闭按钮 |
| `EmojiList.tsx` | 横向 Emoji 列表及选择逻辑 |
| `EmojiSticker.tsx` | 显示已选 Emoji |

本章没有提供安装命令，也没有新增配置文件。

---

# 核心状态与职责

页面最终维护四个 state：

| State | 类型 | 作用 |
|---|---|---|
| `selectedImage` | `string \| undefined` | 保存媒体库所选图片 URI |
| `showAppOptions` | `boolean` | 控制图片选择按钮和编辑按钮之间的切换 |
| `isModalVisible` | `boolean` | 控制 Emoji Picker 是否显示 |
| `pickedEmoji` | `ImageSourcePropType \| undefined` | 保存当前选择的 Emoji |

这些状态分别代表四个不同问题：

```text
selectedImage：用户选择了哪张图片？
showAppOptions：页面处于选择阶段还是编辑阶段？
isModalVisible：Emoji 弹窗当前是否打开？
pickedEmoji：用户选择了哪个 Emoji？
```

将它们拆开可以避免用一个复杂状态同时表示多个互不相同的 UI 条件。

---

# React Web 开发者容易误解的地方

## Modal 不是普通 View

`Modal` 会将内容显示在应用其他内容之上，不只是当前布局中的一个普通子元素。

虽然 JSX 中它位于 `Index` 返回内容的底部：

```tsx
<EmojiPicker ... />
```

但它呈现出来时会覆盖在其他内容上方。

## Pressable 对应交互元素

React Native 没有 HTML 的 `<button>`。这里使用：

```tsx
<Pressable onPress={...}>
```

也不是 `onClick`，而是 `onPress`。

## 样式不是浏览器 CSS

React Native 样式使用 JavaScript 对象：

```tsx
const styles = StyleSheet.create({
  optionsRow: {
    flexDirection: 'row',
  },
});
```

需要特别注意，React Native 的 Flexbox 默认方向通常表现为纵向排列。本章必须显式设置：

```tsx
flexDirection: 'row'
```

才能横向排列三个操作按钮。

## 本地图片使用 require

本章的静态图片写法是：

```tsx
require("../assets/images/emoji1.png")
```

而媒体库返回的图片使用 URI：

```tsx
result.assets[0].uri
```

两者来源不同，因此状态和组件属性使用了能够表达 React Native 图片来源的类型。

## Platform 不是浏览器环境判断

本章使用：

```tsx
Platform.OS === 'web'
```

这不是通过 `window` 或 user agent 判断环境，而是通过 React Native 的平台模块处理跨平台差异。

## children 用来组合 Modal 内容

`EmojiPicker` 只负责通用弹窗框架，不直接写死 Emoji 列表：

```tsx
<EmojiPicker>
  <EmojiList />
</EmojiPicker>
```

这与 React Web 中通过 `children` 创建可组合组件的方式一致。

---

# 注意事项、限制与坑点

## Reset 只切换操作界面

文档中的 Reset 实现只有：

```tsx
const onReset = () => {
  setShowAppOptions(false);
};
```

它明确实现的是“让图片选择按钮重新出现”。

> **基于文档代码推导：**该函数没有清空 `selectedImage` 或 `pickedEmoji`。因此不能将它理解为完整清除所有编辑状态。

## Save 尚未实现

```tsx
const onSaveImageAsync = async () => {
  // we will implement this later
};
```

Save 按钮目前只是占位，不会真正保存图片。

## 贴纸位置是固定偏移

```tsx
<View style={{ top: -350 }}>
```

当前使用固定数值将贴纸移动到图片区域。

文档没有讨论该位置在不同屏幕尺寸、方向或图片尺寸下的适配行为。

## 当前只能保存一个选中 Emoji

`pickedEmoji` 是单个值：

```tsx
ImageSourcePropType | undefined
```

每次选择都会替换之前的状态。

> **基于文档代码推导：**当前结构一次只显示一个 Emoji，不支持同时保存多个贴纸。

## Emoji 暂时不能交互

当前 Emoji 只能显示，不能：

- 拖动
- 缩放
- 旋转

文档明确说明拖动和点击缩放将在下一章实现。

## 资源文件必须存在

代码引用了：

```text
assets/images/emoji1.png
...
assets/images/emoji6.png
```

如果这些文件不存在或路径不匹配，代码无法正常加载对应图片。

## Web 与原生平台存在显示差异

文档专门使用：

```tsx
showsHorizontalScrollIndicator={Platform.OS === 'web'}
```

说明同一个组件可能需要针对 Web、Android 和 iOS调整部分呈现行为。

文档展示了三个平台的结果，但没有进一步讨论平台兼容性问题。

## 当前文档未涉及的内容

当前文档未涉及：

- 依赖安装命令
- Android 原生工程配置
- iOS 原生工程配置
- 权限配置细节
- Modal 的系统返回键处理
- 点击 Modal 外部关闭
- 无障碍属性
- 键盘交互
- 多个贴纸管理
- 图片保存实现
- 测试方案
- 错误边界
- 性能优化
- 屏幕旋转适配
- 安全区域适配
- FlatList 的列表 key 策略说明

因此，不能仅根据本章判断这些问题应如何处理。

---

# 实际开发中的使用方式

本章最值得复用的不是 Emoji 样式，而是组件和数据流设计：

```text
页面组件持有业务状态
    ↓
Modal 接收 visible 和 onClose
    ↓
列表通过 onSelect 返回选择结果
    ↓
页面保存结果
    ↓
根据结果条件渲染内容
```

可以抽象为：

```tsx
const [isVisible, setIsVisible] = useState(false);
const [selectedItem, setSelectedItem] = useState<Item>();

<PickerModal
  isVisible={isVisible}
  onClose={() => setIsVisible(false)}
>
  <ItemList
    onSelect={setSelectedItem}
    onCloseModal={() => setIsVisible(false)}
  />
</PickerModal>
```

这种结构让不同组件职责清楚：

- 页面负责状态。
- Modal 负责展示容器。
- List 负责展示选项。
- Sticker 负责展示选择结果。

> **基于经验建议：**实际项目中可以将“选择并关闭”封装为一个父组件函数，以减少子组件需要接收的回调数量。但这不是原文档要求。

> **基于经验建议：**如果 Reset 的产品含义是“恢复初始状态”，应明确决定是否同时清空图片、Emoji 和 Modal 状态。本章的 Reset 仅切换按钮界面。

> **基于经验建议：**固定的 `top: -350` 适合教程中的已知布局，实际开发通常需要根据容器尺寸计算贴纸位置。这一点原文档没有展开。

---

# 文档明确说明与推导内容

## 文档明确说明

- 使用 React Native `Modal` 显示 Emoji Picker。
- `visible` 控制 Modal 的打开和关闭。
- `animationType="slide"` 使用滑动动画。
- `EmojiPicker` 通过 `children` 显示 Emoji 列表。
- 使用 `FlatList` 横向显示 Emoji。
- Web 平台显示横向滚动条。
- 选择 Emoji 后调用 `onSelect`，随后关闭 Modal。
- 选中的 Emoji 保存到 `pickedEmoji`。
- `pickedEmoji` 不为 `undefined` 时显示 `EmojiSticker`。
- Save 功能尚未实现。
- Emoji 拖动和缩放将在下一章实现。

## 基于文档内容推导

- 当前一次只能显示一个 Emoji，因为状态只保存单个图片来源。
- Reset 不会清空已选择的图片或 Emoji，因为函数只修改了 `showAppOptions`。
- `top: -350` 是依赖当前布局的固定定位方式。
- `Index` 是整个流程的状态协调者。
- 该组件结构可以复用于其他底部选择器。

---

# 总结

本章完成了一条完整的跨组件交互流程：

1. 通过 `showAppOptions` 切换图片选择界面和编辑操作界面。
2. 创建可复用的圆形按钮与图标按钮。
3. 使用 React Native `Modal` 创建底部 Emoji Picker。
4. 使用 `isModalVisible` 控制 Modal。
5. 使用 `FlatList` 横向渲染本地 Emoji 图片。
6. 通过回调将选中项从 `EmojiList` 传给 `Index`。
7. 将选择结果保存到 `pickedEmoji`。
8. 条件渲染 `EmojiSticker`，把 Emoji 显示到图片上。

对于 React Web 开发者，核心 React 思想没有变化：state、props、children、条件渲染和回调仍然是主要机制。真正需要适应的是 React Native 的组件体系、图片来源类型、平台判断方式以及移动端布局和交互 API。
