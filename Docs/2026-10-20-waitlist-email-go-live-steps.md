# Waitlist welcome email: where each piece goes (step by step)

Read this first because it corrects an assumption: **the email code does not go into Google Apps Script.** In this project the email is sent by Amazon SES, using a template stored in SES. Apps Script only receives signups for the Google Sheet. Here is who does what.

| Piece | Where it lives | Who changes it |
|---|---|---|
| The pop-up form and its look | Website repo, `components/waitlist/*` | Claude (in progress) |
| The email design (HTML, text, subject, images) | Website repo, `emails/waitlist-welcome/*` and `public/email/*` | Antigravity (the handoff) |
| The stored email template | Amazon SES, template `waitlist-welcome-v1`, region `ap-south-1` | You run a script Antigravity writes |
| Sending the email, saving the spot number | The Lambda behind `https://api.unifolio.in/waitlist` (`services/waitlist-api/*`, **already built**) | Nobody, for this task |
| The Google Sheet row | Google Apps Script web app (your existing script) | Nothing needs to change |

## Today's reality (checked in the code)

- The website form still posts **directly to your Google Apps Script URL** (`NEXT_PUBLIC_WAITLIST_WEBHOOK_URL`). **No email is sent today.**
- The backend that sends the email (the Lambda) was built and tested earlier, but nothing in the website calls it yet, and there is no email template in the repo yet.
- So there are three jobs before a real welcome email can go out: (A) build and upload the template, (B) deploy the backend if it is not live yet, (C) point the website form at the backend. This task covers **A** only.

## Steps

### A. The template (this task)

1. Give Antigravity the prompt in `Docs/2026-10-20-waitlist-email-redesign-antigravity-prompt.md`. It creates the template files, the two PNG images and `scripts/ses-upload-template.sh`.
2. Review its screenshots against PDF page 6 (desktop) and page 7 (mobile).
3. **Deploy the website first** with `scripts/deploy.sh`. The email loads its images from `https://unifolio.in/email/...`, so they must exist on the live site before any real email goes out.
4. Upload the template to SES: `./scripts/ses-upload-template.sh` (it creates `waitlist-welcome-v1` the first time and updates it afterwards, and asks before changing anything). You need the AWS CLI set up for account `811364789032`, region `ap-south-1`.
5. Send yourself a test: in the SES console, open **Configuration, Email templates, waitlist-welcome-v1, Send test email**, type your own address and sample values for `firstName`, `spot` and `referralUrl`. Check it in Gmail on desktop and on your phone.

### B. The backend (only if it is not live yet)

Run, from a machine with the AWS CLI configured, the commands in `Docs/2026-10-08-waitlist-welcome-email-plan.md`, "Phase 2". In short: store the Turnstile secret, run `scripts/waitlist-api-setup.sh setup` (with `SHEET_WEBHOOK_URL` set to your current Apps Script URL), then `smoke-test`. Check `./scripts/waitlist-api-setup.sh status` first: if it shows the API and Lambda already exist, skip this step.

### C. Point the website at the backend (separate task, ask Claude later)

The form must post JSON to `https://api.unifolio.in/waitlist` with a Turnstile token instead of posting to Apps Script. The Lambda then forwards each signup to your Apps Script itself, so **the Google Sheet keeps filling in without changing the script**. Until this is done, the new template is ready but unused.

## Where Google Apps Script comes in

- **No changes are needed** in your Apps Script for the email. Keep it as it is: it keeps adding rows to the Sheet, whether the browser calls it directly (today) or the Lambda calls it (after step C).
- If you want to see the spot number in the Sheet as well, that needs a small change to the Lambda's payload and your script's column list. Ask Claude when you want it.

## If you want an email before the backend is live (not recommended)

Apps Script can send mail with `MailApp.sendEmail`, but it would send from your own Gmail account, is limited to about 100 emails a day for a normal Gmail account, has no one-click unsubscribe (which Gmail and Yahoo now require for bulk mail), and cannot show a real spot number. The SES route is the right one. If you still want this stopgap, tell me and I will write the exact Apps Script code and where to paste it (in the Sheet: **Extensions, Apps Script**, inside your existing `doPost`).
