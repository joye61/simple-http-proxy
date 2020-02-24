"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tough_cookie_1 = require("tough-cookie");
const lodash_1 = require("lodash");
function setPreflightCors(ctx) {
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
exports.setPreflightCors = setPreflightCors;
function setCors(ctx) {
    ctx.set("Access-Control-Allow-Origin", ctx.get("Origin"));
    ctx.set("Access-Control-Allow-Methods", ctx.method.toUpperCase());
    const headers = ctx.get("Access-Control-Request-Headers");
    if (headers) {
        ctx.set("Access-Control-Allow-Headers", headers);
    }
    for (let field of ["cookie", "authorization"]) {
        if (typeof ctx.headers[field] !== undefined) {
            ctx.set("Access-Control-Allow-Credentials", "true");
            break;
        }
    }
}
exports.setCors = setCors;
function rewriteResponseCookies(ctx, targetResponseHeaders) {
    const cookies = [];
    const rawSetCookie = targetResponseHeaders["set-cookie"];
    const pushParseResult = (result) => result instanceof tough_cookie_1.Cookie && cookies.push(result);
    if (Array.isArray(rawSetCookie)) {
        rawSetCookie.forEach(item => {
            const result = tough_cookie_1.Cookie.parse(item);
            pushParseResult(result);
        });
    }
    else if (typeof rawSetCookie === "string") {
        const result = tough_cookie_1.Cookie.parse(rawSetCookie);
        pushParseResult(result);
    }
    if (cookies.length === 0) {
        return;
    }
    cookies.forEach(cookie => {
        const option = {
            maxAge: lodash_1.isNumber(cookie.maxAge) ? cookie.maxAge : undefined,
            expires: lodash_1.isDate(cookie.expires) ? cookie.expires : undefined,
            path: lodash_1.isString(cookie.path) ? cookie.path : undefined,
            domain: ctx.hostname,
            secure: cookie.secure,
            httpOnly: cookie.httpOnly
        };
        ctx.cookies.set(cookie.key, cookie.value, option);
    });
}
exports.rewriteResponseCookies = rewriteResponseCookies;
function setResponseHeader(ctx, targetResponseHeaders, body) {
    for (let key in targetResponseHeaders) {
        if (key !== "content-length") {
            ctx.set(key, targetResponseHeaders[key]);
        }
        else {
            ctx.set('Content-Length', `${body.length}`);
        }
    }
}
exports.setResponseHeader = setResponseHeader;
