# 022 Share

**翻页：** [上一页：021 RootTag](021-RootTag.md) · [目录](README.md) · [下一页：023 StyleSheet](023-StyleSheet.md)

**官方页面：** [Share · React Native](https://reactnative.dev/docs/share)  
**源页代码覆盖：** 原生 share dialog、message/url/title 内容字段、iOS/Android options、sharedAction/dismissedAction 和 Promise 平台差异。

## 打开系统分享面板

**Share.share(content, options?)** 请求系统显示分享面板。content 至少提供 message 或 url。iOS 支持 url；Android 支持 title。可选项也有平台差异：dialogTitle 是 Android 项，excludedActivityTypes、subject、tintColor、anchor 是 iOS 项。

    const result = await Share.share(
      {
        message: '看看这篇 React Native 入门笔记',
        url: 'https://reactnative.dev/docs/getting-started',
        title: 'React Native 入门',
      },
      {
        dialogTitle: '分享文档链接',
        subject: 'RN 学习资料',
      },
    );

iOS Promise 返回 action 和 activityType；用户关闭面板时 Promise 仍 resolve，action 为 **Share.dismissedAction**，其他字段可能为 undefined。Android Promise resolve 时 action 恒为 **Share.sharedAction**。某些 iOS 选项在模拟器中无法显示或生效。

    if (result.action === Share.sharedAction) {
      trackShared(result.activityType);
    } else if (result.action === Share.dismissedAction) {
      trackShareSheetClosed();
    }

iPad 上 iOS 的 **anchor** 用于指定 ActionSheet 锚点；**excludedActivityTypes** 可排除某些系统分享目标；**tintColor** 控制系统控件色；**subject** 为邮件分享设主题。

## 属性清单

| 常量 | 平台 | 含义 |
|---|---|---|
| **sharedAction** | all | 分享操作已完成。 |
| **dismissedAction** | iOS | 用户关闭分享面板。 |

## 代码覆盖清单

已重写源页分享示例，覆盖 message/url/title、平台参数、两种 action 判断、Promise 结果字段、iOS simulator 限制及所有 ShareOptions。

**翻页：** [上一页：021 RootTag](021-RootTag.md) · [目录](README.md) · [下一页：023 StyleSheet](023-StyleSheet.md)
