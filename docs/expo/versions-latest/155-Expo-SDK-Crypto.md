# 155｜Expo SDK Crypto 哈希、随机数与 AES

**翻页：**[上一页：Expo SDK Contacts（legacy）旧版 API](./154-Expo-SDK-Contacts-Legacy.md) · [目录](./README.md) · [下一页：Expo SDK DevClient 开发客户端](./156-Expo-SDK-DevClient.md)

**官方页面：**[Crypto · Latest](https://docs.expo.dev/versions/latest/sdk/crypto/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/crypto/)

**版本与平台：**Latest 推荐 `expo-crypto ~57.0.3`，SDK v56.0.0 推荐 `~56.0.5`。支持 Android、iOS、tvOS 和 Web，并包含在 Expo Go 中。两版页面的示例和 API 内容一致；代码应按当前项目的 Expo SDK 安装兼容包。

## 哈希、加密和随机数

`expo-crypto` 提供摘要（digest）、安全随机数，以及 AES-GCM 加密 / 解密。**哈希摘要是固定长度的结果，不能用来还原原文；加密则可用密钥解密还原数据。**AES-GCM 输出的封装数据包含初始化向量（IV，也称 nonce）、密文和认证标签（tag），用来校验解密时的数据完整性。

安装：

```sh
npx expo install expo-crypto
# 也可以使用：yarn expo install expo-crypto
# 或：pnpm expo install expo-crypto
# 或：bun expo install expo-crypto
```

Web 平台用浏览器 Web Crypto；摘要方法只能从安全来源调用（HTTPS 或 localhost），普通 HTTP 页面会报 `ERR_CRYPTO_UNAVAILABLE`。

## 计算字符串摘要

源页 Basic Crypto 示例在 React Native `useEffect` 中异步算 SHA-256。摘要可以用于比较数据是否变化；它不等价于加密，不会返回可解密的明文。

```tsx
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Crypto from 'expo-crypto';

export default function CryptoExample() {
  const [digest, setDigest] = useState('');

  useEffect(() => {
    async function calculateDigest() {
      const result = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        'Expo Crypto 示例 🌟'
      );
      setDigest(result);
    }
    void calculateDigest();
  }, []);

  return (
    <View style={styles.container}>
      <Text>SHA-256 摘要</Text>
      <Text selectable>{digest}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});
```

`Crypto.digestStringAsync(algorithm, string, options?)` 返回摘要字符串，默认格式是十六进制（HEX）；可设置 `CryptoDigestOptions.encoding` 为 `CryptoEncoding.HEX` 或 `CryptoEncoding.BASE64`。`Crypto.digest(algorithm, bytes)` 用 `Uint8Array` 等字节数据作为输入，返回 `ArrayBuffer`。两个摘要方法在 Web 上都需要安全来源。

```ts
import * as Crypto from 'expo-crypto';

const textDigest = await Crypto.digestStringAsync(
  Crypto.CryptoDigestAlgorithm.SHA512,
  '🥓 Easy to Digest! 💙'
);

const bytes = new Uint8Array([1, 2, 3, 4, 5]);
const binaryDigest = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA512, bytes);
```

## AES-GCM 加密和解密

源页的简单 AES 示例先把字符串转成 Base64，再生成 AES 密钥、加密成 `AESSealedData`，解密后再从 Base64 转回字符串。这里使用同一个变量 `encryptionKey` 完成两步：Latest 与 v56 源页示例在调用处写了未定义的 `key`，本篇按上下文改为已生成的变量。

```ts
import { AESEncryptionKey, aesEncryptAsync, aesDecryptAsync } from 'expo-crypto';

async function encryptAndDecryptText() {
  const plaintext = 'Hello, world!';
  const plaintextBase64 = btoa(plaintext);

  const encryptionKey = await AESEncryptionKey.generate();
  const sealedData = await aesEncryptAsync(plaintextBase64, encryptionKey);
  const decryptedBase64 = await aesDecryptAsync(sealedData, encryptionKey, {
    output: 'base64',
  });

  return atob(decryptedBase64);
}
```

`AES-GCM` 是带认证的加密模式。密钥负责加密 / 解密；nonce（或 IV）要与密文一起保存；authentication tag 用来校验解密数据是否匹配。`AESSealedData.combined()` 可把这些部分合成一段二进制内容保存，之后用 `fromCombined()` 还原。

### 将密文保存到文件，并保存密钥

官方示例使用 `expo-file-system` 保存密文文件，使用 `expo-secure-store` 保存密钥的十六进制字符串。运行此片段还需安装这两个模块：

```sh
npx expo install expo-file-system expo-secure-store
```

```ts
import { AESEncryptionKey, aesEncryptAsync } from 'expo-crypto';
import { File, Paths } from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';

async function encryptAndSaveData(plaintextData: Uint8Array) {
  const encryptionKey = await AESEncryptionKey.generate();
  const sealedData = await aesEncryptAsync(plaintextData, encryptionKey);
  const encryptedBytes = await sealedData.combined();

  const keyHex = await encryptionKey.encoded('hex');
  await SecureStore.setItemAsync('aes-encryption-key', keyHex);

  const file = new File(Paths.cache, 'encrypted.dat');
  file.create({ overwrite: true });
  file.write(encryptedBytes);
}
```

### 从文件读取并解密

加载时先读取安全存储中的密钥，再导入 AES key；然后读取密文文件字节、用 `AESSealedData.fromCombined()` 解析，最后解密。源页这段代码最后把未定义的 `data` 传给 `aesDecryptAsync`；这里更正为前面解析得到的 `sealedData`。

```ts
import { AESEncryptionKey, AESSealedData, aesDecryptAsync } from 'expo-crypto';
import { File, Paths } from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';

async function loadAndDecryptData(): Promise<Uint8Array | null> {
  const keyHex = await SecureStore.getItemAsync('aes-encryption-key');
  if (!keyHex) return null;

  const encryptionKey = await AESEncryptionKey.import(keyHex, 'hex');
  const file = new File(Paths.cache, 'encrypted.dat');
  if (!file.exists) return null;

  const encryptedBytes = await file.bytes();
  const sealedData = AESSealedData.fromCombined(encryptedBytes);
  return await aesDecryptAsync(sealedData, encryptionKey);
}
```

AES 字符串输入需先编码为 Base64；二进制输入可直接传 `Uint8Array` / `ArrayBuffer`。`btoa` / `atob` 是 Base64 编解码示例，不是加密步骤。

## 随机字节与 UUID

`getRandomBytes` 和 `getRandomBytesAsync` 的 `byteCount` 范围为 0–1024，越界会抛 `TypeError`。同步版本返回 `Uint8Array`；异步版本返回 `Promise<Uint8Array>`。在 React Native Debugger 的开发环境中，同步方法会退回 `Math.random`，所以调试时不要把这一退回路径当作安全随机源。

`getRandomValues(typedArray)` 会原地填充整数 TypedArray 并返回同一个数组；`randomUUID()` 生成符合 RFC 4122 v4 的字符串 UUID：

```ts
import * as Crypto from 'expo-crypto';

const syncBytes = Crypto.getRandomBytes(16);
const asyncBytes = await Crypto.getRandomBytesAsync(16);

const byteArray = new Uint8Array(16);
Crypto.getRandomValues(byteArray);

const uuid = Crypto.randomUUID();
console.log({ syncBytes, asyncBytes, byteArray, uuid });
```

## API 参考

模块命名空间导入：

```ts
import * as Crypto from 'expo-crypto';
```

### `AESEncryptionKey`

表示可以执行 AES 加密 / 解密的 key。`size` 是 `AESKeySize`，单位是 bit：128、192 或 256。

| 方法 | 参数 / 返回 | 用途 |
| --- | --- | --- |
| `AESEncryptionKey.generate(size?)` | 默认 256 bit；`Promise<EncryptionKey>` | 生成新密钥。 |
| `key.bytes()` | `Promise<Uint8Array>` | 导出原始字节；Web 使用 SubtleCrypto，因此是异步。 |
| `key.encoded('hex' \| 'base64')` | `Promise<string>` | 把 key 编成十六进制或 Base64 字符串。 |
| `AESEncryptionKey.import(bytes)` | `Uint8Array` → `Promise<EncryptionKey>` | 从字节导入并校验长度。 |
| `AESEncryptionKey.import(string, encoding)` | `'hex' \| 'base64'` → `Promise<EncryptionKey>` | 从编码字符串导入并校验长度。 |

### `AESSealedData`

加密结果对象，包含 IV、密文和 authentication tag。只读 `combinedSize`、`ivSize`、`tagSize` 描述这三部分大小。

| 方法 | 参数 / 返回 | 用途 |
| --- | --- | --- |
| `ciphertext({ encoding, includeTag })` | `{ encoding: 'base64' \| 'bytes'; includeTag: boolean }` → `Promise<string \| Uint8Array>` | 提取密文，可选是否连 tag 一并返回。 |
| `combined(encoding?)` | `'base64' \| 'bytes'`，默认 `bytes` | 合并 IV、密文、tag，便于保存和重新解析。 |
| `AESSealedData.fromCombined(combined, config?)` | `BinaryInput`；可选 `AESSealedDataConfig` | 从组合后的数据构建实例；字符串必须是 Base64。 |
| `AESSealedData.fromParts(iv, ciphertext, tag)` | 三个 `BinaryInput` | 用分离的 IV、密文、tag 建立实例；密文不包含 tag。 |
| `AESSealedData.fromParts(iv, ciphertextWithTag, tagLength?)` | IV、附带 tag 的密文、tag 字节数（默认 16） | 从把 tag 附在密文后的数据创建实例。 |
| `iv(encoding?)` | `'base64' \| 'bytes'`，默认 `bytes` | 获取初始化向量 / nonce。 |
| `tag(encoding?)` | `'base64' \| 'bytes'`，默认 `bytes` | 获取认证标签。 |

### 加密、摘要和随机数方法

| 方法 | 参数 / 返回 | 说明 |
| --- | --- | --- |
| `aesEncryptAsync(plaintext, key, options?)` | `BinaryInput`、`AESEncryptionKey`、`AESEncryptOptions?` → `Promise<AESSealedData>` | 使用 AES-GCM 加密；若 plaintext 是 string，必须先 Base64 编码。 |
| `aesDecryptAsync(sealedData, key, options?)` | `AESSealedData`、key、`AESDecryptOptions?` → `Promise<Uint8Array \| string>` | 解密；默认返回 bytes，也可指定 Base64。 |
| `digest(algorithm, data)` | `BufferSource` → `Promise<ArrayBuffer>` | 对字节数据计算摘要。Web 只能从安全来源调用。 |
| `digestStringAsync(algorithm, data, options?)` | string → `Promise<string>` | 对字符串计算摘要，默认输出 HEX。Web 只能从安全来源调用。 |
| `getRandomBytes(byteCount)` | 0–1024 → `Uint8Array` | 同步生成指定长度的随机字节；开发调试器有 Math.random 退回行为。 |
| `getRandomBytesAsync(byteCount)` | 0–1024 → `Promise<Uint8Array>` | 异步生成随机字节。 |
| `getRandomValues(typedArray)` | 整数 TypedArray → 同一个 TypedArray | 将安全随机值写入输入数组本身。 |
| `randomUUID()` | → `string` | 生成 UUID v4。 |

## 类型、选项与平台差异

| 类型 / 选项 | 字段 / 值 |
| --- | --- |
| `BinaryInput` | `string \| Uint8Array \| ArrayBuffer`；string 表示 Base64。 |
| `AESDecryptOptions` | 可选 `additionalData`（AAD，Base64 或 binary）、`output: 'base64' \| 'bytes'`，默认 bytes。 |
| `AESEncryptOptions` | 可选 `additionalData`、`nonce`、`tagLength`；默认 `{}`。 |
| `GCMNonceParam` | `{ length?: number }`（默认生成 12 字节 nonce）或 `{ bytes: BinaryInput }`（自己提供）。 |
| `AESSealedDataConfig` | `ivLength?: number`（默认 12）和 `tagLength?: GCMTagByteLength`（默认 16）。 |
| `GCMTagByteLength` | `16`、`15`、`14`、`13`、`12`、`8`、`4` 字节；默认 / 推荐 16。Apple 加密仅支持 16。 |
| `CryptoDigestOptions` | `encoding: CryptoEncoding`，选择摘要字符串格式。 |
| `Digest` | `string` 摘要类型。 |
| `AESKeySize` | `AES128 = 128`、`AES192 = 192`、`AES256 = 256`，单位 bit。AES192 不支持 Web。 |
| `CryptoDigestAlgorithm` | `MD2`、`MD4`、`MD5`、`SHA1`、`SHA256`、`SHA384`、`SHA512`。MD2 / MD4 仅 iOS；MD5 是 Android / iOS。SHA256 / SHA384 / SHA512 在官方页标为 collision resistant。 |
| `CryptoEncoding` | `BASE64 = 'base64'`（带 padding、不折行、无尾换行）或 `HEX = 'hex'`。 |

AES-GCM 的 `additionalData`（AAD）是附加认证数据；它不作为加密正文返回，但会参与完整性校验。Apple 忽略 `AESEncryptOptions.tagLength` 并固定使用 16 字节；Android / Web 可设置。Web 的 WebCrypto API 要求安全来源。

## 错误码

| 错误码 | 含义 |
| --- | --- |
| `ERR_CRYPTO_UNAVAILABLE` | Web 环境无法使用 WebCrypto；来源不是 HTTPS 或 localhost。 |
| `ERR_CRYPTO_DIGEST` | 摘要输出编码参数无效。 |

## 源页代码覆盖与版本差异

- Installation：覆盖 `expo-crypto` 的 npm / Yarn / pnpm / Bun 安装命令。
- Usage：重写 React Native 中异步 `digestStringAsync` 示例。
- AES：覆盖 Base64 文本加密 / 解密、密钥生成，以及 FileSystem 密文保存 / SecureStore 密钥保存 / 文件读取解密；纠正了源页简单示例里 `key` 未定义、解密示例里 `data` 未定义两处变量引用。
- Digest / Random：覆盖 `digest` 的 Uint8Array 输入、`digestStringAsync`、同步 / 异步随机字节、原地填充 `getRandomValues`、UUID v4。
- API / types：记录 AES key 生成 / 导入 / 导出、sealed data 组合与分片处理、加密 / 解密方法、选项、算法、编码、平台限制和错误码。
- Latest `~57.0.3` 与 SDK v56 `~56.0.5` 的代码、API 和平台说明相同；Next 两版均为 DevClient。

**翻页：**[上一页：Expo SDK Contacts（legacy）旧版 API](./154-Expo-SDK-Contacts-Legacy.md) · [目录](./README.md) · [下一页：Expo SDK DevClient 开发客户端](./156-Expo-SDK-DevClient.md)
