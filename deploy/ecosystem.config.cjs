/** PM2 — puerto 3010 (evitar 3000=Docker y 3001=otra API en el VPS). */
module.exports = {
  apps: [
    {
      name: "reuso",
      cwd: "/var/www/reuso",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3010",
      env: {
        NODE_ENV: "production",
        PORT: "3010",
      },
      max_restarts: 10,
      restart_delay: 3000,
    },
  ],
};
