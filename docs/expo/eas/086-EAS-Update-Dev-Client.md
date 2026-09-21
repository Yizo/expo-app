# 086｜在 Development Build 中预览 EAS Update

**翻页：**[上一页：运行时 Override EAS Update URL 与 Headers](./085-EAS-Update-Runtime-Override.md) · [目录](./README.md) · [下一页：GitHub PR Preview Updates](./087-EAS-Update-GitHub-PR-Previews.md)

**官方页面：**[Preview updates in development builds](https://docs.expo.dev/eas-update/expo-dev-client/)

**版本边界：**此预览流程需要 development build 和 expo-updates。项目 Expo ~56.0.11 的 expo-updates 包建议按 SDK v56.0.0 参考匹配；Development Client / EAS Dashboard 操作属于未版本化服务。

## 先准备 Development Build

把包含 expo-dev-client 和 expo-updates 的 development build 安装到 iOS / Android 真机或模拟器。这个客户端允许从 Expo Extension tab 打开已发布 update，不需要每个 PR 都从源代码重编完整 native app。

## 从 Extensions Tab 预览

1. 做 JavaScript / assets 更新，使用 eas update 发布至目标 branch。
2. 在 Development Build 中打开 Extensions tab。
3. 首次使用点 Login，以 Expo account 登录；tab 会列出 account 下该项目 branch 的已发布 updates。
4. 点目标 update 旁边 Open 进行测试；点 branch name 可浏览该 branch 的其它 updates。

该登录是为当前 development client 读取 EAS project updates 所需，不等于每位 tester 都需安装 Expo Go。

## 从 EAS Dashboard / Orbit 打开

执行 eas update 后，CLI 会输出新 update 的 EAS Dashboard link。打开详情页点击 Preview，然后选择：

- 扫描二维码，用已经安装且兼容的 development build 打开。
- 选 Open with Orbit，让桌面端将 update 安装 / 启动到模拟器。

这两种方式适合分发给没有直接访问 Git branch 的测试者。

## 手动构造 Development Client URL

如希望从外部系统生成直达某个 update 的链接，可使用下列格式：

```text
[slug]://expo-development-client/?url=https://u.expo.dev/[project-id]/group/[group-id]
```

其中 slug 来自 Expo app config，project-id 是 updates.url 中的 EAS project ID，group-id 是目标 update group。把 URI 粘贴到 Development Build launcher 的 Enter URL Manually，或用二维码扫码打开。

## 关键名词

- **Development Build：**包含开发工具的独立原生 app，与 Expo Go 中固定模块集不同。
- **Extensions Tab：**expo-dev-client 的内置调试页面，可选择并打开 EAS Update。
- **Update Group：**一次 update 及其关联 bundles / assets 的分发组标识。
- **Project slug / ID：**slug 位于 app config；project ID 是 Expo account 中的 EAS project 标识。

## 官方代码主题覆盖

源页没有独立代码块；内嵌命令与 URL themes 均有等价示例：发布 eas update、Extensions Tab 登录 / 切 branch / Open、Dashboard Preview 与 Orbit / QR、手动构造包含 slug / updates URL / update group 的 scheme URI。

## 下一页

官方页脚 **Next** 是 [GitHub Action for PR previews](https://docs.expo.dev/eas-update/github-actions/)，让每个 Pull Request 自动发布一个 update 并回复 QR / 预览链接。

**翻页：**[上一页：运行时 Override EAS Update URL 与 Headers](./085-EAS-Update-Runtime-Override.md) · [返回目录](./README.md) · [下一页：GitHub PR Preview Updates](./087-EAS-Update-GitHub-PR-Previews.md)
