/** PM2 — solo 127.0.0.1:3010 (Nginx hace proxy; no exponer *:3010 al internet). */
module.exports = {
  apps: [
    {
      name: "reuso",
      cwd: "/var/www/reuso",
      script: "npm",
      args: "run start:prod",
      env: {
        NODE_ENV: "production",
        PORT: "3010",
      },
      max_restarts: 10,
      restart_delay: 3000,
    },
  ],
};
