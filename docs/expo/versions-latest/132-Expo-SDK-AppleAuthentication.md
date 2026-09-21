# 132｜Expo SDK AppleAuthentication 使用 Apple 登录

**翻页：**[上一页：Expo SDK AppIntegrity](./131-Expo-SDK-AppIntegrity.md) · [目录](./README.md) · [下一页：Expo SDK Application](./133-Expo-SDK-Application.md)

**官方页面：**[AppleAuthentication · Latest](https://docs.expo.dev/versions/latest/sdk/apple-authentication/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/apple-authentication/)

**版本边界：**Latest 推荐 `expo-apple-authentication ~57.0.2`；SDK v56.0.0 推荐 `~56.0.4`。库支持 iOS / tvOS，不支持 Android / Web。Latest 与 v56 的登录按钮、配置流程、方法、类型和错误码基本一致。

## 在 iOS / tvOS 使用 Apple 登录

`expo-apple-authentication` 封装系统的 Sign in with Apple 界面。若 App 还提供第三方登录选项，Apple 审核规则要求提供 Apple 登录作为一种选项。用户可拒绝分享姓名 / 邮箱，因此相关凭证字段要容许 `null`。

安装（任选一个包管理器）：

~~~sh
npx expo install expo-apple-authentication
yarn expo install expo-apple-authentication
pnpm expo install expo-apple-authentication
bun expo install expo-apple-authentication
~~~

已有 React Native 工程还需安装 `expo`。

## 启用 Apple Sign In 能力

使用 Expo Config Plugin / Continuous Native Generation（CNG）时，在 app config 里开启 `ios.usesAppleSignIn`：

~~~json
{
  "expo": {
    "ios": {
      "usesAppleSignIn": true
    }
  }
}
~~~

官方还展示了显式添加插件的 app config：

~~~json
{
  "expo": {
    "plugins": ["expo-apple-authentication"]
  }
}
~~~

若是手动维护 iOS 原生目录，则需在 Apple Developer Console 对 Bundle ID 打开 Sign In with Apple capability，并在 `ios/[app]/[app].entitlements` 写入：

~~~xml
<key>com.apple.developer.applesignin</key>
<array>
  <string>Default</string>
</array>
~~~

还需在 `ios/[app]/Info.plist` 将 `CFBundleAllowMixedLocalizations` 设为 `true`，使按钮文本跟随设备语言。

## Sign in with Apple 按钮与登录请求

用 `AppleAuthenticationButton` 显示由 iOS / tvOS 提供的品牌按钮。按压后调用 `signInAsync()`，并请求姓名 / 邮件 scope；用户可以拒绝其中任意项：

~~~tsx
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
            // signed in
          } catch (e) {
            if (e.code === 'ERR_REQUEST_CANCELED') {
              // handle that the user canceled the sign-in flow
            } else {
              // handle other errors
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
~~~

只有用户第一次登录时，Apple 才会返回用户请求的姓名 / 邮箱；后续授权这些字段一般为 `null`。请及时持久化 credentials，建议保存在服务端或 `expo-secure-store`。`credential.user` 是同一开发团队发布应用间稳定的用户标识，但其他开发者发布的 App 会看到不同 ID。

## 开发测试与服务器验证

- 可在 iOS Expo Go 中测试，无需前述原生配置；EAS Build 项目需启用 config plugin。Expo Go 获得的 identifier / 结果值可能与 standalone build 不同。
- iOS Simulator 只能做有限测试，部分方法与真机行为不同；`getCredentialStateAsync()` 在 Simulator 上会抛错。尽量用真机验证。
- Apple 返回数据中含签名 JWT。服务端可使用 Apple 公布的公钥验证签名；这段校验逻辑不属于 Expo 专用实现。
- `AppleAuthenticationButton` 的 `isAvailableAsync()` 为 `true` 时才应显示。按钮必须通过 `style` 指定宽高；不要用 `style.backgroundColor` / `style.borderRadius` 改品牌样式，应改用 `buttonStyle` 和 `cornerRadius`。

## Component 属性速查

从 `expo-apple-authentication` 导入：

~~~ts
import * as AppleAuthentication from 'expo-apple-authentication';
~~~

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `buttonStyle` | `AppleAuthenticationButtonStyle` | Apple 认可的配色方案。 |
| `buttonType` | `AppleAuthenticationButtonType` | 按钮文案，如 Sign in / Continue / Sign up。 |
| `cornerRadius` | `number`（可选） | 按钮圆角。 |
| `onPress` | `() => void` | 用户按下按钮时调用；在其中调用 `signInAsync()`。 |
| `style` | `ViewStyle` 的受限类型（可选） | 可配置尺寸等 View 属性；不应设 `backgroundColor`、`borderRadius`。 |
| 继承属性 | `ViewProps` | 其余通用 View 属性。 |

按钮由原生 `ASAuthorizationAppleIDButton` 绘制，可满足 Apple 品牌、系统语言和无障碍要求；按钮上的尺寸需要应用明确提供。

## 方法速查

| 方法 | 参数 / 返回 | 说明 |
| --- | --- | --- |
| `formatFullName(fullName, formatStyle?)` | Apple 姓名对象、可选格式；返回 `string` | 按设备 locale 将 tokenized name 拼成显示文字。 |
| `getCredentialStateAsync(user)` | Apple user ID；返回 `Promise<CredentialState>` | 查询 credential 是否授权、撤销、未找到或已转移；必须真机测试。 |
| `isAvailableAsync()` | 返回 `Promise<boolean>` | 系统是否支持 Apple 登录。 |
| `refreshAsync(options)` | `AppleAuthenticationRefreshOptions`；返回 `Promise<Credential>` | 刷新现有用户 credentials，会再次显示系统登录界面；用户取消时拒绝为 `ERR_REQUEST_CANCELED`。 |
| `signInAsync(options?)` | 可选 `AppleAuthenticationSignInOptions`；返回 `Promise<Credential>` | 触发系统登录弹窗；可请求姓名与邮箱 scope；用户取消会抛 `ERR_REQUEST_CANCELED`。 |
| `signOutAsync(options)` | `AppleAuthenticationSignOutOptions`；返回 `Promise<Credential>` | 请求结束认证会话。官方不推荐用它实现常规登出；通常应清理 App 自己收集的用户资料 / 本地凭证。 |
| `addRevokeListener(listener)` | `() => void`；返回 `EventSubscription` | 监听用户撤销 Apple 登录授权。 |

返回的 `Subscription.remove()` 可注销 revoke 事件监听器。

## 凭证与选项类型

### `AppleAuthenticationCredential`

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `authorizationCode` | `string \| null` | 短期 session token；每次会话可能不同，可用于 App 与服务器交互。 |
| `email` | `string \| null` | 用户邮箱；未请求、用户未同意或非首次登录时可能是 `null`，用户隐藏邮箱时为 Apple relay 邮箱。 |
| `fullName` | `AppleAuthenticationFullName \| null` | 用户姓名；同意请求且首次登录时才可能返回。 |
| `identityToken` | `string \| null` | 含用户信息的 JSON Web Token（JWT）。 |
| `realUserStatus` | `AppleAuthenticationUserDetectionStatus` | 系统猜测用户是否像真实个人。 |
| `state` | `string \| null` | 请求传入的原样 state；可用于核验响应并降低重放风险。 |
| `user` | `string` | 同一个开发团队下保持稳定的用户 ID。 |

`AppleAuthenticationFullName` 的 `familyName`、`givenName`、`middleName`、`namePrefix`、`nameSuffix`、`nickname` 都可能为 `null`。

`AppleAuthenticationRefreshOptions` 要求提供 `user`，可选 `requestedScopes`、`state`；`AppleAuthenticationSignOutOptions` 需要 `user`，可选 `state`；`AppleAuthenticationSignInOptions` 的 `nonce`、`requestedScopes`、`state` 均可选。请求的姓名 / 邮箱 scope 可能被拒绝，且只会首次登录时返回。

`AppleAuthenticationFullNameFormatStyle` 可取 `'default'`、`'short'`、`'medium'`、`'long'`、`'abbreviated'`。

## 枚举与错误码

### AppleAuthenticationButtonStyle

- `WHITE`：白底黑字。
- `WHITE_OUTLINE`：白底黑框、黑字。
- `BLACK`：黑底白字。

### AppleAuthenticationButtonType

- `SIGN_IN`：Sign in with Apple。
- `CONTINUE`：Continue with Apple。
- `SIGN_UP`：iOS 13.2+ 提供 Sign up with Apple。

### 其他枚举

- `AppleAuthenticationCredentialState`：`REVOKED`、`AUTHORIZED`、`NOT_FOUND`、`TRANSFERRED`。
- `AppleAuthenticationOperation`：`IMPLICIT`、`LOGIN`、`REFRESH`、`LOGOUT`。
- `AppleAuthenticationScope`：`FULL_NAME`、`EMAIL`。未获授权的 scope 对应字段仍可能为空。
- `AppleAuthenticationUserDetectionStatus`：`UNSUPPORTED`（系统不支持判断）、`UNKNOWN`（尚未判断）、`LIKELY_REAL`（系统认为很可能是真人）。

| 错误码 | 含义 |
| --- | --- |
| `ERR_INVALID_OPERATION` | 操作对当前状态无效。 |
| `ERR_INVALID_RESPONSE` | 系统返回内容无效。 |
| `ERR_INVALID_SCOPE` | 传入无效 scope。 |
| `ERR_REQUEST_CANCELED` | 用户取消授权 / 刷新 / 登出操作。 |
| `ERR_REQUEST_FAILED` | 授权失败；查看错误信息。 |
| `ERR_REQUEST_NOT_HANDLED` | 请求未被正确处理。 |
| `ERR_REQUEST_NOT_INTERACTIVE` | 系统要求交互，但当前请求不是交互式。 |
| `ERR_REQUEST_UNKNOWN` | 未知原因的授权失败。 |

### 新手术语

- **Scope（授权范围）：**请求允许读取的用户信息字段，如姓名与邮箱。
- **Credential：**登录成功后拿到的一组凭证数据，需谨慎保存及传输。
- **Identity token / JWT：**Apple 签名的 JSON Web Token，服务器可以验证其来源和声明。
- **Nonce：**为认证请求生成的随机一次性字符串，用于降低重放风险。
- **State：**由应用生成、在回调里原样返回的关联值，可确认响应对应当前发起的请求。
- **Relay email：**用户选择隐藏真实邮箱时由 Apple 提供的转发地址。
- **Credential state：**Apple 对已保存 user ID 当前授权有效性的查询结果。

## 源页代码主题覆盖

已覆盖安装命令、两种 app config 配置、手动 iOS entitlement、系统登录按钮与 `signInAsync` 请求 scope / 取消错误处理 / 按钮布局示例。服务器 JWT 验证属于通用 Apple 验证流程，源页未提供可执行代码；组件 props、方法、订阅、凭证类型和枚举均在速查表中列出。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/apple-authentication/) · [SDK v56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/apple-authentication/)

**翻页：**[上一页：Expo SDK AppIntegrity](./131-Expo-SDK-AppIntegrity.md) · [目录](./README.md) · [下一页：Expo SDK Application](./133-Expo-SDK-Application.md)
