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
const https_1 = __importDefault(require("https"));
const axios_1 = __importDefault(require("axios"));
class Target {
    constructor(ctx) {
        this.ctx = ctx;
        this.headers = {};
        this.createUrl();
        this.createHeaders();
    }
    createUrl() {
        const originUrl = this.ctx.URL;
        const target = originUrl.searchParams.get(this.ctx.proxyParam);
        if (!target) {
            throw new Error(`Proxy target does not exist`);
        }
        this.url = new URL(target);
        originUrl.searchParams.delete(this.ctx.proxyParam);
        const keys = originUrl.searchParams.keys();
        for (let key of keys) {
            const value = originUrl.searchParams.get(key);
            this.url.searchParams.set(key, value);
        }
    }
    createHeaders() {
        for (let key in this.ctx.headers) {
            if (key === "host") {
                this.headers[key] = this.url.host;
                continue;
            }
            if (key === "origin") {
                this.headers[key] = this.url.origin;
                continue;
            }
            if (key === "referer") {
                this.headers[key] = this.url.href;
                continue;
            }
            this.headers[key] = this.ctx.headers[key];
        }
    }
    requestTarget() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default({
                url: this.url.href,
                method: this.ctx.method,
                headers: this.headers,
                data: this.ctx.req,
                responseType: "arraybuffer",
                validateStatus: () => true,
                httpsAgent: new https_1.default.Agent({
                    rejectUnauthorized: false
                })
            });
            return response;
        });
    }
}
exports.default = Target;
