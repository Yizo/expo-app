# 032 TextStyleProps

**翻页：** [上一页：031 ShadowProps](031-ShadowProps.md) · [目录](README.md) · [下一页：033 ViewStyleProps](033-ViewStyleProps.md)

**官方页面：** [Text Style Props · React Native](https://reactnative.dev/docs/text-style-props)  
**源页代码覆盖：** font/color/spacing/line alignment、Android font padding 与 vertical alignment、文字修饰和阴影、大小写变换、iOS writing direction、原生文本选择。

## RN 文字样式

Text 样式与 CSS 类似，但值类型使用 JavaScript 数字与 RN 支持的样式属性；不能直接使用 CSS 单位字符串。通常把复用的字体颜色/字号封装到 Typography 组件，文本可访问性需要用户调节系统字号时不应擅自关闭 font scaling。

    <Text style={{
      color: '#273442',
      fontFamily: 'System',
      fontSize: 17,
      fontWeight: '600',
      lineHeight: 24,
      letterSpacing: 0.2,
      textAlign: 'center',
      textDecorationLine: 'underline',
      textDecorationColor: '#26785f',
    }}>
      账户设置
    </Text>

## 属性速查

| 属性 | 说明与平台 |
|---|---|
| **color** | 字体颜色。 |
| **fontFamily** | 单个字体族名；iOS 支持 system-ui、ui-sans-serif、ui-serif、ui-monospace、ui-rounded 等通用族。 |
| **fontSize** | 字号数字，使用 RN 逻辑尺寸。 |
| **fontStyle** | normal 或 italic。 |
| **fontWeight** | normal、bold 或 100–900；若字体没有对应字重，系统选相近版本。 |
| **fontVariant** | 小型大写、旧式/衬线数字、等宽/比例数字等变体数组或空格分隔字符串。 |
| **includeFontPadding** | Android：默认 true，保留上下标点空间；关闭时配合 textAlignVertical=center 可更精确垂直对齐。 |
| **letterSpacing** | 字符之间增加或减小间距。 |
| **lineHeight** | 连续文字行基线之间的垂直间隔。 |
| **textAlign** | auto、left、right、center、justify；Android justify 需 API 26+，旧版回退 left。 |
| **textAlignVertical** | Android：auto、top、bottom、center；与 verticalAlign 同时设置时后者优先。 |
| **textDecorationColor** | iOS：下划线/删除线颜色。 |
| **textDecorationLine** | none、underline、line-through 或两者组合。 |
| **textDecorationStyle** | iOS：solid、double、dotted、dashed。 |
| **textShadowColor / textShadowOffset / textShadowRadius** | 字色阴影色、偏移 {width,height} 和模糊半径。 |
| **textTransform** | none、uppercase、lowercase、capitalize。 |
| **verticalAlign** | Android：auto、top、bottom、middle；同时优先于 textAlignVertical。 |
| **writingDirection** | iOS：auto、ltr、rtl。 |
| **userSelect** | 是否可复制：auto、text、none、contain、all；优先级高于 Text 的 selectable。 |

文字方向可用于阿拉伯文/希伯来文布局，最好优先由系统 locale 与父容器 direction 决定，仅在明确需要时单独覆盖。不同平台字体指标不同，同样字号的 lineHeight 和 baseline 可能不完全一致，应在设备上核对。

## 代码覆盖清单

源页是样式属性参考并带有交互示例区；本文重写组合字体、对齐、行距与下划线的样式示例。参考表覆盖全部 19 项属性以及 Android/iOS 限定、默认和优先级说明。

**翻页：** [上一页：031 ShadowProps](031-ShadowProps.md) · [目录](README.md) · [下一页：033 ViewStyleProps](033-ViewStyleProps.md)
