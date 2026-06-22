import { z } from "zod";

/** A DNS hostname (no scheme, no path, no port). Lowercased before validation. */
const HOSTNAME = /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;

export const customDomainSchema = z.object({
  domain: z
    .string()
    .trim()
    .transform((s) => s.toLowerCase())
    .pipe(z.string().regex(HOSTNAME, "Enter a valid domain like apply.example.com.")),
});
export type CustomDomainInput = z.infer<typeof customDomainSchema>;

/** True if `host` is a syntactically valid custom domain hostname. */
export function isValidDomain(host: string): boolean {
  return HOSTNAME.test(host.trim().toLowerCase());
}

/** DNS TXT record name a guild owner adds to prove ownership. */
export function verificationRecordName(domain: string): string {
  return `_msk-forms.${domain}`;
}

/** Expected TXT record value for a verification token. */
export function verificationRecordValue(token: string): string {
  return `msk-verify=${token}`;
}
