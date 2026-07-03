import { GuildFormsHub, type HubGuild } from "@/components/public/forms-hub";
import { getGuildCategories, getLiveFormsForGuild } from "@/lib/forms";
import { getDict } from "@/i18n";

/**
 * Loads a guild's live forms + categories and renders the public hub. Shared by
 * the custom-domain landing, the `/g/[guildId]` route and the `/[handle]` vanity
 * route so they stay identical.
 */
export async function GuildHub({ guild }: { guild: HubGuild }) {
  const t = await getDict();
  const [forms, categories] = await Promise.all([
    getLiveFormsForGuild(guild.id),
    getGuildCategories(guild.id),
  ]);
  return (
    <GuildFormsHub
      guild={guild}
      forms={forms}
      categories={categories}
      labels={{
        chooseForm: t.domainHome.chooseForm,
        noForms: t.domainHome.noForms,
        endingSoon: t.form.endingSoon,
        opensAt: t.form.opensAt,
        opensIn: t.form.opensIn,
        otherForms: t.domainHome.otherForms,
      }}
    />
  );
}
