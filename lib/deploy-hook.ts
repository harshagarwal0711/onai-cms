/**
 * Fires a Render Deploy Hook so the storefront rebuilds and pulls the latest
 * CMS data. Set RENDER_DEPLOY_HOOK_URL in environment to wire it up.
 *
 * If the env var isn't set, this is a silent no-op for the auto-trigger path,
 * but the explicit /api/publish route surfaces that state to the admin.
 */

let lastFiredAt = 0;
const DEBOUNCE_MS = 15_000;

export type DeployHookResult =
  | { ok: true; debounced?: boolean }
  | { ok: false; reason: "no-url" | "wrong-service" | "network" | "http"; status?: number; message?: string };

/**
 * Fire-and-forget. Used by mutation API routes that don't want to block their
 * response on the rebuild trigger.
 */
export function triggerStorefrontRebuild(): void {
  triggerStorefrontRebuildAndReport().catch(() => {});
}

/**
 * Awaits the hook and reports the outcome. Used by /api/publish so the admin
 * gets visible feedback in the UI.
 */
export async function triggerStorefrontRebuildAndReport(): Promise<DeployHookResult> {
  const url = process.env.RENDER_DEPLOY_HOOK_URL;
  if (!url) return { ok: false, reason: "no-url" };

  // Sanity check: Render injects RENDER_SERVICE_ID with this service's own srv-ID.
  // If that ID appears inside the deploy hook URL, the user copied the CMS's
  // own deploy hook by mistake — firing it would just rebuild the CMS (which
  // doesn't help the storefront at all).
  const myServiceId = process.env.RENDER_SERVICE_ID;
  if (myServiceId && url.includes(myServiceId)) {
    return { ok: false, reason: "wrong-service" };
  }

  const now = Date.now();
  if (now - lastFiredAt < DEBOUNCE_MS) return { ok: true, debounced: true };
  lastFiredAt = now;

  try {
    const res = await fetch(url, { method: "POST" });
    if (!res.ok) {
      return { ok: false, reason: "http", status: res.status };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: "network", message: e instanceof Error ? e.message : String(e) };
  }
}
