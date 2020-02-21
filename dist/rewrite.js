"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
var url_1 = require("url");
var tough_cookie_1 = require("tough-cookie");
function setCors(ctx) {
    var e_1, _a;
    ctx.set("access-control-allow-origin", ctx.get("origin"));
    ctx.set("access-control-allow-methods", "GET, POST, PUT, HEAD, DELETE, OPTIONS");
    ctx.set("access-control-allow-headers", "Authorization, Content-Type");
    try {
        for (var _b = __values(["cookie", "authorization"]), _c = _b.next(); !_c.done; _c = _b.next()) {
            var field = _c.value;
            if (ctx.get(field)) {
                ctx.set("access-control-allow-credentials", "true");
                break;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
exports.setCors = setCors;
function setResponseHeader(ctx, targetResHeaders) {
    var cookies = [];
    var rawSetCookie = targetResHeaders["set-cookie"];
    if (Array.isArray(rawSetCookie)) {
        rawSetCookie.forEach(function (item) {
            var result = tough_cookie_1.Cookie.parse(item);
            if (result instanceof tough_cookie_1.Cookie) {
                cookies.push(result);
            }
        });
    }
    else if (typeof rawSetCookie === "string") {
        var result = tough_cookie_1.Cookie.parse(rawSetCookie);
        if (result instanceof tough_cookie_1.Cookie) {
            cookies.push(result);
        }
    }
    delete targetResHeaders["set-cookie"];
    var clientOrigin = ctx.get("Origin");
    var domain = new url_1.URL(clientOrigin).hostname;
    cookies.forEach(function (cookie) {
        cookie.domain = domain;
        ctx.cookies.set(cookie.key, cookie.value, cookies);
    });
    for (var key in targetResHeaders) {
        ctx.set(key, targetResHeaders[key]);
    }
}
exports.setResponseHeader = setResponseHeader;
