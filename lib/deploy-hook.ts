/**
 * Fires a Render Deploy Hook so the storefront rebuilds and pulls the latest
 * CMS data. Set RENDER_DEPLOY_HOOK_URL in environment to wire it up.
 *
 * If the env var isn't set, this is a silent no-op — local dev keeps working
 * without any cloud config.
 */

let lastFiredAt = 0;
const DEBOUNCE_MS = 15_000;

export function triggerStorefrontRebuild(): void {
  const url = process.env.RENDER_DEPLOY_HOOK_URL;
  if (!url) return;

  // Coalesce rapid saves so we don't queue 10 builds when the user clicks
  // Save five times in a minute. Render's build itself fetches the freshest
  // data, so the missed firings don't lose any content.
  const now = Date.now();
  if (now - lastFiredAt < DEBOUNCE_MS) return;
  lastFiredAt = now;

  // Fire-and-forget — never block the API response.
  fetch(url, { method: "POST" }).catch((e) => {
    console.warn("[deploy-hook] failed:", e instanceof Error ? e.message : String(e));
  });
}
