# Waitlist Email — Phase 1 Console Guide (SES + DNS)

Click-through version of Phase 1 from
`Docs/2026-10-08-waitlist-welcome-email-plan.md`. Does the same thing as
`scripts/ses-marketing-setup.sh`; use one or the other, not both.

**Time:** about 20 minutes of clicking, then 5–30 minutes waiting for DNS.

**Golden rule:** the login OTP emails use this same SES account. Don't edit,
delete or change settings on any identity, configuration set or
account-level setting that already exists. Everything below is **new**.

## What you'll create

| Thing | Name |
|---|---|
| SNS topic (alerts) | `unifolio-marketing-ses-alerts` |
| SES configuration set | `unifolio-marketing` |
| SES domain identity | `updates.unifolio.in` |
| Custom MAIL FROM domain | `bounce.updates.unifolio.in` |
| DMARC record (only if missing) | `_dmarc.unifolio.in` |
| SES contact list | `unifolio-marketing`, topic `product-updates` |

The order matters: the identity's default configuration set must exist
before you create the identity.

---

## Step 0 — Region and health check

1. Sign in to the AWS console, account `811364789032`.
2. Top-right region picker → **Asia Pacific (Mumbai) ap-south-1**. Check this
   again before every step below; the console sometimes jumps regions.
3. Open **Amazon Simple Email Service** → **Account dashboard**.
   - It should say the account is in **production** (not sandbox). If it says
     sandbox, stop: you're in the wrong region.
4. Open **Configuration → Identities**. Note what's already there (the OTP
   sender). Leave all of it alone.

## Step 1 — Alert topic (SNS)

1. Open **Simple Notification Service** → **Topics** → **Create topic**.
2. Type: **Standard**. Name: `unifolio-marketing-ses-alerts`. Leave the rest as is. **Create topic**.
3. On the topic page → **Create subscription**.
   - Protocol: **Email**
   - Endpoint: the team inbox that should get bounce, complaint and error alerts
   - **Create subscription**
4. Open that inbox and click **Confirm subscription** in the email from AWS.
   The subscription status changes from *Pending confirmation* to *Confirmed*.

## Step 2 — Configuration set

1. SES → **Configuration → Configuration sets** → **Create set**.
2. Fill in:
   - Configuration set name: `unifolio-marketing`
   - Sending IP pool: leave default
   - **Reputation options:** tick **Reputation metrics**
   - **Suppression list settings:** tick **Override account-level settings**, then
     enable suppression and choose **Bounce and complaint**
   - Tracking options / custom redirect domain: leave off
   - Tags: optional, e.g. `project = waitlist-email`
3. **Create set**.

### 2a — Event destination for alerts

1. Open the new set → **Event destinations** tab → **Add destination**.
2. Event types: tick **Rendering failures**, **Rejects**, **Hard bounces**, **Complaints**. Leave everything else unticked. **Next**.
3. Destination type: **Amazon SNS**. Name: `sns-alerts`. SNS topic:
   `unifolio-marketing-ses-alerts`. Event publishing: **Enabled**. **Next** → **Add destination**.

### 2b — Event destination for metrics

1. **Add destination** again.
2. Event types: tick **Sends**, **Deliveries**, **Hard bounces**, **Complaints**, and under *Open and click tracking* **Opens** and **Clicks**. **Next**.
3. Destination type: **Amazon CloudWatch**. Name: `cloudwatch-metrics`.
   - Value source: **Message tag**
   - Dimension name: `campaign`
   - Default value: `untagged`
4. **Next** → **Add destination**.

## Step 3 — Sending identity `updates.unifolio.in`

1. SES → **Configuration → Identities** → **Create identity**.
2. Identity type: **Domain**. Domain: `updates.unifolio.in`.
3. Tick **Assign a default configuration set** → choose `unifolio-marketing`.
4. Tick **Use a custom MAIL FROM domain**:
   - MAIL FROM domain: `bounce` (the console shows it as `bounce.updates.unifolio.in`)
   - Behavior on MX failure: **Use default MAIL FROM domain**
   - **Publish DNS records to Route53:** tick it (shown because `unifolio.in` is in Route 53)
5. **Verifying your domain** → Advanced DKIM settings:
   - Identity type: **Easy DKIM**
   - DKIM signing key length: **RSA_2048_BIT**
   - **Publish DNS records to Route53:** tick it
   - DKIM signatures: **Enabled**
6. Tags: optional. **Create identity**.

Because you ticked the Route 53 options, SES adds these records itself:
three `…._domainkey.updates.unifolio.in` CNAMEs, an MX on
`bounce.updates.unifolio.in` pointing to `feedback-smtp.ap-south-1.amazonses.com`,
and a TXT `"v=spf1 include:amazonses.com ~all"` on the same name. You can
see them in Route 53 → Hosted zones → `unifolio.in`.

If the Route 53 tick boxes don't appear, the identity page lists the records
under **DNS records**. Add each one by hand in Route 53 → **Create record**.

## Step 4 — DMARC (only if missing)

1. **Route 53** → **Hosted zones** → `unifolio.in`.
2. Look for a **TXT** record named `_dmarc.unifolio.in`.
   - **If one exists: stop here and leave it alone.** It covers the subdomain too.
   - If none exists → **Create record**:
     - Record name: `_dmarc`
     - Record type: **TXT**
     - Value: `"v=DMARC1; p=none; rua=mailto:dmarc@unifolio.in"`
       (swap in any real inbox for the reports; `p=none` only monitors, it never blocks mail)
     - TTL: 3600
     - **Create records**

## Step 5 — Wait for verification

SES → **Identities** → `updates.unifolio.in`. Refresh every few minutes until:

- Identity status: **Verified**
- DKIM configuration: **Successful**
- Custom MAIL FROM domain: **Successful**

Usually 5–30 minutes. If it's still pending after a few hours, compare the
records in Route 53 with the **DNS records** list on the identity page.

## Step 6 — Contact list (CloudShell, one paste)

The SES console has no screen for contact lists, so this one step uses
CloudShell, a terminal built into the console with your login already set up.

1. Click the **CloudShell** icon in the console's top bar (the `>_` square).
   Make sure the region still says **Mumbai**.
2. Check no contact list exists yet (SES allows only one per region):
   ```bash
   aws sesv2 list-contact-lists --region ap-south-1
   ```
   If it shows a list that isn't `unifolio-marketing`, stop and tell Claude
   before going further.
3. Create it:
   ```bash
   aws sesv2 create-contact-list --region ap-south-1 \
     --contact-list-name unifolio-marketing \
     --description "Unifolio marketing audience" \
     --topics '[{"TopicName":"product-updates","DisplayName":"Product updates and launch news","Description":"Sneak peeks, early access and launch news from Unifolio.","DefaultSubscriptionStatus":"OPT_IN"}]'
   ```
4. Confirm:
   ```bash
   aws sesv2 get-contact-list --region ap-south-1 --contact-list-name unifolio-marketing
   ```

The "Display name" and "Description" are what people see on SES's
unsubscribe page.

## Step 7 — Test with the mailbox simulator

These go to AWS test addresses and don't affect your sending reputation.

1. SES → **Identities** → `updates.unifolio.in` → **Send test email**.
2. Email format: **Formatted**.
3. From-address: `hello` (becomes `hello@updates.unifolio.in`).
4. Scenario: **Successful delivery**. Subject: `SES setup test`. Body: anything.
5. Configuration set: `unifolio-marketing`. **Send test email**.
6. Repeat with scenario **Bounce**, then **Complaint**.

Expected:
- Within a minute or two, two alert emails arrive at the SNS inbox, one for the bounce and one for the complaint.
- After ~15 minutes, **CloudWatch → Metrics → All metrics → SES** shows sends
  under the `campaign = untagged` dimension.

## Done checklist

- [ ] Region was Mumbai for every step
- [ ] SNS subscription **Confirmed**
- [ ] Configuration set `unifolio-marketing` with 2 event destinations
- [ ] Identity `updates.unifolio.in`: Verified, DKIM Successful, MAIL FROM Successful
- [ ] Identity's default configuration set is `unifolio-marketing`
- [ ] DMARC exists (pre-existing or new)
- [ ] Contact list `unifolio-marketing` with topic `product-updates`
- [ ] Bounce + complaint test alerts received
- [ ] Nothing about the existing OTP identity changed
