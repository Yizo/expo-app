# 153｜Expo SDK Contacts 系统联系人

**翻页：**[上一页：Expo SDK Constants 应用与运行时信息](./152-Expo-SDK-Constants.md) · [目录](./README.md) · [下一页：Expo SDK Contacts（legacy）旧版 API](./154-Expo-SDK-Contacts-Legacy.md)

**官方页面：**[Contacts · Latest](https://docs.expo.dev/versions/latest/sdk/contacts/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/contacts/)

**版本与平台：**Latest 推荐 `expo-contacts ~57.0.6`，SDK v56.0.0 推荐 `~56.0.14`。支持 Android 和 iOS，包含在 Expo Go 中；联系人分组、limited access 和 `ContactAccessButton` 等功能有平台 / iOS 版本限制。两版的安装、主要代码、现代 `Contact` API、权限和 Next 内容一致，仅建议安装的包版本不同。

## 系统联系人与原生权限

`expo-contacts` 读写手机通讯录中的记录。联系人是操作系统管理的数据，`Contact` 实例的方法会异步访问原生联系人数据库；电话号码、生日、图片、关系和工作信息并不是普通 JavaScript 对象字段。页面里“联系人类”的方法通常返回 Promise，应用要在异步函数中 `await`。

安装时用 `expo install` 选择当前 SDK 对应的版本：

```sh
npx expo install expo-contacts
# 也可以使用：yarn expo install expo-contacts
# 或：pnpm expo install expo-contacts
# 或：bun expo install expo-contacts
```

### CNG 项目：配置插件

Continuous Native Generation（CNG）项目可以在 app config 中使用 `expo-contacts` config plugin。**Config plugin 是在原生工程生成 / 构建时写入 Android Manifest、iOS Info.plist 等配置的插件；它不是运行时权限请求。**改完这些原生配置后要重新生成并构建原生 app 才会生效。

源页中的 `contactsPermission` 是 iOS 弹窗显示的用途说明，对应 `NSContactsUsageDescription`：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-contacts",
        {
          "contactsPermission": "允许 $(PRODUCT_NAME) 访问联系人，以便选择并保存联系人信息。"
        }
      ]
    ]
  }
}
```

### 手动维护原生工程

如果项目不使用 CNG，而是自行维护 `android/` 和 `ios/` 工程，需要手动配置声明。Contacts 的 Android 权限是 `READ_CONTACTS` 和 `WRITE_CONTACTS`；iOS 需要用途说明：

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.READ_CONTACTS" />
<uses-permission android:name="android.permission.WRITE_CONTACTS" />
```

```xml
<!-- ios/<App>/Info.plist -->
<key>NSContactsUsageDescription</key>
<string>允许应用访问联系人，以便选择并保存联系人信息。</string>
```

声明权限解决的是原生 app 是否具备访问能力；运行时仍要按操作系统权限状态处理读取结果和用户选择。页面仍列出 `Contacts.getPermissionsAsync()` 与 `Contacts.requestPermissionsAsync()` 用于查看 / 请求联系人权限：

```ts
import * as Contacts from 'expo-contacts';

async function requestContactsAccess() {
  const current = await Contacts.getPermissionsAsync();
  const permission = current.granted
    ? current
    : await Contacts.requestPermissionsAsync();

  if (!permission.granted) {
    return false;
  }
  return true;
}
```

`PermissionStatus` 有 `undetermined`（用户还未选择）、`granted`（已允许）、`denied`（已拒绝）。iOS 18 还可能只有部分联系人授权，权限回应会带 `accessPrivileges`：`all`、`limited` 或 `none`。`limited` 表示用户只让应用访问选中的联系人。

读取 / 写入 iOS 联系人备注还需要 Apple 的 `com.apple.developer.contacts.notes` entitlement；Expo Go 不包含它。获批后，在 app config 中设 `ios.accessesContactNotes: true` 并构建自己的 development build：

```json
{
  "expo": {
    "ios": {
      "accessesContactNotes": true
    }
  }
}
```

## 入门：创建、读取和修改

`Contact` 是一个联系人对象的封装。它既有读取 / 更新当前联系人实例的方法，也有 `create`、`getAll`、`getAllDetails` 等静态方法。示例覆盖官方 “Contacts manipulations” 中的创建、修改姓名、增加电话、读取电话、局部 patch 和全量 update：

```ts
import { Contact } from 'expo-contacts';

async function createAndEditContact() {
  const contact = await Contact.create({
    givenName: '晓明',
    familyName: '陈',
  });

  await contact.setGivenName('小明');
  await contact.addPhone({ label: 'work', number: '+8613800000000' });

  const phones = await contact.getPhones();
  const updatedPhones = [...phones, { label: 'home', number: '+8613900000000' }];
  await contact.patch({ phones: updatedPhones });

  // update 会用给出的记录覆盖联系人字段；此处传入完整的新电话列表。
  await contact.update({
    givenName: '小明',
    familyName: '陈',
    phones: updatedPhones,
  });

  return { contact, phones: await contact.getPhones() };
}
```

### `patch` 和 `update` 的区别

- `contact.patch(partial)` 只应用传入字段。没传的字段保持原样；要清空某个简单字段可传 `null`。若传 `phones`、`emails` 等列表，列表会按所给项目同步：旧项目可更新，新项目会添加，不在列表里的旧项目会被移除。
- `contact.update(record)` 用提供的联系人记录覆盖原联系人。适合明确提交一份完整的新记录；只想改少数几个字段时用 `patch`。
- `contact.setGivenName(...)` 等 `set*` 方法针对单个字段，Promise 解析为是否写入成功的布尔值。
- `contact.addPhone(...)` 等 `add*` 方法添加联系人子项，Promise 返回新子项的 ID。`updatePhone` / `deletePhone` 等通常要先从 `getPhones()` 取得带原生 ID 的 ExistingPhone 对象。

## 批量读取与分页

`Contact.getAll()` 返回 `Contact` 实例数组。若列表只要显示姓名、电话号码等少数字段，`Contact.getAllDetails(fields, options)` 更合适：它只取选定字段，返回带 ID 的 `PartialContactDetails`，避免为每行都创建完整原生对象。源页代码还展示从简要数据重新构造实例、`limit` / `offset` 分页，以及按姓名排序：

```ts
import { Contact, ContactField, ContactsSortOrder } from 'expo-contacts';

const fields = [ContactField.FULL_NAME, ContactField.PHONES] as const;
const summary = await Contact.getAllDetails(fields, {
  limit: 20,
  offset: 10,
  sortOrder: ContactsSortOrder.GivenName,
});

// 需要进入详情页时，利用 OS 提供的 ID 构造 Contact 实例。
const contacts = summary.map((item) => new Contact(item.id));

// 或者直接拿实例列表；ContactQueryOptions 同样支持筛选和分页。
const allContacts = await Contact.getAll({
  limit: 20,
  offset: 10,
  sortOrder: ContactsSortOrder.GivenName,
});
```

下面把官方 Infinite scroll 示例改写为 React Native `FlatList`。`onEndReached` 接近列表底部时再取一页；`limit` 表示一页数量，`offset` 是跳过前面已加载的记录数：

```tsx
import { Contact, ContactField, PartialContactDetails } from 'expo-contacts';
import { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';

const FIELDS = [ContactField.FULL_NAME, ContactField.PHONES] as const;

export default function InfiniteContacts() {
  const [items, setItems] = useState<PartialContactDetails<typeof FIELDS>[]>([]);

  async function loadMore() {
    const nextPage = await Contact.getAllDetails(FIELDS, {
      limit: 20,
      offset: items.length,
    });
    setItems((current) => [...current, ...nextPage]);
  }

  useEffect(() => {
    void loadMore();
  }, []);

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      onEndReached={() => void loadMore()}
      onEndReachedThreshold={0.5}
      renderItem={({ item }) => (
        <View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ccc' }}>
          <Text>{item.fullName}</Text>
          <Text>{item.phones?.[0]?.number ?? '没有电话号码'}</Text>
        </View>
      )}
    />
  );
}
```

## 编辑联系人表单

源页的表单示例演示将联系人数据加载到 React state，再添加 / 删除电话号码，最后使用 `patch` 保存。React Web 开发者可把它理解为受控表单，但输入控件和容器来自 `react-native`：

```tsx
import { Contact, ContactField, ContactPatch } from 'expo-contacts';
import { useEffect, useState } from 'react';
import { Alert, Button, ScrollView, Text, TextInput, View } from 'react-native';

export default function ContactForm() {
  const [contact, setContact] = useState<Contact | null>(null);
  const [draft, setDraft] = useState<ContactPatch>({});
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    async function loadFirstContact() {
      const [first] = await Contact.getAll({ limit: 1 });
      if (first) {
        setContact(first);
        setDraft(await first.getDetails([ContactField.GIVEN_NAME, ContactField.PHONES]));
      }
    }
    void loadFirstContact();
  }, []);

  if (!contact) {
    return <Text>正在读取联系人…</Text>;
  }

  function addPhone() {
    if (!newPhone) return;
    setDraft((current) => ({
      ...current,
      phones: [...(current.phones ?? []), { label: 'mobile', number: newPhone }],
    }));
    setNewPhone('');
  }

  function removePhone(index: number) {
    setDraft((current) => ({
      ...current,
      phones: current.phones?.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  async function save() {
    await contact.patch(draft);
    Alert.alert('联系人已更新');
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      <Text>联系人 ID：{contact.id}</Text>
      <Text>名字</Text>
      <TextInput
        value={draft.givenName ?? ''}
        onChangeText={(givenName) => setDraft((current) => ({ ...current, givenName }))}
      />

      <Text>电话</Text>
      {draft.phones?.map((phone, index) => (
        <View key={phone.id ?? `${phone.number}-${index}`} style={{ flexDirection: 'row' }}>
          <Text style={{ flex: 1 }}>{phone.number}</Text>
          <Button title="移除" onPress={() => removePhone(index)} />
        </View>
      ))}

      <View style={{ flexDirection: 'row' }}>
        <TextInput value={newPhone} onChangeText={setNewPhone} placeholder="新电话号码" />
        <Button title="添加" onPress={addPhone} />
      </View>
      <Button title="保存联系人" onPress={() => void save()} />
    </ScrollView>
  );
}
```

## iOS 18 limited access

Apple 的 limited contacts authorization 允许用户只向应用开放选定联系人。`Contact.presentAccessPicker()` 会显示系统选择界面并返回用户授权的 `Contact[]`；它只在 iOS 18+ 可用。`ContactAccessButton` 是系统联系人访问按钮，也只支持 iOS 18+；它的 `isAvailable()` 用来检查系统是否提供该控件。

```tsx
import { useState } from 'react';
import { Contact, ContactAccessButton } from 'expo-contacts';
import { Button, Text, View } from 'react-native';

export function LimitedContactsControls() {
  const [count, setCount] = useState<number | null>(null);

  async function chooseContacts() {
    const allowedContacts = await Contact.presentAccessPicker();
    setCount(allowedContacts.length);
  }

  return (
    <View>
      {ContactAccessButton.isAvailable() ? (
        <ContactAccessButton
          query="Alex"
          caption="phone"
          backgroundColor="#eeeeee"
          textColor="#222222"
          tintColor="#4630EB"
          ignoredEmails={['blocked@example.com']}
          ignoredPhoneNumbers={['+8613800000000']}
        />
      ) : (
        <Text>当前系统不提供 ContactAccessButton</Text>
      )}
      <Button title="选择允许访问的联系人" onPress={() => void chooseContacts()} />
      <Text>{count === null ? '尚未选择' : `已授权 ${count} 位联系人`}</Text>
    </View>
  );
}
```

`ContactAccessButton` 的属性：`query` 搜索应用尚未获得访问权的联系人；`ignoredEmails` / `ignoredPhoneNumbers` 排除匹配到的具体邮箱 / 电话；`caption` 可选 `default`、`email`、`phone`；`backgroundColor`、`textColor`、`tintColor` 控制系统按钮颜色；其余继承 `ViewProps`。半透明背景可能不满足系统的按钮可读性要求。组件页没有独立代码示例，上面的例子是按属性表改写的用法。

## Contact 类：方法与操作模式

### 常用静态方法

| 方法 | 作用 / 返回 |
| --- | --- |
| `Contact.create(record)` | 新建联系人，返回 `Contact`。 |
| `Contact.getAll(options?)` | 查询 `Contact[]`；可按姓名、排序、`limit`、`offset` 查询。 |
| `Contact.getAllDetails(fields, options?)` | 批量取指定字段，返回部分联系人信息，适合通讯录列表。 |
| `Contact.getCount()` | 返回联系人总数。 |
| `Contact.hasAny()` | 返回是否至少有一条联系人。 |
| `Contact.presentPicker()` | 打开系统联系人选择器，返回联系人实例或取消时的 `null`。 |
| `Contact.presentCreateForm(record?, options?)` | 打开系统新建联系人表单，返回是否创建成功。 |
| `Contact.presentAccessPicker()` | iOS 18+ 请求访问用户选定的一组联系人，返回获准访问的实例数组。 |

### 单条联系人与字段读取

`Contact` 实例有只读 `id: string`。ID 由操作系统生成：iOS 是 UUID，Android 来自联系人表的 `_ID`。页面逐项提供了字段 getter；它们是 Promise API。下面按源页列出的 getter 分组，便于查找：

| 数据组 | 方法 | 平台 / 说明 |
| --- | --- | --- |
| 批量记录 | `getDetails(fields?)` | Android / iOS；只取指定字段；不传字段时取可用详情。 |
| 姓名 | `getGivenName()`、`getMiddleName()`、`getFamilyName()`、`getFullName()`、`getPrefix()`、`getSuffix()` | Android / iOS；`getFullName()` 是只读合成姓名，平台格式可能不同。 |
| 工作 / 发音姓名 | `getCompany()`、`getDepartment()`、`getJobTitle()`、`getPhoneticCompanyName()`、`getPhoneticGivenName()`、`getPhoneticMiddleName()`、`getPhoneticFamilyName()` | Android / iOS。 |
| 联系方式列表 | `getAddresses()`、`getEmails()`、`getPhones()`、`getUrlAddresses()`、`getRelations()` | Android / iOS。 |
| 平台特有联系方式 | `getExtraNames()`、`getIsFavourite()` | Android：`getExtraNames()`、`getIsFavourite()`；iOS：`getImAddresses()`、`getSocialProfiles()`。 |
| 生日 / 备注 | `getBirthday()`、`getMaidenName()`、`getNickname()`、`getNonGregorianBirthday()` | iOS：以上生日字段；Android / iOS：`getNote()`，但读取 iOS note 需要额外 entitlement。 |
| 图片 | `getImage()`、`getThumbnail()` | Android / iOS；返回本地图片 URI 或 `null`，缩略图为只读。 |
| 静态查询 | `getCount()`、`hasAny()` | Android / iOS。 |

官方短示例里的字段读取都属于同一个模式，例如 `await contact.getEmails()`、`await contact.getGivenName()`、`await contact.getImage()`。`getDetails` 能用 `ContactField` 常量指定字段；没请求的字段可能不存在，不要把它们当作 `null`：

```ts
import { ContactField } from 'expo-contacts';

const details = await contact.getDetails([ContactField.GIVEN_NAME, ContactField.PHONES]);
const fullName = await contact.getFullName();
const emails = await contact.getEmails();
const imageUri = await contact.getImage();
```

### 新增与删除子项

电话、邮箱、地址、生日等是联系人记录里的子项。所有源页短 `add*` 示例都可归为“传入 New* 数据，Promise 返回新子项 ID”的模式；`delete*` 则用 `get*()` 返回的 Existing* 对象或文档允许的 ID 删除。官方示例覆盖了以下方法：

| 源页新增示例 | 平台 | 源页删除示例 | 平台 |
| --- | --- | --- | --- |
| `addAddress`、`addDate`、`addEmail`、`addPhone`、`addRelation`、`addUrlAddress` | Android / iOS | `deleteAddress`、`deleteDate`、`deleteEmail`、`deletePhone`、`deleteRelation`、`deleteUrlAddress` | Android / iOS |
| `addExtraName` | Android | `deleteExtraName` | Android |
| `addImAddress`、`addSocialProfile` | iOS | `deleteImAddress`、`deleteSocialProfile` | iOS |
| `Contact.create(record)` | Android / iOS | `contact.delete()` | Android / iOS |

```ts
import { Platform } from 'react-native';

const addressId = await contact.addAddress({ label: 'home', street: '123 Main St', city: '北京' });
const dateId = await contact.addDate({ label: 'anniversary', date: { day: 1, month: 1 } });
const emailId = await contact.addEmail({ label: 'work', address: 'work@example.com' });
const phoneId = await contact.addPhone({ label: 'mobile', number: '+8613800000000' });
const relationId = await contact.addRelation({ label: 'sister', name: '小红' });
const urlId = await contact.addUrlAddress({ label: 'blog', url: 'https://example.com' });

// Android 专属额外姓名；iOS 专属 IM / 社交资料：
if (Platform.OS === 'android') {
  const nicknameId = await contact.addExtraName({ label: 'nickname', name: '小明' });
  await contact.deleteExtraName(nicknameId);
}
if (Platform.OS === 'ios') {
  await contact.addImAddress({ service: 'Skype', username: 'xiaoming' });
  await contact.addSocialProfile({ service: 'social', username: 'xiaoming' });
  await contact.deleteImAddress((await contact.getImAddresses())[0]);
  await contact.deleteSocialProfile((await contact.getSocialProfiles())[0]);
}

const phones = await contact.getPhones();
const emails = await contact.getEmails();
await contact.deletePhone(phones[0]);
await contact.deleteEmail(emails[0]);
const addresses = await contact.getAddresses();
const dates = await contact.getDates();
const relations = await contact.getRelations();
const urls = await contact.getUrlAddresses();
await contact.deleteAddress(addresses[0]);
await contact.deleteDate(dates[0]);
await contact.deleteRelation(relations[0]);
await contact.deleteUrlAddress(urls[0]);
await contact.delete(); // 删除整条联系人记录
```

电话号码建议使用 E.164 国际格式，例如 `+8613800000000`；联系人数据库不会强制格式。子记录的字段一般有 `label`（如 work / home）和类型专属值。Existing* 对象带有 OS 生成的 `id`；调用相应的 `update*` / `delete*` 时要保留这个 ID。

### 修改现有子项

源页的 `update*` 示例采用相同操作形态：先用 getter 读取现有项，改字段，再把包含 ID 的 Existing* 对象交回 update 方法。页面示例涉及地址、日期、邮箱、ExtraName、IM 地址、电话、关系、社交资料和 URL 地址：

```ts
import { Platform } from 'react-native';

const addresses = await contact.getAddresses();
const address = addresses[0];
await contact.updateAddress({ ...address, city: '上海' });

const dates = await contact.getDates();
await contact.updateDate({ ...dates[0], label: 'birthday' });

const emails = await contact.getEmails();
const email = emails[0];
await contact.updateEmail({ ...email, address: 'new@example.com' });

const phones = await contact.getPhones();
await contact.updatePhone({ ...phones[0], number: '+8613900000000' });

const relations = await contact.getRelations();
await contact.updateRelation({ ...relations[0], name: '小红' });
const urls = await contact.getUrlAddresses();
await contact.updateUrlAddress({ ...urls[0], url: 'https://updated.example.com' });

if (Platform.OS === 'android') {
  const extraNames = await contact.getExtraNames();
  await contact.updateExtraName({ ...extraNames[0], name: '小明' });
}
if (Platform.OS === 'ios') {
  const ims = await contact.getImAddresses();
  await contact.updateImAddress({ ...ims[0], username: 'xiaoming2' });
  const profiles = await contact.getSocialProfiles();
  await contact.updateSocialProfile({ ...profiles[0], username: 'newhandle' });
}
```

相同的更新方法名为 `updateAddress`、`updateDate`、`updateEmail`、`updateExtraName`、`updateImAddress`、`updatePhone`、`updateRelation`、`updateSocialProfile`、`updateUrlAddress`，各自接收带合法 OS `id` 的 Existing* 项并返回 `Promise<void>`。各类别的短示例都采用“get → 取出第一项 → 改属性 → update”模式。

### 标量字段设置与原生编辑表单

页内 `set*` 方法把某个简单字段更新为新值，传 `null` 可清除许多字符串字段；这些 setter 的 Promise 解析为 `boolean` 成功状态。源页逐项示例覆盖：

`setBirthday`（iOS）、`setCompany`、`setDepartment`、`setFamilyName`、`setGivenName`、`setIsFavourite`（Android）、`setJobTitle`、`setMaidenName`（iOS）、`setMiddleName`、`setNickname`（iOS）、`setNonGregorianBirthday`（iOS）、`setNote`、`setPhoneticCompanyName`、`setPhoneticFamilyName`、`setPhoneticGivenName`、`setPhoneticMiddleName`、`setPrefix`、`setSuffix`。

```ts
import { NonGregorianCalendar } from 'expo-contacts';
import { Platform } from 'react-native';

await contact.setGivenName('晓明');
await contact.setCompany('Example Inc.');
await contact.setMiddleName('小');
await contact.setDepartment('Engineering');
await contact.setJobTitle('Developer');
await contact.setPhoneticCompanyName('Ekzampl');
await contact.setPhoneticGivenName('Xiao');
await contact.setPhoneticMiddleName('Xiao');
await contact.setPhoneticFamilyName('Chen');
await contact.setPrefix('Dr.');
await contact.setSuffix('Jr.');
if (Platform.OS === 'ios') {
  await contact.setBirthday({ year: 1990, month: 1, day: 1 });
  await contact.setNonGregorianBirthday({
    year: 2563,
    month: 5,
    day: 15,
    calendar: NonGregorianCalendar.buddhist,
  });
  await contact.setMaidenName('Wang');
  await contact.setNickname('Ming');
}
await contact.setNote('记得回电话');
if (Platform.OS === 'android') {
  await contact.setIsFavourite(true);
}
```

`setNonGregorianBirthday` 同样只适用于 iOS；`setNote` 受额外 entitlement 限制。`ContactDate` 类型表将年月日定义为数字，因此这里按字段类型传 number；源页 setter 示例里的生日数字写成字符串。

`contact.editWithForm(options?)` 打开系统编辑联系人界面并返回用户是否保存。`Contact.presentCreateForm(record?, options?)` 打开系统新增联系人界面；`Contact.presentPicker()` 则是让用户挑选已有联系人。这些原生表单适合把编辑流程交给系统 UI。

```ts
import { Contact, ContactField } from 'expo-contacts';

const wasCreated = await Contact.presentCreateForm({ givenName: 'Jane', familyName: 'Doe' });

const selectedContact = await Contact.presentPicker();
if (selectedContact) {
  const details = await selectedContact.getDetails([ContactField.GIVEN_NAME, ContactField.PHONES]);
}
```

## Container 与 Group（iOS）

在 iOS 上联系人可归属一个 **Container**（通讯录账户来源，如本机、iCloud、Google、Exchange），Container 内还能有 **Group**（例如 Family、Coworkers）。这套账户 / 分组层级仅在 iOS 支持。

| 类 | 方法 | 作用 |
| --- | --- | --- |
| `Container` | `Container.getAll()`、`Container.getDefault()` | 查询可用账户来源，或取得新增联系人时默认使用的来源。 |
| `Container` | `container.getContacts()`、`container.getGroups()` | 读取某个来源下的联系人 / 分组。 |
| `Container` | `container.getName()`、`container.getType()` | 读账户名称（如 iCloud / Gmail）和类型。 |
| `Group` | `Group.create(name, containerId?)`、`Group.getAll(containerId?)` | 创建分组或查询分组。省略 containerId 时用默认来源 / 查询全部。 |
| `Group` | `group.getContacts(options?)`、`group.getName()` | 读取组内联系人和组名。 |
| `Group` | `group.addContact(contact)`、`group.removeContact(contact)`、`group.setName(name)`、`group.delete()` | 将联系人加入 / 移出组、重命名或删除组。删除组本身不会删除联系人。 |

```ts
import { Container, Group } from 'expo-contacts';

const containers = await Container.getAll();
const defaultContainer = await Container.getDefault();
const groups = await Group.getAll(defaultContainer?.id);

const group = await Group.create('家庭', defaultContainer?.id);
const members = await group.getContacts({ sort: 'firstName' });
await group.addContact(contact);
await group.setName('亲友');
await group.removeContact(contact);
await group.delete();
```

当前 `Container` 页面明确列出的实例方法是 `getContacts`、`getGroups`、`getName`、`getType`，并没有 `container.addGroup()`；虽然旧 `addExistingGroupToContainerAsync` 的弃用提示把 `container.addGroup()` 写作迁移方向，但同页的现代 Container API 未列该方法。若要创建一个组，用这里明确列出的 `Group.create(name, containerId)`；迁移已有组时请以实际安装版本的类型定义为准。

## Contacts 变化监听

`Contacts.addContactsChangeListener(listener)` 注册通讯录变更监听，回调不带参数，新增 / 更新 / 删除联系人时触发。返回的订阅对象用 `.remove()` 清理；`removeAllContactsChangeListeners()` 会清除全部监听。Android 系统的 `ContentObserver` 可能延迟 5–7 秒，而且同时观察 RawContacts 与 Contacts 时一次变更可能发出两次事件；iOS 通知通常即时。应用从系统通讯录页面返回前台时可按需重新读取联系人。

```tsx
import * as Contacts from 'expo-contacts';
import { useEffect } from 'react';

export function useContactsChangeListener(loadContacts: () => Promise<void>) {
  useEffect(() => {
    const subscription = Contacts.addContactsChangeListener(() => {
      void loadContacts();
    });
    return () => subscription.remove();
  }, [loadContacts]);
}
```

源页示例代码写成了单数 `addContactChangeListener`，而 API 标题 / 返回描述写的是 `addContactsChangeListener`。此处按 API 标题的复数方法名改写；这是源页自身的名称不一致，SDK v56 页面也有同一处不一致。

## 旧的全局 `Contacts.*Async` API

较早的 Expo Contacts API 用模块级 `Contacts.*Async` 方法和普通记录对象管理联系人。当前页面把大量这类方法标为 deprecated；源页说明默认导入路径下调用会在运行时抛错。仍维护旧代码时从 `expo-contacts/legacy` 导入；新代码优先使用 `Contact`、`Container`、`Group` 实例 / 静态方法。

| 旧方法 | 新 API / 状态 |
| --- | --- |
| `addContactAsync` | `Contact.create(record)`；旧方法可从 `expo-contacts/legacy` 导入。 |
| `addExistingContactToGroupAsync` | `group.addContact(contact)`。 |
| `addExistingGroupToContainerAsync` | 文档提示 `container.addGroup()`，但当前 Container 方法列表没有此方法；创建组可用 `Group.create(name, containerId)`，已有组请核对实际 API / 从 legacy 导入。 |
| `createGroupAsync` | `Group.create(name, containerId?)`。 |
| `getContactByIdAsync` | `new Contact(id).getDetails(fields)`，或 `Contact.getAll()` / `getAllDetails()` 查询。 |
| `getContactsAsync` / `getPagedContactsAsync` | `Contact.getAll()` 或 `Contact.getAllDetails()`，用 `limit` / `offset` 分页。 |
| `getContainersAsync` / `getDefaultContainerIdAsync` | `Container.getAll()` / `Container.getDefault()`。 |
| `getGroupsAsync` | `Group.getAll()`。 |
| `getPermissionsAsync` / `requestPermissionsAsync` | 页面仍列出这两个模块级权限查询 / 请求方法；它们用于查看或请求 OS 联系人授权。 |
| `hasContactsAsync` | `Contact.hasAny()`。 |
| `isAvailableAsync` | 属旧方法；若要检查 iOS 18 系统 access button，使用 `ContactAccessButton.isAvailable()`。 |
| `presentAccessPickerAsync` | iOS 18+ 用 `Contact.presentAccessPicker()`。 |
| `presentContactPickerAsync` | `Contact.presentPicker()`。 |
| `presentFormAsync` | 编辑已有联系人用 `contact.editWithForm()`；创建联系人用 `Contact.presentCreateForm()`。 |
| `removeContactAsync` | `contact.delete()`。 |
| `removeContactFromGroupAsync` / `removeGroupAsync` | `group.removeContact(contact)` / `group.delete()`。 |
| `shareContactAsync` | 旧的联系人分享调用；页面未给出新类 API 的替代分享方法，仍要用它时从 `expo-contacts/legacy` 导入。 |
| `updateContactAsync` | `contact.patch(partial)` 或 `contact.update(fullRecord)`。 |
| `updateGroupNameAsync` | `group.setName(name)`。 |
| `writeContactToFileAsync` | 页面仍标为 legacy，没有列出替代方法。 |

旧分页查询的用法形态如下。这里使用 legacy 模块显式导入旧 API，`ContactResponse` 中的 `data` 是记录数组，`hasNextPage` 可用于决定是否继续加载：

```ts
import * as LegacyContacts from 'expo-contacts/legacy';

const response = await LegacyContacts.getPagedContactsAsync({
  fields: [LegacyContacts.Fields.FirstName, LegacyContacts.Fields.PhoneNumbers],
  pageSize: 20,
  pageOffset: 0,
});
const legacyRows = response.data;
const canLoadMore = response.hasNextPage;
```

## 常见数据类型

| 类型 | 作用 / 关键字段 |
| --- | --- |
| `CreateContactRecord` | 新联系人输入。包含姓名、公司、部门、电话、邮箱、地址、日期、头像 URI、关系、URL、备注和发音姓名等；其中生日 / 昵称 / IM / social / maiden name 等字段受平台限制。 |
| `ContactDetails` | 已存在联系人的完整字段集合，如 `id`、姓名、电话 / 邮箱 / 地址、头像、职位、关系、社交资料等。 |
| `ContactPatch` | 部分更新结构。未定义的字段忽略；简单字段设 `null` 可清空；列表可由 Existing* 与 New* 项混合组成。 |
| `PartialContactDetails<T>` | `getDetails` / `getAllDetails` 返回的字段子集，并有 `id`；类型参数对应请求字段。 |
| `ExistingContact` | 已存联系人记录，含 OS 生成的不可变 `id`。 |
| `NewAddress` / `ExistingAddress` | 街道、城市、州 / 地区、邮编、国家和 label；Existing 版本增加 ID。 |
| `NewDate` / `ExistingDate` | `date`（月日年）和 label；Existing 增加 ID。 |
| `NewEmail` / `ExistingEmail` | 邮箱 address、label；Existing 增加 ID。 |
| `NewPhone` / `ExistingPhone` | `number`、label；Existing 增加 ID。推荐 E.164 格式，但系统数据层不强制格式。 |
| `NewExtraName` / `ExistingExtraName` | Android 的昵称、别名、婚前姓名等；Existing 增加 ID。 |
| `NewImAddress` / `ExistingImAddress` | iOS 即时通信服务名和用户名；Existing 增加 ID。 |
| `NewRelation` / `ExistingRelation` | 关系 label 和联系人姓名；Existing 增加 ID。 |
| `NewSocialProfile` / `ExistingSocialProfile` | 社交服务、URL、用户 ID / 名称；Existing 增加 ID。 |
| `NewUrlAddress` / `ExistingUrlAddress` | 网站 URL、label；Existing 增加 ID。 |
| `ContactDate` | `day`、`month`，可选 `year`；用于生日等日期。 |
| `Date` | 旧结构；`month` 与 JavaScript Date 一样从 0 起算，`format` 由系统给出，不要手动填。 |
| `NonGregorianBirthday` | iOS 的非公历生日：calendar、day、month、可选 year。 |
| `Image` | 联系人图片的 `uri`（仅支持本地 URI）或 `base64`；远端图片先下载成文件再传。 |
| `ContactQuery` | 旧查询结构：可按 ID、姓名、页码、分组 / 容器和返回字段筛选。 |
| `ContactQueryOptions` | 现代查询结构：`limit`、`offset`、`name`、`sortOrder`、iOS `rawContacts`。 |
| `ContactResponse` | 旧分页响应：`data`、`hasNextPage`、`hasPreviousPage`。 |
| `ContactsPermissionResponse` | 基本权限响应加 `accessPrivileges?: 'all' \| 'limited' \| 'none'`。limited 仅 iOS 18+。 |
| `ContainerQuery` / `GroupQuery` | 按 contact / container / group ID 或 groupName 查来源 / 分组。 |
| `FormOptions` / `CreateFormOptions` | iOS 原生联系人表单显示、编辑、取消按钮等配置；`isNew` 已弃用，改用 `presentCreateForm`。 |

`ContactField` 枚举选择查询字段：`ADDRESSES`、`BIRTHDAY`、`COMPANY`、`DATES`、`DEPARTMENT`、`EMAILS`、`EXTRA_NAMES`、`FAMILY_NAME`、`FULL_NAME`、`GIVEN_NAME`、`IM_ADDRESSES`、`IMAGE`、`IS_FAVOURITE`、`JOB_TITLE`、`MAIDEN_NAME`、`MIDDLE_NAME`、`NICKNAME`、`NON_GREGORIAN_BIRTHDAY`、`NOTE`、`PHONES`、`PHONETIC_COMPANY_NAME`、`PHONETIC_FAMILY_NAME`、`PHONETIC_GIVEN_NAME`、`PHONETIC_MIDDLE_NAME`、`PREFIX`、`RELATIONS`、`SOCIAL_PROFILES`、`SUFFIX`、`THUMBNAIL`、`URL_ADDRESSES`。源页也列出字段字符串 key 的 `ContactFieldKey` 与 legacy `Fields`。

其它枚举：`ContactsSortOrder`（`FamilyName`、`GivenName`、`None`、`UserDefault`）用于现代查询；legacy `SortTypes`（`FirstName`、`LastName`、`None`、`UserDefault`）用于旧查询；`ContactTypes`（`Company` / `Person`）表示公司或个人；`ContainerTypes` 有 `CardDAV`、`Exchange`、`Local`、`Unassigned`。`CalendarFormats` 有 `Buddhist`、`Chinese`、`Coptic`、`EthiopicAmeteAlem`、`EthiopicAmeteMihret`、`Gregorian`、`Hebrew`、`Indian`、`Islamic`、`IslamicCivil`、`IslamicTabular`、`IslamicUmmAlQura`、`ISO8601`、`Japanese`、`Persian`、`RepublicOfChina`；iOS 的 `NonGregorianCalendar` 有 `buddhist`、`chinese`、`coptic`、`ethiopicAmeteAlem`、`ethiopicAmeteMihret`、`hebrew`、`indian`、`islamic`、`islamicCivil`、`japanese`、`persian`、`republicOfChina`。`PermissionStatus` 为 `DENIED`、`GRANTED`、`UNDETERMINED`。

源页还导出 `ContactAccessButtonProps`、`CalendarFormatType`、`ContactType`、`ContainerType`、`FieldType`、`ContactSort`（字符串联合类型）；`Address`、`Date`、`Email`、`Image`、`InstantMessageAddress`、`PhoneNumber`、`Relationship`、`SocialProfile`、`UrlAddress` 是对应字段结构；`ExistingAddress`、`ExistingDate`、`ExistingEmail`、`ExistingExtraName`、`ExistingImAddress`、`ExistingPhone`、`ExistingRelation`、`ExistingSocialProfile`、`ExistingUrlAddress` 在新结构上带系统生成的 ID。`ContactFieldKey` 与旧 `Fields` 表示查询字段 key。

## 源页代码覆盖、权限和版本差异

- Installation：覆盖 npm / Yarn / pnpm / Bun 的安装命令。
- Configuration：覆盖 CNG 插件 JSON、Android `READ_CONTACTS` / `WRITE_CONTACTS` Manifest 权限、iOS `NSContactsUsageDescription` Info.plist；另说明 iOS 联系人备注 entitlement `ios.accessesContactNotes` 需要向 Apple 申请，设为 `true` 并构建自己的 development build，Expo Go 不含此 entitlement。
- Usage：重写官方联系人新增 / setter / 子项 `add` / `get` / patch / 全量 update 示例、`getAllDetails` / `getAll` 读取示例、`FlatList` 无限滚动示例和可编辑表单（加载、改名、添加 / 删除电话、patch 保存）。
- Component / API examples：用 `ContactAccessButton` 属性表和 JSX 示例覆盖限定访问按钮；覆盖 `Contact.presentAccessPicker()`、`Contact.presentCreateForm()`、`Contact.presentPicker()` 的系统流程。
- Contact class：官方大量单行 `add*`、`delete*`、`get*`、`set*`、`update*` 例子按 CRUD 操作形态归并；上文分别列出每个源页方法名，并用地址 / 日期 / 邮箱 / 电话 / IM / social / URL 示例展示添加、删除与 Existing ID 更新模式。标量 setters 以多字段示例覆盖，getter 全表列名。
- Container / Group：覆盖获取容器、默认来源、读取分组 / 成员、创建 / 重命名 / 删除组、组成员增删示例。
- Event subscriptions：覆盖 Contacts 变化回调和订阅移除；记录 Android 延迟与可能的重复事件、iOS 即时通知。
- API 表：记录旧 `Contacts.*Async` 方法和 modern 对应方式；继承示例中被标 deprecated、默认会 throw 的旧方法从 `expo-contacts/legacy` 导入。
- Latest `~57.0.6` 与 SDK v56 `~56.0.14` 的配置、Usage、Contact API、iOS 18 limited access、legacy API、字段类型和权限内容一致；Next 两版均是 Contacts (legacy)。

**翻页：**[上一页：Expo SDK Constants 应用与运行时信息](./152-Expo-SDK-Constants.md) · [目录](./README.md) · [下一页：Expo SDK Contacts（legacy）旧版 API](./154-Expo-SDK-Contacts-Legacy.md)
