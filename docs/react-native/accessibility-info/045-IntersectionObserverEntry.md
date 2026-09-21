# 045 IntersectionObserverEntry

**翻页：** [上一页：044 IntersectionObserver](044-IntersectionObserver.md) · [目录](README.md) · [下一页：046 navigator](046-navigator.md)

**官方页面：** [IntersectionObserverEntry · React Native](https://reactnative.dev/docs/global-intersectionobserverentry)  
**源页代码覆盖：** Canary/Experimental 限制、IntersectionObserver callback entries、DOMRect 区域/比例/目标/时间字段与 RN root-relative 扩展字段。

## 一次交叉变化的数据

**IntersectionObserverEntry** 描述某一时刻 target Element 和 root container 的交叉关系。Observer callback 的 entries 参数包含这类数据。此 API 当前仅 RN Canary/Experimental channel 可用。

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        console.log({
          visible: entry.isIntersecting,
          targetRatio: entry.intersectionRatio,
          rootRatio: entry.rnRootIntersectionRatio,
          target: entry.target,
        });
      }
    }, { threshold: [0, 0.5, 1], rnRootThreshold: 0.75 });

每个 entry 的属性：

| 属性 | 解释 |
|---|---|
| **boundingClientRect** | 目标元素完整边界的 DOMRectReadOnly。 |
| **intersectionRect** | 当前可见交叉区域的 DOMRectReadOnly。 |
| **intersectionRatio** | intersectionRect 相对 target bounds 的比例。 |
| **isIntersecting** | 目标当前是否与 root 相交；false 表示离开，true 表示进入/仍可见。 |
| **rnRootIntersectionRatio** | RN 扩展：交叉区域相对 root bounds 的比例，对应 rnRootThreshold。 |
| **rootBounds** | Observer 根区域矩形。 |
| **target** | 其交叉状态发生变化的 Element。 |
| **time** | IntersectionObserver 时间原点之后记录该状态的高精度时间戳。 |

## 代码覆盖清单

源页为属性参考，没有独立调用代码；本文在 observer callback 中读取可见性/两个比例/target，并列出全部属性及 RN 专属字段。实验 channel 边界已注明。

**翻页：** [上一页：044 IntersectionObserver](044-IntersectionObserver.md) · [目录](README.md) · [下一页：046 navigator](046-navigator.md)
