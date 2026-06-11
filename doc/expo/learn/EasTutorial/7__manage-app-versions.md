# Expo EAS 应用版本管理学习文档

> 原文标题：Manage different app versions  
> 文档更新时间：2026 年 5 月 18 日  
> 适用读者：使用 EAS Build 构建 Android/iOS 应用，尤其是准备发布生产版本的开发者

## 文档解决的问题

移动应用的版本号并不是单一值，而是由两类版本值组成：

- 展示给用户的版本号
- 标识每次构建的内部版本号

Google Play 和 Apple App Store 要求每个提交的构建具有唯一的内部版本号。重复提交相同内部版本号会导致提交失败。

本文主要说明：

1. 两类版本值分别是什么。
2. Android 与 iOS 使用哪些字段。
3. EAS Build 如何自动递增内部版本号。
4. 已发布应用迁移到 EAS Build 时，如何同步已有版本号。

本文是后续创建 Android/iOS 生产构建之前的准备内容。

---

## 阅读前需要理解的背景知识

### 什么是 EAS Build

EAS Build 是 Expo 提供的云端应用构建服务，可以将 React Native/Expo 项目构建成可提交到应用商店的 Android 或 iOS 安装包。

对于 React Web 开发者，可以将它近似理解为：

- Web 项目通过 CI 服务执行 `npm run build`，产生网站静态资源。
- Expo 项目通过 EAS Build 生成 Android/iOS 原生安装包。

区别在于，移动应用商店会严格检查每个安装包的内部版本号。

### 为什么移动应用需要两种版本值

一个应用版本由两个值组成。例如：

```text
1.0.0 (1)
```

其中：

- `1.0.0`：用户可见版本号
- `1`：开发者使用的内部构建版本号

这类似于同时维护：

- 面向产品和用户的版本名称
- 面向发布系统的构建序号

同一个用户可见版本可以经过多次构建，但每次构建的内部版本号必须不同。

---

## 两类应用版本

### 用户可见版本

用户可见版本由 Expo 配置中的 `version` 表示。

```js
{
  version: '1.0.0'
}
```

它通常采用类似语义化版本的形式：

```text
1.0.0
1.1.0
2.0.0
```

这是用户在应用商店或应用信息中看到的版本。

### 开发者使用的内部版本

不同平台使用不同字段：

| 平台 | Expo 配置字段 | 典型值 | 作用 |
| --- | --- | ---: | --- |
| Android | `android.versionCode` | `1` | 唯一标识 Android 构建 |
| iOS | `ios.buildNumber` | `1` | 唯一标识 iOS 构建 |

手动配置时，结构类似：

```js
{
  ios: {
    buildNumber: '1'
  },
  android: {
    versionCode: 1
  }
}
```

原文示例主要用于展示字段位置，并不要求开发者手动添加或维护这些值。按照本文介绍的配置，EAS Build 会自动管理它们。

> 原文示例将 `buildNumber` 写成数字 `1`，但本文没有系统说明这些字段的数据类型、格式范围或平台限制。相关细节属于“当前文档未涉及”。

---

## 应用商店为什么要求内部版本唯一

Google Play 和 Apple App Store 使用开发者内部版本值识别每一个构建。

假设已经上传：

```text
1.0.0 (1)
```

再次上传具有相同版本组合的构建时，应用商店会拒绝该提交。

因此，即使只是修复构建配置、重新打包，而没有修改面向用户的 `1.0.0`，新的构建仍然需要增加内部版本号，例如：

```text
1.0.0 (1)
1.0.0 (2)
```

这里第二次构建的用户可见版本仍是 `1.0.0`，但内部构建版本已变为 `2`。

> **文档明确说明：**重复的应用版本号会导致应用商店提交失败。

> **基于文档内容推导：**内部版本号用于区分“构建产物”，不应被理解为产品版本名称。一次重新构建也可能需要新的内部版本号。

---

## EAS Build 自动管理内部版本号

### 默认配置

使用以下命令初始化 EAS 项目时：

```sh
eas init
```

EAS CLI 会在 `eas.json` 中添加两个关键配置：

```json
{
  "cli": {
    "appVersionSource": "remote"
  },
  "build": {
    "production": {
      "autoIncrement": true
    }
  }
}
```

### `cli.appVersionSource`

```json
{
  "cli": {
    "appVersionSource": "remote"
  }
}
```

设置为 `remote` 表示开发者内部版本号由 EAS 远程管理，而不是完全依赖项目本地配置。

开发影响：

- EAS 远程保存当前内部版本。
- 后续生产构建可以基于远程值继续递增。
- 团队不需要仅依靠修改和提交本地 `app.config.js` 来维护构建序号。

> **基于文档内容推导：**远程版本源有助于降低多人开发时手动维护版本号产生冲突的风险。但本文没有说明并发构建、离线构建或远程状态冲突的具体处理方式。

### `build.production.autoIncrement`

```json
{
  "build": {
    "production": {
      "autoIncrement": true
    }
  }
}
```

该配置表示：使用 `production` 构建配置创建新生产构建时，自动递增开发者内部版本。

递增对象分别是：

- Android：`versionCode`
- iOS：`buildNumber`

需要注意，`autoIncrement` 位于 `build.production` 中，因此本文讨论的是生产构建配置。

> 当前文档未说明其他构建配置（例如开发或预览构建）是否应该启用自动递增，也未说明它们与生产版本之间如何协调。

---

## 新项目的版本管理流程

对于通过 `eas init` 初始化、尚未发布的新项目，流程如下：

1. 执行 `eas init` 初始化 EAS 配置。
2. 检查 `eas.json` 中的版本来源：

```json
"appVersionSource": "remote"
```

3. 检查生产构建是否启用自动递增：

```json
"autoIncrement": true
```

4. 创建新的生产构建。
5. EAS Build 自动递增对应平台的内部版本号。

Android 和 iOS 的自动递增分别独立作用于各自的平台字段。

原文没有在本章提供创建生产构建的具体命令，而是将其留到后续章节。

---

## 已发布应用迁移到 EAS Build

### 为什么需要先同步

已经发布到应用商店的应用通常已经存在内部版本号。

如果直接让新的 EAS 环境从错误的初始值开始计数，就可能生成与历史构建重复或更小的版本号，从而导致商店拒绝提交。

因此，迁移前需要把应用商店中已经使用的最后一个内部版本同步到 EAS。

### 同步步骤

运行：

```sh
eas build:version:set
```

然后按照命令行提示操作。

#### 1. 选择平台

选择要同步的平台：

- Android
- iOS

该命令一次提示选择一个平台。原文没有说明能否在一次执行中同时设置两个平台。

#### 2. 将版本来源设置为远程

出现以下提示时：

```text
Do you want to set app version source to remote now?
```

选择：

```text
yes
```

这会在 `eas.json` 中设置：

```json
{
  "cli": {
    "appVersionSource": "remote"
  }
}
```

#### 3. 输入当前已使用的最后版本号

出现以下提示时：

```text
What version would you like to initialize it with?
```

输入应用商店中已经设置的最后一个开发者内部版本号。

这里应输入：

- Android 已使用的最后一个 `versionCode`
- 或 iOS 已使用的最后一个 `buildNumber`

不要把用户看到的 `1.0.0` 当作这里要求的内部版本号。

#### 4. 开启自动递增

确认 `eas.json` 的生产配置包含：

```json
{
  "build": {
    "production": {
      "autoIncrement": true
    }
  }
}
```

完成后，下一次生产构建会从已同步的版本基础上自动递增。

### 迁移示例

假设 Android 商店中最后发布的内部版本是：

```text
versionCode = 27
```

执行 `eas build:version:set` 时，将远程版本初始化为 `27`。之后启用自动递增并创建新的生产构建，新的内部版本应从该值继续递增。

> **基于文档内容推导：**按照文档描述，下一次构建应使用递增后的值，而不是再次使用初始化值。但本文没有说明具体递增步长或特殊配置行为。

---

## 用户可见版本不会由 EAS 自动管理

原文明确定义用户可见版本由 `version` 表示，同时强调 EAS 不负责管理用户可见版本。

开发者仍需要自行决定何时将版本从：

```text
1.0.0
```

升级为：

```text
1.1.0
```

### 原文中的表述需要注意

原文一处将用户可见版本描述为 `app.config.js` 中的 `version`，另一处又说明需要在应用商店开发者门户中定义该版本。

仅根据当前文档，无法确定：

- 项目配置与商店门户中的版本应如何同步。
- 哪一处是最终来源。
- Android 与 iOS 是否具有不同操作方式。

因此，本学习文档不对该关系作额外推断。可以确定的是：

> EAS 的自动递增能力针对 `versionCode` 和 `buildNumber`，不负责自动升级用户可见的 `version`。

---

## 配置、命令与文件速查

| 内容 | 作用 |
| --- | --- |
| `app.config.js` | Expo 应用配置文件；本文用它展示应用版本字段 |
| `version` | 用户可见版本 |
| `android.versionCode` | Android 开发者内部版本 |
| `ios.buildNumber` | iOS 开发者内部版本 |
| `eas.json` | EAS CLI 和不同构建环境的配置文件 |
| `cli.appVersionSource` | 指定应用内部版本号的来源 |
| `"appVersionSource": "remote"` | 使用 EAS 远程版本源 |
| `build.production.autoIncrement` | 控制生产构建是否自动递增内部版本 |
| `eas init` | 初始化项目的 EAS 配置 |
| `eas build:version:set` | 设置或同步 EAS 远程内部版本号 |

---

## 注意事项与容易踩坑的地方

### 不要混淆 `version` 和内部版本号

以下字段用途不同：

```text
version                 用户和产品层面的版本
android.versionCode     Android 构建标识
ios.buildNumber         iOS 构建标识
```

执行版本同步命令时，需要输入商店中最后使用的内部版本，而不是 `1.0.0` 这样的用户可见版本。

### 重复内部版本会导致提交失败

内部版本号并非无关紧要的构建元数据。应用商店会使用它判断构建是否唯一。

重新打包同一个产品版本时，也必须避免复用已有内部版本。

### 已发布应用不能忽略初始同步

新项目可以直接使用 EAS 的默认远程管理机制，但已有应用必须先把商店中的最后版本同步到 EAS。

同步时输入错误值，可能导致后续构建版本与商店历史记录不连续或重复。

### 自动递增针对生产配置

本文展示的是：

```json
build.production.autoIncrement
```

不能仅凭本文认定所有 EAS 构建都会自动递增。是否生效与实际使用的构建配置有关。

### Android 和 iOS 使用不同字段

即使它们都用于标识构建，也不能把二者视为同一个跨平台版本字段：

- Android 使用 `versionCode`
- iOS 使用 `buildNumber`

已有应用迁移时，应分别核对两个平台当前使用的值。

### 不要同时手动维护与远程管理而不明确来源

文档推荐使用：

```json
"appVersionSource": "remote"
```

在此模式下，EAS 远程状态承担版本管理职责。不要仅通过查看本地 `app.config.js` 就判断下一次构建会使用哪个内部版本。

> **基于文档内容推导：**团队发布流程应明确以 EAS 远程版本为准，避免成员误以为本地配置中的数字一定代表下一次生产构建版本。

---

## React Web 开发者需要特别注意的地方

### 移动应用发布不是覆盖式部署

Web 应用通常可以将新文件直接部署到同一个站点地址。应用商店发布则需要上传一个新的、可唯一识别的安装包。

因此，每次提交都涉及构建身份，而不仅是代码内容是否变化。

### `versionCode` 和 `buildNumber` 不等于 `package.json` 版本

本文没有提到 `package.json` 的 `version`，也没有说明它会参与应用商店版本管理。

不要默认修改：

```json
{
  "version": "1.0.0"
}
```

就会自动更新 Android 或 iOS 的商店构建版本。

### `eas.json` 类似构建平台配置

React Web 开发者可以把 `eas.json` 理解为 EAS 的构建配置入口，作用上类似 CI 配置文件，但它面向 Android/iOS 构建流程。

其中：

```json
build.production
```

表示名为 `production` 的构建配置，而不是 JavaScript 代码中的运行时环境对象。

### 远程版本是构建服务状态

Web 项目常将版本信息完全保存在 Git 仓库中。本文所述模式会把内部版本号交给 EAS 远程管理，所以仓库中的文件不一定包含完整的当前构建序号状态。

---

## 实际开发中的使用方式

### 新应用

1. 使用 `eas init` 初始化项目。
2. 检查 `eas.json` 是否启用了远程版本源和生产自动递增。
3. 自行维护用户可见的 `version`。
4. 让 EAS Build 管理 Android 和 iOS 的内部构建版本。
5. 在每次提交商店前确认使用的是正确的生产构建配置。

### 已发布应用

1. 分别查询 Android 和 iOS 商店中最后使用的内部版本号。
2. 对相应平台运行 `eas build:version:set`。
3. 将版本来源设置为 `remote`。
4. 输入该平台最后使用的内部版本。
5. 在生产构建配置中启用 `autoIncrement`。
6. 再创建新的生产构建。

### 基于经验建议

- 在团队发布文档中分别记录用户可见版本和内部版本，避免混用。
- 迁移已有应用时，应先核对商店记录，再执行版本初始化。
- 将 `eas.json` 纳入代码审查，避免误删 `appVersionSource` 或 `autoIncrement`。
- 发布前检查实际使用的 EAS 构建配置是否为 `production`。

以上属于工程实践建议，不是当前原文档明确规定的步骤。

---

## 当前文档未涉及的内容

本文没有说明以下内容：

- 如何创建具体的 Android 或 iOS 生产构建。
- 用户可见版本应在什么时机升级。
- `versionCode` 和 `buildNumber` 的完整格式及范围限制。
- 如何查看 EAS 当前保存的远程版本。
- 如何降低或回滚远程版本号。
- 多人同时发起构建时如何处理版本递增。
- 非生产构建是否应该自动递增。
- 本地原生工程与 Expo 配置之间的版本同步规则。
- `package.json` 版本与应用版本的关系。
- 应用商店门户与 `app.config.js` 中用户可见版本的具体同步机制。

这些问题需要查阅 Expo 的完整应用版本文档或后续生产构建章节，不能仅根据本文得出结论。

---

## 总结

移动应用需要同时管理用户可见版本和开发者内部版本：

```text
用户可见版本：version
Android 内部版本：versionCode
iOS 内部版本：buildNumber
```

应用商店要求每个构建具有唯一的内部版本号，重复版本会导致提交失败。

EAS Build 通过以下配置远程管理并自动递增生产构建的内部版本：

```json
{
  "cli": {
    "appVersionSource": "remote"
  },
  "build": {
    "production": {
      "autoIncrement": true
    }
  }
}
```

对于已经发布的应用，必须先使用：

```sh
eas build:version:set
```

将应用商店中最后使用的内部版本同步到 EAS，再开启自动递增。EAS 不会自动替开发者决定或升级用户可见版本。

<!-- NAVIGATION START -->
---
[← 上一页：创建并分享内部发布构建（Internal Distribution Build）](./6__internal-distribution-builds.md) | [下一页：使用 EAS 创建并发布 Android 生产构建 →](./8__android-production-build.md)
<!-- NAVIGATION END -->
