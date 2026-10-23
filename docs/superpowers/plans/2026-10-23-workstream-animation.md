# Animate the EKARVO Workstream Map

Approved plan: subtle ambient signals, scroll-driven station actions, fragmentation/assembly, evidence stacking, steady camera; no additional dependency or backend changes.

## Execution record
- Workspace is an unpacked project without .git. Work directly in the authorized project; original renderer, root and CSS backed up under /tmp/ekarvo-motion-before. Git worktree/commit tooling is inapplicable.
- Shared interface: pure choreography helpers feed the existing SVG renderer; root supplies ambient pause and modal state. Scroll remains the sole authority for task/evidence progress.
- Task 1: choreography helpers — 5 new tests observed failing for missing helpers, then all 8 workstream tests passed.
- Task 2: renderer, accessible session pause, mobile/reduced-motion, visibility/modal lifecycle — complete.
- Task 3: browser validation, fresh review, and final isolated production build complete.

## Review and verification
- Fresh read-only reviewer found two transition discontinuities: completion changed ambient position; section 4 → 5 retracted assembled routes. Both reproduced with failing renderer tests and fixed. Ambient now has a stable six-slot clock, with the return slot hidden until evidence exists; assembled routes persist after section 4. No deferred findings.
- Targeted landing tests: 23 passed. Full web suite: 338 tests passed, 46 suites passed; existing tests/doctor.test.ts cannot import missing root scripts/doctor.mjs.
- Final web typecheck, lint, and isolated production build passed (exit 0). Build logged existing optional-provider/backend/cache configuration warnings.
- Browser: 1440×1000 desktop, 375×812 mobile, 844×390 landscape; no horizontal overflow or console errors. Verified continuous ambient movement without task movement, keyboard pause, session persistence across reload, full evidence stack, exact reverse scroll, fragmentation/assembly reversal, navigation to Pulse, modal suspension/resumption, and static reduced motion.
- Renderer unit tests additionally cover hidden-tab suspension, no catch-up on resume, and unmount cleanup.
- Source review intentionally deferred browser aesthetics to the browser pass above. Physical mobile-device performance was not measured; responsive emulation was used.
- Existing server on port 3010 was detected during validation and left running; task-owned 3011 preview was stopped. Final build uses an isolated source snapshot to avoid competing with the user's .next output.
- Screenshots: .playwright-mcp/workstream-animated-final.png, workstream-animated-complete.png, workstream-animated-mobile.png, workstream-animated-assembly.png.
