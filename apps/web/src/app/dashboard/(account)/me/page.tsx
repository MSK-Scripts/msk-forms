import { EmptyState, PageHeader } from "@/components/dashboard-kit";
import { MySubmissionsTable } from "@/components/dashboard/my-submissions-table";
import { getDict } from "@/i18n";
import { requireUser } from "@/lib/auth";
import { resolveStatus } from "@/lib/forms";
import { getUserSubmissions } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function MySubmissionsPage() {
  const user = await requireUser("/dashboard/me");
  const submissions = await getUserSubmissions(user.id);
  const dict = await getDict();
  const t = dict.dashboard;

  return (
    <>
      <PageHeader title={t.mySubmissionsTitle} />
      <MySubmissionsTable
        rows={submissions.map((s) => {
          const status = resolveStatus(s.status, [], dict.statusLabels);
          return {
            id: s.id,
            form: s.form.title,
            guild: s.guild.name,
            submittedAt: s.submittedAt.toISOString(),
            status: { label: status.label, color: status.color },
          };
        })}
        empty={<EmptyState kind="first-use" title={t.noMySubmissions} />}
        copy={{
          caption: t.mySubmissionsTitle,
          form: t.colForm,
          server: t.picker.colServer,
          date: t.picker.submitted,
          status: t.colStatus,
        }}
      />
    </>
  );
}
