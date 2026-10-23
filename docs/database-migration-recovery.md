# CMS migration recovery — 2026-10-23

The previous `prisma migrate reset` reset the configured user, billing, AI and jobs schemas but left the excluded `cms_schema` behind. Replay failed because `cms_schema.LandingPage` already existed.

Before recovery, users, accounts, sessions, verification records, JWKS and transactions all had zero rows. A complete custom-format PostgreSQL 18 dump was saved outside the repository at `/home/anoop/Downloads/ekarvo-db-backup-20261023/before-migration-recovery.dump`. It captures the state after that reset, not the earlier data.

Recovery verified that the existing CMS schema matched the historical definitions, resolved the CMS and documentation creation migrations as already applied, and deployed the remaining migrations. Prisma generated `20261023112246_remove_cms` from the old/current datamodels; it drops only seven CMS foreign keys and eight CMS tables. The now-empty CMS schema was removed separately with `DROP SCHEMA ... RESTRICT`, which refuses to remove unexpected contained objects. Historical migration files were left unchanged.

Verification: all 31 migrations are applied; live-to-Prisma diff is empty; the 32 current application tables exist; every original non-CMS application table remains with unchanged row count. The backup directory contains the before/after verification report. No seed or additional reset was run.

Apply existing migrations without resetting data:

```bash
pnpm --dir packages/database migrate:deploy
pnpm generate
```

Use `pnpm migrate` to generate migrations during development after reviewing schema changes. Do not accept a reset prompt on a database whose records must be retained. This recovery cannot restore records already removed by the earlier reset; that requires a backup or provider restore point from before the reset.
