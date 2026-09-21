# 154｜Expo SDK Contacts（legacy）旧版 API

**翻页：**[上一页：Expo SDK Contacts 系统联系人](./153-Expo-SDK-Contacts.md) · [目录](./README.md) · [下一页：Expo SDK Crypto 加密工具](./155-Expo-SDK-Crypto.md)

**官方页面：**[Contacts (legacy) · Latest](https://docs.expo.dev/versions/latest/sdk/contacts-legacy/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/contacts-legacy/)

**版本与边界：**Latest 推荐 `expo-contacts ~57.0.6`，SDK v56.0.0 推荐 `~56.0.14`。两版页面展示的导入方式、方法、类型、权限和 Next 相同。`legacy` 是 `expo-contacts` 包提供的旧模块级 API 子路径，不是另一个 npm 包；同一个项目可以同时使用根路径的 class API 与 `expo-contacts/legacy`。

## 何时使用 legacy 子路径

新代码通常使用根路径导出的 `Contact`、`Container`、`Group` 类 API。项目已有 `Contacts.*Async` 全局函数时，从 `expo-contacts/legacy` 导入旧接口可延续原代码形态。旧的数据对象用 `firstName`、`lastName`、`phoneNumbers` 等字段；新 `Contact` API 的记录则用 `givenName`、`familyName`、`phones`。两套字段名不要混用。

使用旧接口时以命名空间方式导入：

```ts
import * as Contacts from 'expo-contacts/legacy';
```

包本身仍按当前 Expo SDK 安装：

```sh
npx expo install expo-contacts
# 也可以使用：yarn expo install expo-contacts
# 或：pnpm expo install expo-contacts
# 或：bun expo install expo-contacts
```

## 配置及权限

在 Continuous Native Generation（CNG）项目中，可用 `expo-contacts` config plugin 配置 iOS 联系人权限说明。Config plugin 会在生成原生项目 / 构建 app 时写入原生配置；改动后需重新构建原生 app。

```json
{
  "expo": {
    "plugins": [
      [
        "expo-contacts",
        {
          "contactsPermission": "允许 $(PRODUCT_NAME) 访问联系人。"
        }
      ]
    ]
  }
}
```

如果你手动维护原生工程，则 Android Manifest 需要 `READ_CONTACTS` 和 `WRITE_CONTACTS`；iOS `Info.plist` 需要 `NSContactsUsageDescription`：

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.READ_CONTACTS" />
<uses-permission android:name="android.permission.WRITE_CONTACTS" />
```

```xml
<!-- ios/<App>/Info.plist -->
<key>NSContactsUsageDescription</key>
<string>允许应用访问联系人。</string>
```

声明配置不等于用户已授权。运行时先请求权限，再读取通讯录。下面重写官方 Basic Contacts Usage 示例：

```tsx
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Contacts from 'expo-contacts/legacy';

export default function LegacyContactsExample() {
  const [firstContactName, setFirstContactName] = useState<string | null>(null);

  useEffect(() => {
    async function loadFirstContact() {
      const permission = await Contacts.requestPermissionsAsync();
      if (permission.status !== 'granted') return;

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Emails],
      });

      if (data.length > 0) {
        setFirstContactName(data[0].name);
        console.log(data[0]);
      }
    }

    void loadFirstContact();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Contacts Module Example</Text>
      <Text>{firstContactName ?? '没有读取到联系人'}</Text>
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

`PermissionResponse` 的 `status` 是 `undetermined`、`granted` 或 `denied`；`granted` 是便于判断的布尔值。`canAskAgain` 表示能否再次弹系统权限框；不能再询问时要引导用户到系统设置。`expires` 是 `'never'` 或数值；文档说明 Contacts 权限目前永久有效。`ContactsPermissionResponse` 另有 iOS 18+ 的 `accessPrivileges`：`all`、`limited`、`none`。

## iOS 18 limited access 按钮

legacy 文档也列出系统 `ContactAccessButton`。它面向 iOS 18+ 的 limited contact access 场景；`isAvailable()` 只有在 iOS 18 或更新版本才返回 `true`。可读写的联系人范围由用户通过系统界面选定。

```tsx
const AccessButton = Contacts.ContactAccessButton;

export function ContactSearchButton({ searchText }: { searchText: string }) {
  if (!AccessButton.isAvailable()) return null;

  return (
    <AccessButton
      query={searchText}
      caption="phone"
      backgroundColor="#eeeeee"
      textColor="#222222"
      tintColor="#4630EB"
      ignoredEmails={['blocked@example.com']}
      ignoredPhoneNumbers={['+8613800000000']}
    />
  );
}
```

| 属性 | 用途 |
| --- | --- |
| `query` | 搜索应用尚未获准访问的联系人。 |
| `ignoredEmails` / `ignoredPhoneNumbers` | 忽略与这些邮箱 / 电话匹配的记录。 |
| `caption` | 单个结果下方的文案种类：`default`、`email` 或 `phone`。 |
| `backgroundColor` / `textColor` / `tintColor` | 设置系统按钮背景、文字和强调色。背景色不能透明，颜色对比也要足够。 |
| View 属性 | 组件继承 `ViewProps`。 |

## 模块 API

### 访问组件与常量

| API | 类型 / 值 | 说明 |
| --- | --- | --- |
| `Contacts.ContactAccessButton` | iOS 18+ React 组件 | 系统联系人访问按钮，见上面属性表。 |
| `Contacts.ContactAccessButton.isAvailable()` | `boolean` | 仅 iOS 18+ 为 `true`。 |
| `Contacts.onContactsChangeEventName` | `'onContactsChange'` | legacy 通讯录变更事件名。 |

### Contacts 全局方法

所有以下方法从 `Contacts` 命名空间调用。表中平台是官方页面标记的平台；`any` 是原始 API 返回类型，并不表示业务数据内容确定。

| 方法 | 参数 | 返回 | 用途 |
| --- | --- | --- | --- |
| `addContactAsync(contact, containerId?)` | `Contact`、可选容器 ID | `Promise<string>` | 新建联系人记录。 |
| `addExistingContactToGroupAsync(contactId, groupId)` | 联系人 ID、分组 ID | `Promise<any>` | 把现有联系人加入组。 |
| `addExistingGroupToContainerAsync(groupId, containerId)` | 分组 ID、容器 ID | `Promise<any>` | 将已有分组关联到容器。 |
| `createGroupAsync(name?, containerId?)` | 可选分组名、容器 ID | `Promise<string>` | 创建分组。 |
| `getContactByIdAsync(id, fields?)` | ID、可选 `FieldType[]` | `Promise<ExistingContact \| undefined>` | 通过 ID 读取单条联系人；不存在时为 `undefined`。 |
| `getContactsAsync(contactQuery?)` | 可选 `ContactQuery` | `Promise<ContactResponse>` | 按 query 查记录。 |
| `getPagedContactsAsync(contactQuery?)` | 可选 `ContactQuery` | `Promise<ContactResponse>` | 分页查询；响应有 `data`、`hasNextPage` 和 `hasPreviousPage`。 |
| `getContainersAsync(containerQuery)` | `ContainerQuery` | `Promise<Container[]>` | 查联系人账户容器。 |
| `getDefaultContainerIdAsync()` | 无 | `Promise<string>` | 取默认联系人容器 ID。 |
| `getGroupsAsync(groupQuery)` | `GroupQuery` | `Promise<Group[]>` | 查询联系人分组。 |
| `getPermissionsAsync()` | 无 | `Promise<ContactsPermissionResponse>` | 查看系统联系人授权状态。 |
| `hasContactsAsync()` | 无 | `Promise<boolean>` | 检查通讯录中是否有联系人。 |
| `isAvailableAsync()` | 无 | `Promise<boolean>` | 检查联系人能力在当前平台是否可用。 |
| `presentAccessPickerAsync()` | 无 | `Promise<string[]>` | 展示 iOS 联系人授权选择器并返回授权的 ID。 |
| `presentContactPickerAsync()` | 无 | `Promise<ExistingContact \| null>` | 打开系统联系人选择器；取消时为 `null`。 |
| `presentFormAsync(contactId?, contact?, formOptions?)` | 可选 ID、记录、`FormOptions` | `Promise<any>` | 显示系统联系人表单。 |
| `removeContactAsync(contactId)` | 联系人 ID | `Promise<any>` | 删除联系人。 |
| `removeContactFromGroupAsync(contactId, groupId)` | 联系人 ID、组 ID | `Promise<any>` | 将联系人从分组移除。 |
| `removeGroupAsync(groupId)` | 组 ID | `Promise<any>` | 删除分组。 |
| `requestPermissionsAsync()` | 无 | `Promise<ContactsPermissionResponse>` | 请求系统联系人权限。 |
| `shareContactAsync(contactId, message, shareOptions?)` | 联系人 ID、提示文字、可选 `ShareOptions` | `Promise<any>` | 调用系统分享联系人。 |
| `updateContactAsync(contact)` | 含 `id` 的部分联系人对象 | `Promise<string>` | 更新联系人；返回 ID。 |
| `updateGroupNameAsync(groupName, groupId)` | 组名、组 ID | `Promise<any>` | 更新组名。 |
| `writeContactToFileAsync(contactQuery?)` | 可选 `ContactQuery` | `Promise<string \| undefined>` | 将联系人写入文件，返回路径或未定义。 |

`Contacts.Fields.*` 控制查询返回哪些字段。需大量联系人时尽量指定所需字段；旧 `getContactsAsync` / `getPagedContactsAsync` 返回旧式响应对象，而不是 modern API 的 `Contact` 实例数组。

### 常量与联系人变更事件

`Contacts.onContactsChangeEventName` 的值是 `'onContactsChange'`。`Contacts.addContactsChangeListener(listener)` 在 Android / iOS 联系人变化时调用不带参数的回调，并返回 `EventSubscription`。订阅对象的 `remove()` 用来停止监听：

```ts
const subscription = Contacts.addContactsChangeListener(() => {
  refreshContactList();
});

// 页面卸载或不再需要刷新时移除监听。
subscription.remove();
```

## 旧数据对象和类型

### 联系人记录 `Contact`

Legacy 的 `Contact` 是一份数据对象类型，不是 modern API 的 `Contact` 类实例。字段名也不同，例如旧格式使用 `firstName`、`lastName`、`phoneNumbers`、`name`；modern 格式使用 `givenName`、`familyName`、`phones`。主要字段如下：

| 字段 | 含义 / 平台 |
| --- | --- |
| `id`（在 `ExistingContact` 中） | OS 生成、不可变的联系人 ID。 |
| `firstName`、`middleName`、`lastName`、`name` | 名字、中间名、姓、系统格式化的全名。 |
| `namePrefix`、`nameSuffix`、`nickname`、`maidenName` | 称谓、后缀、昵称、婚前姓名。 |
| `company`、`department`、`jobTitle` | 公司 / 组织、部门和职位。 |
| `phoneNumbers`、`emails`、`addresses`、`urlAddresses` | 电话、邮箱、地址、网址数组。 |
| `birthday`、`dates`、`nonGregorianBirthday` | 公历生日、其它日期、非公历生日；后者仅 iOS。 |
| `instantMessageAddresses`、`relationships`、`socialProfiles` | 即时消息账号、关系人、社交资料；social profiles 仅 iOS。 |
| `image`、`rawImage`、`imageAvailable` | 缩略图 / 原始头像数据以及头像可用标记；头像 URI 用本地文件，远端资源先下载。 |
| `isFavorite` | 是否收藏联系人，仅 Android。 |
| `note` | 备注；iOS 需要额外联系人备注 entitlement，Expo Go 无此 entitlement。 |
| `phoneticFirstName`、`phoneticMiddleName`、`phoneticLastName` | 姓名的读音字段。 |

### 查询与分页

`ContactQuery` 支持 `containerId` / `groupId`（仅 iOS）、`id`（一个或多个）、`name`、`fields`、`pageSize`、`pageOffset`、`sort`（`ContactSort`），以及 iOS 的 `rawContacts`。`ContactResponse` 包含：

- `data: ExistingContact[]`：命中的联系人。
- `hasNextPage: boolean`：是否还有后续页。
- `hasPreviousPage: boolean`：当前偏移前是否还有记录。

容器和分组查询分别使用 `ContainerQuery`（`contactId` / `containerId` / `groupId`）和 `GroupQuery`（`containerId` / `groupId` / `groupName`）。`Container` 的数据字段是 `id`、`name`、`type`；`Group` 数据用于标识 `id` 和 `name`。源页的 Group 字段说明文字与字段顺序看起来互换，本页按字段名记录，遇到类型定义冲突时以本地 SDK v56 类型为准。

### 联系人子项

| 类型 | 关键字段 |
| --- | --- |
| `Address` | `label`，可选 `city`、`country`、`isoCountryCode`、`neighborhood`、`poBox`、`postalCode`、`region`、`street`、`id`。 |
| `Date` | `day`、`month`、可选 `year`、`label`、`id`、系统提供的 `format`。这里 `month` 按 JavaScript `Date` 习惯从 0 开始。 |
| `Email` | `label`、可选 `email`、`id`、`isPrimary`。 |
| `PhoneNumber` | `label`、可选 `number`、`digits`、`countryCode`、`id`、`isPrimary`。 |
| `InstantMessageAddress` | `label`，可选 `service`、`localizedService`、`username`、`id`。 |
| `Relationship` | `label`，可选关系人 `name` 和 `id`。 |
| `SocialProfile` | `label`，可选 `localizedProfile`、`service`、`url`、`userId`、`username`、`id`。 |
| `UrlAddress` | `label`、可选 `url` 和 `id`。 |
| `Image` | 可选 `uri`、`base64`；iOS 另有 `width` / `height`。网络 URI 不直接支持，先下载到本地。 |

### 其它类型

`PermissionResponse` 由 `canAskAgain`、`expires`、`granted`、`status` 组成；`PermissionExpiration` 是 `'never'` 或数字时间。`FormOptions` 可控制 `allowsActions`、`allowsEditing`、`alternateName`、取消按钮、显示字段、所属 `groupId`、`isNew`、提示文字、动画和关联联系人显示。

`Container` 有 `id`、`name`、`type`；`Group` 有 `id`、`name`。`FieldType` 是 `Fields` 的字段名联合类型；`ContactSort` 是 `SortTypes` 的字符串联合类型。

### 枚举

`Fields` 用 PascalCase 成员标识旧记录字段：`Addresses`、`Birthday`、`Company`、`ContactType`、`Dates`、`Department`、`Emails`、`ExtraNames`、`FirstName`、`ID`、`Image`、`ImageAvailable`、`InstantMessageAddresses`、`IsFavorite`（Android）、`JobTitle`、`LastName`、`MaidenName`、`MiddleName`、`Name`、`NamePrefix`、`NameSuffix`、`Nickname`、`NonGregorianBirthday`（iOS）、`Note`、`PhoneNumbers`、`PhoneticFirstName`、`PhoneticLastName`、`PhoneticMiddleName`、`RawImage`、`Relationships`、`SocialProfiles`（iOS）、`UrlAddresses`。

其它枚举值：

- `CalendarFormats`：`Buddhist`、`Chinese`、`Coptic`、`EthiopicAmeteAlem`、`EthiopicAmeteMihret`、`Gregorian`、`Hebrew`、`Indian`、`Islamic`、`IslamicCivil`、`IslamicTabular`、`IslamicUmmAlQura`、`ISO8601`、`Japanese`、`Persian`、`RepublicOfChina`；日历格式是系统提供的信息，不应手工覆盖 `Date.format`。
- `ContactTypes`：`Company = 'company'`、`Person = 'person'`。
- `ContainerTypes`：`CardDAV`、`Exchange`、`Local`、`Unassigned`，表示联系人账户来源。
- `PermissionStatus`：`DENIED`、`GRANTED`、`UNDETERMINED`。
- `SortTypes`：`FirstName`、`LastName`、`None`、`UserDefault`。

## 源页代码覆盖和版本差异

- Installation：覆盖 npm / Yarn / pnpm / Bun 的安装命令；说明该 legacy API 与 `expo-contacts` 根路径现代 API 共用同一包。
- Configuration：覆盖 config plugin 的 `contactsPermission`、Android 读取 / 写入联系人权限和 iOS Info.plist 用途说明。
- Usage：重写官方 React Native Usage 示例，包括权限请求、只查询邮箱字段、读取第一条联系人记录，并在页面上显示姓名。
- API import：覆盖 `import * as Contacts from 'expo-contacts/legacy'`。
- API methods：逐项列出所有 legacy CRUD、查询、分页、权限、系统 picker / 表单、分享、分组、文件导出和变更监听方法及参数 / 返回类型。
- Types / enums：覆盖 legacy `Contact` 字段、`ContactQuery`、分页响应、权限对象、地址和子项结构、容器 / 分组、表单选项与完整枚举字段。
- Latest 推荐 `~57.0.6`，SDK v56 推荐 `~56.0.14`；两版比较页内容一致。Next 两版都是 [Crypto](https://docs.expo.dev/versions/latest/sdk/crypto/)。

**翻页：**[上一页：Expo SDK Contacts 系统联系人](./153-Expo-SDK-Contacts.md) · [目录](./README.md) · [下一页：Expo SDK Crypto 加密工具](./155-Expo-SDK-Crypto.md)
