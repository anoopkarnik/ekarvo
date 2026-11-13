import { expect, it, vi } from "vitest";
import { verifyPassword } from "better-auth/crypto";
import { createManagedCredentials } from "./managedCredentials";
it("creates a verified ordinary login with a Better Auth credential hash and no legacy User password", async () => {
  const tx = {
    user: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi
        .fn()
        .mockImplementation(({ data }) => ({
          id: data.id || "new-user",
          ...data,
        })),
    },
    account: { create: vi.fn() },
  };
  await createManagedCredentials(tx as never, {
    name: "Staff",
    email: " Staff@example.test ",
    password: "password",
  });
  const data = tx.user.create.mock.calls[0]![0].data;
  expect(data).toMatchObject({
    email: "staff@example.test",
    role: "user",
    emailVerified: true,
  });
  expect(data).not.toHaveProperty("password");
  const credential = tx.account.create.mock.calls[0]![0].data;
  expect(credential).toMatchObject({
    userId: "new-user",
    accountId: "new-user",
    providerId: "credential",
  });
  expect(
    await verifyPassword({ hash: credential.password, password: "password" }),
  ).toBe(true);
  expect(credential.password).not.toBe("password");
});
it("never adopts or changes an existing identity with a matching email", async () => {
  const tx = {
    user: {
      findFirst: vi.fn().mockResolvedValue({ id: "existing" }),
      create: vi.fn(),
      update: vi.fn(),
    },
    account: { create: vi.fn() },
  };
  await expect(
    createManagedCredentials(tx as never, {
      name: "Other",
      email: "existing@example.test",
      password: "password",
    }),
  ).rejects.toThrow("already exists");
  expect(tx.user.create).not.toHaveBeenCalled();
  expect(tx.user.update).not.toHaveBeenCalled();
  expect(tx.account.create).not.toHaveBeenCalled();
});
