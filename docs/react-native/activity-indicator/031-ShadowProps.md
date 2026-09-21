# 031 ShadowProps

**翻页：** [上一页：030 LayoutProps](030-LayoutProps.md) · [目录](README.md) · [下一页：032 TextStyleProps](032-TextStyleProps.md)

**官方页面：** [Shadow Props · React Native](https://reactnative.dev/docs/shadow-props)  
**源页代码覆盖：** 三套阴影 API 比较：boxShadow、Android filter.dropShadow、平台原生 shadowColor/Offset/Opacity/Radius 与 Android elevation 替代。

## 三种阴影模型

RN 有三套阴影属性：

1. **boxShadow** 是 View style 的独立属性，按 CSS box-shadow 方式在元素 border box 周围投影，iOS/Android 可用。
2. **dropShadow** 是 View 的 filter 函数，仅 Android 可用。它基于内容的 alpha mask，只有实际有不透明像素的区域投影；它不支持 inset，也没有 boxShadow 的 spreadDistance。
3. **shadowColor / shadowOffset / shadowOpacity / shadowRadius** 是映射到平台原生 API 的属性。shadowColor 两端可用；shadowOffset/Opacity/Radius 只支持 iOS。Android API 28 以上支持 shadowColor；较早版本可用 elevation 实现基础层次。

boxShadow/dropShadow 能力通常比传统 shadow props 更丰富。若只需要普通原生阴影，平台原生属性更直接；要跨端统一边框盒阴影，可考虑 boxShadow。

    <View
      style={{
        width: 220,
        padding: 18,
        borderRadius: 14,
        backgroundColor: 'white',
        shadowColor: '#101820',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 5,
      }}
    >
      <Text>带轻微层次感的卡片</Text>
    </View>

iOS 上通过颜色、偏移、不透明度、模糊半径组合传统阴影；Android 使用 elevation。实际阴影方向和扩散受平台默认渲染影响，需真机校验。当前页面将 boxShadow/dropShadow 的详细语法链接到 View Style Props。

## 属性清单

| prop | 平台/用途 |
|---|---|
| **boxShadow** | iOS 与 Android：CSS 语义的 border-box 阴影。 |
| **dropShadow** | Android：filter 中的 alpha-mask 投影，不支持 inset/spreadDistance。 |
| **shadowColor** | 两端属性；Android 仅 API 28+ 可自定义颜色。 |
| **shadowOffset** | iOS：对象 { width, height } 控制位移。 |
| **shadowOpacity** | iOS：透明度，乘以颜色 alpha。 |
| **shadowRadius** | iOS：模糊半径。 |
| **elevation** | Android 旧系统的基础投影方式。 |

## 代码覆盖清单

源页有 API 参考和版本/平台比较，没有复杂完整组件示例；本文用卡片样式示范 iOS 原生 shadow props 与 Android elevation，并逐项列出三套实现和适用平台。

**翻页：** [上一页：030 LayoutProps](030-LayoutProps.md) · [目录](README.md) · [下一页：032 TextStyleProps](032-TextStyleProps.md)
