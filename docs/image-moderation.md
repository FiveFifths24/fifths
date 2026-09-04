# Image moderation operations

## Protected upload surfaces

The repository currently contains five file-upload surfaces, all in the profile
settings form:

- profile avatar
- featured profile photo 1
- featured profile photo 2
- landscape/cover image
- full-page wallpaper

Creator Commons, Circles, Sessions, Pulse, Fifth Realm, and direct messages do
not currently accept file uploads. Their URL and text fields were not converted
into new upload features. Any future image input must use
`executeModeratedImageUpload` (or a surface-specific wrapper) before its storage
path is written to application data.

Existing approved objects in `profile-media` remain valid. This migration does
not move, expose, or delete them.

## Request flow

1. The profile server action authenticates the Supabase user.
2. The server rejects files over 5 MB before decoding.
3. Sharp decodes the bytes, verifies JPG/PNG/WebP, limits dimensions and total
   decoded pixels, applies orientation, removes metadata, and re-encodes WebP.
4. An authenticated database function claims rate-limit slots before decoding;
   valid and invalid selections both count toward 12 attempts per hour. A
   second authenticated function creates the owner-bound audit row.
5. A service-role client uploads the sanitized object to the private
   `media-quarantine` bucket. Browser clients have no Storage policy for this
   bucket.
6. The configured server-only provider returns the normalized decision
   `approved`, `review`, or `rejected`.
7. Approved bytes are uploaded under a new random name in `profile-media` and
   only then can their path replace the current profile field.
8. Review results stay in quarantine and never replace the current approved
   image. Rejected results are audited before the quarantine object is deleted.
9. Provider errors are treated as review and remain private. Missing production
   configuration throws before publication.

Animated GIF landscape uploads are intentionally disabled. A first-frame-only
scan is bypassable; animation can be restored only after a provider and local
decoder inspect every frame within strict frame/pixel limits.

The migration removes authenticated insert/update/delete policies from
`profile-media`; direct browser Storage calls can no longer bypass moderation.
A profile trigger also rejects changed media paths unless they belong to an
approved moderation record for that profile. Existing unchanged profile paths
remain usable for backward compatibility.

## Environment

Required in every deployed environment that permits image uploads:

```text
SUPABASE_SERVICE_ROLE_KEY=...
IMAGE_MODERATION_PROVIDER=azure
AZURE_CONTENT_SAFETY_ENDPOINT=https://<resource>.cognitiveservices.azure.com
AZURE_CONTENT_SAFETY_KEY=...
CRON_SECRET=<at-least-32-random-characters>
```

Never prefix the service-role or provider keys with `NEXT_PUBLIC_`.

For local UI development only, `IMAGE_MODERATION_PROVIDER=development-allow`
uses an explicit allow adapter. The adapter refuses to start when
`NODE_ENV=production`.

## Azure Content Safety setup

1. Create an Azure AI Content Safety resource.
2. Copy its endpoint and subscription key into the two Azure variables above.
3. Keep `IMAGE_MODERATION_PROVIDER=azure`.
4. Deploy, then verify an ordinary image, a review-bound test image, and a block
   test image using provider-approved test fixtures rather than prohibited real
   content.

The adapter sends a metadata-free, maximum-2048-pixel derivative and requests
Hate, SelfHarm, Sexual, and Violence analysis. Decisions and provider scores
remain server-side and are never returned to members.

Azure's image response contains a broad category and severity, but it does not
return dependable scene context such as real versus fictional, historical use
versus propaganda, or educational use versus exploitation. SIGNAL therefore
uses a context-preserving policy:

- Clearly safe imagery is allowed.
- Azure's low Sexual signal is allowed because Microsoft's image taxonomy
  explicitly includes fashion modeling, artistic figure work, and body art.
- Azure's low Violence signal is allowed because the taxonomy explicitly
  includes displayed or animated weapons, non-realistic violence, and low-gore
  fictional imagery.
- Medium Sexual or Violence signals are held for review instead of blocked.
- Hate and SelfHarm signals are held for review because their legitimacy often
  depends on historical, journalistic, educational, medical, or artistic
  context.
- Azure's high Sexual signal is blocked because that tier is defined as
  explicit sexual acts or illegal sexual content.
- High Violence, Hate, or SelfHarm signals stay private for review because the
  category/severity response alone does not prove that the image is real-world
  gore, extremist propaganda, or promotion of harm.

This means swimwear, non-explicit lingerie, cosplay, fantasy/game art,
fictional violence, contextual weapons, moderate fictional blood, artistic
figure work, breastfeeding, educational/medical anatomy, tattoos/body art,
fashion, and suggestive but non-explicit imagery are not rejected merely for
skin, weapons, blood, or mature themes. If Azure cannot establish the needed
context, SIGNAL chooses REVIEW rather than BLOCK. Review items remain private
and never replace an already approved image.

Azure's general image taxonomy is not a specialized CSAM detection system. For
specialist or multi-provider coverage, configure the normalized webhook adapter:

```text
IMAGE_MODERATION_PROVIDER=webhook
IMAGE_MODERATION_WEBHOOK_URL=https://moderation.example.com/v1/images
IMAGE_MODERATION_WEBHOOK_TOKEN=...
```

The endpoint receives a bearer-authenticated JSON request:

```json
{
  "image": "<base64 WebP>",
  "mimeType": "image/webp",
  "sha256": "<64 lowercase hex characters>"
}
```

It must return:

```json
{
  "decision": "ALLOW",
  "categories": {
    "sexual_explicit": 0,
    "sexual_nudity": 0,
    "sexual_minors": 0,
    "graphic_violence": 0,
    "hate_extremism": 0,
    "self_harm": 0,
    "other_unsafe": 0
  },
  "requestId": "optional-provider-reference",
  "suspectedMinorSexualContent": false
}
```

The webhook provider must apply the same content policy. It should return ALLOW
for clearly legitimate creative, gaming, lifestyle, fashion, cosplay, or
educational imagery; REVIEW when sexual, violent, hateful, or graphic context
is genuinely ambiguous; and BLOCK only for clear prohibited content such as
explicit pornography or sexual acts, sexual exploitation, suspected sexual
content involving minors, severe graphic real-world gore, or hateful/extremist
propaganda. A contextual provider must not infer prohibition from skin,
weapons, blood, or mature themes alone.

Scores must be between 0 and 1. A positive `sexual_minors` score or
`suspectedMinorSexualContent: true` is forced to BLOCK, deleted from quarantine
after audit, marked `legal_escalation_required`, and excluded from the normal
moderator-readable queue. Handling beyond this minimal record requires a
specialized legal/compliance process; do not build a normal thumbnail gallery
for this category.

## Supabase and scheduled cleanup

Run `202609040001_image_moderation.sql`. It creates the bucket, table, enums,
indexes, audit trigger, rate-limited upload function, and RLS. No separate
bucket creation is required in the Supabase dashboard. Confirm that
`media-quarantine` is shown as private after migration.

Schedule a daily authenticated POST to:

```text
/api/internal/media-moderation/cleanup
Authorization: Bearer <CRON_SECRET>
```

The endpoint removes up to 100 expired pending/review/error/rejected quarantine
objects per invocation and records deletion. Run it repeatedly if a backlog can
exceed 100 objects. A hosting scheduler, Supabase scheduled Edge Function, or
external cron may call it; never put `CRON_SECRET` in browser code.

## Manual review foundation

`moderator` and `platform_admin` users can select ordinary review rows under
RLS. Authenticated members cannot read the table. Quarantine itself has no user
or reviewer Storage read policy, so a future review UI must use a server-only,
role-checked endpoint to issue short-lived access. The current release does not
add that UI or an insecure new role system. A production review workflow should
add audited approve/reject actions, reviewer assignment, queue SLAs, and
specialist escalation procedures before review-held images can be published.
