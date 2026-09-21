# 019｜EAS Workflows 示例总览

**翻页：**[上一页：EAS Workflows 限制](./018-EAS-Workflows限制.md) · [目录](./README.md) · [下一页：自动创建 Development Builds](./020-自动创建Development-Builds.md)

**官方页面：**[EAS Workflows examples](https://docs.expo.dev/eas/workflows/examples/introduction/)

**版本说明：**Workflows 是 EAS 云端自动化服务。本页为样例目录，实际任务需要已配置 EAS project、eas.json build profile 与对应凭证。

## 这组样例覆盖什么

EAS 示例页把自动化场景分为开发、审查与发布。主要链接包括：

- **创建 Development Builds**：并行构建不同平台的开发客户端。
- **发布 Preview Updates**：让每个分支上的 commit 都可预览 JavaScript 更新。
- **清理 Update Branches**：GitHub branch 删除后自动清除相应 EAS Update branch。
- **部署到生产**：合并到 main 后构建并提交到应用商店，或发布 OTA update。
- **执行 E2E 测试**：在端到端 UI 测试中验证 app 行为。
- **Use PostHog**：官方样例目录还链接一篇第三方指标 / feature flag 集成；它不是该 Next 链的下一页。

这页是目录，不提供某个 workflow 的 YAML 实现；后续 Next 会逐页展开开发构建、预览更新等样例。

## 关键名词

- **EAS Workflows**：EAS 上运行的云端任务编排器，可按事件串接构建、测试、提交和更新。
- **Development Build**：包含项目 native dependencies 和 Expo developer tools 的 app binary，供开发团队在手机或模拟器上运行。
- **Preview Update**：供评审某个提交的 OTA JavaScript / asset 更新，不等于重新编译原生 binary。
- **E2E test**：端到端测试；像真实用户一样点击界面并检查流程结果。
- **CI/CD**：持续集成 / 持续交付流程，通常由代码事件触发自动检查与发布任务。

## 官方代码主题覆盖

源页是样例导航页，没有 shell、JSON、YAML 或 React 代码块。已列出每个样例场景，并区分内建 EAS 工作流样例与外链的第三方指标集成。

## 下一页

页脚 **Next** 指向 [Create development builds with EAS Workflows](https://docs.expo.dev/eas/workflows/examples/create-development-builds/)，展示如何并行创建 Android / iOS device / iOS simulator 开发包。

**翻页：**[上一页：EAS Workflows 限制](./018-EAS-Workflows限制.md) · [返回目录](./README.md) · [下一页：自动创建 Development Builds](./020-自动创建Development-Builds.md)
