import { beforeEach, expect, it, vi } from "vitest";
const tx = vi.hoisted(() => ({
  $transaction: vi.fn(),
  organization: { findMany: vi.fn(), create: vi.fn() },
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  account: { create: vi.fn() },
  member: { findUnique: vi.fn(), create: vi.fn() },
  bpoAdminGrant: { create: vi.fn() },
  pulseAccountGrant: { create: vi.fn() },
}));
vi.mock("./client", () => ({ default: tx }));
import { reconcileDemoUser, seedPulseDemo } from "./pulseDemoSeed";
const fixture = {
  id: "bpo:demo-user:coo",
  key: "coo",
  name: "Demo COO",
  email: "coo@pulse-demo.test",
  isItAdmin: false,
  grants: [
    { accountId: "client", role: "COO_EXECUTIVE" as const, teamIds: [] },
  ],
};
beforeEach(() => {
  vi.resetAllMocks();
  tx.$transaction.mockImplementation((fn) => fn(tx));
});
it("preserves a changed password and reports edited assignments on repeat seed", async () => {
  tx.user.findUnique.mockResolvedValue({
    ...fixture,
    role: "user",
    accounts: [{ password: "changed-hash" }],
  });
  tx.member.findUnique.mockResolvedValue({
    id: "member",
    bpoAdmin: null,
    pulseGrants: [],
  });
  expect(await reconcileDemoUser(tx as never, "bpo", fixture)).toContain(
    "differ; preserved",
  );
  expect(tx.account.create).not.toHaveBeenCalled();
  expect(tx.user.update).not.toHaveBeenCalled();
  expect(tx.pulseAccountGrant.create).not.toHaveBeenCalled();
});
it("rejects deterministic ID/email ownership mismatches without changes", async () => {
  tx.user.findUnique.mockResolvedValue({
    ...fixture,
    email: "different@example.test",
    role: "user",
  });
  await expect(reconcileDemoUser(tx as never, "bpo", fixture)).rejects.toThrow(
    "ownership mismatch",
  );
  expect(tx.member.create).not.toHaveBeenCalled();
});
it("refuses to adopt a matching email belonging to another ID", async () => {
  tx.user.findUnique.mockResolvedValue(null);
  tx.user.findFirst.mockResolvedValue({ id: "not-seed-owned" });
  await expect(reconcileDemoUser(tx as never, "bpo", fixture)).rejects.toThrow(
    "already exists",
  );
  expect(tx.member.create).not.toHaveBeenCalled();
});
it("refuses ambiguous seeded BPOs before creating another organization", async () => {
  tx.organization.findMany.mockResolvedValue([{ id: "one" }, { id: "two" }]);
  await expect(seedPulseDemo()).rejects.toThrow("Multiple seeded BPOs");
  expect(tx.organization.create).not.toHaveBeenCalled();
});
