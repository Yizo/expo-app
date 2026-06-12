# Expo Contacts：访问和管理设备系统联系人

> 本文整理自 Expo `expo-contacts` 的 **下一 SDK 版本文档**，原文修改日期为 2026 年 5 月 20 日。该页面不是当前稳定版文档；原文指出当前最新稳定版本为 SDK 56。准备发布应用时，应以项目实际使用的 Expo SDK 对应文档为准。

## 文档解决的问题

`expo-contacts` 用于访问手机系统通讯录，支持：

- 查询联系人及其姓名、电话、邮箱、地址等字段。
- 创建、修改和删除联系人。
- 调用系统原生联系人选择器或编辑表单。
- 监听系统通讯录变化。
- 在 iOS 中访问联系人容器与分组。
- 处理 iOS 18 的“仅允许访问部分联系人”权限模式。

它适合通讯录同步、邀请好友、紧急联系人、客户管理、联系人选择等需要和系统通讯录交互的移动应用。

当前文档未涉及 Web 平台支持。文档明确标注的主要平台是 Android 和 iOS，部分基础功能可在 Expo Go 中使用。

## 阅读前需要理解的背景

### 系统联系人不是应用自己的数据

在 React Web 中，联系人通常来自后端 API 或应用数据库。这里操作的是用户手机的系统通讯录：

- 数据由 Android 或 iOS 管理。
- 应用必须获得系统权限。
- 写操作可能直接改变用户真实通讯录。
- Android 和 iOS 支持的字段并不完全一致。
- 联系人 ID 和子字段 ID 由操作系统生成。

因此，删除、覆盖和批量更新必须比普通前端状态更新更加谨慎。

### Expo Go、开发构建和原生二进制

- **Expo Go**：通用测试应用，已包含一部分 Expo 模块，但不能包含你项目专属的原生权限或 Apple entitlement。
- **开发构建（development build）**：包含当前项目原生配置的自定义 App，适合测试 Expo Go 无法支持的能力。
- **原生二进制**：最终安装到设备上的 iOS/Android 应用。原生权限配置发生变化后通常需要重新构建。
- **CNG（Continuous Native Generation）**：Expo 根据 app config 和 config plugin 自动生成或更新 `ios`、`android` 原生工程。
- **Config plugin**：在构建阶段修改原生项目配置的插件。它不是运行时 JavaScript 配置。

这意味着修改 `app.json` 中的联系人权限说明后，仅刷新 JavaScript 页面不会生效，通常需要重新构建应用。

## 安装

根据包管理器执行：

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

`expo install` 会根据当前 Expo SDK 选择兼容版本，比直接执行普通的 `npm install` 更适合 Expo 项目。

如果是已有的非 Expo React Native 工程，需要先按照 Expo Modules 的接入流程安装 `expo`，然后才能使用该模块。

## 原生权限配置

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

`contactsPermission` 仅用于 iOS，对应原生 `Info.plist` 中的 `NSContactsUsageDescription`。这段文字会显示在系统权限弹窗中，用于向用户解释为什么需要通讯录权限。

默认值为：

```text
Allow $(PRODUCT_NAME) to access your contacts
```

`$(PRODUCT_NAME)` 会由 iOS 构建系统替换为应用名称。

### 不使用 CNG

如果项目手动维护 `android` 和 `ios` 目录，需要直接修改原生工程。

Android 的 `android/app/src/main/AndroidManifest.xml`：

```xml
<uses-permission android:name="android.permission.READ_CONTACTS" />
<uses-permission android:name="android.permission.WRITE_CONTACTS" />
```

- `READ_CONTACTS`：读取联系人。
- `WRITE_CONTACTS`：创建、更新和删除联系人。

iOS 的 `ios/[app]/Info.plist`：

```xml
<key>NSContactsUsageDescription</key>
<string>Allow $(PRODUCT_NAME) to access your contacts</string>
```

文档同时说明，该库在 Android 上会自动添加读写联系人权限。手动配置部分主要面向不使用 CNG、需要自行管理原生工程的项目；应检查最终生成的 Manifest，避免因项目构建方式不同而漏配。

## 权限请求

模块提供：

```ts
const current = await Contacts.getPermissionsAsync();
const requested = await Contacts.requestPermissionsAsync();
```

返回值为 `ContactsPermissionResponse`，除常规权限状态外，还可能包含：

```ts
accessPrivileges?: 'all' | 'limited' | 'none';
```

含义如下：

| 值 | 含义 |
| --- | --- |
| `all` | 可以访问完整通讯录 |
| `limited` | 只能访问用户选择的联系人，仅 iOS 18+ |
| `none` | 没有联系人访问权限 |

常规权限状态包括：

- `granted`：用户已授权。
- `denied`：用户已拒绝。
- `undetermined`：用户尚未作出选择。

**基于文档内容推导：** 不能只判断权限是否为 `granted`，在 iOS 18+ 还应检查 `accessPrivileges`，因为“已授权”不一定代表能够读取全部联系人。

## 新版 API 的核心模型

新版 API 以对象为中心：

```ts
import { Contact } from 'expo-contacts';
```

`Contact` 实例代表系统通讯录中的一位联系人：

```ts
const contact = new Contact(contactId);
```

实例本身主要持有联系人 `id`。其他字段通过异步方法按需读取，而不是保证全部常驻在对象上。

这和 React Web 中常见的完整 JSON 对象不同，更接近一个指向原生系统记录的操作句柄：

```ts
const givenName = await contact.getGivenName();
const phones = await contact.getPhones();
```

联系人 ID 的来源因平台而异：

- iOS：联系人 UUID。
- Android：`ContactsContract.Contacts` 表中的 `_ID`。

不要自行生成、解析或假设 ID 格式。

## 联系人的创建、读取、修改和删除

### 创建联系人

```ts
const contact = await Contact.create({
  givenName: 'John',
  familyName: 'Doe',
  phones: [{ label: 'mobile', number: '+12123456789' }],
});
```

`Contact.create()` 返回新创建的 `Contact` 实例。

创建数据使用 `CreateContactRecord`。常见字段包括：

- 姓名：`givenName`、`middleName`、`familyName`、`prefix`、`suffix`
- 工作信息：`company`、`department`、`jobTitle`
- 列表字段：`phones`、`emails`、`addresses`、`dates`
- 图片：`image`
- 备注：`note`
- 平台专属字段：`nickname`、`maidenName`、`isFavourite` 等

### 查询联系人实例

```ts
const contacts = await Contact.getAll({
  limit: 20,
  offset: 0,
  sortOrder: ContactsSortOrder.GivenName,
});
```

查询选项包括：

| 配置 | 作用 |
| --- | --- |
| `limit` | 最多返回多少条；省略时返回全部匹配项 |
| `offset` | 跳过前多少条 |
| `name` | 按姓名包含关系筛选 |
| `sortOrder` | 指定排序方式 |
| `rawContacts` | iOS 专属，是否包含未合并的原始联系人 |

排序值包括：

- `GivenName`
- `FamilyName`
- `UserDefault`
- `None`

联系人数量较多时，不应无条件一次读取全部数据。

### 按需查询字段

单个联系人：

```ts
const details = await contact.getDetails([
  ContactField.GIVEN_NAME,
  ContactField.PHONES,
]);
```

批量联系人：

```ts
const details = await Contact.getAllDetails(
  [ContactField.FULL_NAME, ContactField.PHONES],
  {
    limit: 20,
    offset: 10,
    sortOrder: ContactsSortOrder.GivenName,
  }
);
```

`getAllDetails()` 直接返回包含指定字段的普通对象，不为每条数据创建完整 `Contact` 实例，因此更适合联系人列表等批量读取场景。

需要继续操作某条联系人时，可以使用其 ID：

```ts
const contacts = details.map(item => new Contact(item.id));
```

### 分页和无限滚动

React Native 使用 `FlatList` 承载长列表，作用类似 Web 中经过虚拟化处理的列表组件。

```tsx
const FIELDS = [
  ContactField.FULL_NAME,
  ContactField.PHONES,
] as const;

const newBatch = await Contact.getAllDetails(FIELDS, {
  limit: 20,
  offset: contactDetails.length,
});

setContactDetails(previous => [...previous, ...newBatch]);
```

`as const` 使 TypeScript 保留字段数组的字面量类型，从而让 `PartialContactDetails<typeof FIELDS>` 推导出实际返回字段。

`FlatList` 的 `onEndReached` 可在接近列表底部时加载下一页：

```tsx
<FlatList
  data={contactDetails}
  keyExtractor={item => item.id}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/>
```

**基于经验建议：** 实际项目应增加加载中和是否还有数据的状态，防止 `onEndReached` 被连续触发后产生重复请求。

### 读取单项字段

常见方法包括：

```ts
await contact.getGivenName();
await contact.getFamilyName();
await contact.getFullName();
await contact.getPhones();
await contact.getEmails();
await contact.getAddresses();
await contact.getImage();
await contact.getThumbnail();
```

`getFullName()` 返回平台生成的完整姓名，其格式取决于系统规则，是只读字段。修改姓名时需要分别调用 `setGivenName()`、`setFamilyName()` 等方法。

图片和缩略图返回本地 URI，而不是 Web 中可以默认当作远程 URL 处理的地址。

### 修改单个字段

```ts
await contact.setGivenName('Andrew');
await contact.setCompany('Expo');
await contact.setImage('file:///path/to/image.jpg');
```

大部分 setter 接受 `null` 来清空字段，并返回表示操作是否成功的 `boolean`。

`setImage()` 只接受本地文件 URI。远程图片必须先下载到设备本地，不能直接传入 `https://...`。

### 增加、更新和删除列表子项

联系人电话、邮箱和地址等是带有独立 ID 的子记录。

增加电话：

```ts
const phoneId = await contact.addPhone({
  label: 'home',
  number: '+12123456789',
});
```

更新电话：

```ts
const phones = await contact.getPhones();
const phone = phones[0];

phone.number = '+19876543210';
await contact.updatePhone(phone);
```

删除电话：

```ts
await contact.deletePhone(phone);
```

地址、日期、邮箱、关系、URL 等均提供类似的 `add*`、`update*` 和 `delete*` 方法。更新已有子项时，对象必须包含有效的系统生成 ID。

### `patch()` 与 `update()` 的关键区别

#### `patch()`：只处理提供的字段

```ts
await contact.patch({
  givenName: 'Jane',
});
```

未定义字段保持不变：

- `undefined`：忽略该字段。
- `null`：清空该字段。
- 传入具体值：更新字段。

但是，数组字段采用整体替换语义：

```ts
await contact.patch({
  phones: [{ label: 'home', number: '+123456789' }],
});
```

这不是“追加一个号码”，而是让 `phones` 最终等于所提供的数组。已有但未包含在数组中的号码会被删除。

保留旧号码并追加新号码时，应先读取：

```ts
const phones = await contact.getPhones();

await contact.patch({
  phones: [
    ...phones,
    { label: 'home', number: '+98765432198' },
  ],
});
```

对于数组中的元素：

- 带有效 ID 的已有项会被更新。
- 不带 ID 的新项会被添加。
- 原来存在但新数组中缺失的项会被删除。

#### `update()`：整体覆盖联系人

```ts
await contact.update({
  givenName: 'John',
  familyName: 'Doe',
});
```

它会使用传入记录覆盖联系人数据。未包含的旧字段可能不再保留。

对于普通编辑表单，通常应优先考虑 `patch()`；只有明确要整体重建联系人内容时才使用 `update()`。

### 删除联系人

```ts
await contact.delete();
```

该操作会从设备系统通讯录中删除联系人，不只是从当前 React 页面状态中移除。

**基于经验建议：** 删除前应展示明确确认信息，并在失败时保留 UI 数据或重新查询系统状态。

## 调用系统原生界面

### 选择联系人

```ts
const contact = await Contact.presentPicker();

if (contact) {
  // 用户选择了联系人
}
```

它会打开系统联系人选择器。用户取消时返回 `null`。

### 打开创建联系人表单

```ts
const created = await Contact.presentCreateForm({
  givenName: 'Jane',
  familyName: 'Doe',
});
```

可传入预填数据，返回 `true` 表示用户完成创建，返回 `false` 表示未创建。

### 编辑已有联系人

```ts
const saved = await contact.editWithForm();
```

该方法打开系统原生联系人编辑器，并返回用户是否保存修改。

原生表单的优势是交互符合系统习惯，并由系统处理联系人字段；自定义 React Native 表单则具有更强的 UI 和业务控制能力。

## iOS 18 的有限联系人访问

iOS 18 允许用户只向应用开放部分联系人。

### 主动选择可访问联系人

```ts
const contacts = await Contact.presentAccessPicker();
```

系统会显示授权选择界面，并返回用户新授权访问的联系人实例。

### `ContactAccessButton`

该组件仅支持 iOS 18.0+，用于在有限权限模式下搜索并快速开放联系人：

```tsx
<ContactAccessButton
  query={searchText}
  caption="phone"
  ignoredEmails={knownEmails}
  ignoredPhoneNumbers={knownPhoneNumbers}
/>
```

使用前可以判断是否支持：

```ts
const available = ContactAccessButton.isAvailable();
```

它只会在 iOS 18 及以上返回 `true`。

主要属性：

| 属性 | 作用 |
| --- | --- |
| `query` | 匹配尚未向应用开放的联系人，通常来自搜索输入框 |
| `caption` | 单个匹配结果下显示的信息：`default`、`email` 或 `phone` |
| `ignoredEmails` | 忽略具有指定邮箱的匹配联系人 |
| `ignoredPhoneNumbers` | 忽略具有指定号码的匹配联系人 |
| `backgroundColor` | 按钮背景色，不应使用透明色 |
| `textColor` | 标题颜色，其稍暗版本用于说明文字 |
| `tintColor` | 按钮及多结果弹窗的强调色 |

文字和背景需要有足够对比度，否则可能不满足 iOS 对按钮可读性的要求。

组件继承 React Native `ViewProps`。这类似 Web 组件继承通用容器属性，但实际属性来自 React Native 的 `View`，不是 DOM 属性。

## iOS 的 Container 和 Group

### Container：联系人账户或来源

iOS 联系人可能来自：

- 本机存储
- iCloud
- Google
- Exchange
- CardDAV

`Container` 表示这些联系人来源。在系统 UI 中，它通常被称为“账户”。

```ts
const containers = await Container.getAll();
const defaultContainer = await Container.getDefault();
```

可读取：

```ts
await container.getName();
await container.getType();
await container.getContacts();
await container.getGroups();
```

不指定容器创建联系人或分组时，系统使用默认容器。

### Group：容器内的联系人分组

`Group` 只支持 iOS，用于表示“家人”“同事”等分组：

```ts
const group = await Group.create('Gym Buddies');
await group.addContact(contact);
await group.removeContact(contact);
await group.setName('Close Friends');
await group.delete();
```

删除分组通常只删除分组定义，不会删除分组内的联系人本身。

联系人、分组和容器之间的关系可以理解为：

```text
Container（账户/来源）
├── Group（分组）
│   └── Contact（联系人引用）
└── Contact（联系人记录）
```

## 联系人字段和平台差异

### 两端共同支持的主要字段

- 姓名组成部分
- 电话、邮箱、地址
- 公司、部门、职位
- 日期、关系、URL
- 联系人图片
- 备注
- 姓名读音字段

### Android 专属能力

- `isFavourite`
- `extraNames`
- 通过 `addExtraName()` 表示昵称、婚前姓等

### iOS 专属能力

- `birthday` 的专用 getter/setter
- 非公历生日
- `nickname`
- `maidenName`
- 即时通信地址
- 社交资料的相关操作
- Container 和 Group
- iOS 18 有限联系人授权

跨平台业务不能假设每个字段在两个系统中都存在。平台专属字段需要条件处理，并允许值为 `null` 或缺失。

### 电话号码格式

`NewPhone.number` 可以是任意字符串，系统数据库不会强制格式。文档建议使用 E.164 格式，例如：

```text
+12123456789
```

**基于文档内容推导：** 如果号码将用于匹配、去重或服务端同步，应在业务层统一格式，而不是依赖系统通讯录自动规范化。

### 日期

`ContactDate` 使用自然月份：

```ts
{
  year: 1990,
  month: 1,
  day: 1
}
```

其中月份范围为 `1-12`，年份可以省略，以表示没有年份的生日。

原文还保留了一套旧 `Date` 类型，其说明称月份根据 JavaScript `Date` 从 `0` 开始调整。新版 `ContactDate` 与旧类型的月份语义不能混用。

## iOS 联系人备注的特殊限制

在 iOS 上读取或写入 `note` 字段需要额外 entitlement。Expo Go 不包含该 entitlement，因此无法直接用 Expo Go 测试。

需要完成：

1. 向 Apple 申请联系人备注字段 entitlement。
2. 在 app config 中设置：

```json
{
  "expo": {
    "ios": {
      "accessesContactNotes": true
    }
  }
}
```

3. 创建包含该 entitlement 的开发构建。

Android 不受这项 iOS entitlement 限制。

这类 entitlement 不等同于普通运行时权限。权限弹窗由用户决定是否授权；entitlement 则是应用在签名和构建阶段声明并由 Apple 控制的系统能力。

## 监听通讯录变化

```ts
const subscription = Contacts.addContactsChangeListener(() => {
  loadContacts();
});

subscription.remove();
```

监听器在联系人新增、更新或删除时触发，但回调不携带具体变更内容，因此应用需要重新查询相关数据。

平台差异：

- iOS 使用 `CNContactStoreDidChangeNotification`，通知会立即发出。
- Android 使用 `ContentObserver`，可能延迟约 5 至 7 秒。
- Android 同时观察 `RawContacts` 和 `Contacts`，一次修改可能触发两个事件。

Android 的延迟来自系统联系人提供程序为性能和电量进行的通知批处理。若用户进入系统通讯录修改数据后返回应用，文档建议在应用恢复到前台时主动刷新。

停止监听可以调用订阅对象的 `remove()`。也可调用：

```ts
Contacts.removeAllContactsChangeListeners();
```

移除全部联系人变更监听器。

**基于经验建议：** 监听回调可能重复触发，刷新逻辑应支持防抖或合并请求，并在组件卸载时移除订阅。

## 旧版 API 与迁移风险

文档列出了大量 `Contacts.*Async()` 旧方法。多数已经废弃，并明确说明：从主入口调用时会在运行时抛出异常。

典型替换关系：

| 旧 API | 新 API |
| --- | --- |
| `Contacts.addContactAsync()` | `Contact.create()` |
| `Contacts.getContactsAsync()` | `Contact.getAll()` |
| `Contacts.getPagedContactsAsync()` | `Contact.getAll()` |
| `Contacts.getContactByIdAsync()` | `new Contact(id).getDetails()` |
| `Contacts.hasContactsAsync()` | `Contact.hasAny()` |
| `Contacts.presentContactPickerAsync()` | `Contact.presentPicker()` |
| `Contacts.presentAccessPickerAsync()` | `Contact.presentAccessPicker()` |
| `Contacts.presentFormAsync()` | `contact.editWithForm()` 或 `Contact.presentCreateForm()` |
| `Contacts.removeContactAsync()` | `contact.delete()` |
| `Contacts.updateContactAsync()` | `contact.patch()` 或 `contact.update()` |
| `Contacts.getContainersAsync()` | `Container.getAll()` |
| `Contacts.getDefaultContainerIdAsync()` | `Container.getDefault()` |
| `Contacts.getGroupsAsync()` | `Group.getAll()` |
| `Contacts.createGroupAsync()` | `Group.create()` |

如果必须继续使用旧行为，应从以下入口导入：

```ts
import * as Contacts from 'expo-contacts/legacy';
```

旧类型如 `ExistingContact`、`ContactQuery`、`Fields`、`SortTypes` 与新版 `ContactDetails`、`ContactQueryOptions`、`ContactField`、`ContactsSortOrder` 同时出现在页面中。新代码应避免混用两套命名和查询参数。

文档中未将 `Contacts.getPermissionsAsync()` 和 `Contacts.requestPermissionsAsync()` 标记为废弃，它们仍用于权限查询与申请。

## 原文中需要留意的不一致

以下问题来自所提供文档本身，实际编码时应以安装版本的 TypeScript 类型和对应 SDK 文档为准：

1. `presentCreateForm()` 的示例调用了 `Contact.createWithForm()`，与方法标题不一致。
2. 事件 API 标题是 `addContactsChangeListener()`，示例却写成 `addContactChangeListener()`。
3. `getAll()` 的部分示例使用 `sort`，但新版 `ContactQueryOptions` 定义的是 `sortOrder`。
4. 部分示例使用 `ContactField.GivenName`、`ContactField.Phones`，枚举定义实际展示为 `GIVEN_NAME`、`PHONES`。
5. 个别返回类型的文档标记不完整，或把可能返回 `null` 的方法仅写成 `Promise<string>`。
6. 部分社交资料类型标为 Android、iOS，但对应操作方法又标为仅 iOS。
7. 监听示例和 API 标题的单复数不一致。

这些不一致不应通过猜测解决。编译器提示、当前安装包导出的类型，以及项目所用 SDK 的稳定版文档应作为最终依据。

## React Web 开发者最容易误解的地方

### 权限配置与权限请求是两件事

`app.json`、`Info.plist` 和 `AndroidManifest.xml` 属于构建阶段配置；`requestPermissionsAsync()` 属于运行时请求。完成其中一个不能代替另一个。

### 原生数据操作不是 React 状态更新

调用 `patch()`、`update()` 或 `delete()` 会修改系统通讯录。更新本地 state 只会改变界面，不会自动写入系统；写入系统后，本地 state 也不会自动同步。

### `patch()` 的数组不是局部追加

对象字段是部分更新，但只要传入 `phones`、`emails` 等数组，就会替换整个对应集合。遗漏的已有子项会被删除。

### 联系人字段必须按需读取

`Contact` 实例不是包含所有字段的普通对象。应通过 getter 或 `getDetails()` 异步读取数据。

### 平台差异是 API 契约的一部分

不能把 iOS 专属方法当作所有设备都支持。业务层需要明确降级方案，而不是只依靠 TypeScript 编译通过。

### 原生 UI 不是 DOM

`FlatList`、`View`、`Text`、`TextInput` 和 `Button` 都是 React Native 组件，不会渲染为 HTML 元素，也不能直接使用 CSS、DOM API 或浏览器事件模型。

## 实际开发建议

以下内容为**基于经验建议**：

1. 首次进入相关功能时再申请权限，不要在应用启动时无上下文地弹出权限框。
2. 权限说明应描述具体用途，例如“用于选择邀请对象”，而不是只写“需要通讯录权限”。
3. 列表页使用 `getAllDetails()` 并只请求展示所需字段，进入详情页后再读取完整数据。
4. 联系人较多时使用 `limit` 和 `offset` 分页，并处理重复加载与列表结束状态。
5. 执行 `patch()` 前保留原始数据，用于确认数组字段没有意外丢失。
6. 对删除、整体覆盖等高风险操作增加确认界面。
7. 在 iOS 18 同时处理 `all`、`limited` 和 `none`，不要把有限授权误判为完整授权。
8. 为 Android 和 iOS 分别测试平台专属字段、联系人变更事件和系统表单。
9. 不要只在 Expo Go 中验收；涉及原生配置、entitlement 或构建插件时，应使用开发构建和真实设备。
10. 通讯录属于敏感个人数据。只读取业务必需字段，并避免无必要地上传到服务端。

## 文档未涉及的内容

当前文档未明确说明：

- 联系人数据上传服务器时的隐私合规方案。
- 权限被永久拒绝后如何引导用户进入系统设置。
- 模拟器中联系人数据的准备方式。
- Android 和 iOS 的最低系统版本要求，iOS 18 专属 API 除外。
- 联系人同步冲突、并发写入和事务保证。
- 分页过程中联系人变化时如何保持结果稳定。
- 大规模通讯录的具体性能指标。
- 自动化测试和 mock 方案。

这些问题需要结合业务要求、目标平台规则及对应 SDK 的其他文档另行设计。

## 总结

`expo-contacts` 将系统通讯录封装为以 `Contact` 实例为核心的异步 API。实际使用时最重要的是：

- 正确完成构建阶段原生配置和运行时权限请求。
- 使用 `getAllDetails()` 按字段、分页读取联系人。
- 明确区分 `patch()` 的部分更新和 `update()` 的整体覆盖。
- 特别注意数组字段的整体替换语义。
- 处理 Android、iOS 之间的字段和行为差异。
- 在 iOS 18 处理有限联系人授权。
- 避免继续从主入口调用会在运行时抛错的旧版 API。
- 将联系人写入和删除视为对用户真实系统数据的高风险操作。

---

## 文档导航

- **上一页**：[constants](./160__constants.md)
- **下一页**：[contacts legacy](./162__contacts-legacy.md)
