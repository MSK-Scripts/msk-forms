import { Card } from "@msk-forms/ui";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Placeholder — the form builder lands in the next slice (4b).
export default function NewFormPage() {
  return (
    <Card className="p-8">
      <p className="text-text-secondary">The form builder is coming in the next slice.</p>
    </Card>
  );
}
