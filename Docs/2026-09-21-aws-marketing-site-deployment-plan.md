# Deploying the Marketing Site (Unifolio-website) to AWS at unifolio.in

**Date:** 2026-09-21
**Status:** All decisions confirmed. Code changes, Terraform files, and the deploy script are written and verified (build succeeds, `terraform validate`/`plan` succeed). The one remaining step — `terraform apply`, which creates real billed AWS resources and changes live DNS for `unifolio.in` — has **not** been run yet, pending your final go-ahead.

## Decisions (confirmed)

1. **Forms (contact, newsletter, future waitlist) — no backend at all.** You're building a Google Sheet + Apps Script Web App as the "backend." The two Next.js API routes (`app/api/contact`, `app/api/newsletter`) have been deleted — static export doesn't support server routes, and you don't need one anyway. See "Forms" section below for exactly how to wire them up once your Apps Script URLs exist.
2. **Branch strategy:**
   - `dark-mode` → your localhost working branch (unchanged, keep developing here).
   - `redesign` → stays connected to Vercel, becomes your staging/preview link.
   - `main` → new branch, is what deploys to `unifolio.in` via AWS. Created locally already (pointing at `redesign`'s current tip), not yet pushed to GitHub.
3. **Deploy method — manual script, no CI/CD yet.** `scripts/deploy.sh` in this repo, run by hand whenever you want to push a new build live. Bucket name and CloudFront distribution ID are hardcoded constants in the script (they're not secrets — just fixed labels for already-created AWS resources).

---

## How the two repos relate (no git link — only a shared AWS account)

There's no submodule, no shared CI, no live connection between `Unifolio-website` and `D:\Unifolio code`. They only meet at two distinct moments:

```
Unifolio code repo (Terraform, infra/envs/marketing/)
        │
        │  terraform apply — ONE TIME (or rare infra changes)
        ▼
  S3 bucket + CloudFront distribution + Route 53 records for unifolio.in/www
        │
        │  bucket name + distribution ID, copied once into scripts/deploy.sh
        ▼
Unifolio-website repo (this repo)
        │
        │  git push to main → npm run build → aws s3 sync → cloudfront invalidate
        │  (EVERY deploy — no infra repo involvement at all)
        ▼
                          live on unifolio.in
```

Day-to-day, you never need `D:\Unifolio code` open or even present on disk to ship a change to `unifolio.in`. You only go back to it if you ever need to change the infrastructure itself (e.g. cache TTL, a redirect rule).

---

## What's been done already (verified, not yet applied to AWS)

### 1. Code changes (this repo, `Unifolio-website`) — committed nowhere yet, sitting as local changes on `dark-mode`

- **`next.config.mjs`** — added `output: "export"` and `images: { unoptimized: true }`.
- **Deleted** `app/api/contact/route.ts` and `app/api/newsletter/route.ts` (unsupported under static export; they were non-functional stubs anyway).
- **`components/sections/ContactForm.tsx`** and **`components/layout/NewsletterBand.tsx`** — rewired to read a webhook URL from an env var (`NEXT_PUBLIC_CONTACT_WEBHOOK_URL` / `NEXT_PUBLIC_NEWSLETTER_WEBHOOK_URL`) instead of calling the deleted API routes. If the env var isn't set at build time, the form just shows success without sending anywhere — identical to today's actual behavior (the old stub routes never sent anywhere either). Verified: `npm run build` succeeds, produces a complete `./out` static export (12 pages, 170MB including video/image assets), zero errors.

**Forms — what to do when your Google Apps Script Web App exists:** set two env vars before building —
```bash
NEXT_PUBLIC_CONTACT_WEBHOOK_URL=https://script.google.com/macros/s/XXXXX/exec
NEXT_PUBLIC_NEWSLETTER_WEBHOOK_URL=https://script.google.com/macros/s/YYYYY/exec
```
— either in a `.env.production.local` file (gitignored, not committed) or exported in your shell before running `scripts/deploy.sh`. No code changes needed at that point; the fetch calls are already wired to those two env vars, they just no-op until the vars are set. The two components POST with `mode: "no-cors"` since a standard Apps Script Web App response isn't readable cross-origin — this is the normal pattern for this integration, not a bug; the form treats "no fetch error thrown" as success. When you're ready to build the "join waitlist" form (currently just a button, no form component exists yet), the same pattern applies — ask me and I'll wire it the same way.

### 2. Terraform (`D:\Unifolio code\infra\`) — written, initialized, planned; not applied

- **`infra/modules/frontend/`** — small, non-breaking addition: a new `additional_aliases` variable (defaults to `[]`, so the existing `staging`/`docs` callers are unaffected) lets one CloudFront distribution serve two domain aliases.
- **New `infra/envs/marketing/`** — a completely separate Terraform environment/state file (own key inside the same state bucket staging already created), so nothing here can ever be touched by a staging `terraform apply`/`destroy` mistake. Contains: ACM certificate for `unifolio.in` with `www.unifolio.in` as a second SAN (both validated via Route 53 DNS records), the reused `frontend` module (S3 + CloudFront + OAC — identical pattern to `staging.unifolio.in`/`docs.unifolio.in`), and two Route 53 `A`/`ALIAS` records (apex + www) both pointing at the same CloudFront distribution.
- **Verified:** `terraform init` (connects to the existing state backend, creates nothing), `terraform validate` (passes), `terraform plan` (confirmed exactly **11 resources to add, 0 to change, 0 to destroy** — ACM cert + validation, 4 Route 53 records, S3 bucket + policy + public-access-block, CloudFront distribution + OAC).

### 3. `main` branch — created locally, not pushed

`git branch main redesign` was run — `main` now exists locally, pointing at whatever `redesign`'s tip commit was at the time. It has not been pushed to GitHub yet, and none of the code changes above have been committed to it (they're still uncommitted, local-only changes sitting on `dark-mode`).

### 4. `scripts/deploy.sh` — written, executable, not yet runnable

The 4-step deploy script (build → sync to S3 → invalidate CloudFront) exists at `scripts/deploy.sh`. It currently has a placeholder for `CLOUDFRONT_DISTRIBUTION_ID` (a real value doesn't exist until `terraform apply` creates the distribution) and will refuse to run until that's filled in.

---

## What's left, in order

### Step A — one-time: `terraform apply` (needs your explicit go-ahead — creates real, billed resources and changes live DNS)

```bash
cd "D:\Unifolio code\infra\envs\marketing"
terraform apply
```
Terraform will show the same 11-resource plan again and ask for a `yes` confirmation. ACM DNS validation typically takes a few minutes; CloudFront distribution creation can take 10-20 minutes. Once it finishes:
```bash
terraform output s3_bucket_name              # should print unifolio-marketing-frontend-811364789032
terraform output cloudfront_distribution_id  # paste this into scripts/deploy.sh
```
Paste the printed distribution ID into `CLOUDFRONT_DISTRIBUTION_ID` in `scripts/deploy.sh`, replacing the placeholder. This is the only manual hand-off between the two repos, and it only happens once (again, only re-run if the infra itself changes).

I have AWS credentials configured in this environment and can run this for you directly if you'd like — just say so. Otherwise, run it yourself from a machine with AWS CLI access to account `811364789032`.

### Step B — commit the code changes and get them onto `main`

```bash
# from the Unifolio-website repo, on dark-mode (where the changes currently sit)
git add next.config.mjs components/sections/ContactForm.tsx components/layout/NewsletterBand.tsx scripts/deploy.sh
git status   # confirm app/api/contact and app/api/newsletter show as deleted
git commit -m "Convert to static export for AWS hosting; forms deferred to Google Sheets webhook"

# merge dark-mode's relevant work into redesign when you're ready to test it on Vercel,
# then promote redesign into main when you're ready to go live:
git checkout redesign && git merge dark-mode
git checkout main && git merge redesign
git push origin main   # first push — also creates the branch on GitHub
```
(This is your call on timing/exact merge points — the mechanical steps above are just what "promote to main" looks like given the branch strategy above.)

### Step C — every deploy after that, whenever you want a new build live

```bash
cd /path/to/Unifolio-website
git checkout main && git pull
./scripts/deploy.sh
```
That's the entire day-to-day loop. It rebuilds, syncs the static export to S3, and invalidates CloudFront. Takes a few minutes end to end (most of it is the CloudFront invalidation propagating, typically under a minute in practice for `PriceClass_100`).

---

## Confirming this is real once live

After Step A finishes and Step C has run at least once:
```bash
curl -sI https://unifolio.in | head -5
curl -sI https://www.unifolio.in | head -5
```
Both should return `HTTP/2 200` with a `cloudfront`-flavored `via`/`x-cache` header. Full propagation of the new Route 53 records can take a few minutes even after `terraform apply` reports success.
