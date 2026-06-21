"use client";

import type { FormField } from "@msk-forms/shared";

type MatrixValue = Record<string, string>;

/**
 * Matrix question: one radio per (row, column). Rows are the field's sub-questions,
 * columns reuse the field's `options`. The answer is a `{ rowId: columnValue }` map.
 */
export function MatrixField({
  field,
  value,
  onChange,
  disabled,
}: {
  field: FormField;
  value?: MatrixValue;
  onChange: (value: MatrixValue) => void;
  disabled?: boolean;
}) {
  const rows = field.rows ?? [];
  const cols = field.options ?? [];
  const current = value ?? {};

  function pick(rowId: string, colValue: string) {
    onChange({ ...current, [rowId]: colValue });
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="p-2" />
            {cols.map((col) => (
              <th
                key={col.value}
                className="p-2 text-center text-xs font-medium text-muted-foreground"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-border">
              <td className="p-2 text-foreground">{row.label}</td>
              {cols.map((col) => {
                const name = `${field.id}-${row.id}`;
                return (
                  <td key={col.value} className="p-2 text-center">
                    <input
                      type="radio"
                      name={name}
                      aria-label={`${row.label}: ${col.label}`}
                      value={col.value}
                      checked={current[row.id] === col.value}
                      disabled={disabled}
                      onChange={() => pick(row.id, col.value)}
                      className="h-4 w-4 accent-primary"
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
