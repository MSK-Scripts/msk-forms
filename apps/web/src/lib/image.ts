/**
 * Sniff a raster image's real type from its magic bytes — never trust the
 * client-declared MIME. SVG is intentionally unsupported (it can carry script
 * and would be a stored-XSS vector when served from our origin).
 */
export type RasterImage = "png" | "jpeg" | "webp" | "gif";

export function sniffRasterImage(bytes: Uint8Array): RasterImage | null {
  const b = bytes;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
    return "png";
  }
  // JPEG: FF D8 FF
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  // GIF: "GIF8"
  if (b.length > 4 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) {
    return "gif";
  }
  // WebP: "RIFF" .... "WEBP"
  if (
    b.length > 12 &&
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50
  ) {
    return "webp";
  }
  return null;
}
