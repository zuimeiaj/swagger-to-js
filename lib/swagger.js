const Request = require("./request");

class SwaggerJS {
  /**
   * 创建解析Swagger文档对象
   * @param {object} options
   * @param {string} options.url - swagger文档地址
   * @param {string} options.output - 写入文件地址
   * @param {string} options.module - 模块名称（微服务名称）
   * @param {string} options.apiLibName - 请求api名称，默认为 Restful
   * @param {string} options.apiLibPath - 请求api库的路径
   * @returns SwaggerJS
   */
  constructor(options) {
    this.options = options;
  }
  async init() {
    const { paths, defs } = await Request.getPaths(this.options);
    this.paths = paths;
    this.defs = defs;
  }

  /**
   * 生成代码
   * @returns string - 根据所有url生成的代码
   */
  async generate() {
    await this.init();
    return this.getFunctions();
  }

  getFunctions() {
    let codes = [];
    codes.push(
      `import ${this.options.apiLibName} from '${this.options.apiLibPath}'`
    );

    for (let item of this.paths) {
      codes.push(this.getFunctionCode(item));
    }

    return codes.join("\n\n");
  }

  getFunctionCode(item) {
    const codes = [
      ...this.getComment(item),
      this.getFunctionHeader(item),
      ...this.getFunctionBody(item),
    ];
    return codes.join("\n");
  }

  getComment(item) {
    const defs = this.defs;
    const comments = [];
    comments.push("/**");
    comments.push(` * ${item.description}`);
    comments.push(" * @param {object} data - 请求参数");

    item.parameters.forEach((item) => {
      if (item["in"] === "header") return;
      if (
        item.schema &&
        item.schema.originalRef &&
        defs[item.schema.originalRef]
      ) {
        comments.push(...this.getParamsComment(defs[item.schema.originalRef]));
      } else {
        comments.push(this.getFieldComment(item));
      }
    });
    comments.push(" * @returns object ");
    comments.push(" */");
    return comments;
  }
  getFieldComment(item, prefix = "data") {
    const covertMap = this.options.convert || {};
    return ` * @param {${covertMap[item.type] || item.type}} ${
      item.required
        ? "[" + prefix + "." + item.name + "]"
        : prefix + "." + item.name
    } - ${item.description || ""} `;
  }
  getParamsComment(params) {
    let codes = [];
    for (let name in params.properties) {
      let obj = params.properties[name];
      obj.name = name;
      obj.required = (params.required || []).includes(name);
      codes.push(this.getFieldComment(obj));
    }
    return codes;
  }
  getMethodName(item) {
    return (
      item.method +
      item.url
        .replace(/({\w+})/g, (value) => {
          let entity = value.slice(1, -1);
          return "By" + entity.slice(0, 1).toUpperCase() + entity.slice(1);
        })
        .split("/")
        .filter(Boolean)
        .map((item) => {
          return item.slice(0, 1).toUpperCase() + item.slice(1);
        })
        .join("")
    );
  }
  getFunctionHeader(item) {
    return `export function ${this.getMethodName(item)}(data) {`;
  }

  getFunctionBody(item) {
    const convert = this.options.convert || {};
    const method = convert[item.method] || item.method;
    const body = [
      `  return ${this.options.apiLibName}.${method}('${item.url}', data)`,
    ];
    body.push("}");
    return body;
  }
}

module.exports = SwaggerJS;
