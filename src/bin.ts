#! /usr/bin/env node

import program from "commander";
import { startProxy } from "./proxy";

// 命令行参数设置
program
  .name(`node ./dist/index.js`)
  .usage("-p 4141 -k anykey")
  .option("-p, --port <port>", `代理服务器端口，默认端口为4000`)
  .option(
    "-k, --proxy-param <key>",
    `代理目标URL在查询字符串中对应的键，默认：__proxy`
  )
  .helpOption("-h, --help", "查看帮助")
  .parse(process.argv);


/**
 * 启动代理服务器
 */
startProxy({ port: program.port, proxyParam: program.proxyParam });
