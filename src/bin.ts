#! /usr/bin/env node

const chalk = require("chalk");
const program = require("commander");

// 命令行参数设置
program
  .name(`node ./dist/index.js`)
  .usage("-t https://example.com -p 8888")
  .option(
    "-p, --port <port>",
    `代理服务器端口，默认端口为4000`
  )
  .requiredOption(
    "-t, --target <origin>",
    `代理目标主机，合法格式为：${chalk.cyan(
      "http[s]://host:port"
    )}，如https://example.com`
  )
  .helpOption("-h, --help", "查看帮助")
  .parse(process.argv);