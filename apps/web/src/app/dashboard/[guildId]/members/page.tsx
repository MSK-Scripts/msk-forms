import { prisma } from "@msk-forms/db";
import { Card } from "@msk-forms/ui";

import { FormDeletionSetting } from "@/components/members/form-deletion-setting";
import { MembersManager, type MemberRow } from "@/components/members/members-manager";
import { requireUser } from "@/lib/auth";
import { canManageForms, countTeamMembers, getGuildRole } from "@/lib/guild";
import { getGuildPlan } from "@/lib/plan";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROLE_ORDER: Record<string, number> = { owner: 0, admin: 1, reviewer: 2, viewer: 3 };

export default async function MembersPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/members`);
  const dict = await getDict();
  const t = dict.members;

  if (!(await canManageForms(guildId, user.id))) {
    return (
      <Card className="p-8">
        <p className="text-muted-foreground">{t.noPerm}</p>
      </Card>
    );
  }

  const [members, grants, forms, plan, teamCount, role, guild] = await Promise.all([
    prisma.guildMember.findMany({
      where: { guildId },
      select: { role: true, user: { select: { id: true, username: true, avatar: true } } },
    }),
    prisma.formReviewer.findMany({
      where: { form: { guildId } },
      select: { userId: true, formId: true, canManage: true },
    }),
    // Archived forms stay in this list: saving a member's access replaces all of
    // their grants, so leaving them out would silently drop access to a form
    // that may be restored later.
    prisma.form
      .findMany({
        where: { guildId },
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, archivedAt: true },
      })
      .then((rows) =>
        rows.map((f) => ({
          id: f.id,
          title: f.archivedAt ? `${f.title} (${dict.dashboard.formArchive.archivedSuffix})` : f.title,
        })),
      ),
    getGuildPlan(guildId),
    countTeamMembers(guildId),
    getGuildRole(guildId, user.id),
    prisma.guild.findUnique({ where: { id: guildId }, select: { adminsCanDeleteForms: true } }),
  ]);

  // Per-user, per-form access level: "manage" (full) or "review" (read).
  const accessByUser: Record<string, Record<string, "review" | "manage">> = {};
  for (const g of grants) {
    (accessByUser[g.userId] ??= {})[g.formId] = g.canManage ? "manage" : "review";
  }

  const rows: MemberRow[] = members
    .map((m) => ({
      userId: m.user.id,
      username: m.user.username,
      avatar: m.user.avatar,
      role: m.role,
      access: accessByUser[m.user.id] ?? {},
    }))
    .sort((a, b) => (ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9) || a.username.localeCompare(b.username));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-semibold text-foreground">{t.title}</h2>
        <p className="text-sm text-muted-foreground">{t.intro}</p>
      </div>
      <MembersManager
        guildId={guildId}
        members={rows}
        forms={forms}
        teamCount={teamCount}
        memberLimit={plan.memberLimit}
        t={t}
      />
      {role === "owner" && (
        <FormDeletionSetting
          guildId={guildId}
          initial={Boolean(guild?.adminsCanDeleteForms)}
          t={dict.members.formDeletion}
        />
      )}
    </div>
  );
}
