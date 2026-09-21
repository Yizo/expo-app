# 012 I18nManager

**翻页：** [上一页：011 Easing](011-Easing.md) · [目录](README.md) · [下一页：013 Keyboard](013-Keyboard.md)

**官方页面：** [I18nManager · React Native](https://reactnative.dev/docs/i18nmanager)  
**源页代码覆盖：** 根据 isRTL 调整对齐/动画、allowRTL、forceRTL 开发测试、swapLeftAndRightInRTL、RTL 开启优先级与下次启动生效限制。

## 什么是 RTL

阿拉伯语、希伯来语等通常从右向左排版，称为 **RTL（Right-to-Left）**。**I18nManager** 管理应用 RTL 支持和样式左右转换。RN 也支持 start/end 逻辑样式，优先使用逻辑边而不是把界面固定到 left/right。

**isRTL** 表示当前是否处于 RTL layout mode。其判定顺序：forceRTL=true 时强制 true；allowRTL=false 时为 false；否则依赖设备语言是否 RTL 以及原生项目是否声明支持：iOS Xcode localization knownRegions 包含语言；Android Manifest application 使用 android:supportsRTL=true。

**doLeftAndRightSwapInRTL** 表示 left/right 样式是否会自动交换。**swapLeftAndRightInRTL(boolean)** 修改这项行为，但不会改 isRTL 的值。

    const alignStart = I18nManager.isRTL ? 'right' : 'left';

    <View style={{
      alignSelf: 'flex-start',
      marginStart: 12,
      borderStartWidth: 2,
    }}>
      <Text>根据方向适配的位置</Text>
    </View>

如果代码直接写 absolute left/right 坐标，RTL 下可能和 flex 布局方向不一致；需要时根据 isRTL 显式切换偏移或动画方向。

## 应用 RTL 配置

**allowRTL(boolean)** 开启/关闭应用允许跟随 RTL 语言方向。**forceRTL(boolean)** 忽略设备语言、强制进入或退出 RTL。后者主要用于开发测试，不建议生产强制，因为设置持久化，并要等应用下次启动才完全生效。

    // 仅开发调试：保存后重启应用，检查 RTL 界面。
    if (__DEV__) {
      I18nManager.forceRTL(true);
    }

**swapLeftAndRightInRTL(boolean)** 控制布局遇到 RTL 时是否互换 left/right 样式属性。RTL 状态本身不会立即通过以上持久化配置改变，需按文档说明重新启动应用后验证。

## 属性和方法清单

| API | 说明 |
|---|---|
| **isRTL** | 当前 RTL 布局状态。 |
| **doLeftAndRightSwapInRTL** | 当前是否自动交换左右样式。 |
| **allowRTL(allow)** | 允许或关闭跟随系统 RTL，持久化且重启后完全生效。 |
| **forceRTL(forced)** | 强制开关 RTL，主要用于开发测试，重启后生效。 |
| **swapLeftAndRightInRTL(swap)** | 开关 left/right 样式自动互换；不改变 isRTL。 |

## 代码覆盖清单

已重写官方两个示例主题：根据 RTL 调整布局/动画方向、开发环境强制切换 RTL 测试。属性判定顺序、原生 localization 前提、左右交换和重启生效边界均已覆盖。

**翻页：** [上一页：011 Easing](011-Easing.md) · [目录](README.md) · [下一页：013 Keyboard](013-Keyboard.md)
