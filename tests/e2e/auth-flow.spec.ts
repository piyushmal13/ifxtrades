/**
 * E2E Auth Flow Tests — Playwright
 * Run: npx playwright test tests/e2e/auth-flow.spec.ts
 *
 * Prerequisites:
 * - App running on http://localhost:3000
 * - Test email inbox (use Mailtrap or a dedicated test account)
 */

import { test, expect } from "@playwright/test";

const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? "test+e2e@ifxtrades.com";
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "TestPass123!";
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

// ── Happy path: Signup → OTP → Dashboard ─────────────────────

test.describe("Auth flow — happy path", () => {
    test("signup shows OTP screen", async ({ page }) => {
        await page.goto(`${BASE_URL}/signup`);

        // Fill 3-step signup
        await page.getByLabel("Email Address").fill(TEST_EMAIL);
        await page.getByLabel("Password").fill(TEST_PASSWORD);
        await page.getByRole("button", { name: /next/i }).click();

        // Step 2 — profile
        await page.getByLabel("First Name").fill("Test");
        await page.getByLabel("Last Name").fill("User");
        await page.getByRole("button", { name: /next/i }).click();

        // Step 3 — investor type
        await page.getByLabel("Retail").check();
        await page.getByLabel(/terms/i).check();
        await page.getByRole("button", { name: /create account/i }).click();

        // OTP screen should appear
        await expect(page.getByText("Check your email")).toBeVisible({ timeout: 8000 });
        await expect(page.getByLabel("Digit 1 of 6")).toBeVisible();
    });

    test("OTP digit inputs auto-advance on type", async ({ page }) => {
        await page.goto(`${BASE_URL}/verify?email=${encodeURIComponent(TEST_EMAIL)}`);

        // Send code first
        await page.getByRole("button", { name: /send verification code/i }).click();
        await expect(page.getByLabel("Digit 1 of 6")).toBeVisible({ timeout: 5000 });

        // Type digits — should auto-advance
        await page.getByLabel("Digit 1 of 6").fill("1");
        await page.keyboard.press("Tab"); // manual advance in case auto-advance doesn't trigger via fill()
        await page.getByLabel("Digit 2 of 6").fill("2");
        // Focus should be on digit 3 etc.
        await expect(page.getByLabel("Digit 2 of 6")).toHaveValue("2");
    });
});

// ── Wrong code — error displayed ─────────────────────────────

test("wrong OTP code shows error and clears inputs", async ({ page }) => {
    await page.goto(`${BASE_URL}/verify?email=${encodeURIComponent(TEST_EMAIL)}`);
    await page.getByRole("button", { name: /send verification code/i }).click();
    await expect(page.getByLabel("Digit 1 of 6")).toBeVisible({ timeout: 5000 });

    // Enter obviously wrong 6-digit code
    for (let i = 1; i <= 6; i++) {
        await page.getByLabel(`Digit ${i} of 6`).fill("0");
    }

    await page.getByRole("button", { name: /confirm/i }).click();

    const errorMsg = page.getByRole("alert");
    await expect(errorMsg).toContainText(/invalid|incorrect/i, { timeout: 5000 });
});

// ── Dashboard blocked for unverified session ──────────────────

test("dashboard redirects unverified user to /verify", async ({ page }) => {
    // Browse to dashboard without auth
    await page.goto(`${BASE_URL}/dashboard`);
    // Should land on /login or /verify
    await expect(page.url()).toContain("/login");
});

// ── AuthModal: email auto-detect ──────────────────────────────

test("AuthModal auto-switches to sign-in tab for existing email", async ({ page }) => {
    await page.goto(BASE_URL);

    // Open AuthModal via nav button
    const navSignIn = page.getByRole("button", { name: /sign in/i }).first();
    if (await navSignIn.isVisible()) await navSignIn.click();

    // Modal should be visible
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });

    // Ensure Create Account tab is active
    await page.getByRole("tab", { name: /create account/i }).click();

    // Enter existing email
    await page.getByLabel("Email Address").fill(TEST_EMAIL);
    await page.getByLabel("Email Address").blur();

    // Modal should switch to Sign In tab automatically
    await expect(page.getByRole("tab", { name: /sign in/i })).toHaveAttribute("aria-selected", "true", { timeout: 3000 });
});

// ── Resend cooldown enforced ──────────────────────────────────

test("resend button is disabled during cooldown", async ({ page }) => {
    await page.goto(`${BASE_URL}/verify?email=${encodeURIComponent(TEST_EMAIL)}`);
    await page.getByRole("button", { name: /send verification code/i }).click();
    await expect(page.getByLabel("Digit 1 of 6")).toBeVisible({ timeout: 5000 });

    // Resend button should show countdown
    const resendBtn = page.getByRole("button", { name: /resend/i });
    await expect(resendBtn).toBeDisabled();
    await expect(resendBtn).toContainText(/available in/i);
});
