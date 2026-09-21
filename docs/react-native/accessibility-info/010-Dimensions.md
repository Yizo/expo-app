# 010 Dimensions

**翻页：** [上一页：009 DevSettings](009-DevSettings.md) · [目录](README.md) · [下一页：011 Easing](011-Easing.md)

**官方页面：** [Dimensions · React Native](https://reactnative.dev/docs/dimensions)  
**源页代码覆盖：** get('window'/'screen')、尺寸变化 change event、DimensionsValue/ScaledSize 结构、旋转/折叠设备更新与 Android 系统栏范围说明。

## 读取屏幕和应用窗口尺寸

**Dimensions.get('window')** 返回应用可见窗口尺寸；**Dimensions.get('screen')** 返回设备屏幕尺寸。二者不是同一概念：Android 非透明状态栏和底部导航栏会从 window 尺寸中扣除。返回的 ScaledSize 包含 width、height、scale（像素密度）和 fontScale（系统字体缩放）。

组件随旋转、分屏或折叠设备变化时，应优先使用 **useWindowDimensions()** hook；它会在窗口变化时触发 React render。Dimensions.get 是命令式快照，若业务仍用它做布局，不要只在模块加载时缓存一次。

    function ResponsivePanel() {
      const { width, height, fontScale } = useWindowDimensions();
      const compact = width < 600;

      return (
        <View style={{ padding: compact ? 16 : 28 }}>
          <Text style={{ fontSize: 18 * fontScale }}>
            窗口 {Math.round(width)} × {Math.round(height)}
          </Text>
        </View>
      );
    }

## 监听动态尺寸变化

对于更底层的管理或非 React 代码，可用 **addEventListener('change', handler)** 监听。回调参数包含 window 与 screen 两个 ScaledSize。卸载订阅后记得 remove。

    useEffect(() => {
      const subscription = Dimensions.addEventListener('change', ({ window, screen }) => {
        setWindowWidth(window.width);
        logScreenSize(screen.width, screen.height);
      });
      return () => subscription.remove();
    }, []);

**DimensionsValue** 有 window 与 screen 两项。每个 **ScaledSize** 有 width、height、scale、fontScale。初始尺寸会在应用 runApplication 之前设置，但可在之后变化。Android 的 window 还会受到系统栏是否透明影响。

## 代码覆盖清单

已重写源页读取 window 宽高的代码主题，并示范推荐 hook 与 change listener。get 的两个维度、事件签名、DimensionsValue/ScaledSize 全字段、屏幕旋转/折叠设备变化及 Android 系统栏说明均覆盖。

**翻页：** [上一页：009 DevSettings](009-DevSettings.md) · [目录](README.md) · [下一页：011 Easing](011-Easing.md)
