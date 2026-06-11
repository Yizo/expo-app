# 从 GitHub 仓库触发 EAS Build

> 原文标题：Trigger builds from a GitHub repository  
> 文档更新日期：2026 年 3 月 9 日

## 文档解决的问题

本文介绍如何把 GitHub 仓库连接到 Expo/EAS，并通过 GitHub Pull Request（PR）标签自动触发 Android 和 iOS 构建。

完成配置后，开发团队可以通过以下方式触发 EAS Build：

- 在 EAS 的 Builds 页面手动触发指定平台的构建。
- 向 GitHub 仓库推送代码时自动构建。
- 给 GitHub PR 添加特定标签时自动构建。

原文重点演示第三种方式：使用 `eas-build-all:development` 标签，同时触发 Android 和 iOS 的 `development` 构建。

## 适用场景

这套流程适合：

- Expo 项目已经托管在 GitHub。
- 项目已经在 EAS 中创建。
- 团队希望将移动应用构建纳入 GitHub 协作流程。
- 希望在 PR 阶段生成可安装的开发版本，用于测试或评审。
- 不希望每次都由开发者在本地手动执行构建命令。

当前文档未涉及：

- 如何首次创建 Expo 项目。
- 如何初始化 EAS 项目。
- 如何编写完整的 `eas.json`。
- 如何配置 GitHub push 自动构建。
- 如何配置生产环境发布。
- 构建完成后如何安装、分发或提交应用商店。
- GitHub App 的权限范围和安全审计方法。
- 构建失败的故障排查流程。
- GitHub Actions 的配置方法。

## 阅读前需要理解的概念

### Expo 与 EAS

Expo 是一套用于开发 React Native 应用的工具和服务。

EAS（Expo Application Services）是 Expo 提供的云服务集合。本文涉及的 **EAS Build** 可以在云端将项目构建成 Android 或 iOS 应用。

对于 React Web 开发者，可以作如下类比：

| 移动端概念 | React Web 中的近似概念 |
|---|---|
| Expo 项目 | React Web 项目 |
| EAS Build | 云端 CI 构建 |
| Android/iOS 构建产物 | Web 项目的部署产物 |
| `eas.json` | CI 配置与构建环境配置文件 |
| build profile | 一组具名的构建配置 |
| Expo GitHub App | GitHub 与外部 CI 平台之间的集成应用 |

这只是帮助理解的类比。移动端构建需要分别处理 Android 和 iOS 平台，并产生可安装的原生应用，而不是浏览器直接加载的静态资源。

### Expo GitHub App

Expo GitHub App 是安装在 GitHub 账户或组织中的 GitHub 应用。它负责：

1. 访问被授权的 GitHub 仓库。
2. 识别代码推送、PR 标签等事件。
3. 将符合条件的事件发送给 EAS。
4. 由 EAS 根据项目配置启动构建。

安装 GitHub App 与连接项目仓库是两个不同步骤：

- **安装并关联 GitHub App**：建立 GitHub 账户与 Expo 账户之间的联系。
- **连接仓库和 EAS 项目**：指定某个 EAS 项目使用哪个 GitHub 仓库。

只完成前一步，并不等于具体项目已经连接到仓库。

### Build profile

Build profile 是 `eas.json` 中一组有名称的构建配置。例如：

```json
{
  "build": {
    "development": {}
  }
}
```

这里的 `development` 就是 profile 名称。

同一个项目可以设置多个 profile，例如开发、预览或生产配置。本文只使用 `development`，没有说明其他 profile 的具体配置。

### Development build

Development build 是用于开发和测试的原生应用构建。它不是普通 React Web 项目中的开发服务器页面，而是需要经过 Android 或 iOS 构建流程生成的应用。

本文假定项目已经存在可用的 `development` profile，但没有解释如何完整配置 development build。

### GitHub PR 标签

PR 标签通常用于分类 Pull Request，例如 `bug` 或 `feature`。Expo GitHub App 还会识别符合特定命名规则的标签，并据此触发构建。

本文使用：

```text
eas-build-all:development
```

根据文档中的实际行为：

- `eas-build`：表示请求 EAS Build。
- `all`：触发 Android 和 iOS 两个平台。
- `development`：使用 `eas.json` 中的 `development` profile。

上述拆分是**基于文档内容推导**。当前文档只直接展示了完整标签及其结果，没有逐段定义标签语法。

## 配置流程

整个流程分为四部分：

1. 将 GitHub 账户连接到 Expo。
2. 将 GitHub 仓库连接到具体 EAS 项目。
3. 确认项目源码所在目录。
4. 配置 `eas.json`，然后通过 PR 标签触发构建。

---

## 第一步：连接 Expo GitHub App

进入 EAS Dashboard 的连接设置：

```text
expo.dev/settings#connections
```

然后执行以下操作：

1. 找到 **Connections > GitHub**。
2. 点击 **Connect**。
3. 在打开的连接页面点击 **Get started**。
4. 在 GitHub 授权弹窗中点击 **Install and Authorize**。
5. 安装完成后，在下一个弹窗中点击 **Link installation**。
6. 确认 GitHub 安装信息已经显示在 Expo 设置的 GitHub 区域。

### 两次操作的区别

`Install and Authorize` 和 `Link installation` 不是重复操作：

- `Install and Authorize`：在 GitHub 一侧安装并授权 Expo GitHub App。
- `Link installation`：在 Expo 一侧把这次 GitHub App 安装关联到当前 Expo 账户。

如果只安装 GitHub App，却没有完成关联，Expo 账户可能无法使用该安装。

## 第二步：连接 GitHub 仓库

在 EAS Dashboard 中进入：

```text
Projects
→ 选择项目
→ Project settings
→ GitHub
```

在 **Connect a GitHub repository** 区域中：

1. 从仓库列表中查找正确的 GitHub 仓库。
2. 点击对应仓库的 **Connect**。

原文示例项目使用的仓库名称是 `sticker-smash`。

### 容易误解的地方

这里连接的是：

```text
一个 EAS 项目 ↔ 一个 GitHub 仓库
```

它不是创建 Git 仓库，也不是执行 `git remote add`。代码仍然由 GitHub 托管，EAS 只是获得从该仓库读取项目并触发构建的能力。

## 第三步：确认源码目录

Expo GitHub App 必须知道项目源码位于仓库的哪个目录。

默认目录是：

```text
/
```

`/` 表示 GitHub 仓库根目录。原文示例的 Expo 项目就在仓库根目录，因此可以保留默认值。

例如，下面的结构适合使用 `/`：

```text
repository/
├── app.json
├── eas.json
├── package.json
└── src/
```

如果源码不在根目录，是否以及如何修改目录取决于 EAS Dashboard 提供的仓库设置。当前文档没有给出 monorepo 或子目录项目的具体配置方法。

**基于文档内容推导：**如果实际源码位于子目录，却仍将 `/` 作为项目目录，EAS 可能无法在预期位置找到 `eas.json`、`package.json` 或其他项目文件。

## 第四步：配置构建镜像

打开项目根目录中的 `eas.json`，在 `development` profile 下分别配置 Android 和 iOS 的构建镜像：

```json
{
  "build": {
    "development": {
      "android": {
        "image": "latest"
      },
      "ios": {
        "image": "latest"
      }
    }
  }
}
```

原文代码中包含 `...`，用于表示文件中可能存在其他配置。`...` 不是合法 JSON，不能原样写入真实的 `eas.json`。

### 配置项说明

#### `build`

所有 EAS Build profile 的容器。

#### `development`

本文用于开发构建的 profile 名称。后面的 PR 标签会通过同名的 `development` 指定它。

因此这两个位置必须对应：

```text
eas.json profile：development
PR 标签：eas-build-all:development
```

#### `android.image`

指定 Android 构建使用的 EAS Build 镜像。

构建镜像可以理解为云端构建机预装的软件环境，其中包含构建 Android 应用需要的工具链。

本文要求设置为：

```json
"image": "latest"
```

#### `ios.image`

指定 iOS 构建使用的 EAS Build 镜像。

iOS 构建需要 Apple 相关工具链。EAS 在云端提供相应构建环境，因此 React Web 开发者不需要把它理解为浏览器构建参数。

本文同样要求设置为：

```json
"image": "latest"
```

#### `latest`

表示使用 EAS 当前提供的最新构建镜像。

当前文档没有说明：

- `latest` 会解析成哪个具体镜像版本。
- 镜像更新频率。
- 如何锁定固定镜像版本。
- 更新镜像可能带来的兼容性影响。

## 通过 PR 标签触发构建

完成前面的账户、仓库和 `eas.json` 配置后：

1. 创建名为 `dev` 的新分支。
2. 修改应用中的 JavaScript 代码。
3. 提交修改。
4. 将 `dev` 分支推送到 GitHub。
5. 使用该分支创建 Pull Request。
6. 在 PR 的 **Labels** 区域创建并添加以下标签：

```text
eas-build-all:development
```

7. 点击 **Create pull request**。
8. Expo GitHub App 开始创建 development build。
9. 前往 EAS Dashboard 的 **Builds** 页面检查构建状态。

该标签会为两个平台触发构建：

```text
GitHub PR
    │
    ├── Android development build
    └── iOS development build
```

进入任意一条构建详情后，可以在 **Created by** 字段中确认该构建由 GitHub App 创建。

## 如何确认流程成功

至少检查以下三点：

1. **Builds 页面出现两条构建记录**  
   分别对应 Android 和 iOS。

2. **构建使用 development profile**  
   这是 PR 标签中 `development` 所指定的 profile。

3. **Created by 显示 GitHub App**  
   证明构建来自 GitHub 集成，而不是开发者手动触发。

当前文档只说明如何验证“构建已经触发”，没有说明如何判断最终产物是否可正确安装和运行。

## 其他触发方式

文档明确列出了三种触发方式：

| 方式 | 触发位置或事件 | 本文是否详细配置 |
|---|---|---|
| 手动构建 | EAS Builds 页面，为指定平台触发 | 否 |
| push 自动构建 | 新代码推送到仓库 | 否 |
| PR 标签自动构建 | PR 添加特定 EAS 标签 | 是 |

因此，不应根据本文自行推断 push 自动构建的具体规则或配置格式。需要使用 Expo GitHub 构建功能的完整文档确认。

## 注意事项与限制

### `...` 不能出现在 JSON 文件中

原文示例：

```json
{
  "build": {
    "development": {
      ...
    }
  }
  ...
}
```

其中的 `...` 只是省略标记。真实 JSON 文件不允许使用这种语法。

### profile 名称必须匹配

PR 标签中的 `development` 对应 `eas.json` 中：

```json
"build": {
  "development": {}
}
```

**基于文档内容推导：**如果名称拼写不一致，GitHub App 将无法按示例找到目标 profile，构建可能无法正常触发。

### `all` 会触发两次平台构建

`eas-build-all:development` 会同时触发 Android 和 iOS 构建。这不是“一次构建生成两个平台”，而是平台各自执行独立构建。

**基于文档内容推导：**使用该标签前，应确认团队确实需要同时构建两个平台，因为它会产生两条构建任务。

### 仓库根目录不是固定要求

`/` 只是默认源码目录。示例可以使用它，是因为示例项目正好位于仓库根目录。

React Web 项目的 monorepo 经常把应用放在 `apps/mobile` 等子目录中。不能因为文档使用 `/`，就认为所有项目都应保留该设置。

### 创建标签与添加标签

原文要求在 PR 的 **Labels** 区域创建名为 `eas-build-all:development` 的标签。

在实际 GitHub 仓库中，创建新标签通常需要相应仓库权限。当前文档没有说明所需权限等级，也没有说明标签已经存在时的操作差异。

### `latest` 不是固定环境

从名称上看，`latest` 指向最新构建镜像，而不是固定版本。

**基于文档内容推导：**它便于跟随 EAS 当前环境，但构建工具链可能随镜像更新而变化。当前文档要求使用 `latest`，却没有讨论构建可复现性问题，因此不能仅根据本文决定生产项目是否也应使用它。

### 文档没有覆盖凭证配置

Android 和 iOS 原生构建通常涉及签名凭证，但本文没有介绍相关配置。

不能由本文得出“连接 GitHub 后不再需要签名配置”的结论。本文只讨论如何触发构建。

## React Web 开发者最容易误解的地方

### EAS Build 不等于 `npm run build`

React Web 的构建通常输出 HTML、CSS 和 JavaScript 文件。EAS Build 则需要为 Android 或 iOS 执行各自的原生构建流程。

即使业务代码主要使用 JavaScript 或 TypeScript，最终仍要进入平台相关的构建环境。

### GitHub App 不等于 GitHub Actions

本文没有创建：

```text
.github/workflows/*.yml
```

构建触发逻辑由 Expo GitHub App 和 EAS 管理，而不是由仓库中的 GitHub Actions workflow 管理。

### iOS 和 Android 是两个独立目标

移动应用不是构建一次就自然得到所有平台产物。本文明确要求分别设置：

```json
"android": {
  "image": "latest"
},
"ios": {
  "image": "latest"
}
```

EAS Dashboard 中也会显示两个独立构建。

### PR 标签具有自动化语义

`eas-build-all:development` 不只是用于分类的普通文本。Expo GitHub App 会识别它并触发实际的云端构建任务。

因此，添加标签属于会产生外部操作的行为，不应把它当作无副作用的 PR 整理动作。

### PR 中的代码必须已经推送

流程要求先：

```text
创建分支 → 修改代码 → commit → push → 创建 PR
```

EAS 从已连接的 GitHub 仓库读取源码，无法获取开发者本地尚未提交或尚未推送的修改。

## 实际开发中的使用方式

### 推荐团队流程

以下为**基于文档内容推导**的典型使用方式：

```text
开发者创建功能分支
        ↓
提交并推送代码
        ↓
创建 Pull Request
        ↓
需要移动端测试时添加 eas-build-all:development
        ↓
EAS 分别构建 Android 和 iOS
        ↓
团队在 EAS Dashboard 检查构建
```

这样可以让构建请求与 PR 绑定，便于追踪某个移动端构建对应哪次代码变更。

### 基于经验建议：控制触发条件

不要无条件给所有 PR 添加双平台构建标签。可以只在以下情况下触发：

- 功能进入集成测试阶段。
- 修改涉及原生依赖或平台行为。
- 测试人员需要安装包。
- 需要同时验证 Android 和 iOS。

这是成本和队列管理建议，并非当前文档明确要求。

### 基于经验建议：记录 profile 用途

团队应在项目文档中说明 `development` profile 的用途，包括：

- 谁使用该构建。
- 是否包含开发工具。
- 是否允许分发给测试人员。
- 与预览或生产构建有何区别。

当前文档只使用了 `development` 名称，没有定义团队层面的使用规范。

## 明确内容与推导内容的边界

### 文档明确说明

- Expo GitHub App 可以从 GitHub 项目触发 EAS Build。
- 支持手动、代码 push 和 PR 标签等触发方式。
- 必须先连接 GitHub 账户与 Expo 账户。
- GitHub App 安装后还需要执行 **Link installation**。
- 必须把正确的 GitHub 仓库连接到 EAS 项目。
- 默认项目源码目录为 `/`。
- 示例项目源码位于仓库根目录。
- `development` profile 需要为 Android 和 iOS 设置 `"image": "latest"`。
- PR 标签为 `eas-build-all:development`。
- 该标签会触发 Android 和 iOS development build。
- 可以在 EAS Builds 页面验证两条构建记录。
- 构建详情的 **Created by** 可以确认构建由 GitHub App 创建。

### 基于文档内容推导

- 标签中的 `all` 表示 Android 和 iOS 两个平台。
- 标签中的 `development` 与同名 build profile 对应。
- profile 名称不匹配可能导致触发失败。
- 源码目录设置错误可能导致 EAS 找不到项目文件。
- 双平台构建实际上是两个独立构建任务。
- `latest` 不是固定的工具链环境。
- PR 标签是带有自动化副作用的操作。
- EAS 只能构建已经提交并推送到 GitHub 的代码。

## 总结

本文建立的是一条 GitHub PR 到 EAS Build 的自动化链路：

```text
连接 GitHub 账户
→ 关联 Expo GitHub App
→ 连接具体仓库与 EAS 项目
→ 确认源码目录
→ 配置 eas.json 的平台构建镜像
→ 创建 PR 并添加 eas-build-all:development
→ 在 EAS Dashboard 验证 Android 和 iOS 构建
```

对 React Web 开发者而言，最重要的是区分三层配置：

1. **账户层**：GitHub App 是否已安装并关联 Expo 账户。
2. **项目层**：GitHub 仓库是否已连接到正确的 EAS 项目，源码目录是否正确。
3. **构建层**：`eas.json` 是否存在对应 profile，PR 标签是否指向该 profile。

本文只解决“如何从 GitHub 触发构建”，并不覆盖项目初始化、签名凭证、构建产物分发、应用商店提交或构建故障排查。

<!-- NAVIGATION START -->
---
[← 上一页：使用 EAS Update 与团队共享应用预览](./10__team-development.md) | [下一页：EAS 教程完成后的下一步 →](./12__next-steps.md)
<!-- NAVIGATION END -->
