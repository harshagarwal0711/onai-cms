import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const from = String(form.get("from") ?? "");

  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  const base = new URL(req.url);
  if (error) {
    const url = new URL("/login", base);
    url.searchParams.set("error", "invalid");
    if (from) url.searchParams.set("from", from);
    return NextResponse.redirect(url, { status: 303 });
  }

  const dest = from && from.startsWith("/") ? from : "/products";
  return NextResponse.redirect(new URL(dest, base), { status: 303 });
}
