# 041｜CI/CD Tutorial：完成后的学习路径

**翻页：**[上一页：部署 Web 版本到 EAS Hosting](./040-CICD-Web-Deployments.md) · [目录](./README.md) · [下一页：Additional Resources](./042-Additional-Resources.md)

**官方页面：**[CI/CD Tutorial: Next steps](https://docs.expo.dev/tutorial/cicd/next-steps/)

**版本说明：**这是 CI/CD 教程的导航总结，没有代码示例或 SDK 版本化 API。CI/CD 链的示例使用 EAS Workflows 当前云服务；本地 SDK 56 项目需按自己的 build profiles 和原生依赖校对。

## 教程完成后的状态

完整流程把不同代码变化交给匹配的任务：push / PR 上运行自动检查，原生变化创建 Android 和 iOS build，纯 JS 变化发布 EAS Update，版本 tag 触发生产发布和 Web deploy。

## EAS Workflows 参考

- **Workflow YAML Syntax：**查触发器、job、表达式与条件执行的完整语法。
- **Pre-packaged Jobs：**查看 Build、Update、fingerprint、Submit、deploy、Slack 等内置工作。
- **EAS Environment Variables：**配置 secret、通用变量和按环境区分的值。

## 相关 EAS 服务

- **EAS Build：**编译和签名 Android / iOS 应用。
- **EAS Update：**发布 OTA 更新并选择 rollout 策略。
- **EAS Submit：**把 app binary 上传至 Google Play 与 Apple App Store。
- **EAS Hosting：**部署 Expo Router / React Native Web 项目。

## 相关指南

- **Automate submissions：**在 EAS Build 之后自动提交商店。
- **App credentials：**了解 Android 和 iOS production build / submission 的签名凭据要求。
- **Custom builds：**扩展 EAS Build，增加自己的配置和步骤。
- **GitHub Actions with EAS Update：**在 GitHub Actions 工作流里自动发布 EAS Update。

## 关键名词

- **Continuous Integration / CI：**代码集成后自动构建和检查。
- **Continuous Delivery / CD：**在满足发布条件后自动交付到商店或用户设备。
- **预打包任务（pre-packaged job）：**EAS 提供的现成 workflow job 类型，隐藏一部分环境配置步骤。
- **OTA rollout：**对已安装兼容 binary 的用户逐步分发 JS / 资源更新。

## 官方代码主题覆盖

本页是参考资料索引，没有代码块或命令，因此无源代码示例需要改写。

## 下一页

官方页脚 **Next** 转到 [Additional resources](https://docs.expo.dev/additional-resources/)，汇集 Expo 工具、相关框架文档和演讲 / 视频等学习材料。

**翻页：**[上一页：部署 Web 版本到 EAS Hosting](./040-CICD-Web-Deployments.md) · [返回目录](./README.md) · [下一页：Additional Resources](./042-Additional-Resources.md)
