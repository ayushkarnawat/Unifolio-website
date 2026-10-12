# Implementation Plan: Google Sheets & Amazon SES Form Integration

**Date:** 2026-10-10 (Updated: 2026-10-12)  
**Status:** Ready for Review (Updated: SES emails strictly for Waitlist; Contact form is Sheet-logging only)  
**Target:** Waitlist Popup (`WaitlistForm.tsx`) & Contact Us Forms (`ContactForm.tsx` & `BlueprintContact.tsx`)  
**Reference Template:** `Docs/Waitlist Welcome Email (1).html` (Concept B · Waitlist Pass)  
**Core Constraint:** **Zero DynamoDB / Zero database overhead.** Google Sheets serves as the single source of truth; Amazon SES sends the branded welcome email for Waitlist signups only.

---

## 1. Executive Summary & Architecture

### Goal
Provide an automated, zero-database pipeline for form submissions on `unifolio.in`:
1. **Waitlist Signups ("Join the waitlist"):** Entry is appended to the **`Waitlist`** Google Sheet tab, unique **Waitlist Spot Number** (#) is calculated from the row index, and a branded **Waitlist Pass** welcome email (matching `Docs/Waitlist Welcome Email (1).html`) is dispatched via **Amazon SES**.
2. **Contact Inquiries:** Submissions (from `/contact` and homepage `#contact`) are logged directly to the **`Contact Inquiries`** tab. **No emails are sent via SES for contact submissions as of now.**

### High-Level Architecture (Direct Apps Script Engine)

```
[ Frontend: unifolio.in ]
    │
    │  POST JSON payload (formType: 'waitlist' | 'contact')
    ▼
[ Google Apps Script Web App (doPost) ]
    │
    ├─► 1. Verify Bot Check (Honeypot) & Validate Inputs
    │
    ├─► If formType === 'contact':
    │       └─► Append Row to 'Contact Inquiries' tab -> Return { success: true } (NO SES email)
    │
    └─► If formType === 'waitlist':
            ├─► Check for Duplicate Email (Prevent spamming/re-sending)
            ├─► Append Row to 'Waitlist' tab
            ├─► Derive Spot # (sheet.getLastRow() - 1, formatted e.g. #1,284)
            └─► Dispatch "Waitlist Pass" via AWS SES v2 REST API (updates.unifolio.in)
```

---

## 2. Architecture Comparison: Option A vs. Option B

| Dimension | **Option A: 100% Google Apps Script** (Recommended) | **Option B: Micro-Lambda (No DynamoDB)** |
|---|---|---|
| **AWS Resources Needed** | **SES Only** (Identity `updates.unifolio.in` + 1 IAM User) | API Gateway + Lambda + IAM Role + SES |
| **Database** | Google Sheets | Google Sheets |
| **AWS Maintenance** | Zero infra to deploy, monitor, or patch | 1 Lambda function and 1 API route to maintain |
| **Credentials** | IAM Key stored in Google Apps Script Script Properties | IAM Role attached to Lambda |
| **Latency / Response** | 1.5s – 2.5s (Google Cloud cold start) | < 600ms |
| **Best For** | Minimum complexity, fast launch, self-contained | High-volume traffic or strict sub-second SLA |

*Decision:* Proceed with **Option A** to satisfy the requirement of minimal backend overhead.

---

## 3. Data Schema (Google Sheet)

Create a single Google Sheet named **`Unifolio Website Submissions`** with two sheets/tabs:

### Tab 1: `Waitlist`
| Col A | Col B | Col C | Col D | Col E | Col F | Col G |
|---|---|---|---|---|---|---|
| `Timestamp` | `Spot #` | `Full Name` | `First Name` | `Email Address` | `Phone Number` | `SES Status` |

- **Spot Calculation**: `const spot = sheet.getLastRow() - 1;` (ignoring header).
- **Formatted Spot String**: Formatted with comma separators (e.g., `1,284` or `#1,284`).
- **Deduplication Rule**: If `Email Address` already exists in Column E:
  - Return `{ status: "already_registered", spot: existingSpot }` without firing a duplicate SES email.
- **SES Status**: Records AWS SES Message ID (e.g., `Sent: 0100018...`) or error string.

### Tab 2: `Contact Inquiries`
| Col A | Col B | Col C | Col D | Col E | Col F | Col G |
|---|---|---|---|---|---|---|
| `Timestamp` | `Full Name` | `Email Address` | `Phone Number` | `Inquiry Nature` | `Message` | `Source` |

- **Field mapping:**
  - `Phone Number`: Captured from `/contact`; blank if submitted from homepage conversational flow.
  - `Inquiry Nature`: Captured from `/contact` dropdown; defaults to `"General Inquiry"` for homepage flow.
  - `Message`: Captured from `/contact` (`message`) or homepage flow (`description`).
  - `Source`: `"Contact Page"` or `"Homepage Flow"`.
- **Email Sending:** **Disabled.** Submissions are strictly stored in the sheet.

---

## 4. Email Template Specification (Waitlist Pass Only)

The email template applies **strictly to Waitlist signups**. Selected design is **Concept B: The Waitlist Pass** from `Docs/Waitlist Welcome Email (1).html`.

### 4.1. Waitlist Pass Email Anatomy

```
┌─────────────────────────────────────────────────────────────┐
│ Inbox View:                                                 │
│ From: Unifolio <hello@updates.unifolio.in>                  │
│ Reply-To: Siddharth Surve <siddharth.surve@unifolio.in>     │
│ Subject: You're in. Spot #{{spot}} is yours 🎟️              │
│ Preview text: Your mutual funds have no idea what's coming. │
└─────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ [Logo] unifolio                                             │
│                                                             │
│ You're on the list, {{firstName}}.                          │
│ Your early-access pass is below. Keep it safe.              │
│ (It's an email. It's very safe.)                            │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ EARLY ACCESS PASS                         #{{spot}}     │ │  <-- Dark card (#1C241E)
│ │                                           (Green 44px)  │ │      with aperture icon
│ │ PASSENGER         BOARDING                GATE          │ │
│ │ {{firstName}}     Launch day              Your inbox    │ │
│ │ - - - - - - - - - - - - - - - - - - - - - - - - - - - - │ │  <-- Dashed perforation
│ │ |||||||||||||||||||||||||         Fees on board: ₹0     │ │  <-- Barcode + Class
│ │ (Barcode lines)                   Class: Free forever   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 1  Sneak peeks first. You'll see screens before anyone      │
│    on Twitter does.                                         │
│ 2  Early door. Waitlist members get in before the           │
│    public launch.                                           │
│ 3  Light homework. Find your CAS statement from CAMS or     │
│    KFintech. That one file is all Unifolio needs.           │
│                                                             │
│ [ Bring a friend along → ]   (#22C55E Pill Button)          │
│                                                             │
│ See you at the gate,                                        │
│ Team Unifolio                                               │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│ You're getting this because you joined the Unifolio         │
│ waitlist at unifolio.in.                                    │
│ Unifolio · Mumbai, India · Unsubscribe                      │
└─────────────────────────────────────────────────────────────┘
```

### 4.2. Dynamic Template Variables

| Variable | Extracted From | Example Value | Where Used |
|---|---|---|---|
| `{{firstName}}` | `name.trim().split(/\s+/)[0]` | `Siddharth` | Subject fallback, greeting, passenger name |
| `{{spot}}` | `Number(sheet.getLastRow() - 1).toLocaleString("en-IN")` | `1,284` | Subject line, big ticket display |
| `{{referralUrl}}` | `https://unifolio.in/?ref=` + optional hash | `https://unifolio.in` | "Bring a friend along →" CTA button |

---

## 5. Contact Inquiries Policy

- **No automated emails** will be dispatched for contact submissions at this stage.
- Inquiries are recorded with timestamp and source in the `Contact Inquiries` tab for manual review by the founders.
- Can be upgraded in the future to auto-reply or notify founders with zero architectural changes.

---

## 6. Amazon SES & Google Apps Script Wiring

### 6.1. SES Configuration (AWS Console)
1. Verify identity `updates.unifolio.in` (in `ap-south-1` Mumbai).
2. Create dedicated IAM User `unifolio-apps-script-mailer` with inline policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ses:SendEmail", "ses:SendRawEmail"],
      "Resource": "arn:aws:ses:ap-south-1:811364789032:identity/updates.unifolio.in"
    }
  ]
}
```
3. Store `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in Google Apps Script **Script Properties**.

### 6.2. Google Apps Script Logic (`Code.gs`)
The script contains:
1. **`doPost(e)`**: Parses incoming form JSON/payload.
2. **Honeypot Check**: Silently exits with `{ success: true }` if bot field (`company`) has a value.
3. **Route Handling**:
   - If `formType === 'contact'`: Logs to `Contact Inquiries` tab and returns `{ success: true }`.
   - If `formType === 'waitlist'`: Checks duplicates, appends to `Waitlist` tab, calculates `spot`, renders Boarding Pass template, signs via SigV4, and sends via SES v2.

---

## 7. Execution Checklist

- [ ] **Step 1: Google Sheet Setup** — Create sheet with tabs `Waitlist` (7 columns) and `Contact Inquiries` (7 columns).
- [ ] **Step 2: Deploy Apps Script** — Paste complete `Code.gs` with SigV4 helper, Boarding Pass HTML template, and handlers. Set script properties (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `SENDER_EMAIL`). Deploy as Web App.
- [ ] **Step 3: Frontend Webhook Link** — Update `WaitlistForm.tsx`, `ContactForm.tsx`, and `BlueprintContact.tsx` to target the web app URL.
- [ ] **Step 4: End-to-End Test (Waitlist)** — Submit test email via Waitlist pop-up → Confirm sheet row added → Confirm spot number (#) is correct → Verify Boarding Pass email delivery in inbox.
- [ ] **Step 5: End-to-End Test (Contact)** — Submit test inquiry from `/contact` and homepage flow → Confirm row added to `Contact Inquiries` → Confirm **NO email** is sent.
