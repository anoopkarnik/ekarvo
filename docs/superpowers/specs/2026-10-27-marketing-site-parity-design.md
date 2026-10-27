# EKARVO Marketing Site Parity Design

## Intent

Bring the complete public marketing experience from `/Users/arahaelion/EKARVO/Website` into the Next.js application in this repository without modifying the source `Website` project. The result should preserve the source site's visual hierarchy, page flow, responsive behavior, interaction states, and motion while retaining the SaaS application's existing authentication and legal integrations.

## Why

The current Next.js application contains a faithful port of the cinematic landing sequence, but its navigation has been reduced to chapter anchors (`Pulse`, `Drive`, `Trust`, and `Proof`). The reference site provides a broader product story through separate Products, Approach, Platform, Trust, Company, Contact, Pulse, and Drive routes. Those routes, their supporting media, and their interactive components are absent from the current build, so the public journey is incomplete and the banner does not match the approved source.

## Goals

- Replicate the reference header and footer structure and styling across all EKARVO marketing pages.
- Add the missing public routes under the existing `/landing` public route boundary.
- Preserve the reference information architecture:
  - Products
  - Approach
  - Platform
  - Trust
  - Company
  - Contact / Discuss a workflow
  - Ekarvo Pulse product detail
  - Ekarvo Drive product detail
  - Interactive product demos
- Keep the current `/sign-in` entry point visible as an application-specific addition.
- Preserve the cinematic landing story and restore its outbound links to the newly available marketing routes.
- Port required imagery and downloadable public artifacts while keeping `Website` read-only.
- Reimplement Astro-specific behavior as idiomatic React/Next.js components rather than pasting framework-specific code.
- Match responsive layouts at desktop, tablet, and small-phone widths.
- Match important interaction states: hover, focus, active navigation, mobile menu, carousels, tabs, disclosures, workflow demos, forms, loading feedback, reduced motion, and no-WebGL/static fallbacks where applicable.
- Keep visible interactions responsive and avoid adding unnecessary client-side JavaScript to static editorial sections.
- Validate the source and Next.js implementations through the same end-to-end routes and interaction paths before completion.

## Non-goals

- Do not modify files in `/Users/arahaelion/EKARVO/Website`.
- Do not replace or redesign authenticated SaaS product surfaces.
- Do not expose the new pages outside the existing `/landing` public namespace.
- Do not duplicate the source Astro runtime inside Next.js, proxy the source site, or embed it in an iframe.
- Do not introduce new product claims or alter approved marketing copy unless required to preserve existing SaaS-specific legal or authentication behavior.
- Do not add external CRM, email, scheduling, or production data integrations. The reference site's local request persistence and deletion flow is in scope.

## Constraints

- `apps/web/lib/route-policy.ts` already marks `/landing` and all descendants public; new routes should remain within that boundary.
- Shared Next.js links must use `/landing/...` equivalents rather than the source site's root-level paths.
- The existing Login action remains available and routes to `/sign-in`.
- Existing SaaS legal pages remain authoritative. The marketing footer should link to their current `/landing/legal/...` locations.
- The existing Privacy page gains a narrowly scoped saved-request deletion section so reference contact receipts retain their complete management path.
- The shared marketing header remains visible on auth pages that already consume it; `/sign-in` hides only the redundant Login action.
- Source media and downloads may be copied into `apps/web/public` only when they are used by the port and their source paths are preserved where practical.
- Source media and downloads used for fidelity are copied byte-for-byte; source Astro/React code is adapted into repository-native Next.js components.
- Existing user changes in `ekarvo` must be preserved.
- The port must respect reduced-motion preferences, keyboard interaction, visible focus, touch target sizing, and responsive reflow.

## Approaches Considered

### 1. Full route-for-route Next.js port — selected

Rebuild the source pages as Next.js routes and React components under `/landing`, sharing a common marketing shell and narrowly scoped interactive client components. This retains source fidelity while fitting the current application architecture, route policy, metadata system, and authentication links.

Trade-off: this is the largest implementation, but it is the only approach that reproduces the complete flow and permits direct end-to-end comparison.

### 2. Expand only the current cinematic landing

Add the source navigation labels and place the missing content into more landing-page sections or modals.

Trade-off: smaller change, but it changes the source information architecture, produces different browser history and deep links, and cannot faithfully reproduce the reference journey. Rejected.

### 3. Serve or embed the Astro site alongside Next.js

Run the source application independently and proxy or embed it from the SaaS app.

Trade-off: quickest superficial parity, but it creates two runtimes, fragmented routing, inconsistent authentication navigation, and duplicated deployment concerns. Rejected.

## Route Mapping

| Reference route | Next.js route |
| --- | --- |
| `/` | `/landing` |
| `/products` | `/landing/products` |
| `/products/operations-os` | `/landing/products/operations-os` |
| `/products/autonomous-execution` | `/landing/products/autonomous-execution` |
| `/approach` | `/landing/approach` |
| `/platform` | `/landing/platform` |
| `/trust` | `/landing/trust` |
| `/company` | `/landing/company` |
| `/contact` | `/landing/contact` |
| `/demo` | `/landing/demo` |
| `/privacy` | `/landing/legal/privacy-policy` |
| `/terms` | `/landing/legal/terms-of-service` |

The existing `/landing/legal/contact-us` route remains available for SaaS contact details, but the marketing CTA will point to the richer `/landing/contact` workflow brief experience.

The reference-only `/creative/*` visual-study routes and custom Astro 404 are development surfaces, not customer journey routes, and are explicitly excluded.

## Component Architecture

### Shared marketing shell

A shared layout component owns:

- skip link
- sticky header
- active-route navigation state
- Login action
- primary `Discuss a workflow` CTA
- accessible mobile menu with Escape handling and focus restoration
- shared footer and legal links

The cinematic landing keeps its scroll-driven theme behavior while using the same navigation destinations. Editorial pages use the light paper theme.

### Static editorial sections

Page headings, copy columns, product cards, calls to action, architecture notes, authority rows, company narrative, and related content should render as server components wherever no runtime behavior is required.

### Interactive islands

Client components should be limited to the interactions that need state:

- product carousel with button, keyboard, and scroll synchronization
- Pulse capability atlas and selection states
- Pulse scenario/decision proof interaction
- Drive execution demo with approval, rejection, exception, retry, pause, reset, evidence, and download states
- disclosures/FAQ controls
- contact workflow form with inline validation, local draft/receipt behavior, retry/error feedback, and downloads
- saved-request deletion form on the Privacy page
- source-equivalent supporting visual animation where it materially affects the experience

State transitions should remain cancellable, keyboard-operable, and deterministic. Loading indicators should appear only for perceptible waits, and layout space should be reserved to avoid visual jumps.

### Local workflow request APIs

Port the reference form's complete local-server behavior as Next.js route handlers:

- `POST /api/contact` validates same-origin JSON, a 16 KB body ceiling, the honeypot, field limits, product values, and UUID request identifiers.
- Duplicate request IDs with identical content are idempotent; conflicting content returns `409` and allows the client to start a new request.
- Requests are stored with restrictive permissions under the configurable local data directory, expire after 30 days during cleanup, and return a private deletion token.
- `POST /api/delete-request` validates same-origin JSON, a 1 KB body ceiling, UUID receipt fields, and performs timing-safe token comparison before deletion.
- Both handlers receive explicit public rows in `route-policy.ts`, including body-size limits, self-managed origin protection, validation ownership, and an appropriate local-form rate-limit policy.
- Tests cover invalid content types, origins, sizes, fields, idempotency, conflicts, rate limits, deletion tokens, and missing/already-deleted records.

### Visual assets

Copy the used source assets from `Website/public` to `apps/web/public` without altering the source. Preserve intrinsic dimensions and responsive `<picture>` behavior. Use the existing Lucide icon dependency for equivalent icons rather than recreating icons with CSS or inline drawings.

### Styling

Extend the current `ekarvo.css`/cinematic styling with source-derived design tokens and page styles, namespaced beneath `.ek-site` to avoid leaking into authenticated application surfaces. Preserve:

- Inter typography and source weight hierarchy
- paper, film, blue, border, and muted color tokens
- 4/8px spacing rhythm
- page-width and reading-width constraints
- source radii, rules, and restrained elevation
- responsive typography and grid changes
- visible focus states and 44px minimum interactive targets
- reduced-motion fallbacks

## User Flow

1. A visitor opens `/landing` and sees the cinematic narrative with the source navigation labels.
2. Header links open real marketing pages instead of scrolling to substitute chapters.
3. Products opens the family overview and interactive Pulse/Drive carousel.
4. Product CTAs open the matching Pulse or Drive detail page.
5. Product pages expose their source-equivalent section navigation and functional demos.
6. Approach, Platform, Trust, and Company provide the supporting decision, architecture, governance, and company story.
7. `Discuss a workflow` opens the workflow brief form; users can validate, retain, and download their brief in the same states as the reference.
8. The contact receipt links to the Privacy deletion flow, where the request ID and private token permanently remove the local server copy.
9. `/landing/demo` exposes both reference product demonstrations and their complete state paths.
10. Login continues to open `/sign-in`.
11. Footer links connect the entire marketing path and the existing legal routes.

## Error, Loading, and Fallback Behavior

- Marketing pages should render useful static content before interactive JavaScript initializes.
- Interactive controls begin disabled only when their source-equivalent behavior requires initialization, then become operable without layout shift.
- Failed graphics initialization falls back to the matching static artwork.
- Reduced-motion users receive the complete narrative and operable controls without scrubbed or ambient animation.
- Contact-form validation remains next to each field, preserves input after failure, and makes retry available.
- Broken or missing routes/assets are release blockers.

## Validation Strategy

### Source capture

Run `Website` unchanged and capture fresh screenshots and interaction evidence for each route at matching viewports and states.

### Automated behavior coverage

Port or adapt the reference site's relevant Playwright assertions for:

- every route and internal link
- metadata and useful page titles
- no horizontal overflow
- mobile-menu Escape behavior
- accessibility scanning
- product carousel buttons and keyboard control
- capability selections
- Pulse and Drive scenario state transitions
- contact validation, retained input, retry, download, and deletion/reset behavior
- API origin, size, validation, idempotency, conflict, rate-limit, persistence, and deletion behavior
- reduced-motion and static fallbacks
- 44px target sizing
- distinct major-route visual scenes
- auth-page header behavior after the shared navigation change
- metadata and canonical paths for every new route
- every remapped internal link, product-query preselection, hash anchor, download, and receipt-management link

Add focused unit/component tests for state reducers or interaction components where the reference already has deterministic model tests.

### Visual comparison

- Capture source and implementation at the same viewport, route, theme, content, and interaction state.
- Compare full-page composition plus focused header, hero, product, demo, form, and footer regions.
- Compare open mobile navigation, both carousel slides, capability selections, open disclosures, demo terminal states, form error/pending/receipt states, reduced motion, and graphics failure fallbacks.
- Explicitly check typography, spacing, colors, imagery, copy, responsive behavior, and active/focus states.
- Fix all P0/P1/P2 mismatches and repeat the comparison until the project-root `design-qa.md` records `final result: passed`.

### Performance and transition checks

- Inspect console errors and failed requests.
- Record route and navigation timings and verify there is no unexpected blocking state, failed request, or visible interaction delay.
- Confirm static sections remain server-rendered and heavy interactive/3D code is loaded only where needed.
- Check animation input responsiveness and cancellation during rapid navigation or state changes.
- Hash the complete `Website` source tree before implementation and again at handoff; the hashes must match, proving the read-only source was not changed even though it is not a Git worktree.

## Acceptance Criteria

- All mapped routes resolve publicly inside `/landing`.
- `/landing/demo` and the local request/deletion APIs reproduce the reference behavior.
- Header, footer, page structure, and primary visuals match the reference at desktop and mobile viewports.
- All primary click and keyboard paths work end to end.
- The cinematic landing links into the complete marketing site.
- Login and current SaaS legal destinations remain functional.
- No source file under `Website` is modified.
- Typecheck, relevant unit/component tests, route-policy tests, production build, and end-to-end flow checks pass.
- Side-by-side design QA has no actionable P0/P1/P2 differences and records `final result: passed`.
