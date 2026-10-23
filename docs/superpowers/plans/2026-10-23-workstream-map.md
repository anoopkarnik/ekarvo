# Workstream Map

Approved direction: option 3, replacing the earlier ribbon selection. Keep the existing EKARVO page and use a dimensional operational map: intake → Pulse → approval → Drive → CRM/ERP → verification, plus a browser branch and evidence feedback. Use the current dark/teal brand. Implement inline in this non-git workspace; original renderer backup: /tmp/ekarvo-ribbon-before.

1. Continuous progress follows measured section positions, supports reversing/deep links, caches geometry on layout changes, and updates a shared frame ref without React renders per scroll frame. Tests cover variable section heights, endpoints, overscroll, and reverse navigation.
2. Use a crisp, layered vector scene, with work items following curved routes and evidence appearing only when they reach verification. Shared scroll invalidation drives render-on-demand updates. Tests cover curved interpolation and reversible work/evidence state.
3. Keep the hero illustration beside the copy, subdue it behind dense demos, simplify it on mobile, respect reduced motion, and preserve product hover and operating-model controls. SVG keeps a readable initial scene without WebGL or JavaScript.
4. Verify typecheck, lint, the full web suite, browser screenshots/scrolling/resizing/reduced motion, and a fresh code review. Preserve the already-running user server on 3010; do not run a build in its .next output folder.

Verification so far: seven new behavioral tests passed; web typecheck and lint passed; full web suite has 328 passing tests with one existing doctor-suite import failure (missing scripts/doctor.mjs). Desktop screenshots confirm the map sits beside the copy. Browser checks confirm continuous within-section token movement, exact reverse state, all four evidence cards at the final section, reduced-motion stillness, and no overflow at 375px or 844px landscape. Fresh code review reported no actionable findings. Removed unused Three.js/runtime types.

Final production build passed (`pnpm build`, web + backend). Landing first-load JS: 182 KB (previously 324 KB). Final smoke on task-owned port 3011 rendered the SVG map with no console errors and four evidence cards at completion, then the server was stopped. Port 3010 remains free. Production startup also exposed the existing missing NEXT_PUBLIC_EMAIL_CLIENT while email auth is enabled; no environment settings were changed.
