/**
 * @author joye
 * @abstract 一个简单的https请求代理服务器
 * @date 2020/02/21
 */

/**
 * 禁用HTTPS请求时的证书链有效性验证
 * 这一行环境变量声明必须位于最顶层
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const http = require("http");
const Koa = require("koa");
const chalk = require("chalk");
const bodyParser = require("koa-body");
const { URL } = require("url");
const request = require("axios");
const { Cookie } = require("tough-cookie");

const app = new Koa();

app.on("error", error => {
  console.error("错误：", chalk.red(error.message));
});

app.use(bodyParser());

app.use(async ctx => {
  console.log(chalk.gray(`\n========================================`));

  const proxyKey = "__proxy";
  const clientOrigin = ctx.get("Origin");

  const originUrl = ctx.URL;
  const target = originUrl.searchParams.get(proxyKey);
  const targetUrl = new URL(target);

  const requestBody = ctx.request.body
    ? "<空>"
    : JSON.stringify(ctx.request.body, null, 2);

  console.log(`
>>> 接收到代理请求：
  
  请求方法 ：${chalk.gray(ctx.method)}
  请求链接 ：${chalk.cyan(targetUrl.href)}
  请求主体 ：${requestBody}
`);

  // 删除原始URL中的代理参数
  originUrl.searchParams.delete(proxyKey);

  // 将原始URL中的剩余参数全部替换到目标URL中
  const keys = originUrl.searchParams.keys();
  for (let key of keys) {
    const value = originUrl.searchParams.get(key);
    targetUrl.searchParams.set(key, value);
  }

  // 将原始请求头全部附加到目标请求头中
  // host | origin | referer 需要修改
  const targetHeaders = {};
  for (let key in ctx.headers) {
    if (key === "host") {
      targetHeaders[key] = targetUrl.host;
      continue;
    }
    if (key === "origin") {
      targetHeaders[key] = targetUrl.origin;
      continue;
    }
    if (key === "referer") {
      targetHeaders[key] = targetUrl.href;
      continue;
    }
    targetHeaders[key] = ctx.headers[key];
  }

  // 开始发送代理请求
  const response = await request({
    url: targetUrl.href,
    method: ctx.method,
    headers: targetHeaders,
    data: ctx.req,
    // 返回任意请求给客户端
    responseType: "stream",

  });

  console.log(`
>>> 接收到目标响应：${chalk.gray(`${response.status} ${response.statusText}`)}
`);

  /**
   * 读取服务端响应的Set-Cookie头
   */
  let cookies;
  const rawSetCookie = response.headers['set-cookie'];
  if(Array.isArray(rawSetCookie)) {
    cookies = rawSetCookie.map(Cookie.parse);
  } else {
    cookies = [Cookie.parse(rawSetCookie)]
  }

  /**
   * 首先删除原始响应头的set-cookie
   */
  delete response.headers['set-cookie'];

  /**
   * 修改Set-Cookie的域信息
   */
  const domain = (new URL(clientOrigin)).hostname;
  cookies.forEach(cookie =>{
    cookie.domain = domain;
    ctx.cookies.set(cookie.key, cookie.value, cookie);
  })

  // 将目标返回的请求头全部原封不动返回给客户端
  for (let key in response.headers) {
    ctx.set(key, response.headers[key]);
  }

  // 解决跨域相关问题
  ctx.set("access-control-allow-origin", clientOrigin);
  ctx.set(
    "access-control-allow-methods",
    `GET, POST, PUT, HEAD, DELETE, OPTIONS`
  );
  ctx.set("access-control-allow-headers", "Authorization, Content-Type");

  /**
   * 请求头中包含任意一个字段，都要设置跨域安全许可
   */
  for (let field of ["cookie", "authorization"]) {
    if (ctx.headers[field]) {
      ctx.set("access-control-allow-credentials", "true");
      break;
    }
  }

  console.log(chalk.gray(`========================================\n`));

  // 返回目标响应给客户端
  ctx.body = response.data;
});

http.createServer(app.callback()).listen(4000);
console.log(`\n启动代理服务器：${chalk.cyan.bold(`http://localhost:4000`)}\n`);
