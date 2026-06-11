# EAS 教程完成后的下一步

> 原文标题：Next steps  
> 文档更新时间：2026 年 2 月 11 日  
> 文档性质：EAS 教程结束后的学习路线与资料索引

## 文档解决的问题

这篇文档面向已经完成 EAS 教程、并拥有一个可工作的 EAS 项目的开发者，主要回答：

> 完成基础教程后，接下来应该继续学习哪些 EAS 功能？

它不是具体功能的操作教程，而是一张后续学习路线图，将开发者引导到构建、发布、更新、托管、自动化和数据分析等专题文档。

因此，当前文档：

- 不提供完整开发流程。
- 不包含可直接执行的 EAS CLI 操作步骤。
- 不详细讲解配置字段。
- 不比较不同功能的适用条件。
- 主要帮助开发者了解 EAS 的能力范围，并找到对应的深入资料。

## 阅读前需要理解的背景

### Expo

Expo 是围绕 React Native 应用开发提供的一套工具和服务。

对于 React Web 开发者，可以暂时将它理解为：

- React Native 负责使用 React 模型开发原生移动应用。
- Expo 在 React Native 之上提供开发、构建、发布和更新等工具。
- EAS 则进一步提供云端构建、商店提交、自动化和托管等服务。

以上是为了帮助建立概念关系的简化解释，并不是本文对 Expo 架构的完整定义。

### EAS

EAS 是本文的核心主题。原文通过多个子产品展示了它覆盖的应用生命周期：

```text
开发
  ↓
构建和签名
  ↓
提交应用商店
  ↓
发布更新
  ↓
自动化开发与发布流程
  ↓
维护商店信息和分析使用情况
```

**基于文档内容推导：** EAS 不是单一的“打包工具”，而是一组覆盖开发、构建、发布、更新和运营阶段的服务。

### “可工作的 EAS 项目”

原文假设读者已经完成 EAS 教程，并且拥有一个 working EAS project。

这意味着本文不是从零开始配置 EAS 的入口。如果尚未创建或配置 EAS 项目，应先回到前置教程。

当前文档没有说明“可工作的 EAS 项目”必须满足哪些具体检查条件。

## EAS 后续学习路线

## 1. EAS Workflows：自动化开发和发布流程

EAS Workflows 用于自动化开发及发布工作流。

对于 React Web 开发者，可以把“工作流”类比为 Web 项目中的 CI/CD 流程，例如在满足特定条件后执行构建或发布任务。

不过，原文只说明它用于自动化开发和发布，没有介绍：

- 工作流配置文件的格式。
- 支持哪些触发条件。
- 可以执行哪些任务。
- 与 GitHub Actions 等工具之间的关系。

**实际使用场景：** 当手工执行构建、更新或发布已经影响效率时，可以继续阅读 EAS Workflows 文档。

## 2. EAS Build：编译并签名 Android 和 iOS 应用

EAS Build 用于：

- 编译 Android 应用。
- 编译 iOS 应用。
- 对 Android 和 iOS 应用进行签名。

这是 React Web 开发者需要重点理解的能力。

Web 项目通常将 JavaScript、CSS 和静态资源构建为可由浏览器或服务器部署的产物。移动应用除了编译，还涉及平台要求的应用签名，最终才能安装、分发或提交到应用商店。

### 什么是应用签名

应用签名用于证明应用构建产物的身份和来源。Android 与 iOS 都有自己的凭据和签名要求。

原文没有解释：

- 两个平台分别使用什么凭据。
- 如何生成和管理凭据。
- 本地构建与云端构建的区别。
- EAS Build 支持哪些构建配置。

这些内容需要继续阅读 EAS Build 和 App credentials 文档。

## 3. EAS Hosting：部署 Web 应用和 API 路由

EAS Hosting 用于部署：

- Expo Router 应用。
- React Native Web 应用。
- API routes。

这是与 React Web 开发经验最接近的一项能力，因为它涉及 Web 应用和 API 的部署。

需要注意，本文只列出可部署的目标，没有解释：

- Expo Router 的路由和渲染机制。
- React Native Web 与普通 React DOM 应用的区别。
- API routes 运行在哪里。
- 域名、环境变量和部署配置方式。
- EAS Hosting 是否适合所有 React Web 项目。

因此，不能仅根据本文得出“任意 React Web 项目都能直接部署到 EAS Hosting”的结论。

## 4. EAS Submit：向应用商店上传应用

EAS Submit 用于通过一条 CLI 命令将应用上传到：

- Google Play Store。
- Apple App Store。

这里的“提交”首先指上传应用构建产物。

React Web 项目通常可以把构建结果直接部署到服务器或托管平台；移动应用则通常需要把构建产物提交到平台应用商店。

### 容易误解的地方

“一条 CLI 命令上传”不应理解为“一条命令后应用必然立刻公开上架”。

原文没有说明：

- 应用商店审核流程。
- 应用上架所需的账号和资料。
- 商店后台还需要完成哪些操作。
- 上传成功是否等同于发布成功。

**基于文档内容推导：** EAS Submit 自动化的是上传步骤，不能仅根据本文认定它替代了应用商店的全部审核和发布流程。

## 5. EAS Update：发布应用更新

EAS Update 用于：

- 发布更新。
- 应用可定制的更新策略。

对于 React Web 开发者，“发布更新”容易被理解为重新部署网站，但移动应用的更新机制不能直接等同于 Web 部署。

本文没有说明：

- 哪些代码或资源可以通过 EAS Update 更新。
- 哪些变更必须重新执行原生构建。
- 更新如何到达用户设备。
- 更新策略包含哪些选项。
- 平台政策带来的限制。

因此，在实际项目中使用前，必须继续阅读 EAS Update 的专题文档，不能假设所有修改都可以绕过应用商店直接发布。

## 6. EAS Metadata：维护应用商店信息

EAS Metadata 当前标记为 **Preview（预览状态）**。

它用于通过命令行：

- 自动化应用商店信息的管理。
- 持续维护应用在商店中的展示信息。

对于 React Web 开发者，可以将其类比为“用代码或命令维护部署相关元数据”，但实际管理对象是应用商店中的应用信息。

由于该功能仍处于预览状态，实际采用时应特别检查其最新文档和能力边界。

当前文档没有列出：

- 可以管理哪些商店字段。
- Android 和 iOS 的支持差异。
- 配置格式。
- 预览功能可能存在的限制。

## 7. EAS Insights：获取精确的使用指标

EAS Insights 当前同样标记为 **Preview（预览状态）**。

原文说明需要使用 `expo-insights` 库获取精确的使用指标。

需要区分两个概念：

- EAS Insights 是相关服务或能力。
- `expo-insights` 是应用中使用的库。

当前文档没有说明：

- 收集哪些指标。
- 如何安装和初始化该库。
- 指标如何展示。
- 数据隐私和用户授权要求。
- 对应用性能的影响。

因此，本文只能确认它与使用指标有关，不能进一步断言其具体分析能力。

## `eas.json` 配置参考

`eas.json` 是本文唯一明确提到的项目配置文件。

完整 Schema 文档用于查看：

- EAS Build 可用的配置属性。
- EAS Submit 可用的配置属性。
- 如何配置或覆盖默认行为。

对于 React Web 开发者，可以把它类比为项目中的部署或构建配置文件，例如 CI 配置、托管平台配置或构建工具配置。

但它服务于 EAS，不能直接等同于 `package.json`：

- `package.json` 主要描述 JavaScript 项目、依赖和脚本。
- `eas.json` 用于配置 EAS Build、EAS Submit 等相关行为。

当前文档没有提供：

- `eas.json` 的示例内容。
- 文件的具体存放位置。
- 必填字段。
- 默认配置。
- 不同环境的配置方法。

需要查阅 `eas.json schema` 文档获得准确字段定义。

## 自定义构建

Custom builds 用于扩展 EAS Build，并使用自己的配置创建构建工作流。

**基于文档内容推导：** 当标准 EAS Build 流程无法覆盖项目需求时，可以考虑自定义构建。

但原文没有说明：

- 哪些场景必须使用自定义构建。
- 自定义能力的边界。
- 配置方式。
- 成本和限制。
- 它与 EAS Workflows 的具体区别。

因此，不应在不了解标准 EAS Build 能力的情况下直接选择自定义构建。

## 与实际交付相关的专题指南

### 自动提交应用

“Automate submissions”指南介绍如何配合 EAS Build，自动向应用商店提交构建结果。

它与 EAS Submit 的关注点不同：

- EAS Submit 是上传应用的能力。
- 自动提交指南关注如何把提交动作接入构建流程。

**基于文档内容推导：** 适合希望减少“构建完成后再手动执行提交”操作的项目。

### 使用 GitHub Actions 发布 EAS Update

该指南介绍如何通过 GitHub Actions 自动发布 EAS Update。

这对 React Web 开发者比较熟悉：代码仓库中的事件触发 GitHub Actions，再执行更新发布。

原文没有提供工作流 YAML、触发条件或权限配置，因此本文不能作为直接实施指南。

### 应用凭据

App credentials 指南解释 Android 和 iOS 的凭据要求。

它与 EAS Build 中的“签名”直接相关，是没有原生移动开发经验的读者应优先补充的知识。

需要重点建立以下认识：

> JavaScript 代码能够正常运行，不代表应用已经满足平台构建、签名和分发要求。

当前文档没有给出凭据类型、生成方法或安全管理要求。

### Expo 应用开发流程

“Develop an app with Expo”提供 Expo 应用开发过程的整体概览，用于建立核心开发循环的心智模型。

对于只有 React Web 经验的开发者，这一页应当优先阅读，因为 EAS 的构建、提交和更新能力都建立在 Expo 应用开发流程之上。

## 推荐的学习顺序

以下顺序是**基于文档内容推导**，不是原文规定的固定顺序：

1. **Develop an app with Expo**  
   先理解 Expo 应用的基本开发循环。

2. **App credentials**  
   理解 Android 和 iOS 为什么需要凭据及签名。

3. **EAS Build**  
   学习如何编译、签名并获得移动应用构建产物。

4. **EAS Submit**  
   学习如何把产物上传到 Google Play 和 Apple App Store。

5. **EAS Update**  
   理解应用安装后如何发布更新，以及更新策略的边界。

6. **`eas.json` schema**  
   在需要调整构建或提交行为时查阅准确配置。

7. **EAS Workflows、自动提交和 GitHub Actions**  
   基础流程稳定后再进行自动化。

8. **EAS Hosting、Metadata、Insights 和 Custom builds**  
   根据项目是否包含 Web 部署、商店信息维护、指标分析或特殊构建需求选择学习。

## React Web 开发者最容易误解的地方

| 容易产生的理解 | 更准确的理解 |
|---|---|
| EAS 只是类似 `npm run build` 的工具 | EAS 包含构建、签名、商店上传、更新、托管和自动化等多项服务 |
| 移动应用构建与 Web 打包基本相同 | 移动应用还涉及 Android/iOS 平台编译、签名和凭据 |
| EAS Submit 会自动完成整个上架过程 | 本文只明确说明它能够上传应用，没有说明它替代商店审核 |
| EAS Update 等同于重新部署网站 | 移动更新存在独立机制与边界，但本文没有给出详细规则 |
| EAS Hosting 可以托管任意 React 项目 | 本文只明确提到 Expo Router、React Native Web 和 API routes |
| `eas.json` 可以替代 `package.json` | 两者职责不同；本文明确将 `eas.json` 用于 EAS Build 和 Submit 配置 |
| Preview 功能可以直接视为稳定能力 | Metadata 和 Insights 明确处于预览状态，应先确认最新能力和限制 |

## 文档没有涉及的内容

当前文档未涉及以下具体实施信息：

- 安装或配置 EAS CLI 的命令。
- 创建 EAS 项目的步骤。
- `eas.json` 的字段和示例。
- Android 与 iOS 的具体构建命令。
- 应用凭据的类型和管理方式。
- 应用商店账号、审核和正式上架流程。
- EAS Update 可以更新哪些内容。
- 各项服务的价格、配额或权限限制。
- EAS Hosting 的部署配置。
- Metadata 与 Insights 的完整支持范围。
- 常见错误和故障排查方法。
- 本地原生工程目录及其作用。

这些内容不能根据本文自行补全，需要进入相应专题文档确认。

## 实际开发中的使用方式

这篇文档最适合被当作 EAS 文档地图，而不是操作手册。

实际使用时，可以按照当前目标选择入口：

| 当前目标 | 对应资料 |
|---|---|
| 建立 Expo 开发流程认知 | Develop an app with Expo |
| 生成 Android 或 iOS 应用 | EAS Build |
| 理解签名要求 | App credentials |
| 上传应用商店 | EAS Submit |
| 自动构建后提交 | Automate submissions |
| 发布应用更新 | EAS Update |
| 使用 GitHub Actions 自动发布更新 | GitHub Actions with EAS Update |
| 自动化开发和发布流程 | EAS Workflows |
| 部署 Expo Web 应用或 API | EAS Hosting |
| 调整构建和提交行为 | `eas.json` schema |
| 创建特殊构建流程 | Custom builds |
| 用命令行维护商店信息 | EAS Metadata |
| 获取应用使用指标 | EAS Insights |

## 总结

本文标志着 EAS 入门教程的结束，并给出了后续能力地图。它明确介绍了 EAS 的主要方向：

- 使用 EAS Build 编译和签名移动应用。
- 使用 EAS Submit 上传应用商店。
- 使用 EAS Update 发布更新。
- 使用 EAS Workflows 自动化开发与发布。
- 使用 EAS Hosting 部署 Web 应用和 API routes。
- 使用 `eas.json` 配置 Build 与 Submit。
- 根据需要采用自定义构建、商店元数据维护和使用指标分析。

对 React Web 开发者而言，最关键的认知变化是：移动应用交付不只是 JavaScript 打包，还包括平台编译、应用签名、凭据管理、商店上传以及独立的更新机制。本文只负责指出这些方向，具体实施规则必须进入对应专题文档继续学习。

<!-- NAVIGATION START -->
---
[← 上一页：从 GitHub 仓库触发 EAS Build](./11__using-github.md)
<!-- NAVIGATION END -->
