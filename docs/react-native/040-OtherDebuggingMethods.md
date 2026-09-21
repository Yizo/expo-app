# 040 其他调试方式（Other Debugging Methods）

**翻页：** [上一页：039 Debugging Release Builds](039-DebuggingReleaseBuilds.md) · [目录](README.md) · [下一页：041 Testing](041-Testing.md)

**官方页面：** [Other Debugging Methods · React Native](https://reactnative.dev/docs/other-debugging-methods)  
**源页代码覆盖：** 官方页没有可执行代码示例；说明 Safari Web Inspector 的 JSContext 操作流程，并标记 Remote JavaScript Debugging 在 RN 0.79 已移除。

## 新项目优先使用 RN DevTools

本页讲的是旧式 JavaScript 调试方法。新建 RN/Expo 项目优先使用前几页介绍的 React Native DevTools。

## Safari Web Inspector 与 JavaScriptCore

Safari Developer Tools 可直接检查使用 JavaScriptCore（JSC）运行的 iOS App。流程只适用于该引擎的调试情形：在 iPhone/iPad Settings > Safari > Advanced 开 Web Inspector；在 Mac Safari 设置中打开 Develop 菜单；从 Develop 菜单选择设备和当前 App 的 `JSContext`。它会显示 Console 与 Sources 面板。

App 每次重新载入会生成新的 `JSContext`。可以在 Safari 开启自动显示新 JSContext 的 Inspector，避免手动反复选择。Source maps 不一定默认开启；没有源映射时，断点位置可能对应压缩代码而不是 TS/JS 原文件。

## 远程 JavaScript Debugging 已移除

旧版曾可把 JS 放到 Chrome 远程调试器运行，但 React Native 0.79 已移除该功能。旧项目可查看其具体 RN 版本的归档文档；不要按早期教程寻找现行版本已删除的 “Debug JS Remotely” 开关。

**翻页：** [上一页：039 Debugging Release Builds](039-DebuggingReleaseBuilds.md) · [目录](README.md) · [下一页：041 Testing](041-Testing.md)
