#!/usr/bin/env bash
# Manual deploy: builds the static export and pushes it live to unifolio.in.
#
# Run this from the "main" branch, after it has whatever you want live on
# unifolio.in merged into it. Nothing here touches Terraform/AWS resource
# creation — it only uploads content to resources that already exist
# (created once via `terraform apply` in D:\Unifolio code\infra\envs\marketing).
#
# Prerequisites: AWS CLI configured with an account that can write to the
# bucket below and invalidate the CloudFront distribution below.
set -euo pipefail

# Filled in once, after the one-time `terraform apply` — see
# Docs/2026-09-21-aws-marketing-site-deployment-plan.md. Not secrets, just the
# fixed names of already-created AWS resources.
S3_BUCKET="unifolio-marketing-frontend-811364789032"
CLOUDFRONT_DISTRIBUTION_ID="E3UL8HCJRE12OO"

branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ "${branch}" != "main" ]]; then
  echo "Warning: you're on branch '${branch}', not 'main'." >&2
  read -r -p "Deploy this branch to unifolio.in anyway? [y/N] " confirm
  [[ "${confirm}" == "y" || "${confirm}" == "Y" ]] || exit 1
fi

echo "==> Installing dependencies"
npm ci

echo "==> Building static export"
npm run build

echo "==> Syncing ./out to s3://${S3_BUCKET}"

# 1. Sync hashed Next.js chunks (_next/static/) with long-term immutable caching.
#    DO NOT pass --delete here: keeping previous chunks ensures visitors with open tabs
#    or cached HTML do not encounter ChunkLoadError (404) when navigating or lazy-loading.
aws s3 sync ./out/_next/static "s3://${S3_BUCKET}/_next/static" \
  --cache-control "public, max-age=31536000, immutable"

# 2. Sync all other assets (images, icons, models, docs) with standard caching.
aws s3 sync ./out "s3://${S3_BUCKET}" \
  --exclude "_next/static/*" \
  --exclude "*.html" \
  --delete

# 3. Sync HTML files with must-revalidate so browsers immediately pick up new deployments.
aws s3 sync ./out "s3://${S3_BUCKET}" \
  --exclude "*" \
  --include "*.html" \
  --cache-control "public, max-age=0, must-revalidate"

echo "==> Invalidating CloudFront cache (${CLOUDFRONT_DISTRIBUTION_ID})"
aws cloudfront create-invalidation \
  --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" \
  --paths "/*"

echo "==> Done. Live at https://unifolio.in (allow a minute or two for the CloudFront invalidation to finish)."
