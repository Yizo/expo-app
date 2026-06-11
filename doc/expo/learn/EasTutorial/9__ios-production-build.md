# 使用 EAS 创建并发布 iOS 生产构建

> 原文：Create a production build for iOS  
> 文档更新时间：2026 年 5 月 22 日  
> 适用读者：熟悉 React Web，但尚未接触 React Native、Expo、iOS 原生工程的开发者

## 文档解决的问题

本文介绍如何将 Expo 应用发布到 Apple 的分发体系中，完整流程包括：

1. 准备 Apple 开发者账号和 EAS 生产构建配置。
2. 创建 iOS 分发证书与 Provisioning Profile。
3. 使用 EAS Build 创建生产构建。
4. 将构建产物提交到 App Store Connect。
5. 通过 TestFlight 分发给内部测试人员。
6. 将应用提交给 Apple 审核并发布到 App Store。
7. 使用 `--auto-submit` 简化后续版本的构建与上传流程。

这篇文档解决的是“如何发布 iOS 应用”，不是“如何开发或调试 React Native 应用”。

---

## 适用场景

本文适用于以下情况：

- 应用已经具备可发布版本。
- 希望让团队通过 TestFlight 在真实 iPhone 上测试。
- 准备将应用提交到 App Store。
- 已经使用 EAS 管理 Expo 项目的构建和发布。
- 希望自动完成“构建后上传到 App Store Connect”。

当前文档未涉及：

- React Native 或 Expo 项目的创建过程。
- iOS 开发构建和本地调试。
- App Store 审核规则的完整说明。
- 外部 TestFlight 测试组的具体配置步骤。
- Apple Developer Program 的注册和付费流程。
- App Store Connect API Key 的首次创建过程。
- 审核被拒后的处理方法。
- 应用签名原理的完整讲解。
- Windows、Linux 或 macOS 本地构建环境配置。

---

## 阅读前需要理解的发布链路

对于 React Web 开发者，可以将整个流程理解为：

```text
Expo 项目源代码
  ↓ eas build
EAS 云端生成 iOS 生产构建
  ↓ eas submit
上传至 App Store Connect
  ↓
TestFlight 内部测试
  ↓ 手动选择构建并提交
Apple App Review
  ↓ 审核通过
App Store 正式发布
```

其中各系统的职责如下：

| 系统 | 作用 | 类似的 Web 概念 |
|---|---|---|
| EAS Build | 在云端生成可发布的 iOS 二进制文件 | CI 平台执行生产构建 |
| EAS Submit | 把构建产物上传到 App Store Connect | CI 将构建产物上传到部署平台 |
| App Store Connect | 管理构建、测试、商店资料和审核 | 部署后台与发布管理后台 |
| TestFlight | 向测试人员分发尚未正式上架的应用 | Preview/Staging 环境 |
| App Review | Apple 对应用进行发布审核 | Web 发布通常没有完全对应的步骤 |
| App Store | 面向最终用户的公开分发渠道 | Production 环境 |

需要特别注意：移动应用不是将静态文件部署到服务器。iOS 应用需要经过签名、上传、Apple 处理和审核，才能交付给用户。

---

## 一、发布前提

### 1. Apple Developer 账号

必须具备 Apple Developer 账号。

原文提供了 [Apple Developer Portal](https://developer.apple.com/account/) 作为账号创建入口，但没有展开注册流程。

该账号用于：

- 管理应用身份和签名凭证。
- 创建 Distribution Certificate。
- 创建 Provisioning Profile。
- 登录 App Store Connect。
- 使用 TestFlight。
- 提交 App Store 审核。

### 2. `eas.json` 中存在 `production` Profile

项目的 `eas.json` 必须包含名为 `production` 的构建 Profile。原文说明，该 Profile 默认会被添加。

概念上可以将 Profile 理解为一组命名的构建配置，类似 Web 项目中的：

```text
development
staging
production
```

示意结构如下：

```json
{
  "build": {
    "production": {
      // 生产构建配置
    }
  }
}
```

以上仅用于说明 Profile 所在的结构，不代表原文提供了这段完整配置。当前文档没有列出 `production` Profile 的具体字段。

---

## 二、理解 iOS Production Build

EAS 的 iOS Production Build 是面向 App Store Connect 优化的生产构建，可以用于：

- 通过 TestFlight 分发给测试人员。
- 通过 App Store 分发给公开用户。

它不能：

- 直接安装到 iOS 模拟器。
- 通过普通方式旁加载到真实设备。
- 绕过 App Store Connect 直接分发。

这与 React Web 的生产构建差异很大。Web 构建产物通常可以直接放到任意服务器；iOS 生产构建受 Apple 的签名和分发体系约束，只能通过 App Store Connect 进入 TestFlight或 App Store 流程。

> **文档明确说明：**Production Build 只能通过 App Store Connect 分发，不能直接安装到模拟器或设备。

---

## 三、创建分发签名凭证

在终端执行：

```sh
eas credentials
```

该命令用于管理构建 iOS 应用所需的凭证。按照文档中的流程完成以下选择。

### 操作步骤

1. 在平台选择中选择 `iOS`。
2. 在 Build Profile 选择中选择 `production`。
3. 当询问是否登录 Apple 账号时，输入 `Y`。
4. 在操作类型中选择 **Build credentials**。
5. 选择 **All: Set up all the required credentials to build your project**。
6. 当询问是否复用已有 Distribution Certificate 时，输入 `Y`。
7. 当询问是否生成新的 Apple Provisioning Profile 时，输入 `Y`。
8. Profile 创建完成后，按 `Ctrl + C` 退出 EAS CLI。

### Distribution Certificate

Distribution Certificate，即分发证书，用于证明生产构建由获得授权的开发者或组织签名。

可以粗略理解为：它不是应用功能配置，而是一种发布身份凭证。

文档要求复用之前的 Distribution Certificate，因此教程默认前面的章节已经创建过该证书。

> **容易误解：**复用证书并不等于复用整个构建。证书用于签名身份，应用代码仍然会重新构建。

### Provisioning Profile

Provisioning Profile 将应用身份、开发者团队和签名权限等信息关联起来，用于确定应用可以如何构建和分发。

此处创建的是生产应用使用的分发 Provisioning Profile。

> **基于文档内容推导：**由于该 Profile 面向生产分发，它与开发阶段用于设备安装和调试的 Profile 不是同一种使用场景。

当前文档没有解释以下内容：

- Distribution Certificate 的有效期。
- Provisioning Profile 的更新和失效机制。
- 多个开发者如何共享凭证。
- 凭证丢失或撤销后的恢复方式。
- EAS 托管凭证与本地凭证的差异。

---

## 四、创建 iOS 生产构建

执行：

```sh
eas build --platform ios
```

参数说明：

| 部分 | 含义 |
|---|---|
| `eas build` | 请求 EAS 创建应用构建 |
| `--platform ios` | 指定目标平台为 iOS |

文档指出，`production` 是 EAS 配置中的默认 Profile，因此不需要显式添加：

```sh
--profile production
```

命令执行后，构建任务会进入队列，可以在 EAS Dashboard 查看状态。

### Build Number 自动递增

文档特别提醒：EAS Dashboard 中的 **Build Number** 会自动递增。

Build Number 是 Apple 用于区分不同二进制构建的内部版本编号。它不等同于用户在 App Store 中看到的产品版本号。

例如，同一个公开版本可以有多个构建：

```text
公开版本：1.0.0
Build Number：1、2、3
```

> 上述编号仅用于解释版本与构建编号的关系，不是原文中的具体配置示例。

对于 Web 开发者，可以把 Build Number 类比为同一发布版本下不断增长的 CI 构建序号。Apple 需要依靠它识别每次上传的二进制文件。

---

## 五、上传构建到 App Store Connect

生产构建完成后，执行：

```sh
eas submit --platform ios
```

该命令会将 EAS Build 生成的应用二进制文件提交到 App Store Connect。

按照提示操作：

1. 选择 **Select a build from EAS**。
2. 选择最新的 Build ID。
3. 按提示登录 Apple 账号。
4. 当询问是否复用 App Store Connect API Key 时，输入 `Y`。

完成后，EAS 会启动提交过程。

### Build 与 Submit 是两个独立步骤

```text
eas build  = 生成应用二进制文件
eas submit = 把二进制文件上传到 App Store Connect
```

这是 React Web 开发者容易混淆的地方：构建成功不代表已经上传，更不代表应用已经发布。

`eas submit` 完成后，也只是把构建送入 Apple 的平台，尚未完成：

- TestFlight 测试分发。
- App Store 审核提交。
- App Store 正式发布。

---

## 六、通过 TestFlight 进行内部测试

上传完成后，在浏览器中登录 App Store Connect。

### 1. 找到构建

1. 打开 [App Store Connect Apps](https://appstoreconnect.apple.com/apps)。
2. 找到应用图标并进入应用。
3. 打开 **TestFlight** 标签页。

刚提交的构建不会立即出现。Apple 需要先处理构建，通常需要等待几分钟。

> **文档明确说明：**构建刚上传后可能需要几分钟，才能在 TestFlight 中用于分发。

### 2. 处理加密合规问题

如果跳过了教程前面的“iOS development build for devices”章节，系统可能询问：

```text
iOS app only uses standard/exempt encryption?
```

教程中的示例应用不使用需要申报的加密，因此选择 `Y`，接受默认值。

这会在 `Info.plist` 中设置：

```text
ITSAppUsesNonExemptEncryption = NO
```

`Info.plist` 是 iOS 应用的重要元数据配置文件，可以将它类比为 Web 项目的应用清单或平台级配置文件，但它包含大量 iOS 专有设置。

该配置表示应用没有使用需要额外申报的非豁免加密，从而帮助处理 TestFlight 和 App Store 发布过程中的合规检查。

> **重要限制：**教程中的选择只适用于其示例应用。原文明确指出，如果自己的应用使用加密，可以选择 `N`，以便下次跳过该提示。

不要因为教程选择了 `Y`，就在所有项目中机械选择相同答案。实际应用是否涉及加密，需要根据自身功能判断。

当前文档未说明：

- 哪些加密技术属于标准或豁免加密。
- HTTPS、登录、第三方 SDK 等具体场景应如何申报。
- 出口合规文件如何准备。

### 3. 创建内部测试组

在 App Store Connect 的 **Internal Testing** 区域：

1. 创建测试组。
2. 将测试用户加入测试组。
3. 系统向测试用户发送邀请邮件。
4. 测试用户点击邮件中的 **View in TestFlight**。
5. 接受邀请并点击 **Install**。
6. 应用下载到真实设备后即可测试。

### 内部测试和外部测试

| 测试类型 | 文档说明 |
|---|---|
| 内部测试 | 最多 100 名用户 |
| 外部测试 | 最多 10,000 名测试人员，并可提供公开分享链接 |

外部测试也通过 TestFlight 建立测试组，但当前教程没有介绍其具体操作。

---

## 七、提交 App Store 审核

TestFlight 测试完成、应用准备公开发布后，进入应用的 **App Store** 标签页。

需要完成：

1. 填写应用元数据。
2. 按 Apple 规范上传截图。
3. 填写 **General** 区域的信息。
4. 手动选择准备发布的构建。
5. 点击 **Submit to App Review**。

随后 Apple 会审核应用。审核通过后，应用才能在 App Store 中提供。

文档另外引用了“Create app store assets”页面，用于说明如何准备商店截图和预览素材，但当前文档没有展开这些规范。

### 上传、测试与审核之间的区别

```text
上传到 App Store Connect
        ↓
在 TestFlight 中测试
        ↓
填写商店资料并选择构建
        ↓
提交 App Review
        ↓
Apple 审核通过
        ↓
App Store 可用
```

其中任何一个中间步骤完成，都不能直接等同于“应用已上线”。

---

## 八、自动构建并上传

后续发布可以执行：

```sh
eas build --platform ios --auto-submit
```

参数说明：

| 参数 | 作用 |
|---|---|
| `--platform ios` | 创建 iOS 构建 |
| `--auto-submit` | 构建完成后自动启动提交，将产物上传到 Apple 平台 |

它将原本的两个命令：

```sh
eas build --platform ios
eas submit --platform ios
```

合并为一个连续流程。

### 自动化的边界

`--auto-submit` 会：

- 创建生产构建。
- 构建完成后自动上传。
- 使构建进入 TestFlight 内部测试相关流程。

`--auto-submit` 不会：

- 自动填写 App Store 商店资料。
- 自动选择构建并提交 App Review。
- 自动让应用通过审核。
- 自动完成公开发布。

> **文档明确说明：**该命令会自动把构建上传到 TestFlight，但不会自动提交 App Store 审核。准备公开发布时，仍需手动将构建从 TestFlight 推进到 App Store 发布流程。

对于 React Web 开发者，`--auto-submit` 更接近“自动构建并上传部署产物”，而不是“自动完成生产发布”。

---

## React Web 开发者最容易误解的地方

### 1. Production Build 不能随意安装

Web 的生产文件可以部署到任意服务器，iOS Production Build 则必须通过 App Store Connect 分发。需要直接在开发设备上安装调试时，应使用其他构建类型；当前文档没有展开相关流程。

### 2. 构建成功不等于发布成功

至少要区分四种状态：

```text
构建成功
上传成功
提交审核成功
审核通过并正式发布
```

EAS Build 只负责第一步，EAS Submit 主要负责第二步。

### 3. TestFlight 不是 App Store 正式发布

TestFlight 是 Apple 提供的测试分发渠道。用户通过 TestFlight 安装应用，不代表应用已经公开上架。

### 4. iOS 构建需要签名凭证

前端代码能够正常运行，不代表可以直接生成和发布 iOS 应用。Distribution Certificate 和 Provisioning Profile 属于 Apple 分发体系的必要凭证。

### 5. `--auto-submit` 不是全自动上架

该参数只自动连接“构建”和“上传”，Apple 审核仍然需要手动发起。

### 6. 加密问题不能照抄教程答案

教程示例不使用需要申报的加密，因此选择 `Y` 并设置 `ITSAppUsesNonExemptEncryption` 为 `NO`。真实项目必须根据实际情况回答，原文没有提供完整的加密合规判断标准。

---

## 实际开发中的使用方式

### 首次发布

按照文档流程，首次发布可拆分执行，以便清楚观察每个阶段：

```sh
eas credentials
eas build --platform ios
eas submit --platform ios
```

之后依次在 App Store Connect 中完成：

```text
等待 Apple 处理构建
→ 创建 TestFlight 内部测试组
→ 完成设备测试
→ 填写商店资料
→ 选择构建
→ 提交 App Review
```

### 后续版本发布

凭证和提交流程已经验证后，可以使用：

```sh
eas build --platform ios --auto-submit
```

然后在 App Store Connect 中检查 TestFlight 构建，测试完成后手动提交审核。

### 基于经验建议

以下内容不是当前文档明确要求：

- 首次发布时先分别运行 `build` 和 `submit`，更容易定位构建问题与上传问题。
- 在自动上传前，确认版本号和 Build Number 符合发布计划。
- 不要在不确定加密使用情况时直接照搬示例答案，应核对应用代码、原生依赖及第三方 SDK。
- 提交审核前，应使用接近生产环境的配置完成一次 TestFlight 验证。

---

## 文档明确内容与推导内容

### 文档明确说明

- 发布前需要 Apple Developer 账号。
- `eas.json` 中必须存在 `production` Profile。
- iOS Production Build 只能通过 App Store Connect 分发。
- `eas credentials` 可配置生产构建凭证。
- `eas build --platform ios` 创建生产构建。
- Build Number 会自动递增。
- `eas submit --platform ios` 上传最新 EAS Build。
- TestFlight 构建可能需要等待 Apple 处理。
- 内部测试最多支持 100 名用户。
- 外部测试最多支持 10,000 名测试人员，并支持公开链接。
- App Store 发布前需要填写元数据、上传截图并手动选择构建。
- `--auto-submit` 会自动上传至 TestFlight。
- `--auto-submit` 不会自动提交 App Store 审核。

### 基于文档内容推导

- 整体流程可以理解为移动端的构建、测试、审核和生产发布流水线。
- Distribution Certificate 表示发布者的签名身份，Provisioning Profile 约束应用的构建和分发授权。
- Build Number 类似同一应用版本下的 CI 构建序号。
- TestFlight 类似受 Apple 管理的预发布测试环境，但不能与普通 Web Staging 环境完全等同。
- 首次发布适合将构建和上传分开执行，后续稳定发布再使用自动提交。

---

## 总结

iOS 应用发布不是一个单独的“部署”动作，而是一条由多个独立阶段组成的流程：

```text
准备 Apple 账号和生产 Profile
→ 配置分发凭证
→ 创建 Production Build
→ 上传 App Store Connect
→ TestFlight 测试
→ 完善商店资料并选择构建
→ 提交 Apple 审核
→ 审核通过后发布
```

最关键的边界是：

- `eas build` 负责创建构建。
- `eas submit` 负责上传构建。
- TestFlight 负责测试分发。
- `Submit to App Review` 才会启动 App Store 审核。
- `--auto-submit` 只自动完成构建和上传，不会自动完成审核与公开上架。

<!-- NAVIGATION START -->
---
[← 上一页：使用 EAS 创建并发布 Android 生产构建](./8__android-production-build.md) | [下一页：使用 EAS Update 与团队共享应用预览 →](./10__team-development.md)
<!-- NAVIGATION END -->
