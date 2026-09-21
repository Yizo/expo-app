# 236｜Expo Updates v1 OTA 更新协议

**翻页：**[上一页：Expo 第三方库 WebView](./235-Expo-ThirdParty-WebView.md) · [目录](./README.md) · [下一页：Expo Structured Field Values](./237-Expo-Structured-Field-Values.md)

**官方页面：**[Expo Updates v1](https://docs.expo.dev/technical-specs/expo-updates-1/)

**规范版本：**Version 1。此页是 Expo Updates 与更新服务器之间通信的协议规范，不是某个 SDK 的安装指南；官方页面没有单独的 SDK v56 版本页。官方页面标注最后更新：2026-08-12。

## 这份规范解决什么问题

Expo Updates 是应用的 OTA（Over-the-Air，空中更新）协议：客户端在应用运行时向服务器查询是否有兼容的新 JavaScript bundle 和资源文件，再下载并保存更新。这里的「更新」由一个 **manifest（清单）** 和它引用的资源 **assets（资产/文件）** 组成。

本规范同时约束客户端和更新服务器。自己搭建更新服务器、实现兼容的客户端或排查 OTA 通信时才需要直接阅读它；一般 Expo 应用开发者通常通过 EAS Update 或 expo-updates 间接使用这些规则。

## 先认识几个词

| 名词 | 解释 |
| --- | --- |
| Manifest（清单） | 描述一次更新的 JSON 元数据，例如更新 ID、创建时间、runtime version、入口 bundle 和资源列表。它不是 bundle 本身。 |
| Asset（资产） | 更新实际需要下载的文件，例如 JavaScript bundle、图片和字体。 |
| Runtime version（运行时版本） | 标识原生运行时代码兼容范围的字符串。它在构建原生应用时确定；原生代码不兼容时，旧客户端不能安全运行新 bundle。 |
| Directive（指令） | 服务器发给客户端的动作消息，例如 EAS 的 `rollBackToEmbedded`，用于切回安装包内置的更新。 |
| Header（HTTP 请求头） | HTTP 请求或响应上的键值元数据。本协议使用它传递平台、协议版本、兼容版本、签名和缓存策略。 |
| Code signing（代码签名） | 使用私钥为 manifest 或 directive 生成签名，并让客户端用受信任证书验证来源和完整性。 |
| Multipart（多部分响应） | 一个 HTTP 响应体按 MIME 边界装入多个独立部分，可同时装 manifest、扩展和 directive。 |

## 规范用词

规范中的大写关键词具有约束性：`MUST` / `REQUIRED` 表示必须，`MUST NOT` 表示禁止，`SHOULD` / `RECOMMENDED` 表示通常应当（只有充分理由时才偏离），`MAY` / `OPTIONAL` 表示可选。实现方不能把这些词当作普通建议。

## 整体更新流程

1. 客户端先加载本地更新数据库中最近保存的更新；可根据 manifest metadata 过滤候选更新。
2. 客户端使用 HTTP `GET` 请求服务器，并在请求头中声明协议版本、平台和 runtime version。
3. 服务器返回兼容的最新更新、directive，或表示没有内容的响应。
4. 若返回新 manifest，客户端下载其列出的资源，验证文件哈希后保存，并更新本地过滤条件及服务器定义的请求头。
5. 若返回 directive，客户端按指令类型更新本地状态。

Manifest 与其 assets 合起来才是一份更新。客户端应在运行更新代码之前下载并保存入口文件及所需 assets。

## 客户端请求更新

客户端必须发出 `GET` 请求，并至少包含以下请求头：

- `expo-protocol-version: 1`：表明使用本规范的第 1 版。
- `expo-platform`：本规范定义的目标平台为 `ios` 或 `android`。若请求平台不是两者之一，服务器应返回 `400` 或 `404`。
- `expo-runtime-version`：当前原生客户端支持的 runtime version。
- 先前响应中的 `expo-server-defined-headers`：服务器要求客户端在后续请求中持续携带的自定义请求头。

客户端可以使用 `Accept` 表明接受的响应格式。使用代码签名的客户端还要通过 `expo-expect-signature` 声明需要服务器提供签名。

```http
expo-protocol-version: 1
accept: application/expo+json;q=0.9, application/json;q=0.8, multipart/mixed
expo-platform: ios
expo-runtime-version: 1.0.0
expo-expect-signature: sig, keyid="root", alg="rsa-v1_5-sha256"
```

`expo-expect-signature` 是 Expo Structured Field Values（Expo SFV）字典。示例要求服务器提供 `sig` 签名，并声明客户端预期的密钥 ID 和算法。协商格式不受支持或协议版本不兼容时，服务器宜返回 HTTP `406 Not Acceptable`。

## 服务器响应格式

服务器至少要支持以下一种响应格式：

| Content-Type | 内容 | 限制 |
| --- | --- | --- |
| `application/json` 或 `application/expo+json` | 响应头携带过滤器、自定义头等信息；响应体是 manifest JSON。 | 一次只能表示 manifest 更新，不能承载多部分 directive；若当前没有可返回的更新，服务器宜返回 `406`。 |
| `multipart/mixed` | 响应体由若干独立部分组成，可选包含 `manifest`、`extensions`、`directive`。 | 各部分顺序不固定；零长度响应表示没有新操作，但响应头仍应被处理。 |

服务器可同时支持两种格式。客户端请求了服务器不支持的格式时，服务器宜返回 `406`。没有 multipart 内容时也可以返回 `204 No Content`，此时不要求 `content-type` 响应头。

### 常见响应头

官方规范用星号表示由实现确定的值：

```http
expo-protocol-version: 1
expo-sfv-version: 0
expo-manifest-filters: <expo-sfv>
expo-server-defined-headers: <expo-sfv>
cache-control: *
content-type: *
```

- `expo-protocol-version` 必须是 `1`。
- `expo-sfv-version` 必须是 `0`。
- `expo-manifest-filters` 是 Expo SFV 字典，用于根据 manifest 的 `metadata` 过滤本地更新。客户端必须保存它，直到后续响应覆盖。
- `expo-server-defined-headers` 是 Expo SFV 字典，客户端必须保存并附加到后续更新请求，直到被新值覆盖。
- `cache-control` 应设置很短的缓存时间。规范推荐 `private, max-age=0`，以便客户端请求时能拿到最新 manifest；长缓存时间会导致客户端看到过期更新。
- `content-type` 由请求的 `Accept` 协商决定。

### 签名响应头

规范将 `expo-signature` 列为可选响应头。客户端请求代码签名时，服务器应在 manifest 或 directive 部分提供该头。它也是 Expo SFV 字典：

```http
expo-signature: *
```

字典中的 `sig` 必须包含 manifest 签名；`keyid` 可以标识服务器使用的密钥，`alg` 可以给出算法。客户端应依据 `keyid` 找到匹配证书，并且只在算法与证书约定一致时使用 `alg` 验签。

## Multipart 响应的各个部分

每个部分都要通过 `Content-Disposition` 的 `name` 参数标识，并声明自己的 `Content-Type`：

| 部分名称 | Content-Type | 内容 |
| --- | --- | --- |
| `manifest` | `application/json` 或 `application/expo+json` | 更新 manifest；启用代码签名时建议附带该部分的 `expo-signature`。 |
| `extensions` | `application/json` | 扩展对象；目前规范列出每个 asset 请求所需的自定义请求头。 |
| `directive` | `application/json` 或 `application/expo+json` | 动作指令；启用代码签名时建议附带 `expo-signature`。 |

例如，manifest 部分应带有类似 `content-disposition: form-data; name="manifest"` 的头。第一个参数的值可以不是 `form-data`，但 `name` 必须匹配相应部分名称。

## Manifest 数据结构

规范定义的 TypeScript 结构如下：

```ts
type Manifest = {
  id: string;
  createdAt: string;
  runtimeVersion: string;
  launchAsset: Asset;
  assets: Asset[];
  metadata: { [key: string]: string };
  extra: { [key: string]: any };
};

type Asset = {
  hash?: string;
  key: string;
  contentType: string;
  fileExtension?: string;
  url: string;
};
```

各字段的用途：

| 字段 | 说明 |
| --- | --- |
| `id` | 必须是唯一标识这份 manifest 的 UUID。 |
| `createdAt` | 创建时间；建议使用 ISO 8601。客户端据此判断哪份更新较新。 |
| `runtimeVersion` | 开发者定义的字符串，用来声明此更新所需的原生代码运行时。 |
| `launchAsset` | 应用入口文件。`fileExtension` 对它会被忽略，通常应省略。 |
| `assets` | 此 bundle 使用的其他资源数组，例如图片和字体。运行更新之前，客户端应将所有 assets（包括 `launchAsset`）下载到磁盘，并把 `key` 映射到文件位置。 |
| `metadata` | 字符串到字符串的键值映射，可供 `expo-manifest-filters` 过滤。 |
| `extra` | 可选的第三方附加信息。 |

`Asset` 字段说明：

- `hash`：文件的 Base64URL 编码 SHA-256 哈希，用于验证完整性。
- `key`：应用代码引用此文件时使用的标识，常由打包工具生成。
- `contentType`：文件 MIME 类型，例如 `application/javascript` 或 `image/jpeg`。
- `fileExtension`：保存文件时建议使用的扩展名，必须以 `.` 开头；例如 `.jpeg`。某些平台需要扩展名。若省略且客户端也没有本地扩展名规则，文件可能没有扩展名。
- `url`：客户端下载此文件的位置。

EAS 托管的 manifest 可以在 `extra` 中携带 EAS 项目 ID：

```json
{
  "extra": {
    "eas": {
      "projectId": "00000000-0000-0000-0000-000000000000"
    }
  }
}
```

## Extensions：为单个 asset 添加请求头

`extensions` 部分允许服务器为某个 asset 的下载请求提供额外 HTTP 请求头。字段名是 asset key，字段值是头名称到头值的字符串字典：

```ts
type Extensions = {
  assetRequestHeaders: ExpoAssetHeaderDictionary;
  ...
};

type ExpoAssetHeaderDictionary = {
  [assetKey: string]: {
    [headerName: string]: string;
  };
};
```

键和值都必须是字符串。客户端请求对应 asset 时必须携带这份字典指定的请求头。

## Directive：服务器指令

Directive 是服务器向客户端发送的动作，不是 JavaScript bundle。其基本形状为：

```ts
type Directive = {
  type: string;
  parameters?: { [key: string]: any };
  extra?: { [key: string]: any };
};
```

- `type` 指令类型。
- `parameters` 可携带该类型专属数据。
- `extra` 可携带 EAS 项目 ID 等可选元数据。
- 客户端和服务器可以约定自定义指令。EAS 使用过 `rollBackToEmbedded`，要求 `expo-updates` 使用安装包内嵌的更新，而不是其他已下载更新。

## 下载 Asset

对于 manifest 中每个资源 URL，客户端必须发出 `GET` 请求。请求最好声明可接受的媒体类型和支持的压缩格式，并附加 `assetRequestHeaders` 中为该文件指定的自定义头。

```http
accept: image/jpeg, */*
accept-encoding: br, gzip
```

## Asset 响应与缓存

Asset 的 URL 对应内容不得被修改或删除，因为客户端可能在任意时间下载某个更新的资源。若 manifest 包含 `hash`，客户端必须验证下载文件的 Base64URL SHA-256 值与 manifest 一致。

服务器响应必须声明资源 MIME 类型，并使用客户端在请求中表示支持的压缩格式（也可以不压缩）：

```http
content-encoding: br
content-type: application/javascript
```

由于同一个不可变 URL 永远对应同一份文件，资源适合长期缓存。规范建议：

```http
cache-control: public, max-age=31536000, immutable
```

服务器建议支持 Gzip 和 Brotli 压缩，以减少传输量。

## 代码签名与信任链

代码签名可以保护 manifest 和 directive。签名 manifest 会间接保护它引用的 assets，因为 manifest 包含 asset 哈希，客户端会校验哈希。客户端在使用已签名 manifest 或 directive、以及下载 manifest 对应的 assets 之前，必须先验证签名。

验证证书必须是客户端内置/设备系统信任的自签名根证书，或处于该根证书签发的证书链中。私钥应由服务端安全保管；客户端只分发用于验签的公钥证书。

## 新手记忆

- OTA 更新仍运行在安装包提供的原生运行时中；它更新的是 JS 和静态资源，不能凭空添加原生模块。更改原生代码后，需要构建新的二进制并匹配新的 runtime version。
- `runtimeVersion` 控制「这段 JS 能否由当前原生程序运行」；manifest `id` 则标识某一次更新，二者用途不同。
- Manifest 提供资源清单；hash 用于资源完整性检查；HTTPS 保护传输；代码签名提供额外的发布者信任验证。这些安全机制解决的问题不同。
- 本页讲的是客户端与更新服务器的协议细节。日常应用开发优先使用 Expo 官方工具生成/发布更新，不需要手写这套 HTTP 协议。

## 本页代码覆盖

涵盖官方页的客户端请求头、常见响应头、签名响应头、Manifest / Asset TypeScript 类型、EAS `extra` 示例、Extensions 类型、Directive 类型、asset 请求头、asset 响应头和长期缓存示例。官方页没有完整 multipart 原始响应报文；本文用表格说明其规范要求。

**翻页：**[上一页：Expo 第三方库 WebView](./235-Expo-ThirdParty-WebView.md) · [目录](./README.md) · [下一页：Expo Structured Field Values](./237-Expo-Structured-Field-Values.md)
