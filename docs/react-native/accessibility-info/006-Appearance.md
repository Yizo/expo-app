# 006 Appearance

**翻页：** [上一页：005 Animated.ValueXY](005-Animated-ValueXY.md) · [目录](README.md) · [下一页：007 AppRegistry](007-AppRegistry.md)

**官方页面：** [Appearance · React Native](https://reactnative.dev/docs/appearance)  
**源页代码覆盖：** getColorScheme 检查系统亮暗偏好、app 级 setColorScheme 覆盖、addChangeListener 订阅、Android/iOS 版本与截图闪烁说明。

## 读取系统外观偏好

**Appearance** 提供用户系统外观偏好信息，当前主要是 **light/dark** 色彩方案，概念类似 Web 的 prefers-color-scheme。Android 10/API 29+ 与 iOS 13+ 会反映系统浅色/深色设置。系统定时切换主题时，该值运行中也可能变化。

在函数组件中优先使用 **useColorScheme** hook，它会随系统变化更新 React render。**Appearance.getColorScheme()** 是命令式读取，返回 light、dark 或 null（原生 Appearance 模块不可用时）。依赖主题渲染的代码应在 render 时读取，别把启动时值缓存成永不更新的常量。

    function Screen() {
      const scheme = useColorScheme();
      const colors = scheme === 'dark'
        ? { background: '#15191f', text: '#f2f4f7' }
        : { background: '#ffffff', text: '#20252b' };

      return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <Text style={{ color: colors.text }}>随系统主题更新</Text>
        </View>
      );
    }

## 覆盖本应用的外观

**setColorScheme('light' | 'dark' | 'auto' | 'unspecified')** 只覆盖当前应用及其原生控件（例如 Alert、Picker），不会改写用户系统设置，也不影响其它应用。auto 清除覆盖并重新跟随系统；unspecified 也是跟随系统，但已弃用。通常由用户在应用内明确选择主题时才设置 override。

    Appearance.setColorScheme(preference); // 'light' | 'dark' | 'auto'

## 监听变化与平台注意事项

**addChangeListener(listener)** 在系统或应用外观偏好变化时触发，回调对象带 colorScheme；在 iOS/Android 上该值为 light/dark。返回的订阅应在组件卸载时 remove。

    useEffect(() => {
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        setScheme(colorScheme);
      });
      return () => subscription.remove();
    }, []);

iOS 截图时系统可能分别以浅色/深色各生成快照，Appearance 的异步更新造成屏幕截图短暂闪烁。普通界面状态建议直接使用 useColorScheme；需要覆盖系统设置时再调用静态 API。

## 代码覆盖清单

已重写源页读取主题示例和 app 级 override，另示范 change listener 清理。getColorScheme、setColorScheme 所有值、addChangeListener、平台最低版本与截图说明均已覆盖。

**翻页：** [上一页：005 Animated.ValueXY](005-Animated-ValueXY.md) · [目录](README.md) · [下一页：007 AppRegistry](007-AppRegistry.md)
