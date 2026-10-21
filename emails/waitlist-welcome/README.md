# Unifolio Waitlist Welcome Email

This directory contains the production email template for the Unifolio waitlist onboarding pass, matching Pages 6 and 7 of the Waitlist Redesign specification.

## Template Files

- **`template.html`**: Production-ready, table-based responsive HTML email with inline styles and mobile media queries.
- **`text.txt`**: Clean plain-text fallback version.
- **`subject.txt`**: Subject line (`You’re on the Unifolio waitlist`).

## Template Variables

The template expects the following 4 template variables:
- `{{firstName}}`: The recipient's first name (e.g. `Siddharth`).
- `{{spot}}`: The recipient's waitlist spot number (e.g. `1` or `1,284`).
- `{{referralUrl}}`: The referral link for the "Invite a friend →" CTA button (e.g. `https://unifolio.in?ref=abc123`).
- `{{amazonSESUnsubscribeUrl}}`: The SES one-click unsubscribe URL automatically injected by Amazon SES.

## Hosted Assets

Referenced assets in `public/email/`:
- `https://unifolio.in/Logo/Unifolio%20Logo%20Transparent.png`
- `https://unifolio.in/email/ticket.png` (2x ticket illustration)
- `https://unifolio.in/email/ring.png` (2x ring emblem)
