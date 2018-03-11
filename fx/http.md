# http

## 如果你还在用 IE 之类复古的浏览器

可以使用 `@airx/request` 这个库。

示例：

```js
const mr = require('@airx/request');
// import mr from '@airx/request';
// mr means for mini-request

mr.get({
  url: '/'
}).then((data) => {
  console.log(data);
}).catch((err) => {
  console.error(err);
});

mr.post({
  url: '/',
  headers: {
    'Content-Type': 'application/json'
  },
  data: JSON.stringify({username:'xxx', password: 'xxx'})
}).then((data) => {
  console.log(data);
}).catch((err) => {
  console.error(err);
});
```

可以将这个库封装为一个效果（类似于 Action）。

```js
import mr from '@airx/request';
import { action } from '@hyperapp/fx';

export const http = (url, handler, {
  method: 'GET',
  error: '',
  ...args
}={}) => {
  return mr[method]({
    url,
    ...args
  })
  .then(data=> action(handler, data))
  .catch(err=> {
    if(error !== '') {
      return action(error, err);
    }
  });
}
```

大致应该是这样，上面这一段是凭感觉写的，不确定对不对。实际使用的时候注意测试一下。

---

p.s.

源码只有 44 行，附在这里，可以借鉴一下其实现的思想——“Write Less, Do More.”。

```js
const methods = ['get', 'delete', 'head', 'options', 'post', 'put', 'patch'];

const getDefer = () => {
  const deferred = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
};

const base = (method = 'GET', url = '/', headers = {}, data = false, timeout = 5000) => {
  const deferred = getDefer();
  let request = new XMLHttpRequest();
  request.open(method, url, true);
  // Set Headers
  Object.keys(headers).forEach((name) => {
    request.setRequestHeader(name, headers[name]);
  });
  // Handle Response
  request.onreadystatechange = function Response() {
    if (this.readyState === 4) {
      if (this.status >= 200 && this.status < 400) {
        deferred.resolve(this.responseText);
      } else {
        deferred.reject(this.responseText);
      }
    }
  };
  request.timeout = timeout;

  if (data) {
    request.send(data);
  } else {
    request.send();
  }

  request = null;
  return deferred.promise;
};

methods.forEach((method) => {
  exports[method] = ({
    url, headers, data, timeout
  }) => base(method.toUpperCase(), url, headers, data, timeout);
});
```
