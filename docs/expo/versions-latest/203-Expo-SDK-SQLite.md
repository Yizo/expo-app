# 203｜Expo SDK SQLite 本地关系型数据库

**翻页：**[上一页：Expo SDK SplashScreen 启动画面](./202-Expo-SDK-SplashScreen.md) · [目录](./README.md) · [下一页：Expo SDK StatusBar 状态栏](./204-Expo-SDK-StatusBar.md)


**官方页面：**[SQLite · Latest](https://docs.expo.dev/versions/latest/sdk/sqlite/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/sqlite/)

**版本与平台：**Latest 推荐 expo-sqlite ~57.0.3，SDK v56.0.0 推荐 ~56.0.6。支持 Android、iOS、macOS、tvOS、Web，包含在 Expo Go；Web 为 Alpha。Apple TV 数据库存放在 cache 而不是 documents 目录。

## SQLite 概念

SQLite 是嵌入 app 本地运行的关系型数据库，以表、行、列存结构化数据。与 Web 的 localStorage key/value 不同，SQLite 能用 SQL 筛选、更新多行、排序和执行事务。

- **CRUD：**Create / Read / Update / Delete，新增、读取、修改、删除。
- **主键：**唯一标识一行的字段，常见定义为 INTEGER PRIMARY KEY。
- **参数绑定：**外部输入作为 SQL 参数，不拼进查询文本，可防 SQL injection。
- **Prepared statement：**先准备 SQL 再绑定值执行；执行完需 finalize。
- **事务：**多条 SQL 一起 commit / rollback；普通 async transaction 期间其它 SQL 也可能被纳入。
- **PRAGMA / WAL：**PRAGMA 配置 SQLite；WAL 写前日志模式通常能改善读写并发。

## 安装与示例工程

```sh
npx expo install expo-sqlite
yarn expo install expo-sqlite
pnpm expo install expo-sqlite
bun expo install expo-sqlite
```

已有 React Native 工程需先集成 expo。官方 with-sqlite 示例项目：

```sh
npx create-expo-app --example with-sqlite
yarn create expo-app --example with-sqlite
pnpm create expo-app --example with-sqlite
bun create expo --example with-sqlite
```

## Config plugin 与扩展

CNG / config plugin 可启用 FTS、SQLCipher、libSQL、sqlite-vec 和自定义编译参数；原生 build 选项改动后需重新构建：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-sqlite",
        {
          "enableFTS": true,
          "useSQLCipher": true,
          "android": { "enableFTS": false, "useSQLCipher": false },
          "ios": {
            "customBuildFlags": ["-DSQLITE_ENABLE_DBSTAT_VTAB=1 -DSQLITE_ENABLE_SNAPSHOT=1"]
          }
        }
      ]
    ]
  }
}
```

| 属性 | 默认值 | 作用 |
| --- | --- | --- |
| enableFTS | true | 编译 FTS3 / FTS4 / FTS5 全文搜索扩展。 |
| useSQLCipher | false | 使用加密 SQLite 实现；Expo Go 不支持。 |
| useLibSQL | false | 使用 libSQL 实现并可配置远端。 |
| withSQLiteVecExtension | false | 将 sqlite-vec 向量扩展编入 bundledExtensions。 |
| customBuildFlags | 无 | 传给 SQLite build 的编译参数。 |

**版本差异：**Latest customBuildFlags 为 string[]；SDK v56 页的示例为 string。SDK v56 配置需用单字符串：

```json
{
  "expo": {
    "plugins": [
      ["expo-sqlite", {
        "ios": { "customBuildFlags": "-DSQLITE_ENABLE_DBSTAT_VTAB=1 -DSQLITE_ENABLE_SNAPSHOT=1" }
      }]
    ]
  }
}
```

## Web setup（Alpha）

Web SQLite 用 WebAssembly，Metro 必须支持 .wasm；部署时还需跨源隔离 headers 以允许 SharedArrayBuffer。若没有 metro.config.js，官方建议运行 npx expo customize metro.config.js。SQLite 页面提到 Metro setup，但没有嵌入完整 Metro config 代码。

自托管需加 COEP / COOP；EAS Hosting 可通过 Expo Router plugin 配置：

```json
{
  "expo": {
    "plugins": [
      ["expo-router", {
        "headers": {
          "Cross-Origin-Embedder-Policy": "credentialless",
          "Cross-Origin-Opener-Policy": "same-origin"
        }
      }]
    ]
  }
}
```

## Basic CRUD

openDatabaseAsync 打开或新建数据库。execAsync 适合固定的批量 SQL（建表 / PRAGMA），但不会绑定或转义参数；含用户输入的语句用 runAsync 或 prepared statement：

```ts
import * as SQLite from 'expo-sqlite';

const db = await SQLite.openDatabaseAsync('app.db');
await db.execAsync(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0
  );
`);

const inserted = await db.runAsync('INSERT INTO todos (title, completed) VALUES (?, ?)', '买菜', 0);
console.log(inserted.lastInsertRowId, inserted.changes);
await db.runAsync('UPDATE todos SET completed = ? WHERE id = ?', 1, inserted.lastInsertRowId);
await db.runAsync('DELETE FROM todos WHERE id = $id', { $id: inserted.lastInsertRowId });

const first = await db.getFirstAsync('SELECT * FROM todos WHERE id = ?', inserted.lastInsertRowId);
const smallList = await db.getAllAsync('SELECT * FROM todos ORDER BY id DESC LIMIT 100');
for await (const row of db.getEachAsync('SELECT * FROM todos')) console.log(row);
console.log(first, smallList);
```

getAllAsync 一次把整个结果集放入数组，适合小结果 / LIMIT；大结果用 getEachAsync 逐行遍历节省内存。

## Prepared statements 与绑定参数

Prepared statement 可准备一次并重复执行，参数数组、variadic 参数、named object 均支持。用 try/finally 确保 finalizeAsync 被调用：

```ts
const insert = await db.prepareAsync(
  'INSERT INTO todos (title, completed) VALUES ($title, $completed)',
);
try {
  for (const [title, completed] of [['写文档', 0], ['散步', 1]] as const) {
    const result = await insert.executeAsync({ $title: title, $completed: completed });
    console.log(result.lastInsertRowId, result.changes);
  }
} finally {
  await insert.finalizeAsync();
}

const select = await db.prepareAsync('SELECT * FROM todos WHERE title = ? AND completed = ?');
try {
  const arrayResult = await select.executeAsync(['买菜', 0]);
  const firstByArray = await arrayResult.getFirstAsync();

  await select.resetAsync();
  const positionalResult = await select.executeAsync('买菜', 0);
  const firstByArgs = await positionalResult.getFirstAsync();
  console.log(firstByArray, firstByArgs);
} finally {
  await select.finalizeAsync();
}

const named = await db.prepareAsync('SELECT * FROM todos WHERE title = $title AND completed = $completed');
try {
  const result = await named.executeAsync({ $title: '买菜', $completed: 0 });
  console.log(await result.getFirstAsync());
} finally {
  await named.finalizeAsync();
}
```

命名参数支持 :name、@name 和 $name；Expo 推荐 JS 里用 $name。

## Tagged template SQL

db.sql 是 Bun 风格 tagged template。插入值会自动作为绑定参数；泛型可标注返回 row 类型。查询可 await 取对象数组，也可 first、values、each 或使用同步版本：

```ts
interface User { id: number; name: string; age: number }
const sql = db.sql;

const users = await sql<User>`SELECT * FROM users WHERE age > ${21}`;
const first = await sql<User>`SELECT * FROM users WHERE id = ${1}`.first();
const values = await sql`SELECT name, age FROM users`.values();
const result = await sql`INSERT INTO users (name, age) VALUES (${'Ada'}, ${30})` as SQLite.SQLiteRunResult;
console.log(result.lastInsertRowId, result.changes);
for await (const user of sql<User>`SELECT * FROM users`.each()) console.log(user.name);

const syncAll = sql<User>`SELECT * FROM users WHERE age > ${21}`.allSync();
const syncFirst = sql<User>`SELECT * FROM users WHERE id = ${1}`.firstSync();
const syncValues = sql`SELECT name, age FROM users`.valuesSync();
for (const user of sql<User>`SELECT * FROM users`.eachSync()) console.log(user.name);
```

同步查询可能阻塞 JS 线程。绑定参数用于值，不是动态表名 / 列名。

## SQLiteProvider、Context 与 migrations

SQLiteProvider 在 React tree 上层开库并提供 context；useSQLiteContext 只能在它的子树中调用。onInit 会在 children render 前执行，适合按 user_version 运行 schema migration：

```tsx
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';

export default function App() {
  return (
    <SQLiteProvider databaseName="todo.db" onInit={migrateDbIfNeeded}>
      <Header />
      <Content />
    </SQLiteProvider>
  );
}
function Header() {
  const db = useSQLiteContext();
  const [version, setVersion] = useState('');
  useEffect(() => {
    void db.getFirstAsync<{ version: string }>('SELECT sqlite_version() AS version')
      .then(row => setVersion(row?.version ?? ''));
  }, [db]);
  return <Text>SQLite version: {version}</Text>;
}
interface Todo { id: number; value: string; intValue: number }
function Content() {
  const db = useSQLiteContext();
  const [todos, setTodos] = useState<Todo[]>([]);
  useEffect(() => {
    void db.getAllAsync<Todo>('SELECT * FROM todos').then(setTodos);
  }, [db]);
  return <View>{todos.map(todo => <Text key={todo.id}>{todo.intValue} — {todo.value}</Text>)}</View>;
}
async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const targetVersion = 1;
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let current = result?.user_version ?? 0;
  if (current >= targetVersion) return;
  if (current === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      CREATE TABLE todos (id INTEGER PRIMARY KEY NOT NULL, value TEXT NOT NULL, intValue INTEGER);
    `);
    await db.runAsync('INSERT INTO todos (value, intValue) VALUES (?, ?)', 'hello', 1);
    await db.runAsync('INSERT INTO todos (value, intValue) VALUES (?, ?)', 'world', 2);
    current = 1;
  }
  await db.execAsync('PRAGMA user_version = ' + targetVersion);
}
```

常见 Provider props 有 databaseName、directory、assetSource、options、onInit、onError、useSuspense、children；onInit 可异步迁移，onError 默认重抛错。

### React Suspense

`useSuspense` 启用后，可在 DB ready 前用 Suspense fallback：

```tsx
import { Suspense } from 'react';
import { Text } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';

<Suspense fallback={<Text>Loading...</Text>}>
  <SQLiteProvider databaseName="todo.db" onInit={migrateDbIfNeeded} useSuspense>
    <Content />
  </SQLiteProvider>
</Suspense>
```

## Transactions 与 PRAGMA

Async transaction 会自动提交 / rollback，但普通 withTransactionAsync 不 exclusive；事务活跃期间的其它 async SQL 也可能进入事务，改变读取顺序：

```ts
await Promise.all([
  db.withTransactionAsync(async () => {
    await db.execAsync('INSERT INTO test (data) VALUES (?)', 'first');
    await sleep(2000);
    const row = await db.getFirstAsync<{ data: string }>('SELECT data FROM test');
    // 并发 UPDATE 可能令此处读到 second，原断言失败并 rollback。
    console.log(row?.data);
  }),
  sleep(1000).then(() => db.runAsync(
    'UPDATE test SET data = ? WHERE data = ?', 'second', 'first',
  )),
]);
```

隔离写操作使用 withExclusiveTransactionAsync 并通过 txn 执行 SQL；Web 不支持：

```ts
await db.withExclusiveTransactionAsync(async txn => {
  await txn.execAsync('UPDATE test SET name = "aaa"');
});
```

WAL / foreign keys PRAGMA：

```ts
await db.execAsync('PRAGMA journal_mode = WAL');
await db.execAsync('PRAGMA foreign_keys = ON');
```

withTransactionSync 等同步长任务会阻塞 JS 线程。

## 预建数据库、iOS App Group、BLOB

### 从 asset 导入现成 .db

assetSource 导入 bundled db，assetId 是 require() 返回的资源 ID：

```tsx
<SQLiteProvider databaseName="seed.db" assetSource={{ assetId: require('./assets/seed.db') }}>
  <DatabaseScreen />
</SQLiteProvider>
```

### iOS App Group 共享数据库

app / extension 共用 db 时需在 iOS entitlement 配 App Group，再用 expo-file-system Paths.appleSharedContainers 设 provider directory：

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.example.app",
      "entitlements": {
        "com.apple.security.application-groups": ["group.com.example.app"]
      }
    }
  }
}
```

```tsx
import { useMemo } from 'react';
import { Platform } from 'react-native';
import { Paths } from 'expo-file-system';
import { SQLiteProvider, defaultDatabaseDirectory } from 'expo-sqlite';

export function App() {
  const directory = useMemo(() => Platform.OS === 'ios'
    ? Paths.appleSharedContainers['group.com.example.app']?.uri
    : defaultDatabaseDirectory, []);
  return <SQLiteProvider databaseName="shared.db" directory={directory}><DatabaseScreen /></SQLiteProvider>;
}
```

### 二进制 BLOB

SQLite BLOB 用 Uint8Array 绑定：

```ts
await db.execAsync('CREATE TABLE IF NOT EXISTS blobs (id INTEGER PRIMARY KEY, data BLOB)');
const bytes = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
await db.runAsync('INSERT INTO blobs (data) VALUES (?)', bytes);
const row = await db.getFirstAsync<{ data: Uint8Array }>('SELECT data FROM blobs');
console.log(row?.data);
```

## Inspector、KV Store 与 localStorage

开发时内置 SQLite inspector。Expo CLI terminal 按 Shift+M 打开 dev tools，选择 Open expo-sqlite 可浏览 / 编辑表行、执行 SQL、导出数据库；Drizzle Studio Expo plugin 是另一种可选工具。

`expo-sqlite/kv-store` 是 SQLite-backed AsyncStorage 风格 KV store，值为字符串，复杂对象用 JSON 序列化：

```ts
import Storage from 'expo-sqlite/kv-store';

await Storage.setItem('profile', JSON.stringify({ name: 'Ada' }));
const raw = await Storage.getItem('profile');
const profile = raw === null ? null : JSON.parse(raw);

Storage.setItemSync('theme', 'dark');
const theme = Storage.getItemSync('theme');
console.log(profile, theme);
```

替换 AsyncStorage import：

```ts
// 原模块：@react-native-async-storage/async-storage
import AsyncStorage from 'expo-sqlite/kv-store';
```

`expo-sqlite/localStorage/install` 在原生安装 globalThis.localStorage；Web 是 no-op，且生产打包会移除该 import：

```ts
import 'expo-sqlite/localStorage/install';

globalThis.localStorage.setItem('theme', 'dark');
console.log(globalThis.localStorage.getItem('theme'));
```

## SQLCipher 与加载 extension

SQLCipher 支持 Android / iOS / macOS，不支持 Expo Go。启用插件 useSQLCipher 并执行 npx expo prebuild；开库后立刻用 PRAGMA key 设密码：

```ts
const encryptedDb = await SQLite.openDatabaseAsync('private.db');
await encryptedDb.execAsync(`PRAGMA key = 'replace-with-database-key'`);
```

enable sqlite-vec 后可从 bundledExtensions 获取 library / entry point。也可加载自定义扩展：

```ts
const extension = SQLite.bundledExtensions['sqlite-vec'];
await db.loadExtensionAsync(extension.libPath, extension.entryPoint);
await db.loadExtensionAsync('/path/to/custom-extension');

db.loadExtensionSync(extension.libPath, extension.entryPoint);
db.loadExtensionSync('/path/to/custom-extension');
```

## API Cheatsheet 与核心类型

### Database / Statement

| 用途 | SQLiteDatabase shortcut | SQLiteStatement |
| --- | --- | --- |
| 写入 | runAsync / runSync → SQLiteRunResult | prepare → execute → finalize |
| 读首行 | getFirstAsync / getFirstSync，没结果为 null | execute 后 getFirst |
| 取全部 | getAllAsync / getAllSync；小结果 / LIMIT | execute 后 getAll |
| 大结果迭代 | getEachAsync / getEachSync | Async result / Sync result iterator |
| 多条固定 SQL | execAsync / execSync；不会绑定参数 | — |
| 事务 | withTransactionAsync / withExclusiveTransactionAsync / withTransactionSync | exclusive callback 用 txn 连接 |
| 开关库 | openDatabaseAsync / Sync、closeAsync / Sync | prepareAsync / Sync、finalizeAsync / Sync |
| 文件与 session | serialize / deserialize / backup / delete / createSession | session 处理 changeset |

### 查询、参数、事件类型

| 类型 / API | 核心定义 |
| --- | --- |
| SQLiteProviderProps | databaseName、directory、assetSource、options、onInit、onError、useSuspense、children |
| SQLiteOpenOptions | enableChangeListener 默认 false；libSQLOptions { authToken, remoteOnly, url }；useNewConnection 默认 false |
| SQLiteRunResult | changes 与 lastInsertRowId 数字。 |
| SQLiteExecuteAsyncResult<T> | AsyncIterableIterator<T>；含 first/all/reset 方法。 |
| SQLiteExecuteSyncResult<T> | IterableIterator<T>；同步长操作阻塞 JS。 |
| SQLiteBindParams / BindValue | 命名对象或数组 / variadic；值为 string / number / null / boolean / BLOB。 |
| DatabaseChangeEvent | databaseFilePath、databaseName、rowId、tableName；须 enableChangeListener。 |
| Changeset | Uint8Array。 |
| SQLiteStorageSetItemUpdateFunction | (prevValue: string | null) => string。 |
| SQLiteTaggedQuery<T> | PromiseLike；await 默认对象数组，另有 first / values / each / 同步变体。 |
| SQLiteStorage | AsyncStorage 风格 CRUD / multi-key / key enumeration，含 async / sync。 |
| SQLiteSession | attach / close session，创建、应用、反转 changeset。 |

### 导出组件与常量

| 导出 | 作用 |
| --- | --- |
| `SQLite.AsyncStorage` | SQLiteStorage 默认实例，可作为 AsyncStorage 的替代品。 |
| `SQLite.Storage` | 与 `SQLite.AsyncStorage` 相同的存储实例别名。 |
| `SQLite.bundledExtensions` | 内置扩展注册表；包含构建时打包的 SQLite 扩展。 |
| `SQLite.defaultDatabaseDirectory` | 默认数据库目录。 |
| `SQLite.SQLiteProvider` | React Context provider；子组件能通过 `useSQLiteContext()` 取得数据库。 |

### `SQLiteDatabase` / `SQLiteStatement` 方法索引

| 类别 | 方法 |
| --- | --- |
| 数据库连接 / 属性 | `databasePath`、`nativeDatabase`、`options`、`closeAsync()` / `closeSync()`。 |
| SQL 与结果 | `execAsync()` / `execSync()`、`runAsync()` / `runSync()`、`getFirstAsync()` / `getFirstSync()`、`getAllAsync()` / `getAllSync()`、`getEachAsync()` / `getEachSync()`。 |
| Prepared statement | `prepareAsync()` / `prepareSync()`；statement 用 `executeAsync()` / `executeSync()`、`getColumnNamesAsync()` / `getColumnNamesSync()`、`finalizeAsync()` / `finalizeSync()`。 |
| 事务 / 扩展 | `withTransactionAsync()`、`withExclusiveTransactionAsync()`、`withTransactionSync()`、`isInTransactionAsync()` / `isInTransactionSync()`、`loadExtensionAsync()` / `loadExtensionSync()`。 |
| 导入导出 / 扩展服务 | `serializeAsync()` / `serializeSync()`、`syncLibSQL()`；创建 / 使用 session 见下表。 |
| Tagged SQL | `db.sql` 模板查询可直接 `await`；还有 `first()`、`values()`、`each()` 和同步版本。 |

重查询、同步 SQL 和其它长时间同步任务会阻塞 JavaScript 线程；优先用 async APIs。

### `SQLiteSession` 方法

`SQLiteSession` 支持 SQLite session / changeset 扩展。数据库先 `createSessionAsync()` 或 `createSessionSync()` 建立会话，再对需要跟踪的表调用 `attachAsync()` / `attachSync()`；可以生成、反转、启用 / 禁用和应用 changeset，结束后关闭 session。

| 异步方法 | 对应同步方法 | 作用 |
| --- | --- | --- |
| `applyChangesetAsync(changeset)` | `applyChangesetSync(changeset)` | 把 changeset 应用到数据库。 |
| `attachAsync(table)` | `attachSync(table)` | 记录某个表的变更；`null` 可表示全部表。 |
| `closeAsync()` | `closeSync()` | 释放 session。 |
| `createChangesetAsync()` | `createChangesetSync()` | 导出自 session 开始后的变更集。 |
| `createInvertedChangesetAsync()` | `createInvertedChangesetSync()` | 生成变更集的反向版本。 |
| `invertChangesetAsync(changeset)` | `invertChangesetSync(changeset)` | 将传入 changeset 反转。 |
| `enableAsync(enabled)` | `enableSync(enabled)` | 开启或暂停 session 变更跟踪。 |

同步 session API 的重操作会阻塞 JS 线程。

### 存储、结果与扩展方法

| 对象 / 方法组 | 方法要点 |
| --- | --- |
| `SQLite` 数据库工具 | `backupDatabaseAsync()` / `backupDatabaseSync()` 在两个数据库间备份；`deleteDatabaseAsync()` / `deleteDatabaseSync()` 删除数据库；`openDatabaseAsync()` / `openDatabaseSync()` 打开数据库；`deserializeDatabaseAsync()` / `deserializeDatabaseSync()` 从 `Uint8Array` 恢复内存数据库；`deepEqual()` 比较值。 |
| 数据库变更监听 | `SQLite.addDatabaseChangeListener(listener)` 订阅表数据变更；须在打开数据库时将 `enableChangeListener: true`，可调用订阅对象的 `remove()` 清理。 |
| `SQLiteOpenOptions` | `enableChangeListener` 默认 `false`；`libSQLOptions` 配置 libSQL；`useNewConnection` 默认 `false`。 |
| `SQLiteProviderAssetSource` | `assetId` 为 `require()` 的资源 ID；`forceOverwrite` 默认 `false`，可强制覆盖目标数据库文件。 |
| `SQLiteExecuteAsyncResult` / `SQLiteExecuteSyncResult` | statement 执行结果含 `lastInsertRowId`、`changes`，并可读取首行 / 全部行或重置 cursor。 |
| `SQLiteDatabase` properties | 只读 `databasePath`、`nativeDatabase`、`options`。 |
| `SQLiteStorage` | `clear*()`、`close*()`、`getAllKeys*()`、`getItem*()`、`getKeyByIndex*()`、`getLength*()`、`mergeItem()`、`multiGet()`、`multiMerge()`、`multiRemove()`、`multiSet()`、`removeItem*()`、`setItem*()`；`*` 表示页面所列 async / sync 变体。 |
| `SQLiteTaggedQuery` | 结果对象 / awaitable 查询提供 `allSync()`、`first()` / `firstSync()`、`values()` / `valuesSync()`、`each()` / `eachSync()`。 |

## API 参考中的查询示例

下面补充官方 API reference 在方法 / 返回类型章节中的具体用法。这些短示例和前面的完整教程展示的是同一批 API，但 API 页面会再次单独展示它们，便于按方法名查阅。

### `useSQLiteContext()` 的最小用法

```tsx
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { View } from 'react-native';

export default function App() {
  return (
    <SQLiteProvider databaseName="test.db">
      <Main />
    </SQLiteProvider>
  );
}

export function Main() {
  const db = useSQLiteContext();
  console.log('sqlite version', db.getFirstSync('SELECT sqlite_version()'));
  return <View />;
}
```

### `getAllAsync()` 参数绑定写法

查询方法接收参数数组、位置参数（variadic）或命名参数对象。值应该用绑定参数传入，不要拼到 SQL 字符串中：

```ts
// 未命名参数：作为数组传入。
db.getAllAsync('SELECT * FROM test WHERE intValue = ? AND name = ?', [1, 'Hello']);

// 未命名参数：作为多个位置参数传入。
db.getAllAsync('SELECT * FROM test WHERE intValue = ? AND name = ?', 1, 'Hello');

// 命名参数：用对象绑定。
db.getAllAsync('SELECT * FROM test WHERE intValue = $intValue AND name = $name', {
  $intValue: 1,
  $name: 'Hello',
});
```

### Tagged SQL 返回格式

官方 `SQLiteTaggedQuery` 示例演示对象数组、首行、values、写入元信息、逐行迭代和同步调用。值插值会转换成绑定参数：

```ts
import * as SQLite from 'expo-sqlite';

const db = await SQLite.openDatabaseAsync('mydb.db');
const sql = db.sql;
interface User { id: number; name: string; age: number }
const userId = 1;

// 默认 await 查询会返回对象数组。
const users = await sql`SELECT * FROM users WHERE age > ${21}`;

// 只读取第一行。
const user = await sql`SELECT * FROM users WHERE id = ${userId}`.first();

// 读取二维数组，每行按列顺序返回。
const rows = await sql`SELECT name, age FROM users`.values();
// 例如：[['Ada', 30], ['Lin', 25]]

// INSERT / UPDATE / DELETE 返回 SQLiteRunResult。
const result = await sql`INSERT INTO users (name) VALUES (${'Ada'})` as SQLite.SQLiteRunResult;
console.log(result.lastInsertRowId, result.changes);

// each() 返回异步迭代器。
for await (const user of sql<User>`SELECT * FROM users`.each()) {
  console.log(user.name);
}

// 同步 API；长查询会阻塞 JavaScript 线程。
const usersSync = sql<User>`SELECT * FROM users WHERE age > ${21}`.allSync();
const userSync = sql<User>`SELECT * FROM users WHERE id = ${userId}`.firstSync();
const rowsSync = sql`SELECT name, age FROM users`.valuesSync();
for (const row of sql<User>`SELECT * FROM users`.eachSync()) console.log(row.name);
```

### `SQLiteExecuteAsyncResult` 示例

异步执行结果含有变更行数 / 最近插入行 ID，也可以作异步迭代器。`RETURNING` 可把写操作的返回列一起读出：

```ts
const statement = await db.prepareAsync('INSERT INTO test (value) VALUES (?)');
try {
  const result = await statement.executeAsync(101);
  console.log('lastInsertRowId:', result.lastInsertRowId);
  console.log('changes:', result.changes);
} finally {
  await statement.finalizeAsync();
}
```

```ts
const statement = await db.prepareAsync('SELECT value FROM test WHERE value > ?');
try {
  const result = await statement.executeAsync<{ value: number }>(100);
  for await (const row of result) {
    console.log('row value:', row.value);
  }
} finally {
  await statement.finalizeAsync();
}
```

```ts
const statement = await db.prepareAsync(
  'INSERT INTO test (name, value) VALUES (?, ?) RETURNING name'
);
try {
  const result = await statement.executeAsync<{ name: string }>('John Doe', 101);
  console.log('lastInsertRowId:', result.lastInsertRowId);
  console.log('changes:', result.changes);
  for await (const row of result) {
    console.log('name:', row.name);
  }
} finally {
  await statement.finalizeAsync();
}
```

### `SQLiteExecuteSyncResult` 示例

同步 statement 使用相同结果字段和迭代方式；可能耗时的同步操作会阻塞 JavaScript 线程：

```ts
const statement = db.prepareSync('INSERT INTO test (value) VALUES (?)');
try {
  const result = statement.executeSync(101);
  console.log('lastInsertRowId:', result.lastInsertRowId);
  console.log('changes:', result.changes);
} finally {
  statement.finalizeSync();
}
```

```ts
const statement = db.prepareSync('SELECT value FROM test WHERE value > ?');
try {
  const result = statement.executeSync<{ value: number }>(100);
  for (const row of result) {
    console.log('row value:', row.value);
  }
} finally {
  statement.finalizeSync();
}
```

```ts
const statement = db.prepareSync('INSERT INTO test (name, value) VALUES (?, ?) RETURNING name');
try {
  const result = statement.executeSync<{ name: string }>('John Doe', 101);
  console.log('lastInsertRowId:', result.lastInsertRowId);
  console.log('changes:', result.changes);
  for (const row of result) {
    console.log('name:', row.name);
  }
} finally {
  statement.finalizeSync();
}
```

### `SQLiteBindValue` 的 statement 参数形式

Prepared statement 支持将位置参数放在单个数组、单独传入多个位置参数，或将命名参数放在对象。命名形式可写成 `:name`、`@name` 或 `$name`；Expo 建议用 `$name`：

```ts
const statement = await db.prepareAsync('SELECT * FROM test WHERE value = ? AND intValue = ?');
const result = await statement.executeAsync(['test1', 789]);
const firstRow = await result.getFirstAsync();
```

```ts
const statement = await db.prepareAsync('SELECT * FROM test WHERE value = ? AND intValue = ?');
const result = await statement.executeAsync('test1', 789);
const firstRow = await result.getFirstAsync();
```

```ts
const statement = await db.prepareAsync(
  'SELECT * FROM test WHERE value = $value AND intValue = $intValue'
);
const result = await statement.executeAsync({ $value: 'test1', $intValue: 789 });
const firstRow = await result.getFirstAsync();
```

可绑定的值类型为 `string`、`number`、`null`、`boolean` 或 `SQLiteBindBlobValue`（二进制数据）。

## Latest 与 SDK v56.0.0 对照

| 项目 | Latest | SDK v56.0.0 |
| --- | --- | --- |
| 推荐包 | expo-sqlite ~57.0.3 | ~56.0.6 |
| customBuildFlags | string[] | string |
| CRUD、prepared、tagged SQL、Provider、transactions、BLOB、KV / localStorage、SQLCipher | 主 API 一致 | 主 API 一致 |
| Web setup 与官方 Next | 相同；Next StatusBar | 相同；Next StatusBar |

SDK v56 app 的 customBuildFlags 用单字符串，不要照抄 Latest 数组。其余 API 按当前锁定版本类型声明使用。

## 官方源页代码主题覆盖

- 安装与 with-sqlite quickstart、config plugin / v56 customBuildFlags、EAS Hosting COEP / COOP headers。
- Usage 全部主题：CRUD、prepared / 参数形式、tagged SQL、Context + migration、Suspense、transaction race / exclusive、PRAGMA、asset DB、iOS App Group、BLOB、inspector、KV / AsyncStorage import、localStorage、SQLCipher。
- API 示例：绑定数组 / variadic / named、load extensions Async / Sync、tagged query first / values / each / Sync、Provider assetSource / Suspense、query result metadata / iterators / RETURNING。
- API 类型列出 Database、Statement、Provider、Storage、Session、TaggedQuery、Result、OpenOptions、Bind、Changeset；Metro Web config 页面只有文字说明，无代码块。

**翻页：**[上一页：Expo SDK SplashScreen 启动画面](./202-Expo-SDK-SplashScreen.md) · [目录](./README.md) · [下一页：Expo SDK StatusBar 状态栏](./204-Expo-SDK-StatusBar.md)
