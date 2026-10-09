#!/usr/bin/env bash
# Phase 2 of the waitlist welcome email: the backend behind
# https://api.unifolio.in/waitlist (DynamoDB + IAM + Lambda + API Gateway +
# custom domain + alarms). Plan: Docs/2026-10-08-waitlist-welcome-email-plan.md
#
# Every step checks before it creates, so it is safe to re-run.
# Never touches the OTP sending setup or anything from Phase 1 except by name.
#
# Commands (all in ap-south-1, account 811364789032):
#   ./scripts/waitlist-api-setup.sh secret            Store the Turnstile secret key in SSM (prompts, hidden input)
#   [SHEET_WEBHOOK_URL=...] REPLY_TO=... [APPROVE_DNS=yes] \
#   ./scripts/waitlist-api-setup.sh setup             Create or update everything (APPROVE_DNS=yes skips the DNS y/N prompt)
#   ./scripts/waitlist-api-setup.sh deploy            Upload new Lambda code only (after editing services/waitlist-api/)
#   ./scripts/waitlist-api-setup.sh seed-counter N    Start spot numbers after N (run once, before launch)
#   ./scripts/waitlist-api-setup.sh status            Show what exists and its state
#   ./scripts/waitlist-api-setup.sh smoke-test        Call the live API without sending any email
#   ./scripts/waitlist-api-setup.sh logs              Tail the Lambda logs
#
# Prerequisites: AWS CLI v2 signed in to account 811364789032 (laptop or
# CloudShell), python3, curl. Phase 1 done (scripts/ses-marketing-setup.sh or
# Docs/2026-10-08-waitlist-ses-phase1-console-guide.md).
set -euo pipefail

REGION="ap-south-1"
export AWS_REGION="${REGION}" AWS_DEFAULT_REGION="${REGION}"
EXPECTED_ACCOUNT="811364789032"
ROOT_DOMAIN="unifolio.in"
API_DOMAIN="api.unifolio.in"
SITE_URL="https://unifolio.in"
CORS_ORIGINS='["https://unifolio.in","https://www.unifolio.in","http://localhost:3000"]'

# Phase 1 resources (referenced, never created here)
SES_IDENTITY="updates.unifolio.in"
FROM_ADDRESS="Unifolio <hello@updates.unifolio.in>"
CONFIG_SET="unifolio-marketing"
CONTACT_LIST="unifolio-marketing"
CONTACT_TOPIC="product-updates"
SNS_TOPIC="unifolio-marketing-ses-alerts"
TEMPLATE_NAME="waitlist-welcome-v1"

# Phase 2 resources
TABLE="unifolio-waitlist"
SECRET_PARAM="/unifolio/waitlist/turnstile-secret"
ROLE="unifolio-waitlist-signup-role"
FUNCTION="waitlist-signup"
FUNCTION_LOG_GROUP="/aws/lambda/${FUNCTION}"
API_NAME="unifolio-waitlist-api"
API_LOG_GROUP="/aws/apigateway/${API_NAME}"
RESERVED_CONCURRENCY=10
TAGS_CLI="Key=project,Value=waitlist-email"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="${ROOT_DIR}/services/waitlist-api"
WORK_DIR="$(mktemp -d -t waitlist-api.XXXXXX)"
cleanup() { [[ -n "${WORK_DIR}" && -d "${WORK_DIR}" && "${WORK_DIR}" == */waitlist-api.* ]] && rm -rf -- "${WORK_DIR}"; }
trap cleanup EXIT

ACCOUNT=""
command="${1:-}"

log() { printf '\n==> %s\n' "$*"; }
ok() { printf '    ok: %s\n' "$*"; }
warn() { printf '    warning: %s\n' "$*" >&2; }
die() { printf '\nError: %s\n' "$*" >&2; exit 1; }
# Builds JSON with python so values are always escaped correctly.
json() { python3 -c 'import json,sys; print(json.dumps(eval(sys.argv[1])))' "$1"; }

preflight() {
  command -v aws >/dev/null || die "AWS CLI not found."
  command -v python3 >/dev/null || die "python3 not found."
  ACCOUNT="$(aws sts get-caller-identity --query Account --output text 2>/dev/null)" \
    || die "AWS CLI isn't signed in. Run 'aws configure' (or 'aws login') first."
  [[ "${ACCOUNT}" == "${EXPECTED_ACCOUNT}" ]] || die "Signed in to account ${ACCOUNT}, expected ${EXPECTED_ACCOUNT}."
  ok "account ${ACCOUNT}, region ${REGION}"
}

check_phase1() {
  log "Checking Phase 1 pieces exist"
  local verified
  verified="$(aws sesv2 get-email-identity --email-identity "${SES_IDENTITY}" --query VerifiedForSendingStatus --output text 2>/dev/null)" \
    || die "SES identity ${SES_IDENTITY} not found. Finish Phase 1 first."
  [[ "${verified}" == "True" ]] || die "SES identity ${SES_IDENTITY} isn't verified yet."
  ok "SES identity ${SES_IDENTITY} verified"
  aws sesv2 get-configuration-set --configuration-set-name "${CONFIG_SET}" >/dev/null || die "Configuration set ${CONFIG_SET} missing."
  ok "configuration set ${CONFIG_SET}"
  aws sesv2 get-contact-list --contact-list-name "${CONTACT_LIST}" >/dev/null || die "Contact list ${CONTACT_LIST} missing."
  ok "contact list ${CONTACT_LIST}"
  aws ssm get-parameter --name "${SECRET_PARAM}" --query Parameter.Name --output text >/dev/null 2>&1 \
    || die "Turnstile secret not stored yet. Run: $0 secret"
  ok "Turnstile secret in SSM"
  if aws sesv2 get-email-template --template-name "${TEMPLATE_NAME}" >/dev/null 2>&1; then
    ok "email template ${TEMPLATE_NAME}"
  else
    warn "email template ${TEMPLATE_NAME} not uploaded yet (Phase 3). Signups will save, but emails fail until it exists."
  fi
}

topic_arn() {
  aws sns list-topics --query "Topics[?ends_with(TopicArn, ':${SNS_TOPIC}')].TopicArn | [0]" --output text
}

zone_id() {
  local id
  id="$(aws route53 list-hosted-zones-by-name --dns-name "${ROOT_DOMAIN}" \
    --query "HostedZones[?Name=='${ROOT_DOMAIN}.' && Config.PrivateZone==\`false\`].Id | [0]" --output text)"
  [[ -n "${id}" && "${id}" != "None" ]] || die "No public Route 53 zone for ${ROOT_DOMAIN}."
  echo "${id#/hostedzone/}"
}

# APPROVE_DNS=yes pre-approves the api.unifolio.in DNS change for non-interactive
# runs (e.g. an agent's shell, where the y/N prompt can't be answered).
confirm() {
  if [[ "${APPROVE_DNS:-}" == "yes" ]]; then
    echo "    $1 yes (APPROVE_DNS=yes)"
    return 0
  fi
  local answer=""
  read -r -p "    $1 [y/N] " answer || true
  [[ "${answer}" == "y" || "${answer}" == "Y" ]]
}

# ---------------------------------------------------------------- secret
cmd_secret() {
  preflight
  log "Store the Turnstile secret key in SSM (${SECRET_PARAM})"
  echo "    Paste the SECRET key from Cloudflare (input is hidden), then press Enter."
  local secret
  read -r -s -p "    Secret: " secret
  echo
  [[ -n "${secret}" ]] || die "Empty secret."
  aws ssm put-parameter --name "${SECRET_PARAM}" --type SecureString --value "${secret}" --overwrite \
    --description "Cloudflare Turnstile secret for the waitlist API" >/dev/null
  ok "stored (encrypted). The Lambda reads it on its next cold start; run '$0 deploy' to force one."
}

# ---------------------------------------------------------------- setup steps
create_table() {
  log "DynamoDB table ${TABLE}"
  if aws dynamodb describe-table --table-name "${TABLE}" >/dev/null 2>&1; then
    ok "already exists"
  else
    aws dynamodb create-table --table-name "${TABLE}" \
      --attribute-definitions AttributeName=pk,AttributeType=S \
      --key-schema AttributeName=pk,KeyType=HASH \
      --billing-mode PAY_PER_REQUEST \
      --deletion-protection-enabled \
      --tags "${TAGS_CLI}" >/dev/null
    aws dynamodb wait table-exists --table-name "${TABLE}"
    ok "created (on-demand, deletion protection on)"
  fi
  aws dynamodb update-continuous-backups --table-name "${TABLE}" \
    --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true >/dev/null
  ok "point-in-time recovery on"
}

create_log_group() {
  local name="$1"
  if [[ "$(aws logs describe-log-groups --log-group-name-prefix "${name}" \
      --query "logGroups[?logGroupName=='${name}'] | length(@)" --output text)" == "0" ]]; then
    aws logs create-log-group --log-group-name "${name}" --tags project=waitlist-email
  fi
  aws logs put-retention-policy --log-group-name "${name}" --retention-in-days 30
  ok "log group ${name} (30-day retention)"
}

create_role() {
  log "IAM role ${ROLE}"
  local arn="arn:aws:iam::${ACCOUNT}:role/${ROLE}"
  if aws iam get-role --role-name "${ROLE}" >/dev/null 2>&1; then
    ok "already exists"
  else
    aws iam create-role --role-name "${ROLE}" --tags "${TAGS_CLI}" \
      --description "Lets the waitlist-signup Lambda save signups and send the welcome email" \
      --assume-role-policy-document "$(json '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}')" >/dev/null
    ok "created"
  fi

  local ses="arn:aws:ses:${REGION}:${ACCOUNT}"
  local policy
  policy="$(json "{
    'Version': '2012-10-17',
    'Statement': [
      {'Sid': 'WaitlistTable', 'Effect': 'Allow',
       'Action': ['dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:GetItem'],
       'Resource': 'arn:aws:dynamodb:${REGION}:${ACCOUNT}:table/${TABLE}'},
      {'Sid': 'SendWelcomeEmail', 'Effect': 'Allow', 'Action': 'ses:SendEmail',
       'Resource': ['${ses}:identity/${SES_IDENTITY}', '${ses}:configuration-set/${CONFIG_SET}',
                    '${ses}:template/${TEMPLATE_NAME}', '${ses}:contact-list/${CONTACT_LIST}']},
      {'Sid': 'AddContact', 'Effect': 'Allow', 'Action': 'ses:CreateContact',
       'Resource': '${ses}:contact-list/${CONTACT_LIST}'},
      {'Sid': 'TurnstileSecret', 'Effect': 'Allow', 'Action': 'ssm:GetParameter',
       'Resource': 'arn:aws:ssm:${REGION}:${ACCOUNT}:parameter${SECRET_PARAM}'},
      {'Sid': 'OwnLogs', 'Effect': 'Allow', 'Action': ['logs:CreateLogStream', 'logs:PutLogEvents'],
       'Resource': 'arn:aws:logs:${REGION}:${ACCOUNT}:log-group:${FUNCTION_LOG_GROUP}:*'}
    ]}")"
  aws iam put-role-policy --role-name "${ROLE}" --policy-name waitlist-signup --policy-document "${policy}"
  ok "permissions set (table, SES send from ${SES_IDENTITY} only, contact list, Turnstile secret, own logs)"
  ROLE_ARN="${arn}"
}

package_code() {
  [[ -f "${SRC_DIR}/index.mjs" && -f "${SRC_DIR}/handler.mjs" ]] || die "Lambda source not found in ${SRC_DIR}."
  python3 - "${SRC_DIR}" "${WORK_DIR}/function.zip" <<'PY'
import sys, zipfile, os
src, out = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for name in ("index.mjs", "handler.mjs"):
        z.write(os.path.join(src, name), name)
PY
  ok "packaged index.mjs + handler.mjs"
}

write_env_file() {
  : "${REPLY_TO:?Set REPLY_TO to the reply-to address someone reads}"
  SHEET_WEBHOOK_URL="${SHEET_WEBHOOK_URL:-}"
  if [[ -z "${SHEET_WEBHOOK_URL}" ]]; then
    warn "SHEET_WEBHOOK_URL not set: signups are saved and emailed but not sent to a Google Sheet (marked sheetStatus=skipped). Re-run setup with it once the sheet exists."
  fi
  json "{'Variables': {
    'TABLE_NAME': '${TABLE}', 'FROM_ADDRESS': '''${FROM_ADDRESS}''', 'REPLY_TO': '''${REPLY_TO}''',
    'CONFIG_SET': '${CONFIG_SET}', 'CONTACT_LIST': '${CONTACT_LIST}', 'CONTACT_TOPIC': '${CONTACT_TOPIC}',
    'TEMPLATE_NAME': '${TEMPLATE_NAME}', 'TURNSTILE_SECRET_PARAM': '${SECRET_PARAM}',
    'SHEET_WEBHOOK_URL': '''${SHEET_WEBHOOK_URL}''', 'SITE_URL': '${SITE_URL}'}}" > "${WORK_DIR}/env.json"
}

create_function() {
  log "Lambda function ${FUNCTION}"
  create_log_group "${FUNCTION_LOG_GROUP}"
  package_code
  write_env_file
  local logging="LogFormat=JSON,ApplicationLogLevel=INFO,SystemLogLevel=WARN,LogGroup=${FUNCTION_LOG_GROUP}"

  if aws lambda get-function --function-name "${FUNCTION}" >/dev/null 2>&1; then
    aws lambda update-function-code --function-name "${FUNCTION}" --zip-file "fileb://${WORK_DIR}/function.zip" >/dev/null
    aws lambda wait function-updated-v2 --function-name "${FUNCTION}"
    aws lambda update-function-configuration --function-name "${FUNCTION}" \
      --runtime nodejs22.x --handler index.handler --role "${ROLE_ARN}" \
      --timeout 10 --memory-size 256 --environment "file://${WORK_DIR}/env.json" \
      --logging-config "${logging}" >/dev/null
    aws lambda wait function-updated-v2 --function-name "${FUNCTION}"
    ok "code and settings updated"
  else
    # A brand-new IAM role takes a few seconds before Lambda can use it.
    local attempt
    for attempt in 1 2 3 4 5 6 7 8; do
      if aws lambda create-function --function-name "${FUNCTION}" \
          --runtime nodejs22.x --architectures arm64 --handler index.handler --role "${ROLE_ARN}" \
          --zip-file "fileb://${WORK_DIR}/function.zip" --timeout 10 --memory-size 256 \
          --environment "file://${WORK_DIR}/env.json" --logging-config "${logging}" \
          --description "Waitlist signup: save, send welcome email, forward to Google Sheet" \
          --tags project=waitlist-email >/dev/null 2>"${WORK_DIR}/create.err"; then
        break
      fi
      grep -q "cannot be assumed" "${WORK_DIR}/create.err" || { cat "${WORK_DIR}/create.err" >&2; die "Lambda create failed."; }
      [[ "${attempt}" == 8 ]] && die "IAM role still not usable after 40s; re-run setup."
      echo "    waiting for the new IAM role to be usable..."
      sleep 5
    done
    aws lambda wait function-active-v2 --function-name "${FUNCTION}"
    ok "created (Node 22, arm64, 256 MB, 10 s timeout)"
  fi

  local account_limit
  account_limit="$(aws lambda get-account-settings --query AccountLimit.ConcurrentExecutions --output text)"
  if (( account_limit >= 100 )); then
    aws lambda put-function-concurrency --function-name "${FUNCTION}" \
      --reserved-concurrent-executions "${RESERVED_CONCURRENCY}" >/dev/null
    ok "capped at ${RESERVED_CONCURRENCY} concurrent runs"
  else
    warn "account concurrency limit is ${account_limit}, too low to reserve ${RESERVED_CONCURRENCY}; skipped the cap (API throttling still applies)"
  fi
  FUNCTION_ARN="$(aws lambda get-function --function-name "${FUNCTION}" --query Configuration.FunctionArn --output text)"
}

create_api() {
  log "API Gateway HTTP API ${API_NAME}"
  local cors
  cors="$(json "{'AllowOrigins': ${CORS_ORIGINS}, 'AllowMethods': ['POST'], 'AllowHeaders': ['content-type'], 'MaxAge': 86400}")"
  API_ID="$(aws apigatewayv2 get-apis --query "Items[?Name=='${API_NAME}'].ApiId | [0]" --output text)"
  if [[ "${API_ID}" == "None" || -z "${API_ID}" ]]; then
    API_ID="$(aws apigatewayv2 create-api --name "${API_NAME}" --protocol-type HTTP \
      --cors-configuration "${cors}" --tags project=waitlist-email --query ApiId --output text)"
    ok "created ${API_ID}"
  else
    aws apigatewayv2 update-api --api-id "${API_ID}" --cors-configuration "${cors}" >/dev/null
    ok "exists ${API_ID}, CORS refreshed"
  fi

  local integration
  integration="$(aws apigatewayv2 get-integrations --api-id "${API_ID}" \
    --query "Items[?IntegrationUri=='${FUNCTION_ARN}'].IntegrationId | [0]" --output text)"
  if [[ "${integration}" == "None" || -z "${integration}" ]]; then
    integration="$(aws apigatewayv2 create-integration --api-id "${API_ID}" \
      --integration-type AWS_PROXY --integration-uri "${FUNCTION_ARN}" \
      --payload-format-version 2.0 --timeout-in-millis 12000 --query IntegrationId --output text)"
  fi
  ok "Lambda integration ${integration}"

  if [[ "$(aws apigatewayv2 get-routes --api-id "${API_ID}" \
      --query "Items[?RouteKey=='POST /waitlist'] | length(@)" --output text)" == "0" ]]; then
    aws apigatewayv2 create-route --api-id "${API_ID}" --route-key "POST /waitlist" \
      --target "integrations/${integration}" >/dev/null
  fi
  ok "route POST /waitlist"

  create_log_group "${API_LOG_GROUP}"
  local access_logs
  access_logs="$(json "{'DestinationArn': 'arn:aws:logs:${REGION}:${ACCOUNT}:log-group:${API_LOG_GROUP}',
    'Format': json.dumps({'requestId': '\$context.requestId', 'ip': '\$context.identity.sourceIp',
      'time': '\$context.requestTime', 'route': '\$context.routeKey', 'status': '\$context.status',
      'lambdaStatus': '\$context.integrationStatus', 'latencyMs': '\$context.responseLatency',
      'error': '\$context.integrationErrorMessage'})}")"
  local throttle="ThrottlingBurstLimit=10,ThrottlingRateLimit=5"
  if aws apigatewayv2 get-stage --api-id "${API_ID}" --stage-name '$default' >/dev/null 2>&1; then
    aws apigatewayv2 update-stage --api-id "${API_ID}" --stage-name '$default' \
      --default-route-settings "${throttle}" --access-log-settings "${access_logs}" >/dev/null
  else
    aws apigatewayv2 create-stage --api-id "${API_ID}" --stage-name '$default' --auto-deploy \
      --default-route-settings "${throttle}" --access-log-settings "${access_logs}" >/dev/null
  fi
  ok "stage \$default: auto-deploy, 5 req/s (burst 10), access logs"

  local source_arn="arn:aws:execute-api:${REGION}:${ACCOUNT}:${API_ID}/*/POST/waitlist"
  if ! aws lambda get-policy --function-name "${FUNCTION}" --query Policy --output text 2>/dev/null | grep -q "${API_ID}"; then
    aws lambda add-permission --function-name "${FUNCTION}" --statement-id "apigw-${API_ID}" \
      --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "${source_arn}" >/dev/null
  fi
  ok "API allowed to invoke the function"
}

create_domain() {
  log "Custom domain ${API_DOMAIN}"
  local zone
  zone="$(zone_id)"

  local cert
  cert="$(aws acm list-certificates --query "CertificateSummaryList[?DomainName=='${API_DOMAIN}'].CertificateArn | [0]" --output text)"
  if [[ "${cert}" == "None" || -z "${cert}" ]]; then
    cert="$(aws acm request-certificate --domain-name "${API_DOMAIN}" --validation-method DNS \
      --tags "${TAGS_CLI}" --query CertificateArn --output text)"
    ok "requested certificate"
  fi

  local cert_status
  cert_status="$(aws acm describe-certificate --certificate-arn "${cert}" --query Certificate.Status --output text)"
  if [[ "${cert_status}" != "ISSUED" ]]; then
    local record="None" i
    for i in $(seq 1 12); do
      record="$(aws acm describe-certificate --certificate-arn "${cert}" \
        --query 'Certificate.DomainValidationOptions[0].ResourceRecord.[Name,Value]' --output text)"
      [[ "${record}" != "None" && -n "${record}" ]] && break
      sleep 5
    done
    [[ "${record}" != "None" ]] || die "ACM hasn't produced a validation record yet; re-run setup in a minute."
    local name value
    read -r name value <<<"${record}"
    aws route53 change-resource-record-sets --hosted-zone-id "${zone}" --change-batch "$(json "{
      'Comment': 'ACM validation for ${API_DOMAIN}',
      'Changes': [{'Action': 'UPSERT', 'ResourceRecordSet': {'Name': '${name}', 'Type': 'CNAME', 'TTL': 300,
        'ResourceRecords': [{'Value': '${value}'}]}}]}")" >/dev/null
    echo "    added the certificate's validation record; waiting for AWS to issue it (usually 2-10 minutes)..."
    aws acm wait certificate-validated --certificate-arn "${cert}"
  fi
  ok "certificate issued"

  if ! aws apigatewayv2 get-domain-name --domain-name "${API_DOMAIN}" >/dev/null 2>&1; then
    aws apigatewayv2 create-domain-name --domain-name "${API_DOMAIN}" \
      --domain-name-configurations "CertificateArn=${cert},EndpointType=REGIONAL,SecurityPolicy=TLS_1_2" \
      --tags project=waitlist-email >/dev/null
    ok "API Gateway domain created"
  fi
  if [[ "$(aws apigatewayv2 get-api-mappings --domain-name "${API_DOMAIN}" \
      --query "Items[?ApiId=='${API_ID}'] | length(@)" --output text)" == "0" ]]; then
    aws apigatewayv2 create-api-mapping --domain-name "${API_DOMAIN}" --api-id "${API_ID}" --stage '$default' >/dev/null
  fi
  ok "mapped to ${API_NAME}"

  local target target_zone
  read -r target target_zone <<<"$(aws apigatewayv2 get-domain-name --domain-name "${API_DOMAIN}" \
    --query 'DomainNameConfigurations[0].[ApiGatewayDomainName,HostedZoneId]' --output text)"

  local existing
  existing="$(aws route53 list-resource-record-sets --hosted-zone-id "${zone}" \
    --query "ResourceRecordSets[?Name=='${API_DOMAIN}.' && Type=='A'].AliasTarget.DNSName | [0]" --output text)"
  if [[ "${existing}" == "${target}." ]]; then
    ok "DNS ${API_DOMAIN} already points at API Gateway"
  else
    if [[ "${existing}" != "None" && -n "${existing}" ]]; then
      warn "${API_DOMAIN} currently points at ${existing}"
    fi
    echo "    About to point ${API_DOMAIN} (A alias) at ${target} in the live ${ROOT_DOMAIN} zone."
    if confirm "Apply this DNS change?"; then
      aws route53 change-resource-record-sets --hosted-zone-id "${zone}" --change-batch "$(json "{
        'Comment': 'Waitlist API',
        'Changes': [{'Action': 'UPSERT', 'ResourceRecordSet': {'Name': '${API_DOMAIN}', 'Type': 'A',
          'AliasTarget': {'HostedZoneId': '${target_zone}', 'DNSName': '${target}', 'EvaluateTargetHealth': False}}}]}")" >/dev/null
      ok "DNS record set (live within a few minutes)"
    else
      warn "skipped DNS; ${API_DOMAIN} won't work until you re-run setup and confirm"
    fi
  fi
}

create_alarms() {
  log "Alarms → SNS ${SNS_TOPIC}"
  local topic
  topic="$(topic_arn)"
  [[ "${topic}" != "None" && -n "${topic}" ]] || die "SNS topic ${SNS_TOPIC} not found (Phase 1)."

  # Handled failures (email, sheet, server_error) are logged at ERROR level, not thrown,
  # so they need a log-based metric. Crashes and timeouts show up in Lambda's own Errors metric.
  aws logs put-metric-filter --log-group-name "${FUNCTION_LOG_GROUP}" --filter-name waitlist-handled-errors \
    --filter-pattern '{ $.level = "ERROR" }' \
    --metric-transformations metricName=HandledErrors,metricNamespace=Unifolio/Waitlist,metricValue=1,defaultValue=0

  local common=(--period 300 --evaluation-periods 1 --threshold 1 --comparison-operator GreaterThanOrEqualToThreshold
    --statistic Sum --treat-missing-data notBreaching --alarm-actions "${topic}")
  aws cloudwatch put-metric-alarm --alarm-name waitlist-signup-handled-errors \
    --alarm-description "Waitlist: an email, sheet post or request failed (see ${FUNCTION_LOG_GROUP})" \
    --namespace Unifolio/Waitlist --metric-name HandledErrors "${common[@]}"
  aws cloudwatch put-metric-alarm --alarm-name waitlist-signup-crashes \
    --alarm-description "Waitlist Lambda crashed or timed out" \
    --namespace AWS/Lambda --metric-name Errors --dimensions "Name=FunctionName,Value=${FUNCTION}" "${common[@]}"
  aws cloudwatch put-metric-alarm --alarm-name waitlist-signup-throttles \
    --alarm-description "Waitlist Lambda hit its concurrency cap (possible bot flood)" \
    --namespace AWS/Lambda --metric-name Throttles --dimensions "Name=FunctionName,Value=${FUNCTION}" "${common[@]}"
  ok "3 alarms: handled errors, crashes/timeouts, throttles"
}

# ---------------------------------------------------------------- commands
cmd_setup() {
  preflight
  check_phase1
  create_table
  create_role
  create_function
  create_api
  create_domain
  create_alarms
  log "Done"
  echo "    API:  https://${API_DOMAIN}/waitlist"
  echo "    Next: $0 smoke-test   (once DNS has settled, a few minutes)"
  echo "          $0 seed-counter <rows in the Google Sheet>   (once, before launch)"
}

cmd_deploy() {
  preflight
  log "Deploying new code to ${FUNCTION}"
  package_code
  aws lambda update-function-code --function-name "${FUNCTION}" --zip-file "fileb://${WORK_DIR}/function.zip" >/dev/null
  aws lambda wait function-updated-v2 --function-name "${FUNCTION}"
  ok "deployed"
}

cmd_seed_counter() {
  local n="${1:-}"
  [[ "${n}" =~ ^[0-9]+$ ]] || die "Usage: $0 seed-counter <number of existing signups>"
  preflight
  log "Seeding spot counter at ${n} (first new signup gets #$((n + 1)))"
  if aws dynamodb put-item --table-name "${TABLE}" \
      --item "{\"pk\":{\"S\":\"COUNTER#spot\"},\"value\":{\"N\":\"${n}\"}}" \
      --condition-expression "attribute_not_exists(pk)" 2>/dev/null; then
    ok "seeded"
  else
    local current
    current="$(aws dynamodb get-item --table-name "${TABLE}" --key '{"pk":{"S":"COUNTER#spot"}}' \
      --query Item.value.N --output text)"
    die "Counter already exists at ${current}. Not overwriting, because people may already hold those numbers."
  fi
}

cmd_status() {
  preflight
  log "Lambda"
  aws lambda get-function --function-name "${FUNCTION}" \
    --query 'Configuration.{State:State,LastUpdate:LastUpdateStatus,Runtime:Runtime,Modified:LastModified}' --output table 2>/dev/null \
    || echo "    not created"
  log "API"
  aws apigatewayv2 get-apis --query "Items[?Name=='${API_NAME}'].{Id:ApiId,DefaultUrl:ApiEndpoint}" --output table
  aws apigatewayv2 get-domain-name --domain-name "${API_DOMAIN}" \
    --query 'DomainNameConfigurations[0].{Domain:ApiGatewayDomainName,Status:DomainNameStatus}' --output table 2>/dev/null \
    || echo "    custom domain not created"
  log "Table"
  aws dynamodb describe-table --table-name "${TABLE}" \
    --query 'Table.{Status:TableStatus,ApproxItems:ItemCount}' --output table 2>/dev/null || echo "    not created"
  aws dynamodb get-item --table-name "${TABLE}" --key '{"pk":{"S":"COUNTER#spot"}}' \
    --query '{SpotCounter:Item.value.N}' --output table 2>/dev/null || true
  log "Alarms"
  aws cloudwatch describe-alarms --alarm-name-prefix waitlist-signup \
    --query 'MetricAlarms[].[AlarmName,StateValue]' --output table
}

cmd_smoke_test() {
  command -v curl >/dev/null || die "curl not found."
  local url="https://${API_DOMAIN}/waitlist"
  log "Preflight (CORS) from https://unifolio.in"
  local allow
  allow="$(curl -s -o /dev/null -D - -X OPTIONS "${url}" \
    -H "Origin: https://unifolio.in" -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: content-type" | tr -d '\r' | grep -i '^access-control-allow-origin:' || true)"
  [[ -n "${allow}" ]] && ok "${allow}" || die "No CORS header. Is DNS live yet? Try again in a few minutes."

  log "POST with an empty body (expects 400, sends nothing)"
  local out
  out="$(curl -s -w ' HTTP %{http_code}' -X POST "${url}" -H "Origin: https://unifolio.in" \
    -H "Content-Type: application/json" -d '{}')"
  echo "    ${out}"
  [[ "${out}" == *'"invalid_input"'*'HTTP 400' ]] && ok "API → Lambda path works" || die "Unexpected response."
}

cmd_logs() {
  aws logs tail "${FUNCTION_LOG_GROUP}" --since 1h --follow --format short
}

case "${command}" in
  secret) cmd_secret ;;
  setup) cmd_setup ;;
  deploy) cmd_deploy ;;
  seed-counter) cmd_seed_counter "${2:-}" ;;
  status) cmd_status ;;
  smoke-test) cmd_smoke_test ;;
  logs) cmd_logs ;;
  *)
    sed -n '2,25p' "$0" | sed 's/^# \{0,1\}//'
    exit 1
    ;;
esac
