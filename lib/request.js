const http = require('http')
/**
 * 请求swagger文档数据
 */
class Request {
  /**
   *
   * @param {object} options
   * @param {string} options.url - 文档接口地址
   * @param {string} [options.resource='swagger-resources'] - 资源路径
   * @param {string} [options.apiUrl] - 单个资源请求
   */
  constructor(options) {
    this.options = options
  }

  /**
   * 获取所有资源接口数据
   * @returns
   */
  static getResource(options) {
    const request = new Request(options)
    return request.getResource()
  }

  /**
   * 获取单个接口资源数据
   * @param {string}} options
   * @returns
   */
  static getApiDocs(options) {
    const request = new Request(options)
    return request.getApiDocs()
  }

  /**
   * 获取单个资源的接口数据
   * @param {string} apiUrl
   * @returns
   */
  async getApiDocs(apiUrl) {
    return this.request(apiUrl || this.options.apiUrl).then((res) => this._getPathsData(res))
  }

  /**
   * 获取所有资源的路径，并请求所有接口数据
   * @returns
   */
  async getResource() {
    const { resource } = this.options
    const res = await this.request(resource || '/swagger-resources')
    const docs = await Promise.all(res.map((item) => this.getApiDocs(item.url)))
    docs.forEach((item, index) => {
      item.name = res[index].name
    })
    return docs
  }

  /**
   * 请求数据
   * @param {string} url
   * @returns
   */
  request(url) {
    return new Promise((resolve, reject) => {
      console.log(this.options.url, url)
      http.get(this.options.url + url, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          resolve(JSON.parse(data))
        })
        res.on('error', (e) => {
          reject(e)
        })
      })
    })
  }
  _getPathsData(res) {
    const urlList = []
    const paths = res.paths
    for (let key in paths) {
      if (key.startsWith('/rpc')) {
        continue
      }
      let info = paths[key]
      for (let method in info) {
        let desc = info[method]
        urlList.push({
          method: method,
          // 优先级，输入module后最高，有moudule说明为单个api生成，
          url: (this.options.module || res.basePath || '') + key,
          description: desc.summary,
          parameters: desc.parameters,
          requestBody: desc.requestBody,
        })
      }
    }
    return { paths: urlList, defs: res }
  }
}

module.exports = Request
