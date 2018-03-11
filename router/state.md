# State 传递

## 修改现有路由

原有路由：

```js
// route
const Home = ({ match, location }) => (<h2>Home</h2>);
// view
const view = state => (
  <div>
    <Route path="/" render={Home} />
  </div>
);
```

路由只有两个参数传进来，没有办法直接 State 和 Actions，多嵌套一层方法，修改为：

```js
// route
const Home = ({ state }) => ({ match, location }) => (<h2>Home</h2>);
// view
const view = state => (
  <div>
    <Route path="/" render={Home({state})} />
  </div>
);
```

这样，就能将 `state` 或者其他参数传递进路由里来了。

## 重写路由组件

这里只是给一个思路，用于其他类似的场景，原有组件无法胜任完整需求时，对其进行简单重构。后续国际化（i18n）章节中还会有类似的例子进行介绍。

```js
// 参考 Route 源码 https://github.com/hyperapp/router/blob/master/src/Route.js 进行修改
import { parseRoute } from "@hyperapp/router/src/parseRoute";

export const Route = ({
  path,
  location = window.location,
  parent = false,
  ...props
} = {}) => {
  const match = parseRoute(path, location.pathname, {
    exact: !parent
  });

  return (
    match &&
    props.render({
      match,
      location,
      ...props
    })
  );
};
```
