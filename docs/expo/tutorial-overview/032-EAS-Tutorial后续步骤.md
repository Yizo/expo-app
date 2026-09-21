# 032｜EAS Tutorial：后续学习路径

**翻页：**[上一页：从 GitHub Repository 触发 Build](./031-EAS-Tutorial从GitHub构建.md) · [目录](./README.md) · [下一页：CI/CD Tutorial 导言](./033-CICD-Tutorial导言.md)

**官方页面：**[EAS Tutorial: Next steps](https://docs.expo.dev/tutorial/eas/next-steps/)

**版本说明：**这是 EAS Tutorial 的收尾导航页，没有版本化 SDK API，也没有代码示例。页面中的服务名称与预览状态可能随 Expo 文档更新；涉及 SDK 56 项目配置时，以本地依赖和 [SDK v56.0.0 参考](https://docs.expo.dev/versions/v56.0.0/)为准。

## 完成 EAS Tutorial 后做什么

前面章节已经把一个 Expo 项目接入 EAS，并串起 development build、production build、团队预览更新等流程。接下来按需要深入不同服务：

| 方向 | 适合解决的问题 |
| --- | --- |
| [EAS Workflows](https://docs.expo.dev/eas/workflows/) | 用云端 YAML 自动化构建、测试、发布和其他工作流。 |
| [EAS Build](https://docs.expo.dev/build/introduction/) | 编译、签名 Android/iOS 原生应用。 |
| [EAS Hosting](https://docs.expo.dev/eas/hosting/introduction/) | 部署 Expo Router / React Native Web 网站以及 API Routes。 |
| [EAS Submit](https://docs.expo.dev/submit/introduction/) | 把 Android / iOS 构建提交给应用商店。 |
| [EAS Update](https://docs.expo.dev/eas-update/introduction/) | 向兼容的已安装应用发布 JavaScript 与资源更新，并选择更新策略。 |
| [EAS Metadata（预览）](https://docs.expo.dev/eas/metadata/) | 通过命令行管理应用商店资料；页面所处预览阶段需以官方最新状态为准。 |
| [EAS Insights（预览）](https://docs.expo.dev/eas/insights/) | 使用 `expo-insights` 收集应用使用指标；同样属于官方标示的预览功能。 |

## 配置与扩展入口

- [eas.json Schema](https://docs.expo.dev/eas/json/)：查找 EAS Build / Submit 配置项及默认行为。
- [Custom builds](https://docs.expo.dev/custom-builds/introduction/)：扩展构建环境与构建流程。
- [自动提交](https://docs.expo.dev/build/automate-submissions/)：让 EAS Build 完成后继续提交商店。
- [用 GitHub Actions 发布 EAS Update](https://docs.expo.dev/eas-update/github-actions/)：在已有 GitHub Actions 管道中自动发布 OTA 更新。
- [App credentials](https://docs.expo.dev/app-signing/app-credentials/)：理解 Android / iOS 签名与推送通知所需凭据。
- [用 Expo 开发 App](https://docs.expo.dev/get-started/introduction/)：回到 Expo 应用开发的整体循环。

## 关键概念回顾

- **Build（二进制构建）：**包含原生代码和运行时的可安装应用。新增原生模块、权限或升级 SDK 等情况通常要重新构建。
- **Update（OTA 更新）：**更新已安装应用的 JavaScript 与资源；不能凭空给旧 binary 增加原生能力。
- **工作流（Workflow）：**把上述服务编排成自动任务的配置。适合重复执行的构建、检查、测试和发布步骤。
- **预览（Preview）：**功能仍在发展中的服务阶段。采用前要检查当前官方能力、限制和稳定性说明。

## 官方代码主题覆盖

源页是后续阅读链接集合，没有代码块，因此本页没有需要改写的源代码示例。

## 下一页

页脚 **Next** 从 EAS Tutorial 转入 [CI/CD Tutorial: Introduction](https://docs.expo.dev/tutorial/cicd/introduction/)，开始逐页讲解如何用 EAS Workflows 自动构建、测试和发布。该页面已经加入本模块连续 Next 链。

**翻页：**[上一页：从 GitHub Repository 触发 Build](./031-EAS-Tutorial从GitHub构建.md) · [返回目录](./README.md) · [下一页：CI/CD Tutorial 导言](./033-CICD-Tutorial导言.md)
