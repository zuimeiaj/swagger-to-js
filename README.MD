# Installation

> npm install yoo-swagger-api

# Usage

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

# Props

| Name       | Type   | Desc                             |
| ---------- | ------ | -------------------------------- |
| url        | string | swagger 文档路径                 |
| output     | string | 写入文件目录                     |
| module     | string | 写入文件名称                     |
| apiLibName | string | 请求库名称                       |
| apiLibPath | string | 请求库地址                       |
| convert    | object | 对数据类型和请求 method 进行转换 |
