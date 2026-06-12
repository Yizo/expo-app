# Expo Contacts（legacy）学习文档

> 原文档修改日期：2026 年 5 月 20 日  
> 适用平台：Android、iOS、Expo Go  
> 包名：`expo-contacts`

## 文档解决的问题

`expo-contacts` 用于访问手机系统通讯录，主要能力包括：

- 读取和查询联系人。
- 新增、修改、删除联系人。
- 调起系统联系人选择器或编辑界面。
- 分享、导出联系人。
- 监听通讯录变化。
- 在 iOS 上访问联系人容器和分组。
- 处理 iOS 18 引入的“有限联系人访问权限”。

本文介绍的是 `expo-contacts` 中保留的 **legacy API**，使用时必须从以下路径导入：

```ts
import * as Contacts from 'expo-contacts/legacy';
```

它可以与包根路径导出的新版 class-based API 同时存在，但二者不是同一套 API。

> **文档明确说明：** 当前页面对应“下一个 SDK 版本”的文档，而不是当前稳定版本。原文同时指出，最新稳定文档对应 SDK 56。实际项目应当优先核对项目使用的 Expo SDK 版本。

## 适用场景

这套 API 适合以下需求：

- 通讯录好友匹配。
- 从系统联系人中选择收件人、邀请对象或紧急联系人。
- 在用户授权后批量读取姓名、电话、邮箱等信息。
- 将应用中的联系人写入系统通讯录。
- 调用系统联系人表单，让用户确认或编辑联系人。
- 管理 iOS 通讯录中的容器和分组。
- 导出或分享联系人。
- 适配 iOS 18 的有限联系人授权模式。

它不是 Web Contacts API，也不是服务端通讯录数据库。数据来自用户设备上的系统通讯录，访问过程受到操作系统权限控制。

## 阅读前需要理解的背景

### Expo 与 React Native

React Native 使用 React 的组件模型开发原生应用，但最终运行在 Android 或 iOS 原生环境中，而不是浏览器中。

对于 React Web 开发者，可以这样理解：

| React Web | React Native / Expo |
| --- | --- |
| 浏览器提供 DOM、Web API | Android/iOS 提供原生能力 |
| 使用 `div`、`span` | 使用 `View`、`Text` |
| 浏览器权限及 Web API | 系统运行时权限及原生配置 |
| 部署 JavaScript 通常即可生效 | 某些配置必须重新构建 App 安装包 |

Expo 在 React Native 之上提供统一的原生模块和构建配置。`expo-contacts` 就是对 Android、iOS 通讯录原生能力的封装。

### 系统权限与配置声明是两个环节

使用通讯录通常涉及两层设置：

1. **构建时声明**：在应用配置或原生工程中声明应用需要通讯录权限。
2. **运行时申请**：应用运行后调用 `requestPermissionsAsync()`，由系统向用户展示授权弹窗。

只配置 `app.json` 不代表用户已经授权；只调用运行时 API，也不能代替构建阶段的原生权限声明。

这与 React Web 中调用普通 HTTP API不同：移动端敏感数据访问同时受到安装包声明和用户授权控制。

### CNG 与 config plugin

Continuous Native Generation（CNG）是 Expo 根据应用配置生成原生 Android、iOS 工程的工作流。

Config plugin 是构建期间修改原生工程配置的插件。它可以设置无法在 JavaScript 运行时修改的内容，例如 iOS 权限说明。

> **开发影响：** config plugin 的修改通常需要重新构建应用二进制文件，刷新 JavaScript 或重新启动开发服务器并不足以使其生效。

如果项目手动维护 `android` 和 `ios` 原生目录且不使用 CNG，就需要直接修改对应原生文件。

### Legacy API

这里的 `legacy` 表示旧版 API 接口仍被保留，并不表示它是一个单独的 npm 包。

正确安装和导入方式分别是：

```sh
npx expo install expo-contacts
```

```ts
import * as Contacts from 'expo-contacts/legacy';
```

不要尝试安装名为 `expo-contacts-legacy` 的包。

## 安装

根据包管理器执行对应命令：

```sh
# npm
npx expo install expo-contacts

# yarn
yarn expo install expo-contacts

# pnpm
pnpm expo install expo-contacts

# bun
bun expo install expo-contacts
```

如果是在现有 React Native 项目中使用，还必须先安装并配置 Expo Modules，也就是原文所说的安装 `expo`。

> **基于文档内容推导：** 对 Expo 项目优先使用 `expo install`，可以让 Expo 根据当前 SDK 选择兼容的依赖版本，而不是直接安装任意最新版。

## 构建时配置

### 使用 CNG 和 config plugin

在 `app.json` 中配置插件：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-contacts",
        {
          "contactsPermission": "Allow $(PRODUCT_NAME) to access your contacts."
        }
      ]
    ]
  }
}
```

`contactsPermission` 只影响 iOS，对应原生配置中的 `NSContactsUsageDescription`。

| 配置项 | 默认值 | 作用 |
| --- | --- | --- |
| `contactsPermission` | `"Allow $(PRODUCT_NAME) to access your contacts"` | 设置 iOS 权限弹窗中解释访问通讯录原因的文字 |

`$(PRODUCT_NAME)` 是 iOS 构建系统中的应用名称占位符，不是 JavaScript 模板字符串。

> **文档明确说明：** 这类属性不能在运行时设置，修改后需要重新构建应用二进制文件。

### 不使用 CNG 时手动配置 Android

修改：

```text
android/app/src/main/AndroidManifest.xml
```

加入：

```xml
<uses-permission android:name="android.permission.READ_CONTACTS" />
<uses-permission android:name="android.permission.WRITE_CONTACTS" />
```

两项权限分别允许读取和写入通讯录。

文档同时说明，在使用该库的标准配置流程时，这两个权限会自动加入应用。手动修改主要针对不使用 CNG、直接维护原生工程的项目。

### 不使用 CNG 时手动配置 iOS

修改：

```text
ios/[app]/Info.plist
```

加入：

```xml
<key>NSContactsUsageDescription</key>
<string>Allow $(PRODUCT_NAME) to access your contacts</string>
```

`NSContactsUsageDescription` 是展示给用户的访问原因。它不是授权状态，也不会自动触发权限弹窗。

## 最小读取流程

原文示例的核心流程是：

1. 组件挂载。
2. 请求通讯录权限。
3. 判断权限状态是否为 `granted`。
4. 查询联系人。
5. 使用返回的 `data`。

```tsx
import { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import * as Contacts from 'expo-contacts/legacy';

export default function App() {
  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();

      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Emails],
        });

        if (data.length > 0) {
          console.log(data[0]);
        }
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Contacts Module Example</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

这里的异步立即执行函数用于在 `useEffect` 中执行异步操作，因为 `useEffect` 的回调本身不应直接声明为 `async`。

### 示例中的 `fields`

```ts
fields: [Contacts.Fields.Emails]
```

表示请求返回联系人的邮箱字段。

文档规定：

- 指定 `fields`：返回指定字段。
- 不指定 `fields`：返回全部字段。

> **基于文档内容推导：** 如果只需要姓名和电话，应只请求相应字段，避免读取图片、地址等不需要的数据。联系人图片尤其可能增加数据量。

## 权限模型

### 查询和申请权限

```ts
const current = await Contacts.getPermissionsAsync();
const requested = await Contacts.requestPermissionsAsync();
```

权限响应包含：

| 字段 | 含义 |
| --- | --- |
| `status` | `undetermined`、`granted` 或 `denied` |
| `granted` | 是否已获得权限的便捷布尔值 |
| `canAskAgain` | 是否还可以再次弹出系统授权请求 |
| `expires` | 权限过期时间；当前权限均为永久授权 |
| `accessPrivileges` | 通讯录访问范围：`all`、`limited` 或 `none` |

当 `canAskAgain` 为 `false` 时，应用不能继续依赖重复调用申请 API，应引导用户前往系统设置修改权限。

### iOS 18 有限访问

iOS 18 允许用户只授权应用访问部分联系人：

```ts
accessPrivileges === 'limited'
```

三个可能值是：

- `all`：可访问完整通讯录。
- `limited`：只能访问用户选中的联系人，仅 iOS 18 及以上支持。
- `none`：没有联系人访问权限。

因此，`status === 'granted'` 不一定意味着应用可以看到整个通讯录，还应检查 `accessPrivileges`。

```ts
const permission = await Contacts.requestPermissionsAsync();

if (permission.granted) {
  if (permission.accessPrivileges === 'limited') {
    // 只能读取用户授权的联系人
  }
}
```

`presentAccessPickerAsync()` 用于展示联系人访问选择界面，返回：

```ts
Promise<string[]>
```

即用户选择或新增授权的联系人 ID 数组。

## 查询联系人

### `getContactsAsync()`

```ts
const result = await Contacts.getContactsAsync({
  name: 'Alice',
  fields: [
    Contacts.Fields.PhoneNumbers,
    Contacts.Fields.Emails,
  ],
  sort: Contacts.SortTypes.FirstName,
  pageSize: 50,
});
```

返回 `ContactResponse`：

```ts
{
  data: ExistingContact[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

### `ContactQuery`

| 属性 | 作用 |
| --- | --- |
| `id` | 按一个或多个联系人 ID 查询 |
| `name` | 按姓名进行不区分大小写的包含查询 |
| `fields` | 指定需要返回的字段 |
| `pageOffset` | 跳过前面多少条联系人 |
| `pageSize` | 最多返回多少条；省略或设为 `0` 表示全部返回 |
| `sort` | 指定排序方式 |
| `containerId` | 查询指定容器中的联系人，仅 iOS |
| `groupId` | 查询指定分组中的联系人，仅 iOS |
| `rawContacts` | 禁止 iOS 合并联系人，默认为 `false`，仅 iOS |

分页读取还可以使用：

```ts
Contacts.getPagedContactsAsync(contactQuery);
```

文档没有进一步解释它与 `getContactsAsync()` 的具体行为差异，因此不应假设二者在性能或分页机制上的额外区别。

### 按 ID 查询

```ts
const contact = await Contacts.getContactByIdAsync(contactId, [
  Contacts.Fields.PhoneNumbers,
  Contacts.Fields.Emails,
]);
```

返回一个 `ExistingContact`。

### `Contact` 与 `ExistingContact`

- `Contact`：联系人数据结构，可用于创建联系人。
- `ExistingContact`：在 `Contact` 基础上增加系统生成的不可变 `id`。

```ts
type ExistingContact = Contact & {
  id: string;
};
```

`id` 用于查询、更新、删除和分组操作。不要把姓名或电话号码当作稳定主键。

## 新增、修改与删除

### 新增联系人

```ts
const id = await Contacts.addContactAsync(contact, containerId);
```

返回新联系人 ID。`containerId` 可选。

### 更新联系人

```ts
const id = await Contacts.updateContactAsync({
  id: contactId,
  firstName: 'Alice',
  phoneNumbers: [
    {
      label: 'mobile',
      number: '123456789',
    },
  ],
});
```

参数要求必须包含 `id`，其他联系人字段可以只提交需要更新的部分。

### 删除联系人

```ts
await Contacts.removeContactAsync(contactId);
```

这是直接修改系统通讯录的操作，应当在业务界面中明确告知用户。

### 使用系统表单

```ts
await Contacts.presentFormAsync(contactId, contact, {
  allowsEditing: true,
});
```

它可以调起系统联系人控制器，用于展示、新建或编辑联系人。

`FormOptions` 的主要字段包括：

| 字段 | 作用 |
| --- | --- |
| `allowsActions` | 是否允许分享、新增、创建等操作 |
| `allowsEditing` | 是否允许修改联系人 |
| `displayedPropertyKeys` | 指定展示哪些联系人字段 |
| `alternateName` | 联系人没有姓名时使用的替代名称 |
| `groupId` | 新联系人的父分组 |
| `isNew` | 是否展示新建联系人控制器 |
| `message` | 编辑已有联系人时显示在姓名下方的信息 |
| `cancelButtonTitle` | 编辑已有联系人时左侧按钮标题 |
| `preventAnimation` | 是否禁用控制器出现动画 |
| `shouldShowLinkedContacts` | 是否显示相似或关联联系人 |

## 系统选择器、分享与导出

### 选择联系人

```ts
const contact = await Contacts.presentContactPickerAsync();
```

返回用户通过系统界面选中的 `ExistingContact`。

### 分享联系人

```ts
await Contacts.shareContactAsync(
  contactId,
  'Contact information',
  shareOptions
);
```

`shareOptions` 使用 React Native `Share` API 的配置类型。

### 导出联系人文件

```ts
const uri = await Contacts.writeContactToFileAsync(contactQuery);
```

返回一个字符串。文档没有明确描述文件格式、生命周期或 URI 类型，因此使用前应根据目标 SDK 和实际平台验证。

## iOS 容器与分组

iOS 通讯录具有多层组织结构：

```text
Container
└── Group
    └── Contact
```

可以把 `Container` 理解为联系人来源或账户范围，例如本地、Exchange 或 CardDAV；`Group` 则是容器中的联系人分组。

### 容器

```ts
const defaultContainerId =
  await Contacts.getDefaultContainerIdAsync();

const containers = await Contacts.getContainersAsync({
  contactId,
});
```

容器类型包括：

| 类型 | 含义 |
| --- | --- |
| `Local` | 本地、非 iCloud 容器 |
| `Exchange` | 与邮件服务器关联 |
| `CardDAV` | 使用 CardDAV 协议共享 |
| `Unassigned` | 未知或未分配类型 |

### 分组

```ts
const groupId = await Contacts.createGroupAsync(
  'Friends',
  containerId
);

const groups = await Contacts.getGroupsAsync({
  containerId,
});
```

相关操作还包括：

```ts
await Contacts.addExistingContactToGroupAsync(contactId, groupId);
await Contacts.removeContactFromGroupAsync(contactId, groupId);
await Contacts.addExistingGroupToContainerAsync(groupId, containerId);
await Contacts.updateGroupNameAsync('Family', groupId);
await Contacts.removeGroupAsync(groupId);
```

虽然这些方法的页面统一列出 Android 和 iOS 支持，但文档开头以及查询字段明确强调了 iOS 的多层分组系统。跨平台使用前应单独验证 Android 行为。

> **基于文档内容推导：** 如果业务并不需要管理系统通讯录结构，优先使用联系人查询和系统选择器，不要让容器、分组逻辑进入跨平台核心业务模型。

## iOS 18 `ContactAccessButton`

`ContactAccessButton` 仅支持 iOS 18.0 及以上，用于在有限访问授权场景中快速增加应用可访问的联系人。

使用前可以检查：

```ts
const available = Contacts.ContactAccessButton.isAvailable();
```

只有 iOS 18.0 及以上返回 `true`。

主要属性如下：

| 属性 | 作用 |
| --- | --- |
| `query` | 搜索尚未向应用开放的联系人 |
| `caption` | 单个匹配结果下显示的辅助信息 |
| `ignoredEmails` | 排除拥有指定邮箱的匹配联系人 |
| `ignoredPhoneNumbers` | 排除拥有指定电话的匹配联系人 |
| `backgroundColor` | 按钮背景色 |
| `textColor` | 标题颜色，较暗版本用于说明文字 |
| `tintColor` | 按钮及多结果弹窗的强调色 |

`caption` 可选值：

```ts
'default' | 'email' | 'phone'
```

颜色配置需要满足平台可读性要求：

- `backgroundColor` 不应透明。
- 文字与背景之间需要有足够对比度。
- `textColor` 还会派生出说明文字颜色。

该组件继承 React Native 的 `ViewProps`。

> **React Web 对照：** 它不是一个可以任意重写行为的普通 HTML 按钮，而是对 iOS 系统联系人访问组件的封装，支持范围和视觉约束由平台决定。

## 监听通讯录变化

事件名称常量为：

```ts
Contacts.onContactsChangeEventName;
// 'onContactsChange'
```

订阅变化：

```ts
const subscription =
  Contacts.addContactsChangeListener(() => {
    // 重新查询联系人
  });

// 组件卸载时移除订阅
subscription.remove();
```

监听器只通知通讯录发生了变化，回调类型为 `() => void`，不会直接提供变更联系人或变更内容。

> **基于文档内容推导：** 收到事件后如果需要最新数据，应重新执行查询。组件卸载时应清理订阅，避免重复回调。

## 联系人数据结构

### 姓名和基本资料

常用字段包括：

- `name`：系统格式化后的完整姓名。
- `firstName`、`middleName`、`lastName`：姓名组成部分。
- `namePrefix`、`nameSuffix`：如 Dr.、Mr.、Jr.。
- `nickname`：昵称。
- `phoneticFirstName` 等：姓名发音表示。
- `company`、`department`、`jobTitle`：组织和职位。
- `contactType`：个人或公司。

联系人类型：

```ts
Contacts.ContactTypes.Person;
Contacts.ContactTypes.Company;
```

不要假设所有联系人都是自然人，也不要假设一定存在 `firstName` 或 `lastName`。`name` 是文档定义的完整格式化名称。

### 电话、邮箱和地址

电话字段包括：

```ts
type PhoneNumber = {
  id?: string;
  label: string;
  number?: string;
  digits?: string;
  countryCode?: string;
  isPrimary?: boolean;
};
```

- `number` 是电话号码。
- `digits` 是不带格式的数字形式。
- `label` 是本地化显示名称。
- `countryCode` 示例为 `us`。

邮箱和地址同样是数组，因为一个联系人可能有多个电话号码、邮箱和住址。

不要把 `label` 固定判断为英文的 `home` 或 `work`，因为文档明确说明它是本地化显示名称。

### 图片

联系人提供：

- `image`：缩略图；iOS 为 `320 × 320px`，Android 尺寸可能变化。
- `rawImage`：未经裁剪、通常较大的原图。
- `imageAvailable`：用于高效判断联系人是否存在图片。

图片数据可能通过本地 `uri` 或 Base64 表示。若要使用远程图片，文档要求先通过 `FileSystem.downloadAsync` 下载，再传入本地 URI。

### 日期

联系人生日和其他日期使用模块定义的结构：

```ts
type Date = {
  day: number;
  month: number;
  year?: number;
  label?: string;
  format?: CalendarFormatType;
  id?: string;
};
```

这里不是 JavaScript 原生 `Date` 实例。

特别需要注意：

- `month` 已按照 JavaScript `Date` 从 `0` 开始的规则调整。
- `format` 由操作系统提供，不应手动设置。
- `year` 可以不存在。
- iOS 支持非公历生日和多种日历格式。

支持的日历包括 Gregorian、Buddhist、Chinese、Hebrew、Islamic、Japanese、Persian、ISO 8601 等，其中多数仅支持 iOS。

### 其他扩展信息

联系人还可能包含：

- 即时通信账号 `instantMessageAddresses`。
- 人际关系 `relationships`。
- 社交资料 `socialProfiles`，仅 iOS。
- 关联 URL `urlAddresses`。
- 其他日期 `dates`。
- 备注 `note`。

## `Fields` 与按需读取

常见字段枚举：

```ts
Contacts.Fields.Name
Contacts.Fields.FirstName
Contacts.Fields.LastName
Contacts.Fields.PhoneNumbers
Contacts.Fields.Emails
Contacts.Fields.Addresses
Contacts.Fields.Image
Contacts.Fields.RawImage
Contacts.Fields.Birthday
Contacts.Fields.Company
Contacts.Fields.Note
```

平台限定字段包括：

- `Fields.IsFavorite`：仅 Android。
- `Fields.NonGregorianBirthday`：仅 iOS。
- `Fields.SocialProfiles`：仅 iOS。

排序方式包括：

```ts
Contacts.SortTypes.FirstName
Contacts.SortTypes.LastName
Contacts.SortTypes.None
Contacts.SortTypes.UserDefault // 仅 Android
```

## 其他能力

### 检查模块能力

```ts
const available = await Contacts.isAvailableAsync();
const hasContacts = await Contacts.hasContactsAsync();
```

- `isAvailableAsync()`：检查联系人模块是否可用。
- `hasContactsAsync()`：检查设备是否存在联系人。

它们与权限检查不是同一件事。模块可用不等于用户已经授权。

### 方法总览

| 类别 | 方法 |
| --- | --- |
| 权限 | `getPermissionsAsync`、`requestPermissionsAsync`、`presentAccessPickerAsync` |
| 查询 | `getContactsAsync`、`getPagedContactsAsync`、`getContactByIdAsync` |
| 联系人修改 | `addContactAsync`、`updateContactAsync`、`removeContactAsync` |
| 系统界面 | `presentContactPickerAsync`、`presentFormAsync` |
| 容器和分组 | `getContainersAsync`、`getGroupsAsync`、`createGroupAsync` 等 |
| 分享和导出 | `shareContactAsync`、`writeContactToFileAsync` |
| 状态检查 | `isAvailableAsync`、`hasContactsAsync` |
| 事件 | `addContactsChangeListener` |

部分写操作返回 `Promise<any>`，原文没有定义其具体返回结构，业务代码不应依赖未经文档说明的返回字段。

## 重要限制与坑点

### 这是 legacy API

安装的是 `expo-contacts`，但旧版接口必须从 `expo-contacts/legacy` 导入。若从包根路径导入，获得的是文档所称的 class-based API。

### 当前页面不是稳定 SDK 文档

页面属于下一个 SDK 版本。项目如果使用 SDK 56 或其他版本，应阅读对应版本的文档，避免直接使用尚未进入项目依赖版本的 API。

### 权限可能只是有限授权

iOS 18 上即使 `granted` 为真，也可能只有 `limited` 权限。业务不能据此声称已经扫描用户的完整通讯录。

### 用户拒绝后可能不能再次询问

当 `canAskAgain` 为 `false` 时，继续调用权限请求不会解决问题，需要引导用户进入系统设置。

### `pageSize: 0` 表示返回全部联系人

这不同于很多 Web 分页 API 中“返回零条”的语义。省略 `pageSize` 或设为 `0` 都会返回全部联系人。

### 平台字段并不完全一致

例如：

- 收藏联系人仅 Android。
- 社交资料、非公历生日和部分查询条件仅 iOS。
- `ContactAccessButton` 仅 iOS 18 及以上。
- `UserDefault` 排序仅 Android。
- 图片尺寸在 Android 和 iOS 上不同。

跨平台代码应通过平台和能力检查提供降级行为。

### 联系人备注需要额外 entitlement

`note` 字段在 iOS 上需要额外 entitlement。Expo Go 不包含该 entitlement，因此不能直接用 Expo Go 完整测试此功能。

文档要求：

1. 向 Apple 申请相应 entitlement。
2. 在 app config 中将 `ios.accessesContactNotes` 设置为 `true`。
3. 创建 development build。

这是原文明确列出的特殊限制。

### 不要手动设置系统生成字段

以下数据由操作系统生成或提供：

- 联系人及子字段的 `id`。
- 日期的 `format`。
- 已存在联系人的不可变 `id`。

### 文档中的 `Group` 字段描述疑似不一致

原文类型表写为：

- `id`：可编辑的分组名称。
- `name`：表示分组的不可变 ID。

这与字段名称的通常语义相反，而且方法参数普遍使用 `groupId` 表示 ID。

本文不擅自改写其类型定义。实际使用时应以当前 SDK 的 TypeScript 类型、运行结果和对应版本源码为准。

## React Web 开发者最容易误解的地方

1. **权限不是浏览器式的一次 API 调用。**  
   需要同时处理原生声明、系统授权状态和重新构建。

2. **修改 `app.json` 后可能必须重新构建。**  
   Metro 热更新只更新 JavaScript，无法修改安装包中的 `Info.plist` 或 `AndroidManifest.xml`。

3. **系统联系人不是普通后端资源。**  
   它可能在应用外部变化，字段可能缺失，标签可能本地化，访问范围也可能随系统权限变化。

4. **平台差异属于 API 设计的一部分。**  
   不能因为 TypeScript 中存在某字段，就假设 Android 和 iOS 都会返回它。

5. **`ContactAccessButton` 不是普通 React 按钮。**  
   它封装 iOS 18 系统能力，并受系统版本及视觉规范限制。

6. **联系人 ID 由操作系统管理。**  
   应将 `id` 当作设备通讯录中的标识，而不是跨设备或后端系统中的全局用户 ID。

7. **日期月份从 `0` 开始。**  
   从接口取得 `month: 0` 表示一月，这与很多后端 API 使用 `1` 表示一月不同。

## 实际开发建议

以下内容属于**基于经验建议**，用于把文档中的 API 落实为更稳健的应用流程：

1. 在用户触发“选择联系人”或“导入通讯录”等功能时再申请权限，不要在应用启动时无上下文地弹窗。
2. 权限弹窗前先在应用界面说明用途，并让 `contactsPermission` 文案与真实用途一致。
3. 同时判断 `granted`、`canAskAgain` 和 `accessPrivileges`，不要只判断 `status`。
4. 查询时指定必要的 `fields` 和合理的 `pageSize`，避免一次加载全部联系人及大尺寸图片。
5. 写入、更新、删除系统联系人前增加明确确认。
6. 将平台专属能力隔离在独立模块中，并提供不支持时的 UI 降级。
7. 对 Expo Go、development build 和正式构建分别测试，特别是联系人备注和原生配置。
8. 监听联系人变化后重新查询，不要假设本地缓存仍然有效。
9. 电话、邮箱、生日等字段都按可选值处理，不要假设数组存在或至少包含一项。
10. 通讯录包含敏感个人数据，应避免无必要地上传、记录日志或长期缓存。

## 文档明确内容与推导内容边界

### 文档明确说明

- `expo-contacts` 可以读取、新增、编辑和删除系统联系人。
- legacy API 从 `expo-contacts/legacy` 导入。
- Android 需要读写联系人权限。
- iOS 使用 `NSContactsUsageDescription`。
- config plugin 配置需要重新构建才能生效。
- iOS 18 支持有限联系人授权。
- `ContactAccessButton` 仅支持 iOS 18 及以上。
- `fields` 省略时返回全部字段。
- `pageSize` 省略或为 `0` 时返回全部联系人。
- 联系人备注需要额外 Apple entitlement，且无法直接在 Expo Go 中测试。
- 日期的 `format` 由系统提供，不应手动设置。
- 远程联系人图片必须先下载为本地文件。

### 基于文档内容推导

- 应同时处理构建时配置与运行时授权。
- `granted` 状态不能代表拥有完整通讯录访问范围。
- 应按需请求字段并限制分页大小，以减少不必要的数据处理。
- 联系人事件没有变更详情，因此收到事件后通常需要重新查询。
- 容器和分组适合放在平台适配层，而不适合作为通用跨平台业务模型。
- 部分返回值是 `any`，不应依赖文档没有承诺的结构。

## 总结

`expo-contacts/legacy` 提供了从权限申请、联系人查询到系统通讯录写入、分享、分组和变化监听的一整套旧版 API。

实际开发时最重要的不是记住所有方法，而是建立以下流程：

```text
确认平台与模块可用
→ 配置原生权限
→ 重新构建应用
→ 运行时请求权限
→ 检查完整或有限访问范围
→ 按需查询联系人字段
→ 谨慎执行写入和删除
→ 处理平台差异与通讯录变化
```

对于新项目，还应先确认是否确实需要 legacy API，并根据项目使用的 Expo SDK 版本查阅对应版本文档。

---

## 文档导航

- **上一页**：[contacts](./161__contacts.md)
- **下一页**：[crypto](./163__crypto.md)
