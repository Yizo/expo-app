# 001 AccessibilityInfo

**翻页：** [上一页：目录](README.md) · [目录](README.md) · [下一页：002 Alert](002-Alert.md)

**官方页面：** [AccessibilityInfo · React Native](https://reactnative.dev/docs/accessibilityinfo)  
**源页代码覆盖：** 无独立应用代码块；覆盖事件订阅、屏幕阅读器播报、辅助功能超时、Android 服务检查、iOS/Android 辅助显示设置查询、无障碍焦点与事件发送签名。

## 这个 API 能做什么

**AccessibilityInfo** 用于读取设备当前辅助功能设置，监听这些设置变化，并按需向屏幕阅读器发出播报或聚焦事件。辅助技术包括 iOS VoiceOver、Android TalkBack，也可能包含 Android 第三方服务。

使用它不等于完成无障碍支持。控件本身仍要提供可访问名称、role、state、可操作区域等语义；这个 API 用来让界面适应读屏、大字、高对比和减少动画等系统偏好。

## 监听设置变化

**addEventListener(eventName, handler)** 返回订阅对象，组件卸载时必须移除订阅，避免重复监听。示例监听读屏启用变化和系统减少动态效果的偏好：

    useEffect(() => {
      const readerSubscription = AccessibilityInfo.addEventListener(
        'screenReaderChanged',
        isEnabled => setReaderEnabled(isEnabled),
      );
      const motionSubscription = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        reduceMotion => setAnimationsEnabled(!reduceMotion),
      );

      return () => {
        readerSubscription.remove();
        motionSubscription.remove();
      };
    }, []);

| eventName | 平台与回调参数 |
|---|---|
| **accessibilityServiceChanged** | Android：TalkBack 或其它辅助服务启用状态改变，回调 boolean。 |
| **announcementFinished** | iOS：屏幕阅读器播报结束，回调含 announcement 字符串和 success boolean。 |
| **boldTextChanged** | iOS：系统粗体文字设置变化，回调 boolean。 |
| **grayscaleChanged** | iOS：灰阶显示设置变化，回调 boolean。 |
| **invertColorsChanged** | iOS：反转颜色设置变化，回调 boolean。 |
| **reduceMotionChanged** | iOS/Android：减少动画偏好变化，回调 boolean；Android 开发者选项把动画比例关掉也可能为 true。 |
| **reduceTransparencyChanged** | iOS：减少透明度设置变化，回调 boolean。 |
| **screenReaderChanged** | VoiceOver/TalkBack 等屏幕阅读器开关变化，回调 boolean。 |

## 查询当前辅助功能状态

下列查询返回 Promise<boolean>，因为读取原生系统设置需要异步：

- **isScreenReaderEnabled()**：屏幕阅读器当前是否启用，跨端可用。
- **isAccessibilityServiceEnabled()**：Android 是否有任一辅助服务运行；也包含第三方服务。仅想检查 TalkBack 时用 isScreenReaderEnabled。
- **isReduceMotionEnabled()**：减少动画偏好是否开启。
- **getRecommendedTimeoutMillis(originalTimeout)**：Android 根据用户设置的“采取操作所需时间”偏好返回合适时长；未设置时返回原始 timeout，单位为毫秒。
- **isBoldTextEnabled() / isGrayscaleEnabled() / isInvertColorsEnabled() / isReduceTransparencyEnabled() / isDarkerSystemColorsEnabled() / prefersCrossFadeTransitions()**：iOS 系统文字、色彩、透明度和淡化过渡偏好。
- **isHighTextContrastEnabled()**：Android 高对比文字偏好。

    async function loadAccessibilityPreferences() {
      const [reader, reduceMotion] = await Promise.all([
        AccessibilityInfo.isScreenReaderEnabled(),
        AccessibilityInfo.isReduceMotionEnabled(),
      ]);

      setReaderEnabled(reader);
      setMotionPreference(reduceMotion ? 'reduced' : 'full');

      if (Platform.OS === 'android') {
        const timeout = await AccessibilityInfo.getRecommendedTimeoutMillis(4000);
        setToastDuration(timeout);
      }
    }

查询结果不应成为内容可访问与否的条件；即使没有读屏，按钮仍需清晰标签。尊重减少动画偏好通常意味着减少或替代非必要动效，而不是移除状态变化。

## 向屏幕阅读器播报

**announceForAccessibility(message)** 向屏幕阅读器发送文本播报。**announceForAccessibilityWithOptions(message, { queue })** 支持可选播报队列；iOS 设置 queue true 时排在正在播放的内容后面，否则新播报可打断当前语音。

    AccessibilityInfo.announceForAccessibility('资料已保存');
    AccessibilityInfo.announceForAccessibilityWithOptions(
      '还有一条提示',
      { queue: true },
    );

播报应针对用户操作后的重要结果，不要每次渲染或频繁值变化都播报，否则读屏会过载。

## 聚焦节点或发送无障碍事件

旧 **setAccessibilityFocus(reactTag)** 已弃用。优先使用 **sendAccessibilityEvent(host, eventType)**，传入 React ref 指向的 host 和事件类型。目标 View 需设 **accessible={true}**。跨平台常用 **focus**；**click**、**viewHoverEnter**、**windowStateChange** 是 Android 专属事件。

    const confirmationRef = useRef<View>(null);

    function showConfirmation() {
      setVisible(true);
      requestAnimationFrame(() => {
        if (confirmationRef.current) {
          AccessibilityInfo.sendAccessibilityEvent(
            confirmationRef.current,
            'focus',
          );
        }
      });
    }

    {visible && (
      <View ref={confirmationRef} accessible>
        <Text>操作完成</Text>
      </View>
    )}

## 代码覆盖清单

源页主要是 API 签名及参考说明，没有可独立运行的主示例。本文为每类 API 编写原创用法：订阅并清理事件、并发读取状态与平台分支、两种播报队列、ref 聚焦。已列出全部 8 种事件、全部平台查询方法、超时 API、弃用焦点 API 与 sendAccessibilityEvent 的四种事件类型。

**翻页：** [上一页：目录](README.md) · [目录](README.md) · [下一页：002 Alert](002-Alert.md)
