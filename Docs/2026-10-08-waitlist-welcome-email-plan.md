# Waitlist Welcome Email — Plan

**Status:** Decisions settled with the user on 2026-10-08. This is a planning
document. Phase 1 was done by hand in the AWS console; Phase 2 (backend) is
written and run with `scripts/waitlist-api-setup.sh`; Phases 3–4 (email
template, form) are built by Antigravity per
`Docs/2026-10-08-waitlist-welcome-email-website-anti-gravity-execution-prompt.md`.
Brainstorm page with the email mockups:
https://claude.ai/artifact/JMcTm6zTuNREbT3ZLK3PBh

## Goal

When someone submits the "Join the waitlist" pop-up, they get a fun,
on-brand welcome email within seconds: the **Waitlist pass** design, with
their first name and waitlist spot number. Sent via Amazon SES in the same AWS
account that already sends the web app's login OTPs, without any risk to OTP
deliverability. Signups keep flowing into the existing Google Sheet.

## Decisions (settled)

| Topic | Decision |
|---|---|
| Email design | **B · Waitlist pass** (dark boarding-pass card, spot number, 3-step "what's next", one button). Concepts A and C are not built. |
| Sign-off | "See you at the gate, Team Unifolio" |
| AWS region | **ap-south-1 (Mumbai)** for SES, Lambda, API Gateway, DynamoDB, SSM, the API's ACM certificate |
| AWS account | `811364789032` |
| API URL | **`https://api.unifolio.in/waitlist`** (API Gateway HTTP API custom domain, Route 53 alias) |
| Sending identity | `updates.unifolio.in`, From `Unifolio <hello@updates.unifolio.in>`. Kept separate from the OTP identity so marketing complaints can't hurt login emails. |
| Google Sheet webhook | **Keep it.** The Apps Script web app keeps receiving every new signup, but the Lambda forwards to it server-side instead of the browser posting directly. Same `{name, email, phone}` payload as today. |
| "Bring a friend" button | Goes to the website for now: `https://unifolio.in/?ref=<code>&utm_…`. Visitors just see the homepage. The `ref` code is captured quietly so a referral program can be built later without losing history (see "Referral program, later"). |
| Opt-in | Single opt-in, protected by Cloudflare Turnstile, a honeypot field, API throttling and send-once-per-address. |
| Sequence | Welcome email only for v1. Contact list exists so launch announcements can be sent later. |
| Infra style | Phase 1 (SES + DNS) by hand in the AWS console (done 2026-10-08). Phase 2 (backend) with an AWS CLI script in this repo, not Terraform. Everything is built from this laptop and this repo. |

## Current state (verified in code)

- The site is a static export to S3 + CloudFront (`next.config.mjs`,
  `scripts/deploy.sh`), so there is no server to send email from. Next.js API
  routes are not an option.
- `components/waitlist/WaitlistForm.tsx` POSTs `{name, email, phone}` as
  `text/plain` to `NEXT_PUBLIC_WAITLIST_WEBHOOK_URL` (the Google Apps Script
  web app) with `mode: "no-cors"`. The browser can't read the response, so the
  form always shows success, even on failure.
- `components/waitlist/WaitlistModal.tsx` says "No spam, just one email when
  it's your turn." That promise becomes untrue once we send a welcome email
  plus updates, so the copy changes (Task W3).
- `WaitlistForm` is used only by `WaitlistModal`, which `BlueprintNav.tsx`
  (and the hero CTAs through it) opens. `NewsletterBand.tsx` and
  `ContactForm.tsx` have their own webhooks and are **out of scope**.
- Three separate repos: this **website** repo, the **web app** repo (sends
  login OTPs through SES, untouched by this work), and the **Terraform infra**
  repo (contains `infra/envs/marketing`, S3 state backend; Route 53 hosts
  `unifolio.in`). All of this project lives in the website repo; the other
  two are not touched.

## Architecture

```
WaitlistModal (unifolio.in)
  │  POST JSON {name, email, phone, turnstileToken, company(honeypot), ref, source}
  ▼
API Gateway HTTP API  — api.unifolio.in, POST /waitlist
  │  CORS: https://unifolio.in, https://www.unifolio.in (+ http://localhost:3000)
  │  Throttle: 5 req/s, burst 10
  ▼
Lambda  waitlist-signup  (nodejs22.x, 256 MB, 10 s, reserved concurrency 10)
  ├─ honeypot filled → fake 200, stop
  ├─ validate input
  ├─ verify Turnstile (secret from SSM /unifolio/waitlist/turnstile-secret)
  ├─ DynamoDB unifolio-waitlist: conditional put (send once) → spot counter
  ├─ in parallel (Promise.allSettled):
  │     ├─ SES CreateContact (list unifolio-marketing, topic product-updates)
  │     │  then SES SendEmail (template waitlist-welcome-v1, config set unifolio-marketing)
  │     └─ POST {name,email,phone} to the Google Sheet Apps Script URL (4 s timeout)
  └─ 200 {status:"joined", spot}
```

Bounces and complaints flow: SES config set `unifolio-marketing` → SNS topic
`unifolio-marketing-ses-alerts` → email to the team, plus SES's account-level
suppression list. Lambda errors → CloudWatch alarms → same SNS topic.

## Phase 1 — SES and DNS (done in the AWS console, 2026-10-08)

Chosen route: click through the console following
`Docs/2026-10-08-waitlist-ses-phase1-console-guide.md` (one CloudShell paste
for the contact list, which has no console screen). The equivalent script,
`scripts/ses-marketing-setup.sh`, is kept as an alternative and as a
re-runnable status check:

```bash
SES_REGION=ap-south-1 ALERT_EMAIL=<team inbox> ./scripts/ses-marketing-setup.sh setup
SES_REGION=ap-south-1 ./scripts/ses-marketing-setup.sh status     # wait until DKIM + MAIL FROM show SUCCESS
SES_REGION=ap-south-1 ./scripts/ses-marketing-setup.sh test-send  # simulator; expect bounce + complaint alerts
```

Creates: config set `unifolio-marketing` (suppression on BOUNCE/COMPLAINT,
reputation metrics), SNS topic `unifolio-marketing-ses-alerts` + email
subscription, identity `updates.unifolio.in` with DKIM and MAIL FROM
`bounce.updates.unifolio.in`, Route 53 DKIM/MX/SPF records, root DMARC
(`p=none`) only if none exists, and contact list `unifolio-marketing` with
topic `product-updates`. It confirms before touching DNS and never modifies
the OTP identity.

Note: SES allows **one contact list per region**, so it's named for all
marketing, not just the waitlist. Future emails use new topics on the same list.

## Phase 2 — Backend (AWS CLI script, this repo)

Built and tested; the user runs the script. Everything lives in this repo:

- `services/waitlist-api/handler.mjs`: the signup logic (no AWS imports).
- `services/waitlist-api/index.mjs`: Lambda entry point; wires in DynamoDB, SES,
  SSM, Turnstile and the Google Sheet.
- `services/waitlist-api/handler.test.mjs`: `node --test services/waitlist-api/`
  (11 tests: new signup, duplicate, honeypot, captcha, validation, SES failure,
  sheet failure, referral codes).
- `scripts/waitlist-api-setup.sh`: creates or updates every AWS piece; safe to re-run.

Run order (laptop with `aws configure` done, or CloudShell with the repo files):

```bash
./scripts/waitlist-api-setup.sh secret                     # paste the Turnstile secret key (hidden)
SHEET_WEBHOOK_URL='<Apps Script URL>' REPLY_TO='<inbox>' \
  ./scripts/waitlist-api-setup.sh setup                    # asks y/N before the api.unifolio.in DNS change
./scripts/waitlist-api-setup.sh smoke-test                 # CORS + API→Lambda check, sends no email
./scripts/waitlist-api-setup.sh seed-counter <sheet rows>  # once, before launch
./scripts/waitlist-api-setup.sh status | logs | deploy     # later: check, watch, ship code changes
```

Resources it creates (all `ap-south-1`, tagged `project=waitlist-email`):

1. **DynamoDB** `unifolio-waitlist`, on-demand, partition key `pk` (S), PITR
   on, deletion protection on.
   - Signup item: `pk = "SIGNUP#<email lowercased>"`, attributes `email`,
     `name`, `phone` (optional), `spot` (N), `referralCode` (S, 8 chars),
     `referredBy` (S, optional), `source` (page path), `createdAt` (ISO),
     `emailStatus` (`sent` | `failed`), `sesMessageId`, `sheetStatus`
     (`sent` | `failed`).
   - Counter item: `pk = "COUNTER#spot"`, attribute `value` (N).
2. **SSM SecureString** `/unifolio/waitlist/turnstile-secret`, via the
   script's `secret` command (hidden prompt, so the key never lands in shell history).
3. **IAM role** `unifolio-waitlist-signup-role`, least privilege:
   - `dynamodb:PutItem`, `UpdateItem`, `GetItem` on the table only.
   - `ses:SendEmail` on identity `updates.unifolio.in`, configuration set
     `unifolio-marketing`, template `waitlist-welcome-v1`, contact list
     `unifolio-marketing`.
   - `ses:CreateContact` on the contact list.
   - `ssm:GetParameter` on the one parameter.
   - Writing to its own log group.
4. **Lambda** `waitlist-signup`: `nodejs22.x` on arm64 (Node 20 is past its
   Lambda deprecation date), 256 MB, 10 s, JSON logs to
   `/aws/lambda/waitlist-signup` (30 days), reserved concurrency 10 (skipped
   with a warning if the account's concurrency limit is under 100). Uses the
   SDK v3 bundled in the runtime, so the zip is just `index.mjs` + `handler.mjs`.
   Env vars: `TABLE_NAME`, `FROM_ADDRESS`, `REPLY_TO`, `CONFIG_SET`,
   `CONTACT_LIST`, `CONTACT_TOPIC`, `TEMPLATE_NAME`, `TURNSTILE_SECRET_PARAM`,
   `SHEET_WEBHOOK_URL`, `SITE_URL`.
5. **API Gateway HTTP API** `unifolio-waitlist-api`, route `POST /waitlist` →
   Lambda proxy (payload 2.0). CORS on the API: origins `https://unifolio.in`,
   `https://www.unifolio.in`, `http://localhost:3000`; method `POST`; header
   `content-type`; max age 86400. `$default` stage, auto-deploy, throttling
   5 req/s burst 10, JSON access logs to `/aws/apigateway/unifolio-waitlist-api` (30 days).
6. **Custom domain** `api.unifolio.in`: ACM certificate in ap-south-1,
   DNS-validated in Route 53; regional API Gateway domain (TLS 1.2); mapping
   to `$default`; Route 53 A-alias (asks before writing).
7. **Alarms** → SNS `unifolio-marketing-ses-alerts`:
   - `waitlist-signup-handled-errors`: a log metric filter on `level = ERROR`.
     It catches email, sheet and server failures that the handler logs
     without throwing.
   - `waitlist-signup-crashes`: Lambda `Errors` (crashes and timeouts).
   - `waitlist-signup-throttles`: Lambda `Throttles`.

Not in Terraform. If the team later wants it there, these resources can be
imported into a new environment in the infra repo.

### Lambda behaviour

Request: `POST /waitlist`, JSON, max 4 KB.

```json
{ "name": "Siddharth Sharma", "email": "sid@example.com", "phone": "+91 98765 43210",
  "turnstileToken": "…", "company": "", "ref": "K7M2Q9XA", "source": "/" }
```

Steps:

1. Parse the JSON body. Unparseable or over 4 KB → `400 {error:"invalid_input"}`.
2. **Honeypot:** `company` non-empty → `200 {status:"joined", spot:null}`, log
   and stop (don't tell bots they were caught).
3. **Validate:** `name` trimmed 1–80 chars, `<` and `>` stripped; `email`
   trimmed and lowercased, ≤254 chars, basic `x@y.z` shape; `phone` optional,
   ≤20 chars of `+ 0-9 space - ( )`; `ref` optional, must match
   `^[A-HJ-NP-Z2-9]{8}$` or it's dropped; `source` optional, ≤100 chars.
   Failure → `400 {error:"invalid_input", field}`.
4. **Turnstile:** POST `secret`, `response`, `remoteip`
   (`requestContext.http.sourceIp`) to
   `https://challenges.cloudflare.com/turnstile/v0/siteverify`. Not
   `success` → `403 {error:"captcha_failed"}`. Secret fetched once per cold
   start and cached in module scope.
5. **Send once:** `PutItem` the signup with
   `ConditionExpression: attribute_not_exists(pk)` and
   `ReturnValuesOnConditionCheckFailure: ALL_OLD`. If the condition fails →
   `200 {status:"already_joined", spot: <old spot>}`, no email, no sheet post.
6. **Spot number:** `UpdateItem` `COUNTER#spot` with `ADD #v :1`,
   `ReturnValues: UPDATED_NEW`; write `spot` back onto the signup item.
7. **Referral code:** 8 chars from `crypto.randomBytes`, alphabet
   `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, stored with the signup in step 5.
8. **In parallel** (`Promise.allSettled`):
   - SES `CreateContact` (ignore `AlreadyExistsException`) then `SendEmail`
     with `ListManagementOptions {ContactListName, TopicName}`,
     `ConfigurationSetName`, `EmailTags [{Name:"campaign", Value:"waitlist-welcome"}]`,
     `ReplyToAddresses`, template data
     `{ firstName, spot: spot.toLocaleString("en-IN"), referralUrl }`.
     `firstName` = first word of `name`.
     `referralUrl` = `${SITE_URL}/?ref=${code}&utm_source=waitlist_email&utm_medium=email&utm_campaign=waitlist_welcome`.
   - POST `JSON.stringify({name, email, phone})` as `text/plain` to
     `SHEET_WEBHOOK_URL`, `redirect: "follow"`, `AbortSignal.timeout(4000)`.
     Same payload shape the sheet gets today. Apps Script answers with a 302
     after running `doPost`, and that's fine.
9. Record `emailStatus` / `sheetStatus` on the item. Failures are logged as
   structured JSON (`console.error`) but the user still gets
   `200 {status:"joined", spot}`. They **are** on the list, and the Errors
   alarm plus the item's status fields let us resend later.
10. Anything unexpected → `500 {error:"server_error"}`.

Never log full email addresses or phone numbers. Log the item `pk` hash or
the first 2 characters plus the domain.

## Phase 3 — The email (website repo)

Files:

- `emails/waitlist-welcome/template.mjml`: the Waitlist pass, built with MJML.
- `emails/waitlist-welcome/text.txt`: the plain-text version.
- `emails/waitlist-welcome/subject.txt`: `You're in. Spot #{{spot}} is yours 🎟️`
- `scripts/ses-upload-template.sh`: compiles MJML (`npx mjml`, add `mjml` as
  a devDependency) and runs `aws sesv2 create-email-template` the first time
  and `update-email-template` after that, for `waitlist-welcome-v1` in
  `ap-south-1`.
- `public/email/`: email images (ring logo at 2×, ~88 px square source for
  44 px display; the wordmark if used). They're served from
  `https://unifolio.in/email/…` after a normal `scripts/deploy.sh`. **Deploy
  the site before the first real email goes out**, or images break.

Template variables: `{{firstName}}`, `{{spot}}`, `{{referralUrl}}`,
`{{amazonSESUnsubscribeUrl}}` (SES fills this in because the send uses
`ListManagementOptions`; it also adds the one-click `List-Unsubscribe`
headers Gmail and Yahoo require).

Content, top to bottom (matches the brainstorm mockup):

- Hidden preheader: "Your mutual funds have no idea what's coming."
- Logo: green ring + "unifolio" wordmark.
- Headline: "You're on the list, {{firstName}}."
- Line: "Your early-access pass is below. Keep it safe. (It's an email. It's very safe.)"
- **Pass card** on `#1C241E`: label "EARLY ACCESS PASS" in `#86EFAC`, spot
  `#{{spot}}` large in `#22C55E`, ring mark top right; three fields
  Passenger `{{firstName}}` / Boarding "Launch day" / Gate "Your inbox";
  dashed perforation; barcode drawn with narrow table cells (no image);
  "Fees on board: ₹0 · Class: Free forever".
- Three numbered rows:
  1. **Sneak peeks first.** You'll see screens before anyone on Twitter does.
  2. **Early door.** Waitlist members get in before the public launch.
  3. **Light homework.** Find your CAS statement from CAMS or KFintech. That one file is all Unifolio needs.
- Button "Bring a friend along →", linking to `{{referralUrl}}`, `#22C55E` pill, white text.
- Sign-off: "See you at the gate,<br>Team Unifolio"
- Footer: "You're getting this because you joined the Unifolio waitlist at
  unifolio.in." · registered address · `Unsubscribe` link →
  `{{amazonSESUnsubscribeUrl}}` · privacy policy link.

Email-build rules: 600 px max, table layout, inline styles (MJML does this),
Manrope via Google Fonts with `Arial, Helvetica, sans-serif` fallback, no
background images, `alt` on every image, works with images blocked,
`<meta name="color-scheme" content="light">` plus explicit backgrounds
everywhere so Gmail dark mode doesn't wash out the pass card. Keep the
compiled HTML under 100 KB so Gmail doesn't clip it.

## Phase 4 — Website (website repo)

- `WaitlistForm.tsx`
  - POST JSON to `process.env.NEXT_PUBLIC_WAITLIST_API_URL` with
    `Content-Type: application/json`, normal CORS (no `no-cors`). Stop
    calling `NEXT_PUBLIC_WAITLIST_WEBHOOK_URL` from the browser; the Lambda
    forwards to the sheet now.
  - Cloudflare Turnstile widget (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`), loaded
    from `https://challenges.cloudflare.com/turnstile/v0/api.js`, rendered
    explicitly when the form mounts, `appearance: "interaction-only"` so most
    users never see it. Reset it after any failed submit.
  - Honeypot input `name="company"`, visually hidden (not `display:none`),
    `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden`.
  - Send `ref` (from sessionStorage, see below) and `source`
    (`window.location.pathname`).
  - Consent line under the button: "We'll email you your pass and launch
    news. Unsubscribe anytime." with a link to the privacy policy.
  - States:
    - `joined`: "You're #1,284 on the list. Your pass is on its way to your inbox." (spot from the response; if `spot` is null, drop the number.)
    - `already_joined`: "You're already on the list (spot #1,284). We'll be in touch."
    - `captcha_failed`: "We couldn't confirm you're human. Please try again."
    - `invalid_input`: highlight the field, "Please check your email address." (or name/phone).
    - network or 5xx: "Something went wrong. Please try again in a moment."
  - Keep the modal open ~4 s on success (it's 2.2 s today) so the spot number can be read.
- `WaitlistModal.tsx`: replace "No spam, just one email when it's your turn."
  with "Be first in line when Unifolio opens up. Your pass lands in your inbox
  right away."
- **Referral capture:** small client component `components/waitlist/RefCapture.tsx`,
  mounted once in `app/layout.tsx`. On load, if the URL has `?ref=` matching
  `^[A-HJ-NP-Z2-9]{8}$`, store it in `sessionStorage` key `uf_ref` (wrapped
  in try/catch). Renders nothing. `WaitlistForm` reads it.
- Env vars at build time (static export bakes them in), in `.env.production`
  on the deploying laptop:
  ```
  NEXT_PUBLIC_WAITLIST_API_URL=https://api.unifolio.in/waitlist
  NEXT_PUBLIC_TURNSTILE_SITE_KEY=<from Cloudflare>
  ```
- If CloudFront sends a Content-Security-Policy header (check the response
  headers policy in Terraform), add `https://challenges.cloudflare.com` to
  `script-src` and `frame-src` and `https://api.unifolio.in` to `connect-src`.

## Phase 5 — Test and launch

1. Phase 1 verified: identity, DKIM and MAIL FROM `SUCCESS` (done 2026-10-08).
2. Simulator bounce and complaint alerts arrived at the SNS subscriber (done 2026-10-08).
3. `./scripts/waitlist-api-setup.sh smoke-test`: CORS and the API → Lambda path, no email sent.
4. Upload the template. For an end-to-end test before the real Turnstile
   widget exists, store Turnstile's always-pass test secret
   (`1x0000000000000000000000000000000AA`) with `secret`, sign up from
   `localhost:3000` with the test site key (`1x00000000000000000000AA`) to an
   inbox you own, then store the real secret again.
5. Same email again → `already_joined`, no second email, no second sheet row.
6. Honeypot filled → 200, nothing stored.
7. Rendering: Gmail web, Gmail Android/iOS, Apple Mail, Outlook (web + desktop), light and dark.
8. mail-tester.com score ≥ 9/10.
9. Unsubscribe link → SES hosted page → contact shows `OPT_OUT` for `product-updates`.
10. Sheet receives exactly one row per new signup.
11. Seed the counter (below), switch to real Turnstile keys, deploy the site, submit a real signup.
12. Register `updates.unifolio.in` in Google Postmaster Tools.

### Seeding the spot counter

People already in the Google Sheet joined earlier and should rank ahead. Before
launch, count the sheet's signup rows (N) and seed the counter once:

```bash
./scripts/waitlist-api-setup.sh seed-counter <N>
```

It refuses to overwrite a counter that already exists, because people may
already hold those numbers. **Seed before any test signup**, or delete the
test signups and the counter item first.

The first new signup then gets spot N+1. Existing sheet signups don't get a
welcome email in v1. A one-off backfill send is possible later.

## Referral program, later (documented, not built)

What v1 already does, so nothing is lost:

- Every signup gets a unique `referralCode`, stored in DynamoDB.
- The email's "Bring a friend" button links to `unifolio.in/?ref=<code>` plus UTM tags.
- The site captures `ref` into sessionStorage, and the Lambda stores it as
  `referredBy` on the new signup (format-checked only, not verified).
- UTM tags show referral traffic in analytics.

To turn it into a real program:

1. Add a GSI `referralCode-index` (partition key `referralCode`). DynamoDB
   backfills it automatically, so no migration is needed.
2. In the Lambda, look up `referredBy` through the GSI. If it matches a real
   signup (and isn't the same email), `ADD referralCount :1` on the referrer.
   Backfill counts for v1 signups by scanning `referredBy`.
3. Decide the reward rule, e.g. effective position = `spot − 50 × referralCount`,
   floored at 1. Or tiers: 3 friends gets early beta.
4. Optional "you moved up" email to the referrer (new SES template, same
   config set, a new contact-list topic if needed).
5. Change the button copy to "Skip the line: share your link" and show the
   link on the success screen with a copy button.
6. Anti-abuse: only count referrals that pass Turnstile; ignore same-IP
   bursts (store a salted IP hash at signup); consider counting only after
   the referred user opens or clicks their welcome email.
7. Update the privacy policy to mention referral tracking.

## Needed from the user before or during the build

- [ ] Run Phase 1 script; confirm `status` shows SUCCESS.
- [ ] `ALERT_EMAIL`: team inbox for bounce/complaint/error alerts.
- [ ] Reply-to address someone reads (e.g. `founders@unifolio.in`). It needs to exist as a mailbox.
- [ ] Registered business address for the email footer.
- [ ] Privacy policy URL (and a mention of the waitlist email in it).
- [ ] Cloudflare account → Turnstile widget for `unifolio.in` → site key and secret key.
- [ ] `aws ssm put-parameter --region ap-south-1 --name /unifolio/waitlist/turnstile-secret --type SecureString --value <secret>`
- [ ] Google Apps Script web app URL (the current `NEXT_PUBLIC_WAITLIST_WEBHOOK_URL` value) for the Lambda's `SHEET_WEBHOOK_URL`.
- [ ] Current number of signup rows in the sheet (counter seed).
- [ ] Run `scripts/waitlist-api-setup.sh setup` (creates billed resources and the `api.unifolio.in` DNS record).

## Cost

At 10,000 signups/month: SES ~$1, API Gateway ~$0.01, Lambda free tier,
DynamoDB ~$0.03, Turnstile free. Effectively under $2/month.
