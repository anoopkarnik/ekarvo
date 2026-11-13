import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({
  active: vi.fn(),
  member: vi.fn(),
  legacyIt: vi.fn(),
  session: vi.fn(),
}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
}));
vi.mock("@workspace/auth/better-auth/auth", () => ({
  auth: { api: { getSession: m.session } },
}));
vi.mock("@workspace/database/client", () => ({
  default: {
    member: { findUnique: m.member },
    bpoAdminGrant: { findFirst: m.legacyIt },
  },
}));
vi.mock("@/trpc/org", () => ({ getActiveOrganizationId: m.active }));
vi.mock("@/components/home/StarterHome", () => ({ default: () => null }));
import Page from "@/app/(home)/page";
beforeEach(() => {
  vi.resetAllMocks();
  m.session.mockResolvedValue({
    user: { id: "u", role: "user" },
    session: { id: "session" },
  });
  m.legacyIt.mockResolvedValue({ organizationId: "other-bpo" });
});
it("lands in operations when the selected workspace is operational even if the user is IT elsewhere", async () => {
  m.active.mockResolvedValue("operations-bpo");
  m.member.mockResolvedValue({
    bpoAdmin: null,
    organization: { bpo: { suspended: false } },
  });
  await expect(Page()).rejects.toThrow(/^redirect:\/pulse$/);
});
it("lands in IT administration for the currently selected BPO", async () => {
  m.active.mockResolvedValue("it-bpo");
  m.member.mockResolvedValue({
    bpoAdmin: { organizationId: "it-bpo" },
    organization: { bpo: { suspended: false } },
  });
  await expect(Page()).rejects.toThrow(/^redirect:\/pulse\/admin$/);
});
