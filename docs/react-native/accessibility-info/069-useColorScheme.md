# 069 useColorScheme

**翻页：** [上一页：068 XMLHttpRequest](068-XMLHttpRequest.md) · [目录](README.md) · [下一页：070 useWindowDimensions](070-useWindowDimensions.md)

**官方页面：** [useColorScheme · React Native](https://reactnative.dev/docs/usecolorscheme)  
**源页代码覆盖：** Appearance 系统订阅 hook、light/dark/null 返回值、设备或应用主题变化触发更新、主题 Context 使用场景。

## 订阅当前主题

**useColorScheme()** 是 React hook，会读取并订阅 Appearance 模块的系统颜色方案变化。返回值为 **light**、**dark** 或 **null**（原生 Appearance API 不可用）。偏好会在用户改系统主题、应用调用 setColorScheme，或计划中的昼夜模式切换时变化，因此无需自行注册 listener。

    function AppSurface() {
      const scheme = useColorScheme();
      const dark = scheme === 'dark';

      return (
        <View style={{
          flex: 1,
          backgroundColor: dark ? '#14181e' : '#ffffff',
          padding: 20,
        }}>
          <Text style={{ color: dark ? '#f2f4f7' : '#20252b' }}>
            当前模式：{scheme ?? '系统主题未提供'}
          </Text>
        </View>
      );
    }

大型应用可以在根组件读取 hook，再把一组设计 token 放入 React Context，避免每个 UI 组件各自分支读取颜色。若屏幕只需一次简单样式选择，直接在组件中调用 hook 更简单。

## 返回值

- **light**：浅色方案生效。
- **dark**：深色方案生效。
- **null**：原生 Appearance 模块没有返回方案。

## 代码覆盖清单

源页没有内嵌完整主题实现，而链接到 RNTester 示例；本文重写 hook 读取与主题切换界面，并覆盖订阅变化及所有返回值。

**翻页：** [上一页：068 XMLHttpRequest](068-XMLHttpRequest.md) · [目录](README.md) · [下一页：070 useWindowDimensions](070-useWindowDimensions.md)
