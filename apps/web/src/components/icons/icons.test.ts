import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ArrowLeft } from "./index";

// Icons are decorative unless they carry a label. Phosphor itself sets no
// aria-hidden, so without the wrapper every icon would reach screen readers
// as an unnamed graphic.
describe("icons", () => {
  it("hides a decorative icon from screen readers", () => {
    const html = renderToStaticMarkup(createElement(ArrowLeft));
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('focusable="false"');
  });

  it("announces an icon that has a label", () => {
    const html = renderToStaticMarkup(createElement(ArrowLeft, { "aria-label": "Back" }));
    expect(html).toContain('aria-label="Back"');
    expect(html).not.toContain("aria-hidden");
  });
});
