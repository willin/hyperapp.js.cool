# <img height=24 src=https://cdn.rawgit.com/jorgebucaran/f53d2c00bafcf36e84ffd862f0dc2950/raw/882f20c970ff7d61aa04d44b92fc3530fa758bc0/Hyperapp.svg> hyperapp-i18n

> 本文翻译自 [Github](https://github.com/willin/hyperapp-i18n) 项目 v0.1.0 主页介绍，后续章节针对一些特性及最佳实践进行展开介绍。


## 安装

通过 NPM 或者 Yarn 进行安装。

```
npm i hyperapp-i18n
```

如果你不行创建构建环境，你可以从 CDN （如：[unpkg.com](https://unpkg.com/hyperapp-i18n)）下载，然后通过 `window.i18n` 对象使用。

```html
<script src="https://unpkg.com/hyperapp-i18n"></script>
```

## 使用

```js
// i18n.js
import i18n from 'hyperapp-i18n';

export const { state, actions } = i18n({
  'zh-CN': {
    hello: '你好'
  },
  'en-US': {
    hello: 'Hello'
  }
}, 'zh-CN');

// app.js
import { app, h } from 'hyperapp';
import * as i18n from './i18n';

const state = {
  i18n: i18n.state
};
const actions = {
  i18n: i18n.actions
};

const view = ({ i18n: { messages, locale } }) => (
  <div>
    <h2>Current Lang: {locale}</h2>
    <p>Test1: {messages.hello}</p>
  </div>
);

const main = app(state, actions, view, document.body);
main.i18n.set('en-US');
```

更多详情参考： <https://github.com/willin/hyperapp-i18n/tree/master/example>
