import http from "http";
import { Cookie } from "tough-cookie";
import { KoaContext } from "./types";
import Cookies from "cookies";
import { pick, isDate, isNumber, isString } from "lodash";

/**
 * 预检请求的跨域资源共享单独处理
 * @param ctx
 */
export function setPreflightCors(ctx: KoaContext) {
  const origin = ctx.get("Origin");
  if (origin) {
    ctx.set("Access-Control-Allow-Origin", origin);
  }
  const method = ctx.get("Access-Control-Request-Method");
  if (method) {
    ctx.set("Access-Control-Allow-Methods", method);
  }
  const headers = ctx.get("Access-Control-Request-Headers");
  if (headers) {
    ctx.set("Access-Control-Allow-Headers", headers);
  }
  ctx.set("Access-Control-Allow-Credentials", "true");
}

/**
 * 通用跨域许可设置
 * @param {*} ctx
 */
export function setCors(ctx: KoaContext) {
  // 必备跨域头
  ctx.set("Access-Control-Allow-Origin", ctx.get("Origin"));
  ctx.set("Access-Control-Allow-Methods", ctx.method.toUpperCase());

  // 只要请求头中包含Access-Control-Request-Headers，就必须要返回对应的许可
  const headers = ctx.get("Access-Control-Request-Headers");
  if (headers) {
    ctx.set("Access-Control-Allow-Headers", headers);
  }

  // ctx.get(key)即使是key不存在，也会返回空字符串，这和undefined不一样
  for (let field of ["cookie", "authorization"]) {
    if (typeof ctx.headers[field] !== undefined) {
      ctx.set("Access-Control-Allow-Credentials", "true");
      break;
    }
  }
}

/**
 * 重写响应的Set-Cookie标头，主要是重写domain
 * @param ctx
 * @param targetResponseHeaders
 */
export function rewriteResponseCookies(
  ctx: KoaContext,
  targetResponseHeaders: http.IncomingHttpHeaders
) {
  /**
   * 读取服务端响应的Set-Cookie头
   */
  const cookies: Cookie[] = [];
  const rawSetCookie = targetResponseHeaders["set-cookie"];
  const pushParseResult = (result?: Cookie) =>
    result instanceof Cookie && cookies.push(result);

  // 解析目标响应的Set-Cookie值到数组中
  if (Array.isArray(rawSetCookie)) {
    rawSetCookie.forEach(item => {
      const result = Cookie.parse(item);
      pushParseResult(result);
    });
  } else if (typeof rawSetCookie === "string") {
    const result = Cookie.parse(rawSetCookie);
    pushParseResult(result);
  }

  if (cookies.length === 0) {
    return;
  }

  // 修改Set-Cookie的域信息
  cookies.forEach(cookie => {
    // tough-cookie和cookies两个库的参数转换
    const option: Cookies.SetOption = {
      maxAge: isNumber(cookie.maxAge) ? cookie.maxAge : undefined,
      expires: isDate(cookie.expires) ? cookie.expires : undefined,
      path: isString(cookie.path) ? cookie.path : undefined,
      domain: ctx.hostname,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly
    };
    ctx.cookies.set(cookie.key, cookie.value, option);
  });
}

/**
 * 从目标返回给代理的响应头信息更改
 * @param {*} ctx
 * @param {*} targetResponseHeaders
 */
export function setResponseHeader(
  ctx: KoaContext,
  targetResponseHeaders: http.IncomingHttpHeaders
) {
  // 将目标返回的请求头全部原封不动返回给客户端
  for (let key in targetResponseHeaders) {
    ctx.set(key, targetResponseHeaders[key]!);
  }
}

export function setResponseContentLength(ctx: KoaContext, body: Buffer) {
  ctx.set("Content-Length", `${body.length}`);
}
