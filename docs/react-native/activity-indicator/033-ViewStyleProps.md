# 033 ViewStyleProps

**翻页：** [上一页：032 TextStyleProps](032-TextStyleProps.md) · [目录](README.md) · [下一页：034 BoxShadowValue](034-BoxShadowValue.md)

**官方页面：** [View Style Props · React Native](https://reactnative.dev/docs/view-style-props)  
**源页代码覆盖：** 背景渐变与实验性定位/尺寸/重复、边框色/宽/圆角、boxShadow、iOS pointer cursor、Android elevation、New Architecture filter/blend/outline、透明度与 pointerEvents。

## View 样式能力

本页涵盖 View 的绘制和边框样式。尺寸/间距/position 在前一页 Layout Props 已讲过。很多平台属性只有特定 RN 架构、系统版本才生效；要使用新 API 前，确认实际项目已启用对应的新架构。

### 背景色与渐变

**backgroundColor** 设置底色。**backgroundImage** 支持线性与径向渐变，可使用 CSS 风格字符串，也可以传结构化对象；colorStops 由颜色和位置组成，颜色可用 PlatformColor 选择系统平台色。

    import { Platform, PlatformColor, View } from 'react-native';

    <View
      style={{
        backgroundImage: 'linear-gradient(45deg, #3267a8, #59b5a5)',
        borderRadius: 14,
        padding: 18,
      }}
    >
      <Text style={{ color: 'white' }}>渐变卡片</Text>
    </View>

    <View
      style={{
        backgroundImage: 'radial-gradient(ellipse farthest-corner at 30% 40%, #d84949, #3267a8)',
      }}
    />

    <View
      style={{
        backgroundImage: [{
          type: 'linear-gradient',
          direction: 'to bottom',
          colorStops: [
            {
              color: Platform.select({
                ios: PlatformColor('systemTealColor'),
                android: PlatformColor('@android:color/holo_purple'),
                default: '#193d63',
              }),
              positions: ['0%'],
            },
            { color: '#58a590', positions: ['100%'] },
          ],
        }],
      }}
    />

页面另有 **experimental_backgroundPosition**、**experimental_backgroundRepeat**、**experimental_backgroundSize**，用于放置/平铺/设定背景渐变尺寸。它们明确标记为实验 API，可能变更，不建议生产使用。

### 边框、圆角与平台属性

边框颜色支持全局 borderColor、四边颜色和逻辑方向 block/start/end 色。宽度支持 borderWidth 和各边宽度；**borderStyle** 可选 solid/dotted/dashed。圆角支持 borderRadius、左上/右上/左下/右下，以及按逻辑 inline/block 的 Start/End 组合属性。圆角边缘无法显示时，可尝试 overflow hidden。iOS 13+ 的 **borderCurve** 可选 circular/continuous。

**boxShadow** 在新架构可用，语义类似 CSS border-box 阴影，可组合多个阴影；outset 阴影 Android 9+ 支持，inset 阴影 Android 10+。其配置对象在下一页说明。**elevation** 是 Android 原生高度层级，Android 5+ 生效，同时影响重叠 View 的前后次序。**cursor** 在 iOS 17+ 可用于鼠标/触控板/手写笔等指针 hover 状态。

### filter、混合和 outline

新架构下 **filter** 可应用于 View 及后代，并隐含 overflow hidden，后代会被裁到 View bounds。iOS 当前只支持 brightness 和 opacity；Android 还支持 blur、contrast、dropShadow、grayscale、hueRotate、invert、sepia、saturate。其中 blur/dropShadow 仅 Android 12+。

    <View style={{
      filter: [
        { brightness: 0.92 },
        { contrast: '110%' },
        { dropShadow: '2px 4px 8px #0006' },
      ],
    }}>
      <Artwork />
    </View>

**mixBlendMode** 仅新架构及 Android 10+，控制当前 View 与层叠上下文中其他颜色的混合方式。值有 normal、multiply、screen、overlay、darken、lighten、color-dodge、color-burn、hard-light、soft-light、difference、exclusion、hue、saturation、color、luminosity、plus-lighter。**isolation**（Layout Props）可帮助限定哪些元素互相混合。

新架构还支持 **outlineColor/outlineOffset/outlineStyle/outlineWidth**。outline 不改变布局，绘制在边框之外；style 可 solid/dotted/dashed。它与 border 不同，不占内容盒空间。

**opacity** 控制 View 及其后代透明度。**pointerEvents** 控制 View 自身和 children 是否响应触摸：auto 都可命中、none 都不命中、box-none 仅 children 命中、box-only 仅 View 本身命中。

## 属性覆盖清单

| 类别 | 属性 |
|---|---|
| 背景 | backgroundColor、backgroundImage。 |
| 背景渐变实验属性 | experimental_backgroundPosition、experimental_backgroundRepeat、experimental_backgroundSize。 |
| 边框颜色 | borderBottomColor、borderBlockColor、borderBlockEndColor、borderBlockStartColor、borderColor、borderEndColor、borderLeftColor、borderRightColor、borderStartColor、borderTopColor。 |
| 边框宽度 | borderBottomWidth、borderLeftWidth、borderRightWidth、borderTopWidth、borderWidth。 |
| 圆角 | borderBottomEndRadius、borderBottomLeftRadius、borderBottomRightRadius、borderBottomStartRadius、borderStartEndRadius、borderStartStartRadius、borderEndEndRadius、borderEndStartRadius、borderRadius、borderTopEndRadius、borderTopLeftRadius、borderTopRightRadius、borderTopStartRadius。 |
| 边框外观 | borderCurve（iOS）、borderStyle。 |
| 阴影 | boxShadow、新架构 filter.dropShadow、shadowColor/Offset/Opacity/Radius、elevation（Android）。 |
| 视觉滤镜 | filter；新架构；各平台支持函数不同且会裁剪 children。 |
| 混合 | mixBlendMode；新架构与 Android 10+。 |
| 轮廓 | outlineColor、outlineOffset、outlineStyle、outlineWidth；新架构。 |
| 其他 | backfaceVisibility、cursor（iOS 17+）、opacity、pointerEvents。 |

## 代码覆盖清单

已改写官方 backgroundImage 的线性/径向字符串渐变、含 PlatformColor 的 colorStops 对象示例，并示范 View filter；参考表逐项列出背景、边框、圆角、阴影、滤镜、blend、outline、cursor、透明度、pointerEvents。实验属性、平台/版本限制都在对应章节注明。

**翻页：** [上一页：032 TextStyleProps](032-TextStyleProps.md) · [目录](README.md) · [下一页：034 BoxShadowValue](034-BoxShadowValue.md)
