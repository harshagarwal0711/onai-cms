import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { publicOrigin } from "@/lib/public-origin";

export async function POST(req: Request) {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", publicOrigin(req)), { status: 303 });
}
