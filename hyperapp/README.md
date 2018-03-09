# <img height=24 src=https://cdn.rawgit.com/jorgebucaran/f53d2c00bafcf36e84ffd862f0dc2950/raw/882f20c970ff7d61aa04d44b92fc3530fa758bc0/Hyperapp.svg> HyperApp

> 本文翻译自 [Github](https://github.com/hyperapp/hyperapp) 项目主页介绍，后续章节针对一些特性及最佳实践进行展开介绍。

Hyperapp 是一个构建 Web 应用的微型 JS 框架。

* **极小** — 我们已经积极地将需要理解的概念最小化，使之富有成效，同时保持与其他框架的一致性。
* **实用** — Hyperapp 坚持专注在函数式编程进行前端状态（State）管理， 以实用主义的态度考虑允许的副作用、异步行为（Actions）和 DOM 操作。
* **独立** — 麻雀虽小，五脏俱全。 Hyperapp 以一个虚拟 DOM 引擎来配合状态（State）管理，允许关键数据更新和生命周期事件（Events）——都无须额外依赖。


## 起步

我们的第一个示例代码是一个可增、减的计数器。 可以先试试[在线运行案例](https://codepen.io/hyperapp/pen/zNxZLP/left/?editors=0010)。
```js
import { h, app } from "hyperapp"

const state = {
  count: 0
}

const actions = {
  down: value => state => ({ count: state.count - value }),
  up: value => state => ({ count: state.count + value })
}

const view = (state, actions) => (
  <div>
    <h1>{state.count}</h1>
    <button onclick={() => actions.down(1)}>-</button>
    <button onclick={() => actions.up(1)}>+</button>
  </div>
)

app(state, actions, view, document.body)
```

Hyperapp 包含两个函数 API：

- <samp>hyperapp.h</samp> 返回一个 [虚拟 DOM](#view) 节点树。
- <samp>hyperapp.app</samp> [挂载](#mounting) 一个新的应用到指定 DOM 元素。（如果不传递一个元素，Hyperapp 将会使用无头模式（Headless），对单元测试等会有用）

如果你使用 JS 解释器（如：[Babel](https://babeljs.io) 或 [TypeScript](https://www.typescriptlang.org)）和打包工具（如：[Parcel](https://parceljs.org)、 [Webpack](https://webpack.js.org) 或其他）。如果你需要使用 `JSX`， 你所需要做的是按照 JSX [转译插件](https://babeljs.io/docs/plugins/transform-react-jsx) 并且添加 `pragma` 选项到你的 <samp>.babelrc</samp> 配置文件。

```json
{
  "plugins": [["transform-react-jsx", { "pragma": "h" }]]
}
```
JSX 是一个语法糖的扩展，能够将 HTML 标签用 JS 混写。 由于你的浏览器是不懂得 JSX 语法的，所以我们需要一个 <samp>hyperapp.h</samp> 解释器钩子调用来转译它。

```jsx
const view = (state, actions) =>
  h("div", {}, [
    h("h1", {}, state.count),
    h("button", { onclick: () => actions.down(1) }, "-"),
    h("button", { onclick: () => actions.up(1) }, "+")
  ])
```

注意 JSX 并不是构建 Hyperapp 的必要条件。 你可以像上述例子一样直接使用 <samp>hyperapp.h</samp> 而无须进行解释。 其他 JSX 的替换方案包含：

- [@hyperapp/html](https://github.com/hyperapp/html)
- [hyperx](https://github.com/substack/hyperx)
- [t7](https://github.com/trueadm/t7)

## 安装

使用 NPM 或者 Yarn 进行安装。

<pre>
npm i <a href=https://www.npmjs.com/package/hyperapp>hyperapp</a>
</pre>

然后使用模块打包工具（如：[Rollup](https://rollupjs.org) 或 [Webpack](https://webpack.js.org)），像你使用其他模块一样。

```js
import { h, app } from "hyperapp"
```

如果你不想初始化一个构建环境，你可以直接从 CDN 上（如：[unpkg.com](https://unpkg.com/hyperapp)）下载，然后通过全局  <samp>window.hyperapp</samp> 对象使用。我们支持了所有 ES5 兼容的浏览器，包括 IE10 以及更高版本。

```html
<script src="https://unpkg.com/hyperapp"></script>
```

## 概述

Hyperapp 应用由三个内部关联的部分组成： [状态（State）](#state)、 [视图（View）](#view) 和 [动作（Actions）](#actions)。

当初始化后，你的应用就会连续循环运行下去，执行用户或外部事件的动作，更新状态，通过虚拟 DOM 模型呈现改变到视图上。把动作看做一个信号，通知 Hyperapp 更新状态，计划下一次视图的重绘。在处理一个动作之后，一个新的状态会被返回给用户。

<a name="state" id="state"></a>
### 状态（State）

状态（State）是一个描述你整个程序的 JS 对象。它包含了应用内执行过程中变化的整个动态数据。状态一旦创建，不能被转变，我们必须通过动作（Actions）来更新它。

```js
const state = {
  count: 0
}
```

跟其他 JS 对象一样，状态可以被树形对象嵌套。我们推荐使用嵌套对象来表述局部状态。一个单一的状态树不会对模块产生冲突——参考[嵌套动作](#nested-actions)章节了解如何深度更新嵌套对象及分离你的状态和动作。

```js
const state = {
  top: {
    count: 0
  },
  bottom: {
    count: 0
  }
}
```

<a name="actions" id="actions"></a>
### 动作（Actions）

改变状态的方法是通过动作。一个动作是一个（接受一个参数的）一元方法。这个参数（Payload）可以是你想传给动作的任何东西。

动作必须返回一个局部的状态对象来更新状态。一个动作也可以返回一个方法，来使用当前状态并返回一个局部状态对象。在钩子下，Hyperapp 能将你的所有动作的方法连接起来，当状态改变时计划视图重绘。

```js
const actions = {
  down: value => state => ({ count: state.count - value }),
  up: value => state => ({ count: state.count + value })
}
```

如果你在动作中改变了状态并将它返回，视图会按照你的期望进行重绘。 这是因为状态的更新总是不可改变的。如果你的动作中返回了一个局部状态对象，新的状态会被灰度合并到当前的状态中。

不变性允许了穿越调试，通过将状态改变变得更加可预测而有效阻止了难以跟踪的 Bug 产生。并且允许低内存的组件使用 <samp>===</samp> 全等检查。

#### 异步动作

异步动作（写数据库、发送请求到服务器等）无须返回值。你可以直接在动作内部调用一个其他动作或作为回调函数。动作返回 Promise， <samp>undefined</samp> 或 <samp>null</samp> 时，不会触发重绘或状态更新。

```js
const actions = {
  upLater: value => (state, actions) => {
    setTimeout(actions.up, 1000, value)
  },
  up: value => state => ({ count: state.count + value })
}
```

动作可以是 <samp>[async 异步方法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function)</samp>。 因为 <samp>async</samp> 方法返回一个 Promise 对象，而不是一个局部状态对象，你需要去调用另一个动作来更新状态。

```js
const actions = {
  upLater: () => async (state, actions) => {
    await new Promise(done => setTimeout(done, 1000))
    actions.up(10)
  },
  up: value => state => ({ count: state.count + value })
}
```

<a name="nested-actions" id="nested-actions"></a>
#### 嵌套动作

动作可以在命名空间（Namespaces）中进行嵌套。深度更新嵌套对象只需要在声明动作时使用相同路径到你希望更新的状态上即可。

```jsx
const state = {
  counter: {
    count: 0
  }
}

const actions = {
  counter: {
    down: value => state => ({ count: state.count - value }),
    up: value => state => ({ count: state.count + value })
  }
}
```

#### 互用性

The <samp>app</samp> function returns a copy of your actions where every function is wired to changes in the state. Exposing this object to the outside world can be useful to operate your application from another program or framework, subscribe to global events, listen to mouse and keyboard input, etc.

To see this in action, modify the example from [Getting Started](#getting-started) to save the wired actions to a variable and try using them. You should see the counter update accordingly.

```jsx
const main = app(state, actions, view, document.body)

setInterval(main.up, 250, 1)
setInterval(main.down, 500, 1)
```

<a name="view" id="view"></a>
### 视图

Every time your application state changes, the view function is called so that you can specify how you want the DOM to look based on the new state. The view returns your specification in the form of a plain JavaScript object known as a virtual DOM and Hyperapp takes care of updating the actual DOM to match it.

```js
import { h } from "hyperapp"

export const view = (state, actions) =>
  h("div", {}, [
    h("h1", {}, state.count),
    h("button", { onclick: () => actions.down(1) }, "-"),
    h("button", { onclick: () => actions.up(1) }, "+")
  ])
```

A virtual DOM is a description of what a DOM should look like using a tree of nested JavaScript objects known as virtual nodes. Think of it as a lightweight representation of the DOM. In the example, the view function returns and object like this.

```jsx
{
  nodeName: "div",
  attributes: {},
  children: [
    {
      nodeName: "h1",
      attributes: {},
      children: 0
    },
    {
      nodeName: "button",
      attributes: { ... },
      children: "-"
    },
    {
      nodeName:   "button",
      attributes: { ... },
      children: "+"
    }
  ]
}
```

The virtual DOM model allows us to write code as if the entire document is thrown away and rebuilt on each change, while we only update what actually changed. We try to do this in the least number of steps possible, by comparing the new virtual DOM against the previous one. This leads to high efficiency, since typically only a small percentage of nodes need to change, and changing real DOM nodes is costly compared to recalculating the virtual DOM.

It may seem wasteful to throw away the old virtual DOM and re-create it entirely on every update — not to mention the fact that at any one time, Hyperapp is keeping two virtual DOM trees in memory, but as it turns out, browsers can create hundreds of thousands of objects very quickly. On the other hand, modifying the DOM is several orders of magnitude more expensive.

<a name="mounting" id="mouting"></a>
### 挂载

To mount your application in a page, we need a DOM element. This element is referred to as the application container. Applications built with Hyperapp always have a single container.

```jsx
app(state, actions, view, container)
```

Hyperapp will also attempt to reuse existing elements inside the container enabling SEO optimization and improving your sites time-to-interactive. The process consists of serving a fully rendered page together with your application. Then instead of throwing away the existing content, we'll turn your DOM nodes into an interactive application out of the box.

This is how we can recycle server-rendered content out the counter example from before. See [Getting Started](#getting-started) for the application code.

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script defer src="bundle.js"></script>
</head>

<body>
  <div>
    <h1>0</h1>
    <button>-</button>
    <button>+</button>
  </div>
</body>
</html>
```

### 组件（Components）

A component is a pure function that returns a virtual node. Unlike the view function, components are not wired to your application state or actions. Components are dumb, reusable blocks of code that encapsulate markup, styles and behaviors that belong together.

Here's a taste of how to use components in your application. The application is a typical To-Do manager. Go ahead and [try it online here](https://codepen.io/hyperapp/pen/zNxRLy).

```jsx
import { h } from "hyperapp"

const TodoItem = ({ id, value, done, toggle }) => (
  <li
    class={done && "done"}
    onclick={() =>
      toggle({
        value: done,
        id: id
      })
    }
  >
    {value}
  </li>
)

export const view = (state, actions) => (
  <div>
    <h1>Todo</h1>
    <ul>
      {state.todos.map(({ id, value, done }) => (
        <TodoItem id={id} value={value} done={done} toggle={actions.toggle} />
      ))}
    </ul>
  </div>
)
```

If you don't know all the attributes that you want to place in a component ahead of time, you can use the [spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator). Note that Hyperapp components can return multiple elements as in the following example. This technique lets you group a list of children without adding extra nodes to the DOM.

```jsx
const TodoList = ({ todos, toggle }) =>
  todos.map(todo => <TodoItem {...todo} toggle={toggle} />)
```

#### 懒加载组件

Components can only receive attributes and children from their parent component. Similarly to the top-level view function, lazy components are passed your application global state and actions. To create a lazy component, return a view function from a regular component.

```jsx
import { h } from "hyperapp"

export const Up = ({ by }) => (state, actions) => (
  <button onclick={() => actions.up(by)}>+ {by}</button>
)

export const Down = ({ by }) => (state, actions) => (
  <button onclick={() => actions.down(by)}>- {by}</button>
)

export const Double = () => (state, actions) => (
  <button onclick={() => actions.up(state.count)}>+ {state.count}</button>
)

export const view = (state, actions) => (
  <main>
    <h1>{state.count}</h1>
    <Up by={2} />
    <Down by={1} />
    <Double />
  </main>
)
```

#### 子组件

Components receive their children elements via the second argument allowing you and other components pass arbitrary children down to them.

```jsx
const Box = ({ color }, children) => (
  <div class={`box box-${color}`}>{children}</div>
)

const HelloBox = ({ name }) => (
  <Box color="green">
    <h1 class="title">Hello, {name}!</h1>
  </Box>
)
```

## 支持的属性

Supported attributes include [HTML attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes), [SVG attributes](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute), [DOM events](https://developer.mozilla.org/en-US/docs/Web/Events), [Lifecycle Events](#lifecycle-events), and [Keys](#keys). Note that non-standard HTML attribute names are not supported, <samp>onclick</samp> and <samp>class</samp> are valid, but <samp>onClick</samp> or <samp>className</samp> are not.

### Styles

The <samp>style</samp> attribute expects a plain object rather than a string as in HTML.
Each declaration consists of a style name property written in <samp>camelCase</samp> and a value. CSS variables are currently not supported. See [#612](https://github.com/hyperapp/hyperapp/pull/612) for options.

Individual style properties will be diffed and mapped against <samp>[HTMLElement.style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style)</samp> property members of the DOM element - you should therefore use the JavaScript style object [property names](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Properties_Reference), e.g. <samp>backgroundColor</samp> rather than <samp>background-color</samp>.

```jsx
import { h } from "hyperapp"

export const Jumbotron = ({ text }) => (
  <div
    style={{
      color: "white",
      fontSize: "32px",
      textAlign: center,
      backgroundImage: `url(${imgUrl})`
    }}
  >
    {text}
  </div>
)
```

### 生命周期事件（Events)

You can be notified when elements managed by the virtual DOM are created, updated or removed via lifecycle events. Use them for animation, data fetching, wrapping third party libraries, cleaning up resources, etc.

#### oncreate

This event is fired after the element is created and attached to the DOM. Use it to manipulate the DOM node directly, make a network request, create a slide/fade in animation, etc.

```jsx
import { h } from "hyperapp"

export const Textbox = ({ placeholder }) => (
  <input
    type="text"
    placeholder={placeholder}
    oncreate={element => element.focus()}
  />
)
```

#### onupdate

This event is fired every time we update the element attributes. Use <samp>oldAttributes</samp> inside the event handler to check if any attributes changed or not.

```jsx
import { h } from "hyperapp"

export const Textbox = ({ placeholder }) => (
  <input
    type="text"
    placeholder={placeholder}
    onupdate={(element, oldAttributes) => {
      if (oldAttributes.placeholder !== placeholder) {
        // Handle changes here!
      }
    }}
  />
)
```

#### onremove

This event is fired before the element is removed from the DOM. Use it to create slide/fade out animations. Call <samp>done</samp> inside the function to remove the element. This event is not called in its child elements.

```jsx
import { h } from "hyperapp"

export const MessageWithFadeout = ({ title }) => (
  <div onremove={(element, done) => fadeout(element).then(done)}>
    <h1>{title}</h1>
  </div>
)
```

#### ondestroy

This event is fired after the element has been removed from the DOM, either directly or as a result of a parent being removed. Use it for invalidating timers, canceling a network request, removing global events listeners, etc.

```jsx
import { h } from "hyperapp"

export const Camera = ({ onerror }) => (
  <video
    poster="loading.png"
    oncreate={element => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(stream => (element.srcObject = stream))
        .catch(onerror)
    }}
    ondestroy={element => element.srcObject.getTracks()[0].stop()}
  />
)
```

### 标识符（Keys）

Keys helps identify nodes every time we update the DOM. By setting the <samp>key</samp> property on a virtual node, you declare that the node should correspond to a particular DOM element. This allow us to re-order the element into its new position, if the position changed, rather than risk destroying it.

```jsx
import { h } from "hyperapp"

export const ImageGallery = ({ images }) =>
  images.map(({ hash, url, description }) => (
    <li key={hash}>
      <img src={url} alt={description} />
    </li>
  ))
```

Keys must be unique among sibling-nodes. Don't use an array index as key, if the index also specifies the order of siblings. If the position and number of items in a list is fixed, it will make no difference, but if the list is dynamic, the key will change every time the tree is rebuilt.

```jsx
import { h } from "hyperapp"

export const PlayerList = ({ players }) =>
  players
    .slice()
    .sort((player, nextPlayer) => nextPlayer.score - player.score)
    .map(player => (
      <li key={player.username} class={player.isAlive ? "alive" : "dead"}>
        <PlayerProfile {...player} />
      </li>
    ))
```
