import { CtaBand } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { LandingNav } from "@/components/landing/nav";
import { Steps } from "@/components/landing/steps";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string }>;
}) {
  const user = await getCurrentUser();
  const { auth } = await searchParams;

  return (
    <>
      <LandingNav user={user} />

      {auth === "error" && (
        <div className="mx-auto max-w-content px-6 pt-4">
          <p className="rounded-sm border border-red-500/40 bg-red-500/10 px-4 py-2 font-mono text-xs text-red-400">
            Login failed. Please try again.
          </p>
        </div>
      )}

      <main>
        <Hero loggedIn={Boolean(user)} />
        <Features />
        <Steps />
        <CtaBand loggedIn={Boolean(user)} />
      </main>

      <Footer />
    </>
  );
}
