# 044｜用 Jest 测试 Expo / React Native

**翻页：**[上一页：身份验证](./043-身份验证.md) · [目录](./README.md) · [下一页：应用审核分发概览](./045-应用审核分发概览.md)

**官方页面：**[Unit testing with Jest](https://docs.expo.dev/develop/unit-testing/)

> 本页为当前 Expo Jest 配置指南。SDK 版本化参考未单独列 Jest API；执行 expo install 会按照项目 Expo SDK 选择依赖兼容版本。

## 先认识 Jest 和 jest-expo

Jest 是 JavaScript 的单元测试与 Snapshot 测试框架。Expo 的 jest-expo preset 提供 Jest 基础配置，并模拟大多数 Expo SDK 原生部分，减少 React Native 项目里需要手工配置的内容。

组件行为测试通常配合 React Native Testing Library（RNTL），从用户能看到、能点到的界面行为检查组件，而不是直接检查内部实现。

## 安装与配置 Jest

在项目根目录安装 jest-expo、jest 和 TypeScript 类型（若未使用 TypeScript 可略过 @types/jest）。Windows 命令需要使用 -- 分隔参数：

| 包管理器 | macOS / Linux | Windows |
| --- | --- | --- |
| npm / npx | npx expo install jest-expo jest @types/jest --dev | npx expo install jest-expo jest @types/jest "--" --dev |
| Yarn | yarn expo install jest-expo jest @types/jest --dev | yarn expo install jest-expo jest @types/jest "--" --dev |
| pnpm | pnpm expo install jest-expo jest @types/jest --dev | pnpm expo install jest-expo jest @types/jest "--" --dev |
| Bun | bun expo install jest-expo jest @types/jest --dev | bun expo install jest-expo jest @types/jest "--" --dev |

如果用 TypeScript，把 Jest 类型加入 tsconfig：

~~~json
{
  "compilerOptions": {
    "types": ["jest"]
  }
}
~~~

在 package.json 设置测试命令与 preset：

~~~json
{
  "scripts": {
    "test": "jest --watchAll"
  },
  "jest": {
    "preset": "jest-expo"
  }
}
~~~

### 依赖模块中的语法转换

若某个依赖以 Jest 无法直接运行的语法发布，可在 transformIgnorePatterns 指明允许转换的目录。不要把所有依赖都无条件转换；匹配本项目确实使用的模块即可。

npm / Yarn 常用前缀：

~~~json
{
  "jest": {
    "preset": "jest-expo",
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)"
    ]
  }
}
~~~

pnpm 的路径会经过 .pnpm，需要允许该目录：

~~~json
{
  "jest": {
    "preset": "jest-expo",
    "transformIgnorePatterns": [
      "node_modules/(?!(.pnpm|(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg))"
    ]
  }
}
~~~

Bun 的安装目录则包含 .bun：

~~~json
{
  "jest": {
    "preset": "jest-expo",
    "transformIgnorePatterns": [
      "node_modules/(?!(.bun|(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg))"
    ]
  }
}
~~~

## 安装 React Native Testing Library

| 包管理器 | macOS / Linux |
| --- | --- |
| npm / npx | npx expo install @testing-library/react-native --dev |
| Yarn | yarn expo install @testing-library/react-native --dev |
| pnpm | pnpm expo install @testing-library/react-native --dev |
| Bun | bun expo install @testing-library/react-native --dev |

Windows 下在 --dev 前加 "--"，例如：npx expo install @testing-library/react-native "--" --dev。react-test-renderer 对 React 19+ 不再受支持；新项目应使用 RNTL。

## 写一个组件测试

假设首页导出一段文字组件：

~~~tsx
import { PropsWithChildren } from 'react';
import { Text, View } from 'react-native';

export const CustomText = ({ children }: PropsWithChildren) => <Text>{children}</Text>;

export default function HomeScreen() {
  return (
    <View>
      <CustomText>Welcome!</CustomText>
    </View>
  );
}
~~~

在根目录 __tests__ 中写测试，通过屏幕文本查询组件：

~~~tsx
import { render } from '@testing-library/react-native';
import HomeScreen from '../src/app/index';

describe('HomeScreen', () => {
  test('显示欢迎文案', async () => {
    const { getByText } = await render(<HomeScreen />);
    getByText('Welcome!');
  });
});
~~~

运行测试：

| 包管理器 | 命令 |
| --- | --- |
| npm | npm run test |
| Yarn | yarn run test |
| pnpm | pnpm run test |
| Bun | bun run test |

Jest preset 会识别 -test.ts 和 -test.tsx 文件。测试可集中放在仓库根 __tests__，也可放在各 feature / component 的近旁。

## Snapshot 测试

Snapshot 会把渲染后的组件树记录成文件，之后可检查结构变化。页面示例写法：

~~~tsx
test('CustomText snapshot', async () => {
  const tree = (await render(<CustomText>Some text</CustomText>)).toJSON();
  expect(tree).toMatchSnapshot();
});
~~~

Snapshot 适合捕捉稳定组件输出，但 Expo 文档建议 UI 验收优先考虑端到端测试（如 Maestro），不要把大量快照当成真实交互验证。

## 代码覆盖率

jest.collectCoverage 启用覆盖率；collectCoverageFrom 指出参与统计和排除的文件：

~~~json
{
  "jest": {
    "collectCoverage": true,
    "collectCoverageFrom": [
      "**/*.{ts,tsx,js,jsx}",
      "!**/coverage/**",
      "!**/node_modules/**",
      "!**/babel.config.js",
      "!**/expo-env.d.ts",
      "!**/.expo/**"
    ]
  }
}
~~~

运行 npm run test 后可从生成的 coverage/lcov-report/index.html 浏览报告。

## 可选测试脚本

~~~json
{
  "scripts": {
    "test": "jest --watch --coverage=false --changedSince=origin/main",
    "testDebug": "jest -o --watch --coverage=false",
    "testFinal": "jest",
    "updateSnapshots": "jest -u --coverage=false"
  }
}
~~~

## 关键名词

- **Preset**：Jest 预设配置，jest-expo 处理 RN / Expo 常见运行环境和 native 模拟。
- **RNTL**：React Native Testing Library，按可访问文本 / 控件查询实际渲染组件。
- **Snapshot**：一次渲染树的序列化记录，适用于结构回归检查，不会自动验证真实视觉布局或设备交互。
- **transformIgnorePatterns**：控制 Jest 是否转换 node_modules 中依赖文件的正则规则。
- **Coverage report**：统计代码被测试执行覆盖的比例，不等于测试已经验证了所有业务行为。

## 官方代码主题覆盖

本页代码示例覆盖 Jest / RNTL 安装（含 Windows 传参）、TypeScript 类型、preset / test script、npm/Yarn/pnpm/Bun 转换规则、HomeScreen 与查询测试、四种测试运行命令、Snapshot、Coverage 配置及可选 Jest 流程脚本。

## 下一页

页脚 Next 指向 [Overview of distributing apps for review](https://docs.expo.dev/review/overview/)。

**翻页：**[上一页：身份验证](./043-身份验证.md) · [目录](./README.md) · [下一页：应用审核分发概览](./045-应用审核分发概览.md)

