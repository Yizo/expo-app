# 使用内容管理系统 (CMS)

> **原文地址**：[https://docs.expo.dev/guides/using-a-cms/](https://docs.expo.dev/guides/using-a-cms/)
>
> **关联资源**：
> - Strapi 集成指南：[https://strapi.io/integrations/expo](https://strapi.io/integrations/expo)
> - Sanity 可视化编辑指南：[https://www.sanity.io/docs/visual-editing/visual-editing-with-react-native](https://www.sanity.io/docs/visual-editing/visual-editing-with-react-native)

---

## 什么是内容管理系统 (CMS)？

> **初学者术语解释**
>
> - **CMS (Content Management System，内容管理系统)**：一种软件平台，允许用户创建、管理和组织数字内容（如博客文章、图片、产品信息等），而无需编写自定义后端代码。你可以把它理解为一个"内容的后台管理面板"。
> - **Headless CMS（无头内容管理系统）**：一种只提供内容管理后端和 API 接口、不提供前端展示层的 CMS。前端应用（如你的 Expo 应用）通过 API 获取内容并自行渲染。Strapi 和 Sanity 都属于此类。
> - **REST API**：一种网络通信协议风格，应用通过 HTTP 请求（如 GET、POST）与服务端交换数据，通常返回 JSON 格式的数据。
> - **JWT (JSON Web Token)**：一种紧凑的、自包含的安全令牌标准，常用于用户身份验证。

**内容管理系统 (CMS)** 是一种平台，允许你创建、管理和组织数字内容，例如博客文章、图片和产品信息，而无需编写自定义后端代码。使用 CMS 可以显著节省开发时间，并使非技术用户（如编辑和营销人员）能够通过用户友好的界面轻松更新应用内容。

将 CMS 集成到你的 Expo 和 React Native 应用中，可以实现以下优势：

- **远程管理和更新内容**：无需接触应用代码即可修改内容
- **即时推送新信息**：用户无需等待应用商店更新即可获取最新内容
- **扩展内容运营**：在不发布新应用版本的情况下扩大内容规模

> **基于文档内容推导**：CMS 的核心价值在于将"内容"与"代码"解耦。对于移动应用而言，这意味着内容更新不再需要经过"修改代码 → 构建 → 提交应用商店审核 → 用户更新"的漫长流程，而是可以实现实时、远程的内容推送。

---

## 推荐的 CMS 方案

Expo 官方文档推荐了以下两个 CMS 方案用于 Expo 和 React Native 项目：

| CMS 方案 | 特点 | 官方资源 |
|---------|------|---------|
| **Strapi** | 开源无头 CMS，支持多语言、角色权限控制、可定制 API | [Strapi + Expo 集成](https://strapi.io/integrations/expo) |
| **Sanity** | 结构化内容平台，提供可视化编辑能力 | [Sanity + React Native 可视化编辑](https://www.sanity.io/docs/visual-editing/visual-editing-with-react-native) |

---

## 方案一：Strapi + Expo 集成

### Strapi 简介

> **初学者术语解释**
>
> - **Strapi**：一个领先的开源无头 CMS，提供灵活的内容建模、多语言支持和强大的 API。
> - **集合类型 (Collection Types)**：Strapi 中用于定义可重复内容结构的数据模型，类似数据库中的"表"。
> - **单一类型 (Single Types)**：Strapi 中用于定义独立页面结构的数据模型，如"关于我们"页面。

Strapi 作为领先的开源无头 CMS，提供多语言支持、基于角色的访问控制和灵活的 API 等功能。它简化了内容工作流，并与现代前端架构无缝配合。

### Strapi 5 核心特性

Strapi 5 开箱即用的功能可以帮助你快速启动项目：

1. **单一类型 (Single Types)**：允许用户为独立页面设计独特的内容结构
2. **草稿与发布 (Draft and Publish)**：工作流可减少错误并改善团队协作
3. **100% TypeScript 支持**：确保可维护性和类型安全
4. **可定制 API**：开发者可以直接修改后端代码以定制端点
5. **集成能力**：与 Algolia、SendGrid、Cloudinary 等第三方服务无缝连接
6. **编辑器界面**：支持插入动态内容块
7. **身份验证 (Authentication)**：通过外部提供商或 JSON Web Tokens 管理访问控制
8. **基于角色的访问控制 (RBAC)**：保护配置免受未经授权的更改，同时提高运营效率
9. **国际化 (i18n)**：允许多语言内容管理和特定区域的 API 查询
10. **插件系统 (Plugins)**：可通过自定义扩展来扩展功能

### 搭建 Strapi 5 无头 CMS

#### 安装 Strapi

> **注意**：确保在开始之前创建一个新的项目目录。

```bash
npx create-strapi-app@latest server
```

在初始化过程中跳过云托管提示。出现配置选项时，选择以下设置：

```bash
? Do you want to use the default database (sqlite) ? Yes
? Start with an example structure & data? Yes 
? Start with Typescript? Yes
? Install dependencies with npm? Yes
? Initialize a git repository? Yes
```

> **初学者术语解释**
>
> - **SQLite**：一种轻量级的嵌入式关系数据库，无需单独安装数据库服务器，非常适合开发和小型项目。
> - **TypeScript**：JavaScript 的超集，添加了静态类型检查，可以在编译阶段发现错误。

依赖安装完成后，启动本地服务器：

```bash
cd server
npm run develop
```

系统将显示初始管理员注册界面。使用任意凭据注册本地管理员。注册成功后，系统将重定向到主管理仪表板。

#### 发布文章条目

导航到 "Article"（文章）集合，确保所有示例数据已上线。如果它们仍处于草稿模式，批量选中并点击 "Publish"（发布）。

#### 启用 API 访问

> **重要提示**：默认情况下，Strapi 的 API 端点不会公开给公共访问。你需要手动配置权限。

通过权限设置导航到公共角色配置，公开集合的端点。确保同时勾选了 **"find"**（查找列表）和 **"findOne"**（查找单个）权限。

#### 测试 API

对本地文章端点执行检索请求即可获取 JSON 数据。

> **注意**：REST 响应中默认省略媒体和关系字段。需要附加 `populate=*` 查询参数来包含关联的图片：

```
http://localhost:1337/api/articles?populate=*
```

### 开始使用 Expo

#### 前提条件

准备以下工具：

- Xcode 或 Android Studio
- 模拟器或物理设备

#### 安装 Expo 和 React Native

使用你首选的包管理器初始化移动项目：

```bash
npx create-expo-app@latest react-native-project --template blank
```

> **基于经验建议**：你也支持使用 yarn、pnpm 和 bun 作为包管理器。选择你团队最熟悉的工具即可。

#### 启动 Expo 开发服务器

启动本地移动开发环境：

```bash
npx expo start
```

### 在设备上运行 Expo 应用

使用以下快捷键在目标平台上执行应用：

| 平台 | 快捷键 |
|------|-------|
| **Web** | 按 `w` |
| **Android 模拟器** | 按 `a` |
| **iOS 模拟器** | 按 `i` |
| **物理设备** | 使用 "Expo Go" 应用 |

> **基于文档内容推导**：本指南主要针对虚拟化的 iOS 和 Android 环境。默认模板在成功模拟后会渲染一个基本的欢迎界面。

### 使用 HTTP 客户端进行请求

#### 使用 Axios

将 Axios 库添加到依赖中：

```bash
npm i axios
# 或者
yarn add axios
```

#### 使用 Fetch

原生 fetch API 不需要额外安装包，可直接使用。

> **基于经验建议**：Axios 提供了更友好的 API 和自动 JSON 解析功能，适合初学者使用；而原生 fetch 无需额外依赖，适合追求轻量化的项目。

### 从 Strapi 后端获取文章

执行网络调用以获取完整数据集。确保已启用公共检索权限。记住包含 `populate` 参数以检索关联的媒体资源。

```javascript
const response = await fetch("http://localhost:1337/api/articles?populate=*");
const data = await response.json();
console.log(data.data);
```

### 完整示例项目

以下实现从后端获取数据并在多列网格中渲染。打开主应用文件并实现以下修改：

#### 第一步：导入所需依赖

```javascript
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { useEffect, useState } from "react";
```

> **初学者术语解释**
>
> - **View**：React Native 中最基本的 UI 容器组件，类似于 Web 中的 `<div>`。
> - **FlatList**：React Native 提供的高性能列表组件，支持懒加载，适合渲染大量数据。
> - **useEffect**：React Hook，用于在组件挂载或更新时执行副作用操作（如网络请求）。
> - **useState**：React Hook，用于在函数组件中管理状态变量。

核心 UI 组件负责布局结构、排版、媒体渲染和视觉样式。React Hooks 管理本地状态变量并在组件挂载时执行副作用逻辑。

#### 第二步：创建变量

定义后端端点常量并初始化一个状态数组来存储获取的数据集。

```javascript
const STRAPI_URL = "http://localhost:1337";
const [articles, setArticles] = useState([]);
```

#### 第三步：创建获取文章的函数

实现一个异步获取函数，并在组件挂载时自动触发。

```javascript
const fetchArticles = async () => {
  try {
    const response = await axios.get(`${STRAPI_URL}/api/articles?populate=*`);
    setArticles(response.data.data);
  } catch (error) {
    console.error("Error fetching articles:", error);
  }
};

useEffect(() => {
  fetchArticles();
}, []);
```

#### 第四步：创建格式化文章发布日期的函数

构建一个日期格式化器，将时间戳转换为本地化的、人类可读的字符串（显示月、日、年）。

```javascript
const formatDate = (date) => {
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return new Date(date).toLocaleDateString("en-US", options);
};
```

#### 第五步：渲染文章

设计一个卡片组件，显示每个条目的媒体资源、标题和格式化的时间戳。

```javascript
export default function App() {
  // ... (状态和副作用)
  const renderArticle = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: `${STRAPI_URL}${item.cover.url}` }}
        style={styles.image}
      />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.published}>
        Published: {formatDate(item.publishedAt)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Expo and Strapi Integration</Text>
      {articles ? (
        <FlatList
          title="Articles"
          data={articles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderArticle}
          numColumns={2}
          contentContainerStyle={styles.container}
        />
      ) : (
        <Text>NO data fetched</Text>
      )}
    </View>
  );
}
```

### 完整代码

```javascript
// 路径: ./App.js
import { View, Text, Image, FlatList, StyleSheet } from "react-native";
import axios from "axios";
import { useEffect, useState } from "react";

export default function App() {
  const STRAPI_URL = "http://localhost:1337";
  const [articles, setArticles] = useState([]);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`${STRAPI_URL}/api/articles?populate=*`);
      setArticles(response.data.data);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  const formatDate = (date) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  const renderArticle = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: `${STRAPI_URL}${item.cover.url}` }}
        style={styles.image}
      />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.published}>
        Published: {formatDate(item.publishedAt)}
      </Text>
    </View>
  );

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Expo and Strapi Integration</Text>
      <FlatList
        title="Articles"
        data={articles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderArticle}
        numColumns={2}
        contentContainerStyle={styles.container}
      />
    </View>
  );
}
```

> **基于文档内容推导**：关键实现细节包括：网络请求拉取必要字段并更新本地状态数组；专用的渲染函数为每个条目构建视觉卡片布局；生命周期 Hook 确保在初始化时立即执行数据获取；基于网格的列表组件处理响应式的两列展示。

### 常见问题排查

> **警告**：连接问题是集成 CMS 时最常见的障碍，请注意以下要点：

- **虚拟化 Android 环境**：虚拟化的 Android 环境需要将 `localhost` 映射为 `10.0.2.2`。这是因为 Android 模拟器运行在自己的虚拟机中，`localhost` 指向的是模拟器本身而非你的开发机器。
- **物理设备**：物理设备必须与开发机器共享同一局域网。

> **基于经验建议**：如果你在物理设备上测试，需要将 `localhost` 替换为你开发机器的局域网 IP 地址（例如 `192.168.1.100`），同时还需要调整后端 Strapi 的 CORS 策略以接受来自移动客户端的请求。

### 常见问题解答 (FAQ)

#### 连接移动应用

使用网络库与 REST 端点交互，为后端 URL 管理环境变量，并使用设备的安全存储机制保护 JSON Web Tokens。

#### 管理用户会话

实现基于令牌的身份验证流程，安全持久化凭据，并建立全局上下文以自动将身份验证头附加到发出的网络请求中。

#### 处理媒体资源

直接将远程图片 URL 嵌入原生图片组件。对于文件上传，将设备图片选择器与 multipart form data 提交结合使用，上传到后端的上传端点。

#### 离线能力

> **基于经验建议**：如果你的应用需要在网络不可用时仍然展示内容，建议使用本地数据库方案（如 SQLite）或 AsyncStorage 来缓存网络响应，并实现同步逻辑以在网络恢复后解决冲突。

#### 本地开发环境

在物理设备上测试时，需要将 `localhost` 替换为你机器的本地 IP 地址，并调整后端 CORS 策略以接受来自移动客户端的请求。

---

## 方案二：Sanity + Expo 可视化编辑

### Sanity 简介

> **初学者术语解释**
>
> - **Sanity**：一个结构化内容管理平台，提供实时协作编辑和强大的 API。
> - **可视化编辑 (Visual Editing)**：允许内容编辑者在实际页面预览中直接点击和编辑内容的功能。
> - **Sanity Studio**：Sanity 提供的可定制的内容管理界面（后台管理面板）。
> - **GROQ**：Sanity 的查询语言，用于从 Sanity 数据集（dataset）中检索和过滤内容。
> - **Presentation Tool**：Sanity Studio 的一个插件，可以在 Studio 内预览你的前端应用。

此方案将交互式编辑功能集成到 React Native 应用中。功能包括：

- 实时查看草稿修改
- 使用可点击的覆盖层
- 重构页面
- 共享预览链接
- 创建文档快捷方式

你的项目的 Web 版本会在 Studio 环境中加载，利用 Presentation 扩展实现预览。

### 前提条件

- 一个 React Native 项目（Expo 框架可选但推荐使用其开发工具）
- 一个 Sanity 工作区

> **警告**：由于该工具在浏览器中运行你的 Web 构建版本，因此检测 Web 环境和 "Presentation 模式" 的工具是必要的。

> **重要提示**：某些托管服务提供商会阻止在跨域 iframe 中嵌入 Web 应用。你必须确保你的托管服务允许此操作或允许自定义安全头。示例安全头应允许 localhost、你部署的应用、你的 Studio 和 Sanity Dashboard。

### 示例模板

GitHub 上提供了一个开源的基于 Expo 的模板仓库，包含示例页面、路由和必要的代码片段。要查看模板的演示数据，需要使用电影项目模板初始化一个单独的 Studio 并包含示例数据。

### 安装和配置

#### 安装最新包

```bash
pnpm install sanity@latest
# 也可以使用 npm 或 yarn 安装
```

#### 配置 Presentation 工具

将工具添加到你的配置中，通过环境变量设置允许的来源和预览 URL：

```javascript
import { presentationTool } from 'sanity/presentation'

export default defineConfig({
  ...其余 studio 配置,
  plugins: [
    ...其他插件,
    presentationTool({
      allowOrigins: [
        process.env.SANITY_STUDIO_REACT_NATIVE_APP_HOST,
      ],
      previewUrl: {
        initial: process.env.SANITY_STUDIO_REACT_NATIVE_APP_HOST
      }
    })
  ],
})
```

#### 实现位置解析器

实现一个位置解析器，将文档映射到其前端路由：

```javascript
export const locationResolver = {locations: {
  // 使用匹配文档中的值解析位置
  movie: defineLocations({
    select: {
      title: 'title',
      slug: 'slug.current',
    },
    resolve: (doc) => ({
      locations: [
        {
          title: 'Movies Directory',
          href: '/movies',
        },
        {
          title: `Movie Page: ${doc?.title}`,
          href: `/movie/${doc?.slug}`,
        },
      ],
    }),
  }),
  person: defineLocations({
    select: {
      name: 'name',
      slug: 'slug.current',
    },
    resolve: (doc) => ({
      locations: [
        {
          title: 'People Directory',
          href: '/people',
        },
        {
          title: `Person Page: ${doc?.name}`,
          href: `/person/${doc?.slug}`,
        },
      ],
    }),
  }),
}}
```

> **基于文档内容推导**：确保动态路由在生产环境中可以直接访问。配置你的托管服务将流量重写到单页应用的 index 文件，或将动态路径映射到静态 HTML 等效文件。

#### 配置环境变量

在管理控制台中添加本地和生产环境的 URL（前端和 Studio 都需要）。仅在交换登录凭据获取令牌时启用 credentials 选项。

### 客户端集成

#### 安装所需包

```bash
npm install @sanity/client @sanity/react-loader @sanity/visual-editing @sanity/presentation-comlink
```

> **初学者术语解释**
>
> - **@sanity/client**：Sanity 的官方 JavaScript 客户端库，用于与 Sanity API 通信。
> - **@sanity/react-loader**：为 React 应用提供数据加载功能的 Sanity 工具。
> - **@sanity/visual-editing**：实现可视化编辑功能的核心包。
> - **@sanity/presentation-comlink**：处理 Presentation 模式通信的工具。

#### 定义环境变量

```bash
# .env.local 或 .env
EXPO_PUBLIC_SANITY_DATASET=你的数据集名称
EXPO_PUBLIC_SANITY_PROJECT_ID=你的 Sanity 项目 ID
EXPO_PUBLIC_SANITY_STUDIO_URL=你的 Sanity Studio 的 URL
（本地运行或已部署，取决于环境）
```

> **初学者术语解释**
>
> - **Dataset（数据集）**：Sanity 中存储内容的容器，类似于数据库中的一个数据库实例。
> - **Project ID（项目 ID）**：Sanity 分配给每个项目的唯一标识符。

#### 导出环境变量

```typescript
export const SANITY_PROJECT_ID: string = 
  process.env.EXPO_PUBLIC_SANITY_PROJECT_ID || ''; 
export const SANITY_DATASET: string = 
  process.env.EXPO_PUBLIC_SANITY_DATASET || '';
export const SANITY_STUDIO_URL:string = 
  process.env.EXPO_PUBLIC_SANITY_STUDIO_URL || '';
```

#### 创建平台工具函数

```typescript
import { Platform } from "react-native";

export const isWeb = Platform.OS === 'web'
```

> **基于文档内容推导**：可视化编辑功能仅在 Web 平台上生效，因此需要通过 `Platform.OS` 检测当前运行环境。在原生 iOS/Android 上，可视化编辑的覆盖层不会显示。

#### 初始化客户端

```tsx
import { SANITY_DATASET, SANITY_PROJECT_ID, SANITY_STUDIO_URL } 
  from "@/constants";
import { isWeb } from "@/utils/preview";
import { createClient } from "@sanity/client";

export const client = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    useCdn: true,
    apiVersion: '2025-05-30',
    stega: {
      enabled: !!isWeb,
      studioUrl: SANITY_STUDIO_URL
    }
  })
```

> **初学者术语解释**
>
> - **useCdn**：是否使用 Sanity 的内容分发网络 (CDN) 来加速内容交付。开启后读取速度更快但可能有短暂延迟。
> - **stega**：Sanity 的编码技术，将编辑信息嵌入到内容字符串中，使可视化编辑能够定位到具体的内容字段。

#### 创建查询存储

```typescript
// sanity.ts
import { createQueryStore } from '@sanity/react-loader';
import { client } from '../sanity/client';

const { useLiveMode, useQuery } = createQueryStore({ client, ssr:false })

export { useLiveMode, useQuery };
```

### 构建可视化编辑组件

```tsx
import { useLiveMode } from '@/hooks/useQueryStore';
import { isWeb } from '@/utils/preview';
import { isMaybePresentation } from '@sanity/presentation-comlink';
import { enableVisualEditing } from '@sanity/visual-editing';
import { usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { client } from '../sanity/client';

export default function SanityVisualEditing() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const disable = isWeb && isMaybePresentation() ? enableVisualEditing({
      history: {
        subscribe: (navigate) => {
          console.log('NAVIGATION EVENT:', {navigate, pathname})
          navigate({
            type: 'push',
            url: pathname,
          })
          return () => {}
        },
        update: (u: any) => {
          console.log('URL UPDATE:', u)
          switch (u.type) {
            case 'push':
              return router.push(u.url)
            case 'pop':
              return router.back()
            case 'replace':
              return router.replace(u.url)
            default:
              throw new Error(`Unknown update type: ${u.type}`)
          }
        }
      },
      zIndex: 1000,
      refresh: (payload) => {
        console.log('REFRESH EVENT: ', payload)
        const { source } = payload
        if(source === 'manual') {
          return new Promise(resolve => setTimeout(() => resolve(undefined), 1_000))
        } else {
          return false
        }
      },
    }) : () => null
    return () => disable()
  }, [pathname])

  if(isWeb && isMaybePresentation()) {
    useLiveMode({client })
  }

  return null
}
```

#### 添加到根布局

```tsx
import { Stack } from 'expo-router';
import SomeParent from "@/components/SomeParent"

export default function RootLayout() {
  return (
    <SomeParent>
      <Stack>
          <Stack.Screen name="(pages)" options={{ headerShown: false }} />
      </Stack>
      <SanityVisualEditing />
    </SomeParent>
  );
}
```

### 在页面中获取数据

```tsx
import { useQuery } from "@/hooks/useQueryStore";
import { useLocalSearchParams } from "expo-router";
import groq from "groq";
import { Text, View } from "react-native";

export default function SomePage() {
  const { page_slug } = useLocalSearchParams();
  const query = groq`*[_type == "some_type" && slug.current == $page_slug]{...}`;
  const { data } = useQuery(query, { page_slug });

  return (
    <View>
      {data?.map((document: YourDocumentType) => {
        const { _id, title } = document;
        return (
          <View key={_id}>
            <Text>{title}</Text>
          </View>
        );
      })}
    </View>
  );
}
```

> **初学者术语解释**
>
> - **groq**：Sanity 的查询语言（Graph-Relational Object Queries），用于从 Sanity 数据集中检索和过滤数据。语法类似于 SQL 但专为文档数据库设计。
> - **useLocalSearchParams**：Expo Router 提供的 Hook，用于获取当前路由的参数。

### 为元素添加可视化编辑数据属性

文本元素会自动获得覆盖层。对于非文本元素，需要更新工具函数文件：

```typescript
import { SANITY_DATASET, SANITY_PROJECT_ID, SANITY_STUDIO_URL } from '@/constants';
import { createDataAttribute, CreateDataAttributeProps } from '@sanity/visual-editing';
import { Platform } from "react-native";

export const isWeb = Platform.OS === 'web'

const config = {
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  baseUrl: SANITY_STUDIO_URL,
}

export const createDataAttributeProp = (attr: CreateDataAttributeProps) => {
  if (isWeb) {
    const attribute = createDataAttribute({...config, ...attr})?.toString()
    if (attribute) {
      return {dataSet: {sanity: attribute}}
    }
  }
  return undefined
}
```

#### 应用到组件

```tsx
import { useQuery } from "@/hooks/useQueryStore";
import { urlFor } from "@/utils/image_url";
import { createDataAttributeProp } from "@/utils/preview";
import { useLocalSearchParams } from "expo-router";
import groq from "groq";
import { Image, Text, View } from "react-native";

export default function SomePage() {
  const { page_slug } = useLocalSearchParams();
  const query = groq`*[_type == "some_type" && slug.current == $page_slug]{...}`;
  const { data } = useQuery(query, { page_slug });

  return (
    <View>
      {data?.map((document: YourDocumentType) => {
        const { _id, _type, title, hero_image } = document;

        const heroImageAttr = createDataAttributeProp({
          id: _id,
          type: _type,
          path: "hero_image",
        });
        return (
          <View key={_id}>
            <Image
              {...heroImageAttr}
              source={{ uri: urlFor(hero_image).url() }}
            />
            <Text>{title}</Text>
          </View>
        );
      })}
    </View>
  );
}
```

> **基于文档内容推导**：你可以进一步自定义覆盖层样式、启用数组的拖拽排序功能，以及使用 React Native 特定的数据属性来修改预览头部。

### 处理私有数据

> **警告**：标准 Hook 无法在 Studio 外部获取私有数据。需要使用安全代理并有条件地切换 Hook。

```tsx
const { isMaybePresentation } = import "@sanity/presentation-comlink"
const usePrivateQuery = import "@/hooks/usePrivateQuery"
    
    const { useLiveMode, useQuery} = createQueryStore({ client, ssr:false })

    function SomeComponent {
        const { data } = isMaybePresentation() ? useQuery(query) : usePrivateQuery()

        return <div>...contents</div>
    }
```

> **基于经验建议**：在生产环境中处理私有数据时，建议使用服务端代理或中间件来管理身份验证令牌，避免在客户端暴露敏感凭据。

### Live API 与实时更新

Live API 提供实时更新功能，在 Studio 中使用 Cookie 进行身份验证，在生产环境中则需要自定义连接器。一旦在本地和生产环境中完成配置，你的应用将显示交互式的、实时更新的内容预览。

> **基于经验建议**：如果遇到问题，请按以下步骤排查：
> 1. 验证环境变量是否正确配置
> 2. 检查 CORS 和安全头设置
> 3. 确认 Presentation 模式的 URL 配置
> 4. 查阅官方故障排除文档
> 5. 在社区 Discord 服务器寻求帮助

---

## 如何选择 CMS 方案？

> **基于文档内容推导**

| 需求场景 | 推荐方案 | 理由 |
|---------|---------|------|
| 需要完全自主托管和掌控数据 | **Strapi** | 开源、可自托管、完全控制后端 |
| 需要可视化编辑和实时协作 | **Sanity** | 内置可视化编辑、实时协作功能 |
| 项目预算有限 | **Strapi** | 开源免费，社区版功能够用 |
| 需要丰富的开箱即用集成 | **Strapi** | 支持 Algolia、SendGrid、Cloudinary 等 |
| 需要结构化的内容建模 | **Sanity** | 强大的结构化内容平台 |
| 团队中有非技术编辑人员 | 两者皆可 | 都提供用户友好的管理界面 |

---

## 通用最佳实践

> **基于经验建议**

1. **环境变量管理**：始终使用环境变量存储后端 URL 和 API 密钥，避免硬编码
2. **错误处理**：所有网络请求都应包含 try-catch 错误处理和用户友好的错误提示
3. **数据缓存**：对于不频繁变化的内容，实现缓存策略以减少网络请求
4. **离线支持**：考虑使用 AsyncStorage 或本地数据库缓存内容，提供离线体验
5. **图片优化**：使用 CMS 提供的图片转换 API（如 Sanity 的 `urlFor`）来优化图片大小和格式
6. **安全存储**：使用设备的安全存储机制（如 Keychain/Keystore）保护身份验证令牌
7. **CORS 配置**：在开发阶段确保后端正确配置了 CORS 策略以接受来自移动客户端的请求

---

## 文档导航

- **上一页**：[google authentication](./135__google-authentication.md)
- **下一页**：[using convex](./137__using-convex.md)
