"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/products",  label: "Products",      icon: ProductIcon },
  { href: "/featured",  label: "Featured Bags", icon: StarIcon, hint: "Home orbit" },
  { href: "/reels",     label: "Reels",         icon: PlayIcon },
  { href: "/love",      label: "Customer Love", icon: HeartIcon },
  { href: "/artisans",  label: "Artisans",      icon: UserIcon },
  { href: "/inventory", label: "Inventory",     icon: BoxIcon },
  { href: "/settings",  label: "Settings",      icon: GearIcon },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/login") return <>{children}</>;
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-black/5 bg-white p-5 md:block">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image
            src="/onai-logo.png"
            alt="ONAI"
            width={510}
            height={250}
            priority
            className="h-9 w-auto"
          />
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted">CMS</span>
        </Link>

        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon, hint }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-brand text-white"
                    : "text-ink/80 hover:bg-black/[0.04]",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{label}</span>
                {hint && (
                  <span className={cn("text-[10px] font-semibold uppercase tracking-widest", active ? "text-white/70" : "text-muted")}>
                    {hint}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-10 space-y-3">
          <PublishButton />
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-muted ring-1 ring-black/10 hover:text-ink hover:ring-black/20"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-5 py-8 md:px-10">{children}</main>
    </div>
  );
}

/* ---------- Publish button ---------- */

const STOREFRONT_URL = "https://onaicollective.in";
const POLL_EVERY_MS = 10_000;
const POLL_MAX_MS = 8 * 60 * 1000; // give up after 8 min

type PublishState =
  | { kind: "idle" }
  | { kind: "triggering" }
  | { kind: "building"; baselineUnixMs: number; startedAt: number; nowMs: number }
  | { kind: "live"; secondsTaken: number }
  | { kind: "debounced" }
  | { kind: "timeout" }
  | { kind: "err"; msg: string };

async function fetchStorefrontVersion(): Promise<number | null> {
  try {
    const res = await fetch(`${STOREFRONT_URL}/api/version?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const j = await res.json();
    return typeof j.unixMs === "number" ? j.unixMs : null;
  } catch {
    return null;
  }
}

function PublishButton() {
  const [state, setState] = useState<PublishState>({ kind: "idle" });
  // Storefront's build time (auto-refreshed every 30s) — lets us always show
  // "Storefront last built: X min ago" without the user clicking anything.
  const [liveBuildMs, setLiveBuildMs] = useState<number | null>(null);
  const [, setTick] = useState(0); // forces re-render so the "X min ago" stays fresh
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopTimers() {
    if (pollRef.current) clearInterval(pollRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
    pollRef.current = null;
    tickRef.current = null;
  }

  // Initial fetch + auto-refresh every 30s of storefront's build time.
  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const v = await fetchStorefrontVersion();
      if (!cancelled && typeof v === "number") setLiveBuildMs(v);
    };
    refresh();
    const id = setInterval(refresh, 30_000);
    // Also tick every 30s to keep the "X min ago" label fresh as time passes.
    const id2 = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
      clearInterval(id2);
      stopTimers();
    };
  }, []);

  async function publish() {
    stopTimers();
    setState({ kind: "triggering" });

    // Snapshot the storefront's current version BEFORE firing the rebuild.
    // The poll later watches for this value to change.
    const baseline = (await fetchStorefrontVersion()) ?? 0;

    let json: { ok: boolean; debounced?: boolean; reason?: string; status?: number };
    try {
      const res = await fetch("/api/publish", { method: "POST" });
      json = await res.json();
    } catch (e) {
      setState({ kind: "err", msg: e instanceof Error ? e.message : "Request failed" });
      return;
    }

    if (!json.ok) {
      const msg =
        json.reason === "no-url"
          ? "Deploy hook not configured. Add RENDER_DEPLOY_HOOK_URL on Render."
          : `Hook failed (${json.reason}${json.status ? ` ${json.status}` : ""}).`;
      setState({ kind: "err", msg });
      return;
    }

    if (json.debounced) {
      setState({ kind: "debounced" });
      setTimeout(() => setState({ kind: "idle" }), 6000);
      return;
    }

    // Successfully triggered. Now poll the storefront until its unixMs changes.
    const startedAt = Date.now();
    setState({ kind: "building", baselineUnixMs: baseline, startedAt, nowMs: startedAt });

    tickRef.current = setInterval(() => {
      setState((s) => (s.kind === "building" ? { ...s, nowMs: Date.now() } : s));
    }, 1000);

    pollRef.current = setInterval(async () => {
      const elapsed = Date.now() - startedAt;
      if (elapsed > POLL_MAX_MS) {
        stopTimers();
        setState({ kind: "timeout" });
        return;
      }
      const live = await fetchStorefrontVersion();
      if (live !== null && live !== baseline) {
        stopTimers();
        setState({ kind: "live", secondsTaken: Math.round(elapsed / 1000) });
        setTimeout(() => setState({ kind: "idle" }), 10_000);
      }
    }, POLL_EVERY_MS);
  }

  const isBusy = state.kind === "triggering" || state.kind === "building";

  return (
    <div className="rounded-xl bg-page p-3 ring-1 ring-black/5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Linked storefront</p>
      <p className="mt-1 text-[11px] text-muted">
        <a href={STOREFRONT_URL} target="_blank" rel="noreferrer" className="font-semibold text-brand hover:underline">
          onaicollective.in
        </a>
      </p>

      {/* Always-visible build status — auto-refreshes every 30s. */}
      <p className={cn(
        "mt-2 text-[10px] font-semibold",
        ageStaleness(liveBuildMs) === "stale"  ? "text-red-600" :
        ageStaleness(liveBuildMs) === "warn"   ? "text-amber-700" :
                                                 "text-emerald-700",
      )}>
        ● Storefront last built {liveBuildMs ? formatAge(liveBuildMs) : "—"}
      </p>

      <button
        type="button"
        onClick={publish}
        disabled={isBusy}
        className={cn(
          "mt-3 w-full rounded-lg px-3 py-2 text-xs font-bold transition",
          isBusy
            ? "bg-black/10 text-ink/50 cursor-wait"
            : "bg-brand text-white hover:bg-brand-soft",
        )}
      >
        {state.kind === "triggering" && "Triggering rebuild…"}
        {state.kind === "building" && `Building… ${formatElapsed(state.nowMs - state.startedAt)}`}
        {!isBusy && "Publish to storefront"}
      </button>

      {state.kind === "building" && (
        <p className="mt-2 text-[10px] font-semibold text-amber-700">
          Render is rebuilding. Usually ~3 min on free tier.
          <br />
          <span className="font-normal text-muted">I&apos;ll tell you the second the new build goes live.</span>
        </p>
      )}
      {state.kind === "live" && (
        <p className="mt-2 text-[10px] font-bold text-emerald-700">
          ✓ LIVE NOW — new build came online after {state.secondsTaken}s.
          <br />
          <a
            href={`${STOREFRONT_URL}?t=${Date.now()}`}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-brand underline-offset-2 hover:underline"
          >
            Open storefront →
          </a>
        </p>
      )}
      {state.kind === "debounced" && (
        <p className="mt-2 text-[10px] font-semibold text-amber-700">
          Already publishing — wait 15 s between clicks.
        </p>
      )}
      {state.kind === "timeout" && (
        <p className="mt-2 text-[10px] font-semibold text-amber-700">
          Build is taking longer than 8 min. Check Render dashboard for errors.
        </p>
      )}
      {state.kind === "err" && (
        <p className="mt-2 text-[10px] font-semibold text-red-700">{state.msg}</p>
      )}
    </div>
  );
}

function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatAge(buildUnixMs: number): string {
  const ageMs = Date.now() - buildUnixMs;
  const sec = Math.floor(ageMs / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const days = Math.floor(hr / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function ageStaleness(buildUnixMs: number | null): "fresh" | "warn" | "stale" {
  if (!buildUnixMs) return "warn";
  const ageMin = (Date.now() - buildUnixMs) / 60_000;
  if (ageMin < 10) return "fresh";
  if (ageMin < 60) return "warn";
  return "stale";
}

/* ---------- inline icons ---------- */

function ProductIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 7h12l-1 13H7L6 7Z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2 15 9l7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" />
    </svg>
  );
}
function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="m10 9 6 3-6 3V9Z" fill="currentColor" />
    </svg>
  );
}
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}
function BoxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m3 7 9-4 9 4-9 4-9-4Z" />
      <path d="M3 7v10l9 4 9-4V7" />
      <path d="M12 11v10" />
    </svg>
  );
}
function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 21s-7-4.35-9.5-8.5C.5 9 2 5 6 5c2 0 3.5 1 4 2 .5-1 2-2 4-2 4 0 5.5 4 3.5 7.5C19 16.65 12 21 12 21Z" />
    </svg>
  );
}
function GearIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}
