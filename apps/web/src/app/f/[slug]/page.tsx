import { notFound } from "next/navigation";

import { FormRenderer } from "@/components/form/form-renderer";
import { getCurrentUser } from "@/lib/auth";
import { getLiveFormBySlug } from "@/lib/forms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const form = await getLiveFormBySlug(slug);

  if (!form || !form.spec) notFound();

  // Closed / draft / archived forms are not publicly submittable.
  if (form.status !== "live") {
    return (
      <Shell guildName={form.guild.name} title={form.title}>
        <p className="text-sm text-text-secondary">
          This form is not accepting responses right now.
        </p>
      </Shell>
    );
  }

  // MVP visibility: public is open; authenticated requires a Discord login.
  // password / role_required are deferred to a later slice.
  if (form.visibility === "authenticated") {
    const user = await getCurrentUser();
    if (!user) {
      return (
        <Shell guildName={form.guild.name} title={form.title}>
          <p className="text-sm text-text-secondary">
            You need to sign in to fill out this form.
          </p>
          <a
            href={`/api/auth/discord/login?returnTo=/f/${slug}`}
            className="mt-4 inline-block rounded-sm bg-accent px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-bg hover:opacity-90"
          >
            Log in with Discord
          </a>
        </Shell>
      );
    }
  }

  if (form.visibility === "password" || form.visibility === "role_required") {
    return (
      <Shell guildName={form.guild.name} title={form.title}>
        <p className="text-sm text-text-secondary">
          This form uses an access restriction that isn&apos;t supported yet.
        </p>
      </Shell>
    );
  }

  return (
    <Shell guildName={form.guild.name} title={form.title} description={form.description}>
      <FormRenderer slug={form.slug} spec={form.spec} />
    </Shell>
  );
}

function Shell({
  guildName,
  title,
  description,
  children,
}: {
  guildName: string;
  title: string;
  description?: string | null;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase tracking-widest text-accent">
          {guildName}
        </span>
        <h1 className="font-heading text-3xl font-bold text-text-primary">{title}</h1>
        {description && <p className="text-text-secondary">{description}</p>}
      </header>
      <div className="rounded-lg border border-border bg-bg-panel p-6 shadow-panel">
        {children}
      </div>
    </main>
  );
}
