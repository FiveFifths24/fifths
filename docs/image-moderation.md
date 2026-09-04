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
Hate, SelfHarm, Sexual, and Violence analysis. Severity 0 allows, severity 2
holds for review, and severity 4 or 6 blocks. These thresholds are server-side
and are not returned to members.

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
