# Marketing parity design QA

Verification date:2026-10-30. Source:http://127.0.0.1:4321, unchanged Astro Website. Implementation:http://127.0.0.1:3011, optimized Next15.5.9 production build at this worktree. User-owned3010 was preserved. Chromium1.58.2 browser harness, DPR1, en-US/UTC, 1440×900,768×900,375×812. Reduced motion is the default for comparable static captures; forced graphics failure and JavaScript-disabled captures are separately named.

## Evidence and scope

- Native-resolution captures: `qa/marketing-parity/source/` and `qa/marketing-parity/implementation/`. Same filename identifies the same route, viewport and state. `capture-manifest.json` lists the68 primary captures in each; `evidence-index.json` includes additional noJS/footer/auth captures and hashes.
- `qa/marketing-parity/comparisons/index.json` maps each paired same-state source/implementation image to its combined comparison input. The full-page composition and focused hero/header/footer, carousel, atlas, demo and form regions were reviewed using `view_image`. Full-page body captures precede the final footer correction; final `footer-{width}` pairs supersede their shared footer regions. The final Operations-only mobile badge correction also supersedes the Operations region in the earlier `demo-{width}` full pages: use `demo-pulse-initial-{width}` and refreshed `demo-pulse-terminal-{width}` pairs. Other body regions were unchanged. LosslessWebP originals retain PNG-identical decoded pixels; images exceeding WebP’s16383px limit remain original PNG. Comparison previews are scaled; their native originals remain available.
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
| P3 | Final review: mobile Operations terminal badge did not shrink, leaving a three-line heading and one-line badge vs source two/two | Verified source computed `flex: 0 1 auto`; restored it only on Operations title badges at650px and below. At375, heading156.578125×38.375px and badge104.421875×48.375px now match source exactly. Fresh initial/terminal Operations and terminal Drive pairs at all three widths were reviewed; full-document demo axe and overflow pass. |
| P3 | Final review: combined-demo asset failure listener hardcoded3011 | Listener compares parsed response origin with the `baseURL` fixture origin. Permanent regression intercepts a required503 image at4187 and excludes a foreign4188 URL containing the origin in its query; fails before fix, passes after. |
| P3 | Final review: production E2E command referenced removed temporary config | Complete production override and setup/copy/run/remove commands are included below; no credential writes. |

Initial combined-image history remains in `qa/marketing-parity/history/`. Final-review before images are `final-review-before-{source,implementation}-pulse-375.webp`; computed source/before/after dimensions are in `logs/final-fix-before-metrics.json` and `logs/final-fix-demo-metrics.json`. The final nine paired states are indexed with all 160 native originals and refreshed SHA256 hashes. The mobile Operations wrap is fixed and is not a residual difference. Source full-page screenshot capture itself reset the reference carousel from Drive scrollLeft325px to0px. Those panoramas were rejected. Final products-drive images are fixed-viewport crops taken after the real tab action; scroll-snap/scroll-behavior are frozen equally during both captures and measured before/after positions remain1278/686/325px. Initial Products full pages still cover the complete route. Capture overlays hide only development/support chrome. Focused component captures hide the shared sticky header equally to prevent it obscuring scrolled component content.

## Behavior, accessibility and runtime

The complete permanent suite passed35/35 before the final footer CSS correction. The rebuilt footer correction passed4/4 full-document/target/overflow/typography checks at all three widths. Final review added two permanent focused regressions; the final scoped production run passed7/7 (responsive captures, full-document demo axe/overflow at three widths, both regressions and all combined-demo behaviors). A settled-source capture rerun passed1/1. The override copied literally from the instructions below passed both new regressions2/2. Logs: `logs/e2e.log`, `logs/footer-final-e2e.log`, `logs/final-fix-e2e.log`, `logs/final-fix-capture-settled.log`, and `logs/final-fix-documented-config.log`. Coverage:

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
| Full units excluding only baseline doctor suite |63 suites570 tests pass; `logs/unit.log`; final review affected components28/28, `logs/final-fix-unit.log` |
| Typecheck |exit0; `logs/typecheck.log`; final review `logs/final-fix-typecheck.log` |
| Lint |exit0, no warnings; `logs/lint.log`; final review `logs/final-fix-lint.log` |
| Production build |exit0, full route table; `logs/build.log`; final Operations CSS rebuild `logs/final-fix-build.log` |
| Permanent E2E | Full35/35 before footer correction; post-footer4/4; final review six focused permanent tests plus responsive capture/axe test7/7; documented override regressions2/2. All exit0; logs listed above. |
| Fresh responsive/state captures |Initial4/4, footer1/1; final review responsive Operations/Drive1/1 at all three widths; `logs/captures*.log`, `logs/final-fix-capture-settled.log` |
| Source integrity |252/252 paths+SHA256 byteexact; manifestSHA25644636ba37f4d3d4a2d90ce8eec3df8e9fcd11414626a0615ca07b70252d2f61b; `logs/final-fix-source-integrity.log` |

Commands: `pnpm --dir apps/web exec vitest run --passWithNoTests --exclude tests/doctor.test.ts`; `pnpm --dir apps/web typecheck`; `pnpm --dir apps/web lint`; `NODE_OPTIONS=--max-old-space-size=8192 pnpm --dir apps/web build`. The full production E2E run used a temporary override equivalent to the complete configuration below. Reproduce from the repository root with an existing valid, ignored `apps/web/.env` (the verification worktree uses its existing symlink). These commands do not create or edit credentials. Keep the source on4321 and the user development server on3010;3011 must be free.

In terminal A, prepare and run the production server with isolated synthetic request storage:

```bash
test -f apps/web/.env
pnpm install
NODE_OPTIONS=--max-old-space-size=8192 pnpm --dir apps/web build
review_data_dir=$(mktemp -d /private/tmp/ekarvo-marketing-qa.XXXXXX)
EKARVO_DATA_DIR="$review_data_dir" NODE_OPTIONS=--max-old-space-size=8192 \
  pnpm --dir apps/web start --hostname 127.0.0.1 --port 3011
# After the tests finish, stop this foreground server with Ctrl-C, then:
rmdir "$review_data_dir"
```

In terminal B, create the small override outside app source, copy it into place so relative imports resolve, run the suite against that production server, and remove the override:

```bash
cat > /private/tmp/ekarvo-production-playwright.ts <<'EOF'
import { defineConfig } from "@playwright/test";
import config from "./playwright.config";
export default defineConfig({
  ...config,
  use: { ...config.use, baseURL: "http://127.0.0.1:3011" },
  webServer: undefined,
});
EOF
cp /private/tmp/ekarvo-production-playwright.ts apps/web/production-review.config.ts
pnpm --dir apps/web test:e2e --config production-review.config.ts
review_test_status=$?
rm apps/web/production-review.config.ts /private/tmp/ekarvo-production-playwright.ts
# Exit status from the test command (0 means pass):
printf '%s\n' "$review_test_status"
```

No concurrent Next dev/build may use this worktree’s `.next`. The temporary override deliberately disables the default development-server launcher and uses the already-running production runtime.

Baseline limitations: tracked doctor.test.ts imports missing scripts/doctor.mjs, so only that named suite is excluded per ledger. Node22.22.2 emits the existing repositoryNode>=24 engine warning. Build/runtime logs include existing optional GitHub/LinkedIn/backend credential warnings and unavailable site-config cache warnings; no validation was disabled and the build passed. The source and main3010 services were left running. The test data directory is separate from user data, and the environment symlink was neither edited nor committed.

Approved differences: Login/Refunds, existing SaaS legal documents and appended request-management section remain. The plan-required DecisionProof and extra Drive demo/FAQ are not present on source product routes; their source components/data exist, and shared /demo terminal states were compared against actual running reference behavior. These are explicitly scoped additions, not fabricated source parity.

Residual P3: mobile footer brand-to-links spacing differs slightly; existing application support chrome can appear at a viewport crop edge. No actionable P0/P1/P2 remains after final evidence review. Minor antialiasing/transient renderer-frame differences are expected across Astro/Next and softwareWebGL. Existing optional-integration warnings remain environment concerns.

final result: passed
