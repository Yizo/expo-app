# 030 LayoutProps

**翻页：** [上一页：029 ImageStyleProps](029-ImageStyleProps.md) · [目录](README.md) · [下一页：031 ShadowProps](031-ShadowProps.md)

**官方页面：** [Layout Props · React Native](https://reactnative.dev/docs/layout-props)  
**源页代码覆盖：** align/flex/尺寸/位置/间距/RTL 逻辑属性、border widths、gap、boxSizing、overflow、zIndex；覆盖页面示例中的 wrap 布局行为。

## RN 布局与 Web CSS 的关系

React Native 用 **Yoga** 计算布局，很多属性与 CSS Flexbox 名称相近，但默认值和可用单位不同。RN 的默认 **flexDirection 是 column**，默认 position 是 relative；尺寸常用逻辑像素（points），或百分比，不支持 em/rem 等浏览器单位。margin/padding 可以用数字或百分比；gap/rowGap/columnGap 目前使用像素数值。

## Flexbox 轴与空间分布

| 属性 | 作用 |
|---|---|
| **flexDirection** | 主轴方向 row、row-reverse、column（默认）、column-reverse。 |
| **justifyContent** | 主轴分布：flex-start、flex-end、center、space-between、space-around、space-evenly。 |
| **alignItems** | 交叉轴对齐：flex-start、flex-end、center、stretch（默认）、baseline。 |
| **alignSelf** | 单个子项覆盖父容器 alignItems；可选 auto 与 flex-start/end/center/stretch/baseline。 |
| **alignContent** | 多行在交叉轴如何排布：flex-start/end、center、stretch、space-between/around/evenly。 |
| **flexWrap** | 是否换行：nowrap（默认）、wrap、wrap-reverse。wrap 与默认 alignItems: stretch 有兼容限制，需按实际布局调整交叉轴对齐。 |
| **flex** | RN 使用数字而非 CSS 字符串；正数按比例分配可用空间，0 按 width/height 计算，-1 在空间不足时可缩到 minWidth/minHeight。 |
| **flexGrow / flexShrink** | 按主轴剩余空间增长、按溢出空间收缩；都是非负数字。 |
| **flexBasis** | 在 grow/shrink 前指定主轴基础尺寸；row 下类似宽度，column 下类似高度。 |
| **aspectRatio** | 已知一个维度后按比例推导另一个维度，并参与 min/max 限制。 |
| **gap / rowGap / columnGap** | 子项行列之间的间距，只用数字像素单位。 |

    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' }}>
      {cards.map(card => (
        <View key={card.id} style={{ flexBasis: 150, flexGrow: 1, aspectRatio: 1.4 }}>
          <Card card={card} />
        </View>
      ))}
    </View>

Flex 1 与 Flex 2 的子项会按比例分配空间；浏览器 CSS 的 flex 常写字符串，RN 的 flex prop 要用数字。

## 尺寸、间距、边框

**width/height/minWidth/minHeight/maxWidth/maxHeight** 支持数字或百分比。**margin** 和 **padding** 可以整体设值，也可按 top/right/bottom/left 分别设置；**marginHorizontal/Vertical**、**paddingHorizontal/Vertical** 分别同时设两边。边框厚度支持 borderWidth 或上下左右方向；这些 layout props 页面不提供边框颜色，颜色在 View Style Props。

| 等价分组 | 属性 |
|---|---|
| 外边距 | margin、marginTop/Right/Bottom/Left、marginHorizontal/Vertical。 |
| 逻辑外边距 | marginStart/End、marginBlock/BlockStart/BlockEnd、marginInline/InlineStart/InlineEnd。 |
| 内边距 | padding、paddingTop/Right/Bottom/Left、paddingHorizontal/Vertical。 |
| 逻辑内边距 | paddingStart/End、paddingBlock/BlockStart/BlockEnd、paddingInline/InlineStart/InlineEnd。 |
| 尺寸限制 | width、height、minWidth/Height、maxWidth/Height、aspectRatio。 |
| 边框厚度 | borderWidth、borderTop/Right/Bottom/LeftWidth、borderStart/EndWidth。 |

**borderStart/EndWidth**、marginStart/End、paddingStart/End 依赖方向：LTR 时 start 是 left、end 是 right；RTL 时反过来。**marginBlock/paddingBlock** 表示纵向两边，**marginInline/paddingInline** 表示横向两边。逻辑方向属性适合支持阿拉伯语等从右向左布局的界面。

**boxSizing** 决定尺寸属性计算 content box 或 border box，默认 border-box。**overflow** 控制子视图如何显示：visible、hidden 裁剪、scroll 按自身范围测量内容。RN View 并非浏览器滚动容器；滚动场景用 ScrollView/List。

## 定位、方向和层叠

| 属性 | 作用 |
|---|---|
| **position** | relative（默认，仍占据正常流位置）、absolute（脱离正常流并相对 containing block 偏移）、static（在正常流且 inset 无效）。 |
| **top/right/bottom/left** | 沿物理边缘偏移，数字单位为逻辑像素，也支持百分比。 |
| **start/end** | 按当前方向映射到 left/right；优先级高于 left/right。 |
| **inset** | 同时设置四边偏移，等价于 top/bottom/left/right；仅新架构可用。 |
| **insetBlock / insetBlockStart / insetBlockEnd** | 新架构中的逻辑纵向偏移，等价于上下边。 |
| **insetInline / insetInlineStart / insetInlineEnd** | 新架构中的逻辑横向偏移，按 LTR/RTL 映射左右边。 |
| **direction** | inherit、ltr、rtl；根视图默认由系统 locale 决定，子项通常继承。 |
| **display** | flex（默认）、none、contents。 |
| **isolation** | 新架构：auto 不建立层叠上下文，isolate 建立独立 stacking context。 |
| **zIndex** | 控制视图前后层级；大值在前。iOS 上要按预期工作，相关 View 有时需为 sibling。 |

    <View style={{ flex: 1, position: 'relative' }}>
      <View style={{ position: 'absolute', top: 12, end: 12, zIndex: 2 }}>
        <Badge />
      </View>
      <ArticleContent />
    </View>

## 代码覆盖清单

已重写官方 flexWrap 方块排列主题，解释 RN flex 默认/数值、主轴/交叉轴、换行、尺寸单位、margin/padding、RTL 逻辑属性、定位、overflow、zIndex 和新架构专属 inset/isolation。参考属性清单全部列出，并按语义等价分组。

**翻页：** [上一页：029 ImageStyleProps](029-ImageStyleProps.md) · [目录](README.md) · [下一页：031 ShadowProps](031-ShadowProps.md)
