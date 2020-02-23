"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const koa_1 = __importDefault(require("koa"));
const chalk_1 = __importDefault(require("chalk"));
const Target_1 = __importDefault(require("./Target"));
const rewrite_1 = require("./rewrite");
function startProxy(option) {
    let config = { port: 4000, proxyParam: "__proxy" };
    if (option) {
        config = Object.assign(Object.assign({}, config), option);
    }
    const app = new koa_1.default();
    app.context.proxyParam = config.proxyParam;
    app.on("error", (error, ctx) => {
        rewrite_1.setCors(ctx);
        ctx.status = 500;
        ctx.message = error.message;
        ctx.body = null;
    });
    app.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
        if (ctx.method.toUpperCase() === "OPTIONS") {
            rewrite_1.setPreflightCors(ctx);
            ctx.status = 200;
            ctx.body = null;
        }
        else {
            yield next();
        }
    }));
    app.use((ctx) => __awaiter(this, void 0, void 0, function* () {
        const target = new Target_1.default(ctx);
        const response = yield target.requestTarget();
        rewrite_1.rewriteResponseCookies(ctx, response.headers);
        rewrite_1.setResponseHeader(ctx, response.headers);
        rewrite_1.setCors(ctx);
        ctx.status = response.status;
        ctx.message = response.statusText;
        ctx.body = response.data;
    }));
    app.listen(config.port);
    console.log(`代理服务器已经启动：${chalk_1.default.green(`:${config.port}`)}`);
}
exports.startProxy = startProxy;
