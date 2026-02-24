/**
 * Utility to resolve the canonical site URL.
 * Prioritizes NEXT_PUBLIC_SITE_URL environment variable, 
 * then window.location.origin (if in browser), 
 * and finally falls back to localhost:3000.
 */
export function getSiteUrl(): string {
    if (process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    }

    if (typeof window !== "undefined") {
        return window.location.origin;
    }

    return "http://localhost:3000";
}

/**
 * Generates a callback URL for Supabase auth redirects.
 */
export function getAuthCallbackUrl(nextPath: string = "/dashboard"): string {
    const baseUrl = getSiteUrl();
    return `${baseUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`;
}
