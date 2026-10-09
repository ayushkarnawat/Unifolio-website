// Lambda entry point (handler: index.handler, runtime nodejs22.x).
// Uses the AWS SDK v3 that ships with the runtime, so there is no node_modules.
// Deployed by scripts/waitlist-api-setup.sh.

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SESv2Client, CreateContactCommand, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { createHandler } from "./handler.mjs";

const env = process.env;
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});
const ses = new SESv2Client({});
const ssm = new SSMClient({});

const signupKey = (email) => ({ pk: `SIGNUP#${email}` });

const store = {
  async insertSignup(item) {
    try {
      await ddb.send(
        new PutCommand({
          TableName: env.TABLE_NAME,
          Item: { ...signupKey(item.email), ...item },
          ConditionExpression: "attribute_not_exists(pk)",
          ReturnValuesOnConditionCheckFailure: "ALL_OLD",
        })
      );
      return null;
    } catch (err) {
      if (err.name !== "ConditionalCheckFailedException") throw err;
      if (!err.Item) return {};
      // The exception carries the raw DynamoDB item, e.g. { spot: { N: "1031" } }.
      return err.Item.pk?.S ? unmarshall(err.Item) : err.Item;
    }
  },

  async nextSpot() {
    const res = await ddb.send(
      new UpdateCommand({
        TableName: env.TABLE_NAME,
        Key: { pk: "COUNTER#spot" },
        UpdateExpression: "ADD #v :one",
        ExpressionAttributeNames: { "#v": "value" },
        ExpressionAttributeValues: { ":one": 1 },
        ReturnValues: "UPDATED_NEW",
      })
    );
    return res.Attributes.value;
  },

  async updateSignup(email, fields) {
    const keys = Object.keys(fields);
    await ddb.send(
      new UpdateCommand({
        TableName: env.TABLE_NAME,
        Key: signupKey(email),
        UpdateExpression: "SET " + keys.map((_, i) => `#k${i} = :v${i}`).join(", "),
        ExpressionAttributeNames: Object.fromEntries(keys.map((k, i) => [`#k${i}`, k])),
        ExpressionAttributeValues: Object.fromEntries(keys.map((k, i) => [`:v${i}`, fields[k]])),
      })
    );
  },
};

const mailer = {
  async sendWelcome({ email, firstName, spot, referralUrl }) {
    try {
      await ses.send(
        new CreateContactCommand({
          ContactListName: env.CONTACT_LIST,
          EmailAddress: email,
          TopicPreferences: [{ TopicName: env.CONTACT_TOPIC, SubscriptionStatus: "OPT_IN" }],
        })
      );
    } catch (err) {
      if (err.name !== "AlreadyExistsException") throw err;
    }

    const res = await ses.send(
      new SendEmailCommand({
        FromEmailAddress: env.FROM_ADDRESS,
        ReplyToAddresses: env.REPLY_TO ? [env.REPLY_TO] : undefined,
        Destination: { ToAddresses: [email] },
        ConfigurationSetName: env.CONFIG_SET,
        ListManagementOptions: { ContactListName: env.CONTACT_LIST, TopicName: env.CONTACT_TOPIC },
        EmailTags: [{ Name: "campaign", Value: "waitlist-welcome" }],
        Content: {
          Template: {
            TemplateName: env.TEMPLATE_NAME,
            TemplateData: JSON.stringify({ firstName, spot, referralUrl }),
          },
        },
      })
    );
    return res.MessageId;
  },
};

let turnstileSecret; // cached per cold start
async function verifyTurnstile(token, ip) {
  if (!turnstileSecret) {
    const res = await ssm.send(new GetParameterCommand({ Name: env.TURNSTILE_SECRET_PARAM, WithDecryption: true }));
    turnstileSecret = res.Parameter.Value;
  }
  const form = new URLSearchParams({ secret: turnstileSecret, response: token });
  if (ip) form.set("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(5000),
  });
  const data = await res.json();
  return data.success === true;
}

// Resolves "skipped" until SHEET_WEBHOOK_URL is set; those signups can be
// backfilled later by querying sheetStatus = "skipped".
async function postToSheet(row) {
  if (!env.SHEET_WEBHOOK_URL) return "skipped";
  // Same payload and content type the website used to send directly.
  // Apps Script answers 302 -> 200 after running doPost.
  const res = await fetch(env.SHEET_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(row),
    redirect: "follow",
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) throw new Error(`Sheet webhook answered ${res.status}`);
  return "sent";
}

export const handler = createHandler({
  store,
  mailer,
  verifyTurnstile,
  postToSheet,
  config: { siteUrl: env.SITE_URL },
});
