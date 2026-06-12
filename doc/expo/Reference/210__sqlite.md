# Expo SQLite 学习指南

> 原文档修改日期：2026 年 6 月 2 日  
> 包名：`expo-sqlite`  
> 文档版本：下一版本 Expo SDK 的未发布文档  
> 当前稳定文档对应 SDK 56。本文内容可能尚未进入稳定版本，实际项目应核对所使用 SDK 的对应文档。

## 文档解决的问题

`expo-sqlite` 为 Expo 和 React Native 应用提供 SQLite 数据库访问能力。数据保存在本地数据库文件中，应用重启后仍然存在。

它主要适用于：

- 保存结构化的离线数据。
- 对本地数据执行筛选、排序、聚合和关联查询。
- 管理具有版本演进需求的本地数据结构。
- 保存数量较多、关系较复杂的数据。
- 使用 SQLite 支撑键值存储。
- 在支持的平台上使用全文搜索、数据库加密、扩展或 libSQL。
- 在多个 React 组件之间共享数据库连接。

如果只需要存储极少量字符串配置，可以使用文档提供的 `expo-sqlite/kv-store` 或 `localStorage` 兼容层，不一定需要直接编写 SQL。

## React Web 开发者需要先理解的背景

### SQLite 不是远程数据库

SQLite 是嵌入应用的本地关系型数据库。它通常以文件形式存在于设备上，不需要单独部署数据库服务器。

这与 Web 项目常见的 MySQL、PostgreSQL 服务不同：

- SQL 在用户设备上执行，而不是后端服务器上。
- 数据默认只属于当前设备和应用。
- 应用更新或重启后数据仍可保留。
- 文档没有说明 SQLite 数据会自动在多台设备之间同步。
- 卸载应用、删除数据库文件或覆盖数据库可能导致数据丢失。

最后两点中的同步结论是**基于文档内容推导**：文档只说明本地持久化，并未提供默认的云端同步机制。

### Expo Go、开发构建与原生二进制

Expo Go 是预先构建好的通用客户端，只包含它内置的原生模块。某些 SQLite 功能需要改变 SQLite 的原生编译方式，因此不能仅通过 JavaScript 更新启用。

以下配置需要重新构建应用二进制：

- `useSQLCipher`
- `useLibSQL`
- `customBuildFlags`
- `withSQLiteVecExtension`
- 部分平台级 SQLite 编译配置

SQLCipher 明确不支持 Expo Go。

### Config Plugin 与 CNG

Config Plugin 用于根据 `app.json` 等 Expo 配置修改 iOS、Android 原生工程。

CNG（Continuous Native Generation，持续原生工程生成）指通过 Expo 配置生成原生工程。使用 CNG 时，可以通过 `expo-sqlite` 的 Config Plugin 声明原生配置；不使用 CNG 时，需要手动修改原生工程。

这类配置不同于 React Web 中运行时读取的环境变量：它们参与原生编译，修改后必须重新构建应用。

## 安装

```sh
npx expo install expo-sqlite
```

也可以使用对应包管理器：

```sh
yarn expo install expo-sqlite
pnpm expo install expo-sqlite
bun expo install expo-sqlite
```

`expo install` 会选择与当前 Expo SDK 兼容的依赖版本。

如果项目是已有的纯 React Native 工程，需要先按照 Expo 文档安装 Expo Modules，不能假设安装 `expo-sqlite` 包后原生模块便会自动可用。

## 支持平台与存储位置

文档标明支持：

- Android
- iOS
- macOS
- tvOS
- Web
- Expo Go，但部分功能例外

数据库会跨应用重启持久化。

Apple TV 是一个例外：受 Apple 平台规范影响，数据库文件位于缓存目录，而不是应用文档目录。缓存目录中的文件具有不同的生命周期，因此不应把 Apple TV 上的数据库视为绝对不会被系统清理的永久文件。

Web 支持目前处于 **alpha**，可能不稳定。

## 原生构建配置

使用 Config Plugin 的示例：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-sqlite",
        {
          "enableFTS": true,
          "useSQLCipher": true,
          "android": {
            "enableFTS": false,
            "useSQLCipher": false
          },
          "ios": {
            "customBuildFlags": [
              "-DSQLITE_ENABLE_DBSTAT_VTAB=1 -DSQLITE_ENABLE_SNAPSHOT=1"
            ]
          }
        }
      ]
    ]
  }
}
```

公共配置可以被 `android` 或 `ios` 下的平台配置覆盖。

| 配置项 | 默认值 | 作用 |
| --- | ---: | --- |
| `customBuildFlags` | 无 | 向 SQLite 原生构建过程传递自定义编译标志 |
| `enableFTS` | `true` | 启用 FTS3、FTS4 和 FTS5 全文搜索扩展 |
| `useSQLCipher` | `false` | 使用支持加密和认证的 SQLCipher 替代默认 SQLite |
| `useLibSQL` | `false` | 使用 libSQL 替代默认 SQLite |
| `withSQLiteVecExtension` | `false` | 将 `sqlite-vec` 加入预捆绑扩展 |

这些配置不能在 JavaScript 运行期间动态切换。

## Web 平台额外配置

Web 版本依赖 Wasm 和 `SharedArrayBuffer`，需要完成两类配置：

1. 修改 `metro.config.js`，使 Metro 支持 Wasm 文件。
2. Web 服务器返回 COEP 和 COOP HTTP 响应头。

没有 `metro.config.js` 时可以生成：

```sh
npx expo customize metro.config.js
```

部署到 EAS Hosting 时，可以在 Expo Router 插件中设置响应头：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-router",
        {
          "headers": {
            "Cross-Origin-Embedder-Policy": "credentialless",
            "Cross-Origin-Opener-Policy": "same-origin"
          }
        }
      ]
    ]
  }
}
```

对 React Web 开发者来说，这意味着本地 JavaScript 代码能够运行，并不代表生产部署已经配置完成。托管平台还必须允许设置这些响应头。

原文档没有给出完整的 `metro.config.js` 内容，也没有列举所有托管平台的配置方式。

## 打开数据库与基本 CRUD

```ts
import * as SQLite from 'expo-sqlite';

const db = await SQLite.openDatabaseAsync('databaseName');
```

`databaseName` 是数据库文件名。还可以传入打开选项和数据库目录：

```ts
SQLite.openDatabaseAsync(databaseName, options?, directory?);
```

Web 不支持自定义 `directory` 参数。

### 初始化数据库

```ts
await db.execAsync(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS test (
    id INTEGER PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    intValue INTEGER
  );
`);
```

`execAsync()` 可以一次执行多条 SQL，适合建表、PRAGMA 或固定的批量语句。

它不会转义参数，因此不能把用户输入拼接进去：

```ts
// 不安全
await db.execAsync(`SELECT * FROM users WHERE name = '${userInput}'`);
```

### 写入数据

```ts
const result = await db.runAsync(
  'INSERT INTO test (value, intValue) VALUES (?, ?)',
  'aaa',
  100
);

console.log(result.lastInsertRowId);
console.log(result.changes);
```

绑定参数有三种形式：

```ts
// 可变参数
await db.runAsync(
  'UPDATE test SET intValue = ? WHERE value = ?',
  999,
  'aaa'
);

// 数组
await db.runAsync(
  'UPDATE test SET intValue = ? WHERE value = ?',
  [999, 'aaa']
);

// 命名参数
await db.runAsync(
  'DELETE FROM test WHERE value = $value',
  { $value: 'aaa' }
);
```

文档推荐命名参数使用 `$name`，因为 `$` 可以直接出现在 JavaScript 属性名中。

可绑定的值包括：

- `string`
- `number`
- `boolean`
- `null`
- 二进制值

### 查询数据

查询单行：

```ts
const row = await db.getFirstAsync<TestRow>(
  'SELECT * FROM test WHERE id = ?',
  id
);
```

一次加载全部结果：

```ts
const rows = await db.getAllAsync<TestRow>(
  'SELECT * FROM test LIMIT 100'
);
```

逐行遍历：

```ts
for await (const row of db.getEachAsync<TestRow>('SELECT * FROM test')) {
  console.log(row);
}
```

选择原则：

| API | 适用场景 |
| --- | --- |
| `runAsync()` | `INSERT`、`UPDATE`、`DELETE` |
| `getFirstAsync()` | 只需要一行 |
| `getAllAsync()` | 结果集较小，可以整体放入内存 |
| `getEachAsync()` | 结果集较大，希望逐行处理 |

`getEachAsync()` 返回异步迭代器，而不是普通 `Promise<Row[]>`。对于大量数据，它通常比 `getAllAsync()` 占用更少内存。

## Prepared Statement

Prepared Statement（预编译语句）会先编译 SQL，再使用不同参数重复执行。参数和 SQL 结构彼此分离，可以防御 SQL 注入。

```ts
const statement = await db.prepareAsync(
  'INSERT INTO test (value, intValue) VALUES ($value, $intValue)'
);

try {
  await statement.executeAsync({
    $value: 'bbb',
    $intValue: 101
  });

  await statement.executeAsync({
    $value: 'ccc',
    $intValue: 102
  });
} finally {
  await statement.finalizeAsync();
}
```

必须重点注意：

- 使用完后调用 `finalizeAsync()` 或 `finalizeSync()`。
- 推荐放在 `try...finally` 中，确保异常时也能释放资源。
- 已经 finalize 的语句不能再次访问。
- 数据库关闭时会处理遗留语句，但文档仍明确建议主动释放。

查询结果内部维护游标。同一结果先调用 `getFirstAsync()`，再调用 `getAllAsync()` 前必须重置：

```ts
const result = await statement.executeAsync<Row>();

const first = await result.getFirstAsync();

await result.resetAsync();
const all = await result.getAllAsync();

await result.resetAsync();
for await (const row of result) {
  console.log(row);
}
```

未重置游标便再次从头读取会抛出错误。

## Tagged Template API

`db.sql` 提供类似 Bun SQL 的标签模板 API。插值参数会通过预编译语句安全绑定，而不是直接拼接到 SQL 字符串中。

```ts
interface User {
  id: number;
  name: string;
  age: number;
}

const db = await SQLite.openDatabaseAsync('mydb.db');
const sql = db.sql;

const users =
  await sql<User>`SELECT * FROM users WHERE age > ${21}`;
```

常用结果形式：

```ts
// 所有行，返回对象数组
const users = await sql<User>`SELECT * FROM users`;

// 第一行，无匹配结果时返回 null
const user =
  await sql<User>`SELECT * FROM users WHERE id = ${1}`.first();

// 按列顺序返回二维数组
const values =
  await sql`SELECT name, age FROM users`.values();

// 逐行异步遍历
for await (const user of sql<User>`SELECT * FROM users`.each()) {
  console.log(user.name);
}
```

写操作返回 `SQLiteRunResult`：

```ts
const result =
  await sql`INSERT INTO users (name, age) VALUES (${'Alice'}, ${30})`
    as SQLite.SQLiteRunResult;

console.log(result.lastInsertRowId, result.changes);
```

这里的 TypeScript 泛型描述预期结果结构，但文档没有说明它会在运行时验证数据库返回值。将类型参数视为编译期约束更稳妥，此结论属于**基于文档内容推导**。

## 在 React 组件树中提供数据库

`SQLiteProvider` 类似 React Web 中的 Context Provider。其后代组件可以通过 `useSQLiteContext()` 获取同一数据库实例。

```tsx
<SQLiteProvider
  databaseName="test.db"
  onInit={migrateDbIfNeeded}
>
  <AppContent />
</SQLiteProvider>
```

```tsx
function AppContent() {
  const db = useSQLiteContext();
  // 使用 db 查询数据库
}
```

`useSQLiteContext()` 只能在 `SQLiteProvider` 内调用。

### Provider 关键属性

| 属性 | 作用 |
| --- | --- |
| `databaseName` | 要打开的数据库文件名 |
| `directory` | 数据库目录，默认使用 `defaultDatabaseDirectory` |
| `assetSource` | 从应用资源导入已有 `.db` 文件 |
| `onInit` | 子组件渲染前执行初始化或迁移 |
| `onError` | 处理 Provider 初始化错误 |
| `options` | 数据库打开选项 |
| `useSuspense` | 启用 React Suspense 集成 |

### 与 Suspense 集成

```tsx
<Suspense fallback={<Text>Loading...</Text>}>
  <SQLiteProvider
    databaseName="test.db"
    onInit={migrateDbIfNeeded}
    useSuspense
  >
    <AppContent />
  </SQLiteProvider>
</Suspense>
```

启用后，在数据库准备完成前显示 `fallback`，避免子组件过早访问尚未初始化的数据库。

## 数据库迁移

文档示例使用 SQLite 的 `PRAGMA user_version` 保存数据库结构版本：

```ts
async function migrateDbIfNeeded(db: SQLite.SQLiteDatabase) {
  const DATABASE_VERSION = 1;

  let { user_version: currentVersion } =
    await db.getFirstAsync<{ user_version: number }>(
      'PRAGMA user_version'
    );

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE todos (
        id INTEGER PRIMARY KEY NOT NULL,
        value TEXT NOT NULL,
        intValue INTEGER
      );
    `);

    currentVersion = 1;
  }

  await db.execAsync(
    `PRAGMA user_version = ${DATABASE_VERSION}`
  );
}
```

迁移流程是：

1. 读取当前数据库版本。
2. 如果已经达到目标版本，直接返回。
3. 按版本顺序执行建表或结构变更。
4. 成功后更新 `user_version`。

`onInit` 会在 Provider 渲染子组件前执行，因此适合放迁移逻辑。

**基于文档内容推导：** 正式项目不应只判断“是不是全新数据库”，还应为每个历史版本保留顺序迁移步骤，否则旧用户升级应用时可能无法得到最新表结构。

## 事务

### 普通异步事务

```ts
await db.withTransactionAsync(async () => {
  await db.runAsync(...);
  await db.runAsync(...);
});
```

回调成功时提交，抛出错误时回滚。

最容易踩坑的是：事务生效期间，通过同一个数据库连接执行的其他异步查询也可能进入该事务，即使其代码写在回调外部。

因此，`withTransactionAsync()` 不是 JavaScript 词法作用域隔离的事务。并发 Promise 可能改变事务中的数据或被一同回滚。

### 独占作用域事务

```ts
await db.withExclusiveTransactionAsync(async txn => {
  await txn.runAsync(...);
});
```

只有通过回调参数 `txn` 执行的查询属于该事务，作用域更加明确。

限制和风险：

- Web 不支持 `withExclusiveTransactionAsync()`。
- 当它转为写事务后，其他异步写入可能收到 `database is locked`。
- 事务内部必须使用 `txn`，而不是外层 `db`。

如果业务依赖严格的执行顺序，文档建议使用独占事务。

## PRAGMA 与 WAL

PRAGMA 用于读取或修改 SQLite 的运行设置：

```ts
await db.execAsync('PRAGMA journal_mode = WAL');
await db.execAsync('PRAGMA foreign_keys = ON');
```

文档建议在创建新数据库时启用 WAL（Write-Ahead Logging）日志模式，以改善一般情况下的性能。

`PRAGMA foreign_keys = ON` 用于启用外键约束。示例明确展示了该命令，但没有进一步讨论外键设计和迁移策略。

## 导入已有数据库

可以将 `.db` 文件作为应用资源打包，并由 `SQLiteProvider` 导入：

```tsx
<SQLiteProvider
  databaseName="test.db"
  assetSource={{
    assetId: require('./assets/test.db')
  }}
>
  <AppContent />
</SQLiteProvider>
```

`assetSource.forceOverwrite` 默认为 `false`。设为 `true` 时，即使本地数据库已经存在也会强制覆盖。

强制覆盖可能破坏用户已产生的数据，这是根据该配置语义得出的直接开发影响。

## 二进制数据

SQLite 的 `BLOB` 字段使用 `Uint8Array` 传入和读取：

```ts
const blob = new Uint8Array([
  0x00, 0x01, 0x02, 0x03
]);

await db.runAsync(
  'INSERT INTO blobs (data) VALUES (?)',
  blob
);

const row = await db.getFirstAsync<{ data: Uint8Array }>(
  'SELECT data FROM blobs'
);
```

这与 Web 中使用 TypedArray 处理二进制数据的方式相近。

## iOS App Group 数据库共享

如果 iOS 应用及其扩展属于同一个 App Group，可以将数据库放入共享容器。

先配置 entitlement：

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.myapp",
      "entitlements": {
        "com.apple.security.application-groups": [
          "group.com.myapp"
        ]
      }
    }
  }
}
```

再通过 `expo-file-system` 获取容器路径，并传给 Provider 的 `directory`：

```tsx
const dbDirectory = useMemo(() => {
  if (Platform.OS === 'ios') {
    return Paths.appleSharedContainers[
      'group.com.myapp'
    ]?.uri;
  }

  return defaultDatabaseDirectory;
}, []);
```

这是 iOS 原生能力，不等同于浏览器中多个标签页共享 `localStorage`。它需要正确的 bundle identifier、App Group 和 entitlement 配置。

## 键值存储与 localStorage 兼容层

### 替代 AsyncStorage

```ts
import Storage from 'expo-sqlite/kv-store';

await Storage.setItem(
  'key',
  JSON.stringify({ entity: 'value' })
);

const value = await Storage.getItem('key');
```

它与 `@react-native-async-storage/async-storage` 使用相同 API。如果项目已经使用 `expo-sqlite`，可以只替换导入：

```diff
- import AsyncStorage from '@react-native-async-storage/async-storage';
+ import AsyncStorage from 'expo-sqlite/kv-store';
```

它还提供同步方法：

```ts
Storage.setItemSync('key', 'value');
const value = Storage.getItemSync('key');
```

值仍以字符串为主，存储对象时需要自行 `JSON.stringify()` 和 `JSON.parse()`。

### 提供 globalThis.localStorage

```ts
import 'expo-sqlite/localStorage/install';

globalThis.localStorage.setItem('key', 'value');
```

这可以帮助 Web 与原生平台共享依赖 `localStorage` 的代码。

在 Web 上，这个导入不执行任何操作，并会从生产 JavaScript 包中排除，因为浏览器已经提供原生 `localStorage`。

## SQLCipher 数据库加密

SQLCipher 是增加了数据库加密和认证能力的 SQLite 分支。

限制：

- 只支持 Android、iOS 和 macOS。
- 不支持 Expo Go。
- 需要在 `app.json` 中启用 `useSQLCipher`。
- 修改配置后要运行 `npx expo prebuild` 并重新构建应用。

```json
{
  "expo": {
    "plugins": [
      [
        "expo-sqlite",
        {
          "useSQLCipher": true
        }
      ]
    ]
  }
}
```

打开数据库后立即设置密钥：

```ts
const db =
  await SQLite.openDatabaseAsync('databaseName');

await db.execAsync(`PRAGMA key = 'password'`);
```

示例直接写入固定密码只用于说明 API。原文档没有介绍密钥生成、密钥保存、轮换或用户凭据恢复策略。

**基于经验建议：** 不要把生产密钥硬编码在 JavaScript 源码中；完整的密钥管理方案需要结合安全存储和业务安全模型另行设计。

## 开发调试工具

开发环境中，`expo-sqlite` 会自动启用 DevTools 检查器，不需要额外配置。

打开方式：

1. 在 Expo CLI 终端按 `Shift + M`。
2. 选择 **Open expo-sqlite**。

检查器可以：

- 浏览表。
- 查看和编辑行。
- 执行 SQL。
- 导出数据库。

也可以安装 `drizzle-studio-expo`，从 Expo CLI 启动 Drizzle Studio。该插件适用于任意 `expo-sqlite` 配置，并不要求项目使用 Drizzle ORM。

## 第三方集成

文档列出两个上层工具：

- **Drizzle ORM**：TypeScript ORM，支持通过 `drizzle-kit` 生成 SQL 迁移。
- **Knex.js**：SQL 查询构建器，需要使用对应的 Expo SQLite dialect。

`expo-sqlite` 本身定位为底层 SQLite 基础设施。是否引入 ORM 或查询构建器，应根据数据模型复杂度、迁移需求和团队 SQL 熟悉程度决定。

## 高级能力

### 数据库变更监听

打开数据库时启用：

```ts
const db = await SQLite.openDatabaseAsync(
  'app.db',
  { enableChangeListener: true }
);
```

订阅变化：

```ts
const subscription =
  SQLite.addDatabaseChangeListener(event => {
    console.log(
      event.databaseName,
      event.databaseFilePath,
      event.tableName,
      event.rowId
    );
  });

subscription.remove();
```

如果未启用 `enableChangeListener`，监听功能不会工作。

### 序列化、反序列化与备份

数据库可以序列化为 `Uint8Array`：

```ts
const data = await db.serializeAsync();
```

也可以从二进制数据创建内存数据库：

```ts
const memoryDb =
  await SQLite.deserializeDatabaseAsync(data);
```

`backupDatabaseAsync()` 可以把一个数据库备份到另一个数据库。

### SQLite Session 与 Changeset

`SQLiteSession` 对应 SQLite Session Extension，可用于：

- 附加一个或全部表。
- 记录数据变更。
- 生成 `Changeset`。
- 应用或反转 `Changeset`。
- 临时启用或禁用 Session。

`Changeset` 的类型是 `Uint8Array`。

这是高级的数据变更记录与应用能力。原文档列出了底层 API，但没有给出完整的业务同步架构、冲突解决策略或端到端示例。

### 加载 SQLite 扩展

原生平台可以加载捆绑或自定义 SQLite 扩展：

```ts
const extension =
  SQLite.bundledExtensions['sqlite-vec'];

await db.loadExtensionAsync(
  extension.libPath,
  extension.entryPoint
);
```

要使用预捆绑的 `sqlite-vec`，必须先启用 `withSQLiteVecExtension`。

`loadExtensionAsync()` 和 `loadExtensionSync()` 不支持 Web。

### libSQL

启用 `useLibSQL` 后，可以配置远程 URL、认证令牌和 `remoteOnly`，并使用：

```ts
await db.syncLibSQL();
```

原文档仅给出接口和配置入口，没有展开同步模型、冲突处理或部署过程。

## 同步 API 的性能风险

大多数数据库能力同时提供 Async 和 Sync 版本，例如：

- `openDatabaseAsync()` / `openDatabaseSync()`
- `runAsync()` / `runSync()`
- `getAllAsync()` / `getAllSync()`
- `prepareAsync()` / `prepareSync()`
- `serializeAsync()` / `serializeSync()`

文档反复警告：繁重的同步数据库操作会阻塞 JavaScript 线程并影响性能。

这类似 React Web 在主线程执行大型同步计算：运行期间界面更新、输入响应和动画都可能停顿。

**基于经验建议：** UI 交互路径优先使用异步 API。只有操作规模明确很小，并且确实需要同步结果时，才考虑 Sync API。

## 安全要求

SQL 注入是本文最明确的安全风险。任何用户输入都必须作为绑定参数传递，不能拼入 SQL。

推荐：

```ts
await db.getFirstAsync(
  'SELECT * FROM users WHERE name = ?',
  userInput
);
```

或者：

```ts
await db.sql<User>`
  SELECT * FROM users WHERE name = ${userInput}
`;
```

不要这样做：

```ts
await db.execAsync(
  `SELECT * FROM users WHERE name = '${userInput}'`
);
```

Prepared Statement、`runAsync()` 等绑定参数 API以及标签模板 API都可以分离 SQL 结构和输入值。

## 重要限制与坑点

1. 当前页面是下一 Expo SDK 版本文档，不应直接假定所有 API 已存在于稳定 SDK 56。
2. Web 支持处于 alpha，需要 Wasm、Metro 配置及 COEP/COOP 响应头。
3. `execAsync()` 和 `execSync()`不会转义输入，拼接外部数据会产生 SQL 注入风险。
4. Prepared Statement 使用后应在 `finally` 中 finalize。
5. 查询结果游标读取过一次后，需要 reset 才能重新从头读取。
6. `withTransactionAsync()` 可能包含回调外同时运行的查询。
7. `withExclusiveTransactionAsync()` 不支持 Web，并可能让并发写操作得到 `database is locked`。
8. 同步 API 执行重任务会阻塞 JavaScript 线程。
9. SQLCipher 不支持 Expo Go，且需要原生预构建与重新编译。
10. Config Plugin 中的编译配置不能在运行时生效。
11. iOS App Group 共享依赖正确的原生 entitlement。
12. Apple TV 数据库位于缓存目录。
13. `assetSource.forceOverwrite` 可能覆盖用户已有数据库。
14. 变更监听必须在打开数据库时启用 `enableChangeListener`。
15. 自定义数据库目录参数在 Web 上不受支持。
16. SQLite 扩展加载和独占异步事务的 Web 支持受限。

## 实际项目中的推荐使用流程

以下流程属于**基于文档内容推导**：

1. 使用 `npx expo install expo-sqlite` 安装匹配当前 Expo SDK 的版本。
2. 判断是否需要 SQLCipher、FTS、libSQL 或 sqlite-vec；需要时先完成 Config Plugin 和原生构建配置。
3. 使用 `SQLiteProvider` 在组件树顶层统一管理数据库。
4. 在 `onInit` 中启用 WAL、创建表并按 `user_version` 执行迁移。
5. 常规写操作使用 `runAsync()`。
6. 小结果集使用 `getAllAsync()`，大结果集使用 `getEachAsync()`。
7. 所有动态值都通过绑定参数或 `db.sql` 插值传递。
8. 重复执行的 SQL 使用 Prepared Statement，并在 `finally` 中 finalize。
9. 多步骤写操作放入事务；需要严格隔离时评估独占事务的平台限制。
10. 在开发环境使用内置检查器验证表结构、迁移和实际数据。
11. 发布前分别验证原生和 Web 配置，尤其是 Web 响应头及所用高级能力的平台支持情况。

## 文档未涉及的内容

当前文档没有完整说明：

- 生产环境的数据库备份和恢复策略。
- 应用卸载后的数据保留策略。
- 多设备自动同步方案。
- libSQL 的完整同步与冲突解决流程。
- SQLCipher 密钥的生成、安全保存和轮换方案。
- 大规模数据库的性能基准。
- 数据库迁移失败后的恢复机制。
- iOS 与 Android 数据库文件的系统备份行为。
- 自动化测试数据库的推荐隔离方式。
- ORM 与原生 SQL 的具体选型标准。

这些问题需要结合应用需求及对应专项文档另行设计，不能从当前页面直接得出完整答案。

## 总结

`expo-sqlite` 不只是一个执行 SQL 的接口，还覆盖了数据库初始化、迁移、事务、Prepared Statement、React Context、键值存储、Web 兼容、数据库加密、扩展、变更监听和调试工具。

对 React Web 开发者而言，最重要的认知变化是：

- 数据库运行在设备本地，而不是后端服务器。
- 原生编译配置与 JavaScript 运行时配置是两个层次。
- 同步数据库操作会直接影响 JavaScript 线程和界面响应。
- 异步事务的边界不能仅通过代码缩进判断。
- SQL 参数必须绑定，Prepared Statement 必须释放。
- Web 虽然受支持，但当前仍是 alpha，并需要额外的构建及服务器配置。

---

## 文档导航

- **上一页**：[splash screen](./209__splash-screen.md)
- **下一页**：[status bar](./211__status-bar.md)
