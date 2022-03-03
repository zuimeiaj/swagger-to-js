# 开始

根据 swaggerapi 文档生成请求代码和请求参数注释，减少重复劳动。支持 parameters 和 requestbody

` npm install yoo-swagger-api --save-dev`

# 使用

```javascript
// swagger.js 
const path = require("path");
const parseSwagger = require("yoo-swagger-api");

const { generate, generateApi } = parseSwagger({
  url: "http://swagger.xxxx",// 这里会自动拼接上 /swagger-resources 
  module: "user",
  output: path.resolve(__dirname, "../api"),
  apiLibName: "HttpClient",
  apiLibPath: "./http-client.js",
  convert: {
    integer: "number",
    delete: "remove",
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

import HttpClient from "./http-client";
/**
 * some description
 * @param {object} data  - 请求参数，任何请求都只接受一个data对象作为入参
 * @param {number} field1 - desc
 * @param {string} field2 - desc
 * @returns object
 *
 **/
export function getDataList(data) {
  return HttpClient.get("/data/list", data);
}
```

# 参数说明

| Name       | Type   | Desc                               |
| ---------- | ------ | ---------------------------------- |
| url        | string | swagger 文档资源路径               |
| apiUrl     | string | swagger 文档单个服务接口路径       |
| output     | string | 写入文件目录                       |
| module     | string | 文件名称，单个接口生成时有效       |
| resource   | string | 资源路径，默认为 swagger-resources |
| apiLibName | string | 请求库名称                         |
| apiLibPath | string | 请求库地址                         |
| convert    | object | 对数据类型和请求 method 进行转换   |
