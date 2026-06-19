import type { FormField } from "@msk-forms/shared";

/** Renders non-input layout fields: headings, paragraphs, dividers, spacers. */
export function LayoutBlock({ field }: { field: FormField }) {
  switch (field.type) {
    case "heading":
    case "section_break":
      return (
        <div className="border-b border-border pb-2">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            {field.label}
          </h2>
          {field.description && (
            <p className="mt-1 text-sm text-muted-foreground">{field.description}</p>
          )}
        </div>
      );

    case "paragraph":
      return <p className="text-sm text-muted-foreground">{field.description ?? field.label}</p>;

    case "divider":
      return <hr className="border-border" />;

    case "spacer":
      return <div className="h-4" aria-hidden />;

    default:
      return null;
  }
}
