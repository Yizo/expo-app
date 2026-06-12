# Expo Crypto 学习指南

> 原文档更新时间：2026 年 5 月 27 日  
> 包名：`expo-crypto`  
> 支持平台：Android、iOS、tvOS、Web、Expo Go  
> 文档版本：面向下一个 Expo SDK 版本的未发布文档，并非当前稳定版；原文指出当前稳定版为 SDK 56。

## 文档解决的问题

`expo-crypto` 为 Expo 和 React Native 应用提供跨平台密码学能力，主要包括：

- 对字符串或二进制数据计算哈希摘要
- 使用 AES-GCM 加密和解密数据
- 生成密码学安全的随机字节
- 填充随机整数数组
- 生成 UUID v4
- 导入、导出和保存 AES 密钥
- 拆分或组合 AES-GCM 加密结果

它的定位类似于 React Web 中的 Web Crypto API，以及 Node.js 的核心 `crypto` 模块，但通过 Expo 提供统一接口，使相同业务代码能够运行在 Android、iOS、tvOS 和 Web 上。

适合的典型场景包括：

- 计算文件或数据的 SHA-256、SHA-512 摘要
- 校验数据是否发生变化
- 在设备本地加密敏感数据或文件
- 生成随机令牌、随机字节或 UUID
- 在移动端和 Web 之间共享密码学相关代码

当前文档未涉及：

- 公钥密码学，例如 RSA、ECDSA
- 数字签名和签名验证
- 密码派生函数，例如 PBKDF2、scrypt、Argon2
- HTTPS 或网络传输层加密
- 密钥轮换、云端密钥管理和完整的安全架构
- 用户密码应该如何存储
- AES-GCM 算法的底层数学原理

## React Web 开发者需要先理解的概念

### Expo、React Native 与 Expo Go

React Native 使用 React 的组件和状态模型开发原生应用，但页面最终不是浏览器 DOM，而是原生界面。

因此，下面的 React Native 代码：

```tsx
<View>
  <Text>Hello</Text>
</View>
```

可以类比 React Web 中的：

```tsx
<div>
  <span>Hello</span>
</div>
```

Expo 是构建 React Native 应用的一套工具和运行时。`expo-crypto` 是 Expo 提供的原生模块之一。

文档标记“Included in Expo Go”，表示可以直接在 Expo Go 中使用这个库，不需要为了该模块单独编译自定义原生应用。

### 原生模块

Web 应用通常通过浏览器 API 使用系统能力。React Native 应用则需要通过原生模块调用 Android、iOS 等平台提供的能力。

`expo-crypto` 封装了不同平台的密码学实现，使 JavaScript/TypeScript 代码不必分别调用 Android、Apple 和浏览器 API。

### 二进制数据类型

AES API 经常使用以下数据类型：

- `Uint8Array`：带类型的字节数组
- `ArrayBuffer`：一段原始二进制内存
- `string`：在 AES API 中传入字符串时，必须是 Base64 编码后的字符串

这与普通 React Web 表单中的文本字符串不同。不能把任意明文字符串直接当作 AES API 的字符串输入。

### Base64 与加密不是一回事

Base64 只是把二进制数据表示为可传输字符串的编码方式，不提供保密能力。

```ts
const encoded = btoa('Hello');
const decoded = atob(encoded);
```

任何人都能还原这段内容。真正提供保密能力的是 AES 加密。

### 哈希与加密的区别

哈希是单向转换：

```text
原始数据 -> 固定长度摘要
```

通常不能通过摘要还原原始数据。

加密是可逆转换：

```text
明文 + 密钥 -> 密文
密文 + 同一密钥 -> 明文
```

因此：

- 校验数据、生成内容指纹：使用哈希
- 需要之后恢复原文：使用加密
- 生成随机标识：使用随机数或 UUID

## 安装

推荐使用 Expo 的安装命令：

```sh
npx expo install expo-crypto
```

其他包管理器对应命令如下：

```sh
yarn expo install expo-crypto
pnpm expo install expo-crypto
bun expo install expo-crypto
```

`expo install` 与直接执行 `npm install` 的重要区别是：它会尽量安装与当前 Expo SDK 兼容的包版本。

如果项目是已有的普通 React Native 工程，而不是已经配置好的 Expo 项目，需要先安装并配置 Expo Modules：

```text
已有 React Native 工程
        ↓
安装并配置 expo
        ↓
安装 expo-crypto
```

原文没有列出额外的原生权限配置，也没有要求修改 `Info.plist`、`AndroidManifest.xml` 或 Expo app config。

## 基本导入方式

可以导入整个模块：

```ts
import * as Crypto from 'expo-crypto';
```

也可以按名称导入 AES API：

```ts
import {
  AESEncryptionKey,
  AESSealedData,
  aesEncryptAsync,
  aesDecryptAsync,
} from 'expo-crypto';
```

## 计算哈希摘要

### 对字符串计算哈希

```ts
const digest = await Crypto.digestStringAsync(
  Crypto.CryptoDigestAlgorithm.SHA256,
  'GitHub stars are neat 🌟'
);

console.log(digest);
```

`digestStringAsync()` 接收：

| 参数 | 含义 |
| --- | --- |
| `algorithm` | 哈希算法 |
| `data` | 要计算摘要的字符串 |
| `options` | 可选的输出编码配置 |

默认返回 HEX 字符串。也可以指定 Base64：

```ts
const digest = await Crypto.digestStringAsync(
  Crypto.CryptoDigestAlgorithm.SHA512,
  'Hello',
  { encoding: Crypto.CryptoEncoding.BASE64 }
);
```

### 对二进制数据计算哈希

```ts
const bytes = new Uint8Array([1, 2, 3, 4, 5]);

const digest = await Crypto.digest(
  Crypto.CryptoDigestAlgorithm.SHA512,
  bytes
);
```

返回值是 `Promise<ArrayBuffer>`，不是可直接显示的 HEX 字符串。

两种 API 的主要区别：

| API | 输入 | 输出 |
| --- | --- | --- |
| `digestStringAsync()` | 普通字符串 | HEX 或 Base64 字符串 |
| `digest()` | `BufferSource` 二进制数据 | `ArrayBuffer` |

### 可用算法及平台差异

| 算法 | 摘要长度 | 平台说明 |
| --- | ---: | --- |
| MD2 | 128 位 | 仅 iOS |
| MD4 | 128 位 | 仅 iOS |
| MD5 | 128 位 | Android、iOS |
| SHA-1 | 160 位 | Android、iOS、tvOS、Web |
| SHA-256 | 256 位 | Android、iOS、tvOS、Web |
| SHA-384 | 384 位 | Android、iOS、tvOS、Web |
| SHA-512 | 512 位 | Android、iOS、tvOS、Web |

原文将 SHA-256、SHA-384 和 SHA-512 标记为具有抗碰撞能力。

**基于经验建议：** 新功能通常应优先考虑 SHA-256 或更高版本。文档虽然列出了 MD2、MD4、MD5 和 SHA-1，但列出 API 并不代表它们适合新的安全设计。

### Web 环境限制

在 Web 上，`digest()` 和 `digestStringAsync()` 只能运行于安全来源：

- HTTPS
- `localhost`

如果通过普通 HTTP 域名访问，会抛出错误。其错误码为：

```text
ERR_CRYPTO_UNAVAILABLE
```

这与 React Web 中部分 Web Crypto API 只能在安全上下文中使用的规则一致。

## AES-GCM 加密与解密

### AES-GCM 中的三个核心对象

#### `AESEncryptionKey`

表示 AES 对称密钥。同一把密钥既用于加密，也用于解密。

它支持：

- 生成新密钥
- 导入已有密钥
- 导出为字节数组
- 导出为 HEX 或 Base64 字符串

#### `AESSealedData`

表示完整的加密结果，其中包含：

```text
IV（Nonce）+ Ciphertext（密文）+ Authentication Tag（认证标签）
```

它不是单纯的密文数组。解密 AES-GCM 数据时，通常还需要 IV 和认证标签，所以库将它们封装在同一个对象中。

#### AAD

AAD 是 Additional Authenticated Data，即“附加认证数据”。

它不一定被加密，但会参与完整性认证。加密和解密时必须提供完全一致的 AAD，否则认证失败，无法正常解密。

原文没有给出 AAD 的具体业务示例。

### 生成 AES 密钥

```ts
const key = await AESEncryptionKey.generate();
```

默认生成 256 位密钥，也可以指定：

```ts
const key128 = await AESEncryptionKey.generate(
  Crypto.AESKeySize.AES128
);

const key256 = await AESEncryptionKey.generate(
  Crypto.AESKeySize.AES256
);
```

支持的密钥长度：

| 枚举 | 位数 | 平台限制 |
| --- | ---: | --- |
| `AES128` | 128 | 全平台 |
| `AES192` | 192 | Android、Apple，不支持 Web |
| `AES256` | 256 | 全平台，默认值 |

如果同一份业务代码需要同时运行于 Web 和移动端，不应选择 AES-192。

### 导出密钥

导出为字节数组：

```ts
const keyBytes = await key.bytes();
```

导出为 HEX：

```ts
const keyHex = await key.encoded('hex');
```

导出为 Base64：

```ts
const keyBase64 = await key.encoded('base64');
```

这些方法是异步方法。原文说明，这是因为 Web 实现需要调用异步的 `SubtleCrypto.exportKey()`。

### 导入密钥

从字节数组导入：

```ts
const key = await AESEncryptionKey.import(keyBytes);
```

从字符串导入：

```ts
const keyFromHex = await AESEncryptionKey.import(keyHex, 'hex');
const keyFromBase64 = await AESEncryptionKey.import(keyBase64, 'base64');
```

导入时会校验密钥长度。

### 加密数据

```ts
const sealedData = await Crypto.aesEncryptAsync(
  plaintext,
  key,
  options
);
```

参数说明：

| 参数 | 说明 |
| --- | --- |
| `plaintext` | `Uint8Array`、`ArrayBuffer` 或 Base64 字符串 |
| `key` | `AESEncryptionKey` |
| `options` | 可选的 nonce、认证标签长度和 AAD |

返回值是 `AESSealedData`，而不是普通字符串。

### 解密数据

```ts
const plaintext = await Crypto.aesDecryptAsync(
  sealedData,
  key,
  options
);
```

默认返回字节数据。通过 `output` 可以指定返回 Base64：

```ts
const plaintextBase64 = await Crypto.aesDecryptAsync(
  sealedData,
  key,
  { output: 'base64' }
);
```

可选输出格式：

- `'bytes'`：默认值
- `'base64'`

### 字符串加密示例

由于 AES API 的字符串输入必须是 Base64，普通文本需要先编码：

```ts
const plaintext = 'Hello, world!';
const plaintextBase64 = btoa(plaintext);

const key = await AESEncryptionKey.generate();
const sealedData = await Crypto.aesEncryptAsync(plaintextBase64, key);

const decryptedBase64 = await Crypto.aesDecryptAsync(
  sealedData,
  key,
  { output: 'base64' }
);

const decrypted = atob(decryptedBase64);
console.log(decrypted);
```

需要注意，`btoa()` 和 `atob()` 只是原文示例所使用的 Base64 转换方式。当前文档没有说明它们处理任意 Unicode 文本时的兼容策略。

### 原文示例中的变量名错误

原文 AES 示例创建的是：

```ts
const encryptionKey = await AESEncryptionKey.generate();
```

但之后传给加密和解密函数的变量名却是 `key`。如果直接复制，会出现未定义变量错误。

应统一使用同一个变量：

```ts
const encryptionKey = await AESEncryptionKey.generate();

const sealedData = await aesEncryptAsync(
  plaintextBase64,
  encryptionKey
);

const decryptedBase64 = await aesDecryptAsync(
  sealedData,
  encryptionKey,
  { output: 'base64' }
);
```

## AES 加密选项

### `AESEncryptOptions`

```ts
type AESEncryptOptions = {
  additionalData?: BinaryInput;
  nonce?: GCMNonceParam;
  tagLength?: GCMTagByteLength;
};
```

#### `additionalData`

GCM 模式的 AAD。如果使用字符串，必须是 Base64 编码字符串。

#### `nonce`

可以让库生成指定长度的 nonce：

```ts
{
  nonce: { length: 12 }
}
```

也可以直接提供 nonce：

```ts
{
  nonce: { bytes: nonceBytes }
}
```

默认 nonce 长度是 12 字节。

**基于经验建议：** 手动提供 nonce 需要正确管理其唯一性。当前文档只描述了参数形式，没有提供 nonce 重用风险和管理方案；不确定时应让库生成。

#### `tagLength`

设置 GCM 认证标签长度，默认 16 字节。

该选项仅在 Android 和 Web 上生效。在 Apple 平台上会被忽略，标签始终是 16 字节。

### `AESDecryptOptions`

```ts
type AESDecryptOptions = {
  additionalData?: BinaryInput;
  output?: 'base64' | 'bytes';
};
```

如果加密时使用了 `additionalData`，解密时必须提供对应数据。

## 保存和恢复加密数据

### 加密并写入文件

原文使用三个 Expo 模块协作：

- `expo-crypto`：执行加密
- `expo-file-system`：写入文件
- `expo-secure-store`：保存密钥

```ts
import { AESEncryptionKey, aesEncryptAsync } from 'expo-crypto';
import { File, Paths } from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';

async function encryptAndSaveData(plaintextData: Uint8Array) {
  const encryptionKey = await AESEncryptionKey.generate();

  const sealedData = await aesEncryptAsync(
    plaintextData,
    encryptionKey
  );

  const encryptedBytes = await sealedData.combined();

  const keyHex = await encryptionKey.encoded('hex');
  await SecureStore.setItemAsync('aes-encryption-key', keyHex);

  const file = new File(Paths.cache, 'encrypted.dat');
  file.create({ overwrite: true });
  await file.write(encryptedBytes);
}
```

流程如下：

```text
生成 AES 密钥
    ↓
加密原始字节
    ↓
将 IV、密文和认证标签组合为字节数组
    ↓
密钥写入 SecureStore
    ↓
加密后的字节写入缓存文件
```

这里将密钥和密文分别保存：

- 密钥：`SecureStore`
- 密文：文件系统缓存目录

这比把密钥直接写进同一个普通文件更符合安全存储的职责划分。

### 读取文件并解密

```ts
import {
  AESEncryptionKey,
  AESSealedData,
  aesDecryptAsync,
} from 'expo-crypto';
import { File, Paths } from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';

async function loadAndDecryptData(): Promise<Uint8Array | null> {
  const keyHex = await SecureStore.getItemAsync(
    'aes-encryption-key'
  );

  if (!keyHex) {
    return null;
  }

  const encryptionKey = await AESEncryptionKey.import(
    keyHex,
    'hex'
  );

  const file = new File(Paths.cache, 'encrypted.dat');
  if (!file.exists) {
    return null;
  }

  const encryptedBytes = await file.bytes();
  const sealedData = AESSealedData.fromCombined(encryptedBytes);

  return aesDecryptAsync(sealedData, encryptionKey);
}
```

恢复过程与保存过程相反：

```text
从 SecureStore 读取 HEX 密钥
    ↓
导入为 AESEncryptionKey
    ↓
从文件读取加密字节
    ↓
将组合数据还原为 AESSealedData
    ↓
使用同一密钥解密
```

原文解密示例最后使用了未定义变量 `data`：

```ts
const plaintextBytes = await aesDecryptAsync(data, encryptionKey);
```

这里应传入前面创建的 `sealedData`：

```ts
const plaintextBytes = await aesDecryptAsync(
  sealedData,
  encryptionKey
);
```

## `AESSealedData` 数据结构

### 读取组合数据

```ts
const bytes = await sealedData.combined();
const base64 = await sealedData.combined('base64');
```

组合顺序为：

```text
IV + Ciphertext + Tag
```

相关只读属性：

| 属性 | 含义 |
| --- | --- |
| `combinedSize` | 组合数据总字节数 |
| `ivSize` | IV 的字节数 |
| `tagSize` | 认证标签的字节数 |

### 分别读取各部分

```ts
const iv = await sealedData.iv();
const tag = await sealedData.tag();
const ciphertext = await sealedData.ciphertext({
  encoding: 'bytes',
  includeTag: false,
});
```

这些方法可以返回字节数据或 Base64 字符串。

`ciphertext()` 的 `includeTag` 控制结果中是否附带认证标签。

### 从组合数据恢复

```ts
const sealedData = AESSealedData.fromCombined(combinedData);
```

如果传入字符串，该字符串必须是 Base64。

默认解析配置：

```ts
{
  ivLength: 12,
  tagLength: 16,
}
```

如果加密数据采用了不同长度，需要明确提供：

```ts
const sealedData = AESSealedData.fromCombined(combinedData, {
  ivLength: 12,
  tagLength: 16,
});
```

如果保存时采用非默认长度，但恢复时仍按默认长度解析，IV、密文和标签的边界会不一致。

### 从独立部分恢复

分别提供 IV、密文和标签：

```ts
const sealedData = AESSealedData.fromParts(
  iv,
  ciphertext,
  tag
);
```

也可以提供“密文加标签”的组合结果：

```ts
const sealedData = AESSealedData.fromParts(
  iv,
  ciphertextWithTag,
  16
);
```

字符串形式的各个参数都必须是 Base64。

## 认证标签长度

可接受的标签长度为：

```text
16、15、14、13、12、8、4 字节
```

文档说明：

- 默认值和推荐值是 16 字节
- 认证标签长度是安全参数
- AES-GCM 规范推荐 12～16 字节
- 某些应用可能接受 8 或 4 字节
- Apple 平台加密时只支持 16 字节

跨平台项目使用 16 字节可以避免 Apple 与 Android/Web 行为不一致。

文档中的类型展示为 `'16' | '15' | ...`，但同时将其描述为数值型字节长度。实际使用时应以对应 SDK 的 TypeScript 类型定义为准。

## 随机数 API

### `getRandomBytes()`

```ts
const bytes = Crypto.getRandomBytes(32);
```

同步返回指定长度的 `Uint8Array`。

`byteCount` 必须在 `0` 到 `1024` 之间，否则抛出 `TypeError`。

原文特别指出：开发环境中，为避免与 React Native Debugger 产生问题，该同步方法可能回退到 `Math.random`。

这意味着不能仅因为 API 名称包含 Crypto，就忽略文档明确说明的开发环境回退行为。

### `getRandomBytesAsync()`

```ts
const bytes = await Crypto.getRandomBytesAsync(32);
```

异步返回 `Uint8Array`，长度限制同样是 `0` 到 `1024` 字节。

原文没有说明该异步方法存在 `Math.random` 回退。

### `getRandomValues()`

```ts
const bytes = new Uint8Array(16);
Crypto.getRandomValues(bytes);
```

该方法会直接修改传入数组，并返回同一个数组。

参数必须是基于整数的 `TypedArray`。它的使用方式与浏览器的 `crypto.getRandomValues()` 类似。

### `randomUUID()`

```ts
const id = Crypto.randomUUID();
```

同步返回符合 RFC 4122 UUID v4 规范的字符串，并使用密码学安全随机值生成。

**基于文档内容推导：** 它适合生成客户端对象 ID、请求 ID 等随机标识，但文档没有承诺它能够代替数据库层的唯一约束。

## 输出编码

### `CryptoEncoding.HEX`

将字节表示为十六进制字符串，常用于展示和日志记录哈希摘要。

### `CryptoEncoding.BASE64`

Base64 输出具有以下特征：

- 包含末尾 padding
- 不自动换行
- 末尾没有额外换行符

不同系统交换加密数据或摘要时，需要明确双方使用的是 HEX、标准 Base64，还是其他 Base64 变体。

## 错误码

| 错误码 | 含义 |
| --- | --- |
| `ERR_CRYPTO_UNAVAILABLE` | 仅 Web；当前环境无法访问 Web Crypto API，通常是因为页面不在 `localhost` 或 HTTPS 安全来源中 |
| `ERR_CRYPTO_DIGEST` | 提供了无效的摘要输出编码 |

此外，文档明确说明以下情况会产生错误：

- 随机字节数量不在 `0～1024` 范围内
- 导入的 AES 密钥长度无效
- Web 哈希 API 运行在不安全来源中

当前文档没有给出 AES 加密、解密和认证失败时的完整错误码列表。

## 容易踩坑的地方

### 1. 当前页面不是稳定版文档

该页面属于下一个 SDK 版本。原文明确提示当前稳定版为 SDK 56。

如果项目使用稳定版 Expo SDK，应查阅对应版本文档，不能假设未发布页面中的 AES API 已存在于当前项目。

### 2. AES API 的字符串必须是 Base64

下面的调用不符合文档约定：

```ts
await aesEncryptAsync('普通文本', key);
```

应传入：

- `Uint8Array`
- `ArrayBuffer`
- Base64 字符串

### 3. 密钥不是密码文本

`AESEncryptionKey` 是符合 AES 长度要求的二进制密钥对象。不能把用户输入的普通密码直接当作 AES 密钥。

当前文档没有提供从密码派生 AES 密钥的 API，因此不要自行通过补零、截断等方式把密码变成密钥。

### 4. 解密需要完整数据

仅保存 ciphertext 通常不够。还需要：

- IV
- 认证标签
- 相同密钥
- 加密时使用的相同 AAD
- 与保存格式匹配的 IV 和标签长度

使用 `sealedData.combined()` 保存完整组合数据，可以减少遗漏。

### 5. Apple 平台始终使用 16 字节标签

即使设置了其他 `tagLength`，Apple 平台也会忽略该选项。

如果需要 Android、iOS 和 Web 互通，应使用共同支持的 16 字节标签。

### 6. AES-192 不支持 Web

跨平台项目应选择 AES-128 或 AES-256。默认 AES-256 已覆盖文档列出的全部平台。

### 7. 缓存目录不是永久存储保证

原文示例将密文保存到 `Paths.cache`。

**基于文档内容推导：** 该示例展示的是加密文件读写流程，不应据此认定缓存目录适合永久保存数据。是否使用缓存目录，需要根据数据生命周期决定。

### 8. 不要记录密钥和明文

**基于经验建议：** 生产环境日志中不要输出 AES 密钥、解密后的明文或完整敏感数据。文档演示了如何导出密钥，但导出能力不代表密钥适合进入日志、分析平台或普通存储。

### 9. 原文代码存在变量名问题

原文至少有两处示例不能直接运行：

- 生成 `encryptionKey` 后却使用 `key`
- 创建 `sealedData` 后却将 `data` 传给解密函数

复制示例时需要按本文前面的修正版统一变量名。

## 实际开发中的使用方式

### 内容摘要

```ts
const checksum = await Crypto.digestStringAsync(
  Crypto.CryptoDigestAlgorithm.SHA256,
  content
);
```

适用于内容指纹或变化检测。

哈希摘要本身不等于身份认证。当前文档未提供 HMAC，因此不要仅凭普通哈希证明数据来自可信发送方。

### 加密本地敏感文件

推荐流程是：

```text
生成 AES-256 密钥
    ↓
密钥存入 SecureStore
    ↓
原始数据转换为 Uint8Array
    ↓
调用 aesEncryptAsync()
    ↓
调用 combined() 保存完整加密结果
    ↓
需要时恢复 AESSealedData 并解密
```

必须同时考虑密钥或文件不存在的情况，原文示例通过返回 `null` 处理这两种情况。

### 生成随机标识

普通 UUID 标识：

```ts
const id = Crypto.randomUUID();
```

需要原始随机字节：

```ts
const tokenBytes = await Crypto.getRandomBytesAsync(32);
```

如果需要将随机字节传给接口或写入文本存储，还需要选择一种编码格式。当前文档没有提供随机字节到字符串的专用转换 API。

## 文档明确内容与推导内容

### 文档明确说明

- `expo-crypto` 支持 Android、iOS、tvOS 和 Web，并包含在 Expo Go 中
- 可以执行哈希、AES-GCM 加解密、随机数生成和 UUID 生成
- AES 默认使用 256 位密钥
- AES 字符串输入必须是 Base64
- AES-GCM 默认 IV 长度为 12 字节
- AES-GCM 默认且推荐的认证标签长度为 16 字节
- Apple 平台加密时认证标签固定为 16 字节
- AES-192 不支持 Web
- Web 哈希 API 要求 HTTPS 或 `localhost`
- `getRandomBytes()` 在开发环境可能回退到 `Math.random`
- 随机字节数量限制为 `0～1024`
- 示例使用 SecureStore 保存密钥，使用文件系统保存密文

### 基于文档内容推导

- 跨平台项目应优先使用 AES-128 或默认的 AES-256
- 为保证 Apple、Android 和 Web 互通，应采用 16 字节认证标签
- 保存 `combined()` 结果可以避免单独保存 IV、密文和标签时遗漏数据
- `Paths.cache` 示例不能证明缓存目录适合永久保存文件
- UUID 可用于客户端随机标识，但不能替代数据库唯一约束
- 普通哈希不能独自证明数据发送方身份

### 基于经验建议

- 新的安全功能优先考虑 SHA-256 或更高版本
- 不确定如何管理 nonce 时，让库自动生成
- 不要在日志、普通文件或分析平台中记录密钥和明文
- 不要自行将用户密码截断或补齐为 AES 密钥
- 设计生产级加密存储时，还应考虑密钥轮换、数据迁移、备份恢复和认证失败处理；这些内容不在当前文档范围内

## 总结

`expo-crypto` 将常见密码学能力统一封装为可在 Expo、React Native 和 Web 中使用的 API。

使用时最重要的边界是：

- 哈希和加密解决的是不同问题
- AES 字符串输入必须是 Base64
- `AESSealedData` 包含 IV、密文和认证标签
- 密钥与密文应分别管理
- 跨平台 AES 配置应避开 AES-192，并使用 16 字节标签
- Web 哈希需要 HTTPS 或 `localhost`
- 当前页面面向下一个 SDK，使用前应核对项目实际 Expo SDK 版本
- 原文 AES 示例存在变量名错误，不能不经检查直接复制

---

## 文档导航

- **上一页**：[contacts legacy](./162__contacts-legacy.md)
- **下一页**：[dev client](./164__dev-client.md)
