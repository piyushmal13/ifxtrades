const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

function read(relPath) {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

test("public content pages include empty-state copy", () => {
  assert.match(read("app/blog/page.tsx"), /No blog posts are published yet/);
  assert.match(read("app/webinars/page.tsx"), /No webinars are available right now/);
  assert.match(read("app/algos/page.tsx"), /No algorithms are listed at the moment/);
  assert.match(read("app/university/page.tsx"), /No courses are available right now/);
  assert.match(read("app/reviews/page.tsx"), /No reviews are available yet/);
});

test("webinar experience includes countdown and rich speaker/sponsor media", () => {
  const detail = read("app/webinars/[slug]/page.tsx");
  assert.match(detail, /Countdown/);
  assert.match(detail, /speakerImageUrl/);
  assert.match(detail, /logoUrl/);
  assert.match(detail, /Watch Promo/);
});

test("premium webinar button can initiate checkout", () => {
  const registerButton = read("components/webinar/RegisterButton.tsx");
  assert.match(registerButton, /api\/checkout\/webinar/);
  assert.match(registerButton, /requiresPayment/);
});

