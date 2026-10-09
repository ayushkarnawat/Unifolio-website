// Run: node --test services/waitlist-api/
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHandler, validate, newReferralCode, maskEmail } from "./handler.mjs";

function setup(overrides = {}) {
  const calls = { inserted: [], updates: [], sent: [], sheet: [] };
  const existing = overrides.existing ?? null;
  const deps = {
    store: {
      async insertSignup(item) {
        calls.inserted.push(item);
        return existing;
      },
      async nextSpot() {
        return 1284;
      },
      async updateSignup(email, fields) {
        calls.updates.push({ email, fields });
      },
    },
    mailer: {
      async sendWelcome(args) {
        calls.sent.push(args);
        if (overrides.mailFails) throw new Error("SES down");
        return "msg-123";
      },
    },
    async verifyTurnstile() {
      return overrides.human ?? true;
    },
    async postToSheet(row) {
      calls.sheet.push(row);
      if (overrides.sheetFails) throw new Error("timeout");
    },
    config: { siteUrl: "https://unifolio.in" },
    now: () => new Date("2026-10-08T10:42:00Z"),
    log: { info() {}, warn() {}, error() {} },
  };
  return { handler: createHandler(deps), calls };
}

const validBody = {
  name: "  Siddharth   Sharma ",
  email: " Sid@Example.com ",
  phone: "+91 98765 43210",
  turnstileToken: "tok",
  company: "",
  ref: "K7M2Q9XA",
  source: "/",
};
const post = (body) => ({
  body: typeof body === "string" ? body : JSON.stringify(body),
  requestContext: { http: { sourceIp: "1.2.3.4" } },
});
const parse = (res) => ({ status: res.statusCode, body: JSON.parse(res.body) });

test("new signup saves, emails, posts to the sheet and returns the spot", async () => {
  const { handler, calls } = setup();
  const res = parse(await handler(post(validBody)));

  assert.deepEqual(res, { status: 200, body: { status: "joined", spot: 1284 } });
  assert.equal(calls.inserted[0].email, "sid@example.com");
  assert.equal(calls.inserted[0].name, "Siddharth Sharma");
  assert.equal(calls.inserted[0].referredBy, "K7M2Q9XA");
  assert.match(calls.inserted[0].referralCode, /^[A-HJ-NP-Z2-9]{8}$/);
  assert.deepEqual(calls.sent[0].firstName, "Siddharth");
  assert.equal(calls.sent[0].spot, "1,284");
  assert.ok(calls.sent[0].referralUrl.startsWith(`https://unifolio.in/?ref=${calls.inserted[0].referralCode}&utm_source=`));
  assert.deepEqual(calls.sheet[0], { name: "Siddharth Sharma", email: "sid@example.com", phone: "+91 98765 43210" });
  assert.deepEqual(calls.updates.at(-1).fields, { emailStatus: "sent", sheetStatus: "sent", sesMessageId: "msg-123" });
});

test("duplicate email returns the old spot and sends nothing", async () => {
  const { handler, calls } = setup({ existing: { spot: 1031 } });
  const res = parse(await handler(post(validBody)));

  assert.deepEqual(res.body, { status: "already_joined", spot: 1031 });
  assert.equal(calls.sent.length, 0);
  assert.equal(calls.sheet.length, 0);
});

test("honeypot pretends to succeed and stores nothing", async () => {
  const { handler, calls } = setup();
  const res = parse(await handler(post({ ...validBody, company: "Acme" })));

  assert.deepEqual(res, { status: 200, body: { status: "joined", spot: null } });
  assert.equal(calls.inserted.length, 0);
});

test("failed captcha is refused", async () => {
  const { handler, calls } = setup({ human: false });
  const res = parse(await handler(post(validBody)));

  assert.deepEqual(res, { status: 403, body: { error: "captcha_failed" } });
  assert.equal(calls.inserted.length, 0);
});

test("missing captcha token is refused without calling Turnstile", async () => {
  const { handler } = setup();
  const res = parse(await handler(post({ ...validBody, turnstileToken: undefined })));
  assert.equal(res.status, 403);
});

test("invalid email reports the field", async () => {
  const { handler } = setup();
  const res = parse(await handler(post({ ...validBody, email: "not-an-email" })));
  assert.deepEqual(res, { status: 400, body: { error: "invalid_input", field: "email" } });
});

test("garbage and oversized bodies are rejected", async () => {
  const { handler } = setup();
  assert.equal((await handler(post("{nope"))).statusCode, 400);
  assert.equal((await handler(post("[]"))).statusCode, 400);
  assert.equal((await handler(post({ ...validBody, name: "x".repeat(5000) }))).statusCode, 400);
});

test("SES failure still returns joined and records the failure", async () => {
  const { handler, calls } = setup({ mailFails: true });
  const res = parse(await handler(post(validBody)));

  assert.equal(res.body.status, "joined");
  assert.deepEqual(calls.updates.at(-1).fields, { emailStatus: "failed", sheetStatus: "sent" });
});

test("sheet failure still returns joined and records the failure", async () => {
  const { handler, calls } = setup({ sheetFails: true });
  const res = parse(await handler(post(validBody)));

  assert.equal(res.body.status, "joined");
  assert.equal(calls.updates.at(-1).fields.sheetStatus, "failed");
  assert.equal(calls.updates.at(-1).fields.emailStatus, "sent");
});

test("validate strips markup, drops bad refs and optional phone", () => {
  const { value } = validate({ name: "<b>Ayu</b>", email: "a@b.co", phone: "", ref: "bad", source: "https://evil" });
  assert.deepEqual(value, { name: "bAyu/b", email: "a@b.co", phone: undefined, ref: undefined, source: undefined });
  assert.equal(validate({ name: "A", email: "a@b.co", phone: "call me" }).field, "phone");
});

test("referral codes and masking", () => {
  for (let i = 0; i < 200; i++) assert.match(newReferralCode(), /^[A-HJ-NP-Z2-9]{8}$/);
  assert.equal(maskEmail("siddharth@example.com"), "si***@example.com");
});
