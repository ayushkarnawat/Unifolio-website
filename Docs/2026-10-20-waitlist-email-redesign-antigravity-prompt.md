You are building the redesigned welcome email for the Unifolio waitlist. The design is approved. Another agent is building the website pop-up at the same time, so stay strictly inside the email scope below.

**Read first, in this order:**
1. `Docs/2026-10-20-waitlist-email-redesign-handoff.md` (your full brief: design, rules, files, definition of done). Follow it.
2. `Unifolio Website Join the waitlist form redesign 1.pdf` in the repo root. Pages 6 and 7 are the email (desktop and mobile).
3. `Docs/reference/waitlist-redesign-prototype.html`. Open it in a browser, go to "2. The welcome email" and use the Desktop / Mobile switch. Read its source (`mail()`, `ticket()` and the `.mail`, `.pass`, `.mnext`, `.mcta` CSS) for exact sizes, colours and text. It uses modern CSS for review only. The real email must be table-based with inline styles.
4. `Docs/2026-10-08-waitlist-welcome-email-plan.md` ("Architecture" and "Phase 3") and `services/waitlist-api/index.mjs` (`mailer.sendWelcome`) so your template uses exactly the variables the backend sends.

**Build:**
- `emails/waitlist-welcome/template.mjml` (or hand-written table HTML), `emails/waitlist-welcome/text.txt`, `emails/waitlist-welcome/subject.txt`, a short `emails/waitlist-welcome/README.md`.
- `public/email/ticket.png` and `public/email/ring.png`, rendered from the prototype's SVGs (Gmail strips SVG). Reference them as `https://unifolio.in/email/...`.
- `scripts/ses-upload-template.sh`: compiles and creates/updates the SES template `waitlist-welcome-v1` in `ap-south-1`. It must ask before changing anything and support a dry run that prints what it would do and calls no AWS command.
- Variables: `{{firstName}}`, `{{spot}}`, `{{referralUrl}}`, `{{amazonSESUnsubscribeUrl}}` only.
- Subject `You’re on the Unifolio waitlist`; hidden preview text `Your early access pass is inside.`

**Follow the handoff's mobile rules exactly** (compact illustration, stacked single column, 16 to 20px between list items, full-width button, larger type, about 600px wide and responsive). It must work with images blocked, with alt text on every image, and the compiled HTML must stay under about 100 KB.

**Hard rules:**
- Do not touch `components/waitlist/*`, `services/waitlist-api/*`, any other AWS script, or anything outside the files listed above.
- Do not call AWS, send any email, or deploy anything. The user will run the upload script and deploy themselves.
- The working tree has many uncommitted changes by the user. Never run `git add -A`, `git checkout`, `git restore`, `git stash` or `git reset`. Do not commit.
- No "bank grade" wording and no mention of PAN anywhere.
- If the PDF, the prototype and the handoff disagree, the PDF wins for copy and the prototype for layout. Note any difference in your report.

**Verify before reporting:** compile the template, check it contains no `<svg`, no external CSS or JS, and no variables other than the four above, and check the file size. Render it with headless Chrome using sample values (firstName Siddharth, spot 1,284) at 600px and at 390px wide, and look at both screenshots against PDF pages 6 and 7.

**Final report:** the files you created, the screenshots, how to preview and how to run the upload script (including the dry run), the open questions listed in the handoff (subject and preview, spot number, referral link, footer address and privacy link), and what you could not verify (real Gmail and Outlook rendering needs a test send by the user).
