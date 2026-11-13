# Pulse implementation ledger

Authority: user-approved Pulse authenticated BPO operations product plan, 2026-11-08.

Work in the requested checkout on main; preserve unrelated browser logs. No migrations, schema pushes, live customer seeds, or outbound invitations during implementation.

Tasks:
1. Tenant schema, access policy, provisioning and invitations.
2. Deterministic raw data seed and authoritative calculations.
3. Validated imports and persistent decision workflow.
4. Seven suites, administration and login routing.
5. Grounded intelligence, localization and verification.

Pre-flight: all services consume the same tenant/account/team scope. Operational workers are not auth users. Financial DTOs must be omitted for Team Leads and IT-only users. Approval snapshots never modify actuals. Imports publish atomically and revision history retains previous payloads.
Ruling: reuse the current checkout on main as explicitly requested to keep changes in the user's requested workspace and existing dependencies; no unrelated files will be committed.

User instruction: all implementation stays on main; switched back with all uncommitted work preserved.

## Delivered in this checkout

- Pulse tenant schema, explicit IT grants, per-client/team operational grants, provisioning, invitation acceptance and generic-organization bypass guards.
- Deterministic isolated raw-record seed, reporting calculations, weekday forecasts, contract-aware scenario calculations and versioned action workflows.
- Staged CSV validation, atomic publication, audited revisions, mappings, scoped actuals exports and retry-safe jobs.
- All seven suite surfaces, process/team/work-type drilldowns, IT administration, platform administration and Pulse login routing.
- Authorized intelligence context, evidence fallback, usage tracking, notifications and English/Spanish messages.

## Verification — 2026-11-09

- Prisma validation and generation passed. Web/database typechecks passed.
- Web: 623 tests passed across 73 suites; one pre-existing suite cannot load because `scripts/doctor.mjs` is absent.
- Auth: 85 tests passed. Database: 7 tests passed, including repeatable seed reconciliation. Localization: 7 checks passed.
- Targeted Pulse ESLint and `git diff --check` passed.
- Browser: five tests passed for COO, Operations Manager, Team Lead, IT Admin and Platform Admin. Operational tests cover all seven suites, process/export scope, financial controls, keyboard dismissal and mobile overflow. Browser data/session responses are intercepted fixtures, not live database sessions.
- Production web build passed in a source copy with a local offline dependency installation, preserving the active development server's build directory. All Pulse pages and APIs are present in the route output.
- Review fixes include cumulative weekly overtime budgets after reservation release, donor/recipient scope separation, normalized scenario periods, conditional import enqueueing, pending IT invite cancellation, transactional seed publication and removal of hidden work-type IDs from Team Lead metrics.

## Owner-run acceptance gate

No migrations, seeds or outbound invitations were executed against the application database. Existing externally-created migration folders were preserved. The owner must run `pnpm migrate` against the intended database before the explicit Pulse seed and live database acceptance. Live concurrent reservations, real invitation delivery, transactional import publication and cross-session isolation remain unverified against PostgreSQL. The server tests use mocked database delegates; they are not a substitute for this gate.

Setup and calculation contracts: [README.md](./README.md).

## Follow-up — 2026-11-11

The user-approved role correction has now been implemented and seeded in the configured database. Your platform-admin identity is separate from sixteen demo staff logins. IT Admin cannot hold or use operational roles in the same BPO, and can directly provision staff email/password logins. The seed was run twice with checksum verification of preserved credentials, other memberships, master data and all 69,078 raw records. Real sessions and PostgreSQL role/rollback checks passed. See [role-correction.md](./role-correction.md) for the current results and [README.md](./README.md) for demo credentials. The earlier owner-run gate above records the state before this follow-up; broader intervention/import workflow acceptance remains separate from these role checks.
