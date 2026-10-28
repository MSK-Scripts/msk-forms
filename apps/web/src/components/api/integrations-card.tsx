import { SectionCard } from "@/components/dashboard-kit";

/** The subset of the API dictionary the integrations card renders. */
interface IntegrationsText {
  integrationsTitle: string;
  integrationsIntro: string;
  integrationsAuth: string;
  integrationsTestConn: string;
  integrationsSubscribe: string;
  integrationsUnsubscribe: string;
  integrationsEventsTitle: string;
  integrationsEventCreated: string;
  integrationsEventStatus: string;
  integrationsPayload: string;
}

function Endpoint({ method, path, label }: { method: string; path: string; label: string }) {
  return (
    <div className="grid gap-1">
      <dt className="text-small text-muted-foreground">{label}</dt>
      <dd>
        <code className="block rounded-md bg-muted px-3 py-2 font-mono text-small break-all text-foreground">
          <span className="font-semibold">{method}</span> {path}
        </code>
      </dd>
    </div>
  );
}

/**
 * Static reference for the Zapier/Make REST-Hook endpoints. Rendered on the
 * Enterprise API page beneath the key manager: the integration platform uses a
 * key created there plus these endpoints to subscribe and unsubscribe.
 */
export function IntegrationsCard({ baseUrl, t }: { baseUrl: string; t: IntegrationsText }) {
  return (
    <SectionCard title={t.integrationsTitle} description={t.integrationsIntro}>
      <div className="grid gap-5">
        <p className="max-w-[65ch]">{t.integrationsAuth}</p>

        <dl className="grid gap-3">
          <Endpoint method="GET" path={`${baseUrl}/api/v1/me`} label={t.integrationsTestConn} />
          <Endpoint
            method="POST"
            path={`${baseUrl}/api/v1/hooks`}
            label={t.integrationsSubscribe}
          />
          <Endpoint
            method="DELETE"
            path={`${baseUrl}/api/v1/hooks/{id}`}
            label={t.integrationsUnsubscribe}
          />
        </dl>

        <div className="grid gap-2">
          <h3 className="text-label font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            {t.integrationsEventsTitle}
          </h3>
          <ul className="grid gap-1.5">
            <li>
              <code className="font-mono text-small">submission.created</code>:{" "}
              {t.integrationsEventCreated.split(":")[1]?.trim() ?? t.integrationsEventCreated}
            </li>
            <li>
              <code className="font-mono text-small">submission.status_changed</code>:{" "}
              {t.integrationsEventStatus.split(":")[1]?.trim() ?? t.integrationsEventStatus}
            </li>
          </ul>
        </div>

        <p className="max-w-[65ch] text-small text-muted-foreground">{t.integrationsPayload}</p>
      </div>
    </SectionCard>
  );
}
