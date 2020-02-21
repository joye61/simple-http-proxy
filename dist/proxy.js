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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var koa_1 = __importDefault(require("koa"));
var koa_body_1 = __importDefault(require("koa-body"));
var chalk_1 = __importDefault(require("chalk"));
var Target_1 = __importDefault(require("./Target"));
var rewrite_1 = require("./rewrite");
function startProxy(option) {
    var _this = this;
    if (option === void 0) { option = {
        port: 4000,
        proxyParam: "__proxy"
    }; }
    var port = option.port, proxyParam = option.proxyParam;
    var app = new koa_1.default();
    app.context.proxyParam = proxyParam;
    app.on("error", function (error, ctx) {
        console.error("\u274C \u53D1\u751F\u9519\u8BEF \u274C\uFF1A\n  \u8BF7\u6C42\u94FE\u63A5\uFF1A" + chalk_1.default.cyan(ctx.href) + "\n  \u9519\u8BEF\u4FE1\u606F\uFF1A" + error.message + "\n");
        console.log(error);
        console.log(chalk.gray("========================================\n"));
        ctx.code = 500;
        ctx.body = "";
    });
    app.use(koa_body_1.default());
    app.use(function (ctx) { return __awaiter(_this, void 0, void 0, function () {
        var target, requestBody, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(chalk.gray("\n========================================"));
                    target = new Target_1.default(ctx);
                    requestBody = ctx.request.body
                        ? "<空>"
                        : JSON.stringify(ctx.request.body, null, 2);
                    console.log("\n>>> \u63A5\u6536\u5230\u4EE3\u7406\u8BF7\u6C42\uFF1A\n  \n  \u8BF7\u6C42\u65B9\u6CD5 \uFF1A" + chalk_1.default.gray(ctx.method) + "\n  \u8BF7\u6C42\u94FE\u63A5 \uFF1A" + chalk_1.default.cyan(target.url.href) + "\n  \u8BF7\u6C42\u4E3B\u4F53 \uFF1A" + requestBody + "\n");
                    return [4, target.requestTarget()];
                case 1:
                    response = _a.sent();
                    console.log("\n>>> \u63A5\u6536\u5230\u76EE\u6807\u54CD\u5E94\uFF1A" + chalk_1.default.gray(response.status + " " + response.statusText) + "\n");
                    rewrite_1.setResponseHeader(ctx, response.headers);
                    rewrite_1.setCors(ctx);
                    console.log(chalk.gray("========================================\n"));
                    ctx.body = response.data;
                    return [2];
            }
        });
    }); });
    app.listen(port);
}
exports.startProxy = startProxy;
