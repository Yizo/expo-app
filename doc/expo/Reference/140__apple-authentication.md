# Expo AppleAuthentication 学习文档

`expo-apple-authentication` 是 Expo 提供的 Apple 登录库，用于在 **iOS 和 tvOS** 应用中接入“通过 Apple 登录”（Sign in with Apple）。

> 本文原始页面属于下一版本 SDK 的未发布文档。页面明确指出，当前最新稳定版本为 **SDK 56**。本文仅根据所提供的原文内容整理。

## 这篇文档解决什么问题

本文主要说明：

- 如何安装 `expo-apple-authentication`
- 如何为 iOS 工程启用 Apple 登录能力
- 如何显示符合 Apple 规范的原生登录按钮
- 如何发起登录、刷新凭证和检查凭证状态
- 如何处理 Apple 返回的用户信息和 JWT
- 如何在 Expo Go、模拟器和真实设备中测试
- API 的参数、返回值、枚举及错误码

它适合需要在 Expo 或现有 React Native iOS 应用中接入 Apple 登录的开发者。

## 平台与适用范围

文档标注的支持范围是：

| 平台 | 支持情况 |
| --- | --- |
| iOS | 支持 |
| tvOS | 支持 |
| Android | 不支持 |
| Web | 不支持 |
| iOS Expo Go | 可用于测试 |

对于 React Web 开发者，最重要的区别是：这不是浏览器中的 OAuth 登录组件，而是对 Apple 原生 `AuthenticationServices` 能力的封装。它依赖 iOS 原生工程权限、应用签名和原生二进制构建。

如果应用提供第三方登录选项，则必须同时提供 Apple 登录选项，才能符合 App Store 审核指南。

## 开始前需要理解的概念

### Expo 与 React Native

React Native 使用 React 的组件模型开发移动应用，但最终渲染的是原生 UI，而不是 DOM。

例如：

- Web 中使用 `<div>`，React Native 中通常使用 `<View>`
- Web 中通过 CSS 设置样式，React Native 中通过 JavaScript 样式对象设置
- Web OAuth 常通过跳转或弹窗完成，Apple 原生登录由操作系统显示认证界面

Expo 是建立在 React Native 之上的工具和服务体系。`expo-apple-authentication` 是 Expo 模块，但也可以安装到已经存在的 React Native 工程中。

### 原生能力与 App Binary

Apple 登录不只是一个 JavaScript 包。应用还需要在 iOS 工程和 Apple 开发者配置中声明对应的 capability（系统能力）。

这类配置不能在应用运行时动态修改，通常必须：

1. 修改 Expo app config 或原生 iOS 工程。
2. 重新生成或配置原生工程。
3. 重新构建应用二进制文件。
4. 将新二进制安装到设备。

这与 React Web 中修改环境变量后重新部署类似，但还涉及 Apple 签名、entitlements 和原生工程配置。

### Config Plugin 与 CNG

Config Plugin 是 Expo 在生成原生工程时执行的配置插件，可以自动修改 iOS、Android 原生项目中的配置。

CNG（Continuous Native Generation，持续原生工程生成）是根据 Expo 配置生成原生工程的工作流。使用 CNG 时，通常应通过 app config 和 config plugin 声明原生配置，而不是手工维护 Xcode 工程。

如果项目不使用 CNG，则需要手动配置 Apple 登录能力。

## 安装

根据包管理器选择一条命令：

```sh
# npm
npx expo install expo-apple-authentication

# yarn
yarn expo install expo-apple-authentication

# pnpm
pnpm expo install expo-apple-authentication

# bun
bun expo install expo-apple-authentication
```

`expo install` 会根据当前 Expo SDK 选择兼容的包版本。它不是普通的 `npm install` 别名，因此 Expo 项目通常应优先使用该命令。

如果是在已有的 React Native 工程中安装，还必须先按照 Expo 的说明安装 `expo`，使工程能够加载 Expo 原生模块。

## 配置 iOS 工程

### 启用 Apple 登录能力

在项目的 app config 中设置：

```json
{
  "expo": {
    "ios": {
      "usesAppleSignIn": true
    }
  }
}
```

`ios.usesAppleSignIn` 用来声明 iOS 应用需要“Sign In with Apple”能力。

这是构建期配置，修改后需要重新构建应用，不能仅通过 JavaScript 热更新生效。

### 使用 Config Plugin

在 `app.json` 中注册插件：

```json
{
  "expo": {
    "plugins": ["expo-apple-authentication"]
  }
}
```

使用 EAS Build 构建时，Expo 会在构建前通过 iOS capability signing 启用需要的能力。

> EAS Build 是 Expo 提供的应用构建服务。它负责生成可安装或可发布的原生应用，而不是像 Web 构建工具那样只输出静态资源。

### 不使用 EAS Build 时的手动配置

不使用 EAS Build 的项目，必须为应用的 bundle identifier 手动配置 **Apple Sign In** capability。

Bundle identifier 可以理解为 iOS 应用的全局身份标识，类似 Web 服务中的固定应用 ID，但它还直接参与签名、权限和 App Store 发布。

如果通过 Apple Developer Console 启用了该能力，还需在以下文件中添加 entitlement：

```text
ios/[app]/[app].entitlements
```

内容为：

```xml
<key>com.apple.developer.applesignin</key>
<array>
  <string>Default</string>
</array>
```

Entitlements 是随应用签名写入的原生权限声明。JavaScript 代码无法在运行时补充这项权限。

还需要在以下文件中将 `CFBundleAllowMixedLocalizations` 设置为 `true`：

```text
ios/[app]/Info.plist
```

其作用是确保 Apple 登录按钮使用设备当前的语言区域设置。

## 基本使用流程

```jsx
import * as AppleAuthentication from 'expo-apple-authentication';
import { View, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={5}
        style={styles.button}
        onPress={async () => {
          try {
            const credential = await AppleAuthentication.signInAsync({
              requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
              ],
            });

            // 登录成功，处理并保存 credential
          } catch (e) {
            if (e.code === 'ERR_REQUEST_CANCELED') {
              // 用户主动取消登录
            } else {
              // 处理其他错误
            }
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 200,
    height: 44,
  },
});
```

完整流程是：

1. 渲染 Apple 提供的原生按钮。
2. 用户点击按钮。
3. 在 `onPress` 中调用 `signInAsync()`。
4. 操作系统显示 Apple 登录界面。
5. 登录成功后获得 `AppleAuthenticationCredential`。
6. 处理并持久保存首次返回的用户资料。
7. 将凭证交给服务端验证并建立应用自己的登录会话。
8. 区分用户取消与真正的认证错误。

## AppleAuthenticationButton

该组件底层使用 Apple 原生的 `ASAuthorizationAppleIDButton`，会自动满足 Apple 对品牌、颜色、比例、本地化和无障碍的要求。

### 可用性检查

只有在以下方法返回 `true` 时才应渲染按钮：

```ts
const available = await AppleAuthentication.isAvailableAsync();
```

如果在不支持的环境中直接渲染：

- 组件不会显示任何内容
- 开发模式下会输出警告

这也是处理跨平台应用的关键：不能假设 iOS、Android 和 Web 都能渲染同一个 Apple 登录组件。

### 必须设置尺寸

必须通过 `style` 提供宽度和高度，否则按钮不会出现在屏幕上：

```jsx
style={{ width: 200, height: 44 }}
```

React Web 开发者容易把 React Native 的布局理解成浏览器默认布局。此原生组件不会自动获得可见尺寸，必须显式设置。

### 不要覆盖背景色和圆角

不能通过 `style` 设置：

```jsx
// 不应这样做
style={{
  backgroundColor: 'red',
  borderRadius: 10,
}}
```

原因包括：

- 这些样式不会按普通 `View` 的方式生效
- 自定义 Apple 按钮外观可能违反 App Store 规范

正确方式是：

```jsx
<AppleAuthentication.AppleAuthenticationButton
  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
  cornerRadius={10}
  style={{ width: 200, height: 44 }}
/>
```

### 按钮属性

| 属性 | 作用 |
| --- | --- |
| `buttonStyle` | 选择 Apple 预定义的颜色方案 |
| `buttonType` | 选择按钮显示的官方文本 |
| `cornerRadius` | 设置按钮圆角 |
| `onPress` | 处理点击事件，通常在其中调用 `signInAsync()` |
| `style` | 设置尺寸等 View 样式，但不能包含背景色和圆角 |

颜色样式：

| 枚举 | 效果 |
| --- | --- |
| `WHITE` | 白色背景、黑色文字 |
| `WHITE_OUTLINE` | 白色背景、黑色边框和文字 |
| `BLACK` | 黑色背景、白色文字 |

按钮文本：

| 枚举 | 文本 |
| --- | --- |
| `SIGN_IN` | Sign in with Apple |
| `CONTINUE` | Continue with Apple |
| `SIGN_UP` | Sign up with Apple，仅支持 iOS 13.2 及以上 |

## 登录与凭证处理

### signInAsync

```ts
const credential = await AppleAuthentication.signInAsync({
  requestedScopes: [
    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
    AppleAuthentication.AppleAuthenticationScope.EMAIL,
  ],
  state,
  nonce,
});
```

该方法请求操作系统启动 Apple 登录流程，并在应用上方显示原生认证界面。

所有选项都是可选的：

| 选项 | 作用 |
| --- | --- |
| `requestedScopes` | 请求用户姓名和邮箱 |
| `state` | 验证响应是否对应当前请求，帮助防止请求伪造或重放 |
| `nonce` | OpenID Connect 中用于防止重放攻击的随机值 |

可请求的 scope 只有：

- `FULL_NAME`
- `EMAIL`

请求 scope 不代表一定能够获取数据。用户可以拒绝授权，因此对应字段必须按照可能为 `null` 处理。

### 用户资料通常只在首次登录返回

这是本文最重要的限制之一。

Apple 通常只在用户第一次登录应用时返回姓名和邮箱。在后续登录、刷新请求中，即使再次请求相同 scope，这些字段也可能为 `null`。

因此应在首次登录成功后立即保存：

- `credential.user`
- `credential.email`
- `credential.fullName`
- 业务所需的其他凭证信息

文档建议将这些信息保存在服务端，或使用 `expo-secure-store` 安全存储，以便跨应用安装保存所需信息。

> 严格来说，设备本地数据通常无法在卸载后继续存在。原文将服务端或 `expo-secure-store` 一并列为保存建议，但没有进一步解释二者在卸载场景中的差异。

### AppleAuthenticationCredential

登录成功后返回的核心字段如下：

| 字段 | 含义与开发影响 |
| --- | --- |
| `user` | Apple 为用户分配的稳定标识，应作为识别用户的重要依据 |
| `authorizationCode` | 短期授权码，每次会话可能不同，可交给服务端完成授权验证 |
| `identityToken` | 包含用户信息的签名 JWT |
| `email` | 可能为真实邮箱、Apple 隐藏邮箱或 `null` |
| `fullName` | 结构化姓名，整体或内部字段都可能为 `null` |
| `state` | 请求时传入的 `state`；未传入则为 `null` |
| `realUserStatus` | 系统对当前用户是否可能为真人的判断 |

`user` 在同一开发团队发布的应用之间可以保持一致。由其他开发者发布的应用会得到不同的用户标识。

不要使用 `authorizationCode` 作为长期用户 ID，因为它是短期值，会随会话改变。

### 隐藏邮箱

如果用户选择隐藏邮箱，`email` 返回的不是用户真实邮箱，而是 Apple 域名下的中转邮箱。

业务代码不应假设：

- 邮箱一定是真实地址
- 邮箱一定存在
- 后续登录还能再次获得邮箱

### 姓名结构

`fullName` 不是简单字符串，而是分词后的姓名对象：

```ts
{
  familyName,
  givenName,
  middleName,
  namePrefix,
  nameSuffix,
  nickname
}
```

所有字段都可能为 `null`。不同语言和地区的姓名顺序也不相同，不应简单使用：

```ts
`${givenName} ${familyName}`
```

可以调用：

```ts
AppleAuthentication.formatFullName(fullName, formatStyle);
```

它会按照当前地区规则生成姓名字符串。支持的格式包括：

```ts
'default' | 'short' | 'medium' | 'long' | 'abbreviated'
```

## 凭证状态与生命周期

### 检查凭证状态

```ts
const state =
  await AppleAuthentication.getCredentialStateAsync(credential.user);
```

该方法根据稳定的 `user` 标识检查凭证当前状态：

| 状态 | 含义 |
| --- | --- |
| `AUTHORIZED` | 凭证仍有效 |
| `REVOKED` | 授权已被撤销 |
| `NOT_FOUND` | 未找到对应凭证 |
| `TRANSFERRED` | 凭证发生转移 |

该方法必须在真实设备上测试。在 iOS 模拟器中调用时始终会抛出错误。

### 监听授权撤销

```ts
const subscription = AppleAuthentication.addRevokeListener(() => {
  // 处理 Apple 授权被撤销
});

subscription.remove();
```

`addRevokeListener()` 用于监听凭证撤销事件。返回的订阅对象需要调用 `remove()` 解除监听。

**基于文档内容推导：** 如果在 React 组件中注册监听器，应在组件卸载时移除，避免重复监听：

```tsx
useEffect(() => {
  const subscription = AppleAuthentication.addRevokeListener(() => {
    // 清除本地登录状态
  });

  return () => subscription.remove();
}, []);
```

### refreshAsync

```ts
const credential = await AppleAuthentication.refreshAsync({
  user,
  requestedScopes,
  state,
});
```

该方法用于刷新已登录用户的凭证，`user` 为必填字段。调用时仍会先显示登录界面，而不是完全静默刷新。

用户取消操作时，Promise 会以 `ERR_REQUEST_CANCELED` 拒绝。

### signOutAsync

```ts
await AppleAuthentication.signOutAsync({
  user,
  state,
});
```

该方法要求提供用户 ID，并且调用时会先显示登录界面，然后才执行退出。

文档明确不推荐使用它，因为其交互方式违反一般用户对“退出登录”的直觉。

推荐做法是清除应用通过 `signInAsync()` 或 `refreshAsync()` 保存的用户数据和应用会话。

这意味着应用退出登录与撤销 Apple 授权不是同一件事：

- 应用退出：清除本地或服务端会话
- Apple 授权撤销：Apple 凭证本身不再有效

## 验证 Apple 返回结果

Apple 返回结果中包含签名 JWT，即 `identityToken`。

为确认响应确实来自 Apple，可以使用 Apple 发布的公钥验证 JWT 签名：

```text
https://appleid.apple.com/auth/keys
```

该验证过程不是 Expo 特有功能。

**基于文档内容推导：** 在实际登录系统中，仅在客户端拿到 credential 通常不足以建立可信会话。更合理的流程是：

1. 客户端完成 Apple 登录。
2. 将 `identityToken` 或 `authorizationCode` 发送到自己的服务端。
3. 服务端使用 Apple 公钥验证 JWT 签名及相关声明。
4. 服务端确认身份后创建应用自己的用户会话。

原文只明确要求通过 Apple 公钥验证签名，没有展开 JWT 声明校验、服务端换取令牌或账户绑定细节。

## 测试方式

### Expo Go

在 iOS Expo Go 中，可以不进行前述原生配置就测试该库。

但需要注意：

- 使用 EAS Build 构建自己的应用时仍需添加 config plugin
- Expo Go 中得到的标识和值可能与独立应用中的结果不同
- 不应将 Expo Go 中得到的 Apple 用户标识视为生产应用的最终标识

Expo Go 是一个预先集成了许多 Expo 原生模块的容器，因此能跳过项目自身的原生编译配置；独立应用没有这种自动前提。

### iOS 模拟器

模拟器只能完成有限测试，部分方法与真实设备行为不同。

明确已知的限制是：

```ts
AppleAuthentication.getCredentialStateAsync(user)
```

在模拟器中始终抛出错误。

文档强烈建议开发过程中尽可能使用真实设备测试。

### 独立应用

生产前至少需要验证：

- capability 和 entitlement 是否正确
- 原生按钮是否显示
- 首次登录和再次登录的数据差异
- 用户拒绝邮箱或姓名授权的情况
- 用户主动取消登录
- 隐藏邮箱的处理
- 凭证撤销后的应用行为
- 服务端是否能够验证 Apple 返回的 JWT

其中最后一组验证清单属于**基于文档内容推导**，用于覆盖文档明确指出的行为差异和限制。

## 错误处理

错误码如下：

| 错误码 | 含义 |
| --- | --- |
| `ERR_INVALID_OPERATION` | 执行了无效的授权操作 |
| `ERR_INVALID_RESPONSE` | 授权请求收到无效响应 |
| `ERR_INVALID_SCOPE` | 传入了无效的 scope |
| `ERR_REQUEST_CANCELED` | 用户取消授权 |
| `ERR_REQUEST_FAILED` | 授权失败，应进一步查看错误消息 |
| `ERR_REQUEST_NOT_HANDLED` | 授权请求未被正确处理 |
| `ERR_REQUEST_NOT_INTERACTIVE` | 授权请求不是可交互请求 |
| `ERR_REQUEST_UNKNOWN` | 未知原因导致授权失败 |

`ERR_REQUEST_CANCELED` 应单独处理。用户取消是正常交互结果，不应与系统故障使用完全相同的错误提示。

```ts
try {
  const credential = await AppleAuthentication.signInAsync();
} catch (error) {
  if (error.code === 'ERR_REQUEST_CANCELED') {
    return;
  }

  // 记录或显示其他认证错误
}
```

## 其他枚举

### AppleAuthenticationOperation

该枚举描述认证操作类型：

| 枚举 | 含义 |
| --- | --- |
| `IMPLICIT` | 由具体凭证提供方决定的隐式操作 |
| `LOGIN` | 登录 |
| `REFRESH` | 刷新 |
| `LOGOUT` | 退出 |

当前文档列出了该枚举，但没有给出需要由业务代码直接使用它的具体示例。

### AppleAuthenticationUserDetectionStatus

`realUserStatus` 使用以下枚举：

| 枚举 | 含义 |
| --- | --- |
| `UNSUPPORTED` | 系统不支持判断，没有数据 |
| `UNKNOWN` | 系统尚未确定 |
| `LIKELY_REAL` | 用户看起来可能是真人 |

这只是系统的最佳判断。文档没有说明可以将它作为唯一的安全校验或风控依据。

## React Web 开发者最容易误解的地方

### 安装 npm 包不等于配置完成

Web 项目安装认证 SDK 后通常只需配置客户端 ID 和回调地址。这里还必须配置 iOS capability、entitlements、签名以及原生构建。

### Expo Go 可运行不代表独立应用已配置正确

Expo Go 已经预装原生能力。只有实际构建独立应用，才能验证项目自身的原生配置是否完整。

### 登录数据不是每次都完整返回

姓名和邮箱通常只有首次授权时返回。不能采用“每次登录都重新读取用户资料”的 Web 登录思路。

### 请求 scope 不代表一定获得数据

用户可以拒绝姓名或邮箱权限，所有相关字段都必须允许为 `null`。

### Apple 按钮不是普通 View

它是受 Apple 品牌规范约束的原生组件：

- 必须设置宽高
- 不能随意修改背景色
- 圆角必须使用 `cornerRadius`
- 颜色和文案应使用 Apple 提供的枚举

### 客户端登录成功不等于服务端已验证身份

客户端收到 JWT 后，还需要验证其签名。原文明确提供了 Apple 公钥地址，并指出验证过程与 Expo 无关。

## 实际开发建议

以下内容中，除特别注明外，均是对文档明确要求的落地整理：

1. 先使用 `isAvailableAsync()` 判断能力是否可用，再显示 Apple 登录按钮。
2. 使用官方 `AppleAuthenticationButton`，减少违反 Apple 品牌规范的风险。
3. 为按钮显式设置宽度和高度。
4. 在首次登录时立即处理并保存姓名、邮箱和稳定的 `user` 标识。
5. 把姓名、邮箱及其内部字段全部按可空值处理。
6. 将用户取消与系统错误分开处理。
7. 使用真实设备验证凭证状态检查和完整登录流程。
8. 不使用 `signOutAsync()` 实现普通退出，而是清除应用自己的登录数据。
9. 在服务端使用 Apple 公钥验证 `identityToken` 的签名。
10. 修改 capability、plugin 或 entitlement 后重新构建应用。

**基于经验建议：** 应在服务端设计首次登录资料补全机制。如果首次登录时没有保存姓名，而后续 Apple 不再返回姓名，应用可以引导用户手动补充资料。

**基于经验建议：** 不要仅以邮箱作为账户的唯一关联依据，因为邮箱可能为空、可能是 Apple 隐藏邮箱，也可能与已有账号体系发生冲突。具体账户合并规则不在当前文档范围内。

## 文档未涉及的内容

当前文档未具体说明：

- Android 或 Web 端如何实现 Apple 登录
- Apple Developer Console 的完整操作步骤
- EAS Build 的完整构建和发布流程
- JWT 中每个声明的验证规则
- 服务端如何使用 `authorizationCode` 换取令牌
- Apple 客户端密钥或私钥的管理方式
- Apple 隐藏邮箱转发服务的配置
- 与 Firebase、Supabase 或其他认证服务集成的方法
- Apple 账号与已有业务账号的绑定、合并策略
- 自动化测试或端到端测试方案
- `addRevokeListener()` 回调触发机制的更多细节

这些内容不能从当前文档中直接得出，需要结合 Apple、Expo 或所用认证服务的其他文档实现。

## 总结

`expo-apple-authentication` 提供了 Apple 原生登录按钮和认证 API，但完整接入包含三个层次：

1. **原生配置层**：启用 iOS capability、config plugin 和 entitlement。
2. **客户端交互层**：检查可用性、显示官方按钮、调用登录 API 并处理可空数据。
3. **身份验证层**：保存首次返回的资料，并通过 Apple 公钥验证签名 JWT。

开发时最关键的约束是：该库不支持 Android 和 Web；姓名与邮箱通常只在首次登录时返回；模拟器无法完整还原真实设备行为；普通退出登录不推荐使用 `signOutAsync()`；生产环境必须重视服务端凭证验证。

---

## 文档导航

- **上一页**：[app integrity](./139__app-integrity.md)
- **下一页**：[application](./141__application.md)
