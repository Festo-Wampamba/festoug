# violetDark Redesign — Build Plan

Make the Flowstep **violetDark** design the site's default look across all `(main)` routes.
Reference demo: `/tmp/festoug-violetdark-demo.html` (open in browser).

## Goal

Re-skin festoug from the current single sky-blue-accent dark theme to violetDark:
zinc-950 canvas, vibrant **purple primary** + **green / violet / amber** secondary accents,
gradient-pill section underlines, conic-gradient avatar ring, ghost numbers, sparkle FAB.

The existing layout already matches Flowstep structure (sidebar + navbar + mobile bottom
pill nav), so this is mostly **recolor + signature treatments**, not a re-architecture.

## What already exists (reuse, don't rebuild)

- `src/app/(main)/layout.tsx` — sidebar + navbar + main shell, max-w-1440, mobile bottom margin
- `src/components/layout/sidebar.tsx` — profile card (= Flowstep profile header)
- `src/components/layout/navbar.tsx` — desktop top nav + mobile bottom pill nav + theme toggle
- `src/app/globals.css` — `--theme-*` CSS var system, light `:root` + dark `.dark` blocks
- Routes already present: about(home) `page.tsx`, `resume`, `portfolio`, `services`, `contact`

## Design tokens (single source of truth)

| Token | Value | Use |
|---|---|---|
| canvas bg | `#09090b` (zinc-950) | page background |
| surface | `#18181b` (zinc-900) | cards |
| border | `#27272a` (zinc-800) | card borders |
| accent / primary | `#7f22fe` | purple — primary CTA, active nav |
| accent-2 | `#10b981` | green |
| accent-3 | `#a855f7` | violet |
| accent-4 | `#f59e0b` | amber |
| text | `#fafafa` / muted `#a1a1aa` (zinc-400) | body / muted |
| font head | Archivo (700/800) | headings, numbers |
| font body | Space Grotesk | body |

Signature: gradient-pill underline `linear-gradient(90deg,#7f22fe,#10b981)` · conic ring
`conic-gradient(from 0deg,#7f22fe,#a855f7,#10b981,#7f22fe)` · ghost numbers (accent @ 20%).

---

## Phases

### Phase 0 — Snapshot / branch
- Branch from current (don't touch `main`).
- Screenshot current `(main)` pages for before/after compare.
- **Verify:** branch created, app still builds (`pnpm build`).

### Phase 1 — Theme tokens in `globals.css`
- Add violetDark accent tokens to the `.dark` block: repoint `--theme-accent` → `#7f22fe`;
  add `--theme-accent-2/-3/-4` (green/violet/amber); repoint surface/bg/border vars to
  zinc-950/900/800.
- Map new color utilities in `@theme inline` (`--color-accent-2`, etc.).
- Add Archivo + Space Grotesk via `next/font` in root layout; map `--font-head`/`--font-body`.
- **Verify:** existing pages render in new palette with zero component edits; light mode
  still valid; contrast ≥ 4.5:1 (zinc-400 on zinc-900 passes).

### Phase 2 — Shared signature components
Create small, reusable pieces (match existing component style in `src/components`):
- `SectionHeading` — title + gradient-pill underline (used on every page).
- `AvatarRing` — conic-gradient ring wrapper (sidebar profile).
- `ServiceCard` / ghost-number card — accent-per-card variant prop.
- `Fab` — sparkle floating button.
- **Verify:** each renders in isolation matching the demo at 375 / 768 / 1440px.

### Phase 3 — Re-skin sidebar + navbar
- Apply violetDark to `sidebar.tsx` (conic avatar ring, purple pill badge, accent contact rows).
- Active nav state → purple pill (desktop top + mobile bottom).
- **Verify:** nav active states correct per route; theme toggle still works; no layout shift.

### Phase 4 — Per-route rollout (one at a time)
Order: About(home) → Resume → Portfolio → Services → Contact.
For each: apply `SectionHeading`, accent-coded cards, demo layout.
- **Verify each route:** matches demo at 375/768/1440px; `cursor-pointer` on clickables;
  hover transitions 150–300ms; focus rings visible; `prefers-reduced-motion` respected.

### Phase 5 — Final QA
- a11y sweep: icon-only buttons have `aria-label`; form inputs have labels; alt text present.
- Lighthouse / build pass; no horizontal scroll on mobile.
- Before/after screenshot review.
- **Verify:** `pnpm build` clean; checklist below all ticked.

---

## Pre-delivery checklist (per page)
- [ ] No emojis as icons (SVG/Lucide only — demo uses placeholder glyphs, swap to Lucide)
- [ ] `cursor-pointer` on all clickable cards
- [ ] Hover = color/border shift, no layout-shifting scale
- [ ] Text contrast ≥ 4.5:1 in both light + dark
- [ ] Focus states visible for keyboard nav
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive at 375 / 768 / 1024 / 1440px

## Open questions / risks
- Demo uses **emoji/glyph placeholders** for icons — real build must use Lucide (already a dep).
- Current accent class is named `orange-yellow-crayola` but value is blue; renaming is optional
  (semantic-only). Keep the name, change the value, to stay surgical.
- Light mode: violetDark is dark-first. Decide whether light mode gets a violet-tinted variant
  or keeps the existing light palette. **Needs your call before Phase 1.**
- Resume skill rings use conic-gradient — verify Safari rendering.
