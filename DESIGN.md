---
name: FestoUG
description: Emerald, mint and cream for a clear, personal business portfolio.
---

# FestoUG design system

The portfolio should show the same care as the engineering work it presents.
Use clear language, real project evidence, the original Festo03 photograph,
and a restrained visual hierarchy. Do not fabricate client results or metrics.

## Palette and balance

Cream is the default canvas. Warm card surfaces and dark green-neutral text
carry most of the interface. Emerald identifies primary actions and active
navigation. Mint is supporting emphasis, never a large competing accent.

| Role | Light | Dark |
| --- | --- | --- |
| Canvas | #FFF8E7 | #10221B |
| Surface | #FFFCF4 | #172D24 |
| Main text | #182D25 | #F6F3E8 |
| Supporting text | #4D6057 | #B7C8BA |
| Primary action | #065F46 | #A7F3D0 |
| Text on primary | #FFFDF7 | #10261D |
| Supporting surface | #E3F2E8 | #234332 |
| Text on supporting surface | #164D38 | #C7EED9 |
| Structural border | #D6DFD2 | #395144 |
| Input boundary | #819184 | #6D8977 |

Use semantic Tailwind tokens (`background`, `foreground`, `card`, `primary`,
`primary-foreground`, `secondary`, `muted-foreground`, `border`, `input`).
The old portfolio color names remain compatibility aliases in globals.css.
They must not introduce purple, amber, or a second decorative accent.
Real client logos, project screenshots, language colors and meaningful error
or status colors retain their original purpose.

## Typography and geometry

- Geist for headings, body, navigation and controls. Geist Mono for code.
- Body copy starts at 17px on phones, uses 16px from 640px through
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
  gradient underlines, giant background numbers and repeated floating panels.
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
motion. Carousels must honor reduced-motion preferences and support pausing.
Never hide content behind an entrance animation when reduced motion is active.

Verify light and dark color pairs separately. Normal text should meet WCAG AA
contrast (4.5:1), and interaction meaning must not depend on color alone.
Contrast checks for individual pairs do not establish full accessibility.

## Delivery checks

Check desktop, tablet, small phone and landscape layouts; navigation, theme
persistence, keyboard controls, forms, project links and empty states. Run
lint, typecheck and production build. Verify the actual deployed public site
before claiming a visual update is live.
