# 075 DynamicColorIOS

**翻页：** [上一页：074 ActionSheetIOS](074-ActionSheetIOS.md) · [目录](README.md) · [下一页：076 Settings](076-Settings.md)

**官方页面：** [DynamicColorIOS · React Native](https://reactnative.dev/docs/dynamiccolorios)  
**源页代码覆盖：** iOS 动态颜色 light/dark 必填项、高对比度可选回退、系统运行时自动选择、普通与高对比文本颜色示例。

## iOS 系统主题响应色

**DynamicColorIOS({ light, dark, highContrastLight?, highContrastDark? })** 创建 iOS 动态颜色。系统会根据当前 Light/Dark 外观与辅助功能高对比偏好，在运行时挑选合适的颜色；颜色可用于品牌色等需配合系统主题变化的 app 专属 token。

    const textColor = DynamicColorIOS({
      light: '#182c4b',
      dark: '#9fd7ff',
    });

    const accessibleTextColor = DynamicColorIOS({
      light: '#595959',
      dark: '#cfcfcf',
      highContrastLight: '#111111',
      highContrastDark: '#ffffff',
    });

    <Text style={{ color: textColor }}>自动适配外观</Text>

light 和 dark 是必填。两个高对比颜色可选；未提供时分别回退到 light/dark。此 API 是 iOS 专用，可类比“就地定义媒体查询色”，与 React Native Appearance 是互补关系：Appearance 读当前模式，DynamicColorIOS 让 native color 自行响应设置变化。

## 代码覆盖清单

已重写官方普通动态文字色和高对比色示例，覆盖四个参数、必填/可选及默认回退行为、iOS runtime theme response。

**翻页：** [上一页：074 ActionSheetIOS](074-ActionSheetIOS.md) · [目录](README.md) · [下一页：076 Settings](076-Settings.md)
