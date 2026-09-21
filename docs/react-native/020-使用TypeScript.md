# 020 使用 TypeScript（Using TypeScript）

**翻页：** [上一页：019 使用第三方库（Using Libraries）](019-使用第三方库.md) · [目录](README.md) · [下一页：021 Strict TypeScript API](021-StrictTypeScriptAPI.md)

**官方页面：** [Using TypeScript · React Native](https://reactnative.dev/docs/typescript)  
**源页代码覆盖：** Expo 模板命令、安装 TypeScript 与 React/Jest 类型、`tsconfig.json`、保留 `index.js` 并用 `tsc` 校验、props/state 组件示例，以及 Babel/TypeScript 路径别名配置。

## RN 工程中的 TypeScript

TypeScript（TS）在 JavaScript 上增加静态类型和编辑器提示。RN 新工程默认选 TS，也仍支持 JavaScript 与 Flow。对 React 开发者而言，组件和 Hooks 用法不变，主要增加 props、state、ref、API 值的类型声明。

官方页展示了 Expo 创建模板的命令：

```sh
npx create-expo-app --template
```

已有 RN 项目可安装 TypeScript、RN 类型配置、React/Jest 类型等开发依赖。npm 和 Yarn 命令作用相同。直接安装 `latest` 版本有可能和当前 RN 依赖不兼容，应该按项目 RN 模板/升级指南选择版本。

```sh
npm install --save-dev typescript @react-native/typescript-config \
  @types/jest @types/react @types/react-test-renderer
# 或使用 Yarn
yarn add --dev typescript @react-native/typescript-config \
  @types/jest @types/react @types/react-test-renderer
```

项目根目录的 `tsconfig.json` 通常继承 RN 提供的 TS 配置：

```json
{
  "extends": "@react-native/typescript-config"
}
```

逐步把需要检查的组件文件扩展名改成 `.tsx`。官方提醒保留 `./index.js` 应用入口，否则生产打包可能出问题。运行 `npx tsc` 或 `yarn tsc` 做类型检查；Metro 构建时 TypeScript 源代码由 Babel 转换，因此 `tsc` 的首要用途是类型校验，不是生成应用 bundle。

`.jsx` 表示 JavaScript JSX 文件，默认不会接受 TypeScript 类型检查。JS 和 TS 文件可以在一个工程中互相导入，但需要为迁移中的边界提供合理类型。

## props、state 和 RN 组件类型

下面的重写示例描述一个可调节“热情等级”的组件：`Props` 指明组件输入，optional prop 用 `?`，state 用 `useState` 管理，按钮通过 `onPress` 调用回调。减小等级时将其限制在 0 以上；计算函数根据数字生成感叹号；`StyleSheet.create` 收集布局与文本样式。

```tsx
import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

type Props = {
  name: string;
  initialLevel?: number;
};

export default function Enthusiasm({ name, initialLevel = 0 }: Props) {
  const [level, setLevel] = useState(initialLevel);
  const punctuation = (count: number) => '!'.repeat(count);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hello {name}{punctuation(level)}</Text>
      <Button
        title="增加"
        accessibilityLabel="增加热情程度"
        color="blue"
        onPress={() => setLevel(level + 1)}
      />
      <Button
        title="减少"
        accessibilityLabel="降低热情程度"
        color="red"
        onPress={() => setLevel(current => Math.max(0, current - 1))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  greeting: { fontSize: 20, fontWeight: 'bold', margin: 16 },
});
```

## 给已有工程加路径别名

路径别名可缩短深层相对路径，但 TS 编辑器与 Babel/Metro 都必须理解别名。`tsconfig.json` 的 `baseUrl` 和 `paths` 告诉 TypeScript 如何解析；`babel-plugin-module-resolver` 让打包阶段按相同规则查找模块。两份配置要一致，且 `babel.config.js` 是 JavaScript 配置文件，不是 JSON。

```json
{
  "extends": "@react-native/typescript-config",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "*": ["src/*"],
      "tests/*": ["tests/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
```

```sh
npm install --save-dev babel-plugin-module-resolver
# 或
yarn add --dev babel-plugin-module-resolver
```

页面里的 Babel 配置还示范 `root`、扩展名和 alias 映射，预设名以实际 RN 版本模板为准：

```js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [[
    'module-resolver',
    {
      root: ['./src'],
      extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
      alias: {
        tests: './tests',
        '@components': './src/components',
      },
    },
  ]],
};
```

## 适合 React Web 工程师的记忆点

- TS 类型不会改变 RN 的渲染目标；UI 仍用 React Native 组件。
- Babel 把 TS/JS 转为 bundle；`tsc` 检查类型和 TS 配置。
- 类型配置和 Metro/Babel 模块解析是两层设置；加路径别名时要同时覆盖。
- 确认工具包版本和 RN 工程一致，尤其是跨版本迁移。

**翻页：** [上一页：019 使用第三方库（Using Libraries）](019-使用第三方库.md) · [目录](README.md) · [下一页：021 Strict TypeScript API](021-StrictTypeScriptAPI.md)
