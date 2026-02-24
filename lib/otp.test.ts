/**
 * OTP Unit Tests
 * Run: npx jest lib/otp.test.ts
 */

import { generateOtpCode, hashOtpCode, verifyOtpCode, getResendCooldown, RESEND_COOLDOWNS } from "./otp";

// ── Generation ────────────────────────────────────────────────

describe("generateOtpCode", () => {
    it("returns a 6-character string", () => {
        const code = generateOtpCode();
        expect(code).toHaveLength(6);
    });

    it("returns only digits", () => {
        for (let i = 0; i < 20; i++) {
            const code = generateOtpCode();
            expect(/^\d{6}$/.test(code)).toBe(true);
        }
    });

    it("pads with leading zeros when needed", () => {
        // Statistical: most codes will NOT start with 0, but the function must zero-pad
        // We can verify format always meets length=6
        const codes = Array.from({ length: 100 }, () => generateOtpCode());
        codes.forEach((c) => expect(c).toHaveLength(6));
    });
});

// ── Hashing ───────────────────────────────────────────────────

describe("hashOtpCode / verifyOtpCode", () => {
    it("hashes and verifies a matching code", async () => {
        const code = "123456";
        const hash = await hashOtpCode(code);
        expect(hash).not.toBe(code);
        expect(hash.startsWith("$2")).toBe(true); // bcrypt prefix
        const valid = await verifyOtpCode(code, hash);
        expect(valid).toBe(true);
    });

    it("rejects a wrong code", async () => {
        const hash = await hashOtpCode("999999");
        const valid = await verifyOtpCode("000000", hash);
        expect(valid).toBe(false);
    });

    it("produces different hashes for same code (salt)", async () => {
        const h1 = await hashOtpCode("123456");
        const h2 = await hashOtpCode("123456");
        expect(h1).not.toBe(h2);
    });
});

// ── Resend Cooldown ───────────────────────────────────────────

describe("getResendCooldown", () => {
    it("returns 30s on first send (count=0)", () => {
        expect(getResendCooldown(0)).toBe(RESEND_COOLDOWNS[0]);
    });

    it("returns 60s on second send (count=1)", () => {
        expect(getResendCooldown(1)).toBe(RESEND_COOLDOWNS[1]);
    });

    it("caps at max cooldown for large counts", () => {
        const max = RESEND_COOLDOWNS[RESEND_COOLDOWNS.length - 1];
        expect(getResendCooldown(100)).toBe(max);
        expect(getResendCooldown(999)).toBe(max);
    });
});
