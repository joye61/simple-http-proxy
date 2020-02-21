import http from "http";
import { URL } from "url";
import { Cookie } from "tough-cookie";
import { KoaContext } from "./types";
import Cookies from "cookies";

/**
 * 通用跨域许可设置
 * @param {*} ctx
 */
export function setCors(ctx: KoaContext) {
  // 解决跨域相关问题
  ctx.set("access-control-allow-origin", ctx.get("origin"));
  ctx.set(
    "access-control-allow-methods",
    `GET, POST, PUT, HEAD, DELETE, OPTIONS`
  );
  ctx.set("access-control-allow-headers", "Authorization, Content-Type");

  /**
   * 请求头中包含任意一个字段，都要设置跨域安全许可
   */
  for (let field of ["cookie", "authorization"]) {
    if (ctx.get(field)) {
      ctx.set("access-control-allow-credentials", "true");
      break;
    }
  }
}

/**
 * 从目标返回给代理的响应头信息更改
 * @param {*} ctx
 * @param {*} targetResHeaders
 */
export function setResponseHeader(
  ctx: KoaContext,
  targetResHeaders: http.IncomingHttpHeaders
) {
  /**
   * 读取服务端响应的Set-Cookie头
   */
  let cookies: Cookie[] = [];
  const rawSetCookie = targetResHeaders["set-cookie"];
  if (Array.isArray(rawSetCookie)) {
    rawSetCookie.forEach(item => {
      const result = Cookie.parse(item);
      if (result instanceof Cookie) {
        cookies.push(result);
      }
    });
  } else if (typeof rawSetCookie === "string") {
    const result = Cookie.parse(rawSetCookie);
    if (result instanceof Cookie) {
      cookies.push(result);
    }
  }

  // 删除原始响应头的set-cookie字段，防止被重复写入
  delete targetResHeaders["set-cookie"];

  // 修改Set-Cookie的域信息
  const clientOrigin = ctx.get("Origin");
  const domain = new URL(clientOrigin).hostname;
  cookies.forEach(cookie => {
    cookie.domain = domain;
    ctx.cookies.set(cookie.key, cookie.value, <Cookies.SetOption>cookies);
  });

  // 将目标返回的请求头全部原封不动返回给客户端
  for (let key in targetResHeaders) {
    ctx.set(key, targetResHeaders[key]!);
  }
}
