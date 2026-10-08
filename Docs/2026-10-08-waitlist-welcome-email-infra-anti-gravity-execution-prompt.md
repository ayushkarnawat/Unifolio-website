You are building the backend for the Unifolio marketing site's waitlist
welcome email, in the **Terraform infra repo** (the one that contains
`infra/envs/marketing`, which hosts unifolio.in on S3 + CloudFront with
Route 53). This prompt is self-contained: the plan document lives in the
separate website repo, and you don't need it.

**What it does:** the website's "Join the waitlist" pop-up will POST to
`https://api.unifolio.in/waitlist`. A Lambda checks the request, saves the
signup in DynamoDB with a waitlist spot number, forwards it to the existing
Google Sheet (an Apps Script web app), and sends a "Waitlist pass" welcome
email through Amazon SES.

**Repos (only this one is yours):**
- **Infra repo (this one):** Terraform environment + Lambda source.
- **Website repo:** the form changes and the SES email template
  (`waitlist-welcome-v1`). Built separately against the API contract below.
- **Web app repo:** sends login OTPs through SES in the same AWS account.
  **Do not touch any SES, IAM or other resource belonging to it.**

**Already exists (created by an AWS CLI script, NOT managed by Terraform;
reference by name/ARN or data source, never create or import):**
- Account `811364789032`, region `ap-south-1` (Mumbai).
- SES identity `updates.unifolio.in` (From `Unifolio <hello@updates.unifolio.in>`).
- SES configuration set `unifolio-marketing`.
- SES contact list `unifolio-marketing`, topic `product-updates`.
- SNS topic `unifolio-marketing-ses-alerts`.
- SSM SecureString `/unifolio/waitlist/turnstile-secret` (created by hand).
- SES template `waitlist-welcome-v1` (uploaded from the website repo).
- Route 53 public hosted zone `unifolio.in`.

**Hard rules:**
- Do NOT run `terraform apply`, `terraform import`, or any AWS command that
  creates, updates, deletes or sends. You may run `terraform fmt`, `init`,
  `validate`, `plan` and read-only `aws ... get-*/list-*/describe-*`.
- Don't modify existing environments' resources. The one exception is the
  optional CSP change in Task 3, and that's only proposed, not applied.
- No secrets in Terraform (no secret variables with defaults, no real
  `.tfvars` committed). The Turnstile secret is only read at runtime from SSM.
- The Lambda never logs full email addresses or phone numbers.

---

## API contract (the website is built against this; don't change it without saying so)

`POST /waitlist`, JSON body, max 4 KB:
```json
{ "name": "Siddharth Sharma", "email": "sid@example.com", "phone": "+91 98765 43210",
  "turnstileToken": "…", "company": "", "ref": "K7M2Q9XA", "source": "/" }
```
Responses:
- `200 {"status":"joined","spot":1284}` (`spot: null` in the honeypot case)
- `200 {"status":"already_joined","spot":1031}`
- `400 {"error":"invalid_input","field":"email"}` (`field`: `name` | `email` | `phone` | absent)
- `403 {"error":"captcha_failed"}`
- `500 {"error":"server_error"}`

CORS is configured on the API (not in the Lambda): origins
`https://unifolio.in`, `https://www.unifolio.in`, `http://localhost:3000`;
method `POST`; header `content-type`; max age 86400.

## Data model

DynamoDB table `unifolio-waitlist`, on-demand, partition key `pk` (S), PITR on.
- Signup: `pk = "SIGNUP#<email lowercased>"`; `email`, `name`, `phone`
  (optional), `spot` (N), `referralCode` (S, 8 chars), `referredBy` (S,
  optional), `source`, `createdAt` (ISO), `emailStatus` (`sent`|`failed`),
  `sesMessageId`, `sheetStatus` (`sent`|`failed`).
- Counter: `pk = "COUNTER#spot"`, `value` (N). The user seeds it by hand
  before launch with the current Google Sheet row count; `ADD` on a missing
  item starts from 0, which is also fine.

No GSI yet. A future referral program will add `referralCode-index`, and
DynamoDB backfills that automatically.

---

**Task 1 — Lambda source**
`infra/envs/waitlist/lambda/index.mjs`, `nodejs22.x`, AWS SDK v3 clients from
the runtime (`@aws-sdk/client-dynamodb` + `lib-dynamodb`, `client-sesv2`,
`client-ssm`), global `fetch`, no bundler, no `node_modules`. One readable
file with small named functions. Behaviour, in order:

1. Parse JSON. Unparseable or over 4 KB → `400 invalid_input`.
2. Honeypot: `company` non-empty → `200 {status:"joined", spot:null}`, log, stop.
3. Validate: `name` trimmed 1–80 chars, strip `<` `>`; `email` trimmed and
   lowercased, ≤254 chars, `x@y.z` shape; `phone` optional, ≤20 chars of
   `+ 0-9 space - ( )`; `ref` optional, dropped unless it matches
   `^[A-HJ-NP-Z2-9]{8}$`; `source` optional, ≤100 chars.
4. Turnstile: POST form-encoded `secret`, `response`, `remoteip`
   (`event.requestContext.http.sourceIp`) to
   `https://challenges.cloudflare.com/turnstile/v0/siteverify`. Not `success`
   → `403 captcha_failed`. Secret from SSM (`WithDecryption`), cached in module
   scope per cold start.
5. Generate `referralCode`: 8 chars via `crypto.randomBytes`, alphabet
   `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`.
6. Send once: `PutItem` the signup with `ConditionExpression:
   attribute_not_exists(pk)` and `ReturnValuesOnConditionCheckFailure:
   ALL_OLD`. On `ConditionalCheckFailedException` → `200
   {status:"already_joined", spot: old.spot ?? null}`, no email, no sheet post.
7. Spot: `UpdateItem` `COUNTER#spot` `ADD #v :one`, `ReturnValues:
   UPDATED_NEW`; set `spot` on the signup item.
8. In parallel with `Promise.allSettled`:
   - SES `CreateContact` on `CONTACT_LIST` with topic `CONTACT_TOPIC`
     `OPT_IN` (ignore `AlreadyExistsException`), then `SendEmail`:
     `FromEmailAddress`, `ReplyToAddresses`, `ConfigurationSetName`,
     `ListManagementOptions {ContactListName, TopicName}`,
     `EmailTags [{Name:"campaign", Value:"waitlist-welcome"}]`,
     `Content.Template {TemplateName, TemplateData}` with
     `{ firstName, spot: spot.toLocaleString("en-IN"), referralUrl }`.
     `firstName` = first word of `name`.
     `referralUrl` = `${SITE_URL}/?ref=${code}&utm_source=waitlist_email&utm_medium=email&utm_campaign=waitlist_welcome`.
   - POST `JSON.stringify({name, email, phone})` with
     `Content-Type: text/plain` to `SHEET_WEBHOOK_URL`, `redirect: "follow"`,
     `signal: AbortSignal.timeout(4000)`. Same payload the sheet receives
     today. Apps Script replies with a 302 after running, which is success.
9. Write `emailStatus`, `sesMessageId`, `sheetStatus` onto the item. Log
   failures as structured JSON. Still return `200 {status:"joined", spot}`,
   because the user *is* on the list.
10. Anything unexpected → `500 server_error`.

Env vars: `TABLE_NAME`, `FROM_ADDRESS`, `REPLY_TO`, `CONFIG_SET`,
`CONTACT_LIST`, `CONTACT_TOPIC`, `TEMPLATE_NAME`, `TURNSTILE_SECRET_PARAM`,
`SHEET_WEBHOOK_URL`, `SITE_URL` (`https://unifolio.in`).

Tests: `infra/envs/waitlist/lambda/index.test.mjs` with `node:test`, AWS
clients and `fetch` stubbed. Cover honeypot, invalid email, captcha fail,
new signup (SES + sheet called, spot returned), duplicate (neither called,
old spot returned), SES failure (still 200, `emailStatus=failed`), sheet
timeout (still 200, `sheetStatus=failed`). Make the handler testable by
injecting clients (e.g. an exported factory) rather than module mocking.

**Task 2 — Terraform environment `infra/envs/waitlist/`**
First read `infra/envs/marketing/` and `infra/modules/` and copy their
conventions exactly: backend block (own state key in the same state bucket),
provider and version pins, default tags, naming, file layout. Provider
region `ap-south-1`. Resources:

1. DynamoDB table above.
2. Lambda `waitlist-signup`: `archive_file` zip of `lambda/index.mjs`, 256 MB,
   10 s timeout, reserved concurrency 10, env vars above, log group with 30-day retention.
3. IAM role, least privilege:
   - `dynamodb:PutItem`, `UpdateItem`, `GetItem` on the table ARN.
   - `ses:SendEmail` on `arn:aws:ses:ap-south-1:811364789032:identity/updates.unifolio.in`,
     `…:configuration-set/unifolio-marketing`, `…:template/waitlist-welcome-v1`,
     `…:contact-list/unifolio-marketing`.
   - `ses:CreateContact` on the contact list ARN.
   - `ssm:GetParameter` on the parameter ARN.
   - CloudWatch Logs for its own log group.
4. API Gateway HTTP API `unifolio-waitlist-api`, route `POST /waitlist`,
   Lambda proxy integration (payload 2.0) + invoke permission, CORS as above,
   `$default` stage with auto-deploy, default route throttling rate 5 /
   burst 10, JSON access logs to a CloudWatch log group (30 days).
5. ACM certificate for `api.unifolio.in` **in ap-south-1**, DNS-validated in
   the `unifolio.in` zone (data source); `aws_apigatewayv2_domain_name`
   (REGIONAL, TLS_1_2); API mapping; Route 53 A-alias `api.unifolio.in`.
6. CloudWatch alarms: Lambda `Errors >= 1` and `Throttles >= 1` over 5 min
   → SNS `unifolio-marketing-ses-alerts` (data source by name).
7. Variables without defaults: `sheet_webhook_url`, `reply_to_address`.
   Add `terraform.tfvars.example` with placeholders and comments.
8. Outputs: `api_url`, `table_name`, `lambda_function_name`.

Add a short `infra/envs/waitlist/README.md`: what it is, prerequisites
(the existing SES pieces, SSM secret, SES template), apply steps, how to
seed the counter:
```bash
aws dynamodb put-item --region ap-south-1 --table-name unifolio-waitlist \
  --item '{"pk":{"S":"COUNTER#spot"},"value":{"N":"<rows in the sheet>"}}' \
  --condition-expression "attribute_not_exists(pk)"
```
and how to curl the API once it's live.

**Task 3 — CSP check (propose only)**
Check whether `infra/envs/marketing` (or the frontend module) attaches a
CloudFront response-headers policy with a Content-Security-Policy. If it
does, write the exact diff that adds `https://challenges.cloudflare.com` to
`script-src` and `frame-src` and `https://api.unifolio.in` to `connect-src`,
put it in your report, and don't apply or commit it. If there's no CSP, say so.

**Verification before you report done:**
- `node --test infra/envs/waitlist/lambda/` passes.
- `terraform fmt -check`, `init`, `validate` pass; `plan` too if credentials
  exist (with a scratch tfvars that is NOT committed). Report the resource count.
- Confirm nothing outside `infra/envs/waitlist/` changed.

**Report back with:** files created, test output, plan summary, the CSP
finding, and the exact go-live command sequence for the user: SSM secret →
(website repo) template upload → `terraform apply` → counter seed → curl
test → website deploy.
