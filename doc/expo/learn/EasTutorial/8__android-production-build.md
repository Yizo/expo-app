# 使用 EAS 创建并发布 Android 生产构建

> 原文标题：Create a production build for Android  
> 文档修改日期：2026 年 5 月 18 日  
> 本文严格基于用户提供的 Expo 文档内容整理。

## 文档解决的问题

这篇教程介绍如何完成 Android 应用从“可发布构建”到“进入 Google Play”的完整流程：

1. 使用 EAS Build 生成 Android 生产构建。
2. 在 Google Play Console 创建应用。
3. 手动上传构建并发布内部测试版本。
4. 将测试版本推进到更高测试轨道或生产轨道。
5. 配置 Google Service Account，通过 EAS Submit 自动提交。
6. 使用 `--auto-submit` 将构建和提交合并为一个命令。

它适合以下场景：

- Expo/React Native 项目第一次发布 Android 应用。
- 先通过内部测试分发给团队成员。
- 将已经测试过的构建提交到生产轨道。
- 自动化后续版本的构建和发布。

当前文档未涉及：

- React Native 应用功能开发。
- Android 原生工程代码修改。
- Google Play 审核规则的完整说明。
- 应用被拒审后的故障排查。
- iOS 发布流程。
- CI/CD 平台的具体配置。

---

## React Web 开发者需要先理解的背景

### EAS 是什么

EAS 是 Expo Application Services。本文主要使用其中两项能力：

| 能力 | 作用 |
|---|---|
| EAS Build | 将项目构建成可提交到应用商店的 Android 二进制文件 |
| EAS Submit | 将构建结果提交到 Google Play 对应的发布轨道 |

对于 React Web 开发者，可以把它们粗略类比为：

- `eas build`：类似执行生产打包，但结果不是网站静态资源，而是 Android 应用包。
- `eas submit`：类似将构建产物上传到托管平台，不过目标是 Google Play Console。
- Google Play Console：类似部署后台、版本管理系统和审核平台的组合。

需要注意的是，移动应用发布后不能像 Web 应用那样立即覆盖线上静态文件。每次发布都对应一个新的应用版本，并可能经过测试、商店审核和用户更新。

### `.aab` 与 `.apk`

本文生成的是 `.aab` 文件。

| 格式 | 本文说明 |
|---|---|
| `.aab` | Android 生产构建格式，针对 Google Play 分发进行了优化 |
| `.apk` | Android 安装包格式，本文仅用于与 `.aab` 对比 |

文档明确指出：

> `.aab` 只能通过 Google Play Store 分发和安装，不能像 `.apk` 那样直接分发安装。

因此，下载到本地的 `.aab` 不是给测试人员直接点击安装的文件。需要先上传到 Google Play，再由测试人员通过测试邀请进行安装。

---

## 发布前提

### 1. Google Play Developer 账号

必须拥有付费的 Google Play Developer 账号。

这是创建 Play Store 应用、配置测试轨道和发布正式版本的前提。

### 2. `eas.json` 中存在 `production` 构建配置

项目需要在 `eas.json` 中包含 `production` build profile。文档说明该配置默认会被添加。

`eas.json` 是 EAS 的项目配置文件，用于定义：

- 如何构建应用；
- 如何提交应用；
- 不同环境或发布用途使用什么参数。

本文分别使用了两个名为 `production` 的配置：

- `build.production`：控制生产构建；
- `submit.production`：控制生产构建提交到哪里。

它们名称相同，但属于不同配置区域，作用不能混淆。

### 3. Google Service Account 密钥，可选

只有自动化发布时才需要：

- Google Service Account 邮箱；
- 对应的 JSON 密钥文件。

如果只是第一次手动下载 `.aab` 并上传到 Google Play Console，可以暂时不配置。

Service Account 可以理解为供 EAS 使用的“机器账号”。EAS 使用其凭据代表你访问 Google Play，并执行上传操作。

---

## 第一阶段：创建 Android 生产构建

在项目目录运行：

```sh
eas build --platform android
```

参数含义：

| 参数 | 含义 |
|---|---|
| `eas build` | 请求 EAS 构建应用 |
| `--platform android` | 指定构建 Android 版本 |

文档说明，`production` 是 EAS 配置中的默认 profile，因此这里不需要显式添加：

```sh
--profile production
```

命令执行后，构建任务会进入队列。可以在 EAS Dashboard 查看构建状态。

### Version Code 自动递增

文档特别提示，在 EAS Dashboard 中可以看到 `Version Code` 自动增加。

`Version Code` 是 Google Play 用于区分 Android 应用版本的内部整数。它不是面向用户展示的版本名称。

对于 React Web 开发者，可以将其理解为应用商店用来判断“这个包是否比上一个更新”的递增构建编号。提交新构建时不能继续使用已经发布过的旧编号。

---

## 第二阶段：在 Google Play Console 创建应用

第一次上传应用前，需要先创建对应的商店应用记录：

1. 进入 Google Play Dashboard。
2. 在 **Home** 页面点击 **Create app**。
3. 填写应用信息。
4. 点击 **Create app**。

这一步不是上传代码，而是在 Google Play 后台建立应用的发布实体。

**基于文档内容推导：**EAS 中的项目和 Google Play Console 中的应用不是同一个东西。EAS 负责构建及提交，Google Play Console 负责测试、商店资料、审核和发布管理。

---

## 第三阶段：发布内部测试版本

应用创建完成后，Google Play Console 会进入该应用的 Dashboard。教程首先发布内部测试版本，而不是直接发布到生产环境。

### 配置内部测试人员

1. 在 Dashboard 点击 **Start testing now**。
2. 进入 **Internal Testing**。
3. 在 **Testers for the internal testing release** 下创建测试用户邮箱列表。
4. 返回 Dashboard，点击 **Create new release**。

创建第一个 release 时，Google Play Console 会在 **App integrity** 下自动生成签名密钥。

### 上传 `.aab`

EAS 构建完成后：

1. 打开 EAS Dashboard。
2. 点击 **Download**，下载 `.aab` 文件。
3. 返回 Google Play Console。
4. 进入 **Test and release > Testing > Internal testing**。
5. 在 **App bundles** 下点击 **Upload**。
6. 上传 `.aab`。
7. 填写 release 信息并点击 **Next**。
8. 在下一页点击 **Save and publish**。

这里存在两个不同平台：

| 平台 | 主要职责 |
|---|---|
| EAS Dashboard | 查看构建、下载 `.aab`、管理提交所需凭据 |
| Google Play Console | 接收 `.aab`、管理测试人员、轨道、审核和发布 |

不要误以为 EAS Build 完成就代表应用已经发布。构建和发布是两个独立阶段。

---

## 第四阶段：邀请内部测试人员

内部版本发布后，可以在 **Track Summary** 中查看最新 release。

文档指出，此时应用可能显示一个临时名称，因为应用还没有完成审核。

分享测试版本的步骤：

1. 在内部测试页面切换到 **Testers** 标签页。
2. 在 **How testers join your test** 下点击 **copy link**。
3. 通过邮件或消息将链接发送给测试人员。
4. 测试人员在设备上打开邀请。
5. 使用测试邮箱接受邀请。
6. 接受后，通过 Google Play 安装应用。

### 容易踩坑的地方

测试人员仅收到 `.aab` 文件无法直接安装。正确流程是：

```text
开发者上传 .aab
→ Google Play 创建内部测试 release
→ 测试人员通过邀请链接加入测试
→ 从 Google Play 安装
```

测试邮箱还必须接受邀请，不能只打开链接就认为已经获得安装权限。

---

## 发布前还必须完成的商店工作

文档提示，第一次正式发布前，需要在 Google Dashboard 的 **Set up your app** 中完成相关步骤，例如：

- 提供隐私政策链接；
- 设置目标受众；
- 填写数据安全信息；
- 完成其他商店要求。

商店展示还需要准备：

- 应用截图；
- 预览素材；
- 其他商店展示资产。

本文没有详细介绍这些资料的格式和制作流程，只指向了 Expo 的应用商店素材文档。

因此，“构建成功”和“具备正式发布条件”并不等价。即使 `.aab` 完全可用，商店资料没有完成时仍然不能完成首次正式发布。

---

## 将内部测试版本推进到 Alpha

文档给出了将内部测试 release 推进到 `alpha` 的入口：

1. 进入 **Test and release > Testing > Closed testing**。
2. 找到 **Closed testing - Alpha**。
3. 点击 **Manage track**。

当前文档只说明了入口，没有继续描述 Alpha 轨道的完整配置、测试人员管理和发布步骤。

---

## 使用 EAS Submit 自动提交

手动方式要求开发者下载 `.aab`，再到 Google Play Console 上传。EAS Submit 可以自动完成上传和创建 release 的过程。

### 配置 Service Account 密钥

首先需要按照文档引用的独立指南创建或下载 Google Service Account JSON 密钥。

随后在 EAS Dashboard 中配置：

1. 打开项目的 EAS Dashboard。
2. 点击 **Credentials**。
3. 在 **Android** 下点击应用的 **Application identifier**。
4. 在 **Service Credentials** 下点击 **Add a Google Service Account Key**。
5. 确认选择 **Upload new key**。
6. 上传下载好的 JSON 密钥。

`Application identifier` 是 Android 应用的唯一标识。对 React Web 开发者来说，它可以近似理解为应用在 Android 和 Google Play 体系中的唯一包名，而不是网站域名。

### 密钥的实际作用

文档明确说明，该密钥会被添加到项目凭据中，使 EAS Submit 能够自动执行 Google Play 提交。

**基于文档内容推导：**JSON 文件属于发布凭据，不应作为普通项目配置提交到公开代码仓库。文档没有进一步讲解密钥存储、轮换或泄露处理方法。

---

## 自动发布内部测试版本

在 `eas.json` 的 `submit.production` 中，将 Android `track` 设置为 `internal`：

```json
{
  "submit": {
    "production": {
      "android": {
        "track": "internal"
      }
    }
  }
}
```

`track` 表示构建要提交到 Google Play 的哪个发布通道。

这里的 `internal` 表示内部测试轨道。配置完成后运行：

```sh
eas submit --platform android
```

该命令会把生产构建上传到 Google Play，并自动创建新的内部测试 release。

需要区分：

```sh
eas build --platform android
```

负责生成 Android 构建。

```sh
eas submit --platform android
```

负责提交已经生成的构建。

---

## 发布到生产轨道

准备正式发布时，将 `track` 改为 `production`：

```json
{
  "submit": {
    "production": {
      "android": {
        "track": "production"
      }
    }
  }
}
```

然后运行：

```sh
eas submit --platform android
```

文档明确说明，可以复用之前用于内部测试的同一个 EAS Build，不必仅仅因为切换轨道就重新构建。

提交后，还需要进入 Google Play Console：

```text
Test and release > Production > Releases
```

选择要送审的构建，将其提交到 Google Play 的审核流程。

### 重要边界

`eas submit` 将构建提交到生产轨道，并不代表应用一定已经公开上线。

按照本文流程，开发者仍需在 Google Play Console 中选择构建并送审。Google Play 审核和最终上线状态由 Play Console 管理。

---

## 合并构建与提交

后续版本可以使用：

```sh
eas build --platform android --auto-submit
```

`--auto-submit` 会将两个阶段串联起来：

```text
EAS Build 创建构建
→ 构建完成
→ EAS 自动执行提交
→ 构建进入 eas.json 指定的 Google Play 轨道
```

最终提交到内部测试还是生产轨道，取决于 `eas.json` 中对应 submit profile 的 `track` 配置。

### 使用前提

根据本文流程，自动提交至少依赖：

- 可用的 `production` build profile；
- 正确的 submit 配置；
- 已上传至 EAS 的 Google Service Account JSON 密钥；
- Service Account 具备所需 Google Play 权限。

文档没有说明权限不足时的具体错误信息及排查方法。

---

## 完整流程图

### 第一次发布

```text
准备 Google Play Developer 账号
        ↓
确认 eas.json 存在 production 构建配置
        ↓
运行 eas build --platform android
        ↓
获得 .aab
        ↓
在 Google Play Console 创建应用
        ↓
配置内部测试人员
        ↓
手动上传 .aab
        ↓
发布内部测试 release
        ↓
发送邀请链接并完成测试
        ↓
完成隐私政策、目标受众、数据安全及商店素材
        ↓
选择生产构建并提交审核
```

### 后续自动化发布

```text
配置 Google Service Account
        ↓
将 JSON 密钥上传到 EAS Credentials
        ↓
在 eas.json 设置 track
        ↓
运行 eas submit
或
运行 eas build --platform android --auto-submit
```

---

## React Web 开发者最容易误解的地方

### 1. Build 不等于 Deploy

Web 项目执行构建后，通常紧接着部署静态资源或服务器程序。

在本文流程中：

- Build：生成 `.aab`；
- Submit：上传到 Google Play；
- Release：在特定测试或生产轨道创建版本；
- Review：将生产版本提交给 Google Play 审核；
- Published：审核和发布流程完成后，用户才能获得正式版本。

这些阶段不能视为同一步。

### 2. `.aab` 不是供用户直接下载的文件

它是面向 Google Play 的发布产物。内部测试人员也应通过 Google Play 测试轨道安装应用。

### 3. 内部测试不是本地开发模式

内部测试版本是已经进入 Google Play 发布体系的构建。它不同于：

- 浏览器本地开发服务器；
- Expo 开发环境；
- 本地调试运行。

本文没有介绍这些开发模式。

### 4. EAS 与 Google Play Console 分工不同

EAS 可以自动构建和上传，但不能取代 Google Play Console 中所有操作。首次应用创建、商店资料、测试人员和生产审核等工作仍然需要在 Google Play Console 完成。

### 5. `production` profile 与 production track 不是同一概念

- Build profile 决定“如何构建”。
- Submit profile 决定“如何提交”。
- `track: "production"` 决定“提交到哪个 Google Play 轨道”。

一个生产构建也可以先提交到 `internal` 轨道进行测试。

### 6. 自动提交不等于自动通过审核

`--auto-submit` 自动完成构建和上传，不会绕过 Google Play 的审核及首次发布要求。

---

## 注意事项与限制

1. 发布 Google Play 应用必须拥有付费开发者账号。
2. `.aab` 只能通过 Google Play 分发和安装。
3. 自动提交需要 Google Service Account 邮箱和 JSON 密钥。
4. 第一次正式发布前，必须完成 Google Play 的应用设置要求。
5. 测试人员需要使用获邀邮箱接受邀请后才能安装。
6. 未审核应用可能显示临时名称。
7. `track` 配置错误可能将构建提交到非预期轨道。
8. 同一个内部测试构建可以继续用于生产提交，无须必然重新构建。
9. 提交到生产轨道后，仍需在 Play Console 中选择构建并启动审核流程。
10. 本文没有覆盖审核时长、分阶段发布、回滚、签名密钥管理细节以及提交失败排查。

---

## 实际开发建议

以下不是原文直接要求，而是对文档流程的应用整理。

### 基于文档内容推导

第一次发布建议先完成手动内部测试流程。这样可以分别确认：

- EAS 能否成功生成 `.aab`；
- Google Play 应用配置是否正确；
- 测试人员能否接受邀请并安装；
- 构建本身能否正常运行。

流程跑通后，再配置 Service Account 和 `--auto-submit`，更容易区分构建问题、权限问题与商店配置问题。

### 基于经验建议

将测试轨道和生产轨道配置清楚，执行提交前检查 `track`：

```json
"track": "internal"
```

适用于团队内部验证。

```json
"track": "production"
```

适用于生产提交。

Google Service Account JSON 是敏感凭据，应避免提交到 Git 仓库或通过不安全渠道共享。本文仅介绍将其上传至 EAS Dashboard，没有给出完整的密钥安全管理方案。

---

## 明确内容与推导内容边界

### 文档明确说明

- Android 生产构建采用 `.aab` 格式。
- `.aab` 只能通过 Google Play 分发和安装。
- `eas build --platform android` 可以创建生产构建。
- Version Code 会自动递增。
- 可以手动上传 `.aab` 创建内部测试 release。
- 自动提交需要 Google Service Account JSON 密钥。
- `track` 可以设置为 `internal` 或 `production`。
- `eas submit --platform android` 用于提交构建。
- 内部测试使用的构建可以继续用于生产提交。
- `--auto-submit` 可以合并构建和提交过程。
- 首次正式发布前需要完成 Google Play 的应用设置和商店资料。

### 基于文档内容推导

- EAS 项目与 Google Play Console 应用是两个独立实体。
- 构建、提交、发布和审核是不同阶段。
- 自动提交不会替代 Google Play 审核。
- Service Account JSON 属于敏感发布凭据。
- 初次发布先手动验证、后续再自动化更便于定位问题。

---

## 总结

本文的核心路径是：

```text
eas build
→ 生成 Android .aab
→ 在 Google Play 创建应用
→ 发布内部测试
→ 完成商店资料并验证应用
→ eas submit 提交生产轨道
→ 在 Play Console 发起审核
```

后续版本可以简化为：

```sh
eas build --platform android --auto-submit
```

但自动化只减少构建和上传操作，不会取消 Google Play 的账号要求、商店资料配置、测试管理及审核流程。

<!-- NAVIGATION START -->
---
[← 上一页：Expo EAS 应用版本管理学习文档](./7__manage-app-versions.md) | [下一页：使用 EAS 创建并发布 iOS 生产构建 →](./9__ios-production-build.md)
<!-- NAVIGATION END -->
