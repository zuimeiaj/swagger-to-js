const http = require("http");
/**
 * 请求swagger文档数据
 */
class Request {
  constructor(options) {
    this.options = options;
  }

  static async getPaths(options) {
    const request = new Request(options);
    return await request.getPaths();
  }

  request() {
    return new Promise((resolve, reject) => {
      http.get(this.options.url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve(JSON.parse(data));
        });
        res.on("error", (e) => {
          reject(e);
        });
      });
    });
  }
  async getPaths() {
    const res = await this.request();
    const urlList = [];
    const paths = res.paths;
    for (let key in paths) {
      if (key.startsWith("/rpc")) {
        continue;
      }
      let info = paths[key];
      for (let method in info) {
        let desc = info[method];
        urlList.push({
          method: method,
          url: key,
          description: desc.summary,
          parameters: desc.parameters,
        });
      }
    }
    return { paths: urlList, defs: res.definitions };
  }
}

module.exports = Request;
