# 053 PerformanceObserver

**翻页：** [上一页：052 PerformanceMeasure](052-PerformanceMeasure.md) · [目录](README.md) · [下一页：054 PerformanceObserverEntryList](054-PerformanceObserverEntryList.md)

**官方页面：** [PerformanceObserver · React Native](https://reactnative.dev/docs/global-PerformanceObserver)  
**源页代码覆盖：** Observer callback/entry iteration、observe entryTypes、supportedEntryTypes、disconnect。

## 观察性能条目

**PerformanceObserver** 订阅性能时间线条目；新 entry 到达时 callback 收到 PerformanceObserverEntryList、observer 本身和 options。此模式让代码不用每次主动轮询 performance.getEntries。

    const observer = new PerformanceObserver((list, currentObserver, options) => {
      for (const entry of list.getEntries()) {
        console.log(entry.entryType, entry.name, entry.startTime, entry.duration);
      }
    });

    observer.observe({ entryTypes: ['mark', 'measure'] });

页面列出的 supportedEntryTypes 为 mark、measure、event、longtask、resource。任务完成或组件卸载时可调用 **disconnect()** 停止观察；**observe(options)** 开始监听。

## 代码覆盖清单

已重写源页的 callback、遍历 entry、observe 配置示例，并列出支持的 entryTypes 与 observe/disconnect 方法。

**翻页：** [上一页：052 PerformanceMeasure](052-PerformanceMeasure.md) · [目录](README.md) · [下一页：054 PerformanceObserverEntryList](054-PerformanceObserverEntryList.md)
