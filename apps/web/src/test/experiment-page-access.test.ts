import { beforeEach, describe, expect, it, vi } from "vitest";

const canManageForm = vi.fn();
const canManageForms = vi.fn();
const getFormForEdit = vi.fn();

vi.mock("@/lib/auth", () => ({ requireUser: async () => ({ id: "u1" }) }));
vi.mock("@/lib/guild", () => ({ canManageForm, canManageForms }));
vi.mock("@/lib/forms", () => ({ getFormForEdit }));
vi.mock("@msk-forms/db", () => ({
  prisma: { experimentStat: { findMany: async () => [] } },
}));
vi.mock("@/i18n", async () => {
  const { dictionaries } = await import("@/i18n/dictionaries");
  return { getDict: async () => dictionaries.en, getLocale: async () => "en" };
});

const { default: ExperimentResultsPage } =
  await import("@/app/dashboard/[guildId]/forms/[formId]/experiment/page");

const open = () =>
  ExperimentResultsPage({ params: Promise.resolve({ guildId: "g1", formId: "f1" }) });

describe("A/B results page access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getFormForEdit.mockResolvedValue({ id: "f1", title: "Whitelist", settings: {} });
  });

  it("opens for someone who manages only this form", async () => {
    canManageForms.mockResolvedValue(false);
    canManageForm.mockResolvedValue(true);
    await open();
    expect(canManageForm).toHaveBeenCalledWith("g1", "u1", "f1");
    expect(getFormForEdit).toHaveBeenCalledWith("f1", "g1");
  });

  it("stays closed without the right for this form", async () => {
    canManageForms.mockResolvedValue(false);
    canManageForm.mockResolvedValue(false);
    await open();
    expect(getFormForEdit).not.toHaveBeenCalled();
  });
});
