import { describe, expect, it } from "vitest";

import {
  customDomainSchema,
  isValidDomain,
  verificationRecordName,
  verificationRecordValue,
} from "./domains.js";

describe("custom domain validation", () => {
  it("accepts real hostnames and lowercases them", () => {
    const parsed = customDomainSchema.parse({ domain: " Apply.Example.COM " });
    expect(parsed.domain).toBe("apply.example.com");
    expect(isValidDomain("forms.community.gg")).toBe(true);
  });

  it("rejects schemes, paths, ports and bare labels", () => {
    for (const bad of ["https://x.com", "x.com/path", "x.com:443", "localhost", "x"]) {
      expect(customDomainSchema.safeParse({ domain: bad }).success).toBe(false);
    }
  });

  it("builds the verification record", () => {
    expect(verificationRecordName("apply.example.com")).toBe("_msk-forms.apply.example.com");
    expect(verificationRecordValue("abc123")).toBe("msk-verify=abc123");
  });
});
