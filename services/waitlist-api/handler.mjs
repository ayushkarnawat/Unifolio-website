// Waitlist signup logic, free of AWS imports so it can be tested with fakes.
// index.mjs wires in the real DynamoDB / SES / SSM clients.
// Plan: Docs/2026-10-08-waitlist-welcome-email-plan.md ("Lambda behaviour").

import { randomBytes } from "node:crypto";

const MAX_BODY_BYTES = 4096;
const REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 chars: no I, O, 0, 1
const REFERRAL_PATTERN = /^[A-HJ-NP-Z2-9]{8}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[+0-9 ()-]{6,20}$/;

/**
 * @param {object} deps
 * @param {{ insertSignup(item): Promise<object|null>, nextSpot(): Promise<number>, updateSignup(email, fields): Promise<void> }} deps.store
 *   insertSignup resolves null when the email is new, or the existing item when it was already there.
 * @param {{ sendWelcome(args): Promise<string> }} deps.mailer  resolves the SES message id
 * @param {(token: string, ip?: string) => Promise<boolean>} deps.verifyTurnstile
 * @param {(row: {name: string, email: string, phone: string}) => Promise<void>} deps.postToSheet
 * @param {{ siteUrl: string }} deps.config
 * @param {() => Date} [deps.now]
 * @param {Pick<Console, "info" | "warn" | "error">} [deps.log]
 */
export function createHandler({ store, mailer, verifyTurnstile, postToSheet, config, now = () => new Date(), log = console }) {
  return async function handler(event) {
    try {
      const body = parseBody(event);
      if (!body) return reply(400, { error: "invalid_input" });

      if (typeof body.company === "string" && body.company.trim() !== "") {
        log.info({ msg: "honeypot_filled" });
        return reply(200, { status: "joined", spot: null });
      }

      const input = validate(body);
      if (input.error) return reply(400, { error: "invalid_input", field: input.field });
      const { name, email, phone, ref, source } = input.value;

      const token = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
      const human = token !== "" && token.length <= 2048 && (await verifyTurnstile(token, event.requestContext?.http?.sourceIp));
      if (!human) {
        log.info({ msg: "captcha_failed", email: maskEmail(email) });
        return reply(403, { error: "captcha_failed" });
      }

      const referralCode = newReferralCode();
      const existing = await store.insertSignup({
        email,
        name,
        ...(phone && { phone }),
        ...(ref && { referredBy: ref }),
        ...(source && { source }),
        referralCode,
        createdAt: now().toISOString(),
      });
      if (existing) {
        log.info({ msg: "already_joined", email: maskEmail(email) });
        return reply(200, { status: "already_joined", spot: existing.spot ?? null });
      }

      const spot = await store.nextSpot();
      await store.updateSignup(email, { spot });

      const referralUrl =
        `${config.siteUrl}/?ref=${referralCode}` +
        "&utm_source=waitlist_email&utm_medium=email&utm_campaign=waitlist_welcome";

      const [mail, sheet] = await Promise.allSettled([
        mailer.sendWelcome({ email, firstName: firstNameOf(name), spot: spot.toLocaleString("en-IN"), referralUrl }),
        postToSheet({ name, email, phone: phone ?? "" }),
      ]);

      const outcome = {
        emailStatus: mail.status === "fulfilled" ? "sent" : "failed",
        sheetStatus: sheet.status === "fulfilled" ? "sent" : "failed",
        ...(mail.status === "fulfilled" && mail.value && { sesMessageId: mail.value }),
      };
      if (mail.status === "rejected") log.error({ msg: "email_failed", email: maskEmail(email), spot, error: describe(mail.reason) });
      if (sheet.status === "rejected") log.error({ msg: "sheet_failed", email: maskEmail(email), spot, error: describe(sheet.reason) });

      try {
        await store.updateSignup(email, outcome);
      } catch (err) {
        log.error({ msg: "outcome_write_failed", email: maskEmail(email), spot, outcome, error: describe(err) });
      }

      log.info({ msg: "joined", email: maskEmail(email), spot, ...outcome, referred: Boolean(ref) });
      return reply(200, { status: "joined", spot });
    } catch (err) {
      log.error({ msg: "server_error", error: describe(err) });
      return reply(500, { error: "server_error" });
    }
  };
}

function parseBody(event) {
  const raw = event?.isBase64Encoded ? Buffer.from(event.body ?? "", "base64").toString("utf8") : event?.body ?? "";
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) return null;
  try {
    const body = JSON.parse(raw);
    return body && typeof body === "object" && !Array.isArray(body) ? body : null;
  } catch {
    return null;
  }
}

export function validate(body) {
  const name = typeof body.name === "string" ? body.name.replace(/[<>]/g, "").replace(/\s+/g, " ").trim() : "";
  if (name.length < 1 || name.length > 80) return { error: true, field: "name" };

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return { error: true, field: "email" };

  let phone;
  if (typeof body.phone === "string" && body.phone.trim() !== "") {
    phone = body.phone.trim();
    if (!PHONE_PATTERN.test(phone)) return { error: true, field: "phone" };
  }

  const ref = typeof body.ref === "string" && REFERRAL_PATTERN.test(body.ref) ? body.ref : undefined;
  const source = typeof body.source === "string" && body.source.startsWith("/") ? body.source.slice(0, 100) : undefined;

  return { value: { name, email, phone, ref, source } };
}

export function newReferralCode() {
  // 256 is a multiple of 32, so `byte % 32` is unbiased.
  return Array.from(randomBytes(8), (b) => REFERRAL_ALPHABET[b % 32]).join("");
}

function firstNameOf(name) {
  return name.split(" ")[0].slice(0, 40);
}

/** "siddharth@example.com" -> "si***@example.com", so logs never hold full addresses. */
export function maskEmail(email) {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 2)}***@${domain}`;
}

function describe(err) {
  return err instanceof Error ? `${err.name}: ${err.message}` : String(err);
}

function reply(statusCode, payload) {
  return { statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(payload) };
}
