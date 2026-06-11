# 使用 EAS Update 与团队共享应用预览

> 原文标题：Share previews with your team  
> 文档修改日期：2026 年 6 月 3 日  
> 主题：使用 EAS Update 发布 OTA 更新，并向团队成员共享应用变更预览。

## 文档解决的问题

在 React Native / Expo 项目中，每次修改 JavaScript、样式或图片后，如果都重新构建并分发完整的 iOS / Android 安装包，团队测试会比较低效。

本文介绍如何使用 **EAS Update**：

1. 为 Expo 项目启用 OTA 更新能力。
2. 通过 channel 将更新发送给指定类型的构建。
3. 不重新构建安装包，直接向团队成员共享 JavaScript、样式和图片等变更。
4. 分别在 development、preview 或 production 构建中查看更新。

本文适合已经在使用 EAS Build，并希望提高团队预览和测试效率的 Expo 项目。

---

## 阅读前需要理解的背景

### Build 与 Update 的区别

对于 React Web 开发者，可以暂时这样理解：

| Expo 概念 | 类似的 Web 开发概念 | 实际含义 |
|---|---|---|
| Build | 生成并部署一套运行环境 | 生成可安装的 Android / iOS 应用 |
| Update | 部署前端静态资源 | 更新 JavaScript、样式和图片等非原生内容 |
| Channel | 部署环境标识 | 决定某个构建接收哪一组更新 |
| Development build | 带开发工具的测试客户端 | 用于开发、调试和手动预览更新 |
| Preview build | 预发布安装包 | 通常用于团队测试或发布前验收 |
| Production build | 正式安装包 | 面向正式用户的应用版本 |

需要注意：这种对应关系只是帮助理解，并不表示移动端 Update 与 Web 部署完全相同。

### 什么是 OTA 更新

OTA 是 **Over-the-air** 的缩写，表示不通过应用商店重新下载安装包，而是通过网络向已安装的应用发送更新。

根据本文，EAS Update 可以更新应用中的非原生部分，例如：

- JavaScript 代码
- 样式
- 图片

它通常用于：

- 修复较小的 Bug
- 发布较小的功能或界面调整
- 在两次应用商店版本发布之间发送变更
- 快速向团队成员提供预览

### OTA 更新不能替代所有重新构建

本文明确展示了一个必须重新构建的情况：

> 原有构建中没有包含 `expo-updates` 原生库，因此安装该库并完成配置后，必须创建新的 development build。

由此可以理解：

- 修改 JavaScript、样式或图片时，可以通过 EAS Update 发布。
- 引入构建中不存在的原生能力时，旧安装包无法仅靠 OTA 获得该能力，需要重新构建。

这里的“原生能力”可以理解为需要进入 Android 或 iOS 应用安装包的代码和配置。

---

## 整体流程

本文的操作顺序如下：

```text
安装 expo-updates
        ↓
配置 updates、runtimeVersion 和 channel
        ↓
重新创建包含 expo-updates 的 development build
        ↓
在设备上安装新构建
        ↓
修改 JavaScript 代码
        ↓
将更新发布到指定 channel
        ↓
团队成员在对应构建中查看更新
```

一个重要前提是：

> Update 只能被兼容且已经包含 `expo-updates` 的构建接收。

---

## 第一步：安装 `expo-updates`

运行与项目包管理器对应的命令：

```sh
# npm
npx expo install expo-updates

# yarn
yarn expo install expo-updates

# pnpm
pnpm expo install expo-updates

# bun
bun expo install expo-updates
```

`expo-updates` 是 Expo 提供的更新库，用于让已安装的应用检查、下载和运行 EAS Update 发布的内容。

这里使用 `expo install`，而不是直接使用普通的 `npm install`。对 React Web 开发者而言，它仍然是在安装 npm 依赖，但 Expo CLI 会帮助选择与当前 Expo SDK 兼容的版本。

---

## 第二步：配置 EAS Update

执行：

```sh
eas update:configure
```

这个命令用于初始化 EAS Update 配置，但它对动态配置和静态配置的处理不同。

### 使用动态配置：`app.config.js`

本文示例使用的是动态 `app.config.js`。

此时需要：

1. 运行 `eas update:configure`。
2. 从命令输出中获取 `updates` 和 `runtimeVersion` 属性及其值。
3. 手动将它们复制到 `app.config.js`。
4. 再次运行 `eas update:configure`，继续完成配置。

需要添加的核心属性是：

- `updates`
- `runtimeVersion`

#### `updates`

用于配置 Expo 应用的更新行为和更新服务信息。

#### `runtimeVersion`

用于描述某个 Update 与哪些应用运行时兼容。

对 React Web 开发者而言，它可以近似理解为“客户端运行环境的兼容版本”。已经安装在手机上的原生应用只能运行与自身 runtime 兼容的更新。

本文只说明必须添加该属性，没有展开介绍具体取值策略。

### 使用静态配置：`app.json`

如果项目使用 `app.json`，而不是动态的 `app.config.js`，`eas update:configure` 会自动：

- 将必要属性添加到 `app.json`
- 将相关配置添加到 `eas.json`

因此，不要把本文针对 `app.config.js` 的手动复制步骤机械地应用到所有项目。

### 配置 `eas.json` 中的 channel

配置完成后，每个构建 profile 会得到相应的 `channel`：

```json
{
  "build": {
    "development": {
      "channel": "development"
    },
    "ios-simulator": {},
    "preview": {
      "channel": "preview"
    },
    "production": {
      "channel": "production"
    }
  }
}
```

`eas.json` 中可能还存在其他配置。这里仅展示与本文相关的部分。

### `build profile` 是什么

`development`、`preview` 和 `production` 都是构建 profile。

可以将 profile 理解为一套具名的构建配置，类似 Web 项目中的不同构建模式：

```text
development profile → 开发调试构建
preview profile     → 团队测试构建
production profile  → 正式发布构建
```

但与 Web 环境变量不同，profile 会实际影响最终生成的原生安装包。

### `channel` 是什么

Channel 用于将构建分组，并决定它们接收哪一类更新。

例如：

```text
Android production build ─┐
                          ├─ channel: production
iOS production build ─────┘
```

向 `production` channel 发布 Update 后，EAS Update 会将其提供给使用该 channel 的兼容构建。

同一个 channel 可以同时关联 Android 和 iOS 构建，因此可以通过一次发布向两个平台提供更新。是否真正接收更新还取决于构建与 Update 是否兼容；本文没有进一步展开兼容规则。

### `ios-simulator.channel` 可以删除

`eas update:configure` 会为每个构建 profile 添加 channel。

但在本文项目中：

- `ios-simulator` 继承了 `development` profile。
- 为它单独设置 channel 没有实际意义。
- 可以安全删除 `ios-simulator.channel`。

这不是所有项目都必须执行的通用规则，而是针对本文中 profile 继承关系的处理。

---

## 第三步：创建新的 development build

运行：

```sh
eas build --platform android --profile development
```

参数含义：

| 参数 | 作用 |
|---|---|
| `eas build` | 请求 EAS 创建原生应用构建 |
| `--platform android` | 只构建 Android 版本 |
| `--profile development` | 使用 `eas.json` 中的 development profile |

必须重新构建的原因是：

> 之前创建的构建不包含刚安装的 `expo-updates` 库。

旧构建不会因为项目依赖发生变化而自动获得这个原生库。新构建完成后，还必须将它安装到设备上。

也可以使用：

```sh
# 同时构建 Android 和 iOS
eas build --platform all --profile development

# 只构建 iOS
eas build --platform ios --profile development
```

本文使用 Android development build 演示更新，但 EAS Update 并非只支持 Android。

---

## 第四步：修改 JavaScript 代码

本文使用 Sticker Smash 示例应用，将第一个按钮的文字从：

```text
Choose a photo
```

改为：

```text
Select a photo
```

对应代码：

```tsx
<Button
  theme="primary"
  label="Select a photo"
  onPress={pickImageAsync}
/>
```

如果没有使用 Sticker Smash 示例项目，可以修改任意容易观察的代码，以验证 Update 是否生效。

这个变更只涉及 JavaScript / JSX 文本，不涉及新的原生依赖，因此适合作为 OTA 更新示例。

---

## 第五步：发布 Update

将变更发布到 `development` channel：

```sh
eas update --channel development --message "Change first button label"
```

参数说明：

| 参数 | 作用 |
|---|---|
| `eas update` | 发布一次 EAS Update |
| `--channel development` | 将更新发布到 development channel |
| `--message` | 为这次更新添加说明信息 |

发布完成后，CLI 会显示本次 Update 的信息，并提供 Website link。

可以通过该链接在 EAS Dashboard 中查看：

```text
Over-the-air updates
└── Update groups
```

### Update、channel 与 branch 的关系

本文使用 Git 进行类比：

- Git commit 会关联到 branch。
- EAS Update 会通过 channel 被提供给相应构建。
- 创建 EAS Update channel 时，系统会自动将其映射到同名 branch。

例如：

```text
development channel
        ↓ 自动映射
development branch
```

因此，命令：

```sh
eas update --channel development
```

会发布到 `development` channel 对应的更新分支，并让使用该 channel 的兼容构建能够获取更新。

需要避免一个常见误解：EAS Update 的 branch 不是 Git branch。两者概念相似，但属于不同系统。

---

## 第六步：在 development build 中预览

在 development build 中查看更新，需要：

1. 在 development build 内登录 Expo 账号。
2. 打开 **Extensions** 标签页。
3. 在 **EAS Update** 区域找到 `Branch: development`。
4. 点击 **Open** 打开更新。

这里并不是像普通 Web 页面那样刷新浏览器，而是通过 development build 提供的开发界面选择并运行指定 Update。

---

## 在 preview 或 production build 中接收更新

对于非 development 构建，例如：

- preview build
- production build

应用启动时会请求是否存在新 Update。如果存在适用于当前构建的更新，应用会自动下载。

团队成员只要运行对应的 preview 或 production build，就能接收发布到相应 channel 的变更。

例如，将更新发布给 preview build：

```sh
eas update --channel preview --message "Change first button label"
```

要测试这个 Update，本文要求：

1. 强制关闭应用。
2. 重新打开应用。
3. 再次强制关闭。
4. 再次打开。

也就是强制关闭并重新打开两次，第一次启动用于下载更新，后续启动用于显示更新后的内容。

### 为什么 development 与 preview 的查看方式不同

本文展示了两种流程：

| 构建类型 | 查看方式 |
|---|---|
| development build | 登录 Expo，在 Extensions 中手动打开 branch |
| preview / production build | 应用启动时自动检查和下载更新 |

因此，不能把 development build 中的手动预览流程套用到所有构建类型。

---

## 配置与命令速查

| 内容 | 位置或命令 | 作用 |
|---|---|---|
| `expo-updates` | 项目依赖 | 为应用提供 EAS Update 支持 |
| `updates` | `app.config.js` 或 `app.json` | 配置应用更新行为和服务信息 |
| `runtimeVersion` | `app.config.js` 或 `app.json` | 标识 Update 的运行时兼容范围 |
| `channel` | `eas.json` 的 build profile | 指定该构建接收哪一类更新 |
| `eas update:configure` | CLI 命令 | 初始化 EAS Update 配置 |
| `eas build` | CLI 命令 | 创建新的原生应用构建 |
| `eas update` | CLI 命令 | 发布 JavaScript、样式和图片等更新 |
| `--platform` | `eas build` 参数 | 指定 Android、iOS 或全部平台 |
| `--profile` | `eas build` 参数 | 指定使用哪个构建 profile |
| `--channel` | `eas update` 参数 | 指定更新的目标 channel |
| `--message` | `eas update` 参数 | 描述本次更新内容 |

---

## 注意事项与容易踩坑的地方

### 1. 安装 `expo-updates` 后必须重新构建

仅安装 npm 包并发布 Update 不够。

如果设备上的旧构建不包含 `expo-updates`，它无法使用本教程中的更新能力。必须重新创建并安装新构建。

### 2. 动态配置不会被自动完整修改

对于 `app.config.js` 项目，需要将命令提供的 `updates` 和 `runtimeVersion` 手动复制到配置文件，再重新运行配置命令。

不要因为命令执行成功，就直接假设动态配置已经完成。

### 3. 发布时必须选择正确的 channel

```sh
eas update --channel development
```

只会面向使用 `development` channel 的构建。

如果团队成员安装的是 preview build，却把更新发布到 development channel，他们不会通过 preview build 收到该更新。

### 4. Channel 不是运行时环境变量

React Web 开发者可能会把 channel 理解成 `.env.development` 一类环境配置，但两者用途不同。

Channel 的核心作用是：

> 将构建与更新发布目标关联起来。

它不是用来直接保存 API 地址、密钥或业务配置的。

### 5. EAS branch 不是 Git branch

文档使用 Git branch 帮助理解 EAS Update branch，但它们不是同一个对象。

发布 EAS Update 不等于提交或推送 Git 代码。

### 6. preview / production 更新不一定在第一次重启时显示

本文的 preview 示例要求强制关闭并重新打开应用两次，以完成下载和显示更新。

因此，第一次重新打开后没有立即看到变化，不一定表示发布失败。

### 7. OTA 的适用范围有限

本文明确列出的可更新内容是：

- JavaScript
- 样式
- 图片

本文没有说明所有资源和原生配置都能通过 OTA 更新。因此，不应将 EAS Update 理解为完整替代应用商店构建和发布的机制。

### 8. 向 production channel 发布会影响正式构建

根据 channel 的工作方式，发布到 `production` channel 的更新将面向使用该 channel 的构建。

这意味着发布命令中的 channel 不是无关紧要的标签，而是实际的更新目标选择。

---

## React Web 开发者最容易误解的地方

### 手机中长期存在的是原生构建

Web 用户每次访问网站，通常会获取服务器上的最新资源。移动应用则先通过安装包装入一个原生运行环境，再由这个运行环境检查 OTA 更新。

因此，必须同时考虑：

```text
设备上安装了哪个 build
        +
该 build 使用哪个 channel
        +
发布的 Update 是否与其兼容
```

### `npm install` 不代表用户设备获得了新能力

在 Web 项目中，安装依赖后重新部署即可让用户获取新版本。

在 Expo 应用中，如果依赖包含原生代码，仅发布 JavaScript Update 不能将原生代码加入用户已经安装的应用。本文中的 `expo-updates` 就要求先重新构建。

### 构建与发布 Update 是两个独立动作

```sh
eas build ...
```

生成可安装的原生应用。

```sh
eas update ...
```

向已有兼容构建发送非原生内容更新。

二者不能互相替代。

---

## 实际团队开发中的使用方式

下面是根据本文流程整理出的典型协作方式。

### 首次启用 EAS Update

```text
安装 expo-updates
→ 配置 updates 和 runtimeVersion
→ 为 build profile 配置 channel
→ 重新构建
→ 团队安装新构建
```

这是一次基础设施初始化过程。

### 日常共享开发预览

```text
修改 JavaScript / 样式 / 图片
→ 发布到 development channel
→ 团队在 development build 中打开对应更新
```

适合开发阶段快速演示和验证。

### 发布预览版本供团队验收

```text
修改代码
→ 发布到 preview channel
→ 团队重启 preview build
→ 检查更新
```

适合不需要 development build 调试工具的测试场景。

### 正式环境更新

从本文描述可以确认，production build 也可以自动获取发布到对应 channel 的更新。

不过，本文没有涉及以下内容：

- 正式发布前的审批流程
- 回滚策略
- 灰度发布
- 应用商店审核政策
- 紧急更新处理
- runtimeVersion 的版本设计策略
- 更新失败后的恢复机制
- 更新签名和安全配置

因此，不能仅根据本教程建立完整的生产发布制度。

---

## 明确信息与推导结论

### 文档明确说明

- EAS Update 可以更新 JavaScript、样式和图片等非原生内容。
- 项目需要安装 `expo-updates`。
- 动态 `app.config.js` 项目需要手动添加 `updates` 和 `runtimeVersion`。
- 静态 `app.json` 项目可以由配置命令自动添加相关属性。
- 每个构建 profile 会被配置 channel。
- `ios-simulator` 继承 development profile 时，可以删除单独的 channel。
- 原有构建不包含 `expo-updates`，因此需要创建并安装新构建。
- Update 可以发布到 development、preview 或 production channel。
- development build 可以在 Extensions 中手动打开更新。
- preview 和 production build 会在启动时检查并自动下载更新。
- preview 示例需要强制关闭并重新打开应用两次。

### 基于文档内容推导

- 构建 profile、channel 和发布命令中的 channel 必须保持对应，否则团队成员无法在预期构建中收到更新。
- OTA 更新依赖设备中已有的原生运行环境，不能给旧构建凭空增加其未包含的原生库。
- 团队开始使用 EAS Update 前，需要先统一安装启用了该能力的新构建。
- 将更新发布到 production channel 可能直接影响正式用户使用的构建，因此需要比 development 和 preview 更严格的发布控制。

### 基于经验建议

以下建议不是本文明确给出的流程：

- 在发布 production Update 前，先在 development 或 preview channel 验证。
- 团队应约定每个 build profile 对应的 channel，避免发布目标选错。
- 在更新消息中写清功能或修复内容，便于在 EAS Dashboard 中追踪。
- 涉及原生依赖、原生配置或不确定是否兼容的修改时，不要默认 OTA 足够，应先判断是否需要重新构建。

---

## 总结

EAS Update 的核心不是“省略所有移动端构建”，而是在已有兼容构建的基础上，更快地分发 JavaScript、样式和图片等非原生变更。

需要掌握三层关系：

```text
Build profile
决定如何构建应用
        ↓
Channel
决定构建接收哪类更新
        ↓
EAS Update
将变更发布到指定 channel
```

首次接入时，需要安装 `expo-updates`、完成配置并重新构建应用。此后，对于兼容的非原生变更，可以通过 `eas update` 快速发送给团队，无需每次重新生成并分发安装包。

<!-- NAVIGATION START -->
---
[← 上一页：使用 EAS 创建并发布 iOS 生产构建](./9__ios-production-build.md) | [下一页：从 GitHub 仓库触发 EAS Build →](./11__using-github.md)
<!-- NAVIGATION END -->
