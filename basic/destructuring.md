# 解构赋值

## 数组使用

### 交换值

```js
let a = 1;
let b = 2;
[a, b] = [b, a];
```

### Spread 展开运算符

#### 合并数组

```js
const a = [1, 2, 3];
const b = [4, 5, 6];
const c = [...a, ...b];
```

## 对象使用

### Spread 展开运算符

#### 拆分对象

```js
const opts = {
  url: '/login',
  method: 'POST',
  data: {
    username: 'xxx',
    password: 'xxx',
  },
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000
};

const {url, method, ...args} = opts;
console.log(args);
// { data, headers, timeout }
```

## 数组与对象混用

### 请求结果列表取第一条

```js
const data = {
  status: 1,
  data: {
    tickets: [
      {
        tid: 1,
        title: 'test',
        body: 'test body'
      },
      // ...
    ]
  }
};

const { data: { tickets: [ ticket = {} ] } } = data;
// 其中：
// ticket = {} 给 ticket 赋默认值，如果外层对象可能为空或不存在，则也需要赋默认值
console.log(ticket);
```

参考资料：

- [Spread 语法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Spread_operator)
