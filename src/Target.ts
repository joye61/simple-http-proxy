import http from "http";
import https from "https";
import { KoaContext } from "./types";
import request, { Method } from "axios";

export default class Target {
  url?: URL;
  headers: http.IncomingHttpHeaders = {};

  constructor(public ctx: KoaContext) {
    // 初始化目标请求必备信息
    this.createUrl();
    this.createHeaders();
  }

  /**
   * 生成目标URL
   */
  createUrl() {
    const originUrl = this.ctx.URL;
    const target = originUrl.searchParams.get(this.ctx.proxyParam);

    if (!target) {
      throw new Error(`Proxy target does not exist`);
    }

    this.url = new URL(target);

    // 首先删除代理链接中的PROXY_PARAM_KEY
    originUrl.searchParams.delete(this.ctx.proxyParam);

    // 将原始URL中的剩余参数全部替换到目标URL中
    const keys = originUrl.searchParams.keys();
    for (let key of keys) {
      const value = originUrl.searchParams.get(key);
      this.url.searchParams.set(key, <string>value);
    }
  }

  /**
   * 将原始请求头全部附加到目标请求头中
   * host | origin | referer 需要修改
   */
  createHeaders() {
    for (let key in this.ctx.headers) {
      if (key === "host") {
        this.headers[key] = this.url!.host;
        continue;
      }
      if (key === "origin") {
        this.headers[key] = this.url!.origin;
        continue;
      }
      if (key === "referer") {
        this.headers[key] = this.url!.href;
        continue;
      }
      this.headers[key] = this.ctx.headers[key];
    }
  }

  /**
   * 发送代理请求到目标服务器
   */
  async requestTarget() {
    const response = await request({
      url: this.url!.href,
      method: <Method>this.ctx.method,
      headers: this.headers,
      data: this.ctx.req,
      responseType: "stream",
      validateStatus: () => true,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });

    return response;
  }
}
