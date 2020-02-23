/**
 * @author joye
 * @abstract 一个简单的https请求代理服务器
 * @date 2020/02/21
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import Koa from "koa";
import color from "chalk";
import Target from "./Target";
import {
  setResponseHeader,
  setCors,
  setPreflightCors,
  rewriteResponseCookies
} from "./rewrite";

export interface ProxyOption {
  port: number;
  proxyParam: string;
}

/**
 * 启动代理服务器
 * @param option
 */
export function startProxy(option?: Partial<ProxyOption>) {
  let config = { port: 4000, proxyParam: "__proxy" };
  if (option) {
    config = { ...config, ...option };
  }

  const app = new Koa();
  app.context.proxyParam = config.proxyParam;

  /**
   * 监听错误信息
   */
  app.on("error", (error, ctx) => {
    setCors(ctx);
    ctx.status = 500;
    ctx.message = error.message;
    ctx.body = null;
  });

  /**
   *
   */
  app.use(async (ctx, next) => {
    // 如果请求是预检请求，直接返回
    if (ctx.method.toUpperCase() === "OPTIONS") {
      setPreflightCors(ctx);
      ctx.status = 200;
      ctx.body = null;
    }
    // 非预检请求需要在下一个中间件处理
    else {
      await next();
    }
  });

  app.use(async ctx => {
    // 解析代理目标信息
    const target = new Target(ctx);
    // 代理原始目标请求
    const response = await target.requestTarget();
    // const body = Buffer.from(response.data);

    // 设置返回给客户端的Set-Cookie响应头
    rewriteResponseCookies(ctx, response.headers);
    // 将目标的响应头完整反馈给客户端
    setResponseHeader(ctx, response.headers);
    // 设置跨域相关
    setCors(ctx);

    // 数据目标结果到客户端
    ctx.status = response.status;
    ctx.message = response.statusText;
    // ctx.body = body;
    ctx.body = response.data;
  });

  app.listen(config.port);

  console.log(`代理服务器已经启动：${color.green(`:${config.port}`)}`);
}
