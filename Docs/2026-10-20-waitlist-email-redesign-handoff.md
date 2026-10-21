# Waitlist welcome email redesign: handoff for Antigravity

**Status:** the design is approved by the user. This is the email half of the "Join the waitlist" redesign. The pop-up half (desktop, tablet, phone) is being built separately by Claude and is **not** in your scope. Do not touch `components/waitlist/*`.

This document, the PDF and the prototype HTML are everything you need. The existing plan `Docs/2026-10-08-waitlist-welcome-email-plan.md` still describes the infrastructure (SES, Lambda, DynamoDB). **This handoff replaces that plan's email design (its "Phase 3: The email" section) and nothing else.**

## 1. What to read first

1. `Unifolio Website Join the waitlist form redesign 1.pdf` in the repo root (7 pages). Pages 6 and 7 are the email: page 6 desktop, page 7 mobile with the mobile-specific rules.
2. `Docs/reference/waitlist-redesign-prototype.html`: an interactive prototype of the whole batch. Open it in a browser. Section 2 ("The welcome email") has a **Desktop / Mobile** switch and is the visual and structural reference. Read its source: the functions `mail()` and `ticket()` and the CSS classes `.mail .mhead .mtop .ill .pass .cols3 .dash .pbot .bars .stt .mnext .mi .mcta .mfoot` hold every size, colour and string. The prototype is built with modern CSS for review only; **the real email must be table-based with inline styles** (see section 4).
3. `Docs/2026-10-08-waitlist-welcome-email-plan.md`, sections "Architecture", "Phase 2", "Lambda behaviour" and "Phase 3" (for how the template is stored, uploaded and sent).
4. `services/waitlist-api/index.mjs` (the `mailer.sendWelcome` function) and `services/waitlist-api/handler.mjs`. **Do not modify these** unless a step in section 6 says so.

## 2. The design

The email replaces the old "Waitlist pass" content (sign-off "See you at the gate") with a new layout, headline and copy. The idea (a dark boarding-pass style early-access card) is kept.

Top to bottom, in a 600 px wide white card on a very light mint page (`#F2FBF5`):

| # | Block | Content |
|---|---|---|
| 1 | Header row | Unifolio logo on the left (`https://unifolio.in/Logo/Unifolio%20Logo%20Transparent.png`, about 24 px tall, `alt="Unifolio"`). On the right, the label `EARLY ACCESS` in green `#22C55E`, 10.5 px, extra bold, letter-spaced. |
| 2 | Headline and illustration | `Thank you for joining the Unifolio waitlist.` (the word `waitlist.` in green). Under it `Your early access pass is below. Keep it safe.` (13 px, `#6B7A70`). On the right a small ticket and paper-plane illustration (about 150 px wide on desktop, about 96 px on mobile). |
| 3 | Early access pass | Dark card, gradient `#14221B` to `#0E1A14`, radius 16 px. Small green label `UNIFOLIO EARLY ACCESS PASS`. A big green `#` plus the person's spot number (46 px, extra bold, `#22C55E`). A ring mark at the top right (white ring with a green quarter). Three columns: `NAME` `{{firstName}}`, `PRIORITY` `Early Access`, `UPDATES` `By email` (labels tiny grey-green caps, values bold white). A dashed divider. A row of thin vertical bars (barcode look) on the left and `STATUS` / `Confirmed` (green) on the right. |
| 4 | What happens next? | Heading with an envelope icon. Three items, each with a green check inside a light green circle: **Early access** `We’ll let you know when Unifolio is ready to try.` / **Product updates** `Hear about new features and what’s taking shape.` / **A clearer view of your wealth** `Stay in the loop as we build smarter ways to understand your family’s finances.` |
| 5 | Button | Green pill `Invite a friend →`, link `{{referralUrl}}`. Full width on mobile. |
| 6 | Footer | A thin line, then `We’ll be in touch soon.` and `Team Unifolio` in bold. |

Colours: green `#22C55E`, ink `#111613`, muted `#6B7A60` family as in the prototype (`#6B7A70`), mint circles `#EAF8EF`, page `#F2FBF5`. Fonts: Manrope for headings with `Arial, Helvetica, sans-serif` fallback (email clients may not load web fonts).

### Mobile rules (from PDF page 7; follow exactly)

- Smaller illustration (compact), not the large one.
- Stack all content, single column. The early access pass is full width.
- The "What happens next?" items are one column, **16 to 20 px between items**, with clear icons.
- Full-width "Invite a friend" button.
- Keep it clean: larger font sizes and spacing, no side-by-side sections, remove non-essential decoration, good contrast, keep the email about **600 px wide and responsive**.

## 3. Decisions (made by Claude, please keep unless the user changes them)

The PDF is silent on these, so I chose. The user has not answered the questions yet; surface them in your final report.

| Topic | Decision |
|---|---|
| Subject line | `You’re on the Unifolio waitlist` (no emoji) |
| Preheader (hidden preview text) | `Your early access pass is inside.` |
| Spot number | The person's real waitlist spot from the existing counter (`{{spot}}`). The pass always says `Priority: Early Access` for everyone. If `spot` is missing (the honeypot case never sends mail, but be safe), the template must still read well: use a version of the pass without the big number. |
| `Invite a friend` link | `{{referralUrl}}` exactly as the backend already builds it (website with a quiet `ref` code). |
| Unsubscribe | Keep the SES one-click unsubscribe machinery: footer link to `{{amazonSESUnsubscribeUrl}}`. Add it as a small grey line **under** "Team Unifolio" (it is not in the PDF but SES and Gmail require it). |

## 4. Build rules for the email

- Table layout, inline styles, 600 px max width, `<meta name="color-scheme" content="light">`, explicit backgrounds everywhere so Gmail dark mode does not wash out the pass card.
- No SVG (Gmail strips it). The ticket and plane illustration and the ring mark on the pass must be **PNG** files in `public/email/` (create the folder; export at 2x, for example `ticket.png` about 300 px wide and `ring.png` about 60 px), referenced by absolute `https://unifolio.in/email/...` URLs, with `alt` text, and the email must still read well with images blocked. Render them from the prototype: `ticket()` is the illustration, the `.rg` svg inside `mail()` is the ring.
- The barcode is a row of narrow table cells with inline background colours, not an image.
- Work with images blocked; every image has `alt`. Keep the compiled HTML under about 100 KB so Gmail does not clip it.
- Use **MJML** as the plan says (`emails/waitlist-welcome/template.mjml`, `npx mjml`, add `mjml` as a devDependency), or plain hand-written table HTML if you prefer; either way the final compiled HTML is what gets uploaded.
- Template variables SES will fill: `{{firstName}}`, `{{spot}}`, `{{referralUrl}}`, `{{amazonSESUnsubscribeUrl}}`. These are exactly the fields `mailer.sendWelcome` already passes (`TemplateData` is `{ firstName, spot, referralUrl }`; SES adds the unsubscribe URL itself).

## 5. Files to create

- `emails/waitlist-welcome/template.mjml` (or `.html`), `emails/waitlist-welcome/text.txt` (plain-text version with the same content), `emails/waitlist-welcome/subject.txt` (the subject above).
- `public/email/ticket.png`, `public/email/ring.png`.
- `scripts/ses-upload-template.sh`: compiles the template and creates it in SES the first time (`aws sesv2 create-email-template`) and updates it after (`update-email-template`), template name `waitlist-welcome-v1`, region `ap-south-1`, using subject, HTML and text from the files above. Keep it re-runnable and make it ask before changing anything.
- A short `emails/waitlist-welcome/README.md` describing the variables and how to preview (for example, compile and open the HTML in a browser with sample values substituted).

## 6. Out of scope

- The pop-up UI and the form (`components/waitlist/*`): Claude is building it.
- Switching the form from the Google Apps Script URL to `https://api.unifolio.in/waitlist` and adding Turnstile: that is "Phase 4" of the old plan and is **not** part of this task. Today the website form still posts straight to Apps Script, so **no email is sent yet**. See the go-live steps document.
- Any change to `services/waitlist-api/*`, the AWS setup scripts, DynamoDB, DNS, or the Google Apps Script.
- Sending real emails to real people. For testing, only use the SES mailbox simulator or the user's own address, and only after asking.

## 7. Definition of done

1. The three template files, the two PNGs, the upload script and the README exist.
2. The compiled HTML contains no `<svg`, no `{{` outside the four allowed variables, and no external CSS or JS. Compile it and check its size.
3. Rendering the HTML locally with sample values (`firstName` Siddharth, `spot` 1,284, any referral URL) matches the PDF page 6 at 600 px wide, and at 390 px wide matches the mobile rules above. Take screenshots with headless Chrome and look at them.
4. The upload script runs in dry-run or "show me what you would do" mode without calling AWS unless the user confirms.
5. Final report: the files, the screenshots, the open questions from section 3, and anything you could not verify (real Gmail and Outlook rendering needs a test send, which the user will do).

## 8. Open questions for the user (carry into your report)

1. Is the subject line `You’re on the Unifolio waitlist` and the preview `Your early access pass is inside.` right?
2. Should the pass show the person's real spot number, and is `Priority: Early Access` the same for everyone?
3. Is `Invite a friend` still pointing at the website with the quiet referral code?
4. What registered business address and privacy-policy link should the footer show? (The old plan lists these as needed from the user. The PDF footer does not include them.)
