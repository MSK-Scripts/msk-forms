import pg from "pg";
import { WebSocket, WebSocketServer } from "ws";

/**
 * Realtime service (concept §10/§14) — live status updates for applicants.
 *
 * Source of truth is Postgres: every submission change runs
 * `pg_notify('submission_change', <submissionId>)` (see @msk-forms/db
 * `changeSubmissionStatus` / `notifySubmissionChange`). This service LISTENs on
 * that channel and fans the notification out to the WebSocket clients that
 * subscribed to the matching `submission:<uuid>` topic. The browser then
 * re-fetches its status page. Covers web, bulk, and bot changes uniformly.
 */

const PORT = Number(process.env.REALTIME_PORT ?? 3009);
// Loopback only — reachable solely via the Apache reverse proxy (wss://…/realtime).
const HOST = process.env.REALTIME_HOST ?? "127.0.0.1";
const CHANNEL = "submission_change";
const MAX_TOPICS_PER_SOCKET = 20;
const SUBMISSION_TOPIC = /^submission:[0-9a-fA-F-]{36}$/;

interface ClientState {
  alive: boolean;
  topics: Set<string>;
}

export function createServer(port: number = PORT): WebSocketServer {
  const wss = new WebSocketServer({ host: HOST, port });
  const clients = new Map<WebSocket, ClientState>();
  // topic -> sockets subscribed to it (fan-out index)
  const topicIndex = new Map<string, Set<WebSocket>>();

  function subscribe(socket: WebSocket, topic: string) {
    const state = clients.get(socket);
    if (!state || state.topics.size >= MAX_TOPICS_PER_SOCKET || state.topics.has(topic)) return;
    state.topics.add(topic);
    let set = topicIndex.get(topic);
    if (!set) topicIndex.set(topic, (set = new Set()));
    set.add(socket);
  }

  function drop(socket: WebSocket) {
    const state = clients.get(socket);
    if (state) {
      for (const topic of state.topics) {
        const set = topicIndex.get(topic);
        set?.delete(socket);
        if (set && set.size === 0) topicIndex.delete(topic);
      }
    }
    clients.delete(socket);
  }

  /** Send an update to every socket subscribed to `topic`. */
  function fanout(topic: string) {
    const set = topicIndex.get(topic);
    if (!set) return;
    const data = JSON.stringify({ type: "update", topic });
    for (const socket of set) {
      if (socket.readyState === WebSocket.OPEN) socket.send(data);
    }
  }

  wss.on("connection", (socket) => {
    clients.set(socket, { alive: true, topics: new Set() });
    socket.send(JSON.stringify({ type: "welcome", service: "msk-forms-realtime" }));

    socket.on("message", (raw) => {
      let msg: unknown;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }
      const m = msg as { type?: string; topic?: string };
      if (m.type === "subscribe" && typeof m.topic === "string" && SUBMISSION_TOPIC.test(m.topic)) {
        subscribe(socket, m.topic);
      }
    });

    socket.on("pong", () => {
      const state = clients.get(socket);
      if (state) state.alive = true;
    });
    socket.on("close", () => drop(socket));
    socket.on("error", () => drop(socket));
  });

  // Heartbeat: drop dead connections so the topic index doesn't leak.
  const heartbeat = setInterval(() => {
    for (const [socket, state] of clients) {
      if (!state.alive) {
        socket.terminate();
        drop(socket);
        continue;
      }
      state.alive = false;
      socket.ping();
    }
  }, 30_000);
  wss.on("close", () => clearInterval(heartbeat));

  void listenForChanges(fanout);

  console.info(`[realtime] WebSocket server listening on ${HOST}:${port}`);
  return wss;
}

/**
 * Maintain a Postgres LISTEN connection and call `fanout('submission:<id>')`
 * for each notification. Reconnects with backoff so a DB blip doesn't kill the
 * stream. Fails soft when DATABASE_URL is absent (no live updates, no crash).
 */
async function listenForChanges(fanout: (topic: string) => void): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("[realtime] DATABASE_URL not set — live updates disabled.");
    return;
  }

  const connect = async (): Promise<void> => {
    const client = new pg.Client({ connectionString });
    client.on("notification", (msg) => {
      if (msg.channel === CHANNEL && msg.payload) fanout(`submission:${msg.payload}`);
    });
    client.on("error", (err) => {
      console.error("[realtime] pg listen error, reconnecting:", err.message);
      client.end().catch(() => {});
      setTimeout(() => void connect(), 3000);
    });
    await client.connect();
    await client.query(`LISTEN ${CHANNEL}`);
    console.info(`[realtime] LISTEN ${CHANNEL} active`);
  };

  try {
    await connect();
  } catch (err) {
    console.error("[realtime] initial pg connect failed, retrying:", (err as Error).message);
    setTimeout(() => void listenForChanges(fanout), 3000);
  }
}

if (process.env.NODE_ENV !== "test") {
  createServer();
}
