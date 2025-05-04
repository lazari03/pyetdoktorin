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
      handle(req, res, parsedUrl);
      return;
    }

    handle(req, res, parsedUrl);
  });

  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("New WebSocket connection");

    ws.on("message", (message) => {
      console.log("Received:", message);
      ws.send(`Echo: ${message}`);
    });
  });

  server.listen(3000, () => {
    console.log("> Ready on http://localhost:3000");
  });
});
