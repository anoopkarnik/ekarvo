# EKARVO Design System

EKARVO's visual language comes from the marketing site (the Astro project in `Website/`, outside this repo). This app reproduces it: `/landing` is the reference implementation, and the legal, contact and auth pages show the inner-page pattern. Use this document when you build or restyle any EKARVO surface.

**Sources of truth in this repo:**

| What | Where |
| --- | --- |
| Theme tokens (shadcn variables, light and dark) | [`packages/ui/src/styles/shadcn-ekarvo.css`](../packages/ui/src/styles/shadcn-ekarvo.css) |
| Site frame: header, footer, buttons, page hero, reading column, cards | [`apps/web/app/landing/ekarvo.css`](../apps/web/app/landing/ekarvo.css) |
| Landing film styles | [`apps/web/app/landing/cinematic.css`](../apps/web/app/landing/cinematic.css) |
| Shared header, footer and `Icon` | [`apps/web/components/landing/ekarvo/SiteChrome.tsx`](../apps/web/components/landing/ekarvo/SiteChrome.tsx) |
| Landing story, copy and Three.js world | [`apps/web/components/landing/ekarvo/`](../apps/web/components/landing/ekarvo/) (`CinematicLanding.tsx`, `film/`) |
| Inner-page layout | [`apps/web/components/landing/LegalPageLayout.tsx`](../apps/web/components/landing/LegalPageLayout.tsx) |
| Fonts | [`packages/ui/src/typography/font.tsx`](../packages/ui/src/typography/font.tsx) (`inter`, `ibmPlexMono`) |

The theme applies when the site setting `branding.theme` is `ekarvo` (it puts `theme-ekarvo` on `<html>`). Pages can also opt in on a wrapper, as described in section 2.

---

## 1. Principles

1. **One signal.** Action blue `#315CF5` is the only bright color. It marks the primary action, the active state and the single moving signal in the film. Everything else is ink, paper or graphite.
2. **Editorial, not dashboard-loud.** Headlines are large, medium-weight sentences with tight tracking. Labels are small, uppercase and widely tracked. Body copy is calm and muted.
3. **Flat and machined.** Hierarchy comes from surface color, hairline rules and whitespace. There are no drop shadows and no gradients beyond very subtle panel sheens.
4. **Honest claims.** Copy says what Ekarvo *is being designed to* do. External research is always labelled as market context, never as Ekarvo performance data.
5. **Accessible by default.** Hit targets are at least 44px, focus rings are visible, reduced motion gets a static story, and nothing relies on color alone.

---

## 2. Two surfaces: Film and Paper

| Surface | Look | Used for | How to opt in |
| --- | --- | --- | --- |
| **Film** (dark) | Near-black `#0B0F14`, ink `#F7F9FF`, graphite cards | Landing opening, auth pages, dark mode of the app | Wrapper with `ek-site theme-ekarvo dark` |
| **Paper** (light) | Cool paper `#EEF2F6`, ink `#111318`, white cards | Legal and contact pages, light mode of the app | Wrapper with `ek-site theme-ekarvo` (no `dark`) |

A wrapper that repeats `theme-ekarvo` re-declares the tokens for its subtree, so a Paper page stays light even when the app runs in dark mode. Tailwind's `dark:` variant still matches inside it because it checks for any `.dark` ancestor. **Don't use `dark:` utilities on pages that force a surface.** Style them with the tokens instead.

The landing is the one exception. Its colors follow scroll: the film starts on Film and fades to a warm daylight (`#E8E7E3`) in the final chapter. `cinematic.css` maps the theme tokens onto the film's `--film-surface`, `--film-ink` and `--film-muted`, so the shared header recolors with it.

---

## 3. Color

### 3.1 Theme tokens

Use the shadcn variables (`bg-background`, `text-muted-foreground`, `border-border`, `var(--primary)` and so on). Don't use raw hex values in components.

| Token | Paper (light) | Film (dark) | Use |
| --- | --- | --- | --- |
| `--background` | `#EEF2F6` paper | `#0B0F14` film | Page canvas |
| `--foreground` | `#111318` ink | `#F7F9FF` film ink | Headings, primary text |
| `--card` / `--popover` | `#FFFFFF` | `#111923` graphite | Cards, panels, menus |
| `--primary` | `#315CF5` blue | `#315CF5` blue | Primary action, active state, focus ring on paper |
| `--primary-foreground` | `#FFFFFF` | `#FFFFFF` | Text on blue |
| `--secondary` / `--muted` | `#F5F7FA` | `#1A2432` | Quiet fills, secondary buttons |
| `--muted-foreground` | `#59616D` slate | `#BCC6D6` | Supporting copy, labels, inactive nav |
| `--accent` | `#EEF2FF` blue tint | `#16213A` blue-tinted graphite | Hover and selected fills |
| `--destructive` | `#C43D4B` | `#E26D78` | Errors, destructive actions |
| `--border` | `#D8DEE8` | `#293342` | Dividers, card edges |
| `--input` | `#7B8493` | `#566273` | Form-control borders (3:1 against the canvas) |
| `--ring` | `#315CF5` | `#B6CAFA` ice | Focus outline |
| `--radius` | `0.75rem` | `0.75rem` | Card and control radius |

Charts use blue `#315CF5` / `#5478FF`, green `#16856A` / `#3FBF97`, amber `#B7791F` / `#E0A84A`, red, and mineral `#7085A0` / `#91A1B6` (light / dark), in that order.

### 3.2 Site constants

`ekarvo.css` defines a few brand values on `.ek-site` that stay the same on both surfaces:

| Variable | Value | Use |
| --- | --- | --- |
| `--ek-blue` | `#315CF5` | Pill buttons, active index item, list markers, link underlines |
| `--ek-blue-700` / `--ek-blue-800` | `#2448CC` / `#1C369E` | Button hover / pressed |
| `--ek-rule` | `#BDC2C7` (paper), `#293342` (film) | Decorative panel borders (not form controls) |

On the film, the hover blue for text is `#5478FF` (`#AEC0FF` for plain links), and the closing footer is fixed dark: `#0B0F14` background, `#C5D0DC` links, `#263243` rules.

### 3.3 Signal colors

| Role | Paper | Film | Use for | Never use for |
| --- | --- | --- | --- | --- |
| Success | `#16856A` | `#3FBF97` | Verified, completed | Decoration |
| Warning | `#B7791F` | `#E0A84A` | Attention, pending decision | Primary actions |
| Error | `#C43D4B` | `#E26D78` | Failures, invalid input | Emphasis |

### 3.4 Ratio

Roughly **90% canvas and card, 8% ink and muted text, 2% blue.** If a screen shows several blue things, only one of them is really primary. Make the rest secondary or plain links.

---

## 4. Typography

### 4.1 Families

| Role | Family | Applied via |
| --- | --- | --- |
| Everything: display, body, UI | **Inter** (variable, self-hosted as `--font-inter`) | `--font-sans` and `--font-display` under `.theme-ekarvo`; `.ek-site` sets it directly |
| Data only | **IBM Plex Mono** | `code`, `pre`, `.font-mono`, with tabular numerals |

`.ek-site` resets headings to Inter weight 500, so older `font-display` or `font-bold` utilities on headings inside the site frame render in the site style.

### 4.2 Type scale

| Style | Size | Weight / tracking / leading | Where |
| --- | --- | --- | --- |
| **Cinematic display** | `clamp(4.5rem, 7.8vw, 8rem)` (opening), `clamp(3.5rem, 5.7vw, 6.5rem)` (chapters) | 540 / `-0.065em` / 1.06 | Landing chapters (`.ek-chapter h1, h2`) |
| **Editorial title** | `clamp(2.5rem, 5vw, 4.5rem)`, `clamp(2.5rem, 10.5vw, 4rem)` on phones | 500 / `-0.06em` / 1.12 | `.page-hero h1` on inner pages |
| **Statement** | `text-5xl md:text-6xl` | 500 / `-0.06em` / 1.04 | Auth quote panel, pull quotes |
| **Section heading** | `2rem` | 500 / `-0.035em` / 1.2 | `.reading h2` |
| **Subheading** | `1.25rem` | 500 / `-0.02em` / 1.3 | `.reading h3`, card titles |
| **Lead** | `1.125rem` | 400 / normal / 1.6, muted | `.lead`, max 54ch |
| **Deck** | `clamp(1rem, 1.3vw, 1.2rem)` | 420 / `-0.012em` / 1.55, muted | Text under a landing headline, max 34ch |
| **Body** | `1rem` | 400 / 1.7 in reading, 1.6 elsewhere, muted | Paragraphs and lists |
| **Eyebrow / marker** | `0.75rem` (landing: 11px) | 600, uppercase, `0.12em` (landing: `0.14em`), muted | `.eyebrow`, `.ek-marker`: the label above a title |
| **Footer label** | `0.75rem` | 500, `0.12em` | `.footer-label` |
| **Wordmark** | 20px (18px on phones, 28px in the footer) | 600, `0.18em` | "EKARVO" |
| **Metric** | `clamp(4.5rem, 9vw, 8.5rem)` | 540 / `-0.08em`, blue | Evidence statistics |

### 4.3 Rules

- Headlines are **sentence case** and end with a period: *"Make ambition operational."* Don't use uppercase headlines.
- Keep headlines short: about 15 characters per line on the landing and 20 on inner pages (`max-width: 13ch` to `20ch`, `text-wrap: balance`).
- Only eyebrows, markers and the wordmark are uppercase, and they always track wide. Display text always tracks tight. Don't mix the two.
- Body text never goes dimmer than `--muted-foreground`.

---

## 5. Layout and spacing

| Token (`.ek-site`) | Desktop | ≤ 850px | ≤ 650px |
| --- | --- | --- | --- |
| `--header-height` | `5rem` | `5rem` | `4.5rem` |
| `--page-gutter` | `2rem` | `2rem` | `1.5rem` |
| `--section-space` | `6rem` | `5rem` | `4rem` |
| `--hero-space` | `5rem` | `4rem` | `3rem` |

- **Container:** `.container` is `min(100% - 2 × gutter, 75rem)`, centered.
- **Reading width:** `42rem` (`.reading`). Leads stop at 54ch.
- **Reading with index:** `.reading-layout` is a `15rem` sticky index plus the reading column with a `4rem` gap. The index hides below 1000px.
- **Header:** sticky, in normal flow. Pages subtract `--header-height` instead of padding for a fixed bar. Auth uses `--auth-top-offset: var(--header-height)`.
- **Navigation breakpoint:** desktop nav and actions show above 1100px. Below that, a `<details>` "Menu" drop-down takes over.
- **Rhythm:** 8px steps. Use 4px and 12px only for fine control adjustments.

---

## 6. Shape, borders and elevation

- **Radius:** `0.75rem` for cards and controls, a `999px` pill for primary buttons, and `22px` for the large evidence cards on the landing.
- **Borders:** 1px. Use `--border` for dividers, `--ek-rule` for panels and `--input` for controls. Selected states change the border to blue instead of adding a shadow.
- **Elevation:** none. The only exception is the subtle panel sheen `linear-gradient(130deg, var(--card), var(--secondary))` on contact cards.
- **Accent rule:** a 2px blue line for progress (`.read-progress`, the landing progress bar) and the evidence card's left edge.

---

## 7. Components

### 7.1 Site header and footer

Always use the shared components. Don't rebuild them per page.

```tsx
import { SiteHeader, SiteFooter, Icon } from "@/components/landing/ekarvo/SiteChrome";
```

- **Header:** wordmark on the left, chapter links (Pulse, Drive, Trust, Proof) in the center, and "Log in" plus the "Discuss a workflow" pill on the right. On `/landing` the links scroll the film. Elsewhere they open `/landing#<chapter>`. "Log in" hides on `/sign-in`, and Escape closes the mobile menu.
- **Footer:** signature ("See it through."), Products, Explore, Start a conversation, and Privacy / Terms / Refunds.
- **Chapter links:** the list lives in `headerNav` in `film/content.ts`.

### 7.2 Buttons and links

```tsx
{/* Primary: one per view. A blue pill with white text. */}
<Link className="button" href={CONTACT_HREF}>Discuss a workflow <Icon icon={ArrowUpRight} /></Link>

{/* Secondary: outlined, ink text */}
<button className="button secondary">Download overview <Icon icon={ArrowDown} /></button>

{/* Plain link with arrow (landing): ink text that turns blue on hover */}
<a className="ek-link-plain" href="#fracture">Follow the story <Icon icon={ArrowDown} /></a>
```

- **Icons:** `lucide-react` through `Icon` (stroke 1.75, 16 or 20px, `aria-hidden`). Use `ArrowUpRight` for "go somewhere", `ArrowDown` for "continue or download" and `ArrowRight`/`ArrowLeft` for stepping.
- **Hover:** the pill darkens to `--ek-blue-700` and lifts 2px (only with `hover: hover` and without reduced motion).
- **Inside the app:** shadcn `Button` already renders blue through `--primary`. Keep its default radius in product UI and use the pill on marketing surfaces.

### 7.3 Page hero (inner pages)

```tsx
<section className="page-hero">
  <div className="container">
    <p className="eyebrow">Legal</p>
    <h1>Privacy Policy</h1>
    <p className="lead">Optional one-sentence summary.</p>
    <p className="meta">Last updated 2025-12-01</p>
  </div>
</section>
```

### 7.4 Reading column

Long-form content goes in `<article className="reading">`. It styles `h2`–`h4`, `p`, `ul`/`ol` (blue markers), `strong` and links (ink text with a blue underline, `4px` offset) without utility classes. Headings get `scroll-margin-top` so the sticky header doesn't cover anchor targets. `LegalPageLayout` wraps all of this and adds the sticky "On this page" index (`aria-current` marks the active item in blue).

### 7.5 Cards

```tsx
<article className="contact-card">
  <Icon icon={Mail} />          {/* blue, 24px */}
  <h2>Email Support</h2>        {/* 1.25rem, 500 */}
  <p>Supporting line.</p>       {/* 0.875rem, muted */}
  <a href="mailto:…">value</a>  {/* pinned to the bottom, underlined */}
</article>
```

Inside the product, use shadcn `Card`. It picks up `--card`, `--border` and `--radius` from the theme.

### 7.6 Evidence card (landing reading mode)

A large panel with a blue left rule. It holds an uppercase source line with a round "E" mark, a huge blue metric, one sentence, the study's scope, a source link, and the line **"External research · Market context, not Ekarvo performance data"**. Any third-party figure must carry that label.

### 7.7 Forms

Use the shadcn form components (`Input`, `Label`, `Button`). The theme gives them a `--input` border (3:1 against the canvas), a `--ring` focus outline offset by 4px, and `--destructive` error text. Link errors to their fields with `aria-describedby`.

### 7.8 Chapter rail and transport (landing only)

The rail is a vertical set of 2px ticks on the right; the current chapter's tick is full height and ink-colored. The transport holds "Read the story" (a reading-mode toggle), a scroll hint, and round previous/next buttons. Both live in `CinematicLanding.tsx` and `cinematic.css`.

---

## 8. Page templates

### 8.1 Inner page (Paper)

```tsx
// app/landing/<route>/page.tsx — the landing layout already imports ekarvo.css
"use client";
import { SiteFooter, SiteHeader } from "@/components/landing/ekarvo/SiteChrome";

export default function Page() {
  return (
    <div className="ek-site theme-ekarvo">
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <section className="page-hero">
          <div className="container">
            <p className="eyebrow">Section</p>
            <h1>One short statement.</h1>
            <p className="lead">One or two sentences of context.</p>
          </div>
        </section>
        <div className="container reading-layout">
          <article className="reading">{/* content */}</article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
```

For legal-style documents, use `LegalPageLayout` (`title`, `eyebrow`, `lastUpdated`, `tableOfContents`). Outside `app/landing/`, import `@/app/landing/ekarvo.css` in the route's layout, as the `(auth)` layout does.

### 8.2 Dark page (Film)

Same skeleton with `ek-site theme-ekarvo dark`. The `(auth)` layout is the example: the header and the shared `AuthLayout` sit on the film surface, and the quote panel uses graphite.

### 8.3 Product UI

Authenticated pages don't use `.ek-site`. They inherit `theme-ekarvo` from `<html>` (Paper or Film, following the user's appearance setting) and use shadcn components with the tokens in section 3.1.

---

## 9. Motion

- **Scroll is the timeline.** Landing state is a pure function of scroll position (`filmStateAt(progress)`), never elapsed time, so scrubbing backward is exact. The camera follows splines between seven chapter poses.
- **Transitions:** keep them short. Colors and borders use `0.16s`, and the button lift and arrow nudge use `0.2s ease`. Nothing scales, and nothing gains a shadow on hover.
- **Reading progress:** a 2px blue bar, spring-smoothed, on inner pages.
- **Fallbacks:** the film drops to a static poster plus a readable chapter list when the user prefers reduced motion, the viewport is under 580px tall, WebGL fails or the context is lost. "Read the story" switches to the same readable mode on demand.
- **Reduced motion** also turns off the button lift, the progress bar and smooth scrolling.
- **Performance:** device pixel ratio is capped at 1.5 (1 below 650px wide or on devices reporting 4 or fewer cores) and drops to 1 after repeated slow frames. Rendering pauses when the film is off screen or the tab is hidden.

---

## 10. Accessibility

Measured contrast for the main pairs (WCAG AA needs 4.5:1 for body text and 3:1 for large text and control boundaries):

| Pair | Ratio | Result |
| --- | --- | --- |
| Ink `#111318` on paper `#EEF2F6` | 16.5:1 | Pass |
| Slate `#59616D` on paper | 5.6:1 | Pass |
| Blue `#315CF5` on paper (links, labels) | 4.7:1 | Pass |
| White on blue (buttons) | 5.3:1 | Pass |
| Film ink `#F7F9FF` on film `#0B0F14` | 18.3:1 | Pass |
| Muted `#BCC6D6` on film | 11.2:1 | Pass |
| Input border `#7B8493` on paper / `#566273` on film | 3.4:1 / 3.1:1 | Pass (control boundary) |
| **Blue `#315CF5` as text on film** | **3.6:1** | **Large text only.** Don't use blue for small text on dark. Use ink with a blue underline instead. |

Checklist:

- [ ] Focus ring: 2px `--ring` with a 4px offset on `:focus-visible`
- [ ] Targets are at least 44×44px (links and buttons in the frame are 48px tall)
- [ ] `color-scheme` matches the surface (set by the `.ek-site` surface classes)
- [ ] Icons are `aria-hidden`, and icon-only buttons have an `aria-label`
- [ ] Menus close on Escape and return focus to their trigger
- [ ] Every page has one `h1` and a `main#main-content` target for the skip link
- [ ] The film has a text equivalent (`.ek-film-assist`) and announces chapter changes in a polite live region
- [ ] There is no horizontal scroll at 390px

---

## 11. Voice

- **Headlines** are short, declarative sentences with a period: *"Work breaks at the handoff."*, *"Intelligence is not authority."*, *"See it through."*
- **Eyebrows** are two to five words, uppercase, and name the topic or the product: *"EKARVO PULSE · OPERATING INTELLIGENCE"*. Use a middle dot to separate parts.
- **Claims are honest about maturity:** *"Pulse is being designed to…"*. Don't present intended capabilities as shipped.
- **Concrete nouns** (handoffs, owners, approvals, success conditions, evidence) beat adjectives. Avoid hype.
- **The narrative arc** is opening → fracture → Pulse (see) → authority (permission) → Drive (act) → evidence (prove) → outcome. Reuse those beats rather than inventing new framings.
- **CTA wording:** "Discuss a workflow" is the conversion action (the header pill and the final chapter's pill). On the landing opening, "Follow the story" is the pill and "Discuss a workflow" sits beside it as a plain link. Use "Explore …" for onward links.

---

## 12. Checklist for a new EKARVO surface

1. Pick a surface (section 2) and put `ek-site theme-ekarvo` (plus `dark` for Film) on the wrapper.
2. Use `SiteHeader` and `SiteFooter` on public pages. Product pages use the app shell instead.
3. Use tokens and frame classes, not hex values or `dark:` utilities.
4. Use one primary pill per view. Everything else is secondary or a plain link.
5. Write sentence-case headlines with an uppercase eyebrow above them.
6. Check contrast against section 10, test at 390px and 1440px, and test with reduced motion.
