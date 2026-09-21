# 070 useWindowDimensions

**翻页：** [上一页：069 useColorScheme](069-useColorScheme.md) · [目录](README.md) · [下一页：071 BackHandler](071-BackHandler.md)

**官方页面：** [useWindowDimensions · React Native](https://reactnative.dev/docs/usewindowdimensions)  
**源页代码覆盖：** hook 初始化导入与 width/height 读取、屏幕/字体缩放变化自动更新、fontScale/scale 属性。

## 响应式布局 hook

**useWindowDimensions()** 返回当前应用所占窗口尺寸与设备缩放数据。与 Dimensions.get 快照不同，它会在窗口大小或 fontScale 改变时自动更新 React 组件，适合响应旋转、分屏、折叠设备或系统字体大小变化。

    function AdaptiveLayout() {
      const { width, height, scale, fontScale } = useWindowDimensions();
      const columns = width >= 720 ? 2 : 1;

      return (
        <View style={{ flex: 1, padding: 16 }}>
          <Text>窗口 {Math.round(width)} × {Math.round(height)}</Text>
          <Text style={{ fontSize: 16 * fontScale }}>
            字体缩放比例 {fontScale}，屏幕像素比例 {scale}
          </Text>
          <ContentGrid columns={columns} />
        </View>
      );
    }

## 返回字段

| 字段 | 说明 |
|---|---|
| **width / height** | 当前 app 窗口或屏幕所占尺寸（RN 布局空间）。 |
| **scale** | 设备像素比例；1 表示一个 point 对应一个 pixel，2/3 常见于高 DPI 屏。 |
| **fontScale** | 当前系统字体放大比例，反映阅读偏好。 |

## 代码覆盖清单

已改写官方读取 width/height 的最小用法，新增响应布局示例；source 所有四项返回字段、屏幕与字体变化触发更新均已覆盖。

**翻页：** [上一页：069 useColorScheme](069-useColorScheme.md) · [目录](README.md) · [下一页：071 BackHandler](071-BackHandler.md)
