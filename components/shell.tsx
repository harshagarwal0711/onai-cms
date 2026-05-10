"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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

        <form action="/api/auth/logout" method="post" className="mt-10">
          <button
            type="submit"
            className="w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-muted ring-1 ring-black/10 hover:text-ink hover:ring-black/20"
          >
            Sign out
          </button>
        </form>
      </aside>

      <main className="min-w-0 flex-1 px-5 py-8 md:px-10">{children}</main>
    </div>
  );
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
