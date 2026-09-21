# 025 Height and Width

**翻页：** [上一页：024 Style](024-Style.md) · [目录](README.md) · [下一页：026 Layout with Flexbox](026-LayoutWithFlexbox.md)

**官方页面：** [Height and Width · React Native](https://reactnative.dev/docs/height-and-width)  
**源页代码覆盖：** 固定 `width`/`height`、按父容器剩余空间分配的 `flex`、百分比宽高及其父级必须有明确尺寸的条件。

## RN 尺寸值不是 CSS `px`

React Native 的 `width` 与 `height` 常以无单位数字表示；数字是密度无关的布局单位（density-independent pixels / points），不是设备屏幕上的物理像素数量。固定数值适合图标或明确尺寸；不同屏幕密度下视觉尺寸通常接近，但没有固定点数到物理单位的通用换算。

```tsx
<View style={{ width: 88, height: 56 }} />
```

## 用 `flex` 填充父容器

`flex: 1` 让元素按比例分到父容器可用空间。父容器本身必须先有非零尺寸，来源可以是固定宽高或 flex；如果祖先尺寸没有建立起来，内部 flex 子元素就没有空间可以填充。

```tsx
<View style={{ flex: 1 }}>
  <View style={{ flex: 1 }} />
  <View style={{ flex: 2 }} />
</View>
```

这里两个子项按 1:2 分配父容器空间。Flexbox 的默认主轴在 RN 中是竖向，详情见下一页。

## 百分比宽高

如果希望尺寸按父元素占比变化，可把百分比字符串设到 style。与 flex 类似，父元素必须有明确尺寸，否则百分比没有基准可计算。

```tsx
<View style={{ width: 240, height: 180 }}>
  <View style={{ width: '50%', height: '50%' }} />
</View>
```

这块子视图约为父元素宽高的一半。若想根据屏幕余量自动伸缩，通常先用 flex；若需求明确是父元素的占比，再使用百分比。

**翻页：** [上一页：024 Style](024-Style.md) · [目录](README.md) · [下一页：026 Layout with Flexbox](026-LayoutWithFlexbox.md)
