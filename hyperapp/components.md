# 视图及组件

## 视图参数

视图传递两个参数：

- state
- actions

参考[起步](/hyperapp/README?id=起步)中的例子。

```jsx
const view = (state, actions) => (
  <div>
    <h1>{state.count}</h1>
    <button onclick={() => actions.down(1)}>-</button>
    <button onclick={() => actions.up(1)}>+</button>
  </div>
)
```

## 组件参数

组件传递两个不同的参数：

- props
- children

示例：

```jsx
// count 和 actions 是 props 传进来的两个参数
const Test = ({count, actions}, children) => (
  <div>
    <h1>{count}</h1>
    {children}
    {/* <p>Hello World</p> 挂载在此处 */}
    <button onclick={() => actions.down(1)}>-</button>
    <button onclick={() => actions.up(1)}>+</button>
  </div>
)

const view = (state, actions) => (
  <div>
    <Test count={state.count} actions={actions} >
      <p>Hello World</p>
    </Test>
  </div>
)
```

## 最佳实践

在视图中使用 State 时，在内部进行解构赋值，将完整的 State 传递给下一个子组件，这样能够保证子组件拿到的 State 结构一致，避免开发过程中的一些失误。

```jsx
// 在最里层子组件可以直接解构赋值使用
// 但并不推荐，因为你永远不知道这个子组件以后下面是否还会再加一个子组件
const SubModule = ({ state }) => {
  // 在这里进行解构赋值操作
  const {
    // ...
  } = state;
  return (
    <div>Test</div>
  )
};

const view = (state) => {
  // 在这里进行解构赋值操作
  const {
    // ...
  } = state;
  return (
    <div>
      <!-- 在此处可以完整传递 state 到子组件 -->
      <SubModule state={state} />
    </div>
  );
}
```

在这里，我并没有进行 Actions 对象的传递，可以参考后续更新的 [FX](/fx/README) 章节来具体深入了解。
