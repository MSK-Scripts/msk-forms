import { WebSocketServer } from "ws";

/**
 * Realtime-Service (Konzept.md §10/§14) — Live-Status-Updates an Bewerber
 * und Dashboard. Phase 0: minimaler WS-Server mit Echo/Heartbeat.
 */
const PORT = Number(process.env.REALTIME_PORT ?? 3100);

export function createServer(port: number = PORT): WebSocketServer {
  const wss = new WebSocketServer({ port });

  wss.on("connection", (socket) => {
    socket.send(JSON.stringify({ type: "welcome", service: "msk-forms-realtime" }));

    socket.on("message", (raw) => {
      // Phase 0: Echo. Später: Subscribe auf submission/:uuid bzw. guild/:gid.
      socket.send(raw.toString());
    });
  });

  console.info(`[realtime] WebSocket-Server läuft auf Port ${port}`);
  return wss;
}

if (process.env.NODE_ENV !== "test") {
  createServer();
}
