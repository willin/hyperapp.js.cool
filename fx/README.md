# <img height=24 src=https://cdn.rawgit.com/jorgebucaran/f53d2c00bafcf36e84ffd862f0dc2950/raw/882f20c970ff7d61aa04d44b92fc3530fa758bc0/Hyperapp.svg> @hyperapp/fx

> 本文翻译自 [Github](https://github.com/hyperapp/fx) 项目 v0.6.1 主页介绍，后续章节针对一些特性及最佳实践进行展开介绍。

一个 [Hyperapp](https://github.com/hyperapp/hyperapp) 高阶应用（`app`），允许你编写 [_effects as data_](https://youtu.be/6EdXaWfoslc)，灵感来自 inspired by [Elm Commands](https://guide.elm-lang.org/architecture/effects)。 使用 _effects as data_ 将给你的程序带来很多方面的益处。

P.S. _effects as data_： 效果即数据。

* **纯净（Purity）** — 你的所有动作（Actions）变成了纯粹的方法。因为你只是返回了你运行的效果描述，而不是直接执行它们。
* **测试（Testing）** — 纯函数是非常容易测试的，因为他们总是返回相同参数的数据。
* **调试（Debugging）** — 在运行时数据对故障排除更有用，因为可以对远程取证进行日志记录、序列化和传输。 异步调试和其他效果代码不触及调试器。

## 起步

下面介绍了如何使用两种最常见的效果来出发动作和生成 HTTP 请求。该应用程序显示鼓舞人心的名人名言，每次用户点击当前的条目获取下一条。访问 [在线示例](https://codepen.io/okwolf/pen/QQYaad?editors=0010)。

```js
import { h, app } from "hyperapp"
import { withFx, http, action } from "@hyperapp/fx"

const state = {
  quote: "Click here for quotes"
}

const actions = {
  getQuote: () => [
    action("setQuote", "..."),
    http(
      "https://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1",
      "quoteFetched"
    )
  ],
  quoteFetched: ([{ content }]) => action("setQuote", content),
  setQuote: quote => ({ quote })
}

const view = state => <h1 onclick={action("getQuote")}>{state.quote}</h1>

withFx(app)(state, actions, view, document.body)
```

## 安装

使用 NPM 或 Yarn 安装。

```bash
npm i @hyperapp/fx
```

然后使用模块打包工具（如：[Rollup](https://rollupjs.org) 或 [Webpack](https://webpack.js.org)），像你使用其他模块一样。

```js
import { withFx } from "@hyperapp/fx"
```

如果你不想建立一个编译环境，你可以从CDN（如：[unpkg.com](https://unpkg.com/@hyperapp/fx)）下载，并通过 `window.fx` 全局对象使用。

```html
<script src="https://unpkg.com/@hyperapp/fx"></script>
```

## 概述

### `withFx`

```js
EffectsConfig = {
  [effectName]: (
    props: object,
    getAction: (name: string) => Action
  ) => undefined
}
withFx = App => App | EffectsConfig => App => App
```

高阶 `app` 方法允许动作（Actions）返回一个数组，稍后作为效果被运行。

示例：

```js
import { withFx } from "@hyperapp/fx"

const state = {
  // ...
}

const actions = {
  foo: () => [
    // ... effects go here
  ],
  bar: () => // or a single effect can go here
}

withFx(app)(state, actions).foo()
```

自定义效果在编译你的 `app` 执行传入一个对象到 `withFx`：

```js
import { withFx } from "@hyperapp/fx"

const state = {
  // ...
}

const actions = {
  /*
    You will probably want to write a helper function for returning these
    similar to the built-in effects
  */
  foo: () => [
    /*
      type of effect for effects data
      must match key used in custom effect object below
    */
    "custom",
    {
      // ... props go here
    }
  ]
}

withFx({
  // key in this object must match type used in effect data above
  custom(props, getAction) {
    /*
      use props to get the props used when creating the effect
      use getAction for firing actions when appropriate
    */
  }
})(app)(state, actions).foo()
```

重用现有的效果类型将覆盖内置的效果类型。

### 效果数据（Effects data）

```js
EffectTuple = [type: string, props: object]
Effect = EffectTuple | EffectTuple[] | Effect[]
```

效果总是表示为数组。对于单个效果，这个数组表示包含效果类型字符串的元组和包含此效果属性的对象。对于多个效果，每个数组元素要么是一个效果元组，要么是这些元组的数组，它们可能是嵌套的。这意味着影响组合构成。空数组被视为非运算效果，跳过。

### `action`

```js
action = (name: string, data?: any) => EffectTuple
```

描述一个效果，触发另一个动作（Action），可选参数 `data`。

示例：

```js
import { withFx, action } from "@hyperapp/fx"

const state = {
  // ...
}

const actions = {
  foo: () => [
    action("bar", { message: "hello" }),
    action("baz", { message: "hola" }),
    // ... other effects
  ],
  bar: data => {
    // data will have { message: "hello" }
  },
  baz: data => {
    // data will have { message: "hola" }
  }
}

withFx(app)(state, actions).foo()
```

请注意，您也可以使用单个操作效果而不使用数组包装器，而嵌套的动作（Actions）可以通过用点分隔来调用：

```js
import { withFx, action } from "@hyperapp/fx"

const state = {
  // ...
}

const actions = {
  foo: () => action("bar.baz", { message: "hello" }),
  bar: {
    baz: data => {
      // data will have { message: "hello" }
    }
  }
}

withFx(app)(state, actions).foo()
```

同样的惯例也适用于所有其他效果。

还要注意动作（和其他效果）可以用于处理视图（View）中的属性：

```js
import { withFx, action } from "@hyperapp/fx"

const state = {
  // ...
}

const actions = {
  foo: data => {
    /*
      data will have { message: "hello" }
      when the button is clicked
    */
  }
}

const view = () =>
  h("button", {
    onclick: action("foo", { message: "hello" })
  })

withFx(app)(state, actions, view, document.body)
```

### `frame`

```js
frame = (action: string) => EffectTuple
```

描述一个效果，从内部 [`requestAnimationFrame`](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame) 执行动作，同时渲染触发的动作也会执行。 一个相对的时间戳会被当做 `data` 参数提供。 如果你希望持续更新状态（如：游戏中），记得返回值中要包含另一个 `frame`。

示例：

```js
import { withFx, action, frame } from "@hyperapp/fx"

const state = {
  time: 0,
  delta: 0
}

const actions = {
  init: () => frame("update"),
  update: time => [
    action("incTime", time),

    /*
      ...
      Other actions to update the state based on delta time
      ...

      End with a recursive frame effect to perform the next update
    */
    frame("update")
  ],
  incTime: time => ({ time: lastTime, delta: lastDelta }) => ({
    time,
    delta: time && lastTime ? time - lastTime : lastDelta
  })
}

withFx(app)(state, actions).init()
```

### `delay`

```js
delay = (duration: number, action: string, data?: any) => EffectTuple
```

描述一个使用 [`setTimeout`](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/setTimeout) 延迟执行其他动作的效果， 可选 `data` 参数。

示例：

```js
import { withFx, delay } from "@hyperapp/fx"

const state = {
  // ...
}

const actions = {
  startTimer: () => delay(60000, "alarm", { name: "minute timer" }),
  alarm: data => {
    /*
      This action will run after a minute delay
      data will have { name: "minute timer" }
    */
  }
}

withFx(app)(state, actions).startTimer()
```

### `time`

```js
time = (action: string) => EffectTuple
```

描述一个效果使用 [`performance.now`](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance/now) 提供当前时间戳到一个动作。 时间戳被当做 `data` 参数提供给动作。

示例：

```js
import { withFx, time } from "@hyperapp/fx"

const state = {
  // ...
}

const actions = {
  foo: () => time("bar"),
  bar: timestamp => {
    // use timestamp
  }
}

withFx(app)(state, action).foo()
```

### `log`

```js
log = (...args: any[]) => EffectTuple
```

描述一个含参数执行 [`console.log`](https://developer.mozilla.org/zh-CN/docs/Web/API/Console/log) 的效果。 对于开发和调试很有用。 不推荐到产品环境。

示例：

```js
import { withFx, log } from "@hyperapp/fx"

const state = {
  // ...
}

const actions = {
  foo: () => log(
    "string arg",
    { object: "arg" },
    ["list", "of", "args"],
    someOtherArg
  )
}

withFx(app)(state, actions).foo()
```

### `http`

```js
http = (url: string, action: string, options?: object) => EffectTuple
```

描述一个发送 HTTP 请求的效果，使用 [`fetch`](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/fetch) API 来执行动作并获取响应。 如果你还在用远古的浏览器，如 IE 之类的，你会需要 [可用的](https://github.com/developit/unfetch) `fetch` [polyfills](https://github.com/github/fetch)。一个可选的 `options` 参数支持支持与 [`fetch`相同参数](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/fetch#Parameters) 附加以下属性：

| 属性   | 用法                                                                                                                                              | 默认值                            |
|------------|----------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------|
| `response` | Specify which [method to use on the response body](https://developer.mozilla.org/zh-CN/docs/Web/API/Body#Methods).                                 | `"json"`                           |
| `error`    | Action to call if there is a problem making the request or a [not-ok](https://developer.mozilla.org/zh-CN/docs/Web/API/Response/ok) HTTP response. | Same action as defined for success |

示例 HTTP GET 请求， JSON 返回：

```js
import { withFx, http } from "@hyperapp/fx"

const state = {
  // ...
}

const actions = {
  foo: () => http("/data", "dataFetched"),
  dataFetched: data => {
    // data will have the JSON-decoded response from /data
  }
}

withFx(app)(state, actions).foo()
```

示例 HTTP GET 请求， TEXT 返回：

```js
import { withFx, http } from "@hyperapp/fx"

const state = {
  // ...
}

const actions = {
  foo: () => http(
    "/data/name",
    "textFetched",
    { response: "text" }
  ),
  textFetched: data => {
    // data will have the response text from /data
  }
}

withFx(app)(state, actions).foo()
```

示例 HTTP POST 请求， JSON 请求内容及响应处理错误：

```js
import { withFx, http } from "@hyperapp/fx"

const state = {
  // ...
}

const actions = {
  login: form => http(
    "/login",
    "loginComplete",
    {
      method: "POST",
      body: form,
      error: "loginError"
    }
  ),
  loginComplete: loginResponse => {
    // loginResponse will have the JSON-decoded response from POSTing to /login
  },
  loginError: error => {
    // please handle your errors...
  }
}

withFx(app)(state, actions).login()
```

### `event`

```js
event = (action: string) => EffectTuple
```

描述捕获 [DOM Event](https://developer.mozilla.org/zh-CN/docs/Web/Events) 事件的效果。原始出发的事件会被当做动作的 `data` 参数提供。

```js
import { withFx, event } from "@hyperapp/fx"

const state = {
  // ...
}

const actions = {
  click: clickEvent => {
    // clickEvent has the props of the click event
  }
}

const view = () =>
  h("button", {
    onclick: event("click")
  })

withFx(app)(state, actions, view, document.body)
```

### `keydown`

```js
keydown = (action: string) => EffectTuple
```

描述捕获 [keydown](https://developer.mozilla.org/zh-CN/docs/Web/Events/keydown) 事件的效果。 [`KeyboardEvent`](https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent) 将会被作为动作 `data` 参数提供。

示例：

```js
import { withFx, keydown } from "@hyperapp/fx"

const state = {
  // ...
}

const actions = {
  init: () => keydown("keyPressed"),
  keyPressed: keyEvent => {
    // keyEvent has the props of the KeyboardEvent
  }
}

withFx(app)(state, actions).init()
```

### `keyup`

```js
keyup = (action: string) => EffectTuple
```

描述捕获 [keyup](https://developer.mozilla.org/zh-CN/docs/Web/Events/keyup) 事件的效果。 [`KeyboardEvent`](https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent) 将会被作为动作 `data` 参数提供。

示例：

```js
import { withFx, keyup } from "@hyperapp/fx"

const state = {
  // ...
}

const actions = {
  init: () => keyup("keyReleased"),
  keyReleased: keyEvent => {
    // keyEvent has the props of the KeyboardEvent
  }
}

withFx(app)(state, actions).init()
```

### `random`

```js
random = (action: string, min?: number, max?: number) => EffectTuple
```

描述在指定范围内[生成随机数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/random)的效果。如果不传入范围  `[min, max)` ，默认范围为：`[0, 1)`。随机数作为 `data` 参数传递给动作。

使用 [`Math.floor`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/floor) 如果你想要一个随机整数而不是浮点数。 记住，最大值 `max` 是排除在外的。确保你的最大值是期望的值 int + 1.

示例：

```js
import { withFx, random } from "@hyperapp/fx"

const state = {
  // ...
}

const actions = {
  // We use the max of 7 to include all values of 6.x
  foo: () => random("rollDie", 1, 7),
  rollDie: randomNumber => {
    const roll = Math.floor(randomNumber)
    // roll will be an int from 1-6
  }
}

withFx(app)(state, actions).foo()
```

### `debounce`

```js
debounce = (wait: number, action: string, data?: any) => EffectTuple
```

描述在等待延迟通过后调用动作的效果。每次调用动作时都会重置延迟。

示例：

```js
import { withFx, debounce } from "@hyperapp/fx"

const state = {
  // ...
}

const actions = {
  waitForLastInput: input => debounce(
    500,
    "search",
    { query: input }
  ),
  search: data => {
    /*
      This action will run after waiting
      for 500ms since the last call
      It will only be called once
      data will have { query: "hyperapp" }
    */
  }
}

const main = withFx(app)(state, actions)
main.waitForLastInput("hyper")
main.waitForLastInput("hyperapp")
```

### `throttle`

```js
throttle = (rate: number, action: string, data?: any) => EffectTuple
```

描述设置最大动作频率的效果，`rate`是每次调用的频率限制，单位毫秒。

示例：

```js
import { withFx, throttle } from "@hyperapp/fx"

const state = {
  // ...
}

const actions = {
  doExpensiveAction: param => throttle(
    500,
    "calculate",
    { foo: param }
  ),
  calculate: data => {
    /*
      This action will only run once per 500ms
      It will be run twice
      data will receive { foo: "foo" } and { foo: "baz" }
    */
  }
}

const main = withFx(app)(state, actions)
main.doExpensiveAction("foo")
main.doExpensiveAction("bar")
setTimeout(function() {
  main.doExpensiveAction("baz")
})
```

### `fxIf`

```js
EffectConditional = [boolean, EffectTuple]
effectsIf = EffectConditional[] => EffectTuple[]
```

将一组 `[boolean, EffectTuple]` 效果数组转变为只含有真值的数组。 这对有条件的效果出发提供了紧凑的句法糖。

示例：

```js
import { withFx, fxIf, action } from "@hyperapp/fx"

const state = {
  // ...
}

const actions = {
  foo: () => ({ running }) =>
    fxIf([
      [true, action("always")],
      [false, action("never")],
      [running, action("ifRunning")],
      [!running, action("ifNotRunning")]
    ])
}

withFx(app)(state, actions).foo()
```
