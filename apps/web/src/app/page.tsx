import { CtaBand } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { Steps } from "@/components/landing/steps";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/i18n";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string }>;
}) {
  const user = await getCurrentUser();
  const { auth } = await searchParams;
  const t = await getDict();

  return (
    <>
      {auth === "error" && (
        <div className="container pt-4">
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {t.authError}
          </p>
        </div>
      )}

      <Hero loggedIn={Boolean(user)} />
      <Features />
      <Steps />
      <CtaBand loggedIn={Boolean(user)} />
    </>
  );
}
