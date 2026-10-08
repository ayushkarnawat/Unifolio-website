You are building the website half of the waitlist welcome email for the
Unifolio marketing site (this repo: Next.js 14, static export to S3 +
CloudFront). When someone submits the "Join the waitlist" pop-up, the form
will POST to a new backend at `https://api.unifolio.in/waitlist`, which saves
the signup, forwards it to the existing Google Sheet, and sends a "Waitlist
pass" email through Amazon SES. The full plan, with every decision and the
reasoning behind it, is `Docs/2026-10-08-waitlist-welcome-email-plan.md`.
Read it completely before starting. The visual reference for the email is
concept "B · Waitlist pass" on https://claude.ai/artifact/JMcTm6zTuNREbT3ZLK3PBh.

**Three repos exist; you only work in this one:**
- **Website repo (this one):** email template, template upload script, form changes.
- **Infra repo (Terraform, separate):** the Lambda, API Gateway, DynamoDB,
  `api.unifolio.in` domain and alarms. Built from its own prompt,
  `Docs/2026-10-08-waitlist-welcome-email-infra-anti-gravity-execution-prompt.md`,
  which the user carries over. Don't create Terraform or Lambda code here.
- **Web app repo (separate):** sends the login OTPs through SES. Not touched at all.

**Already done, don't redo:** Phase 1 SES/DNS setup is
`scripts/ses-marketing-setup.sh` (AWS CLI, run by the user). Treat SES
identity `updates.unifolio.in`, configuration set `unifolio-marketing`,
contact list `unifolio-marketing` (topic `product-updates`) and SNS topic
`unifolio-marketing-ses-alerts` as existing in `ap-south-1`, account `811364789032`.

**The API contract you build against** (implemented in the infra repo):
`POST https://api.unifolio.in/waitlist`, `Content-Type: application/json`,
CORS allows `https://unifolio.in`, `https://www.unifolio.in`, `http://localhost:3000`.

Request:
```json
{ "name": "Siddharth Sharma", "email": "sid@example.com", "phone": "+91 98765 43210",
  "turnstileToken": "…", "company": "", "ref": "K7M2Q9XA", "source": "/" }
```
Responses:
- `200 {"status":"joined","spot":1284}`. `spot` may be `null` (honeypot case); then drop the number from the copy.
- `200 {"status":"already_joined","spot":1031}`
- `400 {"error":"invalid_input","field":"email"}`. `field` is `name`, `email`, `phone` or absent.
- `403 {"error":"captcha_failed"}`
- `500 {"error":"server_error"}`

**Settled decisions (do not deviate without checking back):**
- Email design: Waitlist pass only. Sign-off "See you at the gate, Team Unifolio".
- The browser no longer calls the Google Sheet webhook. The backend forwards to it.
- "Bring a friend" button → `{{referralUrl}}` (lands on the homepage with a
  `?ref=` code). The referral program itself is NOT built. Only the `ref`
  capture in Task W2.
- Out of scope: `NewsletterBand.tsx`, `ContactForm.tsx`, anything OTP-related.

**Hard rules:**
- Do NOT run `scripts/deploy.sh`, `scripts/ses-upload-template.sh` (except
  `bash -n`), or any AWS command that creates, updates or sends. Read-only
  `aws ... get-*/list-*` is fine.
- No secrets in code or committed env files.

---

**Task E1 — Email template**
Add `mjml` as a devDependency. Create `emails/waitlist-welcome/template.mjml`,
`text.txt`, `subject.txt` per plan Phase 3, matching the Waitlist pass mockup
(content, colours, order). Barcode from table cells, no images except the
ring logo. Export the logo into `public/email/` at 2× (pick the segmented
green ring from `public/Logo/` that best matches the mockup, resized). Use
absolute `https://unifolio.in/email/...` URLs. Placeholders: `{{firstName}}`,
`{{spot}}`, `{{referralUrl}}`, `{{amazonSESUnsubscribeUrl}}`. Leave the
registered address and privacy URL as clearly marked `[REGISTERED ADDRESS]` /
`[PRIVACY URL]` placeholders if the user hasn't supplied them. Compile and
confirm the HTML is under 100 KB. Save a rendered preview with sample data to
`emails/waitlist-welcome/preview.html` (add it to `.gitignore`) and screenshot
it at 600 px and 375 px wide.

**Task E2 — Template upload script**
`scripts/ses-upload-template.sh`, in the same style as
`scripts/ses-marketing-setup.sh` (set -euo pipefail, `SES_REGION` required,
account check against `811364789032`): compile MJML, build the
`--template-content` JSON safely (use `node -e` or `jq` for escaping, never
string concatenation), create `waitlist-welcome-v1` if missing or update it.
Also support `./scripts/ses-upload-template.sh preview`, which calls
`aws sesv2 test-render-email-template` with sample data and prints the
rendered subject. Syntax-check with `bash -n` only.

**Task W1 — Form talks to the API**
`components/waitlist/WaitlistForm.tsx` per plan Phase 4: JSON POST to
`NEXT_PUBLIC_WAITLIST_API_URL`, remove the browser webhook call, Turnstile
(explicit render, `appearance: "interaction-only"`, reset on failure),
honeypot, `ref` and `source`, consent line, and the five result states with
the exact copy in the plan. Success stays visible ~4 s before `onSuccess`.
Keep the existing visual style: same input classes, same green button,
same success card, same error row. If the env var is missing, show the
generic error state and `console.error` a clear message, never a silent
fake success.

**Task W2 — Referral capture**
`components/waitlist/RefCapture.tsx` (client, renders null) mounted once in
`app/layout.tsx`; validates `ref` against `^[A-HJ-NP-Z2-9]{8}$` and stores it
in sessionStorage `uf_ref`, all storage access in try/catch.

**Task W3 — Modal copy**
`components/waitlist/WaitlistModal.tsx`: replace "No spam, just one email
when it's your turn." with the plan's new copy. Nothing else changes.

**Task W4 — Env example**
Add `.env.production.example` listing `NEXT_PUBLIC_WAITLIST_API_URL` and
`NEXT_PUBLIC_TURNSTILE_SITE_KEY` with comments. Make sure `.gitignore` still
ignores real `.env*` files but not the `.example`.

**Verification before you report done:**
- `npm run build` passes. Temporarily re-enable `output: "export"` in
  `next.config.mjs` to prove the static export builds, then restore the file
  exactly as it was.
- `npm run lint` and `npm test` pass. Add a vitest test for the form's
  response handling if it fits the existing test setup.
- Run the site locally with Turnstile's always-pass test site key
  (`1x00000000000000000000AA`) and `NEXT_PUBLIC_WAITLIST_API_URL` pointing at
  a tiny local mock server (in `scripts/`, not shipped) that returns each of
  the five responses in turn. Screenshot every form state in the modal at
  desktop and 375 px.
- Email preview screenshots at 600 px and 375 px.

**Report back with:** files changed, test output, screenshots, every
placeholder still waiting on the user, and anything in the API contract
above that turned out to be awkward for the frontend (so the infra prompt
can be adjusted before it runs).
