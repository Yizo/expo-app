# Expo DocumentPicker 学习指南

`expo-document-picker` 用于打开操作系统提供的文件选择界面，让用户从设备及其可用的文件提供方中选择文档。

支持平台：

- Android
- iOS
- Web
- Expo Go

> 本文来源页面属于“下一版本 SDK”的未发布文档。原文明确指出，当前最新稳定版本是 SDK 56。实际项目应确认正在使用的 Expo SDK 版本，并参考对应版本的文档。

## 文档解决的问题

这篇文档主要说明：

1. 如何安装 `expo-document-picker`。
2. 如何打开系统文件选择器。
3. 如何限制可选择的文件类型以及启用多选。
4. 如何处理选择成功和取消选择两种结果。
5. 如何让 `expo-file-system` 在选择文件后立即读取文件。
6. 如何为 iOS 的 iCloud 文档能力进行构建期配置。
7. Android、iOS 和 Web 之间存在哪些行为差异。

它适合以下场景：

- 选择 PDF、Word、压缩包等文档并上传。
- 选择图片或其他指定 MIME 类型的文件。
- 一次选择一个或多个文件。
- 选择文件后立即通过 Expo 文件系统 API 读取它。
- 在 iOS 中允许用户从 iCloud 文档存储中选择文件。

## React Web 开发者需要先理解的概念

### 系统文件选择界面

在 React Web 中，文件选择通常通过以下元素实现：

```html
<input type="file" />
```

在 React Native 中没有浏览器 DOM，也不能直接使用 `<input>`。`expo-document-picker` 会调用 Android 或 iOS 提供的原生文件选择界面。

Web 平台仍然受浏览器文件选择规则约束，但 Expo 将三个平台统一到了 `getDocumentAsync()` API 下。

### 文件提供方

“文件提供方”不只表示设备本地目录，还可能包括系统允许访问的其他存储来源，例如 iCloud。

具体显示哪些来源由设备平台、用户配置和应用能力共同决定，不是 React 组件自行渲染出来的列表。

### URI 不等同于浏览器 URL

选择成功后，每个文件都包含 `uri`。在原生平台中，它表示应用可访问的本地文件 URI，不应默认将其当作公开的 HTTP URL。

如果需要上传文件，应根据所使用的网络 API 构造请求，而不是假设该 URI 可以被服务器直接访问。

### Expo 配置插件与运行时代码

配置插件用于修改 iOS、Android 原生工程的构建配置。它与运行时调用 `getDocumentAsync()` 是两个不同阶段：

- `app.json` 中的插件配置：在构建应用时生效。
- `getDocumentAsync()` 的选项：应用运行时生效。

原文明确说明，配置插件能够设置无法在运行时修改的属性，这些修改需要重新构建应用二进制文件才能生效。

### CNG

CNG 是 Continuous Native Generation，即“持续生成原生工程”。

使用 CNG 时，Expo 可以依据应用配置和配置插件生成或更新原生工程。没有使用 CNG 的项目，需要自行修改相应的原生配置。

对于只接触过 React Web 的开发者，可以将其理解为：构建流程根据声明式配置生成 iOS 和 Android 工程设置，但这些设置最终仍然属于原生应用能力。

## 安装

根据项目使用的包管理器执行对应命令：

```sh
# npm
npx expo install expo-document-picker

# yarn
yarn expo install expo-document-picker

# pnpm
pnpm expo install expo-document-picker

# bun
bun expo install expo-document-picker
```

`expo install` 会安装适合当前 Expo SDK 的依赖版本。它和直接执行 `npm install` 的重点区别是会考虑 Expo SDK 的版本兼容关系。

如果这是一个已有的 React Native 原生项目，而不是标准 Expo 项目，原文要求先在项目中安装并配置 `expo`，才能使用该 Expo 模块。

## 基本使用流程

导入模块：

```js
import * as DocumentPicker from 'expo-document-picker';
```

在用户操作触发的事件中调用：

```js
const result = await DocumentPicker.getDocumentAsync();

if (result.canceled) {
  return;
}

const selectedFile = result.assets[0];

console.log(selectedFile.name);
console.log(selectedFile.uri);
```

完整流程是：

1. 用户点击按钮。
2. 应用调用 `getDocumentAsync()`。
3. 操作系统显示文件选择界面。
4. 用户选择文件或者退出界面。
5. Promise 返回成功结果或取消结果。
6. 应用先检查 `canceled`，再访问 `assets`。

`DocumentPickerResult` 是一个联合类型：

```ts
DocumentPickerSuccessResult | DocumentPickerCanceledResult
```

因此可以使用 `canceled` 作为类型判断条件：

```js
if (!result.canceled) {
  // 此处 result.assets 是文件数组
}
```

### 一个更完整的示例

```jsx
import { Button, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

export default function App() {
  async function selectDocuments() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      multiple: true,
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return;
    }

    for (const asset of result.assets) {
      console.log({
        name: asset.name,
        uri: asset.uri,
        size: asset.size,
        mimeType: asset.mimeType,
      });
    }
  }

  return (
    <View>
      <Button title="选择文件" onPress={selectDocuments} />
    </View>
  );
}
```

## `getDocumentAsync()`

支持 Android、iOS 和 Web。

该方法打开系统文件选择界面。默认情况下，在 Android 和 iOS 上，选中的文件会复制到应用内部缓存目录。

原文 API 页面将其列在“Component”部分并标注为 React Element，但从其调用方式和返回结果来看，开发时应按异步 API 调用，而不是当作 JSX 组件使用。

> “按异步 API 调用”是基于文档示例语义和选项、结果类型推导出的使用方式。

## 选择选项 `DocumentPickerOptions`

### `type`

类型：

```ts
string | string[]
```

默认值：

```text
*/*
```

用于限制系统界面中允许选择的 MIME 类型。

```js
await DocumentPicker.getDocumentAsync({
  type: 'application/pdf',
});
```

允许选择任意图片：

```js
await DocumentPicker.getDocumentAsync({
  type: 'image/*',
});
```

允许选择多种类型：

```js
await DocumentPicker.getDocumentAsync({
  type: ['application/pdf', 'image/*'],
});
```

允许选择任意文档：

```js
await DocumentPicker.getDocumentAsync({
  type: '*/*',
});
```

MIME 类型描述的是文件的媒体类型，例如：

- `application/pdf`：PDF。
- `image/png`：PNG 图片。
- `image/*`：任意图片类型。
- `*/*`：任意类型。

不要把 MIME 类型与文件扩展名混为一谈。这里配置的是 `application/pdf`，而不是 `.pdf`。

### `multiple`

类型：

```ts
boolean
```

默认值为 `false`。

设置为 `true` 后，允许用户在系统界面中选择多个文件：

```js
const result = await DocumentPicker.getDocumentAsync({
  multiple: true,
});
```

即使只允许选择一个文件，成功结果的 `assets` 仍然是数组，因此通常通过 `result.assets[0]` 取得第一个文件。

### `copyToCacheDirectory`

支持 Android 和 iOS，默认值为 `true`。

启用后，选中的文件会被复制到 Expo 文件系统的缓存目录，使其他 Expo API 可以立即读取它。

```js
const result = await DocumentPicker.getDocumentAsync({
  copyToCacheDirectory: true,
});
```

如果需要紧接着使用 `expo-file-system` 读取文件，原文明确要求确保该选项为 `true`。否则，文件系统不一定能在文件刚选择完时立即读取它。

代价是复制大文件可能影响性能。如果满足以下条件，可以考虑设置为 `false`：

- 用户可能选择非常大的文件。
- 应用不需要立即读取文件内容。

这里需要在“立即可读”与“避免大文件复制开销”之间做选择。

### `base64`

仅支持 Web，默认值为 `true`。

- `true`：资源 URL 使用文件的 Base64 数据。
- `false`：资源 URL 使用文件 URL 参数。

Base64 会把二进制文件编码成字符串。原文没有进一步讨论其内存消耗、上传方式或适用文件大小，因此不能仅根据本文得出相关限制。

## 选择结果

### 成功结果

成功时返回 `DocumentPickerSuccessResult`：

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `canceled` | `false` | 表示用户成功选择了文件 |
| `assets` | `DocumentPickerAsset[]` | 所有选中文件组成的数组 |
| `output` | `FileList`，可选 | 仅 Web，用于与 Web File API 保持一致 |

处理方式：

```js
if (!result.canceled) {
  result.assets.forEach(asset => {
    console.log(asset.name);
  });
}
```

Web 平台还可能提供原生 `FileList` 风格的 `output`。跨平台代码应优先围绕各平台都提供的 `assets` 编写，仅在明确处理 Web 时依赖 `output`。

> 跨平台优先使用 `assets` 是基于文档所列平台支持范围推导出的开发建议。

### 取消结果

取消时返回 `DocumentPickerCanceledResult`：

| 属性 | 值 | 含义 |
| --- | --- | --- |
| `canceled` | `true` | 请求被取消 |
| `assets` | `null` | 没有选中的文件 |
| `output` | `null`，可选 | 仅 Web |

原生平台应先检查 `canceled`，否则直接读取 `result.assets[0]` 可能访问到 `null`。

Web 是特殊情况：由于平台限制以及不同浏览器行为不一致，浏览器不会可靠地返回取消事件。因此，不应依赖 Web 在用户关闭文件选择界面后一定返回取消结果。

## 文件信息 `DocumentPickerAsset`

每个选中的文件对应一个 `DocumentPickerAsset`：

| 属性 | 类型 | 平台与含义 |
| --- | --- | --- |
| `name` | `string` | 文件原始名称 |
| `uri` | `string` | 本地文件 URI |
| `size` | `number`，可选 | 文件大小，单位为字节 |
| `mimeType` | `string`，可选 | 文件 MIME 类型 |
| `lastModified` | `number` | 最后修改时间戳 |
| `base64` | `string`，可选 | 仅 Web，文件的 Base64 字符串 |
| `file` | `File`，可选 | 仅 Web，与浏览器 File API 对齐 |

### `lastModified`

该值是从 Unix 纪元开始计算的毫秒数，即从 1970 年 1 月 1 日 00:00 开始计算。

可以在 JavaScript 中转换为日期：

```js
const modifiedAt = new Date(asset.lastModified);
```

如果文件没有已知的最后修改日期，则返回当前日期。这意味着它不一定能证明文件确实在当前时间被修改。

### 可选属性的处理

`size`、`mimeType`、`base64` 和 `file` 都可能不存在。代码不应假设每个平台、每个文件都能返回这些值：

```js
if (asset.size !== undefined) {
  console.log(`文件大小：${asset.size} 字节`);
}
```

其中 `base64` 和 `file` 明确只支持 Web，不能用于通用的 Android、iOS 文件处理逻辑。

## 与 `expo-file-system` 配合

文件选择和文件读取是两个不同步骤：

- `expo-document-picker`：让用户选择文件并返回文件信息。
- `expo-file-system`：读取或操作应用可访问的文件。

原文指出，选择器返回文件后，文件系统不一定能够立刻读取原始位置中的文件。需要立即读取时，应复制到应用缓存目录：

```js
const result = await DocumentPicker.getDocumentAsync({
  copyToCacheDirectory: true,
});

if (!result.canceled) {
  const uri = result.assets[0].uri;
  // 随后交给 expo-file-system 读取
}
```

该复制行为默认已启用，但显式设置能够清楚表达代码依赖“选择后立即读取”的前提。

缓存目录是应用内部的临时存储位置。原文没有说明缓存文件的长期保存期限或清理策略，因此本文不能将其视为永久存储。

## Web 平台限制

### 必须由用户操作触发

Web 浏览器只允许在用户激活后显示系统文件选择界面，例如点击按钮：

```jsx
<Button title="选择文件" onPress={selectDocuments} />
```

不能在组件挂载时自动调用：

```js
componentDidMount() {
  DocumentPicker.getDocumentAsync();
}
```

这种调用没有直接关联用户操作，浏览器不会按预期打开文件选择界面。

这与 React Web 中 `<input type="file">` 或 `window.open()` 等受安全策略限制的 API 类似：浏览器要防止页面未经允许主动弹出系统界面。

### 无法可靠获知用户取消

用户关闭浏览器文件选择窗口后，Web 平台不会返回可靠的取消事件。这是浏览器平台限制和浏览器间差异造成的，不是 Expo 可以完全统一的行为。

因此，Web 业务流程不能设计成“必须收到取消回调才能恢复状态”。

## iOS iCloud 配置

只有需要 iCloud 文档存储能力时，才需要本节配置。一般的本地文件选择不应与 iCloud 能力配置混为一谈。

### 使用 CNG 和配置插件

首先在 Expo 应用配置中启用：

```json
{
  "expo": {
    "ios": {
      "usesIcloudStorage": true
    }
  }
}
```

然后可以配置 `expo-document-picker` 插件：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-document-picker",
        {
          "iCloudContainerEnvironment": "Production"
        }
      ]
    ]
  }
}
```

`usesIcloudStorage` 用于启用 iCloud 存储能力；插件中的属性用于进一步设置 iOS entitlement。

在本地运行 EAS Build 时，EAS 会通过 iOS capabilities signing 在构建前启用所需能力。

这些配置无法在应用运行时临时开启。修改后必须重新构建应用二进制文件。

### `iCloudContainerEnvironment`

- 仅支持 iOS。
- 默认值为 `undefined`。
- 可选值为 `Development` 或 `Production`。
- 设置 AdHoc iOS 构建使用的 `com.apple.developer.icloud-container-environment` entitlement。

Entitlement 可以理解为由 iOS 签名体系验证的应用权限声明。它不是普通 JavaScript 配置，也不能通过运行时代码获得或修改。

### `kvStoreIdentifier`

- 仅支持 iOS。
- 默认值为 `undefined`。
- 覆盖默认的 `com.apple.developer.ubiquity-kvstore-identifier` entitlement。
- 默认标识由 Apple Team ID 与应用 Bundle Identifier 组成。

如果应用在启用 iCloud 后转移到了另一个 Apple Team，可能需要覆盖该值。

Bundle Identifier 是 iOS 应用的全局标识，例如 `dev.expo.my-app`；Apple Team ID 标识应用所属的 Apple 开发者团队。

### 不使用 EAS Build 时的手动配置

如果项目不使用 EAS Build，但需要 iCloud 存储能力，原文要求手动为 Bundle Identifier 配置支持 CloudKit 的 iCloud 服务。

在 Apple Developer Console 中启用 iCloud capability 后，还需要修改：

```text
ios/[app]/[app].entitlements
```

示例：

```xml
<key>com.apple.developer.icloud-container-identifiers</key>
<array>
    <string>iCloud.dev.expo.my-app</string>
</array>
<key>com.apple.developer.icloud-services</key>
<array>
    <string>CloudDocuments</string>
</array>
<key>com.apple.developer.ubiquity-container-identifiers</key>
<array>
    <string>iCloud.dev.expo.my-app</string>
</array>
<key>com.apple.developer.ubiquity-kvstore-identifier</key>
<string>$(TeamIdentifierPrefix)dev.expo.my-app</string>
```

其中 `dev.expo.my-app` 应替换为实际 Bundle Identifier。

Apple Developer Console 中还必须创建一个 iCloud Container：

- 描述可以使用任意名称。
- Identifier 必须采用 `iCloud.<your_bundle_identifier>` 格式。
- 该值应与两个 container identifier entitlement 中使用的值一致。

这部分涉及 Apple 开发者后台、原生工程文件、签名能力和应用标识。它不是类似 Web 环境变量的普通文本配置；值不一致可能导致构建、签名或 iCloud 能力无法正常工作。

## 主要限制与坑点

1. 当前页面是下一版本 SDK 的文档，不应直接假设所有内容都已适用于正在使用的稳定 SDK。
2. Web 必须在按钮点击等用户操作中调用选择器。
3. Web 无法可靠返回用户取消事件。
4. 成功结果中的 `assets` 始终是数组，即使只选择一个文件。
5. 访问 `assets` 前必须判断 `canceled`。
6. `size` 和 `mimeType` 等字段是可选值，不能无条件使用。
7. Web 专属的 `file`、`base64` 和 `output` 不适合放进无平台判断的跨平台逻辑。
8. 使用 `expo-file-system` 立即读取文件时，应保持 `copyToCacheDirectory: true`。
9. 复制大文件到缓存目录可能造成性能开销。
10. iCloud 配置属于构建期原生能力，修改后需要重新构建应用。
11. 不使用 CNG 或 EAS Build 时，可能需要手动维护 Apple Developer Console 和 entitlement 配置。

## 实际开发中的使用方式

### 文件上传

选择文件后，应依次进行：

1. 检查是否取消。
2. 从 `assets` 取得文件。
3. 检查业务需要的元数据是否存在。
4. 根据业务规则验证类型和大小。
5. 使用项目的网络请求方案上传。

文档只负责说明如何选择文件及其返回数据，没有说明具体上传协议、请求体格式、服务端处理方式或上传进度管理。

### 多文件选择

启用 `multiple: true` 后，应处理完整的 `assets` 数组，而不是只读取第一项：

```js
const result = await DocumentPicker.getDocumentAsync({
  multiple: true,
});

if (!result.canceled) {
  for (const asset of result.assets) {
    // 分别处理每个文件
  }
}
```

原文没有说明一次最多可选择多少文件，也没有规定总大小限制。这些限制需要由业务自行定义，并结合各平台实际行为验证。

### 跨平台数据模型

可以优先使用所有平台共有的字段：

```ts
type SelectedDocument = {
  name: string;
  uri: string;
  size?: number;
  mimeType?: string;
  lastModified: number;
};
```

Web 专属的 `File`、`FileList` 和 Base64 数据可以保留在 Web 分支中。

> 以上统一数据模型属于基于文档内容推导的实现建议，并非原文提供的类型。

### 基于经验建议

- 文件选择调用应使用 `try/catch` 处理运行时异常。`canceled` 表示用户取消，不等同于程序异常。
- 不要只根据文件名扩展名判断文件是否合法；服务端仍应验证实际文件内容。
- 选择大文件时，应在上传前向用户显示文件名称和大小，并由业务设置大小限制。
- 修改 iCloud entitlement 后，应使用真实 iOS 构建进行验证，不能只依赖 JavaScript 开发环境。
- 如果需要长期保存选中的文件，不要默认缓存目录可以作为永久存储位置，应另行设计持久化流程。

这些属于通用开发经验，原文没有明确规定。

## 文档未涉及的内容

当前文档未涉及：

- 文件上传 API 和服务器端接收方式。
- 上传进度、暂停、重试和断点续传。
- 文件内容验证和安全扫描。
- 文件数量与文件大小的固定上限。
- 缓存文件的清理时间和永久保存策略。
- 文件选择相关的自动化测试方法。
- Android 或 iOS 各版本系统选择器的 UI 差异。
- 错误类型、异常结构及错误码。
- 运行时权限申请流程。

## 总结

`expo-document-picker` 的核心职责是调用系统文件选择界面，并以统一结果结构返回用户选择的文件。

开发时最重要的是区分三层内容：

- 运行时选择：调用 `getDocumentAsync()` 并处理 `canceled` 与 `assets`。
- 文件读取：需要立即通过 `expo-file-system` 读取时，启用 `copyToCacheDirectory`。
- 原生构建能力：iOS iCloud 需要配置插件、entitlement、Apple Developer Console，并重新构建应用。

对 React Web 开发者而言，最大的认知变化是：文件选择不再只是 DOM 输入控件；它还涉及设备文件 URI、应用缓存目录、平台差异、原生能力声明以及 iOS 签名配置。

---

## 文档导航

- **上一页**：[dev menu](./167__dev-menu.md)
- **下一页**：[filesystem](./169__filesystem.md)
