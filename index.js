const http = require("http");
const httpProxy = require("http-proxy");
const chalk = require("chalk");
const program = require("commander");
const pick = require("lodash/pick");

const defaultPort = 4000;

// 命令行参数设置
program
  .name(`node ./dist/index.js`)
  .usage("-t https://example.com -p 8888")
  .option(
    "-p, --port <port>",
    `代理服务器端口，默认端口为${chalk.cyan(defaultPort)}`
  )
  .requiredOption(
    "-t, --target <origin>",
    `代理目标主机，合法格式为：${chalk.cyan(
      "http[s]://host:port"
    )}，如https://example.com`
  )
  .helpOption("-h, --help", "查看帮助")
  .parse(process.argv);

/**
 * 创建代理
 */
const proxy = httpProxy.createProxyServer();

proxy.on("proxyReq", proxyReq => {
  console.log("\n");
  const sendObject = pick(proxyReq._options, [
    "maxRedirects",
    "maxBodyLength",
    "protocol",
    "port",
    "hostname",
    "method",
    "headers",
    "path",
    "pathname"
  ]);
  console.log(`发送代理请求 >>> `, sendObject, "\n");
});

proxy.on("proxyRes", (proxyRes, req) => {
  // 跨域许可设置
  proxyRes.headers["access-control-allow-origin"] = req.headers["origin"];
  proxyRes.headers["access-control-allow-methods"] = req.method.toUpperCase();
  proxyRes.headers["access-control-allow-credentials"] = `true`;

  console.log("\n");
  console.log(
    `>>> 获取响应状态：${chalk.yellow(
      `${proxyRes.statusCode} ${proxyRes.statusMessage}`
    )}`
  );
  console.log(`>>> 获取响应标头：`, proxyRes.headers, "\n");
});

/**
 * 创建代理服务器
 */
const server = http.createServer((req, res) => {
  // 将常规请求代理到目标服务器
  proxy.web(req, res, {
    target: program.target,
    secure: false,
    followRedirects: true,
    changeOrigin: true
  });
});

// 获取最终端口号
const finalPort = parseInt(program.port, 10) || defaultPort;
server.listen(finalPort);
console.log("\n", chalk.blue(`代理服务器已启动：localhost:${finalPort}`), "\n");
