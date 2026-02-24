type SiteUrlOptions = {
  request?: Request;
};

function normalizeBaseUrl(input: string) {
  const trimmed = input.trim().replace(/\/+$/, "");
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Resolve canonical base URL for callbacks and links.
 * Priority:
 * 1) Explicit env (`NEXT_PUBLIC_SITE_URL` / `SITE_URL`)
 * 2) Vercel env hostnames
 * 3) Browser origin (client)
 * 4) Current request origin (server routes)
 * 5) Local fallback for development only
 */
export function getSiteUrl(options: SiteUrlOptions = {}): string {
  const envCandidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidate of envCandidates) {
    if (!candidate) continue;
    const normalized = normalizeBaseUrl(candidate);
    if (normalized) return normalized;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }

  if (options.request) {
    try {
      return new URL(options.request.url).origin.replace(/\/+$/, "");
    } catch {
      // Continue to fallback.
    }
  }

  return "http://127.0.0.1:3000";
}

/**
 * Generate the auth callback URL used by Supabase redirects.
 */
export function getAuthCallbackUrl(
  nextPath = "/dashboard",
  options: SiteUrlOptions = {},
): string {
  const safeNext = nextPath.startsWith("/") ? nextPath : "/dashboard";
  const baseUrl = getSiteUrl(options);
  return `${baseUrl}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}
