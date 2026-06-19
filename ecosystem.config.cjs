// PM2 processes for MSK Forms (concept §23).
// Deploy: `pm2 reload ecosystem.config.cjs --update-env`
module.exports = {
  apps: [
    {
      name: "msk-forms-web",
      cwd: "./apps/web",
      script: ".next/standalone/apps/web/server.js",
      env: {
        NODE_ENV: "production",
        // Must match the Apache reverse-proxy target (forms.msk-scripts.de -> 3008).
        PORT: "3008",
        // Bind to loopback only — reachable solely via the Apache reverse proxy.
        HOSTNAME: "127.0.0.1",
      },
      instances: 1,
      exec_mode: "cluster",
      max_memory_restart: "512M",
    },
    {
      name: "msk-forms-bot",
      cwd: "./apps/bot",
      script: "dist/index.js",
      env: {
        NODE_ENV: "production",
      },
      instances: 1,
      max_memory_restart: "256M",
    },
    {
      name: "msk-forms-realtime",
      cwd: "./apps/realtime",
      script: "dist/index.js",
      env: {
        NODE_ENV: "production",
        // 3100 is taken on the server; 3009 sits next to the web app (3008).
        REALTIME_PORT: "3009",
      },
      instances: 1,
      max_memory_restart: "256M",
    },
  ],
};
