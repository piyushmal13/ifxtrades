const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const modules = [
  "blog",
  "webinars",
  "algos",
  "university",
  "reviews",
  "webinar-agenda",
  "webinar-faqs",
  "webinar-sponsors",
  "course-lessons",
  "algo-snapshots",
];

test("admin modules expose GET/POST route handlers", () => {
  for (const mod of modules) {
    const routePath = path.join(process.cwd(), "app", "api", "admin", mod, "route.ts");
    assert.equal(fs.existsSync(routePath), true, `missing ${routePath}`);
    const source = fs.readFileSync(routePath, "utf8");
    assert.match(source, /export async function GET/);
    assert.match(source, /export async function POST/);
  }
});

test("admin modules expose id-based PATCH/DELETE route handlers", () => {
  for (const mod of modules) {
    const routePath = path.join(
      process.cwd(),
      "app",
      "api",
      "admin",
      mod,
      "[id]",
      "route.ts",
    );
    assert.equal(fs.existsSync(routePath), true, `missing ${routePath}`);
    const source = fs.readFileSync(routePath, "utf8");
    assert.match(source, /export async function PATCH/);
    assert.match(source, /export async function DELETE/);
  }
});

test("admin modules log mutations via shared helper or direct audit call", () => {
  for (const mod of modules) {
    const basePath = path.join(process.cwd(), "app", "api", "admin", mod);
    const collectionSource = fs.readFileSync(path.join(basePath, "route.ts"), "utf8");
    const detailSource = fs.readFileSync(path.join(basePath, "[id]", "route.ts"), "utf8");
    assert.match(collectionSource, /logMutation|logAdminAction/);
    assert.match(detailSource, /logMutation|logAdminAction/);
  }
});
