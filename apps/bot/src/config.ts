/**
 * Bot configuration. Values are read at import time but NOT validated here —
 * validation happens in `assertConfig()`, called from `main()`. Throwing during
 * module import would surface as an `unhandledRejection` under the tsx/ESM
 * loader (module evaluation is async) instead of a clean startup error.
 */
export const config = {
  token: process.env.DISCORD_BOT_TOKEN ?? "",
  clientId: process.env.DISCORD_CLIENT_ID ?? "",
  apiBaseUrl: process.env.APP_URL ?? "http://localhost:3000",
  webhookSecret: process.env.INTERNAL_WEBHOOK_SECRET ?? "",
  // Custom-status text shown under the bot in the member list (global to the
  // bot). Override via BOT_ACTIVITY; empty string disables it.
  activity: process.env.BOT_ACTIVITY ?? "📋 forms.msk-scripts.de",
};

/**
 * Verify the required secrets are present. On failure, log a clear message and
 * exit cleanly (PM2 will back off and retry) rather than crashing with a stack.
 */
export function assertConfig(): void {
  const missing = (["DISCORD_BOT_TOKEN", "DISCORD_CLIENT_ID"] as const).filter(
    (name) => !process.env[name],
  );
  if (missing.length > 0) {
    console.error(
      `[bot] Missing required environment variable(s): ${missing.join(", ")}. ` +
        `Set them in /opt/msk-forms/.env, then restart the bot.`,
    );
    process.exit(1);
  }
}
