// PM2 processes for MSK Forms (concept §23).
// Deploy: `pm2 reload ecosystem.config.cjs --update-env`
//
// The standalone Next.js server (and the bot/realtime services) do NOT load
// `.env` themselves in production — Next only reads .env at build/dev time.
// So we load `/opt/msk-forms/.env` here and pass it through to every app's
// env. Node 22's process.loadEnvFile populates process.env without any extra
// dependency.
try {
  process.loadEnvFile(`${__dirname}/.env`);
} catch {
  // No .env present (e.g. local checkout) — rely on the ambient environment.
}

// Snapshot the resolved environment so every app inherits the secrets.
const baseEnv = { ...process.env };

module.exports = {
  apps: [
    {
      name: "msk-forms-web",
      cwd: "./apps/web",
      script: ".next/standalone/apps/web/server.js",
      env: {
        ...baseEnv,
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
        ...baseEnv,
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
        ...baseEnv,
        NODE_ENV: "production",
        // 3100 is taken on the server; 3009 sits next to the web app (3008).
        REALTIME_PORT: "3009",
      },
      instances: 1,
      max_memory_restart: "256M",
    },
  ],
};
