# 183｜Expo SDK Manifests Expo 清单类型

**翻页：**[上一页：Expo SDK MailComposer 系统邮件撰写](./182-Expo-SDK-MailComposer.md) · [目录](./README.md) · [下一页：Expo SDK Maps](./184-Expo-SDK-Maps.md)

**官方页面：**[Manifests · Latest](https://docs.expo.dev/versions/latest/sdk/manifests/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/manifests/)

**版本与平台：**Latest 推荐 `expo-manifests ~57.0.2`；SDK v56.0.0 推荐 `~56.0.4`。类型参考标注 Android、iOS、tvOS 和 Expo Go。

## Manifest 是什么

**Manifest（清单）**是描述 Expo 应用或更新包的元数据对象。它能告诉客户端构建 / 更新的标识、资源 URL、运行时版本以及开发客户端信息。`expo-manifests` 页面主要提供 TypeScript 类型，不是读取设备信息或网络请求的 runtime API。

先分清两个名字：

- `EmbeddedManifest` 是编译进应用的嵌入式清单，构建阶段生成。
- `ExpoUpdatesManifest` 是 `expo-updates` 使用的更新清单，包含需要加载的资源和 runtime version。

项目级信息可放在 `ManifestExtra`：`scopeKey` 用来稳定地区分项目的客户端侧数据范围；使用 EAS 时可带 EAS 项目 UUID；Expo Go / 开发服务也有自己的客户端字段。

## 安装与导入

```sh
npx expo install expo-manifests
yarn expo install expo-manifests
pnpm expo install expo-manifests
bun expo install expo-manifests
```

在现有 React Native 工程中先接入 `expo`。命名空间导入方式：

```ts
import * as Manifests from 'expo-manifests';
```

此参考页不列出可调用函数；使用者主要引用它导出的类型来描述 Manifest 结构。

## 项目隔离与嵌入式清单

| 类型 | 结构 / 字段 | 说明 |
| --- | --- | --- |
| `ClientScopingConfig` | `scopeKey?: string` | 不透明的唯一字符串，用于隔离客户端侧项目数据。项目改名或转移账号时值保持不变。 |
| `EASConfig` | `projectId?: string` | 使用 EAS 时的项目 ID，格式为 UUID；转移或重命名后保持不变。 |
| `EmbeddedManifest` | `assets: any[]`、`commitTime: number`、`id: string` | 嵌入应用二进制中的 Manifest；构建时由 `createManifest.js` 构建步骤生成。 |
| `BareManifest` | 类型别名：`EmbeddedManifest` | 已弃用；官方说明已重命名为 `EmbeddedManifest`，之后几个版本会移除。 |

## Expo Client 与 Expo Go 配置

### `ExpoClientConfig`

它扩展 ExpoConfig；`hostUri?: string` 只会在通过 `@expo/cli` 开发时出现。

### `ExpoGoConfig`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `debuggerHost?` | `string` | 调试器地址。 |
| `developer?` | `Record<string, any> & { tool: string }` | 开发者与工具元信息。 |
| `mainModuleName?` | `string` | 主入口模块名。 |
| `packagerOpts?` | `ExpoGoPackagerOpts` | Metro / Expo Go 打包服务参数。 |

### `ExpoGoPackagerOpts`

类型以 `Record<string, any>` 为基础，并补充这些可选属性：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `dev?` | `boolean` | 是否开发模式。 |
| `hostType?` | `string` | 主机类型。 |
| `lanType?` | `string` | 局域网连接类型。 |
| `minify?` | `boolean` | 是否压缩代码。 |
| `strict?` | `boolean` | 是否使用严格模式。 |
| `urlRandomness?` | `string` | URL 随机部分。 |
| `urlType?` | `string` | URL 类型。 |

这些是清单中的打包 / 开发客户端字段。通常由 Expo CLI / Expo Go 生成，不应当作为应用业务配置随意修改。

## Expo Updates 清单

`ExpoUpdatesManifest` 描述 `expo-updates` 更新资源：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `assets` | `any[]` | 应用资源列表。 |
| `createdAt` | `string` | 创建时间。 |
| `extra?` | `ManifestExtra` | EAS / Expo Client / Expo Go 及项目隔离配置。 |
| `id` | `string` | 清单标识。 |
| `launchAsset` | `ManifestAsset` | 启动资源。 |
| `metadata` | `object` | 附加元数据。 |
| `runtimeVersion` | `string` | 该更新适用的 runtime version。 |

资源与 extra 的结构：

| 类型 | 结构 |
| --- | --- |
| `ManifestAsset` | `{ url: string }`，表示资源地址。 |
| `ManifestExtra` | `ClientScopingConfig` 扩展类型，另含 `eas?: EASConfig`、`expoClient?: ExpoClientConfig`、`expoGo?: ExpoGoConfig`。 |
| `NewManifest` | 类型别名：`ExpoUpdatesManifest`。 |

`NewManifest` 已弃用并重命名为 `ExpoUpdatesManifest`，官方提示会在之后几个版本移除。新代码应引用新类型名。

一个示意结构（字段值仅为说明类型形状，不代表 Expo 服务端返回的完整对象）：

```ts
const updateInfo: Manifests.ExpoUpdatesManifest = {
  id: 'update-id',
  createdAt: '2026-09-21T00:00:00Z',
  runtimeVersion: '1.0.0',
  metadata: {},
  assets: [{ url: 'https://cdn.example.test/assets/screen.bundle' }],
  launchAsset: { url: 'https://cdn.example.test/assets/index.bundle' },
  extra: {
    scopeKey: 'project-scope',
    eas: { projectId: '00000000-0000-4000-8000-000000000000' },
  },
};
```

> 页面类型只定义 `metadata: object` 和 `assets: any[]`，没有在本参考中进一步约束其内部字段；上例是理解层级的示意。

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-manifests ~57.0.2`；SDK v56.0.0 推荐 `~56.0.4`。
- 两版类型命名、字段、嵌入式 / 更新 Manifest 区分和弃用别名一致；没有运行时方法差异。
- Latest 页面列出 `npx`、Yarn、pnpm、Bun 安装命令；v56 页可见默认 `npx expo install expo-manifests` 命令。
- 两版页脚 Next 均是 Expo SDK Maps。

## 源页代码主题覆盖

- Installation：覆盖 Expo package manager 安装命令与现有 React Native 项目需要 Expo 的说明。
- API import：保留官方 `import * as Manifests from 'expo-manifests'` 命名空间导入。
- Types：逐项说明所有公开类型：`BareManifest`、`ClientScopingConfig`、`EASConfig`、`EmbeddedManifest`、`ExpoClientConfig`、`ExpoGoConfig`、`ExpoGoPackagerOpts`、`ExpoUpdatesManifest`、`ManifestAsset`、`ManifestExtra`、`NewManifest`。
- 源页没有 runnable Usage 代码；本文的 TypeScript 对象是按字段表重写的类型形状示意，`metadata` / `assets` 内部结构仍按官方页面声明为宽泛类型。

**翻页：**[上一页：Expo SDK MailComposer 系统邮件撰写](./182-Expo-SDK-MailComposer.md) · [目录](./README.md) · [下一页：Expo SDK Maps](./184-Expo-SDK-Maps.md)
