# <img height=24 src=https://cdn.rawgit.com/jorgebucaran/f53d2c00bafcf36e84ffd862f0dc2950/raw/882f20c970ff7d61aa04d44b92fc3530fa758bc0/Hyperapp.svg> @hyperapp/router

> 本文翻译自 [Github](https://github.com/hyperapp/hyperapp) 项目 v0.4.1 主页介绍，后续章节针对一些特性及最佳实践进行展开介绍。

@hyperapp/router 使用 [History API](https://developer.mozilla.org/zh-CN/docs/Web/API/History) 提供 [Hyperapp](https://github.com/hyperapp/hyperapp) 的路由申明。

[访问在线示例](http://hyperapp-router.surge.sh)。

```jsx
import { h, app } from "hyperapp"
import { Link, Route, location } from "@hyperapp/router"

const Home = () => <h2>Home</h2>
const About = () => <h2>About</h2>
const Topic = ({ match }) => <h3>{match.params.topicId}</h3>
const TopicsView = ({ match }) => (
  <div key="topics">
    <h2>Topics</h2>
    <ul>
      <li>
        <Link to={`${match.url}/components`}>Components</Link>
      </li>
      <li>
        <Link to={`${match.url}/single-state-tree`}>Single State Tree</Link>
      </li>
      <li>
        <Link to={`${match.url}/routing`}>Routing</Link>
      </li>
    </ul>

    {match.isExact && <h3>Please select a topic.</h3>}

    <Route parent path={`${match.path}/:topicId`} render={Topic} />
  </div>
)

const state = {
  location: location.state
}

const actions = {
  location: location.actions
}

const view = state => (
  <div>
    <ul>
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/about">About</Link>
      </li>
      <li>
        <Link to="/topics">Topics</Link>
      </li>
    </ul>

    <hr />

    <Route path="/" render={Home} />
    <Route path="/about" render={About} />
    <Route parent path="/topics" render={TopicsView} />
  </div>
)

const main = app(state, actions, view, document.body)

const unsubscribe = location.subscribe(main.location)
```

## 安装

从 [CDN](https://unpkg.com/@hyperapp/router) 上下载压缩的库。

```html
<script src="https://unpkg.com/@hyperapp/router"></script>
```

然后从 `router` 引用。

```jsx
const { Link, Route, location } = router
```

或者通过 NPM、 Yarn 进行安装。

```bash
npm i @hyperapp/router
```

然后使用模块打包工具（如：[Rollup](https://rollupjs.org) 或 [Webpack](https://webpack.js.org)），像你使用其他模块一样。

```jsx
import { Link, Route, location } from "@hyperapp/router"
```

## 使用

添加 `location` 模块到你的状态（State）和动作（Actions）中，然后启动应用。

```jsx
const state = {
  location: location.state
}

const actions = {
  location: location.actions
}

const main = app(
  state,
  actions,
  (state, actions) => <Route render={() => <h1>Hello!</h1>} />,
  document.body
)
```

然后执行 `subscribe` 方法来侦听路由改变事件。

```js
const unsubscribe = location.subscribe(main.location)
```

## 组件

### 路由（Route）

当路径（Path）匹配当前 [window location](https://developer.mozilla.org/zh-CN/docs/Web/API/Location) 时渲染一个组件。 没有设定路径的路由永远被匹配。 路由可以嵌套自路由。

```jsx
<Route path="/" render={Home} />
<Route path="/about" render={About} />
<Route parent path="/topics" render={TopicsView} />
```

#### parent

该属性表此路由下包含自路由。

<a name="path" id="path"></a>

#### path

匹配该路由的路径。

#### render

匹配时渲染的组件。

### 渲染属性（Render Props）

渲染组件将会传递以下的属性。

```jsx
const RouteInfo = ({ location, match }) => (
  <div>
    <h3>Url: {match.url}</h3>
    <h3>Path: {match.path}</h3>
    <ul>
      {Object.keys(match.params).map(key => (
        <li>
          {key}: {match.params[key]}
        </li>
      ))}
    </ul>
    <h3>Location: {location.pathname}</h3>
  </div>
)
```

#### location

参考 [window location](https://developer.mozilla.org/zh-CN/docs/Web/API/Location).

#### match.url

URL 的匹配部分，用于组装路由内部链接。 参考 [链接（Link）](#link)。

#### match.path

路由 [路径（Path）](#path).

#### match.isExact

指示给定路径是否正确匹配 URL。

<a name="link" id="link"></a>

### 链接（Link）

使用链接组件来更新当前的 [window location](https://developer.mozilla.org/zh-CN/docs/Web/API/Location)，并不刷新导航到对应的页面。新的路径（location）使用 `history.pushState` 被推送到历史栈中。

```jsx
const Navigation = (
  <ul>
    <li>
      <Link to="/">Home</Link>
    </li>
    <li>
      <Link to="/about">About</Link>
    </li>
    <li>
      <Link to="/topics">Topics</Link>
    </li>
  </ul>
)
```

#### to

链接的目标 URL。

### 重定向（Redirect）

使用重定向组件来跳转到一个新位置。新位置使用 `history.replaceState` 会在历史栈中覆盖当前的位置。

```jsx
const Login = ({ from, login, redirectToReferrer }) => props => {
  if (redirectToReferrer) {
    return <Redirect to={from} />
  }

  return (
    <div>
      <p>You must log in to view the page at {from}.</p>
      <button
        onclick={() => {
          auth.authenticate(userId => login(userId))
        }}
      >
        Log in
      </button>
    </div>
  )
}
```

#### to

重定向的目标 URL。

#### from

覆盖的之前路径。 参考 [location.previous](#previous)。

### 开关（Switch）

当您希望确保只有几个路径中的一个被呈现时，请使用开关组件。它总是呈现第一个匹配的子元素。

```jsx
const NoMatchExample = (
  <Switch>
    <Route path="/" render={Home} />
    <Route
      path="/old-match"
      render={() => <Redirect from="/old-match" to="/will-match" />}
    />
    <Route path="/will-match" render={WillMatch} />
    <Route render={NoMatch} />
  </Switch>
)
```

## 模块（Modules）

### location

#### pathname

同 `window.location.pathname`。

<a name="previous" id="previous"></a>

#### previous

以前的 `location.pathname`。对于离开一个受保护的路由返回来源（Referrer）地址有用。

#### go(url)

导航到指定 URL。
