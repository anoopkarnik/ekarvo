# Pulse operations product

Pulse is available at `/pulse`. BPO IT administration is at `/pulse/admin`; platform admins provision BPO workspaces at `/admin/bpos`. Each BPO uses a Better Auth organization with an explicit BPO profile. Existing personal workspaces do not acquire Pulse privileges.

The sidebar is the sole workspace selector. It shows seven operational suites for operational users and five administration sections for IT Admins. Page content follows the active session workspace; it never falls back to another BPO when a different workspace is selected. Section URLs such as `/pulse?suite=perform` and `/pulse/admin?tab=imports` support reload and browser Back/Forward. Switching between BPOs with different user roles opens the appropriate operational or administration page. Client, process, team and date controls remain in the content area; people management operates across the selected BPO's clients.

## Database setup

The Prisma schema adds `pulse_schema` and relations to existing organizations. This implementation did not generate or apply migrations. Migration folders added independently in the workspace have been preserved.

The owner should run the normal migration workflow against the intended development database, review the generated migration, and deploy it using the project's existing process:

```bash
pnpm migrate
pnpm generate
```

Create the optional demonstration workspace explicitly after migrations:

```bash
pnpm --dir packages/database seed:pulse
# Only when the owner is ambiguous on first setup:
pnpm --dir packages/database seed:pulse --admin-email=YOUR_EXISTING_PLATFORM_ADMIN_EMAIL
```

The command reuses the single existing Pulse demonstration BPO, or creates one on first setup, with six clients, twelve teams, 120 workers, twelve processes and 24 work types. Eight completed weeks plus the current partial week contain individual work items, scheduled shifts, time entries, QA samples, certifications, contracts, revenue and overhead. The seed anchor is fixed on first run. Re-running inserts missing seed IDs without overwriting corrections. Publication is transactional. Sixteen separate staff logins are created with initial password `password`, administratively verified fake emails, and ordinary global `user` roles. Your existing platform-admin login and credentials stay separate. The correction removes only the old seed-created platform-admin membership in this demo BPO. Existing passwords and edited assignments are preserved on repeat runs; identity/email conflicts or ambiguous BPO ownership abort the transaction. Real customers start empty.

### Demo logins

All newly created demo accounts use password **`password`**. Your platform-admin password is unchanged.

| Email | Role and assignment |
|---|---|
| `itadmin@pulse-demo.test` | IT Admin: people, setup and imports; no operations, financials, operational exports or intelligence |
| `coo@pulse-demo.test` | COO: all six clients |
| `manager1@pulse-demo.test` | Operations Manager: Meridian, Aegis and Vanguard |
| `manager2@pulse-demo.test` | Operations Manager: Northstar, Summit and Aurora |
| `teamlead01@pulse-demo.test` – `teamlead12@pulse-demo.test` | One team per user, ordered by reference client and team; no financials |

The seed prints each person's exact client/team assignments. The 120 roster workers remain operational records and do not receive logins automatically.

## Permissions

- Global `admin` remains a platform role. BPO users remain global `user`.
- A BPO IT Admin manages structure, imports, invitations and grants. This capability alone grants no operational dashboard or financial access. IT Admin and operational roles are mutually exclusive within the same BPO. Legacy mixed grants are ignored for operational access. IT cannot assign themselves operational access or appoint other IT/platform admins.
- Operational roles are per client. COO and Operations Manager can see financials. Team Leads require assigned teams and receive no commercial values in dashboards, scenarios, exports or AI context.
- IT Admin can directly create new staff with name, email, initial password, client roles and required Team Lead teams. Passwords use Better Auth credential hashes; managed users can sign in immediately. Existing emails require the invitation flow, which never changes their password. Platform Admin can create an IT login when provisioning a BPO or send an invitation.
- Invitations expire after seven days and acceptance atomically installs membership and grants. Revoked inviter authority invalidates outstanding invitations. Generic organization APIs cannot mutate BPO membership or grant privileges.
- Suspension and grant removal are checked on subsequent server requests. AI responses recheck the scope after generation.

## Source data and imports

Client, site, process, team, worker and work-type tables are normalized. `PulseRecord` is the canonical raw source ledger, discriminated by `PulseRecordKind` and validated by kind-specific Zod schemas. It contains individual operational records, never precomputed dashboard cards. Team and worker dimensions have composite client/tenant foreign keys. Corrections retain earlier payloads in `PulseRecordRevision`.

CSV templates in BPO administration cover master data, shifts, time, work items/events, QA, finance, certification, assignments, contracts, handovers, coaching and automation opportunities. Import master data first: sites/processes → teams/work types → workers → operational records. References accept internal IDs or client-local external IDs. QA/work-event external references use the same source name as the imported work items; internal work-item IDs can be used across sources. Blank optional cells are omitted; booleans are `true` or `false`; timestamps include an offset.

Files are limited to 10 MiB and 50,000 rows. Uploads produce a validation report before publication. Staging rows never feed metrics. Publishing revalidates permissions and references, then atomically writes data, revisions and audit events. Identical records are skipped; changed external IDs become revisions. Saved field mappings do not establish live vendor connections. Financial import errors expose row numbers and validation metadata, not stored financial records.

`pulse.import` uses the existing jobs driver. Without Inngest it runs inline; with Inngest it runs in the worker and follows the existing retry/dead-letter workflow. Retry a validated/queued batch from administration. A committed batch is never reopened by a duplicate request.

## Calculation contract

- Reporting dates use the BPO timezone (default Asia/Kolkata); stored instants are UTC. Period ends are exclusive internally.
- Client, process and team filters use authorized master records. Work-type queues drill down to the selected scope. The actuals CSV export repeats the server permission checks and includes commercial fields only for COO/Manager roles.
- Actual SLA = on-time completions among work due in the selected observed interval, including overdue unfinished work in the denominator. Backlog is reconstructed from arrival and completion timestamps.
- Sampled QA defect rate, employee audit coverage and observed first-pass yield have separate denominators. Missing denominators return no evidence, not a fictional percentage.
- Labor = recorded hours × recorded effective loaded rate × overtime multiplier where applicable. Rework is included in labor and shown as a breakdown, never charged again. Finance records provide revenue and nonlabor overhead; payroll totals are reconciliation evidence.
- The demand forecast uses four prior occurrences of each weekday, with an insufficient-history state. Calendar-day arithmetic preserves weekdays across daylight-saving changes.
- Simulations preserve original actual snapshots and normalize a comparison basis to the action duration. Assumptions include 34 productive hours per redeployed FTE/week, five minutes per additional audit, and the reference model's 0.68-point SLA sensitivity to coverage shortfall. These are scenario estimates, not verified effects. Effective contracts support per-unit, hybrid and FTE rate models; team-only scenarios do not allocate whole-client revenue arbitrarily.
- Redeployment requires explicit receiving teams, a donor outside that scope, current certifications, compatible client fences, donor SLA ≥97%, and spare capacity. Cross-client approvals require Manager/COO access on both clients.
- Default weekly OT authorization caps are 40/140/220 hours for Team Lead/Manager/COO. Approved hours continue to consume the week's authorization budget after resource reservations expire or release. A multi-week action conservatively reserves its requested hours in each touched week. This prevents split-action budget bypasses.
- Approval never edits raw facts. Completed interventions can be verified by Managers/COOs after the observation window closes and sufficient records exist. Observation records do not assert causation.

## Intelligence

The panel uses authorized aggregate evidence and the existing AI configuration, prompt versions and token ledger. It prefers `pulse.intelligence`, falling back to the configured `chat.assistant` model selection. Its fixed grounding instructions cannot execute interventions or access generic MCP servers. If no supported configured model or credits are available, the panel displays evidence without AI prose.

## Verification

```bash
pnpm --dir apps/web typecheck
pnpm --dir packages/database typecheck
pnpm --dir apps/web exec vitest run lib/pulse tests/integration/routePolicy.test.ts trpc/routers/__tests__/apiRegistry.test.ts
pnpm --dir packages/auth test
pnpm --dir packages/database test
pnpm i18n:check
pnpm --dir apps/web exec playwright test --config playwright.pulse.config.ts
pnpm --dir apps/web build
```

The browser suite exercises the actual Next/React pages with generated, browser-intercepted data for COO, Operations Manager, Team Lead, IT Admin and Platform Admin roles. It checks all seven operational suites, administration navigation, process/export scope, financial controls, drawer keyboard dismissal and mobile overflow. It does not create real authentication sessions, customers, invites or raw data.

Server unit tests cover access predicates, mixed IT grants, managed credentials, duplicate identities, seed ownership and password preservation, invitation acceptance and revocation, raw calculations, CSV validation/publication, exports, resource budgets and stale transitions. Their database delegates are mocked. The role-correction verification also uses the configured PostgreSQL database and real authentication; it preserves the existing schema and data. Broader workflow acceptance is separate from these role tests. The pre-existing `tests/doctor.test.ts` requires a missing `scripts/doctor.mjs`; this is unrelated to Pulse.

After applying migrations in a test environment, verify real invitation delivery/acceptance, rerun the seed twice and reconcile counts, publish/correct a CSV batch, and submit simultaneous approvals against the same donor/weekly budget. Repeat unauthorized client/team/export/intelligence requests with separate real sessions. These checks need PostgreSQL and configured services and remain the deployment acceptance gate.

The opt-in live role suite runs against an already seeded local development server:

```bash
PULSE_LIVE_TESTS=1 pnpm --dir apps/web exec playwright test --config playwright.pulse-live.config.ts
```

It authenticates the sixteen staff accounts, checks direct endpoint isolation, exercises IT-created staff login and operational landing pages, and uses a short-lived trusted test session for the existing platform admin without reading/changing their password. Temporary test staff, mixed grants and test sessions are cleaned up.
