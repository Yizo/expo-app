# 本地优先（Local-First）

> 原文地址：[https://docs.expo.dev/guides/local-first/](https://docs.expo.dev/guides/local-first/)

---

> **注意：** 本文档目前正在持续开发中。如果你有任何建议或发现问题，请通过 [Expo GitHub Issue](https://github.com/expo/expo/issues/new/choose) 提交反馈。

## 什么是"本地优先"？

"本地优先"（Local-First）是一种软件设计理念，其核心思想是：**应用程序应优先在用户的本地设备上运行数据库和核心逻辑，而非依赖远程服务器**。

这个概念源自 [Ink & Switch](https://www.inkandswitch.com/) 研究团队发表的一篇[论文](https://www.inkandswitch.com/local-first/)，尽管其底层原则在该论文发表之前就已存在。

这种设计模式驱动着许多流行的应用程序，例如：

- **[Linear](https://linear.app/)** — 项目管理工具
- **[Superhuman](https://superhuman.com/)** — 邮件客户端
- **[Excalidraw](https://excalidraw.com/)** — 在线白板
- **[Apple Notes](https://en.wikipedia.org/wiki/Notes_\(Apple\))** — 苹果备忘录

正如 Martin Kleppmann 所说：

> **"另一台计算机的可用性，永远不应阻止你继续工作。"**

用户可以直接与设备上的本地数据库进行交互，**无需依赖网络连接**。当设备重新联网时，系统会自动在所有活跃的设备实例之间同步数据。这种架构还能支持**实时协作**，类似于 [Figma 的多人协作技术](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)。

如果你想深入了解其底层原理，可以观看 [Martin Kleppmann 的历史概述视频](https://www.youtube.com/watch?v=NMq0vncHJvU)。

---

## 本地优先的优势

### 对用户的优势

应用程序会感觉**极其快速和即时响应**，因为所有交互都直接读写设备本地数据库，**完全绕过了网络延迟**。

此外，本地优先架构天然支持**内置协作功能**：多个用户可以同时或异步编辑同一份数据，变更会自动合并，无需手动处理冲突。

> **基于文档内容推导：** 这意味着即使在飞行模式或网络不稳定的环境中，应用也能正常工作，用户体验不会受到任何影响。

### 对开发者的优势

- **无需处理复杂的网络状态**：开发者不必为每次网络请求都编写"加载中"（loading）、"错误"（error）等 UI 状态管理逻辑。
- **同步自动化**：写入本地数据库后，同步过程由底层框架自动处理，开发者可以专注于核心业务功能。
- **服务器故障不影响用户**：即使后端服务器宕机，用户仍然可以正常使用应用、继续工作。
- **支持点对点同步**：在某些架构下，设备之间可以直接同步数据，完全绕过中央服务器。

---

## 开发挑战

> **警告（早期采用者须知）：** 当前本地优先的工具链仍处于**早期发展阶段**。开发者可能需要自行构建自定义的同步层，或手动管理复杂的多用户权限。在生态系统成熟之前，早期采用者会面临更多的摩擦和困难。

具体来说，挑战包括：

- **同步冲突处理**：多设备同时编辑时，数据冲突的解决策略需要仔细设计。
- **权限管理**：在本地优先架构中实现细粒度的多用户权限控制比传统架构更复杂。
- **工具链不成熟**：许多库和服务仍处于 beta 或早期阶段，文档和社区支持可能不够完善。

---

## 生态系统工具

Expo 社区维护了一个[本地优先工具目录](https://localfirstweb.dev/)。这些工具大致分为三类：**持久化存储**、**状态管理**和**数据同步**。其中同步类别涵盖了数据结构和传输机制。

以下逐一介绍文档中提到的各个工具：

---

### Legend-State

[Legend-State](https://legendapp.com/open-source/state/v3/) 是一个**高性能的状态管理和同步库**，通过细粒度的响应式（fine-grained reactivity）来优化 React 性能，并内置了 Supabase 集成。

它通过 [Async Storage](https://github.com/react-native-async-storage/async-storage?tab=readme-ov-file#react-native-async-storage) 在 React Native 中运行。

使用以下命令可以快速创建一个集成了 Legend-State 和 Supabase 的 Expo 示例项目：

```sh
npx create-expo-app --example with-legend-state-supabase
```

> **说明：** 该命令会从 [Expo 官方示例仓库](https://github.com/expo/examples/tree/master/with-legend-state-supabase) 下载并初始化一个完整的示例项目，包含 Legend-State 状态管理和 Supabase 后端同步的集成配置。

---

### TinyBase

[TinyBase](https://tinybase.org/) 自称是**"为本地优先应用打造的响应式数据存储"**。它可以与 Yjs 和 SQLite 集成，在移动端使用 `expo-sqlite`，在 Web 端使用浏览器的 `localStorage`。

Beto Moedano（[@betomoedano](https://github.com/betomoedano)）通过一个[购物清单应用](https://github.com/betomoedano/groceries-shopping-list-app)演示了 TinyBase 的使用方法，并配有[视频教程](https://www.youtube.com/watch?v=HqOiB2tDM8Q)。

使用以下命令创建 TinyBase 示例项目：

```sh
npx create-expo-app --example with-tinybase
```

> **说明：** 该命令会从 [Expo 官方示例仓库](https://github.com/expo/examples/tree/master/with-tinybase) 下载一个预配置好的 TinyBase 项目，开箱即用。

---

### SQLite

Expo 提供的 [SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) 是一个优秀的**本地持久化存储层**。它可以与 Yjs 或 TinyBase 搭配使用。

但需要注意，SQLite 本身**仅提供本地存储能力**，如果要构建完整的本地优先应用（包含多设备同步），开发者还需要结合其他同步工具来实现完整方案。

> **基于文档内容推导：** SQLite 更适合作为底层存储引擎，而非独立的本地优先解决方案。建议与其他同步层（如 Yjs）配合使用。

---

### Yjs

[Yjs](https://github.com/yjs/yjs) 是一个 **CRDT（Conflict-free Replicated Data Type，无冲突复制数据类型）库**，用于实现跨客户端的数据同步。

使用 Yjs 时，需要使用它提供的特定数据类型（如 `Y.Array`）来替代标准的 JavaScript 数组。Yjs 可以与多种持久化方式配合使用。

在 Expo 生态中，可以通过 [y-expo-sqlite](https://github.com/brentvatne/y-expo-sqlite) 将 Yjs 与 Expo 的 SQLite 集成。

> **说明：** CRDT 是一种特殊的数据结构，它保证多个客户端在并发修改数据时，最终能自动收敛到一致的状态，无需中央协调。这是本地优先应用中解决数据冲突的关键技术。详细了解可参考 [Yjs CRDT 算法文档](https://github.com/yjs/yjs?tab=readme-ov-file#yjs-crdt-algorithm)。

---

### Prisma

[Prisma](https://prisma.io) 是著名的 Node.js ORM，目前已进入 **React Native 早期支持阶段**。它的目标是提供一套完整的方案，涵盖状态管理、数据同步和持久化。

Beto Moedano 构建了一个 [Notion 克隆项目](https://github.com/betomoedano/React-Native-Notion-Clone) 来演示 Prisma 在 React Native 中的能力，并配有[视频教程](https://www.youtube.com/watch?v=uTrPte0sCiw)。

了解更多可参考 [Prisma 官方博客：将 Prisma ORM 引入 React Native 和 Expo](https://www.prisma.io/blog/bringing-prisma-orm-to-react-native-and-expo)。

> **注意：** Prisma 对 React Native 的支持仍处于早期阶段，在生产环境中使用前请充分测试。

---

### Jazz

[Jazz](https://jazz.tools/) 是一个开源的关系型数据库，具备**实时同步**和**行级安全（row-level security）** 功能。它支持自托管，并拥有**一流的 Expo 集成支持**。

相关资源：

- [Jazz 服务器搭建](https://jazz.tools/docs/getting-started/server-setup)
- [Jazz 客户端安装](https://jazz.tools/docs/install/client)
- [Jazz 示例项目](https://github.com/garden-co/jazz/tree/main/examples)

---

### LiveStore

[LiveStore](https://docs.livestore.dev/getting-started/expo/) 是一个以客户端为核心的高性能数据层，**基于 SQLite 构建**。

Expo 官方博客发布了一篇[关于使用 LiveStore 进行本地优先应用开发的文章](https://expo.dev/blog/local-first-application-development-with-livestore)，并配有[视频教程](https://www.youtube.com/watch?v=zQIhJqYU1Qw)。

---

### Turso

[Turso](https://turso.tech) 是一个基于 SQLite 的数据库服务，目前提供了**离线同步功能的公开 Beta 版**。它支持双向同步和冲突检测，但**自动冲突解决功能尚在开发中**。

Beto Moedano 构建了一个[笔记应用](https://github.com/betomoedano/notes-app)来演示 Turso 的使用，并配有[视频教程](https://www.youtube.com/watch?v=SBv32tmyb3k)。

了解更多可参考 [Turso 离线同步公告](https://turso.tech/blog/turso-offline-sync-public-beta)。

> **注意：** Turso 的自动冲突解决功能尚未完成，如果你需要完全自动化的冲突处理，可能需要等待或自行实现相关逻辑。

---

### Instant

[Instant](https://www.instantdb.com/) 是一个 Firebase 的替代方案，提供**实时数据库**功能。

开发者可以通过一个[协作绘画应用](https://github.com/betomoedano/sketch-app)来了解它的实际效果，并配有[视频教程](https://www.youtube.com/watch?v=DEJIcaGN3vY)。

快速开始可参考 [Instant React Native 入门](https://www.instantdb.com/docs/start-rn)。

---

### RxDB

[RxDB](https://rxdb.info/) 是一个面向 JavaScript 的**响应式 NoSQL 数据库**。它的核心特点是：通过查询订阅（query subscription）机制，当数据变化时**自动更新 UI**。

在 Expo 中，RxDB 使用 [SQLite 适配器](https://rxdb.info/rx-storage-sqlite.html#usage-with-expo-sqlite)，并支持多种后端复制（replication）插件。

---

### 其他工具

文档中还提到了以下值得关注的工具：

| 工具 | 说明 |
|------|------|
| [Automerge](https://automerge.org/) | CRDT 库，专注于自动合并冲突 |
| [ElectricSQL](https://electric-sql.com/) | 将 PostgreSQL 与本地 SQLite 同步 |
| [PowerSync](https://www.powersync.com/) | 提供后端到前端的实时同步方案 |

---

## 进阶学习资源

如果你想更深入地了解本地优先的理念和实践，以下资源值得探索：

| 资源 | 说明 |
|------|------|
| [Martin Kleppmann 历史概述视频](https://www.youtube.com/watch?v=NMq0vncHJvU) | 深入讲解本地优先的历史和原理 |
| [Ink & Switch 原始论文](https://www.inkandswitch.com/local-first/) | 本地优先概念的起源论文 |
| [本地优先 Web 工具目录](https://localfirstweb.dev/) | 社区维护的工具和库列表 |
| [localfirst.fm 播客](https://localfirst.fm/) | 专门讨论本地优先技术的播客 |
| [Expo Meetup 播放列表](https://www.youtube.com/playlist?list=PLTbD2QA-VMnXFsLbuPGz1H-Najv9MD2-H) | Expo 社区聚会的相关视频合集 |

---

## 文档导航

- **上一页**：[store assets](./159__store-assets.md)
- **下一页**：[keyboard handling](./161__keyboard-handling.md)
