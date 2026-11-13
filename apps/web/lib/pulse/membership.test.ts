import { beforeEach, describe, expect, it, vi } from "vitest";
const db = vi.hoisted(() => ({
  $transaction: vi.fn(),
  user: { findUniqueOrThrow: vi.fn(), findUnique: vi.fn() },
  organizationInvitation: { findUnique: vi.fn(), update: vi.fn() },
  member: { upsert: vi.fn() },
  bpoAdminGrant: { upsert: vi.fn(), findUnique: vi.fn() },
  session: { update: vi.fn() },
  pulseAuditEvent: { create: vi.fn() },
  clientAccount: { findFirst: vi.fn() },
  pulseTeam: { count: vi.fn() },
  pulseAccountGrant: { deleteMany: vi.fn(), create: vi.fn() },
}));
vi.mock("@workspace/database/client", () => ({ default: db }));
vi.mock("@workspace/auth/better-auth/organization", () => ({
  sendInvitationEmail: vi.fn(),
}));
import { acceptBpoInvitation, validateGrants, writeGrants } from "./membership";
const invitation = () => ({
  id: "invite",
  organizationId: "bpo",
  email: "member@example.test",
  status: "pending",
  expiresAt: new Date(Date.now() + 86400000),
  inviterId: "admin",
  bpoAdminInvite: true,
  pulseGrants: [],
  organization: { bpo: { suspended: false } },
});
beforeEach(() => {
  vi.resetAllMocks();
  db.$transaction.mockImplementation((fn) => fn(db));
  db.user.findUniqueOrThrow.mockResolvedValue({
    id: "u",
    email: "member@example.test",
    emailVerified: true,
  });
  db.user.findUnique.mockResolvedValue({ role: "admin", banned: false });
  db.organizationInvitation.findUnique.mockResolvedValue(invitation());
  db.member.upsert.mockResolvedValue({ id: "member" });
});
describe("BPO invitation acceptance", () => {
  it("rejects operational grants for an IT Admin", async () => {
    db.bpoAdminGrant.findUnique.mockResolvedValue({
      memberId: "member",
      organizationId: "bpo",
    });
    await expect(
      writeGrants(db as never, "member", "bpo", [
        { accountId: "client", role: "COO_EXECUTIVE", teamIds: [] },
      ]),
    ).rejects.toThrow("IT Admin");
    expect(db.pulseAccountGrant.create).not.toHaveBeenCalled();
  });
  it("installs the BPO admin capability inside the membership transaction", async () => {
    await expect(
      acceptBpoInvitation("u", "session", "invite"),
    ).resolves.toEqual({ organizationId: "bpo" });
    expect(db.$transaction).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ isolationLevel: "Serializable" }),
    );
    expect(db.bpoAdminGrant.upsert).toHaveBeenCalled();
    expect(db.pulseAccountGrant.deleteMany).toHaveBeenCalledWith({
      where: { memberId: "member", organizationId: "bpo" },
    });
    expect(db.organizationInvitation.update).toHaveBeenCalledWith({
      where: { id: "invite" },
      data: { status: "accepted" },
    });
  });
  it.each([
    "wrong-email",
    "expired",
    "revoked",
    "unverified",
    "suspended",
    "revoked-inviter",
  ])("rejects %s without creating a membership", async (reason) => {
    const inv = invitation();
    if (reason === "wrong-email") inv.email = "someone@example.test";
    if (reason === "expired") inv.expiresAt = new Date(0);
    if (reason === "revoked") inv.status = "canceled";
    if (reason === "suspended") inv.organization.bpo.suspended = true;
    db.organizationInvitation.findUnique.mockResolvedValue(inv);
    if (reason === "unverified")
      db.user.findUniqueOrThrow.mockResolvedValue({
        id: "u",
        email: inv.email,
        emailVerified: false,
      });
    if (reason === "revoked-inviter")
      db.user.findUnique.mockResolvedValue({ role: "user" });
    await expect(
      acceptBpoInvitation("u", "session", "invite"),
    ).rejects.toThrow();
    expect(db.member.upsert).not.toHaveBeenCalled();
  });
  it("does not mark an invitation accepted if membership creation fails", async () => {
    db.member.upsert.mockRejectedValue(new Error("database unavailable"));
    await expect(
      acceptBpoInvitation("u", "session", "invite"),
    ).rejects.toThrow();
    expect(db.organizationInvitation.update).not.toHaveBeenCalled();
  });
  it("requires team scopes and rejects foreign team IDs", async () => {
    db.clientAccount.findFirst.mockResolvedValue({ id: "client" });
    db.pulseTeam.count.mockResolvedValue(0);
    await expect(
      validateGrants(db as never, "bpo", [
        { accountId: "client", role: "TEAM_LEAD", teamIds: [] },
      ]),
    ).rejects.toThrow();
    await expect(
      validateGrants(db as never, "bpo", [
        { accountId: "client", role: "TEAM_LEAD", teamIds: ["foreign"] },
      ]),
    ).rejects.toThrow();
  });
});
