const constant = require("./const");
const { URL } = require("url");
const request = require("axios");

class Target {
  constructor(ctx) {
    this.ctx = ctx;
    this.url = null;
    this.headers = {};

    // 初始化目标请求必备信息
    this.createUrl();
    this.createHeaders();
  }

  /**
   * 生成目标URL
   */
  createUrl() {
    const originUrl = this.ctx.URL;
    const target = originUrl.searchParams.get(constant.PROXY_PARAM_KEY);
    this.url = new URL(target);

    // 首先删除代理链接中的PROXY_PARAM_KEY
    originUrl.searchParams.delete(constant.PROXY_PARAM_KEY);

    // 将原始URL中的剩余参数全部替换到目标URL中
    const keys = originUrl.searchParams.keys();
    for (let key of keys) {
      const value = originUrl.searchParams.get(key);
      this.url.searchParams.set(key, value);
    }
  }

  /**
   * 将原始请求头全部附加到目标请求头中
   * host | origin | referer 需要修改
   */
  createHeaders() {
    for (let key in this.ctx.headers) {
      if (key === "host") {
        this.headers[key] = this.url.host;
        continue;
      }
      if (key === "origin") {
        this.headers[key] = this.url.origin;
        continue;
      }
      if (key === "referer") {
        this.headers[key] = this.url.href;
        continue;
      }
      this.headers[key] = ctx.headers[key];
    }
  }

  /**
   * 将请求发往目标服务器
   */
  async requestTarget() {
    const response = await request({
      url: this.url.href,
      method: this.ctx.method,
      headers: this.headers,
      data: this.ctx.req,
      /**
       * 返回Stream类型，用来透传给客户端
       */
      responseType: "stream"
    });
    return response;
  }
}

module.exports = Target;
