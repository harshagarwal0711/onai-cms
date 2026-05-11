import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { publicOrigin } from "@/lib/public-origin";

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const from = String(form.get("from") ?? "");

  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  // IMPORTANT: build redirects from the public origin (Host / X-Forwarded-*),
  // not from req.url — req.url on Render shows the internal localhost:3001
  // and the browser then chokes with ERR_SSL_PROTOCOL_ERROR.
  const base = publicOrigin(req);
  if (error) {
    const url = new URL("/login", base);
    url.searchParams.set("error", "invalid");
    if (from) url.searchParams.set("from", from);
    return NextResponse.redirect(url, { status: 303 });
  }

  const dest = from && from.startsWith("/") ? from : "/products";
  return NextResponse.redirect(new URL(dest, base), { status: 303 });
}
