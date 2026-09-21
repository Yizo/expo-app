# 036 console

**翻页：** [上一页：035 clearTimeout](035-clearTimeout.md) · [目录](README.md) · [下一页：037 EventCounts](037-EventCounts.md)

**官方页面：** [console · React Native](https://reactnative.dev/docs/global-console)  
**源页代码覆盖：** 全局 console 对象 WIP 声明、已列出的 timeStamp 性能时间线 API、start/end/track/color 参数及 DevToolsColor 类型。

## Performance 面板的自定义时间点

React Native 的全局 **console** 页面标记为 work in progress。当前文档实际展开的是 **console.timeStamp(label, start?, end?, trackName?, trackGroup?, color?)**，用于在 Performance 面板时间线上加入自定义时间条目；页面未逐项描述其它 console 方法。

    console.timeStamp(
      'image-decode',
      requestStartedAt,
      performance.now(),
      'Image loading',
      'Feed',
      'secondary',
    );

**label** 必填。start/end 可传此前记录的 timestamp 名称字符串，也可传 DOMHighResTimeStamp 数字；省略时取当前时间。**trackName** 与 **trackGroup** 将标记分到自定义轨道和组中。

color 可选值为 primary、primary-light、primary-dark、secondary、secondary-light、secondary-dark、tertiary、tertiary-light、tertiary-dark、warning、error。适合在 profile 时间线上标出应用自身阶段，帮助和 RN/platform markers 对齐。

## 代码覆盖清单

页面是 WIP，但提供了 timeStamp 的完整签名与 color union；本文覆盖必填 label、可选时间/轨道/颜色，并给出原创的加载时间线标记示例。

**翻页：** [上一页：035 clearTimeout](035-clearTimeout.md) · [目录](README.md) · [下一页：037 EventCounts](037-EventCounts.md)
