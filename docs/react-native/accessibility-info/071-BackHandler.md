# 071 BackHandler

**翻页：** [上一页：070 useWindowDimensions](070-useWindowDimensions.md) · [目录](README.md) · [下一页：072 PermissionsAndroid](072-PermissionsAndroid.md)

**官方页面：** [BackHandler · React Native](https://reactnative.dev/docs/backhandler)  
**源页代码覆盖：** Android hardwareBackPress 订阅/移除、监听器逆序传播与 true/false 行为、Modal 限制、exitApp 方法。

## Android 返回键

**BackHandler** 仅 Android，用于处理系统硬件/系统返回操作。使用 **addEventListener('hardwareBackPress', handler)** 注册监听，handler 返回 true 表示本监听已处理，不再通知更早注册的监听或默认系统行为；返回 false/null/undefined 表示继续向前传递。所有监听器都不处理时，系统会执行默认返回（通常退出 app 或返回 native screen）。

监听器按注册顺序逆序调用，最后注册的先运行。卸载时必须清理 subscription。展示一个打开的 **Modal** 时，BackHandler 不会发布事件，需按 Modal 的 onRequestClose 等 API 处理。

    useEffect(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (navigation.canGoBack()) {
            navigation.goBack();
            return true; // 已处理，停止向下传播
          }

          Alert.alert('退出应用？', undefined, [
            { text: '取消', style: 'cancel' },
            { text: '退出', onPress: () => BackHandler.exitApp() },
          ]);
          return true;
        },
      );

      return () => subscription.remove();
    }, [navigation]);

没有处理时应明确返回 false。**exitApp()** 可显式请求退出应用，不应为了普通页面返回而无条件调用。

## 方法与相关用法

| API | 说明 |
|---|---|
| **addEventListener(eventName, handler)** | 监听 hardwareBackPress，handler 返回 boolean/null/undefined，返回 NativeEventSubscription。 |
| **exitApp()** | 触发应用退出操作。 |
| **useBackHandler hook** | 官方页推荐社区 useBackHandler hook 简化 listener 生命周期；与 React Navigation 配合时应按其官方定制返回行为指南。 |

## 代码覆盖清单

已重写官方返回键 handler 注册/cleanup 示例，明确 listener 顺序、拦截值、默认行为、Modal 限制和 exitApp。React Navigation 与 hook 使用注意也有说明。

**翻页：** [上一页：070 useWindowDimensions](070-useWindowDimensions.md) · [目录](README.md) · [下一页：072 PermissionsAndroid](072-PermissionsAndroid.md)
