# 103｜EAS Update Request Proxying

**翻页：**[上一页：不使用其他 EAS 服务独立接入 EAS Update](./102-EAS-Update-Without-EAS.md) · [目录](./README.md) · [下一页：从 CodePush 迁移](./104-从-CodePush迁移.md)

**官方页面：**[Request proxying](https://docs.expo.dev/eas-update/request-proxying/)

**版本边界：**这是当前未版本化的 EAS CLI / 服务端指南，不属于某个 SDK 专属 API。项目使用 Expo ~56.0.11；修改 proxy 配置后按官方指南运行 eas update:configure，并针对实际网络网关设置转发。本文中的命令仅作示例，没有在本地执行。

## 为什么要代理 Update 请求

Request proxying 让 App 的更新请求先经过团队自己的服务器，再转发给 EAS。自有服务器可以统一加请求头、记录请求、落实企业安全策略，或在转发时隐藏客户端 IP。配置分成两种流量：更新资源（JavaScript bundle、图片等）与更新清单（manifest）；两种请求要分别代理。

## 两类代理服务器必须正确转发

| 请求种类 | 上游 EAS 主机 | URL 与请求头要求 |
| --- | --- | --- |
| 更新资源 | `assets.eascdn.net` | 原样保留路径、query 等 URL 内容；转发 `expo-` / `eas-` 前缀请求头，以及 `authorization`、`a-im`。 |
| 更新清单 | `u.expo.dev` | 原样保留路径、query 等 URL 内容；转发 `expo-` / `eas-` 前缀请求头。 |

不要让反向代理重写 EAS 请求 URL 或丢弃版本、平台、channel 等头字段，否则服务端可能返回错误的 manifest 或资源。资源请求与清单请求使用不同 Host，因此要配置两个端点。

## 在 eas.json 中声明自定义 Host

在 `cli` 对象中填写代理服务器的 hostname（示例域名需替换成自己部署的代理）：

```json
{
  "cli": {
    "updateAssetHostOverride": "asset-proxy.example.com",
    "updateManifestHostOverride": "manifest-proxy.example.com"
  }
}
```

`updateAssetHostOverride` 用于 bundle / 图片等资源；`updateManifestHostOverride` 用于更新 manifest。两个字段描述各自的代理 Host，不是上游 EAS Host。

## 应用配置并验证结果

保存配置后运行 EAS Update 配置命令，再发布一次测试更新：

```sh
eas update:configure
eas update
```

之后到 EAS Update Dashboard 打开该 update group，并在目标平台选择 **View Metadata**：manifest.json 中应显示覆盖后的 `manifestHostOverride`，其他资源的 URL 应显示 `assetHostOverride`。如果 URL 仍直连 EAS，先检查配置文件位置、代理 DNS / TLS 与请求代理是否保持了源路径和查询参数。

## 关键名词

- **Proxy / 反向代理：**客户端请求先发到自有服务，自有服务再代表客户端访问上游 EAS 服务。
- **Manifest：**描述一次更新的元数据，例如平台、runtimeVersion 和各资源列表；客户端据此决定是否能应用该更新。
- **Asset：**更新实际使用的资源文件，如 JavaScript bundle、图片和字体。
- **Host Override：**把 Update 请求目标主机改为自有代理主机；代理再按配置转到 EAS 上游。
- **请求头透传：**反向代理收到客户端请求后，把必要的头原样转发给上游。EAS 依赖这些头来识别更新请求上下文。

## 官方代码主题覆盖

源页列出的代码主题全部覆盖：eas.json 中资源与 manifest 两个 host override 字段、应用配置的 `eas update:configure` 命令、发布验证用的 `eas update` 命令，以及在 Dashboard 的 View Metadata 核对 manifest 和 assets 主机名。

## 下一页

官方页脚 **Next** 是 [Migrate from CodePush](https://docs.expo.dev/eas-update/codepush/)，介绍将 React Native 项目从 CodePush 更新机制迁移至 EAS Update。

**翻页：**[上一页：不使用其他 EAS 服务独立接入 EAS Update](./102-EAS-Update-Without-EAS.md) · [返回目录](./README.md) · [下一页：从 CodePush 迁移](./104-从-CodePush迁移.md)
