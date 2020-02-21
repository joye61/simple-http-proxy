/**
 * @author joye
 * @abstract 一个简单的https请求代理服务器
 * @date 2020/02/21
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import Koa from "koa";
import bodyParser from "koa-body";
import color from "chalk";
import Target from "./Target";
import { setResponseHeader, setCors } from "./rewrite";

export interface ProxyOption {
  port: number;
  proxyParam: string;
}

export function startProxy(
  option: Partial<ProxyOption> = {
    port: 4000,
    proxyParam: "__proxy"
  }
) {
  const { port, proxyParam } = option;

  const app = new Koa();
  app.context.proxyParam = proxyParam;

  app.on("error", (error, ctx) => {

    console.error(`❌ 发生错误 ❌：
  请求链接：${color.cyan(ctx.href)}
  错误信息：${error.message}
`);
    console.log(error);

    console.log(chalk.gray(`========================================\n`));
    ctx.code = 500;
    ctx.body = "";
  });

  app.use(bodyParser());

  app.use(async ctx => {
    console.log(chalk.gray(`\n========================================`));
    // 解析代理目标信息
    const target = new Target(ctx);

    const requestBody = ctx.request.body
      ? "<空>"
      : JSON.stringify(ctx.request.body, null, 2);

    console.log(`
>>> 接收到代理请求：
  
  请求方法 ：${color.gray(ctx.method)}
  请求链接 ：${color.cyan(target.url!.href)}
  请求主体 ：${requestBody}
`);

    const response = await target.requestTarget();

    console.log(`
>>> 接收到目标响应：${color.gray(`${response.status} ${response.statusText}`)}
`);

    setResponseHeader(ctx, response.headers);
    setCors(ctx);

    console.log(chalk.gray(`========================================\n`));

    // 数据目标结果到客户端
    ctx.body = response.data;
  });

  app.listen(port);
}
