import { hashPassword } from "better-auth/crypto";
import type { Prisma } from "./generated/prisma/client";

/** Caller owns the transaction and authorization. Never updates an existing login. */
export async function createManagedCredentials(
  tx: Prisma.TransactionClient,
  input: {
    id?: string;
    name: string;
    email: string;
    password: string;
  },
) {
  const email = input.email.trim().toLowerCase();
  if (
    await tx.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true },
    })
  )
    throw new Error(
      "An account with this email already exists. Use an invitation for an existing user.",
    );
  const password = await hashPassword(input.password);
  const user = await tx.user.create({
    data: {
      ...(input.id ? { id: input.id } : {}),
      name: input.name.trim(),
      email,
      emailVerified: true,
      role: "user",
    },
    select: { id: true, name: true, email: true },
  });
  await tx.account.create({
    data: {
      userId: user.id,
      accountId: user.id,
      providerId: "credential",
      password,
    },
  });
  return user;
}
