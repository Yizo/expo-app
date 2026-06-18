# QR 码生成工具（qr.expo.dev）

## 文档解决的问题

在移动应用开发中，团队成员之间分享和测试应用更新是一个高频需求。`qr.expo.dev` 是 Expo 提供的一个**云端 QR 码生成服务**，它能根据你传入的参数生成一个包含深度链接（Deep Link）的 QR 码，让手机上的 Expo Go 或自定义开发构建（Development Build）快速加载指定的 EAS Update 更新。

对于 React Web 开发者来说，可以把它类比为：你有一个"动态部署预览链接生成器"，只不过这个链接不是打开浏览器页面，而是直接唤起手机上的 App 并拉取对应的更新包。

## 阅读前需要理解的背景知识

### EAS Update

EAS Update 是 Expo 的**OTA（Over-The-Air，空中更新）服务**，类似于 Web 开发中的"热部署"或"灰度发布"。它允许你在不重新提交应用商店审核的情况下，向已安装的用户推送 JavaScript 代码和资源更新。

### 开发构建（Development Build）

开发构建是你自己编译的 App 版本，包含了原生代码能力。与 Expo Go（Expo 官方提供的沙箱 App）不同，开发构建可以使用自定义的原生模块。类比 Web 开发：Expo Go 像是"标准浏览器"，而开发构建像是你"自己打包的 Electron 应用"。

### 深度链接（Deep Link）

深度链接是一种特殊的 URL，可以唤起手机上的特定 App 并导航到 App 内的某个位置。格式如 `exp+your-slug://...`。这和 Web 开发中的 `mailto:` 或自定义协议链接类似，但它是移动端的专有机制。

### Channel（渠道）

Channel 是 EAS Update 中的概念，用于将更新分组和分发。例如你可以有 `production`、`staging`、`preview` 等渠道，每个渠道对应不同环境的构建版本。类比 Web 开发中的"部署环境"（production / staging / preview）。

### Runtime Version（运行时版本）

Runtime Version 标识 App 的原生运行时兼容性。只有 Runtime Version 匹配的更新才能被安装到对应的构建上。这是移动端特有的概念——在 Web 开发中你通常不需要关心这个，因为浏览器总是向前兼容的。

### Slug

Slug 是 Expo 应用配置（`app.json` / `app.config.js`）中的项目标识符，用于构建深度链接的 URL Scheme。默认值为 `exp`，指向 Expo Go。如果你使用开发构建，slug 会对应你的 App。

## 核心工作原理

`qr.expo.dev` 是一个 HTTP 端点，你通过 URL 查询参数告诉它"我要生成哪个更新的 QR 码"，它会返回一个 SVG 格式的 QR 码图片。

### 请求示例

```text
https://qr.expo.dev/eas-update?projectId=your-project-id&runtimeVersion=your-runtime-version&channel=your-channel
```

### 返回内容

默认返回一个 SVG 图片，其中编码的深度链接格式为：

```text
exp+your-slug://expo-development-client/?url=https://u.expo.dev/your-project-id?runtime-version=your-runtime-version&channel-name=your-channel
```

这个深度链接告诉开发构建："去 `u.expo.dev` 拉取指定项目在指定渠道上的最新更新。"

> **提示**：如果你觉得直接分享 URL 更方便，可以在查询参数中加上 `format=url`，服务会直接返回纯文本 URL 而不是 SVG 图片。

## 查询参数详解

### 基础参数（所有请求通用）

这些参数可以和下面任何一种"定位更新"的方式组合使用：

| 参数 | 是否必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `slug` | 否 | `exp` | 指定目标 App 的 slug。默认 `exp` 指向 Expo Go；如果你使用开发构建，需要填入你项目的 slug 值。 |
| `appScheme`（已弃用） | 否 | `exp` | 已弃用，请使用 `slug` 参数替代。 |
| `host` | 否 | `u.expo.dev` | 更新请求的目标服务器主机名。通常不需要修改，除非你使用了自托管的更新服务。 |
| `format` | 否 | `svg` | 返回格式。默认返回 SVG 格式的 QR 码；设为 `url` 时返回纯文本 URL。 |

**开发影响说明**：

- `slug` 参数决定了 QR 码唤起的是 Expo Go 还是你自己的开发构建。团队协作时，如果大家都用开发构建，一定要确保 slug 填写正确，否则扫码后 App 不会被唤起。
- `appScheme` 已被标记为弃用（deprecated），新项目不要使用它。如果你的旧项目还在用，应尽快迁移到 `slug`。
- `format=url` 在 CI/CD 流水线中非常有用——你不需要解析 SVG，直接拿到 URL 字符串就可以分享到聊天工具或邮件中。

### 定位更新的方式

`qr.expo.dev` 提供了五种方式来指定"我要生成哪个更新的 QR 码"，对应不同的使用场景：

---

#### 方式一：按设备特征定位（最常用）

模拟预览构建和生产构建请求更新的方式，通过 Runtime Version 和 Channel 来定位更新。这是最贴近实际使用场景的方式。

| 参数 | 是否必填 | 说明 |
| --- | --- | --- |
| `projectId` | 是 | 项目 ID，可在 Expo Dashboard 中查看 |
| `runtimeVersion` | 是 | 构建的运行时版本号 |
| `channel` | 是 | 构建关联的渠道名称 |

**请求示例**：

```text
https://qr.expo.dev/eas-update?projectId=your-project-id&runtimeVersion=your-runtime-version&channel=your-channel
```

**适用场景**：你想让团队成员扫码测试某个渠道上的最新构建。这是日常开发中最常用的方式。

---

#### 方式二：按 Update ID 定位

直接指定一个特定的更新 ID，精确加载该次更新。

| 参数 | 是否必填 | 说明 |
| --- | --- | --- |
| `updateId` | 是 | 特定更新的唯一标识符 |

**请求示例**：

```text
https://qr.expo.dev/eas-update?updateId=your-update-id
```

**适用场景**：你在 EAS Dashboard 上看到了某次具体的更新记录，想精确测试这一次更新而不是渠道上最新的。比如你想回滚验证某个旧版本。

---

#### 方式三：按 Group ID 定位

使用更新组（Update Group）的标识符来生成 QR 码。一次 `eas update` 发布可能同时为多个平台（iOS / Android）生成更新，这些更新会被归为一个 Group。

| 参数 | 是否必填 | 说明 |
| --- | --- | --- |
| `projectId` | 是 | 项目 ID |
| `groupId` | 是 | 更新组的标识符 |

**请求示例**：

```text
https://qr.expo.dev/eas-update?projectId=your-project-id&groupId=your-update-id
```

**适用场景**：你刚执行了一次 `eas update` 发布，想用该次发布的组 ID 来测试。这在同时维护 iOS 和 Android 更新时特别方便。

---

#### 方式四：按 Branch ID 定位

获取指定分支上最新的更新。

| 参数 | 是否必填 | 说明 |
| --- | --- | --- |
| `projectId` | 是 | 项目 ID |
| `branchId` | 是 | 分支标识符 |

**请求示例**：

```text
https://qr.expo.dev/eas-update?projectId=your-project-id&branchId=your-branch-id
```

**适用场景**：你的团队使用了分支（Branch）机制来组织更新，想测试某个分支上的最新内容。Branch 和 Channel 的关系类似于 Git 中分支和部署环境的关系——Branch 是代码线，Channel 通过映射指向 Branch。

---

#### 方式五：按 Channel ID 定位

获取指定渠道标识符映射到的最新更新。

| 参数 | 是否必填 | 说明 |
| --- | --- | --- |
| `projectId` | 是 | 项目 ID |
| `channelId` | 是 | 渠道标识符 |

**请求示例**：

```text
https://qr.expo.dev/eas-update?projectId=your-project-id&channelId=your-channel-id
```

**适用场景**：你知道渠道的 ID（而非名称），想直接通过 ID 来定位。这在通过 EAS API 自动化操作时可能更方便。

## 注意事项和容易踩坑的地方

### 1. 区分 Channel 名称和 Channel ID

"按设备特征定位"使用的是 Channel **名称**（如 `production`、`staging`），而"按 Channel ID 定位"使用的是 Channel 的**唯一标识符**（一个 UUID 或数字 ID）。两者不是同一个东西。使用前需要确认你手上有的是名称还是 ID。

### 2. Runtime Version 必须匹配

如果你使用"按设备特征定位"的方式，传入的 `runtimeVersion` 必须与目标设备上安装的构建版本的 Runtime Version 一致。如果不一致，即使 QR 码能正常生成，App 也无法拉取到兼容的更新。

在 Web 开发中，你通常不需要关心"运行时兼容性"，因为浏览器会自动处理。但在移动端，原生代码版本不匹配可能导致 App 崩溃，所以 Expo 通过这个机制来强制版本对齐。

### 3. `appScheme` 已弃用

文档明确标注 `appScheme` 为弃用参数。新项目应始终使用 `slug`。如果你的项目配置中还有 `appScheme` 相关引用，应当迁移。

### 4. 默认返回 SVG，不是 JSON

对于习惯了 REST API 的 Web 开发者来说，可能会预期一个 HTTP 端点返回 JSON。但 `qr.expo.dev` 默认返回的是 SVG 图片。如果你需要在程序中使用 URL 而非图片，记得加上 `format=url`。

### 5. 深度链接的 URL Scheme

生成的深度链接使用 `exp+your-slug://` 作为协议头，这是 Expo 的自定义 URL Scheme。它依赖于设备上的 App 已注册了该 Scheme。如果你的开发构建未正确配置 URL Scheme，扫码将不会唤起 App。

### 6. `host` 参数通常不需要修改

默认的 `u.expo.dev` 是 Expo 官方的更新分发服务器。只有在你自建了更新服务（self-hosted update server）的情况下，才需要修改 `host` 参数。大多数项目不需要关注这个参数。

## React Web 开发者需要特别注意的地方

### 移动端没有"刷新页面"这个概念

在 Web 开发中，你部署了新代码后，用户刷新浏览器就能拿到最新版本。但在移动端，更新是通过 EAS Update 拉取的，而 QR 码就是触发这个拉取动作的入口。理解这一点有助于你建立正确的心智模型。

### QR 码是团队协作工具，不是终端用户功能

`qr.expo.dev` 生成的 QR 码主要服务于开发和测试流程——让团队成员快速加载特定版本的更新进行测试。它不会出现在你的最终产品中。类比 Web 开发：它更像是"内部 Preview URL"，而不是面向用户的正式链接。

### 五种定位方式的选择

对于 Web 开发者来说，可能不太习惯有这么多方式来"定位一个更新"。可以这样理解：

- **按设备特征（Runtime Version + Channel）**：最接近"我在 staging 环境看最新部署"的体验。
- **按 Update ID**：最接近"我看某次具体 commit 的部署"。
- **按 Group ID**：最接近"我看某次 release 在多个平台上的部署"。
- **按 Branch ID / Channel ID**：最接近"我看某个分支 / 环境的最新部署"，通过内部 ID 而非名称来定位。

## 实际开发建议

1. **日常开发推荐"按设备特征定位"**：这是最自然的方式，和你的构建配置直接对应。团队新成员扫码即可开始测试。

2. **在 CI/CD 中使用 `format=url`**：如果你在 GitHub Actions 或其他 CI 平台中自动发布更新，可以在发布完成后自动生成 QR 码 URL，并发送到 Slack、飞书或钉钉群中，方便团队即时测试。

3. **记录你常用的参数组合**：项目 ID、Runtime Version、Channel 名称这些信息相对固定，可以保存为书签或脚本，避免每次手动拼 URL。

4. **调试时结合 `format=url`**：如果扫码后 App 没有正确加载更新，可以先用 `format=url` 拿到深度链接，手动在浏览器中打开，检查链接是否正确。

## 总结

`qr.expo.dev` 是 Expo 生态中一个实用的开发协作工具。它通过简单的 HTTP 查询参数生成 QR 码，让开发团队成员能够快速在手机上加载指定的 EAS Update 更新。

核心要点：

- 它是一个云端服务，通过 URL 参数配置生成 QR 码或纯文本 URL
- 支持五种定位更新的方式，分别适用于不同的测试和发布场景
- 基础参数（`slug`、`host`、`format`）可以与任意定位方式组合
- `appScheme` 已弃用，应使用 `slug` 替代
- Runtime Version 必须与设备上的构建版本匹配，否则更新无法生效

对于从 React Web 转向 Expo 的开发者，最重要的是理解移动端的更新分发机制与 Web 有本质不同——QR 码就是弥合这个差异的桥梁之一。

---

## 文档导航

- **上一页**：[create expo module](./247__create-expo-module.md)
- **下一页**：[release statuses](./249__release-statuses.md)
