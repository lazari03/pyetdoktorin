const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const WebSocket = require("ws");

const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);

    // Let Next.js handle the /video-session route
    if (parsedUrl.pathname === "/video-session") {
      // Redirect to the main video session page for backward compatibility
      res.writeHead(302, { Location: "/dashboard/appointments/video-session" + (parsedUrl.search || "") });
      res.end();
      return;
    }

    handle(req, res, parsedUrl);
  });

  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {


    ws.on("message", (message) => {

      ws.send(`Echo: ${message}`);
    });
  });

  server.listen(3000, () => {

  });
});
