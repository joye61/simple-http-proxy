"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function hijack(targetUrl, proxyParam = "__proxy", proxyOrigin = "http://localhost:4000") {
    try {
        const proxy = new URL(proxyOrigin);
        proxy.searchParams.set(proxyParam, targetUrl);
        return proxy.href;
    }
    catch (error) { }
    return targetUrl;
}
exports.hijack = hijack;
function hijackGlobally(proxyParam = "__proxy", proxyOrigin = "http://localhost:4000") {
    const rawSend = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function (method, url, async = true, username, password) {
        const proxyUrl = hijack(url, proxyParam, proxyOrigin);
        rawSend.call(this, method, proxyUrl, async, username, password);
    };
    if (typeof window.fetch === "function") {
        const rawFetch = window.fetch;
        window.fetch = function (input, init) {
            if (typeof input === "string") {
                const proxyUrl = hijack(input, proxyParam, proxyOrigin);
                return rawFetch(proxyUrl, init);
            }
            if (input instanceof Request) {
                const proxyUrl = hijack(input.url, proxyParam, proxyOrigin);
                return rawFetch(new Request(proxyUrl, {
                    method: input.method,
                    headers: input.headers,
                    body: input.body,
                    mode: input.mode,
                    credentials: input.credentials,
                    cache: input.cache,
                    redirect: input.redirect,
                    referrer: input.referrer,
                    integrity: input.integrity
                }), init);
            }
            return rawFetch(input, init);
        };
    }
}
exports.hijackGlobally = hijackGlobally;
