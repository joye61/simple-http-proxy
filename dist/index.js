"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const proxy_1 = require("./proxy");
const commander_1 = __importDefault(require("commander"));
commander_1.default
    .name(`node ./dist/index.js`)
    .usage("-p 4000 -k anykey")
    .option("-p, --port <port>", `代理服务器端口，默认端口为：4000`)
    .option("-k, --proxy-param <key>", `代理目标URL在查询字符串中对应的键，默认：__proxy`)
    .helpOption("-h, --help", "查看帮助")
    .parse(process.argv);
const port = parseInt(commander_1.default.port, 10) || 4000;
const proxyParam = (_a = commander_1.default.proxyParam) !== null && _a !== void 0 ? _a : "__proxy";
proxy_1.startProxy({ port, proxyParam });
