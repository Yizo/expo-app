# 021 RootTag

**翻页：** [上一页：020 ReactNativeVersion](020-ReactNativeVersion.md) · [目录](README.md) · [下一页：022 Share](022-Share.md)

**官方页面：** [RootTag · React Native](https://reactnative.dev/docs/roottag)  
**源页代码覆盖：** RootTag 多 surface 概念、native navigation 场景、RootTagContext Hook/class 访问、0.65/0.66 context 迁移和 opaque type 前瞻。

## RootTag 是什么

**RootTag** 是 RN native root view 的不透明标识，用来区分每个 React Native surface。大多数单 root app 不需要直接处理它。多 root 架构常见于 native navigation 每屏各自嵌入 RN root 的 app；某个 native API（如设置原生导航标题、把 JS 事件归属到来源 screen）需要知道应作用于哪一个 root 时，RootTag 才有用。

它当前实现可能是数字，但文档要求将它当作不透明类型，不要自行运算、持久化或假设其一直为 number。

## 从 RootTagContext 获取

新代码通过 **RootTagContext** 读取当前 screen 的 root tag，再将它传给 native module：

    function ScreenA() {
      const rootTag = useContext(RootTagContext);

      function updateTitle(title) {
        NativeNavigation.setTitle(rootTag, title);
      }

      function logEvent() {
        NativeAnalytics.logEvent(rootTag, 'screen_action');
      }

      return <Button title="改标题" onPress={() => updateTitle('详情')} />;
    }

Class component 可以使用静态 **contextType**：

    class ScreenB extends React.Component {
      static contextType = RootTagContext;

      updateTitle(title) {
        NativeNavigation.setTitle(this.context, title);
      }

      render() {
        return <Button title="改标题" onPress={() => this.updateTitle('详情')} />;
      }
    }

RootTagContext 在 RN 0.65 从 unstable_RootTagContext 改为稳定名称；0.66 起旧 legacy context 路径会被移除。当前文档提醒依赖 RootTag 的库关注版本变化，避免直接依赖内部具体表示。

## 代码覆盖清单

源页有 Hook 与 class 两种 context 用法，本文均已重写；多 root 使用场景、native module 参数传递、旧 context 迁移和 RootTag 不透明类型限制均已覆盖。

**翻页：** [上一页：020 ReactNativeVersion](020-ReactNativeVersion.md) · [目录](README.md) · [下一页：022 Share](022-Share.md)
