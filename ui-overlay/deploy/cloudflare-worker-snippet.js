// IFX UI Overlay v1 conditional injection for Cloudflare Workers
// Tailored environments:
// - Production: www.ifxtrades.com, ifxtrades.com
// - Staging/Preview: ifxtrades-shp4.vercel.app, *-ifxtrades-shp4.vercel.app
//
// Behavior:
// - Staging/Preview: always enabled
// - Production: enabled via cookie/query override or deterministic percentage rollout
//
// Optional env var:
// - IFX_UI_OVERLAY_ROLLOUT_PERCENT (default 5)

function isStagingHost(hostname) {
  return (
    hostname === "ifxtrades-shp4.vercel.app" ||
    /.+-ifxtrades-shp4\.vercel\.app$/i.test(hostname)
  );
}

function isProdHost(hostname) {
  return hostname === "www.ifxtrades.com" || hostname === "ifxtrades.com";
}

function normalizedPercent(value, fallback = 5) {
  const num = Number.parseInt(String(value ?? fallback), 10);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(100, num));
}

function bucketFromString(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 100;
}

function inRollout(stableId, percent) {
  if (percent >= 100) return true;
  if (percent <= 0) return false;
  return bucketFromString(stableId) < percent;
}

function assetBaseForHost(hostname) {
  if (isProdHost(hostname)) {
    return "https://www.ifxtrades.com/ui-overlay/v1";
  }
  return "https://ifxtrades-shp4.vercel.app/ui-overlay/v1";
}

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return response;

    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    const cookies = request.headers.get("cookie") || "";
    const queryForce = /^(1|true|on)$/i.test(url.searchParams.get("feature_ui_overlay_v1") || "");
    const cookieForce = /(?:^|;\s*)ifx_ui_overlay_v1=1(?:;|$)/i.test(cookies);

    let enabled = false;
    if (isStagingHost(host)) {
      enabled = true;
    } else if (isProdHost(host)) {
      const rolloutPercent = normalizedPercent(env.IFX_UI_OVERLAY_ROLLOUT_PERCENT, 5);
      const stableId =
        request.headers.get("cf-connecting-ip") ||
        request.headers.get("x-forwarded-for") ||
        request.headers.get("user-agent") ||
        "ifx-anon";
      enabled = queryForce || cookieForce || inRollout(stableId, rolloutPercent);
    }

    if (!enabled) return response;

    const assetBase = assetBaseForHost(host);

    return new HTMLRewriter()
      .on("head", {
        element(head) {
          head.append(
            `<script>window.__IFX_FEATURE_FLAGS__=window.__IFX_FEATURE_FLAGS__||{};window.__IFX_FEATURE_FLAGS__["feature/ui_overlay_v1"]=true;window.__IFX_UI_OVERLAY_SETTINGS__={theme:"dark",motion:"auto"};</script>`,
            { html: true }
          );
          head.append(`<link rel="stylesheet" href="${assetBase}/tokens.css">`, { html: true });
          head.append(`<link rel="stylesheet" href="${assetBase}/overlay.css">`, { html: true });
          head.append(`<script defer src="${assetBase}/overlay.js"></script>`, { html: true });
        }
      })
      .transform(response);
  }
};
