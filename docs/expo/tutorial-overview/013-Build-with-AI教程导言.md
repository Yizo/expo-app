# 013｜Build with AI 教程导言

**翻页：**[上一页：教程后续资源](./012-教程后续资源.md) · [目录](./README.md) · [下一页：AI 教程环境准备](./014-AI教程环境准备.md)

**官方页面：**[Tutorial: Build an app with an AI agent](https://docs.expo.dev/tutorial/build-with-ai/introduction/)

## 这条教程给谁

Expo 的 Build with AI tutorial 通过提示词让 coding agent 帮忙完成一个 iOS / Android / Web app，面向没有编程背景、手上有产品想法的 builder。读者需要安装 agent 并用自己的手机逐步验收。若想自己写 JSX / TSX，前面普通 Expo tutorial 是对应的手动编码路线。

成果同样是 StickerSmash：选照片、叠加 emoji、手指移动 / 缩放 sticker、保存图片。

## 每章的工作循环

1. **Prompt**：把页面提供的任务描述交给 AI agent。
2. **Build**：agent 编辑项目文件，开发 app 在手机上刷新。
3. **Verify**：在设备上亲自确认功能和布局符合目标。
4. **Re-prompt**：出问题时告诉 agent 实际看到什么，让它继续修改。

AI 输出每次可能不同，不要求与文档截图完全逐像素一致。用户可以调整颜色、文案和布局；验收结果与可用性仍由用户负责，不能因为 agent 说已完成就略过手机验证。

## 环境要求

- macOS / Windows / Linux 电脑；
- Android 或 iOS 手机；
- 约一小时；第一章会带领安装工具，因此可从全新环境开始。

这与本文主要读者（熟悉 React 的工程师）也相关：AI coding agent 可以生成代码，但理解 native UI、Expo Go / Development Build 和原生权限仍有助于发现模型生成的配置问题。

## 六章内容

按官方目录接下来会设置工具、创建 app、构建首页、增加 stickers、保存创作并完成视觉细节。这条链是 AI 配对编程体验，不会替代 Expo / RN 核心概念学习。

## 关键名词

- **Coding agent**：根据自然语言任务编辑 / 运行工程的 AI 程序助手。
- **Prompt**：交代任务目标、约束和成功标准的输入。
- **Verify**：直接打开应用检查结果，而非只阅读模型总结或看静态代码。
- **Re-prompt**：基于实际问题补充要求，让 agent 再迭代一次。
- **Product owner / tester**：决定行为与验收体验的人；AI 是执行代码修改的协作者。

## 官方代码主题覆盖

本页没有代码块或终端命令；它介绍目标应用、循环方式、必要设备 / 电脑和后续章节。

## 下一页

页脚 **Next** 指向 [Set up your tools](https://docs.expo.dev/tutorial/build-with-ai/set-up-your-tools/)，安装 AI agent、Node.js 与 Expo Go。

**翻页：**[上一页：教程后续资源](./012-教程后续资源.md) · [返回目录](./README.md) · [下一页：AI 教程环境准备](./014-AI教程环境准备.md)
