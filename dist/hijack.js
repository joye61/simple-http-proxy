"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function hijack(targetUrl, proxyParam = "__proxy", proxyOrigin = "http://localhost:4000") {
    if (process.env.NODE_ENV === "development") {
        try {
            const target = new URL(targetUrl);
            const proxy = new URL(proxyOrigin);
            target.searchParams.set(proxyParam, targetUrl);
            target.protocol = proxy.protocol;
            target.host = proxy.host;
            return target.href;
        }
        catch (error) { }
    }
    return targetUrl;
}
exports.hijack = hijack;
