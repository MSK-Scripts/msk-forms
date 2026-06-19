function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  token: required("DISCORD_BOT_TOKEN"),
  clientId: required("DISCORD_CLIENT_ID"),
  apiBaseUrl: process.env.APP_URL ?? "http://localhost:3000",
  webhookSecret: process.env.INTERNAL_WEBHOOK_SECRET ?? "",
};
