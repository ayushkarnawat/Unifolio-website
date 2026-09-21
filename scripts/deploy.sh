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
CLOUDFRONT_DISTRIBUTION_ID="REPLACE_AFTER_TERRAFORM_APPLY"

if [[ "${CLOUDFRONT_DISTRIBUTION_ID}" == "REPLACE_AFTER_TERRAFORM_APPLY" ]]; then
  echo "Error: CLOUDFRONT_DISTRIBUTION_ID is still a placeholder." >&2
  echo "Run 'terraform output cloudfront_distribution_id' in D:\\Unifolio code\\infra\\envs\\marketing" >&2
  echo "and paste the value into this script before deploying." >&2
  exit 1
fi

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
aws s3 sync ./out "s3://${S3_BUCKET}" --delete

echo "==> Invalidating CloudFront cache (${CLOUDFRONT_DISTRIBUTION_ID})"
aws cloudfront create-invalidation \
  --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" \
  --paths "/*"

echo "==> Done. Live at https://unifolio.in (allow a minute or two for the CloudFront invalidation to finish)."
