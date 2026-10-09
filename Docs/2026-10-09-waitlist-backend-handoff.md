# Handoff: Waitlist Welcome Email Backend (Phase 2)

**For:** the person running the AWS setup on the laptop that has the AWS CLI
signed in to account `811364789032`, and the Claude agent helping them.
**From:** Ayush (planned and built with Claude Code, 8–9 Oct 2026).
**Ask:** run one setup script that creates the backend behind
`https://api.unifolio.in/waitlist`. About 15 minutes plus a short DNS wait.

> **If you are a Claude agent reading this:** read this whole file first, then
> `Docs/2026-10-08-waitlist-welcome-email-plan.md` for full context. Follow the
> "Rules for the agent" section. Don't change the code or script unless a run
> fails and the person agrees to the fix.

---

## 1. What we're building, in one paragraph

When someone clicks **Join the waitlist** on unifolio.in, they should get a
fun "Waitlist pass" welcome email within seconds, showing their name and their
waitlist spot number (#1,284 and so on). The emails are sent with Amazon SES,
from the same AWS account that already sends the web app's login OTPs. The
OTP emails are kept completely separate and untouched. Every signup also
keeps going into the existing Google Sheet, as it does today.

Design mockups and the reasoning behind decisions:
https://claude.ai/artifact/JMcTm6zTuNREbT3ZLK3PBh (ask Ayush to share it if it doesn't open).

## 2. How it works

The website is static files on S3 + CloudFront, so it can't send email
itself, and AWS keys can't go into browser code. We add a small backend:

```
Pop-up on unifolio.in
   │  POST {name, email, phone, botCheckToken, ...}
   ▼
API Gateway  https://api.unifolio.in/waitlist   (only accepts unifolio.in; rate-limited)
   ▼
Lambda "waitlist-signup"  (Node 22)
   1. reject bots (hidden honeypot field + Cloudflare Turnstile check)
   2. validate input
   3. save to DynamoDB, once per email; give out the next spot number
   4. at the same time:
        • SES: send the "Waitlist pass" email from hello@updates.unifolio.in
        • forward {name, email, phone} to the Google Sheet (Apps Script)
   5. reply {status: "joined", spot: 1284}
```

Failures and spam complaints email an alerts inbox through SNS.

## 3. Which repo, Terraform, and what this changes

### Run it in the website repo

Run everything in **`Unifolio-website`**
(`https://github.com/ayushkarnawat/Unifolio-website`), the Next.js marketing
site, from its root folder:

```bash
git clone https://github.com/ayushkarnawat/Unifolio-website.git   # or: cd <existing clone> && git pull
cd Unifolio-website
git checkout redesign      # the branch this work is on, until it's merged to main
git pull
ls scripts/waitlist-api-setup.sh services/waitlist-api/   # must exist before you start
```

**Not** in the web app repo (login/OTP app), and **not** in the Terraform
infra repo (`infra/envs/marketing` etc.). Neither of those is changed, and
nothing needs to be pulled or run there.

### Terraform: not used for this, and nothing in Terraform changes

- **We're not writing or running any Terraform.** No `.tf` files are added,
  no `terraform plan/apply` is needed, and the infra repo and its state
  files are untouched.
- **Why:** this backend is small (seven pieces), and Ayush chose to keep the
  whole feature in the website repo and on one script. The AWS CLI script
  checks before it creates and is safe to re-run, which gives most of what
  Terraform would.
- **How it sits next to the existing Terraform:** `infra/envs/marketing`
  manages unifolio.in's S3 bucket, CloudFront distribution, its certificate
  and a few Route 53 records in the `unifolio.in` zone. Terraform only tracks
  the resources it created. It ignores records it doesn't own. So the script adding
  `api.unifolio.in` (plus one certificate validation CNAME) to the same zone
  won't show up as drift and won't be deleted by a future `terraform apply`.
  The one thing to avoid: never create a Terraform resource for
  `api.unifolio.in` while this script's record exists, or the two would fight.
- **If the team later wants this in Terraform:** create
  `infra/envs/waitlist/` and use `terraform import` for each resource in
  section 5 (names are fixed and listed there). Nothing has to be rebuilt.

### What it changes in the website repo and the live site

- **New files only.** Phase 2 adds `services/waitlist-api/` (Lambda code +
  tests), `scripts/waitlist-api-setup.sh`, and docs in `Docs/`. No existing
  website file is edited by this phase.
- **The website build and deploy don't change.** `services/` is plain
  `.mjs`, outside what Next.js builds, type-checks (tsconfig only covers
  `.ts/.tsx`) or lints (`next lint` covers `app/`, `components/`, `lib/`).
  `scripts/deploy.sh` only uploads `./out`, so the Lambda code never ends up
  on S3. `npm run build`, `npm test` and `scripts/deploy.sh` behave exactly as before.
- **The live site doesn't change yet.** The waitlist pop-up keeps posting to
  the Google Sheet directly until Phase 4 (the form update) is deployed.
  Creating the backend has **no visible effect on unifolio.in**. It only adds
  `api.unifolio.in`, which nothing calls until then.
- **The Lambda code is deployed by the script, not by the website deploy.**
  Its source of truth is `services/waitlist-api/` in this repo. After editing
  it, run `./scripts/waitlist-api-setup.sh deploy`; a website deploy won't update it.

## 4. Status: what's already done

| Phase | What | Status |
|---|---|---|
| 1 | SES setup: sender domain `updates.unifolio.in` (verified, DKIM + MAIL FROM), configuration set `unifolio-marketing`, contact list `unifolio-marketing` (topic `product-updates`), SNS alert topic `unifolio-marketing-ses-alerts`. All in **ap-south-1 (Mumbai)**. | ✅ Done by Ayush in the console, 8 Oct |
| 2 | **Backend: what this handoff is for** | ⏳ Code written and unit-tested; **not yet run against AWS** |
| 3 | Email template `waitlist-welcome-v1` (HTML) + upload script | ⏳ Being built by Antigravity in this repo |
| 4 | Website form changes (call the new API, Turnstile widget, show spot number) | ⏳ Being built by Antigravity in this repo |
| 5 | End-to-end test and launch | Later |

Phase 2 can run before Phase 3 exists. Signups will save and reach the
sheet, but emails fail until the template is uploaded. The script warns about
this, and that's expected.

## 5. What the script creates

All in `ap-south-1`, all tagged `project=waitlist-email`, all **new**. It
doesn't modify any existing resource.

| # | Resource | Name | Purpose |
|---|---|---|---|
| 1 | SSM SecureString | `/unifolio/waitlist/turnstile-secret` | Cloudflare Turnstile secret (bot check) |
| 2 | DynamoDB table | `unifolio-waitlist` | Signups + spot counter. On-demand, point-in-time recovery, deletion protection |
| 3 | IAM role | `unifolio-waitlist-signup-role` | Least privilege: this table, SES send from `updates.unifolio.in` only, the contact list, the one secret, its own logs |
| 4 | Lambda | `waitlist-signup` | The code in `services/waitlist-api/` (Node 22, arm64, 256 MB, 10 s, max 10 concurrent) |
| 5 | API Gateway HTTP API | `unifolio-waitlist-api` | `POST /waitlist`, CORS for unifolio.in + www + localhost:3000, 5 req/s (burst 10) |
| 6 | ACM certificate + API domain + Route 53 A-alias | `api.unifolio.in` | HTTPS on our own domain. **Adds one record (plus one validation CNAME) to the live `unifolio.in` zone, after a y/N prompt** |
| 7 | CloudWatch log groups, metric filter, 3 alarms | `waitlist-signup-*` | Errors, crashes and throttles → the SNS alert topic |

**Cost:** under $2/month even at 10k signups. Most of it is SES at $0.10 per 1,000 emails.

**Not Terraform:** created with the AWS CLI on purpose; see section 3 for why
and how it coexists with the existing Terraform.

## 6. Files in this repo

| File | What it is |
|---|---|
| `scripts/waitlist-api-setup.sh` | **The script to run.** Re-runnable; checks before it creates. |
| `services/waitlist-api/handler.mjs` | Signup logic (validation, bot check, save once, spot number, email + sheet) |
| `services/waitlist-api/index.mjs` | Lambda entry point wiring in DynamoDB / SES / SSM |
| `services/waitlist-api/handler.test.mjs` | 11 unit tests: `node --test services/waitlist-api/` |
| `Docs/2026-10-08-waitlist-welcome-email-plan.md` | Full plan and decisions |
| `Docs/2026-10-08-waitlist-ses-phase1-console-guide.md` | How Phase 1 was done (reference) |
| `scripts/ses-marketing-setup.sh` | CLI version of Phase 1 (not needed; Phase 1 is done) |

## 7. Before you start: what you need

**From Ayush** (or whoever owns these):

- [ ] **Google Sheet Apps Script web app URL**: the current value of
      `NEXT_PUBLIC_WAITLIST_WEBHOOK_URL` (it's in the website's env file on the deploying machine).
- [ ] **Reply-to address**: a real inbox someone reads (e.g. `founders@unifolio.in`).
- [ ] **Cloudflare Turnstile secret key**: create a free widget at
      dash.cloudflare.com → Turnstile → Add widget → hostname `unifolio.in`
      (add `www.unifolio.in` and `localhost` too), mode **Managed**. It gives a
      *site key* (public, for the website) and a *secret key* (for this script).
      If the widget doesn't exist yet, use Cloudflare's always-pass **test**
      secret `1x0000000000000000000000000000000AA` for now and swap it later with the same command.
- [ ] **Number of signups already in the Google Sheet**: so new spot numbers continue after them.

**On the laptop:**

- [ ] The website repo `Unifolio-website`, on branch `redesign`, pulled (section 3); the files in section 6 must exist.
- [ ] `bash` (macOS / Linux / WSL; on Windows use WSL or Git Bash), `python3`, `curl`, AWS CLI v2.
- [ ] AWS CLI signed in to account **811364789032** with permissions for IAM
      (create role, put role policy), Lambda, API Gateway, ACM, Route 53,
      DynamoDB, SSM, CloudWatch Logs/Alarms, plus read access to SES and SNS.
      An admin profile is simplest. If you use a named profile, `export AWS_PROFILE=<name>` first.
- [ ] Optional sanity check: `node --test services/waitlist-api/` (needs Node 18+; should show 11 passing).

## 8. Steps

Run from the root of the `Unifolio-website` repo (section 3).

```bash
# 0. Confirm the right account (must print 811364789032)
aws sts get-caller-identity --query Account --output text

# 1. Store the Turnstile secret (prompts; input hidden; never in shell history)
./scripts/waitlist-api-setup.sh secret

# 2. Create everything (quote the URL; it contains special characters)
SHEET_WEBHOOK_URL='https://script.google.com/macros/s/XXXX/exec' \
REPLY_TO='founders@unifolio.in' \
./scripts/waitlist-api-setup.sh setup
#    - Checks Phase 1 exists and is verified; stops with a clear message if not.
#    - Warns "email template waitlist-welcome-v1 not uploaded yet". This is expected.
#    - Waits for the HTTPS certificate (usually 2–10 minutes).
#    - Asks "Apply this DNS change?" for api.unifolio.in → answer y.

# 3. Wait ~5 minutes for DNS, then check the live API (sends no email)
./scripts/waitlist-api-setup.sh smoke-test
#    Expect: an access-control-allow-origin header, then
#    {"error":"invalid_input","field":"name"} HTTP 400 → "API → Lambda path works"

# 4. Set where spot numbers start (once). Do this BEFORE any test signup.
./scripts/waitlist-api-setup.sh seed-counter <rows in the sheet>

# 5. Overview of everything
./scripts/waitlist-api-setup.sh status
```

**Then send Ayush:** the full output of steps 2–5 (nothing secret is printed).

**Later commands:**

```bash
./scripts/waitlist-api-setup.sh logs     # live Lambda logs (Ctrl+C to stop)
./scripts/waitlist-api-setup.sh deploy   # after anyone edits services/waitlist-api/*
./scripts/waitlist-api-setup.sh secret   # swap the Turnstile test secret for the real one
# change the sheet URL or reply-to: re-run step 2 with new values
```

## 9. Troubleshooting

| Message | Meaning / fix |
|---|---|
| `AWS CLI isn't signed in` / `Signed in to account X, expected 811364789032` | Wrong or no profile. `aws configure`, `aws login`, or `export AWS_PROFILE=...` |
| `SES identity updates.unifolio.in isn't verified` | Phase 1 isn't finished, or you're in the wrong region. The script always uses ap-south-1. Tell Ayush. |
| `Turnstile secret not stored yet` | Run step 1 first. |
| `waiting for the new IAM role to be usable...` | Normal on first run. It retries for 40 s. If it gives up, re-run step 2. |
| `account concurrency limit is N ... skipped the cap` | New AWS accounts have a low Lambda limit. Harmless; API rate limiting still protects it. |
| `AccessDenied` on any call | The CLI user lacks a permission. Use an admin profile. |
| Hangs at "waiting for AWS to issue it" | Certificate DNS validation. Usually < 10 min, up to ~30. If it times out, re-run step 2. It picks up where it left off. |
| smoke-test: `No CORS header` | DNS not live yet. Wait 5 min and retry. |
| smoke-test: HTTP 500 / unexpected | Run `logs` (or `status`) and send the output to Ayush. |
| `Counter already exists at N` | Someone already seeded it. The script refuses to overwrite on purpose. Ask Ayush before changing anything. |

Re-running `setup` is always safe. It updates what exists and creates what's missing.

## 10. Undo (only if asked to remove everything)

Nothing here touches existing resources, so removal is self-contained. In this order:

```bash
R=ap-south-1
aws cloudwatch delete-alarms --region $R --alarm-names waitlist-signup-handled-errors waitlist-signup-crashes waitlist-signup-throttles
aws logs delete-metric-filter --region $R --log-group-name /aws/lambda/waitlist-signup --filter-name waitlist-handled-errors
# Route 53: delete the A record api.unifolio.in and the ACM validation CNAME (_xxxx.api.unifolio.in) in the console
aws apigatewayv2 delete-domain-name --region $R --domain-name api.unifolio.in
aws apigatewayv2 delete-api --region $R --api-id <id from 'status'>
aws acm delete-certificate --region $R --certificate-arn <arn from 'aws acm list-certificates --region ap-south-1'>
aws lambda delete-function --region $R --function-name waitlist-signup
aws iam delete-role-policy --role-name unifolio-waitlist-signup-role --policy-name waitlist-signup
aws iam delete-role --role-name unifolio-waitlist-signup-role
aws logs delete-log-group --region $R --log-group-name /aws/lambda/waitlist-signup
aws logs delete-log-group --region $R --log-group-name /aws/apigateway/unifolio-waitlist-api
aws ssm delete-parameter --region $R --name /unifolio/waitlist/turnstile-secret
# Table has deletion protection on purpose (it holds real signups). Export it first if it has data, then:
#   aws dynamodb update-table --region $R --table-name unifolio-waitlist --no-deletion-protection-enabled
#   aws dynamodb delete-table --region $R --table-name unifolio-waitlist
```

## 11. Rules for the agent

- **Never modify, delete or "fix" anything that existed before this work.**
  That includes the OTP sender identity, any other SES identity or
  configuration set, account-level SES settings, other Route 53 records,
  the `infra/` Terraform, and other Lambdas or IAM roles. If a step seems to
  require that, stop and ask.
- **Region is always `ap-south-1`.** Account must be `811364789032`.
- **Get the person's explicit OK before:** running `setup` (it creates billed
  resources), answering `y` to the DNS prompt, `seed-counter`, any undo
  command, and any AWS command not in this doc.
- **Don't send real emails** while testing. `smoke-test` sends none. For SES
  tests, only use `@simulator.amazonses.com` addresses.
- **Don't print, log or commit secrets:** the Turnstile secret, the Sheet URL,
  AWS keys. Don't write a `.env` with them into the repo.
- If a run fails, read the error, check section 9, and propose a fix. Only
  edit `scripts/waitlist-api-setup.sh` or `services/waitlist-api/*` with the
  person's agreement; after editing, run `bash -n scripts/waitlist-api-setup.sh`
  and `node --test services/waitlist-api/`, and tell Ayush what changed.
- When done, summarise for Ayush: what was created, the `status` output, any
  warnings, and anything skipped.

## 12. What happens after this

1. Antigravity finishes the email template (Phase 3). Someone uploads it with
   `scripts/ses-upload-template.sh` (same laptop, same AWS access).
2. Antigravity finishes the form (Phase 4). The website build needs
   `NEXT_PUBLIC_WAITLIST_API_URL=https://api.unifolio.in/waitlist` and
   `NEXT_PUBLIC_TURNSTILE_SITE_KEY=<site key>` in `.env.production` on the
   deploying machine, then the usual `scripts/deploy.sh`.
3. End-to-end test (plan, Phase 5), swap in the real Turnstile secret if the test one was used, and launch.
