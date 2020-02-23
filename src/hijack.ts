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
  try {
    const target = new URL(targetUrl);
    const proxy = new URL(proxyOrigin);
    target.searchParams.set(proxyParam, targetUrl);
    target.protocol = proxy.protocol;
    target.host = proxy.host;
    return target.href;
  } catch (error) {}

  return targetUrl;
}

export function hijackGlobally(
  proxyParam: string = "__proxy",
  proxyOrigin: string = "http://localhost:4000"
) {
  // 拦截window.XMLHTTPRequest
  const rawSend = window.XMLHttpRequest.prototype.open;
  window.XMLHttpRequest.prototype.open = function(
    method: string,
    url: string,
    async = true,
    user = null,
    password = null
  ) {
    const proxyUrl = hijack(url, proxyParam, proxyOrigin);
    rawSend.call(this, method, proxyUrl, async, user, password);
  };

  // 拦截window.fetch
  if (typeof window.fetch === "function") {
    const rawFetch = window.fetch;
    window.fetch = function(
      input: RequestInfo,
      init?: RequestInit | undefined
    ): Promise<Response> {
      if (typeof input === "string") {
        const proxyUrl = hijack(input, proxyParam, proxyOrigin);
        return rawFetch(proxyUrl, init);
      }

      if (input instanceof Request) {
        const proxyUrl = hijack(input.url, proxyParam, proxyOrigin);
        return rawFetch(
          new Request(proxyUrl, {
            method: input.method,
            headers: input.headers,
            body: input.body,
            mode: input.mode,
            credentials: input.credentials,
            cache: input.cache,
            redirect: input.redirect,
            referrer: input.referrer,
            integrity: input.integrity
          }),
          init
        );
      }

      return rawFetch(input, init);
    };
  }
}
