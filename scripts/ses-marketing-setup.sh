#!/usr/bin/env bash
# Phase 1 of the waitlist welcome email: SES + DNS setup for MARKETING email.
#
# Creates (only if missing):
#   - SES configuration set  unifolio-marketing   (bounce/complaint tracking)
#   - SNS topic              unifolio-marketing-ses-alerts (+ email subscription)
#   - SES domain identity    updates.unifolio.in  (DKIM + custom MAIL FROM)
#   - Route 53 records       3x DKIM CNAME, MAIL FROM MX + SPF, root DMARC (only if none exists)
#   - SES contact list       unifolio-marketing   (topic: product-updates, powers unsubscribe)
#
# Never touches the existing OTP sending identity or its configuration set.
# Safe to re-run: every step checks before it creates.
#
# Usage:
#   SES_REGION=ap-south-1 ALERT_EMAIL=you@unifolio.in ./scripts/ses-marketing-setup.sh setup
#   SES_REGION=ap-south-1 ./scripts/ses-marketing-setup.sh status
#   SES_REGION=ap-south-1 ./scripts/ses-marketing-setup.sh test-send
#
# SES_REGION must be the region the OTP emails already send from (that region
# is out of the SES sandbox). Prerequisites: AWS CLI v2 configured for account
# 811364789032 with SES, SNS and Route 53 permissions.
set -euo pipefail

EXPECTED_ACCOUNT="811364789032"
ROOT_DOMAIN="unifolio.in"
SEND_DOMAIN="${SEND_DOMAIN:-updates.unifolio.in}"
MAIL_FROM_DOMAIN="bounce.${SEND_DOMAIN}"
FROM_ADDRESS="hello@${SEND_DOMAIN}"
CONFIG_SET="unifolio-marketing"
SNS_TOPIC="unifolio-marketing-ses-alerts"
CONTACT_LIST="unifolio-marketing"
CONTACT_TOPIC="product-updates"
DMARC_REPORT_EMAIL="${DMARC_REPORT_EMAIL:-dmarc@${ROOT_DOMAIN}}"

: "${SES_REGION:?Set SES_REGION to the region your OTP emails send from, e.g. SES_REGION=ap-south-1}"
export AWS_REGION="${SES_REGION}"
command="${1:-}"

log() { printf '\n==> %s\n' "$*"; }
ok() { printf '    ok: %s\n' "$*"; }

preflight() {
  log "Checking AWS account and SES status in ${SES_REGION}"
  local account
  account="$(aws sts get-caller-identity --query Account --output text)"
  if [[ "${account}" != "${EXPECTED_ACCOUNT}" ]]; then
    echo "You're signed in to account ${account}, expected ${EXPECTED_ACCOUNT}. Stopping." >&2
    exit 1
  fi
  ok "account ${account}"

  local prod
  prod="$(aws sesv2 get-account --query ProductionAccessEnabled --output text)"
  if [[ "${prod}" != "True" ]]; then
    echo "SES in ${SES_REGION} is still in the sandbox. Use the region the OTP emails send from." >&2
    exit 1
  fi
  ok "SES production access enabled"

  log "Existing SES identities in ${SES_REGION} (these are left untouched)"
  aws sesv2 list-email-identities \
    --query 'EmailIdentities[].[IdentityName,IdentityType,VerificationStatus]' --output table
}

create_config_set() {
  log "Configuration set ${CONFIG_SET}"
  if aws sesv2 get-configuration-set --configuration-set-name "${CONFIG_SET}" >/dev/null 2>&1; then
    ok "already exists"
  else
    aws sesv2 create-configuration-set \
      --configuration-set-name "${CONFIG_SET}" \
      --reputation-options ReputationMetricsEnabled=true \
      --sending-options SendingEnabled=true \
      --suppression-options SuppressedReasons=BOUNCE,COMPLAINT
    ok "created"
  fi
}

create_alerts() {
  : "${ALERT_EMAIL:?Set ALERT_EMAIL to the inbox that should get bounce/complaint alerts}"
  log "SNS topic ${SNS_TOPIC} for bounce/complaint alerts"
  local topic_arn
  topic_arn="$(aws sns create-topic --name "${SNS_TOPIC}" --query TopicArn --output text)" # idempotent
  ok "${topic_arn}"

  local subscribed
  subscribed="$(aws sns list-subscriptions-by-topic --topic-arn "${topic_arn}" \
    --query "Subscriptions[?Endpoint=='${ALERT_EMAIL}'] | length(@)" --output text)"
  if [[ "${subscribed}" == "0" ]]; then
    aws sns subscribe --topic-arn "${topic_arn}" --protocol email --notification-endpoint "${ALERT_EMAIL}" >/dev/null
    ok "subscribed ${ALERT_EMAIL} (click the confirmation link AWS emails you)"
  else
    ok "${ALERT_EMAIL} already subscribed"
  fi

  local existing
  existing="$(aws sesv2 get-configuration-set-event-destinations --configuration-set-name "${CONFIG_SET}" \
    --query 'EventDestinations[].Name' --output text)"

  if [[ " ${existing} " != *" sns-alerts "* ]]; then
    aws sesv2 create-configuration-set-event-destination \
      --configuration-set-name "${CONFIG_SET}" \
      --event-destination-name sns-alerts \
      --event-destination "{\"Enabled\":true,\"MatchingEventTypes\":[\"BOUNCE\",\"COMPLAINT\",\"REJECT\",\"RENDERING_FAILURE\"],\"SnsDestination\":{\"TopicArn\":\"${topic_arn}\"}}"
    ok "event destination sns-alerts created"
  else
    ok "event destination sns-alerts already exists"
  fi

  if [[ " ${existing} " != *" cloudwatch-metrics "* ]]; then
    aws sesv2 create-configuration-set-event-destination \
      --configuration-set-name "${CONFIG_SET}" \
      --event-destination-name cloudwatch-metrics \
      --event-destination '{"Enabled":true,"MatchingEventTypes":["SEND","DELIVERY","OPEN","CLICK","BOUNCE","COMPLAINT"],"CloudWatchDestination":{"DimensionConfigurations":[{"DimensionName":"campaign","DimensionValueSource":"MESSAGE_TAG","DefaultDimensionValue":"untagged"}]}}'
    ok "event destination cloudwatch-metrics created"
  else
    ok "event destination cloudwatch-metrics already exists"
  fi
}

create_identity() {
  log "Domain identity ${SEND_DOMAIN}"
  if aws sesv2 get-email-identity --email-identity "${SEND_DOMAIN}" >/dev/null 2>&1; then
    ok "already exists"
  else
    aws sesv2 create-email-identity \
      --email-identity "${SEND_DOMAIN}" \
      --configuration-set-name "${CONFIG_SET}" >/dev/null
    ok "created with ${CONFIG_SET} as its default configuration set"
  fi

  log "Custom MAIL FROM ${MAIL_FROM_DOMAIN}"
  aws sesv2 put-email-identity-mail-from-attributes \
    --email-identity "${SEND_DOMAIN}" \
    --mail-from-domain "${MAIL_FROM_DOMAIN}" \
    --behavior-on-mx-failure USE_DEFAULT_VALUE
  ok "set"
}

dns_records() {
  log "DNS records in Route 53 for ${ROOT_DOMAIN}"
  local zone_id
  zone_id="$(aws route53 list-hosted-zones-by-name --dns-name "${ROOT_DOMAIN}" \
    --query "HostedZones[?Name=='${ROOT_DOMAIN}.' && Config.PrivateZone==\`false\`].Id | [0]" --output text)"
  if [[ -z "${zone_id}" || "${zone_id}" == "None" ]]; then
    echo "No public Route 53 hosted zone for ${ROOT_DOMAIN}. Add the records manually (run 'status' to print them)." >&2
    exit 1
  fi
  zone_id="${zone_id#/hostedzone/}"
  ok "hosted zone ${zone_id}"

  local tokens
  tokens="$(aws sesv2 get-email-identity --email-identity "${SEND_DOMAIN}" \
    --query 'DkimAttributes.Tokens' --output text)"

  local changes="" t
  for t in ${tokens}; do
    changes+="{\"Action\":\"UPSERT\",\"ResourceRecordSet\":{\"Name\":\"${t}._domainkey.${SEND_DOMAIN}\",\"Type\":\"CNAME\",\"TTL\":1800,\"ResourceRecords\":[{\"Value\":\"${t}.dkim.amazonses.com\"}]}},"
  done
  changes+="{\"Action\":\"UPSERT\",\"ResourceRecordSet\":{\"Name\":\"${MAIL_FROM_DOMAIN}\",\"Type\":\"MX\",\"TTL\":1800,\"ResourceRecords\":[{\"Value\":\"10 feedback-smtp.${SES_REGION}.amazonses.com\"}]}},"
  changes+="{\"Action\":\"UPSERT\",\"ResourceRecordSet\":{\"Name\":\"${MAIL_FROM_DOMAIN}\",\"Type\":\"TXT\",\"TTL\":1800,\"ResourceRecords\":[{\"Value\":\"\\\"v=spf1 include:amazonses.com ~all\\\"\"}]}}"

  local dmarc_exists
  dmarc_exists="$(aws route53 list-resource-record-sets --hosted-zone-id "${zone_id}" \
    --query "ResourceRecordSets[?Name=='_dmarc.${ROOT_DOMAIN}.' && Type=='TXT'] | length(@)" --output text)"
  if [[ "${dmarc_exists}" == "0" ]]; then
    changes+=",{\"Action\":\"CREATE\",\"ResourceRecordSet\":{\"Name\":\"_dmarc.${ROOT_DOMAIN}\",\"Type\":\"TXT\",\"TTL\":3600,\"ResourceRecords\":[{\"Value\":\"\\\"v=DMARC1; p=none; rua=mailto:${DMARC_REPORT_EMAIL}\\\"\"}]}}"
    ok "no DMARC record yet, will add one with p=none (monitor only)"
  else
    ok "DMARC record already exists, leaving it alone"
  fi

  echo
  echo "    About to write these records to the live ${ROOT_DOMAIN} zone:"
  echo "[${changes}]" | python3 -m json.tool 2>/dev/null || echo "[${changes}]"
  read -r -p "    Apply these DNS changes? [y/N] " confirm
  [[ "${confirm}" == "y" || "${confirm}" == "Y" ]] || { echo "Skipped DNS. Re-run when ready."; return; }

  aws route53 change-resource-record-sets --hosted-zone-id "${zone_id}" \
    --change-batch "{\"Comment\":\"SES marketing identity ${SEND_DOMAIN}\",\"Changes\":[${changes}]}" \
    --query 'ChangeInfo.Status' --output text
  ok "submitted. SES usually verifies within 5 to 30 minutes; check with: $0 status"
}

create_contact_list() {
  log "Contact list ${CONTACT_LIST}"
  # SES allows only ONE contact list per account per region, so it's named for
  # all marketing, with one topic per kind of email.
  local lists
  lists="$(aws sesv2 list-contact-lists --query 'ContactLists[].ContactListName' --output text)"
  if [[ " ${lists} " == *" ${CONTACT_LIST} "* ]]; then
    ok "already exists"
  elif [[ -n "${lists}" && "${lists}" != "None" ]]; then
    echo "A different contact list already exists (${lists}). SES allows one per region; reuse it instead. Stopping." >&2
    exit 1
  else
    aws sesv2 create-contact-list \
      --contact-list-name "${CONTACT_LIST}" \
      --description "Unifolio marketing audience" \
      --topics "[{\"TopicName\":\"${CONTACT_TOPIC}\",\"DisplayName\":\"Product updates and launch news\",\"Description\":\"Sneak peeks, early access and launch news from Unifolio.\",\"DefaultSubscriptionStatus\":\"OPT_IN\"}]"
    ok "created with topic ${CONTACT_TOPIC}"
  fi
}

status() {
  log "Status of ${SEND_DOMAIN} in ${SES_REGION}"
  aws sesv2 get-email-identity --email-identity "${SEND_DOMAIN}" \
    --query '{VerifiedForSending:VerifiedForSendingStatus,Dkim:DkimAttributes.Status,MailFrom:MailFromAttributes.MailFromDomainStatus,DefaultConfigSet:ConfigurationSetName}' \
    --output table

  log "DNS records SES expects"
  local t
  for t in $(aws sesv2 get-email-identity --email-identity "${SEND_DOMAIN}" --query 'DkimAttributes.Tokens' --output text); do
    echo "    CNAME  ${t}._domainkey.${SEND_DOMAIN}  ->  ${t}.dkim.amazonses.com"
  done
  echo "    MX     ${MAIL_FROM_DOMAIN}  ->  10 feedback-smtp.${SES_REGION}.amazonses.com"
  echo "    TXT    ${MAIL_FROM_DOMAIN}  ->  \"v=spf1 include:amazonses.com ~all\""
  echo "    TXT    _dmarc.${ROOT_DOMAIN}  ->  \"v=DMARC1; p=none; rua=mailto:${DMARC_REPORT_EMAIL}\"  (only if you have none)"

  log "Configuration set event destinations"
  aws sesv2 get-configuration-set-event-destinations --configuration-set-name "${CONFIG_SET}" \
    --query 'EventDestinations[].[Name,Enabled,join(`,`,MatchingEventTypes)]' --output table

  log "Contact lists"
  aws sesv2 list-contact-lists --output table
}

test_send() {
  log "Sending test emails through the SES mailbox simulator (doesn't affect reputation)"
  local to
  for to in success bounce complaint; do
    aws sesv2 send-email \
      --from-email-address "Unifolio <${FROM_ADDRESS}>" \
      --destination "ToAddresses=${to}@simulator.amazonses.com" \
      --configuration-set-name "${CONFIG_SET}" \
      --email-tags Name=campaign,Value=setup-test \
      --list-management-options "ContactListName=${CONTACT_LIST},TopicName=${CONTACT_TOPIC}" \
      --content '{"Simple":{"Subject":{"Data":"Unifolio SES setup test"},"Body":{"Text":{"Data":"Test from scripts/ses-marketing-setup.sh. Unsubscribe: {{amazonSESUnsubscribeUrl}}"}}}}' \
      --query MessageId --output text
    ok "sent to ${to}@simulator.amazonses.com"
  done
  echo "    Expect two alert emails at the SNS subscriber (bounce + complaint) within a minute or two."
}

case "${command}" in
  setup)
    preflight
    create_config_set
    create_alerts
    create_identity
    dns_records
    create_contact_list
    status
    ;;
  status) status ;;
  test-send) test_send ;;
  *)
    echo "Usage: SES_REGION=<region> [ALERT_EMAIL=<inbox>] $0 {setup|status|test-send}" >&2
    exit 1
    ;;
esac
