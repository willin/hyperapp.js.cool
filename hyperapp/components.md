# 视图及组件

## 视图参数

视图传递两个参数：

- state
- actions

参考[起步](/hyperapp/README?id=起步)中的例子。

```js
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

```js
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
