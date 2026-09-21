# 026 Layout with Flexbox

**翻页：** [上一页：025 Height and Width](025-HeightAndWidth.md) · [目录](README.md) · [下一页：027 Images](027-Images.md)

**官方页面：** [Layout with Flexbox · React Native](https://reactnative.dev/docs/flexbox)  
**源页代码覆盖：** flex 比例、主轴/交叉轴、四种 `flexDirection`、LTR/RTL、`justifyContent`/`alignItems`/`alignSelf`/`alignContent`、换行、basis/grow/shrink、gap、宽高、relative/absolute/static 与 containing block。

## RN 使用 Flexbox 排版

父组件可用 Flexbox 控制子组件在不同屏幕中的位置与尺寸。多数常见排版由 `flexDirection`（主轴）、`justifyContent`（主轴对齐）、`alignItems`（交叉轴对齐）组合完成。RN 与 Web Flexbox 概念相似，但默认值不同：默认 `flexDirection: 'column'`，`alignContent: 'flex-start'`，`flexShrink: 0`；RN 的简写 `flex` 只接受一个数字。

### `flex`、主轴和方向

子元素 `flex` 值按比例瓜分父容器沿主轴剩余的空间。`flexDirection` 可取 `column`（默认，从上到下）、`row`（从左到右）、`column-reverse`、`row-reverse`。主轴的垂直方向叫交叉轴。

```tsx
<View style={{ flex: 1, flexDirection: 'row' }}>
  <View style={{ flex: 1, backgroundColor: 'tomato' }} />
  <View style={{ flex: 2, backgroundColor: 'orange' }} />
  <View style={{ flex: 3, backgroundColor: 'seagreen' }} />
</View>
```

三块在水平方向按 1:2:3 分配；换成 `column` 时相同比例沿竖直方向分配。元素具体能拿到多少仍受其父容器尺寸影响。

### 布局方向 LTR 和 RTL

`direction` 控制文字和子元素的阅读/布局方向；默认 LTR（从左到右），此时 `start` 指左边、`end` 指右边。RTL（从右到左）时 start/end 语义随之翻转，适合阿拉伯语等语言。优先使用 start/end 这类语义边缘属性，避免把左右硬编码到所有布局。

```tsx
<View style={{ direction: 'rtl', paddingStart: 12 }}>
  <Text>由右至左的内容</Text>
</View>
```

### 主轴与交叉轴对齐

`justifyContent` 对齐主轴上的子项，值包括 `flex-start`（默认）、`flex-end`、`center`、`space-between`、`space-around`、`space-evenly`。竖向 column 中，`center` 沿竖直方向居中；横向 row 中则沿水平方向居中。

`alignItems` 控制交叉轴对齐，可为 `stretch`（默认）、`flex-start`、`flex-end`、`center`、`baseline`。stretch 要生效，子元素在交叉轴方向不能已经固定宽/高。`alignSelf` 使用同一组值，但只覆写某个子元素的交叉轴对齐方式。

```tsx
<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
  <Text>左侧</Text>
  <Text style={{ alignSelf: 'flex-end' }}>单项靠下</Text>
</View>
```

若启用 `flexWrap` 把子项排成多行，`alignContent` 决定这些行作为整体怎样沿交叉轴分布。取值包括 `flex-start`、`flex-end`、`stretch`、`center`、`space-between`、`space-around`、`space-evenly`；它只有多行时才生效。

### 换行、basis、grow 和 shrink

`flexWrap` 是容器属性，默认 `nowrap`，内容过宽时子项留在同一行并可能缩小；开启 `wrap` 后溢出的子项进入下一行，`wrap-reverse` 反转换行方向。`flexBasis` 是分配增减空间之前的主轴基础尺寸（row 类似宽度、column 类似高度）。`flexGrow` 按比例分配容器剩余空间；`flexShrink` 按比例收缩溢出的子项。RN `flexShrink` 默认 0，Web 常见默认 1。

```tsx
<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
  <View style={{ flexBasis: 100, flexGrow: 1, flexShrink: 1 }} />
  <View style={{ flexBasis: 140, flexGrow: 2, flexShrink: 1 }} />
</View>
```

### 行间距、列间距、尺寸

`rowGap` 设置行与行间距，`columnGap` 设置列与列间距，`gap` 是两者的简写；可与换行和 `alignContent` 组合排版。宽高支持自动值、数字（RN 布局单位）和相对父元素的百分比。

```tsx
<View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 12, columnGap: 16 }}>
  <View style={{ width: '48%', height: 80 }} />
  <View style={{ width: '48%', height: 80 }} />
</View>
```

`auto` 根据内容、子元素或图片决定尺寸。百分比依赖父元素大小；对绝对定位元素，百分比相对它的 containing block 计算。

### 相对定位、绝对定位和 containing block

`position: 'relative'` 是默认值：元素先进入普通布局流，再按 top/right/bottom/left 偏移；偏移本身不改变兄弟元素布局。`absolute` 把元素从普通流中拿出，并依据 containing block 加偏移。新架构中还可用 `static`；静态定位元素忽略偏移，并且通常不成为绝对子元素的 containing block。

绝对子元素的包含块通常是最近的非 static 祖先；具有 transform 的祖先也会形成包含块。若相对定位元素未设置偏移，它仍占据原布局位置。

```tsx
<View style={{ position: 'relative', width: 240, height: 160 }}>
  <Text>普通布局内容</Text>
  <View style={{ position: 'absolute', right: 8, bottom: 8, width: '50%', height: 40 }} />
</View>
```

RN 底层由 Yoga 计算跨平台布局。可在 Yoga Playground 交互试验属性；完整属性列表以当前版本的 RN Layout API 为准。

**翻页：** [上一页：025 Height and Width](025-HeightAndWidth.md) · [目录](README.md) · [下一页：027 Images](027-Images.md)
