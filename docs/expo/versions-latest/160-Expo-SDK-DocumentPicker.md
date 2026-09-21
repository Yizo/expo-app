# 160｜Expo SDK DocumentPicker 文档选择器

**翻页：**[上一页：Expo SDK DevMenu 开发者菜单](./159-Expo-SDK-DevMenu.md) · [目录](./README.md) · [下一页：Expo SDK FileSystem 文件系统](./161-Expo-SDK-FileSystem.md)

**官方页面：**[DocumentPicker · Latest](https://docs.expo.dev/versions/latest/sdk/document-picker/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/document-picker/)

**版本与平台：**Latest 推荐 `expo-document-picker ~57.0.2`，SDK v56.0.0 推荐 `~56.0.4`。支持 Android、iOS、Web，包含在 Expo Go 中。两版的 picker options、返回结构、iCloud 配置和 Next 内容一致，只有推荐安装版本不同。

## 系统文件选择器

`expo-document-picker` 打开 Android / iOS 系统文件选择器，或 Web 浏览器的文件选择 UI。它返回选中文档的元数据和 URI；Android / iOS 默认会把文件复制到应用 cache，之后可交给 Expo FileSystem 读取。Web 需要由用户操作触发文件选择器。

安装：

```sh
npx expo install expo-document-picker
# 也可以使用：yarn expo install expo-document-picker
# 或：pnpm expo install expo-document-picker
# 或：bun expo install expo-document-picker
```

下面的例子将 picker 放在按钮事件里，按 MIME type 限制 PDF，用户取消时检查 `canceled`，成功时读取返回的第一个 asset：

```tsx
import { useState } from 'react';
import { Button, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

export default function PickPdf() {
  const [pickedName, setPickedName] = useState('');

  async function chooseDocument() {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      const document = result.assets[0];
      setPickedName(`${document.name} (${document.size ?? 0} bytes)`);
      console.log(document.uri, document.mimeType);
    }
  }

  return (
    <View>
      <Button title="选择 PDF" onPress={() => void chooseDocument()} />
      <Text>{pickedName || '尚未选择文件'}</Text>
    </View>
  );
}
```

Web 的文件选择 UI 只能在用户交互（例如点击按钮）后弹出；不要在页面加载时自动调用。浏览器取消选择时不会稳定地触发取消事件，应该根据返回的结果对象判断是否取消。

## iCloud 文件来源配置

要让 iOS 用户从 iCloud Drive 选择文件，在 app config 启用 `ios.usesIcloudStorage`，并可通过 plugin 指定 Ad Hoc iOS build 使用的容器环境：

```json
{
  "expo": {
    "ios": {
      "usesIcloudStorage": true
    },
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

这些 config plugin / entitlement 设置不能运行时修改，重新构建原生 app 后才生效。使用 EAS Build 时，本地 EAS Build 会通过 iOS capabilities signing 帮忙启用所需 capability。

| config plugin 属性 | 默认值 | 说明 |
| --- | --- | --- |
| `iCloudContainerEnvironment` | 未设置 | 仅 iOS；为 Ad Hoc iOS builds 指定 iCloud container environment：`Development` 或 `Production`。 |
| `kvStoreIdentifier` | 未设置 | 仅 iOS；覆盖 `com.apple.developer.ubiquity-kvstore-identifier`，默认值使用 Apple Team ID 和 bundle identifier。应用转移到另一个 Apple Team 后，可能需要配置它。 |

若手动维护 iOS 原生工程且不使用 EAS Build，要从 iCloud 选文件，需在 Apple Developer Console 为 bundle identifier 启用 iCloud + CloudKit，并在 `ios/<App>/<App>.entitlements` 写入相应容器标识、CloudDocuments 服务和 ubiquitous key-value store identifier。下面保留官方配置代码形态：

```xml
<key>com.apple.developer.icloud-container-identifiers</key>
<array>
  <string>iCloud.example.my-app</string>
</array>
<key>com.apple.developer.icloud-services</key>
<array>
  <string>CloudDocuments</string>
</array>
<key>com.apple.developer.ubiquity-container-identifiers</key>
<array>
  <string>iCloud.example.my-app</string>
</array>
<key>com.apple.developer.ubiquity-kvstore-identifier</key>
<string>$(TeamIdentifierPrefix)example.my-app</string>
```

创建 iCloud Container 时，identifier 要与 entitlement 里的 `iCloud.<bundle_identifier>` 一致。

## 与 Expo FileSystem 配合

DocumentPicker 选中的文件并不总能立即被 `expo-file-system` 读取。Android / iOS 上使用 `getDocumentAsync` 时把 `copyToCacheDirectory` 设为 `true`，会先复制到应用 cache，让其它 Expo API 可以马上访问。复制大文件需要时间 / 空间；若马上无需读取它，可设为 `false`。

```ts
const result = await DocumentPicker.getDocumentAsync({
  copyToCacheDirectory: true,
});

if (!result.canceled) {
  const fileUri = result.assets[0].uri;
  // 可把 fileUri 交给 FileSystem 操作。
}
```

`getDocumentAsync(options?)` 的默认文件类型是 `*/*`（任意类型）、`multiple` 默认 `false`。接受多种格式时传 MIME type 数组，也可用通配符（例如 `image/*`）。

## API 与返回数据

模块命名空间导入：

```ts
import * as DocumentPicker from 'expo-document-picker';
```

`getDocumentAsync` 打开系统 / 浏览器文件选择 UI。成功结果和取消结果是一个 discriminated union（通过 `canceled` 字段区分的联合类型）：

| 返回字段 | 成功：`DocumentPickerSuccessResult` | 取消：`DocumentPickerCanceledResult` |
| --- | --- | --- |
| `canceled` | `false` | `true` |
| `assets` | `DocumentPickerAsset[]` | 固定 `null` |
| `output` | Web 上为 `FileList`（可选） | Web 上为 `null`（可选） |

每个 `DocumentPickerAsset` 包含：

| 字段 | 类型 / 平台 | 含义 |
| --- | --- | --- |
| `name` | `string` | 文件原始名称。 |
| `uri` | `string` | 本地文档文件 URI。 |
| `mimeType` | 可选 `string` | 文档 MIME type，可能未提供。 |
| `size` | 可选 `number` | 文件大小，单位字节。 |
| `lastModified` | `number` | 最后修改时间的 Unix epoch 毫秒；未知时间时使用当前时间。 |
| `base64` | 可选 `string`；仅 Web | Base64 文件内容。 |
| `file` | 可选 Web `File` 对象；仅 Web | 与浏览器 Web File API 对齐的文件对象。 |

`DocumentPickerOptions`：

| 选项 | 类型 / 默认值 | 用途 |
| --- | --- | --- |
| `type` | `string \| string[]`；默认 `'*/*'` | 可选择的 MIME type；支持数组和 `image/*` 等 wildcard。 |
| `multiple` | `boolean`；默认 `false` | 是否允许一次选择多个文件。 |
| `copyToCacheDirectory` | `boolean`；Android / iOS 默认 `true` | 把选中文档复制到 FileSystem cache，让其它 Expo API 立即读取；大文件可能耗时。 |
| `base64` | `boolean`；仅 Web 默认 `true` | 控制 Web 选择结果使用 Base64 内容还是文件 URL。 |

## iCloud entitlement 与 Web 行为

如果 `expo-document-picker` 无法显示 iCloud Drive 文件，检查 iOS `usesIcloudStorage`、Container identifier、CloudKit capability 和签名 entitlements；手动维护原生工程时，也要确保 Developer Console 中创建了对应 iCloud Container。

Web 上调用 picker 必须来自点击等 user activation；浏览器对取消选择的行为不一致，API 不会总是给出单独的 cancel 事件。因此始终检查返回值的 `canceled`，且仅在 `canceled === false` 时读 `assets`。

## 源页代码覆盖与版本差异

- Installation：覆盖 `expo-document-picker` 的 npm / Yarn / pnpm / Bun 安装命令。
- Configuration：覆盖 iCloud `usesIcloudStorage` + plugin JSON、plugin 的 iCloud container environment / key-value identifier 两项配置、手动 iCloud entitlements XML 和 CloudKit Container 配置要点。
- Component / API：覆盖 `getDocumentAsync` 选择器及命名空间导入；给出按钮触发、MIME type 筛选、单 / 多文件配置、取消判定和结果展示示例。
- FileSystem：覆盖 `copyToCacheDirectory` 的默认值、立刻读取用途和大文件性能边界。
- Types：覆盖 success / canceled 联合结果、Asset 字段、`DocumentPickerOptions` 和 Web 专属 `base64` / `file` / `output`。
- Latest `~57.0.2` 与 SDK v56 `~56.0.4` 页面的安装、iCloud、picker API 与 Next 均一致。

**翻页：**[上一页：Expo SDK DevMenu 开发者菜单](./159-Expo-SDK-DevMenu.md) · [目录](./README.md) · [下一页：Expo SDK FileSystem 文件系统](./161-Expo-SDK-FileSystem.md)
