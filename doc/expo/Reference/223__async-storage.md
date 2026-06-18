# @react-native-async-storage/async-storage

## 文档解决的问题

在 React Native / Expo 移动端应用中，不像 Web 端有 `localStorage` 或 `sessionStorage` 可以直接使用。移动端需要一种专门的本地持久化存储方案来保存应用数据（如用户偏好设置、登录令牌、缓存数据等）。

`@react-native-async-storage/async-storage` 就是为此提供的解决方案。它是一个**异步的、未加密的、持久化的键值对存储系统**，可以在 Android、iOS、macOS、tvOS、Web 平台上使用，并且已内置在 Expo Go 中。

> **与 Web 端的对应关系**：如果你在 React Web 项目中使用过 `localStorage`，那么 AsyncStorage 就是它在 React Native 世界中最接近的等价物。但两者有一个关键区别——AsyncStorage 的所有操作都是**异步**的（返回 Promise），而 Web 端的 `localStorage` 是同步的。

## 阅读前需要理解的背景知识

### 什么是键值对存储（Key-Value Storage）

键值对存储是最简单的数据持久化方式：你给每条数据一个唯一的"键"（key，字符串），然后存储对应的"值"（value，也是字符串）。读取时通过键来取回值。

在 Web 端，`localStorage` 就是典型的键值对存储：

```js
// Web 端 localStorage（同步操作）
localStorage.setItem('username', 'Alice');
const name = localStorage.getItem('username'); // 'Alice'
```

AsyncStorage 的用法与之非常相似，只是所有操作都是异步的：

```js
// React Native 端 AsyncStorage（异步操作）
await AsyncStorage.setItem('username', 'Alice');
const name = await AsyncStorage.getItem('username'); // 'Alice'
```

### 为什么 AsyncStorage 是异步的

在 Web 浏览器中，`localStorage` 运行在主线程上，操作是同步阻塞的。但在移动设备上，存储操作涉及原生文件系统 I/O（读写磁盘），如果同步执行会阻塞 UI 线程，导致界面卡顿。因此 AsyncStorage 将所有操作设计为异步，通过 Promise 返回结果，不会阻塞 UI 渲染。

> **对 React Web 开发者的影响**：这意味着你不能像 Web 端那样直接 `const value = localStorage.getItem(key)` 获取值，而是必须使用 `await` 或 `.then()` 来处理异步结果。在组件中读取存储数据通常需要配合 `useEffect` 和 `useState`。

### 什么是"未加密"存储

文档明确指出 AsyncStorage 是 **unencrypted**（未加密的）。这意味着存储的数据以明文形式保存在设备上。任何能够访问设备文件系统的人或应用（在有 root/jailbreak 权限的情况下）理论上都可以读取这些数据。

**开发影响**：不应使用 AsyncStorage 存储敏感信息，如密码、信用卡号、身份证号等。对于敏感数据，应使用更安全的存储方案（如 `expo-secure-store`）。

### 什么是"持久化"存储

"持久化"（persistent）意味着数据写入后会保存在设备的本地存储中，即使应用关闭、设备重启，数据依然存在。只有显式删除数据或卸载应用时，数据才会消失。

这与内存中的变量不同——变量在应用关闭后就丢失了，而 AsyncStorage 中的数据会一直保留。

## 安装

### 安装命令

文档提供了使用 Expo CLI 的安装方式，支持四种包管理器：

```bash
# 使用 npm
npx expo install @react-native-async-storage/async-storage

# 使用 yarn
yarn expo install @react-native-async-storage/async-storage

# 使用 pnpm
pnpm expo install @react-native-async-storage/async-storage

# 使用 bun
bun expo install @react-native-async-storage/async-storage
```

**命令解释**：

- `expo install` 是 Expo CLI 提供的安装命令，它不同于直接运行 `npm install`。`expo install` 会自动选择与当前 Expo SDK 版本兼容的包版本，避免版本冲突问题。
- 在 React Web 项目中，我们通常直接用 `npm install` 安装包。但在 Expo 项目中，推荐始终使用 `expo install`，因为 Expo 对第三方原生模块有版本兼容性要求，直接使用 `npm install` 可能安装到不兼容的版本，导致构建失败或运行时崩溃。

### 在已有的 React Native 项目中集成

文档特别提到：如果你是在一个**已有的原生 React Native 项目**中集成此库，需要先确保项目中已安装 `expo` 包（即完成 Expo Modules 的集成），然后再参照 `@react-native-async-storage/async-storage` 库的官方 README 中的安装说明进行配置。

> **背景解释**：Expo 项目分为两种模式——"托管工作流"（Managed Workflow，完全由 Expo 管理原生层）和"裸工作流"（Bare Workflow，开发者自己管理原生代码）。如果你从一个纯 React Native CLI 创建的项目开始，需要先把 Expo 集成进去，才能使用 `expo install` 安装的包。

### Expo Go 内置支持

文档指出 AsyncStorage 已内置在 **Expo Go** 中。Expo Go 是 Expo 提供的开发客户端，允许开发者无需编译原生代码即可运行 Expo 项目。这意味着如果你使用 Expo Go 进行开发，安装后即可直接使用 AsyncStorage，无需额外的原生配置。

## 支持平台

该库支持以下平台：

| 平台 | 支持状态 |
|------|---------|
| Android | 支持 |
| iOS | 支持 |
| macOS | 支持 |
| tvOS | 支持 |
| Web | 支持 |
| Expo Go | 内置 |

**对开发者的意义**：这意味着你可以编写一套存储逻辑代码，在移动端（Android/iOS）、桌面端（macOS）、电视端（tvOS）以及浏览器端（Web）都能运行，无需为每个平台编写不同的存储实现。这对于使用 Expo for Web 构建跨平台应用的开发者来说尤其方便。

## 核心概念总结

### AsyncStorage 的四个关键特征

| 特征 | 含义 | 开发影响 |
|------|------|---------|
| **异步（Asynchronous）** | 所有读写操作返回 Promise | 必须使用 `await` 或 `.then()` 处理结果 |
| **未加密（Unencrypted）** | 数据以明文存储 | 不要存储敏感信息（密码、令牌等） |
| **持久化（Persistent）** | 数据写入后永久保存 | 适合存储需要长期保留的用户数据 |
| **键值对（Key-Value）** | 通过字符串键存取字符串值 | 存储对象时需要 `JSON.stringify()` 序列化 |

### 与 Web localStorage 的对比

| 特性 | Web localStorage | AsyncStorage |
|------|-----------------|--------------|
| 操作方式 | 同步 | 异步（Promise） |
| 存储大小 | 约 5-10 MB | 取决于设备，通常远大于 localStorage |
| 加密 | 无 | 无 |
| 数据格式 | 字符串 | 字符串 |
| 跨标签页共享 | 支持（storage 事件） | 不适用（移动端无标签页概念） |
| 平台 | 浏览器 | Android、iOS、macOS、tvOS、Web |

## 使用模式（基于文档内容推导）

虽然当前文档页面未提供详细的 API 参考，但基于 AsyncStorage 作为键值对存储的定位以及其与 Web `localStorage` 的对应关系，以下是常见的使用模式（基于文档内容推导）：

### 基本读写

```jsx
import AsyncStorage from '@react-native-async-storage/async-storage';

// 存储数据
const storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    // 存储失败处理
  }
};

// 读取数据
const getData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return value;
    }
  } catch (e) {
    // 读取失败处理
  }
};
```

### 存储对象数据

由于 AsyncStorage 只接受字符串值，存储对象需要先序列化：

```jsx
// 存储对象
const storeObject = async (key, object) => {
  try {
    const jsonValue = JSON.stringify(object);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    // 存储失败处理
  }
};

// 读取对象
const getObject = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    // 读取失败处理
  }
};
```

### 在 React 组件中使用

对于有 React Web 经验的开发者，以下是在组件中读取 AsyncStorage 数据的典型模式：

```jsx
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

function UserProfile() {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    // 组件挂载时异步读取存储的用户名
    const loadUsername = async () => {
      try {
        const storedName = await AsyncStorage.getItem('username');
        if (storedName) {
          setUsername(storedName);
        }
      } catch (error) {
        console.error('读取用户名失败:', error);
      }
    };
    loadUsername();
  }, []);

  // 在 Web 端你可能直接 const name = localStorage.getItem('username')
  // 但在 React Native 中必须通过异步加载 + state 管理
  if (username === null) {
    return <Text>加载中...</Text>;
  }

  return <Text>欢迎, {username}</Text>;
}
```

> **注意**：以上代码示例是基于文档对 AsyncStorage 的描述推导的常见用法，完整的 API 参考请查阅官方文档（见下方"获取更多信息"部分）。

## 获取更多信息

当前 Expo 文档页面是一个概览页，明确指出完整的 API 参考和使用指南需要查阅 `@react-native-async-storage/async-storage` 的**官方文档**。官方文档包含所有可用方法的详细说明（如 `setItem`、`getItem`、`removeItem`、`multiGet`、`multiSet`、`clear` 等）以及更高级的使用场景。

## 注意事项、限制条件和坑点

### 1. 不要存储敏感数据

AsyncStorage 是未加密的，任何有设备物理访问权限的人都可能读取存储内容。密码、认证令牌、支付信息等敏感数据不应存储在 AsyncStorage 中。Expo 生态中提供了 `expo-secure-store` 用于安全存储敏感信息。

### 2. 所有操作都是异步的

这是从 Web 端 `localStorage` 迁移过来的开发者最容易犯的错误。忘记 `await` 会导致拿到一个 Promise 对象而不是实际的值：

```js
// 错误：value 是一个 Promise，不是实际值
const value = AsyncStorage.getItem('key');

// 正确：使用 await 获取实际值
const value = await AsyncStorage.getItem('key');
```

### 3. 只能存储字符串

AsyncStorage 的键和值都必须是字符串。如果要存储对象或数组，必须先使用 `JSON.stringify()` 序列化，读取时使用 `JSON.parse()` 反序列化。直接存储对象会导致调用 `.toString()` 变成 `"[object Object]"`。

### 4. 版本兼容性

文档提到当前页面适用于"即将发布的 SDK 版本"（unversioned），如需当前稳定信息应参考 SDK 56 版本文档。在实际项目中，确保使用的 AsyncStorage 版本与你的 Expo SDK 版本兼容——这也是为什么推荐使用 `expo install` 而非直接 `npm install` 的原因。

### 5. 数据大小限制

AsyncStorage 适合存储小规模数据（用户偏好、设置、小型缓存等）。如果需要存储大量结构化数据，应考虑使用 SQLite 数据库（如 `expo-sqlite`）或其他更适合的方案。

## React Web 开发者需要特别注意的地方

### 思维转变：从同步到异步

Web 端的 `localStorage` 是同步 API，可以直接在渲染逻辑中使用：

```js
// Web 端可以这样做（同步）
function Header() {
  const theme = localStorage.getItem('theme') || 'light';
  return <div className={theme}>...</div>;
}
```

但在 React Native 中，AsyncStorage 的异步特性意味着你必须采用"先加载，后渲染"的模式：

```jsx
// React Native 端必须这样做（异步）
function Header() {
  const [theme, setTheme] = useState('light'); // 先设置默认值

  useEffect(() => {
    AsyncStorage.getItem('theme').then((stored) => {
      if (stored) setTheme(stored);
    });
  }, []);

  return <View style={styles[theme]}>...</View>;
}
```

这意味着组件在首次渲染时可能显示默认值或加载状态，存储数据加载完成后再更新 UI。

### 没有"跨标签页"同步机制

Web 端的 `localStorage` 有一个 `storage` 事件，可以在多个标签页之间同步数据变化。移动端没有标签页的概念，所以不需要考虑这个问题。但如果你同时使用 AsyncStorage 的 Web 支持，需要注意不同标签页之间的数据不会自动同步。

### 错误处理的重要性

Web 端的 `localStorage` 操作很少失败（除非存储空间满了或被禁用）。但在移动端，由于涉及原生文件系统，可能遇到更多类型的错误（如存储已满、权限问题等）。务必对每个 AsyncStorage 操作进行 try/catch 错误处理。

## 实际开发建议

1. **封装存储工具函数**：建议在项目早期就封装一套 AsyncStorage 的工具函数（包含类型安全的 get/set/remove），避免在每个组件中重复编写序列化和错误处理逻辑。

2. **定义常量键名**：将所有存储键名定义为常量，避免拼写错误导致的数据丢失：

   ```js
   const STORAGE_KEYS = {
     USER_TOKEN: '@user_token',
     THEME: '@theme',
     LANGUAGE: '@language',
   };
   ```

3. **考虑加载状态**：由于 AsyncStorage 是异步的，应用启动时从存储读取关键数据（如登录状态）期间，应设计合理的加载界面或骨架屏，避免闪烁或状态跳变。

4. **使用 `expo install` 安装**：始终使用 `expo install` 而不是 `npm install` 来安装此库，确保版本兼容。

5. **敏感数据用 `expo-secure-store`**：认证令牌、用户密码等敏感数据不要存在 AsyncStorage 中，使用 `expo-secure-store` 进行加密存储。

## 总结

`@react-native-async-storage/async-storage` 是 React Native / Expo 生态中最基础的本地持久化存储方案，定位类似于 Web 端的 `localStorage`。它的核心特点是异步、未加密、持久化、键值对存储，支持所有主流平台并已内置于 Expo Go。

对于有 React Web 经验的开发者，最关键的区别在于：**所有操作都是异步的**，这要求你在组件设计和数据流中做出相应调整。同时，由于数据未加密，需要对存储内容的敏感性做出判断。

当前 Expo 文档页面为概览页，详细的 API 方法说明和使用示例需要查阅该库的官方文档。

---

## 文档导航

- **上一页**：[third party overview](./222__third-party-overview.md)
- **下一页**：[date time picker](./224__date-time-picker.md)
