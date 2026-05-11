/**
 * Returns the public origin (e.g. https://onai-cms.onrender.com) for the
 * current request. Use this when building redirect URLs from API routes.
 *
 * Next.js's `req.url` on a server behind a reverse proxy (Render → Cloudflare)
 * exposes the internal hostname (often `localhost:3001`), so redirects built
 * from `new URL(path, req.url)` send the browser back to localhost. Reading
 * `x-forwarded-host` + `x-forwarded-proto` (or falling back to `host`) gives
 * us the URL the customer's browser actually sees.
 */
export function publicOrigin(req: Request): URL {
  const headers = req.headers;
  const forwardedHost = headers.get("x-forwarded-host");
  const host = forwardedHost ?? headers.get("host") ?? new URL(req.url).host;
  const proto = headers.get("x-forwarded-proto") ?? new URL(req.url).protocol.replace(/:$/, "");
  return new URL(`${proto}://${host}`);
}
