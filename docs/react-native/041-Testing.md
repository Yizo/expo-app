# 041 Testing

**翻页：** [上一页：040 其他调试方式（Other Debugging Methods）](040-OtherDebuggingMethods.md) · [目录](README.md) · [下一页：042 Performance Overview](042-PerformanceOverview.md)

**官方页面：** [Testing · React Native](https://reactnative.dev/docs/testing-overview)  
**源页代码覆盖：** Jest 单元测试 Given/When/Then、TextInput/Button 购物清单组件、React Native Testing Library 的 changeText/press/query 测试、snapshot 概念，以及静态检查和 E2E 工具路线。

## 为什么要自动化测试

测试能在发布前找到错误，也能防止后续重构、加功能或升级依赖时旧行为悄悄坏掉。一个失败测试若准确复现 bug，会成为之后防回归的保护网。测试还可以帮助新成员理解代码，因此应写清意图。

## 从静态分析开始

静态分析不运行应用代码就检查代码质量。Lint 检查常见错误、未用代码和风格问题；类型检查确认传给函数/组件的值类型正确。RN 模板默认配置 ESLint 和 TypeScript。它们补充而不是替代单元、设备与界面测试。

## 让代码可测

把整个应用塞进一个文件会让验证更困难。把业务逻辑、应用状态和 React 组件分开后，可以独立测纯计算，也可以针对组件测试显示和交互。未必需要把所有逻辑都抽出组件，但要让核心规则不依赖具体 UI 才能容易覆盖。

## Jest 测试结构

RN 模板默认提供针对 JS 环境的 Jest preset。测试应短小、尽量一次只验证一个行为，并且彼此独立。常见结构是 Given（前置条件）、When（执行动作）、Then（断言结果），也称 AAA：Arrange、Act、Assert。

```ts
it('逾期日期应显示红色', () => {
  // Given：日期已经过去
  const dueDate = '2001-06-15';
  // When：计算标签颜色
  const color = colorForDueDate(dueDate);
  // Then：结果为红色
  expect(color).toBe('red');
});
```

用 `describe` 按功能分组；用 `beforeEach`/`beforeAll` 建立共享前置对象。测试应在单独运行及整套运行时都给出相同结果；前一条测试不能污染下一条。

## 单元测试和 Mock

单元测试测函数、类等小单元，速度快、修改代码时反馈快。默认优先使用真实依赖；若依赖原生模块、网络 API 或不稳定第三方服务，就用 mock 隔离边界。Mock 是测试专用替身，可以固定响应，而不需要每次连真实天气服务或设备原生代码。

Integration test（集成测试）把多个模块组合起来；也可能在真实文件、数据库或网络边界上运行。不同团队对“集成测试”的范围叫法不完全一致，本指南把模块合作、外部系统和 I/O 纳入集成测试范围。通常仍会 mock 不属于本次测试目标的外部系统。

## 组件测试：按用户视角验证

组件测试可验证两类事情：UI 是否渲染正确，以及用户点击/输入后是否产生期望结果。可使用 React Native Testing Library 的 `render`、`fireEvent` 和查询方法模拟用户操作。

下面的购物清单组件有受控 TextInput、添加按钮和动态列表：

```tsx
function ShoppingList() {
  const [draft, setDraft] = useState('');
  const [items, setItems] = useState<string[]>([]);

  function addItem() {
    if (draft.trim() === '') return;
    setItems(current => [draft, ...current]);
    setDraft('');
  }

  return (
    <>
      <TextInput
        value={draft}
        placeholder="输入商品"
        onChangeText={setDraft}
      />
      <Button title="加入清单" onPress={addItem} />
      {items.map((item, index) => <Text key={`${item}-${index}`}>{item}</Text>)}
    </>
  );
}
```

```tsx
test('用户可以添加一件商品', () => {
  const { getByPlaceholderText, getByText, getAllByText } = render(<ShoppingList />);
  fireEvent.changeText(getByPlaceholderText('输入商品'), '香蕉');
  fireEvent.press(getByText('加入清单'));
  expect(getAllByText('香蕉')).toHaveLength(1);
});
```

测试从可见文字与可访问性查询出发，观察用户看到/听到什么。避免断言组件私有 state/props，少依赖 `testID`；这类实现细节会让测试在重构时无谓失败。`react-test-renderer` 可在纯 JS 环境渲染组件树，但官方页面已标为 Deprecated，不建议新项目依赖它。

> 组件测试运行在 Node.js，只执行 JavaScript 层，不会执行 iOS/Android 原生 View、系统无障碍、键盘或原生模块代码。它不能证明真实设备行为正确。

## Snapshot 测试

Jest Snapshot 把组件渲染输出序列化成文本并保存，后续对比改动。它可以抓意外结构变化，但快照很大时难审查；首次生成时错误 UI 也会被当作“正确”快照，失败后直接 `--updateSnapshot` 可能掩盖 bug。优先写明确的用户行为断言，仅保留小快照用于确实有价值的输出结构检查。

## 端到端 E2E 测试

E2E（End-to-End）在真实设备或模拟器上以 Release 配置运行，像用户一样点按钮、输入文本，再断言屏幕是否出现目标内容。它不能访问 React 组件 state、Redux store 等内部实现，但能验证完整应用路径和原生平台组合，因此信心最高。

代价是运行慢、编写和维护时间更长，也更容易 flaky（无代码变化时随机通过或失败）。优先覆盖登录、核心业务、支付等高风险路径；非关键逻辑可用快速 JS 测试。RN 社区常见工具包括 Detox、Appium 和 Maestro。

**翻页：** [上一页：040 其他调试方式（Other Debugging Methods）](040-OtherDebuggingMethods.md) · [目录](README.md) · [下一页：042 Performance Overview](042-PerformanceOverview.md)
