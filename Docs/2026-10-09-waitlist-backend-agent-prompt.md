Paste everything below the line into Claude Code, started on the laptop whose
AWS CLI is signed in to account 811364789032.

---

I need you to set up the AWS backend for Unifolio's waitlist welcome email,
end to end. Ayush (who planned and built it) has handed it to me to run on
this laptop because the AWS CLI here is already signed in. Do as much as you
can yourself. Only ask me what you truly can't work out or must not decide
alone, and batch your questions.

**Where things are**
- Do all the work in the **website repo**: `https://github.com/ayushkarnawat/Unifolio-website`,
  branch `redesign`. If it's not cloned on this laptop, clone it; if it is,
  check out `redesign` and pull. Confirm `scripts/waitlist-api-setup.sh` and
  `services/waitlist-api/` exist. If they don't, stop and tell me Ayush hasn't pushed yet.
- **Do not change anything in the web app repo** (the login/OTP app with
  Terraform under `infra/`). The only thing you may do there is the read-only
  search described in the handoff doc.

**Read first, completely, before doing anything in AWS**
1. `Docs/2026-10-09-waitlist-backend-handoff.md`: your instructions. Its
   "Rules for the agent" section applies throughout.
2. `Docs/2026-10-08-waitlist-welcome-email-plan.md`: background and decisions.
3. `scripts/waitlist-api-setup.sh` and `services/waitlist-api/*.mjs`: know
   exactly what will run.

**Then do these checks yourself (no need to ask me)**
- `aws sts get-caller-identity` shows account `811364789032`. If not, find a
  profile that does (`aws configure list-profiles`) and use `AWS_PROFILE`.
- Tools present: bash, python3, curl, AWS CLI v2. `node --test services/waitlist-api/` passes (12 tests) if Node 18+ is available.
- Phase 1 is in place in `ap-south-1`: SES identity `updates.unifolio.in`
  verified, configuration set and contact list `unifolio-marketing`, SNS
  topic `unifolio-marketing-ses-alerts`. Read-only `aws ... get/list` calls only.
- The read-only Terraform conflict search in the web app repo (handoff doc,
  section 3). If you can't find that repo on this laptop, ask me for its path.
- Whether the Turnstile secret already exists in SSM
  (`aws ssm get-parameter --name /unifolio/waitlist/turnstile-secret --region ap-south-1 --query Parameter.Name`).

**Then ask me, in one message, only what's still missing:**
- The Google Sheet Apps Script web app URL (`SHEET_WEBHOOK_URL`). Optional: if it doesn't exist yet, run setup without it.
- The reply-to email address (`REPLY_TO`).
- The number of signups already in the Google Sheet (for `seed-counter`).
- If the Turnstile secret isn't in SSM yet: ask me to run
  `./scripts/waitlist-api-setup.sh secret` **myself in a separate terminal**
  (it takes hidden input; I'll paste the Cloudflare secret key, or the test key
  `1x0000000000000000000000000000000AA` if the widget isn't ready). Never ask
  me to paste the secret into this chat.
- Approval to go ahead, stating plainly: it creates billed AWS resources
  (under ~$2/month) and adds the `api.unifolio.in` DNS record to the live
  unifolio.in zone.
Include anything unexpected from your checks (wrong account, failed Phase 1
check, Terraform conflicts) in the same message.

**Once I've answered and approved, run it end to end without stopping for more questions:**
1. `setup` with `SHEET_WEBHOOK_URL`, `REPLY_TO` and `APPROVE_DNS=yes`. It can
   take up to ~30 minutes while the certificate is issued, so run it in the
   background or with a long timeout and follow its output. The warning that
   email template `waitlist-welcome-v1` isn't uploaded yet is expected.
2. Wait for DNS, then `smoke-test` until it passes (retry every couple of
   minutes, for up to ~15 minutes).
3. `seed-counter <number I gave you>`.
4. `status`.

If something fails: read the error and the troubleshooting table in the handoff
doc. Re-running `setup` is safe and is usually the fix. If the fix needs a
code or script change, or any AWS action not in the handoff doc, explain it
and ask me first.

**Hard limits, even if something seems to need it:**
- Region `ap-south-1`, account `811364789032` only.
- Don't modify or delete anything that existed before: OTP SES setup, other
  identities or configuration sets, account-level SES settings, other DNS
  records, Terraform, other Lambdas or roles.
- No `terraform` commands anywhere.
- Don't send any real email. `smoke-test` sends none; don't invent other tests that would.
- Don't print or save secrets (Turnstile secret, Sheet URL, AWS keys) in
  files, commits or summaries beyond what the script itself prints.
- Don't commit or push to any repo.

**When done, give me a short report to forward to Ayush:**
- What was created.
- The `smoke-test` and `status` output.
- The counter value.
- Any warnings and anything skipped or left to do.
- Confirmation that nothing pre-existing was changed.
