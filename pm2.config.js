const path = require("path");

module.exports = {
  apps: [
    {
      name: "simple-http-proxy",
      script: path.resolve(__dirname, "./dist/index.js"),
      cwd: path.resolve(__dirname),
      instances: "max",
      exec_mode: "cluster",
      args: "-p 4000 -k __proxy",
      autorestart: true,
      watch: false,
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
};
