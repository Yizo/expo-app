# 044 IntersectionObserver

**翻页：** [上一页：043 Headers](043-Headers.md) · [目录](README.md) · [下一页：045 IntersectionObserverEntry](045-IntersectionObserverEntry.md)

**官方页面：** [IntersectionObserver · React Native](https://reactnative.dev/docs/global-intersectionobserver)  
**源页代码覆盖：** Canary/Experimental 限制、构造函数 callback/options、root/rootMargin/threshold/rnRootThreshold、观察与停止/排空方法。

## 能力与版本限制

RN 全局 **IntersectionObserver** 用于异步观察目标 Element 与祖先容器/视口之间的交叉比例。官方页面标记 Canary 🧪：当前仅 Canary 和 Experimental channel 可用，启用前先核对项目 RN channel。

**IntersectionObserver(callback, options?)** 的 callback 收到跨过阈值的 IntersectionObserverEntry 数组及 observer 实例。

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        for (const entry of entries) {
          setVisible(entry.isIntersecting);
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '0px 0px 48px 0px',
        threshold: [0, 0.5, 1],
        rnRootThreshold: 0.75,
      },
    );

    observer.observe(targetRef.current);
    // 不再需要监听时：
    observer.disconnect();

## 根区域和阈值

- **root**：目标元素的祖先 Element 作为参照视口；省略或 null 时用顶层 viewport。
- **rootMargin**：计算交叉前扩展/缩小根区域的偏移字符串，默认四边都是 0px。
- **threshold**：0.0–1.0 比例，可单值或数组；表示目标自身 bounding box 可见比例跨越点，默认 [0]。
- **rnRootThreshold**：RN 扩展；比例以 root view/viewport 面积作分母。
- observer 的 root/rootMargin/thresholds/rnRootThresholds 是实例属性；阈值列表按数值排序。

React Native 扩展属性 rnRootThreshold/rnRootThresholds 非标准 Web 字段；目标可见比例阈值和根区域比例不要混为一谈。

## 实例方法

| 方法 | 作用 |
|---|---|
| **observe(target)** | 开始观察一个目标 Element。 |
| **unobserve(target)** | 停止观察指定目标。 |
| **disconnect()** | 停止观察全部目标。 |
| **takeRecords()** | 立即取得所有待处理目标的 Entry 数组。 |

## 代码覆盖清单

源页签名未提供完整可运行示例；本文补充创建/观察/清理的原创片段，并覆盖全部 option、实例属性、阈值语义和 4 个 observer 方法。实验 channel 限制已特别标注。

**翻页：** [上一页：043 Headers](043-Headers.md) · [目录](README.md) · [下一页：045 IntersectionObserverEntry](045-IntersectionObserverEntry.md)
