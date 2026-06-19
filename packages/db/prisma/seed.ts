/**
 * Idempotent seed for local/staging: one demo guild, owner and a live form
 * covering the Phase 1 core field types. Lets the public form flow be tested
 * before the form builder (later slice) exists.
 *
 * Run with DATABASE_URL set:  pnpm --filter @msk-forms/db seed
 */
import { fileURLToPath } from "node:url";

// The seed runs outside Next/PM2 (which inject env) and tsx doesn't load .env.
// Load the repo-root .env relative to this file BEFORE importing the db client
// (which reads DATABASE_URL at module load). A dynamic import keeps this order;
// a static import would be hoisted above the env load.
try {
  process.loadEnvFile(fileURLToPath(new URL("../../../.env", import.meta.url)));
} catch {
  // Fall back to the ambient environment if no .env is present.
}

const { prisma } = await import("../src/index");

const DEMO_DISCORD_ID = "000000000000000001";
const DEMO_GUILD_DISCORD_ID = "000000000000000010";
const DEMO_FORM_SLUG = "demo-whitelist";

const spec = {
  version: 1,
  pages: [
    {
      id: "p1",
      fields: [
        { id: "intro", type: "heading", label: "Whitelist application", description: "Tell us about yourself.", width: "full", validation: { required: false }, conditional: [] },
        { id: "ign", type: "short_text", label: "In-game name", placeholder: "John Doe", width: "full", validation: { required: true }, conditional: [] },
        { id: "discord", type: "short_text", label: "Discord tag", placeholder: "name#0000", width: "full", validation: { required: true }, conditional: [] },
        { id: "age", type: "number", label: "Age", width: "full", validation: { required: true, min: 16 }, conditional: [] },
        { id: "why", type: "long_text", label: "Why do you want to join?", width: "full", validation: { required: true, minLength: 20 }, conditional: [] },
        { id: "role", type: "single_choice", label: "Preferred role", width: "full", validation: { required: true }, conditional: [], options: [
          { value: "police", label: "Police" },
          { value: "ems", label: "EMS" },
          { value: "civ", label: "Civilian" },
        ] },
        { id: "avail", type: "multi_choice", label: "Availability", width: "full", validation: { required: false }, conditional: [], options: [
          { value: "weekdays", label: "Weekdays" },
          { value: "weekends", label: "Weekends" },
          { value: "evenings", label: "Evenings" },
        ] },
        { id: "rules", type: "yes_no", label: "Have you read the rules?", width: "full", validation: { required: true }, conditional: [] },
        { id: "confirm", type: "consent", label: "Confirmation", placeholder: "I confirm my answers are truthful.", width: "full", validation: { required: true }, conditional: [] },
      ],
    },
  ],
};

async function main() {
  const user = await prisma.user.upsert({
    where: { discordId: DEMO_DISCORD_ID },
    update: {},
    create: { discordId: DEMO_DISCORD_ID, username: "demo-owner", locale: "en" },
  });

  const guild = await prisma.guild.upsert({
    where: { discordGuildId: DEMO_GUILD_DISCORD_ID },
    update: {},
    create: {
      discordGuildId: DEMO_GUILD_DISCORD_ID,
      name: "Demo Roleplay",
      ownerUserId: user.id,
      members: { create: { userId: user.id, role: "owner" } },
    },
  });

  await prisma.form.upsert({
    where: { slug: DEMO_FORM_SLUG },
    update: { schema: spec, status: "live" },
    create: {
      guildId: guild.id,
      slug: DEMO_FORM_SLUG,
      title: "Whitelist Application",
      description: "Apply to join the Demo Roleplay server.",
      mode: "application",
      status: "live",
      visibility: "public",
      schema: spec,
      createdById: user.id,
    },
  });

  // Optional: add a real Discord user (you) to the demo guild as admin, so the
  // dashboard isn't empty after login. Set SEED_MEMBER_DISCORD_ID and re-run.
  // The user must have logged in at least once (so their account exists).
  const memberDiscordId = process.env.SEED_MEMBER_DISCORD_ID;
  if (memberDiscordId) {
    const member = await prisma.user.findUnique({
      where: { discordId: memberDiscordId },
      select: { id: true, username: true },
    });
    if (!member) {
      console.warn(
        `SEED_MEMBER_DISCORD_ID=${memberDiscordId} has no account yet — log in once, then re-run.`,
      );
    } else {
      await prisma.guildMember.upsert({
        where: { guildId_userId: { guildId: guild.id, userId: member.id } },
        update: { role: "admin" },
        create: { guildId: guild.id, userId: member.id, role: "admin" },
      });
      console.log(`Added ${member.username} to "${guild.name}" as admin.`);
    }
  }

  console.log(`Seeded. Public form: /f/${DEMO_FORM_SLUG}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
