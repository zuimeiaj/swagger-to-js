class SwaggerJS {
  /**
   * 创建解析Swagger文档对象
   * @param {object} options
   * @param {string} options.apiLibName - 请求api名称，默认为 Restful
   * @param {string} options.apiLibPath - 请求api库的路径
   * @param {object} options.defs - 接口数据定义对象
   * @param {object} options.paths - 所有接口数据
   *
   * @returns SwaggerJS
   */
  constructor(options) {
    this.options = options;
    this.paths = options.paths;
    this.defs = options.defs;
  }

  /**
   * 生成代码
   * @returns string - 根据所有url生成的代码
   */
  generate() {
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

  getParameters(item, comments) {
    //有可能没有参数
    if (item.parameters && item.parameters.length > 0) {
      comments.push(" * @param {object} data - 请求参数");

      (item.parameters || []).forEach((item) => {
        if (item["in"] === "header") return;
        let defUrl = this._getObjectByPath(item, ["schema", "$ref"]);
        if (defUrl) {
          let defObject = this._getObjectByPath(this.defs, defUrl);
          comments.push(...this.getParamsComment(defObject));
        } else {
          comments.push(this.getFieldComment(item));
        }
      });
    }
    return comments;
  }
  _getObjectByPath(object, path) {
    if (typeof path === "string") {
      path = path.split("/").filter((item) => !["#", ""].includes(item));
    }
    let result = object;
    while (path.length > 0) {
      let key = path.shift();
      if (result[key]) result = result[key];
      else return;
    }
    return result;
  }
  getRequestBody(item, comments) {
    let defPath = this._getObjectByPath(item, [
      "requestBody",
      "content",
      "application/json",
      "schema",
      "$ref",
    ]);

    if (!defPath) {
      return;
    }

    let defObject = this._getObjectByPath(this.defs, defPath);

    comments.push(...this.getParamsComment(defObject));
  }
  getComment(item) {
    const comments = [];
    comments.push("/**");
    comments.push(` * ${item.description}`);
    // formdata类型的
    this.getParameters(item, comments);
    // application/json的
    this.getRequestBody(item, comments);
    comments.push(" * @returns object ");
    comments.push(" */");
    return comments;
  }
  getFieldComment(item, prefix = "data") {
    const covertMap = this.options.convert || {};
    return ` * @param {${covertMap[item.type] || item.type}} ${
      !item.required
        ? "[" + prefix + "." + item.name + "]"
        : prefix + "." + item.name
    } - ${item.description || ""} `;
  }
  getParamsComment(params = {}) {
    let codes = [];
    const props = params.properties || {};
    for (let name in props) {
      let obj = props[name];
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
