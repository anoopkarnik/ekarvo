# Pulse role and seed correction — 2026-11-11

Authority: user-approved plan in conversation. Work directly on main, preserve existing changes. No migration creation/application. Existing real platform-admin credentials and raw operational records must remain unchanged.

Tasks:
- [x] Block IT operational reads and mixed-role assignment, including legacy grants and invitations.
- [x] Add atomic managed login creation for IT and platform provisioning; preserve invitation flows.
- [x] Reuse the existing demo BPO and create sixteen deterministic staff identities with initial demo password `password`; remove only the legacy seed owner's demo membership.
- [x] Make direct creation primary in administration; localize UI and update documentation.
- [x] Run seed twice, real authentication/isolation/browser checks, unit suites, typechecks and production build.

Pre-flight: accountAccess protects scoped actuals/scenarios/exports/AI, but portfolio/donors consume getBpoAccess directly. A shared operational BPO guard must protect those paths too. Managed credentials use Better Auth's credential Account password hash, not User.password. Demo identities are owned by deterministic IDs and matching reserved `.test` emails. New accounts are administratively verified and receive no personal organization or outbound email.

Ruling: retain the existing email/password authentication model and per-client operational grants. IT administration and operational grants become mutually exclusive within the same BPO, as explicitly requested. Main checkout and live demo repair are authorized by the approved plan; preserve unrelated workspaces and source data.

## Results

The live seed was run twice successfully. Both preservation checks compared checksums against the pre-repair database: platform-admin credentials and other memberships, all master data and 69,078 raw records were unchanged. The BPO has sixteen distinct staff members: one IT Admin, one COO, two Managers with three clients each, and twelve Team Leads with one team each. All sixteen credential password hashes validated against `password`.

Eight opt-in live PostgreSQL/authentication/browser tests passed: real password login and scope checks for all sixteen users; direct IT denial with a temporary legacy mixed grant; rejected duplicate/invalid account creation; actual rollback of a new credential after membership failure; browser-created staff login; COO/Manager/TL financial controls; and a temporary trusted session proving the existing platform-admin landing page. Test identities, mixed grants and temporary sessions were cleaned up. Five additional fixture browser tests covering all seven suites and five role types passed.

Web: 631 tests passed, with the pre-existing `tests/doctor.test.ts` suite blocked by missing `scripts/doctor.mjs`. Database: 15 tests passed. Auth: 85 tests passed. Web/database typechecks, seven localization checks, targeted ESLint with zero warnings, Prisma validation, production web build and whitespace checks passed. The build used a source copy with local dependencies so the active dev server's `.next` directory stayed intact. No migration was created or applied.

The independent final review found no blocking issues. Nonblocking existing limitation: invitation-mode provisioning creates the organization before issuing the invitation; failed invitation delivery can require retrying appointment. The new direct-login provisioning path is transactional.
