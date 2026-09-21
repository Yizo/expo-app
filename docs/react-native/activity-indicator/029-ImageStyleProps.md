# 029 ImageStyleProps

**翻页：** [上一页：028 DocumentNodes](028-DocumentNodes.md) · [目录](README.md) · [下一页：030 LayoutProps](030-LayoutProps.md)

**官方页面：** [Image Style Props · React Native](https://reactnative.dev/docs/image-style-props)  
**源页代码覆盖：** 图片 resize mode、边框/圆角、tint 着色；源页例子分成四类，另外覆盖透明度、overflow、backfaceVisibility、Android overlayColor 和 objectFit。

## 图片如何适配容器

图片本身和容器尺寸经常不同。**resizeMode** 控制如何裁切/缩放，默认 **cover**：

| 值 | 行为 |
|---|---|
| **cover** | 保持宽高比铺满容器，必要时裁掉超出部分。 |
| **contain** | 保持宽高比完整显示，可能留下空白区域。 |
| **stretch** | 宽高分别拉伸填满，图片可能变形。 |
| **repeat** | 按原始尺寸重复平铺；图片过大时会先等比缩小到容器内。 |
| **center** | 居中显示；图片比容器大时缩小到容器内。 |

**objectFit** 也决定图像填充方式，可取 cover、contain、fill、scale-down。**resizeMode** 是 RN 图片常见属性，objectFit 对齐 CSS 语义；选择后应在两端确认具体裁切结果。

    <Image
      source={require('./assets/photo.png')}
      resizeMode="contain"
      style={{ width: 240, height: 160, backgroundColor: '#edf1f5' }}
    />

## 边框、圆角和 Android overlay

**borderWidth**/**borderColor** 设整体边框，**borderRadius** 或四角分别设置半径。**backgroundColor** 可填充容器底色。圆角图片若透出方角，可在 Image 上设置 **overflow: 'hidden'**。

Android **overlayColor** 是 Fresco 渲染圆角的辅助选项：当某些 resizeMode（如 contain）或 GIF 不支持原生圆角时，使用指定纯色补齐角落；它通常要与图片所在背景色一致。

    <Image
      source={{ uri: 'https://images.example.test/cover.jpg' }}
      resizeMode="cover"
      style={{
        width: 180,
        height: 120,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#cbd3dc',
        overflow: 'hidden',
      }}
      overlayColor="#fff"
    />

## tint、透明度和背面可见性

**tintColor** 会把所有非透明像素染成一个颜色，适合单色图标。**opacity** 从 0 到 1 控制整张图片透明度，默认 1。**backfaceVisibility** 控制图片旋转后的背面是否可见，默认 visible；做 3D 翻转时可设 hidden。

    <Image
      source={require('./assets/bookmark.png')}
      resizeMode="contain"
      tintColor={selected ? '#26785f' : '#7b8794'}
      style={{ width: 24, height: 24, opacity: selected ? 1 : 0.75 }}
    />

## 属性覆盖清单

| prop | 说明 |
|---|---|
| **backfaceVisibility** | 旋转后背面可见性：visible/hidden，默认 visible。 |
| **backgroundColor** | 图片节点背景色。 |
| **borderBottomLeftRadius / borderBottomRightRadius / borderTopLeftRadius / borderTopRightRadius** | 单独设四角圆角。 |
| **borderRadius** | 四角使用同一圆角。 |
| **borderColor / borderWidth** | 图片边框色和宽度。 |
| **opacity** | 透明度 0–1，默认 1。 |
| **overflow** | visible/hidden；裁剪 rounded image 时可用 hidden。 |
| **overlayColor** | Android：圆角区域纯色补齐，适用部分 resize mode/GIF 情况。 |
| **resizeMode** | cover/contain/stretch/repeat/center，默认 cover。 |
| **objectFit** | cover/contain/fill/scale-down，默认 cover。 |
| **tintColor** | 将所有非透明像素染色。 |

## 代码覆盖清单

已按官方四类示例重写图片适配、边框、圆角和 tint，覆盖两个填充 API 及所有表格属性。Android overlayColor 适用情况与属性平台限制均有说明。

**翻页：** [上一页：028 DocumentNodes](028-DocumentNodes.md) · [目录](README.md) · [下一页：030 LayoutProps](030-LayoutProps.md)
