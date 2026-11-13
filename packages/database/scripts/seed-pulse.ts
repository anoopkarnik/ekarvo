import "dotenv/config";
import db from "../src/client";
import { seedPulseDemo } from "../src/pulseDemoSeed";
const email = process.argv
  .find((a) => a.startsWith("--admin-email="))
  ?.slice("--admin-email=".length);
try {
  const result = await seedPulseDemo(email);
  console.log(
    `Demo BPO: ${result.organizationName} (${result.organizationId})`,
  );
  console.log(
    "New demo logins use password: password. Existing passwords and edited assignments are preserved.",
  );
  console.table(
    result.users.map((u) => ({
      email: u.email,
      role: u.isItAdmin ? "IT Admin" : u.grants[0]!.role,
      clients: u.grants
        .map((g) => result.accounts.find((a) => a.id === g.accountId)!.name)
        .join("; "),
      teams: u.grants
        .flatMap((g) =>
          g.teamIds.map((id) => result.teams.find((t) => t.id === id)!.name),
        )
        .join("; "),
      result: u.result,
    })),
  );
} catch (e) {
  console.error(
    e instanceof Error
      ? e.message
      : "Demo seed failed. The transaction was rolled back.",
  );
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
