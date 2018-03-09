# <img height=24 src=https://cdn.rawgit.com/jorgebucaran/f53d2c00bafcf36e84ffd862f0dc2950/raw/882f20c970ff7d61aa04d44b92fc3530fa758bc0/Hyperapp.svg> Hyperapp

> 本文翻译自 [Github](https://github.com/hyperapp/hyperapp) 项目主页介绍，后续章节针对一些特性及最佳实践进行展开介绍。

Hyperapp 是一个构建 Web 应用的微型 JS 框架。

* **极小** — 我们已经积极地将需要理解的概念最小化，使之富有成效，同时保持与其他框架的一致性。
* **实用** — Hyperapp 坚持专注在函数式编程进行前端状态（State）管理， 以实用主义的态度考虑允许的副作用、异步行为（Actions）和 DOM 操作。
* **独立** — 麻雀虽小，五脏俱全。 Hyperapp 以一个虚拟 DOM 引擎来配合状态（State）管理，允许关键数据更新和生命周期事件（Events）——都无须额外依赖。

<a name="getting-started" id="getting-started"></a>
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

<samp>app</samp> 方法返回一个所有操作状态的动作的副本。 将这个对象暴露到外部可以对于其他程序或框架操作你的应用，订阅全局事件，侦听鼠标、键盘操作等很有用。

这里有个根据 [起步](#getting-started) 修改的示例，将动作保存到一个变量中并使用它们，你可以看到计数器相应的更新。

```jsx
const main = app(state, actions, view, document.body)

setInterval(main.up, 250, 1)
setInterval(main.down, 500, 1)
```

<a name="view" id="view"></a>
### 视图

每次应用状态更改时，视图方法会被调用，因此你可以指定 DOM 节点变成你期望的样子。视图用 js 对象形式返回你定义的虚拟 DOM， Hyperapp 来掌管更新匹配的实际 DOM。

```js
import { h } from "hyperapp"

export const view = (state, actions) =>
  h("div", {}, [
    h("h1", {}, state.count),
    h("button", { onclick: () => actions.down(1) }, "-"),
    h("button", { onclick: () => actions.up(1) }, "+")
  ])
```

虚拟 DOM 是描述 DOM 具体样子的嵌套 JS 对象（虚拟节点）的树。可以把它当做一个轻量级的 DOM 呈现。 在示例中， 视图方法返回的对象是像这个样子的：

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

虚拟 DOM 模型循序我们像变更产生时整个文档丢弃并重建的样子去书写代码，但我们实际值更新了变化的部分。我们视图通过比较新旧虚拟 DOM 尽量减少步骤。由于通常只有一小部分的节点需要变更，而改变实际 DOM 节点的开销会比虚拟节点大很多，所以这会变得更加高效。

可能看上去每次更新时丢弃虚拟 DOM 并整体重建是一种浪费，但没提到的是，实际上在任何时间， Hyperapp 同时在内存中维护两个虚拟 DOM 树，而且事实上，浏览器可以很快的创建成百上千的对象。 另一方面，修改 DOM 的代价要高出几个数量级。

<a name="mounting" id="mouting"></a>
### 挂载

在页面上挂载你的应用需要一个 DOM 元素。这个元素会被当做应用的容器。 Hyperapp 应用始终需要一个单一的容器挂载。ntainer. Applications built with Hyperapp always have a single container.

```jsx
app(state, actions, view, container)
```

Hyperapp 会尝试复用现有容器内部元素来进行 SEO 优化及提升网站交互时间。这个处理过程包含了与应用程序一起提供完全呈现的页面。然后，我们不再将现有内容丢弃，而是将您的 DOM 节点变成一个交互式应用程序。

这就是我们如何从以前的反例中回收服务器提供的内容。查看[起步](#getting-started)的应用程序代码。

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

组件是返回虚拟节点的纯函数。与视图函数不同，组件没有连接到应用程序状态或操作。组件是哑的、可重用的代码块，它们封装属于一起的标记、样式和行为。

下面介绍一下如何在应用程序中使用组件。经典的 TO-DO 管理，[在线运行示例](https://codepen.io/hyperapp/pen/zNxRLy)。

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

如果您不知道要提前在组件中放置的所有属性，可以使用[展开（Spread）语法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Spread_operator)。

注意，Hyperapp组件可以返回多个元素，如以下示例。此技术允许您在不添加 DOM 的额外节点的情况下分组子列表。

```jsx
const TodoList = ({ todos, toggle }) =>
  todos.map(todo => <TodoItem {...todo} toggle={toggle} />)
```

#### 懒加载组件

组件只能从父组件接收属性和子元素。类似于顶层视图函数，延迟组件通过您的应用程序全局状态和动作。要创建一个延迟组件，请从一个常规组件返回一个视图函数。

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

组件通过第二个参数接收其子元素，从而允许您和其他组件将任意的子组件传递给它们。

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

支持的属性包括 [HTML 属性](https://developer.mozilla.org/ zh-CN/docs/Web/HTML/Attributes)、 [SVG 属性](https://developer.mozilla.org/ zh-CN/docs/Web/SVG/Attribute)、 [DOM events](https://developer.mozilla.org/ zh-CN/docs/Web/Events)、 [生命周期事件](#lifecycle-events) 和 [标识符](#keys)。

注意：非标准 HTML 属性是不支持的， <samp>onclick</samp> 和 <samp>class</samp> 是合法的，但 <samp>onClick</samp> 或 <samp>className</samp> 则不是。

### 样式（Style）

<samp>style</samp> 标签传入一个 JS 对象二部是 HTML 字符串。每个包含的样式申明名称属性需要以驼峰（<samp>camelCase</samp>）命名。暂不支持 CSS 变量。参考 [#612](https://github.com/hyperapp/hyperapp/pull/612)。

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

当通过生命周期事件创建、更新或删除虚拟 DOM 管理的元素时，您可以得到通知。将它们用于动画、数据获取、包装第三方库、清理资源等。

#### oncreate

元素创建并附加到 DOM 后该事件被触发。用它直接操作 DOM 节点，发起网络请求，创建 `Slide/Fade in` 动画等等。

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

每次更新元素属性时触发，使用 <samp>oldAttributes</samp> 在事件处理时检查属性是否产生变化。

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

在元素从 DOM 中删除前触发。 使用它来创建 `Slide/Fade out`动画。 调用 <samp>done</samp> 内部方法来删除元素。在它的子元素中，该方法将不被调用。

```jsx
import { h } from "hyperapp"

export const MessageWithFadeout = ({ title }) => (
  <div onremove={(element, done) => fadeout(element).then(done)}>
    <h1>{title}</h1>
  </div>
)
```

#### ondestroy

在元素从 DOM 中删除后触发， 直接或作为父级元素删除的结果。 用它来取消定时器、取消网络请求、移除全局事件侦听等。

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

通过对虚拟节点设定 <samp>key</samp> 属性，唯一确定一个 DOM 元素，您声明该节点应该对应于特定的DOM元素。这允许如果位置改变了我们将元素重新排列到它的新位置，而不是破坏它。
```jsx
import { h } from "hyperapp"

export const ImageGallery = ({ images }) =>
  images.map(({ hash, url, description }) => (
    <li key={hash}>
      <img src={url} alt={description} />
    </li>
  ))
```

同级节点之间的标识符必须是唯一的。如果索引指定兄弟的顺序，则不要使用数组索引作为标识符。如果列表中的项的位置和数量是固定的，则不会有任何差别，但是如果列表是动态的，那么每次重建树时标识符都会发生变化。

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
