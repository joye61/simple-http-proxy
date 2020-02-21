#! /usr/bin/env node
"use strict";
var chalk = require("chalk");
var program = require("commander");
program
    .name("node ./dist/index.js")
    .usage("-t https://example.com -p 8888")
    .option("-p, --port <port>", "\u4EE3\u7406\u670D\u52A1\u5668\u7AEF\u53E3\uFF0C\u9ED8\u8BA4\u7AEF\u53E3\u4E3A4000")
    .requiredOption("-t, --target <origin>", "\u4EE3\u7406\u76EE\u6807\u4E3B\u673A\uFF0C\u5408\u6CD5\u683C\u5F0F\u4E3A\uFF1A" + chalk.cyan("http[s]://host:port") + "\uFF0C\u5982https://example.com")
    .helpOption("-h, --help", "查看帮助")
    .parse(process.argv);
