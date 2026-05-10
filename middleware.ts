import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * - GET on storefront-data routes: public (so the storefront can fetch).
 * - /login, /api/auth/*: public.
 * - Everything else: requires a Supabase session. Pages redirect to /login;
 *   API routes return 401.
 */

const PUBLIC_GET_API = [
  /^\/api\/products(\/.*)?$/,
  /^\/api\/artisans(\/.*)?$/,
  /^\/api\/reels(\/.*)?$/,
  /^\/api\/love(\/.*)?$/,
  /^\/api\/featured\/?$/,
  /^\/api\/settings\/?$/,
];

function isPublicGet(req: NextRequest) {
  if (req.method !== "GET") return false;
  return PUBLIC_GET_API.some((re) => re.test(req.nextUrl.pathname));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (isPublicGet(req)) {
    // Add permissive CORS so the deployed storefront on a different origin
    // can fetch these directly.
    const res = NextResponse.next();
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    return res;
  }

  const { response, user } = await updateSession(req);

  if (!user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  // Run on everything except Next internals and static files.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|onai-logo.png|uploads/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|ico|txt)$).*)",
  ],
};
