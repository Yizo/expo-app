# 241｜qr.expo.dev 生成 EAS Update 二维码

**翻页：**[上一页：create-expo-module 原生模块生成器](./240-Create-Expo-Module.md) · [目录](./README.md) · [下一页：Expo 发布状态](./242-Release-Statuses.md)

**官方页面：**[qr.expo.dev](https://docs.expo.dev/more/qr-codes/)

**版本范围：**Expo 当前未版本化工具参考；页面标注更新于 2026-05-14。`qr.expo.dev` 是 Expo 提供的云端二维码生成端点。二维码内容用于在 development build 或 Expo Go 中预览 EAS Update，常见场景是让团队扫描后打开某个 runtime 与 channel 对应的更新。

## 基本工作方式

开发版 / Expo Go 扫描二维码后，会先打开一个 App deep link（深层链接），再向 EAS Update 服务请求匹配的 JavaScript 更新。示例 endpoint 根据 EAS project id、build 的 runtime version 和 channel 生成 SVG：

```text
https://qr.expo.dev/eas-update?projectId=your-project-id&runtimeVersion=your-runtime-version&channel=your-channel
```

生成的二维码指向 development build 的深层链接，形式类似：

```text
exp+my-app://expo-development-client/?url=https://u.expo.dev/your-project-id?runtime-version=your-runtime-version&channel-name=your-channel
```

如果分享文本链接比分享 SVG 更方便，在 query 加 `format=url` 就会直接返回 URL：

```text
https://qr.expo.dev/eas-update?projectId=your-project-id&runtimeVersion=your-runtime-version&channel=your-channel&format=url
```

## 通用查询参数

这些参数可用于 `/eas-update` 请求：

| 参数 | 默认值 | 作用 |
| --- | --- | --- |
| `slug` | `exp` | 使用 Expo app config 的应用 slug；使用 `exp` 时目标为 Expo Go，配置了 App slug 后可指向对应 development build。 |
| `appScheme` | `exp` | 旧参数，已弃用；请使用 `slug`。 |
| `host` | `u.expo.dev` | EAS Update 请求的服务器 host。 |
| `format` | `svg` | 返回格式。缺省为 Expo 风格二维码 SVG；设为 `url` 后返回纯文本深层链接。 |

## 按设备属性选择 Update

Preview / production build 会携带 `runtimeVersion` 和 `channel` 向 EAS Update 请求内容。生成预览二维码时，可以显式设置相同属性，让目标 App 按对应 build 的更新兼容规则取内容：

| 参数 | 说明 |
| --- | --- |
| `projectId` | EAS 项目唯一标识。 |
| `runtimeVersion` | 当前原生 binary 的 runtime 版本；Update 必须与它兼容。 |
| `channel` | 构建配置选择的更新渠道名称。 |

```text
https://qr.expo.dev/eas-update?projectId=your-project-id&runtimeVersion=your-runtime-version&channel=your-channel
```

### 指定 Update ID

通过某个平台对应的 update id 生成二维码：

```text
https://qr.expo.dev/eas-update?updateId=your-update-id
```

### 指定 Update group

一个 group 代表关联发布的一组平台更新；需要同时给 EAS 项目 id 与 group id：

```text
https://qr.expo.dev/eas-update?projectId=your-project-id&groupId=your-update-group-id
```

### 指定 Branch

按 branch id 选择该分支当前可用的最新更新：

```text
https://qr.expo.dev/eas-update?projectId=your-project-id&branchId=your-branch-id
```

### 指定 Channel

Channel 会映射到一个或多个 branch。给定 channel id 后，生成的二维码会让设备取其映射分支中可用的最新更新：

```text
https://qr.expo.dev/eas-update?projectId=your-project-id&channelId=your-channel-id
```

## 新手名词解释

- **EAS Update：**把 JavaScript / 图片等非原生二进制更新发布到已安装 App 的服务。它不能替换已经编译进 App 的原生模块。
- **Project ID：**EAS 上某个应用项目的唯一 id，用来确定请求属于哪个 Expo 项目。
- **Runtime version：**原生 App 与 OTA Update 的兼容标记。包含新原生代码的 build 不能随意加载旧 runtime 的更新。
- **Channel：**build 用来选择更新线路的名称，通常会映射到一个或多个 branch。
- **Branch：**EAS Update 管理的更新分支，包含该分支的版本历史。
- **Update ID：**某个平台某一份 Update 的唯一标识；与 group 不同，它直接定位到单一更新记录。
- **Update group：**一次跨平台发布的关联更新集合，便于按同一发布批次引用。
- **Slug：**app config 中的项目短名称。旧 `appScheme` 默认 `exp` 的行为已由 `slug` 承接。
- **Deep link：**能启动 App 并携带目标地址的 URL。Expo Go 与自定义 development build 使用不同的 scheme / 启动路由。
- **SVG 二维码：**默认返回的矢量图内容，可在不同尺寸下缩放；设置 `format=url` 时返回二维码中实际携带的纯文本 URL。

## 源页代码主题覆盖

本页重写覆盖 7 个官方 URL 代码例子：主页面的 device-traits URL、生成后的 development build deep link、Update by device traits 示例，以及按 update id、group id、branch id、channel id 选择更新的四类请求。另补充 `format=url` 的纯文本 URL 示例。通用参数、默认值与不同 id 对应的查找范围在表格中说明。

**翻页：**[上一页：create-expo-module 原生模块生成器](./240-Create-Expo-Module.md) · [目录](./README.md) · [下一页：Expo 发布状态](./242-Release-Statuses.md)

