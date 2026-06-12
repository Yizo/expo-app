# Expo AgeRange 学习指南

## 文档解决的问题

`expo-age-range` 是一个用于获取用户年龄范围信息的 Expo 库：

- Android：使用 Google Play Age Signals API。
- iOS：使用 Apple Declared Age Range framework。
- Expo Go：已包含该库。

它主要帮助应用：

1. 判断用户所属的年龄区间。
2. 遵守特定地区的年龄适宜内容法规。
3. 根据年龄提供不同的内容或功能体验。
4. 在部分受监管地区判断是否需要显示年龄门槛。
5. 在 iOS 上处理重大应用更新的成人通知或家长同意要求。

该库获取的是**年龄范围**，而不是用户精确的出生日期或年龄。

> **重要：**该库当前处于 Alpha 阶段，可能频繁发生破坏性变更，不适合在缺少版本锁定和充分测试的情况下直接依赖其 API 稳定性。

本文档描述的是下一个 Expo SDK 版本。当前稳定文档对应 SDK 56，实际项目应确认自己使用的 Expo SDK 版本与文档版本一致。

## 适用场景

适合使用该库的场景包括：

- 应用需要区分儿童、青少年和成年人。
- 某些功能或内容存在最低年龄要求。
- 应用需要满足美国部分州等地区的年龄保证法规。
- 应用希望优先使用操作系统提供的年龄声明能力，而不是自行收集出生日期。
- 应用重大更新后，需要在 iOS 上获得成人确认或家长同意。

当前文档未涉及以下内容：

- 如何设计完整的儿童隐私合规方案。
- 如何在服务端保存或校验年龄范围。
- 如何根据年龄范围实现具体的内容过滤规则。
- Google Play 或 App Store 的审核要求。
- Web 平台上的真实年龄验证方案。
- Android 原生 API 的完整错误码列表。

## 阅读前需要理解的背景

### Expo 与 React Native

React Native 使用 React 的组件模型开发 iOS 和 Android 应用，但最终运行的是原生移动端界面，而不是浏览器 DOM。

例如：

- React Web 使用 `<div>`、`<button>`。
- React Native 使用 `<View>`、`<Button>`。
- React Web 的点击事件通常是 `onClick`。
- React Native 的按钮事件是 `onPress`。

Expo 是构建 React Native 应用的一套工具链。`expo-age-range` 虽然通过 JavaScript/TypeScript 调用，但底层依赖 Android 和 iOS 的原生系统 API。

因此，该库的行为会受到以下条件影响：

- 操作系统及其版本。
- 用户是否登录设备账户。
- 应用是否配置了原生权限或 entitlement。
- 当前账户所在地区。
- Google Play 或 Apple 系统服务是否支持相应能力。

这与 React Web 中调用普通 npm 工具库不同：安装 JavaScript 包并不一定代表原生项目已经具备运行条件。

### 什么是 entitlement

iOS entitlement 是应用向系统声明自己需要使用某项系统能力的原生配置。

可以将它类比为 Web 应用部署平台上的能力声明，但它会进入 iOS 应用签名和原生构建配置，不是运行时普通 JavaScript 配置。

使用 iOS 年龄范围 API 时，需要启用：

```text
com.apple.developer.declared-age-range
```

### 什么是年龄阈值

应用不会请求一个精确年龄，而是向系统提供年龄分界点。例如：

```ts
{
  threshold1: 10,
  threshold2: 13,
  threshold3: 18,
}
```

这些阈值将年龄划分成若干范围。系统返回的重点是用户落入范围后的上下边界，例如 `lowerBound` 和 `upperBound`。

> **基于文档内容推导：**应用应该围绕“年龄区间”设计业务判断，而不应假设能够获得用户的精确年龄。

## 安装

根据项目使用的包管理器执行对应命令：

```sh
# npm
npx expo install expo-age-range

# yarn
yarn expo install expo-age-range

# pnpm
pnpm expo install expo-age-range

# bun
bun expo install expo-age-range
```

`expo install` 会根据项目当前的 Expo SDK 版本选择兼容的包版本。对于包含原生代码的 Expo 模块，应优先使用该命令，而不是直接运行普通的 `npm install`。

如果是在已有的裸 React Native 项目中使用，需要先安装并配置 `expo`，使项目能够加载 Expo 原生模块。

## iOS 原生配置

### Expo 项目

iOS 项目必须使用 **Xcode 26.0 或更高版本**构建。

在 Expo app config 中添加 entitlement：

```json
{
  "expo": {
    "ios": {
      "entitlements": {
        "com.apple.developer.declared-age-range": true
      }
    }
  }
}
```

app config 通常对应 `app.json`、`app.config.js` 或 `app.config.ts`。这项配置会在生成或构建 iOS 原生项目时写入相应的 entitlement。

### 已有 React Native 原生项目

如果项目直接维护 `ios` 原生目录，需要修改：

```text
ios/[app]/[app].entitlements
```

添加：

```xml
<key>com.apple.developer.declared-age-range</key>
<true/>
```

这里的 `[app]` 是实际 iOS target 或应用名称，不是需要原样保留的目录名。

### Android 配置

当前文档没有要求添加 Android app config、Manifest 权限或其他原生配置。

这只表示本文档未列出额外配置，不能据此推断所有 Android 发布与合规工作都会自动完成。

## 基本使用流程

### 导入模块

```ts
import * as AgeRange from 'expo-age-range';
```

这种导入方式会将该模块导出的函数和类型放在 `AgeRange` 命名空间下，例如：

```ts
AgeRange.requestAgeRangeAsync(...)
```

### 请求年龄范围

```tsx
import * as AgeRange from 'expo-age-range';
import { useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

export default function App() {
  const [result, setResult] = useState<
    AgeRange.AgeRangeResponse | { error: string } | null
  >(null);

  const requestAgeRange = async () => {
    try {
      const ageRange = await AgeRange.requestAgeRangeAsync({
        threshold1: 10,
        threshold2: 13,
        threshold3: 18,
      });

      setResult(ageRange);
    } catch (error) {
      setResult({ error: error.message });
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Request Age Range" onPress={requestAgeRange} />

      {result && (
        <Text style={styles.result}>
          {'error' in result
            ? `Error: ${result.error}`
            : `Lower age bound: ${result.lowerBound}`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  result: {
    marginTop: 20,
    fontSize: 16,
  },
});
```

执行过程如下：

1. 用户点击 React Native 的 `Button`。
2. `requestAgeRangeAsync` 请求系统提供年龄范围。
3. 操作系统可能显示原生授权界面。
4. 用户允许后，Promise 返回 `AgeRangeResponse`。
5. 用户拒绝或请求失败时，Promise 抛出错误。
6. React state 保存结果并更新界面。

示例只显示 `lowerBound`，实际返回结果还可能包含 `upperBound` 和平台特有的元数据。

> **基于经验建议：**TypeScript 中 `catch` 捕获值应先按 `unknown` 处理，再判断是否为 `Error`，不要直接假设一定存在 `error.message`。

## 推荐的年龄门槛流程

不同平台和 iOS 版本支持不同能力。业务代码不能只依赖一个布尔值完成全部判断。

### 第一步：判断年龄法规是否适用

```ts
const eligible =
  await AgeRange.isEligibleForAgeFeaturesAsync();
```

该方法仅在 **iOS 26.2 及以上版本**提供有效判断，用于询问系统当前用户是否受年龄保证法规约束。

结果含义：

| 结果 | 含义 | 建议处理 |
| --- | --- | --- |
| `true` | Apple 确认法规适用 | 继续请求年龄范围 |
| `false` | Apple 确认法规不适用 | 可以跳过年龄门槛 |
| `null` | 系统或平台无法提供判断 | 视为未知，继续执行后备逻辑 |
| Promise 拒绝 | 请求失败 | 视为未知，不应当成 `false` |

推荐模式：

```ts
try {
  const eligible =
    await AgeRange.isEligibleForAgeFeaturesAsync();

  if (eligible === false) {
    return;
  }
} catch {
  // 请求失败时继续进入年龄请求或应用自己的后备判断
}

const ageRange = await AgeRange.requestAgeRangeAsync({
  threshold1: 18,
});
```

这里必须使用：

```ts
eligible === false
```

而不是：

```ts
if (!eligible)
```

因为 `null` 表示“未知”，不是“不适用”。使用 `!eligible` 会错误地把 `null` 和 `false` 合并处理。

文档的返回类型位置写为 `Promise<boolean>`，但行为说明明确指出可能返回 `null`。实现业务逻辑时应以文档列出的三态语义为准，并核对实际安装版本的 TypeScript 类型。

### 第二步：请求年龄范围

```ts
const response =
  await AgeRange.requestAgeRangeAsync({
    threshold1: 18,
  });
```

支持平台：

- Android。
- iOS 26.0 及以上版本。

该方法会请求用户向应用分享年龄范围，操作系统可能缓存响应，后续调用不一定再次显示界面。

用户需要登录设备账户才能获得有效响应。

不支持时的文档行为是：

- iOS 26 之前：返回 `lowerBound: 18`。
- Web：返回 `lowerBound: 18`。

该结果等价于成年用户响应。

这是一个需要特别注意的降级行为：`lowerBound: 18` 不一定证明系统实际完成了年龄验证，也可能只是平台不支持时的兼容返回值。

> **基于文档内容推导：**如果业务必须区分“已确认成年”和“不支持年龄 API”，仅检查 `lowerBound >= 18` 不足以完成这个区分，还需要结合平台及系统版本判断。

### 第三步：处理结果和错误

不要把所有异常统一视为未成年，也不要统一视为成年人。至少应区分：

- 用户主动拒绝。
- 用户没有登录设备账户。
- 请求参数无效。
- 系统服务调用失败。
- 当前平台或系统版本不支持。

## 重大应用更新确认

iOS 26.4 及以上版本增加了与重大更新相关的监管能力。

### 查询当前用户需要哪些监管功能

```ts
const features =
  await AgeRange.getRequiredRegulatoryFeaturesAsync();
```

该方法返回操作系统报告的监管功能集合。

可能的值包括：

```ts
'declaredAgeRangeRequired'
'significantAppChangeRequiresAdultNotification'
'significantAppChangeRequiresParentalConsent'
```

含义分别是：

| 值 | 含义 |
| --- | --- |
| `declaredAgeRangeRequired` | 需要获取声明的年龄范围 |
| `significantAppChangeRequiresAdultNotification` | 重大应用变更需要通知成人 |
| `significantAppChangeRequiresParentalConsent` | 重大应用变更需要家长同意 |

在以下环境中会返回 `null`：

- iOS 26.4 之前。
- Android。
- Web。

`null` 表示“未知”，不能解释成“当前用户不需要任何监管功能”。

### 显示重大更新确认界面

```ts
await AgeRange.showSignificantUpdateAcknowledgmentAsync(
  '本次更新增加了新的社交互动功能。'
);
```

参数 `updateDescription` 是向用户展示的重大更新说明。

在 iOS 26.4 及以上版本中：

1. 系统显示原生确认界面。
2. 用户确认后 Promise 完成。
3. 调用失败时 Promise 拒绝。

在不支持的平台上，该方法会立即完成，不显示任何界面。

调用前应先检查监管功能：

```ts
const features =
  await AgeRange.getRequiredRegulatoryFeaturesAsync();

if (
  features?.includes(
    'significantAppChangeRequiresAdultNotification'
  )
) {
  await AgeRange.showSignificantUpdateAcknowledgmentAsync(
    '本次更新增加了新的社交互动功能。'
  );
}
```

这样可以避免向不受相关法规约束的用户显示无必要的确认界面。

对于 `significantAppChangeRequiresParentalConsent` 应如何完成家长同意流程，当前文档未提供进一步实现说明。

## API 参考

### `requestAgeRangeAsync(options)`

请求用户分享年龄范围。

```ts
AgeRange.requestAgeRangeAsync(options)
```

参数类型为 `AgeRangeRequest`，返回：

```ts
Promise<AgeRangeResponse>
```

请求可能被操作系统缓存，因此不能假设每次调用都会弹出原生界面。

### `isEligibleForAgeFeaturesAsync()`

判断 Apple 是否确认当前用户所在地区受到年龄保证法规约束。

```ts
AgeRange.isEligibleForAgeFeaturesAsync()
```

仅 iOS 26.2 及以上版本能够提供有效判断。Android、Web 和旧版 iOS 返回 `null`。

### `getRequiredRegulatoryFeaturesAsync()`

查询当前用户需要支持的监管能力。

```ts
AgeRange.getRequiredRegulatoryFeaturesAsync()
```

仅 iOS 26.4 及以上版本支持。其他环境返回 `null`。

### `showSignificantUpdateAcknowledgmentAsync(updateDescription)`

显示由系统提供的重大更新确认界面。

```ts
AgeRange.showSignificantUpdateAcknowledgmentAsync(
  updateDescription
)
```

仅 iOS 26.4 及以上版本实际显示 UI；其他平台立即完成。

## 类型说明

### `AgeRangeRequest`

年龄范围请求参数：

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `threshold1` | `number` | 是 | 应用要求的第一个最低年龄 |
| `threshold2` | `number` | 否 | 第二个年龄分界点 |
| `threshold3` | `number` | 否 | 第三个年龄分界点 |

文档将此类型标记为 iOS 支持，但 `requestAgeRangeAsync` 同时支持 Android。当前文档没有进一步解释 Android 如何使用这些阈值。

各年龄阈值之间至少需要相差两岁，否则 iOS 会抛出 `ERR_AGE_RANGE_INVALID_REQUEST`。

因此，下面的参数无效：

```ts
{
  threshold1: 12,
  threshold2: 13
}
```

下面的间隔符合文档要求：

```ts
{
  threshold1: 10,
  threshold2: 13,
  threshold3: 18
}
```

### `AgeRangeResponse`

年龄范围请求结果：

| 属性 | 平台 | 含义 |
| --- | --- | --- |
| `lowerBound` | Android、iOS | 年龄范围下限，可能为 `null` |
| `upperBound` | Android、iOS | 年龄范围上限，可能为 `null` |
| `activeParentalControls` | iOS | 用户分享的已启用家长控制列表 |
| `ageRangeDeclaration` | iOS | 年龄范围由本人还是监护人声明 |
| `installId` | Android | Google Play 分配给受监管用户安装记录的 ID |
| `mostRecentApprovalDate` | Android | 最近一次重大变更获批的时间戳 |
| `userStatus` | Android | 用户的年龄验证或监管状态 |

虽然 `lowerBound` 是必有字段，但其值仍可能是 `null`。业务代码不能直接执行：

```ts
if (response.lowerBound >= 18) {
  // ...
}
```

应先处理空值：

```ts
if (
  response.lowerBound !== null &&
  response.lowerBound >= 18
) {
  // ...
}
```

#### `ageRangeDeclaration`

可能值：

| 值 | 含义 |
| --- | --- |
| `selfDeclared` | 用户本人声明 |
| `guardianDeclared` | 由父母、监护人或家庭共享组织者声明 |
| `null` | 没有可用声明信息 |

该字段说明声明来源，不等同于完整的身份认证或精确年龄验证。

#### `userStatus`

Android 可能返回：

| 值 | 含义 |
| --- | --- |
| `VERIFIED` | 年龄状态已验证 |
| `SUPERVISED` | 用户处于监管状态 |
| `SUPERVISED_APPROVAL_PENDING` | 监管批准待处理 |
| `SUPERVISED_APPROVAL_DENIED` | 监管批准被拒绝 |
| `DECLARED` | 年龄由用户声明 |
| `UNKNOWN` | 状态未知 |
| `null` | 没有状态信息 |

`installId` 用于标识 Google Play 上受监管用户的某次安装，以便在应用批准被撤销时进行通知。当前文档没有给出撤销通知的接收和处理流程。

`mostRecentApprovalDate` 是时间戳，但当前文档没有明确其单位。不要在未核对 Android 原始文档或实际类型行为前假设它一定是秒或毫秒。

### `AgeRangeRegulatoryFeature`

这是字符串字面量联合类型：

```ts
type AgeRangeRegulatoryFeature =
  | 'declaredAgeRangeRequired'
  | 'significantAppChangeRequiresAdultNotification'
  | 'significantAppChangeRequiresParentalConsent';
```

使用联合类型可以避免任意字符串，并让 TypeScript 在拼写错误时给出提示。

## iOS 错误码

原生模块抛出的错误会在 `code` 属性中提供错误码。

| 错误码 | 含义 | 常见处理 |
| --- | --- | --- |
| `ERR_AGE_RANGE_USER_DECLINED` | 用户拒绝分享年龄范围 | 不要继续假设用户属于某个年龄段，进入应用定义的后备流程 |
| `ERR_AGE_RANGE_NOT_AVAILABLE` | 年龄范围不可用，最可能是设备未登录 Apple 账户 | 提示用户检查账户状态，或采用后备流程 |
| `ERR_AGE_RANGE_INVALID_REQUEST` | 请求参数无效，年龄阈值之间必须至少相差两岁 | 修正应用代码中的阈值配置 |

Android 错误码没有在当前文档中逐项列出，需要查阅 Google Play Age Signals API 的错误处理文档。

建议按错误码处理：

```ts
try {
  const response =
    await AgeRange.requestAgeRangeAsync({
      threshold1: 18,
    });
} catch (error) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error
  ) {
    switch (error.code) {
      case 'ERR_AGE_RANGE_USER_DECLINED':
        break;
      case 'ERR_AGE_RANGE_NOT_AVAILABLE':
        break;
      case 'ERR_AGE_RANGE_INVALID_REQUEST':
        break;
    }
  }
}
```

## 平台与版本差异

| 能力 | Android | iOS 26.0+ | iOS 26.2+ | iOS 26.4+ | Web |
| --- | --- | --- | --- | --- | --- |
| 请求年龄范围 | 支持 | 支持 | 支持 | 支持 | 返回成年兼容结果 |
| 判断法规是否适用 | 返回 `null` | 返回 `null` | 支持 | 支持 | 返回 `null` |
| 查询监管功能 | 返回 `null` | 返回 `null` | 返回 `null` | 支持 | 返回 `null` |
| 显示重大更新确认 | 不显示 UI | 不显示 UI | 不显示 UI | 支持 | 不显示 UI |

表中的“返回成年兼容结果”来自文档对 `requestAgeRangeAsync` 的说明，即不支持时返回 `lowerBound: 18`。

## 限制条件与坑点

### 必须使用真机测试

文档强烈建议在真实设备上测试，因为模拟器运行时可能无法按预期工作。

年龄范围能力依赖设备账户、系统服务和原生界面，模拟器无法可靠还原所有条件。模拟器调用成功或失败都不能完全代表真实设备表现。

### 用户需要登录设备账户

用户需要在设备上登录账户才能获得有效响应。iOS 用户未登录 Apple 账户时，很可能收到：

```text
ERR_AGE_RANGE_NOT_AVAILABLE
```

### `null` 不表示否定

以下方法返回的 `null` 都表示未知：

- `isEligibleForAgeFeaturesAsync()`
- `getRequiredRegulatoryFeaturesAsync()`

不能把 `null` 解释为：

- 法规一定不适用。
- 当前没有监管要求。
- 用户一定是成年人。

### 不支持平台可能表现为成功

部分 API 不会在不支持的平台上抛错：

- `requestAgeRangeAsync` 可能返回 `lowerBound: 18`。
- `showSignificantUpdateAcknowledgmentAsync` 会立即完成而不显示 UI。

因此，“Promise 成功完成”不代表系统实际执行了年龄确认或显示了确认界面。

### 系统可能缓存响应

年龄请求结果可能被操作系统缓存。不要将“是否出现弹窗”作为判断 API 是否执行成功的依据，也不要设计必须依赖每次重新询问用户的流程。

### Alpha API 可能发生破坏性变化

升级 Expo SDK 或 `expo-age-range` 前，应重新核对：

- 函数签名。
- 返回类型。
- 支持的系统版本。
- 错误码。
- 原生配置要求。

> **基于经验建议：**生产项目应固定依赖版本，并通过真机自动化或人工回归覆盖关键年龄门槛流程。

## React Web 开发者最容易误解的地方

### 这不是浏览器权限 API

浏览器权限通常由网站在运行时请求，而该库还依赖原生构建配置、系统版本和设备账户。修改 iOS entitlement 后，需要重新构建原生应用，仅刷新 JavaScript 通常不够。

### 返回的是区间，不是精确年龄

业务逻辑应该围绕 `lowerBound` 和 `upperBound` 设计，同时处理二者可能为 `null` 的情况。

不要根据一个区间反推出用户的生日或精确年龄。

### 平台差异是 API 契约的一部分

React Web 项目经常可以假设一套浏览器 API 行为大致一致。这里同一个函数在不同平台可能：

- 返回真实结果。
- 返回 `null`。
- 返回成年兼容值。
- 立即完成但不显示 UI。
- 抛出平台特定错误。

平台与系统版本判断不能只放在测试代码中，而应成为正式业务流程的一部分。

### 用户拒绝不等于未成年

`ERR_AGE_RANGE_USER_DECLINED` 只说明用户不愿分享，不能据此判断用户年龄。

应用需要自行定义拒绝时的策略，例如限制受年龄约束的功能，或提供其他合规流程。当前文档没有规定应选择哪种策略。

### 操作系统判断不等于应用全部合规

该库提供年龄范围和监管信号，但不会自动完成：

- 内容分级。
- 隐私政策调整。
- 数据存储合规。
- 家长同意的完整业务流程。
- 所有地区法规判断。

这些事项当前文档未涉及。

## 实际开发中的使用建议

以下建议中，流程基础来自文档；具体工程组织属于**基于经验建议**。

1. 在应用启动或进入受限功能前调用 `isEligibleForAgeFeaturesAsync`。
2. 只有明确返回 `false` 时才跳过年龄门槛。
3. 对 `true`、`null` 和调用异常执行年龄请求或应用自己的后备流程。
4. 调用 `requestAgeRangeAsync` 后同时处理年龄边界、平台元数据和错误码。
5. 不要将用户拒绝、系统未知和已确认成年合并成同一种状态。
6. 在重大应用更新时查询 `getRequiredRegulatoryFeaturesAsync`。
7. 仅在返回相应监管功能后显示重大更新确认界面。
8. 在真实 Android 和 iOS 设备上分别测试。

可以在应用内部定义明确的业务状态，避免 UI 层直接解释原生返回值：

```ts
type AgeGateState =
  | { status: 'adult' }
  | { status: 'minor'; lowerBound: number | null }
  | { status: 'not-required' }
  | { status: 'declined' }
  | { status: 'unavailable' }
  | { status: 'unknown' };
```

> **基于经验建议：**将 Expo API 返回值转换成应用自己的领域状态，可以集中处理 `null`、系统版本和平台差异，减少不同页面产生不一致判断。

## 总结

`expo-age-range` 为 React Native 应用统一封装了 Android Play Age Signals API 和 iOS Declared Age Range framework。

使用时需要掌握四个重点：

1. iOS 需要 Xcode 26.0 以上版本和对应 entitlement。
2. 年龄范围请求依赖真实设备、系统服务和已登录的设备账户。
3. `false`、`null`、异常和成年兼容返回值具有不同含义，不能混为一谈。
4. 该库仍处于 Alpha 阶段，并且不同能力分别要求 iOS 26.0、26.2 或 26.4。

该库提供的是年龄范围和监管信号，不是完整的年龄合规解决方案。应用仍需根据自身业务和适用法规设计内容限制、异常后备及家长同意流程。

---

## 文档导航

- **上一页**：[accelerometer](./137__accelerometer.md)
- **下一页**：[app integrity](./139__app-integrity.md)
