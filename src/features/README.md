# Feature boundaries

Each product owns its UI, validation, actions, and domain-specific queries inside its folder. Features may use shared identifiers and services, but must not import another feature's private internals.

Implemented shared platform features:

- `auth/` — email/password validation, server actions, action state, and accessible forms
- `onboarding/` — identity setup validation, form UI, and the atomic onboarding RPC boundary
- `pulse/` — Phase 3 private check-in validation, form UI, history presentation, and atomic write boundary
- `sessions/` — Phase 4 discovery cards, Pulse adapter, hosting/registration validation, server actions, and attendance controls
- `circles/` — Phase 5 discovery cards, Pulse adapter, membership validation, local-role actions, and moderation controls
- `creator-commons/` — Phase 6 opportunity cards, Pulse adapter, draft creation, private response, selection, save, and completion controls
- `fifth-realm/` — Phase 7 campaign cards, Pulse adapter, draft creation, private applications, membership, lifecycle, and Session-association controls

Shared deterministic recommendation ranking lives in `src/lib/recommendations` because every product supplies already-eligible candidates to it. Phase 8 normalizes by applicable signals, creates stable cross-module ordering, deduplicates composite identities, softly balances product representation, and returns only nonnumeric fit levels plus reasons. The scorer still does not fetch data, bypass product eligibility, or inspect private participation state.

Planned feature folders:

- `passport/` — verified participation ledger
- `profiles/` — unified identity, preferences, interests, and skills
- `organizations/` — approved organizational spaces and staff
- `moderation/` — reports, review queue, and audit activity
- `notifications/` — in-app notification delivery

Create these folders when their implementation phase begins; the roadmap prevents empty placeholder code.
