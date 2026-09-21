# 020 ReactNativeVersion

**翻页：** [上一页：019 PlatformColor](019-PlatformColor.md) · [目录](README.md) · [下一页：021 RootTag](021-RootTag.md)

**官方页面：** [ReactNativeVersion · React Native](https://reactnative.dev/docs/reactnativeversion)  
**源页代码覆盖：** JS 已解析 react-native 包的版本号、major/minor/patch/prerelease 字段、getVersionString 与 Platform.constants 版本来源区别。

## 查询当前 RN 包版本

**ReactNativeVersion** 暴露 JavaScript 侧解析到的 react-native package 版本，应用或库可以据此做兼容分支。它和 **Platform.constants.reactNativeVersion** 不同：后者是各平台 native 层报告的 React Native 版本。

    const version = ReactNativeVersion.getVersionString();
    const { major, minor, patch, prerelease } = ReactNativeVersion;

    console.log({ version, major, minor, patch, prerelease });

属性包括 **major**、**minor**、**patch** 数字和 **prerelease** 字符串或 null（正式稳定版本为空）。**getVersionString()** 返回 major.minor.patch，也可附带 prerelease 后缀，例如 0.87.1。

只在必要的运行兼容边界上读取版本；通用组件行为优先用 capability/API 检查，而不是把大量逻辑绑到版本字符串。

## 代码覆盖清单

源页示例已改写，覆盖 getVersionString、四个版本字段、稳定版与预发布格式，以及与平台 native version 的差异。

**翻页：** [上一页：019 PlatformColor](019-PlatformColor.md) · [目录](README.md) · [下一页：021 RootTag](021-RootTag.md)
