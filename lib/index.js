const SwaggerJS = require("./swagger");
const fs = require("fs");
const path = require("path");

/**
 * 解析Swagger文档并写入到指定目录
 * @param {object} options - 配置
 * @param {string} options.url - swagger文档地址
 * @param {string} options.output - 写入文件地址
 * @param {string} options.module - 模块名称（微服务名称），写入api的文件名称
 * @param {string} options.apiLibName - 请求api名称，默认为 Restful
 * @param {string} options.apiLibPath - 请求api库的路径，需要自行实现对 restful风格的api
 * @param {object} options.convert - 转换method和数据类型的映射对象
 *
 */
module.exports = async (options) => {
  const swagger = new SwaggerJS(options);
  const code = await swagger.generate();
  fs.writeFile(
    path.resolve(options.output, options.module + ".js"),
    code,
    { encoding: "utf-8" },
    (error) => {
      if (error) {
        console.info(e);
      }
    }
  );
};
