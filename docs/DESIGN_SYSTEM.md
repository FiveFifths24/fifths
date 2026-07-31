# FIFTHS Design System

Phase 1 introduces a compact, code-owned design system for the public platform. It is premium and energetic through hierarchy, contrast, spacing, and editorial typography—not noise, neon, or gaming clichés.

## Tokens

Tokens are defined in `src/app/globals.css` and consumed through Tailwind utilities.

| Category  | Core values                                                  | Purpose                                        |
| --------- | ------------------------------------------------------------ | ---------------------------------------------- |
| Structure | ink `#080808`, panel `#101010`, raised `#171717`             | Stable black foundation and layered surfaces   |
| Content   | paper `#f6f4ef`, white `#ffffff`, muted `#a3a3a3`            | Readable hierarchy without pure-white overload |
| Accent    | deep red `#b91f32`, bright red `#e2344b`, dark red `#6e101d` | Selective action, focus, and identity          |
| Radii     | 10px, 16px, 24px, 32px                                       | Friendly but structured component shape        |
| Shadows   | soft black and restrained red shadow                         | Depth without glow-heavy effects               |
| Spacing   | Tailwind 4px scale; 80–112px section rhythm                  | Generous mobile and desktop breathing room     |

## Typography

- Editorial display headings use the system Georgia serif stack for warmth, distinction, and zero external font dependency.
- Interface and body copy use the system Arial/Helvetica sans-serif stack for clarity.
- Display headings use tight tracking and balanced wrapping; body copy maintains generous line height.

## Reusable components

- `ButtonLink` — primary, secondary, and quiet link actions with 48px minimum height
- `Container` — shared responsive width and page gutters
- `SectionHeading` and `PageHero` — consistent hierarchy
- `Badge`, `StatusMessage`, and `PreviewState` — labels and information that never depend on color alone
- `TextField` and `PasswordField` — labeled, validation-ready controls with accessible descriptions
- `SiteHeader`, `SiteFooter`, and mobile menu — consistent public navigation
- `ModuleCard`, `ModuleOverview`, and `ParticipationLoop` — connected product storytelling
- `LegalPage` — readable long-form document structure and mandatory draft notice

## Accessibility decisions

- A keyboard-visible skip link precedes navigation.
- All interactive elements use visible red focus rings and at least 44–48px mobile targets.
- Mobile navigation exposes `aria-expanded`, `aria-controls`, labeled navigation landmarks, active-page state, and Escape-to-close behavior.
- Form fields have explicit labels; visibility controls state their action.
- Color is paired with icons, copy, labels, or borders.
- Motion respects `prefers-reduced-motion`.
- Layouts avoid fixed content widths and horizontal overflow.
- Legal documents use semantic headings, lists, readable line lengths, and mobile-first spacing.

## Module personalities

The shell stays black, white, and red. Module pages use restrained secondary accents only within their cards and hero surfaces: red for Pulse, rose for Circles, amber for Creator Commons, violet for Fifth Realm, and emerald for Passport. Copy and iconography preserve meaning without requiring color perception.
