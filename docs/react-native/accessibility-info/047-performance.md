# 047 performance

**翻页：** [上一页：046 navigator](046-navigator.md) · [目录](README.md) · [下一页：048 PerformanceEntry](048-PerformanceEntry.md)

**官方页面：** [performance · React Native](https://reactnative.dev/docs/global-performance)  
**源页代码覆盖：** Performance 全局对象、RN rnStartupTiming 启动字段、timeOrigin/now 部分支持说明及时间线 mark/measure/entries 查询方法。

## 性能时间线对象

全局 **performance** 提供 Web-style Performance API。React Native 当前文档列出性能 entry 与测量方法，并额外提供 **rnStartupTiming** 启动数据。页面说明部分接口的时间基准和平台支持与 Web 标准不完全相同，做绝对时间换算前需核对运行环境。

    const started = performance.now();
    await loadInitialData();
    const finished = performance.now();

    const elapsedMs = finished - started;
    performance.mark('initial-data-loaded');
    console.log('初始数据加载耗时', elapsedMs);

## 属性

| 属性 | 说明 |
|---|---|
| **eventCounts** | 事件数量相关属性；详情由平台 API 类型提供。 |
| **memory** | 内存信息相关属性；源页指向规范文档，未展开字段。 |
| **rnStartupTiming** | RN 扩展：应用启动阶段时间；见下表。 |
| **timeOrigin** | 部分支持；时间起点基于系统启动而非 app startup。 |

RN 的 **ReactNativeStartupTiming** 字段：

- **startTime**：RN runtime 初始化开始。
- **executeJavaScriptBundleEntryPointStart**：应用 JS bundle 开始执行。
- **endTime**：RN runtime 完全初始化。

## 方法

| 方法 | 用途/平台备注 |
|---|---|
| **clearMarks() / clearMeasures()** | 清理已记录的命名标记和测量。 |
| **getEntries()** | 读取所有 performance entries。 |
| **getEntriesByName(name)** | 按名称检索 entries。 |
| **getEntriesByType(type)** | 按类型检索 entries。 |
| **mark(name)** | 创建时间标记。 |
| **measure(...)** | 依据标记/时间生成测量 entry。 |
| **now()** | 部分支持；返回相对系统启动的毫秒值，而非 app 启动时间。 |

可用差值测算一次流程耗时；系统启动基准的绝对时间不应直接解释为“应用启动后经过多久”。**PerformanceEntry** 等返回值类型在后续页解释。

## 代码覆盖清单

官方页没有独立应用示例；本文补上 mark 时间点和 now 差值示范，measure() 则在方法表说明，并列出所有属性、rnStartupTiming 结构和时间基准差异。

**翻页：** [上一页：046 navigator](046-navigator.md) · [目录](README.md) · [下一页：048 PerformanceEntry](048-PerformanceEntry.md)
