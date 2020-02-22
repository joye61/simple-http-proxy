/**
 * 浏览器专用注入方法，配合当前代理使用
 * process.env.NODE_ENV 的值必须借助webpack的DefinePlugin替换
 * create-react-app默认有这两个值
 */
export function hijack(
  targetUrl: string,
  proxyParam: string = "__proxy",
  proxyOrigin: string = "http://localhost:4000"
) {
  if (process.env.NODE_ENV === "development") {
    try {
      const target = new URL(targetUrl);
      const proxy = new URL(proxyOrigin);
      target.searchParams.set(proxyParam, targetUrl);
      target.protocol = proxy.protocol;
      target.host = proxy.host;
      return target.href;
    } catch (error) {}
  }

  return targetUrl;
}
