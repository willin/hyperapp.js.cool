# fxIf

## 不推荐使用的场景

如：

```js
export const keyEnterReply = e => fxIf([
  [e.keyCode === 13, action('submitReply')]
]);
```

可使用方案：

```js
export const keyEnterReply = e => e.keyCode === 13 && action('submitReply')
```

