# 007｜用 React Native Modal 创建表情选择器

**翻页：**[上一页：使用图片选择器](./006-使用图片选择器.md) · [目录](./README.md) · [下一页：添加贴纸手势](./008-添加贴纸手势.md)

**官方页面：**[Create a modal](https://docs.expo.dev/tutorial/create-a-modal/)

**版本提醒：**本教程 URL 未锁 SDK；Modal 和 FlatList 是 RN 核心组件，图标来自模板里的 vector icons。本地 SDK56 API 优先按 v56 reference 校对。

## 图片选中后显示更多操作

在上一章选中图片 / 使用默认图后，显示 Reset、打开表情选择器、Save 三个按钮；用户尚未选择图片时保留 Choose / Use this photo 两个按钮：

```tsx
const [showAppOptions, setShowAppOptions] = useState(false);
const [isModalVisible, setIsModalVisible] = useState(false);
const [pickedEmoji, setPickedEmoji] = useState<ImageSourcePropType | undefined>();

const onReset = () => setShowAppOptions(false);
const onAddSticker = () => setIsModalVisible(true);
const onModalClose = () => setIsModalVisible(false);
const onSaveImageAsync = async () => {
  // 下一章再实现保存图片
};

return showAppOptions ? (
  <View style={styles.optionsRow}>
    <IconButton icon={'refresh'} label={'Reset'} onPress={onReset} />
    <CircleButton onPress={onAddSticker} />
    <IconButton icon={'save-alt'} label={'Save'} onPress={onSaveImageAsync} />
  </View>
) : (
  <View style={styles.footerContainer}>
    <Button theme={'primary'} label={'Choose a photo'} onPress={pickImageAsync} />
    <Button label={'Use this photo'} onPress={() => setShowAppOptions(true)} />
  </View>
);
```

源页先建立两个可复用按钮组件：`CircleButton` 接收点击回调并绘制加号圆按钮，`IconButton` 接收 `icon`、`label`、`onPress` 三个 props。两者使用 `@expo/vector-icons/MaterialIcons`，并通过 StyleSheet 设定尺寸、圆角、横排按钮和图标 / 标签布局。

## 用 Modal 作为底部表情面板

React Native `<Modal>` 在当前界面上层呈现独立内容。它的 `visible` 控制展示，`transparent` 保留后方页面可见，`animationType` 决定出现 / 关闭的过渡：

```tsx
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { PropsWithChildren } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type PickerProps = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
}>;

export function EmojiPicker({ isVisible, children, onClose }: PickerProps) {
  return (
    <Modal transparent animationType={'slide'} visible={isVisible}>
      <View style={styles.modalContent}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Choose a sticker</Text>
          <Pressable onPress={onClose}>
            <MaterialIcons name={'close'} color={'#fff'} size={22} />
          </Pressable>
        </View>
        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    height: '25%', width: '100%', backgroundColor: '#25292e',
    position: 'absolute', bottom: 0, borderTopLeftRadius: 18, borderTopRightRadius: 18,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#fff', fontSize: 16 },
});
```

父页面用 `isModalVisible` state 打开 / 关闭；加号按钮把它设成 `true`，关闭按钮将它改回 `false`。本章的保存功能仍只是占位 callback。

## 用 FlatList 横向显示 emoji

EmojiList 接收 `onSelect` 和 `onCloseModal` callbacks。`FlatList` 用 `data` 加 `renderItem` 显示数组内容；点选时把资源交给父组件并关闭 Modal：

```tsx
import { FlatList, ImageSourcePropType, Platform, Pressable } from 'react-native';
import { Image } from 'expo-image';

const emojis: ImageSourcePropType[] = [
  require('@/assets/images/emoji1.png'),
  require('@/assets/images/emoji2.png'),
  require('@/assets/images/emoji3.png'),
];

export function EmojiList({ onSelect, onCloseModal }: {
  onSelect: (source: ImageSourcePropType) => void;
  onCloseModal: () => void;
}) {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={Platform.OS === 'web'}
      data={emojis}
      renderItem={({ item }) => (
        <Pressable onPress={() => { onSelect(item); onCloseModal(); }}>
          <Image source={item} style={{ width: 100, height: 100, marginRight: 20 }} />
        </Pressable>
      )}
    />
  );
}
```

`Platform.OS` 判断当前运行平台；教程希望 Web 显示水平滚动条，而 native UI 通常由手势暗示可横向滚动。

## 把选中的贴纸画在图片上

父组件保存 `pickedEmoji` 图片资源，Modal 列表通过 `setPickedEmoji` 更新它。若 state 有值，就显示 EmojiSticker：

```tsx
<EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
  <EmojiList onSelect={setPickedEmoji} onCloseModal={onModalClose} />
</EmojiPicker>

{pickedEmoji && <EmojiSticker imageSize={40} stickerSource={pickedEmoji} />}
```

```tsx
export function EmojiSticker({ imageSize, stickerSource }: {
  imageSize: number;
  stickerSource: ImageSourcePropType;
}) {
  return (
    <View style={{ top: -350 }}>
      <Image source={stickerSource} style={{ width: imageSize, height: imageSize }} />
    </View>
  );
}
```

教程把这个组件叠在主图视口上方；下一章会通过手势缩放和移动它。

## 关键名词

- **Modal**：暂时浮在当前 screen 上方的原生界面层。
- **`children` prop**：组件中间插槽；EmojiPicker 不负责列表实现，只承载子组件。
- **FlatList**：React Native 按需渲染数据项的列表组件，支持纵向或横向滚动。
- **Callback prop**：父组件把处理函数当 prop 传给子组件，实现状态由父组件管理。
- **Conditional rendering**：根据 `showAppOptions` / `pickedEmoji` state 决定渲染哪些控件。

## 官方代码主题覆盖

源页主题均用等价示例覆盖：切换 action buttons 的布尔 state、CircleButton / IconButton 与 MaterialIcons props、Modal `visible` / `transparent` / slide 动画、关闭回调、FlatList emoji 数据 / 横向列表 / Platform 适配、`ImageSourcePropType` 选择资源状态、EmojiSticker 图片资源渲染及主图叠放。原文 `onSaveImageAsync` 在本章只预留空实现，本页保留该行为说明。

## 下一页

页脚 **Next** 指向 [Add gestures](https://docs.expo.dev/tutorial/gestures/)，给贴纸增加双击缩放与拖动交互。

**翻页：**[上一页：使用图片选择器](./006-使用图片选择器.md) · [返回目录](./README.md) · [下一页：添加贴纸手势](./008-添加贴纸手势.md)
