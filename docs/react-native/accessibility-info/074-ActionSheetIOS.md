# 074 ActionSheetIOS

**翻页：** [上一页：073 ToastAndroid](073-ToastAndroid.md) · [目录](README.md) · [下一页：075 DynamicColorIOS](075-DynamicColorIOS.md)

**官方页面：** [ActionSheetIOS · React Native](https://reactnative.dev/docs/actionsheetios)  
**源页代码覆盖：** 原生 action sheet buttons/options/callback、dismissActionSheet、iOS share sheet URL/message/subject/exclusions、文件 URL 和失败/成功回调结构。

## 显示系统操作表

**ActionSheetIOS.showActionSheetWithOptions(options, callback)** 打开 iOS 原生操作表。options 必须提供按钮标题数组；回调拿到用户所选项的从 0 开始 index。

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['取消', '复制链接', '删除'],
        cancelButtonIndex: 0,
        destructiveButtonIndex: 2,
        title: '文章操作',
        message: '选择要执行的操作',
        tintColor: '#24745d',
        disabledButtonIndices: [],
        userInterfaceStyle: 'light',
      },
      buttonIndex => {
        if (buttonIndex === 1) copyLink();
        if (buttonIndex === 2) deleteArticle();
      },
    );

| option | 含义 |
|---|---|
| **options** | 按钮标题数组，必需。 |
| **cancelButtonIndex** | 取消按钮索引。 |
| **cancelButtonTintColor** | 取消按钮文字颜色。 |
| **destructiveButtonIndex** | 危险操作按钮索引，可传一个或多个。 |
| **title / message** | 操作表标题及副说明。 |
| **anchor** | iPad 上操作表所锚定的节点。 |
| **tintColor** | 非 destructive 按钮标题色。 |
| **disabledButtonIndices** | 禁用按钮的索引数组。 |
| **userInterfaceStyle** | light/dark 外观；省略时跟随系统。 |

**dismissActionSheet()** 关闭当前最上层 action sheet；当前没有操作表时会发 warning。

## iOS 分享表单

**showShareActionSheetWithOptions(options, failureCallback, successCallback)** 调用 iOS share sheet。options 至少要有 url 或 message，另可选 subject 与 excludedActivityTypes。失败回调接收 error（可能带 stack）；成功回调接收 success boolean 和分享方式 string。

    ActionSheetIOS.showShareActionSheetWithOptions(
      {
        message: '看看这篇文章',
        url: 'https://reactnative.dev/',
        subject: 'RN 文档',
        excludedActivityTypes: [],
      },
      error => reportShareError(error),
      (success, method) => {
        if (success) recordShareMethod(method);
      },
    );

url 若指向本地文件或 base64 URI，系统会读取并直接分享文件，因此可分享图片、视频或 PDF；远程 URL 必须是规范 URL 且包含 HTTP/HTTPS scheme。一个分享请求同时有 url 和 message 时也可一并传入。

## 代码覆盖清单

已重写 action sheet 三种 API、所有 options 字段、zero-based index 回调和本地/远程分享 URL 规则，并覆盖 success/failure 回调参数。

**翻页：** [上一页：073 ToastAndroid](073-ToastAndroid.md) · [目录](README.md) · [下一页：075 DynamicColorIOS](075-DynamicColorIOS.md)
