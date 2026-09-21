# 130｜Expo SDK AgeRange 年龄范围

**翻页：**[上一页：Expo SDK Accelerometer](./129-Expo-SDK-Accelerometer.md) · [目录](./README.md) · [下一页：Expo SDK AppIntegrity](./131-Expo-SDK-AppIntegrity.md)

**官方页面：**[AgeRange · Latest](https://docs.expo.dev/versions/latest/sdk/age-range/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/age-range/)

**版本边界：**本库提供 Google Play Age Signals（Android）和 Apple Declared Age Range（iOS）接口。v56 页面标记 `expo-age-range` 为 Alpha，并使用较简化的查询示例；Latest 页面称库已稳定，但底层 Apple / Google API 仍在积极演进，也额外列出 Android 用户同意流程、监管资格与重要更新确认方法。应以项目当前 Expo SDK 对应的页面和真实设备行为为准。

## 按系统规则请求用户年龄范围

`expo-age-range` 让应用向系统请求用户年龄段，用于按年龄范围提供适龄体验。它返回的是年龄界限及平台元数据，并不代表应用可以自行推断用户实际生日。

官方建议在真实设备测试：模拟器未必能正确运行年龄范围 API。

安装：

~~~sh
npx expo install expo-age-range
yarn expo install expo-age-range
pnpm expo install expo-age-range
bun expo install expo-age-range
~~~

在非 Expo 的 React Native 工程中，还需要安装 `expo` 包。

## iOS 配置

iOS 需使用 Xcode 26.0 或更新版本，并开启 `com.apple.developer.declared-age-range` entitlement。Expo app config：

~~~json
{
  "expo": {
    "ios": {
      "entitlements": {
        "com.apple.developer.declared-age-range": true
      }
    }
  }
}
~~~

手动维护原生目录的 React Native 项目，要在 `ios/[app]/[app].entitlements` 加入：

~~~xml
<key>com.apple.developer.declared-age-range</key>
<true/>
~~~

### 系统中的同意流程不同

- **Android：**Latest 要先调用 `requestAgeSignalsAccessAsync()`；只有收到 `'SHARED'` 才继续请求年龄范围。用户拒绝时返回 `'NOT_SHARED'`；须强制验证但尚未完成时可能返回 `'VERIFICATION_REQUIRED'`。若用户不共享，年龄范围各字段会为 `null`。
- **iOS：**年龄范围请求本身会显示系统同意界面。单独调用 Android 同意方法在 iOS 返回 `null`，之后继续调用 `requestAgeRangeAsync()`。
- **Web / 不支持的 iOS 版本：**Latest 的 `requestAgeRangeAsync()` 在不支持场景下返回 `lowerBound: 18`，可视作成年响应；其他监管资格类方法会返回 `null`，需将其理解为“未知”。

## Latest 用法：先处理 Android 同意，再查询年龄范围

完整示例收集请求结果，将错误转换为 UI 文案，并请求三个年龄阈值：

~~~tsx
import * as AgeRange from 'expo-age-range';
import { useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

export default function App() {
  const [result, setResult] = useState<AgeRange.AgeRangeResponse | { error: string } | null>(null);

  const requestAgeRange = async () => {
    try {
      // On Android, ask the user to share their age signals first. Resolves with null on iOS.
      const status = await AgeRange.requestAgeSignalsAccessAsync();
      if (status !== null && status !== 'SHARED') {
        setResult({ error: `Age signals are not shared: ${status}` });
        return;
      }

      const ageRange = await AgeRange.requestAgeRangeAsync({
        threshold1: 10,
        threshold2: 13,
        threshold3: 18,
      });
      setResult(ageRange);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : String(error) });
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Request age range" onPress={requestAgeRange} />
      {result && (
        <Text style={styles.result}>
          {'error' in result ? `Error: ${result.error}` : `Lower age bound: ${result.lowerBound}`}
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
~~~

SDK v56 页面中的示例较简单：直接调用 `requestAgeRangeAsync`，遇到异常时输出 `error.message`。这是 v56 文档形态，不能把它和 Latest 新增的 Android consent 流程混为一谈。

~~~tsx
import * as AgeRange from 'expo-age-range';
import { useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

export default function App() {
  const [result, setResult] = useState<AgeRange.AgeRangeResponse | { error: string } | null>(null);

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
          {'error' in result ? `Error: ${result.error}` : `Lower age bound: ${result.lowerBound}`}
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
~~~

## 先判断监管是否适用

Latest 的 `isEligibleForAgeFeaturesAsync()` 仅在 iOS 26.2+ 能给出布尔判断。`false` 表示 Apple 确认当前用户不受相应监管；`true` 表示适用；Android、Web 和较旧 iOS 返回 `null`，而请求失败也只能视为未知：

~~~ts
try {
  const eligible = await isEligibleForAgeFeaturesAsync();
  if (eligible === false) {
    // Regulation does not apply — no age gate needed.
    return;
  }
} catch {
  // Treat errors as "unknown" and fall through to the prompt below or your own gating logic.
}

const ageRange = await requestAgeRangeAsync({ threshold1: 18 });
~~~

推荐只有在结果不是 `false` 时才请求用户提供年龄范围；若遇到 `null` 或异常，先按“未知”处理，而不是当作法规一定适用或一定不适用。

## Latest API 方法

导入入口：

~~~ts
import * as AgeRange from 'expo-age-range';
~~~

| 方法 | 平台 / 系统版本 | 返回与用途 |
| --- | --- | --- |
| `getRequiredRegulatoryFeaturesAsync()` | iOS 26.4+ | 返回操作系统要求支持的监管功能；iOS 较旧版、Android、Web 返回 `null`（未知）。 |
| `isEligibleForAgeFeaturesAsync()` | iOS 26.2+ | `Promise<boolean \| null>`；检查年龄保障法规是否适用于当前用户。 |
| `requestAgeRangeAsync(options)` | Android、iOS 26.0+ | `Promise<AgeRangeResponse>`；请求年龄范围，操作系统可能缓存回答。设备需登录账户才可能返回有效信息。Android 必须先等待同意状态为 `'SHARED'`。 |
| `requestAgeSignalsAccessAsync()` | Android | `Promise<AgeSignalsStatus \| null>`；显示 Google Play 年龄信号同意界面。iOS / Web 返回 `null`。 |
| `showSignificantUpdateAcknowledgmentAsync(updateDescription)` | iOS 26.4+ | 向用户显示系统提供的重要更新确认弹窗；不支持平台立即 resolve。先查询监管功能中是否包含重要更新确认要求。 |

Android `requestAgeSignalsAccessAsync()` 可能得到：

- `'SHARED'`：用户同意分享，可继续请求年龄范围。
- `'NOT_SHARED'`：用户未同意，年龄响应字段为 `null`。
- `'VERIFICATION_REQUIRED'`：所在地区要求验证身份，用户需要到 Google Play 完成流程。
- `null`：该状态未报告，或运行在 iOS / Web。

## 类型与字段

### `AgeRangeRegulatoryFeature`（Latest）

仅 iOS 26.4+ 提供，值包含：`'declaredAgeRangeRequired'`、`'significantAppChangeRequiresAdultNotification'`、`'significantAppChangeRequiresParentalConsent'`。

### `AgeRangeRequest`

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `threshold1` | `number` | App 的主要最低年龄阈值。 |
| `threshold2` | `number`（可选） | 额外最低年龄阈值。 |
| `threshold3` | `number`（可选） | 额外最低年龄阈值。 |

### `AgeRangeResponse`

| 属性 | 类型 / 平台 | 说明 |
| --- | --- | --- |
| `activeParentalControls` | `string[]`（iOS） | 已启用并共享的家长控制功能。 |
| `ageRangeDeclaration` | `'selfDeclared' \| 'guardianDeclared' \| 'confirmed' \| null`（iOS） | 年龄由本人、监护人 / 家庭组织者声明，或由系统确认；`confirmed` 在 iOS 26.2+ 才报告。 |
| `ageRangeSource` | `'TIER_A' \| 'TIER_B' \| 'TIER_C' \| 'TIER_D' \| null`（Latest Android） | Play Age Signals 用来判断年龄的来源级别；`NOT_SHARED` / `VERIFICATION_REQUIRED` 时为 `null`。 |
| `installId` | `string \| null`（Android） | Google Play 为受监督用户安装分配的 ID。 |
| `lowerBound` | `number \| null` | 年龄范围下界。 |
| `upperBound` | `number \| null` | 年龄范围上界。 |
| `mostRecentApprovalDate` | `number \| null`（Android） | SDK56 中表示最近一次重大变更获批时间戳；Latest 标记为废弃，改用 `significantChangeApprovalDate`。 |
| `significantChangeApprovalDate` | `number \| null`（Latest Android） | 最近批准的重要变更生效时间；没有已记录变更时为 `null`。 |
| `significantChangeStatus` | `'APPROVED' \| 'PENDING' \| 'DECLINED' \| null`（Latest Android） | 监护人对重大变更的审批状态。无监督账号或无变更时为 `null`。 |
| `userStatus` | 多个状态字符串或 `null`（Android） | SDK56 中描述年龄验证 / 监管状态；Latest 页面改为按 `ageRangeSource` 和 significant-change 字段表达。 |

### 错误码

Latest 文档列出的跨平台错误包括：

| 错误码 | 平台 | 说明 |
| --- | --- | --- |
| `ERR_AGE_RANGE_USER_DECLINED` | iOS | 用户拒绝分享年龄范围。 |
| `ERR_AGE_RANGE_NOT_AVAILABLE` | iOS | 年龄范围不可用，常见原因是设备未登录 Apple 账户。 |
| `ERR_AGE_RANGE_INVALID_REQUEST` | iOS | 请求参数无效；多个年龄阈值之间至少需间隔两年。 |
| `ERR_AGE_RANGE_TASK_CANCELLED` | Android | 用户关闭 Google Play 年龄信号同意界面。 |

原生模块抛出的错误可从异常的 `code` 字段读取。Android 还有 Google Play API 的具体错误码，应参照官方 Play Age Signals 错误码表。

## 新手术语

- **年龄范围（Age Range）：**操作系统或平台根据账户 / 验证机制提供的一段年龄上下界，不等同于生日或精确年龄。
- **Android `ageRangeSource` 等级：**`TIER_A` 表示用户自我申报；`TIER_B` 表示由监护人管理；`TIER_C` 表示通过信用卡、邮箱、人脸自拍评估、政府证件或税号等方式评估；`TIER_D` 表示通过政府证件和自拍评估组合或数字 ID 检查。
- **Age Signals：**Google Play 在 Android 提供的年龄信号接口。
- **Declared Age Range：**Apple 提供的年龄范围声明机制。
- **Entitlement：**iOS 原生能力授权配置，应用签名和系统 API 会据此判断 App 是否具备调用资格。
- **监管功能（Regulatory feature）：**操作系统告知 App 某项年龄保障法规要求支持的能力：提供年龄范围、对重要变更通知成年人，或要求家长同意。
- **阈值（threshold）：**应用提出的最低年龄分界值，系统据此返回可供应用判断的范围信息。
- **监管资格 `null`：**表示系统无法判断（例如平台 / 系统版本不支持），不能误当作“法规不适用”。

## 源页代码主题覆盖

已覆盖四种包管理器安装命令、iOS app config entitlement 和手动 entitlements 写法；保留 Latest 中 Android 同意后请求年龄范围的完整 UI 示例、监管资格示例，以及 SDK v56 页面较简化的独立示例。方法、响应字段、监管功能和错误类型均在正文与表格说明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/age-range/) · [SDK v56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/age-range/)

**翻页：**[上一页：Expo SDK Accelerometer](./129-Expo-SDK-Accelerometer.md) · [目录](./README.md) · [下一页：Expo SDK AppIntegrity](./131-Expo-SDK-AppIntegrity.md)
