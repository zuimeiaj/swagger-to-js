const SwaggerJS = require('./swagger')
const fs = require('fs')
const path = require('path')
const Request = require('./request')

/**
 * 解析Swagger文档并写入到指定目录
 * @param {object} options - 配置
 * @param {string} options.url - swagger文档地址
 * @param {string} [options.apiUrl] - 单个接口文档路径
 * @param {string} [options.module] - 单个接口文档路径文件名名称
 * @param {string} [options.resource='swagger-resources'] - 资源路径
 * @param {string} options.output - 写入文件地址
 * @param {string} options.apiLibName - 请求api名称，默认为 Restful
 * @param {string} options.apiLibPath - 请求api库的路径，需要自行实现对 restful风格的api
 * @param {object} options.convert - 转换method和数据类型的映射对象
 *
 */
module.exports = (options) => {
  return {
    async generateApi() {
      const doc = await Request.getApiDocs(options)
      const swagger = new SwaggerJS({
        ...doc,
        ...options,
      })
      const code = swagger.generate()
      write({ module: options.module, output: options.output }, code)
    },
    async generate() {
      const res = await Request.getResource(options)
      for (let doc of res) {
        console.log('module:', doc.name)
        const swagger = new SwaggerJS({ ...doc, ...options })
        const code = swagger.generate()
        write(
          {
            module: doc.name,
            output: options.output,
          },
          code
        )
      }
    },
  }
}

function write({ output, module }, data) {
  fs.writeFileSync(path.resolve(output, module + '.js'), data, { encoding: 'utf-8' }, (error) => {
    if (error) console.log(error.message)
  })
}
