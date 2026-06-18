# 迁移到新版 expo-contacts 接口

> 原文地址：https://docs.expo.dev/guides/sdk-libraries-migration/contacts.md

本指南详细介绍如何将项目从旧版遗留模块迁移到现代的、面向类（class-oriented）的 `Contact` 对象方式。

现代重构后的模块已经达到稳定状态。开发者仍然可以通过遗留导入路径访问旧版本，但切换到主包可以确保获取后续的补丁更新。

## 核心变化概览

新系统不再依赖独立函数，而是使用 `Contact` 类。这些实例充当原生标识符的包装器。主要变化包括：

- **属性访问方式改变**：生日、雇主信息等属性现在使用异步的 getter/setter 函数，而非直接访问对象字段。
- **嵌套条目操作更精细**：物理地址、电子邮件列表等嵌套条目通过专门的创建、获取、修改和删除函数来处理，不再需要覆写整个数组。
- **修改操作一分为二**：`patch` 处理增量修改（只改你指定的字段），`update` 执行完整覆写（未提供的字段会被清除）。

> **基于文档内容推导**：这种设计的核心思想是将联系人视为一个由原生 ID 标识的远程资源，而非一个普通的 JavaScript 对象。每次读写都通过异步方法与原生层通信。

---

## 安装

将对应版本的库添加到项目中：

```sh
npx expo install expo-contacts
```

这条命令会自动安装与当前 Expo SDK 版本兼容的 `expo-contacts` 包。使用 `npx expo install` 而非 `npm install`，可以确保版本兼容性。

---

## 导入现代模块

从主包中导入核心类：

```ts
import { Contact } from 'expo-contacts';
```

> **基于经验建议**：如果你的项目中同时存在旧版和新版代码，注意区分导入路径。旧版通常从 `expo-contacts` 的遗留路径导入（如 `import * as Contacts from 'expo-contacts/build/Contacts'` 等），新版直接从 `'expo-contacts'` 导入 `Contact` 类。

---

## 联系人目录管理

### 创建新联系人

```ts
// 旧版写法
const id = await Contacts.addContactAsync({ firstName: 'John', lastName: 'Doe' });

// 新版写法
const contact = await Contact.create({ givenName: 'John', familyName: 'Doe' });
```

**变化要点**：
- 旧版返回一个简单的字符串 ID，新版返回一个完整的 `Contact` 类实例。
- 字段命名从 `firstName` / `lastName` 变为 `givenName` / `familyName`，与原生操作系统的命名标准一致。

### 获取全部联系人

```ts
// 旧版写法
const { data } = await Contacts.getContactsAsync({
  fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
  pageSize: 20,
  pageOffset: 10,
  sort: Contacts.SortTypes.FirstName,
});

// 新版写法 —— 获取实例对象
const contacts = await Contact.getAll({
  limit: 20,
  offset: 10,
  sortOrder: ContactsSortOrder.GivenName,
});

// 新版写法 —— 带类型约束的字段投影
const contacts = await Contact.getAllDetails(
  [ContactField.FULL_NAME, ContactField.PHONES],
  {
    limit: 20,
    offset: 10,
  }
);
```

**两种新版方法的区别**：
- `Contact.getAll()` 返回 `Contact` 实例数组，可以通过实例方法进一步操作。
- `Contact.getAllDetails()` 返回带有严格类型的数据对象数组，类型与你指定的字段列表匹配。适合只需要读取特定字段的场景。

> **基于经验建议**：`getAllDetails` 的字段投影方式在性能上更优，因为只从原生层获取你需要的数据，减少了不必要的数据传输。在联系人数量较多时推荐使用。

### 通过唯一标识符获取联系人

通过详细查询获取的数据包含原生 ID。要在这些结果上执行实例方法，需要使用该 ID 创建一个新的 `Contact` 包装器：

```ts
const results = await Contact.getAllDetails([ContactField.FULL_NAME, ContactField.PHONES]);
const contact = new Contact(results[0].id);
await contact.addPhone({ label: 'work', number: '+12345678912' });
```

这里先用 `new Contact(id)` 将原始数据包装为实例，然后就可以调用 `addPhone` 等实例方法。

### 统计记录数

```ts
// 旧版写法 —— 判断是否有联系人
const hasAny = await Contacts.hasContactsAsync();

// 新版写法 —— 判断是否有联系人
const hasAny = await Contact.hasAny();

// 新版写法 —— 获取联系人总数（旧版没有直接等价方法）
const count = await Contact.getCount();
```

`Contact.getCount()` 是新版新增的能力，旧版中没有直接等价方法。如果你之前需要统计联系人数量，只能先获取全部联系人再计算数组长度。

### 修改联系人

```ts
// 旧版写法 —— 覆写整个联系人对象
await Contacts.updateContactAsync({ ...contact, firstName: 'Andrew' });

// 新版写法 —— 增量更新（只修改提供的字段）
await contact.patch({ givenName: 'Andrew' });

// 新版写法 —— 完整替换（未提供的字段将被清除）
await contact.update({
  givenName: 'John',
  familyName: 'Doe',
  phones: [{ label: 'mobile', number: '+12123456789' }],
});
```

**这是新版最重要的行为变化之一**：
- `patch`：增量更新，只修改你传入的字段，其余字段保持不变。适合大多数日常修改场景。
- `update`：完整替换，未提供的字段会被清空。适合需要用新数据完全覆盖联系人的场景。

> **基于经验建议**：绝大多数情况下应该使用 `patch`，除非你明确需要清除某些字段。误用 `update` 可能导致联系人数据丢失。

### 删除联系人

```ts
// 旧版写法
await Contacts.removeContactAsync(id);

// 新版写法
await contact.delete();
```

新版直接在实例上调用 `delete()` 方法，无需额外传递 ID。

---

## 基本属性（Individual Data Points）

每个基本属性现在都依赖异步的 getter/setter 函数。使用 `get` 前缀读取，`set` 前缀写入。也可以通过 `getDetails` 函数批量读取。

### 属性函数对照表

| 属性 | 读取函数 | 写入函数 |
| --- | --- | --- |
| 名 (First name) | `getGivenName` | `setGivenName` |
| 姓 (Last name) | `getFamilyName` | `setFamilyName` |
| 中间名 | `getMiddleName` | `setMiddleName` |
| 完整姓名 | `getFullName` | ✗（只读） |
| 昵称（仅 iOS） | `getNickname` | `setNickname` |
| 头衔前缀 | `getPrefix` | `setPrefix` |
| 头衔后缀 | `getSuffix` | `setSuffix` |
| 拼音名 | `getPhoneticGivenName` | `setPhoneticGivenName` |
| 拼音姓 | `getPhoneticFamilyName` | `setPhoneticFamilyName` |
| 公司 | `getCompany` | `setCompany` |
| 职位 | `getJobTitle` | `setJobTitle` |
| 部门 | `getDepartment` | `setDepartment` |
| 生日（仅 iOS） | `getBirthday` | `setBirthday` |
| 备注 | `getNote` | `setNote` |
| 头像 | `getImage` | `setImage` |
| 缩略图 | `getThumbnail` | ✗（只读） |
| 星标（仅 Android） | `getIsFavourite` | `setIsFavourite` |

> **基于文档内容推导**：标注"✗"的属性（完整姓名、缩略图）为只读，无法直接写入。完整姓名通常由系统根据名、中间名、姓自动拼接生成。

### 姓名操作示例

```ts
// 旧版写法 —— 通过 getContactByIdAsync 获取联系人后直接访问字段
const contact = await Contacts.getContactByIdAsync(id);
console.log(contact.firstName, contact.lastName);

// 新版写法 —— 使用独立的异步 getter
const givenName = await contact.getGivenName();
const familyName = await contact.getFamilyName();

// 新版写法 —— 通过 getDetails() 批量获取
const details = await contact.getDetails([ContactField.FULL_NAME]);

// 写入操作
await contact.setGivenName('John');
await contact.setFamilyName('Doe');
await contact.setMiddleName('Michael');
```

**变化要点**：
- 旧版获取联系人后可以直接 `contact.firstName` 访问，新版必须通过异步方法 `await contact.getGivenName()` 访问。
- 这是因为新版中 `Contact` 实例只是一个原生 ID 的包装器，实际数据存储在原生层，每次读取都需要异步通信。

---

## 嵌套数组操作

新版不再需要覆写完整的列表来修改嵌套数据。每个类别都有专门的创建、读取、编辑和删除函数：

### 嵌套数组函数对照表

| 类别 | 可用函数 |
| --- | --- |
| 电话号码 | `addPhone`、`getPhones`、`updatePhone`、`deletePhone` |
| 电子邮件 | `addEmail`、`getEmails`、`updateEmail`、`deleteEmail` |
| 物理地址 | `addAddress`、`getAddresses`、`updateAddress`、`deleteAddress` |
| 网址 | `addUrlAddress`、`getUrlAddresses`、`updateUrlAddress`、`deleteUrlAddress` |
| 社交资料 | `addSocialProfile`、`getSocialProfiles`、`updateSocialProfile`、`deleteSocialProfile` |
| 即时通讯 | `addImAddress`、`getImAddresses`、`updateImAddress`、`deleteImAddress` |
| 日历事件 | `addDate`、`getDates`、`updateDate`、`deleteDate` |
| 别名（仅 Android） | `addExtraName`、`getExtraNames`、`updateExtraName`、`deleteExtraName` |

### 电话号码操作示例

以下代码以电话号码为例演示嵌套数组的操作方式，其他类别的操作模式完全相同：

```ts
// 旧版写法 —— 覆写整个数组
await Contacts.updateContactAsync({
  ...contact,
  phoneNumbers: [...existing, { label: 'work', number: '+12345678912' }],
});

// 新版 —— 添加
await contact.addPhone({ label: 'work', number: '+12345678912' });

// 新版 —— 获取
const phones = await contact.getPhones();

// 新版 —— 更新
await contact.updatePhone(existingPhone);

// 新版 —— 删除
await contact.deletePhone(existingPhone);
```

**变化要点**：
- 旧版修改电话号码需要：先获取现有号码列表，拼接新号码，再整体覆写。代码繁琐且容易出错。
- 新版每个操作都是独立的原子操作，语义清晰、代码简洁。

> **基于经验建议**：`updatePhone` 和 `deletePhone` 需要传入已有的电话号码对象（通常先通过 `getPhones()` 获取），确保你持有正确的引用再进行操作。

---

## 系统界面（System Interfaces）

新版提供了与原生系统 UI 交互的方法：

```ts
// 旧版写法
const contact = await Contacts.presentContactPickerAsync();
await Contacts.presentFormAsync(null, contactData, { isNew: true });
await Contacts.presentFormAsync(contactId);

// 新版写法
const contact = await Contact.presentPicker();
if (contact) {
  // 用户选择了一个联系人
}
const created = await Contact.presentCreateForm(contactData);
await contact.editWithForm();
```

**各方法说明**：
- `Contact.presentPicker()`：弹出联系人选择器，用户选择一个联系人后返回该实例，取消则返回 `null`。
- `Contact.presentCreateForm(contactData)`：弹出创建联系人的系统表单，预填 `contactData` 中的数据。
- `contact.editWithForm()`：弹出编辑联系人的系统表单。

### 选择模态框（需要 iOS 18 或更高版本）

```ts
// 旧版写法
const contactIds = await Contacts.presentAccessPickerAsync();

// 新版写法
const selectedContacts = await Contact.presentAccessPicker();
```

> **基于文档内容推导**：`presentAccessPicker` 与 `presentPicker` 不同——前者允许用户选择多个联系人（批量选择），后者只选择单个。使用 `presentAccessPicker` 前需确认用户的 iOS 版本是否 >= 18。

---

## 分组（Collections，仅 Apple 设备）

联系人分组功能在 Apple 设备上可用：

```ts
// 旧版写法
const groups = await Contacts.getGroupsAsync({});
await Contacts.createGroupAsync('Family');
await Contacts.addExistingContactToGroupAsync(contactId, groupId);
await Contacts.removeContactFromGroupAsync(contactId, groupId);

// 新版写法
const groups = await Group.getAll();
const group = await Group.create('Family');
await group.addContact(contact);
await group.removeContact(contact);
const contacts = await group.getContacts();
const name = await group.getName();
await group.setName('Close Friends');
await group.delete();
```

新版引入了 `Group` 类，所有分组操作都通过 `Group` 实例方法完成。注意新版直接传递 `Contact` 实例而非 ID 字符串。

---

## 存储卷（Containers，仅 Apple 设备）

存储卷表示联系人数据的来源容器（如 iCloud、本地等）：

```ts
// 旧版写法
const containers = await Contacts.getContainersAsync({});
const defaultId = await Contacts.getDefaultContainerIdAsync();

// 新版写法
const containers = await Container.getAll();
const defaultContainer = await Container.getDefault(); // 可能为 null
const name = await container.getName();
const type = await container.getType();
const groups = await container.getGroups();
const contacts = await container.getContacts();
```

新版引入了 `Container` 类，除了获取列表和默认容器外，还可以查询容器的名称、类型，以及获取容器下的分组和联系人。

> **基于文档内容推导**：`Container.getDefault()` 可能返回 `null`，使用时应做空值检查。

---

## 权限管理（Authorization）

```ts
// 旧版写法
const { status } = await Contacts.requestPermissionsAsync();
const { status } = await Contacts.getPermissionsAsync();

// 新版写法
const { status } = await requestPermissionsAsync();
const { status } = await getPermissionsAsync();
```

新版将权限相关函数从 `Contacts` 命名空间中提取出来，作为独立函数导出。使用前需要从 `'expo-contacts'` 中导入：

```ts
import { requestPermissionsAsync, getPermissionsAsync } from 'expo-contacts';
```

---

## 监听联系人变更

```ts
// 旧版写法
const subscription = Contacts.addContactsChangeListener(() => {
  // 联系人发生变化
});
subscription.remove();

// 新版写法
const subscription = addContactsChangeListener(() => {
  // 联系人发生变化
});
subscription.remove();

// 新版 —— 一次性移除所有监听器
removeAllContactsChangeListeners();
```

新版同样将监听函数提取为独立导出。另外新增了 `removeAllContactsChangeListeners()` 方法，可以一次性清除所有变更监听器，在组件卸载时特别有用。

> **基于经验建议**：在 React 组件中使用时，务必在 `useEffect` 的清理函数中调用 `subscription.remove()`，避免内存泄漏。

---

## 重大行为变化总结

以下是从旧版迁移到新版时需要注意的核心行为变化：

1. **属性标签对齐原生标准**：属性标签与原生操作系统标准一致，旧的命名约定被平台标准等效名称替换（例如 `firstName` → `givenName`）。

2. **字段选择使用严格类型枚举**：详细查询的输出与你的选择精确匹配，提供完整的类型安全。

3. **移除异步后缀**：所有方法名不再带有 `Async` 后缀，因为所有操作本身就是异步的。

4. **基本属性使用异步访问器**：不再直接访问对象变量，而是通过异步 getter/Setter 函数。可通过 `getDetails` 批量读取。

5. **嵌套列表使用专用操作函数**：不再需要覆写完整数组，而是通过 `add`/`get`/`update`/`delete` 四类函数精细操作。

6. **修改操作一分为二**：`patch` 用于增量编辑，`update` 用于完整替换。

7. **分享和文件导出功能已完全弃用**：没有直接替代品，需要从代码库中移除相关调用。

> **基于经验建议**：迁移时建议逐个文件替换，每替换一处就运行测试，避免一次性大量修改导致难以排查问题。优先替换简单的 CRUD 操作，最后处理嵌套数组和系统界面部分。

---

## 文档导航

- **上一页**：[calendar](./150__calendar.md)
- **下一页**：[authentication](./152__authentication.md)
