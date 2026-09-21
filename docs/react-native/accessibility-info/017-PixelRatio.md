# 017 PixelRatio

**翻页：** [上一页：016 PanResponder](016-PanResponder.md) · [目录](README.md) · [下一页：018 Platform](018-Platform.md)

**官方页面：** [PixelRatio · React Native](https://reactnative.dev/docs/pixelratio)  
**源页代码覆盖：** 设备密度查询、font scale、dp 到物理 px 图片源尺寸换算、像素网格自动取整与 roundToNearestPixel。

## 逻辑布局尺寸与物理像素

RN 样式里 width/height 使用逻辑布局单位（dp/points），设备屏幕却由物理像素构成。**PixelRatio.get()** 返回像素密度倍数：例如 2 表示 1 个逻辑布局单位对应约 2 个物理像素。高密度设备需要选择分辨率更高的图片源，但 Image 的 style 尺寸仍按逻辑布局值设置。

    const logicalWidth = 200;
    const logicalHeight = 100;
    const asset = getImage({
      width: PixelRatio.getPixelSizeForLayoutSize(logicalWidth),
      height: PixelRatio.getPixelSizeForLayoutSize(logicalHeight),
    });

    <Image source={asset} style={{ width: logicalWidth, height: logicalHeight }} />

**getPixelSizeForLayoutSize(dp)** 返回对应整数 px。这样资源清晰度适配设备密度，布局占用尺寸保持相同。

## 字体缩放和像素网格

**getFontScale()** 返回系统字体大小偏好所用比例。Android 读取 Display > Font size；iOS 读取 Text Size，也可能由 Accessibility > Larger Text 设置。未单独设置 fontScale 时，结果等于设备像素密度。除非有非常明确的设计原因，文字布局应尊重该无障碍偏好。

RN 在 JS 和 Yoga 布局计算中保留高精度值，直到主线程设置原生视图的位置/尺寸时才取整；取整相对根节点进行，避免父子层层 round 造成误差。业务代码尽量不要把取整值与未取整值混合计算，否则一像素边框可能消失或变成双倍宽。

**roundToNearestPixel(layoutSize)** 把逻辑尺寸取到最接近整物理像素对应的布局尺寸，例如 PixelRatio=3 时 8.4 取为 8.33（正好对应 25px）。

## 方法速查

| 方法 | 作用 |
|---|---|
| **get()** | 返回设备像素密度倍数。 |
| **getFontScale()** | 返回系统字体缩放比例。 |
| **getPixelSizeForLayoutSize(layoutSize)** | 将 dp/points 尺寸转换为整数物理 px。 |
| **roundToNearestPixel(layoutSize)** | 取整到对应整物理像素的最近逻辑尺寸。 |

## 代码覆盖清单

已重写官方按布局尺寸选高分辨率图源示例，并说明逻辑布局值/物理像素差异、像素网格取整策略与四个参考方法。

**翻页：** [上一页：016 PanResponder](016-PanResponder.md) · [目录](README.md) · [下一页：018 Platform](018-Platform.md)
