# Marketing parity design QA

Verification date:2026-10-30. Source:http://127.0.0.1:4321, unchanged Astro Website. Implementation:http://127.0.0.1:3011, optimized Next15.5.9 production build at this worktree. User-owned3010 was preserved. Chromium1.58.2 browser harness, DPR1, en-US/UTC, 1440×900,768×900,375×812. Reduced motion is the default for comparable static captures; forced graphics failure and JavaScript-disabled captures are separately named.

## Evidence and scope

- Native-resolution captures: `qa/marketing-parity/source/` and `qa/marketing-parity/implementation/`. Same filename identifies the same route, viewport and state. `capture-manifest.json` lists the68 primary captures in each; `evidence-index.json` includes additional noJS/footer/auth captures and hashes.
- `qa/marketing-parity/comparisons/index.json` maps each paired same-state source/implementation image to its combined comparison input. The full-page composition and focused hero/header/footer, carousel, atlas, demo and form regions were reviewed using `view_image`. Full-page body captures precede the final footer-only correction; final `footer-{width}` pairs supersede their shared footer regions. No body region changed in that correction. LosslessWebP originals retain PNG-identical decoded pixels; images exceeding WebP’s16383px limit remain original PNG. Comparison previews are scaled; their native originals remain available.
- Fresh source screenshots preceded implementation judgment. All12 mapped routes were captured at each viewport: home,Products,Pulse,Drive,Approach,Platform,Trust,Company,Contact,Demo,Privacy,Terms. Privacy/Terms content intentionally remains existing SaaS legal copy.
- State filenames: `products-drive`, `atlas-plan`, `trust-open`, `demo-pulse-terminal`, `demo-drive-terminal`, `menu-open`(768/375), `contact-errors`, `contact-pending`, `contact-receipt`, `privacy-delete`, `home-graphics-failure`, `home-nojs`; final additional `footer`, `pulse-nojs-375`, `proof-nojs-375`, and implementation-only `auth`.
- Form state captures intercept only the browser’s API response with the same fixed synthetic receipt. No source request was saved. Separate real implementationAPI tests save a synthetic request and delete that exact receipt in finally cleanup. No email/CRM/calendar calls were added.

## Comparison history

| Severity | Evidence / prior finding | Fix and final verification |
| --- | --- | --- |
| P2 | Mobile Menu16px vs source14px | Scoped summary14px; current screenshots and browser CSS assertion pass at768/375. |
| P1 | Mobile summary named Open navigation excluded visible Menu | Native summary name Menu; shell regression and full-document axe pass. |
| P1 | Terms version opacity50 yielded2.08:1 | Existing muted text class; full-document axe passes all viewports. |
| P2 | Pending Save stayed blue while source uses neutral disabled action | Restored source disabled foreground/background/border; final paired pending captures align. |
| P2 | Tablet footer legal labels split across letters; controller inspection measured note18px/28.8px with margin24px vs source14px/22.4px/margin0; headings muted vs source foreground | Nonshrinking legal group, nowrap labels, exact source footer typography and foreground heading override; fresh paired footer captures and dedicated computed-style regression pass. |
| P2 | Added footer Login40.5px wide on375 | Shared shell links minimum44px; all three target-size sweeps pass. |
| P1 | Existing sign-in text links3.5:1 on dark background and short action targets | Explicit ek-auth frame, readable blue text actions,44px controls; entire sign-in document axe/targets/reflow pass. |
| P1 | NoJS disabled proof-stage region scrolled horizontally without keyboard access | Wrap stage labels before hydration; complete static DOM audit passes. |

Initial combined-image history remains in `qa/marketing-parity/history/`. Source full-page screenshot capture itself reset the reference carousel from Drive scrollLeft325px to0px. Those panoramas were rejected. Final products-drive images are fixed-viewport crops taken after the real tab action; scroll-snap/scroll-behavior are frozen equally during both captures and measured before/after positions remain1278/686/325px. Initial Products full pages still cover the complete route. Capture overlays hide only development/support chrome. Focused component captures hide the shared sticky header equally to prevent it obscuring scrolled component content.

## Behavior, accessibility and runtime

The complete permanent suite passed35/35 before the final footer CSS correction. After that correction the rebuilt production runtime passed the focused full-document/target/overflow sweeps at all three widths plus the new footer typography regression (4/4). The complete run is recorded in `qa/marketing-parity/logs/e2e.log`; the post-footer checks are in `logs/footer-final-e2e.log`. Coverage:

- Homepage bannerProducts→realProducts→Pulse and Drive clicks, then Login and legal navigation. All15 public/auth/legal route documents have metadata, canonical paths and useful headings.
-79 exact internal route/query/hash/download URLs resolve with20 deduplicated document fetches. Both product query selections and invalid fallback, capability/hash focus, disclosure/hash focus, demo section anchors and receipt-management target are covered.
- Carousel boundary/keyboard/rapid opposite commands and static both-product links; every atlas product/group/module; Pulse approval/exception/reapproval/execution/verification/learning; Drive pause/rejection/exception/recovery/evidence download/reset; operations reallocation/overtime/incomplete coverage/reset; rapid pending reset.
- Form validation, pending-disabled feedback, retained input after network failure,409 new-request recovery, real201 save and identical duplicate201, conflicting409, matching downloaded receipt, invalid token preservation, UI deletion and404 absent record; exact synthetic receipt cleanup.
- Full-document axe, no overflow and44px shell/button/summary controls on all15 routes at all three viewports. Menu keyboardEnter/Escape, restored visible summary focus and14px text. Root skip target works on primary pages.
- Script-free clones of the exact noJS DOM, retaining noscript content, receive full-document axe audits on all10 marketing routes plus Privacy deletion. Native noJS menu/details and narrative/download links remain available. Forced getContext failure preserves the full static story and source artwork.
- SwiftShader realWebGL rapid next/previous/rail replacement, reduced-motion complete story, nativeHome interruption while Next retains focus. The Home test first settles an intermediate chapter before requesting rail5→Home, avoiding a narrow compositor-phase observation race while preserving the stale-destination assertion. It passes in4.6s in the final run.

Per-route timing and console/network evidence is `qa/marketing-parity/runtime.json`. Final crawl recorded no console errors, pageerrors, failed required requests orHTTP errors. DCL66.4–111.4ms; navigation-to-primary-heading88–151ms. These are local warm-runtime samples, not a production hosting benchmark. Pending operations show explicit status/disabled feedback; no unexplained blocking state remained.

| Route | DCL(ms) | Heading visible(ms) |
| --- | ---: | ---: |
| /landing | 88.7 | 131 |
| /landing/products | 91 | 124 |
| /landing/products/operations-os | 66.4 | 102 |
| /landing/products/autonomous-execution | 74.7 | 103 |
| /landing/approach | 71.1 | 88 |
| /landing/platform | 98.2 | 110 |
| /landing/trust | 85.6 | 102 |
| /landing/company | 105.7 | 123 |
| /landing/contact | 82.3 | 110 |
| /landing/demo | 80.4 | 106 |
| /landing/legal/privacy-policy | 104.3 | 118 |
| /landing/legal/terms-of-service | 78.5 | 95 |
| /landing/legal/cancellation-refund-policies | 111.4 | 133 |
| /landing/legal/contact-us | 86.4 | 97 |
| /sign-in | 110.7 | 151 |

## Final repository gate

| Check | Result / committed log |
| --- | --- |
| Full units excluding only baseline doctor suite |63 suites570 tests pass; `logs/unit.log` |
| Typecheck |exit0; `logs/typecheck.log` |
| Lint |exit0, no warnings; `logs/lint.log` |
| Production build |exit0, full route table; `logs/build.log` |
| Permanent E2E | Full35/35 before final footer CSS; post-fix4/4 accessibility/target/reflow/typography checks; both exit0; `logs/e2e.log`, `logs/footer-final-e2e.log` |
| Fresh responsive/state captures |4/4 and final affected capture1/1; `logs/captures*.log` |
| Source integrity |252/252 paths+SHA256 byteexact; manifestSHA25644636ba37f4d3d4a2d90ce8eec3df8e9fcd11414626a0615ca07b70252d2f61b |

Commands: `pnpm --dir apps/web exec vitest run --passWithNoTests --exclude tests/doctor.test.ts`; `pnpm --dir apps/web typecheck`; `pnpm --dir apps/web lint`; `NODE_OPTIONS=--max-old-space-size=8192 pnpm --dir apps/web build`; `pnpm --dir apps/web test:e2e --config task-12-browser-config.ts`. The ignored temporary config extends the committed Playwright config with3011 baseURL and disables its webServer so it uses the owned production runtime. It is removed from app source after verification. No concurrent Next dev/build touched this .next.

Baseline limitations: tracked doctor.test.ts imports missing scripts/doctor.mjs, so only that named suite is excluded per ledger. Node22.22.2 emits the existing repositoryNode>=24 engine warning. Build/runtime logs include existing optional GitHub/LinkedIn/backend credential warnings and unavailable site-config cache warnings; no validation was disabled and the build passed. The source and main3010 services were left running. The test data directory is separate from user data, and the environment symlink was neither edited nor committed.

Approved differences: Login/Refunds, existing SaaS legal documents and appended request-management section remain. The plan-required DecisionProof and extra Drive demo/FAQ are not present on source product routes; their source components/data exist, and shared /demo terminal states were compared against actual running reference behavior. These are explicitly scoped additions, not fabricated source parity.

Residual P3: mobile footer brand-to-links spacing differs slightly; existing application support chrome can appear at a viewport crop edge. No actionable P0/P1/P2 remains after final evidence review. Minor antialiasing/transient renderer-frame differences are expected across Astro/Next and softwareWebGL. Existing optional-integration warnings remain environment concerns.

final result: passed
