import Image from "next/image";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in · ONAI CMS" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const { from, error } = await searchParams;

  // If already signed in, send to home (or the originally-requested page).
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(from && from.startsWith("/") ? from : "/products");

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-5">
      <div className="card w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <Image src="/onai-logo.png" alt="ONAI" width={510} height={250} priority className="h-10 w-auto" />
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted">CMS</span>
        </div>

        {error ? (
          <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-100">
            {error === "invalid"
              ? "Email or password didn't match."
              : "Couldn't sign you in. Try again."}
          </p>
        ) : null}

        <LoginForm from={from} />
      </div>
    </div>
  );
}
