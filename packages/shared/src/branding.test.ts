import { describe, expect, it } from "vitest";

import { MAX_CUSTOM_CSS, sanitizeCustomCss } from "./branding.js";

describe("sanitizeCustomCss", () => {
  it("keeps ordinary CSS untouched", () => {
    const css = ".msk-form { color: red; } h1 > span { font-weight: 700; }";
    expect(sanitizeCustomCss(css)).toBe(css);
  });

  it("strips style-tag breakouts", () => {
    expect(sanitizeCustomCss("a{}</style><script>x()</script>")).not.toMatch(/style/i);
  });

  it("strips @import, expression() and javascript:", () => {
    const out = sanitizeCustomCss(
      "@import url(http://evil); a{background:expression(alert(1))} b{x:javascript:1}",
    );
    expect(out).not.toMatch(/@import/i);
    expect(out).not.toMatch(/expression\s*\(/i);
    expect(out).not.toMatch(/javascript\s*:/i);
  });

  it("caps the length", () => {
    expect(sanitizeCustomCss("a".repeat(MAX_CUSTOM_CSS + 500)).length).toBe(MAX_CUSTOM_CSS);
  });

  it("is idempotent", () => {
    const once = sanitizeCustomCss("@import x; .a{}</style>");
    expect(sanitizeCustomCss(once)).toBe(once);
  });
});
