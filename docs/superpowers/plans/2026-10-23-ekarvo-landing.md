# EKARVO landing and CMS removal

Use /home/anoop/Downloads/untitled as the visual and interaction source. Port its full React experience to the existing Next.js landing route; retain the app's authenticated routes. Scope typography and styles to the landing page. Preserve keyboard access, responsive navigation, reduced motion, and the WebGL fallback.

Remove the CMS editors, section forms, upload endpoint, provider selection, content mutations, AI content drafting, schema models and seed data. Keep existing public documentation and legal pages as repository-owned content. Remove the CMS's navigation, environment and wizard settings. Do not create or execute a database migration.

Execute inline:
1. Verify the public content routers remain read-only after removal and still serve known pages, rejecting unknown slugs.
2. Port source components and scene utilities, add Three.js dependencies, isolate typography, improve mobile navigation and dialog keyboard behavior.
3. Remove CMS implementation and schema; simplify public content to local files; update seed, navigation, API catalogue, config, and documentation.
4. Generate Prisma, validate schema, run web/shared typechecks, tests, lint and production build. Inspect the page in a browser at desktop and phone sizes.

Review focus: server rendering and hydration, missing WebGL, mobile overflow, dialog focus, stale CMS APIs and model references. A source-only backup is at /tmp/ekarvo-before-landing-cms-removal.tar.gz.

Verified: schema generation/validation; web, shared UI, and database typechecks; web/shared UI lint; 69 shared UI tests; 7 i18n catalogue tests. Web: 321 tests pass, but the doctor suite cannot import the pre-existing missing scripts/doctor.mjs. Browser checks cover desktop/375px, mobile navigation, keyboard focus/escape, invalid inquiry fields, a blocked request preserving inputs without false success, WebGL fallback, docs, and legal routes. No inquiry was delivered during testing. Review restored documentation/legal footer links.

Final workspace build: `pnpm build` passed (web and backend). Database migration remains intentionally uncreated.
