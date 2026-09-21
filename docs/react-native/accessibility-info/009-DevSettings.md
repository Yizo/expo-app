# 009 DevSettings

**翻页：** [上一页：008 AppState](008-AppState.md) · [目录](README.md) · [下一页：010 Dimensions](010-Dimensions.md)

**官方页面：** [DevSettings · React Native](https://reactnative.dev/docs/devsettings)  
**源页代码覆盖：** Dev Menu 自定义菜单项、reload 应用方法与 Reload 按钮示例。

## 开发阶段的调试设置

**DevSettings** 用于自定义开发菜单和触发开发时操作。它不是面向最终用户的业务设置 API；例如，不应把 reload 菜单放进 release 产品界面。

**addMenuItem(title, handler)** 往 Dev Menu 增加自定义项目，点击时运行 handler。它适合为开发人员快速打开诊断页或测试场景。

    DevSettings.addMenuItem('打开调试信息', () => {
      Alert.alert('调试工具', '当前在开发模式中');
    });

**reload(reason?)** 重新加载应用 bundle，可在开发菜单/用户交互中调用；可选 reason 供内部追踪本次 reload 原因。

    <Button
      title="重新加载开发 bundle"
      onPress={() => DevSettings.reload('开发者手动触发')}
    />

## 代码覆盖清单

源页提供 addMenuItem 与 Button 触发 reload 的示例；本文分别重写两个用法，并说明 API 仅适合开发者调试流程。

**翻页：** [上一页：008 AppState](008-AppState.md) · [目录](README.md) · [下一页：010 Dimensions](010-Dimensions.md)
