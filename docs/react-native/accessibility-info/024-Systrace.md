# 024 Systrace

**翻页：** [上一页：023 StyleSheet](023-StyleSheet.md) · [目录](README.md) · [下一页：025 Transforms](025-Transforms.md)

**官方页面：** [Systrace · React Native](https://reactnative.dev/docs/systrace)  
**源页代码覆盖：** isEnabled、同步 begin/end 标记、跨线程/异步 beginAsync/endAsync 与 cookie、counterEvent 计数轨迹、Android EasyProfiler 使用说明。

## 给性能分析时间线加标记

**Systrace** 是 Android 平台的 marker-based profiling 工具。代码块起止位置加 trace marker 后，会在 profiler 彩色时间线中显示；Android SDK 与 RN framework 自身也会提供标记。RN API 还可记录带 tag 的非 timed JS 事件。

**isEnabled()** 检查追踪是否启用。短同步区间使用 **beginEvent(name, args?)** 与 **endEvent(args?)**，两者应在同一调用栈中成对调用。

    if (Systrace.isEnabled()) {
      Systrace.beginEvent('prepare-visible-cards');
      prepareVisibleCards();
      Systrace.endEvent();
    }

异步任务跨越 await/线程边界时，用 **beginAsyncEvent(name, args?)** 返回 cookie，结束时调用 **endAsyncEvent(name, cookie, args?)**：

    const cookie = Systrace.beginAsyncEvent('load-preview');
    try {
      await loadPreview();
    } finally {
      Systrace.endAsyncEvent('load-preview', cookie);
    }

**counterEvent(name, value)** 把某个数字记录为 trace 时间线的计数轨迹，例如队列长度或活动任务数。

    Systrace.counterEvent('queued-images', queuedImages.length);

官方说明 Android Systrace 工具包含在 Android platform-tools；可在 EasyProfiler 中采集 non-Timed JS events。

## 方法速查

| 方法 | 用途 |
|---|---|
| **isEnabled()** | 查询 Systrace 当前是否启用。 |
| **beginEvent(name, args?) / endEvent(args?)** | 标注同一同步调用栈的开始和结束。 |
| **beginAsyncEvent(name, args?) / endAsyncEvent(name, cookie, args?)** | 标注可跨异步边界完成的工作，cookie 要成对传回。 |
| **counterEvent(name, value)** | 在时间线上绘制某名称对应的数值轨迹。 |

## 代码覆盖清单

已重写同步区间、异步 cookie 和计数器示例，覆盖所有 6 个方法及 Android/EasyProfiler 背景说明。

**翻页：** [上一页：023 StyleSheet](023-StyleSheet.md) · [目录](README.md) · [下一页：025 Transforms](025-Transforms.md)
