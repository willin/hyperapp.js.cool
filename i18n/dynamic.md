# 动态加载

在插件基础上进行扩充完善。参考：

```js
// i18n.js
import i18n from 'hyperapp-i18n';
import { http } from '@hyperapp/fx';

const { state, actions } = i18n({
  'zh-CN': {
    'test': '中文'
  },
  'en-US': {}
}, 'zh-CN');

const load = (locale) => http(`/locale?locale=${locale}`, 'loaded');
/*
假设接口返回数据结构：
{
  status: 1,
  data: {
    'en-US': {
      test: 'English'
    }
  }
}

*/
const loaded = ({ data }) => {
  const [locale = false] = Object.keys(data);
  // locale 不存在，根据后台接口进行异常捕获
  if(!locale) return undefined;
  const messages = data[locale];
  return { locale, messages };
}

Object.assign(actions, {
  load,
  loaded
});

export { state, actions };
```

App.js 使用基本保持不变：

```js
// app.js
import { app, h } from 'hyperapp';
// 添加 FX
import { withFx } from '@hyperapp/fx';
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

const main = withFx(app)(state, actions, view, document.body);
// 使用新的 load 方法异步加载
main.i18n.load('en-US');
```
