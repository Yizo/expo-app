# 012 StatusBar

**翻页：** [上一页：011 SectionList](011-SectionList.md) · [目录](README.md) · [下一页：013 Switch](013-Switch.md)

**官方页面：** [StatusBar · React Native](https://reactnative.dev/docs/statusbar)  
**源页代码覆盖：** 导航页面中的声明式挂载与 props 合并、静态命令式 API、Android 高度常量、显示样式/隐藏/动画、状态栏栈 push/replace/pop。

## StatusBar 管理系统顶栏

状态栏是设备屏幕顶部显示时间、网络、电量及系统图标的区域。RN 的 **StatusBar** 不是普通内容容器，而是设置系统级外观的组件。iOS 与 Android 能控制的细节不同；Android 的 **currentHeight** 还包含刘海区域高度。

页面级配置优先写成声明式组件，让状态跟 React 页面树一致：

    function ArticleScreen() {
      return (
        <View style={{ flex: 1, backgroundColor: '#18212b' }}>
          <StatusBar
            barStyle="light-content"
            hidden={false}
            animated
          />
          <Article />
        </View>
      );
    }

**animated** 只对 **barStyle** 与 **hidden** 的切换做动画。iOS 可用 **showHideTransition** 设显示/隐藏过渡，例如 **fade**、**slide** 或 **none**。**barStyle** 可取 **default**、**auto**、**light-content**、**dark-content**；Android 深色文字需要 API 23 及以上。**auto** 会随设备颜色主题更新。RN 0.87 的源页列出四个 props：**animated**、**barStyle**、**hidden** 和 iOS 的 **showHideTransition**。

## 与导航器共同使用

同一时刻可以挂载多个 **StatusBar**。RN 会按它们挂载的先后顺序合并 props；导航切页时，各页面应声明自己的状态栏需求。不同页面控制同一属性时要明确生命周期，否则页面销毁/弹出时可能留下非预期外观。

    function ProfileScreen() {
      return (
        <>
          <StatusBar barStyle="dark-content" />
          <ProfileContent />
        </>
      );
    }

## 静态 API 与状态栏栈

对于不适合渲染组件的场景，**StatusBar** 提供静态方法。但不要对同一属性同时使用组件 props 与静态 API：下一次 React 渲染时，组件声明可能覆盖静态设置。

    useEffect(() => {
      StatusBar.setBarStyle('light-content', true);
      StatusBar.setHidden(false, 'fade');
    }, []);

**pushStackEntry(props)** 把一组状态栏设置压入栈并返回 entry；对应页面/覆盖层退出时调用 **popStackEntry(entry)**。**replaceStackEntry(entry, props)** 用新配置替换既有项。这适合短暂弹层需要保存/恢复设置的流程，使用后要在清理逻辑中移除栈项：

    useEffect(() => {
      const entry = StatusBar.pushStackEntry({ barStyle: 'light-content', hidden: false });
      return () => StatusBar.popStackEntry(entry);
    }, []);

静态方法还包括 **setBarStyle(style, animated?)** 和 **setHidden(hidden, animation?)**。Android 可读取 **StatusBar.currentHeight** 获取状态栏占用高度；它是平台常量，不应当作跨端布局测量 API。

## 属性与类型速查

| 名称 | 作用 | 平台/默认 |
|---|---|---|
| **animated** | 外观改变时是否过渡动画 | 默认 false；只作用于 barStyle、hidden |
| **barStyle** | 状态栏文字及图标颜色模式 | 默认 default |
| **hidden** | 显示或隐藏状态栏 | 默认 false |
| **showHideTransition** | 切换隐藏状态时的动画 | iOS；默认 fade |
| **currentHeight** | 状态栏高度（含刘海高度） | Android |
| **StatusBarAnimation** | iOS 显示/隐藏动画类型 | fade、slide、none |
| **StatusBarStyle** | 状态栏内容颜色模式 | default、auto、light-content、dark-content |

**pushStackEntry** 返回的 entry 是之后 pop/replace 所需的句柄。系统外观最终还受设备主题、操作系统版本和屏幕结构影响，应在真实 iOS 与 Android 设备上校验。

## 代码覆盖清单

已覆盖页面用法中的导航/多组件合并概念与静态用法，并示范 props 设置、静态设置及栈生命周期。参考 API 中全部 5 个静态方法（push/pop/replace 栈项、setBarStyle、setHidden）、**currentHeight**、4 个 props 和两个枚举值均已在正文/表格列出。

**翻页：** [上一页：011 SectionList](011-SectionList.md) · [目录](README.md) · [下一页：013 Switch](013-Switch.md)
