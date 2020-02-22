# simple-http-proxy

一个跨域请求库，主要是解决跨域问题

`./dist/hijack.js` 是一个已经封装好的浏览器端使用的库，只需要将任意 ajax 请求的**完整 url**通过`hijack(url)`的方式包装，就可以应用代理的功能

## 通过脚本启动代理服务器

```
node ./dist/index.js
```

此时默认端口为 `4000`

## 通过脚本启动代理服务器

```
# 第一步
npm install simple-http-proxy

# 第二步
shproxy
```

默认启动端口为 `4000`，可以通过命令行参数修改

```
shproxy -p 4001
```

## 浏览器端使用示例

```js
// 原始请求
fetch("https://www.example.com?param=1");

// 修改为
fetch(hijack("https://www.example.com?param=1"));
```

即可以将所有的请求通过代理来发送，且默认解决跨域问题
