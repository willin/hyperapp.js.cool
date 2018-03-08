# Module 命令

本章节主要讲 `require / module.exports` 及 `import / export` 的区别。


## `export default` 的优势

```js
// test.js
export default 1;
export const test2 = 2;
// app.js
import test1, { test2 } from './test';
console.log(test1, test2);
// 1 2
```

而在 UMD 模式中：

```js
module.exports = 1;
exports.test2 = 2;
// 或
module.exports.test2 = 2;
```

`test2` 则不能被引用到。

## `require` 的优势

可以配合结构赋值：

```js
// test.js
module.exports = {
  parent: {
    sub: {
      test1: 1,
      test2: 2
    }
  }
};
// app.js
const { parent: { sub: { test1, test2 } } } = require('./test');
console.log(test1, test2);
// 1 2
```

而使用 ES6 import 语法则无法实现。
