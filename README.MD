# 开始

根据 swaggerapi 文档生成请求代码，减少重复劳动

` npm install yoo-swagger-api --save-dev`

# 使用

```javascript
const path = require("path");
const parseSwagger = require("yoo-swagger-api");

parseSwagger({
  url: "http://swagger.xxxx/xxx/v2/api-docs",
  module: "user",
  output: path.resolve(__dirname, "../api"),
  apiLibName: "HttpClient",
  apiLibPath: "./http-client.js",
  convert: {
    integer: "number",
    delete: "remove",
  },
});
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

| Name       | Type   | Desc                             |
| ---------- | ------ | -------------------------------- |
| url        | string | swagger 文档路径                 |
| output     | string | 写入文件目录                     |
| module     | string | 写入文件名称                     |
| apiLibName | string | 请求库名称                       |
| apiLibPath | string | 请求库地址                       |
| convert    | object | 对数据类型和请求 method 进行转换 |
