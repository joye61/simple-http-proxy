#! /usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const proxy_1 = require("./proxy");
commander_1.default
    .name(`node ./dist/index.js`)
    .usage("-p 4001 -k anykey")
    .option("-p, --port <port>", `代理服务器端口，默认端口为4000`)
    .option("-k, --proxy-param <key>", `代理目标URL在查询字符串中对应的键，默认：__proxy`)
    .helpOption("-h, --help", "查看帮助")
    .parse(process.argv);
proxy_1.startProxy({ port: commander_1.default.port, proxyParam: commander_1.default.proxyParam });
