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
    <div className="relative overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <td className="p-2" />
            {cols.map((col) => (
              <th
                key={col.value}
                scope="col"
                className="p-2 text-center text-small font-semibold text-muted-foreground"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-border">
              <th scope="row" className="p-2 text-start font-normal text-foreground">
                {row.label}
              </th>
              {cols.map((col) => {
                const name = `${field.id}-${row.id}`;
                return (
                  <td key={col.value} className="p-0 text-center">
                    <label className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center">
                      <input
                        type="radio"
                        name={name}
                        aria-label={`${row.label}: ${col.label}`}
                        value={col.value}
                        checked={current[row.id] === col.value}
                        disabled={disabled}
                        onChange={() => pick(row.id, col.value)}
                        className="h-5 w-5 accent-primary"
                      />
                    </label>
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
