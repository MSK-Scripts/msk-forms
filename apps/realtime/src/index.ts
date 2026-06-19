import { WebSocketServer } from "ws";

/**
 * Realtime service (concept §10/§14) — live status updates to applicants and
 * the dashboard. Phase 0: minimal WS server with echo/heartbeat.
 */
const PORT = Number(process.env.REALTIME_PORT ?? 3100);

export function createServer(port: number = PORT): WebSocketServer {
  const wss = new WebSocketServer({ port });

  wss.on("connection", (socket) => {
    socket.send(JSON.stringify({ type: "welcome", service: "msk-forms-realtime" }));

    socket.on("message", (raw) => {
      // Phase 0: echo. Later: subscribe to submission/:uuid or guild/:gid.
      socket.send(raw.toString());
    });
  });

  console.info(`[realtime] WebSocket server listening on port ${port}`);
  return wss;
}

if (process.env.NODE_ENV !== "test") {
  createServer();
}
