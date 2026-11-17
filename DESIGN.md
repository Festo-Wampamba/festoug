---
name: FestoUG
description: Forest Luxe — deep forest, sand and gold on cream for a clear, personal business portfolio.
---

# FestoUG design system

The portfolio should show the same care as the engineering work it presents.
Use clear language, real project evidence, the original Festo03 photograph,
and a restrained visual hierarchy. Do not fabricate client results or metrics.

## Palette and balance

Cream is the default canvas, washed with soft sand, forest and gold gradients.
Frosted card surfaces and deep forest text carry most of the interface. Forest
green identifies primary actions and active navigation. Gold is a decorative
accent only (heading rules, attention markers); use `gold-ink` when gold must
carry text. Sage is supporting emphasis, never a large competing accent.

| Role | Light | Dark |
| --- | --- | --- |
| Canvas | #FBF5E6 | #08251D |
| Surface | #FFFCF4 | #0F3024 |
| Main text | #08251D | #F6F3E8 |
| Supporting text | #465A50 | #B7C8BA |
| Primary action | #123B2C | #A7F3D0 |
| Text on primary | #FFFDF7 | #10261D |
| Supporting surface | #E4ECDD | #234332 |
| Text on supporting surface | #123B2C | #C7EED9 |
| Structural border | #DFD6BF | #395144 |
| Gold accent (decorative) | #B78B45 | #D8B46A |
| Gold ink (text-safe) | #7A5620 | #E3C88F |
| Sand wash | #D8C19A | #B78B45 |
| Input boundary | #819184 | #6D8977 |

Use semantic Tailwind tokens (`background`, `foreground`, `card`, `primary`,
`primary-foreground`, `secondary`, `muted-foreground`, `border`, `input`).
The old portfolio color names remain compatibility aliases in globals.css.
They must not introduce purple or any accent beyond forest and gold.
Real client logos, project screenshots, language colors and meaningful error
or status colors retain their original purpose.

## Typography and geometry

- Geist for headings, body, navigation and controls. Geist Mono for code.
- Body copy uses 16px on phones up to 375px wide and 17px on larger phones,
  uses 16px from 640px through
  laptop and desktop widths, and increases to 21px at 2400px. Page headings
  on medium screens use a restrained 34–40px scale. Viewport width
  approximates extra-wide displays; physical monitor inches cannot be detected.
  Use rem units so labels, controls and
  headings follow the reading scale. Supporting metadata may be smaller.
- Body copy uses comfortable line spacing and a readable line length.
- Use weight, spacing and hierarchy before increasing heading size.
- Let the page grow within a 2000px shell, with fluid outer gutters.
- Stack the profile above content below 1280px, and use a menu below 1536px.
- Choose card columns from the space inside the content panel, not just the
  screen width. Form fields must have room for their complete selected value.
- Public content uses a profile column and a wider work column on desktop;
  stack them on small screens. Use two project columns where space permits.
- Use quiet borders and restrained 8–16px corner radii. Avoid decorative glows,
  gradient underlines and giant background numbers.
- Layered panels are frosted glass: `.glass` (blur on the element) for cards,
  nav and chrome; `.glass-panel` (blur on a ::before layer) for containers that
  hold `position: fixed` children. Never stack glass on glass — cards inside a
  glass panel stay solid. Both fall back to solid under
  `prefers-reduced-transparency`.
- Refreshed components use Radix icons from @radix-ui/react-icons.

## Interaction

- One dominant action per section, with subordinate secondary links.
- Navigation stays labeled and visible on desktop. Smaller screens have a
  labeled, keyboard-operable menu instead of an overloaded bottom dock.
- Touch targets are at least 44px. Focus must remain visible in both themes.
- Account menus close on outside click, Escape and route changes.
- Preserve real auth, purchase, contact and assistant functionality.
- The AI assistant remains honestly labeled as AI; do not imply a human agent
  is online or that a network service is healthy without checking it.

## Motion and accessibility

Use short, purposeful hover and press feedback. Avoid decorative continuous
motion; the one exception is the contact Send button, whose plane loops only
while hovered or sending. Shared curves live in `--ease-out` / `--ease-in-out`. Carousels must honor reduced-motion preferences and support pausing.
Never hide content behind an entrance animation when reduced motion is active.

Verify light and dark color pairs separately. Normal text should meet WCAG AA
contrast (4.5:1), and interaction meaning must not depend on color alone.
Contrast checks for individual pairs do not establish full accessibility.

## Delivery checks

Check desktop, tablet, small phone and landscape layouts; navigation, theme
persistence, keyboard controls, forms, project links and empty states. Run
lint, typecheck and production build. Verify the actual deployed public site
before claiming a visual update is live.
