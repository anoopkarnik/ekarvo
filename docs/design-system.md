# EKARVO Design System

The landing page (`/landing`) is the reference implementation for EKARVO's visual language. Use this document as the template when building new marketing pages, product surfaces, or anything else that should look like EKARVO.

**Sources:**

- Tokens and fonts: [`apps/web/app/landing/ekarvo.css`](../apps/web/app/landing/ekarvo.css)
- Components: [`apps/web/components/landing/ekarvo/`](../apps/web/components/landing/ekarvo/)

> **Note on tokens:** `ekarvo.css` declares `--ek-*` variables, but the components render with hardcoded Tailwind arbitrary values that differ slightly (for example, the CSS declares `#0b0f13` while the page renders `#090D11`). The values below are what the page actually renders, so treat them as canonical. If you consolidate tokens later, update the variables to these values.

---

## 1. Design principles

1. **Operational and precise.** EKARVO should feel like a control surface, not a brochure. Use thin borders, a monospace layer for system data, and tabular numbers.
2. **Dark and calm, with one bright signal.** The canvas is near-black. Mineral teal is the only bright color, and it carries every primary action, active state and "healthy" signal.
3. **Loud headlines, quiet body.** Display headings are huge, uppercase, extra-bold and tightly tracked. Everything around them is small, muted and generously spaced.
4. **Warm colors mean friction.** Amber marks gaps, warnings and attention. Coral marks errors and failures. Don't use either decoratively.
5. **Accessible by default.** Hit targets are at least 44px, focus rings are visible, motion respects reduced-motion settings, and the brand never relies on color alone.

---

## 2. Color

### 2.1 Core palette

| Role | Name | Hex | Tailwind usage | Notes |
| --- | --- | --- | --- | --- |
| Canvas | Obsidian | `#090D11` | `bg-[#090D11]` | Page background, inputs, primary-button text |
| Surface | Graphite | `#121A20` | `bg-[#121A20]` | Cards, panels, modals |
| Surface (raised/active) | Slate | `#172127` | `bg-[#172127]` | Selected tiles |
| Border | Hairline | `#26333C` | `border-[#26333C]` | Every divider, card edge and input edge |
| Text primary | Mineral White | `#EEF3F0` | `text-[#EEF3F0]` | Headings, body on dark |
| Text secondary | Steel | `#8C9A9F` | `text-[#8C9A9F]` | Supporting copy, labels, inactive nav |
| Accent | Mineral Teal | `#5DDEC4` | `bg-/text-/border-[#5DDEC4]` | Primary CTA, active state, focus ring, eyebrow |
| Accent hover | Teal Pressed | `#4BCBB1` | `hover:bg-[#4bcbb1]` | Primary button hover only |
| Accent light | Teal Glow | `#A4F2DC` | `text-[#A4F2DC]` | Glyphs and highlights on teal-tinted fills |
| Accent deep | Deep Teal | `#176B5E` | `bg-[#176B5E]` | Tinted fills, map plates |

### 2.2 Signal colors

| Role | Hex | Use for | Never use for |
| --- | --- | --- | --- |
| Amber (attention) | `#E8B66E` | Gaps, friction, warnings, "problem" eyebrows, secondary emphasis | Primary CTAs, success |
| Coral (error) | `#C86664` | Form errors, failed/blocked states, gap chips (`bg-[#C86664]/20` + `border-[#C86664]`) | Decoration |
| Emerald (success, reserved) | `#218168` | Declared in tokens and currently unused. Reserve it for confirmed outcomes if teal becomes overloaded | — |

### 2.3 Translucency

Content floats over the animated workstream map, so text blocks sit on semi-opaque panels to stay readable:

| Use | Class |
| --- | --- |
| Text block over the map | `bg-[#090D11]/88` (mobile) → `lg:bg-transparent` |
| Large panel | `bg-[#090D11]/92` |
| Card over map | `bg-[#121A20]/90`–`/94` |
| Nav bar | `bg-[#090D11]/95` |
| Muted body copy | `text-[#EEF3F0]/85` |
| Section divider | `border-[#26333C]/70`–`/80` |
| Soft accent border | `border-[#5DDEC4]/50`–`/60` |

### 2.4 Color ratio

As a rule of thumb: about **85% obsidian and graphite, 10% steel and white text, 4% teal, and at most 1% amber or coral.** If a screen shows more teal than that, it has too many "primary" things.

---

## 3. Typography

### 3.1 Families

```css
@import url("https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap");
```

| Role | Family | Weights | Applied via |
| --- | --- | --- | --- |
| Display | **Archivo** | 600 / 700 / **800** | `h1`, `h2`, `h3`, `.font-display`. Tracking `-0.03em` by default |
| Body / UI | **Plus Jakarta Sans** | 400 / 500 / 600 / 700 | Inherited from `.ekarvo-site` |
| System / data | **IBM Plex Mono** | 400 / 500 / 600 | `code`, `pre`, `.font-mono`. Always tabular numerals |

All three are scoped under `.ekarvo-site`. Any element outside that tree, including Radix portals such as dialogs, must add the `ekarvo-site` class itself.

### 3.2 Type scale

| Token | Classes | Use |
| --- | --- | --- |
| **Hero** | `font-display text-5xl sm:text-7xl lg:text-[88px] font-extrabold tracking-[-0.04em] leading-[0.95] uppercase` | One per page |
| **Section H2** | `font-display text-4xl sm:text-6xl lg:text-[68px] font-extrabold tracking-[-0.035em] leading-[0.96] uppercase` | Section headings |
| **Statement** | `font-display text-3xl sm:text-4xl font-extrabold tracking-tight` | Pull-quotes and punchlines inside panels |
| **Panel H3** | `text-lg font-bold` (Archivo via `h3`) | Card and panel titles |
| **Lead** | `text-lg sm:text-xl leading-relaxed text-[#EEF3F0]/85 max-w-xl` | Paragraph right under a heading |
| **Body** | `text-base` or `text-sm leading-relaxed text-[#8C9A9F]` | Supporting copy |
| **Small** | `text-xs leading-relaxed text-[#8C9A9F]` | Card descriptions (the most-used size) |
| **Eyebrow** | `font-mono text-xs tracking-[0.18em] uppercase text-[#5DDEC4]` (or amber) | Label above every heading |
| **Data label** | `font-mono text-[11px]` or `text-[10px] uppercase` | Annotations, metrics, metadata |
| **Wordmark** | `font-display text-base font-extrabold tracking-[0.2em]` | "EKARVO" logotype |

### 3.3 Headline rules

- Write display headlines in **UPPERCASE**, as **two short lines** split with `<br />`.
- Color the second line teal to show the turn: `SEE THE WORK. <span class="text-[#5DDEC4]">MOVE THE WORK.</span>`
- End each line with a period. Headlines are statements, not questions.
- Keep leading tight (`0.92`–`1.02`) and tracking negative (`-0.03em` to `-0.04em`).
- Mono eyebrows track wide (`0.18em`–`0.22em`). Display text tracks tight. Don't mix the two.

---

## 4. Layout and spacing

| Property | Value |
| --- | --- |
| Max content width | `max-w-[1440px] mx-auto` |
| Page gutters | `px-6 lg:px-12` (nav: `px-4 sm:px-6 lg:px-12`) |
| Section padding | `py-28`; hero is `min-h-[100dvh] pt-24 pb-16` |
| Section separator | `border-t border-[#26333C]/70` |
| Grid | 12 columns (`lg:grid-cols-12`). Text takes 6–7 columns and media or interaction the rest |
| Gaps | `gap-12` between columns, `gap-3`–`gap-6` inside lists, `space-y-5`/`space-y-6` in text stacks |
| Section scroll offset | `scroll-margin-top: 4rem` (clears the 64px nav) |

Each section gets an `id` (`scene-01`, `scene-02`, …) and an `aria-label`.

---

## 5. Shape, borders and elevation

- **Radius:** use `rounded-lg` everywhere. Use `rounded-full` only for pills such as the motion control. Never use large radii.
- **Borders:** 1px `#26333C`. Selected and hover states swap the border color (to teal or amber) instead of adding shadows.
- **Elevation:** flat. Hierarchy comes from surface color (`#090D11` → `#121A20` → `#172127`) and borders. Shadows appear only on the mobile nav drop-down (`shadow-xl`).
- **Rules and connectors:** solid teal `h-0.5` for live paths, and dashed `border-dashed border-[#8C9A9F]/50` for broken or pending paths.

---

## 6. Components

Copy these as starting points.

### 6.1 Buttons

```tsx
{/* Primary — one per view */}
<button className="inline-flex items-center gap-3 px-7 py-4 text-sm font-semibold text-[#090D11] bg-[#5DDEC4] rounded-lg hover:bg-[#4bcbb1] transition-transform duration-150 active:scale-95 whitespace-nowrap cursor-pointer">
  <span>Explore the Platform</span>
  <ArrowRight className="w-4 h-4" />
</button>

{/* Secondary */}
<button className="inline-flex items-center gap-2.5 px-7 py-4 text-sm font-medium text-[#EEF3F0] bg-[#121A20]/90 border border-[#26333C] rounded-lg hover:border-[#5DDEC4] transition-colors whitespace-nowrap cursor-pointer">
  <span>Talk to EKARVO</span>
  <ArrowUpRight className="w-4 h-4 text-[#5DDEC4]" />
</button>

{/* Compact / nav CTA */}
<button className="min-h-11 px-4 text-xs font-semibold tracking-wide bg-[#5DDEC4] text-[#090D11] rounded-lg hover:bg-[#4bcbb1] whitespace-nowrap cursor-pointer">
  Talk to EKARVO
</button>

{/* Attention / simulation toggle (amber outline) */}
<button className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#E8B66E] text-[#E8B66E] hover:bg-[#E8B66E] hover:text-[#090D11] transition-colors cursor-pointer">
  Simulate Enterprise Peak Volume
</button>

{/* Icon button */}
<button className="flex size-11 items-center justify-center rounded-lg border border-[#26333C] text-[#8C9A9F] hover:text-[#EEF3F0] cursor-pointer">
  <X className="w-4 h-4" />
</button>
```

Icons come from `lucide-react` at 14–20px. Directional arrows (`ArrowRight`, `ArrowUpRight`) go on CTAs, and the secondary button's icon is teal.

### 6.2 Cards and panels

```tsx
{/* Statement card */}
<div className="p-4 rounded-lg bg-[#121A20]/90 border border-[#26333C] text-base font-medium text-[#EEF3F0]">
  Demand arrives across portals, queues, and service channels.
</div>

{/* Large interactive panel */}
<div className="p-6 sm:p-10 rounded-lg bg-[#090D11]/92 border border-[#26333C] space-y-8">
  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#26333C] pb-5">
    <div>
      <p className="font-mono text-xs uppercase tracking-wider text-[#5DDEC4]">Panel Eyebrow</p>
      <h3 className="text-lg font-bold text-[#EEF3F0] mt-1">Panel title in sentence case</h3>
    </div>
    {/* action */}
  </div>
  {/* body */}
</div>

{/* Selectable tile */}
<button className={`p-4 rounded-lg border text-left transition-colors min-h-[108px] ${
  active
    ? 'bg-[#172127] border-[#5DDEC4] text-[#EEF3F0]'          // amber border in "problem" sections
    : 'bg-[#121A20]/80 border-[#26333C] text-[#8C9A9F] hover:text-[#EEF3F0]'
}`}>
  <div className="text-sm font-bold tracking-tight">Tile name</div>
  <div className="font-mono text-[11px] text-[#5DDEC4] mt-2">annotation</div>
</button>
```

### 6.3 Chips and status

```tsx
{/* Error / gap chip */}
<span className="px-3 py-1 rounded-lg bg-[#C86664]/20 border border-[#C86664] font-mono text-xs font-bold text-[#E8B66E]">
  Handoff Gap: 3–5 days
</span>

{/* Inline status line */}
<div className="flex items-center gap-2 text-[#5DDEC4] font-mono text-xs font-semibold">
  <CheckCircle2 className="w-5 h-5" /> Request recorded
</div>
```

### 6.4 Forms

```tsx
<label className="block text-xs font-mono text-[#8C9A9F] mb-1" htmlFor="email">Work email</label>
<input
  id="email"
  className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#090D11] border border-[#26333C] text-[#EEF3F0] focus:border-[#5DDEC4] focus:outline-none"
  aria-invalid={!!error}
  aria-describedby="email-error"
/>
{error && <p id="email-error" className="text-xs text-[#C86664] mt-1">{error}</p>}
```

Use mono labels, an obsidian field with a hairline border that turns teal on focus, and a coral error line underneath.

### 6.5 Modal

Use the shadcn `Dialog`, and add `ekarvo-site` to the content so fonts apply inside the portal:

```tsx
<DialogContent className="ekarvo-site block max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg bg-[#121A20] border-[#26333C] text-[#EEF3F0] p-6 sm:p-8 sm:max-w-2xl">
  <div className="flex items-start justify-between gap-4 border-b border-[#26333C] pb-4">
    <div>
      <p className="font-mono text-xs uppercase text-[#5DDEC4]">Eyebrow</p>
      <DialogTitle className="text-2xl font-bold mt-1">Modal title</DialogTitle>
    </div>
    {/* icon close button (6.1) */}
  </div>
  {/* body */}
</DialogContent>
```

### 6.6 Top navigation

The nav is fixed, `h-16`, `bg-[#090D11]/95`, with a `border-b border-[#26333C]`. It has the wordmark on the left, steel `text-sm font-medium` links that turn white on hover in the center (`xl` and up), and a compact CTA plus a hamburger on the right. Every link has `min-h-11`.

---

## 7. Page template

Use this skeleton for a new EKARVO page:

```tsx
// app/<route>/layout.tsx
import "@/app/landing/ekarvo.css";

// page component
export function EkarvoPage() {
  return (
    <div className="ekarvo-site relative isolate min-h-dvh bg-[#090D11] text-[#EEF3F0]">
      <TopNav /* … */ />

      <main id="main-content" tabIndex={-1} className="relative z-10">
        {/* HERO */}
        <section id="scene-01" aria-label="Hero" className="relative min-h-[100dvh] pt-24 pb-16 px-6 lg:px-12 flex flex-col justify-between">
          <div className="max-w-[1440px] mx-auto w-full my-auto py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <p className="font-mono text-xs tracking-[0.18em] uppercase text-[#5DDEC4] font-medium">Eyebrow Label</p>
              <h1 className="font-display text-5xl sm:text-7xl lg:text-[88px] font-extrabold tracking-[-0.04em] leading-[0.95]">
                FIRST STATEMENT.<br />
                <span className="text-[#5DDEC4]">SECOND STATEMENT.</span>
              </h1>
              <p className="text-lg sm:text-xl text-[#EEF3F0]/85 max-w-xl leading-relaxed">One or two sentences of lead copy.</p>
              <div className="flex flex-wrap items-center gap-4 pt-2">{/* primary + secondary buttons */}</div>
            </div>
            <div className="lg:col-span-5 hidden lg:block" />{/* visual */}
          </div>

          {/* 4-up summary strip */}
          <div className="max-w-[1440px] mx-auto w-full pt-8 border-t border-[#26333C]/80 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <div className="text-sm font-bold">Pillar</div>
              <p className="text-xs text-[#8C9A9F] leading-relaxed">Short supporting line.</p>
            </div>
          </div>
        </section>

        {/* STANDARD SECTION */}
        <section id="scene-02" aria-label="Section name" className="relative py-28 px-6 lg:px-12 border-t border-[#26333C]/70">
          <div className="max-w-[1440px] mx-auto space-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-6 space-y-5">
                <p className="font-mono text-xs tracking-[0.18em] uppercase text-[#E8B66E]">Problem Eyebrow</p>
                <h2 className="font-display text-4xl sm:text-6xl lg:text-[68px] font-extrabold tracking-[-0.035em] leading-[0.96]">
                  HEADLINE LINE ONE<br />LINE TWO.
                </h2>
                <p className="text-lg text-[#8C9A9F] max-w-lg leading-relaxed">Supporting sentence.</p>
              </div>
              <div className="lg:col-span-6 grid gap-3">{/* statement cards (6.2) */}</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
```

Sequence the story as **problem (amber eyebrow) → product (teal eyebrow) → proof → CTA**.

---

## 8. Motion and interaction

- **Durations:** keep them short. Use `transition-colors` for hover and `transition-transform duration-150 active:scale-95` for the primary press.
- **Hover:** change color or border only. Nothing lifts, scales or adds a shadow on hover.
- **Ambient motion:** the background workstream map animates with scroll, so expose a pause control (`.ekarvo-motion-control`, a fixed pill in the bottom right, 44px minimum) and store the choice in `sessionStorage`.
- **Reduced motion:** `prefers-reduced-motion: reduce` turns off all animations and transitions under `.ekarvo-site`, and scroll-into-view uses `behavior: 'instant'`.
- **Sound:** optional UI sounds (`soundEngine.play(...)`) go only on deliberate clicks, never on hover or load.

---

## 9. Accessibility checklist

- [ ] Focus ring: `outline: 2px solid #5DDEC4; outline-offset: 4px` on `:focus-visible` (global under `.ekarvo-site`)
- [ ] Interactive targets are at least 44×44px (`min-h-11`, `size-11`)
- [ ] `color-scheme: dark` is set, and the page clips horizontal overflow (`overflow-x: clip`)
- [ ] Steel (`#8C9A9F`) on obsidian passes AA for body text. Don't use anything dimmer for copy
- [ ] Icons are `aria-hidden`, and icon-only buttons have an `aria-label`
- [ ] Menus close on `Escape` and return focus to their trigger
- [ ] Form errors are linked with `aria-describedby`
- [ ] The text panel stays readable over the animated background on mobile (`bg-[#090D11]/88`). The map drops to `opacity: 0.2` below 768px

---

## 10. Voice (copy that pairs with the visuals)

- Headlines are short, declarative and uppercase: *"WORK DOESN'T LIVE IN ONE SYSTEM."*
- Eyebrows are 2–4 word Title Case category labels, rendered uppercase in mono.
- Body copy is concrete and operational: queues, capacity, systems of record, audit evidence. Avoid hype adjectives.
- The four verbs **Understand → Decide → Execute → Verify** are the backbone of the narrative. Reuse them rather than inventing new framings.
