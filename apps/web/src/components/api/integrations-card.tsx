import { Card } from "@msk-forms/ui";

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
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <code className="rounded bg-muted px-2 py-1 font-mono text-xs text-foreground">
        <span className="font-semibold text-primary">{method}</span> {path}
      </code>
    </div>
  );
}

/**
 * Static reference card for the Zapier/Make REST-Hook endpoints. Rendered on the
 * Enterprise API page beneath the key manager — the integration platform uses a
 * key created there plus these endpoints to subscribe/unsubscribe.
 */
export function IntegrationsCard({
  baseUrl,
  t,
}: {
  baseUrl: string;
  t: IntegrationsText;
}) {
  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          {t.integrationsTitle}
        </h3>
        <p className="text-sm text-muted-foreground">{t.integrationsIntro}</p>
      </div>

      <p className="text-sm text-muted-foreground">{t.integrationsAuth}</p>

      <div className="flex flex-col gap-3">
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
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t.integrationsEventsTitle}
        </span>
        <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
          <li>
            <code className="font-mono text-xs text-foreground">submission.created</code> —{" "}
            {t.integrationsEventCreated.split("—")[1]?.trim() ?? t.integrationsEventCreated}
          </li>
          <li>
            <code className="font-mono text-xs text-foreground">submission.status_changed</code> —{" "}
            {t.integrationsEventStatus.split("—")[1]?.trim() ?? t.integrationsEventStatus}
          </li>
        </ul>
      </div>

      <p className="text-xs text-muted-foreground">{t.integrationsPayload}</p>
    </Card>
  );
}
