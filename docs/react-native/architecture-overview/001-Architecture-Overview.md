# 001 Architecture Overview

**翻页：** [上一页：目录](README.md) · [目录](README.md) · [下一页：002 About the New Architecture](002-新架构介绍.md)

**官方页面：** [Architecture Overview · React Native](https://reactnative.dev/architecture/overview)  
**源页代码覆盖：** 无代码示例；这是架构栏目导读与目录页。

## 这组文档讲什么

Architecture Overview 是对 React Native 内部如何运作的概念概览。它与面向 app 开发者的入门指南用途不同：主要读者是 RN 库作者和核心贡献者，普通应用开发者不需要先理解内部架构，也能有效开发应用。

这部分资料仍在持续完善中。阅读时把它作为理解渲染器、原生视图和 JavaScript 运行时关系的背景知识；具体 API 是否适合 app 使用，仍应以组件/API 文档为准。

## 官方目录结构

当前栏目按底部 Next 从总览继续到 **About the New Architecture**，然后逐步介绍渲染侧的 Fabric、Render/Commit/Mount、跨平台实现、View Flattening、Threading Model，最后涉及 Bundled Hermes 和 Glossary。本文档只按 Next 顺序整理，遇到侧栏目录也会以后续链接逐篇进入。

## 关键名词先建立边界

- **架构概览**：解释框架内部边界和协作方式，不是日常组件使用教程。
- **渲染器（renderer）**：将 React 描述的 UI 转换为平台视图更新的 RN 内部部分；本入口只列出后续主题，具体机制留给后续页面。
- **Fabric**：官方架构目录中的新渲染系统主题，下一步章节会展开。
- **Hermes**：React Native 常用的 JavaScript 引擎；后续 Bundled Hermes 页面解释它在构建中的角色。

为 Web React 工程师建立类比时，可以把 React element tree 理解为“描述 UI 的结构”，但最终不是 HTML DOM：RN 会创建/更新 iOS、Android 原生视图。该类比只帮助理解阅读方向，不表示浏览器节点 API 可直接用于 native。

## 代码覆盖清单

官方概览页没有代码块，也没有具体 API 示例。本文仅解释阅读目的、读者定位和目录名词，没有遗漏源页代码主题。

**翻页：** [上一页：目录](README.md) · [目录](README.md) · [下一页：002 About the New Architecture](002-新架构介绍.md)
