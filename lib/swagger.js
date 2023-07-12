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

  generateDefs() {
    let schemas = this._getObjectByPath(this.defs, this.options.schemasPath(this.defs));

    let codes = Object.keys(schemas).map((defName) => {
      let props = schemas[defName].properties;
      if (!props) return '';
      let codes = [`/**`];
      codes.push(` * @typedef {object} ${this.getNestName(defName)}`);
      Object.keys(props).forEach((prop) => {
        let propItem = props[prop];
        let type = propItem.type;
        let description = propItem.description || '';
        let typeCode = '';
        if (type === 'array' && propItem.items['$ref']) {
          let vo = propItem.items['$ref'].split('/').pop();
          typeCode = ` * @property {${vo}[]} ${prop} - ${description}`;
        } else if (type === undefined) {
          typeCode = propItem['$ref'].split('/').pop();
          typeCode = ` * @property {${typeCode}} ${prop} - ${description}`;
        } else {
          typeCode = ` * @property {${type}} ${prop} - ${description}`;
        }
        codes.push(typeCode);
      });
      codes.push(' */');
      return codes.join('\n');
    });

    return codes.join('\n\n');
  }

  /**
   * 生成代码
   * @returns string - 根据所有url生成的代码
   */
  generate() {
    let codes = [];
    codes.push(`import ${this.options.apiLibName} from '${this.options.apiLibPath}'`);

    for (let item of this.paths) {
      codes.push(this.getFunctionCode(item));
    }

    return codes.join('\n\n');
  }

  getFunctionCode(item) {
    const codes = [...this.getComment(item), this.getFunctionHeader(item), ...this.getFunctionBody(item)];
    return codes.join('\n');
  }

  getParameters(item, comments) {
    //有可能没有参数
    if (item.parameters && item.parameters.length > 0) {
      comments.push(' * @param {object} data - 请求参数');

      (item.parameters || []).forEach((item) => {
        // header 里面的字段忽略
        if (item['in'] === 'header') return;
        let defUrl = this._getObjectByPath(item, this.options.parametersPath(item));
        if (defUrl) {
          comments.push(` * @param {${this.getNestName(defUrl.split('/').pop())}} ${item.description}`);
        } else {
          comments.push(this.getFieldComment(item));
        }
      });
    }
    return comments;
  }
  _getObjectByPath(object, path) {
    if (typeof path === 'string') {
      path = path.split('/').filter((item) => !['#', ''].includes(item));
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
    let defPath = this._getObjectByPath(item, this.options.requestBodyPath(item));

    if (!defPath) {
      return;
    }

    comments.push(` * @param {${defPath.split('/').pop()}} data`);
  }
  getNestName(name) {
    return name.replace(/[«»]/g, '_');
  }

  getReturnName(name) {
    if (this.options.returnName) {
      return this.options.returnName(this.getNestName(name));
    }
    return this.getNestName(name);
  }

  getResponseBody(item, comments) {
    let defPath = this._getObjectByPath(item, this.options.responseBodyPath(item));
    if (!defPath) return;
    comments.push(` * @returns {${this.getReturnName(defPath.split('/').pop())} }`);
  }
  getComment(item) {
    const comments = [];
    comments.push('/**');
    comments.push(` * ${item.description}`);
    // formdata类型的
    this.getParameters(item, comments);
    // application/json的
    this.getRequestBody(item, comments);
    this.getResponseBody(item, comments);
    comments.push(' */');
    return comments;
  }

  getFieldComment(item, prefix = 'data') {
    const covertMap = this.options.convert || {};
    return ` * @param {${covertMap[item.type] || item.type}} ${!item.required ? '[' + prefix + '.' + item.name + ']' : prefix + '.' + item.name} - ${item.description || ''} `;
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
        .replace(/\-/g, '/')
        .replace(/({\w+})/g, (value) => {
          let entity = value.slice(1, -1);
          return 'By' + entity.slice(0, 1).toUpperCase() + entity.slice(1);
        })
        .split('/')
        .filter(Boolean)
        .map((item) => {
          return item.slice(0, 1).toUpperCase() + item.slice(1);
        })
        .join('')
    );
  }
  getFunctionHeader(item) {
    return `export function ${this.getMethodName(item)}(data) {`;
  }

  getFunctionBody(item) {
    const convert = this.options.convert || {};
    const method = convert[item.method] || item.method;
    const body = [`  return ${this.options.apiLibName}.${method}('${item.url}', data)`];
    body.push('}');
    return body;
  }
}

module.exports = SwaggerJS;
