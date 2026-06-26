// Tiny, dependency-free Markdown → HTML renderer for the legal pages
// (imprint / privacy / terms). Ported from the msk-shop legal system so the
// pages share the same look. The output is styled via the `.legal-content`
// class in globals.css. Content lives in `src/content/legal/*` as plain TS
// strings (no runtime fs — works in the standalone build).
//
// Supported syntax: # / ## / ### headings, --- rules, - / * and ordered
// lists, | tables, paragraphs (consecutive lines joined with <br />), plus
// inline **bold**, *italic*, `code`, and [text](http|mailto) links.

export function renderMarkdown(md: string): string {
  const lines = md.split("\n");
  const output: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (/^-{3,}$/.test(line.trim())) {
      output.push("<hr />");
      i++;
      continue;
    }

    if (line.startsWith("# ")) {
      output.push(`<h1>${inline(line.slice(2))}</h1>`);
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      output.push(`<h2>${inline(line.slice(3))}</h2>`);
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      output.push(`<h3>${inline(line.slice(4))}</h3>`);
      i++;
      continue;
    }

    // Table — consecutive lines starting with |
    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i]!.startsWith("|")) {
        tableLines.push(lines[i]!);
        i++;
      }
      output.push(renderTable(tableLines));
      continue;
    }

    // Unordered list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i]!.startsWith("- ") || lines[i]!.startsWith("* "))) {
        items.push(`<li>${inline(lines[i]!.slice(2))}</li>`);
        i++;
      }
      output.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i]!)) {
        items.push(`<li>${inline(lines[i]!.replace(/^\d+\.\s/, ""))}</li>`);
        i++;
      }
      output.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    // Paragraph — collect consecutive non-special lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i]!.trim() !== "" &&
      !lines[i]!.startsWith("#") &&
      !lines[i]!.startsWith("- ") &&
      !lines[i]!.startsWith("* ") &&
      !lines[i]!.startsWith("|") &&
      !/^-{3,}$/.test(lines[i]!.trim()) &&
      !/^\d+\.\s/.test(lines[i]!)
    ) {
      paraLines.push(inline(lines[i]!));
      i++;
    }
    if (paraLines.length > 0) {
      output.push(`<p>${paraLines.join("<br />")}</p>`);
    }
  }

  return output.join("\n");
}

function renderTable(lines: string[]): string {
  const rows = lines.filter((l) => !/^\|[\s\-:|]+\|$/.test(l.trim()));
  if (rows.length === 0) return "";

  const parseRow = (row: string): string[] => row.split("|").slice(1, -1).map((cell) => cell.trim());

  const [headerRow, ...bodyRows] = rows;
  const headers = parseRow(headerRow!)
    .map((h) => `<th>${inline(h)}</th>`)
    .join("");
  const body = bodyRows
    .map((row) => {
      const cells = parseRow(row)
        .map((c) => `<td>${inline(c)}</td>`)
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  return `<div class="table-wrap"><table><thead><tr>${headers}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function inline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((https?:\/\/.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\[(.+?)\]\((mailto:.+?)\)/g, '<a href="$2">$1</a>')
    // Relative in-app links (e.g. [Privacy Policy](/terms/privacy)) — same tab.
    .replace(/\[(.+?)\]\((\/[^)]*?)\)/g, '<a href="$2">$1</a>');
}
