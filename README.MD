# 开始

根据 swaggerapi 的接口配置信息 生成含有 JSDoc 注释的 请求代码，对 vscode 的提示友好，入参和返回参数的代码提示

` npm install swagger-jsservice-generator --save-dev`

# 使用

```javascript
// swagger.js
const path = require('path');
const parseSwagger = require('swagger-jsservice-generator');

const { generate, generateApi } = parseSwagger({
  url: 'http://swagger.xxxx', // 这里会自动拼接上 /swagger-resources
  module: 'user',
  output: path.resolve(__dirname, '../api'),
  apiLibName: 'axios',
  apiLibPath: 'Axios', // 如果有get请求则需要封装一下，请求接口参数目前固定为 url,data
  convert: {
    integer: 'number',
    delete: 'remove', // method 为delete 的时候会转为axios.remove(url,data),避免关键字问题
  },
});

// 生成所有api，传递url，不用传apiUrl和module
generate();
// 生成单个api,需要传递 apiUrl和module，module时文件名
generateApi();
```

```js
node swagger.js
```

```javascript
//output: api/user.js;
// 如果使用了restful风格，需要对axios包装下，
// 包装格式如下：
// AxiosUtil.[get|post|delete|put](url,data); url 和 data 是固定的生成方式，因此需要包装统一处理
import axios from 'axios';
/**
 * some description
 * @param {SomeVo} data  - 请求参数，任何请求都只接受一个data对象作为入参
 * @param {Promise<DTO>} returnObject
 *
 **/
export function getDataList(data) {
  return axios.get('/data/list', data);
}
```

# 参数说明

| Name                 | Type                                        | Desc                                                                                                              |
| -------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| url                  | string                                      | swagger 文档 baseurl                                                                                              |
| apiUrl               | string                                      | swagger 文档单个服务接口路径 ，和 module 要一起用                                                                 |
| output               | string                                      | 写入文件目录                                                                                                      |
| module               | string                                      | 在微服务中，如果只想生成单个模块，可以配置该字段，作为文件名称使用，如果生成所有模块，则取模块名称                |
| resource             | string                                      | swagger 的接口描述配置接口 默认为 /swagger-resources                                                              |
| apiLibName           | string                                      | 请求库名称，入如：axios                                                                                           |
| apiLibPath           | string                                      | 请求库地址 ，如:axios                                                                                             |
| convert              | object                                      | 对关键字进行转化，例如 integer 转为 number                                                                        |
| resourceCallback     | function(res)                               | 针对不同 swagger 版本，接口配置的响应数据不同，这里返回 urls 数数组即可，包含对 url 的描述对象数组                |
| handleMethodCallback | function({ method, desc, key, paths, res }) | 需要返回 {method,url，description,parameters,requestBody,responses} 对象                                          |
| requestCompleted     | function(res)                               | 完全处理响应内容，需要返回{urls:{method,responses,requestBody,url,description,parameters}[],res},res 为传入的参数 |
| filterPath           | function(url)                               | 有些 url 不需要生成可以使用此回调函数返回 boolean 值即可，true 为要处理                                           |
| writeFileCallback    | function({name})                            | 写入文件时，用于自定义文件名，有些模块名称使用了空格，这里可以单独处理                                            |
