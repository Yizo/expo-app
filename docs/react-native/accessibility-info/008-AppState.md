# 008 AppState

**翻页：** [上一页：007 AppRegistry](007-AppRegistry.md) · [目录](README.md) · [下一页：009 DevSettings](009-DevSettings.md)

**官方页面：** [AppState · React Native](https://reactnative.dev/docs/appstate)  
**源页代码覆盖：** 当前 AppState 读取、change/memoryWarning/focus/blur 事件订阅、状态值 active/background/inactive、legacy architecture 初始 null 说明。

## 应用前台与后台状态

**AppState** 告诉 JS 应用目前是否在前台，并允许监听变化。它常用于暂停耗时动画、处理推送意图、重新进入前台时刷新数据等。

- **active**：应用前台运行。
- **background**：应用在后台；用户可能切到别的应用、回主屏，Android 也可能打开 autofill 等系统 Activity。
- **inactive**：iOS 特有的过渡/短暂不可交互状态，例如进入多任务视图、通知中心或来电期间。

Android notification drawer 下拉时，应用可能仍是 active，但当前没有接收用户交互；此时 Android 的 **blur** 事件可以反映“用户暂时没有操作”，它与应用状态变化不同。

## 读取状态并监听变化

**AppState.currentState** 保存当前状态。旧架构下应用启动时可能先为 null，等原生状态异步返回后再更新。监听 **change** 事件可以同步后续变化；在组件卸载时移除 subscription。

    function useAppLifecycle() {
      const [state, setState] = useState(AppState.currentState);

      useEffect(() => {
        const subscription = AppState.addEventListener('change', nextState => {
          setState(nextState);
          if (nextState === 'active') refreshVisibleData();
          if (nextState === 'background') pausePlayback();
        });
        return () => subscription.remove();
      }, []);

      return state;
    }

## 事件速查

| 事件 | 平台 | 触发时机 |
|---|---|---|
| **change** | all | active/background/inactive 等应用状态改变，回调收到新状态。 |
| **memoryWarning** | iOS | 系统向应用发送内存警告。 |
| **focus** | Android | 应用重新获得用户交互焦点。 |
| **blur** | Android | 用户暂时不与应用交互，例如拉下通知面板；AppState.currentState 可能仍不变。 |

唯一方法 **addEventListener(type, listener)** 为指定事件创建订阅并返回 NativeEventSubscription。回调的事件类型根据上述平台支持而异。

## 代码覆盖清单

源页的当前值与事件监听主题已用原创 hook 重写；涵盖状态枚举、四类事件、addEventListener 返回的订阅清理，以及旧架构启动时可能暂为 null 的边界。

**翻页：** [上一页：007 AppRegistry](007-AppRegistry.md) · [目录](README.md) · [下一页：009 DevSettings](009-DevSettings.md)
