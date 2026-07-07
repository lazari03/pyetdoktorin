const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const WebSocket = require("ws");

const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

const isProd = process.env.NODE_ENV === "production";

// Origins permitted to open a WebSocket connection. Without this check any
// website could open a cross-site WebSocket (CSWSH) to this server. In
// development we allow localhost; in production only the configured origins.
const allowedWsOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

function isAllowedWsOrigin(origin) {
  if (!origin) return !isProd; // non-browser clients send no Origin; allow only outside prod
  const normalized = origin.replace(/\/$/, "");
  if (!isProd && /^(http:\/\/localhost|http:\/\/127\.0\.0\.1)(:\d+)?$/.test(normalized)) {
    return true;
  }
  return allowedWsOrigins.includes(normalized);
}

// Cap inbound WebSocket frame size to blunt memory-exhaustion abuse.
const MAX_WS_MESSAGE_BYTES = 16 * 1024;

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

  const wss = new WebSocket.Server({
    server,
    maxPayload: MAX_WS_MESSAGE_BYTES,
    verifyClient: (info, done) => {
      const origin = info.origin || info.req.headers.origin;
      if (isAllowedWsOrigin(origin)) {
        return done(true);
      }
      return done(false, 403, "Forbidden origin");
    },
  });

  wss.on("connection", (ws) => {
    // Do not reflect arbitrary client input back (avoids being used as an
    // amplification/reflection relay). Acknowledge receipt instead.
    ws.on("message", () => {
      ws.send(JSON.stringify({ type: "ack" }));
    });
  });

  server.listen(3000, () => {

  });
});
