import "server-only";

/**
 * Cloudflare Turnstile captcha. Active only when BOTH keys are configured
 * (CAPTCHA_SITE_KEY + CAPTCHA_SECRET_KEY) — otherwise the public form skips it
 * entirely, so local dev and unconfigured deployments keep working.
 */

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** The public site key for the client widget, or null when captcha is off. */
export function captchaSiteKey(): string | null {
  return process.env.CAPTCHA_SITE_KEY || null;
}

/** True when captcha should be enforced (both keys present). */
export function captchaEnabled(): boolean {
  return Boolean(process.env.CAPTCHA_SITE_KEY && process.env.CAPTCHA_SECRET_KEY);
}

/**
 * Verify a Turnstile token with Cloudflare. Returns true when captcha is not
 * configured (nothing to enforce); otherwise **fails closed** — a missing token
 * or any verification error rejects the submission.
 */
export async function verifyCaptcha(token: string | undefined, ip?: string): Promise<boolean> {
  const secret = process.env.CAPTCHA_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== "unknown") body.set("remoteip", ip);

    const res = await fetch(SITEVERIFY, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) {
      console.error("[captcha] siteverify returned HTTP", res.status);
      return false;
    }
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error("[captcha] verification error:", (err as Error).message);
    return false;
  }
}
