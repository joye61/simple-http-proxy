import { startProxy } from "./proxy";
import program from "commander";

// 命令行参数设置
program
  .name(`node ./dist/index.js`)
  .usage("-p 4000 -k anykey")
  .option("-p, --port <port>", `代理服务器端口，默认端口为：4000`)
  .option(
    "-k, --proxy-param <key>",
    `代理目标URL在查询字符串中对应的键，默认：__proxy`
  )
  .helpOption("-h, --help", "查看帮助")
  .parse(process.argv);

const port: number = parseInt(program.port, 10) || 4000;
const proxyParam: string = program.proxyParam ?? "__proxy";

/**
 * 启动代理服务器
 */
startProxy({ port, proxyParam });
