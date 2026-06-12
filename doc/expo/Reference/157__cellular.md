# Expo Cellular 学习指南

`expo-cellular` 是一个用于获取设备蜂窝网络及运营商信息的 Expo API，例如当前网络属于 2G、3G、4G 还是 5G，以及运营商名称、国家代码等。

> 本文对应 **Expo 下一版本 SDK 的未发布文档**，原文修改日期为 **2026 年 1 月 15 日**。文档明确提示：当前稳定版本是 **SDK 56**。未发布版本的 API 可能发生变化，正式项目应同时核对所用 Expo SDK 对应的文档。

## 文档解决的问题

这篇文档主要说明：

- 如何安装和引入 `expo-cellular`
- 如何申请读取手机状态的权限
- 如何读取当前蜂窝网络代际
- 如何读取运营商及其国家、网络代码
- Android、iOS 和 Web 平台之间的能力差异
- 无 SIM 卡、权限被拒绝等情况下可能得到的结果

它适合需要根据移动网络环境调整应用行为的场景，例如：

- 判断设备当前是否连接到 2G、3G、4G 或 5G
- 在低速蜂窝网络下减少图片质量或自动播放行为
- 收集经过用户同意的网络环境诊断信息
- 在 Android 上读取当前运营商信息
- 根据运营商或国家代码辅助排查网络问题

它不用于：

- 测量精确网速
- 判断 Wi-Fi 是否可用
- 控制蜂窝网络开关
- 获取用户手机号码
- 保证用户当前一定能够访问互联网

这些能力在当前文档中均未涉及。

## 阅读前需要理解的概念

### 蜂窝网络

蜂窝网络是由移动通信运营商提供的网络，例如中国移动、T-Mobile 或 Verizon。手机通过 SIM 卡或相关运营商配置接入网络。

它不同于 Wi-Fi。设备即使拥有 SIM 卡，也可能正在通过 Wi-Fi 上网，或者因飞行模式、无信号等原因没有连接蜂窝网络。

### 运营商信息

`expo-cellular` 可以提供以下几类信息：

| 信息 | 含义 |
| --- | --- |
| Carrier Name | 运营商名称，例如 `T-Mobile` |
| ISO Country Code | 运营商所属国家的 ISO 国家代码，例如 `us` |
| MCC | Mobile Country Code，移动国家代码 |
| MNC | Mobile Network Code，移动网络代码 |
| Cellular Generation | 当前蜂窝网络代际，例如 4G 或 5G |
| VoIP Policy | 运营商或系统是否支持特定的 VoIP 能力 |

MCC 与 MNC 通常组合起来标识移动网络运营商。它们不是电话号码，也不是用户身份标识。

### React Web 开发者需要建立的平台意识

在 React Web 中，代码通常只能访问浏览器暴露的 API。React Native 应用则可以通过原生模块调用 Android 或 iOS 的系统能力。

因此，使用 `expo-cellular` 时必须考虑：

1. 相同 API 在不同平台可能返回不同结果。
2. Android 可能需要在原生清单中声明权限。
3. 某些信息受 SIM 卡状态、信号和系统权限影响。
4. Web 端只能使用浏览器允许访问的有限信息。
5. TypeScript 声明看似返回 `string`，运行时仍可能返回 `null`。

## 安装

根据项目使用的包管理器执行对应命令：

```sh
# npm
npx expo install expo-cellular

# yarn
yarn expo install expo-cellular

# pnpm
pnpm expo install expo-cellular

# bun
bun expo install expo-cellular
```

`expo install` 与普通的 `npm install` 不完全相同。它会尽量安装与当前 Expo SDK 兼容的依赖版本，因此 Expo 项目应优先使用该命令。

如果是在已有的 React Native 原生项目中使用，还必须先安装并配置 `expo`，使项目具备加载 Expo 原生模块的能力。

## Android 配置

### 使用 CNG 时

CNG 是 **Continuous Native Generation（持续原生工程生成）**。Expo 可以根据应用配置生成 Android 和 iOS 原生工程，从而减少手动修改原生文件的需求。

应用需要在 `app.json` 的 `expo.android.permissions` 数组中声明：

```json
{
  "expo": {
    "android": {
      "permissions": ["READ_PHONE_STATE"]
    }
  }
}
```

`READ_PHONE_STATE` 提供对手机状态的只读访问，包括：

- 当前蜂窝网络信息
- 通话状态
- 设备上注册的 `PhoneAccount` 列表

声明权限不等于用户已经授权。应用运行时仍应通过权限 API 检查或请求授权。

### 手动维护 Android 原生工程时

如果项目未使用 CNG，或者正在手动维护 Android 原生工程，需要在 `AndroidManifest.xml` 中加入：

```xml
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
```

该权限用于访问 Android 的 `TelephonyManager`。可以把它理解为 Android 系统提供的“电话与蜂窝网络信息服务”。

文档明确说明：该库不需要风险更高的 `READ_PRIVILEGED_PHONE_STATE` 权限。

### iOS 配置

iOS 不需要额外权限配置。

不过，“不需要权限”不代表一定能读取到所有数据。当前文档中的多数运营商查询方法实际上只将 Android 列为支持平台，并说明它们在 iOS 上返回 `null`。

## 引入模块

```ts
import * as Cellular from 'expo-cellular';
```

这与 React Web 中导入工具模块类似：所有公开 API 都通过 `Cellular` 命名空间调用。

## 权限管理

### 使用 `usePermissions`

```ts
const [permission, requestPermission] = Cellular.usePermissions();
```

支持 Android、iOS 和 Web。

该 Hook 内部结合了：

- `Cellular.getPermissionsAsync()`
- `Cellular.requestPermissionsAsync()`

完整返回值还包括主动刷新权限状态的方法：

```ts
const [
  permission,
  requestPermission,
  getPermission,
] = Cellular.usePermissions();
```

其中：

- `permission`：当前权限响应；首次完成查询前可能为 `null`
- `requestPermission`：请求用户授权
- `getPermission`：重新读取当前权限状态

这与 Web 中使用自定义 Hook 管理异步权限状态相似，但底层调用的是原生系统权限机制。

### 命令式权限 API

#### 检查权限

```ts
const permission = await Cellular.getPermissionsAsync();
```

该方法只检查当前权限，不主动弹出授权界面。

#### 请求权限

```ts
const permission = await Cellular.requestPermissionsAsync();
```

该方法请求用户授予访问手机状态的权限。

文档没有列出 `PermissionResponse` 的全部字段。实际开发时应检查返回的权限状态，而不能仅以 Promise 成功结束作为已授权依据。

## 获取蜂窝网络代际

```ts
const generation = await Cellular.getCellularGenerationAsync();
```

该方法支持 Android、iOS 和 Web，返回 `CellularGeneration` 枚举值。

### 枚举值

| 枚举 | 数值 | 含义 |
| --- | ---: | --- |
| `UNKNOWN` | `0` | 未连接蜂窝网络，或无法判断网络类型 |
| `CELLULAR_2G` | `1` | 2G，包括 CDMA、EDGE、GPRS、IDEN |
| `CELLULAR_3G` | `2` | 3G，包括 EHRPD、EVDO、HSPA、HSUPA、HSDPA、HSPAP、UTMS |
| `CELLULAR_4G` | `3` | 4G，包括 LTE |
| `CELLULAR_5G` | `4` | 5G，包括 NR 和 NRNSA |

示例：

```ts
const generation = await Cellular.getCellularGenerationAsync();

if (generation === Cellular.CellularGeneration.CELLULAR_2G) {
  // 可以考虑减少高流量请求
}
```

获取网络代际前需要确认原生权限已获授权。如果权限被拒绝，该方法会解析为：

```ts
Cellular.CellularGeneration.UNKNOWN
```

因此，`UNKNOWN` 不能简单解释为“没有蜂窝网络”，它还可能表示：

- 权限被拒绝
- 系统无法识别网络类型
- 当前未连接蜂窝网络

### Web 平台的特殊实现

Web 端使用：

```ts
navigator.connection.effectiveType
```

它根据近期观测到的往返时间和下行数据估算连接的有效类型。

这意味着 Web 返回的是网络性能层面的估计，并不一定代表设备实际连接的无线通信制式。例如，物理上连接到 5G，但网络表现较差时，浏览器的估计结果可能与真实制式不同。

此外，Network Information API 的浏览器兼容性有限，使用前需要检查目标浏览器是否支持。

## 获取运营商信息

以下方法在文档的“支持平台”字段中均只标记了 Android。尽管部分说明提到了 iOS 行为，文档随后又明确写出 iOS 和 Web 返回 `null`。实际使用时应以可能返回 `null` 进行防御性处理。

### 运营商名称

```ts
const carrierName = await Cellular.getCarrierNameAsync();
// "T-Mobile"、"Verizon" 或 null
```

它返回用户归属运营商的名称。

限制条件：

- 双 SIM 设备只返回当前活动 SIM 卡的运营商。
- Android 只有在 SIM 状态为 `SIM_STATE_READY` 时才能获得该值。
- SIM 未准备好时返回 `null`。
- iOS 和 Web 返回 `null`。

“归属运营商”不一定等于设备漫游时实际接入的网络。

### ISO 国家代码

```ts
const countryCode = await Cellular.getIsoCountryCodeAsync();
// "us"、"au" 或 null
```

返回运营商的 ISO 国家代码。

文档提到在 iOS 的以下情况下值为 `null`：

- 设备处于飞行模式
- 设备没有 SIM 卡
- 设备不在蜂窝网络服务范围内

但当前 API 支持平台字段仅列出 Android，并且文档又明确说明 iOS 和 Web 返回 `null`。不要依赖该方法在 iOS 上返回国家代码。

该国家代码描述的是蜂窝运营商，而不是用户国籍、设备地区设置或 GPS 所在国家。

### 移动国家代码 MCC

```ts
const mcc = await Cellular.getMobileCountryCodeAsync();
// "310" 或 null
```

MCC 表示当前注册蜂窝服务提供商的移动国家代码。

限制条件：

- Android 要求 SIM 状态为 `SIM_STATE_READY`。
- 无 SIM 卡或不在蜂窝服务范围内时可能没有值。
- iOS 和 Web 返回 `null`。
- 文档还提到早于 iPhone 4S 的硬件在飞行模式下可能返回 `null`，但当前支持平台仍只标记为 Android。

MCC 是字符串，不应转换成数字，因为代码类数据应保留原始格式。

### 移动网络代码 MNC

```ts
const mnc = await Cellular.getMobileNetworkCodeAsync();
// "310" 或 null
```

MNC 表示当前注册蜂窝服务提供商的移动网络代码。

它的可用条件与 MCC 基本相同：

- Android 要求 SIM 已准备好。
- 无 SIM 卡或无蜂窝信号时可能没有值。
- iOS 和 Web 返回 `null`。

MNC 同样应当作为字符串处理。

## VoIP 支持检测

```ts
const allowsVoip = await Cellular.allowsVoipAsync();
```

该方法已被废弃，未来版本会删除。

文档给出的原因是：

- VoIP 技术在这里主要指旧的 SIP VoIP API。
- 这种技术并未被广泛使用。
- Google 正在从 Android 平台移除相关能力。

在 Android 上，该方法检查系统是否支持基于 SIP 的 VoIP API，而不是判断 WhatsApp、微信或 WebRTC 等应用层语音通话一定能够工作。

在 iOS 和 Web 上返回 `null`。

文档还记录了一个 iOS 历史行为：移除 SIM 卡后，设备可能保留此前运营商的 VoIP 策略值；插入新 SIM 卡后才会被新运营商策略替换。不过当前方法的平台声明只标记 Android，且文档明确说明 iOS 返回 `null`。

**实际开发结论：不要在新功能中依赖该方法。**

## 错误码

文档列出一个错误码：

| 错误码 | 含义 |
| --- | --- |
| `ERR_CELLULAR_GENERATION_UNKNOWN_NETWORK_TYPE` | 无法访问网络类型，或者设备未连接蜂窝网络 |

当前文档没有说明该错误在什么条件下以异常形式抛出，也没有提供 `try/catch` 示例。

在实际代码中仍应保护原生 API 调用：

```ts
try {
  const generation = await Cellular.getCellularGenerationAsync();
  // 处理枚举结果
} catch (error) {
  // 记录或降级处理
}
```

## 关键限制与容易踩坑的地方

### 返回类型与运行时结果不完全一致

多个方法在文档中标记为 `Promise<string>` 或 `Promise<boolean>`，但说明明确指出某些情况下返回 `null`。

因此业务代码应按可空值处理：

```ts
const carrierName = await Cellular.getCarrierNameAsync();

if (carrierName !== null) {
  // 使用运营商名称
}
```

不要直接调用：

```ts
const normalizedName = carrierName.toLowerCase();
```

否则 `carrierName` 为 `null` 时会产生运行时错误。

### 平台标记与 iOS 说明存在不一致

`getCarrierNameAsync`、`getIsoCountryCodeAsync`、`getMobileCountryCodeAsync` 和 `getMobileNetworkCodeAsync` 的支持平台只列出 Android，但描述中仍包含 iOS 条件，之后又声明 iOS 返回 `null`。

忠实于当前文档得出的开发策略是：

- 只在 Android 上依赖这些运营商查询方法。
- iOS 和 Web 按不提供结果处理。
- 不要根据其中的 iOS 历史描述实现核心业务逻辑。

### 双 SIM 不代表能获取两张卡的信息

`getCarrierNameAsync()` 只返回当前活动 SIM 卡对应的运营商。当前文档没有提供：

- 枚举全部 SIM 卡的方法
- 指定 SIM 卡槽的方法
- 获取每张 SIM 卡详细信息的方法

### 权限已授权也不保证有结果

即使权限已授权，以下情况仍可能导致 `null` 或 `UNKNOWN`：

- SIM 卡尚未准备好
- 没有 SIM 卡
- 飞行模式
- 不在蜂窝网络服务范围内
- 当前没有连接蜂窝网络
- 系统或浏览器无法判断网络类型

因此，权限状态与数据可用性必须分开判断。

### 网络代际不等于实际网速

4G 或 5G 只是网络类型，不代表请求一定快；2G 或 3G 也不能直接证明请求一定失败。

Web 端甚至是根据网络表现估算有效连接类型。不要将枚举值当作精确带宽或稳定性指标。

### 不能把运营商数据作为可靠身份凭据

**基于文档内容推导：** 这些字段会受到 SIM 卡切换、双 SIM 活动卡变化、漫游、信号和系统状态影响，因此不适合作为用户唯一标识、登录凭据或安全授权依据。

## 实际开发方式

一个较完整的读取流程可以写成：

```ts
import { useCallback, useState } from 'react';
import { Button, Text, View } from 'react-native';
import * as Cellular from 'expo-cellular';

export function CellularStatus() {
  const [permission, requestPermission] = Cellular.usePermissions();
  const [generation, setGeneration] =
    useState<Cellular.CellularGeneration | null>(null);

  const readGeneration = useCallback(async () => {
    if (!permission?.granted) {
      const result = await requestPermission();

      if (!result.granted) {
        return;
      }
    }

    try {
      const result = await Cellular.getCellularGenerationAsync();
      setGeneration(result);
    } catch {
      setGeneration(Cellular.CellularGeneration.UNKNOWN);
    }
  }, [permission, requestPermission]);

  return (
    <View>
      <Button title="读取蜂窝网络类型" onPress={readGeneration} />
      <Text>当前枚举值：{generation ?? '尚未读取'}</Text>
    </View>
  );
}
```

这个流程包含三个独立状态：

1. 是否已经取得权限。
2. 是否成功调用 API。
3. 返回结果是否为 `UNKNOWN`。

不要把这三个状态合并成一个简单的“有网络/无网络”布尔值。

**基于经验建议：**

- 在真正需要数据时再请求权限，并向用户说明用途。
- 将 `null`、`UNKNOWN` 和调用异常都设计成正常的降级路径。
- 使用真机验证 SIM、飞行模式、无信号和拒绝权限等情况。
- 不要仅依靠模拟器验证运营商信息。
- 对 Android、iOS 和 Web 分别测试，不能用一个平台的结果推断其他平台。
- 网络自适应策略应综合实际请求表现，不应只依赖网络代际。

## 文档明确内容与推导结论

### 文档明确说明

- `expo-cellular` 用于获取蜂窝服务提供商信息。
- Android 读取手机状态需要 `READ_PHONE_STATE`。
- iOS 不需要额外权限配置。
- 获取网络代际前需要检查权限。
- 权限被拒绝时，网络代际返回 `UNKNOWN`。
- Web 使用 `navigator.connection.effectiveType`。
- 双 SIM 设备只返回当前活动 SIM 卡的运营商。
- 多个运营商查询方法在 iOS 和 Web 上返回 `null`。
- `allowsVoipAsync()` 已废弃，并将在未来删除。
- 该库不需要 `READ_PRIVILEGED_PHONE_STATE`。

### 基于文档内容推导

- 所有运营商相关返回值都应按可空数据处理。
- `UNKNOWN` 不能直接等同于“设备没有网络”。
- 运营商信息不适合作为用户唯一标识或安全凭据。
- 关键功能不能依赖已废弃的 VoIP 检测方法。
- 跨平台应用需要为“不支持”和“无法获取”设计一致的降级逻辑。

## 当前文档未涉及

当前文档没有说明：

- 如何检测 Wi-Fi 或完整的互联网连接状态
- 如何测量准确网速、延迟或流量
- 权限被永久拒绝后如何跳转系统设置
- Android 各系统版本的权限差异
- 双 SIM 设备中如何获取全部 SIM 卡
- 如何监听蜂窝网络变化
- 如何获取电话号码
- 如何控制移动数据开关
- 完整的 `PermissionResponse` 字段结构
- 错误码的具体抛出时机
- 单元测试或端到端测试方式

## 总结

`expo-cellular` 的核心能力是读取蜂窝网络代际和运营商信息。对于跨平台应用，真正稳定且覆盖 Android、iOS、Web 的主要能力是 `getCellularGenerationAsync()`，但它仍受权限、系统状态和浏览器兼容性影响。

运营商名称、ISO 国家代码、MCC 和 MNC 应主要视为 Android 能力，并始终处理 `null`。在业务设计中，应将这些数据用作环境信息或体验优化依据，而不是身份认证、联网判断或关键流程的唯一条件。

---

## 文档导航

- **上一页**：[camera](./156__camera.md)
- **下一页**：[checkbox](./158__checkbox.md)
