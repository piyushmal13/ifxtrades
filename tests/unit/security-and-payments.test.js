const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("stripe helper exposes signature verification and checkout creation", () => {
  const file = path.join(process.cwd(), "lib", "payments", "stripe.ts");
  const source = fs.readFileSync(file, "utf8");

  assert.match(source, /export async function createCheckoutSession/);
  assert.match(source, /export function verifyStripeWebhookSignature/);
  assert.match(source, /createHmac\("sha256"/);
});

test("auth role resolver has no public-email admin fallback", () => {
  const authShared = fs.readFileSync(
    path.join(process.cwd(), "lib", "auth-shared.ts"),
    "utf8",
  );
  const authProvider = fs.readFileSync(
    path.join(process.cwd(), "lib", "auth-provider.tsx"),
    "utf8",
  );

  assert.doesNotMatch(authShared, /NEXT_PUBLIC_ADMIN_EMAIL/);
  assert.doesNotMatch(authProvider, /NEXT_PUBLIC_ADMIN_EMAIL/);
});

