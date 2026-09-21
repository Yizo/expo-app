# 055 PerformanceResourceTiming

**翻页：** [上一页：054 PerformanceObserverEntryList](054-PerformanceObserverEntryList.md) · [目录](README.md) · [下一页：056 process](056-process.md)

**官方页面：** [PerformanceResourceTiming · React Native](https://reactnative.dev/docs/global-PerformanceResourceTiming)  
**源页代码覆盖：** 无代码示例；记录 RN 当前部分支持的十个 resource timing 字段。

## 网络资源性能条目

React Native 页面将 **PerformanceResourceTiming** 作为 Web 标准类，但标为 **Partial support**。当前文档明确实现以下属性：

- **fetchStart**、**requestStart**
- **connectStart**、**connectEnd**
- **responseStart**、**responseEnd**
- **responseStatus**
- **contentType**
- **encodedBodySize**、**decodedBodySize**

除上述字段外，不应假设浏览器端其他 ResourceTiming 字段在当前 React Native 中可用。

## 代码覆盖清单

源页无代码示例；本文逐一覆盖官方列出的十个可用字段并标明部分支持边界。

**翻页：** [上一页：054 PerformanceObserverEntryList](054-PerformanceObserverEntryList.md) · [目录](README.md) · [下一页：056 process](056-process.md)
