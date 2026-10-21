#!/usr/bin/env bash
# scripts/ses-upload-template.sh
# Uploads or updates the waitlist-welcome-v1 SES template in AWS SES v2 (region: ap-south-1)
set -euo pipefail

TEMPLATE_NAME="waitlist-welcome-v1"
AWS_REGION="ap-south-1"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

SUBJECT_FILE="$DIR/emails/waitlist-welcome/subject.txt"
HTML_FILE="$DIR/emails/waitlist-welcome/template.html"
TEXT_FILE="$DIR/emails/waitlist-welcome/text.txt"

if [[ ! -f "$SUBJECT_FILE" || ! -f "$HTML_FILE" || ! -f "$TEXT_FILE" ]]; then
  echo "Error: Required template files missing in emails/waitlist-welcome/"
  exit 1
fi

SUBJECT="$(cat "$SUBJECT_FILE" | tr -d '\r\n')"
HTML_CONTENT="$(cat "$HTML_FILE")"
TEXT_CONTENT="$(cat "$TEXT_FILE")"

if [[ "${1:-}" == "--dry-run" ]]; then
  echo "=== DRY RUN MODE ==="
  echo "Template Name: $TEMPLATE_NAME"
  echo "Region: $AWS_REGION"
  echo "Subject: $SUBJECT"
  echo "HTML size: $(wc -c < "$HTML_FILE") bytes"
  echo "Text size: $(wc -c < "$TEXT_FILE") bytes"
  echo "No changes made to AWS."
  exit 0
fi

NODE_CMD="node"
if ! command -v node &> /dev/null; then
  if command -v node.exe &> /dev/null; then
    NODE_CMD="node.exe"
  else
    echo "Error: node or node.exe is required to format JSON payload."
    exit 1
  fi
fi

PAYLOAD=$("$NODE_CMD" -e '
  const fs = require("fs");
  const subject = fs.readFileSync(process.argv[1], "utf8").trim();
  const html = fs.readFileSync(process.argv[2], "utf8");
  const text = fs.readFileSync(process.argv[3], "utf8");
  const data = {
    TemplateName: process.argv[4],
    TemplateContent: {
      Subject: subject,
      Html: html,
      Text: text
    }
  };
  console.log(JSON.stringify(data));
' "$SUBJECT_FILE" "$HTML_FILE" "$TEXT_FILE" "$TEMPLATE_NAME")

echo "About to upload template '$TEMPLATE_NAME' to AWS SES in region '$AWS_REGION'."
read -p "Do you want to proceed? (y/N): " -r CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

# Try update first, fallback to create if it doesn't exist
if aws sesv2 update-email-template \
  --region "$AWS_REGION" \
  --cli-input-json "$PAYLOAD" 2>/dev/null; then
  echo "Successfully updated SES template: $TEMPLATE_NAME"
else
  aws sesv2 create-email-template \
    --region "$AWS_REGION" \
    --cli-input-json "$PAYLOAD"
  echo "Successfully created SES template: $TEMPLATE_NAME"
fi
