# graphql (封装)

基于 `http` 进行简单的封装完成：

```js
import { http } from '@hyperapp/fx';
/**
 * Graphql
 * @param {string} handler Data Handler
 * @param {obj} GraphQL Query  {query: string, variables: obj}
 * @param {string} errHandler Error Handler
 * @returns {Promise(obj)} data result
 * Example:
    graphql('fetchedData', { query: `{
      tickets(first: 10) {
        totalCount
      }
    }`});
 * Result Example: {"data":{"tickets":{"totalCount":24}}}
 */
export default (handler, { query, variables = undefined } = {}, errHandler = 'error') => http('/graphql', handler, {
  method: 'POST',
  body: JSON.stringify({
    query,
    variables
  }),
  headers: {
    'Content-Type': 'application/json'
  },
  error: errHandler
});
```

- handler 字符串，处理成功返回的回调动作（Action），必填
- {query: string, variables: obj} 对象，包含 query （必填） 和 variables 两个字段，其中 variables 默认为空
- errHandler 字符串，处理失败的回调动作（Action），默认为 error
