import { beforeEach, describe, expect, it, vi } from "vitest";
const db = vi.hoisted(() => ({
  member: { findUnique: vi.fn() },
  clientAccount: { findFirst: vi.fn() },
  pulseTeam: { count: vi.fn() },
  user: { findUnique: vi.fn() },
}));
vi.mock("@workspace/database/client", () => ({ default: db }));
import {
  accountAccess,
  getBpoAccess,
  requireIt,
  requireOperations,
} from "./access";
const member = (role = "TEAM_LEAD", teamIds = ["team-a"]) => ({
  id: "member",
  bpoAdmin: null,
  organization: { bpo: { suspended: false, timezone: "Asia/Kolkata" } },
  pulseGrants: [
    {
      accountId: "client-a",
      role,
      teams: teamIds.map((teamId) => ({ teamId })),
    },
  ],
});
beforeEach(() => {
  vi.resetAllMocks();
  db.member.findUnique.mockResolvedValue(member());
  db.clientAccount.findFirst.mockResolvedValue({
    id: "client-a",
    organizationId: "bpo-a",
    archived: false,
  });
  db.pulseTeam.count.mockResolvedValue(1);
});
describe("server access guard", () => {
  it("blocks IT operational reads even with legacy mixed grants", async () => {
    db.member.findUnique.mockResolvedValue({
      ...member("COO_EXECUTIVE", []),
      bpoAdmin: { organizationId: "bpo-a" },
    });
    expect((await getBpoAccess("u", "bpo-a")).grants).toEqual([]);
    await expect(accountAccess("u", "bpo-a", "client-a")).rejects.toThrow();
    await expect(requireOperations("u", "bpo-a")).rejects.toThrow();
    await expect(requireIt("u", "bpo-a")).resolves.toHaveProperty(
      "isItAdmin",
      true,
    );
  });
  it("denies a user with no membership and a suspended BPO", async () => {
    db.member.findUnique.mockResolvedValueOnce(null);
    await expect(getBpoAccess("u", "other")).rejects.toThrow();
    db.member.findUnique.mockResolvedValueOnce({
      ...member(),
      organization: { bpo: { suspended: true } },
    });
    await expect(getBpoAccess("u", "bpo-a")).rejects.toThrow();
  });
  it("does not grant operation access to an IT administrator without account grants", async () => {
    db.member.findUnique.mockResolvedValue({
      ...member(),
      bpoAdmin: { organizationId: "bpo-a" },
      pulseGrants: [],
    });
    await expect(requireIt("u", "bpo-a")).resolves.toHaveProperty(
      "isItAdmin",
      true,
    );
    await expect(accountAccess("u", "bpo-a", "client-a")).rejects.toThrow();
  });
  it("rejects other clients and unauthorized team overrides", async () => {
    await expect(accountAccess("u", "bpo-a", "client-b")).rejects.toThrow();
    await expect(
      accountAccess("u", "bpo-a", "client-a", ["team-b"]),
    ).rejects.toThrow();
  });
  it("returns a restricted database predicate and denies financials for Team Leads", async () => {
    const access = await accountAccess("u", "bpo-a", "client-a");
    expect(access.where).toEqual({
      organizationId: "bpo-a",
      accountId: "client-a",
      teamId: { in: ["team-a"] },
    });
    expect(access.financial).toBe(false);
  });
  it("reads current grants on each request so revocation immediately takes effect", async () => {
    await expect(accountAccess("u", "bpo-a", "client-a")).resolves.toBeTruthy();
    db.member.findUnique.mockResolvedValue({ ...member(), pulseGrants: [] });
    await expect(accountAccess("u", "bpo-a", "client-a")).rejects.toThrow();
  });
});
