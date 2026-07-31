# Feature boundaries

Each product owns its UI, validation, actions, and domain-specific queries inside its folder. Features may use shared identifiers and services, but must not import another feature's private internals.

- `pulse/` — check-ins and recommendation inputs
- `circles/` — communities, membership, and roles
- `commons/` — creator opportunities and collaboration workflow
- `realm/` — campaigns, applications, and game-master tools
- `passport/` — verified participation ledger
- `sessions/` — scheduled experiences shared by every module
- `profiles/` — unified identity, preferences, interests, and skills
- `organizations/` — approved organizational spaces and staff
- `moderation/` — reports, review queue, and audit activity
- `notifications/` — in-app notification delivery

Create these folders when their implementation phase begins; the roadmap prevents empty placeholder code.
