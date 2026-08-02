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
- `SubmitButton` and `ActionStatus` — pending, success, and error feedback for server-action forms
- `SiteHeader`, `SiteFooter`, and mobile menu — consistent public navigation
- `MemberShell` and `MemberNavigation` — protected personal context with exact active states and 48px mobile targets
- `ModuleCard`, `ModuleOverview`, and `ParticipationLoop` — connected product storytelling
- `LegalPage` — readable long-form document structure and mandatory draft notice
- `PulseCheckInForm` and `PulseHistoryList` — accessible grouped signals, privacy context, and readable private activity cards
- `CreateSessionForm` — grouped host content, timing, capacity, Pulse-fit, and interest controls with draft context
- `SessionCard` and `SessionRegistrationForm` — reusable discovery detail, textual capacity state, match reasons, and pending/error feedback
- `CreateCircleForm` — grouped community identity, visibility, membership-policy, Pulse-fit, rules, and interest controls with draft context
- `CircleCard` and `CircleMembershipForm` — reusable community discovery, textual visibility/membership state, match reasons, and accessible join/leave feedback
- `CreateOpportunityForm` and `OpportunityResponseForm` — grouped scope, deadline, taxonomy, Pulse-fit, response, and privacy controls with explicit Phase 6 boundaries
- `OpportunityCard` — reusable Commons discovery with textual kind, openings, saved/response state, required skills, deadline, and Pulse reasons

## Accessibility decisions

- A keyboard-visible skip link precedes navigation.
- All interactive elements use visible red focus rings and at least 44–48px mobile targets.
- Mobile navigation exposes `aria-expanded`, `aria-controls`, labeled navigation landmarks, active-page state, and Escape-to-close behavior.
- Form fields have explicit labels; visibility controls state their action.
- Server validation is connected to `aria-invalid` and described field errors; pending submissions disable only their submit control and retain a clear label.
- Color is paired with icons, copy, labels, or borders.
- Motion respects `prefers-reduced-motion`.
- Layouts avoid fixed content widths and horizontal overflow.
- Legal documents use semantic headings, lists, readable line lengths, and mobile-first spacing.
- Pulse controls use semantic fieldsets and legends, pair selected state with native controls and borders, and avoid free-text health inputs.
- Member navigation uses a two-column mobile grid instead of a narrow horizontal scroller, preserving large targets without page overflow.
- Session cards pair capacity and lifecycle colors with explicit text, preserve logical definition lists, and expose Pulse reasons as a labeled list.
- Hosting controls use semantic fieldsets, explicit labels, native date/time and select inputs, and minimum 48px action targets. Destructive cancellation is named in text and visually distinct.
- Circle controls use semantic fieldsets, explicit public/private and join-policy labels, native selects, minimum 48px targets, and textual lifecycle/role state. Private visibility and destructive removal never rely on rose/red color alone.
- Commons controls use semantic fieldsets, native deadline/timezone controls, explicit required-skill and optional-interest groups, minimum 48px targets, and textual lifecycle/response state. Amber accents never carry selection, privacy, capacity, or completion meaning alone.

## Module personalities

The shell stays black, white, and red. Module pages use restrained secondary accents only within their cards and hero surfaces: red for Pulse, rose for Circles, amber for Creator Commons, violet for Fifth Realm, and emerald for Passport. Copy and iconography preserve meaning without requiring color perception.
