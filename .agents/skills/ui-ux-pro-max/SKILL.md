---
name: ui-ux-pro-max
description: UI/UX design intelligence with 67 styles, 161 color palettes, 57 font pairings, 99 UX guidelines, and 25 chart types across 16 tech stacks (React, Next.js, Vue, Svelte, Astro, SwiftUI, React Native, Flutter, Nuxt, Tailwind, shadcn/ui, Jetpack Compose, Three.js, Angular, Laravel). Use when the user asks to plan, build, create, design, implement, review, fix, improve, optimize, enhance or refactor any UI/UX — landing pages, dashboards, admin panels, SaaS, e-commerce, portfolios, mobile apps, or components (button, modal, navbar, sidebar, card, table, form, chart). Covers styles like glassmorphism, claymorphism, minimalism, brutalism, neumorphism, bento grid, dark mode, responsive, flat design, plus color palettes, accessibility, animation, layout, typography, font pairing, spacing, hover, shadow, gradient.
---

# UI/UX Pro Max — Design Intelligence

A searchable design database invoked via Python CLI. Files live in the project at `.skills/ui-ux-pro-max/`.

## When to use

Whenever the user requests UI/UX work — new pages, new components, picking styles/colors/fonts, reviewing existing UI, fixing visual bugs, improving mobile/dark-mode/a11y, or implementing animations/charts.

## Workflow

### Step 1 — Generate a design system (always start here)

```bash
python3 .skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system -p "Project Name"
```

Returns: pattern, style, colors, typography, effects, and anti-patterns. Add `--format markdown` for docs output. Add `--persist [--page "<page-name>"]` to write `design-system/MASTER.md` and per-page overrides for hierarchical retrieval across sessions.

### Step 2 — Deep-dive any dimension

```bash
python3 .skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

| Need | Domain |
|------|--------|
| Product-type patterns | `product` |
| Styles / effects | `style` |
| Color palettes | `color` |
| Font pairings (Google Fonts) | `typography` |
| Landing structure / CTA | `landing` |
| Chart types | `chart` |
| UX best practices / anti-patterns | `ux` |
| React performance | `react` |
| Mobile/native a11y & touch | `web` |
| AI prompt / CSS keywords | `prompt` |

### Step 3 — Stack-specific guidelines

```bash
python3 .skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack <stack>
```

Stacks: `react`, `nextjs`, `vue`, `svelte`, `astro`, `swiftui`, `react-native`, `flutter`, `nuxtjs`, `nuxt-ui`, `html-tailwind`, `shadcn`, `jetpack-compose`, `threejs`, `angular`, `laravel`.

## Priority rules (review checklist)

1. **Accessibility (CRITICAL)** — contrast 4.5:1, alt text, keyboard nav, aria-labels. Never remove focus rings; never icon-only buttons without labels.
2. **Touch & Interaction (CRITICAL)** — min 44×44px, ≥8px spacing, visible loading feedback. No hover-only affordances; no 0ms state changes.
3. **Performance (HIGH)** — WebP/AVIF, lazy-load, reserve space (CLS < 0.1). Avoid layout thrash.
4. **Style selection (HIGH)** — match product type, stay consistent, SVG icons (no emoji).
5. **Layout & responsive (HIGH)** — mobile-first, viewport meta, no horizontal scroll, no fixed-px container widths, never disable zoom.
6. **Typography & color (MEDIUM)** — base 16px, line-height 1.5, semantic color tokens (no raw hex in components).
7. **Animation (MEDIUM)** — 150–300ms, motion conveys meaning, honor `prefers-reduced-motion`, animate transform/opacity (not width/height).
8. **Forms & feedback (MEDIUM)** — visible labels (not placeholder-only), errors near the field, helper text, progressive disclosure.
9. **Navigation (HIGH)** — predictable back, bottom nav ≤5 items, deep linking.
10. **Charts (LOW)** — legends, tooltips, never rely on color alone.

## Pre-delivery checklist

- Run `--domain ux "animation accessibility z-index loading"` as a final validation pass.
- Test 375px width and landscape.
- Verify reduced-motion and largest Dynamic Type.
- Check dark-mode contrast independently.
- Confirm touch targets ≥44pt and content clears safe areas.

## Tips

- Use multi-dimensional keywords: `"entertainment social vibrant content-dense"`, not `"app"`.
- If stuck on style/color, re-run `--design-system` with different keywords.
- Synthesize design-system output + deep-dive results before implementing.
