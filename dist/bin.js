#! /usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = __importDefault(require("commander"));
var proxy_1 = require("./proxy");
commander_1.default
    .name("node ./dist/index.js")
    .usage("-p 4141 -k anykey")
    .option("-p, --port <port>", "\u4EE3\u7406\u670D\u52A1\u5668\u7AEF\u53E3\uFF0C\u9ED8\u8BA4\u7AEF\u53E3\u4E3A4000")
    .option("-k, --proxy-param <key>", "\u4EE3\u7406\u76EE\u6807URL\u5728\u67E5\u8BE2\u5B57\u7B26\u4E32\u4E2D\u5BF9\u5E94\u7684\u952E\uFF0C\u9ED8\u8BA4\uFF1A__proxy")
    .helpOption("-h, --help", "查看帮助")
    .parse(process.argv);
proxy_1.startProxy({ port: commander_1.default.port, proxyParam: commander_1.default.proxyParam });
