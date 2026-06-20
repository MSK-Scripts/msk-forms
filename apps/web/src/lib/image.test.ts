import { describe, expect, it } from "vitest";

import { sniffRasterImage } from "./image";

describe("sniffRasterImage", () => {
  it("detects PNG / JPEG / GIF / WebP signatures", () => {
    expect(sniffRasterImage(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]))).toBe("png");
    expect(sniffRasterImage(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("jpeg");
    expect(sniffRasterImage(new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39]))).toBe("gif");
    const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 0]);
    expect(sniffRasterImage(webp)).toBe("webp");
  });

  it("rejects SVG and other non-raster content", () => {
    // "<svg" / "<?xml" — must NOT be accepted.
    expect(sniffRasterImage(new TextEncoder().encode("<svg xmlns=…"))).toBeNull();
    expect(sniffRasterImage(new TextEncoder().encode("<?xml version"))).toBeNull();
    expect(sniffRasterImage(new Uint8Array([0x00, 0x01, 0x02]))).toBeNull();
  });
});
