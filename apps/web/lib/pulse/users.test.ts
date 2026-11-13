import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({
  it: vi.fn(),
  admin: vi.fn(),
  validate: vi.fn(),
  grants: vi.fn(),
  audit: vi.fn(),
  db: {
    user: { findFirst: vi.fn(), create: vi.fn() },
    account: { create: vi.fn() },
    member: { create: vi.fn() },
    bpoAdminGrant: { create: vi.fn() },
    organization: { findFirst: vi.fn(), create: vi.fn() },
  },
}));
vi.mock("@workspace/database/client", () => ({ default: m.db }));
vi.mock("./access", () => ({
  requireIt: m.it,
  assertPlatformAdmin: m.admin,
  audit: m.audit,
  serial: (fn: (tx: unknown) => unknown) => fn(m.db),
}));
vi.mock("./membership", () => ({
  validateGrants: m.validate,
  writeGrants: m.grants,
}));
import { createStaffUser, createItUser, provisionWithItLogin } from "./users";
const input = {
  organizationId: "bpo",
  name: "Staff",
  email: "staff@example.test",
  password: "password",
  grants: [{ accountId: "client", role: "OPS_MANAGER" as const, teamIds: [] }],
};
beforeEach(() => {
  vi.resetAllMocks();
  m.db.user.findFirst.mockResolvedValue(null);
  m.db.user.create.mockResolvedValue({
    id: "new",
    name: "Staff",
    email: input.email,
  });
  m.db.member.create.mockResolvedValue({ id: "member" });
  m.db.organization.findFirst.mockResolvedValue({ id: "bpo" });
  m.db.organization.create.mockResolvedValue({ id: "new-bpo" });
});
it("creates staff membership and roles without returning or auditing the password", async () => {
  const result = await createStaffUser("it", input);
  expect(result).toEqual({ id: "new", email: input.email, name: "Staff" });
  expect(m.it).toHaveBeenCalledWith("it", "bpo", m.db);
  expect(m.grants).toHaveBeenCalledWith(m.db, "member", "bpo", input.grants);
  expect(JSON.stringify(m.audit.mock.calls)).not.toContain("password");
});
it("validates tenant/team grants before creating any identity", async () => {
  m.validate.mockRejectedValue(new Error("Invalid team"));
  await expect(createStaffUser("it", input)).rejects.toThrow("Invalid team");
  expect(m.db.user.create).not.toHaveBeenCalled();
});
it("denies an operational user attempting staff creation", async () => {
  m.it.mockRejectedValue(new Error("IT Admin required"));
  await expect(createStaffUser("lead", input)).rejects.toThrow();
  expect(m.db.user.create).not.toHaveBeenCalled();
});
it("rejects duplicate identities and weak initial passwords", async () => {
  m.db.user.findFirst.mockResolvedValue({ id: "existing" });
  await expect(createStaffUser("it", input)).rejects.toThrow("already exists");
  await expect(
    createStaffUser("it", { ...input, password: "short" }),
  ).rejects.toThrow();
  expect(m.db.account.create).not.toHaveBeenCalled();
});
it("requires platform authority to create an IT Admin", async () => {
  m.admin.mockRejectedValue(new Error("Platform Admin required"));
  await expect(createItUser("it", input)).rejects.toThrow();
  expect(m.db.user.create).not.toHaveBeenCalled();
});
it("provisions a BPO and its IT login together without assigning operational roles", async () => {
  expect(
    await provisionWithItLogin("admin", {
      ...input,
      bpoName: "BPO",
      timezone: "Asia/Kolkata",
    }),
  ).toEqual({ id: "new-bpo" });
  expect(m.db.member.create).toHaveBeenCalledWith({
    data: { organizationId: "new-bpo", userId: "new", role: "member" },
  });
  expect(m.db.bpoAdminGrant.create).toHaveBeenCalled();
  expect(m.grants).not.toHaveBeenCalled();
});
