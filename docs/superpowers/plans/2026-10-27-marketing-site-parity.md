# EKARVO Marketing Site Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reproduce the complete customer-facing `Website` route and interaction flow inside the Next.js app under `/landing`, while preserving the SaaS Login/legal integration and leaving `Website` byte-for-byte unchanged.

**Architecture:** Build a server-rendered marketing route tree with a shared EKARVO shell, page-specific server components, and narrowly scoped client islands for navigation, carousels, demos, forms, and Three.js scenes. Adapt the reference site's deterministic state models and behavior into repository-native TypeScript modules, and validate the two running sites with matched Playwright journeys and screenshot comparisons.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind 4 plus namespaced CSS, Lucide React, Three.js, Framer Motion, Zod, Vitest/Testing Library, Playwright, axe-core.

**Spec:** `docs/superpowers/specs/2026-10-27-marketing-site-parity-design.md`

## Global Constraints

- Never modify `/Users/arahaelion/EKARVO/Website`; record and recheck a complete SHA-256 tree manifest.
- Keep every new page under the existing public `/landing` route prefix; do not expose parallel root-level marketing routes.
- Preserve `/sign-in`, current SaaS legal content, and the existing `/landing/legal/contact-us` informational page.
- Add the reference workflow form as `/landing/contact`; keep its persistence local and do not add CRM, email, calendar, or external data integrations.
- Copy referenced media/download assets byte-for-byte; adapt Astro/React source code into idiomatic Next.js components.
- Namespace marketing CSS beneath `.ek-site`; authenticated application styling must not change.
- Preserve visible focus, keyboard operation, minimum 44 px targets, responsive reflow, reduced motion, and graphics fallbacks.
- Do not create or edit Prisma migrations.
- Do not hand off until source/implementation screenshots have been compared at matching viewports and `design-qa.md` says exactly `final result: passed`.

## Review Focus

- Rapid carousel, demo, and chapter inputs must cancel or replace the prior transition without leaving stale selected/disabled states; Tasks 5, 7, and 11 add rapid-input tests.
- Query strings and deep links (`?product=...`, section hashes, receipt-management hashes) must land on the intended selected/focused content; Tasks 4, 6, 9, and 11 add direct-entry tests.
- Local request persistence must remain idempotent under duplicate submissions while rejecting conflicting bodies and invalid delete tokens; Task 9 tests these races and error shapes.
- Reduced motion, no WebGL, and JavaScript-disabled/static-first rendering must preserve the complete narrative and usable primary links; Tasks 3, 4, and 11 cover these fallbacks.
- Shared marketing navigation must remain correct on `/landing`, nested marketing pages, legal pages, and auth pages without showing a redundant Login link on `/sign-in`; Tasks 2 and 11 exercise every context.

---

## File Structure

### Shared shell and styles

- Modify `apps/web/components/landing/ekarvo/SiteChrome.tsx` — shared route-aware header/footer.
- Create `apps/web/components/landing/ekarvo/marketing/navigation.ts` — canonical labels and `/landing` destinations.
- Create `apps/web/components/landing/ekarvo/marketing/MarketingShell.tsx` — paper-surface page wrapper.
- Create `apps/web/components/landing/ekarvo/marketing/primitives.tsx` — PageHero, CTA, icon/link, and static section primitives.
- Modify `apps/web/app/landing/ekarvo.css` — shell and legal styles only.
- Create `apps/web/app/landing/marketing.css` — source-derived editorial/product styles.
- Create `apps/web/app/landing/marketing-interactions.css` — carousel, demos, form, and state styling.

### Visuals and shared content

- Create `apps/web/components/landing/ekarvo/marketing/SpatialScene.tsx` — responsive source artwork with progressive Three.js enhancement.
- Create `apps/web/components/landing/ekarvo/marketing/ProductMap.tsx` — product/platform relationship map.
- Create `apps/web/components/landing/ekarvo/marketing/StoryPlate.tsx` — source story panel.
- Create `apps/web/components/landing/ekarvo/marketing/data.ts` — product, capability, and editorial data shared by pages.
- Add only referenced source files beneath `apps/web/public/images/{cinematic,company,flow,signal}` and `apps/web/public/downloads`.

### Route pages

- Create `apps/web/app/landing/products/page.tsx`.
- Create `apps/web/app/landing/products/operations-os/page.tsx`.
- Create `apps/web/app/landing/products/autonomous-execution/page.tsx`.
- Create `apps/web/app/landing/approach/page.tsx`.
- Create `apps/web/app/landing/platform/page.tsx`.
- Create `apps/web/app/landing/trust/page.tsx`.
- Create `apps/web/app/landing/company/page.tsx`.
- Create `apps/web/app/landing/contact/page.tsx`.
- Create `apps/web/app/landing/demo/page.tsx`.

### Interactive models and islands

- Create `apps/web/components/landing/ekarvo/marketing/ProductCarousel.tsx`.
- Create `apps/web/components/landing/ekarvo/marketing/Disclosure.tsx`.
- Create `apps/web/components/landing/ekarvo/marketing/CapabilityAtlas.tsx`.
- Create `apps/web/components/landing/ekarvo/marketing/DecisionProof.tsx`.
- Create `apps/web/components/landing/ekarvo/marketing/OperationsDemo.tsx`.
- Create `apps/web/components/landing/ekarvo/marketing/ExecutionDemo.tsx`.
- Create `apps/web/components/landing/ekarvo/marketing/models/decisionProof.ts`.
- Create `apps/web/components/landing/ekarvo/marketing/models/journey.ts`.

### Local request flow

- Create `apps/web/lib/marketing/request-schema.ts` — shared Zod schemas and field limits.
- Create `apps/web/lib/marketing/request-store.ts` — atomic local persistence, expiry, and timing-safe deletion.
- Create `apps/web/lib/marketing/local-rate-limit.ts` — bounded in-memory local-form limiter.
- Create `apps/web/app/api/contact/route.ts`.
- Create `apps/web/app/api/delete-request/route.ts`.
- Create `apps/web/components/landing/ekarvo/marketing/ContactWorkflowForm.tsx`.
- Create `apps/web/components/landing/ekarvo/marketing/DeleteRequestForm.tsx`.
- Modify `apps/web/blocks/landing/PrivacyPolicy.tsx` — append saved-request deletion management.
- Modify `apps/web/lib/route-policy.ts` — register both public API routes and limits.

### Tests and QA

- Add focused `*.test.ts(x)` files beside shared shell, models, request modules, and interactive components.
- Create `apps/web/playwright.config.ts`.
- Create `apps/web/e2e/marketing-parity.spec.ts` — route/link/responsive/accessibility journeys.
- Create `apps/web/e2e/marketing-interactions.spec.ts` — carousel/demo/form/keyboard/reduced-motion journeys.
- Modify `apps/web/package.json` and `pnpm-lock.yaml` only if direct Playwright/axe dev dependencies or scripts are missing.
- Create `qa/marketing-parity/source-tree.sha256` and current-run screenshot folders during verification.
- Create project-root `design-qa.md` only from current-run source and implementation captures.

---

### Task 1: Lock the Read-Only Source Baseline and Test Harness

**Files:**
- Create: `qa/marketing-parity/source-tree.sha256`
- Create: `apps/web/playwright.config.ts`
- Create: `apps/web/e2e/marketing-parity.spec.ts`
- Modify: `apps/web/package.json`
- Modify: `pnpm-lock.yaml` only if dependency declarations change

**Interfaces:**
- Consumes: read-only source at `/Users/arahaelion/EKARVO/Website`.
- Produces: `MARKETING_ROUTES: readonly string[]` inside the E2E spec and a reproducible source-tree manifest used again in Task 12.

- [ ] **Step 1: Record the source tree manifest**

Hash every regular file under `Website`, excluding transient `node_modules`, `.astro`, `dist`, `test-results`, `.playwright-cli`, and `qa` outputs; sort by relative path and save the result in `qa/marketing-parity/source-tree.sha256`.

Run: `shasum -a 256 qa/marketing-parity/source-tree.sha256`
Expected: one stable checksum for the manifest itself.

- [ ] **Step 2: Add the failing route inventory E2E test**

Create `MARKETING_ROUTES` with `/landing`, `/landing/products`, both product routes, `/landing/approach`, `/landing/platform`, `/landing/trust`, `/landing/company`, `/landing/contact`, and `/landing/demo`. Assert each route returns a document with a nonempty title, exactly one `h1`, shared header/footer, and no failed same-origin asset request.

- [ ] **Step 3: Run the route inventory and verify it fails on missing pages**

Run: `pnpm --dir apps/web exec playwright test e2e/marketing-parity.spec.ts --grep "all marketing routes"`
Expected: FAIL because the new routes return redirects/404s or lack the shared shell.

- [ ] **Step 4: Add the direct Playwright configuration and scripts**

Configure base URL `http://127.0.0.1:3010`, single-worker deterministic runs, current Chromium, screenshot-on-failure, and `webServer` using the web dev command. Add `test:e2e` and `test:e2e:ui` scripts. Declare `@playwright/test` and `@axe-core/playwright` directly only if they are not already resolvable from the workspace.

- [ ] **Step 5: Commit the baseline and harness**

```bash
git add qa/marketing-parity/source-tree.sha256 apps/web/playwright.config.ts apps/web/e2e/marketing-parity.spec.ts apps/web/package.json pnpm-lock.yaml
git commit -m "test: establish marketing parity harness"
```

### Task 2: Shared Marketing Navigation and Shell

**Files:**
- Create: `apps/web/components/landing/ekarvo/marketing/navigation.ts`
- Create: `apps/web/components/landing/ekarvo/marketing/MarketingShell.tsx`
- Create: `apps/web/components/landing/ekarvo/marketing/primitives.tsx`
- Create: `apps/web/components/landing/ekarvo/SiteChrome.test.tsx`
- Modify: `apps/web/components/landing/ekarvo/SiteChrome.tsx`
- Modify: `apps/web/app/landing/ekarvo.css`
- Create: `apps/web/app/landing/marketing.css`
- Modify: `apps/web/app/landing/layout.tsx`

**Interfaces:**
- Produces: `MARKETING_NAV`, `marketingHref(path: string): string`, `MarketingShell({ children, active?, cinematic? })`, `SiteHeader({ active?, cinematic? })`, `SiteFooter()`, `PageHero`, `MarketingCTA`, and `ProductLink`.
- Consumes: Next `Link`, `usePathname`, existing `/sign-in`, and existing legal route destinations.

- [ ] **Step 1: Write failing shell tests**

Assert desktop/mobile navigation labels are exactly Products, Approach, Platform, Trust, Company; their hrefs are `/landing/...`; `Discuss a workflow` targets `/landing/contact`; Login targets `/sign-in`; current routes expose `aria-current="page"`; Escape closes the mobile menu and restores summary focus; `/sign-in` omits Login but keeps marketing navigation.

- [ ] **Step 2: Run shell tests to verify the current chapter navigation fails**

Run: `pnpm --dir apps/web exec vitest run components/landing/ekarvo/SiteChrome.test.tsx`
Expected: FAIL because current labels are Pulse, Drive, Trust, Proof and no active-route API exists.

- [ ] **Step 3: Implement canonical navigation and the shared shell**

Keep `SiteHeader` client-side only for route/menu state. Keep `MarketingShell` server-compatible except for consuming `SiteHeader`. Import `marketing.css` once from the landing layout. Preserve the current Login rule and the cinematic theme hook.

- [ ] **Step 4: Extend source-derived shell/editorial tokens**

Port the source header/footer/container/type/button/focus/responsive values beneath `.ek-site`. Keep `.ek-site` isolation and avoid raw styling changes to the authenticated app.

- [ ] **Step 5: Run shell tests and existing legal/auth component tests**

Run: `pnpm --dir apps/web exec vitest run components/landing/ekarvo/SiteChrome.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit the shared shell**

```bash
git add apps/web/components/landing/ekarvo/marketing apps/web/components/landing/ekarvo/SiteChrome.tsx apps/web/components/landing/ekarvo/SiteChrome.test.tsx apps/web/app/landing/ekarvo.css apps/web/app/landing/marketing.css apps/web/app/landing/layout.tsx
git commit -m "feat: add complete EKARVO marketing shell"
```

### Task 3: Source Assets and Progressive Visual Scenes

**Files:**
- Create: `apps/web/components/landing/ekarvo/marketing/SpatialScene.tsx`
- Create: `apps/web/components/landing/ekarvo/marketing/SpatialScene.test.tsx`
- Create: `apps/web/components/landing/ekarvo/marketing/ProductMap.tsx`
- Create: `apps/web/components/landing/ekarvo/marketing/StoryPlate.tsx`
- Create: `apps/web/components/landing/ekarvo/marketing/data.ts`
- Add: referenced files beneath `apps/web/public/images/**` and `apps/web/public/downloads/**`
- Modify: `apps/web/app/landing/marketing.css`

**Interfaces:**
- Produces: `SpatialScene({ mode, surface?, eager?, label })` with modes `operations | execution | evidence | platform | trust`; `ProductMap()`; `StoryPlate({ eyebrow, title, body, stages })`.
- Consumes: byte-identical responsive source assets and Three.js only after client initialization.

- [ ] **Step 1: Write failing asset/scene tests**

Assert every declared scene mode renders a `<picture>` fallback with valid desktop/mobile paths, a descriptive accessible label on the figure, fixed intrinsic dimensions, and no canvas requirement for content. Assert the asset manifest contains every referenced file and byte hashes match the source.

- [ ] **Step 2: Run tests and verify missing assets/components fail**

Run: `pnpm --dir apps/web exec vitest run components/landing/ekarvo/marketing/SpatialScene.test.tsx`
Expected: FAIL because components/assets do not exist.

- [ ] **Step 3: Copy referenced assets byte-for-byte**

Copy company, flow, signal, study, and download files named by the mapped pages. Do not copy reference QA artifacts, generated caches, or unused creative-study files.

- [ ] **Step 4: Implement static-first scenes and shared visual primitives**

Render fallback media server-side. Dynamically initialize enhanced visuals only when supported and visible; on import/context failure leave the fallback visible. Reserve source aspect ratios to prevent layout shift.

- [ ] **Step 5: Add reduced-motion and graphics-failure assertions**

Assert reduced motion never hides the fallback and a mocked WebGL failure leaves content/links visible without an uncaught error.

- [ ] **Step 6: Run tests and commit**

Run: `pnpm --dir apps/web exec vitest run components/landing/ekarvo/marketing/SpatialScene.test.tsx`
Expected: PASS.

```bash
git add apps/web/components/landing/ekarvo/marketing apps/web/public/images apps/web/public/downloads apps/web/app/landing/marketing.css
git commit -m "feat: add marketing visuals and source assets"
```

### Task 4: Editorial Routes — Approach, Platform, Trust, and Company

**Files:**
- Create: `apps/web/app/landing/approach/page.tsx`
- Create: `apps/web/app/landing/platform/page.tsx`
- Create: `apps/web/app/landing/trust/page.tsx`
- Create: `apps/web/app/landing/company/page.tsx`
- Create: `apps/web/components/landing/ekarvo/marketing/Disclosure.tsx`
- Create: `apps/web/components/landing/ekarvo/marketing/Disclosure.test.tsx`
- Modify: `apps/web/app/landing/marketing.css`

**Interfaces:**
- Consumes: `MarketingShell`, `SpatialScene`, `StoryPlate`, `MarketingCTA`, and `marketingHref` from Tasks 2–3.
- Produces: four public, metadata-complete routes and `Disclosure({ question, children })`.

- [ ] **Step 1: Add failing route-content and disclosure tests**

Assert each page has the source title/eyebrow, unique scene mode, internal CTA destinations, and active navigation. Assert disclosure toggles `aria-expanded`, supports Enter/Space, retains readable content with JavaScript disabled, and handles direct `#` anchors without header obstruction.

- [ ] **Step 2: Run focused tests to verify failure**

Run: `pnpm --dir apps/web exec vitest run components/landing/ekarvo/marketing/Disclosure.test.tsx`
Expected: FAIL because the component is missing.

- [ ] **Step 3: Implement the four server-rendered pages**

Translate the source page hierarchy and copy exactly, remapping all paths through `/landing`. Use `createSeoMetadata` with matching descriptions and canonical `/landing/...` paths.

- [ ] **Step 4: Implement disclosure and responsive page styling**

Use native `<details>` unless source behavior requires controlled state. Ensure focus, open-state visuals, 44 px summary targets, and reduced-motion-safe transitions.

- [ ] **Step 5: Run component, type, and route inventory checks**

Run: `pnpm --dir apps/web exec vitest run components/landing/ekarvo/marketing/Disclosure.test.tsx && pnpm --dir apps/web typecheck`
Expected: PASS; E2E route inventory now fails only on routes in later tasks.

- [ ] **Step 6: Commit editorial routes**

```bash
git add apps/web/app/landing/{approach,platform,trust,company} apps/web/components/landing/ekarvo/marketing/Disclosure* apps/web/app/landing/marketing.css
git commit -m "feat: add EKARVO editorial marketing routes"
```

### Task 5: Products Overview and Accessible Carousel

**Files:**
- Create: `apps/web/app/landing/products/page.tsx`
- Create: `apps/web/components/landing/ekarvo/marketing/ProductCarousel.tsx`
- Create: `apps/web/components/landing/ekarvo/marketing/ProductCarousel.test.tsx`
- Modify: `apps/web/components/landing/ekarvo/marketing/data.ts`
- Modify: `apps/web/app/landing/marketing.css`
- Modify: `apps/web/app/landing/marketing-interactions.css`

**Interfaces:**
- Produces: `ProductCarousel({ products })`, where each product contains `name`, `role`, `mode`, `title`, `body`, `href`, `action`, and `label`.
- Consumes: `SpatialScene`, `ProductMap`, shell primitives, and `/landing/products/...` links.

- [ ] **Step 1: Write failing carousel behavior tests**

Assert initial Pulse selection, Next/Previous disabled boundaries, tab selection, ArrowLeft/ArrowRight keyboard selection, inactive-slide `inert`, live status `"Ekarvo Pulse, 1 of 2"`, and rapid opposite inputs ending on the last requested slide without stale button state.

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm --dir apps/web exec vitest run components/landing/ekarvo/marketing/ProductCarousel.test.tsx`
Expected: FAIL because the carousel does not exist.

- [ ] **Step 3: Implement the carousel client island**

Use state as the authority and translate it to scroll position; cancel/replace pending smooth scrolling on a new command. Respect reduced motion and keep only the selected slide's product link focusable.

- [ ] **Step 4: Implement the Products server page and styles**

Match the source masthead, carousel, connected capability map, principles grid, CTA, metadata, and responsive layout.

- [ ] **Step 5: Run tests and commit**

Run: `pnpm --dir apps/web exec vitest run components/landing/ekarvo/marketing/ProductCarousel.test.tsx && pnpm --dir apps/web typecheck`
Expected: PASS.

```bash
git add apps/web/app/landing/products/page.tsx apps/web/components/landing/ekarvo/marketing/ProductCarousel* apps/web/components/landing/ekarvo/marketing/data.ts apps/web/app/landing/marketing*.css
git commit -m "feat: add products overview and carousel"
```

### Task 6: Ekarvo Pulse Detail and Decision Flow

**Files:**
- Create: `apps/web/app/landing/products/operations-os/page.tsx`
- Create: `apps/web/components/landing/ekarvo/marketing/CapabilityAtlas.tsx`
- Create: `apps/web/components/landing/ekarvo/marketing/CapabilityAtlas.test.tsx`
- Create: `apps/web/components/landing/ekarvo/marketing/DecisionProof.tsx`
- Create: `apps/web/components/landing/ekarvo/marketing/models/decisionProof.ts`
- Create: `apps/web/components/landing/ekarvo/marketing/models/decisionProof.test.ts`
- Modify: `apps/web/components/landing/ekarvo/marketing/data.ts`
- Modify: `apps/web/app/landing/marketing*.css`

**Interfaces:**
- Produces: pure `DecisionProofState` transitions `chooseResponse`, `approve`, `raiseException`, `resume`, `execute`, `verify`, `learn`, and `proofStatus`; `CapabilityAtlas({ initialSelection? })`; `DecisionProof()`.
- Consumes: shared product/capability data, shell, scenes, disclosures, and `/landing/demo`.

- [ ] **Step 1: Port failing deterministic state-model tests**

Assert authority gates execution, execution gates verification, changed choices clear prior authority/evidence, exceptions stop work until resumed/reapproved, and completion requires evidence plus learning.

- [ ] **Step 2: Run the model tests to verify failure**

Run: `pnpm --dir apps/web exec vitest run components/landing/ekarvo/marketing/models/decisionProof.test.ts`
Expected: FAIL because model functions are missing.

- [ ] **Step 3: Implement the pure decision-proof model**

Keep the model free of React/timeouts so every state transition is deterministic and serializable.

- [ ] **Step 4: Write and run failing capability-atlas tests**

Assert Pulse/Drive selection, group/module selection, selected `aria-pressed`, detail/live-region content, and direct hash entry such as `#pulse-plan` selecting and focusing the matching group.

Run: `pnpm --dir apps/web exec vitest run components/landing/ekarvo/marketing/CapabilityAtlas.test.tsx`
Expected: FAIL before the UI exists.

- [ ] **Step 5: Implement Pulse UI and route**

Build the source hero, sticky anchor navigation, workflow example, decision proof, capability atlas, connected-platform section, disclosures, product-query CTAs, and metadata. Wire UI actions only to the pure model.

- [ ] **Step 6: Run focused tests/typecheck and commit**

Run: `pnpm --dir apps/web exec vitest run components/landing/ekarvo/marketing/models/decisionProof.test.ts components/landing/ekarvo/marketing/CapabilityAtlas.test.tsx && pnpm --dir apps/web typecheck`
Expected: PASS.

```bash
git add apps/web/app/landing/products/operations-os apps/web/components/landing/ekarvo/marketing apps/web/app/landing/marketing*.css
git commit -m "feat: add Ekarvo Pulse product flow"
```

### Task 7: Ekarvo Drive Detail and Execution Flow

**Files:**
- Create: `apps/web/app/landing/products/autonomous-execution/page.tsx`
- Create: `apps/web/components/landing/ekarvo/marketing/ExecutionDemo.tsx`
- Create: `apps/web/components/landing/ekarvo/marketing/ExecutionDemo.test.tsx`
- Create: `apps/web/components/landing/ekarvo/marketing/models/journey.ts`
- Create: `apps/web/components/landing/ekarvo/marketing/models/journey.test.ts`
- Modify: `apps/web/app/landing/marketing*.css`

**Interfaces:**
- Produces: `JourneyState` plus `propose`, `approve`, `reject`, `execute`, `blockEvidence`, `retryEvidence`, `pause`, `resume`, and `reset`; `ExecutionDemo({ compact? })`.
- Consumes: shell, scenes, disclosures, and `/landing/contact?product=autonomous-execution`.

- [ ] **Step 1: Port failing journey invariants**

Assert a proposal is not authority, execution/verification are distinct, rejection cannot execute, exceptions require a new decision, pause blocks new transitions, reset cancels pending work, blocked receipts recover on retry, and rapid reset during a transition leaves the initial state.

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm --dir apps/web exec vitest run components/landing/ekarvo/marketing/models/journey.test.ts`
Expected: FAIL because the model is missing.

- [ ] **Step 3: Implement the pure journey model and UI tests**

Keep time/animation outside the model. In component tests use fake timers to prove pending transitions are cancellable and disabled/loading states match the active transition.

- [ ] **Step 4: Implement the Drive page and execution client island**

Match the source hero, outcome contract, authority/assurance narrative, execution demo, evidence download, FAQ, CTA, metadata, and responsive layout.

- [ ] **Step 5: Run tests/typecheck and commit**

Run: `pnpm --dir apps/web exec vitest run components/landing/ekarvo/marketing/models/journey.test.ts components/landing/ekarvo/marketing/ExecutionDemo.test.tsx && pnpm --dir apps/web typecheck`
Expected: PASS.

```bash
git add apps/web/app/landing/products/autonomous-execution apps/web/components/landing/ekarvo/marketing apps/web/app/landing/marketing*.css
git commit -m "feat: add Ekarvo Drive product flow"
```

### Task 8: Combined Interactive Demo Route

**Files:**
- Create: `apps/web/app/landing/demo/page.tsx`
- Create: `apps/web/components/landing/ekarvo/marketing/OperationsDemo.tsx`
- Create: `apps/web/components/landing/ekarvo/marketing/OperationsDemo.test.tsx`
- Modify: `apps/web/components/landing/ekarvo/marketing/ExecutionDemo.tsx`
- Modify: `apps/web/app/landing/marketing*.css`

**Interfaces:**
- Produces: `OperationsDemo()` and the `/landing/demo#operations|execution` journey.
- Consumes: Task 7 `ExecutionDemo`, Task 6 decision model where applicable, shared PageHero/CTA.

- [ ] **Step 1: Write failing operations scenario tests**

Assert resource-move and overtime choices update cost/capacity/donor-team consequences, incomplete coverage never claims verification, and reset returns all outputs to the source initial values.

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm --dir apps/web exec vitest run components/landing/ekarvo/marketing/OperationsDemo.test.tsx`
Expected: FAIL because `OperationsDemo` is missing.

- [ ] **Step 3: Implement the combined demo page**

Render both demos with source copy, synthetic-data notice, deep-link anchors, reduced-motion-safe feedback, and a clear separation between proposed/approved/executed/verified states.

- [ ] **Step 4: Run tests/typecheck and commit**

Run: `pnpm --dir apps/web exec vitest run components/landing/ekarvo/marketing/OperationsDemo.test.tsx components/landing/ekarvo/marketing/ExecutionDemo.test.tsx && pnpm --dir apps/web typecheck`
Expected: PASS.

```bash
git add apps/web/app/landing/demo apps/web/components/landing/ekarvo/marketing/OperationsDemo* apps/web/components/landing/ekarvo/marketing/ExecutionDemo.tsx apps/web/app/landing/marketing*.css
git commit -m "feat: add interactive product demo route"
```

### Task 9: Local Request Persistence, Idempotency, and Deletion APIs

**Files:**
- Create: `apps/web/lib/marketing/request-schema.ts`
- Create: `apps/web/lib/marketing/request-store.ts`
- Create: `apps/web/lib/marketing/local-rate-limit.ts`
- Create: `apps/web/lib/marketing/request-store.test.ts`
- Create: `apps/web/app/api/contact/route.ts`
- Create: `apps/web/app/api/contact/route.test.ts`
- Create: `apps/web/app/api/delete-request/route.ts`
- Create: `apps/web/app/api/delete-request/route.test.ts`
- Modify: `apps/web/lib/route-policy.ts`
- Modify: `apps/web/tests/integration/routePolicy.test.ts`
- Modify: `apps/web/.env.example`

**Interfaces:**
- Produces: `contactRequestSchema`, `deleteRequestSchema`, `saveRequest(requestId, values)`, `deleteRequest(id, token)`, `purgeExpired(now?)`, `checkLocalFormRateLimit(key, now?)`, and two Next route `POST` handlers.
- Consumes: `EKARVO_DATA_DIR` with default `.data/requests`; Node crypto/fs primitives; route-policy body limits of 16 KB and 1 KB.

- [ ] **Step 1: Write failing store tests**

Using a temporary explicit `EKARVO_DATA_DIR`, assert `0700` directory/`0600` record permissions, atomic create, identical duplicate idempotency, conflicting duplicate rejection, 30-day expiry, timing-safe token deletion success, invalid-token preservation, and missing-record false.

- [ ] **Step 2: Run store tests to verify failure**

Run: `pnpm --dir apps/web exec vitest run lib/marketing/request-store.test.ts`
Expected: FAIL because store/schema functions do not exist.

- [ ] **Step 3: Implement schema, store, and bounded limiter**

Schemas pin reference limits: name 120, email 254, organization 200, role 120, workflow 2000, criteria 1000, product 50, UUID v4 request IDs. The limiter allows 10 attempts per key per rolling 60-second window and prunes expired entries.

- [ ] **Step 4: Write failing route-handler tests**

Assert same-origin localhost acceptance; public-host, origin, content-type, declared/actual body-size, honeypot, malformed JSON, schema, UUID, and rate-limit rejection; `201` receipt; duplicate idempotency; `409` conflict; delete success/invalid/missing; `Cache-Control: no-store`.

- [ ] **Step 5: Implement route handlers and route policy**

Use `zod` validation and self-managed same-origin checks. Register `/api/contact` and `/api/delete-request` as exact public routes with `rateLimit: "none"`, handler-owned rate limiting, `input: "zod"`, and 16 KB/1 KB middleware ceilings. Add `EKARVO_DATA_DIR` to `.env.example`.

- [ ] **Step 6: Run API and policy tests, then commit**

Run: `pnpm --dir apps/web exec vitest run lib/marketing/request-store.test.ts app/api/contact/route.test.ts app/api/delete-request/route.test.ts tests/integration/routePolicy.test.ts`
Expected: PASS.

```bash
git add apps/web/lib/marketing apps/web/app/api/contact apps/web/app/api/delete-request apps/web/lib/route-policy.ts apps/web/tests/integration/routePolicy.test.ts apps/web/.env.example
git commit -m "feat: add local workflow request lifecycle"
```

### Task 10: Workflow Contact and Privacy Deletion UI

**Files:**
- Create: `apps/web/app/landing/contact/page.tsx`
- Create: `apps/web/components/landing/ekarvo/marketing/ContactWorkflowForm.tsx`
- Create: `apps/web/components/landing/ekarvo/marketing/ContactWorkflowForm.test.tsx`
- Create: `apps/web/components/landing/ekarvo/marketing/DeleteRequestForm.tsx`
- Create: `apps/web/components/landing/ekarvo/marketing/DeleteRequestForm.test.tsx`
- Modify: `apps/web/blocks/landing/PrivacyPolicy.tsx`
- Modify: `apps/web/app/landing/marketing*.css`

**Interfaces:**
- Produces: `ContactWorkflowForm({ initialProduct })` and `DeleteRequestForm()`.
- Consumes: `/api/contact`, `/api/delete-request`, URL product preselection, existing Privacy page layout.

- [ ] **Step 1: Write failing contact-form tests**

Assert `?product=operations-os|autonomous-execution` preselection, invalid query fallback, required/email errors with linked summary focus, character counts, honeypot invisibility, pending disabled state, network retry with retained entries, `409` new-request action, receipt focus, receipt/download content, and create-another reset.

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm --dir apps/web exec vitest run components/landing/ekarvo/marketing/ContactWorkflowForm.test.tsx`
Expected: FAIL because the form is missing.

- [ ] **Step 3: Implement contact page and form**

Use `useSearchParams` at the route boundary, stable `crypto.randomUUID()` idempotency keys, abort-safe fetch handling, object URL cleanup, and source-equivalent reduced-motion transitions. Keep input values after recoverable failures.

- [ ] **Step 4: Write failing deletion-form tests**

Assert ready/disabled state, UUID field validation, busy label, success clearing, invalid/missing receipt preservation, server-unavailable feedback, status live region, and direct `/landing/legal/privacy-policy#delete` focus/visibility.

- [ ] **Step 5: Implement deletion UI and Privacy integration**

Append a clearly scoped `id="delete"` section without replacing existing SaaS privacy content. Receipt management links target this section.

- [ ] **Step 6: Run tests/typecheck and commit**

Run: `pnpm --dir apps/web exec vitest run components/landing/ekarvo/marketing/ContactWorkflowForm.test.tsx components/landing/ekarvo/marketing/DeleteRequestForm.test.tsx && pnpm --dir apps/web typecheck`
Expected: PASS.

```bash
git add apps/web/app/landing/contact apps/web/components/landing/ekarvo/marketing/ContactWorkflowForm* apps/web/components/landing/ekarvo/marketing/DeleteRequestForm* apps/web/blocks/landing/PrivacyPolicy.tsx apps/web/app/landing/marketing*.css
git commit -m "feat: add workflow brief and deletion experience"
```

### Task 11: Reconnect the Cinematic Landing, Auth, Legal, and Every Internal Path

**Files:**
- Modify: `apps/web/components/landing/ekarvo/CinematicLanding.tsx`
- Modify: `apps/web/components/landing/ekarvo/film/content.ts`
- Modify: `apps/web/components/landing/ekarvo/SiteChrome.tsx`
- Modify: `apps/web/components/landing/LegalPageLayout.tsx` only if the new shell interface requires it
- Modify: `apps/web/blocks/landing/ContactUs.tsx` only if the new shell interface requires it
- Modify: `apps/web/app/(auth)/layout.tsx` only if the new shell interface requires it
- Modify: affected route/link tests

**Interfaces:**
- Consumes: all route destinations and shared shell components from Tasks 2–10.
- Produces: one connected public journey with no substitute chapter links or broken root-relative source paths.

- [ ] **Step 1: Add failing link-graph tests**

Assert landing chapter CTAs point to Pulse, Trust, Drive, Products, Company, Approach, and Contact routes; footer links cover both products/platform/explore/legal paths; auth/legal headers use the full navigation; sign-in hides Login; product/query/hash/download links resolve.

- [ ] **Step 2: Run link tests to verify current gaps**

Run: `pnpm --dir apps/web exec vitest run components/landing/ekarvo/SiteChrome.test.tsx`
Expected: FAIL on old chapter-only destinations and missing chapter CTAs.

- [ ] **Step 3: Rewire the landing and shared consumers**

Restore source-equivalent chapter CTAs and final credits using `/landing` mappings. Remove the comment/behavior that substitutes page links with chapter anchors. Keep the app-specific Login action.

- [ ] **Step 4: Add rapid chapter/navigation and static-first E2E assertions**

Assert repeated next/previous/rail commands end on the last requested chapter, keyboard focus remains visible, reduced motion exposes the complete story, and a JavaScript-disabled browser still shows all chapter copy and primary route links.

- [ ] **Step 5: Run the full unit/integration suite and commit**

Run: `pnpm --dir apps/web test && pnpm --dir apps/web typecheck`
Expected: PASS.

```bash
git add apps/web/components/landing apps/web/blocks/landing apps/web/app/'(auth)'/layout.tsx
git commit -m "feat: connect the complete EKARVO marketing journey"
```

### Task 12: End-to-End, Accessibility, Latency, Visual QA, and Source Integrity

**Files:**
- Modify: `apps/web/e2e/marketing-parity.spec.ts`
- Create: `apps/web/e2e/marketing-interactions.spec.ts`
- Create/update: `qa/marketing-parity/source/**`
- Create/update: `qa/marketing-parity/implementation/**`
- Create: `design-qa.md`
- Modify: implementation files only when a current-run comparison finds P0/P1/P2 issues

**Interfaces:**
- Consumes: both running sites, Task 1 manifest, all marketing routes/interactions.
- Produces: passing E2E evidence, matched screenshots, timing/request logs, unchanged-source proof, and `design-qa.md` with `final result: passed`.

- [ ] **Step 1: Start the reference and implementation servers without modifying source**

Run the Astro reference on `127.0.0.1:4321` and Next.js app on `127.0.0.1:3010`. Use a test-only local request directory under `/private/tmp` and a valid local `.env` without committing secrets.

- [ ] **Step 2: Capture fresh source evidence before judging the implementation**

At 1440×900, 768×900, and 375×812, capture every mapped route plus: open mobile menu, both product slides, representative capability selections, open Trust disclosure, Pulse/Drive terminal demo states, contact error/pending/receipt, Privacy deletion, reduced-motion landing, and forced graphics failure.

- [ ] **Step 3: Run the complete E2E journey suite**

Run: `pnpm --dir apps/web test:e2e`
Expected: PASS for route/link crawl, metadata/canonicals, no overflow, mobile Escape/focus, axe scan, 44 px controls, carousel, capabilities, demos, form APIs/UI, downloads, reduced motion, static fallback, and auth/legal navigation.

- [ ] **Step 4: Record latency and console/network evidence**

For each route, record navigation start-to-DOM-content-loaded and start-to-primary-heading-visible timings, same-origin failures, console errors, and long blocking states. Assert no failed required asset/API request and no primary interaction waits without feedback.

- [ ] **Step 5: Run same-state visual comparisons**

Combine each source capture with its same-viewport implementation capture in one comparison input. Review full pages and focused header/hero/product/demo/form/footer regions for typography, spacing, colors, imagery, copy, interaction state, and responsive reflow.

- [ ] **Step 6: Fix and repeat every actionable P0/P1/P2 mismatch**

After each fix, rerun the affected unit test, recapture the same state, and record the prior finding, fix, and post-fix evidence in `design-qa.md`. P3 notes may remain as follow-up polish only.

- [ ] **Step 7: Run final repository verification**

Run: `pnpm --dir apps/web test && pnpm --dir apps/web typecheck && pnpm --dir apps/web lint && pnpm --dir apps/web build && pnpm --dir apps/web test:e2e`
Expected: all commands exit 0.

- [ ] **Step 8: Prove the source tree is unchanged**

Regenerate the excluded-path-normalized source manifest and compare it byte-for-byte with `qa/marketing-parity/source-tree.sha256`.

Run: `cmp qa/marketing-parity/source-tree.sha256 /private/tmp/ekarvo-source-tree-final.sha256`
Expected: exit 0 with no output.

- [ ] **Step 9: Finalize design QA and commit verification artifacts**

`design-qa.md` must name source/implementation screenshot paths, viewports/densities/states, full/focused comparisons, interaction tests, console/request evidence, comparison history, residual P3 notes, and exactly `final result: passed`.

```bash
git add apps/web/e2e qa/marketing-parity design-qa.md apps/web
git commit -m "test: verify complete marketing site parity"
```
